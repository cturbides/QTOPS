import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class IndicadorEscritura {
    @Field(() => Usuario)
    usuario: Usuario;

    @Field(() => ID)
    cursoId: string;

    @Field(() => Date)
    ultimaActividad: Date;
}