export interface CrearCarritoResponse {
  carrito_id: string;
  estado: string;
  token_acceso: string;
  items: ItemCarritoLinea[];
  total_productos: number | string;
  expira_en: string | null;
}

export interface ItemCarritoLinea {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number | string;
  subtotal: number | string;
}

export interface ProductoCarritoLinea {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  precio_total: number;
}

export interface ResumenCarrito {
  carrito_id: string;
  estado: string;
  productos: ProductoCarritoLinea[];
  total_compra: number;
  expira_en: string | null;
}

export interface ResumenCarritoApi {
  carrito_id: string;
  estado: string;
  productos: {
    producto_id: number;
    nombre: string;
    precio_unitario: number | string;
    cantidad: number;
    precio_total: number | string;
  }[];
  total_compra: number | string;
  expira_en: string | null;
}

export interface AgregarItemCarritoRequest {
  nombre: string;
  cantidad: number;
}
