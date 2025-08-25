import { Field, ID, InputType } from '@nestjs/graphql';
import { Estado } from '@modules/curso/entities/chat/estado-usuario.type';

@InputType()
export class CambiarEstadoInput {
    @Field(() => ID)
    usuarioId: string;

    @Field(() => ID)
    cursoId: string;

    @Field(() => Estado)
    estado: Estado;
}