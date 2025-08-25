import { Injectable, Logger } from '@nestjs/common';
import { dataSource } from '@modules/curso/data-source';
import { Usuario } from '@modules/curso/entities/usuario.entity';
import { IConnectionInfo } from './interfaces/websocket/connection-info.interface';
import { IConnectionStats } from './interfaces/websocket/connection-stats.interface';
import { Estado, EstadoUsuario } from '@modules/curso/entities/chat/estado-usuario.type';

@Injectable()
export class WebSocketConnectionManager {
  constructor(private readonly logger: Logger) {}

  onConnect(socketId: string, usuario: Usuario, cursoId?: string): void {
    const connectionInfo: IConnectionInfo = {
      socketId,
      cursoActual: cursoId,
      usuarioId: usuario.id,
      suscripciones: new Set(),
      ultimaActividad: new Date(),
    };

    dataSource.conexionesActivas.set(socketId, connectionInfo);

    if (cursoId) {
      this.actualizarPresencia(usuario, cursoId, Estado.ONLINE);
    }

    this.logger.log(`Usuario ${usuario.nombreCompleto} conectado - Socket: ${socketId}`);
  }

  onDisconnect(socketId: string): IConnectionInfo | null {
    const connectionInfo = dataSource.conexionesActivas.get(socketId);

    if (!connectionInfo) {
      return null;
    }

    this.logger.log(`Usuario desconectado - Socket: ${socketId}`);

    // Actualizar presencia a ausente
    if (connectionInfo.cursoActual) {
      const usuario = dataSource.usuarios.find(user => user.id === connectionInfo.usuarioId);

      if (usuario) {
        this.actualizarPresencia(usuario, connectionInfo.cursoActual, Estado.AUSENTE);
      }
    }

    dataSource.conexionesActivas.delete(socketId);

    return connectionInfo;
  }

  agregarSuscripcion(socketId: string, canal: string): void {
    const connectionInfo = dataSource.conexionesActivas.get(socketId);

    if (!connectionInfo) {
      return;
    }

    connectionInfo.suscripciones.add(canal);
    connectionInfo.ultimaActividad = new Date();
  }

  removerSuscripcion(socketId: string, canal: string): void {
    const connectionInfo = dataSource.conexionesActivas.get(socketId);

    if (connectionInfo) {
      connectionInfo.suscripciones.delete(canal);
    }
  }

  actualizarActividad(socketId: string): void {
    const connectionInfo = dataSource.conexionesActivas.get(socketId);

    if (connectionInfo) {
      connectionInfo.ultimaActividad = new Date();
    }
  }

  private actualizarPresencia(usuario: Usuario, cursoId: string, estado: Estado): void {
    const key = `${usuario.id}_${cursoId}`;

    dataSource.presenciaUsuarios.set(key, {
      estado,
      usuario,
      cursoId,
      ultimaConexion: new Date()
    });
  }

  obtenerEstadoEnCurso(cursoId: string): EstadoUsuario[] {
    return Array.from(dataSource.presenciaUsuarios.values())
      .filter(presencia => presencia.cursoId === cursoId);
  }

  cambiarEstadoPresencia(usuarioId: string, cursoId: string, estado: Estado): EstadoUsuario | null {
    const key = `${usuarioId}_${cursoId}`;
    const presencia = dataSource.presenciaUsuarios.get(key);

    if (!presencia) {
      return null;
    }

    presencia.estado = estado;
    presencia.ultimaConexion = new Date();

    dataSource.presenciaUsuarios.set(key, presencia);

    return presencia;
  }

  getEstadisticasConexiones(): IConnectionStats {
    const usuariosUnicos = new Set(
      Array.from(dataSource.conexionesActivas.values())
        .map(conn => conn.usuarioId)
    ).size;

    const totalSuscripciones = Array.from(dataSource.conexionesActivas.values())
      .reduce((total, conn) => total + conn.suscripciones.size, 0);

    return {
      totalConexiones: dataSource.conexionesActivas.size,
      usuariosUnicos,
      promedioSuscripcionesPorConexion: dataSource.conexionesActivas.size > 0
        ? totalSuscripciones / dataSource.conexionesActivas.size
        : 0
    };
  }

  obtenerConexionesPorUsuario(usuarioId: string): IConnectionInfo[] {
    return Array.from(dataSource.conexionesActivas.values())
      .filter(conn => conn.usuarioId === usuarioId);
  }
}
