import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from 'src/constants/common';
import { Injectable, Inject } from '@nestjs/common';
import { MensajeChat } from '@modules/curso/entities/mensaje-chat.entity';
import { Notificacion } from '@modules/curso/entities/notificacion.entity';
import { EstadoUsuario } from '@modules/curso/entities/chat/estado-usuario.type';
import { SalaPrivada } from '@modules/curso/entities/chat/sala-privada.entity';
import { TipoNotificacion } from '@modules/curso/entities/notificacion/tipo-notificacion.enum';
import {
  ESTADO_USUARIO_SUB,
  EVENTOS_PENDIENTES_SUB,
  NUEVO_MENSAJE_SALA_SUB,
  USUARIO_UNIDO_SALA_SUB,
  NUEVO_MENSAJE_CHAT_SUB,
  USUARIOS_ESCRIBIENDO_SUB,
  USUARIO_ABANDONO_SALA_SUB,
  SINCRONIZACION_ESTADO_SUB,
  NOTIFICACION_TIEMPO_REAL_SUB,
  MENSAJE_VOZ_REPRODUCCION_SUB,
} from '@modules/curso/graphql/common/subscription.constants';

@Injectable()
export class EventPublisherService {
  constructor(
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub
  ) { }

  async publicarNuevoMensaje(mensaje: MensajeChat): Promise<void> {
    if (mensaje.cursoId) {
      await this.pubSub.publish(`${NUEVO_MENSAJE_CHAT_SUB}_${mensaje.cursoId}`, {
        nuevoMensaje: mensaje
      });
    }
  }

  async publicarNuevoMensajeSala(mensaje: MensajeChat): Promise<void> {
    if (mensaje.salaId) {
      await this.pubSub.publish(`${NUEVO_MENSAJE_SALA_SUB}_${mensaje.salaId}`, {
        nuevoMensajeSala: mensaje
      });
    }
  }

  async publicarIndicadorEscritura(cursoId: string, usuariosEscribiendo: any[]): Promise<void> {
    await this.pubSub.publish(`${USUARIOS_ESCRIBIENDO_SUB}_${cursoId}`, {
      usuariosEscribiendo
    });
  }

  async publicarCambioPresencia(cursoId: string, estado: EstadoUsuario): Promise<void> {
    await this.pubSub.publish(`${ESTADO_USUARIO_SUB}_${cursoId}`, {
      estadoUsuario: estado
    });
  }

  async publicarNotificacion(usuarioId: string, notificacion: Notificacion): Promise<void> {
    await this.pubSub.publish(`${NOTIFICACION_TIEMPO_REAL_SUB}_${usuarioId}`, {
      notificacionTiempoReal: notificacion
    });
  }

  async publicarUsuarioUnidoSala(salaId: string, usuario: any, sala: SalaPrivada): Promise<void> {
    await this.pubSub.publish(`${USUARIO_UNIDO_SALA_SUB}_${salaId}`, {
      usuarioUnidoSala: {
        usuario,
        sala,
        timestamp: new Date()
      }
    });
  }

  async publicarUsuarioAbandonoSala(salaId: string, usuario: any, sala: SalaPrivada): Promise<void> {
    await this.pubSub.publish(`${USUARIO_ABANDONO_SALA_SUB}_${salaId}`, {
      usuarioAbandonoSala: {
        usuario,
        sala,
        timestamp: new Date()
      }
    });
  }

  async publicarCambioReproduccionVoz(
    salaId: string,
    mensajeId: string,
    usuarioId: string,
    estado: string
  ): Promise<void> {
    await this.pubSub.publish(`${MENSAJE_VOZ_REPRODUCCION_SUB}_${salaId}`, {
      mensajeVozReproduccion: {
        mensajeId,
        usuarioId,
        estado,
        timestamp: new Date()
      }
    });
  }

  async publicarSincronizacionEstado(usuarioId: string, salaId: string, datos: any): Promise<void> {
    await this.pubSub.publish(`${SINCRONIZACION_ESTADO_SUB}_${usuarioId}_${salaId}`, {
      sincronizacionEstado: datos
    });
  }

  async publicarEventosPendientes(usuarioId: string, eventos: any[]): Promise<void> {
    await this.pubSub.publish(`${EVENTOS_PENDIENTES_SUB}_${usuarioId}`, {
      eventosPendientes: eventos
    });
  }

  async notificarMenciones(menciones: string[], mensaje: MensajeChat): Promise<void> {
    await Promise.all(menciones.map(async (mencionUsuario) => {
      const notificacion: Notificacion = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fechaCreacion: new Date(),
        tipo: TipoNotificacion.MENCION_CHAT,
        mensaje: `${mensaje.autor.nombreCompleto} te mencionó en el chat: "${mensaje.contenido.substring(0, 100)}${mensaje.contenido.length > 100 ? '...' : ''}"`,
        destinatario: {
          id: mencionUsuario,
          nombreCompleto: `Usuario ${mencionUsuario}`,
        },
        metadatos: JSON.stringify({
          mensajeId: mensaje.id,
          salaId: mensaje.salaId,
          cursoId: mensaje.cursoId,
          autorMencion: mensaje.autor.id
        })
      };

      await this.publicarNotificacion(mencionUsuario, notificacion);
    }));
  }

  async publicarEventoDesconexion(usuarioId: string): Promise<void> {
    // Lógica para notificar desconexión si es necesario
    // Por ejemplo, actualizar presencia en todos los cursos donde el usuario estaba activo
  }
}
