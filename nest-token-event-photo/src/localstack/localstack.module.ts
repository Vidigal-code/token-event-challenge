import { Module } from '@nestjs/common';
import { LocalstackService } from './localstack.service';

@Module({
    providers: [LocalstackService],
    exports: [LocalstackService],
})
export class LocalstackModule {}