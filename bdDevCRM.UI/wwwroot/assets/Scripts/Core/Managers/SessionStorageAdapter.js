/// <reference path="apicallmanager.js" />
/// <reference path="messagemanager.js" />


/*=========================================================
 * Session Storage Adapter
 * File: SessionStorageAdapter.js
 * Description: SessionStorage wrapper with error handling
 * Author: devSakhawat
 * Date: 2025-11-13
=========================================================*/

var SessionStorageAdapter = (function () {
  'use strict';

  // Private - Check if sessionStorage is available
  var _isAvailable = (function () {
    try {
      var test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('SessionStorage not available, using memory fallback');
      return false;
    }
  })();

  // Private - Memory fallback storage
  var _memoryStorage = {};

  /**
   * Set item in session storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON serialized)
   * @returns {boolean} Success status
   */
  function set(key, value) {
    if (!key) {
      console.error('SessionStorageAdapter.set: Key is required');
      return false;
    }

    try {
      var serialized = JSON.stringify(value);

      if (_isAvailable) {
        sessionStorage.setItem(key, serialized);
      } else {
        _memoryStorage[key] = serialized;
      }

      return true;
    } catch (e) {
      console.error('SessionStorageAdapter.set error:', e);
      return false;
    }
  }

  /**
   * Get item from session storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Retrieved value or default
   */
  function get(key, defaultValue) {
    if (!key) {
      console.error('SessionStorageAdapter.get: Key is required');
      return defaultValue;
    }

    try {
      var item;

      if (_isAvailable) {
        item = sessionStorage.getItem(key);
      } else {
        item = _memoryStorage[key];
      }

      if (item === null || item === undefined) {
        return defaultValue;
      }

      return JSON.parse(item);
    } catch (e) {
      console.error('SessionStorageAdapter.get error:', e);
      return defaultValue;
    }
  }

  /**
   * Remove item from session storage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  function remove(key) {
    if (!key) {
      console.error('SessionStorageAdapter.remove: Key is required');
      return false;
    }

    try {
      if (_isAvailable) {
        sessionStorage.removeItem(key);
      } else {
        delete _memoryStorage[key];
      }

      return true;
    } catch (e) {
      console.error('SessionStorageAdapter.remove error:', e);
      return false;
    }
  }

  /**
   * Clear all session storage
   * @returns {boolean} Success status
   */
  function clear() {
    try {
      if (_isAvailable) {
        sessionStorage.clear();
      } else {
        _memoryStorage = {};
      }

      return true;
    } catch (e) {
      console.error('SessionStorageAdapter.clear error:', e);
      return false;
    }
  }

  /**
   * Check if key exists in session storage
   * @param {string} key - Storage key
   * @returns {boolean}
   */
  function has(key) {
    if (!key) {
      return false;
    }

    try {
      if (_isAvailable) {
        return sessionStorage.getItem(key) !== null;
      } else {
        return _memoryStorage.hasOwnProperty(key);
      }
    } catch (e) {
      console.error('SessionStorageAdapter.has error:', e);
      return false;
    }
  }

  /**
   * Get all keys in session storage
   * @returns {Array<string>} Array of keys
   */
  function keys() {
    try {
      if (_isAvailable) {
        return Object.keys(sessionStorage);
      } else {
        return Object.keys(_memoryStorage);
      }
    } catch (e) {
      console.error('SessionStorageAdapter.keys error:', e);
      return [];
    }
  }

  /**
   * Get number of items in session storage
   * @returns {number}
   */
  function length() {
    try {
      if (_isAvailable) {
        return sessionStorage.length;
      } else {
        return Object.keys(_memoryStorage).length;
      }
    } catch (e) {
      console.error('SessionStorageAdapter.length error:', e);
      return 0;
    }
  }

  /**
   * Get all items as object
   * @returns {Object} All stored items
   */
  function getAll() {
    var items = {};

    try {
      var allKeys = keys();

      for (var i = 0; i < allKeys.length; i++) {
        var key = allKeys[i];
        items[key] = get(key);
      }

      return items;
    } catch (e) {
      console.error('SessionStorageAdapter.getAll error:', e);
      return {};
    }
  }

  /**
   * Set multiple items at once
   * @param {Object} items - Object with key-value pairs
   * @returns {boolean} Success status
   */
  function setMultiple(items) {
    if (!items || typeof items !== 'object') {
      console.error('SessionStorageAdapter.setMultiple: Items must be an object');
      return false;
    }

    try {
      for (var key in items) {
        if (items.hasOwnProperty(key)) {
          set(key, items[key]);
        }
      }

      return true;
    } catch (e) {
      console.error('SessionStorageAdapter.setMultiple error:', e);
      return false;
    }
  }

  /**
   * Remove multiple items at once
   * @param {Array<string>} keys - Array of keys to remove
   * @returns {boolean} Success status
   */
  function removeMultiple(keys) {
    if (!Array.isArray(keys)) {
      console.error('SessionStorageAdapter.removeMultiple: Keys must be an array');
      return false;
    }

    try {
      for (var i = 0; i < keys.length; i++) {
        remove(keys[i]);
      }

      return true;
    } catch (e) {
      console.error('SessionStorageAdapter.removeMultiple error:', e);
      return false;
    }
  }

  /**
   * Check if sessionStorage is available
   * @returns {boolean}
   */
  function isAvailable() {
    return _isAvailable;
  }

  /**
   * Get storage info
   * @returns {Object} Storage information
   */
  function getInfo() {
    return {
      available: _isAvailable,
      type: _isAvailable ? 'sessionStorage' : 'memoryStorage',
      itemCount: length(),
      keys: keys()
    };
  }

  // Public API
  return {
    set: set,
    get: get,
    remove: remove,
    clear: clear,
    has: has,
    keys: keys,
    length: length,
    getAll: getAll,
    setMultiple: setMultiple,
    removeMultiple: removeMultiple,
    isAvailable: isAvailable,
    getInfo: getInfo
  };
})();

// Auto log on load (only in development)
if (typeof AppConfig !== 'undefined' && AppConfig.isDevelopment()) {
  console.log('SessionStorageAdapter loaded:', SessionStorageAdapter.getInfo());
}