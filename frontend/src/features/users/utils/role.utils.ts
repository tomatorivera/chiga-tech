import { ROLES, type Role } from "../models/Role";

export const hasMinimumRole = (userRoles: Role[], minimumRole: Role): boolean => {
  const minimumWeight = ROLES.indexOf(minimumRole);
  return userRoles.some((role) => ROLES.indexOf(role) >= minimumWeight);
};
