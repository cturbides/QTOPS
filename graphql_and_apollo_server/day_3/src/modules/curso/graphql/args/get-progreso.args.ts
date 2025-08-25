import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class GetProgresoArgs {
    @Field(() => ID)
    estudianteId: string;

    @Field(() => ID)
    cursoId: string;
}
