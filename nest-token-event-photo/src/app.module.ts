import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/modules/auth.module';
import { ImageModule } from './image/modules/image.module';
import { SanitizeInputInterceptor } from './auth/interceptors/sanitize-input.interceptor';
import * as path from 'path';

/**
 * The root module of the application.
 *
 * This module sets up configuration, database connection (MongoDB),
 * rate limiting, and global interceptors. It also imports feature modules
 * such as AuthModule and ImageModule to organize application logic.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: parseInt(
              configService.get<string>('THROTTLE_TTL_SECONDS', '60'),
              10
            ),
            limit: parseInt(
              configService.get<string>('THROTTLE_LIMIT', '100'),
              10
            ),
          },
        ],
      }),
    }),

    AuthModule,
    ImageModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SanitizeInputInterceptor,
    },
  ],
})
export class AppModule {}
