// El orden de los roles actúa como el peso de los mismos
// Más abajo en el enum = mayor jerarquía
export const ROLES = ["Vendedor", "Supervisor", "Administrador", "Dueño"] as const;

export type Role = (typeof ROLES)[number];
