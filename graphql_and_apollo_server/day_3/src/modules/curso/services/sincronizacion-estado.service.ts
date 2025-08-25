import { Injectable } from '@nestjs/common';
import { dataSource } from '@modules/curso/data-source';
import { MensajeChat } from '@modules/curso/entities/mensaje-chat.entity';
import {
    TipoEvento,
    EstadoConexion,
    EventoPendiente,
    SincronizacionEstado,
} from '@modules/curso/entities/chat/sincronizacion-estado.entity';

@Injectable()
export class SincronizacionEstadoService {
    async inicializarSincronizacion(usuarioId: string, salaId: string): Promise<SincronizacionEstado> {
        const key = `${usuarioId}_${salaId}`;

        let sincronizacion = dataSource.sincronizacionEstados.get(key);

        if (!sincronizacion) {
            // Primera conexión del usuario a esta sala
            sincronizacion = {
                id: key,
                usuarioId,
                salaId,
                ultimaConexion: new Date(),
                mensajesSincronizados: [],
                eventosPendientes: [],
                estadoConexion: EstadoConexion.CONECTADO
            };

            dataSource.sincronizacionEstados.set(key, sincronizacion);
        } else {
            // Reconexión - mantener la fecha de última conexión anterior para comparación
            const anteriorUltimaConexion = sincronizacion.ultimaConexion;
            sincronizacion.estadoConexion = EstadoConexion.CONECTADO;
            
            // Solo actualizar la última conexión después de obtener eventos pendientes
            // La fecha anterior se usa para determinar qué eventos perdió
            sincronizacion.ultimaConexion = new Date();
        }

        return sincronizacion;
    }

    async obtenerEventosPendientes(usuarioId: string, salaId: string): Promise<EventoPendiente[]> {
        const key = `${usuarioId}_${salaId}`;
        const sincronizacion = dataSource.sincronizacionEstados.get(key);

        if (!sincronizacion) {
            return [];
        }

        return sincronizacion.eventosPendientes.filter(evento => !evento.procesado);
    }

    async obtenerMensajesDesdeUltimaConexion(
        usuarioId: string,
        salaId: string
    ): Promise<MensajeChat[]> {
        const key = `${usuarioId}_${salaId}`;
        const sincronizacion = dataSource.sincronizacionEstados.get(key);

        if (!sincronizacion) {
            return [];
        }

        const mensajesIds = dataSource.mensajesPorSala.get(salaId) || [];
        const mensajes = mensajesIds
            .map(id => dataSource.mensajes.get(id))
            .filter(Boolean) as MensajeChat[];

        // Obtener la fecha de la penúltima conexión para esta comparación
        const fechaReferencia = sincronizacion.ultimaConexion;
        
        // Filtrar mensajes desde la fecha de referencia
        return mensajes.filter(mensaje => {
            const fechaMensaje = new Date(mensaje.fechaEnvio);
            const fechaRef = new Date(fechaReferencia);
            return fechaMensaje > fechaRef &&
                   !sincronizacion.mensajesSincronizados.includes(mensaje.id);
        });
    }

    async marcarMensajesComoSincronizados(
        usuarioId: string,
        salaId: string,
        mensajesIds: string[]
    ): Promise<void> {
        const key = `${usuarioId}_${salaId}`;
        const sincronizacion = dataSource.sincronizacionEstados.get(key);

        if (sincronizacion) {
            sincronizacion.mensajesSincronizados.push(...mensajesIds);
            // Mantener solo los últimos 1000 mensajes sincronizados para evitar memory leaks
            if (sincronizacion.mensajesSincronizados.length > 1000) {
                sincronizacion.mensajesSincronizados = sincronizacion.mensajesSincronizados.slice(-1000);
            }
        }
    }

    async agregarEventoPendiente(
        usuarioId: string,
        salaId: string,
        tipo: TipoEvento,
        datos: any
    ): Promise<void> {
        const key = `${usuarioId}_${salaId}`;
        let sincronizacion = dataSource.sincronizacionEstados.get(key);

        if (!sincronizacion) {
            await this.inicializarSincronizacion(usuarioId, salaId);
            sincronizacion = dataSource.sincronizacionEstados.get(key)!;
        }

        const evento: EventoPendiente = {
            id: `evento_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tipo,
            datos: JSON.stringify(datos),
            fechaEvento: new Date(),
            procesado: false
        };

        sincronizacion.eventosPendientes.push(evento);

        // Mantener solo los últimos 100 eventos pendientes
        if (sincronizacion.eventosPendientes.length > 100) {
            sincronizacion.eventosPendientes = sincronizacion.eventosPendientes.slice(-100);
        }
    }

    async marcarEventoComoProcesado(usuarioId: string, salaId: string, eventoId: string): Promise<void> {
        const key = `${usuarioId}_${salaId}`;
        const sincronizacion = dataSource.sincronizacionEstados.get(key);

        if (sincronizacion) {
            const evento = sincronizacion.eventosPendientes.find(e => e.id === eventoId);
            if (evento) {
                evento.procesado = true;
            }
        }
    }

    async obtenerEstadoSincronizacion(usuarioId: string, salaId: string): Promise<SincronizacionEstado | null> {
        const key = `${usuarioId}_${salaId}`;
        return dataSource.sincronizacionEstados.get(key) || null;
    }

    async actualizarEstadoConexion(
        usuarioId: string,
        salaId: string,
        estado: EstadoConexion
    ): Promise<void> {
        const key = `${usuarioId}_${salaId}`;
        const sincronizacion = dataSource.sincronizacionEstados.get(key);

        if (sincronizacion) {
            sincronizacion.estadoConexion = estado;
            if (estado === EstadoConexion.DESCONECTADO) {
                sincronizacion.ultimaConexion = new Date();
            }
        }
    }

    async limpiarEventosAntiguos(horasAntiguedad: number = 24): Promise<void> {
        const fechaLimite = new Date();
        fechaLimite.setHours(fechaLimite.getHours() - horasAntiguedad);

        for (const [key, sincronizacion] of dataSource.sincronizacionEstados.entries()) {
            sincronizacion.eventosPendientes = sincronizacion.eventosPendientes.filter(
                evento => evento.fechaEvento > fechaLimite
            );
        }
    }

    async notificarEventoATodosLosParticipantes(
        salaId: string,
        tipo: TipoEvento,
        datos: any,
        excluyendoUsuario?: string
    ): Promise<void> {
        const participantes = dataSource.participantesPorSala.get(salaId) || new Set();

        for (const usuarioId of participantes) {
            if (usuarioId !== excluyendoUsuario) {
                // Verificar si el usuario tiene sincronización inicializada
                const key = `${usuarioId}_${salaId}`;
                const sincronizacion = dataSource.sincronizacionEstados.get(key);
                
                if (sincronizacion) {
                    await this.agregarEventoPendiente(usuarioId, salaId, tipo, datos);
                } else {
                    // Inicializar sincronización si no existe
                    await this.inicializarSincronizacion(usuarioId, salaId);
                    await this.agregarEventoPendiente(usuarioId, salaId, tipo, datos);
                }
            }
        }
    }
}
