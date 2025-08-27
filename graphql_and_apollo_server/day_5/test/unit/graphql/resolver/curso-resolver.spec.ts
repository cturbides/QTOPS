import { Test } from '@nestjs/testing';
import {
  mockCursoService,
  mockUsuarioService,
  crearCursoDePrueba,
  crearUsuarioDePrueba,
  crearContextoAutenticado,
  crearContextoNoAutenticado,
  MockCursoResolver
} from '../../../testing/mocks/service.mocks';


describe('CursoResolver', () => {
  let resolver: MockCursoResolver;
  let cursoService: jest.Mocked<any>;
  let usuarioService: jest.Mocked<any>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockCursoResolver,
        {
          provide: 'CursoService',
          useValue: mockCursoService
        },
        {
          provide: 'UsuarioService',
          useValue: mockUsuarioService
        }
      ]
    }).compile();


    cursoService = mockCursoService;
    usuarioService = mockUsuarioService;
    resolver = module.get(MockCursoResolver);

    jest.clearAllMocks();
  });

  describe('Query: buscarCursos', () => {
    it('debe retornar lista de cursos', async () => {
      const cursosEsperados = [
        crearCursoDePrueba({ id: '1', titulo: 'Curso 1' }),
        crearCursoDePrueba({ id: '2', titulo: 'Curso 2' })
      ];

      cursoService.obtenerTodos.mockResolvedValue(cursosEsperados);

      const resultado = await resolver.buscarCursos();

      expect(resultado).toEqual(cursosEsperados);
      expect(cursoService.obtenerTodos).toHaveBeenCalledTimes(1);
    });

    it('debe manejar lista vacía correctamente', async () => {
      cursoService.obtenerTodos.mockResolvedValue([]);

      const resultado = await resolver.buscarCursos();

      expect(resultado).toEqual([]);
      expect(cursoService.obtenerTodos).toHaveBeenCalledTimes(1);
    });

    it('debe propagar errores del servicio', async () => {
      const error = new Error('Error de base de datos');
      cursoService.obtenerTodos.mockRejectedValue(error);

      await expect(resolver.buscarCursos()).rejects.toThrow('Error de base de datos');
    });
  });

  describe('Query: curso', () => {
    it('debe retornar curso por ID', async () => {
      const cursoEsperado = crearCursoDePrueba({ id: 'curso-1' });
      cursoService.obtenerPorId.mockResolvedValue(cursoEsperado);

      const resultado = await resolver.curso('curso-1');

      expect(resultado).toEqual(cursoEsperado);
      expect(cursoService.obtenerPorId).toHaveBeenCalledWith('curso-1');
    });

    it('debe retornar null para curso inexistente', async () => {
      cursoService.obtenerPorId.mockResolvedValue(null);

      const resultado = await resolver.curso('curso-inexistente');

      expect(resultado).toBeNull();
      expect(cursoService.obtenerPorId).toHaveBeenCalledWith('curso-inexistente');
    });
  });

  describe('Mutation: crearCurso', () => {
    const datosCurso = {
      titulo: 'Nuevo Curso',
      descripcion: 'Descripción del curso',
      instructorId: 'instructor-1'
    };

    it('debe crear curso con usuario autenticado', async () => {
      const cursoCreado = crearCursoDePrueba(datosCurso);
      const contexto = crearContextoAutenticado();

      cursoService.crear.mockResolvedValue(cursoCreado);

      const resultado = await resolver.crearCurso(datosCurso, contexto);

      expect(resultado).toEqual(cursoCreado);
      expect(cursoService.crear).toHaveBeenCalledWith(datosCurso);
    });

    it('debe rechazar creación sin autenticación', async () => {
      const contexto = crearContextoNoAutenticado();

      await expect(resolver.crearCurso(datosCurso, contexto))
        .rejects.toThrow('Autenticación requerida');

      expect(cursoService.crear).not.toHaveBeenCalled();
    });

    it('debe validar datos de entrada', async () => {
      const datosInvalidos = { titulo: '' }; // Título vacío
      const contexto = crearContextoAutenticado();

      cursoService.crear.mockRejectedValue(new Error('Datos inválidos'));

      await expect(resolver.crearCurso(datosInvalidos, contexto))
        .rejects.toThrow('Datos inválidos');
    });
  });

  describe('Field Resolver: instructor', () => {
    it('debe resolver instructor del curso', async () => {
      const curso = crearCursoDePrueba({ instructorId: 'instructor-1' });
      const instructor = crearUsuarioDePrueba({ id: 'instructor-1' });

      usuarioService.obtenerPorId.mockResolvedValue(instructor);

      const resultado = await resolver.instructor(curso);

      expect(resultado).toEqual(instructor);
      expect(usuarioService.obtenerPorId).toHaveBeenCalledWith('instructor-1');
    });

    it('debe manejar instructor inexistente', async () => {
      const curso = crearCursoDePrueba({ instructorId: 'instructor-inexistente' });

      usuarioService.obtenerPorId.mockResolvedValue(null);

      const resultado = await resolver.instructor(curso);

      expect(resultado).toBeNull();
    });
  });

  describe('Performance Tests', () => {
    it('buscarCursos debe ejecutarse en tiempo razonable', async () => {
      const cursosEsperados = Array.from({ length: 100 }, (_, i) =>
        crearCursoDePrueba({ id: `curso-${i}`, titulo: `Curso ${i}` })
      );

      cursoService.obtenerTodos.mockResolvedValue(cursosEsperados);

      const inicio = Date.now();
      await resolver.buscarCursos();
      const duracion = Date.now() - inicio;

      expect(duracion).toBeLessThan(100); // Menos de 100ms
    });

    it('debe manejar múltiples consultas concurrentes', async () => {
      const curso = crearCursoDePrueba({ id: 'curso-1' });
      cursoService.obtenerPorId.mockResolvedValue(curso);

      const promesas = Array.from({ length: 10 }, () =>
        resolver.curso('curso-1')
      );

      const resultados = await Promise.all(promesas);

      expect(resultados).toHaveLength(10);
      expect(resultados.every(r => r.id === 'curso-1')).toBe(true);
    });
  });
});
