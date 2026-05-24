import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

import { GOOGLE_MAPS_API_KEY } from '../../../environments/maps.config';
import {
  ensurePlacesLibrary,
  isGoogleMapsReady,
  loadGoogleMapsApi,
} from './google-maps-loader';

@Injectable({ providedIn: 'root' })
export class GoogleMapsReadyService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly ready = signal(false);
  readonly loadError = signal<string | null>(null);

  async ensureReady(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      this.loadError.set('Falta NG_APP_GOOGLE_MAPS_API_KEY en .env');
      return false;
    }

    if (this.ready() || isGoogleMapsReady()) {
      this.ready.set(true);
      return true;
    }

    try {
      await loadGoogleMapsApi(GOOGLE_MAPS_API_KEY);
      const placesOk = await ensurePlacesLibrary();
      if (!placesOk) {
        this.loadError.set(
          'Mapa cargado, pero Places no está disponible. Habilita Places API (New) en Google Cloud.',
        );
      }
      this.ready.set(true);
      if (placesOk) {
        this.loadError.set(null);
      }
      return true;
    } catch {
      this.loadError.set(
        'No se pudo cargar el mapa. Revisa la API key, facturación y restricciones HTTP en Google Cloud.',
      );
      return false;
    }
  }
}
