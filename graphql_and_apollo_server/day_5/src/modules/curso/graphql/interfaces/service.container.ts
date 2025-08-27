import { CursoService } from "@modules/curso/services/curso.service";
import { UsuarioService } from "@modules/curso/services/usuario.service";
import { LeccionService } from "@modules/curso/services/leccion.service";
import { ProgresoService } from "@modules/curso/services/progreso.service";
import { GraphQLAuthService } from "@modules/curso/services/security/graphql-auth.service";
import { GraphQLSecurityMiddleware } from "@modules/curso/services/security/graphql-security-middleware.service";

export interface ServiceContainer {
    cursoService: CursoService;
    usuarioService: UsuarioService;
    leccionService: LeccionService;
    progresoService: ProgresoService;
    graphqlAuthService: GraphQLAuthService;
    graphqlSecurityMiddleware: GraphQLSecurityMiddleware;
}
