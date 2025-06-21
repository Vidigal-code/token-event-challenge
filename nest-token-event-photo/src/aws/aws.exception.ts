import { HttpException } from '@nestjs/common';

/**
 * Custom exception for AWS-related errors, extending NestJS HttpException.
 */
export class AwsException extends HttpException {
  /**
   * Creates an instance of AwsException.
   * @param message - The error message describing the issue.
   * @param statusCode - The HTTP status code for the response.
   */
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
  }
}

/**
 * Handles AWS SDK errors and throws an appropriate AwsException.
 * Ignores specific errors like bucket already existing.
 * @param error - The error object thrown by the AWS SDK.
 * @param action - Description of the action that failed (e.g., "Bucket creation").
 * @throws {AwsException} If the error is not ignorable.
 */
export function handleAwsError(error: any, action: string): void {
  // Ignore specific errors for bucket creation
  if (
    error.name === 'BucketAlreadyExists' ||
    error.name === 'BucketAlreadyOwnedByYou'
  ) {
    console.log(`Bucket already exists: ${action}`);
    return;
  }

  // Log and throw other errors
  console.error(`${action} failed:`, error);
  throw new AwsException(`${action} failed: ${error.message}`, 500);
}
