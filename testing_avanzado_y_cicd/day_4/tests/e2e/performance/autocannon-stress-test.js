#!/usr/bin/env node

const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

class PerformanceTestSuite {
  constructor() {
    this.results = [];
    this.reportDir = path.join(__dirname, '../../../reports/performance');
    this.ensureReportDir();
  }

  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async runTest(testConfig) {
    console.log(`🚀 Iniciando prueba: ${testConfig.name}`);
    console.log(`📍 URL: ${testConfig.url}`);
    console.log(`⏱️  Duración: ${testConfig.duration}s`);
    console.log(`👥 Conexiones: ${testConfig.connections}`);
    console.log('');

    try {
      const result = await autocannon({
        url: testConfig.url,
        connections: testConfig.connections,
        duration: testConfig.duration,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Autocannon-Performance-Test'
        },
        ...testConfig.options
      });

      const analysis = this.analyzeResults(result, testConfig);
      this.results.push(analysis);
      
      this.printResults(analysis);
      return analysis;
    } catch (error) {
      console.error(`❌ Error en prueba ${testConfig.name}:`, error.message);
      return null;
    }
  }

  analyzeResults(result, testConfig) {
    const analysis = {
      testName: testConfig.name,
      url: testConfig.url,
      timestamp: new Date().toISOString(),
      
      // Métricas principales
      requests: {
        total: result.requests.total,
        average: result.requests.average,
        mean: result.requests.mean,
        stddev: result.requests.stddev,
        min: result.requests.min,
        max: result.requests.max
      },
      
      latency: {
        average: result.latency.average,
        mean: result.latency.mean,
        stddev: result.latency.stddev,
        min: result.latency.min,
        max: result.latency.max,
        p50: result.latency.p50,
        p75: result.latency.p75,
        p90: result.latency.p90,
        p95: result.latency.p95,
        p99: result.latency.p99
      },
      
      throughput: {
        average: result.throughput.average,
        mean: result.throughput.mean,
        stddev: result.throughput.stddev,
        min: result.throughput.min,
        max: result.throughput.max
      },
      
      errors: result.errors,
      timeouts: result.timeouts,
      duration: result.duration,
      
      // Evaluación de performance
      performance: {
        passed: this.evaluatePerformance(result, testConfig.thresholds),
        score: this.calculatePerformanceScore(result, testConfig.thresholds)
      }
    };

    return analysis;
  }

  evaluatePerformance(result, thresholds = {}) {
    const checks = {
      averageLatency: result.latency.average <= (thresholds.maxAvgLatency || 500),
      p95Latency: result.latency.p95 <= (thresholds.maxP95Latency || 1000),
      p99Latency: result.latency.p99 <= (thresholds.maxP99Latency || 2000),
      throughput: result.throughput.average >= (thresholds.minThroughput || 100),
      errorRate: (result.errors / result.requests.total) <= (thresholds.maxErrorRate || 0.01),
      timeoutRate: (result.timeouts / result.requests.total) <= (thresholds.maxTimeoutRate || 0.001)
    };

    return {
      checks,
      passed: Object.values(checks).every(check => check)
    };
  }

  calculatePerformanceScore(result, thresholds = {}) {
    let score = 100;
    
    // Penalizar latencia alta
    if (result.latency.average > (thresholds.maxAvgLatency || 500)) {
      score -= 20;
    }
    if (result.latency.p95 > (thresholds.maxP95Latency || 1000)) {
      score -= 15;
    }
    if (result.latency.p99 > (thresholds.maxP99Latency || 2000)) {
      score -= 10;
    }
    
    // Penalizar throughput bajo
    if (result.throughput.average < (thresholds.minThroughput || 100)) {
      score -= 20;
    }
    
    // Penalizar errores
    const errorRate = result.errors / result.requests.total;
    if (errorRate > 0.01) {
      score -= 25;
    }
    
    return Math.max(0, score);
  }

  printResults(analysis) {
    console.log('📊 RESULTADOS DE PERFORMANCE');
    console.log('═'.repeat(50));
    console.log(`Prueba: ${analysis.testName}`);
    console.log(`URL: ${analysis.url}`);
    console.log(`Duración: ${analysis.duration}s`);
    console.log('');
    
    console.log('📈 REQUESTS:');
    console.log(`  Total: ${analysis.requests.total.toLocaleString()}`);
    console.log(`  Promedio: ${analysis.requests.average?.toFixed(1)}/s`);
    console.log(`  Min/Max: ${analysis.requests.min}/${analysis.requests.max}`);
    console.log('');
    
    console.log('⚡ LATENCIA (ms):');
    console.log(`  Promedio: ${analysis.latency.average?.toFixed(1)}ms`);
    console.log(`  P50: ${analysis.latency.p50?.toFixed(1)}ms`);
    console.log(`  P95: ${analysis.latency.p95?.toFixed(1)}ms`);
    console.log(`  P99: ${analysis.latency.p99?.toFixed(1)}ms`);
    console.log(`  Min/Max: ${analysis.latency.min}/${analysis.latency.max}ms`);
    console.log('');
    
    console.log('🔄 THROUGHPUT:');
    console.log(`  Promedio: ${analysis.throughput.average?.toFixed(1)} MB/s`);
    console.log('');
    
    console.log('❌ ERRORES:');
    console.log(`  Errores: ${analysis.errors}`);
    console.log(`  Timeouts: ${analysis.timeouts}`);
    console.log(`  Tasa de error: ${((analysis.errors / analysis.requests.total) * 100)?.toFixed(2)}%`);
    console.log('');
    
    console.log('🎯 EVALUACIÓN:');
    const performance = analysis.performance;
    console.log(`  Score: ${performance.score}/100`);
    console.log(`  Estado: ${performance.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('');
    console.log('═'.repeat(50));
    console.log('');
  }

  async generateReport() {
    const report = {
      summary: {
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.performance.passed).length,
        averageScore: this.results.reduce((acc, r) => acc + r.performance.score, 0) / this.results.length,
        timestamp: new Date().toISOString()
      },
      results: this.results
    };

    const reportPath = path.join(this.reportDir, `performance-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Reporte guardado en: ${reportPath}`);
    return report;
  }
}

async function main() {
  const testSuite = new PerformanceTestSuite();
  
  console.log('🔥 INICIANDO SUITE DE PRUEBAS DE PERFORMANCE');
  console.log('═'.repeat(60));
  console.log('');

  // Configuraciones de prueba
  const tests = [
    {
      name: 'Health Check - Carga Ligera',
      url: `${BASE_URL}/health`,
      connections: 10,
      duration: 30,
      thresholds: {
        maxAvgLatency: 100,
        maxP95Latency: 200,
        maxP99Latency: 500,
        minThroughput: 200,
        maxErrorRate: 0.001
      }
    },
    
    {
      name: 'Búsqueda de Cursos - Carga Media',
      url: `${BASE_URL}/cursos/search/advanced?textoBusqueda=test&limit=10`,
      connections: 20,
      duration: 60,
      thresholds: {
        maxAvgLatency: 300,
        maxP95Latency: 800,
        maxP99Latency: 1500,
        minThroughput: 50,
        maxErrorRate: 0.02
      }
    },
    
    {
      name: 'Health Check - Carga Alta',
      url: `${BASE_URL}/health`,
      connections: 50,
      duration: 45,
      thresholds: {
        maxAvgLatency: 200,
        maxP95Latency: 500,
        maxP99Latency: 1000,
        minThroughput: 100,
        maxErrorRate: 0.01
      }
    },
    
    {
      name: 'Stress Test - Búsqueda Intensiva',
      url: `${BASE_URL}/cursos/search/advanced?textoBusqueda=performance&limit=5`,
      connections: 100,
      duration: 30,
      thresholds: {
        maxAvgLatency: 1000,
        maxP95Latency: 2000,
        maxP99Latency: 5000,
        minThroughput: 20,
        maxErrorRate: 0.05
      }
    }
  ];

  // Ejecutar todas las pruebas
  for (const test of tests) {
    await testSuite.runTest(test);
    
    // Pausa entre pruebas para permitir recuperación
    if (tests.indexOf(test) < tests.length - 1) {
      console.log('⏸️  Pausa de recuperación (10s)...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Generar reporte final
  const finalReport = await testSuite.generateReport();
  
  console.log('🎉 RESUMEN FINAL');
  console.log('═'.repeat(40));
  console.log(`Pruebas ejecutadas: ${finalReport.summary.totalTests}`);
  console.log(`Pruebas exitosas: ${finalReport.summary.passedTests}`);
  console.log(`Score promedio: ${finalReport.summary.averageScore?.toFixed(1)}/100`);
  console.log(`Estado general: ${finalReport.summary.passedTests === finalReport.summary.totalTests ? '✅ SUCCESS' : '❌ SOME FAILURES'}`);
  
  // Código de salida basado en resultados
  process.exit(finalReport.summary.passedTests === finalReport.summary.totalTests ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { PerformanceTestSuite };
