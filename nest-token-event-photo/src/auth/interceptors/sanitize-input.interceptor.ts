import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as sanitizeHtml from 'sanitize-html';

/**
 * Interceptor that sanitizes string inputs in the request body to prevent
 * injection attacks, such as XSS, by removing HTML tags and attributes.
 * Applied globally or per-controller to ensure secure input handling.
 */
@Injectable()
export class SanitizeInputInterceptor implements NestInterceptor {
  /**
   * Intercepts incoming HTTP requests and sanitizes string fields in the request body.
   * Uses sanitize-html to strip all HTML tags and attributes, ensuring safe input.
   * @param context - The execution context, providing access to the request object.
   * @param next - The call handler to proceed with the request after sanitization.
   * @returns An observable representing the response stream.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.body) {
      for (const key in request.body) {
        if (typeof request.body[key] === 'string') {
          request.body[key] = sanitizeHtml(request.body[key], {
            allowedTags: [], // Disallow all HTML tags
            allowedAttributes: {}, // Disallow all HTML attributes
          });
        }
      }
    }
    return next.handle();
  }
}
