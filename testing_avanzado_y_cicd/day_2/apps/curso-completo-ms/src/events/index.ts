// Module
export { EventsModule } from './events.module';

// Constants
export { MESSAGE_BROKER_TOKEN } from './constants/common';

// Base Classes
export { DomainEvent } from './domain-event.base';

// Enums
export { TipoUsuario } from './enums/tipo-usuario.enum';
export { EstadoInscripcion } from './enums/estado-inscripcion.enum';
export { EstadoPago } from './enums/estado-pago.enum';

// Domain Events
export { UsuarioRegistradoEvent } from './domain-events/usuario-registrado.event';
export { CursoCompletadoEvent } from './domain-events/curso-completado.event';
export { PagoRealizadoEvent } from './domain-events/pago-realizado.event';
export { InscripcionSolicitadaEvent } from './domain-events/inscripcion-solicitada.event';
export { InscripcionConfirmadaEvent } from './domain-events/inscripcion-confirmada.event';
export { InscripcionRechazadaEvent } from './domain-events/inscripcion-rechazada.event';
export { PagoFallidoEvent } from './domain-events/pago-fallido.event';
export { InscripcionFallidaEvent } from './domain-events/inscripcion-fallida.event';

// Services
export { DomainEventPublisher } from './services/domain-event-publisher.service';
export { EventStoreService } from './services/event-store.service';
export { DomainEventSubscriber } from './services/domain-event-subscriber.service';
export { RabbitMQEventBroker } from './services/rabbitmq-event-broker.service';
export { PaymentService } from './services/payment.service';
export { CourseService } from './services/course.service';
export { UserService } from './services/user.service';
export { EmailService } from './services/email.service';
export { InscripcionProcessorService } from './services/inscripcion-processor.service';
export { InscripcionProjectionService } from './services/inscripcion-projection.service';
export { ProjectionEventHandler } from './services/projection-event-handler.service';

// Entities
export { EventStoreEntry } from './entities/event-store-entry.entity';
export { InscripcionAnalyticsEntity } from './entities/inscripcion-analytics.entity';
export { MetricasTiempoRealEntity } from './entities/metricas-tiempo-real.entity';

// Interfaces
export { MessageBrokerService } from './interfaces/message-broker.interface';
export { ConsumerConfig } from './interfaces/consumer-config.interface';
export { PaymentResult } from './interfaces/payment-result.interface';
export { PaymentRequest } from './interfaces/payment-request.interface';
export { EmailConfirmacionInscripcion } from './interfaces/email-confirmacion-inscripcion.interface';

// DTOs
export { PublishEventDto } from './dtos/publish-event.dto';

// Exceptions
export { EventPublicationException } from './exceptions/event-publication.exception';
export { MessageDeliveryException } from './exceptions/message-delivery.exception';

// Wrappers
export { MessageWrapper } from './wrappers/message.wrapper';

// Sagas
export { InscripcionSaga } from './sagas/inscripcion.saga';
