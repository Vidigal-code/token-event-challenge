export class ImageSavedEvent {
  constructor(
    public readonly imageId: string,
    public readonly qrCodeId: string,
    public readonly userId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}
