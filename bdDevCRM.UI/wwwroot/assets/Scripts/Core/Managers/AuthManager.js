/*=========================================================
 * Authentication Manager
 * File: AuthManager.js
 * Description: Central authentication orchestration layer
 * Author: devSakhawat
 * Date: 2026-01-30
 * 
 * Features:
 * - Login flow orchestration
 * - Token refresh management
 * - User session management
 * - Logout handling
 * - Auto-refresh scheduling
 * 
 * Dependencies:
 * - TokenStorage (Phase 1)
 * - TokenHelper (Phase 1)
 * - AuthApiClient (Phase 1)
 * - AuthenticationService (Phase 2)
 * 
 * Usage:
 * - AuthManager.login(loginId, password)
 * - AuthManager.logout()
 * - AuthManager.refreshAccessToken()
 * - AuthManager.isAuthenticated()
=========================================================*/

var AuthManager = (function () {
  'use strict';

  // ============================================================================
  // PRIVATE STATE
  // ============================================================================

  var _state = {
    isRefreshing: false,
    refreshPromise: null,
    autoRefreshTimer: null,
    loginCallbacks: [],
    logoutCallbacks: [],
    refreshCallbacks: []
  };

  var _config = {
    autoRefreshEnabled: true,
    refreshThresholdSeconds: 60, // Refresh 1 minute before expiry
    checkIntervalMs: 30000, // Check every 30 seconds
    maxRetryAttempts: 3,
    retryDelayMs: 1000
  };

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Start auto-refresh timer
   * @private
   */
  function _startAutoRefreshTimer() {
    if (!_config.autoRefreshEnabled) {
      console.log('[AuthManager] Auto-refresh is disabled');
      return;
    }

    // Clear existing timer
    _stopAutoRefreshTimer();

    console.log('[AuthManager] Starting auto-refresh timer (interval: ' +
      (_config.checkIntervalMs / 1000) + 's)');

    _state.autoRefreshTimer = setInterval(function () {
      _checkAndRefreshToken();
    }, _config.checkIntervalMs);
  }

  /**
   * Stop auto-refresh timer
   * @private
   */
  function _stopAutoRefreshTimer() {
    if (_state.autoRefreshTimer) {
      console.log('[AuthManager] Stopping auto-refresh timer');
      clearInterval(_state.autoRefreshTimer);
      _state.autoRefreshTimer = null;
    }
  }

  /**
   * Check if token needs refresh and refresh if needed
   * @private
   */
  function _checkAndRefreshToken() {
    if (!TokenStorage.hasValidToken()) {
      console.log('[AuthManager] No valid token to refresh');
      _stopAutoRefreshTimer();
      return;
    }

    if (TokenStorage.shouldRefreshToken(_config.refreshThresholdSeconds)) {
      console.log('[AuthManager] Token should be refreshed');
      _refreshAccessTokenInternal();
    } else {
      var remaining = TokenStorage.getRemainingLifetime();
      console.log('[AuthManager] Token still valid (' + remaining + 's remaining)');
    }
  }

  /**
   * Internal token refresh (prevents duplicate calls)
   * @private
   */
  function _refreshAccessTokenInternal() {
    // If already refreshing, return existing promise
    if (_state.isRefreshing && _state.refreshPromise) {
      console.log('[AuthManager] Refresh already in progress, returning existing promise');
      return _state.refreshPromise;
    }

    _state.isRefreshing = true;

    _state.refreshPromise = AuthApiClient.refreshToken()
      .then(function (response) {
        console.log('[AuthManager] Token refresh successful');

        // Extract token data from response
        var tokenData = response.Data || response.data || response;
        var accessToken = tokenData.AccessToken || tokenData.accessToken;
        var expiresIn = tokenData.ExpiresIn || tokenData.expiresIn || 900;

        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }

        // Store new access token
        TokenStorage.setAccessToken(accessToken, expiresIn);

        // Notify callbacks
        _triggerCallbacks(_state.refreshCallbacks, { accessToken: accessToken });

        _state.isRefreshing = false;
        _state.refreshPromise = null;

        return { success: true, accessToken: accessToken };
      })
      .catch(function (error) {
        console.error('[AuthManager] Token refresh failed:', error);
        _state.isRefreshing = false;
        _state.refreshPromise = null;

        // If refresh fails, logout user
        if (error.status === 401) {
          console.warn('[AuthManager] Refresh token expired, logging out');
          _handleExpiredSession();
        }

        throw error;
      });

    return _state.refreshPromise;
  }

  /**
   * Handle expired session (logout + redirect)
   * @private
   */
  function _handleExpiredSession() {
    console.log('[AuthManager] Handling expired session');

    // Clear tokens
    TokenStorage.clearTokens();

    // Stop auto-refresh
    _stopAutoRefreshTimer();

    // Trigger logout callbacks
    _triggerCallbacks(_state.logoutCallbacks, { reason: 'session_expired' });

    // Redirect to login
    _redirectToLogin('Session expired. Please login again.');
  }

  /**
   * Redirect to login page
   * @private
   */
  function _redirectToLogin(message) {
    if (message) {
      // Store message in sessionStorage to show after redirect
      try {
        sessionStorage.setItem('login_message', message);
      } catch (e) {
        console.warn('[AuthManager] Failed to store login message:', e);
      }
    }

    // Get login URL from config or use default
    var loginUrl = '/Login/Index';
    if (typeof AppConfig !== 'undefined' && AppConfig.getFrontendRoute) {
      loginUrl = AppConfig.getFrontendRoute('login') || loginUrl;
    }

    console.log('[AuthManager] Redirecting to login:', loginUrl);
    window.location.href = loginUrl;
  }

  /**
   * Trigger registered callbacks
   * @private
   */
  function _triggerCallbacks(callbacks, data) {
    callbacks.forEach(function (callback) {
      try {
        callback(data);
      } catch (error) {
        console.error('[AuthManager] Callback error:', error);
      }
    });
  }

  /**
   * Validate login credentials
   * @private
   */
  function _validateCredentials(loginId, password) {
    if (!loginId || typeof loginId !== 'string' || loginId.trim() === '') {
      return { valid: false, message: 'Login ID is required' };
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      return { valid: false, message: 'Password is required' };
    }

    return { valid: true };
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Initialize AuthManager
     * @param {object} config - Configuration options
     */
    init: function (config) {
      console.log('[AuthManager] Initializing...');

      // Merge config
      if (config) {
        _config = Object.assign({}, _config, config);
      }

      // Check if already authenticated
      if (this.isAuthenticated()) {
        console.log('[AuthManager] User already authenticated');
        _startAutoRefreshTimer();
      } else {
        console.log('[AuthManager] No active session');
      }

      console.log('[AuthManager] Configuration:', _config);
    },

    /**
     * Login user and establish session
     * @param {string} loginId - User login ID
     * @param {string} password - User password
     * @returns {Promise} Promise resolving to login result
     */
    login: function (loginId, password, isRememberMe) {
      console.log('[AuthManager] Login initiated for:', loginId);

      // Validate credentials
      var validation = _validateCredentials(loginId, password);
      if (!validation.valid) {
        console.error('[AuthManager] Validation failed:', validation.message);
        return Promise.reject({
          status: 400,
          message: validation.message
        });
      }

      // Call API
      return AuthApiClient.login(loginId, password, isRememberMe)
        .then(function (response) {
          console.log('[AuthManager] Login API successful');

          // Extract token data
          var tokenData = response.Data || response.data || response;
          var accessToken = tokenData.AccessToken || tokenData.accessToken;
          var expiresIn = tokenData.ExpiresIn || tokenData.expiresIn || 900;

          if (!accessToken) {
            throw new Error('No access token in login response');
          }

          // Store access token (refresh token auto-stored in cookie)
          TokenStorage.setAccessToken(accessToken, expiresIn);

          console.log('[AuthManager] Access token stored');

          // Start auto-refresh
          _startAutoRefreshTimer();

          // Trigger login callbacks
          _triggerCallbacks(_state.loginCallbacks, {
            loginId: loginId,
            accessToken: accessToken
          });

          return {
            success: true,
            accessToken: accessToken,
            expiresIn: expiresIn,
            message: 'Login successful'
          };
        })
        .catch(function (error) {
          console.error('[AuthManager] Login failed:', error);
          throw {
            success: false,
            status: error.status || 500,
            message: error.response?.Message ||
              error.response?.message ||
              error.message ||
              'Login failed',
            details: error
          };
        });
    },

    /**
     * Logout user and clear session
     * @returns {Promise} Promise resolving when logout complete
     */
    logout: function () {
      console.log('[AuthManager] Logout initiated');

      var accessToken = TokenStorage.getAccessToken();

      // Stop auto-refresh
      _stopAutoRefreshTimer();

      // Call logout API
      return AuthApiClient.logout(accessToken)
        .then(function (response) {
          console.log('[AuthManager] Logout API successful');

          // Clear local tokens
          TokenStorage.clearTokens();

          // Trigger logout callbacks
          _triggerCallbacks(_state.logoutCallbacks, { reason: 'user_logout' });

          return {
            success: true,
            message: 'Logout successful'
          };
        })
        .catch(function (error) {
          console.warn('[AuthManager] Logout API failed, clearing local tokens anyway:', error);

          // Clear tokens even if API fails
          TokenStorage.clearTokens();

          // Trigger logout callbacks
          _triggerCallbacks(_state.logoutCallbacks, { reason: 'user_logout' });

          return {
            success: true,
            message: 'Logged out (API error ignored)'
          };
        });
    },

    /**
     * Refresh access token using refresh token
     * @returns {Promise} Promise resolving to new token
     */
    refreshAccessToken: function () {
      console.log('[AuthManager] Manual token refresh requested');
      return _refreshAccessTokenInternal();
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated: function () {
      return TokenStorage.hasValidToken();
    },

    /**
     * Get current access token
     * @returns {string|null} Access token or null
     */
    getAccessToken: function () {
      return TokenStorage.getAccessToken();
    },

    /**
     * Get authorization header value
     * @returns {string|null} "Bearer {token}" or null
     */
    getAuthorizationHeader: function () {
      return TokenStorage.getAuthorizationHeader();
    },

    /**
     * Get current user info from token
     * @returns {object|null} User info or null
     */
    getCurrentUser: function () {
      var token = this.getAccessToken();

      if (!token) {
        return null;
      }

      var userId = TokenHelper.getUserId(token);
      var username = TokenHelper.getUsername(token);

      return {
        userId: userId,
        username: username,
        token: token
      };
    },

    /**
     * Get token expiry info
     * @returns {object} Token expiry information
     */
    getTokenInfo: function () {
      return TokenStorage.getTokenInfo();
    },

    /**
     * Register callback for login event
     * @param {function} callback - Callback function
     */
    onLogin: function (callback) {
      if (typeof callback === 'function') {
        _state.loginCallbacks.push(callback);
      }
    },

    /**
     * Register callback for logout event
     * @param {function} callback - Callback function
     */
    onLogout: function (callback) {
      if (typeof callback === 'function') {
        _state.logoutCallbacks.push(callback);
      }
    },

    /**
     * Register callback for token refresh event
     * @param {function} callback - Callback function
     */
    onTokenRefresh: function (callback) {
      if (typeof callback === 'function') {
        _state.refreshCallbacks.push(callback);
      }
    },

    /**
     * Enable/disable auto-refresh
     * @param {boolean} enabled - Enable auto-refresh
     */
    setAutoRefresh: function (enabled) {
      _config.autoRefreshEnabled = enabled;

      if (enabled && this.isAuthenticated()) {
        _startAutoRefreshTimer();
      } else {
        _stopAutoRefreshTimer();
      }

      console.log('[AuthManager] Auto-refresh ' + (enabled ? 'enabled' : 'disabled'));
    },

    /**
     * Update configuration
     * @param {object} config - Configuration options
     */
    updateConfig: function (config) {
      _config = Object.assign({}, _config, config);
      console.log('[AuthManager] Configuration updated:', _config);

      // Restart timer if settings changed
      if (_config.autoRefreshEnabled && this.isAuthenticated()) {
        _startAutoRefreshTimer();
      }
    },

    /**
     * Get current configuration
     * @returns {object} Current configuration
     */
    getConfig: function () {
      return Object.assign({}, _config);
    },

    /**
     * Get manager state (for debugging)
     * @returns {object} Current state
     */
    getState: function () {
      return {
        isRefreshing: _state.isRefreshing,
        hasRefreshPromise: _state.refreshPromise !== null,
        hasAutoRefreshTimer: _state.autoRefreshTimer !== null,
        isAuthenticated: this.isAuthenticated(),
        tokenInfo: this.getTokenInfo()
      };
    },

    /**
     * Force logout and redirect (for expired sessions)
     */
    forceLogout: function (message) {
      console.log('[AuthManager] Force logout triggered');
      TokenStorage.clearTokens();
      _stopAutoRefreshTimer();
      _triggerCallbacks(_state.logoutCallbacks, { reason: 'force_logout' });
      _redirectToLogin(message || 'Session expired');
    },

    /**
     * Check if currently refreshing token
     * @returns {boolean} True if refreshing
     */
    isRefreshing: function () {
      return _state.isRefreshing;
    }
  };
})();

// Log initialization
console.log('%c[AuthManager] ✓ Initialized', 'color: #4CAF50; font-weight: bold;');