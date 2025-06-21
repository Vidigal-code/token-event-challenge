import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads environment variables from the .env file.
 */
dotenv.config();

/**
 * Bootstraps the NestJS application, supporting both HTTP and HTTPS modes
 * depending on the LOCAL_CERTIFICATE environment variable.
 */
async function bootstrap() {
  /** Logger instance for application startup */
  const logger = new Logger('Bootstrap');

  /** Server port and host configuration */
  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';

  /** Flag indicating whether to use HTTPS locally */
  const isLocalSSL = process.env.LOCAL_CERTIFICATE === 'true';

  /** Nest application instance */
  let app;

  /** Paths to local SSL certificate and key files */
  const certPath = path.resolve(__dirname, '../ssl/fake.pem');
  const keyPath = path.resolve(__dirname, '../ssl/fake.key');

  /** Checks whether SSL certificate and key files exist */
  const sslFilesExist = fs.existsSync(certPath) && fs.existsSync(keyPath);

  /**
   * Creates the NestJS application with HTTPS options if SSL is enabled
   * and certificates exist. Falls back to HTTP if not.
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
   * Configures CORS to allow access from specified front-end and bridge origins.
   */
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
    allowedHeaders: ['Content-Type'],
    credentials: false,
  });

  /**
   * Registers global validation pipes to enforce DTO rules
   * and sets up body parser limits for large requests.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  /**
   * Starts the NestJS application on the configured host and port.
   */
  await app.listen(port, host);

  logger.log(
    `Application started on ${isLocalSSL && sslFilesExist ? 'https' : 'http'}://${host}:${port}`
  );
}

bootstrap();
