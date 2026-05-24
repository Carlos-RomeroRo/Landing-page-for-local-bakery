import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

import { API_BASE_URL } from '../core/config/api.config';
import {
  CrearCarritoResponse,
  ResumenCarrito,
  ResumenCarritoApi,
} from '../models/carrito.model';
import { toNumber } from '../utils/format-precio';

const CART_ID_KEY = 'zapatoca-carrito-id';
const CART_TOKEN_KEY = 'zapatoca-carrito-token';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${API_BASE_URL}/carritos`;

  readonly resumen = signal<ResumenCarrito | null>(null);
  readonly cargando = signal(false);

  readonly totalUnidades = computed(() =>
    (this.resumen()?.productos ?? []).reduce((sum, item) => sum + item.cantidad, 0),
  );

  readonly totalCompra = computed(() => this.resumen()?.total_compra ?? 0);

  constructor() {
    if (isPlatformBrowser(this.platformId) && this.tieneCarritoGuardado()) {
      this.cargarResumen().subscribe();
    }
  }

  agregar(nombre: string, cantidad: number): Observable<CrearCarritoResponse> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('El carrito solo está disponible en el navegador.'));
    }

    return this.ensureCarrito().pipe(
      switchMap(({ carrito_id, token_acceso }) =>
        this.postItem(carrito_id, token_acceso, nombre, cantidad).pipe(
          catchError((error: HttpErrorResponse) => {
            if (this.esCarritoInvalido(error)) {
              this.clearCarrito();
              return this.crearCarrito().pipe(
                switchMap((carrito) =>
                  this.postItem(carrito.carrito_id, carrito.token_acceso, nombre, cantidad),
                ),
              );
            }
            return throwError(() => error);
          }),
        ),
      ),
      tap((response) => this.syncFromCarritoResponse(response)),
    );
  }

  cargarResumen(): Observable<ResumenCarrito | null> {
    if (!isPlatformBrowser(this.platformId) || !this.tieneCarritoGuardado()) {
      this.resumen.set(null);
      return of(null);
    }

    this.cargando.set(true);
    return this.ensureCarrito().pipe(
      switchMap(({ carrito_id, token_acceso }) =>
        this.http
          .get<ResumenCarritoApi>(`${this.baseUrl}/${carrito_id}/resumen`, {
            headers: { 'X-Carrito-Token': token_acceso },
          })
          .pipe(
            map((response) => this.normalizarResumen(response)),
            catchError((error: HttpErrorResponse) => {
              if (this.esCarritoInvalido(error)) {
                this.clearCarrito();
                this.resumen.set(null);
                return of(null);
              }
              return throwError(() => error);
            }),
          ),
      ),
      tap((resumen) => {
        this.resumen.set(resumen);
        this.cargando.set(false);
      }),
      catchError(() => {
        this.cargando.set(false);
        return of(null);
      }),
    );
  }

  actualizarCantidad(
    productoId: number,
    nombre: string,
    nuevaCantidad: number,
  ): Observable<CrearCarritoResponse | null> {
    if (!isPlatformBrowser(this.platformId) || !this.tieneCarritoGuardado()) {
      return of(null);
    }

    if (nuevaCantidad <= 0) {
      return this.eliminarProducto(productoId);
    }

    return this.eliminarProducto(productoId).pipe(
      switchMap((result) => {
        if (result === null && !this.tieneCarritoGuardado()) {
          return throwError(() => new Error('Carrito no disponible.'));
        }
        return this.agregar(nombre, nuevaCantidad);
      }),
    );
  }

  eliminarProducto(productoId: number): Observable<CrearCarritoResponse | null> {
    if (!isPlatformBrowser(this.platformId) || !this.tieneCarritoGuardado()) {
      return of(null);
    }

    const carritoId = localStorage.getItem(CART_ID_KEY)!;
    const token = localStorage.getItem(CART_TOKEN_KEY)!;

    return this.http
      .delete<CrearCarritoResponse>(`${this.baseUrl}/${carritoId}/items/${productoId}`, {
        headers: { 'X-Carrito-Token': token },
      })
      .pipe(
        tap((response) => this.syncFromCarritoResponse(response)),
        catchError((error: HttpErrorResponse) => {
          if (this.esCarritoInvalido(error)) {
            this.clearCarrito();
            return of(null);
          }
          return throwError(() => error);
        }),
      );
  }

  private ensureCarrito(): Observable<{ carrito_id: string; token_acceso: string }> {
    const storedId = localStorage.getItem(CART_ID_KEY);
    const storedToken = localStorage.getItem(CART_TOKEN_KEY);
    if (storedId && storedToken) {
      return of({ carrito_id: storedId, token_acceso: storedToken });
    }
    return this.crearCarrito();
  }

  private crearCarrito(): Observable<{ carrito_id: string; token_acceso: string }> {
    return this.http.post<CrearCarritoResponse>(this.baseUrl, {}).pipe(
      switchMap((response) => {
        this.persistCarrito(response.carrito_id, response.token_acceso);
        this.syncFromCarritoResponse(response);
        return of({ carrito_id: response.carrito_id, token_acceso: response.token_acceso });
      }),
    );
  }

  private postItem(
    carritoId: string,
    token: string,
    nombre: string,
    cantidad: number,
  ): Observable<CrearCarritoResponse> {
    return this.http.post<CrearCarritoResponse>(
      `${this.baseUrl}/${carritoId}/items`,
      { nombre, cantidad },
      { headers: { 'X-Carrito-Token': token } },
    );
  }

  private syncFromCarritoResponse(response: CrearCarritoResponse): void {
    this.resumen.set({
      carrito_id: response.carrito_id,
      estado: response.estado,
      productos: response.items.map((item) => ({
        producto_id: item.producto_id,
        nombre: item.nombre,
        precio_unitario: toNumber(item.precio_unitario),
        cantidad: item.cantidad,
        precio_total: toNumber(item.subtotal),
      })),
      total_compra: toNumber(response.total_productos),
      expira_en: response.expira_en,
    });
  }

  private normalizarResumen(response: ResumenCarritoApi): ResumenCarrito {
    return {
      carrito_id: response.carrito_id,
      estado: response.estado,
      productos: response.productos.map((item) => ({
        producto_id: item.producto_id,
        nombre: item.nombre,
        precio_unitario: toNumber(item.precio_unitario),
        cantidad: item.cantidad,
        precio_total: toNumber(item.precio_total),
      })),
      total_compra: toNumber(response.total_compra),
      expira_en: response.expira_en,
    };
  }

  private tieneCarritoGuardado(): boolean {
    return Boolean(localStorage.getItem(CART_ID_KEY) && localStorage.getItem(CART_TOKEN_KEY));
  }

  private esCarritoInvalido(error: HttpErrorResponse): boolean {
    // 404: carrito borrado o inexistente (p. ej. reinicio de BD en Render).
    // 403: token incorrecto. 410: carrito expirado.
    return error.status === 403 || error.status === 410 || error.status === 404;
  }

  private persistCarrito(carritoId: string, token: string): void {
    localStorage.setItem(CART_ID_KEY, carritoId);
    localStorage.setItem(CART_TOKEN_KEY, token);
  }

  clearCarrito(): void {
    localStorage.removeItem(CART_ID_KEY);
    localStorage.removeItem(CART_TOKEN_KEY);
    this.resumen.set(null);
  }
}
