import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * Data Transfer Object for user registration.
 * Ensures that name, email, and password are valid and meet criteria.
 */
export class RegisterDto {
  /**
   * User's full name.
   * Must be a non-empty string.
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * User's email address.
   * Must be a valid email format and not empty.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * User's password.
   * Must be a non-empty string with minimum length of 8 characters,
   * containing at least one uppercase letter, one special character, and one number.
   * @example 'TestAAA1#'
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Password must contain at least one uppercase letter, one number, and one special character',
  })
  password: string;
}
