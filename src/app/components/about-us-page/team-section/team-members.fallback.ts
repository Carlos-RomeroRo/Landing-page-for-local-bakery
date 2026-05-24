import { TeamMember } from './team-member.interface';

export const FALLBACK_TEAM_MEMBERS: TeamMember[] = [
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
