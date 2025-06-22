import { HttpStatus } from '@nestjs/common';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

/**
 * Custom exception class for image-related operations.
 * Provides static methods to create standardized HTTP exceptions for various error scenarios.
 */
export class ImageMessageException {
  /**
   * Creates an exception for a missing required field.
   * @param field - The name of the missing field.
   * @returns A BadRequestException with a message indicating the missing field.
   */
  static MissingField(field: string) {
    return new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Missing required field: ${field}`,
    });
  }

  /**
   * Creates an exception for an invalid base64 image format.
   * @returns A BadRequestException with a message indicating the invalid base64 format.
   */
  static InvalidBase64Format() {
    return new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid base64 image format',
    });
  }

  /**
   * Creates an exception for an invalid date or time format.
   * @returns A BadRequestException with a message indicating the expected formats (YYYY-MM-DD for date, HH:mm:ss for time).
   */
  static InvalidDateOrTime() {
    return new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid date or time format (expected YYYY-MM-DD and HH:mm:ss)',
    });
  }

  /**
   * Creates an exception for a failed S3 upload operation.
   * @returns An InternalServerErrorException with a message indicating the upload failure after multiple retries.
   */
  static S3UploadFailed() {
    return new InternalServerErrorException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to upload image to S3 after multiple retries',
    });
  }

  /**
   * Creates an exception for a missing required field (alternative to MissingField).
   * @param field - The name of the missing field.
   * @returns A BadRequestException with a message indicating the missing field.
   */
  static ImageBadRequest(field: string) {
    return new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Missing required field: ${field}`,
    });
  }

  /**
   * Creates an exception for a missing QR code ID.
   * @returns A BadRequestException with a message indicating that qrCodeId is required.
   */
  static MissingQrCodeId() {
    return new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'qrCodeId is required',
    });
  }

  /**
   * Creates an exception when image metadata is not found for a given QR code ID.
   * @param qrCodeId - The QR code ID that was not found.
   * @returns A NotFoundException with a message indicating the missing metadata.
   */
  static ImageMetadataNotFound(qrCodeId: string) {
    return new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: `Image metadata not found for qrCodeId: ${qrCodeId}`,
    });
  }

  /**
   * Creates an exception for a failed S3 image retrieval operation.
   * @param key - The S3 key of the image that could not be retrieved.
   * @returns An InternalServerErrorException with a message indicating the retrieval failure.
   */
  static S3RetrievalFailed(key: string) {
    return new InternalServerErrorException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Failed to retrieve image from S3 for key: ${key}`,
    });
  }

  /**
   * Creates an exception when no images are found in the database.
   * @returns A NotFoundException with a message indicating no images were found.
   */
  static NoImagesFound() {
    return new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'No images found in the database',
    });
  }

  /**
   * Creates an exception for a failed database query operation.
   * @returns An InternalServerErrorException with a message indicating the database query failure.
   */
  static DatabaseQueryFailed() {
    return new InternalServerErrorException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to query images from the database',
    });
  }

  /**
   * Creates an exception for a failed S3 image deletion operation.
   * @param key - The S3 key of the image that could not be deleted.
   * @returns An InternalServerErrorException with a message indicating the deletion failure.
   */
  static S3DeletionFailed(key: string) {
    return new InternalServerErrorException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Failed to delete image from S3 for key: ${key}`,
    });
  }

  /**
   * Creates an exception for a failed database operation (e.g., deletion).
   * @returns An InternalServerErrorException with a message indicating the database operation failure.
   */
  static DatabaseOperationFailed() {
    return new InternalServerErrorException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to perform database operation',
    });
  }
}