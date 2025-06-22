import { Injectable, NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { doubleCsrf, DoubleCsrfConfigOptions } from 'csrf-csrf';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { CsrfMiddlewareError } from './csrf.middleware-message';

/** Middleware for implementing CSRF protection. */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CsrfMiddleware.name);
  private readonly csrfProtection;

  /** Initializes the middleware with ConfigService and JwtService, setting up CSRF protection with doubleCsrf. */
  constructor(
      private configService: ConfigService,
      private jwtService: JwtService
  ) {
    const isProduction =
        this.configService.get<string>('NODE_ENV') === 'production';
    const csrfSecret = this.configService.get<string>('CSRF_SECRET');

    /** Validates the CSRF_SECRET configuration. */
    if (!csrfSecret || csrfSecret.length < 32) {
      this.logger.error('CSRF_SECRET is missing or too short (< 32 chars)');
      throw new CsrfMiddlewareError(
          'Invalid CSRF_SECRET configuration',
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    this.logger.debug(
        `CSRF Config: production=${isProduction}, secretLength=${csrfSecret.length}`
    );

    /** Configures CSRF protection settings, including token extraction and session identification. */
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
      getCsrfTokenFromRequest: (req: Request) => {
        const token =
            (req.headers['x-csrf-token'] as string) ||
            (req.body?.csrfToken as string);
        this.logger.debug(`Extracted CSRF token: ${token || 'none'}`);
        return token;
      },
      getSessionIdentifier: (req: Request): string => {
        const token = req.cookies?.accessToken || req.cookies?.refreshToken;
        this.logger.debug(`Cookies for session: ${JSON.stringify(req.cookies)}`);
        if (token) {
          try {
            const payload = this.jwtService.verify(token, {
              secret: this.configService.get<string>('JWT_SECRET'),
            });
            this.logger.debug(`Session ID from token: ${payload.sub}`);
            return payload.sub;
          } catch {
            this.logger.warn('Invalid token for session identifier');
            return 'invalid-token';
          }
        }
        const sessionId = req.cookies?.sessionId || randomBytes(16).toString('hex');
        this.logger.debug(`Session ID for unauthenticated: ${sessionId}`);
        return sessionId;
      },
    };

    /** Initializes CSRF protection with the provided configuration. */
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

  /** Applies CSRF protection to incoming requests, generating tokens and validating them. */
  use(req: Request, res: Response, next: NextFunction) {
    try {
      this.logger.debug(`Processing CSRF for path: ${req.path}`);
      /** Sets a session ID cookie for unauthenticated users if none exists. */
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

      /** Generates a CSRF token and stores it in res.locals. */
      const csrfToken = this.csrfProtection.generateCsrfToken(req, res);
      if (!csrfToken) {
        this.logger.error(`Failed to generate CSRF token; path=${req.path}, 
        cookies=${JSON.stringify(req.cookies)}`);
        throw new CsrfMiddlewareError('CSRF token generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      res.locals.csrfToken = csrfToken;
      this.logger.debug(`Generated CSRF token: ${csrfToken}`);

      /** Validates the CSRF token for the request. */
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