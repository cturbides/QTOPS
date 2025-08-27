import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { ConsulService } from './consul.service';
import { IntelligentLoadBalancer } from './intelligent-load-balancer.service';
import { EducationalService, ServiceConfig } from '../interfaces/service-discovery.interfaces';
import { ServiceCommunicationException } from '../exceptions/service-communication.exception';
import { 
  DATABASE_CONNECTION_CHECK_NAME, 
  COURSE_CONTENT_ACCESSIBILITY_CHECK_NAME,
  ServiceType 
} from '../constants/common';

@Injectable()
export class ELearningServiceRegistry {
  constructor(
    private readonly consul: ConsulService,
    private readonly loadBalancer: IntelligentLoadBalancer,
    private readonly http: HttpService
  ) {}

  private generateRequestId() { return uuid(); }

  private async registrarServicio(config: ServiceConfig): Promise<void> {
    const id = `${config.name}-${process.env.INSTANCE_ID || 'default'}`;
    await this.consul.registerService({
      id,
      name: config.name,
      address: config.host,
      port: config.port,
      tags: config.tags,
      meta: config.meta,
      check: {
        http: `http://${config.host}:${config.port}/health`,
        interval: '10s',
        timeout: '5s',
        deregistercriticalserviceafter: '30s'
      }
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
        ...servicio.capacidades
      ],
      meta: {
        dominio: servicio.dominio,
        capacidadMaxima: servicio.capacidadMaxima.toString(),
        rateLimitPerMinute: servicio.rateLimitPerMinute.toString()
      }
    };

    await this.registrarServicio(configuracion);
    await this.configurarHealthChecksEducativos(servicio);
  }

  async invocarServicioEducativo<T>(
    tipoServicio: string,
    operacion: string,
    payload?: any
  ): Promise<T> {
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
  }

  private async configurarHealthChecksEducativos(servicio: EducationalService): Promise<void> {
    const checks = [
      {
        name: `${servicio.tipo}-basic-health`,
        http: `http://${servicio.host}:${servicio.port}/health`,
        interval: '10s'
      },
      {
        name: `${servicio.tipo}-${DATABASE_CONNECTION_CHECK_NAME}`,
        http: `http://${servicio.host}:${servicio.port}/health/database`,
        interval: '30s'
      }
    ];
    if (servicio.tipo === ServiceType.COURSE_SERVICE) {
      checks.push({
        name: COURSE_CONTENT_ACCESSIBILITY_CHECK_NAME,
        http: `http://${servicio.host}:${servicio.port}/health/content`,
        interval: '60s'
      });
    }
    for (const check of checks) {
      await this.consul.agent.check.register(check);
    }
  }

  private async registrarMetricasExito(instanceId: string, responseTime: number): Promise<void> {
    await this.loadBalancer.registrarExito(instanceId, responseTime);
  }

  private async registrarMetricasError(instanceId: string, error: any): Promise<void> {
    await this.loadBalancer.registrarError(instanceId);
  }
}