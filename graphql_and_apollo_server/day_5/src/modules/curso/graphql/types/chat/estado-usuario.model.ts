import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { Estado } from '@modules/curso/entities/chat/estado-usuario.type';

@ObjectType()
export class EstadoUsuario {
    @Field(() => Usuario)
    usuario: Usuario;

    @Field(() => ID)
    cursoId: string;

    @Field(() => Estado)
    estado: Estado;

    @Field(() => Date)
    ultimaConexion: Date;
}