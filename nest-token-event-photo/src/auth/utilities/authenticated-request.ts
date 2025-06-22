import { Request, Response } from 'express';

/**
 * Interface representing the payload stored inside a JWT.
 */
export interface JwtPayload {
  sub: string; // Subject (typically the user ID)
  email: string; // User's email address
  role: string; // User's role (e.g., 'admin', 'user')
  iat?: number; // Issued at (timestamp)
  exp?: number; // Expiration time (timestamp)
}

/**
 * Extends the Express Request object to include JWT payload, cookies, and CSRF token generator.
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload; // Decoded JWT payload
  cookies: {
    accessToken?: string;
    refreshToken?: string;
    [key: string]: string | undefined;
  };
  generateCsrfToken?: () => string; // Optional CSRF token generator method
}

/**
 * Utility class for managing authentication cookies.
 *
 * Includes methods for setting and clearing access and refresh tokens in secure HTTP cookies.
 */

export class AuthCookieUtils {
  /**
   * Sets authentication and refresh tokens in cookies.
   * @param res Express response object
   * @param accessToken JWT access token
   * @param refreshToken JWT refresh token
   * @param isProduction Whether the environment is production
   * @param accessTokenExpiry Expiry time in milliseconds for the access token
   * @param refreshTokenExpiry Expiry time in milliseconds for the refresh token
   */
  public static setTokensInCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    isProduction: boolean,
    accessTokenExpiry: number,
    refreshTokenExpiry: number
  ): void {
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : ('lax' as 'strict' | 'lax'),
      maxAge: accessTokenExpiry,
      path: '/',
      partitioned: isProduction,
    };

    // Set the access token cookie
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: accessTokenExpiry,
    });

    // Set the refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenExpiry,
    });
  }

  /**
   * Clears authentication and refresh token cookies.
   *
   * @param res - Express response object
   * @param isProduction - Flag indicating if the environment is production
   */
  public static clearTokensInCookies(
    res: Response,
    isProduction: boolean
  ): void {
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : ('lax' as 'strict' | 'lax'),
      path: '/',
      partitioned: isProduction,
    };

    // Clear the access token cookie
    res.clearCookie('accessToken', cookieOptions);

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', cookieOptions);
  }
}
