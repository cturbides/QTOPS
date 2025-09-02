import { DomainEvent } from '../../../events/domain-event.base';
import { EnrollmentSagaStep, PaymentMethod, EnrollmentType } from '../types/enrollment-saga.types';

export class EnrollmentSagaStartedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly enrollmentType: EnrollmentType
  ) {
    super();
  }
}

export class UserValidatedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly userId: string,
    public readonly userDetails: any
  ) {
    super();
  }
}

export class CourseValidatedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly courseId: string,
    public readonly courseDetails: any
  ) {
    super();
  }
}

export class PrerequisitesValidatedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly prerequisitesMet: boolean,
    public readonly missingPrerequisites?: string[]
  ) {
    super();
  }
}

export class SlotReservedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly courseId: string,
    public readonly userId: string,
    public readonly reservationId: string,
    public readonly expiresAt: Date
  ) {
    super();
  }
}

export class PaymentProcessedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly transactionId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly paymentMethod: PaymentMethod
  ) {
    super();
  }
}

export class EnrollmentConfirmedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly enrollmentId: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly startDate: Date
  ) {
    super();
  }
}

export class NotificationSentEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly userId: string,
    public readonly notificationType: string,
    public readonly success: boolean
  ) {
    super();
  }
}

export class EnrollmentSagaCompletedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly enrollmentId: string,
    public readonly duration: number,
    public readonly stepsCompleted: EnrollmentSagaStep[]
  ) {
    super();
  }
}

export class EnrollmentSagaFailedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly reason: string,
    public readonly failedAtStep: EnrollmentSagaStep,
    public readonly compensationsExecuted: string[]
  ) {
    super();
  }
}

export class EnrollmentSagaStepCompletedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly step: EnrollmentSagaStep,
    public readonly stepData?: any
  ) {
    super();
  }
}

export class CompensationExecutedEvent extends DomainEvent {
  constructor(
    public readonly sagaId: string,
    public readonly compensationName: string,
    public readonly success: boolean,
    public readonly error?: string
  ) {
    super();
  }
}
