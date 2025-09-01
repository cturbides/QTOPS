import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SagaIssueType {
  TIMEOUT = 'TIMEOUT',
  STUCK = 'STUCK',
  INCONSISTENT_STATE = 'INCONSISTENT_STATE',
  COMPENSATION_FAILED = 'COMPENSATION_FAILED'
}

export enum SagaIssueStatus {
  DETECTED = 'DETECTED',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED'
}

@Entity('saga_monitoring')
export class SagaMonitoring {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  sagaId: string;

  @Column({
    type: 'enum',
    enum: SagaIssueType
  })
  issueType: SagaIssueType;

  @Column({
    type: 'enum',
    enum: SagaIssueStatus,
    default: SagaIssueStatus.DETECTED
  })
  status: SagaIssueStatus;

  @Column('text')
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @Column('text', { nullable: true })
  resolutionNotes: string;

  @Column('varchar', { nullable: true })
  assignedTo: string;

  @Column('timestamp', { nullable: true })
  detectedAt: Date;

  @Column('timestamp', { nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
