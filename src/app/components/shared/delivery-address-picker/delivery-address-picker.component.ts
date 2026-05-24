import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  GoogleMap,
  MapDirectionsRenderer,
  MapDirectionsService,
  MapMarker,
} from '@angular/google-maps';

import {
  BAKERY_LOCATION,
  DELIVERY_SEARCH_PREFIX,
  DeliveryAddressSelection,
} from '../../../core/maps/bakery.constants';
import { ensurePlacesLibrary } from '../../../core/google-maps/google-maps-loader';
import { GoogleMapsReadyService } from '../../../core/google-maps/google-maps-ready.service';
import { GOOGLE_MAPS_API_KEY } from '../../../../environments/maps.config';
import { calcularValorDomicilio } from '../../../utils/pedido-whatsapp';
import { formatPrecio } from '../../../utils/format-precio';

type OriginSource = 'gps' | 'search' | 'manual';

@Component({
  selector: 'app-delivery-address-picker',
  standalone: true,
  imports: [GoogleMap, MapMarker, MapDirectionsRenderer],
  templateUrl: './delivery-address-picker.component.html',
  styleUrl: './delivery-address-picker.component.css',
})
export class DeliveryAddressPickerComponent implements OnInit, OnDestroy {
  readonly selectionChange = output<DeliveryAddressSelection | null>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly directionsService = inject(MapDirectionsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapsReadyService = inject(GoogleMapsReadyService);
  private readonly injector = inject(Injector);

  private readonly autocompleteHost =
    viewChild<ElementRef<HTMLDivElement>>('autocompleteHost');

  private mapInstance: google.maps.Map | null = null;
  private placeAutocompleteEl: google.maps.places.PlaceAutocompleteElement | null = null;
  private placeAutocompleteSelectHandler: ((event: Event) => void) | null = null;
  private placeAutocompleteBlurHandler: (() => void) | null = null;
  private placeAutocompleteFocusHandler: (() => void) | null = null;
  private autocompleteBound = false;
  private autocompleteSetupAttempts = 0;

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly mapsKeyConfigured = GOOGLE_MAPS_API_KEY.length > 0;
  readonly mapsLoadError = this.mapsReadyService.loadError;
  readonly mapsReady = signal(false);
  readonly mapBootstrapping = signal(false);
  readonly awaitingLocation = signal(false);
  readonly routeLoading = signal(false);
  readonly routeError = signal<string | null>(null);
  readonly addressLabel = signal<string | null>(null);

  readonly bakery = BAKERY_LOCATION;
  readonly mapCenter = BAKERY_LOCATION;
  readonly mapZoom = 13;
  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
  };

  readonly deliveryMarkerOptions: google.maps.MarkerOptions = {
    draggable: true,
    title: 'Punto de entrega — arrastra para corregir',
  };

  readonly directionsRendererOptions: google.maps.DirectionsRendererOptions = {
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#d97706',
      strokeWeight: 5,
      strokeOpacity: 0.85,
    },
  };

  readonly deliveryPoint = signal<google.maps.LatLngLiteral | null>(null);
  readonly directionsResult = signal<google.maps.DirectionsResult | undefined>(undefined);
  readonly routeInfo = signal<{ distance: string; duration: string } | null>(null);
  readonly valorDomicilio = signal<number | null>(null);

  ngOnInit(): void {
    if (!this.isBrowser || !this.mapsKeyConfigured) {
      return;
    }
    void this.ensureMapReady().then((ok) => {
      if (ok) {
        this.scheduleAutocompleteSetup();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyPlaceAutocomplete();
  }

  async usarGps(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    this.routeError.set(null);
    this.awaitingLocation.set(true);

    const ok = await this.ensureMapReady();
    if (!ok) {
      this.awaitingLocation.set(false);
      return;
    }

    const coords = await this.requestUserLocation();
    this.awaitingLocation.set(false);

    if (coords) {
      await this.applyDeliveryPoint(coords, 'gps', 'Ubicación del dispositivo (GPS)');
      return;
    }

    this.routeError.set(
      'No pudimos usar el GPS. Busca la dirección de entrega o coloca el pin en el mapa.',
    );
  }

  onMapInitialized(map: google.maps.Map): void {
    this.mapInstance = map;
    google.maps.event.trigger(map, 'resize');
    const point = this.deliveryPoint();
    if (point) {
      map.setCenter(point);
      map.setZoom(14);
    }
    this.scheduleAutocompleteSetup();
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    const latLng = event.latLng;
    if (!latLng) {
      return;
    }
    void this.applyDeliveryPoint(
      { lat: latLng.lat(), lng: latLng.lng() },
      'manual',
      'Ubicación ajustada en el mapa',
    );
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (this.routeLoading()) {
      return;
    }
    const latLng = event.latLng;
    if (!latLng) {
      return;
    }
    void this.applyDeliveryPoint(
      { lat: latLng.lat(), lng: latLng.lng() },
      'manual',
      'Punto colocado en el mapa',
    );
  }

  formatPrecio(precio: number): string {
    return formatPrecio(precio);
  }

  private async ensureMapReady(): Promise<boolean> {
    if (!this.isBrowser || !this.mapsKeyConfigured) {
      return false;
    }
    if (this.mapsReady()) {
      return true;
    }
    this.mapBootstrapping.set(true);
    const ok = await this.mapsReadyService.ensureReady();
    this.mapBootstrapping.set(false);
    this.mapsReady.set(ok);
    if (!ok) {
      this.routeError.set('No se pudo cargar el mapa. Revisa la configuración de Google Maps.');
    }
    return ok;
  }

  private async applyDeliveryPoint(
    origin: google.maps.LatLngLiteral,
    source: OriginSource,
    addressLabel?: string,
  ): Promise<void> {
    this.deliveryPoint.set({ ...origin });
    if (addressLabel) {
      this.addressLabel.set(addressLabel);
    } else if (source === 'gps') {
      this.addressLabel.set('Ubicación del dispositivo (GPS)');
    }

    this.routeError.set(null);
    this.routeLoading.set(true);

    if (!this.mapsReady()) {
      const ok = await this.ensureMapReady();
      if (!ok) {
        this.routeLoading.set(false);
        this.emitSelection(null);
        return;
      }
    }

    this.directionsService
      .route({
        origin,
        destination: this.bakery,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.routeLoading.set(false);
          if (response.status === google.maps.DirectionsStatus.OK && response.result) {
            this.directionsResult.set(response.result);
            const leg = response.result.routes[0]?.legs[0];
            if (leg?.distance?.text && leg?.duration?.text) {
              this.routeInfo.set({
                distance: leg.distance.text,
                duration: leg.duration.text,
              });
            }
            if (leg?.distance?.value != null) {
              const km = leg.distance.value / 1000;
              const domicilio = calcularValorDomicilio(km);
              this.valorDomicilio.set(domicilio);
              this.emitSelection({
                distanciaKm: km,
                direccion: this.addressLabel() ?? 'Dirección de entrega',
                coordinates: origin,
              });
            }
            this.fitMapToRoute(response.result);
            return;
          }
          this.routeError.set('No se pudo calcular la ruta hasta esa dirección.');
          this.emitSelection(null);
        },
        error: () => {
          this.routeLoading.set(false);
          this.routeError.set('Error al calcular la distancia de entrega.');
          this.emitSelection(null);
        },
      });
  }

  private emitSelection(selection: DeliveryAddressSelection | null): void {
    this.selectionChange.emit(selection);
  }

  private scheduleAutocompleteSetup(): void {
    if (!this.isBrowser) {
      return;
    }
    this.autocompleteSetupAttempts = 0;
    afterNextRender(
      () => {
        void this.setupPlacesAutocomplete();
      },
      { injector: this.injector },
    );
  }

  private async setupPlacesAutocomplete(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    if (this.autocompleteBound) {
      if (this.placeAutocompleteEl?.isConnected) {
        return;
      }
      this.destroyPlaceAutocomplete();
    }

    const host = this.autocompleteHost()?.nativeElement;
    if (!host) {
      if (this.autocompleteSetupAttempts < 12) {
        this.autocompleteSetupAttempts += 1;
        window.setTimeout(() => void this.setupPlacesAutocomplete(), 80);
      }
      return;
    }

    const placesOk = await ensurePlacesLibrary();
    if (!placesOk) {
      return;
    }

    const PlaceAutocompleteElement = google.maps.places.PlaceAutocompleteElement;
    if (!PlaceAutocompleteElement) {
      return;
    }

    this.destroyPlaceAutocomplete();
    host.replaceChildren();

    const autocompleteEl = new PlaceAutocompleteElement({
      includedRegionCodes: ['co'],
      requestedLanguage: 'es',
      requestedRegion: 'CO',
      value: DELIVERY_SEARCH_PREFIX,
      placeholder: 'calle, barrio, conjunto…',
      locationBias: { center: BAKERY_LOCATION, radius: 40000 },
    });

    autocompleteEl.classList.add('delivery-picker__autocomplete');
    autocompleteEl.setAttribute('aria-label', 'Buscar dirección de entrega en Santa Marta');

    this.placeAutocompleteFocusHandler = () => this.ensureSearchPrefix(autocompleteEl);
    this.placeAutocompleteBlurHandler = () => this.enforceSearchPrefix(autocompleteEl);
    autocompleteEl.addEventListener('focus', this.placeAutocompleteFocusHandler, true);
    autocompleteEl.addEventListener('blur', this.placeAutocompleteBlurHandler, true);

    this.placeAutocompleteSelectHandler = (event: Event) => {
      void this.onPlaceAutocompleteSelect(event as google.maps.places.PlacePredictionSelectEvent);
    };
    autocompleteEl.addEventListener('gmp-select', this.placeAutocompleteSelectHandler);

    host.appendChild(autocompleteEl);
    this.placeAutocompleteEl = autocompleteEl;
    this.autocompleteBound = true;
  }

  private async onPlaceAutocompleteSelect(
    event: google.maps.places.PlacePredictionSelectEvent,
  ): Promise<void> {
    const prediction = event.placePrediction;
    if (!prediction) {
      this.routeError.set('Selecciona una dirección de la lista de sugerencias.');
      return;
    }

    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName'] });
      const location = place.location;
      if (!location) {
        this.routeError.set('No se pudo obtener la ubicación de esa dirección.');
        return;
      }

      const label =
        place.formattedAddress ?? place.displayName ?? 'Dirección seleccionada en Google Maps';
      this.resetSearchPrefix();
      await this.applyDeliveryPoint(
        { lat: location.lat(), lng: location.lng() },
        'search',
        label,
      );
    } catch {
      this.routeError.set('Error al usar la dirección seleccionada.');
    }
  }

  private ensureSearchPrefix(el: google.maps.places.PlaceAutocompleteElement): void {
    const current = el.value ?? '';
    if (!current.startsWith(DELIVERY_SEARCH_PREFIX)) {
      const userPart = current.replace(/^santa\s*marta,?\s*magdalena,?\s*/i, '').trimStart();
      el.value = DELIVERY_SEARCH_PREFIX + userPart;
    }
  }

  private enforceSearchPrefix(el: google.maps.places.PlaceAutocompleteElement): void {
    const current = el.value ?? '';
    if (current.startsWith(DELIVERY_SEARCH_PREFIX)) {
      return;
    }
    const userPart = current.replace(/^santa\s*marta,?\s*magdalena,?\s*/i, '').trimStart();
    el.value = DELIVERY_SEARCH_PREFIX + userPart;
  }

  private resetSearchPrefix(): void {
    if (this.placeAutocompleteEl) {
      this.placeAutocompleteEl.value = DELIVERY_SEARCH_PREFIX;
    }
  }

  private destroyPlaceAutocomplete(): void {
    if (this.placeAutocompleteEl) {
      if (this.placeAutocompleteSelectHandler) {
        this.placeAutocompleteEl.removeEventListener(
          'gmp-select',
          this.placeAutocompleteSelectHandler,
        );
      }
      if (this.placeAutocompleteFocusHandler) {
        this.placeAutocompleteEl.removeEventListener(
          'focus',
          this.placeAutocompleteFocusHandler,
          true,
        );
      }
      if (this.placeAutocompleteBlurHandler) {
        this.placeAutocompleteEl.removeEventListener(
          'blur',
          this.placeAutocompleteBlurHandler,
          true,
        );
      }
    }
    this.placeAutocompleteSelectHandler = null;
    this.placeAutocompleteFocusHandler = null;
    this.placeAutocompleteBlurHandler = null;
    this.placeAutocompleteEl = null;
    this.autocompleteHost()?.nativeElement.replaceChildren();
    this.autocompleteBound = false;
  }

  private requestUserLocation(): Promise<google.maps.LatLngLiteral | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
      );
    });
  }

  private fitMapToRoute(result: google.maps.DirectionsResult): void {
    const map = this.mapInstance;
    const route = result.routes[0];
    if (!map || !route?.bounds) {
      return;
    }
    map.fitBounds(route.bounds, 48);
  }
}
