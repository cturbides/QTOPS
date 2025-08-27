import { Module } from '@nestjs/common';
import { PUB_SUB } from './constants/common';
import { PubSub } from "graphql-subscriptions";
import { GraphQLModule } from '@nestjs/graphql';
import { CursoModule } from '@modules/curso/curso.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CURSO_SERVICES_MAP } from '@modules/curso/services/provider';
import { PerformanceModule } from './modules/performance/performance.module';
import { createSecureGraphQLContext } from '@modules/curso/graphql/common/secure-context.factory';
import { PerformanceAnalysisPlugin } from '@modules/performance/plugins/performance-analysis.plugin';
import { GraphQLPerformanceService } from '@modules/performance/services/graphql-performance.service';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (
        cursoService: any,
        leccionService: any,
        usuarioService: any,
        progresoService: any,
        performancePlugin: any,
        graphqlAuthService: any,
        performanceService: any,
        graphqlSecurityMiddleware: any,
      ) => {
        performanceService.configurarUmbrales({
          tiempoMaximoMs: 5000,
          complejidadMaxima: 1000,
          profundidadMaxima: 10,
          rateLimitPorMinuto: 100
        });

        performanceService.suscribirseAlertas((alert) => {
          console.warn(`🚨 ALERTA DE PERFORMANCE: ${alert.tipo}`, {
            operacion: alert.operacion,
            valor: alert.valor,
            umbral: alert.umbral,
            timestamp: alert.timestamp
          });
        });

        return {
          autoSchemaFile: 'schema.gql',
          context: ({ req }) => createSecureGraphQLContext(req, {
            cursoService,
            leccionService,
            usuarioService,
            progresoService,
            graphqlAuthService,
            graphqlSecurityMiddleware
          }),
          playground: process.env.NODE_ENV !== 'production',
          introspection: process.env.NODE_ENV !== 'production',
          plugins: [
            graphqlSecurityMiddleware.createSecurityPlugin(),
            performancePlugin,
            {
              requestDidStart() {
                return {
                  didResolveOperation({ operationName }) {
                    // Bloquear introspection en producción
                    if (process.env.NODE_ENV === 'production' &&
                      operationName === 'IntrospectionQuery') {
                      throw new Error('Introspection deshabilitada en producción');
                    }
                  }
                };
              }
            }
          ],
          subscriptions: {
            "graphql-ws": {
              path: "/graphql"
            }
          }
        };
      },
      inject: [
        CURSO_SERVICES_MAP.cursoService,
        CURSO_SERVICES_MAP.leccionService,
        CURSO_SERVICES_MAP.usuarioService,
        CURSO_SERVICES_MAP.progresoService,
        PerformanceAnalysisPlugin,
        CURSO_SERVICES_MAP.graphqlAuthService,
        GraphQLPerformanceService,
        CURSO_SERVICES_MAP.graphqlSecurityMiddleware,
      ],
      imports: [CursoModule, PerformanceModule]
    }),
    CursoModule,
    PerformanceModule
  ],
  providers: [
    {
      provide: PUB_SUB,
      useValue: new PubSub() // In memory
    }
  ],
  exports: [PUB_SUB]
})
export class AppModule { }
