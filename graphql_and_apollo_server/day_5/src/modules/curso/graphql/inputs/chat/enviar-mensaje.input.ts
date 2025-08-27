import { Field, ID, InputType } from '@nestjs/graphql';
import { TipoMensaje } from '@modules/curso/entities/chat/tipo-mensaje.enum';

@InputType()
export class EnviarMensajeInput {
    @Field(() => ID)
    usuarioId: string;

    @Field(() => ID, { nullable: true })
    cursoId?: string;

    @Field(() => ID, { nullable: true })
    salaId?: string;

    @Field()
    contenido: string;

    @Field(() => TipoMensaje, { defaultValue: TipoMensaje.TEXTO })
    tipo?: TipoMensaje;

    @Field(() => [String], { nullable: true })
    adjuntos?: string[];

    @Field(() => ID, { nullable: true })
    respondePor?: string;
}