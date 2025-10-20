/**
 * Safe JSON utilities to handle circular references
 */

/**
 * Cross-realm safe function to detect and remove Window/Event-like objects
 * Works even when instanceof checks fail across iframes
 */
export function scrubDanger(obj: any): any {
  // Handle null/undefined
  if (obj == null) return obj;
  
  // Handle primitives
  if (typeof obj !== 'object') return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => scrubDanger(item));
  }
  
  // Handle objects
  const out: any = {};
  for (const k in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
    
    const v = obj[k];
    
    // Skip if null or not an object
    if (v == null || typeof v !== 'object') {
      out[k] = v;
      continue;
    }
    
    // Cross-realm safe checks for Window-like objects
    const isWindowish = v === window || 
                        v.window === v || 
                        typeof v.postMessage === 'function' ||
                        (v.location && v.document);
                        
    // Cross-realm safe checks for Event-like objects
    const isEventish = 'target' in v || 
                      'source' in v || 
                      (typeof v.preventDefault === 'function' && typeof v.stopPropagation === 'function');
    
    // Skip Window-like and Event-like objects
    if (isWindowish || isEventish) continue;
    
    // Recursively scrub nested objects
    out[k] = scrubDanger(v);
  }
  
  return out;
}

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
      
      // Handle Window objects - cross-realm safe
      if (value === window || value?.window === value || typeof value?.postMessage === 'function') {
        return '[Window]';
      }
      
      // Handle DOM nodes - cross-realm safe
      if (value.nodeType && typeof value.nodeName === 'string') {
        return `[DOM:${value.nodeName}]`;
      }
      
      // Handle Event objects - cross-realm safe
      if (value instanceof Event || ('target' in value && 'type' in value)) {
        return `[Event:${value.type || 'unknown'}]`;
      }
    }
    return value;
  };
};

/**
 * Safely stringify any value, handling circular references
 */
export const safeStringify = (value: any): string => {
  try {
    // First scrub dangerous objects, then stringify
    const scrubbed = scrubDanger(value);
    return JSON.stringify(scrubbed, safeReplacer());
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