import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';

/**
 * AwsModule is responsible for providing AWS-related services
 * such as S3, SNS, or other AWS integrations across the application.
 */
@Module({
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
