import { Usuario } from './usuario.model';
import { Leccion } from './leccion.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EstadisticasCurso } from './estadisticas-curso.model';

@ObjectType()
export class Curso {
    @Field(() => ID)
    id: string;

    @Field()
    titulo: string;

    @Field()
    descripcion: string;

    @Field(() => Usuario)
    instructor: Usuario;

    @Field(() => [Leccion])
    lecciones: Leccion[];

    @Field(() => [String], { nullable: true })
    etiquetas?: string[];

    @Field(() => EstadisticasCurso)
    estadisticas: EstadisticasCurso;
}
