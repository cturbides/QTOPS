import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EnrollmentSagaContext } from './enrollment-saga-context';
import { EnrollInCourseCommand } from './commands/enrollment.commands';
import { EnrollmentSagaState } from './entities/enrollment-saga-state.entity';

import {
  EnrollmentResult,
  EnrollmentSagaStep,
} from './types/enrollment-saga.types';

import {
  UserServiceClient,
  EmailServiceClient,
  CourseServiceClient,
  PaymentServiceClient,
} from './services/service-clients';

import { EventStoreService } from '@curso-completo/events';
import { DomainEventPublisher } from '@curso-completo/events'; 

import {
  UserValidatedEvent,
  CourseValidatedEvent,
  EnrollmentSagaStartedEvent,
  PrerequisitesValidatedEvent,
  SlotReservedEvent,
  PaymentProcessedEvent,
  EnrollmentConfirmedEvent,
  NotificationSentEvent,
  EnrollmentSagaCompletedEvent,
  EnrollmentSagaFailedEvent,
  EnrollmentSagaStepCompletedEvent,
  CompensationExecutedEvent
} from  './events/enrollment-saga.events'; 

@Injectable()
export class CourseEnrollmentSaga {
  private readonly logger = new Logger(CourseEnrollmentSaga.name);

  constructor(
    @InjectRepository(EnrollmentSagaState)
    private readonly sagaStateRepository: Repository<EnrollmentSagaState>,
    private readonly userService: UserServiceClient,
    private readonly courseService: CourseServiceClient,
    private readonly paymentService: PaymentServiceClient,
    private readonly emailService: EmailServiceClient,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: DomainEventPublisher
  ) { }

  async procesarInscripcion(comando: EnrollInCourseCommand): Promise<EnrollmentResult> {
    const sagaId = uuidv4();
    const context = new EnrollmentSagaContext(sagaId, comando);

    this.logger.log(`[SAGA ${sagaId}] Starting enrollment saga for user ${comando.userId} in course ${comando.courseId}`);

    try {
      // Initialize saga state in database
      await this.initializeSagaState(context);

      // Publish saga started event
      await this.publishEvent(new EnrollmentSagaStartedEvent(
        sagaId,
        comando.userId,
        comando.courseId,
        comando.enrollmentType
      ), sagaId);

      // Execute saga steps
      await this.validarPrerequisitos(context);
      await this.reservarCupo(context);

      if (context.command.requiresPayment) {
        await this.procesarPago(context);
      }

      await this.confirmarInscripcion(context);
      await this.enviarNotificaciones(context);

      // Mark saga as completed
      context.markCompleted();
      await this.updateSagaState(context);

      // Publish completion event
      await this.publishEvent(new EnrollmentSagaCompletedEvent(
        sagaId,
        context.enrollmentId!,
        context.getTotalDuration(),
        context.completedSteps
      ), sagaId);

      this.logger.log(`[SAGA ${sagaId}] Enrollment saga completed successfully`);

      return {
        success: true,
        enrollmentId: context.enrollmentId,
        courseId: comando.courseId,
        startDate: context.courseStartDate,
        paymentId: context.paymentDetails?.transactionId
      };

    } catch (error) {
      this.logger.error(`[SAGA ${sagaId}] Enrollment saga failed: ${error.message}`, error.stack);

      await this.ejecutarCompensaciones(context, error.message);

      // Publish failure event
      await this.publishEvent(new EnrollmentSagaFailedEvent(
        sagaId,
        error.message,
        context.currentStep,
        context.getExecutedCompensations()
      ), sagaId);

      return {
        success: false,
        error: error.message,
        compensationsExecuted: context.getExecutedCompensations()
      };
    }
  }

  private async validarPrerequisitos(context: EnrollmentSagaContext): Promise<void> {
    if (!context.canProceedToStep(EnrollmentSagaStep.VALIDATING_USER)) {
      throw new Error('Cannot proceed to user validation step');
    }

    context.transitionToStep(EnrollmentSagaStep.VALIDATING_USER);
    await this.updateSagaState(context);

    // Validate user
    const user = await this.userService.obtenerUsuario(context.command.userId);
    if (!user.active) {
      throw new Error('User is inactive');
    }

    context.userDetails = user;
    context.userValidated = true;
    context.completeStep(EnrollmentSagaStep.VALIDATING_USER);

    await this.publishEvent(new UserValidatedEvent(
      context.sagaId,
      context.command.userId,
      user
    ), context.sagaId);

    // Validate course
    context.transitionToStep(EnrollmentSagaStep.VALIDATING_COURSE);
    await this.updateSagaState(context);

    const course = await this.courseService.obtenerCurso(context.command.courseId);
    if (!course.hasAvailableSlots) {
      throw new Error('Course has no available slots');
    }

    context.courseDetails = course;
    context.courseValidated = true;
    context.courseStartDate = course.startDate;
    context.completeStep(EnrollmentSagaStep.VALIDATING_COURSE);

    await this.publishEvent(new CourseValidatedEvent(
      context.sagaId,
      context.command.courseId,
      course
    ), context.sagaId);

    // Validate prerequisites
    context.transitionToStep(EnrollmentSagaStep.VALIDATING_PREREQUISITES);
    await this.updateSagaState(context);

    if (course.prerequisites.length > 0) {
      const completedCourses = await this.userService.obtenerCursosCompletados(context.command.userId);

      const missingPrerequisites = course.prerequisites.filter(prereq =>
        !completedCourses.includes(prereq)
      );

      if (missingPrerequisites.length > 0) {
        await this.publishEvent(new PrerequisitesValidatedEvent(
          context.sagaId,
          context.command.userId,
          context.command.courseId,
          false,
          missingPrerequisites
        ), context.sagaId);

        throw new Error(`Missing prerequisites: ${missingPrerequisites.join(', ')}`);
      }
    }

    context.prerequisitesMet = true;
    context.completeStep(EnrollmentSagaStep.VALIDATING_PREREQUISITES);

    await this.publishEvent(new PrerequisitesValidatedEvent(
      context.sagaId,
      context.command.userId,
      context.command.courseId,
      true
    ), context.sagaId);

    this.logger.log(`[SAGA ${context.sagaId}] Prerequisites validation completed`);
  }

  private async reservarCupo(context: EnrollmentSagaContext): Promise<void> {
    if (!context.canProceedToStep(EnrollmentSagaStep.RESERVING_SLOT)) {
      throw new Error('Cannot proceed to slot reservation step');
    }

    context.transitionToStep(EnrollmentSagaStep.RESERVING_SLOT);
    await this.updateSagaState(context);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const reservation = await this.courseService.reservarCupo({
      courseId: context.command.courseId,
      userId: context.command.userId,
      reservationId: context.sagaId,
      expiresAt
    });

    if (!reservation.success) {
      throw new Error(`Slot reservation failed: ${reservation.error}`);
    }

    context.slotReservation = reservation.reservation!;
    context.slotReserved = true;
    context.completeStep(EnrollmentSagaStep.RESERVING_SLOT);

    // Add compensation for slot reservation
    context.addCompensation('slot-reservation', async () => {
      await this.courseService.liberarReservacion(context.sagaId);

      await this.publishEvent(new CompensationExecutedEvent(
        context.sagaId,
        'slot-reservation',
        true
      ), context.sagaId);
    });

    await this.publishEvent(new SlotReservedEvent(
      context.sagaId,
      context.command.courseId,
      context.command.userId,
      context.sagaId,
      expiresAt
    ), context.sagaId);

    this.logger.log(`[SAGA ${context.sagaId}] Slot reservation completed`);
  }

  private async procesarPago(context: EnrollmentSagaContext): Promise<void> {
    if (!context.canProceedToStep(EnrollmentSagaStep.PROCESSING_PAYMENT)) {
      throw new Error('Cannot proceed to payment processing step');
    }

    context.transitionToStep(EnrollmentSagaStep.PROCESSING_PAYMENT);
    await this.updateSagaState(context);

    const payment = await this.paymentService.procesarPago({
      amount: context.courseDetails!.price,
      currency: context.courseDetails!.currency,
      paymentMethod: context.command.paymentMethod!,
      userId: context.command.userId,
      description: `Enrollment in course: ${context.courseDetails!.title}`,
      metadata: {
        sagaId: context.sagaId,
        courseId: context.command.courseId,
        enrollmentType: context.command.enrollmentType
      }
    });

    if (!payment.success) {
      throw new Error(`Payment processing failed: ${payment.error}`);
    }

    context.paymentDetails = payment.payment!;
    context.paymentProcessed = true;
    context.completeStep(EnrollmentSagaStep.PROCESSING_PAYMENT);

    // Add compensation for payment
    context.addCompensation('payment', async () => {
      await this.paymentService.revertirPago(payment.payment!.transactionId);

      await this.publishEvent(new CompensationExecutedEvent(
        context.sagaId,
        'payment',
        true
      ), context.sagaId);
    });

    await this.publishEvent(new PaymentProcessedEvent(
      context.sagaId,
      payment.payment!.transactionId,
      payment.payment!.amount,
      payment.payment!.currency,
      payment.payment!.method
    ), context.sagaId);

    this.logger.log(`[SAGA ${context.sagaId}] Payment processing completed`);
  }

  private async confirmarInscripcion(context: EnrollmentSagaContext): Promise<void> {
    if (!context.canProceedToStep(EnrollmentSagaStep.CONFIRMING_ENROLLMENT)) {
      throw new Error('Cannot proceed to enrollment confirmation step');
    }

    context.transitionToStep(EnrollmentSagaStep.CONFIRMING_ENROLLMENT);
    await this.updateSagaState(context);

    const enrollment = await this.courseService.confirmarInscripcion({
      userId: context.command.userId,
      courseId: context.command.courseId,
      reservationId: context.sagaId,
      enrollmentType: context.command.enrollmentType.toString()
    });

    if (!enrollment.success) {
      throw new Error(`Enrollment confirmation failed: ${enrollment.error}`);
    }

    context.enrollmentId = enrollment.enrollmentId!;
    context.enrollmentConfirmed = true;
    context.completeStep(EnrollmentSagaStep.CONFIRMING_ENROLLMENT);

    await this.publishEvent(new EnrollmentConfirmedEvent(
      context.sagaId,
      context.enrollmentId!,
      context.command.userId,
      context.command.courseId,
      context.courseStartDate!
    ), context.sagaId);

    this.logger.log(`[SAGA ${context.sagaId}] Enrollment confirmation completed`);
  }

  private async enviarNotificaciones(context: EnrollmentSagaContext): Promise<void> {
    if (!context.canProceedToStep(EnrollmentSagaStep.SENDING_NOTIFICATIONS)) {
      throw new Error('Cannot proceed to notification sending step');
    }

    context.transitionToStep(EnrollmentSagaStep.SENDING_NOTIFICATIONS);
    await this.updateSagaState(context);

    // Send welcome email
    await this.emailService.enviarWelcomeEmail(
      context.command.userId,
      context.courseDetails!.title,
      context.courseStartDate!
    );

    // Send payment confirmation if payment was processed
    if (context.paymentProcessed && context.paymentDetails) {
      await this.emailService.enviarPaymentConfirmation(
        context.command.userId,
        context.paymentDetails.transactionId,
        context.paymentDetails.amount
      );
    }

    context.notificationsSent = true;
    context.completeStep(EnrollmentSagaStep.SENDING_NOTIFICATIONS);

    await this.publishEvent(new NotificationSentEvent(
      context.sagaId,
      context.command.userId,
      'ENROLLMENT_WELCOME',
      true
    ), context.sagaId);

    this.logger.log(`[SAGA ${context.sagaId}] Notifications sending completed`);
  }

  private async ejecutarCompensaciones(context: EnrollmentSagaContext, reason: string): Promise<void> {
    try {
      await context.executeCompensations(reason);
      await this.updateSagaState(context);

      this.logger.log(`[SAGA ${context.sagaId}] Compensations executed successfully`);

    } catch (error) {
      this.logger.error(`[SAGA ${context.sagaId}] Error during compensations:`, error);
    }
  }

  private async initializeSagaState(context: EnrollmentSagaContext): Promise<void> {
    const sagaState = new EnrollmentSagaState();
    sagaState.sagaId = context.sagaId;
    sagaState.userId = context.command.userId;
    sagaState.courseId = context.command.courseId;
    sagaState.enrollmentType = context.command.enrollmentType;
    sagaState.requiresPayment = context.command.requiresPayment;
    sagaState.paymentMethod = context.command.paymentMethod;
    sagaState.currentStep = context.currentStep;
    sagaState.startedAt = context.startTime;
    sagaState.metadata = context.command.metadata;

    await this.sagaStateRepository.save(sagaState);
  }

  private async updateSagaState(context: EnrollmentSagaContext): Promise<void> {
    const sagaState = await this.sagaStateRepository.findOne({
      where: { sagaId: context.sagaId }
    });

    if (!sagaState) {
      throw new Error(`Saga state not found for saga ${context.sagaId}`);
    }

    // Update state from context
    sagaState.currentStep = context.currentStep;
    sagaState.userValidated = context.userValidated;
    sagaState.courseValidated = context.courseValidated;
    sagaState.prerequisitesMet = context.prerequisitesMet;
    sagaState.slotReserved = context.slotReserved;
    sagaState.paymentProcessed = context.paymentProcessed;
    sagaState.enrollmentConfirmed = context.enrollmentConfirmed;
    sagaState.notificationsSent = context.notificationsSent;
    sagaState.completed = context.completed;
    sagaState.failed = context.failed;
    sagaState.failureReason = context.failureReason;
    sagaState.completedSteps = context.completedSteps;
    sagaState.executedCompensations = context.getExecutedCompensations();
    sagaState.enrollmentId = context.enrollmentId;
    sagaState.paymentId = context.paymentDetails?.transactionId;
    sagaState.userDetails = context.userDetails;
    sagaState.courseDetails = context.courseDetails;

    if (context.completed) {
      sagaState.completedAt = new Date();
    }

    if (context.failed) {
      sagaState.failedAt = new Date();
    }

    await this.sagaStateRepository.save(sagaState);
  }

  private async publishEvent(event: any, aggregateId: string): Promise<void> {
    try {
      await this.eventPublisher.publicarEvento(event, aggregateId);

      await this.publishStepCompletedEvent(event, aggregateId);

    } catch (error) {
      this.logger.error(`Failed to publish event ${event.constructor.name}:`, error);
      // Don't fail the saga for event publishing errors
    }
  }

  private async publishStepCompletedEvent(event: any, sagaId: string): Promise<void> {
    const stepEvents: Record<string, EnrollmentSagaStep> = {
      'UserValidatedEvent': EnrollmentSagaStep.VALIDATING_USER,
      'CourseValidatedEvent': EnrollmentSagaStep.VALIDATING_COURSE,
      'PrerequisitesValidatedEvent': EnrollmentSagaStep.VALIDATING_PREREQUISITES,
      'SlotReservedEvent': EnrollmentSagaStep.RESERVING_SLOT,
      'PaymentProcessedEvent': EnrollmentSagaStep.PROCESSING_PAYMENT,
      'EnrollmentConfirmedEvent': EnrollmentSagaStep.CONFIRMING_ENROLLMENT,
      'NotificationSentEvent': EnrollmentSagaStep.SENDING_NOTIFICATIONS
    };

    const step = stepEvents[event.constructor.name];
    if (step) {
      await this.eventPublisher.publicarEvento(
        new EnrollmentSagaStepCompletedEvent(sagaId, step, event),
        sagaId
      );
    }
  }

  // Query methods
  async getSagaState(sagaId: string): Promise<EnrollmentSagaState | null> {
    return await this.sagaStateRepository.findOne({
      where: { sagaId }
    });
  }

  async getSagasByUser(userId: string): Promise<EnrollmentSagaState[]> {
    return await this.sagaStateRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async getSagasByCourse(courseId: string): Promise<EnrollmentSagaState[]> {
    return await this.sagaStateRepository.find({
      where: { courseId },
      order: { createdAt: 'DESC' }
    });
  }

  async getActiveSagas(): Promise<EnrollmentSagaState[]> {
    return await this.sagaStateRepository.find({
      where: {
        completed: false,
        failed: false
      },
      order: { createdAt: 'DESC' }
    });
  }
}
