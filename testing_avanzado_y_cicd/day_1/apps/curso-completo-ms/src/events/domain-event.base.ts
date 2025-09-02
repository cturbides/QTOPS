import { v4 as uuidv4 } from 'uuid';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly timestamp: Date;
  public readonly version: number;
  
  constructor(version: number = 1) {
    this.eventId = uuidv4();
    this.timestamp = new Date();
    this.version = version;
  }
}
