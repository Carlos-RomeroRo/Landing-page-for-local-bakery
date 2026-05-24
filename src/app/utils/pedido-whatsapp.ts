import { BAKERY_LOCATION } from '../core/maps/bakery.constants';
import { WHATSAPP_PEDIDOS_NUMERO } from '../core/config/whatsapp.config';
import type { ProductoCarritoLinea } from '../models/carrito.model';
import { formatPrecio } from './format-precio';

const DOMICILIO_BASE_KM = 1;
const DOMICILIO_PRECIO_BASE = 5000;
const DOMICILIO_PRECIO_KM_EXTRA = 2000;

const SEPARADOR_TOTAL =
  '-----------------------------------------------------------------------------------------------';

export interface CoordenadasEntrega {
  lat: number;
  lng: number;
}

export interface PedidoWhatsappInput {
  nombre: string;
  productos: ProductoCarritoLinea[];
  envioDomicilio: boolean;
  /** Solo si envioDomicilio; distancia en km para calcular el domicilio. */
  distanciaKm?: number;
  /** Dirección de entrega cuando aplica domicilio. */
  direccionEntrega?: string;
  /** Punto GPS del domicilio (para enlace a Google Maps en el mensaje). */
  coordenadasEntrega?: CoordenadasEntrega;
}

/** Ruta en carro: domicilio del cliente → Panadería Zapatoca. */
export function buildGoogleMapsRutaEntregaUrl(coords: CoordenadasEntrega): string {
  const { lat: destLat, lng: destLng } = BAKERY_LOCATION;
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${coords.lat},${coords.lng}` +
    `&destination=${destLat},${destLng}` +
    `&travelmode=driving`
  );
}

function esDireccionLegible(etiqueta: string): boolean {
  const t = etiqueta.trim().toLowerCase();
  return (
    t.length > 0 &&
    !t.includes('ubicación del dispositivo') &&
    !t.includes('punto colocado en el mapa') &&
    !t.includes('ubicación ajustada en el mapa')
  );
}

export function calcularValorDomicilio(distanciaKm: number): number {
  if (distanciaKm <= DOMICILIO_BASE_KM) {
    return DOMICILIO_PRECIO_BASE;
  }
  const kmAdicionales = Math.ceil(distanciaKm - DOMICILIO_BASE_KM);
  return DOMICILIO_PRECIO_BASE + kmAdicionales * DOMICILIO_PRECIO_KM_EXTRA;
}

export function buildPedidoWhatsappMessage(input: PedidoWhatsappInput): string {
  const { nombre, productos, envioDomicilio, distanciaKm, direccionEntrega, coordenadasEntrega } =
    input;

  const lineasProductos = productos.map(
    (item) => `${item.cantidad} ${item.nombre} .... ${formatPrecio(item.precio_total)}`,
  );

  const subtotalProductos = productos.reduce((sum, item) => sum + item.precio_total, 0);

  let valorDomicilio = 0;
  let lineaDomicilio: string;

  if (envioDomicilio) {
    const km = distanciaKm ?? DOMICILIO_BASE_KM;
    valorDomicilio = calcularValorDomicilio(km);
    lineaDomicilio =
      `Valor del domicilio: ${formatPrecio(valorDomicilio)}`;
  } else {
    lineaDomicilio = 'Valor del domicilio: $0 — será recogido por el cliente';
  }

  const valorAPagar = subtotalProductos + valorDomicilio;

  const lineasExtra: string[] = [];
  if (envioDomicilio && coordenadasEntrega) {
    const ruta = buildGoogleMapsRutaEntregaUrl(coordenadasEntrega);
    const etiqueta = direccionEntrega?.trim();
    if (etiqueta && esDireccionLegible(etiqueta)) {
      lineasExtra.push(`Dirección de entrega: ${etiqueta} — ${ruta}`);
    } else {
      lineasExtra.push(`Dirección de entrega: ${ruta}`);
    }
  }

  return [
    `Hola, soy ${nombre.trim()} y mi pedido es:`,
    '',
    ...lineasProductos,
    ...lineasExtra,
    '',
    lineaDomicilio,
    SEPARADOR_TOTAL,
    `Valor a pagar: ${formatPrecio(valorAPagar)}`,
  ].join('\n');
}

export function buildPedidoWhatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PEDIDOS_NUMERO}?text=${encodeURIComponent(message)}`;
}

export function abrirPedidoEnWhatsapp(input: PedidoWhatsappInput): void {
  if (typeof window === 'undefined') {
    return;
  }
  const message = buildPedidoWhatsappMessage(input);
  window.open(buildPedidoWhatsappUrl(message), '_blank', 'noopener,noreferrer');
}
