import { Injectable } from '@nestjs/common';
import { dataSource } from '@modules/curso/data-source';
import { MensajeChat } from '@modules/curso/entities/mensaje-chat.entity';
import { TipoMensaje } from '@modules/curso/entities/chat/tipo-mensaje.enum';
import { EnviarMensajeVozDto } from '@modules/curso/dto/chat/enviar-mensaje-voz.dto';
import { MensajeVoz, EstadoReproduccion } from '@modules/curso/entities/chat/mensaje-voz.entity';

@Injectable()
export class MensajeVozService {
    async crearMensajeVoz(dto: EnviarMensajeVozDto): Promise<MensajeChat> {
        const autor = dataSource.usuarios.find(u => u.id === dto.usuarioId);

        if (!autor) {
            throw new Error('Usuario no encontrado');
        }

        const mensajeVoz: MensajeVoz = {
            id: `voz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            duracion: dto.duracion,
            urlAudio: dto.urlAudio,
            transcripcion: dto.transcripcion,
            estadoReproduccion: EstadoReproduccion.NO_REPRODUCIDO,
            metadatos: {
                ...dto.metadatos,
                fechaCreacion: new Date()
            }
        };

        const mensaje: MensajeChat = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tipo: TipoMensaje.AUDIO,
            editado: false,
            cursoId: dto.cursoId || '',
            salaId: dto.salaId,
            fechaEnvio: new Date(),
            contenido: `[Mensaje de voz - ${dto.duracion}s]`,
            autor,
            mensajeVoz,
            respondePor: dto.respondePor
        };

        dataSource.mensajes.set(mensaje.id, mensaje);

        if (dto.cursoId) {
            const mensajesCurso = dataSource.mensajesPorCurso.get(dto.cursoId) || [];
            mensajesCurso.push(mensaje.id);
            dataSource.mensajesPorCurso.set(dto.cursoId, mensajesCurso);
        }

        if (dto.salaId) {
            const mensajesSala = dataSource.mensajesPorSala.get(dto.salaId) || [];
            mensajesSala.push(mensaje.id);
            dataSource.mensajesPorSala.set(dto.salaId, mensajesSala);
        }

        return mensaje;
    }

    async actualizarEstadoReproduccion(
        mensajeId: string,
        _usuarioId: string,
        estado: EstadoReproduccion
    ): Promise<boolean> {
        const mensaje = dataSource.mensajes.get(mensajeId);
        if (!mensaje || !mensaje.mensajeVoz) {
            throw new Error('Mensaje de voz no encontrado');
        }

        // En un sistema real, esto sería por usuario, aquí simplificamos
        mensaje.mensajeVoz.estadoReproduccion = estado;

        return true;
    }

    async generarTranscripcionDummy(urlAudio: string): Promise<string> {
        // Simulación de transcripción automática
        const transcripcionesDummy = [
            "Hola, este es un mensaje de voz de prueba.",
            "¿Podrías revisar el documento que te envié?",
            "Nos vemos en la reunión de mañana.",
            "Gracias por la información, muy útil.",
            "¿Tienes tiempo para revisar esto juntos?",
        ];

        const randomIndex = Math.floor(Math.random() * transcripcionesDummy.length);
        return transcripcionesDummy[randomIndex];
    }

    async obtenerMensajesVozPorSala(salaId: string): Promise<MensajeChat[]> {
        const mensajesIds = dataSource.mensajesPorSala.get(salaId) || [];
        return mensajesIds
            .map(id => dataSource.mensajes.get(id))
            .filter(mensaje => mensaje && mensaje.tipo === TipoMensaje.AUDIO) as MensajeChat[];
    }

    async obtenerEstadisticasVoz(salaId: string): Promise<any> {
        const mensajesVoz = await this.obtenerMensajesVozPorSala(salaId);

        const totalMensajes = mensajesVoz.length;
        const duracionTotal = mensajesVoz.reduce((total, msg) =>
            total + (msg.mensajeVoz?.duracion || 0), 0
        );
        const mensajesConTranscripcion = mensajesVoz.filter(msg =>
            msg.mensajeVoz?.transcripcion
        ).length;

        return {
            totalMensajes,
            duracionTotal,
            duracionPromedio: totalMensajes > 0 ? duracionTotal / totalMensajes : 0,
            porcentajeConTranscripcion: totalMensajes > 0 ?
                (mensajesConTranscripcion / totalMensajes) * 100 : 0
        };
    }
}
