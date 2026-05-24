import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../core/config/api.config';
import {
  normalizarProducto,
  Producto,
  ProductoApi,
  TipoProductoApi,
} from '../models/producto.model';
import { ProductoTipoApi } from '../utils/producto-categoria';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/productos`;

  listar(): Observable<Producto[]> {
    return this.http
      .get<ProductoApi[]>(this.baseUrl)
      .pipe(map((items) => items.map(normalizarProducto)));
  }

  listarTipos(): Observable<TipoProductoApi[]> {
    return this.http.get<TipoProductoApi[]>(`${this.baseUrl}/tipos`);
  }

  listarPorTipo(tipo: ProductoTipoApi): Observable<Producto[]> {
    return this.http
      .get<ProductoApi[]>(`${this.baseUrl}/tipo/${tipo}`)
      .pipe(map((items) => items.map(normalizarProducto)));
  }
}
