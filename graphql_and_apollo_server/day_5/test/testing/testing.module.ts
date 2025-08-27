import { Module, Logger } from '@nestjs/common';
import { GraphQLTestingSuite } from './suites/graphql-testing.suite';

@Module({
  exports: [GraphQLTestingSuite],
  providers: [Logger, GraphQLTestingSuite],
})
export class TestingModule { }
