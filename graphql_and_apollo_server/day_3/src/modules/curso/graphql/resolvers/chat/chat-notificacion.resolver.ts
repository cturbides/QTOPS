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
    NUEVO_MENSAJE_CHAT_SUB,
    USUARIOS_ESCRIBIENDO_SUB,
    NOTIFICACION_TIEMPO_REAL_SUB
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
}
