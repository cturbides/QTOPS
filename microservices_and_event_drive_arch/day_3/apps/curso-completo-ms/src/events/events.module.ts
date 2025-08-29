import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { EventStoreEntry } from './entities/event-store-entry.entity';

// Controllers
import { EventosController } from './controllers/eventos.controller';

// Services
import { DomainEventPublisher } from './services/domain-event-publisher.service';
import { EventStoreService } from './services/event-store.service';
import { RabbitMQEventBroker } from './services/rabbitmq-event-broker.service';
import { EventFactory } from './services/event-factory.service';
import { PaymentService } from './services/payment.service';
import { CourseService } from './services/course.service';
import { UserService } from './services/user.service';
import { EmailService } from './services/email.service';
import { InscripcionProcessorService } from './services/inscripcion-processor.service';
import { EventSystemInitializer } from './services/event-system-initializer.service';

// Interfaces
import { MessageBrokerService } from './interfaces/message-broker.interface';
import { MESSAGE_BROKER_TOKEN } from './constants/common';

// Token para inyección

@Module({
  imports: [
    TypeOrmModule.forFeature([EventStoreEntry])
  ],
  controllers: [
    EventosController
  ],
  providers: [
    Logger,
    EventFactory,
    EventStoreService,
    RabbitMQEventBroker,
    {
      provide: MESSAGE_BROKER_TOKEN,
      useExisting: RabbitMQEventBroker
    },
    {
      provide: DomainEventPublisher,
      useFactory: (messageBroker: MessageBrokerService, eventStore: EventStoreService) => {
        return new DomainEventPublisher(eventStore, messageBroker);
      },
      inject: [MESSAGE_BROKER_TOKEN, EventStoreService]
    },
    UserService,
    EmailService,
    CourseService,
    PaymentService,
    {
      provide: InscripcionProcessorService,
      useFactory: (
        messageBroker: MessageBrokerService,
        eventFactory: EventFactory,
        paymentService: PaymentService,
        courseService: CourseService,
        userService: UserService,
        emailService: EmailService,
        eventPublisher: DomainEventPublisher
      ) => {
        return new InscripcionProcessorService(
          eventFactory,
          messageBroker,
          paymentService,
          courseService,
          userService,
          emailService,
          eventPublisher
        );
      },
      inject: [
        MESSAGE_BROKER_TOKEN,
        EventFactory,
        PaymentService,
        CourseService,
        UserService,
        EmailService,
        DomainEventPublisher
      ]
    },
    {
      provide: EventSystemInitializer,
      useFactory: (
        messageBroker: MessageBrokerService,
        inscripcionProcessor: InscripcionProcessorService
      ) => {
        return new EventSystemInitializer(messageBroker, inscripcionProcessor);
      },
      inject: [MESSAGE_BROKER_TOKEN, InscripcionProcessorService]
    }
  ],
  exports: [
    DomainEventPublisher,
    EventStoreService,
    EventFactory,
    MESSAGE_BROKER_TOKEN,
    PaymentService,
    CourseService,
    UserService,
    EmailService,
    InscripcionProcessorService
  ]
})
export class EventsModule {}
