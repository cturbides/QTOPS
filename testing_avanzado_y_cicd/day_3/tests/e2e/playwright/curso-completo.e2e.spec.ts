import { test, expect, Browser, Page } from '@playwright/test';
import { CursoApiClient, CursoCompleto } from '../api/curso-api-client';

let apiClient: CursoApiClient;

test.beforeAll(async () => {
  apiClient = new CursoApiClient(process.env.BASE_URL || 'http://localhost:3002');
  
  // Verificar que los servicios estén disponibles
  try {
    await apiClient.verificarSalud();
    console.log('✅ Servicios disponibles para pruebas E2E');
  } catch (error) {
    console.error('❌ Servicios no disponibles:', error.message);
    throw new Error('Servicios backend no están disponibles para pruebas E2E');
  }
});

test.beforeEach(async () => {
  // Limpiar métricas para cada prueba
  apiClient.limpiarMetricas();
});

test.describe('Suite E2E - Sistema Gestión de Cursos', () => {
  
  test.describe('Flujo Crítico: Gestión Completa de Cursos', () => {
    test('debe crear instructor, etiquetas y curso con flujo completo', async ({ page }) => {
      // **PASO 1: Verificar disponibilidad del sistema**
      const inicioTiempo = Date.now();
      await page.goto('/health');
      
      const saludResponse = await page.textContent('pre');
      expect(saludResponse).toContain('{"status":"ok"');
      
      // **PASO 2: Crear instructor via API**
      const instructor = await apiClient.crearInstructor({
        nombre: 'Dr. Juan E2E Pérez',
        email: `instructor-e2e-${Date.now()}@test.com`,
        biografia: 'Instructor para pruebas E2E'
      });
      
      expect(instructor.id).toBeDefined();
      expect(instructor.nombre).toBe('Dr. Juan E2E Pérez');
      console.log('✅ Instructor creado:', instructor.id);
      
      // **PASO 3: Crear etiquetas**
      const timestamp = Date.now();
      const etiquetaJS = await apiClient.crearEtiqueta({ nombre: `JavaScript-E2E-${timestamp}` });
      const etiquetaNode = await apiClient.crearEtiqueta({ nombre: `NodeJS-E2E-${timestamp}` });
      
      expect(etiquetaJS.id).toBeDefined();
      expect(etiquetaNode.id).toBeDefined();
      console.log('✅ Etiquetas creadas:', etiquetaJS.id, etiquetaNode.id);
      
      // **PASO 4: Crear curso completo**
      const curso = await apiClient.crearCurso({
        titulo: `Curso E2E Completo ${Date.now()}`,
        descripcion: 'Curso creado durante pruebas end-to-end automatizadas',
        instructorId: instructor.id,
        etiquetaIds: [etiquetaJS.id, etiquetaNode.id]
      });
      
      expect(curso.id).toBeDefined();
      expect(curso.titulo).toContain('Curso E2E Completo');
      expect(curso.instructor.id).toBe(instructor.id);
      console.log('✅ Curso creado:', curso.id);
      
      // **PASO 5: Verificar curso via API**
      const cursoVerificado = await apiClient.obtenerCurso(curso.id);
      expect(cursoVerificado.titulo).toBe(curso.titulo);
      expect(cursoVerificado.activo).toBe(true);
      
      // **PASO 6: Agregar evaluación**
      const evaluacion = await apiClient.crearEvaluacion(curso.id, {
        puntuacion: 5,
        comentario: 'Excelente curso de prueba E2E'
      });
      
      expect(evaluacion.id).toBeDefined();
      expect(evaluacion.puntuacion).toBe(5);
      
      const tiempoTotal = Date.now() - inicioTiempo;
      console.log(`⏱️ Flujo completo ejecutado en: ${tiempoTotal}ms`);
      
      // **VALIDACIÓN DE PERFORMANCE**
      expect(tiempoTotal).toBeLessThan(10000); // Menos de 10 segundos
    });
    
    test('debe buscar cursos con filtros avanzados', async ({ page }) => {
      // **SETUP: Crear datos de prueba**
      const instructor = await apiClient.crearInstructor({
        nombre: 'Prof. Search E2E',
        email: `search-${Date.now()}@test.com`
      });
      
      const timestamp = Date.now();
      const etiquetaReact = await apiClient.crearEtiqueta({ nombre: `React-Search-${timestamp}` });
      
      const cursoTest = await apiClient.crearCurso({
        titulo: 'Curso React Búsqueda E2E',
        descripcion: 'Curso para probar funcionalidad de búsqueda',
        instructorId: instructor.id,
        etiquetaIds: [etiquetaReact.id]
      });
      
      // **PASO 1: Realizar búsqueda avanzada**
      const resultadosBusqueda = await apiClient.buscarCursos('React', {
        limite: 10,
        offset: 0
      });
      
      expect(resultadosBusqueda.cursos).toBeDefined();
      expect(resultadosBusqueda.total).toBeGreaterThanOrEqual(1);
      expect(resultadosBusqueda.tiempo_respuesta).toBeLessThan(500); // < 500ms
      
      // **PASO 2: Verificar que nuestro curso aparece en resultados**
      const cursoEncontrado = resultadosBusqueda.cursos.find(
        curso => curso.id === cursoTest.id
      );
      
      expect(cursoEncontrado).toBeDefined();
      if (cursoEncontrado) {
        expect(cursoEncontrado.titulo).toContain('React');
      }
      
      console.log(`✅ Búsqueda completada: ${resultadosBusqueda.total} resultados en ${resultadosBusqueda.tiempo_respuesta}ms`);
    });
  });

  test.describe('Pruebas de Performance Integradas', () => {
    test('debe manejar múltiples operaciones concurrentes', async ({ page }) => {
      const inicioTiempo = Date.now();
      
      // **OPERACIONES CONCURRENTES**
      const operacionesConcurrentes = await Promise.allSettled([
        // Crear instructores concurrentemente
        apiClient.crearInstructor({ nombre: 'Instructor Concurrente 1', email: `conc1-${Date.now()}@test.com` }),
        apiClient.crearInstructor({ nombre: 'Instructor Concurrente 2', email: `conc2-${Date.now()}@test.com` }),
        
        // Crear etiquetas concurrentemente
        apiClient.crearEtiqueta({ nombre: `Etiqueta-Concurrente-1-${Date.now()}` }),
        apiClient.crearEtiqueta({ nombre: `Etiqueta-Concurrente-2-${Date.now()}` }),
        
        // Realizar búsquedas concurrentes
        apiClient.buscarCursos('Concurrente'),
        apiClient.buscarCursos('Test'),
        
        // Verificar salud del sistema
        apiClient.verificarSalud()
      ]);
      
      const tiempoTotal = Date.now() - inicioTiempo;
      
      // **VALIDACIONES**
      const operacionesExitosas = operacionesConcurrentes.filter(
        op => op.status === 'fulfilled'
      ).length;
      
      const operacionesFallidas = operacionesConcurrentes.filter(
        op => op.status === 'rejected'
      ).length;
      
      console.log(`✅ Operaciones exitosas: ${operacionesExitosas}`);
      console.log(`❌ Operaciones fallidas: ${operacionesFallidas}`);
      console.log(`⏱️ Tiempo total: ${tiempoTotal}ms`);
      
      expect(operacionesExitosas).toBeGreaterThanOrEqual(5); // Al menos 5 de 7 exitosas
      expect(tiempoTotal).toBeLessThan(5000); // Menos de 5 segundos
      
      // **MÉTRICAS DE PERFORMANCE**
      const metricas = apiClient.obtenerMetricas();
      const promedioTiempo = apiClient.obtenerPromedioTiempoRespuesta();
      const percentil95 = apiClient.obtenerPercentil95();
      
      expect(promedioTiempo).toBeLessThan(500); // Promedio < 500ms
      expect(percentil95).toBeLessThan(1000); // P95 < 1000ms
      
      console.log(`📊 Promedio: ${promedioTiempo}ms, P95: ${percentil95}ms`);
    });
    
    test('debe mantener performance bajo carga de búsquedas', async ({ page }) => {
      // **SETUP: Crear datos para búsqueda**
      const instructor = await apiClient.crearInstructor({
        nombre: 'Prof. Performance',
        email: `perf-${Date.now()}@test.com`
      });
      
      // **CARGA DE BÚSQUEDAS CONCURRENTES**
      const terminosBusqueda = [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
        'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'
      ];
      
      const inicioTiempo = Date.now();
      
      const busquedasConcurrentes = await Promise.allSettled(
        terminosBusqueda.map(termino => 
          apiClient.buscarCursos(termino, { limite: 5 })
        )
      );
      
      const tiempoTotal = Date.now() - inicioTiempo;
      
      // **VALIDACIONES DE PERFORMANCE**
      const busquedasExitosas = busquedasConcurrentes.filter(
        busqueda => busqueda.status === 'fulfilled'
      ).length;
      
      expect(busquedasExitosas).toBe(10); // Todas las búsquedas exitosas
      expect(tiempoTotal).toBeLessThan(4000); // Menos de 4 segundos total
      
      // **ANÁLISIS DE MÉTRICAS**
      const metricas = apiClient.obtenerMetricas();
      const busquedasMetricas = metricas.filter(m => m.endpoint.includes('/search/advanced'));
      
      const tiempoPromedioBusqueda = busquedasMetricas.reduce(
        (acc, m) => acc + m.tiempo_respuesta, 0
      ) / busquedasMetricas.length;
      
      expect(tiempoPromedioBusqueda).toBeLessThan(300); // Promedio búsquedas < 300ms
      
      console.log(`🔍 ${busquedasExitosas} búsquedas en ${tiempoTotal}ms (promedio: ${tiempoPromedioBusqueda}ms)`);
    });
  });

  test.describe('Validación de Contratos API', () => {
    test('debe mantener contratos de respuesta consistentes', async ({ page }) => {
      // **CONTRATO: Estructura de respuesta de curso**
      const instructor = await apiClient.crearInstructor({
        nombre: 'Prof. Contrato',
        email: `contrato-${Date.now()}@test.com`
      });
      
      const etiqueta = await apiClient.crearEtiqueta({
        nombre: `Etiqueta-Contrato-${Date.now()}`
      });
      
      const curso = await apiClient.crearCurso({
        titulo: 'Curso Validación Contrato',
        descripcion: 'Curso para validar contratos API',
        instructorId: instructor.id,
        etiquetaIds: [etiqueta.id]
      });
      
      // **VALIDAR CONTRATO DE CURSO**
      expect(curso).toMatchObject({
        id: expect.any(String),
        titulo: expect.any(String),
        descripcion: expect.any(String),
        activo: expect.any(Boolean),
        instructor: {
          id: expect.any(String),
          nombre: expect.any(String),
          email: expect.any(String)
        }
      });
      
      // **CONTRATO: Estructura de búsqueda**
      const resultadosBusqueda = await apiClient.buscarCursos('Contrato');
      
      expect(resultadosBusqueda).toMatchObject({
        cursos: expect.any(Array),
        total: expect.any(Number),
        pagina: expect.any(Number),
        limite: expect.any(Number),
        tiempo_respuesta: expect.any(Number)
      });
      
      if (resultadosBusqueda.cursos.length > 0) {
        const primerCurso = resultadosBusqueda.cursos[0];
        expect(primerCurso).toMatchObject({
          id: expect.any(String),
          titulo: expect.any(String),
          descripcion: expect.any(String),
          instructor: expect.any(Object),
          etiquetas: expect.any(Array)
        });
      }
      
      console.log('✅ Contratos API validados correctamente');
    });
  });
});
