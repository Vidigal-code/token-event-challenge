import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads environment variables from .env file.
 */
dotenv.config();

/**
 * Bootstraps the NestJS application, configuring HTTP or HTTPS based on environment variables.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';
  const isLocalSSL = process.env.LOCAL_CERTIFICATE === 'true';

  let app;

  // Check if SSL certificates exist before enabling HTTPS
  const certPath = path.resolve(__dirname, '../ssl/fake.pem');
  const keyPath = path.resolve(__dirname, '../ssl/fake.key');
  const sslFilesExist = fs.existsSync(certPath) && fs.existsSync(keyPath);

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
      logger.log('Falling back to HTTP due to missing or invalid certificates');
      app = await NestFactory.create(AppModule);
    }
  } else {
    if (isLocalSSL && !sslFilesExist) {
      logger.warn(
          `SSL enabled but certificates not found at ${certPath} or ${keyPath}. Falling back to HTTP.`,
      );
    }
    app = await NestFactory.create(AppModule);
  }

  // Configure CORS
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

  // Configure global pipes and body parser
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
  );
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Start the application
  await app.listen(port, host);
  logger.log(
      `Application started on ${isLocalSSL && sslFilesExist ? 'https' : 'http'}://${host}:${port}`,
  );
}

bootstrap();