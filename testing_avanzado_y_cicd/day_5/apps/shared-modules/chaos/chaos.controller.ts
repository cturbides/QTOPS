import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { ChaosService, ChaosExperiment, ChaosConfig } from './chaos.service';

@Controller('chaos')
export class ChaosController {
  constructor(private readonly chaosService: ChaosService) {}

  /**
   * Obtener estado de todos los experimentos
   */
  @Get('experiments')
  getExperiments(): ChaosExperiment[] {
    return this.chaosService.getExperiments();
  }

  /**
   * Obtener configuración actual
   */
  @Get('config')
  getConfig(): ChaosConfig {
    return this.chaosService.getConfig();
  }

  /**
   * Obtener métricas de chaos
   */
  @Get('metrics')
  getMetrics(): any {
    return this.chaosService.getChaosMetrics();
  }

  /**
   * Habilitar/deshabilitar chaos globalmente
   */
  @Post('toggle')
  toggleChaos(@Body('enabled') enabled: boolean): { message: string; enabled: boolean } {
    this.chaosService.toggleChaos(enabled);
    return {
      message: `Chaos Engineering ${enabled ? 'enabled' : 'disabled'}`,
      enabled
    };
  }

  /**
   * Habilitar/deshabilitar un experimento específico
   */
  @Put('experiments/:experimentId/toggle')
  toggleExperiment(
    @Param('experimentId') experimentId: string,
    @Body('enabled') enabled: boolean
  ): { message: string; experimentId: string; enabled: boolean } {
    const success = this.chaosService.toggleExperiment(experimentId, enabled);
    
    if (!success) {
      throw new HttpException(
        `Experiment ${experimentId} not found`,
        HttpStatus.NOT_FOUND
      );
    }

    return {
      message: `Experiment ${experimentId} ${enabled ? 'enabled' : 'disabled'}`,
      experimentId,
      enabled
    };
  }

  /**
   * Actualizar configuración
   */
  @Put('config')
  updateConfig(@Body() config: Partial<ChaosConfig>): { message: string; config: ChaosConfig } {
    this.chaosService.updateConfig(config);
    return {
      message: 'Configuration updated successfully',
      config: this.chaosService.getConfig()
    };
  }

  /**
   * Agregar un nuevo experimento
   */
  @Post('experiments')
  addExperiment(@Body() experiment: ChaosExperiment): { message: string; experiment: ChaosExperiment } {
    this.chaosService.addExperiment(experiment);
    return {
      message: 'Experiment added successfully',
      experiment
    };
  }

  /**
   * Trigger manual de experimento (para testing)
   */
  @Post('experiments/:experimentId/trigger')
  async triggerExperiment(
    @Param('experimentId') experimentId: string
  ): Promise<{ message: string; triggered: boolean }> {
    const experiments = this.chaosService.getExperiments();
    const experiment = experiments.find(e => e.id === experimentId);

    if (!experiment) {
      throw new HttpException(
        `Experiment ${experimentId} not found`,
        HttpStatus.NOT_FOUND
      );
    }

    if (!experiment.enabled) {
      throw new HttpException(
        `Experiment ${experimentId} is disabled`,
        HttpStatus.BAD_REQUEST
      );
    }

    switch (experiment.type) {
      case 'latency':
        await this.chaosService.introduceLatency();
        break;
      case 'memory':
        await this.chaosService.simulateMemoryLeak();
        break;
      case 'error':
        const errorResult = this.chaosService.shouldIntroduceError();
        if (errorResult.shouldError) {
          throw new HttpException(
            errorResult.error.message,
            errorResult.error.statusCode
          );
        }
        break;
    }

    return {
      message: `Experiment ${experimentId} triggered successfully`,
      triggered: true
    };
  }

  /**
   * Health check para chaos (irónicamente)
   */
  @Get('health')
  healthCheck(): { status: string; timestamp: Date; chaos: any } {
    return {
      status: 'ok',
      timestamp: new Date(),
      chaos: this.chaosService.getChaosMetrics()
    };
  }
}
