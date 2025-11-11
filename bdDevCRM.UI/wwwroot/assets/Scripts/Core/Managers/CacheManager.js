/*=========================================================
 * Cache Manager
 * File: CacheManager.js
 * Description: Manages API response caching
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CacheManager = {
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
