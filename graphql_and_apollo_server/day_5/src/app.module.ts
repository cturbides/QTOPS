import { Module } from '@nestjs/common';
import { PUB_SUB } from './constants/common';
import { PubSub } from "graphql-subscriptions";
import { GraphQLModule } from '@nestjs/graphql';
import { CursoModule } from '@modules/curso/curso.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CURSO_SERVICES_MAP } from '@modules/curso/services/provider';
import { createSecureGraphQLContext } from '@modules/curso/graphql/common/secure-context.factory';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (
        cursoService: any,
        leccionService: any,
        usuarioService: any,
        progresoService: any,
        graphqlAuthService: any,
        graphqlSecurityMiddleware: any
      ) => ({
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
      }),
      inject: [
        CURSO_SERVICES_MAP.cursoService,
        CURSO_SERVICES_MAP.leccionService,
        CURSO_SERVICES_MAP.usuarioService,
        CURSO_SERVICES_MAP.progresoService,
        CURSO_SERVICES_MAP.graphqlAuthService,
        CURSO_SERVICES_MAP.graphqlSecurityMiddleware
      ],
      imports: [CursoModule]
    }),
    CursoModule
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
