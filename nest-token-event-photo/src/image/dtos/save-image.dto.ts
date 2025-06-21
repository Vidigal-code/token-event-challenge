import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

/**
 * Data Transfer Object (DTO) for validating image save requests.
 * Defines the structure and validation rules for the request body when saving an image.
 */
export class SaveImageDto {
  /**
   * Unique identifier for the image.
   * Must be a non-empty string.
   */
  @IsString()
  @IsNotEmpty()
  id: string;

  /**
   * Base64-encoded image data.
   * Must be a non-empty string starting with 'data:image/<type>;base64,'.
   * @example "data:image/png;base64,iVBORw0KGgo..."
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^data:image\/\w+;base64,/, {
    message: 'Invalid base64 image format',
  })
  base64: string;

  /**
   * QR code identifier associated with the image.
   * Must be a non-empty string.
   */
  @IsString()
  @IsNotEmpty()
  qrCodeId: string;

  /**
   * Date of the image in YYYY-MM-DD format.
   * Must be a non-empty string matching the pattern.
   * @example "2025-06-20"
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Invalid date format (expected YYYY-MM-DD)',
  })
  date: string;

  /**
   * Time of the image in HH:mm:ss format.
   * Must be a non-empty string matching the pattern.
   * @example "23:00:00"
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: 'Invalid time format (expected HH:mm:ss)',
  })
  time: string;

  /**
   * Optional user identifier associated with the image.
   * If provided, must be a string. Defaults to '0' if not specified.
   * @example "user123"
   */
  @IsString()
  @IsOptional()
  userId?: string;
}
