import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { ImageService } from '../services/image.service';
import { SaveImageDto } from '../dtos/save-image.dto';
import { SaveImageResponse } from '../message/interface.response';

/**
 * Controller for handling image-related HTTP requests.
 * Provides endpoints for saving and retrieving images associated with QR codes.
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
  async getImageByQrCodeId(@Param('qrCodeId') qrCodeId: string) {
    return this.imageService.getImageByQrCodeId(qrCodeId);
  }
}
