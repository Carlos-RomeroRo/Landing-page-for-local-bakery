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
      id: 'en-la-linea-pan',
      title: 'En la línea y con ganas de pan',
      description:
        '¿En dieta? Tranqui: a veces un antojo de Zapatoca es justo lo que necesitas para sonreír en la fila.',
      videoUrl:
        'https://res.cloudinary.com/dadlhhv4t/video/upload/v1778947834/Di_la_l%C3%ADnea_y_c%C3%B3ete_el_pan_Pero_estoy_a_dieta_Tranqui_eso_lo_arregla_edici%C3%B3n_La_edi_ha53f0.mp4',
    },
    {
      id: 'pudin-chocolate',
      title: 'Solo un poquito… y ya van dos',
      description:
        'Dices que será un pudín de chocolate nomás, pero uno no alcanza y dos tampoco. Así de irresistible.',
      videoUrl:
        'https://res.cloudinary.com/dadlhhv4t/video/upload/v1778947840/dices_solo_un_poquito_y_terminas_as%C3%AD_Un_pud%C3%ADn_no_es_suficiente_dos_tampoco_Chocolate_v_biyhe3.mp4',
    },
    {
      id: 'queso-crujiente',
      title: 'El sonido que todos queremos escuchar',
      description:
        'Queso derretido, masa perfecta y ese crujido que solo sale del horno de Zapatoca.',
      videoUrl:
        'https://res.cloudinary.com/dadlhhv4t/video/upload/v1778947840/El_sonido_que_todos_queremos_escuchar_Queso_derretido_masa_perfecta_y_ese_sabor_que_solo_e_u5zcbz.mp4',
    },
    {
      id: 'sabor-bizcopan',
      title: 'Sabor que se siente y se presume',
      description:
        'En Bizcopan Zapatoca cada bocado es una pequeña celebración: calidad que se nota al primer mordisco.',
      videoUrl:
        'https://res.cloudinary.com/dadlhhv4t/video/upload/v1778947839/El_sabor_que_se_siente_pero_tambi%C3%A9n_se_presume_En_Bizcopan_Zapatoca_cada_bocado_es_un_peque_mrwsai.mp4',
    },
    {
      id: 'voz-interna',
      title: 'Cuando aparece la voz interna',
      description:
        'Cero ideas, cero creatividad… hasta que el antojo de pan recién horneado te devuelve las ganas.',
      videoUrl:
        'https://res.cloudinary.com/dadlhhv4t/video/upload/v1778947838/Todos_hemos_estado_ah%C3%AD-_cero_ideas_cero_creatividad...Hasta_que_aparece_esa_voz_interna_o_vari_d3mzj9.mp4',
    },
    {
      id: 'momento-pan',
      title: 'A veces no necesito palabras',
      description:
        'Solo pan recién horneado, aroma que calma y un momento para mí. Así de simple, así de Zapatoca.',
      videoUrl:
        'https://res.cloudinary.com/dadlhhv4t/video/upload/v1778947837/A_veces_no_necesito_palabras_solo_pan_reci%C3%A9n_horneado_olor_que_calma_y_un_momento_para_m%C3%AD.My_the_i9gves.mp4',
    },
    {
      id: 'malteada-fresas',
      title: 'La malteada de tus sueños',
      description:
        'Dulce, cremosa y con el toque perfecto de fresas frescas: el acompañante ideal para endulzar tu día.',
      videoUrl:
        'https://res.cloudinary.com/dadlhhv4t/video/upload/v1778947834/La_malteada_de_tus_sue%C3%B1os_Dulce_cremosa_y_con_el_toque_perfecto_de_fresas_frescas_Nuest_ekyr3z.mp4',
    },
    {
      id: 'hey-pan-lover',
      title: 'Hey, pan lover',
      description:
        '¿Te gusta el pan? Entonces tienes que venir a la mejor panadería de Santa Marta: Panadería Zapatoca te espera.',
      videoUrl:
        'https://res.cloudinary.com/dadlhhv4t/video/upload/v1778947836/Hey_pan_lover_Te_gusta_el_pan_Entonces_tienes_que_venir_a_la_mejor_panader%C3%ADa_de_Santa_Mar_i6avyf.mp4',
    },
  ];
}
