export interface ConsumerConfig {
  queue: string;
  exchange: string;
  routingKey: string;
  handler: (message: any) => Promise<void>;
}
