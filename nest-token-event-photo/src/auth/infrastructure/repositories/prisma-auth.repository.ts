import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { AuthUser } from '../../domain/entities/auth-user.entity';

@Injectable()
export class PrismaAuthRepository implements AuthRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.getUserDelegate().findUnique({
      where: { email },
    });
    return user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
        }
      : null;
  }

  async findUserById(userId: string): Promise<AuthUser | null> {
    const user = await this.prisma.getUserDelegate().findUnique({
      where: { id: userId },
    });
    return user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
        }
      : null;
  }

  async createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: string;
  }): Promise<AuthUser> {
    const user = await this.prisma.getUserDelegate().create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    };
  }

  async updateUserPassword(
    userId: string,
    passwordHash: string
  ): Promise<void> {
    await this.prisma.getUserDelegate().update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async invalidateRefreshToken(token: string): Promise<void> {
    await this.prisma
      .getRefreshTokenDelegate()
      .deleteMany({ where: { token } });
  }

  async invalidateUserTokens(userId: string): Promise<void> {
    await this.prisma
      .getRefreshTokenDelegate()
      .deleteMany({ where: { userId } });
  }

  async findValidRefreshToken(input: {
    token: string;
    userId: string;
  }): Promise<boolean> {
    const token = await this.prisma.getRefreshTokenDelegate().findFirst({
      where: {
        token: input.token,
        userId: input.userId,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    return Boolean(token);
  }

  async storeRefreshToken(input: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.getRefreshTokenDelegate().create({
      data: {
        userId: input.userId,
        token: input.token,
        expiresAt: input.expiresAt,
      },
    });
  }
}
