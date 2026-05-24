export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  foto: string;
  tipo: string;
  tipo_etiqueta: string;
}

export interface ProductoApi {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number | string;
  foto: string;
  tipo?: string;
  tipo_etiqueta?: string;
}

export interface TipoProductoApi {
  id: string;
  nombre: string;
}

export function normalizarProducto(raw: ProductoApi): Producto {
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
    precio: typeof raw.precio === 'string' ? Number(raw.precio) : raw.precio,
    foto: raw.foto,
    tipo: raw.tipo ?? 'otros',
    tipo_etiqueta: raw.tipo_etiqueta ?? 'Otros',
  };
}
