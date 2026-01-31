/*=========================================================
 * Token Storage Manager
 * File: TokenStorage.js
 * Description: Secure token storage with localStorage
 * Author: devSakhawat
 * Date: 2026-01-30
 * 
 * Features:
 * - Access token storage in localStorage
 * - Token expiry management
 * - Secure token handling
 * - Clear tokens on logout
 * 
 * Security Notes:
 * - Access tokens stored in localStorage (short-lived: 15 min)
 * - Refresh tokens stored in HTTP-only cookies (backend-managed)
 * - Never expose tokens in logs or console
=========================================================*/

var TokenStorage = (function () {
  'use strict';

  // ============================================================================
  // PRIVATE CONSTANTS
  // ============================================================================

  var STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    TOKEN_EXPIRY: 'token_expiry',
    TOKEN_TYPE: 'token_type'
  };

  var TOKEN_TYPE = 'Bearer';

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Safely get item from localStorage with error handling
   * @private
   */
  function _safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[TokenStorage] Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Safely set item to localStorage with error handling
   * @private
   */
  function _safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('[TokenStorage] Error writing to localStorage:', error);
      return false;
    }
  }

  /**
   * Safely remove item from localStorage
   * @private
   */
  function _safeRemoveItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('[TokenStorage] Error removing from localStorage:', error);
      return false;
    }
  }

  /**
   * Calculate expiry timestamp from seconds
   * @private
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
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Store access token with expiry
     * @param {string} accessToken - JWT access token
     * @param {number} expiresIn - Token lifetime in seconds (default: 900 = 15 min)
     * @returns {boolean} Success status
     */
    setAccessToken: function (accessToken, expiresIn) {
      if (!accessToken || typeof accessToken !== 'string') {
        console.error('[TokenStorage] Invalid access token provided');
        return false;
      }

      // Default to 15 minutes if not provided
      var tokenLifetime = expiresIn || 900;
      var expiryTimestamp = _calculateExpiry(tokenLifetime);

      // Store token and metadata
      var success = _safeSetItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      success = _safeSetItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTimestamp.toString()) && success;
      success = _safeSetItem(STORAGE_KEYS.TOKEN_TYPE, TOKEN_TYPE) && success;

      if (success) {
        console.log('[TokenStorage] Access token stored successfully. Expires in ' + tokenLifetime + ' seconds');
      }

      return success;
    },

    /**
     * Get access token if valid
     * @returns {string|null} Access token or null if expired/missing
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
     * Get token type (always "Bearer")
     * @returns {string} Token type
     */
    getTokenType: function () {
      return _safeGetItem(STORAGE_KEYS.TOKEN_TYPE) || TOKEN_TYPE;
    },

    /**
     * Get full authorization header value
     * @returns {string|null} "Bearer {token}" or null
     */
    getAuthorizationHeader: function () {
      var token = this.getAccessToken();

      if (!token) {
        return null;
      }

      return this.getTokenType() + ' ' + token;
    },

    /**
     * Check if access token exists and is valid
     * @returns {boolean} True if token is valid
     */
    hasValidToken: function () {
      return !_isTokenExpired() && this.getAccessToken() !== null;
    },

    /**
     * Get token expiry timestamp
     * @returns {number|null} Expiry timestamp in milliseconds
     */
    getTokenExpiry: function () {
      var expiry = _safeGetItem(STORAGE_KEYS.TOKEN_EXPIRY);
      return expiry ? parseInt(expiry, 10) : null;
    },

    /**
     * Get remaining token lifetime in seconds
     * @returns {number} Remaining seconds (0 if expired)
     */
    getRemainingLifetime: function () {
      var expiry = this.getTokenExpiry();

      if (!expiry) {
        return 0;
      }

      var now = new Date().getTime();
      var remaining = Math.floor((expiry - now) / 1000);

      return remaining > 0 ? remaining : 0;
    },

    /**
     * Check if token should be refreshed soon
     * @param {number} thresholdSeconds - Refresh threshold in seconds (default: 60)
     * @returns {boolean} True if token should be refreshed
     */
    shouldRefreshToken: function (thresholdSeconds) {
      var threshold = thresholdSeconds || 60; // Default: refresh 1 minute before expiry
      var remaining = this.getRemainingLifetime();

      return remaining > 0 && remaining <= threshold;
    },

    /**
     * Clear all tokens from storage (logout)
     * @returns {boolean} Success status
     */
    clearTokens: function () {
      console.log('[TokenStorage] Clearing all tokens from storage');

      var success = true;
      success = _safeRemoveItem(STORAGE_KEYS.ACCESS_TOKEN) && success;
      success = _safeRemoveItem(STORAGE_KEYS.TOKEN_EXPIRY) && success;
      success = _safeRemoveItem(STORAGE_KEYS.TOKEN_TYPE) && success;

      if (success) {
        console.log('[TokenStorage] All tokens cleared successfully');
      }

      return success;
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
    }
  };
})();

// Log initialization
console.log('%c[TokenStorage] ✓ Initialized', 'color: #4CAF50; font-weight: bold;');