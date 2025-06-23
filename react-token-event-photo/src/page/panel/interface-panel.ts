/**
 * Represents an image with associated metadata and storage details.
 */
export interface Image {
    /** Unique identifier for the image */
    id: string;
    /** Identifier for the related QR code */
    qrCodeId: string;
    /** Date when the image was created or uploaded (ISO format) */
    date: string;
    /** Time when the image was created or uploaded (ISO format or HH:mm:ss) */
    time: string;
    /** Name of the AWS S3 bucket where the image is stored */
    s3Bucket: string;
    /** Key (path) inside the S3 bucket for the image */
    s3Key: string;
    /** Identifier of the user who owns or uploaded the image */
    userId: string;
}

/**
 * Response format for fetching multiple images.
 */
export interface ImageResponse {
    /** List of images returned from the API */
    images: Image[];
    /** HTTP status code of the response */
    statusCode: number;
    /** Message describing the result or status */
    message: string;
}

/**
 * Response format for delete operations.
 */
export interface DeleteResponse {
    /** HTTP status code of the delete operation response */
    statusCode: number;
    /** Message describing the result of the delete operation */
    message: string;
}
