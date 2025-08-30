import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { PagoRealizadoEvent } from '../domain-events/pago-realizado.event';
import { CursoCompletadoEvent } from '../domain-events/curso-completado.event';
import { Controller, Post, Body, Get, Param, Logger, Req } from '@nestjs/common';
import { DomainEventPublisher } from '../services/domain-event-publisher.service';
import { UsuarioRegistradoEvent } from '../domain-events/usuario-registrado.event';
import { InscripcionSolicitadaEvent } from '../domain-events/inscripcion-solicitada.event';

@Controller('eventos')
export class EventosController {
  constructor(
    private readonly logger: Logger,
    private readonly eventPublisher: DomainEventPublisher
  ) {}

  @Post('inscripcion/solicitar')
  async solicitarInscripcion(
    @Body() body: {
      usuarioId: string;
      cursoId: string;
      fechaInicio: string;
      requierePago: boolean;
      monto?: number;
      metodoPago?: string;
    },
    @Req() req: Request
  ) {
    this.logger.log(`🔄 [INSCRIPCION] Request recibido desde ${req.ip} - Headers: ${JSON.stringify(req.headers, null, 2)}`);
    this.logger.log(`🔄 [INSCRIPCION] Body: ${JSON.stringify(body, null, 2)}`);

    const evento = new InscripcionSolicitadaEvent(
      uuidv4(),
      body.usuarioId,
      body.cursoId,
      new Date(body.fechaInicio),
      body.requierePago,
      body.monto,
      body.metodoPago
    );

    await this.eventPublisher.publicarEvento(evento);

    this.logger.log(`✅ [INSCRIPCION] Evento publicado exitosamente - EventID: ${evento.eventId}`);

    return {
      message: 'Solicitud de inscripción enviada',
      inscripcionId: evento.inscripcionId,
      eventId: evento.eventId
    };
  }

  @Post('usuario/registrar')
  async registrarUsuario(
    @Body() body: {
      usuarioId: string;
      email: string;
      tipoUsuario: TipoUsuario;
      perfilCompleto: boolean;
    },
    @Req() req: Request
  ) {
    this.logger.log(`🔄 [USUARIO] Request recibido desde ${req.ip} - Headers: ${JSON.stringify(req.headers, null, 2)}`);
    this.logger.log(`🔄 [USUARIO] Body: ${JSON.stringify(body, null, 2)}`);

    const evento = new UsuarioRegistradoEvent(
      body.usuarioId,
      body.email,
      body.tipoUsuario,
      body.perfilCompleto
    );

    await this.eventPublisher.publicarEvento(evento);

    this.logger.log(`✅ [USUARIO] Evento publicado exitosamente - EventID: ${evento.eventId}`);

    return {
      message: 'Usuario registrado',
      eventId: evento.eventId
    };
  }

  @Post('pago/confirmar')
  async confirmarPago(@Body() body: {
    pagoId: string;
    usuarioId: string;
    monto: number;
    metodoPago: string;
    cursosAdquiridos: string[];
  }) {
    const evento = new PagoRealizadoEvent(
      body.pagoId,
      body.usuarioId,
      body.monto,
      body.metodoPago,
      body.cursosAdquiridos
    );

    await this.eventPublisher.publicarEvento(evento);

    return {
      message: 'Pago confirmado',
      eventId: evento.eventId
    };
  }

  @Post('curso/completar')
  async completarCurso(@Body() body: {
    estudianteId: string;
    cursoId: string;
    calificacionFinal: number;
    certificadoGenerado: boolean;
  }) {
    const evento = new CursoCompletadoEvent(
      body.estudianteId,
      body.cursoId,
      body.calificacionFinal,
      new Date(),
      body.certificadoGenerado
    );

    await this.eventPublisher.publicarEvento(evento);

    return {
      message: 'Curso completado',
      eventId: evento.eventId
    };
  }

  @Get('test/flujo-completo/:usuarioId/:cursoId')
  async probarFlujoCompleto(
    @Param('usuarioId') usuarioId: string,
    @Param('cursoId') cursoId: string
  ) {
    const eventos = [];

    // 1. Registrar usuario
    const eventoUsuario = new UsuarioRegistradoEvent(
      usuarioId,
      `usuario${usuarioId}@example.com`,
      TipoUsuario.ESTUDIANTE,
      true
    );
    await this.eventPublisher.publicarEvento(eventoUsuario);
    eventos.push({ tipo: 'UsuarioRegistrado', eventId: eventoUsuario.eventId });

    // 2. Solicitar inscripción
    const eventoInscripcion = new InscripcionSolicitadaEvent(
      uuidv4(),
      usuarioId,
      cursoId,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En una semana
      true,
      150,
      'tarjeta_credito'
    );
    await this.eventPublisher.publicarEvento(eventoInscripcion);
    eventos.push({ tipo: 'InscripcionSolicitada', eventId: eventoInscripcion.eventId });

    return {
      message: 'Flujo completo iniciado',
      eventos
    };
  }
}
