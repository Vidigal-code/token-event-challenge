import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, ListBucketsCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';

@Injectable()
export class LocalstackService implements OnModuleInit {
    private readonly logger = new Logger(LocalstackService.name);
    public s3Client: S3Client;
    public bucketName: string;

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
        this.logger.log(`S3 client configured with endpoint: ${process.env.S3_ENDPOINT}, bucket: ${this.bucketName}`);
    }

    async onModuleInit() {
        let attempts = 0;
        const maxAttempts = 15;
        const retryDelay = 3000;

        while (attempts < maxAttempts) {
            try {

                const listBucketsCommand = new ListBucketsCommand({});
                const listResponse = await this.s3Client.send(listBucketsCommand);
                this.logger.log(`S3 client initialized successfully. Buckets: ${JSON.stringify(listResponse.Buckets)}`);

                const headBucketCommand = new HeadBucketCommand({ Bucket: this.bucketName });
                await this.s3Client.send(headBucketCommand);
                this.logger.log(`Bucket '${this.bucketName}' verified successfully.`);

                return;
            } catch (error) {

                attempts++;
                this.logger.warn(`Initialization attempt ${attempts}/${maxAttempts} failed:`, {
                    error: error.message,
                    stack: error.stack,
                    code: error.code,
                    name: error.name,
                });
                if (attempts === maxAttempts) {
                    this.logger.error(`Failed to initialize S3 client or verify bucket after ${maxAttempts} retries:`, error);
                    throw new Error(`LocalstackService initialization failed: ${error.message}`);
                }
                await new Promise((resolve) => setTimeout(resolve, retryDelay));

            }
        }
    }
}