"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabasePerformanceInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabasePerformanceInterceptor = void 0;
const rxjs_1 = require("rxjs");
const common_1 = require("../constants/common");
const common_2 = require("@nestjs/common");
let DatabasePerformanceInterceptor = DatabasePerformanceInterceptor_1 = class DatabasePerformanceInterceptor {
    constructor() {
        this.logger = new common_2.Logger(DatabasePerformanceInterceptor_1.name);
    }
    intercept(context, next) {
        const startTime = Date.now();
        const request = context.switchToHttp().getRequest();
        const url = request.url;
        const method = request.method;
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            if (duration > common_1.DEFAULT_PERFORMANCE_SLOW_QUERY_DURATION) { // Más de 1 segundo
                this.logger.warn(`Query lenta detectada: ${method} ${url} - ${duration}ms`);
            }
            this.enviarMetricas({
                endpoint: url,
                metodo: method,
                duracion: duration,
                timestamp: new Date()
            });
        }));
    }
    enviarMetricas(metrica) {
        // TODO
        this.logger.log(`Métrica enviada: ${JSON.stringify(metrica)}`);
    }
};
exports.DatabasePerformanceInterceptor = DatabasePerformanceInterceptor;
exports.DatabasePerformanceInterceptor = DatabasePerformanceInterceptor = DatabasePerformanceInterceptor_1 = __decorate([
    (0, common_2.Injectable)()
], DatabasePerformanceInterceptor);
