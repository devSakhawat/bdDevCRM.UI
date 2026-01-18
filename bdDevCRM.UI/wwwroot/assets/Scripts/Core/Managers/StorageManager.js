/*=========================================================
 * Storage Manager
 * File: StorageManager.js
 * Description: Centralized storage management
 * Author: devSakhawat
 * Date: 2025-12-08
=========================================================*/

var StorageManager = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Storage Keys
  // ============================================
  var _keys = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    accessTokenExpiry: 'accessTokenExpiry',
    refreshTokenExpiry: 'refreshTokenExpiry',
    userInfo: 'userInfo',
    menuCache: 'menuCache'
  };

  // ============================================
  // PUBLIC - Token Management
  // ============================================

  /**
   * Store authentication tokens
   * @param {object} tokenResponse - { AccessToken, RefreshToken, AccessTokenExpiry, RefreshTokenExpiry }
   */
  function setTokens(tokenResponse) {
    if (!tokenResponse) {
      console.error('TokenResponse is null or undefined');
      return;
    }

    try {
      localStorage.setItem(_keys.accessToken, tokenResponse.AccessToken);
      localStorage.setItem(_keys.refreshToken, tokenResponse.RefreshToken);
      localStorage.setItem(_keys.accessTokenExpiry, tokenResponse.AccessTokenExpiry);
      localStorage.setItem(_keys.refreshTokenExpiry, tokenResponse.RefreshTokenExpiry);

      // console.log('Tokens stored successfully');
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get access token
   * @returns {string|null}
   */
  function getAccessToken() {
    return localStorage.getItem(_keys.accessToken);
  }

  /**
   * Get refresh token
   * @returns {string|null}
   */
  function getRefreshToken() {
    return localStorage.getItem(_keys.refreshToken);
  }

  /**
   * Get access token expiry
   * @returns {Date|null}
   */
  function getAccessTokenExpiry() {
    var expiry = localStorage.getItem(_keys.accessTokenExpiry);
    return expiry ? new Date(expiry) : null;
  }

  /**
   * Get refresh token expiry
   * @returns {Date|null}
   */
  function getRefreshTokenExpiry() {
    var expiry = localStorage.getItem(_keys.refreshTokenExpiry);
    return expiry ? new Date(expiry) : null;
  }

  /**
   * Check if access token is expired
   * @returns {boolean}
   */
  function isAccessTokenExpired() {
    var expiry = getAccessTokenExpiry();
    if (!expiry) return true;

    // Consider token expired if less than 2 minutes remaining
    var bufferMinutes = 2;
    var expiryWithBuffer = new Date(expiry.getTime() - bufferMinutes * 60 * 1000);

    return new Date() >= expiryWithBuffer;
  }

  /**
   * Check if refresh token is expired
   * @returns {boolean}
   */
  function isRefreshTokenExpired() {
    var expiry = getRefreshTokenExpiry();
    if (!expiry) return true;

    return new Date() >= expiry;
  }

  /**
   * Clear all tokens
   */
  function clearTokens() {
    localStorage.removeItem(_keys.accessToken);
    localStorage.removeItem(_keys.refreshToken);
    localStorage.removeItem(_keys.accessTokenExpiry);
    localStorage.removeItem(_keys.refreshTokenExpiry);

    // console.log('Tokens cleared');
  }

  // ============================================
  // PUBLIC - User Info Management
  // ============================================

  /**
   * Store user info
   * @param {object} userInfo
   */
  function setUserInfo(userInfo) {
    try {
      localStorage.setItem(_keys.userInfo, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Failed to store user info:', error);
    }
  }

  /**
   * Get user info
   * @returns {object|null}
   */
  function getUserInfo() {
    try {
      var userInfo = localStorage.getItem(_keys.userInfo);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  /**
   * Clear user info
   */
  function clearUserInfo() {
    localStorage.removeItem(_keys.userInfo);
    // console.log('User info cleared');
  }

  // ============================================
  // PUBLIC - Menu Cache Management
  // ============================================

  /**
   * Cache menu data
   * @param {Array} menuData
   */
  function cacheMenu(menuData) {
    try {
      var userInfo = getUserInfo();
      if (!userInfo) return;

      var cacheKey = _keys.menuCache + '_' + userInfo.UserId;
      var cacheData = {
        data: menuData,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache menu:', error);
    }
  }

  /**
   * Get cached menu
   * @returns {Array|null}
   */
  function getCachedMenu() {
    try {
      var userInfo = getUserInfo();
      if (!userInfo) return null;

      var cacheKey = _keys.menuCache + '_' + userInfo.UserId;
      var cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      var cacheData = JSON.parse(cached);

      // Check cache expiry (1 hour)
      var cacheTime = new Date(cacheData.timestamp);
      var hoursDiff = (new Date() - cacheTime) / (1000 * 60 * 60);

      if (hoursDiff > 1) {
        clearMenuCache();
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached menu:', error);
      return null;
    }
  }

  /**
   * Clear menu cache
   */
  function clearMenuCache() {
    try {
      var userInfo = getUserInfo();
      if (!userInfo) return;

      var cacheKey = _keys.menuCache + '_' + userInfo.UserId;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Failed to clear menu cache:', error);
    }
  }

  // ============================================
  // PUBLIC - Generic Storage
  // ============================================

  /**
   * Set item in localStorage
   * @param {string} key
   * @param {any} value
   */
  function setItem(key, value) {
    try {
      var stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.error('Failed to set item:', error);
    }
  }

  /**
   * Get item from localStorage
   * @param {string} key
   * @returns {any}
   */
  function getItem(key) {
    try {
      var value = localStorage.getItem(key);
      if (!value) return null;

      // Try to parse JSON
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Failed to get item:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key
   */
  function removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }

  /**
   * Clear all storage
   */
  function clearAll() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    // Token management
    setTokens: setTokens,
    getAccessToken: getAccessToken,
    getRefreshToken: getRefreshToken,
    getAccessTokenExpiry: getAccessTokenExpiry,
    getRefreshTokenExpiry: getRefreshTokenExpiry,
    isAccessTokenExpired: isAccessTokenExpired,
    isRefreshTokenExpired: isRefreshTokenExpired,
    clearTokens: clearTokens,

    // User info management
    setUserInfo: setUserInfo,
    getUserInfo: getUserInfo,
    clearUserInfo: clearUserInfo,

    // Menu cache management
    cacheMenu: cacheMenu,
    getCachedMenu: getCachedMenu,
    clearMenuCache: clearMenuCache,

    // Generic storage
    setItem: setItem,
    getItem: getItem,
    removeItem: removeItem,
    clearAll: clearAll
  };
})();
