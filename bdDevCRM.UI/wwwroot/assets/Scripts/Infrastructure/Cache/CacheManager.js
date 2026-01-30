/*=========================================================
 * Enhanced Cache Manager
 * File: CacheManager.js
 * Description: Advanced caching with TTL, patterns, and statistics
 * Author: devSakhawat
 * Date: 2026-01-25
=========================================================*/

var CacheManager = (function () {
  'use strict';

  /////////////////////////////////////////////////////////////
  // PRIVATE - State
  /////////////////////////////////////////////////////////////

  var _cache = new Map();
  var _config = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 100, // Maximum cache entries
    cleanupInterval: 10 * 60 * 1000, // Cleanup every 10 minutes
    enableLogging: true
  };

  var _stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    expires: 0
  };

  /////////////////////////////////////////////////////////////
  // PRIVATE - Helper Functions
  /////////////////////////////////////////////////////////////

  /**
   * Log cache activity
   */
  function _log(message, data) {
    if (_config.enableLogging) {
      console.log(`[CacheManager] ${message}`, data || '');
    }
  }

  /**
   * Check if cache entry is expired
   */
  function _isExpired(entry) {
    if (!entry || !entry.expiry) return true;
    return Date.now() > entry.expiry;
  }

  /**
   * Enforce max cache size (LRU - Least Recently Used)
   */
  function _enforceCacheSize() {
    if (_cache.size <= _config.maxCacheSize) return;

    // Find oldest entry
    let oldestKey = null;
    let oldestTime = Infinity;

    for (let [key, entry] of _cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      _cache.delete(oldestKey);
      _log('Cache size limit reached. Removed oldest entry:', oldestKey);
    }
  }

  /**
   * Auto cleanup expired entries
   */
  function _cleanupExpired() {
    let expiredCount = 0;

    for (let [key, entry] of _cache.entries()) {
      if (_isExpired(entry)) {
        _cache.delete(key);
        expiredCount++;
        _stats.expires++;
      }
    }

    if (expiredCount > 0) {
      _log(`Cleaned up ${expiredCount} expired cache entries`);
    }
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Core Cache Operations
  /////////////////////////////////////////////////////////////

  /**
   * Set cache item with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @returns {boolean} Success status
   */
  function set(key, value, ttl) {
    if (!key) {
      console.error('[CacheManager] Invalid cache key');
      return false;
    }

    try {
      const expiryTime = ttl || _config.defaultTTL;
      const entry = {
        value: value,
        expiry: Date.now() + expiryTime,
        lastAccessed: Date.now(),
        createdAt: Date.now(),
        ttl: expiryTime
      };

      _cache.set(key, entry);
      _stats.sets++;

      // Enforce cache size limit
      _enforceCacheSize();

      _log('Cache set:', { key, ttl: expiryTime });
      return true;

    } catch (error) {
      console.error('[CacheManager] Error setting cache:', error);
      return false;
    }
  }

  /**
   * Get cache item
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  function get(key) {
    if (!key) {
      console.error('[CacheManager] Invalid cache key');
      return null;
    }

    const entry = _cache.get(key);

    // Check if exists
    if (!entry) {
      _stats.misses++;
      _log('Cache miss:', key);
      return null;
    }

    // Check if expired
    if (_isExpired(entry)) {
      _cache.delete(key);
      _stats.misses++;
      _stats.expires++;
      _log('Cache expired:', key);
      return null;
    }

    // Update last accessed time
    entry.lastAccessed = Date.now();
    _stats.hits++;

    _log('Cache hit:', key);
    return entry.value;
  }

  /**
   * Check if key exists and not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  function has(key) {
    const entry = _cache.get(key);
    if (!entry) return false;
    if (_isExpired(entry)) {
      _cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete specific cache item
   * @param {string} key - Cache key
   * @returns {boolean} Success status
   */
  function remove(key) {
    if (!key) return false;

    const result = _cache.delete(key);
    if (result) {
      _stats.deletes++;
      _log('Cache deleted:', key);
    }
    return result;
  }

  /**
   * Clear all cache
   */
  function clear() {
    const size = _cache.size;
    _cache.clear();
    _log(`Cleared all cache (${size} entries)`);
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Advanced Operations
  /////////////////////////////////////////////////////////////

  /**
   * Clear cache by pattern
   * @param {string} pattern - Pattern to match (supports wildcards)
   * @returns {number} Number of deleted entries
   */
  function clearByPattern(pattern) {
    if (!pattern) return 0;

    let deletedCount = 0;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    for (let key of _cache.keys()) {
      if (regex.test(key)) {
        _cache.delete(key);
        deletedCount++;
        _stats.deletes++;
      }
    }

    _log(`Cleared ${deletedCount} entries matching pattern:`, pattern);
    return deletedCount;
  }

  /**
   * Clear cache by prefix
   * @param {string} prefix - Key prefix
   * @returns {number} Number of deleted entries
   */
  function clearByPrefix(prefix) {
    if (!prefix) return 0;

    let deletedCount = 0;

    for (let key of _cache.keys()) {
      if (key.startsWith(prefix)) {
        _cache.delete(key);
        deletedCount++;
        _stats.deletes++;
      }
    }

    _log(`Cleared ${deletedCount} entries with prefix:`, prefix);
    return deletedCount;
  }

  /**
   * Clear cache by tags
   * @param {string[]} tags - Array of tags
   * @returns {number} Number of deleted entries
   */
  function clearByTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return 0;

    let deletedCount = 0;

    for (let [key, entry] of _cache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        _cache.delete(key);
        deletedCount++;
        _stats.deletes++;
      }
    }

    _log(`Cleared ${deletedCount} entries with tags:`, tags);
    return deletedCount;
  }

  /**
   * Set cache with tags
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live
   * @param {string[]} tags - Tags for grouping
   */
  function setWithTags(key, value, ttl, tags) {
    if (!key) return false;

    const expiryTime = ttl || _config.defaultTTL;
    const entry = {
      value: value,
      expiry: Date.now() + expiryTime,
      lastAccessed: Date.now(),
      createdAt: Date.now(),
      ttl: expiryTime,
      tags: tags || []
    };

    _cache.set(key, entry);
    _stats.sets++;
    _enforceCacheSize();

    _log('Cache set with tags:', { key, tags });
    return true;
  }

  /**
   * Get multiple cache items
   * @param {string[]} keys - Array of cache keys
   * @returns {Object} Object with key-value pairs
   */
  function getMultiple(keys) {
    if (!Array.isArray(keys)) return {};

    const result = {};

    keys.forEach(key => {
      const value = get(key);
      if (value !== null) {
        result[key] = value;
      }
    });

    return result;
  }

  /**
   * Set multiple cache items
   * @param {Object} items - Object with key-value pairs
   * @param {number} ttl - Time to live
   */
  function setMultiple(items, ttl) {
    if (!items || typeof items !== 'object') return;

    Object.keys(items).forEach(key => {
      set(key, items[key], ttl);
    });
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Cache Information
  /////////////////////////////////////////////////////////////

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  function getStats() {
    const hitRate = _stats.hits + _stats.misses > 0
      ? (_stats.hits / (_stats.hits + _stats.misses) * 100).toFixed(2)
      : 0;

    return {
      size: _cache.size,
      maxSize: _config.maxCacheSize,
      hits: _stats.hits,
      misses: _stats.misses,
      hitRate: hitRate + '%',
      sets: _stats.sets,
      deletes: _stats.deletes,
      expires: _stats.expires
    };
  }

  /**
   * Get all cache keys
   * @returns {Array} Array of cache keys
   */
  function getKeys() {
    return Array.from(_cache.keys());
  }

  /**
   * Get cache entry info
   * @param {string} key - Cache key
   * @returns {Object} Entry information
   */
  function getInfo(key) {
    const entry = _cache.get(key);
    if (!entry) return null;

    return {
      key: key,
      exists: true,
      expired: _isExpired(entry),
      createdAt: new Date(entry.createdAt),
      expiresAt: new Date(entry.expiry),
      lastAccessed: new Date(entry.lastAccessed),
      ttl: entry.ttl,
      tags: entry.tags || [],
      timeToExpire: entry.expiry - Date.now()
    };
  }

  /**
   * Get all cache entries info
   * @returns {Array} Array of entry information
   */
  function getAllInfo() {
    const entries = [];

    for (let key of _cache.keys()) {
      entries.push(getInfo(key));
    }

    return entries;
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Configuration
  /////////////////////////////////////////////////////////////

  /**
   * Set configuration
   * @param {Object} config - Configuration object
   */
  function setConfig(config) {
    if (!config || typeof config !== 'object') return;

    if (config.defaultTTL !== undefined) {
      _config.defaultTTL = config.defaultTTL;
    }

    if (config.maxCacheSize !== undefined) {
      _config.maxCacheSize = config.maxCacheSize;
    }

    if (config.cleanupInterval !== undefined) {
      _config.cleanupInterval = config.cleanupInterval;
      _startAutoCleanup(); // Restart cleanup with new interval
    }

    if (config.enableLogging !== undefined) {
      _config.enableLogging = config.enableLogging;
    }

    _log('Configuration updated:', _config);
  }

  /**
   * Get configuration
   * @returns {Object} Current configuration
   */
  function getConfig() {
    return Object.assign({}, _config);
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Utility Methods
  /////////////////////////////////////////////////////////////

  /**
   * Generate cache key from URL and params
   * @param {string} url - API URL
   * @param {Object} params - Query parameters
   * @returns {string} Generated cache key
   */
  function generateKey(url, params) {
    if (!url) return '';

    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${url}?${paramString}`;
  }

  /**
   * Reset statistics
   */
  function resetStats() {
    _stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      expires: 0
    };
    _log('Statistics reset');
  }

  /**
   * Export cache data (for debugging)
   * @returns {Object} Serializable cache data
   */
  function exportCache() {
    const data = {};

    for (let [key, entry] of _cache.entries()) {
      data[key] = {
        value: entry.value,
        expiry: entry.expiry,
        createdAt: entry.createdAt,
        tags: entry.tags
      };
    }

    return data;
  }

  /**
   * Import cache data
   * @param {Object} data - Cache data to import
   */
  function importCache(data) {
    if (!data || typeof data !== 'object') return;

    Object.keys(data).forEach(key => {
      const item = data[key];
      const ttl = item.expiry - Date.now();

      if (ttl > 0) {
        set(key, item.value, ttl);
      }
    });

    _log('Cache imported');
  }

  /////////////////////////////////////////////////////////////
  // PRIVATE - Auto Cleanup
  /////////////////////////////////////////////////////////////

  var _cleanupTimer = null;

  function _startAutoCleanup() {
    // Stop existing timer
    if (_cleanupTimer) {
      clearInterval(_cleanupTimer);
    }

    // Start new timer
    _cleanupTimer = setInterval(function () {
      _cleanupExpired();
    }, _config.cleanupInterval);

    _log('Auto cleanup started (interval: ' + _config.cleanupInterval + 'ms)');
  }

  function _stopAutoCleanup() {
    if (_cleanupTimer) {
      clearInterval(_cleanupTimer);
      _cleanupTimer = null;
      _log('Auto cleanup stopped');
    }
  }

  /////////////////////////////////////////////////////////////
  // INITIALIZATION
  /////////////////////////////////////////////////////////////

  // Start auto cleanup on load
  _startAutoCleanup();

  /////////////////////////////////////////////////////////////
  // PUBLIC API
  /////////////////////////////////////////////////////////////

  return {
    // Core operations
    set: set,
    get: get,
    has: has,
    remove: remove,
    clear: clear,

    // Advanced operations
    clearByPattern: clearByPattern,
    clearByPrefix: clearByPrefix,
    clearByTags: clearByTags,
    setWithTags: setWithTags,
    getMultiple: getMultiple,
    setMultiple: setMultiple,

    // Information
    getStats: getStats,
    getKeys: getKeys,
    getInfo: getInfo,
    getAllInfo: getAllInfo,

    // Configuration
    setConfig: setConfig,
    getConfig: getConfig,

    // Utilities
    generateKey: generateKey,
    resetStats: resetStats,
    exportCache: exportCache,
    importCache: importCache,

    // Cleanup control
    cleanupExpired: _cleanupExpired,
    stopAutoCleanup: _stopAutoCleanup,
    startAutoCleanup: _startAutoCleanup
  };
})();

// Auto-initialize
if (typeof window !== 'undefined') {
  window.CacheManager = CacheManager;
  console.log('%c[CacheManager] ✓ Loaded and initialized', 'color: #4CAF50; font-weight: bold;');
}



/*=========================================================
 * Cache Manager
 * File: CacheManager.js
 * Description: Manages API response caching
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CacheManager2 = {
  cache: new Map(),
  defaultTTL: 5 * 60 * 1000, // 5 minutes in milliseconds

  // Set cache item
  set: function(key, value, customTTL) {
    const ttl = customTTL || this.defaultTTL;
    this.cache.set(key, {
      value: value,
      expiry: Date.now() + ttl
    });
  },

  // Get cache item
  get: function(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  },

  // Check if key exists and not expired
  has: function(key) {
    return this.get(key) !== null;
  },

  // Delete specific cache item
  delete: function(key) {
    return this.cache.delete(key);
  },

  // Clear all cache
  clear: function() {
    this.cache.clear();
  },

  // Clear cache by pattern
  clearByPattern: function(pattern) {
    for (let key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  },

  // Clear expired items
  clearExpired: function() {
    const now = Date.now();
    for (let [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  },

  // Get cache statistics
  getStats: function() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  },

  // Generate cache key from URL and params
  generateKey: function(url, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return paramString ? `${url}?${paramString}` : url;
  }
};

// Clear expired cache every 10 minutes
setInterval(function() {
  CacheManager.clearExpired();
}, 10 * 60 * 1000);
