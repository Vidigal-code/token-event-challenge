import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuthMessageErrors } from '../message/errors/auth-message.errors';
import { JwtPayload } from '../utilities/authenticated-request';
import { ROLES_KEY } from '../utilities/roles.auth';

/**
 * Guard that handles role-based authorization.
 *
 * It extracts the JWT from cookies, verifies it, and checks if the user
 * has the necessary role(s) to access the route, based on metadata set with the `@Roles()` decorator.
 */
@Injectable()
export class RolesGuardService implements CanActivate {
  private readonly logger = new Logger(RolesGuardService.name);

  /**
   * Constructor for RolesGuardService.
   *
   * @param jwtService - Service to verify JWT tokens.
   * @param reflector - Utility to get metadata set by decorators like @Roles().
   * @param configService - Service to access environment variables (e.g., JWT secret).
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {}

  /**
   * Determines whether the current request is authorized to proceed.
   *
   * @param context - The execution context containing the request.
   * @returns A boolean indicating whether access is allowed.
   * @throws Custom errors for missing or invalid tokens, or lack of authorization.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.accessToken ?? null;

    this.logger.debug(`Extracted token from cookies: ${token || 'None'}`);

    // If no token is found, deny access
    if (!token) {
      this.logger.warn('No accessToken found in cookies');
      throw AuthMessageErrors.NoTokenProvided();
    }

    let payload: JwtPayload;

    // Verify JWT token and attach the payload to the request
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      this.logger.debug(`JWT payload: ${JSON.stringify(payload)}`);
      request.user = payload;
    } catch (e) {
      this.logger.error(`JWT verification failed: ${e.message}`, e.stack);
      throw AuthMessageErrors.InvalidToken();
    }

    // Get required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const { user } = request;

    // Ensure user exists and has a role
    if (!user || !user.role) {
      this.logger.warn(
        `User or role missing in payload: ${JSON.stringify(user)}`
      );
      throw AuthMessageErrors.UserNotAuthenticated();
    }

    // Check if user role matches one of the required roles
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      this.logger.warn(
        `User ${user.sub} lacks required role: ${requiredRoles.join(', ')}`
      );
    }

    return hasRole;
  }
}
