import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { ObservabilityModule } from '@shared-modules/observability';

@Module({
  imports: [ObservabilityModule],
  controllers: [MetricsController],
})
export class MetricsModule {}
