import { v4 as uuidv4 } from 'uuid';
import { 
  EnrollmentSagaStep, 
  CompensationAction, 
  CourseDetails, 
  UserDetails,
  PaymentDetails,
  SlotReservation,
  EnrollmentType
} from './types/enrollment-saga.types';
import { EnrollInCourseCommand } from './commands/enrollment.commands';

export class EnrollmentSagaContext {
  public readonly sagaId: string;
  public readonly startTime: Date;
  public currentStep: EnrollmentSagaStep = EnrollmentSagaStep.STARTED;
  public compensations: CompensationAction[] = [];
  
  // State flags
  public userValidated: boolean = false;
  public courseValidated: boolean = false;
  public prerequisitesMet: boolean = false;
  public slotReserved: boolean = false;
  public paymentProcessed: boolean = false;
  public enrollmentConfirmed: boolean = false;
  public notificationsSent: boolean = false;
  public completed: boolean = false;
  public failed: boolean = false;
  public compensating: boolean = false;

  // Data storage
  public userDetails?: UserDetails;
  public courseDetails?: CourseDetails;
  public paymentDetails?: PaymentDetails;
  public slotReservation?: SlotReservation;
  public enrollmentId?: string;
  public failureReason?: string;
  public courseStartDate?: Date;

  // Metrics
  public completedSteps: EnrollmentSagaStep[] = [];
  public stepDurations: Map<EnrollmentSagaStep, number> = new Map();
  private stepStartTimes: Map<EnrollmentSagaStep, Date> = new Map();

  constructor(
    sagaId: string | undefined,
    public readonly command: EnrollInCourseCommand
  ) {
    this.sagaId = sagaId || uuidv4();
    this.startTime = new Date();
  }

  // Step management
  transitionToStep(step: EnrollmentSagaStep): void {
    // Record duration of previous step
    if (this.currentStep !== EnrollmentSagaStep.STARTED) {
      const stepStartTime = this.stepStartTimes.get(this.currentStep);
      if (stepStartTime) {
        const duration = Date.now() - stepStartTime.getTime();
        this.stepDurations.set(this.currentStep, duration);
      }
    }

    this.currentStep = step;
    this.stepStartTimes.set(step, new Date());

    console.log(`[SAGA ${this.sagaId}] Transitioning to step: ${step}`);
  }

  completeStep(step: EnrollmentSagaStep): void {
    if (!this.completedSteps.includes(step)) {
      this.completedSteps.push(step);
      
      // Record step duration
      const stepStartTime = this.stepStartTimes.get(step);
      if (stepStartTime) {
        const duration = Date.now() - stepStartTime.getTime();
        this.stepDurations.set(step, duration);
      }
    }
  }

  // Compensation management
  addCompensation(name: string, action: () => Promise<void>): void {
    this.compensations.push({
      name,
      action,
      executed: false
    });
    
    console.log(`[SAGA ${this.sagaId}] Added compensation: ${name}`);
  }

  async executeCompensations(reason: string): Promise<void> {
    this.compensating = true;
    this.failureReason = reason;
    
    console.log(`[SAGA ${this.sagaId}] Starting compensations. Reason: ${reason}`);

    // Execute compensations in reverse order (LIFO)
    const compensationsToExecute = [...this.compensations].reverse();
    
    for (const compensation of compensationsToExecute) {
      if (compensation.executed) {
        continue;
      }

      try {
        console.log(`[SAGA ${this.sagaId}] Executing compensation: ${compensation.name}`);
        await compensation.action();
        compensation.executed = true;
        
        console.log(`[SAGA ${this.sagaId}] Compensation executed successfully: ${compensation.name}`);
        
      } catch (error) {
        compensation.error = error.message;
        
        console.error(`[SAGA ${this.sagaId}] Compensation failed: ${compensation.name}`, error);
        
        // Continue with other compensations even if one fails
        // Log for manual intervention if needed
      }
    }

    this.failed = true;
    console.log(`[SAGA ${this.sagaId}] Compensations completed`);
  }

  // State validation
  canProceedToStep(step: EnrollmentSagaStep): boolean {
    if (this.failed || this.completed || this.compensating) {
      return false;
    }

    // Define step prerequisites
    const prerequisites: Record<EnrollmentSagaStep, () => boolean> = {
      [EnrollmentSagaStep.STARTED]: () => true,
      [EnrollmentSagaStep.VALIDATING_USER]: () => true,
      [EnrollmentSagaStep.VALIDATING_COURSE]: () => this.userValidated,
      [EnrollmentSagaStep.VALIDATING_PREREQUISITES]: () => this.courseValidated,
      [EnrollmentSagaStep.RESERVING_SLOT]: () => this.prerequisitesMet,
      [EnrollmentSagaStep.PROCESSING_PAYMENT]: () => this.slotReserved && this.command.requiresPayment,
      [EnrollmentSagaStep.CONFIRMING_ENROLLMENT]: () => {
        return this.slotReserved && (!this.command.requiresPayment || this.paymentProcessed);
      },
      [EnrollmentSagaStep.SENDING_NOTIFICATIONS]: () => this.enrollmentConfirmed,
      [EnrollmentSagaStep.COMPLETED]: () => this.notificationsSent,
      [EnrollmentSagaStep.FAILED]: () => true,
      [EnrollmentSagaStep.COMPENSATING]: () => true
    };

    const prerequisiteCheck = prerequisites[step];
    return prerequisiteCheck ? prerequisiteCheck() : false;
  }

  markCompleted(): void {
    this.completed = true;
    this.currentStep = EnrollmentSagaStep.COMPLETED;
    this.completeStep(EnrollmentSagaStep.COMPLETED);
    
    console.log(`[SAGA ${this.sagaId}] Saga completed successfully`);
  }

  markFailed(reason: string): void {
    this.failed = true;
    this.failureReason = reason;
    this.currentStep = EnrollmentSagaStep.FAILED;
    
    console.log(`[SAGA ${this.sagaId}] Saga failed: ${reason}`);
  }

  // Utility methods
  getTotalDuration(): number {
    return Date.now() - this.startTime.getTime();
  }

  getExecutedCompensations(): string[] {
    return this.compensations
      .filter(c => c.executed)
      .map(c => c.name);
  }

  getFailedCompensations(): CompensationAction[] {
    return this.compensations.filter(c => c.error);
  }

  getStepMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};
    for (const [step, duration] of this.stepDurations) {
      metrics[step] = duration;
    }
    return metrics;
  }

  toSummary() {
    return {
      sagaId: this.sagaId,
      userId: this.command.userId,
      courseId: this.command.courseId,
      enrollmentType: this.command.enrollmentType,
      currentStep: this.currentStep,
      completed: this.completed,
      failed: this.failed,
      failureReason: this.failureReason,
      totalDuration: this.getTotalDuration(),
      completedSteps: this.completedSteps,
      compensationsExecuted: this.getExecutedCompensations(),
      enrollmentId: this.enrollmentId,
      paymentId: this.paymentDetails?.transactionId,
      stepMetrics: this.getStepMetrics()
    };
  }
}
