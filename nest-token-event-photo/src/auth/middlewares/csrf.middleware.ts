import { Injectable, NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { doubleCsrf, DoubleCsrfConfigOptions } from 'csrf-csrf';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { CsrfMiddlewareError } from './csrf.middleware-message';

/**
 * Middleware to protect against CSRF attacks using the double-submit cookie method.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CsrfMiddleware.name);
  private readonly csrfProtection;

  /**
   * Initializes the CSRF middleware with necessary configuration.
   * Validates CSRF secret, JWT session, and configures CSRF behavior.
   *
   * @param configService - Service to access environment configuration
   * @param jwtService - Service to verify JWTs for session identification
   */
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService
  ) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const csrfSecret = this.configService.get<string>('CSRF_SECRET');

    /** Validate presence and strength of CSRF secret */
    if (!csrfSecret || csrfSecret.length < 32) {
      this.logger.error('CSRF_SECRET is missing or too short (< 32 chars)');
      throw new CsrfMiddlewareError(
        'Invalid CSRF_SECRET configuration',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    /** Log useful debug information about CSRF environment */
    this.logger.debug(
      `CSRF Config: production=${isProduction}, secretLength=${csrfSecret.length}`
    );

    /** Configuration options for double CSRF protection */
    const csrfConfig: DoubleCsrfConfigOptions = {
      getSecret: () => csrfSecret,
      cookieName: 'csrfToken',
      cookieOptions: {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        partitioned: isProduction,
      },
      /** Extract CSRF token from request header or body */
      getCsrfTokenFromRequest: (req: Request) => {
        const token =
          (req.headers['x-csrf-token'] as string) ||
          (req.body?.csrfToken as string);
        this.logger.debug(`Extracted CSRF token: ${token || 'none'}`);
        return token;
      },
      /** Identify session using accessToken, refreshToken, or fallback sessionId */
      getSessionIdentifier: (req: Request): string => {
        const token = req.cookies?.accessToken || req.cookies?.refreshToken;
        if (token) {
          try {
            const payload = this.jwtService.verify(token, {
              secret: this.configService.get<string>('JWT_SECRET'),
            });
            this.logger.debug(`Session ID: ${payload.sub}`);
            return payload.sub;
          } catch {
            this.logger.warn('Invalid token for session identifier');
            return 'invalid-token';
          }
        }
        const sessionId = req.cookies?.sessionId || 'temp-session-id';
        this.logger.debug(`Session ID for unauthenticated: ${sessionId}`);
        return sessionId;
      },
    };

    /** Initialize CSRF protection handlers */
    try {
      const { doubleCsrfProtection, generateCsrfToken } =
        doubleCsrf(csrfConfig);
      this.csrfProtection = { doubleCsrfProtection, generateCsrfToken };
      this.logger.debug('CSRF protection initialized successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initialize CSRF protection: ${message}`);
      throw new CsrfMiddlewareError(
        `CSRF middleware initialization failed: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Express middleware function executed on every request.
   * Sets a session cookie if needed, generates CSRF token, and validates the request.
   *
   * @param req - Incoming HTTP request
   * @param res - HTTP response
   * @param next - Function to call the next middleware
   */
  use(req: Request, res: Response, next: NextFunction) {
    try {
      /** Generate sessionId for unauthenticated users */
      if (
        !req.cookies?.accessToken &&
        !req.cookies?.refreshToken &&
        !req.cookies?.sessionId
      ) {
        const newSessionId = randomBytes(16).toString('hex');
        res.cookie('sessionId', newSessionId, {
          httpOnly: false,
          secure: this.configService.get<string>('NODE_ENV') === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        this.logger.debug(`Set sessionId cookie: ${newSessionId}`);
      }

      /** Generate CSRF token and store in res.locals */
      const csrfToken = this.csrfProtection.generateCsrfToken(req, res);
      res.locals.csrfToken = csrfToken;
      this.logger.debug(`Generated CSRF token: ${csrfToken}`);

      /** Apply double-submit CSRF protection */
      this.csrfProtection.doubleCsrfProtection(req, res, (err) => {
        if (err) {
          this.logger.error(
            `CSRF validation failed for ${req.path}: ${err.message}`
          );
          throw new CsrfMiddlewareError(`Invalid CSRF token for ${req.path}`);
        }
        next();
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'CSRF protection error';
      this.logger.error(`CSRF middleware error: ${message}`);
      next(
        error instanceof CsrfMiddlewareError
          ? error
          : new CsrfMiddlewareError(message)
      );
    }
  }
}
