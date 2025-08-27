import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class GenericResponseMessage {
    @Field()
    message: string;

    @Field()
    success: boolean;
}