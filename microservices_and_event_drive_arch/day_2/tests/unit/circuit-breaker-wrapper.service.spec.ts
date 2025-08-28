import { Test, TestingModule } from '@nestjs/testing';
import { CircuitBreakerWrapper } from '../../src/modules/service-discovery/services/circuit-breaker-wrapper.service';
import { CircuitBreakerService } from '../../src/modules/service-discovery/services/circuit-breaker.service';
import { CircuitOpenException, CircuitTimeoutException } from '../../src/modules/service-discovery/exceptions/circuit-breaker.exception';

describe('CircuitBreakerWrapper', () => {
  let wrapper: CircuitBreakerWrapper;
  let circuitBreakerService: CircuitBreakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CircuitBreakerWrapper,
        CircuitBreakerService
      ],
    }).compile();

    wrapper = module.get<CircuitBreakerWrapper>(CircuitBreakerWrapper);
    circuitBreakerService = module.get<CircuitBreakerService>(CircuitBreakerService);
  });

  it('should be defined', () => {
    expect(wrapper).toBeDefined();
  });

  describe('Successful Execution', () => {
    it('should execute operation successfully and record success', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      const result = await wrapper.execute('test-service', mockOperation);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
      
      const metrics = wrapper.getMetrics('test-service');
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.totalRequests).toBe(1);
    });
  });

  describe('Failed Execution', () => {
    it('should handle operation failure and record failure', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      await expect(wrapper.execute('test-service', mockOperation)).rejects.toThrow('Operation failed');
      
      const metrics = wrapper.getMetrics('test-service');
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.totalRequests).toBe(1);
    });

    it('should throw CircuitOpenException when circuit is open', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Service down'));
      
      // Force multiple failures to open circuit
      const config = { failureThreshold: 2 };
      
      await expect(wrapper.execute('test-service', mockOperation, config)).rejects.toThrow();
      await expect(wrapper.execute('test-service', mockOperation, config)).rejects.toThrow();
      
      // Next call should throw CircuitOpenException
      await expect(wrapper.execute('test-service', mockOperation, config)).rejects.toThrow(CircuitOpenException);
    });
  });

  describe('Timeout Handling', () => {
    it('should handle operation timeout', async () => {
      const mockOperation = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      );
      
      const config = { timeout: 100 }; // 100ms timeout
      
      await expect(wrapper.execute('test-service', mockOperation, config))
        .rejects.toThrow(CircuitTimeoutException);
      
      const metrics = wrapper.getMetrics('test-service');
      expect(metrics.failedRequests).toBe(1);
    });

    it('should complete operation within timeout', async () => {
      const mockOperation = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('fast'), 50)) // 50ms delay
      );
      
      const config = { timeout: 200 }; // 200ms timeout
      
      const result = await wrapper.execute('test-service', mockOperation, config);
      expect(result).toBe('fast');
      
      const metrics = wrapper.getMetrics('test-service');
      expect(metrics.successfulRequests).toBe(1);
    });
  });

  describe('Circuit Recovery', () => {
    it('should allow circuit recovery after successful execution', async () => {
      const failingOperation = jest.fn().mockRejectedValue(new Error('Service down'));
      const successOperation = jest.fn().mockResolvedValue('recovered');
      
      const config = { failureThreshold: 2, retryAttemptTimeout: 100 };
      
      // Force circuit to open
      await expect(wrapper.execute('test-service', failingOperation, config)).rejects.toThrow();
      await expect(wrapper.execute('test-service', failingOperation, config)).rejects.toThrow();
      
      // Circuit should be open
      await expect(wrapper.execute('test-service', successOperation, config)).rejects.toThrow(CircuitOpenException);
      
      // Wait for retry timeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should allow execution and recover
      const result = await wrapper.execute('test-service', successOperation, config);
      expect(result).toBe('recovered');
      
      // Circuit should be closed now
      const nextResult = await wrapper.execute('test-service', successOperation, config);
      expect(nextResult).toBe('recovered');
    });
  });

  describe('Metrics and State Access', () => {
    it('should provide access to circuit state', () => {
      circuitBreakerService.registerCircuit('test-service');
      
      const state = wrapper.getCircuitState('test-service');
      expect(state).toBe('CLOSED');
    });

    it('should provide access to metrics', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      await wrapper.execute('test-service', mockOperation);
      
      const metrics = wrapper.getMetrics('test-service');
      expect(metrics).toHaveProperty('successfulRequests', 1);
      expect(metrics).toHaveProperty('totalRequests', 1);
    });

    it('should provide access to all metrics', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      await wrapper.execute('service-1', mockOperation);
      await wrapper.execute('service-2', mockOperation);
      
      const allMetrics = wrapper.getAllMetrics();
      expect(allMetrics).toHaveProperty('service-1');
      expect(allMetrics).toHaveProperty('service-2');
    });

    it('should allow manual circuit reset', async () => {
      const failingOperation = jest.fn().mockRejectedValue(new Error('Service down'));
      const config = { failureThreshold: 1 };
      
      // Force circuit to open
      await expect(wrapper.execute('test-service', failingOperation, config)).rejects.toThrow();
      
      // Manually reset
      wrapper.reset('test-service');
      
      // Should allow execution again
      const successOperation = jest.fn().mockResolvedValue('reset success');
      const result = await wrapper.execute('test-service', successOperation, config);
      expect(result).toBe('reset success');
    });
  });
});
