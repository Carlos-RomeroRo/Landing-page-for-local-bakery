import { Component, computed, HostListener, inject, signal } from '@angular/core';

import { Producto } from '../../../models/producto.model';
import { CarritoService } from '../../../services/carrito.service';
import { formatPrecio } from '../../../utils/format-precio';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  templateUrl: './product-detail-modal.component.html',
  styleUrl: './product-detail-modal.component.css',
})
export class ProductDetailModalComponent {
  private readonly carritoService = inject(CarritoService);
  private cierreExitoTimer: ReturnType<typeof setTimeout> | null = null;

  readonly product = signal<Producto | null>(null);
  readonly cantidad = signal(1);
  readonly cantidadError = signal('');
  readonly agregando = signal(false);
  readonly agregadoOk = signal(false);
  readonly agregarError = signal('');

  readonly isOpen = computed(() => this.product() !== null);

  readonly precioFormateado = computed(() => {
    const p = this.product();
    if (!p) {
      return '';
    }
    return formatPrecio(p.precio);
  });

  open(product: Producto): void {
    this.cancelarCierreExito();
    this.product.set(product);
    this.cantidad.set(1);
    this.limpiarFeedback();
    this.cantidadError.set('');
  }

  close(): void {
    if (this.agregando()) {
      return;
    }
    this.cancelarCierreExito();
    this.limpiarFeedback();
    this.product.set(null);
  }

  updateCantidad(raw: string): void {
    this.cantidadError.set('');
    this.limpiarFeedback();
    const parsed = Number.parseInt(raw, 10);
    this.cantidad.set(Number.isNaN(parsed) ? 0 : parsed);
  }

  agregar(): void {
    if (this.agregando() || this.agregadoOk()) {
      return;
    }

    const product = this.product();
    if (!product) {
      return;
    }

    const cantidad = this.cantidad();
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      this.limpiarFeedback();
      this.cantidadError.set('Ingresa una cantidad válida (mínimo 1 unidad).');
      return;
    }

    this.cantidadError.set('');
    this.limpiarFeedback();
    this.agregando.set(true);

    this.carritoService.agregar(product.nombre, cantidad).subscribe({
      next: () => {
        this.agregando.set(false);
        this.agregadoOk.set(true);
        this.programarCierreExito();
      },
      error: () => {
        this.agregando.set(false);
        this.agregadoOk.set(false);
        this.agregarError.set('No se pudo agregar al carrito. Intenta de nuevo.');
      },
    });
  }

  private limpiarFeedback(): void {
    this.cancelarCierreExito();
    this.agregadoOk.set(false);
    this.agregarError.set('');
  }

  private programarCierreExito(): void {
    this.cancelarCierreExito();
    this.cierreExitoTimer = setTimeout(() => {
      this.cierreExitoTimer = null;
      if (this.agregadoOk()) {
        this.close();
      }
    }, 1800);
  }

  private cancelarCierreExito(): void {
    if (this.cierreExitoTimer !== null) {
      clearTimeout(this.cierreExitoTimer);
      this.cierreExitoTimer = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}
