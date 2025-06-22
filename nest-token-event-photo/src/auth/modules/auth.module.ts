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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
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
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RolesGuardService, JweService],
  exports: [AuthService, RolesGuardService, JwtModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(CsrfMiddleware)
        .exclude('auth/check')
        .forRoutes('auth/register', 'auth/login', 'auth/logout', 'auth/password', 'auth/refresh', 'auth/csrf');
  }
}