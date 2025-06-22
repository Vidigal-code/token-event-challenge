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

  /**
   * Creates a success response for a successful retrieval of all images.
   * @returns An object containing the status code and success message.
   */
  static RetrievedSuccessfully() {
    return {
      statusCode: HttpStatus.OK,
      message: 'IMAGES RETRIEVED SUCCESSFULLY FROM DATABASE',
    };
  }

  /**
   * Creates a success response for a successful image deletion operation.
   * @returns An object containing the status code and success message.
   */
  static DeletedSuccessfully() {
    return {
      statusCode: HttpStatus.OK,
      message: 'IMAGE DELETED SUCCESSFULLY FROM AWS S3 AND DATABASE',
    };
  }
}