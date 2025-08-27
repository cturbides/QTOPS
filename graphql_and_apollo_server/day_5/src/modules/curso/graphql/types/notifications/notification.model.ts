import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { TipoNotificacion } from '@modules/curso/entities/notificacion/tipo-notificacion.enum';

@ObjectType()
export class NotificacionTiempoReal {
    @Field(() => ID)
    id: string;

    @Field()
    mensaje: string;

    @Field(() => TipoNotificacion)
    tipo: TipoNotificacion;

    @Field(() => Date)
    fechaCreacion: Date;

    @Field(() => Usuario)
    destinatario: Usuario;

    @Field(() => String, { nullable: true })
    metadatos?: string;
}