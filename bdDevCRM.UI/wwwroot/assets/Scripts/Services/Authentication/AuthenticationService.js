

/*=========================================================
 * Authentication Service
 * File: AuthenticationService.js
 * Description: Business logic layer for authentication
 * Author: devSakhawat
 * Date: 2026-01-30
 * 
 * Features:
 * - User authentication orchestration
 * - Session state management
 * - User info caching
 * - Login/logout business logic
 * 
 * Dependencies:
 * - AuthManager 
 * - AuthApiClient 
 * - TokenStorage 
 * - TokenHelper
 * 
 * Usage:
 * - AuthenticationService.authenticate(loginId, password)
 * - AuthenticationService.getUserInfo()
 * - AuthenticationService.logout()
=========================================================*/



var AuthenticationService = (function () {
  'use strict';

  // ============================================================================
  // PRIVATE STATE
  // ============================================================================

  var _cache = {
    userInfo: null,
    lastFetchTime: null
  };

  var _config = {
    cacheExpiryMs: 300000, // Cache user info for 5 minutes
    autoFetchUserInfo: true
  };

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Check if cached user info is still valid
   * @private
   */
  function _isCacheValid() {
    if (!_cache.userInfo || !_cache.lastFetchTime) {
      return false;
    }

    var now = Date.now();
    var elapsed = now - _cache.lastFetchTime;

    return elapsed < _config.cacheExpiryMs;
  }

  /**
   * Clear user info cache
   * @private
   */
  function _clearCache() {
    console.log('[AuthenticationService] Clearing user info cache');
    _cache.userInfo = null;
    _cache.lastFetchTime = null;
  }

  /**
   * Store user info in cache
   * @private
   */
  function _cacheUserInfo(userInfo) {
    _cache.userInfo = userInfo;
    _cache.lastFetchTime = Date.now();
    console.log('[AuthenticationService] User info cached');
  }

  /**
   * Store user info in localStorage
   * @private
   */
  function _storeUserInfoInLocalStorage(userInfo) {
    try {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      console.log('[AuthenticationService] User info stored in localStorage');
    } catch (error) {
      console.error('[AuthenticationService] Failed to store user info:', error);
    }
  }

  /**
   * Get user info from localStorage
   * @private
   */
  function _getUserInfoFromLocalStorage() {
    try {
      var storedInfo = localStorage.getItem('userInfo');
      if (storedInfo) {
        return JSON.parse(storedInfo);
      }
    } catch (error) {
      console.error('[AuthenticationService] Failed to retrieve user info:', error);
    }
    return null;
  }

  /**
   * Clear user info from localStorage
   * @private
   */
  function _clearUserInfoFromLocalStorage() {
    try {
      localStorage.removeItem('userInfo');
      console.log('[AuthenticationService] User info cleared from localStorage');
    } catch (error) {
      console.error('[AuthenticationService] Failed to clear user info:', error);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Initialize service
     * @param {object} config - Configuration options
     */
    init: function (config) {
      console.log('[AuthenticationService] Initializing...');

      if (config) {
        _config = Object.assign({}, _config, config);
      }

      // Register logout callback to clear cache
      if (typeof AuthManager !== 'undefined') {
        AuthManager.onLogout(function () {
          _clearCache();
          _clearUserInfoFromLocalStorage();
        });
      }

      console.log('[AuthenticationService] Initialized with config:', _config);
    },

    /**
     * Authenticate user (complete login flow)
     * @param {string} loginId - User login ID
     * @param {string} password - User password
     * @returns {Promise} Promise resolving to authentication result
     */
    authenticate: function (loginId, password) {
      console.log('[AuthenticationService] Starting authentication for:', loginId);

      // Use AuthManager for login
      return AuthManager.login(loginId, password)
        .then(function (loginResult) {
          console.log('[AuthenticationService] Login successful');

          // Fetch user info if enabled
          if (_config.autoFetchUserInfo) {
            return this.fetchUserInfo()
              .then(function (userInfo) {
                return {
                  success: true,
                  message: 'Authentication successful',
                  accessToken: loginResult.accessToken,
                  userInfo: userInfo
                };
              })
              .catch(function (userInfoError) {
                console.warn('[AuthenticationService] Failed to fetch user info:', userInfoError);

                // Don't fail authentication if user info fetch fails
                return {
                  success: true,
                  message: 'Authentication successful (user info unavailable)',
                  accessToken: loginResult.accessToken,
                  userInfo: null
                };
              });
          } else {
            return {
              success: true,
              message: 'Authentication successful',
              accessToken: loginResult.accessToken,
              userInfo: null
            };
          }
        }.bind(this))
        .catch(function (error) {
          console.error('[AuthenticationService] Authentication failed:', error);
          throw {
            success: false,
            message: error.message || 'Authentication failed',
            status: error.status,
            details: error
          };
        });
    },

    /**
     * Fetch user information from API
     * @param {boolean} forceRefresh - Force fetch even if cached
     * @returns {Promise} Promise resolving to user info
     */
    fetchUserInfo: function (forceRefresh) {
      console.log('[AuthenticationService] Fetching user info...');

      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && _isCacheValid()) {
        console.log('[AuthenticationService] Returning cached user info');
        return Promise.resolve(_cache.userInfo);
      }

      var accessToken = AuthManager.getAccessToken();

      if (!accessToken) {
        console.error('[AuthenticationService] No access token available');
        return Promise.reject({
          status: 401,
          message: 'Not authenticated'
        });
      }

      return AuthApiClient.getUserInfo(accessToken)
        .then(function (response) {
          console.log('[AuthenticationService] User info fetched successfully');

          var userInfo = response.Data || response.data || response;

          // Cache user info
          _cacheUserInfo(userInfo);

          // Store in localStorage
          _storeUserInfoInLocalStorage(userInfo);

          return userInfo;
        })
        .catch(function (error) {
          console.error('[AuthenticationService] Failed to fetch user info:', error);

          // If 401, token might be expired
          if (error.status === 401) {
            console.warn('[AuthenticationService] Token expired, attempting refresh...');

            // Try to refresh token and retry
            return AuthManager.refreshAccessToken()
              .then(function () {
                // Retry with new token
                return this.fetchUserInfo(true);
              }.bind(this))
              .catch(function (refreshError) {
                console.error('[AuthenticationService] Token refresh failed:', refreshError);
                throw error;
              });
          }

          throw error;
        }.bind(this));
    },

    /**
     * Get current user info (cached or from storage)
     * @returns {object|null} User info or null
     */
    getUserInfo: function () {
      // Try cache first
      if (_cache.userInfo) {
        return _cache.userInfo;
      }

      // Try localStorage
      var storedInfo = _getUserInfoFromLocalStorage();
      if (storedInfo) {
        _cacheUserInfo(storedInfo);
        return storedInfo;
      }

      return null;
    },

    /**
     * Get user ID from current session
     * @returns {number|null} User ID or null
     */
    getUserId: function () {
      var userInfo = this.getUserInfo();
      if (userInfo) {
        return userInfo.UserId || userInfo.userId || null;
      }

      // Fallback: extract from token
      var token = AuthManager.getAccessToken();
      if (token) {
        return TokenHelper.getUserId(token);
      }

      return null;
    },

    /**
     * Get username from current session
     * @returns {string|null} Username or null
     */
    getUsername: function () {
      var userInfo = this.getUserInfo();
      if (userInfo) {
        return userInfo.UserName || userInfo.userName || userInfo.username || null;
      }

      // Fallback: extract from token
      var token = AuthManager.getAccessToken();
      if (token) {
        return TokenHelper.getUsername(token);
      }

      return null;
    },

    /**
     * Logout user (complete logout flow)
     * @returns {Promise} Promise resolving when logout complete
     */
    logout: function () {
      console.log('[AuthenticationService] Starting logout...');

      return AuthManager.logout()
        .then(function (result) {
          console.log('[AuthenticationService] Logout successful');

          // Clear caches
          _clearCache();
          _clearUserInfoFromLocalStorage();

          return {
            success: true,
            message: 'Logout successful'
          };
        })
        .catch(function (error) {
          console.error('[AuthenticationService] Logout error:', error);

          // Clear local data even if API fails
          _clearCache();
          _clearUserInfoFromLocalStorage();

          return {
            success: true,
            message: 'Logged out (with errors)'
          };
        });
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated: function () {
      return AuthManager.isAuthenticated();
    },

    /**
     * Validate current session
     * @returns {Promise} Promise resolving to validation result
     */
    validateSession: function () {
      console.log('[AuthenticationService] Validating session...');

      if (!this.isAuthenticated()) {
        return Promise.resolve({
          valid: false,
          message: 'No active session'
        });
      }

      var tokenInfo = AuthManager.getTokenInfo();

      if (tokenInfo.isExpired) {
        console.log('[AuthenticationService] Token expired, attempting refresh...');

        return AuthManager.refreshAccessToken()
          .then(function () {
            return {
              valid: true,
              message: 'Session valid (token refreshed)'
            };
          })
          .catch(function (error) {
            return {
              valid: false,
              message: 'Session expired',
              error: error
            };
          });
      }

      return Promise.resolve({
        valid: true,
        message: 'Session valid',
        tokenInfo: tokenInfo
      });
    },

    /**
     * Get session info
     * @returns {object} Session information
     */
    getSessionInfo: function () {
      return {
        isAuthenticated: this.isAuthenticated(),
        userId: this.getUserId(),
        username: this.getUsername(),
        tokenInfo: AuthManager.getTokenInfo(),
        userInfo: this.getUserInfo()
      };
    },

    /**
     * Clear all cached data
     */
    clearCache: function () {
      _clearCache();
      _clearUserInfoFromLocalStorage();
    },

    /**
     * Update service configuration
     * @param {object} config - Configuration options
     */
    updateConfig: function (config) {
      _config = Object.assign({}, _config, config);
      console.log('[AuthenticationService] Configuration updated:', _config);
    },

    /**
     * Get current configuration
     * @returns {object} Current configuration
     */
    getConfig: function () {
      return Object.assign({}, _config);
    }
  };
})();

// Log initialization
console.log('%c[AuthenticationService] ✓ Initialized', 'color: #4CAF50; font-weight: bold;');