import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuthMessageErrors } from '../message/errors/auth-message.errors';
import { JwtPayload } from '../utilities/authenticated-request';
import { ROLES_KEY } from '../utilities/roles.auth';

/**
 * RolesGuardService is a NestJS guard that enforces role-based access control.
 * It verifies a JWT from cookies and checks whether the user has the required role(s).
 */
@Injectable()
export class RolesGuardService implements CanActivate {
  private readonly logger = new Logger(RolesGuardService.name);

  /**
   * Constructor injects JwtService, Reflector, and ConfigService.
   * @param jwtService - Handles JWT verification
   * @param reflector - Used to get metadata like required roles
   * @param configService - Provides configuration variables like JWT_SECRET
   */
  constructor(
      private readonly jwtService: JwtService,
      private readonly reflector: Reflector,
      private readonly configService: ConfigService
  ) {
    this.logger.log('RolesGuardService initialized. JwtService:', !!jwtService);
  }

  /**
   * Determines whether the current request can proceed based on JWT and roles.
   * @param context - The execution context of the request
   * @returns A boolean indicating whether access is granted
   * @throws An error if token is missing, invalid, or user is not authorized
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.accessToken ?? null;

    this.logger.debug(`Extracted token from cookies: ${token || 'None'}`);

    if (!token) {
      this.logger.warn('No accessToken found in cookies');
      throw AuthMessageErrors.NoTokenProvided();
    }

    let payload: JwtPayload;

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

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = request;

    if (!user || !user.role) {
      this.logger.warn(`User or role missing in payload: ${JSON.stringify(user)}`);
      throw AuthMessageErrors.UserNotAuthenticated();
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      this.logger.warn(`User ${user.sub} lacks required role: ${requiredRoles.join(', ')}`);
    }

    return hasRole;
  }
}
