export class OrderPlacedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string
  ) {}
}
