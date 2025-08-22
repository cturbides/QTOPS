import { Module } from '@nestjs/common';
import { PUB_SUB } from './constants/common';
import { PubSub } from "graphql-subscriptions";
import { GraphQLModule } from '@nestjs/graphql';
import { CursoModule } from '@modules/curso/curso.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { createGraphQLContext } from '@modules/curso/graphql/common/context.factory';
import { CURSO_SERVICES, CURSO_SERVICES_MAP } from '@modules/curso/services/provider';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => ({
        autoSchemaFile: 'schema.gql',
        context: ({ req, context }) => createGraphQLContext(req, {
          cursoService: context.injector.get(CURSO_SERVICES_MAP.cursoService),
          usuarioService: context.injector.get(CURSO_SERVICES_MAP.usuarioService),
          leccionService: context.injector.get(CURSO_SERVICES_MAP.leccionService),
          progresoService: context.injector.get(CURSO_SERVICES_MAP.progresoService)
        }),
        playground: true,
        introspection: true,
        subscriptions: {
          "graphql-ws": {
            path: "/graphql"
          }
        }
      }),
      inject: [...CURSO_SERVICES],
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
