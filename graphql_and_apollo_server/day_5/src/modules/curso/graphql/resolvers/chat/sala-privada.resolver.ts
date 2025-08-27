import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ChatService } from '@modules/curso/services/chat.service';
import { MensajeChat } from '@modules/curso/graphql/types/chat.model';
import { TipoSala } from '@modules/curso/entities/chat/sala-privada.entity';
import { TipoMensaje } from '@modules/curso/entities/chat/tipo-mensaje.enum';
import { MensajeVozService } from '@modules/curso/services/mensaje-voz.service';
import { SalaPrivadaService } from '@modules/curso/services/sala-privada.service';
import { SalaPrivada } from '@modules/curso/graphql/types/chat/sala-privada.model';
import { TipoEvento } from '@modules/curso/entities/chat/sincronizacion-estado.entity';
import { EventPublisherService } from '@modules/curso/services/event-publisher.service';
import { EnviarMensajeInput } from '@modules/curso/graphql/inputs/chat/enviar-mensaje.input';
import { SincronizacionEstadoService } from '@modules/curso/services/sincronizacion-estado.service';
import { CrearSalaPrivadaInput } from '@modules/curso/graphql/inputs/chat/crear-sala-privada.input';
import { SincronizacionEstado } from '@modules/curso/graphql/types/chat/sincronizacion-estado.model';
import { ObtenerMensajesSalaInput, SincronizarEstadoInput } from '@modules/curso/graphql/inputs/chat/sincronizacion.input';
import { CalidadAudio, EnviarMensajeVozInput, FormatoDeCompresion } from '@modules/curso/graphql/inputs/chat/enviar-mensaje-voz.input';

@Resolver()
export class SalaPrivadaResolver {
    constructor(
        private readonly chatService: ChatService,
        private readonly mensajeVozService: MensajeVozService,
        private readonly eventPublisher: EventPublisherService,
        private readonly salaPrivadaService: SalaPrivadaService,
        private readonly sincronizacionService: SincronizacionEstadoService
    ) { }

    @Mutation(() => SalaPrivada)
    async crearSalaPrivada(
        @Args('crearSalaInput') crearSalaInput: CrearSalaPrivadaInput
    ): Promise<SalaPrivada> {
        const { creadorId, participantesIds, nombre, descripcion, tipo, configuracion } = crearSalaInput;

        const sala = await this.salaPrivadaService.crearSala({
            nombre,
            creadorId,
            descripcion,
            participantesIds,
            tipo: tipo || TipoSala.PRIVADA,
            configuracion: {
                limiteMensajes: configuracion?.limiteMensajes,
                archivoCompartido: configuracion?.archivoCompartido ?? true,
                notificacionesSonido: configuracion?.notificacionesSonido ?? true,
                mensajesVozPermitidos: configuracion?.mensajesVozPermitidos ?? true,
            }
        });

        await Promise.all(
            sala.participantes.map(participante => {
                if (participante.id !== creadorId) {
                    return this.eventPublisher.publicarUsuarioUnidoSala(sala.id, participante, sala);
                }
            })
        );

        return sala;
    }

    @Mutation(() => MensajeChat)
    async enviarMensajeSala(
        @Args('enviarMensajeInput') enviarMensajeInput: EnviarMensajeInput
    ): Promise<MensajeChat> {
        const { salaId, usuarioId, contenido, tipo, respondePor } = enviarMensajeInput;

        if (!salaId) {
            throw new Error('ID de sala requerido');
        }

        const tieneAcceso = await this.salaPrivadaService.validarAccesoSala(usuarioId, salaId);

        if (!tieneAcceso) {
            throw new Error('No tienes acceso a esta sala');
        }

        const mensaje = await this.chatService.crearMensaje({
            salaId,
            contenido,
            respondePor,
            autorId: usuarioId,
            tipo: tipo || TipoMensaje.TEXTO,
        });

        await this.eventPublisher.publicarNuevoMensajeSala(mensaje);

        await this.sincronizacionService.notificarEventoATodosLosParticipantes(
            salaId,
            TipoEvento.MENSAJE_NUEVO,
            { mensaje },
            usuarioId
        );

        const menciones = this.chatService.extraerMenciones(contenido);

        if (menciones.length > 0) {
            await this.eventPublisher.notificarMenciones(menciones, mensaje);
        }

        return mensaje;
    }

    @Mutation(() => MensajeChat)
    async enviarMensajeVozSala(
        @Args('enviarMensajeVozInput') enviarMensajeVozInput: EnviarMensajeVozInput
    ): Promise<MensajeChat> {
        const { salaId, usuarioId } = enviarMensajeVozInput;

        if (!salaId) {
            throw new Error('ID de sala requerido');
        }

        const tieneAcceso = await this.salaPrivadaService.validarAccesoSala(usuarioId, salaId);

        if (!tieneAcceso) {
            throw new Error('No tienes acceso a esta sala');
        }

        const sala = await this.salaPrivadaService.obtenerSalaPorId(salaId);

        if (!sala?.configuracion.mensajesVozPermitidos) {
            throw new Error('Los mensajes de voz no están permitidos en esta sala');
        }

        const mensajeVozDto = {
            ...enviarMensajeVozInput,
            metadatos: {
                fechaCreacion: new Date(),
                tamanoBytes: enviarMensajeVozInput.metadatos.tamanoBytes,
                calidad: (enviarMensajeVozInput.metadatos.calidad || CalidadAudio.MEDIA),
                formatoCompresion: (enviarMensajeVozInput.metadatos.formatoCompresion || FormatoDeCompresion.MP3),
            }
        };

        const mensaje = await this.mensajeVozService.crearMensajeVoz(mensajeVozDto);

        await this.eventPublisher.publicarNuevoMensajeSala(mensaje);

        await this.sincronizacionService.notificarEventoATodosLosParticipantes(
            salaId,
            TipoEvento.MENSAJE_VOZ,
            { mensaje },
            usuarioId
        );

        return mensaje;
    }

    @Query(() => [SalaPrivada])
    async obtenerSalasUsuario(
        @Args('usuarioId') usuarioId: string
    ): Promise<SalaPrivada[]> {
        return await this.salaPrivadaService.obtenerSalasPorUsuario(usuarioId);
    }

    @Query(() => [MensajeChat])
    async obtenerMensajesSala(
        @Args('obtenerMensajesInput') obtenerMensajesInput: ObtenerMensajesSalaInput
    ): Promise<MensajeChat[]> {
        const { usuarioId, salaId, limite, offset, desdeTimestamp } = obtenerMensajesInput;

        const tieneAcceso = await this.salaPrivadaService.validarAccesoSala(usuarioId, salaId);

        if (!tieneAcceso) {
            throw new Error('No tienes acceso a esta sala');
        }

        if (desdeTimestamp) {
            return await this.chatService.obtenerMensajesDesdeTimestamp(salaId, desdeTimestamp, limite || 50);
        }

        return await this.chatService.obtenerMensajesPorSala(salaId, limite || 50, offset || 0);
    }

    @Mutation(() => SincronizacionEstado)
    async sincronizarEstado(
        @Args('sincronizarInput') sincronizarInput: SincronizarEstadoInput
    ): Promise<SincronizacionEstado> {
        const { usuarioId, salaId } = sincronizarInput;

        const tieneAcceso = await this.salaPrivadaService.validarAccesoSala(usuarioId, salaId);

        if (!tieneAcceso) {
            throw new Error('No tienes acceso a esta sala');
        }

        const sincronizacion = await this.sincronizacionService.inicializarSincronizacion(usuarioId, salaId);

        const mensajesPerdidos = await this.sincronizacionService.obtenerMensajesDesdeUltimaConexion(usuarioId, salaId);
        const eventosPendientes = await this.sincronizacionService.obtenerEventosPendientes(usuarioId, salaId);

        // Actualizar el objeto de sincronización con la información más reciente
        sincronizacion.eventosPendientes = eventosPendientes;

        await this.eventPublisher.publicarSincronizacionEstado(usuarioId, salaId, {
            mensajesPerdidos,
            eventosPendientes,
            estadoSincronizacion: sincronizacion
        });

        if (mensajesPerdidos.length > 0) {
            await Promise.all(mensajesPerdidos.map(m => this.sincronizacionService.marcarMensajesComoSincronizados(
                usuarioId,
                salaId,
                [m.id]
            )));
        }

        return sincronizacion;
    }

    @Mutation(() => Boolean)
    async abandonarSala(
        @Args('salaId') salaId: string,
        @Args('usuarioId') usuarioId: string
    ): Promise<boolean> {
        const tieneAcceso = await this.salaPrivadaService.validarAccesoSala(usuarioId, salaId);

        if (!tieneAcceso) {
            throw new Error('No tienes acceso a esta sala');
        }

        const sala = await this.salaPrivadaService.obtenerSalaPorId(salaId);
        const usuario = sala?.participantes.find(p => p.id === usuarioId);

        const resultado = await this.salaPrivadaService.abandonarSala(salaId, usuarioId);

        if (!resultado || !usuario || !sala) {
            return resultado;
        }

        await this.eventPublisher.publicarUsuarioAbandonoSala(salaId, usuario, sala);

        await this.sincronizacionService.notificarEventoATodosLosParticipantes(
            salaId,
            TipoEvento.USUARIO_ABANDONO,
            { usuario, sala },
            usuarioId
        );

        return resultado;
    }
}
