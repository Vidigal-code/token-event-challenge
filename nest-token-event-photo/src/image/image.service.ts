import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image } from './image.schema';
import { LocalstackService } from '../localstack/localstack.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
    constructor(
        @InjectModel(Image.name) private imageModel: Model<Image>,
        private localstackService: LocalstackService,
    ) {}

    async saveImage(id: string, base64: string, qrCodeId: string, date: string, time: string): Promise<Image> {
        const s3Key = `${id}-${uuidv4()}.png`;
        const bucketName = this.localstackService.bucketName;

        const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const uploadCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: buffer,
            ContentType: 'image/png',
        });

        try {
            await this.localstackService.s3Client.send(uploadCommand);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to upload image to S3');
        }

        const newImage = new this.imageModel({
            id,
            base64,
            qrCodeId,
            date,
            time,
            s3Bucket: bucketName,
            s3Key,
        });

        return newImage.save();
    }

    async getImageByQrCodeId(qrCodeId: string): Promise<Image> {
        return this.imageModel.findOne({ qrCodeId }).exec();
    }
}