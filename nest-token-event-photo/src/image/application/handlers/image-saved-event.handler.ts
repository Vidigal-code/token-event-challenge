import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ImageSavedEvent } from '../../domain/events/image-saved.event';
import { AuthOutboxRepository } from '../../../auth/infrastructure/outbox/auth-outbox.repository';

@EventsHandler(ImageSavedEvent)
export class ImageSavedEventHandler implements IEventHandler<ImageSavedEvent> {
  constructor(private readonly outbox: AuthOutboxRepository) {}

  async handle(event: ImageSavedEvent) {
    await this.outbox.append('image.saved', event.imageId, {
      imageId: event.imageId,
      qrCodeId: event.qrCodeId,
      userId: event.userId,
      occurredAt: event.occurredAt.toISOString(),
    });
  }
}
