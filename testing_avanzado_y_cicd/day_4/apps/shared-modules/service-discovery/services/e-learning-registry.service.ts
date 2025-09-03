import { v4 as uuid } from 'uuid';
import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConsulService } from './consul.service';
import { CircuitBreakerWrapper } from './circuit-breaker-wrapper.service';
import { IAdditionalCheck } from '../interfaces/additional-check.interface';
import { IntelligentLoadBalancer } from './intelligent-load-balancer.service';
import { DEFAULT_CIRCUIT_BREAKER_CONFIG } from '../constants/circuit-breaker.constants';
import { ServiceCommunicationException } from '../exceptions/service-communication.exception';
import { EducationalService, ServiceConfig } from '../interfaces/service-discovery.interfaces';
import {
  ServiceType,
  DATABASE_CONNECTION_CHECK_NAME,
  COURSE_CONTENT_ACCESSIBILITY_CHECK_NAME,
} from '../constants/common';

@Injectable()
export class ELearningServiceRegistry {
  constructor(
    private readonly http: HttpService,
    private readonly consul: ConsulService,
    private readonly loadBalancer: IntelligentLoadBalancer,
    private readonly circuitBreakerWrapper: CircuitBreakerWrapper
  ) { }

  private generateRequestId() { return uuid(); }

  private async registrarServicio(config: ServiceConfig, additionalChecks: IAdditionalCheck[] = []): Promise<void> {
    const id = `${config.name}-${process.env.INSTANCE_ID || 'default'}`;

    const mainCheck = {
      timeout: '5s',
      interval: '10s',
      deregistercriticalserviceafter: '30s',
      http: `http://${config.host}:${config.port}/health`,
    };

    const checks = additionalChecks.length > 0
      ? [mainCheck, ...additionalChecks]
      : [mainCheck];

    await this.consul.registerService({
      id,
      checks: checks,
      name: config.name,
      port: config.port,
      tags: config.tags,
      meta: config.meta,
      address: config.host,
    });
  }

  async registrarServicioEducativo(servicio: EducationalService): Promise<void> {
    const configuracion = {
      name: servicio.tipo,
      host: servicio.host,
      port: servicio.port,
      tags: [
        `version:${servicio.version}`,
        `domain:${servicio.dominio}`,
        `capacity:${servicio.capacidadMaxima}`,
        // Agregar versiones de API soportadas
        'version:v1',
        'version:v2',
        'v:v1',
        'v:v2',
        ...servicio.capacidades
      ],
      meta: {
        dominio: servicio.dominio,
        capacidadMaxima: servicio.capacidadMaxima.toString(),
        rateLimitPerMinute: servicio.rateLimitPerMinute.toString(),
        // Metadata adicional para versiones de API
        supportedApiVersions: 'v1,v2',
        defaultApiVersion: 'v1'
      }
    };

    const additionalChecks: IAdditionalCheck[] = this.generarHealthChecksEducativos(servicio);

    await this.registrarServicio(configuracion, additionalChecks);
  }

  async invocarServicioEducativo<T>(
    tipoServicio: string,
    operacion: string,
    payload?: any
  ): Promise<T> {
    return this.circuitBreakerWrapper.execute(
      tipoServicio,
      async () => {
        const instancia = await this.loadBalancer.seleccionarInstancia(tipoServicio);

        try {
          const startTime = Date.now();

          const response = await firstValueFrom(this.http.post<T>(
            `http://${instancia.address}:${instancia.port}/${operacion}`,
            payload,
            {
              timeout: 5000,
              headers: {
                'X-Service-Request-ID': this.generateRequestId(),
                'X-Source-Service': process.env.SERVICE_NAME || 'unknown'
              }
            }
          ));

          const responseTime = Date.now() - startTime;

          await this.registrarMetricasExito(instancia.id, responseTime);

          return response.data;
        } catch (error: any) {
          await this.registrarMetricasError(instancia.id, error);

          throw new ServiceCommunicationException(
            `Error comunicándose con ${tipoServicio}: ${error.message}`
          );
        }
      },
      DEFAULT_CIRCUIT_BREAKER_CONFIG,
    );
  }

  private generarHealthChecksEducativos(servicio: EducationalService): IAdditionalCheck[] {
    switch (servicio.tipo) {
      case ServiceType.COURSE_SERVICE:
        return [
          {
            name: COURSE_CONTENT_ACCESSIBILITY_CHECK_NAME,
            http: `http://${servicio.host}:${servicio.port}/health/content`,
            interval: '60s'
          },
          {
            name: `${servicio.tipo}-${DATABASE_CONNECTION_CHECK_NAME}`,
            http: `http://${servicio.host}:${servicio.port}/health/database`,
            interval: '30s'
          }
        ];
      default:
        return [];
    }
  }

  private async registrarMetricasExito(instanceId: string, responseTime: number): Promise<void> {
    await this.loadBalancer.registrarExito(instanceId, responseTime);
  }

  private async registrarMetricasError(instanceId: string, error: any): Promise<void> {
    await this.loadBalancer.registrarError(instanceId);
  }

  /**
   * Obtiene el estado del circuit breaker para un servicio
   */
  getCircuitBreakerState(serviceName: string) {
    return this.circuitBreakerWrapper.getCircuitState(serviceName);
  }

  /**
   * Obtiene las métricas del circuit breaker para un servicio
   */
  getCircuitBreakerMetrics(serviceName: string) {
    return this.circuitBreakerWrapper.getMetrics(serviceName);
  }

  /**
   * Obtiene todas las métricas de circuit breakers
   */
  getAllCircuitBreakerMetrics() {
    return this.circuitBreakerWrapper.getAllMetrics();
  }

  /**
   * Restablece el circuit breaker de un servicio
   */
  resetCircuitBreaker(serviceName: string) {
    return this.circuitBreakerWrapper.reset(serviceName);
  }
}