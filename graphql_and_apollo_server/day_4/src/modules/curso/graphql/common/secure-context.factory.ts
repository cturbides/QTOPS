import DataLoader from 'dataloader';
import { UnauthorizedException } from '@nestjs/common';
import { ServiceContainer } from '@modules/curso/graphql/interfaces/service.container';
import { GraphQLAuthService } from '@modules/curso/services/security/graphql-auth.service';
import { UsuarioAutenticado } from '@modules/curso/entities/auth/usuario-autenticado.interface';
import { SecureGraphQLContext } from '@modules/curso/graphql/interfaces/secure-context.interface';
import { createInstrumentedDataLoader } from '@modules/curso/dataloaders/config/instrumented-data-loader.config';

export const createSecureGraphQLContext = async (
  req: any,
  services: ServiceContainer,
): Promise<SecureGraphQLContext> => {
  const token = services.graphqlAuthService.extraerTokenDeRequest(req);
  let usuario: UsuarioAutenticado | null = null;

  if (token) {
    try {
      usuario = await services.graphqlAuthService.validarToken(token);
    } catch (error) {
      // No lanzar error aquí - permitir queries públicas
      console.warn('Token inválido en contexto GraphQL:', error.message);
    }
  }

  return {
    req,
    usuario,
    isAuthenticated: !!usuario,
    requireAuth: () => {
      if (!usuario) {
        throw new UnauthorizedException('Autenticación requerida');
      }

      return usuario;
    },

    loaders: {
      // Usuario DataLoader
      usuario: createInstrumentedDataLoader(
        async (userIds: readonly string[]) => {
          const usuarios = await services.usuarioService.obtenerPorIds([...userIds]);
          return userIds.map(id => usuarios.find(u => u.id === id) || null);
        },
        'ContextUsuarioLoader'
      ),

      // Curso DataLoader
      curso: createInstrumentedDataLoader(
        async (cursoIds: readonly string[]) => {
          const cursos = await Promise.all(
            cursoIds.map(id => services.cursoService.obtenerCompleto(id).catch(() => null))
          );
          return cursos;
        },
        'ContextCursoLoader'
      ),

      // Leccion DataLoader (por curso)
      leccion: createInstrumentedDataLoader(
        async (cursoIds: readonly string[]) => {
          const lecciones = await services.leccionService.obtenerPorCursosConOrden([...cursoIds]);

          return cursoIds.map(cursoId =>
            lecciones
              .filter(l => (l as any).cursoId === cursoId)
              .sort((a, b) => a.orden - b.orden)
          );
        },
        'ContextLeccionLoader'
      ),

      // Progreso DataLoader
      progreso: new DataLoader(
        async (keys: readonly { estudianteId: string; cursoId: string }[]) => {
          const progreso = await services.progresoService.obtenerDetallado([...keys]);

          return keys.map(key => {
            const p = progreso.find(pr =>
              pr.estudianteId === key.estudianteId && pr.cursoId === key.cursoId
            );
            return p || {
              estudianteId: key.estudianteId,
              cursoId: key.cursoId,
              porcentajeCompletado: 0,
              leccionesVistas: []
            };
          });
        },
        {
          cacheKeyFn: (key) => key
        }
      )
    }
  };
};
