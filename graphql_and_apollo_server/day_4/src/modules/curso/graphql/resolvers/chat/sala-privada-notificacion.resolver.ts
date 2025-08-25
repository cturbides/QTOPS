import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from 'src/constants/common';
import { Resolver, Args, Subscription } from '@nestjs/graphql';
import { MensajeChat } from '@modules/curso/graphql/types/chat.model';
import {
    NUEVO_MENSAJE_SALA_SUB,
    USUARIO_UNIDO_SALA_SUB,
    USUARIO_ABANDONO_SALA_SUB,
    SINCRONIZACION_ESTADO_SUB,
} from '@modules/curso/graphql/common/subscription.constants';

@Resolver()
export class SalaPrivadaNotificacionResolver {
    constructor(
        @Inject(PUB_SUB)
        private readonly pubSub: PubSub,
    ) { }

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
    sincronizacionEstado(
        @Args('usuarioId') usuarioId: string,
        @Args('salaId') salaId: string
    ) {
        return this.pubSub.asyncIterableIterator(`${SINCRONIZACION_ESTADO_SUB}_${usuarioId}_${salaId}`);
    }
}
