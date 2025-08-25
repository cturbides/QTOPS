import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class IndicarEscrituraInput {
    @Field(() => ID)
    usuarioId: string;

    @Field(() => ID)
    cursoId: string;

    @Field()
    escribiendo: boolean;
}