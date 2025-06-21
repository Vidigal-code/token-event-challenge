import { HttpStatus } from '@nestjs/common';

/**
 * Class for defining success messages for image-related operations.
 * Provides static methods to create standardized success responses.
 */
export class ImageMessageSuccess {
  /**
   * Creates a success response for a successful image save operation.
   * @returns An object containing the status code and success message.
   */
  static UpdatedSuccessfully() {
    return {
      statusCode: HttpStatus.OK,
      message: 'IMAGE SAVED SUCCESSFULLY TO AWS S3',
    };
  }
}