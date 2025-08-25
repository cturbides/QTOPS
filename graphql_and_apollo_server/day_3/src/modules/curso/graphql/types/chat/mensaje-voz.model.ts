import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { EstadoReproduccion } from '@modules/curso/entities/chat/mensaje-voz.entity';

registerEnumType(EstadoReproduccion, {
    name: 'EstadoReproduccion',
    description: 'Estados de reproducción de mensaje de voz'
});

@ObjectType()
export class MetadatosAudio {
    @Field()
    calidad: string;

    @Field()
    formatoCompresion: string;

    @Field()
    tamanoBytes: number;

    @Field(() => Date)
    fechaCreacion: Date;
}

@ObjectType()
export class MensajeVoz {
    @Field(() => ID)
    id: string;

    @Field()
    duracion: number;

    @Field()
    urlAudio: string;

    @Field({ nullable: true })
    transcripcion?: string;

    @Field(() => EstadoReproduccion)
    estadoReproduccion: EstadoReproduccion;

    @Field(() => MetadatosAudio)
    metadatos: MetadatosAudio;
}
