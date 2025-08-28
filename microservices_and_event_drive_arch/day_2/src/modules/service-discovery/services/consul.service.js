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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsulService = void 0;
const consul_1 = __importDefault(require("consul"));
const common_1 = require("@nestjs/common");
const common_2 = require("../constants/common");
let ConsulService = class ConsulService {
    constructor(logger) {
        this.logger = logger;
        try {
            this.client = (0, consul_1.default)({
                host: process.env.CONSUL_HOST || common_2.DEFAULT_CONSUL_HOST,
                port: String(process.env.CONSUL_PORT || common_2.DEFAULT_CONSUL_PORT),
                promisify: true
            });
        }
        catch (error) {
            this.logger.error('Consul client initialization failed', error);
            throw new Error(`Failed to initialize Consul client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    get agent() { return this.client.agent; }
    get health() { return this.client.health; }
    async registerService(cfg) {
        try {
            return await this.client.agent.service.register(cfg);
        }
        catch (error) {
            this.logger.warn(`Failed to register service ${cfg.name}:`, error);
            throw error;
        }
    }
    async deregister(id) {
        try {
            return await this.client.agent.service.deregister(id);
        }
        catch (error) {
            this.logger.warn(`Failed to deregister service ${id}:`, error);
            throw error;
        }
    }
};
exports.ConsulService = ConsulService;
exports.ConsulService = ConsulService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [common_1.Logger])
], ConsulService);
