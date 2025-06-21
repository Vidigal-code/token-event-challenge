import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image } from './image.schema';
import { LocalstackService } from '../localstack/localstack.service';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import { Logger } from '@nestjs/common';

@Injectable()
export class ImageService {
    private readonly logger = new Logger(ImageService.name);

    constructor(
        @InjectModel(Image.name) private imageModel: Model<Image>,
        private localstackService: LocalstackService,
    ) {
        if (!this.localstackService.s3Client || !this.localstackService.bucketName) {
            throw new InternalServerErrorException('LocalstackService is not properly initialized');
        }
        this.logger.log(`ImageService initialized with bucket: ${this.localstackService.bucketName}`);
    }

    async saveImage(
        id: string,
        base64: string,
        qrCodeId: string,
        date: string,
        time: string,
    ): Promise<Image> {

        if (!id || !base64 || !qrCodeId || !date || !time) {
            throw new BadRequestException('All fields (id, base64, qrCodeId, date, time) are required');
        }

        const base64Regex = /^data:image\/\w+;base64,/;
        if (!base64Regex.test(base64)) {
            throw new BadRequestException('Invalid base64 image format');
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
        if (!dateRegex.test(date) || !timeRegex.test(time)) {
            throw new BadRequestException('Invalid date or time format');
        }

        const s3Key = `${qrCodeId}/${uuidv4()}.png`;
        const bucketName = this.localstackService.bucketName;

        const buffer = Buffer.from(base64.replace(base64Regex, ''), 'base64');

        const uploadCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: buffer,
            ContentType: 'image/png',
        });

        let attempts = 0;
        const maxAttempts = 10;
        const retryDelay = 3000;
        while (attempts < maxAttempts) {
            try {
                await this.localstackService.s3Client.send(uploadCommand);
                this.logger.log(`Successfully uploaded image to S3: ${s3Key}`);
                break;
            } catch (error) {
                attempts++;
                if (attempts === maxAttempts) {
                    this.logger.error(`S3 Upload Error after ${maxAttempts} retries:`, error);
                    throw new InternalServerErrorException('Failed to upload image to S3 after retries');
                }
                this.logger.warn(`S3 Upload Error (Attempt ${attempts}/${maxAttempts}):`, error);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
        }

        const newImage = new this.imageModel({
            id,
            qrCodeId,
            date,
            time,
            s3Bucket: bucketName,
            s3Key,
        });

        return newImage.save();
    }

    async getImageByQrCodeId(qrCodeId: string): Promise<{ base64: string }> {
        if (!qrCodeId) {
            throw new BadRequestException('qrCodeId is required');
        }

        const imageMetadata = await this.imageModel.findOne({ qrCodeId }).exec();

        if (!imageMetadata) {
            throw new NotFoundException('Image metadata not found');
        }

        const getObjectCommand = new GetObjectCommand({
            Bucket: imageMetadata.s3Bucket,
            Key: imageMetadata.s3Key,
        });

        try {
            const s3Object = await this.localstackService.s3Client.send(getObjectCommand);
            const streamBody = s3Object.Body as Readable;

            const chunks: Uint8Array[] = [];
            for await (const chunk of streamBody) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }

            const buffer = Buffer.concat(chunks);
            this.logger.log(`Successfully retrieved image from S3: ${imageMetadata.s3Key}`);
            return { base64: `data:image/png;base64,${buffer.toString('base64')}` };
        } catch (error) {
            this.logger.error('S3 GetObject Error:', error);
            throw new InternalServerErrorException('Failed to retrieve image from S3');
        }
    }
}