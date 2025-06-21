import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Mongoose schema class for image metadata.
 * Defines the structure of image documents stored in MongoDB.
 */
@Schema()
export class Image {
  /**
   * Unique identifier for the image.
   * Must be a non-empty string.
   * @example "test-id"
   */
  @Prop({ required: true })
  id: string;

  /**
   * QR code identifier associated with the image.
   * Must be a non-empty string.
   * @example "test-qr"
   */
  @Prop({ required: true })
  qrCodeId: string;

  /**
   * Date the image was captured, in YYYY-MM-DD format.
   * Must be a non-empty string.
   * @example "2025-06-20"
   */
  @Prop({ required: true })
  date: string;

  /**
   * Time the image was captured, in HH:mm:ss format.
   * Must be a non-empty string.
   * @example "23:00:00"
   */
  @Prop({ required: true })
  time: string;

  /**
   * Name of the S3 bucket where the image is stored.
   * Must be a non-empty string.
   * @example "image-bucket"
   */
  @Prop({ required: true })
  s3Bucket: string;

  /**
   * S3 key (path) of the image in the bucket.
   * Must be a non-empty string.
   * @example "test-qr/<uuid>.png"
   */
  @Prop({ required: true })
  s3Key: string;

  /**
   * User identifier associated with the image.
   * Defaults to '0' if not provided.
   * @example "user123"
   */
  @Prop({ default: '0' })
  userId: string;
}

/**
 * Type definition for the Image document in MongoDB.
 * Combines the Image class with Mongoose Document properties (e.g., _id, __v).
 */
export type ImageDocument = Image & Document;

/**
 * Mongoose schema for the Image class.
 * Used to create and manage Image documents in MongoDB.
 */
export const ImageSchema = SchemaFactory.createForClass(Image);
