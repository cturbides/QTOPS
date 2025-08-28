import { Test, TestingModule } from '@nestjs/testing';
import { CircuitBreakerService } from '../../src/modules/service-discovery/services/circuit-breaker.service';
import { CircuitState } from '../../src/modules/service-discovery/interfaces/circuit-breaker.interfaces';
import { CircuitOpenException } from '../../src/modules/service-discovery/exceptions/circuit-breaker.exception';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CircuitBreakerService],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Circuit Registration', () => {
    it('should register a new circuit with default config', () => {
      service.registerCircuit('test-service');
      expect(service.getCircuitState('test-service')).toBe(CircuitState.CLOSED);
    });

    it('should register a new circuit with custom config', () => {
      service.registerCircuit('test-service', { failureThreshold: 3 });
      expect(service.getCircuitState('test-service')).toBe(CircuitState.CLOSED);
    });
  });

  describe('Circuit States', () => {
    beforeEach(() => {
      service.registerCircuit('test-service', { failureThreshold: 2, retryAttemptTimeout: 1000 });
    });

    it('should allow execution when circuit is closed', () => {
      expect(() => service.canExecute('test-service')).not.toThrow();
    });

    it('should record success and keep circuit closed', () => {
      service.recordSuccess('test-service');
      expect(service.getCircuitState('test-service')).toBe(CircuitState.CLOSED);
      
      const metrics = service.getMetrics('test-service');
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.totalRequests).toBe(1);
    });

    it('should record failure and increment failure count', () => {
      service.recordFailure('test-service');
      expect(service.getCircuitState('test-service')).toBe(CircuitState.CLOSED);
      
      const metrics = service.getMetrics('test-service');
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.totalRequests).toBe(1);
    });

    it('should open circuit after reaching failure threshold', () => {
      service.recordFailure('test-service');
      service.recordFailure('test-service'); // Should reach threshold of 2
      
      expect(service.getCircuitState('test-service')).toBe(CircuitState.OPEN);
      
      const metrics = service.getMetrics('test-service');
      expect(metrics.circuitOpenEvents).toBe(1);
    });

    it('should throw CircuitOpenException when circuit is open', () => {
      // Force circuit to open
      service.recordFailure('test-service');
      service.recordFailure('test-service');
      
      expect(() => service.canExecute('test-service')).toThrow(CircuitOpenException);
    });

    it('should transition to half-open after timeout', async () => {
      // Force circuit to open
      service.recordFailure('test-service');
      service.recordFailure('test-service');
      
      expect(service.getCircuitState('test-service')).toBe(CircuitState.OPEN);
      
      // Wait for retry timeout (1000ms) + buffer
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should not throw and should transition to half-open
      expect(() => service.canExecute('test-service')).not.toThrow();
      expect(service.getCircuitState('test-service')).toBe(CircuitState.HALF_OPEN);
    });

    it('should close circuit after success in half-open state', async () => {
      // Force circuit to open
      service.recordFailure('test-service');
      service.recordFailure('test-service');
      
      // Wait and transition to half-open
      await new Promise(resolve => setTimeout(resolve, 1100));
      service.canExecute('test-service');
      
      // Record success should close the circuit
      service.recordSuccess('test-service');
      expect(service.getCircuitState('test-service')).toBe(CircuitState.CLOSED);
      
      const metrics = service.getMetrics('test-service');
      expect(metrics.circuitCloseEvents).toBe(1);
    });
  });

  describe('Metrics', () => {
    beforeEach(() => {
      service.registerCircuit('test-service');
    });

    it('should track all metrics correctly', () => {
      service.recordSuccess('test-service');
      service.recordFailure('test-service');
      service.recordSuccess('test-service');
      
      const metrics = service.getMetrics('test-service');
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.successfulRequests).toBe(2);
      expect(metrics.failedRequests).toBe(1);
    });

    it('should return all metrics for all services', () => {
      service.registerCircuit('service-1');
      service.registerCircuit('service-2');
      
      service.recordSuccess('service-1');
      service.recordFailure('service-2');
      
      const allMetrics = service.getAllMetrics();
      expect(allMetrics).toHaveProperty('test-service');
      expect(allMetrics).toHaveProperty('service-1');
      expect(allMetrics).toHaveProperty('service-2');
      
      expect(allMetrics['service-1'].successfulRequests).toBe(1);
      expect(allMetrics['service-2'].failedRequests).toBe(1);
    });
  });

  describe('Circuit Reset', () => {
    beforeEach(() => {
      service.registerCircuit('test-service', { failureThreshold: 1 });
    });

    it('should reset circuit to closed state', () => {
      // Force circuit to open
      service.recordFailure('test-service');
      expect(service.getCircuitState('test-service')).toBe(CircuitState.OPEN);
      
      // Reset circuit
      service.reset('test-service');
      expect(service.getCircuitState('test-service')).toBe(CircuitState.CLOSED);
      
      // Should allow execution
      expect(() => service.canExecute('test-service')).not.toThrow();
    });
  });
});
