import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { CursoCompletoService } from '../../apps/curso-completo-ms/src/modules/curso-completo/services/curso-completo.service';
import { CursoCompleto } from '../../apps/curso-completo-ms/src/modules/curso-completo/entities/curso-completo.entity';
import { Etiqueta } from '../../apps/curso-completo-ms/src/modules/curso-completo/entities/etiqueta.entity';
import { Instructor } from '../../apps/curso-completo-ms/src/modules/curso-completo/entities/instructor.entity';
import { Evaluacion } from '../../apps/curso-completo-ms/src/modules/curso-completo/entities/evaluacion.entity';

// **CAPA 1: PRUEBAS UNITARIAS - 70% de la pirámide**
// Testing de servicios con mocks completos y aislamiento total
describe('CursoCompletoService - Pruebas Unitarias', () => {
  let service: CursoCompletoService;
  
  // Mocks de repositorios - Simulan comportamiento completo
  let mockCursoRepository: jest.Mocked<Repository<CursoCompleto>>;
  let mockEtiquetaRepository: jest.Mocked<Repository<Etiqueta>>;
  let mockInstructorRepository: jest.Mocked<Repository<Instructor>>;
  let mockEvaluacionRepository: jest.Mocked<Repository<Evaluacion>>;
  
  // Mock de cache - Stub que siempre responde exitosamente
  let mockCacheManager: jest.Mocked<any>;

  beforeEach(async () => {
    // Configurar mocks completos para repositorios
    mockCursoRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    mockEtiquetaRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    } as any;

    mockInstructorRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    } as any;

    mockEvaluacionRepository = {
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    // Mock de cache manager - Stub para caching
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursoCompletoService,
        {
          provide: getRepositoryToken(CursoCompleto),
          useValue: mockCursoRepository,
        },
        {
          provide: getRepositoryToken(Etiqueta),
          useValue: mockEtiquetaRepository,
        },
        {
          provide: getRepositoryToken(Instructor),
          useValue: mockInstructorRepository,
        },
        {
          provide: getRepositoryToken(Evaluacion),
          useValue: mockEvaluacionRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CursoCompletoService>(CursoCompletoService);
  });

  describe('crearEtiqueta - Caso de uso básico', () => {
    it('debe crear etiqueta exitosamente con nombre válido', async () => {
      // Arrange
      const createEtiquetaDto = { nombre: 'JavaScript' };
      const etiquetaCreada = { id: '1', nombre: 'javascript' };

      // Configurar mocks
      mockEtiquetaRepository.findOne.mockResolvedValue(null); // No existe
      mockEtiquetaRepository.create.mockReturnValue(etiquetaCreada as any);
      mockEtiquetaRepository.save.mockResolvedValue(etiquetaCreada as any);

      // Act
      const resultado = await service.crearEtiqueta(createEtiquetaDto);

      // Assert - Verificar flujo completo
      expect(mockEtiquetaRepository.findOne).toHaveBeenCalledWith({
        where: { nombre: 'javascript' } // Debe normalizar a minúsculas
      });
      expect(mockEtiquetaRepository.create).toHaveBeenCalledWith({
        nombre: 'javascript'
      });
      expect(mockEtiquetaRepository.save).toHaveBeenCalledWith(etiquetaCreada);
      expect(resultado).toBe(etiquetaCreada);
    });

    it('debe normalizar nombre de etiqueta a minúsculas', async () => {
      // Arrange
      const createEtiquetaDto = { nombre: '  REACT HOOKS  ' };

      mockEtiquetaRepository.findOne.mockResolvedValue(null);
      mockEtiquetaRepository.create.mockReturnValue({} as any);
      mockEtiquetaRepository.save.mockResolvedValue({} as any);

      // Act
      await service.crearEtiqueta(createEtiquetaDto);

      // Assert - Verificar normalización
      expect(mockEtiquetaRepository.findOne).toHaveBeenCalledWith({
        where: { nombre: 'react hooks' } // Trimmed y en minúsculas
      });
    });

    it('debe rechazar etiqueta duplicada', async () => {
      // Arrange
      const createEtiquetaDto = { nombre: 'TypeScript' };
      const etiquetaExistente = { id: '1', nombre: 'typescript' };

      mockEtiquetaRepository.findOne.mockResolvedValue(etiquetaExistente as any);

      // Act & Assert
      await expect(service.crearEtiqueta(createEtiquetaDto))
        .rejects.toThrow(BadRequestException);
      
      await expect(service.crearEtiqueta(createEtiquetaDto))
        .rejects.toThrow("La etiqueta 'TypeScript' ya existe");

      // Verificar que no se intentó crear
      expect(mockEtiquetaRepository.create).not.toHaveBeenCalled();
      expect(mockEtiquetaRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('crearInstructor - Validación de duplicados', () => {
    it('debe crear instructor exitosamente', async () => {
      // Arrange
      const createInstructorDto = {
        nombre: 'Juan Pérez',
        email: 'Juan.Perez@Example.com'
      };
      const instructorCreado = {
        id: '1',
        nombre: 'Juan Pérez',
        email: 'juan.perez@example.com'
      };

      mockInstructorRepository.findOne.mockResolvedValue(null);
      mockInstructorRepository.create.mockReturnValue(instructorCreado as any);
      mockInstructorRepository.save.mockResolvedValue(instructorCreado as any);

      // Act
      const resultado = await service.crearInstructor(createInstructorDto);

      // Assert
      expect(mockInstructorRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'juan.perez@example.com' } // Email normalizado
      });
      expect(mockInstructorRepository.create).toHaveBeenCalledWith({
        nombre: 'Juan Pérez', // Nombre trimmed
        email: 'juan.perez@example.com' // Email normalizado
      });
      expect(resultado).toBe(instructorCreado);
    });

    it('debe rechazar instructor con email duplicado', async () => {
      // Arrange
      const createInstructorDto = {
        nombre: 'María García',
        email: 'maria@test.com'
      };
      const instructorExistente = { id: '1', email: 'maria@test.com' };

      mockInstructorRepository.findOne.mockResolvedValue(instructorExistente as any);

      // Act & Assert
      await expect(service.crearInstructor(createInstructorDto))
        .rejects.toThrow(BadRequestException);
      
      await expect(service.crearInstructor(createInstructorDto))
        .rejects.toThrow('Ya existe un instructor con email maria@test.com');
    });
  });

  describe('crearEvaluacion - Flujo crítico', () => {
    it('debe crear evaluación para curso existente', async () => {
      // Arrange
      const cursoId = 'curso-123';
      const createEvaluacionDto = {
        puntuacion: 4.5,
        comentario: 'Excelente curso'
      };
      const cursoExistente = { id: cursoId, titulo: 'Curso Test' };
      const evaluacionCreada = {
        id: '1',
        puntuacion: 4.5,
        comentario: 'Excelente curso',
        curso: cursoExistente
      };

      mockCursoRepository.findOne.mockResolvedValue(cursoExistente as any);
      mockEvaluacionRepository.create.mockReturnValue(evaluacionCreada as any);
      mockEvaluacionRepository.save.mockResolvedValue(evaluacionCreada as any);

      // Act
      const resultado = await service.crearEvaluacion(cursoId, createEvaluacionDto);

      // Assert
      expect(mockCursoRepository.findOne).toHaveBeenCalledWith({
        where: { id: cursoId }
      });
      expect(mockEvaluacionRepository.create).toHaveBeenCalledWith({
        curso: cursoExistente,
        puntuacion: 4.5,
        comentario: 'Excelente curso'
      });
      expect(resultado).toBe(evaluacionCreada);
    });

    it('debe rechazar evaluación para curso inexistente', async () => {
      // Arrange
      const cursoId = 'curso-inexistente';
      const createEvaluacionDto = {
        puntuacion: 4.5,
        comentario: 'Test'
      };

      mockCursoRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.crearEvaluacion(cursoId, createEvaluacionDto))
        .rejects.toThrow(BadRequestException);
      
      await expect(service.crearEvaluacion(cursoId, createEvaluacionDto))
        .rejects.toThrow('Curso con id curso-inexistente no existe');

      // Verificar que no se intentó crear evaluación
      expect(mockEvaluacionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('busquedaAvanzadaOptimizada - Caching y query building', () => {
    it('debe retornar resultados desde cache cuando están disponibles', async () => {
      // Arrange
      const parametrosBusqueda = {
        description: 'TypeScript',
        limit: 10,
        offset: 0
      };
      const resultadosCache = [
        { id: '1', titulo: 'Curso TypeScript', descripcion: 'Aprende TypeScript' }
      ];

      mockCacheManager.get.mockResolvedValue(resultadosCache);

      // Act
      const resultado = await service.busquedaAvanzadaOptimizada(parametrosBusqueda);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `busqueda:${JSON.stringify(parametrosBusqueda)}`
      );
      expect(resultado).toBe(resultadosCache);

      // Verificar que NO se ejecutó query
      expect(mockCursoRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('debe ejecutar query y cachear resultados cuando cache está vacío', async () => {
      // Arrange
      const parametrosBusqueda = {
        textoBusqueda: 'JavaScript avanzado',
        limit: 5
      };
      const resultadosQuery = [
        { id: '2', titulo: 'JavaScript Avanzado', descripcion: 'Conceptos avanzados' }
      ];

      // Mock del query builder
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(resultadosQuery)
      };

      mockCacheManager.get.mockResolvedValue(undefined); // Cache vacío
      mockCursoRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const resultado = await service.busquedaAvanzadaOptimizada(parametrosBusqueda);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCursoRepository.createQueryBuilder).toHaveBeenCalledWith('curso');
      
      // Verificar que se construyó la query correctamente
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "to_tsvector('spanish', curso.titulo || ' ' || curso.descripcion) @@ plainto_tsquery('spanish', :texto)",
        { texto: 'JavaScript avanzado' }
      );
      
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();

      // Verificar que se cachearon los resultados
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        resultadosQuery,
        expect.any(Number)
      );

      expect(resultado).toBe(resultadosQuery);
    });
  });

  describe('Casos edge - Manejo de errores', () => {
    it('debe manejar errores de base de datos en crearEtiqueta', async () => {
      // Arrange
      const createEtiquetaDto = { nombre: 'Test' };
      const errorBD = new Error('Error de conexión a BD');

      mockEtiquetaRepository.findOne.mockRejectedValue(errorBD);

      // Act & Assert
      await expect(service.crearEtiqueta(createEtiquetaDto))
        .rejects.toThrow('Error de conexión a BD');
    });

    it('debe fallar cuando el cache falla (sin manejo de errores)', async () => {
      // Arrange
      const parametrosBusqueda = { description: 'test' };
      
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));

      // Act & Assert - El servicio debe fallar porque no maneja errores de cache
      await expect(service.busquedaAvanzadaOptimizada(parametrosBusqueda))
        .rejects.toThrow('Cache error');
    });
  });
});
