export const BAKERY_LOCATION: google.maps.LatLngLiteral = {
  lat: 11.2119477,
  lng: -74.18602,
};

/** Prefijo fijo en el buscador de dirección de entrega. */
export const DELIVERY_SEARCH_PREFIX = 'Santa Marta, Magdalena, ';

export interface DeliveryAddressSelection {
  distanciaKm: number;
  direccion: string;
  coordinates: google.maps.LatLngLiteral;
}
