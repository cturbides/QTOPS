/*
  * Ejercicio: Extiende este sistema para incluir stream multiplexing donde un
    source stream puede ser processed por multiple parallel pipelines.
*/

const {
  pipeline,
  Transform,
  Readable,
  Writable,
  PassThrough,
} = require("stream");
const { promisify } = require("util");
const EventEmitter = require("events");
const crypto = require("crypto");

/*
 * FlowController implementation
 */

class FlowController {
  constructor(options = {}) {
    this.maxConcurrency = options.maxConcurrency || 5;
    this.bufferSize = options.bufferSize || 100;
    this.rateLimit = options.rateLimit || 10; // items per second
    this.circuitBreakerThreshold = options.circuitBreakerThreshold || 5;

    this.activeStreams = 0;
    this.buffer = [];
    this.lastProcessTime = Date.now();
    this.failureCount = 0;
    this.circuitOpen = false;
  }

  async processWithFlowControl(chunk, processor) {
    try {
      // Check circuit breaker
      if (this.circuitOpen) {
        callback(new Error("Circuit breaker is open"));
        return;
      }

      // Rate limiting
      await this.enforceRateLimit();

      // Concurrency control
      await this.waitForCapacity();

      this.activeStreams++;

      // Process chunk
      const result = await processor(chunk);

      this.failureCount = 0; // Reset on success

      return result;
    } catch (error) {
      this.failureCount++;

      // Circuit breaker logic
      if (this.failureCount >= this.circuitBreakerThreshold) {
        this.circuitOpen = true;
        setTimeout(() => {
          this.circuitOpen = false;
          this.failureCount = 0;
        }, 30000); // 30 second circuit breaker
      }

      throw error;
    } finally {
      this.activeStreams--;
    }
  }

  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastProcess = now - this.lastProcessTime;
    const minInterval = 1000 / this.rateLimit;

    if (timeSinceLastProcess < minInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, minInterval - timeSinceLastProcess),
      );
    }

    this.lastProcessTime = Date.now();
  }

  async waitForCapacity() {
    while (this.activeStreams >= this.maxConcurrency) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  getMetrics() {
    return {
      activeStreams: this.activeStreams,
      bufferLength: this.buffer.length,
      circuitOpen: this.circuitOpen,
      failureCount: this.failureCount,
    };
  }
}

// ========================================================================

class StreamProcessingSystem extends EventEmitter {
  constructor(options = {}) {
    super();
    this.flowController = new FlowController(options.flowControl || {});
    this.metrics = {
      totalProcessed: 0,
      totalErrors: 0,
      avgProcessingTime: 0,
      backpressureEvents: 0,
      startTime: Date.now(),
    };
  }

  async processDataStream(source, transformations, destinations) {
    const pipelineAsync = promisify(pipeline);

    try {
      // Create passThrough to duplicate source stream
      const mainDuplicator = this.createPassThroughStream();
      source.pipe(mainDuplicator);

      // Create a whole stream's pipelines for each destination
      const variations = destinations.map(async (destination) => {
        const sourceCopy = this.createPassThroughStream();
        mainDuplicator.pipe(sourceCopy);

        const streams = [sourceCopy];

        for (const transformation of transformations) {
          const transformStream = this.createTransformStream(transformation);
          streams.push(transformStream);
        }

        streams.push(destination);

        await pipelineAsync(...streams);
      });

      await Promise.all(variations);

      this.emit("processingComplete", this.getMetrics());
    } catch (error) {
      this.emit("processingError", error);
      throw error;
    }
  }

  createPassThroughStream() {
    return new PassThrough({
      objectMode: true,
    });
  }

  createTransformStream(transformation) {
    return new Transform({
      objectMode: true,
      transform: async (chunk, encoding, callback) => {
        const startTime = Date.now();

        try {
          const result = await this.flowController.processWithFlowControl(
            chunk,
            transformation,
          );

          const processingTime = Date.now() - startTime;
          this.updateMetrics(processingTime, true);

          callback(null, result);
        } catch (error) {
          const processingTime = Date.now() - startTime;
          this.updateMetrics(processingTime, false);

          this.emit("transformationError", { error, chunk });
          callback(error);
        }
      },
    });
  }

  updateMetrics(processingTime, success) {
    if (success) {
      this.metrics.totalProcessed++;
    } else {
      this.metrics.totalErrors++;
    }

    // Exponential moving average
    const alpha = 0.1;
    this.metrics.avgProcessingTime =
      alpha * processingTime + (1 - alpha) * this.metrics.avgProcessingTime;
  }

  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const flowMetrics = this.flowController.getMetrics();

    return {
      ...this.metrics,
      uptime,
      throughput: this.metrics.totalProcessed / (uptime / 1000),
      errorRate:
        this.metrics.totalErrors /
        (this.metrics.totalProcessed + this.metrics.totalErrors),
      flowControl: flowMetrics,
    };
  }
}

// Data source con configurable rate (Readable -> Productor)
class ConfigurableDataSource extends Readable {
  constructor(options = {}) {
    super({ objectMode: true });
    this.recordCount = options.recordCount || 1000;
    this.productionRate = options.productionRate || 10; // ms between records
    this.currentRecord = 0;
  }

  _read() {
    if (this.currentRecord < this.recordCount) {
      const record = {
        id: this.currentRecord++,
        data: `Record ${this.currentRecord}`,
        timestamp: new Date().toISOString(),
        size: Math.floor(Math.random() * 1000) + 100,
      };

      setTimeout(() => {
        this.push(record);
      }, this.productionRate);
    } else {
      this.push(null);
    }
  }
}

// Data destination con metrics
class MetricsDataSink extends Writable {
  constructor(options = {}) {
    super({ objectMode: true });
    this.processedRecords = [];
    this.processingTime = options.processingTime || 50;
  }

  _write(chunk, encoding, callback) {
    setTimeout(() => {
      this.processedRecords.push({
        ...chunk,
        processedAt: new Date().toISOString(),
      });

      callback();
    }, this.processingTime);
  }

  _final(callback) {
    console.log(`Data sink processed ${this.processedRecords.length} records`);
    callback();
  }

  getProcessedData() {
    return this.processedRecords;
  }
}

class HashDataSink extends Writable {
  constructor(options = {}) {
    super({ objectMode: true });
    this.processedRecords = [];
    this.processingTime = options.processingTime || 50;
  }

  _write(chunk, encoding, callback) {
    setTimeout(() => {
      this.processedRecords.push({
        ...chunk,
        hash: crypto
          .createHash("sha512")
          .update(
            typeof chunk === "object"
              ? JSON.stringify(chunk).toString(16)
              : chunk.toString(16),
          )
          .digest("hex"),
      });

      callback();
    }, this.processingTime);
  }

  _final(callback) {
    console.log(
      `Data hashed processed ${this.processedRecords.length} records`,
    );
    callback();
  }

  getProcessedData() {
    return this.processedRecords;
  }
}

// Demonstration del sistema
async function demonstrateStreamProcessing() {
  const system = new StreamProcessingSystem({
    flowControl: {
      rateLimit: 20,
      maxConcurrency: 3,
      circuitBreakerThreshold: 3,
    },
  });

  // Event listeners
  system.on("processingComplete", (metrics) => {
    console.log("Processing completed:", metrics);
  });

  system.on("processingError", (error) => {
    console.error("Processing error:", error.message);
  });

  system.on("transformationError", ({ error, chunk }) => {
    console.error(`Transformation error for chunk ${chunk.id}:`, error.message);
  });

  // Create data source
  const source = new ConfigurableDataSource({
    recordCount: 100,
    productionRate: 5,
  });

  // Define transformations
  const transformations = [
    // Data validation
    async (record) => {
      if (!record.data || record.size < 0) {
        throw new Error("Invalid record format");
      }

      return { ...record, validated: true };
    },

    // Data enrichment
    async (record) => {
      // Simulate external API call
      await new Promise((resolve) => setTimeout(resolve, 20));

      return {
        ...record,
        enriched: true,
        category: record.size > 500 ? "large" : "small",
        hash: record.data.length.toString(16),
      };
    },

    // Data formatting
    async (record) => {
      return {
        id: record.id,
        formattedData: record.data.toUpperCase(),
        metadata: {
          size: record.size,
          category: record.category,
          hash: record.hash,
          processedAt: new Date().toISOString(),
        },
      };
    },
  ];

  const metricsDataSink = new MetricsDataSink({
    processingTime: 30,
  });

  const hashDataSink = new HashDataSink({
    processingTime: 300,
  });

  const destinations = [metricsDataSink, hashDataSink];

  // Process data stream
  try {
    // Producer, tranformations, consumer
    await system.processDataStream(source, transformations, destinations);

    console.log("Final metrics:", system.getMetrics());
    console.log(
      "Metrics data records sample:",
      metricsDataSink.getProcessedData().slice(0, 3),
    );
    console.log(
      "Hash data records sample:",
      hashDataSink.getProcessedData().slice(0, 3),
    );
  } catch (error) {
    console.error("Stream processing failed:", error.message);
  }
}

demonstrateStreamProcessing();
