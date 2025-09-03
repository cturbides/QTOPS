/// <reference types="jest" />
import { TestEnvironment, TestServices } from '../setup/test-environment';
import { DataSource } from 'typeorm';

// **PRUEBAS DE INTEGRACIÓN CON TEST CONTAINERS**
// Testing con infraestructura real efímera - PostgreSQL y Redis en contenedores
describe('Sistema Gestión Cursos - Integración con Test Containers', () => {
  let testEnvironment: TestEnvironment;
  let servicios: TestServices;
  let dataSource: DataSource;

  beforeAll(async () => {
    // Crear ambiente de testing con contenedores reales
    testEnvironment = await TestEnvironment.create(['postgres', 'redis']);
    servicios = testEnvironment.getServices();
    dataSource = testEnvironment.getDataSource();
  }, 60000); // Timeout mayor para inicialización de contenedores

  afterAll(async () => {
    await testEnvironment.cleanup();
  });

  beforeEach(async () => {
    // Limpiar estado entre pruebas para determinismo
    await testEnvironment.cleanDatabase();
  });

  describe('Flujo completo de gestión de cursos - Infraestructura real', () => {
    it('debe crear etiquetas, instructor y curso con persistencia real', async () => {
      // **PASO 1: Crear etiquetas**
      const etiqueta1 = await servicios.cursoCompleto.crearEtiqueta({
        nombre: 'JavaScript Avanzado'
      });
      
      const etiqueta2 = await servicios.cursoCompleto.crearEtiqueta({
        nombre: 'Frontend'
      });

      expect(etiqueta1).toBeDefined();
      expect(etiqueta1.nombre).toBe('javascript avanzado'); // Normalizado
      expect(etiqueta2.nombre).toBe('frontend');

      // **PASO 2: Crear instructor**
      const instructor = await servicios.cursoCompleto.crearInstructor({
        nombre: 'María González',
        email: 'maria.gonzalez@test.com'
      });

      expect(instructor.nombre).toBe('María González');
      expect(instructor.email).toBe('maria.gonzalez@test.com'); // Normalizado

      // **PASO 3: Verificar persistencia en base de datos real**
      const etiquetasEnBD = await dataSource.query(
        'SELECT * FROM etiquetas ORDER BY nombre'
      );
      expect(etiquetasEnBD).toHaveLength(2);
      expect(etiquetasEnBD[0].nombre).toBe('frontend');
      expect(etiquetasEnBD[1].nombre).toBe('javascript avanzado');

      const instructoresEnBD = await dataSource.query(
        'SELECT * FROM instructores WHERE email = $1',
        ['maria.gonzalez@test.com']
      );
      expect(instructoresEnBD).toHaveLength(1);
      expect(instructoresEnBD[0].nombre).toBe('María González');
    });

    it('debe procesar evaluaciones con persistencia real', async () => {
      // **SETUP: Crear instructor**
      const instructor = await servicios.cursoCompleto.crearInstructor({
        nombre: 'Carlos Test',
        email: 'carlos@test.com'
      });

      // Usar TypeORM para crear curso de manera consistente con las entidades
      const cursoRepository = dataSource.getRepository('CursoCompleto');
      const curso = await cursoRepository.save({
        titulo: 'Curso Test Containers',
        descripcion: 'Descripción del curso',
        activo: true
      });

      // **PASO 1: Crear evaluación**
      // 5. Crear evaluación 
      const nuevaEvaluacion = servicios.evaluacion.repository.create({
        puntuacion: 4,
        comentario: 'Excelente curso',
        curso: curso
      });
      const evaluacion = await servicios.evaluacion.repository.save(nuevaEvaluacion);

      expect(evaluacion.puntuacion).toBe(4);
      expect(evaluacion.comentario).toBe('Excelente curso');

      // **PASO 2: Verificar persistencia real usando repositorio**
      const evaluacionesEnBD = await servicios.evaluacion.repository.find({
        where: { curso: { id: curso.id } },
        relations: ['curso']
      });

      expect(evaluacionesEnBD).toHaveLength(1);
      expect(evaluacionesEnBD[0].puntuacion).toBe(4);
      expect(evaluacionesEnBD[0].comentario).toBe('Excelente curso');
    });

    it('debe manejar búsqueda avanzada con repositorios reales', async () => {
      // **SETUP: Crear datos de prueba usando repositorios directos**
      const instructor = await servicios.cursoCompleto.crearInstructor({
        nombre: 'Ana Búsqueda',
        email: 'ana@busqueda.com'
      });

      const etiqueta1 = await servicios.cursoCompleto.crearEtiqueta({
        nombre: 'typescript'
      });

      const etiqueta2 = await servicios.cursoCompleto.crearEtiqueta({
        nombre: 'programacion'
      });

      // Crear cursos usando repositorio directo para evitar problemas con DTO
      const cursoRepository = dataSource.getRepository('CursoCompleto');
      
      const curso1 = await cursoRepository.save({
        titulo: 'TypeScript Básico',
        descripcion: 'Aprende TypeScript desde cero',
        activo: true,
        instructor: instructor,
        etiquetas: [etiqueta1]
      });

      const curso2 = await cursoRepository.save({
        titulo: 'TypeScript Avanzado',
        descripcion: 'Conceptos avanzados de TypeScript',
        activo: true,
        instructor: instructor,
        etiquetas: [etiqueta2]
      });

      // **PASO 1: Primera búsqueda (debe ir a BD)**
      const primeraConsulta = await servicios.cursoCompleto.busquedaAvanzadaOptimizada({
        textoBusqueda: 'TypeScript',
        limit: 10,
        offset: 0
      });

      expect(primeraConsulta).toHaveLength(2);
      expect(primeraConsulta.every(curso => curso.titulo.includes('TypeScript'))).toBe(true);

      // **PASO 2: Búsqueda diferente**
      const tercerConsulta = await servicios.cursoCompleto.busquedaAvanzadaOptimizada({
        textoBusqueda: 'Avanzado',
        limit: 5,
        offset: 0
      });

      expect(tercerConsulta).toHaveLength(1);
      expect(tercerConsulta[0].titulo).toBe('TypeScript Avanzado');
    });

    it('debe manejar errores de duplicación correctamente', async () => {
      // **PASO 1: Crear etiqueta exitosamente**
      const etiqueta1 = await servicios.cursoCompleto.crearEtiqueta({
        nombre: 'React Hooks'
      });

      expect(etiqueta1.nombre).toBe('react hooks');

      // **PASO 2: Intentar crear etiqueta duplicada**
      await expect(
        servicios.cursoCompleto.crearEtiqueta({
          nombre: 'REACT HOOKS' // Diferente capitalización
        })
      ).rejects.toThrow("La etiqueta 'REACT HOOKS' ya existe");

      // **PASO 3: Probar duplicación de instructor**
      const instructor1 = await servicios.cursoCompleto.crearInstructor({
        nombre: 'Pedro Duplicado',
        email: 'pedro@test.com'
      });

      await expect(
        servicios.cursoCompleto.crearInstructor({
          nombre: 'Pedro Diferente',
          email: 'pedro@test.com' // Mismo email
        })
      ).rejects.toThrow('Ya existe un instructor con email pedro@test.com');
    });

    it('debe validar curso inexistente para evaluaciones', async () => {
      // **PASO 1: Intentar crear evaluación para curso inexistente**
      await expect(
        servicios.cursoCompleto.crearEvaluacion('00000000-0000-0000-0000-000000000000', {
          puntuacion: 5.0,
          comentario: 'No debería crearse'
        })
      ).rejects.toThrow('Curso con id 00000000-0000-0000-0000-000000000000 no existe');

      // **PASO 2: Crear evaluación válida**
      const instructor = await servicios.cursoCompleto.crearInstructor({
        nombre: 'Test Transacciones',
        email: 'transacciones@test.com'
      });

      const cursoRepository = dataSource.getRepository('CursoCompleto');
      const curso = await cursoRepository.save({
        titulo: 'Curso Transacciones',
        descripcion: 'Testing de transacciones',
        activo: true
      });

      const evaluacionValida = await servicios.cursoCompleto.crearEvaluacion(curso.id, {
        puntuacion: 4.0,
        comentario: 'Evaluación válida'
      });

      expect(evaluacionValida.puntuacion).toBe(4.0);
      expect(evaluacionValida.comentario).toBe('Evaluación válida');
    });
  });

  describe('Performance y concurrencia con infraestructura real', () => {
    it('debe manejar operaciones concurrentes correctamente', async () => {
      // **PASO 1: Crear múltiples etiquetas concurrentemente**
      const etiquetasPromises = [
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'React' }),
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'Vue' }),
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'Angular' }),
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'Svelte' })
      ];

      const etiquetas = await Promise.all(etiquetasPromises);

      expect(etiquetas).toHaveLength(4);
      expect(etiquetas.map(e => e.nombre).sort()).toEqual(['angular', 'react', 'svelte', 'vue']);

      // **PASO 2: Intentar crear duplicados concurrentemente (deben fallar)**
      const duplicadosPromises = [
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'REACT' }), // Duplicado
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'VUE' }),   // Duplicado
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'Nuxt' })   // Nueva
      ];

      const resultados = await Promise.allSettled(duplicadosPromises);

      // Primeros dos deben fallar, tercero debe ser exitoso
      expect(resultados[0].status).toBe('rejected');
      expect(resultados[1].status).toBe('rejected');
      expect(resultados[2].status).toBe('fulfilled');
    });
  });
});
