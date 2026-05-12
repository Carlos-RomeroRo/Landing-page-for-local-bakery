import { Component } from '@angular/core';
import { TimelineComponent } from '../../modal/timeline/timeline.component';
import { TimelineItem } from '../../modal/timeline/timeline-item.interface';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [TimelineComponent],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs {
  readonly historyItems: TimelineItem[] = [
    {
      year: '1998',
      title: 'Fundación',
      description: 'Iniciamos como un pequeño negocio familiar en Zapatoca, con el horno encendido desde el primer día.',
      company: 'Santa Marta',
    },
    {
      year: '2008',
      title: 'Expansión',
      description: 'Ampliamos el local y aumentamos nuestra producción para llegar a más mesas santandereanas.',
      company: 'Nueva sede',
    },
    {
      year: '2026',
      title: 'Transformación digital',
      description: 'Lanzamos nuestra página web y pedidos en línea para acercarte el pan recién horneado donde estés.',
      company: 'Online',
    },
  ];
}
