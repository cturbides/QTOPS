import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'active' | 'completed' | 'error';
  tags: Record<string, string>;
  logs: Array<{
    timestamp: number;
    message: string;
    level: string;
  }>;
}

@Injectable()
export class TracingService {
  private activeSpans = new Map<string, TraceSpan>();
  private completedSpans = new Map<string, TraceSpan[]>();

  // Create a new trace
  startTrace(operationName: string, attributes?: Record<string, string>): {
    traceId: string;
    spanId: string;
  } {
    const traceId = uuidv4();
    const spanId = uuidv4();

    const span: TraceSpan = {
      traceId,
      spanId,
      operationName,
      startTime: Date.now(),
      status: 'active',
      tags: {
        'service.name': process.env.SERVICE_NAME || 'unknown',
        ...attributes
      },
      logs: []
    };

    this.activeSpans.set(spanId, span);
    return { traceId, spanId };
  }

  // Create a child span
  startSpan(
    traceId: string,
    parentSpanId: string,
    operationName: string,
    attributes?: Record<string, string>
  ): string {
    const spanId = uuidv4();

    const span: TraceSpan = {
      traceId,
      spanId,
      parentSpanId,
      operationName,
      startTime: Date.now(),
      status: 'active',
      tags: {
        'service.name': process.env.SERVICE_NAME || 'unknown',
        ...attributes
      },
      logs: []
    };

    this.activeSpans.set(spanId, span);
    return spanId;
  }

  // Add tags to a span
  setSpanTag(spanId: string, key: string, value: string): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  // Add log to a span
  logToSpan(spanId: string, message: string, level: string = 'info'): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        message,
        level
      });
    }
  }

  // Finish a span
  finishSpan(spanId: string, status: 'completed' | 'error' = 'completed'): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.endTime = Date.now();
      span.duration = span.endTime - span.startTime;
      span.status = status;

      // Move to completed spans
      this.activeSpans.delete(spanId);
      
      if (!this.completedSpans.has(span.traceId)) {
        this.completedSpans.set(span.traceId, []);
      }
      this.completedSpans.get(span.traceId)!.push(span);

      // Clean up old traces (keep only last 1000)
      if (this.completedSpans.size > 1000) {
        const oldestTraceId = this.completedSpans.keys().next().value;
        this.completedSpans.delete(oldestTraceId);
      }
    }
  }

  // Trace an operation
  async traceOperation<T>(
    operationName: string,
    operation: (traceId: string, spanId: string) => Promise<T>,
    attributes?: Record<string, string>
  ): Promise<T> {
    const { traceId, spanId } = this.startTrace(operationName, attributes);

    try {
      const result = await operation(traceId, spanId);
      this.finishSpan(spanId, 'completed');
      return result;
    } catch (error) {
      this.logToSpan(spanId, `Error: ${error.message}`, 'error');
      this.setSpanTag(spanId, 'error', 'true');
      this.finishSpan(spanId, 'error');
      throw error;
    }
  }

  // Get trace by ID
  getTrace(traceId: string): TraceSpan[] | undefined {
    return this.completedSpans.get(traceId);
  }

  // Get all active spans
  getActiveSpans(): TraceSpan[] {
    return Array.from(this.activeSpans.values());
  }

  // Get recent traces
  getRecentTraces(limit: number = 50): Array<{ traceId: string; spans: TraceSpan[] }> {
    const traces = Array.from(this.completedSpans.entries())
      .slice(-limit)
      .map(([traceId, spans]) => ({ traceId, spans }));
    
    return traces.reverse(); // Most recent first
  }
}
