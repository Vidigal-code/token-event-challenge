import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ImageService } from '../services/image.service';
import { SaveImageDto } from '../dtos/save-image.dto';
import { SaveImageResponse } from '../message/interface.response';
import { Throttle } from '@nestjs/throttler';
import { ImageMessageSuccess } from '../message/sucess/image-message-sucess';
import { Role, Roles } from '../../auth/utilities/roles.auth';
import { RolesGuardService } from '../../auth/services/role-guard.service';
import { AuthenticatedRequest } from '../../auth/utilities/authenticated-request';

/**
 * Controller for handling image-related HTTP requests.
 * Provides endpoints for saving, retrieving, and deleting images associated with QR codes,
 * as well as retrieving all image metadata for admin users and user-specific images.
 */
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * Saves an image to S3 and its metadata to MongoDB.
   * @param body - The image data, including base64 content and metadata.
   * @returns A promise resolving to the saved image metadata and success message.
   * @throws BadRequestException - If the input data is invalid (e.g., missing fields, invalid base64, date, or time format).
   * @throws InternalServerErrorException - If the S3 upload or MongoDB save fails.
   */
  @Post()
  @Throttle({ default: { limit: 3, ttl: 300 } })
  async saveImage(
      @Body(ValidationPipe) body: SaveImageDto
  ): Promise<SaveImageResponse> {
    return this.imageService.saveImage(body);
  }

  /**
   * Retrieves an image from S3 by its QR code ID.
   * @param qrCodeId - The QR code ID associated with the image.
   * @returns A promise resolving to the image as a base64-encoded string.
   * @throws BadRequestException - If qrCodeId is missing.
   * @throws NotFoundException - If no image metadata is found for the qrCodeId.
   * @throws InternalServerErrorException - If the S3 retrieval fails.
   */
  @Get('qr/:qrCodeId')
  @Throttle({ default: { limit: 3, ttl: 300 } })
  async getImageByQrCodeId(@Param('qrCodeId') qrCodeId: string) {
    return this.imageService.getImageByQrCodeId(qrCodeId);
  }

  /**
   * Retrieves all image metadata from MongoDB.
   * Restricted to users with the Admin role.
   * @returns A promise resolving to an array of all image metadata in JSON format.
   * @throws NotFoundException - If no images are found in the database.
   * @throws UnauthorizedException - If the user lacks the Admin role.
   * @throws InternalServerErrorException - If the database query fails.
   */
  @Get('all')
  @Throttle({ default: { limit: 3, ttl: 300 } })
  @Roles(Role.Admin)
  @UseGuards(RolesGuardService)
  async getAllImages() {
    const images = await this.imageService.getAllImages();
    return {
      images,
      statusCode: ImageMessageSuccess.RetrievedSuccessfully().statusCode,
      message: ImageMessageSuccess.RetrievedSuccessfully().message,
    };
  }

  /**
   * Deletes an image from S3 and its metadata from MongoDB by QR code ID.
   * Restricted to users with the Admin role.
   * @param qrCodeId - The QR code ID associated with the image to delete.
   * @returns A promise resolving to a success message.
   * @throws BadRequestException - If qrCodeId is missing.
   * @throws NotFoundException - If no image metadata is found for the qrCodeId.
   * @throws UnauthorizedException - If the user lacks the Admin role.
   * @throws InternalServerErrorException - If the S3 deletion or MongoDB operation fails.
   */
  @Delete('qr/:qrCodeId')
  @Throttle({ default: { limit: 3, ttl: 300 } })
  @Roles(Role.Admin)
  @UseGuards(RolesGuardService)
  async deleteImageByQrCodeId(@Param('qrCodeId') qrCodeId: string) {
    await this.imageService.deleteImageByQrCodeId(qrCodeId);
    return {
      statusCode: ImageMessageSuccess.DeletedSuccessfully().statusCode,
      message: ImageMessageSuccess.DeletedSuccessfully().message,
    };
  }

  /**
   * Retrieves all image metadata from MongoDB associated with the authenticated user's ID.
   * Restricted to users with the User role.
   * @param req - Authenticated request object containing the user's JWT payload.
   * @returns A promise resolving to an array of image metadata in JSON format for the user's ID.
   * @throws NotFoundException - If no images are found for the user's ID.
   * @throws UnauthorizedException - If the user lacks the User role.
   * @throws InternalServerErrorException - If the database query fails.
   */
  @Get('user')
  @Throttle({ default: { limit: 3, ttl: 300 } })
  @Roles(Role.User)
  @UseGuards(RolesGuardService)
  async getUserImages(@Req() req: AuthenticatedRequest) {
    const images = await this.imageService.getImagesByUserId(req.user.sub);
    return {
      images,
      statusCode: ImageMessageSuccess.RetrievedSuccessfully().statusCode,
      message: ImageMessageSuccess.RetrievedSuccessfully().message,
    };
  }

  /**
   * Deletes an image from S3 and its metadata from MongoDB by QR code ID, if it belongs to the authenticated user.
   * Restricted to users with the User role.
   * @param qrCodeId - The QR code ID associated with the image to delete.
   * @param req - Authenticated request object containing the user's JWT payload.
   * @returns A promise resolving to a success message.
   * @throws BadRequestException - If qrCodeId is missing.
   * @throws NotFoundException - If no image metadata is found for the qrCodeId.
   * @throws UnauthorizedException - If the user lacks the User role or does not own the image.
   * @throws InternalServerErrorException - If the S3 deletion or MongoDB operation fails.
   */
  @Delete('user/qr/:qrCodeId')
  @Throttle({ default: { limit: 3, ttl: 300 } })
  @Roles(Role.User)
  @UseGuards(RolesGuardService)
  async deleteUserImageByQrCodeId(
      @Param('qrCodeId') qrCodeId: string,
      @Req() req: AuthenticatedRequest
  ) {
    await this.imageService.deleteImageByQrCodeIdAndUserId(qrCodeId, req.user.sub);
    return {
      statusCode: ImageMessageSuccess.DeletedSuccessfully().statusCode,
      message: ImageMessageSuccess.DeletedSuccessfully().message,
    };
  }
}