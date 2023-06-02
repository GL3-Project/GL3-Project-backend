import { UserRole } from '@user/schema';

/**
 * takes in input 2 roles and verifies if the first has more priority over the second or not.
 *
 * @param {UserRole} userRole - the role to verify against `requiredRole`
 * @param {UserRole} requiredRole - the required role for challenge success
 *
 * @return {boolean} outcome - Boolean indicting whether the `userRole` meets requirement or not
 */
export const compareRoles = (
  userRole: UserRole,
  requiredRole: UserRole,
): boolean => {
  const rolesPriorities: UserRole[] = [
    UserRole.admin,
    UserRole.staff,
    UserRole.participant,
  ];
  const userRolePriority: number = rolesPriorities.findIndex(
    (role) => role === userRole,
  );
  const requiredRolePriority: number = rolesPriorities.findIndex(
    (role) => role === requiredRole,
  );
  return userRolePriority <= requiredRolePriority;
};
