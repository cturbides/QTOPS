import axios from 'axios';
import { Request, Response } from 'express';
import { Controller, All, Req, Res } from '@nestjs/common';
import { ConsulService } from '@shared-modules/service-discovery/services/consul.service';
import { CircuitBreakerWrapper } from '@shared-modules/service-discovery/services/circuit-breaker-wrapper.service';
import { IntelligentLoadBalancer } from '@shared-modules/service-discovery/services/intelligent-load-balancer.service';

@Controller('curso-completo')
export class CursoDiscoveryProxyController {
  constructor(
    private readonly consul: ConsulService,
    private readonly lb: IntelligentLoadBalancer,
    private readonly cb: CircuitBreakerWrapper,
  ) { }

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    try {
      const instances = await this.consul.getHealthyService(
        process.env.CURSO_COMPLETO_SERVICE_NAME || 'curso-completo',
      );

      if (!instances || instances.length === 0) {
        return res.status(503).json({
          error: 'Service unavailable - no healthy instances found',
          service: process.env.CURSO_COMPLETO_SERVICE_NAME || 'curso-completo'
        });
      }

      const target = this.lb.pick(instances);
      const targetUrl = `http://${target.address}:${target.port}/curso-completo${req.path}`;

      const response = await this.cb.execute(
        process.env.CURSO_COMPLETO_SERVICE_NAME || 'curso-completo',
        async () =>
          axios.request({
            url: targetUrl,
            method: req.method as any,
            headers: { ...req.headers, host: undefined },
            data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
            validateStatus: () => true,
          }),
      );

      res.status(response.status);
      for (const [k, v] of Object.entries(response.headers)) {
        if (v) res.setHeader(k, v as any);
      }
      res.send(response.data);
    } catch (err: any) {
      res.status(503).json({
        error: 'Circuit breaker abierto o servicio no disponible',
        details: err.message,
      });
    }
  }
}