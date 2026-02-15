import { Injectable, NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { doubleCsrf, DoubleCsrfConfigOptions } from 'csrf-csrf';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { CsrfMiddlewareError } from './csrf.middleware-message';

type RequestWithCsrfSession = Request & { _csrfSessionId?: string };

/** Middleware for implementing CSRF protection. */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CsrfMiddleware.name);
  private readonly csrfProtection;
  private readonly safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

  /** Initializes the middleware with ConfigService and JwtService, setting up CSRF protection with doubleCsrf. */
  constructor(
    private configService: ConfigService
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
        const requestWithSession = req as RequestWithCsrfSession;
        this.logger.debug(
          `Cookies for session: ${JSON.stringify(req.cookies)}`
        );
        const sessionId =
          requestWithSession._csrfSessionId ||
          req.cookies?.sessionId ||
          randomBytes(16).toString('hex');
        this.logger.debug(`Session ID for CSRF: ${sessionId}`);
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
      const requestWithSession = req as RequestWithCsrfSession;
      const requestMethod = req.method.toUpperCase();
      const originalUrl = req.originalUrl ?? '';
      const isCsrfEndpoint = originalUrl.includes('/auth/csrf');
      this.logger.debug(
        `Processing CSRF for method=${req.method} path=${req.path}`
      );
      /** Sets a session ID cookie for unauthenticated users if none exists. */
      if (!req.cookies?.accessToken && !req.cookies?.refreshToken) {
        const sessionId = req.cookies?.sessionId || randomBytes(16).toString('hex');
        requestWithSession._csrfSessionId = sessionId;

        if (!req.cookies?.sessionId) {
          res.cookie('sessionId', sessionId, {
            httpOnly: false,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
          });
          this.logger.debug(`Set sessionId cookie: ${sessionId}`);
        }
      }

      // Keep token stable across safe requests to avoid races during parallel GETs.
      const existingCsrfToken = req.cookies?.csrfToken;
      const shouldRotateCsrfToken =
        this.safeMethods.has(requestMethod) && isCsrfEndpoint;
      const csrfToken = shouldRotateCsrfToken
        ? this.csrfProtection.generateCsrfToken(req, res as Response)
        : existingCsrfToken ||
          this.csrfProtection.generateCsrfToken(req, res as Response);
      if (!csrfToken) {
        this.logger.error(
          `Failed to generate CSRF token; method=${req.method}; path=${req.path}`
        );
        throw new CsrfMiddlewareError(
          'CSRF token generation failed',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      res.locals.csrfToken = csrfToken;
      this.logger.debug('CSRF token ready');

      if (this.safeMethods.has(requestMethod)) {
        return next();
      }

      /** Validates the CSRF token only for state-changing requests. */
      this.csrfProtection.doubleCsrfProtection(req, res, (err) => {
        if (err) {
          const isProduction =
            this.configService.get<string>('NODE_ENV') === 'production';
          // Force next csrf fetch to regenerate a valid cookie/header pair.
          res.clearCookie('csrfToken', {
            httpOnly: false,
            secure: isProduction,
            sameSite: 'strict',
            path: '/',
            partitioned: isProduction,
          });
          this.logger.error(
            `CSRF validation failed for ${req.path}: ${err.message}`
          );
          return next(new CsrfMiddlewareError(`Invalid CSRF token for ${req.path}`));
        }
        return next();
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
