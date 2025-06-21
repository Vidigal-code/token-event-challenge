import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageModule } from './image/modules/image.module';
import { AwsModule } from './aws/aws.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI),
        ImageModule,
        AwsModule,
    ],
})
export class AppModule {}