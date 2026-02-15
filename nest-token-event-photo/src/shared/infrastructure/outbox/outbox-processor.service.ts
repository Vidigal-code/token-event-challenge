import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LogOutboxPublisher } from './log-outbox.publisher';

@Injectable()
export class OutboxProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessorService.name);
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly pollIntervalMs: number;
  private readonly maxAttempts: number;
  private readonly baseBackoffMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly publisher: LogOutboxPublisher
  ) {
    this.pollIntervalMs = Number(
      this.configService.get('OUTBOX_POLL_INTERVAL_MS', 15000)
    );
    this.maxAttempts = Number(this.configService.get('OUTBOX_MAX_ATTEMPTS', 5));
    this.baseBackoffMs = Number(
      this.configService.get('OUTBOX_BASE_BACKOFF_MS', 5000)
    );
  }

  onModuleInit() {
    this.timer = setInterval(() => {
      void this.processBatch();
    }, this.pollIntervalMs);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async processBatch() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    try {
      const outbox = this.prisma.getOutboxEventDelegate();
      const events = await outbox.findMany({
        where: {
          processedAt: null,
          failedAt: null,
          nextAttemptAt: { lte: new Date() },
        },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });

      if (events.length === 0) {
        return;
      }

      for (const event of events) {
        await this.processSingleEvent(event);
      }
    } catch (error) {
      this.logger.error('Outbox processor failed', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async processSingleEvent(event: {
    id: string;
    eventType: string;
    aggregateId: string;
    payload: string;
    attempts: number;
  }) {
    try {
      await this.publisher.publish({
        id: event.id,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        payload: event.payload,
      });

      await this.prisma.getOutboxEventDelegate().update({
        where: { id: event.id },
        data: {
          processedAt: new Date(),
          lastError: null,
        },
      });
    } catch (error) {
      const nextAttempts = event.attempts + 1;
      const isDeadLetter = nextAttempts >= this.maxAttempts;
      const errorMessage = this.formatError(error);

      await this.prisma.getOutboxEventDelegate().update({
        where: { id: event.id },
        data: {
          attempts: nextAttempts,
          lastError: errorMessage,
          failedAt: isDeadLetter ? new Date() : null,
          nextAttemptAt: isDeadLetter
            ? new Date()
            : new Date(
                Date.now() + this.baseBackoffMs * Math.pow(2, event.attempts)
              ),
        },
      });

      if (isDeadLetter) {
        this.logger.error(
          `Outbox event moved to dead-letter id=${event.id} type=${event.eventType} error=${errorMessage}`
        );
        return;
      }

      this.logger.warn(
        `Outbox publish failed id=${event.id} attempt=${nextAttempts}/${this.maxAttempts} error=${errorMessage}`
      );
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
