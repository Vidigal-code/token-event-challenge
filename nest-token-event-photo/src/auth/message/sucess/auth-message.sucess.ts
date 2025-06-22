import { HttpStatus } from '@nestjs/common';

/**
 * Utility class providing standardized success response messages
 * for authentication-related operations.
 */
export class AuthMessageSuccess {
  /**
   * Returns a success message for user registration.
   * @returns An object containing message and HTTP status code 201 (Created)
   */
  static UserRegistered() {
    return {
      message: 'User registered successfully',
      status: HttpStatus.CREATED,
    };
  }

  /**
   * Returns a success message for a successful login.
   * @returns An object containing message and HTTP status code 200 (OK)
   */
  static LoginSuccessful() {
    return {
      message: 'Login successful',
      status: HttpStatus.OK,
    };
  }

  /**
   * Returns a success message for a successful logout.
   * @returns An object containing message and HTTP status code 200 (OK)
   */
  static LogoutSuccessful() {
    return {
      message: 'Logout successful',
      status: HttpStatus.OK,
    };
  }

  /**
   * Returns a success message for a token refresh operation.
   * @returns An object containing message and HTTP status code 200 (OK)
   */
  static TokenRefreshed() {
    return {
      message: 'Token refreshed',
      status: HttpStatus.OK,
    };
  }

  /**
   * Returns a success message indicating the password was updated.
   * @returns An object containing message and HTTP status code 200 (OK)
   */
  static PasswordUpdated() {
    return {
      message: 'Password updated successfully',
      status: HttpStatus.OK,
    };
  }

  /**
   * Returns a welcome message for the admin panel.
   * @returns An object containing message and HTTP status code 200 (OK)
   */
  static WelcomeAdmin() {
    return {
      message: 'Welcome to admin panel',
      status: HttpStatus.OK,
    };
  }
}
