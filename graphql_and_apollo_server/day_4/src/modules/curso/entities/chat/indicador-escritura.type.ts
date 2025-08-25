import { Usuario } from "@modules/curso/entities/usuario.entity";

export type IndicadorEscritura = {
  usuario: Usuario;
  cursoId: string;
  ultimaActividad: Date;
};