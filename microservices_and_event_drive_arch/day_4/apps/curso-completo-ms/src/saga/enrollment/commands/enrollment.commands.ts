import { PaymentMethod, EnrollmentType } from '../types/enrollment-saga.types';

export class EnrollInCourseCommand {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly enrollmentType: EnrollmentType,
    public readonly paymentMethod?: PaymentMethod,
    public readonly requiresPayment: boolean = true,
    public readonly discountCode?: string,
    public readonly preferredStartDate?: Date,
    public readonly metadata?: Record<string, any>
  ) {}
}

export class ValidateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly requiredCreditLimit?: number
  ) {}
}

export class ValidateCourseCommand {
  constructor(
    public readonly courseId: string,
    public readonly userId: string
  ) {}
}

export class ReserveSlotCommand {
  constructor(
    public readonly courseId: string,
    public readonly userId: string,
    public readonly reservationId: string,
    public readonly expirationMinutes: number = 15
  ) {}
}

export class ProcessPaymentCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly paymentMethod: PaymentMethod,
    public readonly description: string,
    public readonly metadata?: Record<string, any>
  ) {}
}

export class ConfirmEnrollmentCommand {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly paymentId?: string,
    public readonly enrollmentType: EnrollmentType = EnrollmentType.REGULAR
  ) {}
}

export class SendNotificationCommand {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly notificationType: 'ENROLLMENT_CONFIRMED' | 'PAYMENT_PROCESSED' | 'WELCOME_EMAIL',
    public readonly additionalData?: Record<string, any>
  ) {}
}

export class CompensatePaymentCommand {
  constructor(
    public readonly transactionId: string,
    public readonly reason: string
  ) {}
}

export class ReleaseSlotReservationCommand {
  constructor(
    public readonly reservationId: string,
    public readonly reason: string
  ) {}
}
