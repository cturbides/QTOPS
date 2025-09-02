import 'reflect-metadata';

// Setup global para todos los tests - configuración de entorno
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'elearning_test';
process.env.SERVICE_NAME = 'curso-completo-test';

// Helpers globales para testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidCurso(): R;
      toHaveValidInscripcion(): R;
    }
  }
}

// Matchers personalizados
expect.extend({
  toBeValidCurso(received) {
    const pass = received && 
                 typeof received.id === 'string' &&
                 typeof received.titulo === 'string' &&
                 received.titulo.length >= 5 &&
                 typeof received.precio === 'number' &&
                 received.precio > 0;

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid curso`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid curso`,
        pass: false,
      };
    }
  },

  toHaveValidInscripcion(received) {
    const pass = received && 
                 received.estudianteId &&
                 received.cursoId &&
                 received.fechaInscripcion &&
                 ['ACTIVA', 'PENDIENTE', 'CANCELADA'].includes(received.estado);

    if (pass) {
      return {
        message: () => `Expected ${received} not to have valid inscripcion`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to have valid inscripcion`,
        pass: false,
      };
    }
  }
});
