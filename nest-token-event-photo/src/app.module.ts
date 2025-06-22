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
 * This module sets up:
 * - Global configuration using `ConfigModule`
 * - MongoDB connection using `MongooseModule`
 * - Request throttling with `ThrottlerModule`
 * - Global request sanitation via `SanitizeInputInterceptor`
 * - Core feature modules like `AuthModule` and `ImageModule`
 */
@Module({
  imports: [
    /**
     * Loads environment variables and makes them globally available.
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
    }),

    /**
     * Configures and connects to MongoDB using environment variables.
     */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    /**
     * Sets up rate-limiting (throttling) based on configuration.
     */
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: parseInt(configService.get<string>('THROTTLE_TTL_SECONDS', '60'), 10),
            limit: parseInt(configService.get<string>('THROTTLE_LIMIT', '100'), 10),
          },
        ],
      }),
    }),

    /**
     * Importing custom application modules.
     */
    AuthModule,
    ImageModule,
  ],
  providers: [
    /**
     * Applies the input sanitation interceptor globally across the application.
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: SanitizeInputInterceptor,
    },
  ],
})
export class AppModule {}
