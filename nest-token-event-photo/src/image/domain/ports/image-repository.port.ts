import { ImageEntity } from '../entities/image.entity';

export interface ImageRepositoryPort {
  createImage(input: Omit<ImageEntity, 'createdAt'>): Promise<ImageEntity>;
  findImageByQrCodeId(qrCodeId: string): Promise<ImageEntity | null>;
  findAllImages(): Promise<ImageEntity[]>;
  findImagesByUserId(userId: string): Promise<ImageEntity[]>;
  deleteImageByQrCodeId(qrCodeId: string): Promise<void>;
  deleteImageByQrCodeIdAndUserId(
    qrCodeId: string,
    userId: string
  ): Promise<void>;
}

export const IMAGE_REPOSITORY = Symbol('IMAGE_REPOSITORY');
