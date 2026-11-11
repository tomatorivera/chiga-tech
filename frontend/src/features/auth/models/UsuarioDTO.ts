import type { Role } from "../../users/models/Role";

export interface UsuarioDTO {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  roles: Role[];
  permisos: string[];
}
