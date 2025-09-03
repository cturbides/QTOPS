import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DistributedLogger {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf((info) => {
          const baseLog = {
            timestamp: info.timestamp,
            level: info.level,
            message: info.message,
            service: process.env.SERVICE_NAME || 'unknown',
            correlationId: info.correlationId,
            traceId: info.traceId,
            spanId: info.spanId
          };

          // Safely merge metadata if it exists and is an object
          const metadata = info.metadata && typeof info.metadata === 'object' 
            ? info.metadata 
            : {};

          return JSON.stringify({ ...baseLog, ...metadata });
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ 
          filename: 'logs/app.log',
          format: winston.format.json()
        })
      ]
    });
  }

  logWithCorrelation(
    level: string,
    message: string,
    correlationId: string,
    metadata?: Record<string, any>
  ): void {
    this.logger.log(level, message, {
      correlationId,
      service: process.env.SERVICE_NAME || 'unknown',
      timestamp: new Date().toISOString(),
      metadata
    });
  }

  logWithTrace(
    level: string,
    message: string,
    correlationId: string,
    traceId?: string,
    spanId?: string,
    metadata?: Record<string, any>
  ): void {
    this.logger.log(level, message, {
      correlationId,
      traceId,
      spanId,
      service: process.env.SERVICE_NAME || 'unknown',
      timestamp: new Date().toISOString(),
      metadata
    });
  }

  info(message: string, correlationId?: string, metadata?: Record<string, any>): void {
    this.logWithCorrelation('info', message, correlationId || uuidv4(), metadata);
  }

  warn(message: string, correlationId?: string, metadata?: Record<string, any>): void {
    this.logWithCorrelation('warn', message, correlationId || uuidv4(), metadata);
  }

  error(message: string, correlationId?: string, metadata?: Record<string, any>): void {
    this.logWithCorrelation('error', message, correlationId || uuidv4(), metadata);
  }

  debug(message: string, correlationId?: string, metadata?: Record<string, any>): void {
    this.logWithCorrelation('debug', message, correlationId || uuidv4(), metadata);
  }
}
