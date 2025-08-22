import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InscripcionNotificacion {
    @Field(() => ID)
    cursoId: string;

    @Field()
    estudianteId: string;

    @Field()
    mensaje: string;

    @Field()
    timestamp: string;
}
