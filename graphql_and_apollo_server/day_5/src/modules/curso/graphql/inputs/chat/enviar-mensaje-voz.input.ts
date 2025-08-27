import { Field, ID, InputType, registerEnumType } from '@nestjs/graphql';

export enum CalidadAudio {
    BAJA = 'BAJA',
    ALTA = 'ALTA',
    MEDIA = 'MEDIA',
}

export enum FormatoDeCompresion {
    MP3 = 'MP3',
    OGG = 'OGG',
    WEBM = 'WEBM',
}

registerEnumType(CalidadAudio, {
    name: 'CalidadAudio',
    description: 'Calidad de audio para mensajes de voz',
});

registerEnumType(FormatoDeCompresion, {
    name: 'FormatoDeCompresion', 
    description: 'Formatos de compresión de audio soportados',
});

@InputType()
export class MetadatosAudioInput {
    @Field(() => CalidadAudio, { defaultValue: CalidadAudio.MEDIA })
    calidad?: CalidadAudio;


    @Field(() => FormatoDeCompresion, { defaultValue: FormatoDeCompresion.MP3 })
    formatoCompresion?: FormatoDeCompresion;

    @Field()
    tamanoBytes: number;
}

@InputType()
export class EnviarMensajeVozInput {
    @Field(() => ID)
    usuarioId: string;

    @Field(() => ID, { nullable: true })
    cursoId?: string;

    @Field(() => ID, { nullable: true })
    salaId?: string;

    @Field()
    duracion: number;

    @Field()
    urlAudio: string;

    @Field({ nullable: true })
    transcripcion?: string;

    @Field(() => MetadatosAudioInput)
    metadatos: MetadatosAudioInput;

    @Field(() => ID, { nullable: true })
    respondePor?: string;
}
