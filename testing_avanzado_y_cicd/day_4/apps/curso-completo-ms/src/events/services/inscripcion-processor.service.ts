import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { EmailService } from './email.service';
import { CourseService } from './course.service';
import { DomainEvent } from '../domain-event.base';
import { PaymentService } from './payment.service';
import { EventFactory } from './event-factory.service';
import { InscripcionSaga } from '../sagas/inscripcion.saga';
import { DomainEventPublisher } from './domain-event-publisher.service';
import { DomainEventSubscriber } from './domain-event-subscriber.service';
import { MessageBrokerService } from '../interfaces/message-broker.interface';

// Eventos
import { PagoFallidoEvent } from '../domain-events/pago-fallido.event';
import { PagoRealizadoEvent } from '../domain-events/pago-realizado.event';
import { CursoCompletadoEvent } from '../domain-events/curso-completado.event';
import { UsuarioRegistradoEvent } from '../domain-events/usuario-registrado.event';
import { InscripcionFallidaEvent } from '../domain-events/inscripcion-fallida.event';
import { InscripcionRechazadaEvent } from '../domain-events/inscripcion-rechazada.event';
import { InscripcionConfirmadaEvent } from '../domain-events/inscripcion-confirmada.event';
import { InscripcionSolicitadaEvent } from '../domain-events/inscripcion-solicitada.event';

@Injectable()
export class InscripcionProcessorService extends DomainEventSubscriber<any> {
  constructor(
    eventFactory: EventFactory,
    messageBroker: MessageBrokerService,
    private readonly paymentService: PaymentService,
    private readonly courseService: CourseService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly eventPublisher: DomainEventPublisher
  ) {
    super(eventFactory, messageBroker);
  }

  obtenerEventosInteres(): string[] {
    return [
      'UsuarioRegistradoEvent',
      'CursoCompletadoEvent', 
      'PagoRealizadoEvent',
      'InscripcionSolicitadaEvent'
    ];
  }

  async manejarEvento(evento: DomainEvent): Promise<void> {
    switch (evento.constructor.name) {
      case 'InscripcionSolicitadaEvent':
        await this.procesarInscripcion(evento as InscripcionSolicitadaEvent);
        break;
        
      case 'PagoRealizadoEvent':
        await this.confirmarInscripcionConPago(evento as PagoRealizadoEvent);
        break;
        
      case 'CursoCompletadoEvent':
        await this.generarCertificado(evento as CursoCompletadoEvent);
        break;
        
      case 'UsuarioRegistradoEvent':
        await this.procesarNuevoUsuario(evento as UsuarioRegistradoEvent);
        break;
        
      default:
        console.log(`Evento no manejado: ${evento.constructor.name}`);
    }
  }

  private async procesarInscripcion(evento: InscripcionSolicitadaEvent): Promise<void> {
    try {
      const saga = new InscripcionSaga(evento.inscripcionId);
      
      // Paso 1: Verificar que el usuario esté activo
      saga.agregarPaso('Verificando usuario activo');
      const usuarioActivo = await this.userService.validarUsuarioActivo(evento.usuarioId);
      
      if (!usuarioActivo) {
        await this.publicarEventoCompensacion(
          new InscripcionRechazadaEvent(evento.inscripcionId, 'Usuario no activo')
        );
        return;
      }

      // Paso 2: Verificar disponibilidad del curso
      saga.agregarPaso('Verificando disponibilidad del curso');
      const cursoDisponible = await this.courseService.verificarDisponibilidad(
        evento.cursoId, evento.fechaInicio
      );
      
      if (!cursoDisponible) {
        await this.publicarEventoCompensacion(
          new InscripcionRechazadaEvent(evento.inscripcionId, 'Curso no disponible')
        );
        return;
      }

      // Paso 3: Reservar cupo en el curso
      saga.agregarPaso('Reservando cupo en el curso');
      await this.courseService.reservarCupo(evento.cursoId, evento.usuarioId);

      // Paso 4: Procesar pago si es requerido
      if (evento.requierePago && evento.monto && evento.metodoPago) {
        saga.agregarPaso('Procesando pago');
        
        // Verificar fondos primero
        const fondosDisponibles = await this.paymentService.verificarDisponibilidadFondos(
          evento.usuarioId, evento.monto
        );
        
        if (!fondosDisponibles) {
          await this.publicarEventoCompensacion(
            new PagoFallidoEvent(evento.inscripcionId, 'Fondos insuficientes')
          );
          return;
        }
        
        const pagoResult = await this.paymentService.procesarPago({
          monto: evento.monto,
          metodoPago: evento.metodoPago,
          usuarioId: evento.usuarioId
        });

        if (!pagoResult.exitoso) {
          await this.publicarEventoCompensacion(
            new PagoFallidoEvent(evento.inscripcionId, pagoResult.error || 'Error en el pago')
          );
          return;
        }
      }

      // Paso 5: Confirmar inscripción
      saga.agregarPaso('Confirmando inscripción');
      saga.marcarExitoso();
      
      await this.publicarEventoCompensacion(
        new InscripcionConfirmadaEvent(
          evento.inscripcionId,
          evento.usuarioId,
          evento.cursoId,
          new Date()
        )
      );

    } catch (error) {
      console.error(`Error en procesamiento de inscripción ${evento.inscripcionId}:`, error);
      await this.publicarEventoCompensacion(
        new InscripcionFallidaEvent(evento.inscripcionId, error.message)
      );
    }
  }

  private async confirmarInscripcionConPago(evento: PagoRealizadoEvent): Promise<void> {
    try {
      console.log(`Confirmando inscripción tras pago exitoso: ${evento.pagoId}`);
      
      // Actualizar registros de inscripción
      for (const cursoId of evento.cursosAdquiridos) {
        await this.userService.agregarInscripcion(evento.usuarioId, cursoId);
      }

      // Enviar email de confirmación
      await this.emailService.enviarConfirmacionInscripcion({
        usuarioId: evento.usuarioId,
        cursos: evento.cursosAdquiridos,
        monto: evento.monto
      });
      
      console.log(`Inscripción confirmada para usuario ${evento.usuarioId}`);
      
    } catch (error) {
      console.error(`Error confirmando inscripción para pago ${evento.pagoId}:`, error);
      // Aquí se podrían implementar acciones de compensación
    }
  }

  private async generarCertificado(evento: CursoCompletadoEvent): Promise<void> {
    try {
      console.log(`Generando certificado para curso completado: ${evento.cursoId}`);
      
      if (evento.certificadoGenerado && evento.calificacionFinal >= 70) {
        await this.emailService.enviarCertificado(evento.estudianteId, evento.cursoId);
        console.log(`Certificado enviado a estudiante ${evento.estudianteId}`);
      } else {
        console.log(`No se puede generar certificado - Calificación: ${evento.calificacionFinal}`);
      }
      
    } catch (error) {
      console.error(`Error generando certificado:`, error);
    }
  }

  private async procesarNuevoUsuario(evento: UsuarioRegistradoEvent): Promise<void> {
    try {
      console.log(`Procesando nuevo usuario registrado: ${evento.usuarioId}`);
      console.log(`Tipo de usuario: ${evento.tipoUsuario}`);
      console.log(`Email: ${evento.email}`);
      console.log(`Perfil completo: ${evento.perfilCompleto}`);
      
      // Aquí se podrían agregar acciones como:
      // - Enviar email de bienvenida
      // - Asignar cursos gratuitos
      // - Configurar preferencias por defecto
      
    } catch (error) {
      console.error(`Error procesando nuevo usuario:`, error);
    }
  }

  private async publicarEventoCompensacion(evento: DomainEvent): Promise<void> {
    try {
      await this.eventPublisher.publicarEvento(evento);
    } catch (error) {
      console.error(`Error publicando evento de compensación:`, error);
    }
  }
}
