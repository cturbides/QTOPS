import { dataSource } from '@modules/curso/data-source';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ChatService } from '@modules/curso/services/chat.service';
import { AuthService } from '@modules/curso/services/auth.service';
import { MensajeChat } from '@modules/curso/graphql/types/chat.model';
import { TipoMensaje } from '@modules/curso/entities/chat/tipo-mensaje.enum';
import { EstadoUsuario } from '@modules/curso/graphql/types/chat/estado-usuario.model';
import { EventPublisherService } from '@modules/curso/services/event-publisher.service';
import { EditarMensajeInput } from '@modules/curso/graphql/inputs/chat/editar-mensaje.input';
import { EnviarMensajeInput } from '@modules/curso/graphql/inputs/chat/enviar-mensaje.input';
import { CambiarEstadoInput } from '@modules/curso/graphql/inputs/chat/cambiar-estado.input';
import { EliminarMensajeInput } from '@modules/curso/graphql/inputs/chat/eliminar-mensaje.input';
import { ObtenerMensajesInput } from '@modules/curso/graphql/inputs/chat/obtener-mensajes.input';
import { WebSocketConnectionManager } from '@modules/curso/services/websocket-connection.service';
import { IndicarEscrituraInput } from '@modules/curso/graphql/inputs/chat/indicar-escritura.input';

@Resolver()
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly eventPublisher: EventPublisherService,
    private readonly connectionManager: WebSocketConnectionManager
  ) { }

  @Mutation(() => MensajeChat)
  async enviarMensaje(
    @Args('enviarMensajeInput') enviarMensajeInput: EnviarMensajeInput,
  ): Promise<MensajeChat> {
    const { cursoId, usuarioId, contenido, tipo } = enviarMensajeInput;

    await this.authService.validarAccesoCurso(usuarioId, cursoId);

    const mensaje = await this.chatService.crearMensaje({
      cursoId: cursoId,
      autorId: usuarioId,
      contenido: contenido,
      tipo: tipo || TipoMensaje.TEXTO
    });

    await this.eventPublisher.publicarNuevoMensaje(mensaje);

    const menciones = this.chatService.extraerMenciones(contenido);

    if (menciones.length > 0) {
      await this.eventPublisher.notificarMenciones(menciones, mensaje);
    }

    return mensaje;
  }

  @Mutation(() => MensajeChat, { nullable: true })
  async editarMensaje(
    @Args('editarMensaje') editarMensaje: EditarMensajeInput,
  ): Promise<MensajeChat> {
    const { usuarioId, mensajeId, contenido } = editarMensaje;

    const mensajeEditado = await this.chatService.editarMensaje({
      autorId: usuarioId,
      mensajeId: mensajeId,
      contenido: contenido,
    });

    if (mensajeEditado) {
      await this.eventPublisher.publicarNuevoMensaje(mensajeEditado);
    }

    return mensajeEditado;
  }

  @Mutation(() => Boolean)
  async eliminarMensaje(
    @Args('eliminarMensajeData') eliminarMensajeData: EliminarMensajeInput
  ): Promise<boolean> {
    const { mensajeId, usuarioId } = eliminarMensajeData;
    return await this.chatService.eliminarMensaje(mensajeId, usuarioId);
  }

  @Query(() => [MensajeChat])
  async obtenerMensajesCurso(
    @Args('obtenerMensajesInput') obtenerMensajesInput: ObtenerMensajesInput
  ): Promise<MensajeChat[]> {
    const { usuarioId, cursoId, limite, offset } = obtenerMensajesInput;

    await this.authService.validarAccesoCurso(usuarioId, cursoId);

    return await this.chatService.obtenerMensajesPorCurso(cursoId, limite, offset);
  }

  // Esto deberia ser un caso de uso
  @Mutation(() => Boolean)
  async indicarEscritura(
    @Args('indicarEscrituraInput') indicarEscrituraInput: IndicarEscrituraInput
  ): Promise<boolean> {
    const { cursoId, usuarioId, escribiendo } = indicarEscrituraInput;
    await this.authService.validarAccesoCurso(usuarioId, cursoId);

    const key = `${usuarioId}_${cursoId}`;

    if (escribiendo) {
      const usuariosDelCurso = dataSource.usuariosEscribiendoMap.get(cursoId) || new Set();
      usuariosDelCurso.add(usuarioId);

      dataSource.usuariosEscribiendoMap.set(cursoId, usuariosDelCurso);

      const indicadores = Array.from(usuariosDelCurso).map(userId => ({
        usuario: {
          id: userId,
          nombreCompleto: `Usuario ${userId}`,
        },
        cursoId,
        ultimaActividad: new Date()
      }));

      await this.eventPublisher.publicarIndicadorEscritura(cursoId, indicadores);

      const timeoutAnterior = dataSource.timeoutsEscritura.get(key);

      if (timeoutAnterior) {
        clearTimeout(timeoutAnterior);
      }

      const timeout = setTimeout(async () => {
        const usuariosDelCurso = dataSource.usuariosEscribiendoMap.get(cursoId);

        if (usuariosDelCurso) {
          usuariosDelCurso.delete(usuarioId);

          const indicadoresActualizados = Array.from(usuariosDelCurso).map(userId => ({
            usuario: {
              id: userId,
              nombreCompleto: `Usuario ${userId}`,
            },
            cursoId,
            ultimaActividad: new Date()
          }));

          await this.eventPublisher.publicarIndicadorEscritura(cursoId, indicadoresActualizados);
        }
        dataSource.timeoutsEscritura.delete(key);
      }, 3000);

      dataSource.timeoutsEscritura.set(key, timeout);
    } else {
      // Remover usuario de la lista de usuarios escribiendo
      const usuariosDelCurso = dataSource.usuariosEscribiendoMap.get(cursoId);

      if (usuariosDelCurso) {
        usuariosDelCurso.delete(usuarioId);

        const indicadores = Array.from(usuariosDelCurso).map(userId => ({
          usuario: {
            id: userId,
            nombreCompleto: `Usuario ${userId}`,
          },
          cursoId,
          ultimaActividad: new Date()
        }));

        await this.eventPublisher.publicarIndicadorEscritura(cursoId, indicadores);
      }

      const timeout = dataSource.timeoutsEscritura.get(key);

      if (timeout) {
        clearTimeout(timeout);
        dataSource.timeoutsEscritura.delete(key);
      }
    }

    return true;
  }

  @Mutation(() => Boolean)
  async cambiarEstado(
    @Args('cambiarEstadoInput') cambiarEstadoInput: CambiarEstadoInput,
  ): Promise<boolean> {
    const { cursoId, usuarioId, estado } = cambiarEstadoInput;
    await this.authService.validarAccesoCurso(usuarioId, cursoId);

    const presencia = this.connectionManager.cambiarEstadoPresencia(
      usuarioId,
      cursoId,
      estado
    );

    if (presencia) {
      await this.eventPublisher.publicarCambioPresencia(cursoId, presencia);
    }

    return true;
  }

  @Query(() => [EstadoUsuario])
  async obtenerEstadoCurso(
    @Args('cursoId') cursoId: string,
    @Args('usuarioId') usuarioId: string
  ): Promise<EstadoUsuario[]> {
    await this.authService.validarAccesoCurso(usuarioId, cursoId);
    return this.connectionManager.obtenerEstadoEnCurso(cursoId);
  }
}
