import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Type definition for the RefreshToken Mongoose document.
 * Combines the RefreshToken class with Mongoose's Document interface.
 */
export type RefreshTokenDocument = RefreshToken & Document;

/**
 * Mongoose schema for storing refresh tokens associated with users.
 * Used for token rotation and validation in the authentication system.
 * Includes timestamps for creation and update tracking.
 */
@Schema({ timestamps: true })
export class RefreshToken {
  /**
   * The ID of the user associated with the refresh token.
   * Stored as a string (converted from ObjectId) for compatibility.
   */
  @Prop({ required: true, type: String })
  userId: string;

  /**
   * The refresh token string, encrypted with JWE.
   */
  @Prop({ required: true })
  token: string;

  /**
   * The expiration date and time of the refresh token.
   * Must be a valid Date object.
   */
  @Prop({
    required: true,
    type: Date,
    validate: {
      validator: (value: Date) =>
        value instanceof Date && !isNaN(value.getTime()),
      message: 'expiresAt must be a valid Date',
    },
  })
  expiresAt: Date;
}

/**
 * Mongoose schema generated for the RefreshToken class.
 * Used by MongooseModule to register the schema in the AuthModule.
 */
export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
