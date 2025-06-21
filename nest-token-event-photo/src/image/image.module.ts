import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Image, ImageSchema } from './image.schema';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { LocalstackModule } from '../localstack/localstack.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
        LocalstackModule,
    ],
    controllers: [ImageController],
    providers: [ImageService],
})
export class ImageModule {}