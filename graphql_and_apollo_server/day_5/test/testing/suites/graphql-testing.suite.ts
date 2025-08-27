import request from 'supertest';
import { GraphQLModule } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PerformanceAnalysisPlugin } from '../../../src/modules/performance/plugins/performance-analysis.plugin';
import { GraphQLPerformanceService } from '../../../src/modules/performance/services/graphql-performance.service';
import { IGraphQLBenchmarkResult, IBenchmarkConfig } from '../interfaces/benchmark.interface';

export class GraphQLTestingSuite {
  private static performanceService: GraphQLPerformanceService;

  static async createTestingModule(
    imports: any[] = [],
    providers: any[] = []
  ): Promise<TestingModule> {
    const logger = new Logger(GraphQLTestingSuite.name);

    this.performanceService = new GraphQLPerformanceService(logger);
    const performancePlugin = new PerformanceAnalysisPlugin(logger, this.performanceService);

    return Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          playground: false,
          driver: ApolloDriver,
          autoSchemaFile: true,
          introspection: false,
          plugins: [performancePlugin],
        }),
        ...imports
      ],
      providers: [
        GraphQLPerformanceService,
        PerformanceAnalysisPlugin,
        ...providers
      ]
    }).compile();
  }

  static async benchmarkQuery(
    app: INestApplication,
    query: string,
    variables?: Record<string, any>,
    config: Partial<IBenchmarkConfig> = {}
  ): Promise<IGraphQLBenchmarkResult> {
    const defaultConfig: IBenchmarkConfig = {
      iteraciones: 100,
      concurrencia: 1,
      timeoutMs: 10000,
      warmupIteraciones: 10
    };

    const finalConfig = { ...defaultConfig, ...config };
    const tiempos: number[] = [];

    for (let i = 0; i < finalConfig.warmupIteraciones; i++) {
      await this.ejecutarQuery(app, query, variables);
    }

    if (finalConfig.concurrencia === 1) {
      for (let i = 0; i < finalConfig.iteraciones; i++) {
        const inicio = Date.now();
        await this.ejecutarQuery(app, query, variables);
        tiempos.push(Date.now() - inicio);
      }
    } else {
      const batches = Math.ceil(finalConfig.iteraciones / finalConfig.concurrencia);

      for (let batch = 0; batch < batches; batch++) {
        const promises: Promise<number>[] = [];
        const batchSize = Math.min(
          finalConfig.concurrencia,
          finalConfig.iteraciones - (batch * finalConfig.concurrencia)
        );

        for (let i = 0; i < batchSize; i++) {
          promises.push(this.ejecutarQueryConTiempo(app, query, variables));
        }

        const batchTiempos = await Promise.all(promises);
        tiempos.push(...batchTiempos);
      }
    }

    return this.calcularEstadisticas(query, tiempos, finalConfig.iteraciones);
  }

  private static async ejecutarQueryConTiempo(
    app: INestApplication,
    query: string,
    variables?: Record<string, any>
  ): Promise<number> {
    const inicio = Date.now();
    await this.ejecutarQuery(app, query, variables);
    return Date.now() - inicio;
  }

  private static async ejecutarQuery(
    app: INestApplication,
    query: string,
    variables?: Record<string, any>
  ): Promise<any> {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query,
        variables: variables || {}
      })
      .expect(200);

    if (response.body.errors) {
      throw new Error(`GraphQL Error: ${response.body.errors.map(e => e.message).join(', ')}`);
    }

    return response.body;
  }

  private static calcularEstadisticas(
    operacion: string,
    tiempos: number[],
    iteraciones: number
  ): IGraphQLBenchmarkResult {
    const ordenados = [...tiempos].sort((a, b) => a - b);
    const promedio = tiempos.reduce((sum, time) => sum + time, 0) / tiempos.length;
    const varianza = tiempos.reduce((sum, time) => sum + Math.pow(time - promedio, 2), 0) / tiempos.length;
    const desviacionEstandar = Math.sqrt(varianza);

    return {
      tiempos,
      promedio,
      operacion,
      iteraciones,
      desviacionEstandar,
      minimo: ordenados[0],
      operacionesPorSegundo: 1000 / promedio,
      maximo: ordenados[ordenados.length - 1],
      percentil95: ordenados[Math.floor(ordenados.length * 0.95)],
      percentil99: ordenados[Math.floor(ordenados.length * 0.99)],
    };
  }

  static generarReporteBenchmark(resultado: IGraphQLBenchmarkResult): string {
    return `
🚀 Reporte de Benchmark: ${resultado.operacion}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Estadísticas de Tiempo (ms):
   • Promedio:      ${resultado.promedio.toFixed(2)}
   • Mínimo:        ${resultado.minimo}
   • Máximo:        ${resultado.maximo}
   • Percentil 95:  ${resultado.percentil95}
   • Percentil 99:  ${resultado.percentil99}
   • Desv. Estándar: ${resultado.desviacionEstandar.toFixed(2)}

⚡ Performance:
   • Ops/segundo:   ${resultado.operacionesPorSegundo.toFixed(2)}
   • Iteraciones:   ${resultado.iteraciones}

📈 Distribución de tiempos:
   ${this.generarHistograma(resultado.tiempos)}
`;
  }

  private static generarHistograma(tiempos: number[]): string {
    const buckets = 10;
    const min = Math.min(...tiempos);
    const max = Math.max(...tiempos);
    const step = (max - min) / buckets;

    const histogram = new Array(buckets).fill(0);

    tiempos.forEach(tiempo => {
      const bucketIndex = Math.min(Math.floor((tiempo - min) / step), buckets - 1);
      histogram[bucketIndex]++;
    });

    const maxCount = Math.max(...histogram);

    return histogram.map((count, index) => {
      const start = min + (index * step);
      const end = start + step;
      const bar = '█'.repeat(Math.ceil((count / maxCount) * 20));
      return `   ${start.toFixed(0).padStart(4)}-${end.toFixed(0).padEnd(4)} ms: ${bar} (${count})`;
    }).join('\n');
  }

  static obtenerMetricasPerformance(): Map<string, any> {
    return this.performanceService?.obtenerTodasLasMetricas() || new Map();
  }

  static limpiarMetricas(): void {
    this.performanceService?.limpiarMetricas();
  }
}
