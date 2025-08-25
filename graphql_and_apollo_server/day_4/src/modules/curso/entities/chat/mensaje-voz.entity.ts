export type MensajeVoz = {
    id: string;
    duracion: number; // en segundos (dummy)
    urlAudio: string; // URL dummy del archivo de audio
    transcripcion?: string; // transcripción automática (opcional)
    estadoReproduccion: EstadoReproduccion;
    metadatos: MetadatosAudio;
};

export enum EstadoReproduccion {
    PAUSADO = 'PAUSADO',
    REPRODUCIDO = 'REPRODUCIDO',
    REPRODUCIENDO = 'REPRODUCIENDO',
    NO_REPRODUCIDO = 'NO_REPRODUCIDO',
}

export enum CalidadAudio {
    BAJA = 'BAJA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
}

export enum FormatoDeCompresion {
    MP3 = 'MP3',
    OGG = 'OGG',
    WEBM = 'WEBM',
}

export type MetadatosAudio = {
    tamanoBytes: number;
    fechaCreacion: Date;
    calidad: CalidadAudio;
    formatoCompresion: FormatoDeCompresion;
};
