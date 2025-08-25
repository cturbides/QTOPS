import { Usuario } from './usuario.model';
import { MensajeVoz } from './chat/mensaje-voz.model';
import { ArchivoAdjunto } from './chat/archivo-adjunto.model';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Estado } from '@modules/curso/entities/chat/estado-usuario.type';
import { TipoMensaje } from '@modules/curso/entities/chat/tipo-mensaje.enum';
import { TipoNotificacion } from '@modules/curso/entities/notificacion/tipo-notificacion.enum';

registerEnumType(TipoMensaje, {
  name: 'TipoMensaje',
  description: 'Tipos de mensaje en el chat'
});

registerEnumType(Estado, {
  name: 'Estado',
  description: 'Estados de presencia de usuario'
});

registerEnumType(TipoNotificacion, {
  name: 'TipoNotificacion',
  description: 'Tipos de notificación en tiempo real'
});

@ObjectType()
export class MensajeChat {
  @Field(() => ID)
  id: string;

  @Field()
  contenido: string;

  @Field(() => Usuario)
  autor: Usuario;

  @Field(() => ID)
  cursoId: string;

  @Field(() => ID, { nullable: true })
  salaId?: string;

  @Field(() => Date)
  fechaEnvio: Date;

  @Field(() => TipoMensaje)
  tipo: TipoMensaje;

  @Field(() => [ArchivoAdjunto], { nullable: true })
  adjuntos?: ArchivoAdjunto[];

  @Field(() => Boolean)
  editado: boolean;

  @Field(() => Date, { nullable: true })
  fechaEdicion?: Date;

  @Field(() => MensajeVoz, { nullable: true })
  mensajeVoz?: MensajeVoz;

  @Field(() => ID, { nullable: true })
  respondePor?: string;
}



