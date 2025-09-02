export interface PublishEventDto {
  exchange: string;
  routingKey: string;
  message: {
    payload: any;
    eventId: string;
    timestamp: Date;
    eventType: string;
  };
  correlationId?: string;
  options?: {
    [key: string]: any;
    mandatory?: boolean;
    persistent?: boolean;
  };
}
