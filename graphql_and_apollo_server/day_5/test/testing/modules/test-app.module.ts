import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

// Mock simple del módulo de testing
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: false,
      introspection: false,
      typePaths: ['**/*.graphql'],
      definitions: {
        path: './schema.gql',
        outputAs: 'class',
      },
    }),
  ],
})
export class TestAppModule {}
