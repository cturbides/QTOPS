import { Injectable } from '@nestjs/common';
import { dataSource } from '@modules/curso/data-source';
import { Usuario } from '@modules/curso/entities/usuario.entity';
import { MensajeChat } from '@modules/curso/entities/mensaje-chat.entity';
import { CrearMensajeDto } from '@modules/curso/dto/chat/crear-mensaje.dto';
import { EditarMensajeDto } from '@modules/curso/dto/chat/editar-mensaje.dto';

@Injectable()
export class ChatService {
  async crearMensaje(dto: CrearMensajeDto): Promise<MensajeChat> {
    const mensaje: MensajeChat = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tipo: dto.tipo,
      editado: false,
      cursoId: dto.cursoId,
      fechaEnvio: new Date(),
      contenido: dto.contenido,
      adjuntos: dto.adjuntos || [],
      autor: dataSource.usuarios.find(u => u.id === dto.autorId) as Usuario,
    };

    dataSource.mensajes.set(mensaje.id, mensaje);

    const mensajesCurso = dataSource.mensajesPorCurso.get(dto.cursoId) || [];

    mensajesCurso.push(mensaje.id);

    dataSource.mensajesPorCurso.set(dto.cursoId, mensajesCurso);

    return mensaje;
  }

  async editarMensaje(dto: EditarMensajeDto): Promise<MensajeChat> {
    const mensaje = dataSource.mensajes.get(dto.mensajeId);

    if (!mensaje || mensaje.autor.id !== dto.autorId) {
      throw new Error('No tienes permiso para editar este mensaje');
    }

    mensaje.contenido = dto.contenido;
    mensaje.editado = true;
    mensaje.fechaEdicion = new Date();

    dataSource.mensajes.set(dto.mensajeId, mensaje);

    return mensaje;
  }

  async obtenerMensajesPorCurso(cursoId: string, limite: number = 50, offset: number = 0): Promise<MensajeChat[]> {
    const mensajeIds = dataSource.mensajesPorCurso.get(cursoId) || [];

    return mensajeIds
      .slice(-limite - offset, -offset || undefined)
      .map(id => dataSource.mensajes.get(id))
      .filter(Boolean) as MensajeChat[];
  }

  async eliminarMensaje(mensajeId: string, autorId: string): Promise<boolean> {
    const mensaje = dataSource.mensajes.get(mensajeId);

    if (!mensaje || mensaje.autor.id !== autorId) {
      throw new Error('No tienes permiso para eliminar este mensaje');
    }

    dataSource.mensajes.delete(mensajeId);

    const mensajesCurso = dataSource.mensajesPorCurso.get(mensaje.cursoId) || [];

    const index = mensajesCurso.indexOf(mensajeId);

    if (index < 0) {
      return false;
    }

    mensajesCurso.splice(index, 1);
    dataSource.mensajesPorCurso.set(mensaje.cursoId, mensajesCurso);

    return true;
  }

  extraerMenciones(contenido: string): string[] {
    const mencionesRegex = /@([a-zA-Z0-9_]+)/g;
    const menciones: string[] = [];
    let match;

    while ((match = mencionesRegex.exec(contenido)) !== null) {
      menciones.push(match[1]);
    }

    return menciones;
  }
}
