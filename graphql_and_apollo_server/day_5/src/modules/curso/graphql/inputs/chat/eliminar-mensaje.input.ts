import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class EliminarMensajeInput {
    @Field(() => ID)
    mensajeId: string;

    @Field(() => ID)
    usuarioId: string;
}
