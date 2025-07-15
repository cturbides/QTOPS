// Sistema completo de file management enterprise
//
// Exercise: Extiende este sistema para incluir file compression, encryption, y distributed file synchronization across multiple nodes.
//

const syncFs = require("fs");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const stream = require("stream");
const EventEmitter = require("events");
const zlib = require("zlib");
const { promisify } = require("util");

// Added utility classes
class CrossPlatformPathManager {
  static RESERVED_NAMES = new Set([
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ]);

  static MAX_PATH_LENGTH = process.platform === "win32" ? 260 : 4096; // chars
  static INVALID_CHARS = /[<>:"|?*\x00-\x1f]/g;

  static validateFilename(filename) {
    // Check for empty or whitespace-only names
    if (!filename || !filename.trim()) {
      throw new Error("Filename cannot be empty");
    }

    // Check for invalid characters
    if (this.INVALID_CHARS.test(filename)) {
      throw new Error("Filename contains invalid characters");
    }

    // Check for reserved names (Windows)
    const baseName = path
      .basename(filename, path.extname(filename))
      .toUpperCase();
    if (this.RESERVED_NAMES.has(baseName)) {
      throw new Error(`Filename '${filename}' is reserved on Windows`);
    }

    // Check length
    if (filename.length > 255) {
      throw new Error("Filename too long");
    }

    return filename;
  }

  buildSafePath(...segments) {
    // Validate each segment
    const validatedSegments = segments.map((segment) => {
      if (typeof segment !== "string") {
        throw new Error("Path segments must be strings");
      }

      // Normalize and validate
      const normalized = path.normalize(segment);

      // Check for path traversal attempts
      if (normalized.includes("..")) {
        throw new Error("Path traversal not allowed");
      }

      return normalized;
    });

    // Build cross-platform path
    const fullPath = path.join(...validatedSegments);

    // Check total path length
    if (fullPath.length > this.MAX_PATH_LENGTH) {
      throw new Error(
        `Path too long: ${fullPath.length} > ${this.MAX_PATH_LENGTH}`,
      );
    }

    return fullPath;
  }

  static getPathInfo(filePath) {
    const normalized = path.normalize(filePath);

    return {
      directory: path.dirname(normalized),
      filename: path.basename(normalized),
      extension: path.extname(normalized),
      nameWithoutExtension: path.basename(normalized, path.extname(normalized)),
      isAbsolute: path.isAbsolute(normalized),
      segments: normalized.split(path.sep).filter(Boolean),
    };
  }

  static relativePath(from, to) {
    // Calculate relative path between two absolute paths
    const fromNormalized = path.resolve(from);
    const toNormalized = path.resolve(to);

    return path.relative(fromNormalized, toNormalized);
  }
}

class RobustFileWatcher extends EventEmitter {
  constructor(options = {}) {
    super();
    this.watchers = new Map();
    this.debounceTimers = new Map();
    this.options = {
      debounceMs: options.debounceMs || 100,
      maxRetries: options.maxRetries || 3,
      retryDelayMs: options.retryDelayMs || 1000,
      ...options,
    };
  }

  async watchPath(targetPath, options = {}) {
    const resolvedPath = path.resolve(targetPath);

    // Validate path exists
    try {
      const stats = await fs.stat(resolvedPath);

      if (stats.isDirectory()) {
        return this.watchDirectory(resolvedPath, options);
      } else {
        return this.watchFile(resolvedPath, options);
      }
    } catch (error) {
      throw new Error(`Cannot watch path ${resolvedPath}: ${error.message}`);
    }
  }

  watchFile(filePath, options = {}) {
    if (this.watchers.has(filePath)) {
      return; // Already watching
    }

    const watchOptions = {
      persistent: options.persistent !== false,
      recursive: false,
      encoding: "utf8",
    };

    try {
      const watcher = syncFs.watch(
        filePath,
        watchOptions,
        (eventType, filename) => {
          this.handleFileEvent(filePath, eventType, filename);
        },
      );

      watcher.on("error", (error) => {
        this.handleWatchError(filePath, error);
      });

      this.watchers.set(filePath, {
        watcher,
        type: "file",
        retryCount: 0,
      });

      this.emit("watchStarted", { path: filePath, type: "file" });
    } catch (error) {
      this.emit("watchError", { path: filePath, error });
    }
  }

  watchDirectory(dirPath, options = {}) {
    if (this.watchers.has(dirPath)) {
      return; // Already watching
    }

    const watchOptions = {
      persistent: options.persistent !== false,
      recursive: options.recursive !== false,
      encoding: "utf8",
    };

    try {
      const watcher = syncFs.watch(
        dirPath,
        watchOptions,
        (eventType, filename) => {
          if (filename) {
            const fullPath = path.join(dirPath, filename);
            this.handleFileEvent(fullPath, eventType, filename);
          }
        },
      );

      watcher.on("error", (error) => {
        this.handleWatchError(dirPath, error);
      });

      this.watchers.set(dirPath, {
        watcher,
        type: "directory",
        retryCount: 0,
        recursive: watchOptions.recursive,
      });

      this.emit("watchStarted", { path: dirPath, type: "directory" });
    } catch (error) {
      this.emit("watchError", { path: dirPath, error });
    }
  }

  handleFileEvent(filePath, eventType, filename) {
    // Debounce rapid events
    const debounceKey = `${filePath}:${eventType}`;

    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey));
    }

    const timer = setTimeout(async () => {
      this.debounceTimers.delete(debounceKey);

      try {
        // Verify file still exists for certain events
        if (eventType === "change") {
          await fs.access(filePath);
        }

        this.emit("fileChanged", {
          path: filePath,
          eventType,
          filename,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // File may have been deleted
        this.emit("fileDeleted", {
          path: filePath,
          filename,
          timestamp: new Date().toISOString(),
        });
      }
    }, this.options.debounceMs);

    this.debounceTimers.set(debounceKey, timer);
  }

  handleWatchError(watchPath, error) {
    const watchInfo = this.watchers.get(watchPath);

    if (!watchInfo) {
      return;
    }

    this.emit("watchError", { path: watchPath, error });

    // Attempt to restart watcher
    if (watchInfo.retryCount < this.options.maxRetries) {
      watchInfo.retryCount++;

      setTimeout(() => {
        this.restartWatcher(watchPath);
      }, this.options.retryDelayMs * watchInfo.retryCount);
    } else {
      this.emit("watchFailed", {
        path: watchPath,
        error: new Error(`Max retries exceeded for ${watchPath}`),
      });
    }
  }

  async restartWatcher(watchPath) {
    // Stop existing watcher
    this.stopWatching(watchPath);

    try {
      // Restart based on type
      const stats = await fs.stat(watchPath);

      if (stats.isDirectory()) {
        this.watchDirectory(watchPath);
      } else {
        this.watchFile(watchPath);
      }

      this.emit("watchRestarted", { path: watchPath });
    } catch (error) {
      this.emit("watchRestartFailed", { path: watchPath, error });
    }
  }

  stopWatching(watchPath) {
    const watchInfo = this.watchers.get(watchPath);

    if (watchInfo) {
      watchInfo.watcher.close();
      this.watchers.delete(watchPath);

      // Clear any pending debounce timers
      for (const [key, timer] of this.debounceTimers.entries()) {
        if (key.startsWith(watchPath)) {
          clearTimeout(timer);
          this.debounceTimers.delete(key);
        }
      }

      this.emit("watchStopped", { path: watchPath });
    }
  }

  stopAll() {
    for (const watchPath of this.watchers.keys()) {
      this.stopWatching(watchPath);
    }
  }

  getWatchedPaths() {
    return Array.from(this.watchers.keys()).map((path) => ({
      path,
      ...this.watchers.get(path),
    }));
  }
}
// ========================================================================
// ========================================================================
//
// File Compression utility

class FileCompressionManager {
  // Reference: https://nodejs.org/api/zlib.html#class-zlibbrotlicompress --> Faster write, slower read. Great for distributed networks
  //            https://nodejs.org/api/zlib.html#class-zlibgzip ---> Better for JSON files (or logs). Use deflate behind the scene
  //            https://nodejs.org/api/zlib.html#class-zlibdeflate --> Better for network-related files/info
  static COMPRESSION_ALGORITHMS = {
    GZIP: {
      name: "GZIP",
      compressor: () => zlib.createGzip(),
      decompressor: () => zlib.createGunzip(),
    },
    DEFLATE: {
      name: "DEFLATE",
      compressor: () => zlib.createDeflate(),
      decompressor: () => zlib.createInflate(),
    },
    BROTLI: {
      name: "BROTLI",
      compressor: () => zlib.createBrotliCompress(),
      decompressor: () => zlib.createBrotliDecompress(),
    },
  };

  constructor(options = {}) {
    this.algorithm =
      options.algorithm ??
      FileCompressionManager.COMPRESSION_ALGORITHMS.GZIP.name;
  }

  async calculateChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const inputStream = syncFs.createReadStream(filePath);

      inputStream.on("data", (chunk) => {
        hash.update(chunk);
      });

      inputStream.on("end", () => {
        resolve(hash.digest("hex"));
      });

      inputStream.on("error", (err) => {
        reject(err);
      });
    });
  }

  async verifyCompressionIntegrity(originalFilePath, compressFilePath) {
    const tempUncompressedPath = `${compressFilePath}.tmp.decompressed`;

    try {
      const input = syncFs.createReadStream(compressFilePath);
      const output = syncFs.createWriteStream(tempUncompressedPath);

      const decompressor =
        FileCompressionManager.COMPRESSION_ALGORITHMS[
          this.algorithm
        ].decompressor();

      if (!decompressor) {
        throw new Error("Invalid decompressor for algorithm: ", this.algorithm);
      }

      await stream.promises.pipeline(input, decompressor, output);

      const originalChecksum = await this.calculateChecksum(originalFilePath);
      const decompressedChecksum =
        await this.calculateChecksum(tempUncompressedPath);

      if (originalChecksum !== decompressedChecksum) {
        throw new Error(
          "Compression integrity check failed: checksums do not match",
        );
      }
    } finally {
      try {
        await fs.unlink(tempUncompressedPath);
      } catch (e) {
        throw e;
      }
    }
  }

  async compressFile(originalFilePath, compressFilePath) {
    if (
      !Object.keys(FileCompressionManager.COMPRESSION_ALGORITHMS).includes(
        this.algorithm,
      )
    ) {
      throw new Error("Invalid compression algorithm: ", this.algorithm);
    }

    const compressor =
      FileCompressionManager.COMPRESSION_ALGORITHMS[
        this.algorithm
      ].compressor();

    if (!compressor) {
      throw new Error("Invalid compressor for algorithm: ", this.algorithm);
    }

    const tempBackupPath = `${compressFilePath}.backup`;

    try {
      const inputStream = syncFs.createReadStream(originalFilePath);
      const outputStream = syncFs.createWriteStream(tempBackupPath);

      await stream.promises.pipeline(inputStream, compressor, outputStream);

      await this.verifyCompressionIntegrity(originalFilePath, tempBackupPath);

      await fs.rename(tempBackupPath, `${compressFilePath}`);
    } catch (err) {
      console.error(`Compression failed with algorithm: '${this.algorithm}'`);

      try {
        await fs.unlink(tempBackupPath);
      } catch (cleanupError) {
        console.warn(`Cleanup failed: ${cleanupError.message}`);
      }

      throw err;
    }
  }

  async decompressFile(originalFilePath) {
    if (
      !Object.keys(FileCompressionManager.COMPRESSION_ALGORITHMS).includes(
        this.algorithm,
      )
    ) {
      throw new Error("Invalid compression algorithm: ", this.algorithm);
    }

    const decompressor =
      FileCompressionManager.COMPRESSION_ALGORITHMS[
        this.algorithm
      ].decompressor();

    if (!decompressor) {
      throw new Error("Invalid decompressor for algorithm: ", this.algorithm);
    }

    try {
      const inputStream = syncFs.createReadStream(originalFilePath);
      const dataChunks = [];

      inputStream.pipe(decompressor);

      for await (const chunk of decompressor) {
        dataChunks.push(chunk);
      }

      return Buffer.concat(dataChunks);
    } catch (err) {
      console.log(
        `Decompression failed with algorithm: '${this.algorithm}', and path: '${originalFilePath}'`,
      );
      throw err;
    }
  }
}

// ========================================================================
//
// Encryption class utility
//
class FileEncryptionManager {
  static ENCRYPTION_ALGORITHMS = {
    AES_256_CBC: "aes-256-cbc",
    AES_256_ECB: "aes-256-ecb",
    AES_256_CTR: "aes-256-ctr",
  };

  constructor(secretKey, options = {}) {
    const normalizedKey = crypto
      .createHash("sha256")
      .update(secretKey)
      .digest();

    this.key = normalizedKey;
    this.algorithm =
      options.algorithm ||
      FileEncryptionManager.ENCRYPTION_ALGORITHMS.AES_256_CBC;

    if (
      !Object.values(FileEncryptionManager.ENCRYPTION_ALGORITHMS).includes(
        this.algorithm,
      )
    ) {
      throw new Error(`Unsupported encryption algorithm: ${this.algorithm}`);
    }
  }

  requiresIV() {
    return (
      this.algorithm !== FileEncryptionManager.ENCRYPTION_ALGORITHMS.AES_256_ECB
    );
  }

  async generateIV() {
    return await promisify(crypto.randomBytes)(16);
  }

  async encryptFile(inputPath, outputPath) {
    const input = syncFs.createReadStream(inputPath);
    const output = syncFs.createWriteStream(outputPath);

    let iv = null;
    let cipher = null;

    if (this.requiresIV()) {
      iv = await this.generateIV();
      cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      output.write(iv);
    } else {
      cipher = crypto.createCipheriv(this.algorithm, this.key, null);
    }

    await stream.promises.pipeline(input, cipher, output);
  }

  async decryptFile(inputPath, outputPath) {
    let iv = null;
    let start = 0;

    if (this.requiresIV()) {
      const fd = await fs.open(inputPath, "r");
      iv = Buffer.alloc(16);
      await fd.read(iv, 0, 16, 0);
      await fd.close();
      start = 16;
    }

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      iv || null,
    );

    const input = syncFs.createReadStream(inputPath, { start });
    const output = syncFs.createWriteStream(outputPath);

    await stream.promises.pipeline(input, decipher, output);
  }
}

// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================

class EnterpriseFileManager {
  constructor(basePath, options = {}) {
    this.basePath = path.resolve(basePath);
    this.pathManager = new CrossPlatformPathManager();
    this.fileWatcher = new RobustFileWatcher(options.watching || {});
    this.securityManager = new FileSecurityManager();
    this.fileCompressionManager = new FileCompressionManager(
      FileCompressionManager.COMPRESSION_ALGORITHMS.GZIP.name,
    );
    this.fileEncryptionManager = new FileEncryptionManager(
      "mi-super-secret-key",
      { algorithm: FileEncryptionManager.ENCRYPTION_ALGORITHMS.AES_256_CTR },
    );

    this.metrics = {
      operationsCount: 0,
      errorsCount: 0,
      failedOperations: 0,
      bytesProcessed: 0,
      startTime: Date.now(),
    };

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.fileWatcher.on(
      "fileChanged",
      async ({ path: fullPath, eventType }) => {
        console.log(`File changed: ${fullPath} (${eventType})`);
        this.metrics.operationsCount++;

        const relative = path.relative(this.basePath, fullPath);

        await this.synchronizeFile(relative, [
          "node-replica-1",
          "node-replica-2",
        ]);
      },
    );

    this.fileWatcher.on("fileDeleted", ({ path, ...args }) => {
      console.log(`File deleted for path: ${path} (${JSON.stringify(args)})`);
    });

    this.fileWatcher.on("watchStarted", ({ path, ...args }) => {
      console.log(
        `File watch started for path: ${path} ('${JSON.stringify(args)}')`,
      );
    });

    this.fileWatcher.on("watchRestarted", ({ path }) => {
      console.log(`File watch restart for path: ${path}`);
    });

    this.fileWatcher.on("watchStopped", ({ path }) => {
      console.warn(`File watch stopped for path: ${path}`);
    });

    this.fileWatcher.on("watchError", ({ path, error }) => {
      console.error(`Watch error for ${path}:`, error.message);
      this.metrics.errorsCount++;
    });

    this.fileWatcher.on("watchFailed", ({ path, error }) => {
      console.error(`Watch failed for ${path}:`, error.message);
      this.metrics.failedOperations++;
    });

    this.fileWatcher.on("watchRestartFailed", ({ path, error }) => {
      console.error(`Watch restart failed for ${path}:`, error.message);
      this.metrics.failedOperations++;
    });
  }

  isValidFileToSync(relative) {
    const ext = path.extname(relative);

    const isBackup = /\.backup\.\d+$/.test(relative);
    const isTemp = /\.tmp\./.test(relative);
    const isAllowed = this.securityManager.allowedExtensions.has(
      ext.toLowerCase(),
    );
    const isEncryptionRelatedExtension = [".dec", ".enc"].includes(ext);

    return (isAllowed || isEncryptionRelatedExtension) && !isBackup && !isTemp;
  }

  async secureWrite(relativePath, content, options = {}) {
    const startTime = Date.now();

    try {
      // Validate and secure path
      const safePath = this.pathManager.buildSafePath(
        this.basePath,
        relativePath,
      );

      // Security validation
      await this.securityManager.validateWrite(safePath, content);

      // Ensure directory exists
      await this.ensureDirectory(path.dirname(safePath));

      // Atomic write with backup
      if (options.backup) {
        await this.createBackup(safePath);
      }

      await this.atomicWrite(safePath, content);

      // Update metrics
      this.updateMetrics(content.length, Date.now() - startTime, true);

      return {
        path: safePath,
        size: content.length,
        checksum: this.calculateChecksum(content),
      };
    } catch (error) {
      this.updateMetrics(0, Date.now() - startTime, false);
      throw new Error(`Secure write failed: ${error.message}`);
    }
  }

  async compressWrite(originalFilePath, compressFilePath) {
    const startTime = Date.now();

    try {
      const originalSafePath = this.pathManager.buildSafePath(
        this.basePath,
        originalFilePath,
      );

      const compressSafePath = this.pathManager.buildSafePath(
        this.basePath,
        compressFilePath,
      );

      // Security validation
      await this.securityManager.validateRead(originalSafePath);

      // Ensure directory exists
      await this.ensureDirectory(path.dirname(originalSafePath));
      await this.ensureDirectory(path.dirname(compressSafePath));

      await this.fileCompressionManager.compressFile(
        originalSafePath,
        compressSafePath,
      );

      // Update metrics
      this.updateMetrics(0, Date.now() - startTime, true);

      return {
        path: compressSafePath,
      };
    } catch (err) {
      this.updateMetrics(0, Date.now() - startTime, false);
      throw new Error(`Compress write failed: ${err.message}`);
    }
  }

  async decompressRead(relativePath, options = {}) {
    const startTime = Date.now();

    try {
      // Validate and secure path
      const safePath = this.pathManager.buildSafePath(
        this.basePath,
        relativePath,
      );

      // Security validation
      await this.securityManager.validateRead(safePath);

      const content =
        await this.fileCompressionManager.decompressFile(safePath);

      const actualChecksum = this.calculateChecksum(content);

      const { content: originalContent } = await this.secureRead(
        options.originalContentPath,
      );

      const originalChecksum = this.calculateChecksum(originalContent);

      if (actualChecksum !== originalChecksum) {
        throw new Error("File integrity check failed");
      }

      // Update metrics
      this.updateMetrics(content.length, Date.now() - startTime, true);

      return {
        content,
        size: content.length,
        checksum: this.calculateChecksum(content),
        path: safePath,
      };
    } catch (error) {
      this.updateMetrics(0, Date.now() - startTime, false);
      throw new Error(`Decompress read failed: ${error.message}`);
    }
  }

  async secureRead(relativePath, options = {}) {
    const startTime = Date.now();

    try {
      // Validate and secure path
      const safePath = this.pathManager.buildSafePath(
        this.basePath,
        relativePath,
      );

      // Security validation
      await this.securityManager.validateRead(safePath);

      // Read with integrity check
      const content = await fs.readFile(safePath, "utf8");

      if (options.verifyChecksum && options.expectedChecksum) {
        const actualChecksum = this.calculateChecksum(content);
        if (actualChecksum !== options.expectedChecksum) {
          throw new Error("File integrity check failed");
        }
      }

      // Update metrics
      this.updateMetrics(content.length, Date.now() - startTime, true);

      return {
        content,
        size: content.length,
        checksum: this.calculateChecksum(content),
        path: safePath,
      };
    } catch (error) {
      this.updateMetrics(0, Date.now() - startTime, false);
      throw new Error(`Secure read failed: ${error.message}`);
    }
  }

  async encryptFile(originalFilePath, encryptedFilePath) {
    const startTime = Date.now();

    try {
      const inputPath = this.pathManager.buildSafePath(
        this.basePath,
        originalFilePath,
      );
      const outputPath = this.pathManager.buildSafePath(
        this.basePath,
        encryptedFilePath,
      );

      await this.securityManager.validateRead(inputPath);
      await this.ensureDirectory(path.dirname(outputPath));

      await this.fileEncryptionManager.encryptFile(inputPath, outputPath);

      this.updateMetrics(0, Date.now() - startTime, true);

      return { path: outputPath };
    } catch (err) {
      this.updateMetrics(0, Date.now() - startTime, false);
      throw new Error(`Encrypt failed: ${err.message}`);
    }
  }

  async decryptFile(encryptedFilePath, decryptedFilePath) {
    const startTime = Date.now();

    try {
      const inputPath = this.pathManager.buildSafePath(
        this.basePath,
        encryptedFilePath,
      );
      const outputPath = this.pathManager.buildSafePath(
        this.basePath,
        decryptedFilePath,
      );

      await this.securityManager.validateRead(inputPath);
      await this.ensureDirectory(path.dirname(outputPath));

      await this.fileEncryptionManager.decryptFile(inputPath, outputPath);

      this.updateMetrics(0, Date.now() - startTime, true);

      return { path: outputPath };
    } catch (err) {
      this.updateMetrics(0, Date.now() - startTime, false);
      throw new Error(`Decrypt failed: ${err.message}`);
    }
  }

  async atomicWrite(filePath, content) {
    const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Write to temporary file
      await fs.writeFile(tempPath, content, "utf8");

      // Atomic rename
      await fs.rename(tempPath, filePath);
    } catch (error) {
      // Cleanup on failure
      try {
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        console.warn(`Cleanup failed: ${cleanupError.message}`);
      }
      throw error;
    }
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      if (error.code === "ENOENT") {
        await fs.mkdir(dirPath, { recursive: true });
      } else {
        throw error;
      }
    }
  }

  async createBackup(filePath) {
    try {
      await fs.access(filePath);
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await fs.copyFile(filePath, backupPath);
      return backupPath;
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      // File doesn't exist, no backup needed
    }
  }

  calculateChecksum(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  async synchronizeFile(relativePath, nodePaths = []) {
    const srcPath = this.pathManager.buildSafePath(this.basePath, relativePath);

    if (!this.isValidFileToSync(srcPath)) {
      return;
    }

    await this.securityManager.validateReadAccess(srcPath);

    for (const nodePath of nodePaths) {
      const destDir = path.resolve(nodePath);
      const destPath = this.pathManager.buildSafePath(destDir, relativePath);

      try {
        await this.ensureDirectory(path.dirname(destPath));
        await fs.copyFile(srcPath, destPath);

        console.log(`Synchronized '${relativePath}' to '${destPath}'`);
      } catch (err) {
        console.error(`Sync failed to '${destPath}': ${err.message}`);
        this.metrics.failedOperations++;
      }
    }
  }

  updateMetrics(bytes, _duration, success) {
    this.metrics.operationsCount++;
    this.metrics.bytesProcessed += bytes;

    if (!success) {
      this.metrics.errorsCount++;
    }
  }

  async watchDirectory(relativePath, callback) {
    const safePath = this.pathManager.buildSafePath(
      this.basePath,
      relativePath,
    );

    this.fileWatcher.on("fileChanged", ({ path, eventType }) => {
      if (path.startsWith(safePath)) {
        const relativeChangedPath = path.substring(this.basePath.length + 1);
        callback({
          path: relativeChangedPath,
          fullPath: path,
          eventType,
          timestamp: new Date().toISOString(),
        });
      }
    });

    await this.fileWatcher.watchPath(safePath, { recursive: true });
  }

  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;

    return {
      ...this.metrics,
      uptime,
      operationsPerSecond: this.metrics.operationsCount / (uptime / 1000),
      errorRate: this.metrics.errorsCount / this.metrics.operationsCount,
      avgBytesPerOperation:
        this.metrics.bytesProcessed / this.metrics.operationsCount,
      watchedPaths: this.fileWatcher.getWatchedPaths().length,
    };
  }

  async cleanup() {
    this.fileWatcher.stopAll();
  }
}

// File security manager
class FileSecurityManager {
  constructor() {
    this.allowedExtensions = new Set([".txt", ".json", ".md", ".log", ".enc"]);
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.dangerousPatterns = [
      /\.\./, // Directory traversal
      /[<>:"|?*]/, // Invalid characters
      /^(CON|PRN|AUX|NUL)$/i, // Reserved names
    ];
  }

  async validateWrite(filePath, content) {
    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!this.allowedExtensions.has(ext)) {
      throw new Error(`File extension not allowed: ${ext}`);
    }

    // Check file size
    if (content.length > this.maxFileSize) {
      throw new Error(
        `File too large: ${content.length} > ${this.maxFileSize}`,
      );
    }

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(filePath)) {
        throw new Error(`Dangerous pattern detected in path: ${filePath}`);
      }
    }
  }

  async validateReadAccess(filePath) {
    try {
      await fs.access(filePath, fs.constants.R_OK);
    } catch (error) {
      throw new Error(`File not readable: ${filePath}`);
    }
  }

  async validateRead(filePath) {
    // Check if file exists and is readable
    await this.validateReadAccess(filePath);

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!this.allowedExtensions.has(ext)) {
      throw new Error(`File extension not allowed for reading: ${ext}`);
    }
  }
}

// Demonstration del sistema
async function demonstrateFileManagement() {
  const fileManager = new EnterpriseFileManager("./secure-files", {
    watching: { debounceMs: 200 },
  });

  try {
    // Setup directory watching
    await fileManager.watchDirectory(".", (event) => {
      console.log("File system event:", event);
    });

    // Secure write operations
    const writeResult = await fileManager.secureWrite(
      "config/app.json",
      JSON.stringify({ version: "1.0.0", debug: true }, null, 2),
      { backup: true },
    );

    console.log("Write result:", writeResult);

    // Secure read with checksum verification
    const readResult = await fileManager.secureRead("config/app.json", {
      verifyChecksum: true,
      expectedChecksum: writeResult.checksum,
    });

    console.log("Read result:", readResult);

    // file compression
    await fileManager.compressWrite(
      "config/bigfile.txt",
      "config/compress.bigfile.txt",
    );

    console.log("Finish compress write");

    const compressReadResult = await fileManager.decompressRead(
      "config/compress.bigfile.txt",
      { originalContentPath: "config/bigfile.txt" },
    );

    console.log("Decompress Read result:", compressReadResult);

    // encryption
    await fileManager.encryptFile("config/app.json", "config/app.json.enc");
    console.log("Encryption complete");

    await fileManager.decryptFile("config/app.json.enc", "config/app.json.dec");
    console.log("Decryption complete");

    // distributed file synchronization
    await fileManager.synchronizeFile("config/app.json", [
      "node-replica-1",
      "node-replica-2",
    ]);

    // Display metrics
    console.log("File manager metrics:", fileManager.getMetrics());

    // Cleanup after demonstration
    setTimeout(async () => {
      await fileManager.cleanup();
      console.log("File manager cleaned up");
    }, 5000);
  } catch (error) {
    await fileManager.cleanup();
    console.log("File manager cleaned up");
    console.error("File management demonstration failed:", error.message);
  }
}

demonstrateFileManagement();
