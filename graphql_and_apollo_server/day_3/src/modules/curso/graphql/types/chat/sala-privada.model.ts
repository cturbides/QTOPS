import { Usuario } from '../usuario.model';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TipoSala } from '@modules/curso/entities/chat/sala-privada.entity';

registerEnumType(TipoSala, {
    name: 'TipoSala',
    description: 'Tipos de sala de chat'
});

@ObjectType()
export class ConfiguracionSala {
    @Field(() => Boolean)
    mensajesVozPermitidos: boolean;

    @Field(() => Boolean)
    notificacionesSonido: boolean;

    @Field(() => Number, { nullable: true })
    limiteMensajes?: number;

    @Field(() => Boolean)
    archivoCompartido: boolean;
}

@ObjectType()
export class SalaPrivada {
    @Field(() => ID)
    id: string;

    @Field()
    nombre: string;

    @Field({ nullable: true })
    descripcion?: string;

    @Field(() => TipoSala)
    tipo: TipoSala;

    @Field(() => Usuario)
    creador: Usuario;

    @Field(() => [Usuario])
    participantes: Usuario[];

    @Field(() => Date)
    fechaCreacion: Date;

    @Field(() => Date)
    ultimaActividad: Date;

    @Field(() => ConfiguracionSala)
    configuracion: ConfiguracionSala;
}
