import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    app.use(
        cors({
            origin: process.env.API_FRONT_END || 'http://localhost:5173',
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type'],
            credentials: false,
        }),
    );

    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

    await app.listen(3000);
    logger.log('Application started on http://localhost:3000');
}
bootstrap();