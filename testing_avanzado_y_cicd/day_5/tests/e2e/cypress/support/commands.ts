/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Comando personalizado para crear un curso completo con todos sus datos
       */
      crearCursoCompleto(datos?: {
        titulo?: string;
        descripcion?: string;
        instructorNombre?: string;
        instructorEmail?: string;
        etiquetaNombre?: string;
      }): Chainable<{
        curso: any;
        instructor: any;
        etiqueta: any;
      }>;

      /**
       * Comando para verificar performance de una request
       */
      verificarPerformance(
        method: string, 
        url: string, 
        expectedMaxTime: number,
        body?: any
      ): Chainable<any>;

      /**
       * Comando para realizar múltiples requests concurrentes
       */
      requestsConcurrentes(requests: Array<{
        method: string;
        url: string;
        body?: any;
      }>): Chainable<any>;
    }
  }
}

// Comando para crear curso completo con todos los datos necesarios
Cypress.Commands.add('crearCursoCompleto', (datos = {}) => {
  const timestamp = Date.now();
  const defaultDatos = {
    titulo: `Curso E2E ${timestamp}`,
    descripcion: 'Curso creado durante pruebas E2E automatizadas',
    instructorNombre: `Instructor E2E ${timestamp}`,
    instructorEmail: `instructor-${timestamp}@e2e.test`,
    etiquetaNombre: `Etiqueta-E2E-${timestamp}`
  };
  
  const finalDatos = { ...defaultDatos, ...datos };
  
  let instructor: any;
  let etiqueta: any;
  let curso: any;
  
  return cy.request('POST', '/cursos/instructores', {
    nombre: finalDatos.instructorNombre,
    email: finalDatos.instructorEmail,
    biografia: 'Instructor creado por comando personalizado Cypress'
  }).then((instructorResponse) => {
    instructor = instructorResponse.body;
    
    return cy.request('POST', '/cursos/etiquetas', {
      nombre: finalDatos.etiquetaNombre
    });
  }).then((etiquetaResponse) => {
    etiqueta = etiquetaResponse.body;
    
    return cy.request('POST', '/cursos', {
      titulo: finalDatos.titulo,
      descripcion: finalDatos.descripcion,
      instructorId: instructor.id,
      etiquetaIds: [etiqueta.id]
    });
  }).then((cursoResponse) => {
    curso = cursoResponse.body;
    
    return cy.wrap({
      curso,
      instructor,
      etiqueta
    });
  });
});

// Comando para verificar performance de requests
Cypress.Commands.add('verificarPerformance', (method, url, expectedMaxTime, body = null) => {
  const startTime = Date.now();
  
  const requestConfig: any = {
    method,
    url,
    timeout: expectedMaxTime + 5000 // Timeout ligeramente mayor que el esperado
  };
  
  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    requestConfig.body = body;
  }
  
  return cy.request(requestConfig).then((response) => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Logs para debugging
    cy.log(`${method} ${url} - ${responseTime}ms`);
    
    // Verificar que la respuesta fue exitosa
    expect(response.status).to.be.oneOf([200, 201, 202]);
    
    // Verificar performance
    expect(responseTime).to.be.lessThan(expectedMaxTime, 
      `Request ${method} ${url} tomó ${responseTime}ms, esperado < ${expectedMaxTime}ms`);
    
    // Agregar métricas al response para uso posterior
    return cy.wrap({
      ...response,
      performanceMetrics: {
        responseTime,
        method,
        url,
        timestamp: new Date().toISOString()
      }
    });
  });
});

// Comando para requests concurrentes
Cypress.Commands.add('requestsConcurrentes', (requests) => {
  const startTime = Date.now();
  
  // Ejecutar todas las requests en paralelo usando cy.wrap y Promise.all
  const requestPromises = requests.map((req, index) => {
    const requestConfig: any = {
      method: req.method,
      url: req.url,
      failOnStatusCode: false // No fallar individualmente
    };
    
    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
      requestConfig.body = req.body;
    }
    
    return requestConfig;
  });
  
  // Usar cy.wrap para manejar Promise.all de forma compatible con Cypress
  return cy.wrap(null).then(() => {
    const promises = requestPromises.map((config, index) => 
      cy.request(config).then((response) => ({
        ...response,
        requestIndex: index,
        requestConfig: requests[index]
      }))
    );
    
    return Promise.all(promises);
  }).then((responses) => {
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    cy.log(`${requests.length} requests concurrentes completadas en ${totalTime}ms`);
    
    return {
      responses,
      metrics: {
        totalTime,
        requestCount: requests.length,
        averageTime: totalTime / requests.length,
        timestamp: new Date().toISOString()
      }
    };
  });
});

export {};
