

/*=========================================================
 * Storage Manager
 * File: StorageManager.js
 * Description: Centralized storage management
 * Author: devSakhawat
 * Date: 2026-02-13
=========================================================*/
var StorageManager = (function () {
  'use strict';

  // ============================================================================
  // PRIVATE CONSTANTS
  // ============================================================================
  var STORAGE_KEYS = {
    // Access token expire track
    REFRESH_TOKEN_EXPIRY: 'refresh_token_expiry',
    USER_INFO: 'user_info',
    USER_SESSION: 'user_session',
    MENU_CACHE: 'menu_cache',
    // Access token expire track
    ACCESS_TOKEN: 'access_token',
    TOKEN_EXPIRY: 'token_expiry',
    TOKEN_TYPE: 'token_type'
  }


  // ============================================================================
  // PRIVATE HELOPER METHODS
  // ============================================================================

  /**
   * Safly get Item from localStorage
   * @param {any} key
   * @returns
   */
  function _safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('[StorageManager] Error reading from localStorage: ', e);
      return null;
    }
  }

  /**
   * Safly set Item to localStorage
   * @param {any} key
   * @param {any} value
   * @returns
   */
  function _safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('[StorageManager] Error writing to localStorage:', e);
      return false;
    }
  }

  /**
   * Safely remove item from localStorage
   * @param {any} key
   * @returns
   * @private
   */
  function _safeRemoveItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('[StorageManager] Error removing from localStorage:', e);
      return false;
    }
  }

  /**
   * Parse ISO date string to timestamp
   * @param {any} isoString
   * @returns
   */
  function _parseISOToTimestamp(isoString) {
    if (!isoString) return null;
    try {
      return new Date(isoString).getTime();
    } catch (e) {
      console.error('[StorageManager] Error parsing date:', e);
      return null;
    }
  }

  /**
   * 
   * @param {any} tokenData
   * @returns
   */
  function _setAccessToken(tokenData) {

    // Default to 15 minutes if not provided
    var tokenLifetime = tokenData.ExpiresIn || 900;
    var expiryTimestamp = _calculateExpiry(tokenLifetime);

    // Store token and metadata
    var success = _safeSetItem(STORAGE_KEYS.ACCESS_TOKEN, tokenData.AccessToken);
    success = _safeSetItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimestamp.toString()) && success;
    success = _safeSetItem(STORAGE_KEYS.TOKEN_TYPE, tokenData.TokenType) && success;

    if (success) {
      console.log(' Access token stored successfully. Expires in ' + tokenLifetime + ' seconds');
    }

    return success;
  }

  /**
   * 
   * @param {any} expiresInSeconds
   * @returns
   */
  function _calculateExpiry(expiresInSeconds) {
    var now = new Date().getTime();
    return now + (expiresInSeconds * 1000);
  }

  /**
  * Check if token is expired
  * @private
  */
  function _isTokenExpired() {
    var expiry = _safeGetItem(STORAGE_KEYS.TOKEN_EXPIRY);

    if (!expiry) {
      return true; // No expiry means no token
    }

    var expiryTime = parseInt(expiry, 10);
    var now = new Date().getTime();

    return now >= expiryTime;
  }

  // ============================================================================
  // PUBLIC API - Token Management
  // ============================================================================
  return {

    /**
     * Handle Access token by TokenStorage
     * @param {any} tokenData
     * @returns
     */
    setTokens: function (tokenData) {
      if (!tokenData || !tokenData.AccessToken) {
        console.error('[StorageManager] Invalid token data');
        return false;
      }

      //console.log('[StorageManager] Setting tokens...');
      //var expiresIn = tokenData.expiresIn || 900; // Default 15 minutes

      var success = _setAccessToken(tokenData);
      if (!success) {
        return false;
      }

      // Refresh token expiry track (token in cookie)
      // Backend automatically set cookie, we will only know about expier
      if (tokenData.RefreshTokenExpiry) {
        var refreshExpiry = _parseISOToTimestamp(tokenData.RefreshTokenExpiry);
        if (refreshExpiry) {
          _safeSetItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRY, refreshExpiry.toString());
          console.log('[StorageManager] Refresh token expiry tracked');
        }
        else {
          // if there are no RefreshTokenExpiry then set default 7 days 
          var defaultRefreshExpiry = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
          _safeSetItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRY, defaultRefreshExpiry.toString());
          console.log('[StorageManager] Using default refresh token expiry (7 days)');
        }
      }
      console.log('[StorageManager] Tokens set successfully');
      return true;
    },

    /**
     * Get access token (delegates to TokenStorage)
     * @returns {string|null}
     * @returns
     */
    getAccessToken: function () {
      // Check if token exists and is not expired
      if (_isTokenExpired()) {
        console.warn('[TokenStorage] Access token is expired or missing');
        this.clearTokens(); // Auto-cleanup expired tokens
        return null;
      }

      return _safeGetItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    /**
    * Get refresh token
    * 
    * CRITICAL: This function ALWAYS returns NULL!
    * Reason: The refresh token is stored exclusively in an HttpOnly cookie, 
    * which is intentionally inaccessible to JavaScript for security reasons.
    * 
    * @returns {null} Always returns null (token is securely stored in HttpOnly cookie)
    */
    getRefreshToken: function () {
      // IMPORTANT: Refresh token resides ONLY in HttpOnly cookie – NOT in localStorage/sessionStorage!
      // Backend automatically extracts the token from the cookie when the refresh endpoint is called.
      // NEVER attempt to access or handle refresh tokens in client-side JavaScript (critical security measure).
      return null;
    },

    /**
    * Check if access token is expired
    * @returns {boolean}
    */
    isAccessTokenExpired: function () {
      return !_isTokenExpired() && this.getAccessToken() !== null;
    },

    /**
     * Check if refresh token is expired
     * @returns {boolean}
     */
    isRefreshTokenExpired: function () {
      var expiry = _safeGetItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRY);

      if (!expiry) {
        console.warn('[StorageManager] No refresh token expiry found');
        return true; // No expiry means expired
      }

      var expiryTime = parseInt(expiry, 10);
      var now = new Date().getTime();
      var isExpired = now >= expiryTime;

      if (isExpired) {
        console.warn('[StorageManager] Refresh token expired');
      }

      return isExpired;
    },

    /**
     * Get access token expiry timestamp
     * @returns {number|null}
     */
    getAccessTokenExpiry: function () {
      var expiry = _safeGetItem(STORAGE_KEYS.TOKEN_EXPIRY);
      return expiry ? parseInt(expiry, 10) : null;
    },

    /**
     * Get refresh token expiry timestamp
     * @returns {number|null}
     */
    getRefreshTokenExpiry: function () {
      var expiry = _safeGetItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRY);
      return expiry ? parseInt(expiry, 10) : null;
    },

    /**
     * Check if should refresh access token soon
     * @param {number} thresholdSeconds - Refresh threshold (default: 120 = 2 minutes)
     * @returns {boolean}
     */
    shouldRefreshAccessToken: function (thresholdSeconds) {
      var threshold = thresholdSeconds || 60; // Default: refresh 1 minute before expiry
      var remaining = this.getRemainingLifetime();

      return remaining > 0 && remaining <= threshold;
    },

    hasValidToken: function () {
      return !_isTokenExpired() && this.getAccessToken() !== null;
    },

    /**
  * Get remaining token lifetime in seconds
  * @returns {number} Remaining seconds (0 if expired)
  */
    getRemainingLifetime: function () {
      var expiry = this.getAccessTokenExpiry();

      if (!expiry) {
        return 0;
      }

      var now = new Date().getTime();
      var remaining = Math.floor((expiry - now) / 1000);

      return remaining > 0 ? remaining : 0;
    },

    /**
     * Get token type (always "Bearer")
     * @returns {string} Token type
     */
    getTokenType: function () {
      return _safeGetItem(STORAGE_KEYS.TOKEN_TYPE) || TOKEN_TYPE;
    },

    /**
     * Get token info for debugging (DO NOT use in production logs)
     * @returns {object} Token metadata (without actual token value)
     */
    getTokenInfo: function () {
      var expiry = this.getTokenExpiry();
      var hasToken = this.getAccessToken() !== null;
      var remaining = this.getRemainingLifetime();

      return {
        hasToken: hasToken,
        isExpired: _isTokenExpired(),
        expiryTimestamp: expiry,
        expiryDate: expiry ? new Date(expiry).toISOString() : null,
        remainingSeconds: remaining,
        tokenType: this.getTokenType(),
        shouldRefresh: this.shouldRefreshToken()
      };
    },

    /**
     * Update token expiry (useful after refresh)
     * @param {number} expiresIn - New lifetime in seconds
     * @returns {boolean} Success status
     */
    updateTokenExpiry: function (expiresIn) {
      if (!this.getAccessToken()) {
        console.warn('[TokenStorage] Cannot update expiry - no token exists');
        return false;
      }

      var expiryTimestamp = _calculateExpiry(expiresIn);
      return _safeSetItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimestamp.toString());
    },

    /**
     * Clear all tokens (logout)
     */
    clearTokens: function () {
      console.log('[StorageManager] Clearing all tokens');

      var success = true;
      success = _safeRemoveItem(STORAGE_KEYS.ACCESS_TOKEN) && success;
      success = _safeRemoveItem(STORAGE_KEYS.TOKEN_EXPIRY) && success;
      success = _safeRemoveItem(STORAGE_KEYS.TOKEN_TYPE) && success;
      // Clear refresh token expiry (actual token in cookie, backend will clear )
      _safeRemoveItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRY);

      console.log('[StorageManager] Tokens cleared');
      return true;
    },


    // ============================================================================
    // PUBLIC API - User Information 
    // ============================================================================

    /**
     * Set user information
     * @param {object} userInfo - User data from login response
     */
    setUserInfo: function (userInfo) {
      if (!userInfo) {
        console.error('[StorageManager] Invalid user info');
        return false;
      }

      try {
        var userInfoJson = JSON.stringify(userInfo);
        var success = _safeSetItem(STORAGE_KEYS.USER_INFO, userInfoJson);
        if (success) {
          console.log('[StorageManager] User info stored');
        }
        return success;
      } catch (error) {
        console.error('[StorageManager] Error storing user info:', error);
        return false;
      }
    },

    /**
     * Get user information
     * @returns {object|null}
     */
    getUserInfo: function () {
      var userInfoJson = _safeGetItem(STORAGE_KEYS.USER_INFO);

      if (!userInfoJson) {
        return null;
      }

      try {
        return JSON.parse(userInfoJson);
      } catch (error) {
        console.error('[StorageManager] Error parsing user info:', error);
        return null;
      }
    },

    /**
     * Clear user information
     */
    clearUserInfo: function () {
      _safeRemoveItem(STORAGE_KEYS.USER_INFO);
      _safeRemoveItem(STORAGE_KEYS.USER_SESSION);
      console.log('[StorageManager] User info cleared');
      return true;
    },

    /**
     * Set user session
     * @param {object} sessionData - User session from login response
     */
    setUserSession: function (sessionData) {
      if (!sessionData) return false;

      try {
        var sessionJson = JSON.stringify(sessionData);
        return _safeSetItem(STORAGE_KEYS.USER_SESSION, sessionJson);
      } catch (error) {
        console.error('[StorageManager] Error storing user session:', error);
        return false;
      }
    },

    /**
     * Get user session
     * @returns {object|null}
     */
    getUserSession: function () {
      var sessionJson = _safeGetItem(STORAGE_KEYS.USER_SESSION);

      if (!sessionJson) return null;

      try {
        return JSON.parse(sessionJson);
      } catch (error) {
        console.error('[StorageManager] Error parsing user session:', error);
        return null;
      }
    },

    // ============================================================================
    // PUBLIC API - Menu Cache 
    // ============================================================================

    /**
     * Cache menu data
     * @param {Array} menuData
     */
    cacheMenu: function (menuData) {
      try {
        var userInfo = this.getUserInfo();
        if (!userInfo || !userInfo.UserId) {
          console.warn('[StorageManager] Cannot cache menu - no user info');
          return false;
        }

        var cacheKey = STORAGE_KEYS.MENU_CACHE + '_' + userInfo.UserId;
        var cacheData = {
          data: menuData,
          timestamp: new Date().toISOString()
        };

        return _safeSetItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.error('[StorageManager] Failed to cache menu:', error);
        return false;
      }
    },

    /**
     * Get cached menu
     * @returns {Array|null}
     */
    getCachedMenu: function () {
      try {
        var userInfo = this.getUserInfo();
        if (!userInfo || !userInfo.UserId) return null;

        var cacheKey = STORAGE_KEYS.MENU_CACHE + '_' + userInfo.UserId;
        var cached = _safeGetItem(cacheKey);
        if (!cached) return null;

        var cacheData = JSON.parse(cached);

        // Check cache expiry (1 hour)
        var cacheTime = new Date(cacheData.timestamp);
        var hoursDiff = (new Date() - cacheTime) / (1000 * 60 * 60);

        if (hoursDiff > 1) {
          this.clearMenuCache();
          return null;
        }

        return cacheData.data;
      } catch (error) {
        console.error('[StorageManager] Failed to get cached menu:', error);
        return null;
      }
    },

    /**
     * Clear menu cache
     */
    clearMenuCache: function () {
      try {
        var userInfo = this.getUserInfo();
        if (!userInfo || !userInfo.UserId) return;

        var cacheKey = STORAGE_KEYS.MENU_CACHE + '_' + userInfo.UserId;
        _safeRemoveItem(cacheKey);
      } catch (error) {
        console.error('[StorageManager] Failed to clear menu cache:', error);
      }
    },

    // ============================================================================
    // PUBLIC API - Generic Storage 
    // ============================================================================

    /**
     * Set item in localStorage
     * @param {string} key
     * @param {any} value
     */
    setItem: function (key, value) {
      try {
        var stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        return _safeSetItem(key, stringValue);
      } catch (error) {
        console.error('[StorageManager] Failed to set item:', error);
        return false;
      }
    },

    /**
     * Get item from localStorage
     * @param {string} key
     * @returns {any}
     */
    getItem: function (key) {
      try {
        var value = _safeGetItem(key);
        if (!value) return null;

        // Try to parse JSON
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      } catch (error) {
        console.error('[StorageManager] Failed to get item:', error);
        return null;
      }
    },

    /**
     * Remove item from localStorage
     * @param {string} key
     */
    removeItem: function (key) {
      return _safeRemoveItem(key);
    },

    /**
     * Clear all storage
     */
    clearAll: function () {
      console.log('[StorageManager] Clearing all storage');

      this.clearTokens();
      this.clearUserInfo();
      this.clearMenuCache();

      console.log('[StorageManager]  All storage cleared');
      return true;
    },

    // ============================================================================
    // PUBLIC API - Utility Methods
    // ============================================================================

    /**
     * Get complete storage status (debugging)
     * @returns {object}
     */
    getStorageStatus: function () {
      var tokenInfo = null;
      if (typeof TokenStorage !== 'undefined') {
        tokenInfo = TokenStorage.getTokenInfo();
      }

      return {
        hasAccessToken: !!this.getAccessToken(),
        hasRefreshTokenExpiry: !!_safeGetItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRY),
        isAccessTokenExpired: this.isAccessTokenExpired(),
        isRefreshTokenExpired: this.isRefreshTokenExpired(),
        accessTokenInfo: tokenInfo,
        refreshTokenExpiry: this.getRefreshTokenExpiry(),
        refreshTokenExpiryDate: this.getRefreshTokenExpiry()
          ? new Date(this.getRefreshTokenExpiry()).toISOString()
          : null,
        hasUserInfo: !!this.getUserInfo(),
        hasUserSession: !!this.getUserSession()
      };
    }
  };
})();











//var StorageManager2 = (function () {
//  'use strict';

//  // ============================================
//  // PRIVATE - Storage Keys
//  // ============================================
//  var _keys = {
//    accessToken: 'accessToken',
//    accessTokenExpiry: 'accessTokenExpiry',
//    refreshTokenExpiry: 'refreshTokenExpiry',
//    userInfo: 'userInfo',
//    menuCache: 'menuCache'
//  };

//  // ============================================
//  // PUBLIC - Token Management
//  // ============================================

//  /**
//   * Store authentication tokens
//   * @param {object} tokenResponse - { AccessToken, RefreshToken, AccessTokenExpiry, RefreshTokenExpiry }
//   */
//  function setTokens(tokenResponse) {
//    if (!tokenResponse) {
//      console.error('TokenResponse is null or undefined');
//      return;
//    }

//    try {
//      localStorage.setItem(_keys.accessToken, tokenResponse.AccessToken);
//      localStorage.setItem(_keys.accessTokenExpiry, tokenResponse.AccessTokenExpiry);
//      localStorage.setItem(_keys.refreshTokenExpiry, tokenResponse.RefreshTokenExpiry);

//      // console.log('Tokens stored successfully');
//    } catch (error) {
//      console.error('Failed to store tokens:', error);
//    }
//  }

//  /**
//   * Get access token
//   * @returns {string|null}
//   */
//  function getAccessToken() {
//    return localStorage.getItem(_keys.accessToken);
//  }

//  /**
//   * Get access token expiry
//   * @returns {Date|null}
//   */
//  function getAccessTokenExpiry() {
//    var expiry = localStorage.getItem(_keys.accessTokenExpiry);
//    return expiry ? new Date(expiry) : null;
//  }

//  /**
//   * Get refresh token expiry
//   * @returns {Date|null}
//   */
//  function getRefreshTokenExpiry() {
//    var expiry = localStorage.getItem(_keys.refreshTokenExpiry);
//    return expiry ? new Date(expiry) : null;
//  }

//  /**
//   * Check if access token is expired
//   * @returns {boolean}
//   */
//  function isAccessTokenExpired() {
//    var expiry = getAccessTokenExpiry();
//    if (!expiry) return true;

//    // Consider token expired if less than 2 minutes remaining
//    var bufferMinutes = 2;
//    var expiryWithBuffer = new Date(expiry.getTime() - bufferMinutes * 60 * 1000);

//    return new Date() >= expiryWithBuffer;
//  }

//  /**
//   * Check if refresh token is expired
//   * @returns {boolean}
//   */
//  function isRefreshTokenExpired() {
//    var expiry = getRefreshTokenExpiry();
//    if (!expiry) return true;

//    return new Date() >= expiry;
//  }

//  /**
//   * Clear all tokens
//   */
//  function clearTokens() {
//    localStorage.removeItem(_keys.accessToken);
//    localStorage.removeItem(_keys.refreshToken);
//    localStorage.removeItem(_keys.accessTokenExpiry);
//    localStorage.removeItem(_keys.refreshTokenExpiry);

//    // console.log('Tokens cleared');
//  }

//  // ============================================
//  // PUBLIC - User Info Management
//  // ============================================

//  /**
//   * Store user info
//   * @param {object} userInfo
//   */
//  function setUserInfo(userInfo) {
//    try {
//      localStorage.setItem(_keys.userInfo, JSON.stringify(userInfo));
//    } catch (error) {
//      console.error('Failed to store user info:', error);
//    }
//  }

//  /**
//   * Get user info
//   * @returns {object|null}
//   */
//  function getUserInfo() {
//    try {
//      var userInfo = localStorage.getItem(_keys.userInfo);
//      return userInfo ? JSON.parse(userInfo) : null;
//    } catch (error) {
//      console.error('Failed to get user info:', error);
//      return null;
//    }
//  }

//  /**
//   * Clear user info
//   */
//  function clearUserInfo() {
//    localStorage.removeItem(_keys.userInfo);
//    // console.log('User info cleared');
//  }

//  // ============================================
//  // PUBLIC - Menu Cache Management
//  // ============================================

//  /**
//   * Cache menu data
//   * @param {Array} menuData
//   */
//  function cacheMenu(menuData) {
//    try {
//      var userInfo = getUserInfo();
//      if (!userInfo) return;

//      var cacheKey = _keys.menuCache + '_' + userInfo.UserId;
//      var cacheData = {
//        data: menuData,
//        timestamp: new Date().toISOString()
//      };

//      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
//    } catch (error) {
//      console.error('Failed to cache menu:', error);
//    }
//  }

//  /**
//   * Get cached menu
//   * @returns {Array|null}
//   */
//  function getCachedMenu() {
//    try {
//      var userInfo = getUserInfo();
//      if (!userInfo) return null;

//      var cacheKey = _keys.menuCache + '_' + userInfo.UserId;
//      var cached = localStorage.getItem(cacheKey);
//      if (!cached) return null;

//      var cacheData = JSON.parse(cached);

//      // Check cache expiry (1 hour)
//      var cacheTime = new Date(cacheData.timestamp);
//      var hoursDiff = (new Date() - cacheTime) / (1000 * 60 * 60);

//      if (hoursDiff > 1) {
//        clearMenuCache();
//        return null;
//      }

//      return cacheData.data;
//    } catch (error) {
//      console.error('Failed to get cached menu:', error);
//      return null;
//    }
//  }

//  /**
//   * Clear menu cache
//   */
//  function clearMenuCache() {
//    try {
//      var userInfo = getUserInfo();
//      if (!userInfo) return;

//      var cacheKey = _keys.menuCache + '_' + userInfo.UserId;
//      localStorage.removeItem(cacheKey);
//    } catch (error) {
//      console.error('Failed to clear menu cache:', error);
//    }
//  }

//  // ============================================
//  // PUBLIC - Generic Storage
//  // ============================================

//  /**
//   * Set item in localStorage
//   * @param {string} key
//   * @param {any} value
//   */
//  function setItem(key, value) {
//    try {
//      var stringValue = typeof value === 'string' ? value : JSON.stringify(value);
//      localStorage.setItem(key, stringValue);
//    } catch (error) {
//      console.error('Failed to set item:', error);
//    }
//  }

//  /**
//   * Get item from localStorage
//   * @param {string} key
//   * @returns {any}
//   */
//  function getItem(key) {
//    try {
//      var value = localStorage.getItem(key);
//      if (!value) return null;

//      // Try to parse JSON
//      try {
//        return JSON.parse(value);
//      } catch {
//        return value;
//      }
//    } catch (error) {
//      console.error('Failed to get item:', error);
//      return null;
//    }
//  }

//  /**
//   * Remove item from localStorage
//   * @param {string} key
//   */
//  function removeItem(key) {
//    try {
//      localStorage.removeItem(key);
//    } catch (error) {
//      console.error('Failed to remove item:', error);
//    }
//  }

//  /**
//   * Clear all storage
//   */
//  function clearAll() {
//    try {
//      localStorage.clear();
//    } catch (error) {
//      console.error('Failed to clear storage:', error);
//    }
//  }

//  // ============================================
//  // PUBLIC API
//  // ============================================
//  return {
//    // Token management
//    setTokens: setTokens,
//    getAccessToken: getAccessToken,
//    getRefreshToken: getRefreshToken,
//    getAccessTokenExpiry: getAccessTokenExpiry,
//    getRefreshTokenExpiry: getRefreshTokenExpiry,
//    isAccessTokenExpired: isAccessTokenExpired,
//    isRefreshTokenExpired: isRefreshTokenExpired,
//    clearTokens: clearTokens,

//    // User info management
//    setUserInfo: setUserInfo,
//    getUserInfo: getUserInfo,
//    clearUserInfo: clearUserInfo,

//    // Menu cache management
//    cacheMenu: cacheMenu,
//    getCachedMenu: getCachedMenu,
//    clearMenuCache: clearMenuCache,

//    // Generic storage
//    setItem: setItem,
//    getItem: getItem,
//    removeItem: removeItem,
//    clearAll: clearAll
//  };
//})();
