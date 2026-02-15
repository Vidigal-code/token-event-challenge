export interface OutboxPublisher {
  publish(event: {
    id: string;
    eventType: string;
    aggregateId: string;
    payload: string;
  }): Promise<void>;
}
