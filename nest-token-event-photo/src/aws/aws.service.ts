import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  ListBucketsCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';
import { AwsException } from './aws.exception';

/**
 * Service for interacting with AWS S3, initializing an S3 client and verifying bucket accessibility.
 */
@Injectable()
export class AwsService implements OnModuleInit {
  private readonly logger = new Logger(AwsService.name);

  /** S3 client instance configured for interacting with AWS S3 or LocalStack. */
  public s3Client: S3Client;

  /** Name of the S3 bucket to use. */
  public bucketName: string;

  /**
   * Initializes the AwsService with an S3 client using environment variables.
   */
  constructor() {
    this.bucketName = process.env.S3_BUCKET || 'image-bucket';
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || 'http://localstack:4566',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
      forcePathStyle: true,
    });
    this.logger.log(
      `S3 client configured with endpoint: ${process.env.S3_ENDPOINT}, bucket: ${this.bucketName}`
    );
  }

  /**
   * Initializes the S3 client and verifies the bucket's accessibility on module initialization.
   * Retries up to a maximum number of attempts if the bucket is not available.
   * @throws {AwsException} If initialization fails after maximum retries.
   */
  async onModuleInit(): Promise<void> {
    const maxAttempts = 15;
    const retryDelay = 3000;

    for (let attempts = 1; attempts <= maxAttempts; attempts++) {
      try {
        // List all buckets to verify S3 client connectivity
        const listBucketsCommand = new ListBucketsCommand({});
        const listResponse = await this.s3Client.send(listBucketsCommand);
        this.logger.log(
          `S3 client initialized successfully. Buckets: ${JSON.stringify(listResponse.Buckets)}`
        );

        // Verify the specified bucket exists and is accessible
        const headBucketCommand = new HeadBucketCommand({
          Bucket: this.bucketName,
        });
        await this.s3Client.send(headBucketCommand);
        this.logger.log(`Bucket '${this.bucketName}' verified successfully.`);
        return;
      } catch (error) {
        this.logger.warn(
          `Initialization attempt ${attempts}/${maxAttempts} failed:`,
          {
            error: error.message,
            stack: error.stack,
            code: error.code,
            name: error.name,
          }
        );

        if (attempts === maxAttempts) {
          this.logger.error(
            `Failed to initialize S3 client or verify bucket after ${maxAttempts} retries:`,
            error
          );
          throw new AwsException(
            `S3 initialization failed: ${error.message}`,
            500
          );
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
}
