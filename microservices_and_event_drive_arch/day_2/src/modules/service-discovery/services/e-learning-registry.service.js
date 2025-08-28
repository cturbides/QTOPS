"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELearningServiceRegistry = void 0;
const uuid_1 = require("uuid");
const rxjs_1 = require("rxjs");
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const consul_service_1 = require("./consul.service");
const circuit_breaker_wrapper_service_1 = require("./circuit-breaker-wrapper.service");
const intelligent_load_balancer_service_1 = require("./intelligent-load-balancer.service");
const circuit_breaker_constants_1 = require("../constants/circuit-breaker.constants");
const service_communication_exception_1 = require("../exceptions/service-communication.exception");
const common_2 = require("../constants/common");
let ELearningServiceRegistry = class ELearningServiceRegistry {
    constructor(http, consul, loadBalancer, circuitBreakerWrapper) {
        this.http = http;
        this.consul = consul;
        this.loadBalancer = loadBalancer;
        this.circuitBreakerWrapper = circuitBreakerWrapper;
    }
    generateRequestId() { return (0, uuid_1.v4)(); }
    async registrarServicio(config) {
        const id = `${config.name}-${process.env.INSTANCE_ID || 'default'}`;
        await this.consul.registerService({
            id,
            name: config.name,
            port: config.port,
            tags: config.tags,
            meta: config.meta,
            address: config.host,
            check: {
                timeout: '5s',
                interval: '10s',
                http: `http://${config.host}:${config.port}/health`,
                deregistercriticalserviceafter: '30s'
            }
        });
    }
    async registrarServicioEducativo(servicio) {
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
    async invocarServicioEducativo(tipoServicio, operacion, payload) {
        return this.circuitBreakerWrapper.execute(tipoServicio, async () => {
            const instancia = await this.loadBalancer.seleccionarInstancia(tipoServicio);
            try {
                const startTime = Date.now();
                const response = await (0, rxjs_1.firstValueFrom)(this.http.post(`http://${instancia.address}:${instancia.port}/${operacion}`, payload, {
                    timeout: 5000,
                    headers: {
                        'X-Service-Request-ID': this.generateRequestId(),
                        'X-Source-Service': process.env.SERVICE_NAME || 'unknown'
                    }
                }));
                const responseTime = Date.now() - startTime;
                await this.registrarMetricasExito(instancia.id, responseTime);
                return response.data;
            }
            catch (error) {
                await this.registrarMetricasError(instancia.id, error);
                throw new service_communication_exception_1.ServiceCommunicationException(`Error comunicándose con ${tipoServicio}: ${error.message}`);
            }
        }, circuit_breaker_constants_1.DEFAULT_CIRCUIT_BREAKER_CONFIG);
    }
    async configurarHealthChecksEducativos(servicio) {
        const checks = [
            {
                name: `${servicio.tipo}-basic-health`,
                http: `http://${servicio.host}:${servicio.port}/health`,
                interval: '10s'
            },
            {
                name: `${servicio.tipo}-${common_2.DATABASE_CONNECTION_CHECK_NAME}`,
                http: `http://${servicio.host}:${servicio.port}/health/database`,
                interval: '30s'
            }
        ];
        if (servicio.tipo === common_2.ServiceType.COURSE_SERVICE) {
            checks.push({
                name: common_2.COURSE_CONTENT_ACCESSIBILITY_CHECK_NAME,
                http: `http://${servicio.host}:${servicio.port}/health/content`,
                interval: '60s'
            });
        }
        for (const check of checks) {
            await this.consul.agent.check.register(check);
        }
    }
    async registrarMetricasExito(instanceId, responseTime) {
        await this.loadBalancer.registrarExito(instanceId, responseTime);
    }
    async registrarMetricasError(instanceId, error) {
        await this.loadBalancer.registrarError(instanceId);
    }
    /**
     * Obtiene el estado del circuit breaker para un servicio
     */
    getCircuitBreakerState(serviceName) {
        return this.circuitBreakerWrapper.getCircuitState(serviceName);
    }
    /**
     * Obtiene las métricas del circuit breaker para un servicio
     */
    getCircuitBreakerMetrics(serviceName) {
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
    resetCircuitBreaker(serviceName) {
        return this.circuitBreakerWrapper.reset(serviceName);
    }
};
exports.ELearningServiceRegistry = ELearningServiceRegistry;
exports.ELearningServiceRegistry = ELearningServiceRegistry = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        consul_service_1.ConsulService,
        intelligent_load_balancer_service_1.IntelligentLoadBalancer,
        circuit_breaker_wrapper_service_1.CircuitBreakerWrapper])
], ELearningServiceRegistry);
