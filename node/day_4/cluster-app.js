// Task: Extiende este sistema para incluir auto-scaling basado en
//  CPU usage, memory monitoring, y distributed task queuing con Redis.

// Sistema híbrido de clustering + worker threads
const os = require("os");
const http = require("http");
const Redis = require("ioredis");
const cluster = require("cluster");
const httpProxy = require("http-proxy");
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");

const GENERAL_TIMEOUT = 60000; // 60s

// Codigo extra
class LoadBalancedCluster {
  constructor(strategy = "round-robin", workers) {
    this.workers = workers;
    this.strategy = strategy;
    this.currentWorkerIndex = 0;
    this.connectionCounts = new Map();
  }

  selectWorker(req) {
    const availableWorkers = Array.from(this.workers.values()).filter(
      (worker) => worker.state === "ready",
    );

    if (availableWorkers.length === 0) {
      throw new Error("No available workers");
    }

    switch (this.strategy) {
      case "round-robin":
        return this.roundRobinSelection(availableWorkers);

      case "least-connections":
        return this.leastConnectionsSelection(availableWorkers);

      case "ip-hash":
        return this.ipHashSelection(availableWorkers, req);

      case "weighted":
        return this.weightedSelection(availableWorkers);

      default:
        return this.roundRobinSelection(availableWorkers);
    }
  }

  roundRobinSelection(workers) {
    const worker = workers[this.currentWorkerIndex % workers.length];
    this.currentWorkerIndex++;
    return worker;
  }

  leastConnectionsSelection(workers) {
    return workers.reduce((least, current) => {
      const leastConnections = this.connectionCounts.get(least.id) || 0;
      const currentConnections = this.connectionCounts.get(current.id) || 0;

      return currentConnections < leastConnections ? current : least;
    });
  }

  ipHashSelection(workers, req) {
    const clientIP = req.connection.remoteAddress;
    const hash = this.hashString(clientIP);
    const workerIndex = hash % workers.length;
    return workers[workerIndex];
  }

  weightedSelection(workers) {
    const totalWeight = workers.reduce(
      (sum, worker) => sum + (worker.weight || 1),
      0,
    );
    let random = Math.random() * totalWeight;

    for (const worker of workers) {
      random -= worker.weight || 1;
      if (random <= 0) {
        return worker;
      }
    }

    return workers[0]; // Fallback
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  updateConnectionCount(workerId, delta) {
    const current = this.connectionCounts.get(workerId) || 0;
    this.connectionCounts.set(workerId, Math.max(0, current + delta));
  }
}
// ==========================================================================

class CPUIntensiveProcessor {
  constructor(options = {}) {
    this.maxWorkers = options.maxWorkers ?? os.cpus().length;
    this.workers = [];
    this.taskQueue = [];
    this.activeJobs = new Map();
    this.jobIdCounter = 0;
  }

  async initialize() {
    if (!isMainThread) {
      // Worker thread code
      this.runWorkerThread();
      return;
    }

    // Main thread - create worker pool
    for (let i = 0; i < this.maxWorkers; i++) {
      await this.createWorker();
    }

    console.log(
      `CPU processor with PID '${process.pid}' initialized with ${this.maxWorkers} worker threads`,
    );
  }

  async createWorker() {
    const worker = new Worker(__filename, {
      workerData: { isWorker: true },
    });

    worker.on("message", (message) => {
      this.handleWorkerMessage(worker, message);
    });

    worker.on("error", (error) => {
      console.error("Worker error:", error);
      this.replaceWorker(worker);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
        this.replaceWorker(worker);
      }
    });

    worker.postMessage({ type: "init" });

    this.workers.push(worker);
  }

  async replaceWorker(deadWorker) {
    const index = this.workers.indexOf(deadWorker);

    if (index !== -1) {
      this.workers.splice(index, 1);
      await this.createWorker();
    }
  }

  async processTask(taskType, data, options = {}) {
    return new Promise((resolve, reject) => {
      const jobId = ++this.jobIdCounter;
      const job = {
        id: jobId,
        taskType,
        data,
        options,
        resolve,
        reject,
        startTime: Date.now(),
      };

      this.activeJobs.set(jobId, job);

      const availableWorker = this.findAvailableWorker();
      if (availableWorker) {
        this.assignJobToWorker(job, availableWorker);
      } else {
        this.taskQueue.push(job);
      }

      // Timeout handling
      if (options.timeout) {
        setTimeout(() => {
          if (this.activeJobs.has(jobId)) {
            this.activeJobs.delete(jobId);
            reject(new Error(`Task timeout after ${options.timeout}ms`));
          }
        }, options.timeout);
      }
    });
  }

  findAvailableWorker() {
    return this.workers.find((worker) => worker.isReady && !worker.isBusy);
  }

  assignJobToWorker(job, worker) {
    worker.isBusy = true;
    worker.currentJobId = job.id;

    worker.postMessage({
      type: "task",
      jobId: job.id,
      taskType: job.taskType,
      data: job.data,
      options: job.options,
    });
  }

  handleWorkerMessage(worker, message) {
    switch (message.type) {
      case "ready":
        worker.isReady = true;
        worker.isBusy = false;
        break;

      case "taskComplete":
        this.handleTaskComplete(worker, message);
        break;

      case "taskError":
        this.handleTaskError(worker, message);
        break;

      case "progress":
        this.handleTaskProgress(worker, message);
        break;

      case "shutdown":
        process.exit(0);
    }
  }

  handleTaskComplete(worker, message) {
    const job = this.activeJobs.get(message.jobId);

    if (job) {
      job.resolve(message.result);

      this.activeJobs.delete(message.jobId);
    }

    this.releaseWorker(worker);
  }

  handleTaskError(worker, message) {
    const job = this.activeJobs.get(message.jobId);

    if (job) {
      job.reject(new Error(message.error));
      this.activeJobs.delete(message.jobId);
    }

    this.releaseWorker(worker);
  }

  handleTaskProgress(_worker, message) {
    const job = this.activeJobs.get(message.jobId);

    if (job && job.options.onProgress) {
      job.options.onProgress(message.progress);
    }
  }

  releaseWorker(worker) {
    worker.isBusy = false;
    worker.currentJobId = null;

    // Assign queued task if available
    if (this.taskQueue.length > 0) {
      const nextJob = this.taskQueue.shift();

      if (!nextJob) {
        return;
      }

      this.assignJobToWorker(nextJob, worker);
    }
  }

  runWorkerThread() {
    // Worker thread implementation
    parentPort.postMessage({ type: "ready" });

    parentPort.on("message", async (message) => {
      switch (message.type) {
        case "task":
          await this.executeTask(message);
          break;
      }
    });
  }

  async executeTask(message) {
    try {
      const { jobId, taskType, data, options } = message;

      let result;
      switch (taskType) {
        case "imageProcessing":
          result = await this.processImage(data, options);
          break;

        case "dataAnalysis":
          result = await this.analyzeData(data, options);
          break;

        case "cryptography":
          result = await this.performCryptography(data, options);
          break;

        default:
          throw new Error(`Unknown task type: ${taskType}`);
      }

      parentPort.postMessage({
        type: "taskComplete",
        jobId,
        result,
      });
    } catch (error) {
      parentPort.postMessage({
        type: "taskError",
        jobId: message.jobId,
        error: error.message,
      });
    }
  }

  async processImage(data, options) {
    // Simulate CPU-intensive image processing
    const { width, height, filters } = data;
    const pixels = width * height;

    for (let i = 0; i < pixels; i++) {
      // Simulate complex image processing
      Math.sqrt(Math.sin(i) * Math.cos(i));

      // Report progress
      if (i % 10000 === 0) {
        parentPort.postMessage({
          type: "progress",
          jobId: options.jobId,
          progress: (i / pixels) * 100,
        });
      }
    }

    return { processedPixels: pixels, filters: filters.length };
  }

  async analyzeData(data, options) {
    // Simulate CPU-intensive data analysis
    const { dataset, algorithms } = data;
    const results = {};

    for (const algorithm of algorithms) {
      results[algorithm] = this.runAnalysisAlgorithm(dataset, algorithm);
    }

    return results;
  }

  runAnalysisAlgorithm(dataset, algorithm) {
    // Simulate complex mathematical computations
    let result = 0;
    for (let i = 0; i < dataset.length; i++) {
      result += Math.pow(dataset[i], 2) * Math.log(i + 1);
    }
    return result;
  }

  async performCryptography(data, options) {
    // Simulate CPU-intensive cryptographic operations
    const { text, iterations } = data;
    let hash = text;

    for (let i = 0; i < iterations; i++) {
      hash = this.simpleHash(hash);
    }

    return { hash, iterations };
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  getStats() {
    return {
      totalWorkers: this.workers.length,
      busyWorkers: this.workers.filter((w) => w.isBusy).length,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.activeJobs.size,
    };
  }

  async shutdown() {
    // Graceful shutdown of all workers
    const shutdownPromises = this.workers.map((worker) => {
      return new Promise((resolve) => {
        worker.postMessage({ type: "shutdown" });
        worker.on("exit", resolve);
        setTimeout(() => {
          worker.terminate();
          resolve();
        }, 5000);
      });
    });

    await Promise.all(shutdownPromises);
  }
}

// ==================================================================
//
// Utility class
class HttpProxy {
  constructor(port, targets) {
    this.port = port; // Only the port number

    // a map of id + object like:
    //[1, { id: 1, state: "ready", weight: 3, url: 'http://localhost:3001' }],
    // [2, { id: 2, state: "ready", weight: 1, url: 'http://localhost:30002' }],
    this.targets = targets;

    this.loadBalancer = new LoadBalancedCluster("round-robin", targets);
  }

  createWebServer() {
    const proxy = httpProxy.createProxyServer({
      ssl: false,
      timeout: GENERAL_TIMEOUT,
      proxyTimeout: GENERAL_TIMEOUT,
    });

    proxy.on("error", (err, _req, res) => {
      res.writeHead(500, { "Content-Type": "text/json" });
      res.end(JSON.stringify({ error: `Proxy error: ${err?.message}` }));
    });

    http
      .createServer((req, res) => {
        const target = this.loadBalancer.selectWorker(req).url;
        proxy.web(req, res, { target: target });
      })
      .listen(this.port, () => {
        console.log(
          `Proxy server with PID '${process.pid}' is listening on port: ${this.port}`,
        );
      });

    return proxy;
  }
}
// ==================================================================
// Redis class
class RedisTaskQueue {
  constructor(queueName = "task-queue") {
    this.redis = new Redis();
    this.queueName = queueName;
  }

  async enqueue(task) {
    await this.redis.rpush(this.queueName, JSON.stringify(task));
  }

  async dequeueBlocking(timeout = 0) {
    const result = await this.redis.blpop(this.queueName, timeout);
    return result ? JSON.parse(result[1]) : null;
  }
}

// ==================================================================
// ==================================================================
//

// Codigo base
class HybridScalingSystem {
  constructor(options = {}) {
    this.clusterSize = options.clusterSize ?? require("os").cpus().length;
    this.threadPoolSize = options.threadPoolSize ?? 4;
    this.port = options.port ?? 3000;

    // Proxy http config
    this.workers = new Map();
    this.httpServer = new HttpProxy(this.port, this.workers);

    // CPU auto-scaling
    this.idleCount = 0;
    this.minClusterSize = 2;
    this.maxClusterSize = 20;
    this.scaleCheckInterval = 5000; // 5s
    this.manuallyStoppedWorkers = new Set();

    // Process start point
    if (isMainThread && cluster.isPrimary) {
      this.startMaster();
    } else {
      this.startWorker();
    }
  }

  startMaster() {
    console.log(`Master ${process.pid} starting hybrid scaling system`);
    console.log(`Cluster size: ${this.clusterSize} processes`);
    console.log(`Thread pool size: ${this.threadPoolSize} threads per process`);

    cluster.setupPrimary({
      exec: __filename,
    });

    this.httpServer.createWebServer();

    // Start cluster workers
    for (let i = 0; i < this.clusterSize; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, _code, _signal) => {
      this.workers.delete(worker?.id);

      if (this.manuallyStoppedWorkers.has(worker.id)) {
        console.log(
          `Worker '${worker.process.pid}' was killed by autoscaling..`,
        );
      } else {
        console.log(`Worker ${worker.process.pid} died, restarting...`);
        cluster.fork();
      }

      this.manuallyStoppedWorkers.delete(Number(worker.id));
    });

    cluster.on("message", (worker, message) => {
      if (message?.type === "listening" && worker?.id && message?.port) {
        console.log(
          `Saving port entry for worker with PID '${worker.process.pid}' and port no. '${message.port}'`,
        );

        this.workers.set(worker.id, {
          state: "ready",
          id: worker.id,
          weight: worker.id,
          url: `http://localhost:${message.port}`,
        });
      }
    });

    this.monitorSystemLoad();
  }

  getRandomPort(min = 3000, max = 65000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async startWorker() {
    // Initialize thread pool in each worker process
    this.threadPool = new CPUIntensiveProcessor({
      maxWorkers: this.threadPoolSize,
    });

    await this.threadPool.initialize();

    // Initializing Redis connection
    this.taskQueue = new RedisTaskQueue();
    this.listenToRedisQueue();
    // ====================================

    process.on("SIGINT", async () => await this.gracefullyShutdown("SIGINT"));
    process.on("SIGTERM", async () => await this.gracefullyShutdown("SIGTERM"));

    process.on(
      "message",
      async (req, res) => await this.handleRequest(req, res),
    );

    // Create HTTP server in worker process
    const port = this.getRandomPort();

    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.timeout = GENERAL_TIMEOUT;

    server.listen(port, () => {
      console.log(
        `Worker with PID '${process.pid}' is listening on port: ${port}`,
      );

      if (process.send) {
        process.send({
          port: port,
          type: "listening",
        });
      }
    });
  }

  async listenToRedisQueue() {
    while (true) {
      try {
        const task = await this.taskQueue.dequeueBlocking();

        if (!task) continue;

        console.log(
          `[Redis Queue - Worker PID '${process.pid}'] Received task: ${task.taskType}`,
        );

        this.threadPool
          .processTask(task.taskType, task.data, {
            timeout: task.timeout || GENERAL_TIMEOUT,
          })
          .then((result) => {
            console.log(
              `[Redis Queue - Worker PID '${process.pid}'] Task complete:`,
              result,
            );
          })
          .catch((err) => {
            console.error(
              `[Redis Queue - Worker PID '${process.pid}'] Task failed:`,
              err.message,
            );
          });
      } catch (err) {
        console.error(
          `[Redis Queue - Worker PID '${process.pid}'] Error:`,
          err.message,
        );
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  async gracefullyShutdown(signal) {
    console.log(`Worker ${process.pid} received ${signal}, shutting down...`);

    await this.threadPool.shutdown();
    process.exit(0);
  }

  getPathName(url) {
    const validPaths = ["/process-image", "/analyze-data", "/health"];

    if (!validPaths.includes(url.pathname)) {
      const index = Math.floor(Math.random() * validPaths.length);
      url.pathname = validPaths[index];
    }
  }

  async handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    this.getPathName(url);

    try {
      switch (url.pathname) {
        case "/process-image":
          await this.handleImageProcessing(req, res);
          break;

        case "/analyze-data":
          await this.handleDataAnalysis(req, res);
          break;

        case "/health":
          this.handleHealthCheck(req, res);
          break;

        default:
          this.handleDefault(req, res);
      }
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async handleImageProcessing(req, res) {
    console.log(`Starting to handle image processing`);

    const imageData = {
      width: 1920,
      height: 1080,
      filters: ["blur", "sharpen", "contrast"],
    };

    const result = await this.threadPool.processTask(
      "imageProcessing",
      imageData,
      {
        timeout: GENERAL_TIMEOUT,
      },
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        result,
        processedBy: {
          pid: process.pid,
          workerId: cluster?.worker?.id ?? "master",
        },
      }),
    );
  }

  async handleDataAnalysis(req, res) {
    console.log(`Starting to handle data analysis`);

    const dataset = Array.from({ length: 100000 }, () => Math.random() * 1000);
    const analysisData = {
      dataset,
      algorithms: ["mean", "variance", "correlation", "regression"],
    };

    const result = await this.threadPool.processTask(
      "dataAnalysis",
      analysisData,
      {
        timeout: GENERAL_TIMEOUT,
      },
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        result,
        datasetSize: dataset.length,
        processedBy: {
          pid: process.pid,
          workerId: cluster?.worker?.id ?? "master",
        },
      }),
    );
  }

  handleHealthCheck(req, res) {
    console.log(`Starting to handle health check`);

    const stats = this.threadPool.getStats();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "healthy",
        process: {
          pid: process.pid,
          workerId: cluster?.worker?.id ?? "master",
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
        threadPool: stats,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  handleDefault(req, res) {
    console.log(`Starting to handle default req`);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Hybrid Scaling System",
        endpoints: ["/process-image", "/analyze-data", "/health"],
        processedBy: {
          pid: process.pid,
          workerId: cluster?.worker?.id ?? "master",
        },
      }),
    );
  }

  handleError(res, error) {
    console.error("Request error:", error.message);

    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: error.message,
        processedBy: {
          pid: process.pid,
          workerId: cluster?.worker?.id ?? "master",
        },
      }),
    );
  }

  monitorSystemLoad() {
    setInterval(async () => {
      const cpuUsage = await this.getCPUUsage();
      const memoryUsage = this.getMemoryUsage();
      const actualNoWorkers = Object.keys(cluster.workers).length;

      console.log(
        `[AUTO-SCALING] Avg CPU usage: ${cpuUsage.toFixed(1)}% | Memory usage: ${memoryUsage.percent.toFixed(1)}% | Workers: ${actualNoWorkers}`,
      );

      const shouldScaleUp =
        cpuUsage > 70 &&
        memoryUsage.percent < 75 &&
        actualNoWorkers < this.maxClusterSize;

      const shouldScaleDown = cpuUsage < 30 || memoryUsage.percent > 85;

      if (shouldScaleUp) {
        console.log(`[AUTO-SCALING] High load detected. Adding worker...`);
        cluster.fork();
      } else if (shouldScaleDown) {
        this.idleCount++;

        if (this.idleCount >= 3 && actualNoWorkers > this.minClusterSize) {
          // Escalado hacia abajo (suave)
          const [idToKill] = Object.keys(cluster.workers);

          console.log(
            `[AUTO-SCALING] Low load for a while. Killing worker ${idToKill}...`,
          );

          this.manuallyStoppedWorkers.add(Number(idToKill));
          cluster.workers[idToKill].kill();

          this.idleCount = 0;
        }
      } else {
        this.idleCount = 0;
      }
    }, this.scaleCheckInterval);
  }

  getCPUUsage() {
    return new Promise((resolve) => {
      /*
      cpus is an array of objects like the following:
      [{
          model: 'Intel(R) Core(TM) M-5Y31 CPU @ 0.90GHz',
          speed: 1100,
          times: { user: 1351820, nice: 0, sys: 629840, idle: 3229670, irq: 0 }
      }]

      Each entry represents a CPU core, with a times object showing how much time (in milliseconds)
        the core has spent in each activity state since the system booted:
          user: running user applications
          sys: running system (kernel) code
          nice: running low-priority user processes
          irq: handling hardware interrupts
          idle: not doing any work
      */

      const cpus1 = os.cpus();

      setTimeout(() => {
        const cpus2 = os.cpus();

        let totalUsage = 0;

        for (let i = 0; i < cpus1.length; i++) {
          const cpu1 = cpus1[i];
          const cpu2 = cpus2[i];

          const idle1 = cpu1.times.idle;
          const idle2 = cpu2.times.idle;

          const total1 = Object.values(cpu1.times).reduce((a, b) => a + b);
          const total2 = Object.values(cpu2.times).reduce((a, b) => a + b);

          const idleDiff = idle2 - idle1;
          const totalDiff = total2 - total1;

          const usage = 100 - (100 * idleDiff) / totalDiff;
          totalUsage += usage;
        }

        resolve(totalUsage / cpus1.length);
      }, 1000);
    });
  }

  getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;

    return {
      used: used,
      total: total,
      percent: (used / total) * 100,
    };
  }
}

// Start the hybrid system
new HybridScalingSystem({
  clusterSize: 2,
  threadPoolSize: 2,
  port: 3000,
});
