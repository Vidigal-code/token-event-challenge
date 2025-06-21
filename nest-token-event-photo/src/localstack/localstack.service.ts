import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class LocalstackService {
    public readonly s3Client: S3Client;
    public readonly bucketName: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('S3_BUCKET');
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION'),
            endpoint: this.configService.get<string>('S3_ENDPOINT'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
            },
            forcePathStyle: true,
        });
    }
}