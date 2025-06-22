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
 *
 * This function sets up:
 * - HTTPS with local SSL if configured
 * - CORS with specific allowed origins
 * - Global validation pipes
 * - Middleware for security and body parsing
 * - Logging to indicate startup mode and port
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  /** Define host and port from environment or use defaults */
  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';

  /** Determine whether to use local SSL certificate */
  const isLocalSSL = process.env.LOCAL_CERTIFICATE === 'true';
  const certPath = path.resolve(__dirname, '../ssl/fake.pem');
  const keyPath = path.resolve(__dirname, '../ssl/fake-key.pem');
  const sslFilesExist = fs.existsSync(certPath) && fs.existsSync(keyPath);

  let app;

  /**
   * Create an HTTPS app if SSL is enabled and cert files exist,
   * otherwise fall back to HTTP.
   */
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



  /**
   * Enables Cross-Origin Resource Sharing (CORS) for the application.
   *
   * This configuration:
   * - Allows requests from the frontend defined in the `API_FRONT_END` environment variable
   * - Permits specific HTTP methods: GET, POST, OPTIONS, DELETE
   * - Allows only specific headers: 'Content-Type' and 'X-CSRF-Token'
   * - Enables credentials (cookies, authorization headers, etc.) to be sent in cross-origin requests
   */
  app.enableCors({
    origin: process.env.API_FRONT_END,
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    credentials: true,
  });


  /**
   * Apply global validation and transformation for incoming requests.
   */
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Remove unknown properties
        forbidNonWhitelisted: true, // Throw error on unknown properties
        transform: true, // Auto-convert payloads to DTOs
      })
  );

  /**
   * Add body parsing middleware for JSON and URL-encoded forms.
   */
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  /**
   * Enable cookie parsing for incoming requests.
   */
  app.use(cookieParser());

  /**
   * Apply security best practices via Helmet headers.
   */
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

  /** Start the application and log the running protocol and address */
  await app.listen(port, host);
  logger.log(
      `Application started on ${isLocalSSL && sslFilesExist ? 'https' : 'http'}://${host}:${port}`
  );
}

// Initialize the application
bootstrap();