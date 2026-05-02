import { Injectable, signal } from '@angular/core';

export type ModalType = 'order' | 'contact' | 'products';

export interface ModalState {
  open: boolean;
  type: ModalType | null;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private readonly _state = signal<ModalState>({
    open: false,
    type: null,
    title: '',
    description: ''
  });

  readonly state = this._state.asReadonly();

  openModal(type: ModalType) {
    const modalData = this.getModalData(type);
    this._state.set({
      open: true,
      type,
      title: modalData.title,
      description: modalData.description
    });
  }

  closeModal() {
    this._state.update(current => ({
      ...current,
      open: false
    }));
  }

  private getModalData(type: ModalType) {
    switch (type) {
      case 'order':
        return {
          title: 'Pedir Ahora',
          description: 'Selecciona tu favorito y escríbenos por WhatsApp o completa el formulario para pedir tu pan artesanal.'
        };
      case 'contact':
        return {
          title: 'Contáctanos',
          description: 'Déjanos tus datos y te responderemos con la mejor atención para tu pedido.'
        };
      case 'products':
      default:
        return {
          title: 'Nuestros Productos',
          description: 'Descubre el pan fresco, las conchas, empanadas y especialidades que preparamos cada día.'
        };
    }
  }
}
