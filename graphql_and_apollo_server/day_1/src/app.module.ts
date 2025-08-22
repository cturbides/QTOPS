import { Module } from '@nestjs/common';
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
      introspection: true
    }),
    CursoModule
  ],
})
export class AppModule { }
