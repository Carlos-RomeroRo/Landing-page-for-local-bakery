import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  GoogleMap,
  MapDirectionsRenderer,
  MapDirectionsService,
  MapMarker,
} from '@angular/google-maps';

import { ensurePlacesLibrary } from '../../../core/google-maps/google-maps-loader';
import { GoogleMapsReadyService } from '../../../core/google-maps/google-maps-ready.service';
import { GOOGLE_MAPS_API_KEY } from '../../../../environments/maps.config';

const BAKERY: google.maps.LatLngLiteral = { lat: 11.2119477, lng: -74.18602 };

/** Prefijo fijo dentro del mismo input; el usuario escribe después de la coma. */
const SEARCH_PREFIX = 'Santa Marta, Magdalena, ';

const STATIC_MAP_EMBED =
  'https://maps.google.com/maps?q=11.2119477,-74.18602&hl=es&z=16&output=embed';

type OriginSource = 'gps' | 'search' | 'manual';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [GoogleMap, MapMarker, MapDirectionsRenderer],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);
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
  readonly mapsAuthError = signal(false);
  readonly showInteractiveMap = signal(false);
  readonly mapBootstrapping = signal(false);
  readonly awaitingLocation = signal(false);
  readonly originSource = signal<OriginSource | null>(null);
  readonly originAddressLabel = signal<string | null>(null);

  readonly staticMapEmbedUrl: SafeResourceUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(STATIC_MAP_EMBED);

  readonly bakery = BAKERY;
  readonly mapCenter = BAKERY;
  readonly mapZoom = 16;
  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  };

  readonly directionsRendererOptions: google.maps.DirectionsRendererOptions = {
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#d97706',
      strokeWeight: 6,
      strokeOpacity: 0.9,
    },
  };

  readonly userMarkerOptions: google.maps.MarkerOptions = {
    draggable: true,
    title: 'Tu punto de partida — arrastra para corregir',
  };

  readonly directionsResult = signal<google.maps.DirectionsResult | undefined>(undefined);
  readonly userOrigin = signal<google.maps.LatLngLiteral | null>(null);
  readonly locationAccuracyM = signal<number | null>(null);
  readonly routeInfo = signal<{ distance: string; duration: string } | null>(null);
  readonly locationDenied = signal(false);
  readonly routeLoading = signal(false);
  readonly routeError = signal<string | null>(null);
  readonly placesSearchReady = signal(false);

  readonly openInGoogleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${BAKERY.lat},${BAKERY.lng}&travelmode=driving`;

  get openInGoogleMapsWithOriginUrl(): string {
    const origin = this.userOrigin();
    if (!origin) {
      return this.openInGoogleMapsUrl;
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${BAKERY.lat},${BAKERY.lng}&travelmode=driving`;
  }

  get showOriginCorrection(): boolean {
    return this.showInteractiveMap() && this.mapsReady();
  }

  ngOnDestroy(): void {
    this.destroyPlaceAutocomplete();
  }

  onMapAuthFailure(): void {
    this.mapsAuthError.set(true);
  }

  onMapInitialized(map: google.maps.Map): void {
    this.mapInstance = map;
    google.maps.event.trigger(map, 'resize');

    const route = this.directionsResult();
    if (route) {
      this.fitMapToRoute(route);
    } else {
      map.setCenter(this.bakery);
      map.setZoom(this.mapZoom);
    }

    this.scheduleAutocompleteSetup();
  }

  async requestRoute(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    this.locationDenied.set(false);
    this.routeError.set(null);
    this.showInteractiveMap.set(true);

    const mapOk = await this.ensureMapReady();
    if (!mapOk) {
      return;
    }

    this.awaitingLocation.set(true);
    const gpsOrigin = await this.requestUserLocation();
    this.awaitingLocation.set(false);

    if (gpsOrigin) {
      await this.applyOriginAndRoute(gpsOrigin, 'gps');
      return;
    }

    this.scheduleAutocompleteSetup();
    this.routeError.set(null);
  }

  async openMapForManualCorrection(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    this.showInteractiveMap.set(true);
    this.locationDenied.set(false);
    this.routeError.set(null);
    const ok = await this.ensureMapReady();
    if (ok) {
      this.scheduleAutocompleteSetup();
    }
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

  onUserMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    const latLng = event.latLng;
    if (!latLng) {
      return;
    }
    void this.applyOriginAndRoute(
      { lat: latLng.lat(), lng: latLng.lng() },
      'manual',
      'Ubicación ajustada en el mapa',
    );
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!this.showOriginCorrection || this.routeLoading()) {
      return;
    }
    const latLng = event.latLng;
    if (!latLng) {
      return;
    }
    void this.applyOriginAndRoute(
      { lat: latLng.lat(), lng: latLng.lng() },
      'manual',
      'Punto colocado en el mapa',
    );
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
      this.routeError.set(
        'No pudimos activar el mapa interactivo. Revisa la API key y las APIs en Google Cloud.',
      );
    }
    return ok;
  }

  private async applyOriginAndRoute(
    origin: google.maps.LatLngLiteral,
    source: OriginSource,
    addressLabel?: string,
  ): Promise<void> {
    this.userOrigin.set({ ...origin });
    this.originSource.set(source);
    if (addressLabel) {
      this.originAddressLabel.set(addressLabel);
    } else if (source === 'gps') {
      this.originAddressLabel.set('Ubicación del dispositivo (GPS)');
    }

    this.showInteractiveMap.set(true);
    this.routeError.set(null);
    this.routeLoading.set(true);

    if (!this.mapsReady()) {
      const ok = await this.ensureMapReady();
      if (!ok) {
        this.routeLoading.set(false);
        return;
      }
    }

    this.scheduleAutocompleteSetup();

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
            this.fitMapToRoute(response.result);
            return;
          }
          this.routeError.set(
            'No se pudo calcular la ruta. Corrige tu punto de partida o abre Google Maps.',
          );
        },
        error: () => {
          this.routeLoading.set(false);
          this.routeError.set('Error al calcular la ruta. Intenta corregir tu ubicación.');
        },
      });
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
      this.placesSearchReady.set(false);
      return;
    }

    const PlaceAutocompleteElement = google.maps.places.PlaceAutocompleteElement;
    if (!PlaceAutocompleteElement) {
      this.placesSearchReady.set(false);
      return;
    }

    this.destroyPlaceAutocomplete();
    host.replaceChildren();

    const autocompleteEl = new PlaceAutocompleteElement({
      includedRegionCodes: ['co'],
      requestedLanguage: 'es',
      requestedRegion: 'CO',
      value: SEARCH_PREFIX,
      placeholder: 'calle, barrio, conjunto…',
      locationBias: { center: BAKERY, radius: 40000 },
    });

    autocompleteEl.classList.add('contact-place-autocomplete');
    autocompleteEl.setAttribute(
      'aria-label',
      'Buscar dirección en Santa Marta, Magdalena',
    );
    autocompleteEl.style.setProperty('color-scheme', 'light dark');

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
    this.placesSearchReady.set(true);
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
      await this.applyOriginAndRoute(
        { lat: location.lat(), lng: location.lng() },
        'search',
        label,
      );
      this.resetSearchPrefix();
    } catch {
      this.routeError.set('Error al usar la dirección seleccionada. Intenta de nuevo.');
    }
  }

  private ensureSearchPrefix(el: google.maps.places.PlaceAutocompleteElement): void {
    const current = el.value ?? '';
    if (!current.startsWith(SEARCH_PREFIX)) {
      const userPart = current.replace(/^santa\s*marta,?\s*magdalena,?\s*/i, '').trimStart();
      el.value = SEARCH_PREFIX + userPart;
    }
  }

  private enforceSearchPrefix(el: google.maps.places.PlaceAutocompleteElement): void {
    const current = el.value ?? '';
    if (current.startsWith(SEARCH_PREFIX)) {
      return;
    }
    const userPart = current.replace(/^santa\s*marta,?\s*magdalena,?\s*/i, '').trimStart();
    el.value = SEARCH_PREFIX + userPart;
  }

  private resetSearchPrefix(): void {
    if (this.placeAutocompleteEl) {
      this.placeAutocompleteEl.value = SEARCH_PREFIX;
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
    this.placesSearchReady.set(false);
  }

  private requestUserLocation(): Promise<google.maps.LatLngLiteral | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        this.locationDenied.set(true);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locationAccuracyM.set(
            Number.isFinite(position.coords.accuracy)
              ? Math.round(position.coords.accuracy)
              : null,
          );
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          this.locationDenied.set(true);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
      );
    });
  }

  private fitMapToRoute(result: google.maps.DirectionsResult): void {
    const map = this.mapInstance;
    const route = result.routes[0];
    if (!map || !route) {
      return;
    }

    if (route.bounds) {
      map.fitBounds(route.bounds, 80);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    for (const leg of route.legs) {
      bounds.extend(leg.start_location);
      bounds.extend(leg.end_location);
    }
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 80);
    }
  }

  originSourceLabel(): string | null {
    const source = this.originSource();
    const address = this.originAddressLabel();
    if (!source) {
      return null;
    }
    if (address) {
      return address;
    }
    switch (source) {
      case 'gps':
        return 'Origen: GPS del dispositivo';
      case 'search':
        return 'Origen: búsqueda de dirección';
      case 'manual':
        return 'Origen: pin en el mapa';
    }
  }

  locationAccuracyLabel(): string | null {
    const meters = this.locationAccuracyM();
    if (meters == null || this.originSource() !== 'gps') {
      return null;
    }
    if (meters <= 100) {
      return `GPS con precisión aproximada de ${meters} m. Si no es correcto, corrige abajo.`;
    }
    if (meters <= 1000) {
      return `GPS impreciso (±${meters} m). Corrige con búsqueda o arrastrando el pin azul.`;
    }
    return `GPS muy impreciso (±${(meters / 1000).toFixed(1)} km). Corrige tu punto de partida abajo.`;
  }
}
