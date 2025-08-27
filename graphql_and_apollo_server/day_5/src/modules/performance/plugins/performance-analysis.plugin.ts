import { Injectable, Logger } from '@nestjs/common';
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { DEFAULT_QUERY_COMPLEXITY } from '@modules/performance/common/threshold.constants';
import { IPerformanceContext } from '@modules/performance/interfaces/performance-context.interface';
import { getComplexity, fieldExtensionsEstimator, simpleEstimator } from 'graphql-query-complexity';
import { GraphQLPerformanceService } from '@modules/performance/services/graphql-performance.service';

@Injectable()
export class PerformanceAnalysisPlugin implements ApolloServerPlugin<any> {
  constructor(
    private readonly logger: Logger,
    private readonly performanceService: GraphQLPerformanceService
  ) { }

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    let startTime: number;
    let context: IPerformanceContext;

    return {
      didResolveOperation: async (requestContext) => {
        startTime = Date.now();
        context = {
          startTime: startTime,
          query: requestContext.request.query || '',
          variables: requestContext.request.variables,
          operationName: requestContext.operationName || undefined,
          userId: (requestContext.contextValue as any)?.usuario?.id,
        };

        try {
          if (requestContext.document && requestContext.schema) {
            const complexity = getComplexity({
              schema: requestContext.schema,
              query: requestContext.document,
              variables: requestContext.request.variables || {},
              estimators: [
                fieldExtensionsEstimator(),
                simpleEstimator({ defaultComplexity: 1 })
              ],
            });

            context.complexity = complexity;

            if (complexity > DEFAULT_QUERY_COMPLEXITY) {
              throw new Error(`Query demasiado compleja: ${complexity} (límite: ${DEFAULT_QUERY_COMPLEXITY})`);
            }
          }
        } catch (error) {
          this.logger.warn('Error calculando complejidad de consulta', error);
          if (error.message.includes('demasiado compleja')) {
            throw error;
          }
        }

        try {
          context.depth = this.calculateQueryDepth(requestContext.request.query || '');
        } catch (error) {
          this.logger.warn('Error calculando profundidad de consulta', error);
        }
      },

      willSendResponse: async (responseContext) => {
        if (!context) return;

        const duration = Date.now() - startTime;
        const hasErrors = responseContext.response.body.kind === 'single' &&
          responseContext.response.body.singleResult.errors;

        this.performanceService.registrarMetrica(
          context,
          duration,
          hasErrors ? new Error('GraphQL execution error') : undefined
        );

        if (duration > 1000) {
          this.logger.warn(`Query lenta detectada: ${context.operationName} - ${duration}ms`, {
            query: context.query,
            depth: context.depth,
            variables: context.variables,
            complexity: context.complexity,
          });
        }
      },

      didEncounterErrors: async (errorContext) => {
        if (!context) return;

        const duration = Date.now() - startTime;

        this.performanceService.registrarMetrica(
          context,
          duration,
          new Error(errorContext.errors.map(e => e.message).join(', '))
        );

        this.logger.error(`Error en consulta GraphQL: ${context.operationName} -- ${JSON.stringify({
          query: context.query,
          variables: context.variables,
          errors: errorContext.errors.map(e => e.message),
        })}`);
      }
    };
  }

  private calculateQueryDepth(query: string): number {
    const openBraces = (query.match(/{/g) || []).length;
    const closeBraces = (query.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      return 0; // Query malformada
    }

    let currentDepth = 0;
    let maxDepth = 0;

    for (const char of query) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }

    return maxDepth;
  }
}
