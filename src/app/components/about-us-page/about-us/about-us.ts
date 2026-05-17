import { Component } from '@angular/core';
import { FadeDirective } from '../../../animation';
import { TimelineComponent } from '../../modal/timeline/timeline.component';
import { TimelineItem } from '../../modal/timeline/timeline-item.interface';
import { OurValue } from '../our-values/our-value.interface';
import { OurValuesComponent } from '../our-values/our-values.component';
import { AchievementStat } from '../achievements-section/achievement-stat.interface';
import { AchievementsSectionComponent } from '../achievements-section/achievements-section.component';
import { TeamMember } from '../team-section/team-member.interface';
import { TeamSectionComponent } from '../team-section/team-section.component';
import { VideoCarouselComponent } from '../video-carousel/video-carousel.component';
import { VideoCarouselItem } from '../video-carousel/video-carousel-item.interface';

@Component({
  selector: 'app-about-us',
  standalone: true,
  host: {
    class: 'block w-full',
  },
  imports: [
    FadeDirective,
    TimelineComponent,
    VideoCarouselComponent,
    OurValuesComponent,
    TeamSectionComponent,
    AchievementsSectionComponent,
  ],
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
      year: '2015',
      title: 'Ampliación',
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

  readonly bakeryValues: OurValue[] = [
    {
      id: 'tradicion',
      title: 'Tradición',
      icon: 'landmark',
      description:
        'Horneamos con recetas que heredamos en familia y que siguen vivo en Zapatoca desde nuestros primeros días.',
    },
    {
      id: 'calidad',
      title: 'Calidad',
      icon: 'star',
      description:
        'Elegimos ingredientes nobles y cuidamos cada etapa para que cada producto llegue impecable a tu mesa.',
    },
    {
      id: 'honestidad',
      title: 'Honestidad',
      icon: 'handshake',
      description:
        'Trabajamos con transparencia: lo que ves en vitrina es lo que sale de nuestro horno, sin atajos ni promesas vacías.',
    },
    {
      id: 'artesania',
      title: 'Artesanía',
      icon: 'hand',
      description:
        'Cada pieza se elabora a mano, respetando tiempos de fermentación y el oficio panadero que nos define.',
    },
    {
      id: 'familia',
      title: 'Calidez familiar',
      icon: 'heart',
      description:
        'Somos un negocio de familia: te atendemos como en casa, con cercanía, cariño y el trato que mereces.',
    },
    {
      id: 'frescura',
      title: 'Frescura diaria',
      icon: 'sun',
      description:
        'Encendemos el horno cada mañana para que siempre disfrutes pan y dulces recién salidos, con aroma a hogar.',
    },
  ];

  readonly achievementStats: AchievementStat[] = [
    {
      id: 'anos-tradicion',
      icon: 'trophy',
      value: '25+',
      title: 'Años de tradición panadera',
      description:
        'Más de dos décadas horneando con recetas familiares y el mismo compromiso con la calidad que nos vio nacer en Zapatoca.',
      tag: 'Trayectoria',
    },
    {
      id: 'clientes',
      icon: 'users',
      value: '15K+',
      title: 'Clientes que confían en nosotros',
      description:
        'Familias, comercios y visitantes que eligen nuestro pan cada día por su frescura, sabor y trato cercano.',
      tag: 'Comunidad',
    },
    {
      id: 'productos',
      icon: 'chart-column',
      value: '50+',
      title: 'Referencias en vitrina',
      description:
        'Panadería, pastelería y productos de temporada elaborados a mano para acompañar cada momento del día.',
      tag: 'Variedad',
    },
    {
      id: 'produccion',
      icon: 'trending-up',
      value: '365',
      title: 'Días de horno encendido',
      description:
        'Producción diaria que garantiza productos recién salidos del horno, con procesos que priorizan la artesanía.',
      tag: 'Frescura',
    },
    {
      id: 'reconocimiento',
      icon: 'calendar',
      value: '1998',
      title: 'Desde el corazón de Santander',
      description:
        'Fundada como negocio familiar, hemos crecido sin perder la esencia: pan honesto, hecho con pasión y oficio.',
      tag: 'Origen',
    },
  ];

  readonly teamMembers: TeamMember[] = [
    {
      id: 'maria-gonzalez',
      name: 'María González',
      role: 'Directora general',
      description:
        'Lidera la visión de Panadería Zapatoca con más de quince años en el sector. Coordina equipos, cuida la experiencia del cliente y asegura que cada decisión honre la tradición familiar del negocio.',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80&auto=format&fit=crop',
    },
    {
      id: 'carlos-ramirez',
      name: 'Carlos Ramírez',
      role: 'Maestro panadero',
      description:
        'Aprendió el oficio junto a su abuelo y hoy supervisa fermentaciones, horneados y recetas de masa madre. Su criterio define el sabor auténtico que nos distingue en Zapatoca.',
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&q=80&auto=format&fit=crop',
    },
    {
      id: 'ana-lucia-velez',
      name: 'Ana Lucía Vélez',
      role: 'Jefa de pastelería',
      description:
        'Diseña tortas, postres y líneas estacionales con ingredientes locales. Combina técnica francesa con recuerdos de cocina casera para sorprender en cada celebración.',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&q=80&auto=format&fit=crop',
    },
    {
      id: 'diego-sarmiento',
      name: 'Diego Sarmiento',
      role: 'Operaciones',
      description:
        'Organiza producción diaria, inventarios y logística para que el pan llegue fresco a vitrina y pedidos en línea. Mantiene el ritmo del horno sin perder calidad ni calidez.',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=900&q=80&auto=format&fit=crop',
    },
  ];

  readonly productVideos: VideoCarouselItem[] = [
    {
      id: 'pan-campesino',
      title: 'Pan campesino',
      description: 'Corteza dorada y miga suave, horneado cada mañana.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster:
        'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777689098/Logo_zapatoca_kkmcy2.jpg',
    },
    {
      id: 'croissants',
      title: 'Croissants',
      description: 'Hojaldre mantecoso con el punto justo de crocancia.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      poster:
        'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777689098/Logo_zapatoca_kkmcy2.jpg',
    },
    {
      id: 'tortas',
      title: 'Tortas artesanales',
      description: 'Rellenos caseros para celebrar en familia.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      poster:
        'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777689098/Logo_zapatoca_kkmcy2.jpg',
    },
    {
      id: 'galletas',
      title: 'Galletas',
      description: 'Recetas tradicionales con sabor a hogar.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      poster:
        'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777689098/Logo_zapatoca_kkmcy2.jpg',
    },
    {
      id: 'empanadas',
      title: 'Empanadas',
      description: 'Relleno generoso y masa quebradiza al primer bocado.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      poster:
        'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777689098/Logo_zapatoca_kkmcy2.jpg',
    },
    {
      id: 'pan-de-yuca',
      title: 'Pan de yuca',
      description: 'Clásico santandereano recién salido del horno.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      poster:
        'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777689098/Logo_zapatoca_kkmcy2.jpg',
    },
    {
      id: 'masa-madre',
      title: 'Masa madre',
      description: 'Fermentación lenta para un sabor profundo.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      poster:
        'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777689098/Logo_zapatoca_kkmcy2.jpg',
    },
    {
      id: 'horno',
      title: 'Nuestro horno',
      description: 'El corazón de la panadería, encendido desde 1998.',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      poster:
        'https://res.cloudinary.com/dadlhhv4t/image/upload/v1777689098/Logo_zapatoca_kkmcy2.jpg',
    },
  ];
}
