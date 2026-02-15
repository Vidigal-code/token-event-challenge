import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { ImageEntity } from '../../domain/entities/image.entity';
import { ImageRepositoryPort } from '../../domain/ports/image-repository.port';

@Injectable()
export class PrismaImageRepository implements ImageRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(image: {
    id: string;
    qrCodeId: string;
    date: string;
    time: string;
    s3Bucket: string;
    s3Key: string;
    userId: string | null;
    createdAt: Date;
  }): ImageEntity {
    return {
      id: image.id,
      qrCodeId: image.qrCodeId,
      date: image.date,
      time: image.time,
      s3Bucket: image.s3Bucket,
      s3Key: image.s3Key,
      userId: image.userId ?? '0',
      createdAt: image.createdAt,
    };
  }

  async createImage(
    input: Omit<ImageEntity, 'createdAt'>
  ): Promise<ImageEntity> {
    const image = await this.prisma.getImageDelegate().create({
      data: {
        id: input.id,
        qrCodeId: input.qrCodeId,
        date: input.date,
        time: input.time,
        s3Bucket: input.s3Bucket,
        s3Key: input.s3Key,
        userId: input.userId === '0' ? null : input.userId,
      },
    });

    return this.toEntity(image);
  }

  async findImageByQrCodeId(qrCodeId: string): Promise<ImageEntity | null> {
    const image = await this.prisma.getImageDelegate().findUnique({
      where: { qrCodeId },
    });
    return image ? this.toEntity(image) : null;
  }

  async findAllImages(): Promise<ImageEntity[]> {
    const images = await this.prisma.getImageDelegate().findMany({
      orderBy: { createdAt: 'desc' },
    });
    return images.map((image) => this.toEntity(image));
  }

  async findImagesByUserId(userId: string): Promise<ImageEntity[]> {
    const images = await this.prisma.getImageDelegate().findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return images.map((image) => this.toEntity(image));
  }

  async deleteImageByQrCodeId(qrCodeId: string): Promise<void> {
    await this.prisma.getImageDelegate().deleteMany({ where: { qrCodeId } });
  }

  async deleteImageByQrCodeIdAndUserId(
    qrCodeId: string,
    userId: string
  ): Promise<void> {
    await this.prisma.getImageDelegate().deleteMany({
      where: { qrCodeId, userId },
    });
  }
}
