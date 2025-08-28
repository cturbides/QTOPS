import { performance } from 'perf_hooks';

type Function<T> = () => Promise<T>;

interface PerformanceMeasureResponse<T> {
    result: T;
    duration: number;
}

export class PerformanceMeasureUtil {
    static async measureExecutionTime<T>(fn: Function<T>): Promise<PerformanceMeasureResponse<T>> {
        const start: number = performance.now();

        const result: T = await fn();

        const end: number = performance.now();

        return { result, duration: end - start };
    }
}

