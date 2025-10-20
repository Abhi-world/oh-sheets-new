/**
 * Safe JSON utilities to handle circular references
 */

/**
 * Creates a replacer function for JSON.stringify that handles circular references
 * and Window objects safely
 */
export const safeReplacer = () => {
  const seen = new WeakSet();
  return (_key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
      
      // Handle Window objects
      if (value === window || value?.window === value) return '[Window]';
      
      // Handle DOM nodes
      if (value.nodeType && typeof value.nodeName === 'string') return `[DOM:${value.nodeName}]`;
      
      // Handle Event objects
      if (value instanceof Event) return `[Event:${value.type}]`;
    }
    return value;
  };
};

/**
 * Safely stringify any value, handling circular references
 */
export const safeStringify = (value: any): string => {
  try {
    return JSON.stringify(value, safeReplacer());
  } catch (err) {
    return JSON.stringify({
      error: 'Failed to stringify',
      message: err instanceof Error ? err.message : String(err)
    });
  }
};

/**
 * Safely parse JSON, returning null on failure
 */
export const safeParse = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('JSON parse error:', err);
    return null;
  }
};

/**
 * Convert any error or unknown value to a safe string message
 */
export const toMsg = (err: unknown): string => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error && err.message) return err.message;
  return Object.prototype.toString.call(err);
};