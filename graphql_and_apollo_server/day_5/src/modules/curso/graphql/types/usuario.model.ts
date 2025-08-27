import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Usuario {
    @Field(() => ID)
    id: string;

    @Field()
    nombreCompleto: string;

    @Field(() => String, { nullable: true })
    avatar?: string | null;

    @Field(() => String, { nullable: true })
    email?: string;
}
