import { Module } from '@nestjs/common';
import { PUB_SUB } from './constants/common';
import { PubSub } from "graphql-subscriptions";
import { GraphQLModule } from '@nestjs/graphql';
import { CursoModule } from '@modules/curso/curso.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CURSO_SERVICES_MAP } from '@modules/curso/services/provider';
import { createGraphQLContext } from '@modules/curso/graphql/common/context.factory';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (
        cursoService: any,
        leccionService: any,
        usuarioService: any,
        progresoService: any
      ) => ({
        autoSchemaFile: 'schema.gql',
        context: ({ req }) => createGraphQLContext(req, {
          cursoService,
          usuarioService,
          leccionService,
          progresoService
        }),
        playground: true,
        introspection: true,
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
        CURSO_SERVICES_MAP.progresoService
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
