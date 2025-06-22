import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom error class for CSRF middleware-related errors.
 */
export class CsrfMiddlewareError extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.FORBIDDEN) {
    super(
      {
        statusCode: status,
        message,
        error: 'CSRF Middleware Error',
      },
      status
    );
    this.name = 'CsrfMiddlewareError';
  }
}
