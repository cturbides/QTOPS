import { Controller, Get, Post, Param, Body, Query, Logger } from '@nestjs/common';
import { SagaMonitoringService } from './saga-monitoring.service';
import { SagaIssueType, SagaIssueStatus } from './entities/saga-monitoring.entity';
import { EnrollmentSagaStep } from '../enrollment/types/enrollment-saga.types';

@Controller('saga-monitoring')
export class SagaMonitoringController {
  private readonly logger = new Logger(SagaMonitoringController.name);

  constructor(private readonly monitoringService: SagaMonitoringService) {}

  // Dashboard principal
  @Get('dashboard')
  async getDashboard() {
    try {
      const [stats, activeIssues] = await Promise.all([
        this.monitoringService.getMonitoringStats(),
        this.monitoringService.getActiveIssues()
      ]);

      return {
        success: true,
        data: {
          stats,
          activeIssues: activeIssues.slice(0, 10), // Top 10 issues
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error('Error getting dashboard:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener todos los issues activos
  @Get('issues/active')
  async getActiveIssues() {
    try {
      const issues = await this.monitoringService.getActiveIssues();
      return {
        success: true,
        data: issues,
        total: issues.length
      };
    } catch (error) {
      this.logger.error('Error getting active issues:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener issues por tipo
  @Get('issues/type/:type')
  async getIssuesByType(@Param('type') type: SagaIssueType) {
    try {
      const issues = await this.monitoringService.getIssuesByType(type);
      return {
        success: true,
        data: issues,
        total: issues.length
      };
    } catch (error) {
      this.logger.error(`Error getting issues by type ${type}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Ejecutar detección manual
  @Post('scan')
  async runManualScan() {
    try {
      await this.monitoringService.detectInconsistentSagas();
      
      return {
        success: true,
        message: 'Escaneo manual completado',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error in manual scan:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Asignar un issue
  @Post('issues/:issueId/assign')
  async assignIssue(
    @Param('issueId') issueId: string, 
    @Body() body: { assignedTo: string }
  ) {
    try {
      const issue = await this.monitoringService.assignIssue(issueId, body.assignedTo);
      
      return {
        success: true,
        data: issue,
        message: `Issue asignado a ${body.assignedTo}`
      };
    } catch (error) {
      this.logger.error(`Error assigning issue ${issueId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Resolver un issue
  @Post('issues/:issueId/resolve')
  async resolveIssue(
    @Param('issueId') issueId: string, 
    @Body() body: { resolutionNotes: string }
  ) {
    try {
      const issue = await this.monitoringService.resolveIssue(issueId, body.resolutionNotes);
      
      return {
        success: true,
        data: issue,
        message: 'Issue resuelto exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error resolving issue ${issueId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Intervención manual: forzar completar Saga
  @Post('intervention/force-complete/:sagaId')
  async forceCompleteSaga(
    @Param('sagaId') sagaId: string,
    @Body() body: { reason: string }
  ) {
    try {
      const saga = await this.monitoringService.forceCompleteSaga(sagaId, body.reason);
      
      this.logger.warn(`🔧 INTERVENCIÓN MANUAL: Saga ${sagaId} completada forzadamente por: ${body.reason}`);
      
      return {
        success: true,
        data: saga,
        message: 'Saga completada forzadamente',
        warning: 'Esta es una intervención manual que podría afectar la consistencia'
      };
    } catch (error) {
      this.logger.error(`Error forcing completion of saga ${sagaId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Intervención manual: reiniciar Saga
  @Post('intervention/restart/:sagaId')
  async restartSaga(
    @Param('sagaId') sagaId: string,
    @Body() body: { fromStep: EnrollmentSagaStep; reason: string }
  ) {
    try {
      const saga = await this.monitoringService.restartSaga(sagaId, body.fromStep, body.reason);
      
      this.logger.warn(`🔄 INTERVENCIÓN MANUAL: Saga ${sagaId} reiniciada desde ${body.fromStep} por: ${body.reason}`);
      
      return {
        success: true,
        data: saga,
        message: `Saga reiniciada desde el paso: ${body.fromStep}`,
        warning: 'Esta es una intervención manual que podría reejecutar operaciones'
      };
    } catch (error) {
      this.logger.error(`Error restarting saga ${sagaId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Estadísticas de monitoreo
  @Get('stats')
  async getStats() {
    try {
      const stats = await this.monitoringService.getMonitoringStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      this.logger.error('Error getting monitoring stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Health check del sistema de monitoreo
  @Get('health')
  async getHealth() {
    try {
      const stats = await this.monitoringService.getMonitoringStats();
      
      const isHealthy = stats.activeIssues === 0 || stats.healthScore > 80;
      
      return {
        status: isHealthy ? 'healthy' : 'degraded',
        activeIssues: stats.activeIssues,
        healthScore: stats.healthScore,
        activeSagas: stats.activeSagas,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error getting health:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
