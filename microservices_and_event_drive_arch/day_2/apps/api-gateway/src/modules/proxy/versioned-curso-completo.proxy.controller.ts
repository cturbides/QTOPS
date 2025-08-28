import axios from 'axios';
import { Request, Response } from 'express';
import { ApiVersion } from '@shared-modules/versioning/types/version.types';
import { VersionGuard } from '@shared-modules/versioning/guards/version.guard';
import { Controller, All, Req, Res, UseInterceptors, UseGuards } from '@nestjs/common';
import { SupportedVersions } from '@shared-modules/versioning/decorators/version.decorators';
import { VersionRoutingService } from '@shared-modules/versioning/services/version-routing.service';
import { CircuitBreakerWrapper } from '@shared-modules/service-discovery/services/circuit-breaker-wrapper.service';
import { IntelligentLoadBalancer } from '@shared-modules/service-discovery/services/intelligent-load-balancer.service';
import { VersionHeaderInterceptor } from '@shared-modules/versioning/interceptors/version-header.interceptor';

@Controller('cursos')
@UseInterceptors(VersionHeaderInterceptor)
@UseGuards(VersionGuard)
@SupportedVersions(ApiVersion.V1, ApiVersion.V2)
export class VersionedCursoCompletoProxyController {
  constructor(
    private readonly versionRouting: VersionRoutingService,
    private readonly cb: CircuitBreakerWrapper,
    private readonly lb: IntelligentLoadBalancer,
  ) { }

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    try {
      const serviceName = process.env.CURSO_COMPLETO_SERVICE_NAME || 'curso-completo';

      // Resolver la versión y obtener instancias del servicio
      const { version, instances, warnings } = await this.versionRouting.resolveServiceVersion(
        req,
        serviceName
      );

      if (!instances || instances.length === 0) {
        return res.status(503).json({
          error: 'Service unavailable - no healthy instances found',
          service: serviceName,
          requestedVersion: version,
        });
      }

      // Convertir a ServiceInstance para el load balancer
      const serviceInstances = instances.map(instance => ({
        id: `${instance.serviceName}-${instance.address}:${instance.port}`,
        address: instance.address,
        port: instance.port,
        healthy: true,
        tags: [`version:${instance.version}`]
      }));

      // Seleccionar una instancia usando el load balancer
      const target = this.lb.pick(serviceInstances);
      
      // Generar la URL versionada
      const targetUrl = this.versionRouting.generateVersionedUrl(
        `http://${target.address}:${target.port}`,
        version,
        req.originalUrl
      );

      console.log(`Proxying to ${targetUrl} (version: ${version})`);

      // Ejecutar la llamada HTTP a través del Circuit Breaker
      const response = await this.cb.execute(
        `${serviceName}-${version}`,
        async () =>
          axios.request({
            url: targetUrl,
            method: req.method as any,
            headers: { 
              ...req.headers, 
              host: undefined,
              'X-Original-Version': version,
              'X-Gateway-Timestamp': new Date().toISOString(),
            },
            data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
            validateStatus: () => true, // permitir cualquier status
          }),
      );

      // Configurar headers de respuesta
      res.status(response.status);
      for (const [k, v] of Object.entries(response.headers)) {
        if (v && !['transfer-encoding', 'connection'].includes(k.toLowerCase())) {
          res.setHeader(k, v as any);
        }
      }

      // Agregar headers de versión y metadata
      res.setHeader('X-Service-Version', version);
      res.setHeader('X-Service-Instance', `${target.address}:${target.port}`);
      
      if (warnings && warnings.length > 0) {
        res.setHeader('X-Gateway-Warnings', warnings.join('; '));
      }

      res.send(response.data);
    } catch (err: any) {
      console.error('Versioned proxy error:', err.message);
      
      res.status(503).json({
        error: 'Circuit breaker abierto o servicio no disponible',
        details: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
