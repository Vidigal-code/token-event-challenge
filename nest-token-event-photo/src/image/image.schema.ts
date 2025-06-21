import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Image extends Document {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true, unique: true })
    qrCodeId: string;

    @Prop({ required: true })
    date: string;

    @Prop({ required: true })
    time: string;

    @Prop({ required: true })
    s3Bucket: string;

    @Prop({ required: true })
    s3Key: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);