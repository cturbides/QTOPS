import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TipoEvento, EstadoConexion } from '@modules/curso/entities/chat/sincronizacion-estado.entity';

registerEnumType(TipoEvento, {
    name: 'TipoEvento',
    description: 'Tipos de eventos para sincronización'
});

registerEnumType(EstadoConexion, {
    name: 'EstadoConexion',
    description: 'Estados de conexión del usuario'
});

@ObjectType()
export class EventoPendiente {
    @Field(() => ID)
    id: string;

    @Field(() => TipoEvento)
    tipo: TipoEvento;

    @Field()
    datos: string; // JSON serializado

    @Field(() => Date)
    fechaEvento: Date;

    @Field()
    procesado: boolean;
}

@ObjectType()
export class SincronizacionEstado {
    @Field(() => ID)
    id: string;

    @Field(() => ID)
    usuarioId: string;

    @Field(() => ID)
    salaId: string;

    @Field(() => Date)
    ultimaConexion: Date;

    @Field(() => [String])
    mensajesSincronizados: string[];

    @Field(() => [EventoPendiente])
    eventosPendientes: EventoPendiente[];

    @Field(() => EstadoConexion)
    estadoConexion: EstadoConexion;
}
