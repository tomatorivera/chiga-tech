import { ROLES, type Role } from "../models/Role";

export const hasMinimumRole = (userRoles: string[], minimumRole: Role): boolean => {
  const minimumWeight = ROLES.indexOf(minimumRole);
  return userRoles.some((role) => ROLES.indexOf(role as Role) >= minimumWeight);
};
