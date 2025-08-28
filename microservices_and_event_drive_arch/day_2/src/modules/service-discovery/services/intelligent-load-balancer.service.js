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
exports.IntelligentLoadBalancer = void 0;
const common_1 = require("@nestjs/common");
const consul_service_1 = require("./consul.service");
const common_2 = require("../constants/common");
let IntelligentLoadBalancer = class IntelligentLoadBalancer {
    constructor(consul) {
        this.consul = consul;
        this.metrics = new Map();
        this.caches = new Map(); // nombre -> instancias (último fetch)
        this.lastFetch = new Map();
        this.ttlMs = common_2.DEFAULT_TTL_PER_MSG;
    }
    async fetchHealthy(serviceName) {
        const now = Date.now();
        if (this.caches.has(serviceName) && (now - (this.lastFetch.get(serviceName) || 0)) < this.ttlMs) {
            return this.caches.get(serviceName);
        }
        try {
            const res = await new Promise((resolve, reject) => {
                this.consul.health.service({
                    service: serviceName,
                    passing: true
                }, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            });
            const instances = res.map((s) => ({
                id: s.Service.ID,
                address: s.Service.Address,
                port: s.Service.Port,
                tags: s.Service.Tags,
                healthy: s.Checks.every((c) => c.Status === 'passing')
            }));
            this.caches.set(serviceName, instances);
            this.lastFetch.set(serviceName, now);
            return instances;
        }
        catch (error) {
            // Return empty array if consul is not available
            return [];
        }
    }
    async seleccionarInstancia(serviceName) {
        const instances = await this.fetchHealthy(serviceName);
        if (instances.length === 0) {
            throw new common_1.ServiceUnavailableException(`No hay instancias disponibles para ${serviceName}`);
        }
        // Weighted Response Time con penalización por errores e inFlight
        const weights = instances.map((inst) => {
            const m = this.metrics.get(inst.id) || { success: 0, failures: 0, responseTimeAvg: 100, inFlight: 0 };
            const errorPenalty = 1 + m.failures;
            const inflightPenalty = 1 + m.inFlight * 0.5;
            const base = 1 / (m.responseTimeAvg + 1);
            return base / (errorPenalty * inflightPenalty);
        });
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < instances.length; i++) {
            if ((r -= weights[i]) <= 0) {
                const picked = instances[i];
                const m = this.metrics.get(picked.id) || { success: 0, failures: 0, responseTimeAvg: 100, inFlight: 0 };
                m.inFlight += 1;
                this.metrics.set(picked.id, m);
                return picked;
            }
        }
        return instances[0];
    }
    async registrarExito(id, rt) {
        const m = this.metrics.get(id) || { success: 0, failures: 0, responseTimeAvg: rt, inFlight: 0 };
        m.success += 1;
        m.responseTimeAvg = Math.round((m.responseTimeAvg * 0.8) + (rt * 0.2));
        m.inFlight = Math.max(0, m.inFlight - 1);
        this.metrics.set(id, m);
    }
    async registrarError(id) {
        const m = this.metrics.get(id) || { success: 0, failures: 0, responseTimeAvg: 100, inFlight: 0 };
        m.failures += 1;
        m.inFlight = Math.max(0, m.inFlight - 1);
        this.metrics.set(id, m);
    }
};
exports.IntelligentLoadBalancer = IntelligentLoadBalancer;
exports.IntelligentLoadBalancer = IntelligentLoadBalancer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [consul_service_1.ConsulService])
], IntelligentLoadBalancer);
