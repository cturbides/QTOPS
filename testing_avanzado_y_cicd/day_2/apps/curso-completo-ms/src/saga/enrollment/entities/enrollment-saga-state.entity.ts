import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EnrollmentSagaStep, PaymentMethod, EnrollmentType } from '../types/enrollment-saga.types';

@Entity('enrollment_saga_state')
export class EnrollmentSagaState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  sagaId: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  courseId: string;

  @Column({
    type: 'enum',
    enum: EnrollmentSagaStep,
    default: EnrollmentSagaStep.STARTED
  })
  currentStep: EnrollmentSagaStep;

  @Column({
    type: 'enum',
    enum: EnrollmentType,
    default: EnrollmentType.REGULAR
  })
  enrollmentType: EnrollmentType;

  @Column({ type: 'boolean', default: true })
  requiresPayment: boolean;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true
  })
  paymentMethod?: PaymentMethod;

  @Column({ type: 'varchar', nullable: true })
  paymentId?: string;

  @Column({ type: 'varchar', nullable: true })
  enrollmentId?: string;

  @Column({ type: 'varchar', nullable: true })
  reservationId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  userDetails?: any;

  @Column({ type: 'jsonb', nullable: true })
  courseDetails?: any;

  @Column({ type: 'jsonb', default: '[]' })
  completedSteps: EnrollmentSagaStep[];

  @Column({ type: 'jsonb', default: '[]' })
  compensations: string[];

  @Column({ type: 'jsonb', default: '[]' })
  executedCompensations: string[];

  @Column({ type: 'boolean', default: false })
  userValidated: boolean;

  @Column({ type: 'boolean', default: false })
  courseValidated: boolean;

  @Column({ type: 'boolean', default: false })
  prerequisitesMet: boolean;

  @Column({ type: 'boolean', default: false })
  slotReserved: boolean;

  @Column({ type: 'boolean', default: false })
  paymentProcessed: boolean;

  @Column({ type: 'boolean', default: false })
  enrollmentConfirmed: boolean;

  @Column({ type: 'boolean', default: false })
  notificationsSent: boolean;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'boolean', default: false })
  failed: boolean;

  @Column({ type: 'varchar', nullable: true })
  failureReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  addCompensation(name: string): void {
    if (!this.compensations.includes(name)) {
      this.compensations.push(name);
    }
  }

  markCompensationExecuted(name: string): void {
    if (!this.executedCompensations.includes(name)) {
      this.executedCompensations.push(name);
    }
  }

  addCompletedStep(step: EnrollmentSagaStep): void {
    if (!this.completedSteps.includes(step)) {
      this.completedSteps.push(step);
    }
  }

  isStepCompleted(step: EnrollmentSagaStep): boolean {
    return this.completedSteps.includes(step);
  }

  canExecuteStep(step: EnrollmentSagaStep): boolean {
    if (this.failed || this.completed) {
      return false;
    }

    // Define step dependencies
    const dependencies: Record<EnrollmentSagaStep, EnrollmentSagaStep[]> = {
      [EnrollmentSagaStep.STARTED]: [],
      [EnrollmentSagaStep.VALIDATING_USER]: [EnrollmentSagaStep.STARTED],
      [EnrollmentSagaStep.VALIDATING_COURSE]: [EnrollmentSagaStep.VALIDATING_USER],
      [EnrollmentSagaStep.VALIDATING_PREREQUISITES]: [EnrollmentSagaStep.VALIDATING_COURSE],
      [EnrollmentSagaStep.RESERVING_SLOT]: [EnrollmentSagaStep.VALIDATING_PREREQUISITES],
      [EnrollmentSagaStep.PROCESSING_PAYMENT]: [EnrollmentSagaStep.RESERVING_SLOT],
      [EnrollmentSagaStep.CONFIRMING_ENROLLMENT]: [EnrollmentSagaStep.PROCESSING_PAYMENT],
      [EnrollmentSagaStep.SENDING_NOTIFICATIONS]: [EnrollmentSagaStep.CONFIRMING_ENROLLMENT],
      [EnrollmentSagaStep.COMPLETED]: [EnrollmentSagaStep.SENDING_NOTIFICATIONS],
      [EnrollmentSagaStep.FAILED]: [],
      [EnrollmentSagaStep.COMPENSATING]: []
    };

    const requiredSteps = dependencies[step] || [];
    return requiredSteps.every(requiredStep => this.isStepCompleted(requiredStep));
  }
}
