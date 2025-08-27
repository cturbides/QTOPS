import { Field, ID, InputType } from '@nestjs/graphql';
import { TipoSala } from '@modules/curso/entities/chat/sala-privada.entity';

@InputType()
export class ConfiguracionSalaInput {
    @Field(() => Boolean, { defaultValue: true })
    mensajesVozPermitidos?: boolean;

    @Field(() => Boolean, { defaultValue: true })
    notificacionesSonido?: boolean;

    @Field(() => Number, { nullable: true })
    limiteMensajes?: number;

    @Field(() => Boolean, { defaultValue: true })
    archivoCompartido?: boolean;
}

@InputType()
export class CrearSalaPrivadaInput {
    @Field()
    nombre: string;

    @Field({ nullable: true })
    descripcion?: string;

    @Field(() => TipoSala, { defaultValue: TipoSala.PRIVADA })
    tipo?: TipoSala;

    @Field(() => ID)
    creadorId: string;

    @Field(() => [ID])
    participantesIds: string[];

    @Field(() => ConfiguracionSalaInput, { nullable: true })
    configuracion?: ConfiguracionSalaInput;
}
