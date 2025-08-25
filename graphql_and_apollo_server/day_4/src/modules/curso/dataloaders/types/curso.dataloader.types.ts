import DataLoader from "dataloader";
import { Curso } from "@modules/curso/graphql/types/curso.model";
import { Leccion } from "@modules/curso/graphql/types/leccion.model";
import { Usuario } from "@modules/curso/graphql/types/usuario.model";
import { ProgresoEstudiante } from "@modules/curso/graphql/types/progreso-estudiante.model";

export type UsuarioDataLoader = DataLoader<string, Usuario | null>;
export type CursoDataLoader = DataLoader<string, Curso | null>;
export type LeccionDataLoader = DataLoader<string, Leccion[]>;
export type ProgresoDataLoader = DataLoader<{ estudianteId: string; cursoId: string }, ProgresoEstudiante>;
