import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class SincronizarEstadoInput {
    @Field(() => ID)
    usuarioId: string;

    @Field(() => ID)
    salaId: string;

    @Field(() => Date, { nullable: true })
    ultimaConexion?: Date;
}

@InputType()
export class ObtenerMensajesSalaInput {
    @Field(() => ID)
    usuarioId: string;

    @Field(() => ID)
    salaId: string;

    @Field(() => Number, { defaultValue: 50 })
    limite?: number;

    @Field(() => Number, { defaultValue: 0 })
    offset?: number;

    @Field(() => Date, { nullable: true })
    desdeTimestamp?: Date;
}
