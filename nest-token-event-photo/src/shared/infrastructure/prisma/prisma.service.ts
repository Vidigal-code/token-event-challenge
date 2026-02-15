import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';

type OutboxEventDelegate = {
  create: (args: any) => Promise<any>;
  findMany: (args: any) => Promise<any[]>;
  update: (args: any) => Promise<any>;
};

type ImageDelegate = {
  create: (args: any) => Promise<any>;
  findUnique: (args: any) => Promise<any | null>;
  findMany: (args: any) => Promise<any[]>;
  deleteMany: (args: any) => Promise<any>;
};

type UserDelegate = {
  findUnique: (args: any) => Promise<any | null>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
};

type RefreshTokenDelegate = {
  deleteMany: (args: any) => Promise<any>;
  findFirst: (args: any) => Promise<any | null>;
  create: (args: any) => Promise<any>;
};

@Injectable()
export class PrismaService implements OnModuleInit {
  private prismaClient: any;

  async onModuleInit() {
    const prismaModule = await import('@prisma/client');
    const PrismaClientCtor = (prismaModule as { PrismaClient?: any })
      .PrismaClient;

    if (!PrismaClientCtor) {
      throw new Error(
        'PrismaClient is unavailable. Run "npx prisma generate" before starting the app.'
      );
    }

    this.prismaClient = new PrismaClientCtor();
    await this.prismaClient.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.getClient().$on('beforeExit', async () => {
      await app.close();
    });
  }

  private getClient(): any {
    if (!this.prismaClient) {
      throw new Error(
        'Prisma client not initialized yet. Ensure PrismaModule is bootstrapped and onModuleInit has run.'
      );
    }
    return this.prismaClient;
  }

  getOutboxEventDelegate(): OutboxEventDelegate {
    const delegate = this.getClient().outboxEvent as
      | OutboxEventDelegate
      | undefined;

    if (!delegate) {
      throw new Error(
        'Prisma outboxEvent delegate is unavailable. Run "npx prisma generate" and ensure OutboxEvent exists in schema.prisma.'
      );
    }

    return delegate;
  }

  getImageDelegate(): ImageDelegate {
    const delegate = this.getClient().image as ImageDelegate | undefined;

    if (!delegate) {
      throw new Error(
        'Prisma image delegate is unavailable. Run "npx prisma generate" and ensure Image exists in schema.prisma.'
      );
    }

    return delegate;
  }

  getUserDelegate(): UserDelegate {
    const delegate = this.getClient().user as UserDelegate | undefined;

    if (!delegate) {
      throw new Error(
        'Prisma user delegate is unavailable. Run "npx prisma generate" and ensure User exists in schema.prisma.'
      );
    }

    return delegate;
  }

  getRefreshTokenDelegate(): RefreshTokenDelegate {
    const delegate = this.getClient().refreshToken as
      | RefreshTokenDelegate
      | undefined;

    if (!delegate) {
      throw new Error(
        'Prisma refreshToken delegate is unavailable. Run "npx prisma generate" and ensure RefreshToken exists in schema.prisma.'
      );
    }

    return delegate;
  }
}
