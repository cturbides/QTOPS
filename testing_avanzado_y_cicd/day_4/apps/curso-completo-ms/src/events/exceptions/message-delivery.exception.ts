export class MessageDeliveryException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MessageDeliveryException';
  }
}
