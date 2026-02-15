import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class AuthOutboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  async append(eventType: string, aggregateId: string, payload: unknown) {
    await this.prisma.getOutboxEventDelegate().create({
      data: {
        eventType,
        aggregateId,
        payload: JSON.stringify(payload),
      },
    });
  }
}
