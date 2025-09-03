import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { EnrollmentSagaState } from './entities/enrollment-saga-state.entity';

// Services
import { CourseEnrollmentSaga } from './course-enrollment-saga.service';
import { 
  UserServiceClient,
  CourseServiceClient,
  PaymentServiceClient,
  EmailServiceClient
} from './services/service-clients';

// Controllers
import { EnrollmentSagaController } from './controllers/enrollment-saga.controller';

// Handlers
import {
  EnrollInCourseHandler,
  ValidateUserHandler,
  ValidateCourseHandler,
  ReserveSlotHandler,
  ProcessPaymentHandler,
  ConfirmEnrollmentHandler,
  SendNotificationHandler,
  CompensatePaymentHandler,
  ReleaseSlotReservationHandler
} from './handlers/enrollment.handlers';

// Import shared modules
import { EventsModule } from '../../events/events.module';
import { ObservabilityModule } from '@shared-modules/observability';

const CommandHandlers = [
  EnrollInCourseHandler,
  ValidateUserHandler,
  ValidateCourseHandler,
  ReserveSlotHandler,
  ProcessPaymentHandler,
  ConfirmEnrollmentHandler,
  SendNotificationHandler,
  CompensatePaymentHandler,
  ReleaseSlotReservationHandler
];

const Services = [
  CourseEnrollmentSaga,
  UserServiceClient,
  CourseServiceClient,
  PaymentServiceClient,
  EmailServiceClient
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([EnrollmentSagaState]),
    EventsModule,
    ObservabilityModule
  ],
  controllers: [
    EnrollmentSagaController
  ],
  providers: [
    ...Services,
    ...CommandHandlers
  ],
  exports: [
    CourseEnrollmentSaga,
    UserServiceClient,
    CourseServiceClient,
    PaymentServiceClient,
    EmailServiceClient
  ]
})
export class EnrollmentSagaModule {}
