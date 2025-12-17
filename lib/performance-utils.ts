// lib/performance-utils.ts

/**
 * DEBOUNCE - Prevents a function from being called too frequently
 * Waits until a certain time has passed without the function being called
 * before actually executing it.
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * THROTTLE - Limits how often a function can be called
 * Ensures the function is called at most once every specified time period
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * MEMOIZE - Caches function results for same inputs
 * Returns cached result if same arguments are provided again
 */
export const memoize = <T extends (...args: unknown[]) => unknown>(func: T): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * BATCH UPDATES - Groups multiple state updates into one
 * Useful when you have multiple setState calls that should happen together
 */
export const batchUpdates = (callback: () => void): void => {
  if (typeof window !== 'undefined' && (window as { ReactDOM?: { unstable_batchedUpdates?: (callback: () => void) => void } }).ReactDOM?.unstable_batchedUpdates) {
    (window as { ReactDOM: { unstable_batchedUpdates: (callback: () => void) => void } }).ReactDOM.unstable_batchedUpdates(callback);
  } else {
    callback();
  }
};

/**
 * LAZY LOAD - Delays execution until needed
 * Useful for components or data that aren't needed immediately
 */
export const lazyLoad = <T>(importFn: () => Promise<T>, timeout = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(importFn()), timeout);
  });
};

/**
 * MEASURE PERFORMANCE - Debugging tool to measure how long functions take
 * Wrap any function to see how long it takes to execute
 */
export const measurePerformance = <T extends (...args: unknown[]) => unknown>(
  func: T,
  name = 'Function'
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = func(...args) as ReturnType<T>;
    const end = performance.now();
    
    console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  };
};

// Type-safe event listener utility
export const createEventListener = <K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions
): (() => void) => {
  if (typeof window !== 'undefined') {
    window.addEventListener(event, handler, options);
    return () => window.removeEventListener(event, handler, options);
  }
  return () => {}; // No-op for SSR
};

// Optimized resize observer
export const createResizeObserver = (
  element: Element,
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions
): (() => void) => {
  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    const observer = new ResizeObserver(callback);
    observer.observe(element, options);
    return () => observer.disconnect();
  }
  return () => {}; // No-op for SSR
};