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
import { CsrfMiddlewareError } from '../middlewares/csrf.middleware-message';

@Controller('auth')
@UseInterceptors(SanitizeInputInterceptor)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
      private authService: AuthService,
      private configService: ConfigService
  ) {}

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

    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);

    this.setTokens(res, accessToken, newRefreshToken);

    return {
      ...AuthMessageSuccess.TokenRefreshed(),
      csrfToken: res.locals.csrfToken,
    };
  }

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

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    if (res.locals.csrfToken) {
      res.cookie('csrfToken', res.locals.csrfToken, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        partitioned: isProduction,
      });
    } else {
      this.logger.warn('CSRF token not available in res.locals for password update');
    }

    return AuthMessageSuccess.PasswordUpdated();
  }

  @Get('admin')
  @Roles(Role.Admin)
  @UseGuards(RolesGuardService)
  async panelAdmin(@Req() req: AuthenticatedRequest) {
    return {
      ...AuthMessageSuccess.WelcomeAdmin(),
      user: req.user,
    };
  }

  @Get('check')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @UseGuards(RolesGuardService)
  async checkAuth(@Req() req: AuthenticatedRequest) {
    return {
      authenticated: !!req.user,
      id: req.user ? req.user.sub : '0',
    };
  }

  @Get('csrf')
  @HttpCode(HttpStatus.OK)
  generateCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const csrfToken = res.locals.csrfToken;
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    if (!csrfToken) {
      this.logger.error(`CSRF token not found in res.locals; cookies: ${JSON.stringify(req.cookies)}`);
      throw new CsrfMiddlewareError('CSRF token generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      partitioned: isProduction,
    });
    return { csrfToken };
  }

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
      this.logger.warn('CSRF token not available in res.locals for setTokens');
    }
  }
}