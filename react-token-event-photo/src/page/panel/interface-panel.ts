export interface Image {
    id: string;
    qrCodeId: string;
    date: string;
    time: string;
    s3Bucket: string;
    s3Key: string;
    userId: string;
}

export interface ImageResponse {
    images: Image[];
    statusCode: number;
    message: string;
}

export interface DeleteResponse {
    statusCode: number;
    message: string;
}