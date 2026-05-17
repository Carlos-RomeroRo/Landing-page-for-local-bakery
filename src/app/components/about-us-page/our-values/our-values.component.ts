import { Component, input } from '@angular/core';

import { FadeDirective } from '../../../animation';
import { IconComponent } from '../../shared/icon';
import { OurValue } from './our-value.interface';

@Component({
  selector: 'app-our-values',
  standalone: true,
  host: {
    class: 'block w-full',
  },
  imports: [FadeDirective, IconComponent],
  templateUrl: './our-values.component.html',
  styleUrl: './our-values.component.css',
})
export class OurValuesComponent {
  readonly items = input<OurValue[]>([]);
  readonly sectionLabel = input('Valores');
  readonly sectionTitle = input('Nuestros valores');
  readonly sectionDescription = input(
    'Lo que nos guía cada mañana al encender el horno: principios que heredamos de familia y que cuidamos en cada pan que sale de Zapatoca.',
  );

  formatIndex(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  fadeDelay(index: number): number {
    return 0.12 + index * 0.09;
  }

  /** Desplazamiento en zigzag en escritorio (columna derecha, filas 2 y 3). */
  isStaggered(index: number): boolean {
    return index % 2 === 1;
  }
}
