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