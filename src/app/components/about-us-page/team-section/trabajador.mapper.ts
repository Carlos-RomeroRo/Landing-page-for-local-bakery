import { Trabajador } from '../../../models/trabajador.model';
import { TeamMember } from './team-member.interface';

export function trabajadorToTeamMember(trabajador: Trabajador): TeamMember {
  return {
    id: String(trabajador.id),
    name: trabajador.nombre,
    role: trabajador.rol,
    description: trabajador.descripcion,
    photoUrl: trabajador.foto,
  };
}
