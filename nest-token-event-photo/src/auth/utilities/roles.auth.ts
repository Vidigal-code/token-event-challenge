import { SetMetadata } from '@nestjs/common';

/**
 * Enumeration of user roles available in the system.
 */
export enum Role {
  /** Administrator with elevated privileges */
  Admin = 'admin',

  /** Regular user with standard privileges */
  User = 'user',
}

/**
 * Metadata key used to store roles information on route handlers.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for accessing a route handler or controller.
 * Attaches role metadata that can be used by guards to enforce authorization.
 *
 * @param roles List of roles permitted to access the route
 * @returns A decorator function setting roles metadata
 */
export const Roles
    = (...roles: string[]) =>
    SetMetadata(ROLES_KEY, roles);
