import { Curso } from "../../../src/modules/curso/entities/curso.entitiy";
import { Injectable, Inject } from '@nestjs/common';

export const mockCursoService = {
  crear: jest.fn(),
  eliminar: jest.fn(),
  actualizar: jest.fn(),
  obtenerTodos: jest.fn(),
  obtenerPorId: jest.fn(),
  obtenerCompleto: jest.fn(),
  buscarPorTitulo: jest.fn(),
  obtenerPorInstructor: jest.fn(),
  obtenerConEstadisticas: jest.fn()
};

export const mockUsuarioService = {
  crear: jest.fn(),
  eliminar: jest.fn(),
  actualizar: jest.fn(),
  obtenerPorId: jest.fn(),
  obtenerPorIds: jest.fn(),
  obtenerPorEmail: jest.fn(),
  buscarPorNombre: jest.fn()
};

export const mockLeccionService = {
  crear: jest.fn(),
  eliminar: jest.fn(),
  reordenar: jest.fn(),
  actualizar: jest.fn(),
  obtenerPorId: jest.fn(),
  obtenerPorCurso: jest.fn(),
  obtenerPorCursosConOrden: jest.fn(),
};

export const mockProgresoService = {
  obtenerPorCurso: jest.fn(),
  obtenerDetallado: jest.fn(),
  obtenerPorUsuario: jest.fn(),
  marcarLeccionVista: jest.fn(),
  calcularPorcentaje: jest.fn(),
  obtenerEstadisticas: jest.fn()
};

export const mockGraphQLAuthService = {
  validarToken: jest.fn(),
  generarToken: jest.fn(),
  validarPermisos: jest.fn(),
  extraerTokenDeRequest: jest.fn(),
};

export const crearCursoDePrueba = (override: Partial<Curso> = {}) => ({
  activo: true,
  id: 'curso-test-1',
  titulo: 'Curso de Prueba',
  instructorId: 'instructor-1',
  descripcion: 'Descripción del curso de prueba',
  fechaCreacion: new Date('2024-01-01'),
  ...override
});

export const crearUsuarioDePrueba = (override: Partial<any> = {}) => ({
  activo: true,
  id: 'usuario-test-1',
  email: 'test@example.com',
  nombre: 'Usuario de Prueba',
  fechaRegistro: new Date('2024-01-01'),
  ...override
});

export const crearLeccionDePrueba = (override: Partial<any> = {}) => ({
  orden: 1,
  duracionMinutos: 30,
  id: 'leccion-test-1',
  cursoId: 'curso-test-1',
  titulo: 'Lección de Prueba',
  contenido: 'Contenido de la lección de prueba',
  ...override
});

export const crearProgresoDePrueba = (override: Partial<any> = {}) => ({
  cursoId: 'curso-test-1',
  porcentajeCompletado: 50,
  estudianteId: 'usuario-test-1',
  fechaUltimaActividad: new Date(),
  leccionesVistas: ['leccion-test-1'],
  ...override
});

export const crearContextoAutenticado = (usuario: any = crearUsuarioDePrueba()) => ({
  usuario,
  isAuthenticated: true,
  requireAuth: () => usuario,
  req: { headers: { authorization: 'Bearer token-valido' } },
  loaders: {
    curso: { load: jest.fn() },
    leccion: { load: jest.fn() },
    progreso: { load: jest.fn() },
    usuario: { load: jest.fn().mockResolvedValue(usuario) },
  }
});

export const crearContextoNoAutenticado = () => ({
  usuario: null,
  req: { headers: {} },
  isAuthenticated: false,
  requireAuth: () => {
    throw new Error('Autenticación requerida');
  },
  loaders: {
    curso: { load: jest.fn() },
    usuario: { load: jest.fn() },
    leccion: { load: jest.fn() },
    progreso: { load: jest.fn() }
  }
});

@Injectable()
export class MockCursoResolver {
  constructor(
    @Inject('CursoService') private readonly cursoService: any,
    @Inject('UsuarioService') private readonly usuarioService: any
  ) { }

  async buscarCursos() {
    return this.cursoService.obtenerTodos();
  }

  async curso(id: string) {
    return this.cursoService.obtenerPorId(id);
  }

  async crearCurso(datos: any, context: any) {
    context.requireAuth(); // Validar autenticación
    return this.cursoService.crear(datos);
  }

  async instructor(curso: any) {
    return this.usuarioService.obtenerPorId(curso.instructorId);
  }
}
