import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Mongoose Document type for User schema.
 */
export type UserDocument = User & Document;

/**
 * User schema representing a user in the system.
 * Automatically tracks creation and update timestamps.
 */
@Schema({ timestamps: true })
export class User {
  /**
   * User's full name.
   */
  @Prop({ required: true })
  name: string;

  /**
   * User's unique email address.
   * Indexed for faster queries and must be unique.
   */
  @Prop({ required: true, unique: true, index: true })
  email: string;

  /**
   * Hashed password for user authentication.
   */
  @Prop({ required: true })
  password: string;

  /**
   * Role of the user (e.g., 'user', 'admin').
   * Defaults to 'user' if not specified.
   */
  @Prop({ default: 'user' })
  role: string;
}

/**
 * Mongoose schema factory for User.
 */
export const UserSchema = SchemaFactory.createForClass(User);
