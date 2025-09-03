// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

import './commands';

// Configuración global para todas las pruebas E2E
beforeEach(() => {
  // Configurar timeouts más largos para E2E
  Cypress.config('defaultCommandTimeout', 10000);
  Cypress.config('requestTimeout', 10000);
  Cypress.config('responseTimeout', 10000);
  
  // Limpiar localStorage y sessionStorage
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
});

// Manejo global de errores de aplicación
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar ciertos errores que no son críticos para las pruebas
  if (err.message.includes('Script error')) {
    return false;
  }
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// Logging mejorado para debugging
Cypress.on('log:added', (attrs) => {
  if (attrs.instrument === 'command' && attrs.consoleProps) {
    console.log(`[${attrs.name}]`, attrs.consoleProps);
  }
});

// Configurar variables de entorno para pruebas
Cypress.env('API_BASE_URL', Cypress.config('baseUrl'));
Cypress.env('TEST_TIMEOUT', 30000);
