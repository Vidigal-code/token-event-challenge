import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image, ImageDocument } from '../schemas/image.schema';
import { AwsService } from '../../aws/aws.service';
import {
  PutObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import { Logger } from '@nestjs/common';
import { SaveImageDto } from '../dtos/save-image.dto';
import { ImageMessageException } from '../message/errors/image-message-errors';
import { ImageMessageSuccess } from '../message/sucess/image-message-sucess';
import { SaveImageResponse } from '../message/interface.response';

/**
 * Service for managing image operations.
 * Handles saving images to S3 and MongoDB, and retrieving images from S3 by QR code ID.
 */
@Injectable()
export class ImageService {
  /**
   * Logger instance for logging service operations and errors.
   */
  private readonly logger = new Logger(ImageService.name);

  /**
   * Constructs the ImageService with required dependencies.
   * @param imageModel - Mongoose model for the Image schema.
   * @param localstackService - AWS service for interacting with S3 (LocalStack).
   * @throws InternalServerErrorException - If AwsService is not properly initialized.
   */
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private localstackService: AwsService
  ) {
    if (
      !this.localstackService.s3Client ||
      !this.localstackService.bucketName
    ) {
      throw new InternalServerErrorException(
        'AwsService is not properly initialized'
      );
    }
    this.logger.log(
      `ImageService initialized with bucket: ${this.localstackService.bucketName}`
    );
  }

  /**
   * Saves an image to S3 and its metadata to MongoDB.
   * @param data - The image data, including base64 content and metadata.
   * @returns A promise resolving to the saved image metadata and success message.
   * @throws BadRequestException - If the base64 format, date, or time is invalid.
   * @throws InternalServerErrorException - If the S3 upload or MongoDB save fails.
   */
  async saveImage(data: SaveImageDto): Promise<SaveImageResponse> {
    const { id, base64, qrCodeId, date, time, userId = '0' } = data;

    const base64Regex = /^data:image\/\w+;base64,/;
    if (!base64Regex.test(base64)) {
      throw ImageMessageException.InvalidBase64Format();
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!dateRegex.test(date) || !timeRegex.test(time)) {
      throw ImageMessageException.InvalidDateOrTime();
    }

    const s3Key = `${qrCodeId}/${uuidv4()}.png`;
    const bucketName = this.localstackService.bucketName;
    const buffer = Buffer.from(base64.replace(base64Regex, ''), 'base64');

    await this.ensureBucketExists(bucketName);

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
        this.logger.log(
          `Successfully uploaded image to S3: ${bucketName}/${s3Key}`
        );
        break;
      } catch (error) {
        attempts++;
        this.logger.warn(
          `S3 Upload Error (Attempt ${attempts}/${maxAttempts} for ${bucketName}/${s3Key}):`,
          error
        );
        if (attempts === maxAttempts) {
          this.logger.error(
            `S3 Upload Error after ${maxAttempts} retries:`,
            error
          );
          throw ImageMessageException.S3UploadFailed();
        }
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
      userId,
    });

    const savedImage = await newImage.save();

    return {
      image: savedImage,
      statusCode: ImageMessageSuccess.UpdatedSuccessfully().statusCode,
      message: ImageMessageSuccess.UpdatedSuccessfully().message,
    };
  }

  /**
   * Ensures the specified S3 bucket exists, creating it if necessary.
   * @param bucketName - The name of the S3 bucket to check or create.
   * @throws InternalServerErrorException - If bucket verification or creation fails.
   */
  private async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      const listBuckets = await this.localstackService.s3Client.send(
        new ListBucketsCommand({})
      );
      const bucketExists = listBuckets.Buckets?.some(
        (b) => b.Name === bucketName
      );
      if (!bucketExists) {
        this.logger.log(`Creating bucket ${bucketName}`);
        await this.localstackService.s3Client.send(
          new CreateBucketCommand({ Bucket: bucketName })
        );
        this.logger.log(`Bucket ${bucketName} created successfully`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to verify or create bucket ${bucketName}:`,
        error
      );
      throw ImageMessageException.S3UploadFailed();
    }
  }

  /**
   * Retrieves an image from S3 by its QR code ID.
   * @param qrCodeId - The QR code ID associated with the image.
   * @returns A promise resolving to the image as a base64-encoded string.
   * @throws BadRequestException - If qrCodeId is missing.
   * @throws NotFoundException - If no image metadata is found for the qrCodeId.
   * @throws InternalServerErrorException - If the S3 retrieval fails.
   */
  async getImageByQrCodeId(qrCodeId: string): Promise<{ base64: string }> {
    if (!qrCodeId) {
      throw ImageMessageException.MissingQrCodeId();
    }

    const imageMetadata = await this.imageModel.findOne({ qrCodeId }).exec();

    if (!imageMetadata) {
      throw ImageMessageException.ImageMetadataNotFound(qrCodeId);
    }

    await this.ensureBucketExists(imageMetadata.s3Bucket);

    const getObjectCommand = new GetObjectCommand({
      Bucket: imageMetadata.s3Bucket,
      Key: imageMetadata.s3Key,
    });

    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 2000;

    while (attempts < maxAttempts) {
      try {
        const s3Object =
          await this.localstackService.s3Client.send(getObjectCommand);
        const streamBody = s3Object.Body as Readable;

        const chunks: Uint8Array[] = [];
        for await (const chunk of streamBody) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }

        const buffer = Buffer.concat(chunks);
        this.logger.log(
          `Successfully retrieved image from S3: ${imageMetadata.s3Key}`
        );
        return { base64: `data:image/png;base64,${buffer.toString('base64')}` };
      } catch (error) {
        attempts++;
        this.logger.warn(
          `S3 GetObject Error (Attempt ${attempts}/${maxAttempts} for ${imageMetadata.s3Key}):`,
          error
        );
        if (attempts === maxAttempts) {
          this.logger.error(
            `S3 GetObject Error after ${maxAttempts} retries:`,
            error
          );
          throw ImageMessageException.S3RetrievalFailed(imageMetadata.s3Key);
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
}
