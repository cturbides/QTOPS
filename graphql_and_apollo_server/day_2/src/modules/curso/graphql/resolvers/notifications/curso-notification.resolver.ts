import { Inject } from '@nestjs/common';
import { PUB_SUB } from 'src/constants/common';
import { PubSub } from 'graphql-subscriptions';
import { Args, ID, Resolver, Subscription } from '@nestjs/graphql';
import { ESTUDIANTE_INSCRITO_EN_CURSO_SUB } from '@modules/curso/graphql/common/subscription.constants';
import { PubSubAsyncIterableIterator } from 'graphql-subscriptions/dist/pubsub-async-iterable-iterator';
import { InscripcionNotificacion } from '@modules/curso/graphql/types/notifications/inscription-notification.model';

@Resolver()
export class CursoNotificationResolver {
    constructor(
        @Inject(PUB_SUB)
        private readonly pubSub: PubSub,
    ) { }

    @Subscription(() => InscripcionNotificacion, {
        name: ESTUDIANTE_INSCRITO_EN_CURSO_SUB,
        filter: (payload: InscripcionNotificacion, variables: { cursoId: string }) =>
            payload?.cursoId === variables.cursoId,
        resolve: (payload: InscripcionNotificacion) => payload
    })
    async estudianteInscritoEnCurso(
        @Args('cursoId', { type: () => ID })
        _cursoId: string
    ): Promise<PubSubAsyncIterableIterator<InscripcionNotificacion>> {
        return this.pubSub.asyncIterableIterator<InscripcionNotificacion>(ESTUDIANTE_INSCRITO_EN_CURSO_SUB);
    }
}