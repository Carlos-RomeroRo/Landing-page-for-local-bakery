const SCRIPT_ID = 'google-maps-api';
const CALLBACK_NAME = '__zapatocaMapsReady';

let loadPromise: Promise<void> | null = null;

type GoogleMapsNamespace = {
  Map?: unknown;
  importLibrary?: (name: string) => Promise<unknown>;
};

function getGoogleMapsNamespace(): GoogleMapsNamespace | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return (window as unknown as { google?: { maps?: GoogleMapsNamespace } }).google?.maps;
}

function isMapsApiAvailable(): boolean {
  const maps = getGoogleMapsNamespace();
  return (
    typeof maps?.Map === 'function' || typeof maps?.importLibrary === 'function'
  );
}

export function loadGoogleMapsApi(apiKey: string): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (isMapsApiAvailable()) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const win = window as unknown as Record<string, unknown>;
    let settled = false;

    const finish = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      if (isMapsApiAvailable()) {
        resolve();
      } else {
        reject(new Error('Google Maps no inicializó correctamente'));
      }
    };

    const fail = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      reject(new Error('No se pudo cargar Google Maps'));
    };

    win[CALLBACK_NAME] = () => {
      delete win[CALLBACK_NAME];
      finish();
    };

    const timeout = window.setTimeout(fail, 20000);

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (isMapsApiAvailable()) {
        window.clearTimeout(timeout);
        finish();
        return;
      }
      existing.addEventListener('load', () => {
        window.clearTimeout(timeout);
        finish();
      });
      existing.addEventListener('error', () => {
        window.clearTimeout(timeout);
        fail();
      });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&language=es&region=CO&libraries=places&callback=${CALLBACK_NAME}`;
    script.onload = () => {
      if (isMapsApiAvailable()) {
        window.clearTimeout(timeout);
        finish();
      }
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      fail();
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsReady(): boolean {
  return isMapsApiAvailable();
}

export async function ensurePlacesLibrary(): Promise<boolean> {
  if (!isMapsApiAvailable()) {
    return false;
  }

  const maps = getGoogleMapsNamespace();
  if (typeof maps?.importLibrary !== 'function') {
    return typeof google.maps.places?.PlaceAutocompleteElement === 'function';
  }

  try {
    await maps.importLibrary('places');
    return true;
  } catch {
    return false;
  }
}
