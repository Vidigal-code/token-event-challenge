import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuardService } from '../services/role-guard.service';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { JweService } from '../services/jwe.service';
import { User, UserSchema } from '../../users/schemas/user.schema';
import { RefreshToken, RefreshTokenSchema } from '../../users/schemas/refresh-token.schema';
import { CsrfMiddleware } from '../middlewares/csrf.middleware';

/**
 * AuthModule is responsible for handling all authentication-related operations,
 * including JWT handling, CSRF protection, and user/refresh token schema registration.
 *
 * This module:
 * - Registers user and refresh token schemas with Mongoose
 * - Configures JWT module using environment variables
 * - Registers authentication services and controllers
 * - Applies CSRF middleware to specific auth routes
 */
@Module({
  imports: [
    /**
     * Registers MongoDB schemas for User and RefreshToken models.
     */
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),

    /**
     * Configures the JWT module with dynamic values from ConfigService.
     * Throws an error if JWT_SECRET or JWT_EXPIRES_IN is missing.
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN');
        console.log('JwtModule.registerAsync: JWT_SECRET=', secret ? 'Set' : 'Missing');
        console.log('JwtModule.registerAsync: JWT_EXPIRES_IN=', expiresIn || 'Missing');
        if (!secret || !expiresIn) {
          throw new Error('JWT_SECRET or JWT_EXPIRES_IN is missing');
        }
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),

    /**
     * Makes environment variables available across the module.
     */
    ConfigModule,
  ],

  /**
   * Registers the controller responsible for authentication endpoints.
   */
  controllers: [AuthController],

  /**
   * Registers authentication-related services and guards.
   */
  providers: [AuthService, RolesGuardService, JweService],

  /**
   * Exports services and modules to make them available in other modules.
   */
  exports: [AuthService, RolesGuardService, JwtModule],
})
export class AuthModule implements NestModule {
  /**
   * Applies CSRF middleware to protect certain auth routes.
   * Excludes endpoints like 'check' and 'csrf' that should not require CSRF validation.
   *
   * @param consumer - MiddlewareConsumer instance to apply middleware to specific routes
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(CsrfMiddleware)
        .exclude('auth/check', 'auth/csrf')
        .forRoutes('auth/register', 'auth/login', 'auth/logout', 'auth/password', 'auth/refresh');
  }
}
