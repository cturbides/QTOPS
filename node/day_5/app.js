// Task: Extiende este sistema para incluir distributed tracing,
// custom metrics collection, y integration con external monitoring systems
// como Prometheus.


// Sistema integral de performance monitoring y optimization
const http = require("http");
const crypto = require("crypto");
const EventEmitter = require('events');
const prometheusClient = require("prom-client");
const { performance, PerformanceObserver } = require('perf_hooks');

const ONE_MINUTE_MS = 1 * 60 * 1000;
const FIVE_SECONDS_MS = 5 * 1000;

/*
    Codigo extra
*/
class AdvancedObjectPoolManager {
    constructor() {
        this.pools = new Map();
        this.poolStats = new Map();
    }

    createPool(name, factory, reset, options = {}) {
        const pool = {
            objects: [],
            factory,
            reset,
            maxSize: options.maxSize || 100,
            created: 0,
            acquired: 0,
            released: 0
        };

        // Pre-populate pool
        const initialSize = options.initialSize || 10;
        for (let i = 0; i < initialSize; i++) {
            pool.objects.push(factory());
            pool.created++;
        }

        this.pools.set(name, pool);
        this.poolStats.set(name, {
            hitRate: 0,
            memoryEfficiency: 0,
            gcReduction: 0
        });

        return {
            acquire: () => this.acquireObject(name),
            release: (obj) => this.releaseObject(name, obj),
            stats: () => this.getPoolStats(name)
        };
    }

    acquireObject(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) throw new Error(`Pool ${poolName} not found`);

        pool.acquired++;

        if (pool.objects.length > 0) {
            // Reuse existing object
            return pool.objects.pop();
        } else {
            // Create new object
            pool.created++;
            return pool.factory();
        }
    }

    releaseObject(poolName, obj) {
        const pool = this.pools.get(poolName);
        if (!pool) return;

        pool.released++;

        // Reset object state
        if (pool.reset) {
            pool.reset(obj);
        }

        // Return to pool if not at capacity
        if (pool.objects.length < pool.maxSize) {
            pool.objects.push(obj);
        }

        // Update statistics
        this.updatePoolStats(poolName);
    }

    updatePoolStats(poolName) {
        const pool = this.pools.get(poolName);
        const stats = this.poolStats.get(poolName);

        // Calculate hit rate (reuse efficiency)
        stats.hitRate = (pool.released / pool.acquired) * 100;

        // Calculate memory efficiency
        stats.memoryEfficiency = (pool.objects.length / pool.created) * 100;

        // Estimate GC reduction
        stats.gcReduction = ((pool.released - pool.created) / pool.released) * 100;
    }

    getSystemStats() {
        const totalPools = this.pools.size;
        let totalObjects = 0;
        let totalReuse = 0;

        for (const [name, pool] of this.pools) {
            totalObjects += pool.created;
            totalReuse += pool.released;
        }

        return {
            totalPools,
            totalObjects,
            totalReuse,
            overallEfficiency: (totalReuse / totalObjects) * 100,
            pools: Array.from(this.poolStats.entries()).map(([name, stats]) => ({
                name,
                ...stats
            }))
        };
    }

    optimizeAllPools() {
        for (const [name, pool] of this.pools) {
            const idealSize = Math.max(Math.floor(pool.maxSize / 2), 1);

            if (pool.objects.length > idealSize) {
                pool.objects.length = idealSize;
            }

            if (pool.reset) {
                for (let i = 0; i < pool.objects.length; i++) {
                    pool.reset(pool.objects[i]);
                }
            }

            this.updatePoolStats(name);
        }
    }

    clearAllPools() {
        for (const pool of this.pools.values()) {
            pool.objects.length = 0;
        }
    }
}

// ===================================================================================================
// Codigo nuevo
// Distributed Traceability
class DistributedTracer {
    constructor() {
        this.traces = new Map();
    }

    startTrace(name, metadata = {}) {
        const traceId = crypto.randomUUID();
        const spanId = crypto.randomUUID();

        const startTime = process.hrtime.bigint();

        const span = {
            traceId,
            spanId,
            parentSpanId: null,
            name,
            startTime,
            endTime: null,
            duration: null,
            durationMs: null,
            metadata
        };

        this.traces.set(traceId, [span]);

        return { traceId, spanId, parentSpanId: null };
    }

    startSpan(traceId, parentSpanId, name, metadata = {}) {
        const spanId = crypto.randomUUID();
        const startTime = process.hrtime.bigint();

        const span = {
            traceId,
            spanId,
            parentSpanId,
            name,
            startTime,
            endTime: null,
            duration: null,
            metadata
        };

        if (!this.traces.has(traceId)) {
            this.traces.set(traceId, []);
        }

        this.traces.get(traceId).push(span);

        return { traceId, spanId, parentSpanId };
    }

    endSpan(traceId, spanId) {
        const span = this.traces.get(traceId)?.find(s => s.spanId === spanId);

        if (!span || span.endTime) {
            return;
        }

        span.endTime = process.hrtime.bigint();
        span.duration = span.endTime - BigInt(span.startTime);

        span.durationMs = (Number(span.duration) / 1e6).toFixed(3);
    }

    getTrace(traceId) {
        return this.traces.get(traceId) || [];
    }

    // By default, maxAgeMs = 1min
    cleanOldTraces(maxAgeMs = ONE_MINUTE_MS) {
        const now = process.hrtime.bigint();

        for (const [traceId, spans] of this.traces) {
            const finished = spans.every(s => s.endTime);
            const oldestEnd = spans.reduce(
                (max, s) => (s.endTime && s.endTime > max ? s.endTime : max),
                0n
            );

            const maxAgeNs = BigInt(maxAgeMs) * BigInt(1e6);

            if (finished && oldestEnd && (now - oldestEnd) > maxAgeNs) {
                this.traces.delete(traceId);
            }
        }
    }
}

// ===================================================================================================
// Prometheus Client
class MetricRepository {
    constructor(metadata = {}) {
        this.metricsRetrievalInterval = metadata?.retrievalInterval ?? FIVE_SECONDS_MS;

        this.register = new prometheusClient.Registry();
        this.eventLoopLagGauge = new prometheusClient.Gauge({
            name: metadata.eventLoopLagName ?? 'app_event_loop_lag_ms',
            help: 'Event loop lag in milliseconds',
        });

        this.heapUsedGauge = new prometheusClient.Gauge({
            name: metadata?.heapUsedName ?? 'app_memory_heap_used_bytes',
            help: 'Heap used in bytes',
        });

        this.customMetricGauge = new prometheusClient.Gauge({
            name: metadata?.customMetricName ?? 'app_custom_metrics',
            help: 'Custom metrics',
            labelNames: ['operationType', 'name'],
        });

        this.setupRepo();
    }

    setupRepo() {
        prometheusClient.collectDefaultMetrics({
            register: this.register,
        });

        this.register.registerMetric(this.eventLoopLagGauge);
        this.register.registerMetric(this.heapUsedGauge);
        this.register.registerMetric(this.customMetricGauge);
    }

    startServer(portNumber = 3000, metrics = {}, systemLag = null) {
        this.retrieveMetricsLoop(metrics, systemLag);
        this.createAndRunHttpServer(portNumber);
    }

    retrieveMetricsLoop(metrics, systemLag) {
        setInterval(() => {
            if (metrics?.memory?.length > 0) {
                const last = metrics.memory[metrics.memory.length - 1];

                this.heapUsedGauge.set(last.heapUsed ?? 0);
            }

            if (systemLag) {
                this.eventLoopLagGauge.set(systemLag);
            }

            if (metrics?.custom?.length) {
                const lastCustom = metrics.custom.slice(-1)[0];

                this.customMetricGauge.set({
                    name: lastCustom.name,
                    operationType: lastCustom.operationType,
                }, lastCustom.value);
            }

        }, this.metricsRetrievalInterval);
    }

    createAndRunHttpServer(portNumber) {
        const routes = {
            '/metrics': async (req, res) => {
                res.setHeader('Content-Type', this.register.contentType);
                res.end(await this.register.metrics());
            }
        }

        const server = http.createServer(async (req, res) => {
            const handler = routes[req.url];

            if (!handler) {
                res.statusCode = 404;
                res.end('NOT FOUND');
                return;
            }

            await handler(req, res);
        });

        server.listen(portNumber, () => {
            console.log(`Prometheus metrics exposed on http://localhost:${portNumber}/metrics`);
        });
    }
}
// ===================================================================================================
// ===================================================================================================

class EnterprisePerformanceSystem extends EventEmitter {
    constructor(options = {}) {
        super();
        this.config = {
            monitoringInterval: options.monitoringInterval || 5000, // ms
            alertThresholds: {
                eventLoopLag: options.eventLoopLag || 50,
                memoryGrowth: options.memoryGrowth || 10, // MB/min
                gcDuration: options.gcDuration || 100
            },
            ...options
        };

        this.metrics = {
            performance: [],
            memory: [],
            gc: [],
            alerts: [],
            custom: [], // Custom metrics
        };

        this.lag = 0;

        // Distributed tracer
        this.tracer = new DistributedTracer();

        // Object Pool Manager
        this.objectPoolManager = new AdvancedObjectPoolManager();

        // Prometheus integration
        this.metricRepo = new MetricRepository()

        this.setupMonitoring();
    }

    setupMonitoring() {
        // Performance monitoring
        this.setupPerformanceObserver();

        // Memory monitoring
        this.setupMemoryMonitoring();

        // Event loop monitoring
        this.setupEventLoopMonitoring();

        // Automated optimization
        this.setupAutomatedOptimization();

        this.metricRepo.startServer(3000, this.metrics, this.lag);
    }

    setupPerformanceObserver() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.processPerformanceEntry(entry);
            }
        });

        observer.observe({ entryTypes: ['measure', 'function', 'gc'] });
    }

    processPerformanceEntry(entry) {
        const { traceId, spanId } = this.tracer.startTrace(`perf-${entry.name}`);

        const metric = {
            timestamp: Date.now(),
            spanId: spanId,
            traceId: traceId,
            name: entry.name,
            type: entry.entryType,
            duration: entry.duration,
            startTime: entry.startTime
        };

        this.metrics.performance.push(metric);

        // Performance analysis
        if (entry.entryType === 'gc') {
            this.analyzeGCPerformance(entry, traceId, spanId);
        } else if (entry.duration > 100) {
            this.analyzeSlowOperation(entry, traceId, spanId);
        }

        this.emit('performanceMetric', metric);

        this.tracer.endSpan(traceId, spanId);
    }

    createSubSpan(name, traceId = null, parentSpanId = null) {
        if (traceId) {
            return this.tracer.startSpan(traceId, parentSpanId, name);
        }
    }

    closeSubSpan(traceId = null, subSpan = null) {
        if (traceId && subSpan?.spanId) {
            this.tracer.endSpan(traceId, subSpan.spanId);
        }
    }

    analyzeGCPerformance(gcEntry, traceId = null, parentSpanId = null) {
        const subSpan = this.createSubSpan(`analyzeGCPerformance`, traceId, parentSpanId);

        if (gcEntry.duration > this.config.alertThresholds.gcDuration) {
            this.createAlert('gc', 'warning',
                `Long GC pause: ${gcEntry.kind} took ${gcEntry.duration.toFixed(2)}ms`,
                traceId, subSpan?.spanId ?? null);

            // Trigger optimization
            this.optimizeMemoryUsage();
        }

        this.closeSubSpan(traceId, subSpan);
    }

    analyzeSlowOperation(entry, traceId = null, parentSpanId = null) {
        const subSpan = this.createSubSpan(`analyzeSlowOperation`, traceId, parentSpanId);


        this.createAlert('performance', 'warning',
            `Slow operation: ${entry.name} took ${entry.duration.toFixed(2)}ms`,
            traceId, subSpan?.spanId ?? null);

        this.closeSpan(traceId, subSpan);
    }

    setupMemoryMonitoring() {
        setInterval(() => {
            const { traceId, spanId } = this.tracer.startTrace('memory-monitoring');

            const memoryUsage = process.memoryUsage();
            const memoryMetric = {
                spanId: spanId,
                traceId: traceId,
                timestamp: Date.now(),
                ...memoryUsage
            };

            this.metrics.memory.push(memoryMetric);

            // Analyze memory trends
            this.analyzeMemoryTrends(traceId, spanId);

            this.emit('memoryMetric', memoryMetric);

            this.tracer.endSpan(traceId, spanId);
            this.tracer.cleanOldTraces();
        }, this.config.monitoringInterval);
    }

    analyzeMemoryTrends(traceId = null, parentSpanId = null) {
        if (this.metrics.memory.length < 5) return;

        const subSpan = this.createSubSpan(`analyzeMemoryTrends`, traceId, parentSpanId);

        const recent = this.metrics.memory.slice(-5);
        const oldest = recent[0];
        const newest = recent[recent.length - 1];

        const timeSpan = newest.timestamp - oldest.timestamp;
        const heapGrowth = newest.heapUsed - oldest.heapUsed;
        const growthRate = (heapGrowth / timeSpan) * 60000; // MB/min

        if (growthRate > this.config.alertThresholds.memoryGrowth * 1024 * 1024) {
            this.createAlert('memory', 'critical',
                `High memory growth rate: ${(growthRate / 1024 / 1024).toFixed(2)}MB/min`,
                traceId, subSpan?.spanId ?? null);

            this.optimizeMemoryUsage();
        }

        this.closeSubSpan(traceId, subSpan);
    }

    optimizeMemoryUsage() {
        this.objectPoolManager.optimizeAllPools();
        this.tracer.cleanOldTraces();

        this.clearInternalCaches();

        if (global.gc) {
            console.log(`[EnterprisePerformanceSystem] Executing GC...`);
            global.gc();
        }

        this.emit('memoryOptimization', {
            timestamp: Date.now(),
            memory: process.memoryUsage()
        });

        // const oneGb = 1024 ** 3;
        if (process.memoryUsage().heapUsed > (1024 * 1024 * 1024)) {
            console.warn(`[EnterprisePerformanceSystem] Heap usage higher than 1GB after optimization...`);
        }
    }

    setupEventLoopMonitoring() {
        const monitorEventLoop = () => {
            const start = process.hrtime.bigint();

            setImmediate(() => {
                const lag = Number(process.hrtime.bigint() - start) / 1000000;

                if (lag > this.config.alertThresholds.eventLoopLag) {
                    this.createAlert('eventLoop', 'warning',
                        `High event loop lag: ${lag.toFixed(2)}ms`);
                }

                this.lag = lag;
                this.emit('eventLoopLag', { timestamp: Date.now(), lag });

                setTimeout(monitorEventLoop, 1000);
            });
        };

        monitorEventLoop();
    }

    setupAutomatedOptimization() {
        // Automated optimization triggers
        this.on('performanceMetric', (metric) => {
            if (metric.type === 'gc' && metric.duration > 200) {
                this.triggerGCOptimization();
            }
        });

        this.on('memoryMetric', (metric) => {
            if (metric.heapUsed > 1024 * 1024 * 1024) { // 1GB
                this.triggerMemoryOptimization();
            }
        });
    }

    createAlert(category, severity, message, traceId = null, parentSpanId = null) {
        const subSpan = this.createSubSpan(`createAlert`, traceId, parentSpanId);

        const alert = {
            id: Date.now() + Math.random(),
            category,
            severity,
            message,
            traceId: traceId,
            spanId: subSpan?.spanId ?? null,
            timestamp: new Date().toISOString()
        };

        this.metrics.alerts.push(alert);
        this.emit('alert', alert);

        console.log(`[${severity.toUpperCase()}] ${category}: ${message}`);

        this.closeSubSpan(traceId, subSpan);
    }

    triggerGCOptimization() {
        console.log('Triggering GC optimization...');

        // Clear object pools
        this.objectPoolManager.clearAllPools();

        // Manual GC if available
        if (global.gc) {
            global.gc();
        }
    }

    triggerMemoryOptimization() {
        console.log('Triggering memory optimization...');

        // Optimize object pools
        this.objectPoolManager.optimizeAllPools();

        // Clear caches
        this.clearInternalCaches();
    }

    clearInternalCaches() {
        // Clear performance metrics cache
        if (this.metrics.performance.length > 1000) {
            this.metrics.performance = this.metrics.performance.slice(-500);
        }

        // Clear memory metrics cache
        if (this.metrics.memory.length > 1000) {
            this.metrics.memory = this.metrics.memory.slice(-500);
        }
    }

    getTraces() {
        return Array.from(this.tracer.traces.entries()).map(([traceId, spans]) => ({
            traceId: traceId,
            spans: spans,
        }));
    }

    generatePerformanceReport() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        // Filter recent metrics
        const recentPerformance = this.metrics.performance.filter(m => m.timestamp > oneHourAgo);
        const recentMemory = this.metrics.memory.filter(m => m.timestamp > oneHourAgo);
        const recentAlerts = this.metrics.alerts.filter(a => new Date(a.timestamp).getTime() > oneHourAgo);

        const traces = this.getTraces();
        const countOfTraces = traces.length;

        const customMetrics = this.metrics.custom.filter((m) => m.timestamp > (now - ONE_MINUTE_MS));

        return {
            timestamp: new Date().toISOString(),
            performance: {
                avgDuration: recentPerformance.length > 0
                    ? recentPerformance.reduce((sum, m) => sum + m.duration, 0) / recentPerformance.length
                    : 0,
                slowOperations: recentPerformance.filter(m => m.duration > 100).length
            },
            memory: {
                current: process.memoryUsage(),
                trend: this.calculateMemoryTrend(recentMemory)
            },
            traces: traces.slice(-20),
            objectPools: this.objectPoolManager.getSystemStats(),
            recommendations: this.generateOptimizationRecommendations(),
            customMetrics: customMetrics.slice(-20),
            summary: {
                totalMetrics: recentPerformance.length,
                memorySnapshots: recentMemory.length,
                alerts: recentAlerts.length,
                uptime: process.uptime(),
                countOfTraces: countOfTraces,
                countOfCustomMetrics: this.metrics.custom.length,
            },
        };
    }

    calculateMemoryTrend(memoryMetrics) {
        if (memoryMetrics.length < 2) return 'insufficient_data';

        const first = memoryMetrics[0];
        const last = memoryMetrics[memoryMetrics.length - 1];
        const growth = last.heapUsed - first.heapUsed;

        return growth > 0 ? 'increasing' : 'stable';
    }

    generateOptimizationRecommendations() {
        const recommendations = [];
        const latestMemory = this.metrics.memory[this.metrics.memory.length - 1];

        if (latestMemory && latestMemory.heapUsed > 500 * 1024 * 1024) {
            recommendations.push('Consider implementing object pooling for frequently created objects');
        }

        const recentAlerts = this.metrics.alerts.filter(a =>
            new Date(a.timestamp).getTime() > Date.now() - 3600000
        );

        if (recentAlerts.filter(a => a.category === 'gc').length > 5) {
            recommendations.push('High GC frequency detected - optimize memory allocation patterns');
        }

        return recommendations;
    }

    // Report a custom metric
    reportCustomMetric(name, value, metadata = {}) {
        const metric = {
            timestamp: Date.now(),
            name: name,
            value: value,
            ...metadata,
        };

        this.metrics.custom.push(metric);
        this.emit('customMetric', metric);

        this.cleanOldCustomMetrics();
    }

    cleanOldCustomMetrics() {
        this.metrics.custom = this.metrics.custom.filter((m) => m.timestamp > (Date.now() - ONE_MINUTE_MS));;
    }
}

// Demonstration del sistema
async function demonstratePerformanceSystem() {
    const perfSystem = new EnterprisePerformanceSystem({
        monitoringInterval: 2000, // ms
        alertThresholds: {
            eventLoopLag: 30, // ms
            memoryGrowth: 5, // MB/min
            gcDuration: 50 // ms
        }
    });

    // Event listeners
    perfSystem.on('alert', (alert) => {
        console.log('Performance Alert:', alert);
    });

    perfSystem.on('performanceMetric', (metric) => {
        if (metric.duration > 50) {
            console.log('Performance metric:', metric);
        }
    });

    perfSystem.on('memoryOptimization', (metric) => {
        console.log(`Recent memory optimization results`, metric);
    });

    perfSystem.on('customMetric', (metric) => {
        // console.log(`Recent custom metric results`, metric);
    });

    // Create object pool for demonstration
    const bufferPool = perfSystem.objectPoolManager.createPool(
        'buffers',
        () => Buffer.alloc(1024),
        (buffer) => buffer.fill(0),
        { initialSize: 20, maxSize: 100 }
    );

    // Simulate workload
    const simulateWorkload = () => {
        // Acquire and release buffers
        const buffer = bufferPool.acquire();
        buffer.write('test data');

        setTimeout(() => {
            bufferPool.release(buffer);
        }, Math.random() * 1000);

        // Simulate CPU-intensive work
        performance.now();
        let result = 0;
        for (let i = 0; i < 100000; i++) {
            result += Math.sqrt(i);
        }
        performance.now();
        // =============================

        performance.mark('workload-start');
        performance.mark('workload-end');
        performance.measure('workload-duration', 'workload-start', 'workload-end');

        perfSystem.reportCustomMetric('buffer_in_use', Math.random() * 1000, { operationType: 'multiplication' });
    };

    // Run workload simulation
    setInterval(simulateWorkload, 500);

    // Generate reports
    setInterval(() => {
        const report = perfSystem.generatePerformanceReport();
        console.log('Performance Report:', JSON.stringify(report, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, 2));

    }, 10000);

    // Cleanup after demonstration
    // setTimeout(() => {
    //     clearInterval(workloadInterval);
    //     console.log('Performance system demonstration completed');
    // }, 30000);
}

demonstratePerformanceSystem();
