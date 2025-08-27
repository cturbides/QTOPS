import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class ProgresoEstudiante {
  @Field(() => ID)
  estudianteId: string;

  @Field(() => ID)
  cursoId: string;

  @Field(() => Int)
  porcentajeCompletado: number;

  @Field(() => [ID])
  leccionesVistas: string[];

  @Field(() => Int, { nullable: true })
  tiempoInvertido?: number;

  @Field({ nullable: true })
  ultimaActividad?: Date;
}
