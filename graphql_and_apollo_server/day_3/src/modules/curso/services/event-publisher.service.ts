import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from 'src/constants/common';
import { Injectable, Inject } from '@nestjs/common';
import { MensajeChat } from '@modules/curso/entities/mensaje-chat.entity';
import { Notificacion } from '@modules/curso/entities/notificacion.entity';
import { EstadoUsuario } from '@modules/curso/entities/chat/estado-usuario.type';
import { TipoNotificacion } from '@modules/curso/entities/notificacion/tipo-notificacion.enum';
import {
  ESTADO_USUARIO_SUB,
  NUEVO_MENSAJE_CHAT_SUB,
  USUARIOS_ESCRIBIENDO_SUB,
  NOTIFICACION_TIEMPO_REAL_SUB
} from '@modules/curso/graphql/common/subscription.constants';

@Injectable()
export class EventPublisherService {
  constructor(
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub
  ) { }

  async publicarNuevoMensaje(mensaje: MensajeChat): Promise<void> {
    await this.pubSub.publish(`${NUEVO_MENSAJE_CHAT_SUB}_${mensaje.cursoId}`, {
      nuevoMensaje: mensaje
    });
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
