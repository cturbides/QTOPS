import { Field, ArgsType, ID } from "@nestjs/graphql";

@ArgsType()
export class InscribirEnCursoArgs {
    @Field(() => ID)
    cursoId: string;

    @Field(() => ID)
    estudianteId: string;
}