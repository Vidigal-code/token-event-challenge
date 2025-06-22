import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for updating a user's password.
 */
export class UpdatePasswordDto {
  /**
   * Current password of the user.
   * Must be a non-empty string.
   */
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  /**
   * New password to replace the old one.
   * Must be a non-empty string with at least 8 characters.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;
}
