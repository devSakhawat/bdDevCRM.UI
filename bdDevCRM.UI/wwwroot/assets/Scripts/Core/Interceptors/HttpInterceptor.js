/*=========================================================
 * HTTP Interceptor
 * File: HttpInterceptor.js
 * Description: Automatic token attachment and 401 handling
 * Author: devSakhawat
 * Date: 2026-01-30
 * 
 * Features:
 * - Automatic token attachment to requests
 * - 401 error detection
 * - Automatic token refresh
 * - Request retry after refresh
 * - Queue management for concurrent requests
 * 
 * Dependencies:
 * - AuthManager (Phase 2)
 * - TokenStorage (Phase 1)
 * 
 * Usage:
 * - HttpInterceptor.interceptRequest(ajaxSettings)
 * - HttpInterceptor.handleResponse(xhr, settings)
=========================================================*/

var HttpInterceptor = (function () {
  'use strict';

  // ============================================================================
  // PRIVATE STATE
  // ============================================================================

  var _state = {
    pendingRequests: [],
    isRefreshing: false,
    refreshPromise: null
  };

  var _config = {
    enabled: true,
    excludedUrls: [
      '/login',
      '/refresh-token',
      '/logout'
    ],
    retryAttempts: 1,
    retryDelay: 500
  };

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Check if URL should be intercepted
   * @private
   */
  function _shouldIntercept(url) {
    if (!_config.enabled) {
      return false;
    }

    // Check if URL is in exclusion list
    for (var i = 0; i < _config.excludedUrls.length; i++) {
      if (url.indexOf(_config.excludedUrls[i]) !== -1) {
        return false;
      }
    }

    return true;
  }

  /**
   * Add token to request headers
   * @private
   */
  function _addAuthorizationHeader(settings) {
    var authHeader = TokenStorage.getAuthorizationHeader();

    if (authHeader) {
      settings.headers = settings.headers || {};
      settings.headers['Authorization'] = authHeader;
      console.log('[HttpInterceptor] Authorization header added');
    } else {
      console.warn('[HttpInterceptor] No token available for request');
    }

    return settings;
  }

  /**
   * Ensure credentials are included (for cookies)
   * @private
   */
  function _ensureCredentials(settings) {
    settings.xhrFields = settings.xhrFields || {};
    settings.xhrFields.withCredentials = true;
    console.log('[HttpInterceptor] Credentials enabled');
    return settings;
  }

  /**
   * Queue request for retry after token refresh
   * @private
   */
  function _queueRequest(originalSettings) {
    return new Promise(function (resolve, reject) {
      _state.pendingRequests.push({
        settings: originalSettings,
        resolve: resolve,
        reject: reject
      });
      console.log('[HttpInterceptor] Request queued. Queue size: ' + _state.pendingRequests.length);
    });
  }

  /**
   * Retry all queued requests
   * @private
   */
  function _retryQueuedRequests() {
    console.log('[HttpInterceptor] Retrying ' + _state.pendingRequests.length + ' queued requests');

    var requests = _state.pendingRequests.slice();
    _state.pendingRequests = [];

    requests.forEach(function (request) {
      _retryRequest(request.settings)
        .then(request.resolve)
        .catch(request.reject);
    });
  }

  /**
   * Fail all queued requests
   * @private
   */
  function _failQueuedRequests(error) {
    console.log('[HttpInterceptor] Failing ' + _state.pendingRequests.length + ' queued requests');

    var requests = _state.pendingRequests.slice();
    _state.pendingRequests = [];

    requests.forEach(function (request) {
      request.reject(error);
    });
  }

  /**
   * Retry a single request with new token
   * @private
   */
  function _retryRequest(settings) {
    console.log('[HttpInterceptor] Retrying request:', settings.url);

    // Add new token
    settings = _addAuthorizationHeader(settings);

    return new Promise(function (resolve, reject) {
      $.ajax(settings)
        .done(function (data, textStatus, jqXHR) {
          console.log('[HttpInterceptor] Retry successful');
          resolve(data);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.error('[HttpInterceptor] Retry failed');
          reject(jqXHR);
        });
    });
  }

  /**
   * Handle token refresh process
   * @private
   */
  function _handleTokenRefresh() {
    if (_state.isRefreshing && _state.refreshPromise) {
      console.log('[HttpInterceptor] Token refresh already in progress');
      return _state.refreshPromise;
    }

    console.log('[HttpInterceptor] Starting token refresh...');
    _state.isRefreshing = true;

    _state.refreshPromise = AuthManager.refreshAccessToken()
      .then(function (result) {
        console.log('[HttpInterceptor] Token refresh successful');
        _state.isRefreshing = false;
        _state.refreshPromise = null;

        // Retry queued requests
        _retryQueuedRequests();

        return result;
      })
      .catch(function (error) {
        console.error('[HttpInterceptor] Token refresh failed:', error);
        _state.isRefreshing = false;
        _state.refreshPromise = null;

        // Fail all queued requests
        _failQueuedRequests(error);

        // Force logout on refresh failure
        if (typeof AuthManager !== 'undefined' && AuthManager.forceLogout) {
          AuthManager.forceLogout('Session expired. Please login again.');
        }

        throw error;
      });

    return _state.refreshPromise;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Initialize interceptor
     * @param {object} config - Configuration options
     */
    init: function (config) {
      console.log('[HttpInterceptor] Initializing...');

      if (config) {
        _config = Object.assign({}, _config, config);
      }

      // Setup jQuery AJAX prefilter
      this.setupGlobalInterceptor();

      console.log('[HttpInterceptor] Initialized with config:', _config);
    },

    /**
     * Setup global jQuery AJAX interceptor
     */
    setupGlobalInterceptor: function () {
      var self = this;

      // Prefilter to intercept before request
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        if (_shouldIntercept(options.url)) {
          console.log('[HttpInterceptor] Intercepting request:', options.url);

          // Add authorization header
          options = _addAuthorizationHeader(options);

          // Ensure credentials
          options = _ensureCredentials(options);

          // Store original settings for retry
          jqXHR.originalSettings = $.extend(true, {}, options);
        }
      });

      // Global error handler
      $(document).ajaxError(function (event, jqXHR, ajaxSettings, thrownError) {
        if (jqXHR.status === 401 && _shouldIntercept(ajaxSettings.url)) {
          console.warn('[HttpInterceptor] 401 Unauthorized detected');
          self.handle401Error(jqXHR, ajaxSettings);
        }
      });

      console.log('[HttpInterceptor] Global interceptor setup complete');
    },

    /**
     * Intercept and modify request before sending
     * @param {object} settings - jQuery AJAX settings
     * @returns {object} Modified settings
     */
    interceptRequest: function (settings) {
      if (!_shouldIntercept(settings.url)) {
        return settings;
      }

      console.log('[HttpInterceptor] Intercepting request:', settings.url);

      // Add authorization header
      settings = _addAuthorizationHeader(settings);

      // Ensure credentials
      settings = _ensureCredentials(settings);

      return settings;
    },

    /**
     * Handle 401 Unauthorized response
     * @param {object} xhr - jQuery XHR object
     * @param {object} settings - Original AJAX settings
     * @returns {Promise} Promise resolving to retry result
     */
    handle401Error: function (xhr, settings) {
      console.log('[HttpInterceptor] Handling 401 error for:', settings.url);

      // Queue this request for retry
      var retryPromise = _queueRequest(settings);

      // Start refresh if not already in progress
      if (!_state.isRefreshing) {
        _handleTokenRefresh();
      }

      return retryPromise;
    },

    /**
     * Manually intercept a specific request
     * @param {object} ajaxSettings - jQuery AJAX settings
     * @returns {Promise} Promise resolving to response
     */
    makeRequest: function (ajaxSettings) {
      var self = this;

      // Intercept settings
      ajaxSettings = this.interceptRequest(ajaxSettings);

      return new Promise(function (resolve, reject) {
        $.ajax(ajaxSettings)
          .done(function (data, textStatus, jqXHR) {
            resolve(data);
          })
          .fail(function (jqXHR, textStatus, errorThrown) {
            // Handle 401
            if (jqXHR.status === 401 && _shouldIntercept(ajaxSettings.url)) {
              self.handle401Error(jqXHR, ajaxSettings)
                .then(resolve)
                .catch(reject);
            } else {
              reject(jqXHR);
            }
          });
      });
    },

    /**
     * Enable/disable interceptor
     * @param {boolean} enabled - Enable state
     */
    setEnabled: function (enabled) {
      _config.enabled = enabled;
      console.log('[HttpInterceptor] Interceptor ' + (enabled ? 'enabled' : 'disabled'));
    },

    /**
     * Add URL to exclusion list
     * @param {string} url - URL pattern to exclude
     */
    addExcludedUrl: function (url) {
      if (_config.excludedUrls.indexOf(url) === -1) {
        _config.excludedUrls.push(url);
        console.log('[HttpInterceptor] URL excluded:', url);
      }
    },

    /**
     * Remove URL from exclusion list
     * @param {string} url - URL pattern to include
     */
    removeExcludedUrl: function (url) {
      var index = _config.excludedUrls.indexOf(url);
      if (index !== -1) {
        _config.excludedUrls.splice(index, 1);
        console.log('[HttpInterceptor] URL included:', url);
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
     * Get interceptor state
     * @returns {object} Current state
     */
    getState: function () {
      return {
        enabled: _config.enabled,
        isRefreshing: _state.isRefreshing,
        pendingRequestsCount: _state.pendingRequests.length,
        excludedUrls: _config.excludedUrls
      };
    },

    /**
     * Clear pending requests queue
     */
    clearQueue: function () {
      console.log('[HttpInterceptor] Clearing request queue');
      _failQueuedRequests({ message: 'Queue cleared' });
    }
  };
})();

// Log initialization
console.log('%c[HttpInterceptor] ✓ Initialized', 'color: #4CAF50; font-weight: bold;');