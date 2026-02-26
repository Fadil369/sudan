/**
 * Advanced Caching Strategy Service for Sudan National Digital Identity System
 * Implements multi-layer caching for optimal performance at national scale
 * Supports 50M+ concurrent users with intelligent cache management
 */

import secureConfig from '../security/SecureConfig';

class CachingStrategyService {
  constructor() {
    this.isEnabled = secureConfig.get('performance.cacheEnabled', true);
    this.cacheTTL = secureConfig.get('performance.cacheTtl', 3600) * 1000; // Convert to ms
    
    this.caches = {
      memory: new Map(),
      session: new Map(),
      local: new Map(),
      indexed: null, // IndexedDB
      service: null  // Service Worker cache
    };

    this.cacheConfig = {
      memory: {
        maxSize: 100,
        defaultTTL: 300000, // 5 minutes
        maxItemSize: 1024 * 1024 // 1MB
      },
      session: {
        maxSize: 50,
        defaultTTL: 1800000, // 30 minutes
        maxItemSize: 5 * 1024 * 1024 // 5MB
      },
      local: {
        maxSize: 200,
        defaultTTL: 86400000, // 24 hours
        maxItemSize: 10 * 1024 * 1024 // 10MB
      },
      indexed: {
        maxSize: 1000,
        defaultTTL: 604800000, // 7 days
        maxItemSize: 50 * 1024 * 1024, // 50MB
        dbName: 'SudanGovCache',
        version: 1
      }
    };

    this.cacheStrategies = {
      'api-user': { type: 'memory', ttl: 300000, priority: 'high' },
      'api-ministry': { type: 'session', ttl: 1800000, priority: 'medium' },
      'api-static': { type: 'local', ttl: 86400000, priority: 'low' },
      'documents': { type: 'indexed', ttl: 604800000, priority: 'medium' },
      'images': { type: 'service', ttl: 2592000000, priority: 'low' }, // 30 days
      'translations': { type: 'local', ttl: 86400000, priority: 'high' },
      'oid-data': { type: 'memory', ttl: 600000, priority: 'high' },
      'biometric': { type: 'session', ttl: 300000, priority: 'high' },
      'blockchain': { type: 'local', ttl: 3600000, priority: 'medium' }
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      errors: 0,
      totalRequests: 0
    };

    if (this.isEnabled) {
      this.initialize();
    }
  }

  /**
   * Initialize caching system
   */
  async initialize() {
    await this.setupIndexedDB();
    this.setupServiceWorkerCache();
    this.setupMemoryCache();
    this.startCacheCleanup();
    this.interceptNetworkRequests();
    
    console.log('[CACHE] Advanced caching system initialized');
  }

  /**
   * Setup IndexedDB for large data caching
   */
  async setupIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.cacheConfig.indexed.dbName, this.cacheConfig.indexed.version);
      
      request.onerror = () => {
        console.warn('[CACHE] IndexedDB setup failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.caches.indexed = request.result;
        console.log('[CACHE] IndexedDB cache initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('expiry', 'expiry', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }
      };
    });
  }

  /**
   * Setup Service Worker cache
   */
  setupServiceWorkerCache() {
    if ('serviceWorker' in navigator && 'caches' in window) {
      this.caches.service = caches;
      console.log('[CACHE] Service Worker cache available');
    }
  }

  /**
   * Setup intelligent memory cache
   */
  setupMemoryCache() {
    this.memoryCache = new AdvancedMemoryCache(this.cacheConfig.memory);
    this.caches.memory = this.memoryCache;
  }

  /**
   * Start automatic cache cleanup
   */
  startCacheCleanup() {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 300000);

    // Monitor memory usage and cleanup if needed
    setInterval(() => {
      this.monitorAndOptimizeMemory();
    }, 60000);
  }

  /**
   * Intercept network requests for intelligent caching
   */
  interceptNetworkRequests() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      const method = options?.method || 'GET';
      
      // Only cache GET requests
      if (method !== 'GET') {
        return originalFetch(...args);
      }

      return this.fetchWithCache(url, options, originalFetch);
    };
  }

  /**
   * Fetch with intelligent caching
   */
  async fetchWithCache(url, options, originalFetch) {
    const cacheKey = this.generateCacheKey(url, options);
    const strategy = this.determineCacheStrategy(url);
    
    this.metrics.totalRequests++;

    try {
      // Try to get from cache first
      const cached = await this.get(cacheKey, strategy.type);
      
      if (cached && !this.isExpired(cached)) {
        this.metrics.hits++;
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Cache miss - fetch from network
      this.metrics.misses++;
      const response = await originalFetch(url, options);
      
      if (response.ok) {
        const data = await response.clone().json();
        
        // Cache the response
        await this.set(cacheKey, data, strategy.type, strategy.ttl);
      }
      
      return response;
    } catch (error) {
      this.metrics.errors++;
      console.warn('[CACHE] Cache operation failed:', error);
      return originalFetch(url, options);
    }
  }

  /**
   * Determine cache strategy based on URL
   */
  determineCacheStrategy(url) {
    // Check for specific patterns
    for (const [pattern, strategy] of Object.entries(this.cacheStrategies)) {
      if (url.includes(pattern) || this.matchesPattern(url, pattern)) {
        return strategy;
      }
    }

    // Default strategy
    return { type: 'memory', ttl: this.cacheConfig.memory.defaultTTL, priority: 'medium' };
  }

  /**
   * Match URL against pattern
   */
  matchesPattern(url, pattern) {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '\\?');
    
    return new RegExp(regexPattern, 'i').test(url);
  }

  /**
   * Generate cache key
   */
  generateCacheKey(url, options = {}) {
    const urlObj = new URL(url, window.location.origin);
    const params = Array.from(urlObj.searchParams.entries()).sort();
    const headers = options.headers ? JSON.stringify(options.headers) : '';
    
    return `${urlObj.pathname}_${JSON.stringify(params)}_${headers}`;
  }

  /**
   * Universal get method
   */
  async get(key, cacheType = 'memory') {
    try {
      switch (cacheType) {
        case 'memory':
          return this.getFromMemory(key);
        case 'session':
          return this.getFromSession(key);
        case 'local':
          return this.getFromLocal(key);
        case 'indexed':
          return await this.getFromIndexedDB(key);
        case 'service':
          return await this.getFromServiceWorker(key);
        default:
          return null;
      }
    } catch (error) {
      console.warn(`[CACHE] Failed to get from ${cacheType}:`, error);
      return null;
    }
  }

  /**
   * Universal set method
   */
  async set(key, data, cacheType = 'memory', ttl = null) {
    const actualTTL = ttl || this.cacheConfig[cacheType]?.defaultTTL || this.cacheTTL;
    const expiry = Date.now() + actualTTL;
    
    const cacheItem = {
      key,
      data,
      expiry,
      created: Date.now(),
      accessed: Date.now(),
      size: this.calculateSize(data)
    };

    try {
      switch (cacheType) {
        case 'memory':
          return this.setInMemory(key, cacheItem);
        case 'session':
          return this.setInSession(key, cacheItem);
        case 'local':
          return this.setInLocal(key, cacheItem);
        case 'indexed':
          return await this.setInIndexedDB(key, cacheItem);
        case 'service':
          return await this.setInServiceWorker(key, cacheItem);
        default:
          return false;
      }
    } catch (error) {
      console.warn(`[CACHE] Failed to set in ${cacheType}:`, error);
      return false;
    }
  }

  /**
   * Memory cache operations
   */
  getFromMemory(key) {
    return this.memoryCache.get(key);
  }

  setInMemory(key, item) {
    return this.memoryCache.set(key, item);
  }

  /**
   * Session storage operations
   */
  getFromSession(key) {
    try {
      const item = sessionStorage.getItem(`cache_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  setInSession(key, item) {
    try {
      const config = this.cacheConfig.session;
      
      if (item.size > config.maxItemSize) {
        console.warn('[CACHE] Item too large for session storage');
        return false;
      }

      sessionStorage.setItem(`cache_${key}`, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn('[CACHE] Session storage failed:', error);
      return false;
    }
  }

  /**
   * Local storage operations
   */
  getFromLocal(key) {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  setInLocal(key, item) {
    try {
      const config = this.cacheConfig.local;
      
      if (item.size > config.maxItemSize) {
        console.warn('[CACHE] Item too large for local storage');
        return false;
      }

      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn('[CACHE] Local storage failed:', error);
      return false;
    }
  }

  /**
   * IndexedDB operations
   */
  async getFromIndexedDB(key) {
    if (!this.caches.indexed) return null;

    return new Promise((resolve) => {
      const transaction = this.caches.indexed.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && !this.isExpired(result)) {
          result.accessed = Date.now();
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  }

  async setInIndexedDB(key, item) {
    if (!this.caches.indexed) return false;

    return new Promise((resolve) => {
      const transaction = this.caches.indexed.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(item);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Service Worker cache operations
   */
  async getFromServiceWorker(key) {
    if (!this.caches.service) return null;

    try {
      const cache = await this.caches.service.open('sudan-gov-cache');
      const response = await cache.match(key);
      
      if (response) {
        const data = await response.json();
        return data;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  async setInServiceWorker(key, item) {
    if (!this.caches.service) return false;

    try {
      const cache = await this.caches.service.open('sudan-gov-cache');
      const response = new Response(JSON.stringify(item.data));
      await cache.put(key, response);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cache invalidation and cleanup
   */
  async invalidate(pattern) {
    const promises = [];

    // Invalidate from all cache types
    promises.push(this.invalidateMemory(pattern));
    promises.push(this.invalidateSession(pattern));
    promises.push(this.invalidateLocal(pattern));
    promises.push(this.invalidateIndexedDB(pattern));
    promises.push(this.invalidateServiceWorker(pattern));

    await Promise.all(promises);
  }

  invalidateMemory(pattern) {
    if (this.memoryCache) {
      this.memoryCache.invalidate(pattern);
    }
  }

  invalidateSession(pattern) {
    const keys = Object.keys(sessionStorage).filter(key => 
      key.startsWith('cache_') && this.matchesPattern(key, `cache_${pattern}`)
    );
    
    keys.forEach(key => sessionStorage.removeItem(key));
  }

  invalidateLocal(pattern) {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('cache_') && this.matchesPattern(key, `cache_${pattern}`)
    );
    
    keys.forEach(key => localStorage.removeItem(key));
  }

  async invalidateIndexedDB(pattern) {
    if (!this.caches.indexed) return;

    return new Promise((resolve) => {
      const transaction = this.caches.indexed.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (this.matchesPattern(cursor.key, pattern)) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  async invalidateServiceWorker(pattern) {
    if (!this.caches.service) return;

    try {
      const cache = await this.caches.service.open('sudan-gov-cache');
      const keys = await cache.keys();
      
      const deletePromises = keys
        .filter(request => this.matchesPattern(request.url, pattern))
        .map(request => cache.delete(request));
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.warn('[CACHE] Service worker invalidation failed:', error);
    }
  }

  /**
   * Cleanup expired entries
   */
  async cleanupExpiredEntries() {
    const now = Date.now();
    
    // Cleanup memory cache
    if (this.memoryCache) {
      this.memoryCache.cleanup();
    }

    // Cleanup session storage
    this.cleanupStorageExpired(sessionStorage, now);
    
    // Cleanup local storage
    this.cleanupStorageExpired(localStorage, now);
    
    // Cleanup IndexedDB
    await this.cleanupIndexedDBExpired(now);
  }

  cleanupStorageExpired(storage, now) {
    const keys = Object.keys(storage).filter(key => key.startsWith('cache_'));
    
    keys.forEach(key => {
      try {
        const item = JSON.parse(storage.getItem(key));
        if (item && item.expiry < now) {
          storage.removeItem(key);
          this.metrics.evictions++;
        }
      } catch {
        // Remove corrupted entries
        storage.removeItem(key);
      }
    });
  }

  async cleanupIndexedDBExpired(now) {
    if (!this.caches.indexed) return;

    return new Promise((resolve) => {
      const transaction = this.caches.indexed.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.expiry < now) {
            cursor.delete();
            this.metrics.evictions++;
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  /**
   * Monitor and optimize memory usage
   */
  monitorAndOptimizeMemory() {
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
      
      if (memoryUsage > 0.8) { // 80% memory usage
        this.optimizeMemoryUsage();
      }
    }
  }

  optimizeMemoryUsage() {
    // Clear least recently used items from memory cache
    if (this.memoryCache) {
      this.memoryCache.evictLRU(0.3); // Evict 30% of items
    }

    // Clear old session storage items
    this.cleanupStorageByAge(sessionStorage, 1800000); // 30 minutes
    
    console.log('[CACHE] Memory optimization completed');
  }

  cleanupStorageByAge(storage, maxAge) {
    const now = Date.now();
    const keys = Object.keys(storage).filter(key => key.startsWith('cache_'));
    
    keys.forEach(key => {
      try {
        const item = JSON.parse(storage.getItem(key));
        if (item && (now - item.created) > maxAge) {
          storage.removeItem(key);
        }
      } catch {
        storage.removeItem(key);
      }
    });
  }

  /**
   * Cache warming strategies
   */
  async warmCache() {
    const criticalEndpoints = [
      '/api/user/profile',
      '/api/ministry/health',
      '/api/ministry/education',
      '/api/ministry/finance',
      '/api/services/critical',
      '/api/translations/ar',
      '/api/translations/en'
    ];

    console.log('[CACHE] Starting cache warming...');
    
    const promises = criticalEndpoints.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          console.log(`[CACHE] Warmed cache for ${endpoint}`);
        }
      } catch (error) {
        console.warn(`[CACHE] Failed to warm cache for ${endpoint}:`, error);
      }
    });

    await Promise.all(promises);
    console.log('[CACHE] Cache warming completed');
  }

  /**
   * Predictive caching based on user behavior
   */
  enablePredictiveCache() {
    // Track user navigation patterns
    this.navigationPatterns = new Map();
    
    // Monitor route changes
    if (window.history) {
      const originalPushState = history.pushState;
      history.pushState = (...args) => {
        this.recordNavigation(args[2]);
        return originalPushState.apply(history, args);
      };
    }

    // Monitor user interactions
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link && link.href) {
        this.predictAndPreload(link.href);
      }
    });
  }

  recordNavigation(url) {
    const now = Date.now();
    if (this.lastNavigation) {
      const pattern = `${this.lastNavigation} -> ${url}`;
      const count = this.navigationPatterns.get(pattern) || 0;
      this.navigationPatterns.set(pattern, count + 1);
    }
    this.lastNavigation = url;
  }

  predictAndPreload(currentUrl) {
    // Find most common next destinations
    const patterns = Array.from(this.navigationPatterns.entries())
      .filter(([pattern]) => pattern.startsWith(currentUrl))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3); // Top 3 predictions

    patterns.forEach(([pattern]) => {
      const nextUrl = pattern.split(' -> ')[1];
      this.preloadResource(nextUrl);
    });
  }

  async preloadResource(url) {
    try {
      const response = await fetch(url, { priority: 'low' });
      if (response.ok) {
        console.log(`[CACHE] Preloaded resource: ${url}`);
      }
    } catch {
      // Silently fail preloading
    }
  }

  /**
   * Utility methods
   */
  isExpired(item) {
    return item.expiry < Date.now();
  }

  calculateSize(data) {
    return JSON.stringify(data).length;
  }

  /**
   * Public API methods
   */

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0;

    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      evictions: this.metrics.evictions,
      errors: this.metrics.errors,
      totalRequests: this.metrics.totalRequests,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.memoryCache ? this.memoryCache.getStats() : null
    };
  }

  /**
   * Clear all caches
   */
  async clearAll() {
    await this.invalidate('*');
    this.metrics = { hits: 0, misses: 0, evictions: 0, errors: 0, totalRequests: 0 };
    console.log('[CACHE] All caches cleared');
  }

  /**
   * Get cache recommendations
   */
  getCacheRecommendations() {
    const stats = this.getCacheStats();
    const recommendations = [];

    if (stats.hitRate < 70) {
      recommendations.push({
        type: 'hit_rate',
        message: 'Cache hit rate is below 70%',
        suggestion: 'Consider increasing cache TTL for frequently accessed data'
      });
    }

    if (stats.errors > stats.totalRequests * 0.05) {
      recommendations.push({
        type: 'error_rate',
        message: 'High cache error rate detected',
        suggestion: 'Check storage quotas and cache configuration'
      });
    }

    return recommendations;
  }
}

/**
 * Advanced Memory Cache implementation
 */
class AdvancedMemoryCache {
  constructor(config) {
    this.config = config;
    this.data = new Map();
    this.accessTimes = new Map();
    this.priorities = new Map();
  }

  get(key) {
    const item = this.data.get(key);
    if (item && !this.isExpired(item)) {
      this.accessTimes.set(key, Date.now());
      return item;
    }
    this.data.delete(key);
    this.accessTimes.delete(key);
    this.priorities.delete(key);
    return null;
  }

  set(key, item) {
    // Check size limits
    if (this.data.size >= this.config.maxSize) {
      this.evictLRU(0.2); // Evict 20% of items
    }

    if (item.size > this.config.maxItemSize) {
      return false;
    }

    this.data.set(key, item);
    this.accessTimes.set(key, Date.now());
    this.priorities.set(key, item.priority || 'medium');
    
    return true;
  }

  evictLRU(percentage) {
    const itemsToEvict = Math.floor(this.data.size * percentage);
    
    // Sort by access time and priority
    const sortedItems = Array.from(this.accessTimes.entries())
      .sort(([a], [b]) => {
        const priorityA = this.priorities.get(a) || 'medium';
        const priorityB = this.priorities.get(b) || 'medium';
        
        // Priority order: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        
        if (priorityOrder[priorityA] !== priorityOrder[priorityB]) {
          return priorityOrder[priorityA] - priorityOrder[priorityB];
        }
        
        return this.accessTimes.get(a) - this.accessTimes.get(b);
      });

    // Remove oldest, lowest priority items
    for (let i = 0; i < itemsToEvict && i < sortedItems.length; i++) {
      const [key] = sortedItems[i];
      this.data.delete(key);
      this.accessTimes.delete(key);
      this.priorities.delete(key);
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.data.entries()) {
      if (this.isExpired(item)) {
        this.data.delete(key);
        this.accessTimes.delete(key);
        this.priorities.delete(key);
      }
    }
  }

  invalidate(pattern) {
    for (const key of this.data.keys()) {
      if (this.matchesPattern(key, pattern)) {
        this.data.delete(key);
        this.accessTimes.delete(key);
        this.priorities.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.data.size,
      maxSize: this.config.maxSize,
      usage: (this.data.size / this.config.maxSize) * 100
    };
  }

  isExpired(item) {
    return item.expiry < Date.now();
  }

  matchesPattern(str, pattern) {
    const regexPattern = pattern.replace(/\*/g, '.*');
    return new RegExp(regexPattern, 'i').test(str);
  }
}

// Create and export singleton instance
const cachingStrategy = new CachingStrategyService();

export default cachingStrategy;
export { CachingStrategyService, AdvancedMemoryCache };