
/*=========================================================
 * State Manager
 * File: StateManager.js
 * Description: Centralized application state management
 * Author: devSakhawat
 * Date: 2026-01-25
=========================================================*/

var StateManager = (function () {
  'use strict';

  /////////////////////////////////////////////////////////////
  // PRIVATE - State Storage
  /////////////////////////////////////////////////////////////

  var _state = {
    // User information
    user: {
      userId: null,
      userName: null,
      email: null,
      roles: [],
      permissions: [],
      isAuthenticated: false
    },

    // Application state
    app: {
      currentModule: null,
      currentRoute: null,
      isLoading: false,
      isOnline: navigator.onLine,
      theme: 'light'
    },

    // Form state
    forms: {},

    // Grid state
    grids: {},

    // Custom state
    custom: {}
  };

  var _subscribers = {};
  var _config = {
    enableLogging: true,
    persistToStorage: true,
    storageKey: 'bdDevCRM_state'
  };

  /////////////////////////////////////////////////////////////
  // PRIVATE - Helper Functions
  /////////////////////////////////////////////////////////////

  /**
   * Log state changes
   */
  function _log(message, data) {
    if (_config.enableLogging) {
      console.log(`[StateManager] ${message}`, data || '');
    }
  }

  /**
   * Deep clone object
   */
  function _deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => _deepClone(item));

    const cloned = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = _deepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Get nested property
   */
  function _getNestedProperty(obj, path) {
    const keys = path.split('.');
    let result = obj;

    for (let key of keys) {
      if (result && result.hasOwnProperty(key)) {
        result = result[key];
      } else {
        return undefined;
      }
    }

    return result;
  }

  /**
   * Set nested property
   */
  function _setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;

    for (let key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
  }

  /**
   * Notify subscribers
   */
  function _notify(path, newValue, oldValue) {
    const subscribers = _subscribers[path] || [];

    subscribers.forEach(callback => {
      try {
        callback(newValue, oldValue, path);
      } catch (error) {
        console.error('[StateManager] Error in subscriber callback:', error);
      }
    });

    // Notify wildcard subscribers
    const wildcardSubscribers = _subscribers['*'] || [];
    wildcardSubscribers.forEach(callback => {
      try {
        callback(newValue, oldValue, path);
      } catch (error) {
        console.error('[StateManager] Error in wildcard subscriber:', error);
      }
    });
  }

  /**
   * Persist state to storage
   */
  function _persistState() {
    if (!_config.persistToStorage) return;

    try {
      const stateToSave = {
        user: _state.user,
        app: _state.app,
        custom: _state.custom
      };

      localStorage.setItem(_config.storageKey, JSON.stringify(stateToSave));
      _log('State persisted to storage');
    } catch (error) {
      console.error('[StateManager] Error persisting state:', error);
    }
  }

  /**
   * Load state from storage
   */
  function _loadState() {
    if (!_config.persistToStorage) return;

    try {
      const saved = localStorage.getItem(_config.storageKey);
      if (!saved) return;

      const loaded = JSON.parse(saved);

      if (loaded.user) _state.user = loaded.user;
      if (loaded.app) _state.app = loaded.app;
      if (loaded.custom) _state.custom = loaded.custom;

      _log('State loaded from storage');
    } catch (error) {
      console.error('[StateManager] Error loading state:', error);
    }
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - User State
  /////////////////////////////////////////////////////////////

  /**
   * Set user information
   * @param {Object} userInfo - User information
   */
  function setUser(userInfo) {
    if (!userInfo) return;

    const oldUser = _deepClone(_state.user);

    _state.user = {
      userId: userInfo.UserId || userInfo.userId || null,
      userName: userInfo.UserName || userInfo.userName || null,
      email: userInfo.Email || userInfo.email || null,
      roles: userInfo.Roles || userInfo.roles || [],
      permissions: userInfo.Permissions || userInfo.permissions || [],
      isAuthenticated: true
    };

    _notify('user', _state.user, oldUser);
    _persistState();

    _log('User state updated:', _state.user);
  }

  /**
   * Get user information
   * @returns {Object} User information
   */
  function getUser() {
    return _deepClone(_state.user);
  }

  /**
   * Clear user state
   */
  function clearUser() {
    const oldUser = _deepClone(_state.user);

    _state.user = {
      userId: null,
      userName: null,
      email: null,
      roles: [],
      permissions: [],
      isAuthenticated: false
    };

    _notify('user', _state.user, oldUser);
    _persistState();

    _log('User state cleared');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  function isAuthenticated() {
    return _state.user.isAuthenticated === true;
  }

  /**
   * Check if user has role
   * @param {string} role - Role name
   * @returns {boolean}
   */
  function hasRole(role) {
    return _state.user.roles.includes(role);
  }

  /**
   * Check if user has permission
   * @param {string} permission - Permission name
   * @returns {boolean}
   */
  function hasPermission(permission) {
    return _state.user.permissions.includes(permission);
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Application State
  /////////////////////////////////////////////////////////////

  /**
   * Set current module
   * @param {string} moduleName - Module name
   */
  function setCurrentModule(moduleName) {
    const oldModule = _state.app.currentModule;
    _state.app.currentModule = moduleName;

    _notify('app.currentModule', moduleName, oldModule);
    _persistState();

    _log('Current module set:', moduleName);
  }

  /**
   * Get current module
   * @returns {string} Current module name
   */
  function getCurrentModule() {
    return _state.app.currentModule;
  }

  /**
   * Set current route
   * @param {string} route - Route path
   */
  function setCurrentRoute(route) {
    const oldRoute = _state.app.currentRoute;
    _state.app.currentRoute = route;

    _notify('app.currentRoute', route, oldRoute);
    _persistState();

    _log('Current route set:', route);
  }

  /**
   * Get current route
   * @returns {string} Current route
   */
  function getCurrentRoute() {
    return _state.app.currentRoute;
  }

  /**
   * Set loading state
   * @param {boolean} isLoading - Loading status
   */
  function setLoading(isLoading) {
    const oldLoading = _state.app.isLoading;
    _state.app.isLoading = isLoading;

    _notify('app.isLoading', isLoading, oldLoading);

    _log('Loading state set:', isLoading);
  }

  /**
   * Get loading state
   * @returns {boolean} Loading status
   */
  function isLoading() {
    return _state.app.isLoading;
  }

  /**
   * Set online state
   * @param {boolean} isOnline - Online status
   */
  function setOnline(isOnline) {
    const oldOnline = _state.app.isOnline;
    _state.app.isOnline = isOnline;

    _notify('app.isOnline', isOnline, oldOnline);

    _log('Online state set:', isOnline);
  }

  /**
   * Get online state
   * @returns {boolean} Online status
   */
  function isOnline() {
    return _state.app.isOnline;
  }

  /**
   * Set theme
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  function setTheme(theme) {
    const oldTheme = _state.app.theme;
    _state.app.theme = theme;

    _notify('app.theme', theme, oldTheme);
    _persistState();

    _log('Theme set:', theme);
  }

  /**
   * Get theme
   * @returns {string} Theme name
   */
  function getTheme() {
    return _state.app.theme;
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Form State
  /////////////////////////////////////////////////////////////

  /**
   * Save form state
   * @param {string} formId - Form ID
   * @param {Object} formData - Form data
   */
  function saveFormState(formId, formData) {
    if (!formId) return;

    _state.forms[formId] = {
      data: _deepClone(formData),
      savedAt: Date.now()
    };

    _notify(`forms.${formId}`, _state.forms[formId], null);

    _log('Form state saved:', formId);
  }

  /**
   * Get form state
   * @param {string} formId - Form ID
   * @returns {Object} Form data
   */
  function getFormState(formId) {
    if (!formId || !_state.forms[formId]) return null;

    return _deepClone(_state.forms[formId].data);
  }

  /**
   * Clear form state
   * @param {string} formId - Form ID
   */
  function clearFormState(formId) {
    if (!formId) return;

    const oldState = _state.forms[formId];
    delete _state.forms[formId];

    _notify(`forms.${formId}`, null, oldState);

    _log('Form state cleared:', formId);
  }

  /**
   * Has form state
   * @param {string} formId - Form ID
   * @returns {boolean}
   */
  function hasFormState(formId) {
    return !!_state.forms[formId];
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Grid State
  /////////////////////////////////////////////////////////////

  /**
   * Save grid state
   * @param {string} gridId - Grid ID
   * @param {Object} gridState - Grid state (page, filters, sort)
   */
  function saveGridState(gridId, gridState) {
    if (!gridId) return;

    _state.grids[gridId] = {
      state: _deepClone(gridState),
      savedAt: Date.now()
    };

    _notify(`grids.${gridId}`, _state.grids[gridId], null);

    _log('Grid state saved:', gridId);
  }

  /**
   * Get grid state
   * @param {string} gridId - Grid ID
   * @returns {Object} Grid state
   */
  function getGridState(gridId) {
    if (!gridId || !_state.grids[gridId]) return null;

    return _deepClone(_state.grids[gridId].state);
  }

  /**
   * Clear grid state
   * @param {string} gridId - Grid ID
   */
  function clearGridState(gridId) {
    if (!gridId) return;

    const oldState = _state.grids[gridId];
    delete _state.grids[gridId];

    _notify(`grids.${gridId}`, null, oldState);

    _log('Grid state cleared:', gridId);
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Custom State
  /////////////////////////////////////////////////////////////

  /**
   * Set custom state
   * @param {string} key - State key (supports nested: 'module.property')
   * @param {any} value - State value
   */
  function setState(key, value) {
    if (!key) return;

    const oldValue = _getNestedProperty(_state.custom, key);
    _setNestedProperty(_state.custom, key, _deepClone(value));

    _notify(`custom.${key}`, value, oldValue);
    _persistState();

    _log('Custom state set:', { key, value });
  }

  /**
   * Get custom state
   * @param {string} key - State key (supports nested)
   * @returns {any} State value
   */
  function getState(key) {
    if (!key) return null;

    const value = _getNestedProperty(_state.custom, key);
    return _deepClone(value);
  }

  /**
   * Remove custom state
   * @param {string} key - State key
   */
  function removeState(key) {
    if (!key) return;

    const keys = key.split('.');
    const lastKey = keys.pop();
    let current = _state.custom;

    for (let k of keys) {
      if (!current[k]) return;
      current = current[k];
    }

    const oldValue = current[lastKey];
    delete current[lastKey];

    _notify(`custom.${key}`, null, oldValue);
    _persistState();

    _log('Custom state removed:', key);
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Subscriptions
  /////////////////////////////////////////////////////////////

  /**
   * Subscribe to state changes
   * @param {string} path - State path ('user', 'app.theme', 'custom.myKey', '*' for all)
   * @param {Function} callback - Callback function (newValue, oldValue, path)
   * @returns {Function} Unsubscribe function
   */
  function subscribe(path, callback) {
    if (!path || typeof callback !== 'function') return;

    if (!_subscribers[path]) {
      _subscribers[path] = [];
    }

    _subscribers[path].push(callback);

    _log('Subscribed to:', path);

    // Return unsubscribe function
    return function unsubscribe() {
      const index = _subscribers[path].indexOf(callback);
      if (index > -1) {
        _subscribers[path].splice(index, 1);
        _log('Unsubscribed from:', path);
      }
    };
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - State Management
  /////////////////////////////////////////////////////////////

  /**
   * Get entire state (snapshot)
   * @returns {Object} Complete state
   */
  function getSnapshot() {
    return _deepClone(_state);
  }

  /**
   * Reset state to default
   */
  function reset() {
    const oldState = _deepClone(_state);

    _state = {
      user: {
        userId: null,
        userName: null,
        email: null,
        roles: [],
        permissions: [],
        isAuthenticated: false
      },
      app: {
        currentModule: null,
        currentRoute: null,
        isLoading: false,
        isOnline: navigator.onLine,
        theme: 'light'
      },
      forms: {},
      grids: {},
      custom: {}
    };

    _notify('*', _state, oldState);
    _persistState();

    _log('State reset to default');
  }

  /**
   * Clear all state (including storage)
   */
  function clearAll() {
    reset();

    if (_config.persistToStorage) {
      localStorage.removeItem(_config.storageKey);
    }

    _log('All state cleared');
  }

  /////////////////////////////////////////////////////////////
  // PUBLIC - Configuration
  /////////////////////////////////////////////////////////////

  /**
   * Set configuration
   * @param {Object} config - Configuration options
   */
  function setConfig(config) {
    if (!config || typeof config !== 'object') return;

    if (config.enableLogging !== undefined) {
      _config.enableLogging = config.enableLogging;
    }

    if (config.persistToStorage !== undefined) {
      _config.persistToStorage = config.persistToStorage;
    }

    if (config.storageKey !== undefined) {
      _config.storageKey = config.storageKey;
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
  // INITIALIZATION
  /////////////////////////////////////////////////////////////

  // Load state from storage on init
  _loadState();

  // Listen to online/offline events
  window.addEventListener('online', function () {
    setOnline(true);
  });

  window.addEventListener('offline', function () {
    setOnline(false);
  });

  /////////////////////////////////////////////////////////////
  // PUBLIC API
  /////////////////////////////////////////////////////////////

  return {
    // User state
    setUser: setUser,
    getUser: getUser,
    clearUser: clearUser,
    isAuthenticated: isAuthenticated,
    hasRole: hasRole,
    hasPermission: hasPermission,

    // Application state
    setCurrentModule: setCurrentModule,
    getCurrentModule: getCurrentModule,
    setCurrentRoute: setCurrentRoute,
    getCurrentRoute: getCurrentRoute,
    setLoading: setLoading,
    isLoading: isLoading,
    setOnline: setOnline,
    isOnline: isOnline,
    setTheme: setTheme,
    getTheme: getTheme,

    // Form state
    saveFormState: saveFormState,
    getFormState: getFormState,
    clearFormState: clearFormState,
    hasFormState: hasFormState,

    // Grid state
    saveGridState: saveGridState,
    getGridState: getGridState,
    clearGridState: clearGridState,

    // Custom state
    setState: setState,
    getState: getState,
    removeState: removeState,

    // Subscriptions
    subscribe: subscribe,

    // State management
    getSnapshot: getSnapshot,
    reset: reset,
    clearAll: clearAll,

    // Configuration
    setConfig: setConfig,
    getConfig: getConfig
  };
})();

// Auto-initialize
if (typeof window !== 'undefined') {
  window.StateManager = StateManager;
  console.log('%c[StateManager] ✓ Loaded and initialized', 'color: #2196F3; font-weight: bold;');
}






///*=========================================================
// * Storage Manager
// * File: StorageManager.js
// * Description: Centralized storage management
// * Author: devSakhawat
// * Date: 2025-12-08
//=========================================================*/

//var StorageManager = (function () {
//  'use strict';

//  // ============================================
//  // PRIVATE - Configuration
//  // ============================================
//  var _config = {
//    prefix: 'bdDevCRM_',
//    tokenKeys: {
//      accessToken: 'accessToken',
//      refreshToken: 'refreshToken',
//      accessTokenExpiry: 'accessTokenExpiry',
//      refreshTokenExpiry: 'refreshTokenExpiry'
//    },
//    userInfoKey: 'userInfo',
//    menuCacheKey: 'menuCache',
//    menuCacheExpiry: 'menuCacheExpiry',
//    menuCacheDuration: 30 * 60 * 1000 // 30 minutes
//  };

//  // ============================================
//  // PRIVATE - Helper Functions
//  // ============================================
//  function _getKey(key) {
//    return _config.prefix + key;
//  }

//  function _get(key) {
//    try {
//      var item = localStorage.getItem(_getKey(key));
//      if (item) {
//        return JSON.parse(item);
//      }
//      return null;
//    } catch (e) {
//      console.error('StorageManager: Error getting item', key, e);
//      return null;
//    }
//  }

//  function _set(key, value) {
//    try {
//      localStorage.setItem(_getKey(key), JSON.stringify(value));
//    } catch (e) {
//      console.error('StorageManager: Error setting item', key, e);
//    }
//  }

//  function _remove(key) {
//    try {
//      localStorage.removeItem(_getKey(key));
//    } catch (e) {
//      console.error('StorageManager: Error removing item', key, e);
//    }
//  }

//  // ============================================
//  // PUBLIC - Token Methods
//  // ============================================
//  function getAccessToken() {
//    return _get(_config.tokenKeys.accessToken);
//  }

//  function getRefreshToken() {
//    return _get(_config.tokenKeys.refreshToken);
//  }

//  function setTokens(data) {
//    if (!data) return;

//    if (data.AccessToken) {
//      _set(_config.tokenKeys.accessToken, data.AccessToken);
//    }
//    if (data.RefreshToken) {
//      _set(_config.tokenKeys.refreshToken, data.RefreshToken);
//    }
//    if (data.AccessTokenExpiry) {
//      _set(_config.tokenKeys.accessTokenExpiry, data.AccessTokenExpiry);
//    }
//    if (data.RefreshTokenExpiry) {
//      _set(_config.tokenKeys.refreshTokenExpiry, data.RefreshTokenExpiry);
//    }
//  }

//  function clearTokens() {
//    _remove(_config.tokenKeys.accessToken);
//    _remove(_config.tokenKeys.refreshToken);
//    _remove(_config.tokenKeys.accessTokenExpiry);
//    _remove(_config.tokenKeys.refreshTokenExpiry);
//  }

//  // ============================================
//  // PUBLIC - Token Expiry Methods
//  // ============================================
//  function getAccessTokenExpiry() {
//    return _get(_config.tokenKeys.accessTokenExpiry);
//  }

//  function getRefreshTokenExpiry() {
//    return _get(_config.tokenKeys.refreshTokenExpiry);
//  }

//  function isAccessTokenExpired() {
//    var expiry = getAccessTokenExpiry();
//    if (!expiry) return true;

//    var expiryDate = new Date(expiry);
//    var now = new Date();

//    // Add 2 minute buffer
//    return now >= new Date(expiryDate.getTime() - 2 * 60 * 1000);
//  }

//  function isRefreshTokenExpired() {
//    var expiry = getRefreshTokenExpiry();
//    if (!expiry) return true;

//    var expiryDate = new Date(expiry);
//    var now = new Date();

//    return now >= expiryDate;
//  }

//  // ============================================
//  // PUBLIC - User Info Methods
//  // ============================================
//  function getUserInfo() {
//    return _get(_config.userInfoKey);
//  }

//  function setUserInfo(info) {
//    _set(_config.userInfoKey, info);
//  }

//  function clearUserInfo() {
//    _remove(_config.userInfoKey);
//  }

//  // ============================================
//  // PUBLIC - Menu Cache Methods
//  // ============================================
//  function getCachedMenu() {
//    var expiry = _get(_config.menuCacheExpiry);

//    // Check if cache is expired
//    if (!expiry || new Date() > new Date(expiry)) {
//      clearMenuCache();
//      return null;
//    }

//    return _get(_config.menuCacheKey);
//  }

//  function cacheMenu(menuData) {
//    if (!menuData || !Array.isArray(menuData)) return;

//    _set(_config.menuCacheKey, menuData);

//    // Set expiry time
//    var expiryTime = new Date(Date.now() + _config.menuCacheDuration);
//    _set(_config.menuCacheExpiry, expiryTime.toISOString());
//  }

//  function clearMenuCache() {
//    _remove(_config.menuCacheKey);
//    _remove(_config.menuCacheExpiry);
//  }

//  // ============================================
//  // PUBLIC - General Methods
//  // ============================================
//  function clearAll() {
//    clearTokens();
//    clearUserInfo();
//    clearMenuCache();

//    // Clear all prefixed items
//    var keysToRemove = [];
//    for (var i = 0; i < localStorage.length; i++) {
//      var key = localStorage.key(i);
//      if (key && key.startsWith(_config.prefix)) {
//        keysToRemove.push(key);
//      }
//    }

//    keysToRemove.forEach(function (key) {
//      localStorage.removeItem(key);
//    });
//  }

//  function get(key) {
//    return _get(key);
//  }

//  function set(key, value) {
//    _set(key, value);
//  }

//  function remove(key) {
//    _remove(key);
//  }

//  // ============================================
//  // PUBLIC API
//  // ============================================
//  return {
//    // Token Methods
//    getAccessToken: getAccessToken,
//    getRefreshToken: getRefreshToken,
//    setTokens: setTokens,
//    clearTokens: clearTokens,

//    // Token Expiry Methods
//    getAccessTokenExpiry: getAccessTokenExpiry,
//    getRefreshTokenExpiry: getRefreshTokenExpiry,
//    isAccessTokenExpired: isAccessTokenExpired,
//    isRefreshTokenExpired: isRefreshTokenExpired,

//    // User Info Methods
//    getUserInfo: getUserInfo,
//    setUserInfo: setUserInfo,
//    clearUserInfo: clearUserInfo,

//    // Menu Cache Methods
//    getCachedMenu: getCachedMenu,
//    cacheMenu: cacheMenu,
//    clearMenuCache: clearMenuCache,

//    // General Methods
//    clearAll: clearAll,
//    get: get,
//    set: set,
//    remove: remove
//  };
//})();

//console.log('%c[StorageManager] ✓ Loaded', 'color: #4CAF50; font-weight: bold;');