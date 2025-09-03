const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

test.describe('Compatibilidad entre Navegadores - Funcionalidad Básica', () => {
  
  test('Health Check debe funcionar en todos los navegadores', async ({ page, browserName }) => {
    console.log(`🌐 Probando Health Check en ${browserName}`);
    
    const response = await page.goto(`${BASE_URL}/health`);
    expect(response.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toContain('status');
  });

  test('Búsqueda de cursos debe funcionar en todos los navegadores', async ({ page, browserName }) => {
    console.log(`🌐 Probando búsqueda de cursos en ${browserName}`);
    
    const response = await page.goto(`${BASE_URL}/cursos/search/advanced?textoBusqueda=test&limit=5`);
    expect(response.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toBeDefined();
    
    // Verificar que la respuesta es un array JSON válido
    const jsonContent = JSON.parse(content);
    expect(Array.isArray(jsonContent)).toBe(true);
  });

  test('Lista de cursos debe funcionar en todos los navegadores', async ({ page, browserName }) => {
    console.log(`🌐 Probando lista de cursos en ${browserName}`);
    
    const response = await page.goto(`${BASE_URL}/cursos/search/advanced?textoBusqueda=&limit=10`);
    expect(response.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toBeDefined();
    
    // Verificar que la respuesta es un array JSON válido
    const jsonContent = JSON.parse(content);
    expect(Array.isArray(jsonContent)).toBe(true);
  });

  test('Búsqueda avanzada debe funcionar en todos los navegadores', async ({ page, browserName }) => {
    console.log(`🌐 Probando búsqueda avanzada en ${browserName}`);
    
    const response = await page.goto(`${BASE_URL}/cursos/search/advanced?textoBusqueda=curso&limit=5`);
    expect(response.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toBeDefined();
    
    // Verificar que la respuesta es un array JSON válido
    const jsonContent = JSON.parse(content);
    expect(Array.isArray(jsonContent)).toBe(true);
  });

});

test.describe('Compatibilidad entre Navegadores - Rendimiento', () => {
  
  test('Tiempo de respuesta del Health Check debe ser consistente', async ({ page, browserName }) => {
    console.log(`⏱️ Probando rendimiento del Health Check en ${browserName}`);
    
    const startTime = Date.now();
    const response = await page.goto(`${BASE_URL}/health`, { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // Menos de 5 segundos
    
    console.log(`   ⏱️ Tiempo de respuesta en ${browserName}: ${responseTime}ms`);
  });

  test('Búsqueda debe ser rápida en todos los navegadores', async ({ page, browserName }) => {
    console.log(`⏱️ Probando rendimiento de búsqueda en ${browserName}`);
    
    const startTime = Date.now();
    const response = await page.goto(`${BASE_URL}/cursos/search/advanced?textoBusqueda=performance&limit=10`, {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(10000); // Menos de 10 segundos
    
    console.log(`   ⏱️ Tiempo de búsqueda en ${browserName}: ${responseTime}ms`);
  });

});

test.describe('Compatibilidad entre Navegadores - Headers y Encoding', () => {
  
  test('Content-Type debe ser consistente en todos los navegadores', async ({ page, browserName }) => {
    console.log(`📋 Probando Content-Type en ${browserName}`);
    
    const response = await page.goto(`${BASE_URL}/health`);
    const contentType = response.headers()['content-type'];
    
    expect(response.status()).toBe(200);
    expect(contentType).toContain('application/json');
    
    console.log(`   📋 Content-Type en ${browserName}: ${contentType}`);
  });

  test('Encoding UTF-8 debe funcionar en todos los navegadores', async ({ page, browserName }) => {
    console.log(`🔤 Probando encoding UTF-8 en ${browserName}`);
    
    const response = await page.goto(`${BASE_URL}/cursos/search/advanced?textoBusqueda=test&limit=5`);
    expect(response.status()).toBe(200);
    
    const content = await page.textContent('body');
    expect(content).toBeDefined();
    
    // Verificar que el contenido se puede parsear como JSON válido
    expect(() => JSON.parse(content)).not.toThrow();
  });

});
