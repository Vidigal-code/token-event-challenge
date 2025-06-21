import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Image, ImageSchema } from '../schemas/image.schema';
import { ImageController } from '../controllers/image.controller';
import { ImageService } from '../services/image.service';
import { AwsModule } from '../../aws/aws.module';

/**
 * Module for managing image-related functionality.
 * Configures the controllers, services, and database schema for handling image save and retrieval operations.
 */
@Module({
    imports: [
        MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
        AwsModule,
    ],
    controllers: [ImageController],
    providers: [ImageService],
})
export class ImageModule {}