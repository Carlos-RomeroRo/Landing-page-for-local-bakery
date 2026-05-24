# ZapatocaLanding

Landing de **Panadería Zapatoca** (Angular 21). Incluye catálogo, carrito, nosotros y contacto.

## Integración con Google Cloud (Google Maps Platform)

En la página de **contacto** (`/contacto`) se integra **Google Maps Platform** mediante una cuenta de **Google Cloud** y una **API key** restringida por dominio.

### APIs habilitadas

| API | Uso en el proyecto |
|-----|-------------------|
| [**Maps JavaScript API**](https://developers.google.com/maps/documentation/javascript) | Mapa interactivo (panadería, pin del usuario, clic para colocar origen). |
| [**Directions API**](https://developers.google.com/maps/documentation/directions) | Ruta en el mapa y **distancia / tiempo estimado** (`DirectionsService`). |
| [**Places API (New)**](https://developers.google.com/maps/documentation/javascript/place-autocomplete-new) | Sugerencias de direcciones al escribir (`PlaceAutocompleteElement`). |

### Comportamiento (GPS + búsqueda + pin manual)

1. **GPS:** al pulsar «Calcular ruta», el navegador pide ubicación y se traza la ruta hasta la panadería (`11.2119477`, `-74.18602`).
2. **Autocomplete:** si el GPS falla o es impreciso, el usuario puede buscar una dirección (sesgo Santa Marta / Colombia).
3. **Pin manual:** clic en el mapa o arrastrar el marcador azul para ajustar el origen; la ruta se recalcula.

La geolocalización usa la **Geolocation API del navegador**; Google Maps consume Directions y Places al trazar o corregir la ruta.

### Configuración en Google Cloud

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/).
2. Activar facturación (prueba gratuita / crédito mensual de Maps Platform).
3. En **Biblioteca de APIs**, habilitar:
   - Maps JavaScript API
   - Directions API
   - Places API (New) — imprescindible para las sugerencias al buscar dirección
   - (Opcional) Places API legacy, si ya la tenías habilitada
4. En **Credenciales**, crear una **API key** y restringirla:
   - **Aplicación:** referencias HTTP (sitios web), p. ej. `http://localhost:4200/*` y el dominio de producción (Vercel).
   - **APIs:** Maps JavaScript API, Directions API y **Places API (New)** (nombre en consola: `Places API`, ID `places.googleapis.com`).

### Error «Places API (New) has not been used…» o «is disabled»

Ese mensaje en la consola significa que la API **no está activada** en el proyecto de Google Cloud que usa tu API key (no es un bug de Angular).

1. Abre [Places API (New) en tu proyecto](https://console.cloud.google.com/apis/library/places.googleapis.com) (mismo proyecto donde creaste la key).
2. Pulsa **Habilitar** / **Enable**.
3. Ve a **Credenciales** → tu API key → **Restricciones de API** y confirma que **Places API** está en la lista permitida (junto con Maps JavaScript y Directions).
4. Espera **2–10 minutos** y recarga la página (`Ctrl+F5`). Los cambios en Google Cloud no son instantáneos.

Enlace directo si Google te muestra el ID de proyecto en el error:  
`https://console.developers.google.com/apis/api/places.googleapis.com/overview?project=TU_PROJECT_ID`

### Configuración local (desarrolladores)

1. Dependencia instalada: `@angular/google-maps`.

2. Copiar el archivo de entorno:

   ```bash
   cp .env.example .env
   ```

3. Editar `.env` (está en `.gitignore`, no se sube al repo):

   ```env
   NG_APP_GOOGLE_MAPS_API_KEY=AIza...tu_clave...
   ```

4. Reiniciar el servidor de desarrollo (`npm start`). El script `prestart` ejecuta `sync-env` y copia la clave de `.env` a `src/environments/maps.config.local.ts` (archivo generado, en `.gitignore`).

La clave se exporta desde `src/environments/maps.config.ts`. El script de Maps (con librería `places`) se carga al usar la sección de contacto, no al arrancar toda la app.

### Despliegue (Vercel)

- Variable de entorno: **`NG_APP_GOOGLE_MAPS_API_KEY`** = tu API key.
- Incluir el dominio de producción en las restricciones HTTP de la key (ej. `https://panaderiazapatoca.vercel.app/*`).
- Redesplegar después de añadir la variable.

### Costes y uso

- Directions y Maps tienen **cupos gratuitos mensuales** por SKU; el tráfico de una panadería local suele quedar en **$0**.
- Cada solicitud de ruta cuenta como un uso de Directions; el contador del nivel gratuito **se reinicia cada mes** (ciclo de facturación).
- El crédito de prueba de Google Cloud (**USD 300 / 90 días**) es independiente y **no se renueva** cada mes.
- Recomendado: alerta de presupuesto en Google Cloud y no exponer la API key en el repositorio.

### Referencias

- [Precios de Google Maps Platform](https://developers.google.com/maps/billing-and-pricing)
- [Angular Google Maps](https://github.com/angular/components/tree/main/src/google-maps)

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
