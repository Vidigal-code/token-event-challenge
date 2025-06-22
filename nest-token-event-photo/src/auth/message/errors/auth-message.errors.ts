import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * A centralized utility class that contains static methods
 * for throwing common authentication-related HTTP exceptions.
 */
export class AuthMessageErrors {
  /**
   * Throws an UNAUTHORIZED error when no token is provided in the request.
   * @returns HttpException
   */
  static NoTokenProvided() {
    return new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
  }

  /**
   * Throws an UNAUTHORIZED error when the token is invalid.
   * @returns HttpException
   */
  static InvalidToken() {
    return new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
  }

  /**
   * Throws an UNAUTHORIZED error when the user is not authenticated.
   * @returns HttpException
   */
  static UserNotAuthenticated() {
    return new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  /**
   * Throws a FORBIDDEN error when the user lacks required permissions.
   * @returns HttpException
   */
  static NoPermission() {
    return new HttpException('No permission', HttpStatus.FORBIDDEN);
  }

  /**
   * Throws a BAD_REQUEST error when trying to register a user that already exists.
   * @returns HttpException
   */
  static UserAlreadyExists() {
    return new HttpException('User already exists', HttpStatus.BAD_REQUEST);
  }

  /**
   * Throws an UNAUTHORIZED error when provided credentials are invalid.
   * @returns HttpException
   */
  static InvalidCredentials() {
    return new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }

  /**
   * Throws a NOT_FOUND error when the specified user cannot be found.
   * @returns HttpException
   */
  static UserNotFound() {
    return new HttpException('User not found', HttpStatus.NOT_FOUND);
  }
}
