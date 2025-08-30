export class MessageWrapper {
  constructor(
    public readonly originalMessage: any,
    public readonly content: any
  ) {}

  ack(): void {
    if (this.originalMessage && typeof this.originalMessage.ack === 'function') {
      this.originalMessage.ack();
    }
  }

  nack(allUpTo: boolean = false, requeue: boolean = true): void {
    if (this.originalMessage && typeof this.originalMessage.nack === 'function') {
      this.originalMessage.nack(allUpTo, requeue);
    }
  }
}
