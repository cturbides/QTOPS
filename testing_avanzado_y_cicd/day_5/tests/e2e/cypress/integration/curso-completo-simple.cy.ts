/// <reference types="cypress" />

describe('Suite E2E Cypress - Gestión de Cursos (API Only)', () => {
  beforeEach(() => {
    // Verificar que el backend esté disponible
    cy.request('GET', '/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'ok');
    });
  });

  describe('API Health Check', () => {
    it('debe validar que el servicio esté disponible', () => {
      cy.request('GET', '/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'ok');
        expect(response.body).to.have.property('info');
        
        // Verificar tiempo de respuesta
        expect(response.duration).to.be.lessThan(1000);
      });
    });

    it('debe validar endpoint de búsqueda avanzada', () => {
      cy.request({
        method: 'GET',
        url: '/cursos/search/advanced?textoBusqueda=test&limit=5',
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404]).to.include(response.status);
        
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
        }
      });
    });
  });

  describe('CRUD de Etiquetas', () => {
    it('debe crear una nueva etiqueta', () => {
      const uniqueName = `test-etiqueta-${Date.now()}`;
      
      cy.request({
        method: 'POST',
        url: '/cursos/etiquetas',
        body: { nombre: uniqueName }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('nombre', uniqueName);
      });
    });
  });

  describe('CRUD de Instructores', () => {
    it('debe crear un nuevo instructor', () => {
      const uniqueEmail = `instructor-${Date.now()}@example.com`;
      
      cy.request({
        method: 'POST',
        url: '/cursos/instructores',
        body: {
          nombre: 'Instructor Test',
          email: uniqueEmail,
          especialidad: 'Testing'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('email', uniqueEmail);
      });
    });
  });

  describe('Performance de APIs', () => {
    it('debe responder rápidamente a consultas básicas', () => {
      const startTime = Date.now();
      
      cy.request('GET', '/health').then(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        expect(responseTime).to.be.lessThan(500); // Menos de 500ms
      });
    });
  });
});
