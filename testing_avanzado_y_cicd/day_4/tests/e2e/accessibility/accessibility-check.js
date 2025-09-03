#!/usr/bin/env node

const { chromium } = require('playwright');
const { injectAxe, checkA11y } = require('axe-playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

class AccessibilityTestSuite {
  constructor() {
    this.results = [];
    this.reportDir = path.join(__dirname, '../../../reports/accessibility');
    this.ensureReportDir();
  }

  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async runAccessibilityTest(url, testName) {
    console.log(`♿ Iniciando prueba de accesibilidad: ${testName}`);
    console.log(`🔗 URL: ${url}`);
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      // Navegar a la página
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Inyectar axe-core
      await injectAxe(page);
      
      // Ejecutar análisis de accesibilidad
      const results = await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
      
      const testResult = {
        testName,
        url,
        timestamp: new Date().toISOString(),
        violations: results.violations || [],
        passes: results.passes || [],
        incomplete: results.incomplete || [],
        inaccessible: results.inaccessible || [],
        summary: {
          violationCount: results.violations?.length || 0,
          passCount: results.passes?.length || 0,
          incompleteCount: results.incomplete?.length || 0,
          status: (results.violations?.length || 0) === 0 ? 'PASSED' : 'FAILED'
        }
      };
      
      this.results.push(testResult);
      this.printTestResult(testResult);
      
      await browser.close();
      return testResult;
      
    } catch (error) {
      console.error(`❌ Error en prueba de accesibilidad ${testName}:`, error.message);
      await browser.close();
      return {
        testName,
        url,
        error: error.message,
        summary: { status: 'ERROR', violationCount: -1 }
      };
    }
  }

  printTestResult(result) {
    console.log('♿ RESULTADOS DE ACCESIBILIDAD');
    console.log('═'.repeat(50));
    console.log(`Prueba: ${result.testName}`);
    console.log(`URL: ${result.url}`);
    console.log(`Estado: ${result.summary.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('');
    
    if (result.summary.violationCount > 0) {
      console.log(`🚨 VIOLACIONES ENCONTRADAS: ${result.summary.violationCount}`);
      result.violations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`     Impacto: ${violation.impact}`);
        console.log(`     Elementos afectados: ${violation.nodes?.length || 0}`);
        console.log('');
      });
    } else {
      console.log('✅ No se encontraron violaciones de accesibilidad');
    }
    
    console.log(`📊 RESUMEN:`);
    console.log(`  • Verificaciones exitosas: ${result.summary.passCount}`);
    console.log(`  • Verificaciones incompletas: ${result.summary.incompleteCount}`);
    console.log(`  • Violaciones: ${result.summary.violationCount}`);
    console.log('');
    console.log('═'.repeat(50));
    console.log('');
  }

  async generateReport() {
    const report = {
      summary: {
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.summary?.status === 'PASSED').length,
        failedTests: this.results.filter(r => r.summary?.status === 'FAILED').length,
        errorTests: this.results.filter(r => r.summary?.status === 'ERROR').length,
        totalViolations: this.results.reduce((acc, r) => acc + (r.summary?.violationCount || 0), 0),
        timestamp: new Date().toISOString()
      },
      results: this.results
    };

    const reportPath = path.join(this.reportDir, `accessibility-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Reporte de accesibilidad guardado en: ${reportPath}`);
    return report;
  }
}

async function main() {
  const testSuite = new AccessibilityTestSuite();
  
  console.log('♿ INICIANDO SUITE DE PRUEBAS DE ACCESIBILIDAD');
  console.log('═'.repeat(60));
  console.log('');

  // URLs a probar
  const testCases = [
    {
      url: `${BASE_URL}/health`,
      name: 'Health Check Endpoint'
    },
    {
      url: `${BASE_URL}/cursos`,
      name: 'Lista de Cursos'
    },
    {
      url: `${BASE_URL}/cursos/search/advanced?textoBusqueda=test&limit=5`,
      name: 'Búsqueda Avanzada de Cursos'
    },
    {
      url: `${BASE_URL}/cursos/instructores`,
      name: 'Lista de Instructores'
    },
    {
      url: `${BASE_URL}/cursos/etiquetas`,
      name: 'Lista de Etiquetas'
    }
  ];

  // Ejecutar todas las pruebas
  for (const testCase of testCases) {
    await testSuite.runAccessibilityTest(testCase.url, testCase.name);
    
    // Pausa breve entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Generar reporte final
  const finalReport = await testSuite.generateReport();
  
  console.log('♿ RESUMEN FINAL DE ACCESIBILIDAD');
  console.log('═'.repeat(50));
  console.log(`Pruebas ejecutadas: ${finalReport.summary.totalTests}`);
  console.log(`Pruebas exitosas: ${finalReport.summary.passedTests}`);
  console.log(`Pruebas fallidas: ${finalReport.summary.failedTests}`);
  console.log(`Pruebas con error: ${finalReport.summary.errorTests}`);
  console.log(`Total violaciones: ${finalReport.summary.totalViolations}`);
  console.log(`Estado general: ${finalReport.summary.failedTests === 0 && finalReport.summary.errorTests === 0 ? '✅ SUCCESS' : '❌ ISSUES FOUND'}`);
  
  // Código de salida basado en resultados
  process.exit(finalReport.summary.failedTests === 0 && finalReport.summary.errorTests === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AccessibilityTestSuite };
