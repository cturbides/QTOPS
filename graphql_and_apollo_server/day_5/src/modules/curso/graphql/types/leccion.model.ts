import { Field, ID, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Leccion {
    @Field(() => ID)
    id: string;

    @Field()
    titulo: string;

    @Field({ nullable: true })
    contenido?: string;

    @Field(() => Int)
    orden: number;
}
