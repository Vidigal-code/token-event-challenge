import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { SanitizeInputInterceptor } from '../interceptors/sanitize-input.interceptor';
import { AuthService } from '../services/auth.service';
import { AuthMessageErrors } from '../message/errors/auth-message.errors';
import {
  AuthCookieUtils,
  AuthenticatedRequest,
} from '../utilities/authenticated-request';
import { Role, Roles } from '../utilities/roles.auth';
import { RolesGuardService } from '../services/role-guard.service';
import { RegisterDto } from '../../users/dtos/register.dto';
import { LoginDto } from '../../users/dtos/login.dto';
import { UpdatePasswordDto } from '../../users/dtos/update-password.dto';
import { AuthMessageSuccess } from '../message/sucess/auth-message.sucess';

/**
 * Controller responsible for handling authentication-related endpoints,
 * including user registration, login, token refresh, logout, password updates,
 * and admin panel access.
 */
@Controller('auth')
@UseInterceptors(SanitizeInputInterceptor)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  /**
   * Registers a new user with the provided credentials.
   * Sets access, refresh, and CSRF tokens in cookies upon successful registration.
   * @param registerDto - Data transfer object containing user registration details (name, email, password).
   * @param req - Express request object for generating CSRF token.
   * @param res - Express response object for setting cookies.
   * @returns Success message and user details (id, email, role).
   * @throws AuthMessageErrors.UserAlreadyExists if the email is already registered.
   */
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 300 } })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.createUser(
        registerDto.name,
        registerDto.email,
        registerDto.password
      );

    this.setTokens(res, accessToken, refreshToken);

    return {
      ...AuthMessageSuccess.UserRegistered(),
      user: { id: user._id.toString(), email: user.email, role: user.role },
      csrfToken: res.locals.csrfToken,
    };
  }

  /**
   * Authenticates a user with the provided credentials.
   * Sets access, refresh, and CSRF tokens in cookies upon successful login.
   * @param loginDto - Data transfer object containing user login details (email, password).
   * @param req - Express request object for generating CSRF token.
   * @param res - Express response object for setting cookies.
   * @returns Success message and user details (id, email, role).
   * @throws AuthMessageErrors.InvalidCredentials if the email or password is incorrect.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300 } })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(
      loginDto.email,
      loginDto.password
    );

    this.setTokens(res, accessToken, refreshToken);

    return {
      ...AuthMessageSuccess.LoginSuccessful(),
      user: { id: user._id.toString(), email: user.email, role: user.role },
      csrfToken: res.locals.csrfToken,
    };
  }

  /**
   * Refreshes the access token using a valid refresh token stored in cookies.
   * Updates cookies with new access, refresh, and CSRF tokens.
   * @param req - Express request object containing the refresh token in cookies.
   * @param res - Express response object for setting new cookies.
   * @returns Success message indicating tokens have been refreshed.
   * @throws AuthMessageErrors.NoTokenProvided if no refresh token is found in cookies.
   * @throws AuthMessageErrors.InvalidToken if the refresh token is invalid or expired.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60 } })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies?.refreshToken ?? null;
    if (!refreshToken) {
      throw AuthMessageErrors.NoTokenProvided();
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    this.setTokens(res, accessToken, newRefreshToken);

    return {
      ...AuthMessageSuccess.TokenRefreshed(),
      csrfToken: res.locals.csrfToken,
    };
  }

  /**
   * Logs out the user by invalidating the refresh token and clearing cookies.
   * @param req - Express request object containing the refresh token in cookies.
   * @param res - Express response object for clearing cookies.
   * @returns Success message indicating logout was successful.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60 } })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const refreshToken = req.cookies?.refreshToken ?? null;

    if (refreshToken) {
      try {
        await this.authService.invalidateRefreshToken(refreshToken);
      } catch (e) {
        this.logger.warn(`Invalid refresh token during logout: ${e.message}`);
      }
    }

    AuthCookieUtils.clearTokensInCookies(res, isProduction);
    res.clearCookie('csrfToken', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      partitioned: isProduction,
    });

    return AuthMessageSuccess.LogoutSuccessful();
  }

  /**
   * Updates the authenticated user's password.
   * Requires a valid JWT token and role-based authentication.
   * Sets a new CSRF token cookie after successful password update.
   * @param req - Authenticated request object containing the user's JWT payload.
   * @param updatePasswordDto - Data transfer object containing old and new passwords.
   * @param res - Express response object for setting cookies.
   * @returns Success message indicating the password was updated.
   * @throws AuthMessageErrors.InvalidCredentials if the old password is incorrect.
   * @throws AuthMessageErrors.UserNotFound if the user does not exist.
   */
  @Post('password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuardService)
  @Throttle({ default: { limit: 3, ttl: 300 } })
  async updatePassword(
    @Req() req: AuthenticatedRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.updatePassword(
      req.user.sub,
      updatePasswordDto.oldPassword,
      updatePasswordDto.newPassword
    );

    if (req.generateCsrfToken) {
      res.cookie('csrfToken', req.generateCsrfToken(), {
        httpOnly: false,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'strict',
        path: '/',
        partitioned: this.configService.get('NODE_ENV') === 'production',
      });
    } else {
      this.logger.warn('CSRF token generation not available');
    }

    return AuthMessageSuccess.PasswordUpdated();
  }

  /**
   * Provides access to the admin panel for users with the Admin role.
   * Requires a valid JWT token and Admin role.
   * @param req - Authenticated request object containing the user's JWT payload.
   * @returns Welcome message and user details from the JWT payload.
   * @throws AuthMessageErrors.NoPermission if the user lacks the Admin role.
   * @throws AuthMessageErrors.InvalidToken if the JWT is invalid or expired.
   */
  @Get('admin')
  @Roles(Role.Admin)
  @UseGuards(RolesGuardService)
  async panelAdmin(@Req() req: AuthenticatedRequest) {
    return {
      ...AuthMessageSuccess.WelcomeAdmin(),
      user: req.user,
    };
  }

  /**
   * Sets access and refresh tokens in HTTP-only cookies.
   * @param res - Express response object for setting cookies.
   * @param accessToken - JWT access token for authentication.
   * @param refreshToken - Refresh token for obtaining new access tokens.
   */
  private setTokens(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const accessTokenExpiry =
      this.configService.get<number>('JWT_EXPIRES_IN_MS');
    const refreshTokenExpiry = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRES_IN_MS'
    );

    AuthCookieUtils.clearTokensInCookies(res, isProduction);
    AuthCookieUtils.setTokensInCookies(
      res,
      accessToken,
      refreshToken,
      isProduction,
      accessTokenExpiry,
      refreshTokenExpiry
    );

    if (res.locals.csrfToken) {
      res.cookie('csrfToken', res.locals.csrfToken, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        partitioned: isProduction,
      });
    } else {
      console.warn('CSRF token not available in res.locals');
    }
  }
}
