import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { AuthOutboxRepository } from '../../infrastructure/outbox/auth-outbox.repository';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(UserRegisteredEventHandler.name);
  constructor(private readonly outbox: AuthOutboxRepository) {}

  async handle(event: UserRegisteredEvent) {
    await this.outbox.append('auth.user.registered', event.userId, {
      userId: event.userId,
      email: event.email,
      occurredAt: event.occurredAt.toISOString(),
    });
    this.logger.log(
      `UserRegisteredEvent => userId=${event.userId} email=${event.email}`
    );
  }
}
