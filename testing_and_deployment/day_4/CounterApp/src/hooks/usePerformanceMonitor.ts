import { useEffect, useRef } from 'react';
import { PERFORMANCE_BUDGET } from '../utils/performanceBudget';

export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(Date.now());

  // Debug: Log cuando el componente se monta
  console.log(`[Debug] ${componentName} mounted - Starting performance monitoring`);

  useEffect(() => {
    const startTime = startTimeRef.current;
    console.log(`[Debug] ${componentName} useEffect started at ${startTime}ms`);

    return () => {
      const endTime = Date.now();
      const renderTime = endTime - startTime;

      console.log(`[Debug] ${componentName} unmounting/updating`);
      console.log(`[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`);

      if (renderTime > PERFORMANCE_BUDGET.timing.componentRender) {
        console.warn(
          `⚠️ [Performance Alert] ${componentName} exceeded budget!\n` +
          `Render time: ${renderTime.toFixed(2)}ms\n` +
          `Budget: ${PERFORMANCE_BUDGET.timing.componentRender}ms`
        );
      } else {
        console.log(`[Performance] ${componentName} within budget (${PERFORMANCE_BUDGET.timing.componentRender}ms)`);
      }
    };
  }, [componentName]);
};
