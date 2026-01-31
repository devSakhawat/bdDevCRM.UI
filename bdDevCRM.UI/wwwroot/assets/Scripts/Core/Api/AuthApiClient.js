

/*=========================================================
 * Authentication API Client
 * File: AuthApiClient.js
 * Description: Low-level HTTP client for authentication endpoints
 * Author: devSakhawat
 * Date: 2026-01-30
 * 
 * Features:
 * - Login API call
 * - Refresh token API call
 * - Logout API call
 * - Revoke token API call
 * - Cookie-based refresh token handling
 * 
 * Note: This is a low-level client. Use AuthManager for business logic.
=========================================================*/

var AuthApiClient = (function () {
  'use strict';

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get API base URL from AppConfig
   * @private
   */
  function _getApiBaseUrl() {
    if (typeof AppConfig !== 'undefined' && AppConfig.getApiUrl) {
      return AppConfig.getApiUrl();
    }
    // Fallback to global baseApi variable (from your existing code)
    return typeof baseApi !== 'undefined' ? baseApi : 'https://localhost:7290/bdDevs-crm';
  }

  /**
   * Get endpoint URL
   * @private
   */
  function _getEndpoint(path) {
    var baseUrl = _getApiBaseUrl();
    var fullUrl = baseUrl + path;

    console.log('[AuthApiClient] Base URL:', baseUrl);
    console.log('[AuthApiClient] Path:', path);
    console.log('[AuthApiClient] Full URL:', fullUrl);

    return fullUrl;
  }

  /**
   * Make HTTP request with error handling
   * @private
   */
  //function _makeRequest(options) {
  //  return new Promise(function (resolve, reject) {
  //    $.ajax({
  //      url: options.url,
  //      type: options.method || 'GET',
  //      contentType: options.contentType || 'application/json',
  //      data: options.data,
  //      headers: options.headers || {},
  //      xhrFields: {
  //        withCredentials: true // Critical: Enable cookies
  //      },
  //      success: function (response) {
  //        resolve(response);
  //      },
  //      error: function (xhr, status, error) {
  //        var errorResponse = {
  //          status: xhr.status,
  //          statusText: xhr.statusText,
  //          message: error,
  //          response: xhr.responseJSON || null,
  //          xhr: xhr
  //        };
  //        reject(errorResponse);
  //      }
  //    });
  //  });
  //}

  function _makeRequest(options) {
    console.group('[AuthApiClient] Request Details');
    console.log('URL:', options.url);
    console.log('Method:', options.method);
    console.log('Content-Type:', options.contentType);
    console.log('Data:', options.data);
    console.log('Headers:', options.headers);
    console.groupEnd();

    return new Promise(function (resolve, reject) {
      var ajaxConfig = {
        url: options.url,
        type: options.method || 'POST',
        contentType: options.contentType || 'application/json',
        data: options.data,
        headers: options.headers || {},
        xhrFields: {
          withCredentials: true
        },
        beforeSend: function (xhr, settings) {
          console.log('[AuthApiClient] Before Send - Method:', settings.type);
          console.log('[AuthApiClient] Before Send - URL:', settings.url);
          console.log('[AuthApiClient] Before Send - Data:', settings.data);
        },
        success: function (response, textStatus, xhr) {
          console.group('[AuthApiClient] Success');
          console.log('Status:', xhr.status);
          console.log('Response:', response);
          console.groupEnd();
          resolve(response);
        },
        error: function (xhr, textStatus, errorThrown) {
          console.group('[AuthApiClient] Error');
          console.log('Status:', xhr.status);
          console.log('Status Text:', xhr.statusText);
          console.log('Ready State:', xhr.readyState);
          console.log('Response Text:', xhr.responseText);
          console.log('Text Status:', textStatus);
          console.log('Error Thrown:', errorThrown);
          console.log('All Response Headers:', xhr.getAllResponseHeaders());
          console.groupEnd();

          var errorResponse = {
            status: xhr.status,
            statusText: xhr.statusText,
            message: errorThrown || textStatus || 'Request failed',
            response: null,
            xhr: xhr
          };

          // Try to parse response
          try {
            if (xhr.responseText) {
              errorResponse.response = JSON.parse(xhr.responseText);
            }
          } catch (e) {
            errorResponse.response = xhr.responseText;
          }

          // Enhanced error messages
          if (xhr.status === 0) {
            errorResponse.message = 'Network Error - Possible causes:\n' +
              '1. Backend is not running\n' +
              '2. CORS is blocking the request\n' +
              '3. SSL certificate issue\n' +
              '4. URL is incorrect';
          } else if (xhr.status === 405) {
            errorResponse.message = 'Method Not Allowed (405) - Backend expects different method';
          } else if (xhr.status >= 500) {
            errorResponse.message = 'Server Error (' + xhr.status + ')';
          }

          reject(errorResponse);
        }
      };

      console.log('[AuthApiClient] Sending AJAX request with config:', ajaxConfig);
      $.ajax(ajaxConfig);
    });
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Login - Authenticate user and get tokens
     * @param {string} loginId - User login ID
     * @param {string} password - User password
     * @returns {Promise} Promise resolving to login response
     */
    login: function (loginId, password, isRememberMe) {
      console.log('[AuthApiClient] Attempting login for user:', loginId);

      if (!loginId || !password) {
        return Promise.reject({
          status: 400,
          message: 'Login ID and password are required'
        });
      }

      var payload = {
        LoginId: loginId,
        Password: password,
        IsRememberMe: isRememberMe
      };
      debugger;
      return _makeRequest({
        url: _getEndpoint('/login'),
        method: 'POST',
        data: JSON.stringify(payload),
        contentType: 'application/json'
      }).then(function (response) {
        console.log('[AuthApiClient] Login successful');
        return response;
      }).catch(function (error) {
        console.error('[AuthApiClient] Login failed:', error);
        console.error('[AuthApiClient] Login failed:', error.message);
        throw error;
      });
    },

    /**
     * Refresh Token - Get new access token using refresh token cookie
     * @returns {Promise} Promise resolving to new token response
     */
    refreshToken: function () {
      console.log('[AuthApiClient] Refreshing access token...');

      return _makeRequest({
        url: _getEndpoint('/refresh-token'),
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({}) // Empty body, cookie sent automatically
      }).then(function (response) {
        console.log('[AuthApiClient] Token refresh successful');
        return response;
      }).catch(function (error) {
        console.error('[AuthApiClient] Token refresh failed:', error.message);
        throw error;
      });
    },

    /**
     * Logout - Revoke all tokens and clear session
     * @param {string} accessToken - Current access token
     * @returns {Promise} Promise resolving when logout complete
     */
    logout: function (accessToken) {
      console.log('[AuthApiClient] Logging out...');

      var headers = {};
      if (accessToken) {
        headers['Authorization'] = 'Bearer ' + accessToken;
      }

      return _makeRequest({
        url: _getEndpoint('/logout'),
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({}),
        headers: headers
      }).then(function (response) {
        console.log('[AuthApiClient] Logout successful');
        return response;
      }).catch(function (error) {
        // Even if logout fails, consider it successful on client side
        console.warn('[AuthApiClient] Logout request failed, but continuing:', error.message);
        return { success: true };
      });
    },

    /**
     * Revoke Token - Manually revoke refresh token
     * @param {string} accessToken - Current access token
     * @returns {Promise} Promise resolving when token revoked
     */
    revokeToken: function (accessToken) {
      console.log('[AuthApiClient] Revoking token...');

      var headers = {};
      if (accessToken) {
        headers['Authorization'] = 'Bearer ' + accessToken;
      }

      return _makeRequest({
        url: _getEndpoint('/revoke-token'),
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({}),
        headers: headers
      }).then(function (response) {
        console.log('[AuthApiClient] Token revoked successfully');
        return response;
      }).catch(function (error) {
        console.error('[AuthApiClient] Token revocation failed:', error.message);
        throw error;
      });
    },

    /**
     * Get User Info - Fetch current user information
     * @param {string} accessToken - Current access token
     * @returns {Promise} Promise resolving to user info
     */
    getUserInfo: function (accessToken) {
      console.log('[AuthApiClient] Fetching user info...');

      if (!accessToken) {
        return Promise.reject({
          status: 401,
          message: 'Access token is required'
        });
      }

      return _makeRequest({
        url: _getEndpoint('/user-info'),
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Accept': 'application/json'
        }
      }).then(function (response) {
        console.log('[AuthApiClient] User info retrieved successfully');
        return response;
      }).catch(function (error) {
        console.error('[AuthApiClient] Failed to get user info:', error.message);
        throw error;
      });
    },

    /**
     * Test token validity
     * @param {string} accessToken - Token to test
     * @returns {Promise} Promise resolving to validation result
     */
    validateToken: function (accessToken) {
      console.log('[AuthApiClient] Validating token...');

      if (!accessToken) {
        return Promise.reject({
          status: 400,
          message: 'Token is required for validation'
        });
      }

      return _makeRequest({
        url: _getEndpoint('/verify-token'),
        method: 'POST',
        data: JSON.stringify({ Token: accessToken }),
        contentType: 'application/json'
      }).then(function (response) {
        console.log('[AuthApiClient] Token is valid');
        return response;
      }).catch(function (error) {
        console.error('[AuthApiClient] Token validation failed:', error.message);
        throw error;
      });
    },

    /**
     * Get API configuration info
     * @returns {object} API configuration
     */
    getConfig: function () {
      return {
        baseUrl: _getApiBaseUrl(),
        endpoints: {
          login: '/login',
          refreshToken: '/refresh-token',
          logout: '/logout',
          revokeToken: '/revoke-token',
          getUserInfo: '/user-info',
          validateToken: '/verify-token'
        },
        withCredentials: true // Cookies enabled
      };
    }
  };
})();

// Log initialization
console.log('%c[AuthApiClient] ✓ Initialized', 'color: #4CAF50; font-weight: bold;');
console.log('[AuthApiClient] API Base URL:', AuthApiClient.getConfig().baseUrl);