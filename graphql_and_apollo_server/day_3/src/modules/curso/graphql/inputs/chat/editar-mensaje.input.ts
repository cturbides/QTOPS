import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class EditarMensajeInput {
    @Field(() => ID)
    usuarioId: string;

    @Field(() => ID)
    mensajeId: string;

    @Field()
    contenido: string;
}