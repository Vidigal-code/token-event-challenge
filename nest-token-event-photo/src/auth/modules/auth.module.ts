import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuardService } from '../services/role-guard.service';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { JweService } from '../services/jwe.service';
import { CsrfMiddleware } from '../middlewares/csrf.middleware';
import { RegisterUserHandler } from '../application/handlers/register-user.handler';
import { LoginUserHandler } from '../application/handlers/login-user.handler';
import { UserRegisteredEventHandler } from '../application/handlers/user-registered-event.handler';
import { AUTH_REPOSITORY } from '../domain/ports/auth-repository.port';
import { PrismaAuthRepository } from '../infrastructure/repositories/prisma-auth.repository';
import { AuthOutboxRepository } from '../infrastructure/outbox/auth-outbox.repository';

const commandHandlers = [RegisterUserHandler, LoginUserHandler];
const eventHandlers = [UserRegisteredEventHandler];

/** Module for handling authentication-related functionality. */
@Module({
  imports: [
    /** Configures JWT module with dynamic secret and expiration settings. */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresInMs = configService.get<number>(
          'JWT_EXPIRES_IN_MS',
          15 * 60 * 1000
        );

        if (!secret) {
          throw new Error('JWT_SECRET is missing');
        }

        return {
          secret,
          signOptions: {
            expiresIn: Math.floor(expiresInMs / 1000),
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
    CqrsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RolesGuardService,
    JweService,
    AuthOutboxRepository,
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
    ...commandHandlers,
    ...eventHandlers,
  ],
  exports: [AuthService, RolesGuardService, JwtModule, AuthOutboxRepository],
})
export class AuthModule implements NestModule {
  /** Configures CSRF middleware for specific authentication routes, excluding the check endpoint. */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .exclude('auth/check')
      .forRoutes(
        'auth/register',
        'auth/login',
        'auth/password',
        'auth/csrf'
      );
  }
}
