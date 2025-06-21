import { ImageDocument } from '../schemas/image.schema';
import { HttpStatus } from '@nestjs/common';

/**
 * Interface for the response of a successful image save operation.
 * Defines the structure of the response returned by the saveImage endpoint.
 */
export interface SaveImageResponse {
  /**
   * The saved image document from MongoDB.
   */
  image: ImageDocument;

  /**
   * The HTTP status code of the response.
   * Typically HttpStatus.OK (200) for successful operations.
   */
  statusCode: HttpStatus;

  /**
   * A message describing the result of the operation.
   * @example "IMAGE SAVED SUCCESSFULLY TO AWS S3"
   */
  message: string;
}
