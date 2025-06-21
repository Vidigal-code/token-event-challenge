import { HttpException } from '@nestjs/common';

export class AwsException extends HttpException {
    constructor(message: string, statusCode: number) {
        super(message, statusCode);
    }
}

export function handleAwsError(error: any, action: string) {
    if (error.name === 'BucketAlreadyExists' || error.name === 'BucketAlreadyOwnedByYou') {
        console.log('Bucket already exists: my-bucket');
        return;
    }

    console.error(`${action} failed:`, error);
    throw new AwsException(`${action} failed: ${error.message}`, 500);
}