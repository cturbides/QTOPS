import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrometheusMetricsService } from '@shared-modules/observability';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: PrometheusMetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    const metrics = await this.metrics.getMetrics();
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
  }
}
