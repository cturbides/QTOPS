import { Injectable } from '@nestjs/common';
import { DomainEvent } from '../domain-event.base';

import { PagoFallidoEvent } from '../domain-events/pago-fallido.event';
import { PagoRealizadoEvent } from '../domain-events/pago-realizado.event';
import { CursoCompletadoEvent } from '../domain-events/curso-completado.event';
import { UsuarioRegistradoEvent } from '../domain-events/usuario-registrado.event';
import { InscripcionFallidaEvent } from '../domain-events/inscripcion-fallida.event';
import { InscripcionRechazadaEvent } from '../domain-events/inscripcion-rechazada.event';
import { InscripcionSolicitadaEvent } from '../domain-events/inscripcion-solicitada.event';
import { InscripcionConfirmadaEvent } from '../domain-events/inscripcion-confirmada.event';

@Injectable()
export class EventFactory {
  private eventMap = new Map<string, any>([
    ['PagoFallidoEvent', PagoFallidoEvent],
    ['PagoRealizadoEvent', PagoRealizadoEvent],
    ['CursoCompletadoEvent', CursoCompletadoEvent],
    ['UsuarioRegistradoEvent', UsuarioRegistradoEvent],
    ['InscripcionFallidaEvent', InscripcionFallidaEvent],
    ['InscripcionRechazadaEvent', InscripcionRechazadaEvent],
    ['InscripcionSolicitadaEvent', InscripcionSolicitadaEvent],
    ['InscripcionConfirmadaEvent', InscripcionConfirmadaEvent],
  ]);

  crearEvento(eventType: string, payload: any): DomainEvent {
    const EventClass = this.eventMap.get(eventType);

    if (!EventClass) {
      console.warn(`Tipo de evento no reconocido: ${eventType}`);
      return payload as DomainEvent;
    }

    // Crear una nueva instancia del evento con los datos del payload
    const evento = Object.create(EventClass.prototype);

    // Convertir strings de fecha de vuelta a objetos Date
    const processedPayload = this.procesarFechas(payload);
    Object.assign(evento, processedPayload);

    return evento;
  }

  private procesarFechas(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string' && this.esStringFecha(obj)) {
      return new Date(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.procesarFechas(item));
    }

    if (typeof obj === 'object') {
      const processed = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key.includes('fecha') || key.includes('timestamp') || key === 'fechaInicio' || key === 'fechaFinalizacion') {
          processed[key] = typeof value === 'string' ? new Date(value) : value;
        } else {
          processed[key] = this.procesarFechas(value);
        }
      }
      return processed;
    }

    return obj;
  }

  private esStringFecha(str: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(str);
  }
}
