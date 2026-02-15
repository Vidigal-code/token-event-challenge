import { AuthUser } from '../entities/auth-user.entity';

export interface AuthRepositoryPort {
  findUserByEmail(email: string): Promise<AuthUser | null>;
  findUserById(userId: string): Promise<AuthUser | null>;
  createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: string;
  }): Promise<AuthUser>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  invalidateRefreshToken(token: string): Promise<void>;
  invalidateUserTokens(userId: string): Promise<void>;
  findValidRefreshToken(input: {
    token: string;
    userId: string;
  }): Promise<boolean>;
  storeRefreshToken(input: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<void>;
}

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');
