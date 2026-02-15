import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImageController } from '../controllers/image.controller';
import { ImageService } from '../services/image.service';
import { AwsModule } from '../../aws/aws.module';
import { AuthModule } from '../../auth/modules/auth.module';
import { IMAGE_REPOSITORY } from '../domain/ports/image-repository.port';
import { PrismaImageRepository } from '../infrastructure/repositories/prisma-image.repository';
import { ImageSavedEventHandler } from '../application/handlers/image-saved-event.handler';

/**
 * ImageModule handles image-related functionality, including:
 * - Uploading and managing images via ImageService
 * - Defining the image schema for MongoDB
 * - Exposing controller routes for image operations
 *
 * Dependencies:
 * - MongooseModule for MongoDB interaction with the Image schema
 * - AwsModule for AWS S3/image storage handling
 * - AuthModule (with forwardRef to handle circular dependency)
 */
@Module({
  imports: [
    /**
     * Imports AWS module for handling image uploads/storage via AWS services.
     */
    AwsModule,
    CqrsModule,

    /**
     * Uses forwardRef to allow circular dependency with AuthModule.
     */
    forwardRef(() => AuthModule),
  ],

  /**
   * Registers the controller that handles incoming requests for image operations.
   */
  controllers: [ImageController],

  /**
   * Provides the ImageService which contains the business logic for images.
   */
  providers: [
    ImageService,
    ImageSavedEventHandler,
    {
      provide: IMAGE_REPOSITORY,
      useClass: PrismaImageRepository,
    },
  ],

  /**
   * Exports the ImageService to be used by other modules.
   */
  exports: [ImageService],
})
export class ImageModule {}
