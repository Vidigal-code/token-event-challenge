import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageModule } from './image/image.module';
import { LocalstackModule } from './localstack/localstack.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI),
        ImageModule,
        LocalstackModule,
    ],
})
export class AppModule {}