import { Component, computed, HostListener, inject, signal } from '@angular/core';

import { DeliveryAddressSelection } from '../../../core/maps/bakery.constants';
import { DeliveryAddressPickerComponent } from '../../shared/delivery-address-picker/delivery-address-picker.component';
import { CarritoService } from '../../../services/carrito.service';
import { formatPrecio } from '../../../utils/format-precio';
import {
  abrirPedidoEnWhatsapp,
  buildPedidoWhatsappMessage,
  buildPedidoWhatsappUrl,
  calcularValorDomicilio,
} from '../../../utils/pedido-whatsapp';

@Component({
  selector: 'app-carrito-panel',
  standalone: true,
  imports: [DeliveryAddressPickerComponent],
  templateUrl: './carrito-panel.component.html',
  styleUrl: './carrito-panel.component.css',
})
export class CarritoPanelComponent {
  private readonly carritoService = inject(CarritoService);

  readonly isOpen = signal(false);
  readonly checkoutOpen = signal(false);
  readonly eliminandoId = signal<number | null>(null);
  readonly editandoId = signal<number | null>(null);
  readonly actualizandoId = signal<number | null>(null);
  readonly cantidadEdicion = signal(1);
  readonly error = signal('');
  readonly checkoutError = signal('');
  readonly checkoutEnviado = signal(false);

  readonly nombreCliente = signal('');
  readonly envioDomicilio = signal<boolean | null>(null);
  readonly direccionEntrega = signal<DeliveryAddressSelection | null>(null);
  readonly mensajeWhatsapp = signal('');

  readonly resumen = this.carritoService.resumen;
  readonly cargando = this.carritoService.cargando;
  readonly totalUnidades = this.carritoService.totalUnidades;
  readonly totalCompra = this.carritoService.totalCompra;

  readonly puedeFinalizar = computed(() => (this.resumen()?.productos?.length ?? 0) > 0);

  readonly valorDomicilioEstimado = computed(() => {
    if (this.envioDomicilio() !== true) {
      return 0;
    }
    const entrega = this.direccionEntrega();
    if (!entrega) {
      return null;
    }
    return calcularValorDomicilio(entrega.distanciaKm);
  });

  readonly totalConDomicilio = computed(() => {
    const productos = this.totalCompra();
    const domicilio = this.valorDomicilioEstimado();
    return productos + (domicilio ?? 0);
  });

  open(): void {
    this.error.set('');
    this.checkoutOpen.set(false);
    this.checkoutEnviado.set(false);
    this.isOpen.set(true);
    this.carritoService.cargarResumen().subscribe();
  }

  close(): void {
    this.isOpen.set(false);
    this.checkoutOpen.set(false);
    this.checkoutEnviado.set(false);
    this.cancelarEdicion();
    this.resetCheckoutForm();
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
      return;
    }
    this.open();
  }

  abrirCheckout(): void {
    if (!this.puedeFinalizar()) {
      return;
    }
    this.checkoutError.set('');
    this.checkoutEnviado.set(false);
    this.resetCheckoutForm();
    this.checkoutOpen.set(true);
  }

  cerrarCheckout(): void {
    this.checkoutOpen.set(false);
    this.checkoutError.set('');
    this.checkoutEnviado.set(false);
  }

  updateNombre(value: string): void {
    this.nombreCliente.set(value);
    this.checkoutError.set('');
  }

  seleccionarDomicilio(envio: boolean): void {
    this.envioDomicilio.set(envio);
    if (!envio) {
      this.direccionEntrega.set(null);
    }
    this.checkoutError.set('');
  }

  onDireccionEntrega(selection: DeliveryAddressSelection | null): void {
    this.direccionEntrega.set(selection);
    this.checkoutError.set('');
  }

  confirmarCheckout(): void {
    const nombre = this.nombreCliente().trim();
    const domicilio = this.envioDomicilio();
    const productos = this.resumen()?.productos ?? [];

    if (!nombre) {
      this.checkoutError.set('Ingresa tu nombre para continuar.');
      return;
    }

    if (domicilio === null) {
      this.checkoutError.set('Indica si deseas envío a domicilio.');
      return;
    }

    let distancia: number | undefined;
    let direccion: string | undefined;
    let coordenadas: DeliveryAddressSelection['coordinates'] | undefined;
    if (domicilio) {
      const entrega = this.direccionEntrega();
      if (!entrega) {
        this.checkoutError.set(
          'Indica la dirección de entrega con GPS, búsqueda o pin en el mapa.',
        );
        return;
      }
      distancia = entrega.distanciaKm;
      direccion = entrega.direccion;
      coordenadas = entrega.coordinates;
    }

    const pedidoInput = {
      nombre,
      productos,
      envioDomicilio: domicilio,
      distanciaKm: distancia,
      direccionEntrega: direccion,
      coordenadasEntrega: coordenadas,
    };

    this.mensajeWhatsapp.set(buildPedidoWhatsappMessage(pedidoInput));
    this.checkoutError.set('');
    this.checkoutEnviado.set(true);
    abrirPedidoEnWhatsapp(pedidoInput);
  }

  whatsappUrl(): string {
    return buildPedidoWhatsappUrl(this.mensajeWhatsapp());
  }

  eliminar(productoId: number): void {
    this.error.set('');
    this.cancelarEdicion();
    this.eliminandoId.set(productoId);
    this.carritoService.eliminarProducto(productoId).subscribe({
      next: () => this.eliminandoId.set(null),
      error: () => {
        this.eliminandoId.set(null);
        this.error.set('No se pudo quitar el producto. Intenta de nuevo.');
      },
    });
  }

  iniciarEdicion(item: { producto_id: number; cantidad: number }): void {
    if (this.eliminandoId() || this.actualizandoId()) {
      return;
    }
    this.error.set('');
    this.editandoId.set(item.producto_id);
    this.cantidadEdicion.set(item.cantidad);
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
  }

  updateCantidadEdicion(value: string): void {
    const parsed = Number.parseInt(value, 10);
    this.cantidadEdicion.set(Number.isNaN(parsed) ? 0 : parsed);
    this.error.set('');
  }

  guardarCantidad(item: { producto_id: number; nombre: string; cantidad: number }): void {
    const nuevaCantidad = this.cantidadEdicion();

    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad <= 0) {
      this.error.set('La cantidad debe ser un número entero mayor a 0.');
      return;
    }

    if (nuevaCantidad === item.cantidad) {
      this.cancelarEdicion();
      return;
    }

    this.error.set('');
    this.actualizandoId.set(item.producto_id);
    this.carritoService.actualizarCantidad(item.producto_id, item.nombre, nuevaCantidad).subscribe({
      next: () => {
        this.actualizandoId.set(null);
        this.cancelarEdicion();
      },
      error: () => {
        this.actualizandoId.set(null);
        this.error.set('No se pudo actualizar la cantidad. Intenta de nuevo.');
      },
    });
  }

  itemOcupado(productoId: number): boolean {
    return (
      this.eliminandoId() === productoId ||
      this.actualizandoId() === productoId
    );
  }

  formatPrecio(precio: number): string {
    return formatPrecio(precio);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.checkoutOpen()) {
      this.cerrarCheckout();
      return;
    }
    if (this.isOpen()) {
      this.close();
    }
  }

  private resetCheckoutForm(): void {
    this.nombreCliente.set('');
    this.envioDomicilio.set(null);
    this.direccionEntrega.set(null);
    this.mensajeWhatsapp.set('');
    this.checkoutError.set('');
  }
}
