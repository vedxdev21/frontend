/**
 * Request throttler to prevent rate limiting issues
 * Implements debouncing and caching for API requests
 */

class RequestThrottler {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Generate a cache key from method and endpoint
   */
  getCacheKey(method, endpoint, params = null) {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${method}:${endpoint}:${paramStr}`;
  }

  /**
   * Throttle/debounce a request - returns cached result if recent
   * @param {string} method - HTTP method (GET, POST, etc)
   * @param {string} endpoint - API endpoint
   * @param {Function} requestFn - Function that makes the actual request
   * @param {number} ttl - Time to live in ms (default 30s for GET, 0 for others)
   * @param {any} params - Request parameters for cache key
   */
  async throttle(method, endpoint, requestFn, ttl = null, params = null) {
    const cacheKey = this.getCacheKey(method, endpoint, params);
    const now = Date.now();

    // Default TTL: 30s for GET, 0 for other methods (no cache)
    if (ttl === null) {
      ttl = method.toUpperCase() === 'GET' ? 30000 : 0;
    }

    // Return cached result if still valid
    if (ttl > 0 && this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (now - timestamp < ttl) {
        return data;
      }
      this.cache.delete(cacheKey);
    }

    // If request is already pending, return that promise
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Make the request
    const promise = requestFn()
      .then((result) => {
        if (ttl > 0) {
          this.cache.set(cacheKey, { data: result, timestamp: now });
        }
        this.pendingRequests.delete(cacheKey);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  /**
   * Clear cache for a specific key or all
   */
  clearCache(cacheKey = null) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Clear all pending requests
   */
  clearPending(cacheKey = null) {
    if (cacheKey) {
      this.pendingRequests.delete(cacheKey);
    } else {
      this.pendingRequests.clear();
    }
  }
}

export const throttler = new RequestThrottler();
