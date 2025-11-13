/*=========================================================
 * Storage Manager
 * File: StorageManager.js
 * Description: Unified localStorage and sessionStorage wrapper
 * Author: devSakhawat
 * Date: 2025-11-13
=========================================================*/

var StorageManager = (function () {
  'use strict';

  /**
   * Local Storage Adapter
   */
  var LocalStorageAdapter = {
    set: function (key, value) {
      try {
        var serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
      } catch (e) {
        console.error('LocalStorage set error:', e);
        return false;
      }
    },

    get: function (key, defaultValue) {
      try {
        var item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
      } catch (e) {
        console.error('LocalStorage get error:', e);
        return defaultValue;
      }
    },

    remove: function (key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error('LocalStorage remove error:', e);
        return false;
      }
    },

    clear: function () {
      try {
        localStorage.clear();
        return true;
      } catch (e) {
        console.error('LocalStorage clear error:', e);
        return false;
      }
    },

    has: function (key) {
      return localStorage.getItem(key) !== null;
    },

    keys: function () {
      return Object.keys(localStorage);
    }
  };

  /**
   * Session Storage Adapter
   */
  var SessionStorageAdapter = {
    set: function (key, value) {
      try {
        var serialized = JSON.stringify(value);
        sessionStorage.setItem(key, serialized);
        return true;
      } catch (e) {
        console.error('SessionStorage set error:', e);
        return false;
      }
    },

    get: function (key, defaultValue) {
      try {
        var item = sessionStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
      } catch (e) {
        console.error('SessionStorage get error:', e);
        return defaultValue;
      }
    },

    remove: function (key) {
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error('SessionStorage remove error:', e);
        return false;
      }
    },

    clear: function () {
      try {
        sessionStorage.clear();
        return true;
      } catch (e) {
        console.error('SessionStorage clear error:', e);
        return false;
      }
    },

    has: function (key) {
      return sessionStorage.getItem(key) !== null;
    },

    keys: function () {
      return Object.keys(sessionStorage);
    }
  };

  /**
   * Memory Storage (fallback)
   */
  var MemoryStorageAdapter = (function () {
    var _storage = {};

    return {
      set: function (key, value) {
        _storage[key] = value;
        return true;
      },

      get: function (key, defaultValue) {
        return _storage.hasOwnProperty(key) ? _storage[key] : defaultValue;
      },

      remove: function (key) {
        delete _storage[key];
        return true;
      },

      clear: function () {
        _storage = {};
        return true;
      },

      has: function (key) {
        return _storage.hasOwnProperty(key);
      },

      keys: function () {
        return Object.keys(_storage);
      }
    };
  })();

  /**
   * Check if storage is available
   */
  function _isStorageAvailable(type) {
    try {
      var storage = window[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get appropriate adapter
   */
  function _getAdapter(type) {
    if (type === 'session') {
      return _isStorageAvailable('sessionStorage')
        ? SessionStorageAdapter
        : MemoryStorageAdapter;
    } else {
      return _isStorageAvailable('localStorage')
        ? LocalStorageAdapter
        : MemoryStorageAdapter;
    }
  }

  // Public API
  return {
    // Local Storage
    local: LocalStorageAdapter,

    // Session Storage
    session: SessionStorageAdapter,

    // Memory Storage
    memory: MemoryStorageAdapter,

    // Unified methods (uses localStorage by default)
    set: function (key, value, useSession) {
      var adapter = _getAdapter(useSession ? 'session' : 'local');
      return adapter.set(key, value);
    },

    get: function (key, defaultValue, useSession) {
      var adapter = _getAdapter(useSession ? 'session' : 'local');
      return adapter.get(key, defaultValue);
    },

    remove: function (key, useSession) {
      var adapter = _getAdapter(useSession ? 'session' : 'local');
      return adapter.remove(key);
    },

    clear: function (useSession) {
      var adapter = _getAdapter(useSession ? 'session' : 'local');
      return adapter.clear();
    },

    has: function (key, useSession) {
      var adapter = _getAdapter(useSession ? 'session' : 'local');
      return adapter.has(key);
    },

    keys: function (useSession) {
      var adapter = _getAdapter(useSession ? 'session' : 'local');
      return adapter.keys();
    }
  };
})();