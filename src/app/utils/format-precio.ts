export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(precio);
}

export function toNumber(value: number | string): number {
  return typeof value === 'string' ? Number(value) : value;
}
