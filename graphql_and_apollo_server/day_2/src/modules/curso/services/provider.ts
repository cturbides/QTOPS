import { Provider } from "@nestjs/common";
import { CursoService } from "./curso.service";
import { LeccionService } from "./leccion.service";
import { UsuarioService } from "./usuario.service";
import { ProgresoService } from "./progreso.service";
import { EstadisticasService } from "./estadisticas.service";

export const CURSO_SERVICES: Provider[] = [
    CursoService,
    LeccionService,
    UsuarioService,
    ProgresoService,
    EstadisticasService
];

export const CURSO_SERVICES_MAP = {
    cursoService: CursoService,
    usuarioService: UsuarioService,
    leccionService: LeccionService,
    progresoService: ProgresoService
}