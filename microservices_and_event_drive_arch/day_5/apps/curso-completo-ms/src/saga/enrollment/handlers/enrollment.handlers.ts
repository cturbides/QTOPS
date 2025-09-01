import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { 
  EnrollInCourseCommand,
  ValidateUserCommand,
  ValidateCourseCommand,
  ReserveSlotCommand,
  ProcessPaymentCommand,
  ConfirmEnrollmentCommand,
  SendNotificationCommand,
  CompensatePaymentCommand,
  ReleaseSlotReservationCommand
} from '../commands/enrollment.commands';

import { CourseEnrollmentSaga } from '../course-enrollment-saga.service';
import { 
  UserServiceClient,
  CourseServiceClient,
  PaymentServiceClient,
  EmailServiceClient
} from '../services/service-clients';

// Main enrollment command handler
@CommandHandler(EnrollInCourseCommand)
export class EnrollInCourseHandler implements ICommandHandler<EnrollInCourseCommand> {
  private readonly logger = new Logger(EnrollInCourseHandler.name);

  constructor(
    private readonly enrollmentSaga: CourseEnrollmentSaga
  ) {}

  async execute(command: EnrollInCourseCommand): Promise<any> {
    this.logger.log(`Processing enrollment command for user ${command.userId} in course ${command.courseId}`);
    
    try {
      return await this.enrollmentSaga.procesarInscripcion(command);
    } catch (error) {
      this.logger.error(`Failed to process enrollment:`, error);
      throw error;
    }
  }
}

// Individual step handlers for more granular control
@CommandHandler(ValidateUserCommand)
export class ValidateUserHandler implements ICommandHandler<ValidateUserCommand> {
  private readonly logger = new Logger(ValidateUserHandler.name);

  constructor(
    private readonly userService: UserServiceClient
  ) {}

  async execute(command: ValidateUserCommand): Promise<any> {
    this.logger.log(`Validating user ${command.userId}`);
    
    const user = await this.userService.obtenerUsuario(command.userId);
    
    if (!user.active) {
      throw new Error('User is inactive');
    }

    if (command.requiredCreditLimit && user.creditLimit < command.requiredCreditLimit) {
      throw new Error('Insufficient credit limit');
    }

    return {
      valid: true,
      user
    };
  }
}

@CommandHandler(ValidateCourseCommand)
export class ValidateCourseHandler implements ICommandHandler<ValidateCourseCommand> {
  private readonly logger = new Logger(ValidateCourseHandler.name);

  constructor(
    private readonly courseService: CourseServiceClient
  ) {}

  async execute(command: ValidateCourseCommand): Promise<any> {
    this.logger.log(`Validating course ${command.courseId} for user ${command.userId}`);
    
    const course = await this.courseService.obtenerCurso(command.courseId);
    
    if (!course.hasAvailableSlots) {
      throw new Error('Course has no available slots');
    }

    if (course.currentStudents >= course.maxStudents) {
      throw new Error('Course is full');
    }

    return {
      valid: true,
      course
    };
  }
}

@CommandHandler(ReserveSlotCommand)
export class ReserveSlotHandler implements ICommandHandler<ReserveSlotCommand> {
  private readonly logger = new Logger(ReserveSlotHandler.name);

  constructor(
    private readonly courseService: CourseServiceClient
  ) {}

  async execute(command: ReserveSlotCommand): Promise<any> {
    this.logger.log(`Reserving slot for user ${command.userId} in course ${command.courseId}`);
    
    const expiresAt = new Date(Date.now() + command.expirationMinutes * 60 * 1000);
    
    const result = await this.courseService.reservarCupo({
      courseId: command.courseId,
      userId: command.userId,
      reservationId: command.reservationId,
      expiresAt
    });

    if (!result.success) {
      throw new Error(`Slot reservation failed: ${result.error}`);
    }

    return result;
  }
}

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentHandler implements ICommandHandler<ProcessPaymentCommand> {
  private readonly logger = new Logger(ProcessPaymentHandler.name);

  constructor(
    private readonly paymentService: PaymentServiceClient
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<any> {
    this.logger.log(`Processing payment for user ${command.userId}, amount: ${command.amount} ${command.currency}`);
    
    const result = await this.paymentService.procesarPago({
      userId: command.userId,
      amount: command.amount,
      currency: command.currency,
      paymentMethod: command.paymentMethod,
      description: command.description,
      metadata: command.metadata
    });

    if (!result.success) {
      throw new Error(`Payment processing failed: ${result.error}`);
    }

    return result;
  }
}

@CommandHandler(ConfirmEnrollmentCommand)
export class ConfirmEnrollmentHandler implements ICommandHandler<ConfirmEnrollmentCommand> {
  private readonly logger = new Logger(ConfirmEnrollmentHandler.name);

  constructor(
    private readonly courseService: CourseServiceClient
  ) {}

  async execute(command: ConfirmEnrollmentCommand): Promise<any> {
    this.logger.log(`Confirming enrollment for user ${command.userId} in course ${command.courseId}`);
    
    const result = await this.courseService.confirmarInscripcion({
      userId: command.userId,
      courseId: command.courseId,
      reservationId: command.paymentId || 'no-payment',
      enrollmentType: command.enrollmentType.toString()
    });

    if (!result.success) {
      throw new Error(`Enrollment confirmation failed: ${result.error}`);
    }

    return result;
  }
}

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
  private readonly logger = new Logger(SendNotificationHandler.name);

  constructor(
    private readonly emailService: EmailServiceClient
  ) {}

  async execute(command: SendNotificationCommand): Promise<any> {
    this.logger.log(`Sending notification to user ${command.userId}: ${command.notificationType}`);
    
    const result = await this.emailService.enviarNotificacion({
      userId: command.userId,
      courseId: command.courseId,
      notificationType: command.notificationType,
      templateData: command.additionalData || {}
    });

    if (!result.success) {
      throw new Error(`Notification sending failed: ${result.error}`);
    }

    return result;
  }
}

// Compensation command handlers
@CommandHandler(CompensatePaymentCommand)
export class CompensatePaymentHandler implements ICommandHandler<CompensatePaymentCommand> {
  private readonly logger = new Logger(CompensatePaymentHandler.name);

  constructor(
    private readonly paymentService: PaymentServiceClient
  ) {}

  async execute(command: CompensatePaymentCommand): Promise<any> {
    this.logger.log(`Compensating payment ${command.transactionId}: ${command.reason}`);
    
    await this.paymentService.revertirPago(command.transactionId);

    return {
      success: true,
      transactionId: command.transactionId,
      reason: command.reason
    };
  }
}

@CommandHandler(ReleaseSlotReservationCommand)
export class ReleaseSlotReservationHandler implements ICommandHandler<ReleaseSlotReservationCommand> {
  private readonly logger = new Logger(ReleaseSlotReservationHandler.name);

  constructor(
    private readonly courseService: CourseServiceClient
  ) {}

  async execute(command: ReleaseSlotReservationCommand): Promise<any> {
    this.logger.log(`Releasing slot reservation ${command.reservationId}: ${command.reason}`);
    
    await this.courseService.liberarReservacion(command.reservationId);

    return {
      success: true,
      reservationId: command.reservationId,
      reason: command.reason
    };
  }
}
