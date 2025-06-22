import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

// Load environment variables from .env file
dotenv.config();

/**
 * Bootstraps the NestJS application.
 * Supports HTTPS with local certificates if configured via environment variables.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  /** Define host and port from environment or use defaults */
  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';

  /** Determine whether to use local SSL certificate */
  const isLocalSSL = process.env.LOCAL_CERTIFICATE === 'true';
  const certPath = path.resolve(__dirname, '../ssl/fake.pem');
  const keyPath = path.resolve(__dirname, '../ssl/fake.key');
  const sslFilesExist = fs.existsSync(certPath) && fs.existsSync(keyPath);

  let app;

  /** Create HTTPS or HTTP app based on SSL settings */
  if (isLocalSSL && sslFilesExist) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
      app = await NestFactory.create(AppModule, { httpsOptions });
      logger.log('Started with HTTPS (local certificate)');
    } catch (error) {
      logger.error(`Failed to load SSL certificates: ${error.message}`);
      logger.log('Falling back to HTTP due to SSL error');
      app = await NestFactory.create(AppModule);
    }
  } else {
    if (isLocalSSL && !sslFilesExist) {
      logger.warn(
        `SSL is enabled, but certificates not found at ${certPath} or ${keyPath}. Falling back to HTTP.`
      );
    }
    app = await NestFactory.create(AppModule);
  }

  /** Configure CORS based on environment settings */
  const bridgeConnection = process.env.BRIDGE_CONNECTION
    ? `http://${process.env.BRIDGE_CONNECTION}`
    : undefined;
  const allowedOrigins = [
    bridgeConnection,
    process.env.API_FRONT_END || 'http://localhost:3000',
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    credentials: true, // Allow cookies in cross-origin requests
  });

  /** Apply global pipes for validation and transformation */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error if unknown properties are present
      transform: true, // Automatically transform payloads to DTO instances
    })
  );

  /** Add middleware for JSON parsing, cookies, and URL encoding */
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser());

  /** Apply security headers using Helmet */
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          styleSrc: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: false,
    })
  );

  /** Start the application */
  await app.listen(port, host);
  logger.log(
    `Application started on ${isLocalSSL && sslFilesExist ? 'https' : 'http'}://${host}:${port}`
  );
}

// Initialize the application
bootstrap();
