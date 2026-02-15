import { Injectable, Logger } from '@nestjs/common';
import { OutboxPublisher } from './outbox-publisher.port';

@Injectable()
export class LogOutboxPublisher implements OutboxPublisher {
  private readonly logger = new Logger(LogOutboxPublisher.name);

  async publish(event: {
    id: string;
    eventType: string;
    aggregateId: string;
    payload: string;
  }): Promise<void> {
    this.logger.log(
      `Published outbox event id=${event.id} type=${event.eventType} aggregateId=${event.aggregateId}`
    );
  }
}
