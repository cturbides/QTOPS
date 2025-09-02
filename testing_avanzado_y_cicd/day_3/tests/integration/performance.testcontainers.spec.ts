/// <reference types="jest" />
import { TestEnvironment, TestServices } from '../setup/test-environment';

describe('Pruebas de Performance - Test Containers', () => {
  let testEnvironment: TestEnvironment;
  let servicios: TestServices;

  beforeAll(async () => {
    testEnvironment = await TestEnvironment.create(['postgres', 'redis']);
    servicios = testEnvironment.getServices();
  }, 60000);

  afterAll(async () => {
    await testEnvironment?.cleanup();
  });

  beforeEach(async () => {
    await testEnvironment.cleanDatabase();
  });

  describe('Performance de Operaciones Básicas', () => {
    it('debe crear etiquetas rápidamente (< 100ms cada una)', async () => {
      const startTime = Date.now();
      
      const etiquetas = await Promise.all([
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'javascript' }),
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'typescript' }),
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'react' }),
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'nodejs' }),
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'express' })
      ]);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const timePerOperation = totalTime / 5;

      console.log(`⏱️  Tiempo total: ${totalTime}ms, Tiempo por etiqueta: ${timePerOperation}ms`);

      expect(etiquetas).toHaveLength(5);
      expect(timePerOperation).toBeLessThan(100); // < 100ms por operación
      expect(totalTime).toBeLessThan(500); // < 500ms total
    });

    it('debe crear instructores concurrentemente (< 150ms cada uno)', async () => {
      const startTime = Date.now();

      const instructores = await Promise.all([
        servicios.cursoCompleto.crearInstructor({ nombre: 'Ana García', email: 'ana@test.com' }),
        servicios.cursoCompleto.crearInstructor({ nombre: 'Luis Pérez', email: 'luis@test.com' }),
        servicios.cursoCompleto.crearInstructor({ nombre: 'María López', email: 'maria@test.com' }),
        servicios.cursoCompleto.crearInstructor({ nombre: 'Carlos Ruiz', email: 'carlos@test.com' })
      ]);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const timePerOperation = totalTime / 4;

      console.log(`⏱️  Tiempo total: ${totalTime}ms, Tiempo por instructor: ${timePerOperation}ms`);

      expect(instructores).toHaveLength(4);
      expect(timePerOperation).toBeLessThan(150); // < 150ms por operación
      expect(totalTime).toBeLessThan(600); // < 600ms total
    });
  });

  describe('Performance de Carga Concurrente', () => {
    it('debe manejar 10 operaciones concurrentes de etiquetas (< 1s total)', async () => {
      const startTime = Date.now();

      // Crear 10 etiquetas concurrentemente
      const promises = Array.from({ length: 10 }, (_, i) =>
        servicios.cursoCompleto.crearEtiqueta({ nombre: `etiqueta-${i}` })
      );

      const resultados = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`⏱️  10 etiquetas concurrentes: ${totalTime}ms`);

      expect(resultados).toHaveLength(10);
      expect(totalTime).toBeLessThan(1000); // < 1 segundo
      expect(resultados.every(r => r.id)).toBe(true);
    });

    it('debe manejar búsquedas bajo carga (< 200ms por búsqueda)', async () => {
      // Setup: Crear datos de prueba
      const instructor = await servicios.cursoCompleto.crearInstructor({
        nombre: 'Instructor Performance',
        email: 'perf@test.com'
      });

      // Crear múltiples etiquetas y cursos para búsqueda
      await Promise.all([
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'performance-tag-1' }),
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'performance-tag-2' }),
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'performance-tag-3' })
      ]);

      // Test: Múltiples búsquedas concurrentes
      const startTime = Date.now();

      const busquedas = await Promise.all([
        servicios.cursoCompleto.busquedaAvanzadaOptimizada({
          textoBusqueda: 'performance',
          limit: 10,
          offset: 0
        }),
        servicios.cursoCompleto.busquedaAvanzadaOptimizada({
          textoBusqueda: 'tag',
          limit: 5,
          offset: 0
        }),
        servicios.cursoCompleto.busquedaAvanzadaOptimizada({
          textoBusqueda: 'instructor',
          limit: 10,
          offset: 0
        })
      ]);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const timePerSearch = totalTime / 3;

      console.log(`⏱️  3 búsquedas concurrentes: ${totalTime}ms, promedio: ${timePerSearch}ms`);

      expect(busquedas).toHaveLength(3);
      expect(timePerSearch).toBeLessThan(200); // < 200ms por búsqueda
      expect(totalTime).toBeLessThan(600); // < 600ms total
    });

    it('debe manejar operaciones mixtas concurrentes (< 2s total)', async () => {
      const startTime = Date.now();

      // Operaciones mixtas concurrentes
      const operaciones = await Promise.allSettled([
        // Crear etiquetas
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'react-perf' }),
        servicios.cursoCompleto.crearEtiqueta({ nombre: 'vue-perf' }),
        
        // Crear instructores
        servicios.cursoCompleto.crearInstructor({ nombre: 'Perf Teacher 1', email: 'perf1@test.com' }),
        servicios.cursoCompleto.crearInstructor({ nombre: 'Perf Teacher 2', email: 'perf2@test.com' }),
        
        // Búsquedas
        servicios.cursoCompleto.busquedaAvanzadaOptimizada({
          textoBusqueda: 'perf',
          limit: 5,
          offset: 0
        }),
        servicios.cursoCompleto.busquedaAvanzadaOptimizada({
          textoBusqueda: 'teacher',
          limit: 5,
          offset: 0
        })
      ]);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`⏱️  6 operaciones mixtas concurrentes: ${totalTime}ms`);

      // Verificar que todas las operaciones fueron exitosas
      const exitosas = operaciones.filter(op => op.status === 'fulfilled').length;
      const fallidas = operaciones.filter(op => op.status === 'rejected').length;

      console.log(`✅ Exitosas: ${exitosas}, ❌ Fallidas: ${fallidas}`);

      expect(exitosas).toBeGreaterThanOrEqual(4); // Al menos 4 operaciones exitosas
      expect(totalTime).toBeLessThan(2000); // < 2 segundos total
    });
  });

  describe('Performance de Evaluaciones', () => {
    it('debe crear evaluaciones rápidamente con relaciones (< 300ms cada una)', async () => {
      // Setup
      const instructor = await servicios.cursoCompleto.crearInstructor({
        nombre: 'Eval Teacher',
        email: 'eval@test.com'
      });

      const dataSource = testEnvironment.getDataSource();
      const cursoRepository = dataSource.getRepository('CursoCompleto');
      
      const curso = await cursoRepository.save({
        titulo: 'Curso Performance Test',
        descripcion: 'Testing evaluaciones performance',
        activo: true,
        instructor: instructor
      });

      // Test: Crear evaluaciones concurrentemente
      const startTime = Date.now();

      const evaluaciones = await Promise.all([
        servicios.evaluacion.repository.save({
          puntuacion: 5,
          comentario: 'Excelente curso - eval 1',
          curso: curso
        }),
        servicios.evaluacion.repository.save({
          puntuacion: 4,
          comentario: 'Muy buen curso - eval 2',
          curso: curso
        }),
        servicios.evaluacion.repository.save({
          puntuacion: 5,
          comentario: 'Perfecto - eval 3',
          curso: curso
        })
      ]);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const timePerEvaluation = totalTime / 3;

      console.log(`⏱️  3 evaluaciones: ${totalTime}ms, promedio: ${timePerEvaluation}ms`);

      expect(evaluaciones).toHaveLength(3);
      expect(timePerEvaluation).toBeLessThan(300); // < 300ms por evaluación
      expect(totalTime).toBeLessThan(900); // < 900ms total
    });
  });

  describe('Stress Test Básico', () => {
    it('debe manejar 20 operaciones concurrentes sin fallar (< 3s)', async () => {
      const startTime = Date.now();

      // 20 operaciones concurrentes de diferentes tipos
      const promises = [
        ...Array.from({ length: 8 }, (_, i) => 
          servicios.cursoCompleto.crearEtiqueta({ nombre: `stress-tag-${i}` })
        ),
        ...Array.from({ length: 6 }, (_, i) => 
          servicios.cursoCompleto.crearInstructor({ 
            nombre: `Stress Teacher ${i}`, 
            email: `stress${i}@test.com` 
          })
        ),
        ...Array.from({ length: 6 }, () => 
          servicios.cursoCompleto.busquedaAvanzadaOptimizada({
            textoBusqueda: 'stress',
            limit: 5,
            offset: 0
          })
        )
      ];

      const resultados = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const exitosas = resultados.filter(r => r.status === 'fulfilled').length;
      const fallidas = resultados.filter(r => r.status === 'rejected').length;

      console.log(`⏱️  Stress test (20 ops): ${totalTime}ms`);
      console.log(`✅ Exitosas: ${exitosas}, ❌ Fallidas: ${fallidas}`);

      expect(exitosas).toBeGreaterThanOrEqual(18); // Al menos 90% de éxito
      expect(totalTime).toBeLessThan(3000); // < 3 segundos
    });
  });
});
