import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ConsulService } from '../../src/modules/service-discovery/services/consul.service';
import { IntelligentLoadBalancer } from '../../src/modules/service-discovery/services/intelligent-load-balancer.service';
import { ELearningServiceRegistry } from '../../src/modules/service-discovery/services/e-learning-registry.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('Service Discovery Integration', () => {
  let loadBalancer: IntelligentLoadBalancer;
  let registry: ELearningServiceRegistry;
  let consulService: ConsulService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        {
          provide: ConsulService,
          useValue: {
            health: {
              service: (serviceName: string, options: any, callback?: Function) => {
                const mockResult = [
                  {
                    Service: {
                      ID: 'test-service-1',
                      Address: 'localhost',
                      Port: 3001,
                      Tags: ['version:1.0.0']
                    },
                    Checks: [{ Status: 'passing' }]
                  },
                  {
                    Service: {
                      ID: 'test-service-2',
                      Address: 'localhost',
                      Port: 3002,
                      Tags: ['version:1.0.0']
                    },
                    Checks: [{ Status: 'passing' }]
                  }
                ];
                if (callback) {
                  callback(null, mockResult);
                }
                return Promise.resolve(mockResult);
              }
            },
            registerService: jest.fn().mockResolvedValue(true),
            agent: {
              service: {
                register: jest.fn().mockResolvedValue(true)
              },
              check: {
                register: jest.fn().mockResolvedValue(true)
              }
            }
          }
        },
        IntelligentLoadBalancer,
        ELearningServiceRegistry
      ]
    }).compile();

    loadBalancer = module.get<IntelligentLoadBalancer>(IntelligentLoadBalancer);
    registry = module.get<ELearningServiceRegistry>(ELearningServiceRegistry);
    consulService = module.get<ConsulService>(ConsulService);
  });

  describe('IntelligentLoadBalancer', () => {
    it('should select a valid instance', async () => {
      const instance = await loadBalancer.seleccionarInstancia('test-service');
      
      expect(instance).toBeDefined();
      expect(instance.id).toEqual(expect.any(String));
      expect(instance.address).toEqual('localhost');
      expect(instance.port).toEqual(expect.any(Number));
      expect(instance.healthy).toBe(true);
    });

    it('should throw ServiceUnavailableException when no instances available', async () => {
      // Mock empty response for this specific test
      const mockEmptyService = jest.fn((serviceName: string, options: any, callback?: Function) => {
        const emptyResult: any[] = [];
        if (callback) {
          callback(null, emptyResult);
        }
        return Promise.resolve(emptyResult);
      });
      
      (consulService.health as any).service = mockEmptyService;

      await expect(loadBalancer.seleccionarInstancia('unavailable-service'))
        .rejects.toThrow(ServiceUnavailableException);
    });

    it('should register success metrics', async () => {
      const instance = await loadBalancer.seleccionarInstancia('test-service');
      
      // This should not throw
      await loadBalancer.registrarExito(instance.id, 150);
      
      expect(true).toBe(true); // Test passes if no exception is thrown
    });

    it('should register error metrics', async () => {
      const instance = await loadBalancer.seleccionarInstancia('test-service');
      
      // This should not throw
      await loadBalancer.registrarError(instance.id);
      
      expect(true).toBe(true); // Test passes if no exception is thrown
    });
  });

  describe('ELearningServiceRegistry', () => {
    it('should register an educational service', async () => {
      const service = {
        tipo: 'test-service',
        host: 'localhost',
        port: 3000,
        version: '1.0.0',
        dominio: 'e-learning',
        capacidades: ['http', 'nestjs'],
        capacidadMaxima: 1000,
        rateLimitPerMinute: 600
      };

      // This should not throw
      await registry.registrarServicioEducativo(service);
      
      expect(consulService.registerService).toHaveBeenCalled();
      expect(consulService.agent.check.register).toHaveBeenCalled();
    });
  });
});