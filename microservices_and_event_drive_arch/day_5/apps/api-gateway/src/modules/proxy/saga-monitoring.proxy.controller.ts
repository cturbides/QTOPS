import axios from 'axios';
import { Request, Response } from 'express';
import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { ConsulService } from '@shared-modules/service-discovery/services/consul.service';
import { CircuitBreakerWrapper } from '@shared-modules/service-discovery/services/circuit-breaker-wrapper.service';
import { IntelligentLoadBalancer } from '@shared-modules/service-discovery/services/intelligent-load-balancer.service';

@Controller('saga-monitoring')
export class SagaMonitoringProxyController {
  private readonly logger = new Logger(SagaMonitoringProxyController.name);

  constructor(
    private readonly consul: ConsulService,
    private readonly cb: CircuitBreakerWrapper,
    private readonly lb: IntelligentLoadBalancer,
  ) { }

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const startTime = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const serviceName = process.env.CURSO_COMPLETO_SERVICE_NAME || 'course-service';
      
      this.logger.log(`[${requestId}] 🔄 Proxying ${req.method} ${req.originalUrl} to service: ${serviceName}`);
      
      const instances = await this.consul.getHealthyService(serviceName);

      if (!instances || instances.length === 0) {
        this.logger.error(`[${requestId}] ❌ No healthy instances found for service: ${serviceName}`);
        return res.status(503).json({
          error: 'Service unavailable - no healthy instances found',
          service: serviceName,
          requestId,
          timestamp: new Date().toISOString(),
          retryAfter: '30s'
        });
      }

      this.logger.debug(`[${requestId}] 📋 Found ${instances.length} healthy instances for ${serviceName}`);

      const target = this.lb.pick(instances);
      const targetUrl = `http://${target.address}:${target.port}${req.originalUrl}`;

      this.logger.log(`[${requestId}] 🎯 Selected target: ${target.address}:${target.port}`);

      const proxyHeaders = {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Proxied-By': 'api-gateway-saga-monitoring',
      };

      const response = await this.cb.execute(
        `${serviceName}-eventos`, 
        async () => {
          this.logger.debug(`[${requestId}] 🔗 Making HTTP request to: ${targetUrl}`);
          
          return axios.request({
            url: targetUrl,
            method: req.method as any,
            headers: proxyHeaders,
            data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
            timeout: 15000, // 15 segundos para la request HTTP
            validateStatus: () => true, // Permitir cualquier status code
            maxRedirects: 0, // No seguir redirects en el proxy
          });
        },
        {
          timeout: 12000, // Circuit Breaker timeout de 12 segundos (más generoso)
          failureThreshold: 5, // Permitir 5 fallos antes de abrir (más tolerante)
          retryAttemptTimeout: 60000, // 60 segundos antes de retry
          halfOpenRetryTimeout: 30000 // 30 segundos para half-open state
        }
      );

      const duration = Date.now() - startTime;
      this.logger.log(`[${requestId}] ✅ Success! Status: ${response.status}, Duration: ${duration}ms`);

      res.status(response.status);

      res.setHeader('X-Service-Instance', `${target.address}:${target.port}`);
      res.setHeader('X-Proxy-Type', 'eventos-robust');
      res.setHeader('X-Load-Balancer', 'intelligent');
      res.setHeader('X-Request-ID', requestId);
      res.setHeader('X-Response-Time', `${duration}ms`);
      res.setHeader('X-Service-Name', serviceName);

      res.send(response.data);
      
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const errorDetails = {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        url: req.originalUrl,
        method: req.method,
        duration: `${duration}ms`,
        requestId,
        timestamp: new Date().toISOString()
      };

      this.logger.error(`[${requestId}] ❌ Proxy error:`, errorDetails);
      
      const errorResponse = {
        error: 'Event service circuit breaker open or unavailable',
        details: err.message,
        service: process.env.CURSO_COMPLETO_SERVICE_NAME || 'course-service',
        requestId,
        timestamp: new Date().toISOString(),
        retryAfter: '30s',
        ...(err.code === 'ECONNREFUSED' && { 
          suggestion: 'Service may be down. Check service health.' 
        }),
        ...(err.code === 'ETIMEDOUT' && { 
          suggestion: 'Service is slow to respond. Consider scaling.' 
        })
      };

      let statusCode = 503;
      if (err.response?.status) {
        statusCode = err.response.status >= 400 ? err.response.status : 503;
      } else if (err.code === 'ECONNREFUSED') {
        statusCode = 502; // Bad Gateway
      } else if (err.code === 'ETIMEDOUT') {
        statusCode = 504; // Gateway Timeout
      }

      res.status(statusCode).json(errorResponse);
    }
  }
}