import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class ProgresoInput {
  @Field(() => ID)
  estudianteId: string;

  @Field(() => ID)
  cursoId: string;
}
