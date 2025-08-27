import { Injectable } from '@nestjs/common';
import { dataSource } from '@modules/curso/data-source';
import { SalaPrivada } from '@modules/curso/entities/chat/sala-privada.entity';
import { CrearSalaPrivadaDto } from '@modules/curso/dto/chat/crear-sala-privada.dto';

@Injectable()
export class SalaPrivadaService {
    async crearSala(dto: CrearSalaPrivadaDto): Promise<SalaPrivada> {
        const creador = dataSource.usuarios.find(u => u.id === dto.creadorId);
        if (!creador) {
            throw new Error('Creador no encontrado');
        }

        const participantes = dataSource.usuarios.filter(u =>
            dto.participantesIds.includes(u.id) || u.id === dto.creadorId
        );

        if (participantes.length !== dto.participantesIds.length + 1) {
            throw new Error('Algunos participantes no fueron encontrados');
        }

        const sala: SalaPrivada = {
            id: `sala_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            tipo: dto.tipo,
            creador,
            participantes,
            fechaCreacion: new Date(),
            ultimaActividad: new Date(),
            configuracion: dto.configuracion
        };

        dataSource.salasPrivadas.set(sala.id, sala);

        const participantesSet = new Set(participantes.map(p => p.id));
        dataSource.participantesPorSala.set(sala.id, participantesSet);

        participantes.forEach(participante => {
            const salasUsuario = dataSource.salasPorUsuario.get(participante.id) || new Set();
            salasUsuario.add(sala.id);
            dataSource.salasPorUsuario.set(participante.id, salasUsuario);
        });

        return sala;
    }

    async obtenerSalasPorUsuario(usuarioId: string): Promise<SalaPrivada[]> {
        const salasIds = dataSource.salasPorUsuario.get(usuarioId) || new Set();
        return Array.from(salasIds)
            .map(id => dataSource.salasPrivadas.get(id))
            .filter(Boolean) as SalaPrivada[];
    }

    async obtenerSalaPorId(salaId: string): Promise<SalaPrivada | null> {
        return dataSource.salasPrivadas.get(salaId) || null;
    }

    async validarAccesoSala(usuarioId: string, salaId: string): Promise<boolean> {
        const participantes = dataSource.participantesPorSala.get(salaId);
        return participantes ? participantes.has(usuarioId) : false;
    }

    async agregarParticipante(salaId: string, usuarioId: string, agregadoPorId: string): Promise<boolean> {
        const sala = dataSource.salasPrivadas.get(salaId);
        if (!sala) {
            throw new Error('Sala no encontrada');
        }

        if (!await this.validarAccesoSala(agregadoPorId, salaId)) {
            throw new Error('No tienes permiso para agregar participantes');
        }

        const usuario = dataSource.usuarios.find(u => u.id === usuarioId);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        sala.participantes.push(usuario);
        sala.ultimaActividad = new Date();

        const participantesSet = dataSource.participantesPorSala.get(salaId) || new Set();
        participantesSet.add(usuarioId);
        dataSource.participantesPorSala.set(salaId, participantesSet);

        const salasUsuario = dataSource.salasPorUsuario.get(usuarioId) || new Set();
        salasUsuario.add(salaId);
        dataSource.salasPorUsuario.set(usuarioId, salasUsuario);

        return true;
    }

    async abandonarSala(salaId: string, usuarioId: string): Promise<boolean> {
        const sala = dataSource.salasPrivadas.get(salaId);
        if (!sala) {
            throw new Error('Sala no encontrada');
        }

        sala.participantes = sala.participantes.filter(p => p.id !== usuarioId);
        sala.ultimaActividad = new Date();

        const participantesSet = dataSource.participantesPorSala.get(salaId);
        if (participantesSet) {
            participantesSet.delete(usuarioId);
        }

        const salasUsuario = dataSource.salasPorUsuario.get(usuarioId);
        if (salasUsuario) {
            salasUsuario.delete(salaId);
        }

        // Si no quedan participantes, eliminar la sala
        if (sala.participantes.length === 0) {
            dataSource.salasPrivadas.delete(salaId);
            dataSource.participantesPorSala.delete(salaId);
            dataSource.mensajesPorSala.delete(salaId);
        }

        return true;
    }

    async actualizarConfiguracion(salaId: string, configuracion: any, usuarioId: string): Promise<boolean> {
        const sala = dataSource.salasPrivadas.get(salaId);
        if (!sala) {
            throw new Error('Sala no encontrada');
        }

        if (sala.creador.id !== usuarioId) {
            throw new Error('Solo el creador puede actualizar la configuración');
        }

        sala.configuracion = { ...sala.configuracion, ...configuracion };
        sala.ultimaActividad = new Date();

        return true;
    }
}
