import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JweService } from './jwe.service';
import { Role } from '../utilities/roles.auth';
import { AuthMessageErrors } from '../message/errors/auth-message.errors';
import { JwtPayload } from '../utilities/authenticated-request';
import { TokenResponse } from '../utilities/interface.auth';
import {
  AUTH_REPOSITORY,
  AuthRepositoryPort,
} from '../domain/ports/auth-repository.port';
import { AuthUser } from '../domain/entities/auth-user.entity';

/**
 * Service responsible for handling authentication logic, including user creation,
 * login, token refresh, password updates, and token invalidation.
 * Integrates with a persistence port (Prisma adapter), JWT for token generation,
 * and JWE for refresh token encryption.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Initializes the AuthService with dependencies for database access,
   * JWT handling, configuration, and JWE encryption.
   * @param authRepository - Auth repository port implemented by infrastructure adapter.
   * @param jwtService - Service for generating and verifying JWT tokens.
   * @param configService - Service for accessing environment variables.
   * @param jweService - Service for encrypting and decrypting refresh tokens.
   */
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,
    private jwtService: JwtService,
    private configService: ConfigService,
    private jweService: JweService
  ) {}

  /**
   * Creates a new user with the provided credentials and generates tokens.
   * Stores a refresh token in the database for later use.
   * @param name - The user's name.
   * @param email - The user's email address.
   * @param password - The user's password (will be hashed).
   * @param role - The user's role (defaults to Role.User).
   * @returns An object containing access and refresh tokens and the created user.
   * @throws AuthMessageErrors.UserAlreadyExists if the email is already registered.
   */
  async createUser(
    name: string,
    email: string,
    password: string,
    role: string = Role.User
  ): Promise<
    TokenResponse & { user: { id: string; email: string; role: string } }
  > {
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw AuthMessageErrors.UserAlreadyExists();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const savedUser = await this.authRepository.createUser({
      name,
      email,
      passwordHash: hashedPassword,
      role,
    });

    const tokens = await this.generateTokens(savedUser);
    await this.storeRefreshToken(savedUser.id, tokens.refreshToken);
    return {
      ...tokens,
      user: { id: savedUser.id, email: savedUser.email, role: savedUser.role },
    };
  }

  /**
   * Authenticates a user with the provided credentials and generates tokens.
   * Stores a refresh token in the database for later use.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns An object containing access and refresh tokens and the authenticated user.
   * @throws AuthMessageErrors.InvalidCredentials if the email or password is incorrect.
   */
  async login(
    email: string,
    password: string
  ): Promise<
    TokenResponse & { user: { id: string; email: string; role: string } }
  > {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw AuthMessageErrors.InvalidCredentials();
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw AuthMessageErrors.InvalidCredentials();
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  /**
   * Refreshes access and refresh tokens using a valid refresh token.
   * Rotates the refresh token by invalidating the old one and storing a new one.
   * @param refreshToken - The refresh token to validate and refresh.
   * @returns New access and refresh tokens.
   * @throws AuthMessageErrors.InvalidToken if the refresh token is invalid or expired.
   * @throws AuthMessageErrors.InvalidToken if the user is not found.
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const decrypted = await this.jweService.decrypt(refreshToken);

      const payload: JwtPayload = this.jwtService.verify(decrypted);

      const hasValidToken = await this.authRepository.findValidRefreshToken({
        token: refreshToken,
        userId: payload.sub,
      });
      if (!hasValidToken) {
        throw AuthMessageErrors.InvalidToken();
      }

      const user = await this.authRepository.findUserById(payload.sub);
      if (!user) {
        throw AuthMessageErrors.InvalidToken();
      }

      await this.authRepository.invalidateRefreshToken(refreshToken);
      const newTokens = await this.generateTokens(user);
      await this.storeRefreshToken(user.id, newTokens.refreshToken);
      return newTokens;
    } catch (e) {
      this.logger.error(`Refresh token error: ${e.message}`);
      throw AuthMessageErrors.InvalidToken();
    }
  }

  /**
   * Updates a user's password after validating the old password.
   * Invalidates all existing refresh tokens for the user.
   * @param userId - The ID of the user.
   * @param oldPassword - The current password to validate.
   * @param newPassword - The new password to set.
   * @throws AuthMessageErrors.UserNotFound if the user does not exist.
   * @throws AuthMessageErrors.InvalidCredentials if the old password is incorrect.
   */
  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw AuthMessageErrors.UserNotFound();
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw AuthMessageErrors.InvalidCredentials();
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updateUserPassword(userId, hashedNewPassword);
    await this.invalidateUserTokens(userId);
  }

  /**
   * Invalidates a specific refresh token by removing it from the database.
   * @param refreshToken - The refresh token to invalidate.
   */
  async invalidateRefreshToken(refreshToken: string): Promise<void> {
    await this.authRepository.invalidateRefreshToken(refreshToken);
  }

  /**
   * Invalidates all refresh tokens for a specific user.
   * @param userId - The ID of the user whose tokens should be invalidated.
   */
  async invalidateUserTokens(userId: string): Promise<void> {
    await this.authRepository.invalidateUserTokens(userId);
  }

  /**
   * Generates access and refresh tokens for a user.
   * The access token is a JWT, and the refresh token is a JWT encrypted with JWE.
   * @param user - The user document to generate tokens for.
   * @returns An object containing the access and refresh tokens.
   */
  private async generateTokens(user: AuthUser): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessTokenExpiresIn = this.configService.get<number>(
      'JWT_EXPIRES_IN_MS',
      15 * 60 * 1000
    ); // Default: 15 minutes

    const refreshTokenExpiresIn = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRES_IN_MS',
      7 * 24 * 60 * 60 * 1000
    ); // Default: 7 days

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiresIn / 1000, // Convert to seconds for jwtService
    });

    const refreshTokenPayload = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiresIn / 1000,
    });

    const refreshToken = await this.jweService.encrypt(refreshTokenPayload);

    return { accessToken, refreshToken };
  }

  /**
   * Stores a refresh token in the database with an expiration date.
   * @param userId - The ID of the user associated with the token.
   * @param refreshToken - The refresh token to store.
   */
  private async storeRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    const refreshTokenExpiresInRaw = this.configService.get<string | number>(
      'REFRESH_TOKEN_EXPIRES_IN_MS',
      7 * 24 * 60 * 60 * 1000 // Default: 7 days
    );
    const refreshTokenExpiresIn = Number(refreshTokenExpiresInRaw);

    // Validate refreshTokenExpiresIn to prevent invalid Date creation
    if (isNaN(refreshTokenExpiresIn) || refreshTokenExpiresIn <= 0) {
      this.logger.error(
        `Invalid REFRESH_TOKEN_EXPIRES_IN_MS value: ${refreshTokenExpiresInRaw}`
      );
      throw new Error('Invalid refresh token expiration configuration');
    }

    const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);

    // Additional validation to ensure expiresAt is a valid Date
    if (isNaN(expiresAt.getTime())) {
      this.logger.error(`Generated invalid expiresAt date: ${expiresAt}`);
      throw new Error('Failed to generate valid expiration date');
    }

    await this.invalidateUserTokens(userId);
    await this.authRepository.storeRefreshToken({
      userId,
      token: refreshToken,
      expiresAt,
    });
  }
}
