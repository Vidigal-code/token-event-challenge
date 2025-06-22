import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object for user login.
 * Validates that email and password are provided.
 */
export class LoginDto {
  /**
   * User's email address.
   * Must be a valid email format and not empty.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * User's password.
   * Must be a non-empty string.
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
