import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ArchivoAdjunto {
    @Field(() => ID)
    id: string;

    @Field()
    nombre: string;

    @Field()
    url: string;

    @Field()
    tipo: string;

    @Field()
    tamano: number;
}