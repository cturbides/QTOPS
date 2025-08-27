import { Module, Logger } from '@nestjs/common';
import { GraphQLPerformanceService } from './services/graphql-performance.service';
import { PerformanceAnalysisPlugin } from './plugins/performance-analysis.plugin';

@Module({
  providers: [
    Logger,
    GraphQLPerformanceService,
    PerformanceAnalysisPlugin
  ],
  exports: [
    GraphQLPerformanceService,
    PerformanceAnalysisPlugin
  ]
})
export class PerformanceModule {}
