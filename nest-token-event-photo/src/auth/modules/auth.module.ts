import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuardService } from '../services/role-guard.service';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { JweService } from '../services/jwe.service';
import { User, UserSchema } from '../../users/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../../users/schemas/refresh-token.schema';
import { CsrfMiddleware } from '../middlewares/csrf.middleware';

/**
 * The authentication module of the application.
 *
 * This module handles:
 * - JWT configuration and token management
 * - User and refresh token persistence via Mongoose
 * - Role-based authorization
 * - CSRF protection middleware setup for authentication-related routes
 */
@Module({
  imports: [
    /**
     * Registers the User and RefreshToken schemas with Mongoose.
     */
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),

    /**
     * Configures the JWT module using async options from environment variables.
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),

    /**
     * Loads the configuration module for environment variable access.
     */
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RolesGuardService, JweService],
  exports: [AuthService, RolesGuardService],
})
export class AuthModule implements NestModule {
  /**
   * Applies CSRF protection middleware to selected authentication routes.
   *
   * @param consumer - The middleware consumer used to apply middleware to routes.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .forRoutes(
        'auth/register',
        'auth/login',
        'auth/logout',
        'auth/password',
        'auth/refresh'
      );
  }
}
