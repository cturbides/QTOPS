import { Inject } from '@nestjs/common';
import { PUB_SUB } from 'src/constants/common';
import { PubSub } from 'graphql-subscriptions';
import { Resolver, Subscription, Args } from '@nestjs/graphql';
import { MensajeChat } from '@modules/curso/graphql/types/chat.model';
import { EstadoUsuario } from '@modules/curso/graphql/types/chat/estado-usuario.model';
import { IndicadorEscritura } from '@modules/curso/graphql/types/chat/indicador-escritura.model';
import { NotificacionTiempoReal } from '@modules/curso/graphql/types/notifications/notification.model';
import {
    ESTADO_USUARIO_SUB,
    NUEVO_MENSAJE_SALA_SUB,
    NUEVO_MENSAJE_CHAT_SUB,
    USUARIO_UNIDO_SALA_SUB,
    EVENTOS_PENDIENTES_SUB,
    USUARIOS_ESCRIBIENDO_SUB,
    USUARIO_ABANDONO_SALA_SUB,
    SINCRONIZACION_ESTADO_SUB,
    NOTIFICACION_TIEMPO_REAL_SUB,
    MENSAJE_VOZ_REPRODUCCION_SUB,
} from '@modules/curso/graphql/common/subscription.constants';

@Resolver()
export class ChatNotificacionResolver {
    constructor(
        @Inject(PUB_SUB)
        private readonly pubSub: PubSub,
    ) { }

    @Subscription(() => MensajeChat, {
        filter: (payload, variables) => {
            return true;
        }
    })
    nuevoMensaje(
        @Args('cursoId') cursoId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${NUEVO_MENSAJE_CHAT_SUB}_${cursoId}`);
    }

    @Subscription(() => [IndicadorEscritura])
    usuariosEscribiendo(
        @Args('cursoId') cursoId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${USUARIOS_ESCRIBIENDO_SUB}_${cursoId}`);
    }

    @Subscription(() => EstadoUsuario)
    estadoEnCurso(
        @Args('cursoId') cursoId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${ESTADO_USUARIO_SUB}_${cursoId}`);
    }

    @Subscription(() => NotificacionTiempoReal)
    notificacionesUsuario(
        @Args('usuarioId') usuarioId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${NOTIFICACION_TIEMPO_REAL_SUB}_${usuarioId}`);
    }

    @Subscription(() => MensajeChat)
    nuevoMensajeSala(
        @Args('salaId') salaId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${NUEVO_MENSAJE_SALA_SUB}_${salaId}`);
    }

    @Subscription(() => String)
    usuarioUnidoSala(
        @Args('salaId') salaId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${USUARIO_UNIDO_SALA_SUB}_${salaId}`);
    }

    @Subscription(() => String)
    usuarioAbandonoSala(
        @Args('salaId') salaId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${USUARIO_ABANDONO_SALA_SUB}_${salaId}`);
    }

    @Subscription(() => String)
    mensajeVozReproduccion(
        @Args('salaId') salaId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${MENSAJE_VOZ_REPRODUCCION_SUB}_${salaId}`);
    }

    @Subscription(() => String)
    sincronizacionEstado(
        @Args('usuarioId') usuarioId: string,
        @Args('salaId') salaId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${SINCRONIZACION_ESTADO_SUB}_${usuarioId}_${salaId}`);
    }

    @Subscription(() => String)
    eventosPendientes(
        @Args('usuarioId') usuarioId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${EVENTOS_PENDIENTES_SUB}_${usuarioId}`);
    }
}
