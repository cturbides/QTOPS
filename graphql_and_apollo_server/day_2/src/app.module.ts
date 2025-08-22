import { Module } from '@nestjs/common';
import { PUB_SUB } from './constants/common';
import { PubSub } from "graphql-subscriptions";
import { GraphQLModule } from '@nestjs/graphql';
import { CursoModule } from '@modules/curso/curso.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      context: ({ req }) => ({ req }),
      playground: true,
      introspection: true,
      subscriptions: {
        "graphql-ws": {
          path: "/graphql"
        }
      }
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
