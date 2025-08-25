import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class ObtenerMensajesInput {
  @Field(() => ID)
  cursoId: string;

  @Field(() => ID)
  usuarioId: string;

  @Field({ defaultValue: 50 })
  limite: number;

  @Field({ defaultValue: 0 })
  offset: number;
}
