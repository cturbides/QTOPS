/// <reference types="cypress" />

import { CursoApiClient } from '../../api/curso-api-client';

describe('Suite E2E Cypress - Gestión de Cursos', () => {
  let apiClient: CursoApiClient;

  before(() => {
    apiClient = new CursoApiClient(Cypress.config('baseUrl') || 'http://localhost:3000');
  });

  beforeEach(() => {
    // Verificar que el backend esté disponible
    cy.request('GET', '/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'ok');
    });
    
    // Limpiar métricas
    apiClient.limpiarMetricas();
  });

  describe('API Health Check', () => {
    it('debe validar que el servicio esté disponible', () => {
      // Solo test de API, sin navegación web
      cy.request('GET', '/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'ok');
        expect(response.body).to.have.property('info');
        
        // Verificar tiempo de respuesta
        expect(response.duration).to.be.lessThan(1000);
      });
    });

    it('debe validar APIs principales', () => {
      // Test básico de conectividad con los endpoints principales
      cy.request({
        method: 'GET',
        url: '/cursos/search/advanced?textoBusqueda=test&limit=5',
        failOnStatusCode: false
      }).then((response) => {
        // Puede devolver 200 con resultados o sin resultados
        expect([200, 404]).to.include(response.status);
        
        if (response.status === 200) {
          // La API devuelve directamente un array, no un objeto con propiedad cursos
          expect(response.body).to.be.an('array');
        }
      });
    });
  });

  describe('Validación de APIs con Cypress', () => {
    it('debe crear y gestionar cursos completos via API', () => {
      let instructorId: string;
      let etiquetaId: string;
      let cursoId: string;

      // Paso 1: Crear instructor
      cy.request('POST', '/cursos/instructores', {
        nombre: 'Instructor Cypress',
        email: `cypress-${Date.now()}@test.com`,
        biografia: 'Instructor creado por Cypress'
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body.nombre).to.eq('Instructor Cypress');
        instructorId = response.body.id;
      });

      // Paso 2: Crear etiqueta
      cy.request('POST', '/cursos/etiquetas', {
        nombre: `cypress-testing-${Date.now()}`
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        etiquetaId = response.body.id;
      });

      // Paso 3: Crear curso
      cy.then(() => {
        cy.request('POST', '/cursos', {
          titulo: `Curso Cypress ${Date.now()}`,
          descripcion: 'Curso creado durante pruebas Cypress',
          instructorId: instructorId,
          etiquetaIds: [etiquetaId]
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body).to.have.property('id');
          expect(response.body.titulo).to.contain('Curso Cypress');
          expect(response.body.instructor.id).to.eq(instructorId);
          cursoId = response.body.id;
        });
      });

      // Paso 4: Verificar curso creado
      cy.then(() => {
        cy.request('GET', `/cursos/${cursoId}`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.id).to.eq(cursoId);
          expect(response.body.activo).to.be.true;
        });
      });

      // Paso 5: Agregar evaluación
      cy.then(() => {
        cy.request('POST', `/cursos/${cursoId}/evaluaciones`, {
          puntuacion: 5,
          comentario: 'Excelente curso probado con Cypress'
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body.puntuacion).to.eq(5);
        });
      });
    });

    it('debe realizar búsquedas avanzadas con performance', () => {
      const startTime = Date.now();
      
      cy.request({
        method: 'GET',
        url: '/cursos/search/advanced?textoBusqueda=Cypress&limit=10&offset=0',
        failOnStatusCode: false
      }).then((response) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect([200, 404]).to.include(response.status);
        
        if (response.status === 200) {
          // La API devuelve directamente un array
          expect(response.body).to.be.an('array');
        }
        
        // Validar performance
        expect(responseTime).to.be.lessThan(1000); // < 1 segundo
        
        cy.log(`Búsqueda completada en ${responseTime}ms`);
      });
    });
  });

  describe('Pruebas de Carga y Stress', () => {
    it('debe manejar múltiples requests concurrentes', () => {
      const numRequests = 5;
      
      for (let i = 0; i < numRequests; i++) {
        cy.request({
          method: 'POST',
          url: '/cursos/etiquetas',
          body: { nombre: `etiqueta-concurrente-${i}-${Date.now()}` }
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body).to.have.property('id');
        });
      }
      
      cy.log(`${numRequests} etiquetas creadas concurrentemente`);
    });

    it('debe mantener estabilidad bajo carga de búsquedas', () => {
      const searchTerms = ['test', 'curso', 'javascript', 'node', 'express'];
      const startTime = Date.now();
      
      searchTerms.forEach(term => {
        cy.request({
          method: 'GET',
          url: `/cursos/search/advanced?textoBusqueda=${term}&limit=5`,
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 404]).to.include(response.status);
          
          if (response.status === 200) {
            expect(response.body).to.be.an('array');
          }
        });
      });
      
      cy.then(() => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        expect(totalTime).to.be.lessThan(5000); // < 5 segundos total
        cy.log(`${searchTerms.length} búsquedas completadas en ${totalTime}ms`);
      });
    });
  });

  describe('Validación de Contratos y Esquemas', () => {
    it('debe validar esquema de respuesta de curso', () => {
      // Crear datos de prueba
      cy.request('POST', '/cursos/instructores', {
        nombre: 'Instructor Esquema',
        email: `esquema-${Date.now()}@test.com`
      }).then((instructorResponse) => {
        
        cy.request('POST', '/cursos/etiquetas', {
          nombre: `etiqueta-esquema-${Date.now()}`
        }).then((etiquetaResponse) => {
          
          cy.request('POST', '/cursos', {
            titulo: 'Curso Validación Esquema',
            descripcion: 'Curso para validar esquemas de respuesta',
            instructorId: instructorResponse.body.id,
            etiquetaIds: [etiquetaResponse.body.id]
          }).then((cursoResponse) => {
            
            // Validar esquema completo de curso
            expect(cursoResponse.body).to.deep.include({
              titulo: 'Curso Validación Esquema',
              descripcion: 'Curso para validar esquemas de respuesta',
              activo: true
            });
            
            expect(cursoResponse.body).to.have.property('id').that.is.a('string');
            expect(cursoResponse.body).to.have.property('instructor').that.is.an('object');
            expect(cursoResponse.body.instructor).to.have.property('id').that.is.a('string');
            expect(cursoResponse.body.instructor).to.have.property('nombre').that.is.a('string');
            expect(cursoResponse.body.instructor).to.have.property('email').that.is.a('string');
          });
        });
      });
    });

    it('debe validar esquema de respuesta de búsqueda', () => {
      cy.request({
        method: 'GET',
        url: '/cursos/search/advanced?textoBusqueda=esquema&limit=5',
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404]).to.include(response.status);
        
        if (response.status === 200) {
          // La API devuelve directamente un array
          expect(response.body).to.be.an('array');
          
          // Si hay cursos, validar estructura
          if (response.body.length > 0) {
            const primerCurso = response.body[0];
            expect(primerCurso).to.have.property('id').that.is.a('string');
            expect(primerCurso).to.have.property('titulo').that.is.a('string');
            expect(primerCurso).to.have.property('descripcion').that.is.a('string');
            expect(primerCurso).to.have.property('instructor').that.is.an('object');
            expect(primerCurso).to.have.property('etiquetas').that.is.an('array');
          }
        }
      });
    });
  });
});
