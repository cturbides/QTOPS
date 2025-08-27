import { Injectable } from '@nestjs/common';
import { GraphQLError, DocumentNode } from 'graphql';
import { DEFAULT_MAX_QUERY_COMPLEXITY, DEFAULT_MAX_QUERY_DEPTH } from '@modules/curso/common/security.constants';

@Injectable()
export class GraphQLSecurityService {
  createComplexityPlugin() {
    return {
      requestDidStart: () => ({
        didResolveOperation: ({ document }: { document: DocumentNode }) => {
          const complexity = this.calculateQueryComplexity(document);

          if (complexity > DEFAULT_MAX_QUERY_COMPLEXITY) {
            throw new GraphQLError(
              `Consulta demasiado compleja: ${complexity}. Máximo permitido: ${DEFAULT_MAX_QUERY_COMPLEXITY}`,
              {
                extensions: {
                  complexity,
                  code: 'QUERY_TOO_COMPLEX',
                  maxComplexity: DEFAULT_MAX_QUERY_COMPLEXITY
                }
              }
            );
          }

          const depth = this.calculateQueryDepth(document);

          if (depth > DEFAULT_MAX_QUERY_DEPTH) {
            throw new GraphQLError(
              `Consulta demasiado profunda: ${depth} niveles. Máximo permitido: ${DEFAULT_MAX_QUERY_DEPTH}`,
              {
                extensions: {
                  depth,
                  code: 'QUERY_TOO_DEEP',
                  maxDepth: DEFAULT_MAX_QUERY_DEPTH
                }
              }
            );
          }
        }
      })
    };
  }

  // Dummy
  calculateQueryComplexity(document: DocumentNode): number {
    let complexity = 0;

    const queryString = document.loc?.source.body || '';

    const nestedLevel = (queryString.match(/\{/g) || []).length;
    const fieldCount = (queryString.match(/\w+\s*\{/g) || []).length;
    const listFields = (queryString.match(/(cursos|usuarios|lecciones)/g) || []).length;

    complexity = fieldCount * 2 + listFields * 10 + nestedLevel * 5;

    return complexity;
  }

  calculateQueryDepth(document: DocumentNode): number {
    const queryString = document.loc?.source.body || '';

    const braces = queryString.match(/\{/g) || [];
    return braces.length;
  }

  async validateQueryLimits(complejidad: number, profundidad: number): Promise<void> {
    if (complejidad > DEFAULT_MAX_QUERY_COMPLEXITY) {
      throw new GraphQLError(`Query complexity ${complejidad} exceeds maximum ${DEFAULT_MAX_QUERY_COMPLEXITY}`);
    }

    if (profundidad > DEFAULT_MAX_QUERY_DEPTH) {
      throw new GraphQLError(`Query depth ${profundidad} exceeds maximum ${DEFAULT_MAX_QUERY_DEPTH}`);
    }
  }
}
