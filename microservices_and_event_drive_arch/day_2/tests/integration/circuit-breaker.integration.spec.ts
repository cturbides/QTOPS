import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ELearningServiceRegistry } from '../../src/modules/service-discovery/services/e-learning-registry.service';
import { CircuitBreakerService } from '../../src/modules/service-discovery/services/circuit-breaker.service';
import { CircuitBreakerWrapper } from '../../src/modules/service-discovery/services/circuit-breaker-wrapper.service';
import { ConsulService } from '../../src/modules/service-discovery/services/consul.service';
import { IntelligentLoadBalancer } from '../../src/modules/service-discovery/services/intelligent-load-balancer.service';
import { CircuitOpenException, CircuitTimeoutException } from '../../src/modules/service-discovery/exceptions/circuit-breaker.exception';
import { ServiceCommunicationException } from '../../src/modules/service-discovery/exceptions/service-communication.exception';
import { of, throwError } from 'rxjs';
import { CircuitState } from '../../src/modules/service-discovery/interfaces/circuit-breaker.interfaces';

describe('Circuit Breaker Integration', () => {
  let registry: ELearningServiceRegistry;
  let circuitBreakerService: CircuitBreakerService;
  let httpService: HttpService;
  let loadBalancer: IntelligentLoadBalancer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        {
          provide: ConsulService,
          useValue: {
            health: {
              service: jest.fn((serviceName, options, callback) => {
                const mockResult = [
                  {
                    Service: {
                      ID: 'test-service-1',
                      Address: 'localhost',
                      Port: 3001,
                      Tags: ['version:1.0.0']
                    },
                    Checks: [{ Status: 'passing' }]
                  }
                ];
                if (callback) {
                  callback(null, mockResult);
                }
                return Promise.resolve(mockResult);
              })
            },
            agent: {
              check: {
                register: jest.fn().mockResolvedValue(true)
              }
            }
          }
        },
        IntelligentLoadBalancer,
        CircuitBreakerService,
        CircuitBreakerWrapper,
        ELearningServiceRegistry
      ]
    }).compile();

    registry = module.get<ELearningServiceRegistry>(ELearningServiceRegistry);
    circuitBreakerService = module.get<CircuitBreakerService>(CircuitBreakerService);
    httpService = module.get<HttpService>(HttpService);
    loadBalancer = module.get<IntelligentLoadBalancer>(IntelligentLoadBalancer);
  });

  describe('Circuit Breaker with Service Communication', () => {
    it('should allow successful service calls when circuit is closed', async () => {
      // Mock successful HTTP response
      jest.spyOn(httpService, 'post').mockReturnValue(
        of({ data: { status: 'ok', message: 'Service responding' } }) as any
      );

      const result = await registry.invocarServicioEducativo(
        'test-service',
        'api/test'
      );

      expect(result).toEqual({ status: 'ok', message: 'Service responding' });
      expect(registry.getCircuitBreakerState('test-service')).toBe(CircuitState.CLOSED);
      
      const metrics = registry.getCircuitBreakerMetrics('test-service');
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.totalRequests).toBe(1);
    });

    it('should open circuit after consecutive failures', async () => {
      // Mock failing HTTP responses
      jest.spyOn(httpService, 'post').mockReturnValue(
        throwError(() => new Error('Service unavailable')) as any
      );

      // Configure with low threshold for faster testing
      circuitBreakerService.registerCircuit('failing-service', { 
        failureThreshold: 2,
        timeout: 1000,
        retryAttemptTimeout: 5000
      });

      // First failure
      await expect(registry.invocarServicioEducativo('failing-service', 'api/test'))
        .rejects.toThrow(ServiceCommunicationException);
      
      expect(registry.getCircuitBreakerState('failing-service')).toBe(CircuitState.CLOSED);

      // Second failure - should open circuit
      await expect(registry.invocarServicioEducativo('failing-service', 'api/test'))
        .rejects.toThrow(ServiceCommunicationException);
      
      expect(registry.getCircuitBreakerState('failing-service')).toBe(CircuitState.OPEN);

      // Third call should be blocked by circuit breaker
      await expect(registry.invocarServicioEducativo('failing-service', 'api/test'))
        .rejects.toThrow(CircuitOpenException);

      const metrics = registry.getCircuitBreakerMetrics('failing-service');
      expect(metrics.failedRequests).toBe(2);
      expect(metrics.circuitOpenEvents).toBe(1);
    });

    it('should transition through half-open state and recover', async () => {
      // Initially mock failures
      const httpSpy = jest.spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => new Error('Service down')) as any);

      // Configure with short timeouts for testing
      circuitBreakerService.registerCircuit('recovery-service', {
        failureThreshold: 2,
        retryAttemptTimeout: 100, // 100ms
        halfOpenRetryTimeout: 50   // 50ms
      });

      // Force circuit to open
      await expect(registry.invocarServicioEducativo('recovery-service', 'api/test'))
        .rejects.toThrow(ServiceCommunicationException);
      await expect(registry.invocarServicioEducativo('recovery-service', 'api/test'))
        .rejects.toThrow(ServiceCommunicationException);
      
      expect(registry.getCircuitBreakerState('recovery-service')).toBe(CircuitState.OPEN);

      // Wait for retry timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Mock service recovery
      httpSpy.mockReturnValue(
        of({ data: { status: 'recovered', message: 'Service is back' } }) as any
      );

      // Should transition to half-open and then to closed on success
      const result = await registry.invocarServicioEducativo('recovery-service', 'api/test');
      
      expect(result).toEqual({ status: 'recovered', message: 'Service is back' });
      expect(registry.getCircuitBreakerState('recovery-service')).toBe(CircuitState.CLOSED);

      const metrics = registry.getCircuitBreakerMetrics('recovery-service');
      expect(metrics.circuitCloseEvents).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
    });

    it('should handle timeout scenarios', async () => {
      // Mock a hanging request
      jest.spyOn(httpService, 'post').mockReturnValue(
        new Promise(resolve => {
          // Never resolve to simulate hanging request
        }) as any
      );

      // Configure with very short timeout
      circuitBreakerService.registerCircuit('timeout-service', {
        timeout: 100, // 100ms timeout
        failureThreshold: 1
      });

      await expect(registry.invocarServicioEducativo('timeout-service', 'api/test'))
        .rejects.toThrow(CircuitTimeoutException);

      expect(registry.getCircuitBreakerState('timeout-service')).toBe(CircuitState.OPEN);
      
      const metrics = registry.getCircuitBreakerMetrics('timeout-service');
      expect(metrics.failedRequests).toBe(1);
    });

    it('should provide comprehensive metrics', async () => {
      // Mock mixed success/failure responses
      const httpSpy = jest.spyOn(httpService, 'post');
      
      // Success
      httpSpy.mockReturnValueOnce(
        of({ data: { status: 'ok' } }) as any
      );
      
      // Failure
      httpSpy.mockReturnValueOnce(
        throwError(() => new Error('Temporary error')) as any
      );
      
      // Success
      httpSpy.mockReturnValueOnce(
        of({ data: { status: 'ok' } }) as any
      );

      await registry.invocarServicioEducativo('metrics-service', 'api/test');
      
      try {
        await registry.invocarServicioEducativo('metrics-service', 'api/test');
      } catch {
        // Expected failure
      }
      
      await registry.invocarServicioEducativo('metrics-service', 'api/test');

      const metrics = registry.getCircuitBreakerMetrics('metrics-service');
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.successfulRequests).toBe(2);
      expect(metrics.failedRequests).toBe(1);
      expect(registry.getCircuitBreakerState('metrics-service')).toBe(CircuitState.CLOSED);
    });

    it('should allow manual circuit reset', async () => {
      // Mock failures to open circuit
      jest.spyOn(httpService, 'post').mockReturnValue(
        throwError(() => new Error('Service down')) as any
      );

      circuitBreakerService.registerCircuit('reset-service', { failureThreshold: 1 });

      // Force circuit to open
      await expect(registry.invocarServicioEducativo('reset-service', 'api/test'))
        .rejects.toThrow(ServiceCommunicationException);
      
      expect(registry.getCircuitBreakerState('reset-service')).toBe(CircuitState.OPEN);

      // Manual reset
      registry.resetCircuitBreaker('reset-service');
      expect(registry.getCircuitBreakerState('reset-service')).toBe(CircuitState.CLOSED);

      // Should allow calls again (even though service is still "down")
      await expect(registry.invocarServicioEducativo('reset-service', 'api/test'))
        .rejects.toThrow(ServiceCommunicationException); // Still fails but circuit allows it
    });
  });

  describe('Multiple Services Circuit Breaker Management', () => {
    it('should manage circuits for multiple services independently', async () => {
      const httpSpy = jest.spyOn(httpService, 'post');
      
      // Service A - Success
      httpSpy.mockReturnValueOnce(
        of({ data: { service: 'A', status: 'ok' } }) as any
      );
      
      // Service B - Failure
      httpSpy.mockReturnValueOnce(
        throwError(() => new Error('Service B down')) as any
      );

      circuitBreakerService.registerCircuit('service-a', { failureThreshold: 5 });
      circuitBreakerService.registerCircuit('service-b', { failureThreshold: 1 });

      // Service A should succeed
      const resultA = await registry.invocarServicioEducativo('service-a', 'api/test');
      expect(resultA).toEqual({ service: 'A', status: 'ok' });
      expect(registry.getCircuitBreakerState('service-a')).toBe(CircuitState.CLOSED);

      // Service B should fail and open circuit
      await expect(registry.invocarServicioEducativo('service-b', 'api/test'))
        .rejects.toThrow(ServiceCommunicationException);
      expect(registry.getCircuitBreakerState('service-b')).toBe(CircuitState.OPEN);

      // Service A should still work
      httpSpy.mockReturnValueOnce(
        of({ data: { service: 'A', status: 'still ok' } }) as any
      );
      
      const resultA2 = await registry.invocarServicioEducativo('service-a', 'api/test');
      expect(resultA2).toEqual({ service: 'A', status: 'still ok' });

      // Service B should be blocked
      await expect(registry.invocarServicioEducativo('service-b', 'api/test'))
        .rejects.toThrow(CircuitOpenException);

      // Verify metrics are independent
      const allMetrics = registry.getAllCircuitBreakerMetrics();
      expect(allMetrics['service-a'].successfulRequests).toBe(2);
      expect(allMetrics['service-b'].failedRequests).toBe(1);
    });
  });
});
