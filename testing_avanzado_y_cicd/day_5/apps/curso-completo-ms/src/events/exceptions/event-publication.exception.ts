export class EventPublicationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EventPublicationException';
  }
}
