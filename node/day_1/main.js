/*
  * Ejercicio: Extiende este sistema para incluir task persistence y recovery mechanisms
    para handling de application restarts.
    Al finalizar, compartir enlace del repositorio de la solución
*/

// Sistema de procesamiento asíncrono optimizado
const EventEmitter = require("events");
const { performance } = require("perf_hooks");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

// ConcurrencyManager & CircuitBreaker
class ConcurrencyManager {
  constructor(maxConcurrent = 10, queueLimit = 1000) {
    this.maxConcurrent = maxConcurrent;
    this.queueLimit = queueLimit;
    this.running = 0;
    this.queue = [];
    this.metrics = {
      completed: 0,
      failed: 0,
      queued: 0,
      avgProcessingTime: 0,
    };
  }

  async execute(asyncOperation, priority = 0) {
    return new Promise((resolve, reject) => {
      // Check queue limits para backpressure
      if (this.queue.length >= this.queueLimit) {
        reject(new Error("Queue limit exceeded - backpressure detected"));
        return;
      }

      const task = {
        operation: asyncOperation,
        resolve,
        reject,
        priority,
        queuedAt: Date.now(),
      };

      // Priority queue insertion
      this.insertByPriority(task);
      this.metrics.queued++;

      this.processQueue();
    });
  }

  insertByPriority(task) {
    let inserted = false;
    for (let i = 0; i < this.queue.length; i++) {
      if (task.priority > this.queue[i].priority) {
        this.queue.splice(i, 0, task);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.queue.push(task);
    }
  }

  async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();
    this.metrics.queued--;

    const startTime = Date.now();

    try {
      const result = await task.operation();

      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime, true);

      task.resolve(result);
    } catch (error) {
      this.updateMetrics(Date.now() - startTime, false);
      task.reject(error);
    } finally {
      this.running--;

      // Continue processing queue
      setImmediate(() => this.processQueue());
    }
  }

  updateMetrics(processingTime, success) {
    if (success) {
      this.metrics.completed++;
    } else {
      this.metrics.failed++;
    }

    // Exponential moving average for processing time
    const alpha = 0.1;
    this.metrics.avgProcessingTime =
      alpha * processingTime + (1 - alpha) * this.metrics.avgProcessingTime;
  }

  getMetrics() {
    return {
      ...this.metrics,
      running: this.running,
      queued: this.queue.length,
      successRate:
        this.metrics.completed / (this.metrics.completed + this.metrics.failed),
    };
  }
}

class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000, monitoringPeriod = 10000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.monitoringPeriod = monitoringPeriod;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(operation) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "HALF_OPEN";
        this.successCount = 0;
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;

    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = "CLOSED";
      }
    }
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = "OPEN";
    }
  }
}
// ====================================================================================

/*
 * Task persistence
 */
class TaskPersistor {
  constructor(options = {}) {
    this.persistencePath = options.path || path.join(__dirname, "tasks.csv");
  }

  async saveTask(task) {
    const sanitizedData = JSON.stringify(task.taskData)
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,");

    const line = `\n${task.taskId},${task.priority},${sanitizedData}`;

    try {
      await fs.appendFile(this.persistencePath, line, "utf8");
    } catch (error) {
      console.error(
        `Error writing task '${task.taskId}' to ${this.persistencePath}:`,
        error,
      );
      throw error;
    }
  }

  async deleteTask(task) {
    try {
      const data = await fs.readFile(this.persistencePath, "utf8");
      const lines = data.split("\n");

      const filteredLines = lines.filter((line) => {
        const [id] = line.split(",");
        return id && id.trim() !== task.taskId;
      });

      const updatedContent = filteredLines.join("\n");

      await fs.writeFile(this.persistencePath, updatedContent, "utf8");
    } catch (error) {
      console.error(`Error deleting task ${task.taskId}:`, error);
      throw error;
    }
  }

  async getTasks() {
    try {
      const data = await fs.readFile(this.persistencePath, "utf8");

      return data
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [taskId, priority, ...rest] = line.split(",");

          // Restaurar comas escapadas y saltos de línea
          const rawData = rest
            .join(",")
            .replace(/\\,/g, ",")
            .replace(/\\n/g, "\n");

          return {
            taskId: taskId.trim(),
            priority: Number(priority),
            taskData: JSON.parse(rawData.trim()),
          };
        });
    } catch (error) {
      if (error.code === "ENOENT") {
        // Archivo aún no existe
        return [];
      }
      console.error("Error reading tasks:", error);
      throw error;
    }
  }
}

// ====================================================================================

// Main System
class AsyncProcessingSystem extends EventEmitter {
  constructor(options = {}) {
    super();
    this.concurrencyManager = new ConcurrencyManager(
      options.maxConcurrent || 10,
      options.queueLimit || 1000,
    );
    this.taskPersistor = new TaskPersistor();
    this.circuitBreaker = new CircuitBreaker();
    this.isProcessing = false;
    this.metrics = {
      totalProcessed: 0,
      totalErrors: 0,
      avgLatency: 0,
      startTime: Date.now(),
    };
  }

  async processTask(taskData, priority = 0, id = undefined, isSaved = false) {
    const taskId = id || `task_${crypto.randomUUID()}`;

    this.emit("taskQueued", { taskId, taskData, priority, isSaved });

    try {
      const result = await this.concurrencyManager.execute(
        () => this.executeTask(taskId, taskData),
        priority,
      );

      this.emit("taskCompleted", { taskId, result });
      return result;
    } catch (error) {
      this.emit("taskFailed", { taskId, error: error.message });
      throw error;
    }
  }

  async executeTask(taskId, taskData) {
    const startTime = performance.now();

    try {
      // Simulate external API call con circuit breaker
      const result = await this.circuitBreaker.execute(async () => {
        // Simulate variable processing time
        const processingTime = Math.random() * 1000 + 500;
        await new Promise((resolve) => setTimeout(resolve, processingTime));

        // Simulate occasional failures
        if (Math.random() < 0.1) {
          throw new Error("External service error");
        }

        return {
          taskId,
          processedData: `Processed: ${JSON.stringify(taskData)}`,
          timestamp: new Date().toISOString(),
        };
      });

      const latency = performance.now() - startTime;
      this.updateMetrics(latency, true);

      return result;
    } catch (error) {
      const latency = performance.now() - startTime;
      this.updateMetrics(latency, false);
      throw error;
    }
  }

  updateMetrics(latency, success) {
    if (success) {
      this.metrics.totalProcessed++;
    } else {
      this.metrics.totalErrors++;
    }

    // Exponential moving average
    const alpha = 0.1;
    this.metrics.avgLatency =
      alpha * latency + (1 - alpha) * this.metrics.avgLatency;
  }

  getSystemMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const concurrencyMetrics = this.concurrencyManager.getMetrics();

    return {
      uptime,
      throughput: this.metrics.totalProcessed / (uptime / 1000),
      errorRate:
        this.metrics.totalErrors /
        (this.metrics.totalProcessed + this.metrics.totalErrors),
      avgLatency: this.metrics.avgLatency,
      concurrency: concurrencyMetrics,
      circuitBreakerState: this.circuitBreaker.state,
    };
  }

  startMetricsReporting(interval = 5000) {
    setInterval(() => {
      const metrics = this.getSystemMetrics();
      this.emit("metricsReport", metrics);
      console.log("System Metrics:", JSON.stringify(metrics, null, 2));
    }, interval);
  }

  saveTask(task) {
    setImmediate(() =>
      this.taskPersistor
        .saveTask(task)
        .then(() => this.emit("taskSaved", { ...task }))
        .catch((err) => console.log(`Error saving task ${task.taskId}`, err)),
    );
  }

  deleteTask(task) {
    setImmediate(() =>
      this.taskPersistor
        .deleteTask(task)
        .then(() => this.emit("taskDeleted", { ...task }))
        .catch((err) => console.log(`Error deleting task ${task.taskId}`, err)),
    );
  }

  enqueueSavedTasks(interval = 5000) {
    setInterval(async () => {
      try {
        const savedTasks = await this.taskPersistor.getTasks();

        savedTasks.forEach((task) => {
          this.processTask(
            task.taskData,
            task.priority,
            task.taskId,
            true,
          ).catch((err) => {
            console.error(
              `Error during recovered task execution (${task.taskId}):`,
              err.message,
            );
          });
        });
      } catch (error) {
        console.error("Error loading saved tasks:", error);
      }
    }, interval);
  }
}

// Demonstration del sistema
async function demonstrateAsyncProcessing() {
  const processor = new AsyncProcessingSystem({
    maxConcurrent: 5,
    queueLimit: 100,
  });

  // Event listeners
  processor.on("taskQueued", ({ taskId, taskData, priority, isSaved }) => {
    console.log(
      `Task queued: ${taskId} (priority: ${priority}) is saved? ${isSaved}`,
    );

    if (!isSaved) {
      processor.saveTask({ taskId, priority, taskData });
    }
  });

  processor.on("taskCompleted", ({ taskId }) => {
    console.log(`Task completed: ${taskId}`);
    processor.deleteTask({ taskId });
  });

  processor.on("taskFailed", ({ taskId, error }) => {
    console.log(`Task failed: ${taskId} - ${error}`);
    processor.deleteTask({ taskId });
  });

  processor.on("taskSaved", ({ taskId }) => {
    console.log(`Task saved: ${taskId}`);
  });

  processor.on("taskDeleted", ({ taskId }) => {
    console.log(`Task deleted: ${taskId}`);
  });

  // Start metrics reporting
  processor.startMetricsReporting(3000);

  // Enqueue saved tasks (Recovery Mechanism)
  processor.enqueueSavedTasks();

  // Process multiple tasks con different priorities
  const tasks = [];
  for (let i = 0; i < 20; i++) {
    const priority = Math.floor(Math.random() * 3);
    const taskData = { id: i, data: `Task data ${i}` };

    tasks.push(
      processor
        .processTask(taskData, priority)
        .catch((error) => console.error(`Task ${i} failed:`, error.message)),
    );

    // Add some delay to simulate real-world task arrival
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Wait for all tasks to complete
  await Promise.allSettled(tasks);

  console.log("Final metrics:", processor.getSystemMetrics());
}

demonstrateAsyncProcessing();
