export interface ImageEntity {
  id: string;
  qrCodeId: string;
  date: string;
  time: string;
  s3Bucket: string;
  s3Key: string;
  userId: string;
  createdAt?: Date;
}
