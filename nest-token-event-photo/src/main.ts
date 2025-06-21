import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {

    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';

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

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );


    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

    await app.listen(port, host);

    logger.log(`Application started on ${host}:${port}`);
}

bootstrap();
