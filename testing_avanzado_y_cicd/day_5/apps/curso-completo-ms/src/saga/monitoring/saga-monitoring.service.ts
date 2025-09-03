import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SagaMonitoring, SagaIssueType, SagaIssueStatus } from './entities/saga-monitoring.entity';
import { EnrollmentSagaState } from '../enrollment/entities/enrollment-saga-state.entity';
import { EnrollmentSagaStep } from '../enrollment/types/enrollment-saga.types';

@Injectable()
export class SagaMonitoringService {
  private readonly logger = new Logger(SagaMonitoringService.name);

  constructor(
    @InjectRepository(EnrollmentSagaState)
    private readonly sagaStateRepo: Repository<EnrollmentSagaState>,
    @InjectRepository(SagaMonitoring)
    private readonly monitoringRepo: Repository<SagaMonitoring>,
  ) {}

  // Ejecutar cada 5 minutos para detectar problemas
  @Cron(CronExpression.EVERY_5_MINUTES)
  async detectInconsistentSagas() {
    this.logger.log('🔍 Iniciando detección de Sagas inconsistentes...');

    try {
      await this.detectTimeoutSagas();
      await this.detectStuckSagas();
      await this.detectInconsistentStates();
      
      this.logger.log('✅ Detección de Sagas completada');
    } catch (error) {
      this.logger.error('❌ Error en detección de Sagas:', error);
    }
  }

  // Detectar Sagas que llevan mucho tiempo sin completarse
  private async detectTimeoutSagas() {
    const timeoutThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutos

    const timeoutSagas = await this.sagaStateRepo.find({
      where: {
        completed: false,
        failed: false,
        createdAt: LessThan(timeoutThreshold)
      }
    });

    for (const saga of timeoutSagas) {
      await this.createOrUpdateIssue(
        saga.sagaId,
        SagaIssueType.TIMEOUT,
        `Saga en progreso por más de 10 minutos. Paso actual: ${saga.currentStep}`,
        { 
          currentStep: saga.currentStep,
          startedAt: saga.createdAt,
          duration: Date.now() - saga.createdAt.getTime()
        }
      );
    }

    if (timeoutSagas.length > 0) {
      this.logger.warn(`⏰ Detectadas ${timeoutSagas.length} Sagas con timeout`);
    }
  }

  // Detectar Sagas que están "atascadas" en el mismo paso
  private async detectStuckSagas() {
    const stuckThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutos

    const stuckSagas = await this.sagaStateRepo.find({
      where: {
        completed: false,
        failed: false,
        updatedAt: LessThan(stuckThreshold)
      }
    });

    for (const saga of stuckSagas) {
      await this.createOrUpdateIssue(
        saga.sagaId,
        SagaIssueType.STUCK,
        `Saga atascada en el paso: ${saga.currentStep} por más de 5 minutos`,
        { 
          currentStep: saga.currentStep,
          lastUpdate: saga.updatedAt,
          stuckDuration: Date.now() - saga.updatedAt.getTime()
        }
      );
    }

    if (stuckSagas.length > 0) {
      this.logger.warn(`🔒 Detectadas ${stuckSagas.length} Sagas atascadas`);
    }
  }

  // Detectar estados inconsistentes
  private async detectInconsistentStates() {
    const inconsistentSagas = await this.sagaStateRepo.createQueryBuilder('saga')
      .where('saga.completed = :completed', { completed: true })
      .andWhere('saga.currentStep != :completedStep', { completedStep: EnrollmentSagaStep.COMPLETED })
      .getMany();

    for (const saga of inconsistentSagas) {
      await this.createOrUpdateIssue(
        saga.sagaId,
        SagaIssueType.INCONSISTENT_STATE,
        `Estado inconsistente: marcada como COMPLETED pero paso actual es ${saga.currentStep}`,
        { 
          completed: saga.completed,
          currentStep: saga.currentStep,
          expected: EnrollmentSagaStep.COMPLETED
        }
      );
    }

    if (inconsistentSagas.length > 0) {
      this.logger.warn(`⚠️ Detectadas ${inconsistentSagas.length} Sagas con estado inconsistente`);
    }
  }

  // Crear o actualizar un issue de monitoreo
  private async createOrUpdateIssue(
    sagaId: string,
    issueType: SagaIssueType,
    description: string,
    metadata: any
  ) {
    const existingIssue = await this.monitoringRepo.findOne({
      where: {
        sagaId,
        issueType,
        status: SagaIssueStatus.DETECTED
      }
    });

    if (existingIssue) {
      // Actualizar issue existente
      existingIssue.metadata = { ...existingIssue.metadata, ...metadata };
      existingIssue.updatedAt = new Date();
      await this.monitoringRepo.save(existingIssue);
    } else {
      // Crear nuevo issue
      const newIssue = this.monitoringRepo.create({
        sagaId,
        issueType,
        description,
        metadata,
        detectedAt: new Date(),
        status: SagaIssueStatus.DETECTED
      });
      await this.monitoringRepo.save(newIssue);
      
      this.logger.warn(`🚨 Nuevo issue detectado para Saga ${sagaId}: ${issueType}`);
    }
  }

  // Obtener todos los issues activos
  async getActiveIssues() {
    return this.monitoringRepo.find({
      where: {
        status: SagaIssueStatus.DETECTED
      },
      order: {
        detectedAt: 'DESC'
      }
    });
  }

  // Obtener issues por tipo
  async getIssuesByType(issueType: SagaIssueType) {
    return this.monitoringRepo.find({
      where: { issueType },
      order: { detectedAt: 'DESC' }
    });
  }

  // Asignar un issue a alguien
  async assignIssue(issueId: string, assignedTo: string) {
    const issue = await this.monitoringRepo.findOne({ where: { id: issueId } });
    if (!issue) {
      throw new Error('Issue no encontrado');
    }

    issue.assignedTo = assignedTo;
    issue.status = SagaIssueStatus.INVESTIGATING;
    await this.monitoringRepo.save(issue);

    this.logger.log(`👤 Issue ${issueId} asignado a ${assignedTo}`);
    return issue;
  }

  // Resolver un issue
  async resolveIssue(issueId: string, resolutionNotes: string) {
    const issue = await this.monitoringRepo.findOne({ where: { id: issueId } });
    if (!issue) {
      throw new Error('Issue no encontrado');
    }

    issue.status = SagaIssueStatus.RESOLVED;
    issue.resolutionNotes = resolutionNotes;
    issue.resolvedAt = new Date();
    await this.monitoringRepo.save(issue);

    this.logger.log(`✅ Issue ${issueId} resuelto: ${resolutionNotes}`);
    return issue;
  }

  // Intervención manual: forzar completar una Saga
  async forceCompleteSaga(sagaId: string, reason: string) {
    const saga = await this.sagaStateRepo.findOne({ where: { sagaId: sagaId } });
    if (!saga) {
      throw new Error('Saga no encontrada');
    }

    saga.completed = true;
    saga.failed = false;
    saga.currentStep = EnrollmentSagaStep.COMPLETED;
    saga.completedAt = new Date();
    await this.sagaStateRepo.save(saga);

    // Crear registro de intervención
    await this.createOrUpdateIssue(
      saga.sagaId,
      SagaIssueType.INCONSISTENT_STATE,
      `Saga completada manualmente por intervención. Razón: ${reason}`,
      { 
        intervention: 'MANUAL_COMPLETION',
        reason,
        interventionAt: new Date()
      }
    );

    this.logger.warn(`🔧 Intervención manual: Saga ${sagaId} completada forzadamente`);
    return saga;
  }

  // Intervención manual: reiniciar una Saga
  async restartSaga(sagaId: string, fromStep: EnrollmentSagaStep, reason: string) {
    const saga = await this.sagaStateRepo.findOne({ where: { sagaId: sagaId } });
    if (!saga) {
      throw new Error('Saga no encontrada');
    }

    saga.currentStep = fromStep;
    saga.completed = false;
    saga.failed = false;
    saga.failureReason = null;
    await this.sagaStateRepo.save(saga);

    // Crear registro de intervención
    await this.createOrUpdateIssue(
      saga.sagaId,
      SagaIssueType.STUCK,
      `Saga reiniciada manualmente desde el paso: ${fromStep}. Razón: ${reason}`,
      { 
        intervention: 'MANUAL_RESTART',
        fromStep,
        reason,
        interventionAt: new Date()
      }
    );

    this.logger.warn(`🔄 Intervención manual: Saga ${sagaId} reiniciada desde ${fromStep}`);
    return saga;
  }

  // Estadísticas de monitoreo
  async getMonitoringStats() {
    const totalIssues = await this.monitoringRepo.count();
    const activeIssues = await this.monitoringRepo.count({
      where: { status: SagaIssueStatus.DETECTED }
    });
    const resolvedIssues = await this.monitoringRepo.count({
      where: { status: SagaIssueStatus.RESOLVED }
    });

    const issuesByType = await this.monitoringRepo.createQueryBuilder('issue')
      .select('issue.issueType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('issue.issueType')
      .getRawMany();

    const activeSagas = await this.sagaStateRepo.count({
      where: { 
        completed: false,
        failed: false 
      }
    });

    return {
      totalIssues,
      activeIssues,
      resolvedIssues,
      issuesByType,
      activeSagas,
      healthScore: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100
    };
  }
}
