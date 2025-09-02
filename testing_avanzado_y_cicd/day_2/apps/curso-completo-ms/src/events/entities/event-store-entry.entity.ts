import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('event_store')
@Index(['aggregateId', 'version'], { unique: true })
export class EventStoreEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'aggregate_id' })
  aggregateId: string;

  @Column({ name: 'event_type' })
  eventType: string;

  @Column({ type: 'jsonb', name: 'event_data' })
  eventData: string;

  @Column({ type: 'int' })
  version: number;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}
