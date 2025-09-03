import { Controller, Post, Get, Query, Param } from '@nestjs/common';
import { EnrollmentAlertingService } from './enrollment-alerting.service';

@Controller('alerting')
export class AlertingController {
  constructor(private readonly alertingService: EnrollmentAlertingService) {}

  @Get('status')
  getAlertingStatus() {
    return {
      message: 'Sistema de Alerting de Inscripciones',
      ...this.alertingService.getStatus()
    };
  }

  @Post('check')
  async triggerManualCheck(@Query('correlationId') correlationId?: string) {
    await this.alertingService.triggerManualCheck(correlationId);
    return {
      message: 'Verificación manual de anomalías iniciada',
      correlationId: correlationId || `manual-${Date.now()}`
    };
  }

  @Post('simulate/:type')
  async simulateAnomaly(
    @Param('type') type: 'spike' | 'drop' | 'error',
    @Query('correlationId') correlationId?: string
  ) {
    await this.alertingService.simulateAnomaly(type, correlationId);
    return {
      message: `Anomalía de tipo '${type}' simulada exitosamente`,
      type,
      correlationId: correlationId || `test-${Date.now()}`
    };
  }

  @Post('enable')
  enableAlerting() {
    this.alertingService.enable();
    return { message: 'Sistema de alerting habilitado' };
  }

  @Post('disable')
  disableAlerting() {
    this.alertingService.disable();
    return { message: 'Sistema de alerting deshabilitado' };
  }
}
