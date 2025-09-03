import { Injectable, Logger } from '@nestjs/common';

export interface ChaosConfig {
  enabled: boolean;
  latencyEnabled: boolean;
  errorEnabled: boolean;
  memoryLeakEnabled: boolean;
  cpuStressEnabled: boolean;
  maxLatencyMs: number;
  errorRate: number;
  stressDurationMs: number;
}

export interface ChaosExperiment {
  id: string;
  name: string;
  type: 'latency' | 'error' | 'memory' | 'cpu' | 'network';
  enabled: boolean;
  probability: number;
  config: any;
}

@Injectable()
export class ChaosService {
  private readonly logger = new Logger(ChaosService.name);
  private readonly experiments: Map<string, ChaosExperiment> = new Map();
  
  private config: ChaosConfig = {
    enabled: process.env.CHAOS_ENABLED === 'true',
    latencyEnabled: true,
    errorEnabled: true,
    memoryLeakEnabled: false, // Peligroso en producción
    cpuStressEnabled: false,  // Peligroso en producción
    maxLatencyMs: 2000,
    errorRate: 0.1, // 10%
    stressDurationMs: 5000,
  };

  constructor() {
    this.initializeDefaultExperiments();
    this.logger.log(`Chaos Engineering ${this.config.enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Inicializa experimentos por defecto
   */
  private initializeDefaultExperiments(): void {
    // Experimento de latencia
    this.addExperiment({
      id: 'latency-spike',
      name: 'Latency Spike',
      type: 'latency',
      enabled: this.config.latencyEnabled,
      probability: 0.05, // 5%
      config: {
        minMs: 500,
        maxMs: this.config.maxLatencyMs,
      }
    });

    // Experimento de errores
    this.addExperiment({
      id: 'random-errors',
      name: 'Random Errors',
      type: 'error',
      enabled: this.config.errorEnabled,
      probability: this.config.errorRate,
      config: {
        errorCodes: [500, 502, 503, 504],
        messages: [
          'Chaos Engineering: Simulated failure',
          'Service temporarily unavailable',
          'Database connection failed',
          'Network timeout occurred'
        ]
      }
    });

    // Experimento de memoria (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      this.addExperiment({
        id: 'memory-leak',
        name: 'Memory Leak Simulation',
        type: 'memory',
        enabled: this.config.memoryLeakEnabled,
        probability: 0.01, // 1%
        config: {
          leakSizeMB: 10,
          duration: this.config.stressDurationMs,
        }
      });
    }
  }

  /**
   * Agregar un experimento de chaos
   */
  addExperiment(experiment: ChaosExperiment): void {
    this.experiments.set(experiment.id, experiment);
    this.logger.log(`Added chaos experiment: ${experiment.name}`);
  }

  /**
   * Habilitar/deshabilitar un experimento
   */
  toggleExperiment(experimentId: string, enabled: boolean): boolean {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.enabled = enabled;
      this.logger.log(`Experiment ${experiment.name} ${enabled ? 'ENABLED' : 'DISABLED'}`);
      return true;
    }
    return false;
  }

  /**
   * Middleware para introducir latencia
   */
  async introduceLatency(): Promise<void> {
    if (!this.config.enabled) return;

    const experiment = this.experiments.get('latency-spike');
    if (!experiment?.enabled || !this.shouldTrigger(experiment.probability)) {
      return;
    }

    const latency = Math.random() * 
      (experiment.config.maxMs - experiment.config.minMs) + 
      experiment.config.minMs;

    this.logger.warn(`🐒 CHAOS: Introducing ${latency.toFixed(0)}ms latency`);
    await this.sleep(latency);
  }

  /**
   * Middleware para introducir errores
   */
  shouldIntroduceError(): { shouldError: boolean; error?: any } {
    if (!this.config.enabled) return { shouldError: false };

    const experiment = this.experiments.get('random-errors');
    if (!experiment?.enabled || !this.shouldTrigger(experiment.probability)) {
      return { shouldError: false };
    }

    const errorCode = experiment.config.errorCodes[
      Math.floor(Math.random() * experiment.config.errorCodes.length)
    ];
    const message = experiment.config.messages[
      Math.floor(Math.random() * experiment.config.messages.length)
    ];

    this.logger.error(`🐒 CHAOS: Introducing error ${errorCode} - ${message}`);
    
    return {
      shouldError: true,
      error: {
        statusCode: errorCode,
        message,
        chaosExperiment: experiment.id,
      }
    };
  }

  /**
   * Simular fuga de memoria (solo desarrollo)
   */
  async simulateMemoryLeak(): Promise<void> {
    if (!this.config.enabled || process.env.NODE_ENV === 'production') return;

    const experiment = this.experiments.get('memory-leak');
    if (!experiment?.enabled || !this.shouldTrigger(experiment.probability)) {
      return;
    }

    this.logger.warn(`🐒 CHAOS: Simulating memory leak of ${experiment.config.leakSizeMB}MB`);
    
    // Crear array grande para simular fuga de memoria
    const leakArray: number[][] = [];
    const sizePerArray = 1024 * 1024; // 1MB
    
    for (let i = 0; i < experiment.config.leakSizeMB; i++) {
      leakArray.push(new Array(sizePerArray).fill(Math.random()));
    }

    // Mantener la referencia por un tiempo
    setTimeout(() => {
      leakArray.length = 0; // Limpiar después del tiempo configurado
      this.logger.log('🐒 CHAOS: Memory leak cleaned up');
    }, experiment.config.duration);
  }

  /**
   * Obtener estado de todos los experimentos
   */
  getExperiments(): ChaosExperiment[] {
    return Array.from(this.experiments.values());
  }

  /**
   * Obtener configuración actual
   */
  getConfig(): ChaosConfig {
    return { ...this.config };
  }

  /**
   * Actualizar configuración
   */
  updateConfig(newConfig: Partial<ChaosConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.log('Chaos configuration updated');
  }

  /**
   * Habilitar/deshabilitar chaos globalmente
   */
  toggleChaos(enabled: boolean): void {
    this.config.enabled = enabled;
    this.logger.log(`Chaos Engineering ${enabled ? 'ENABLED' : 'DISABLED'} globally`);
  }

  /**
   * Determinar si un experimento debe ejecutarse basado en probabilidad
   */
  private shouldTrigger(probability: number): boolean {
    return Math.random() < probability;
  }

  /**
   * Utility para sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtener métricas de chaos
   */
  getChaosMetrics(): any {
    return {
      enabled: this.config.enabled,
      totalExperiments: this.experiments.size,
      activeExperiments: Array.from(this.experiments.values()).filter(e => e.enabled).length,
      experiments: this.getExperiments().map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        enabled: e.enabled,
        probability: e.probability,
      }))
    };
  }
}
