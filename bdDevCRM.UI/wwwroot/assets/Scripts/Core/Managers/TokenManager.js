/// <reference path="storagemanager.js" />
/*=========================================================
 * Token Manager
 * File: TokenManager.js
 * Description: Manages JWT tokens with auto-refresh
 * Author: devSakhawat
 * Date: 2025-11-26
=========================================================*/

var TokenManager = (function () {
  'use strict';

  // ============================================
  // PRIVATE - State
  // ============================================
  var _state = {
    refreshInterval: null,
    isRefreshing: false
  };

  // ============================================
  // PRIVATE - Configuration
  // ============================================
  var _config = {
    checkIntervalMinutes: 1, // Check token expiry every 1 minute
    refreshBufferMinutes: 2  // Refresh token if expires in < 2 minutes
  };

  // ============================================
  // PUBLIC - Token Refresh
  // ============================================

  /**
   * Start automatic token refresh
   */
  function startAutoRefresh() {
    if (_state.refreshInterval) {
      console.warn('⚠️ Auto-refresh already started');
      return;
    }

    console.log('🔄 Starting automatic token refresh...');

    // Check immediately
    _checkAndRefreshToken();

    // Then check periodically
    _state.refreshInterval = setInterval(function () {
      _checkAndRefreshToken();
    }, _config.checkIntervalMinutes * 60 * 1000);

    console.log('✅ Auto-refresh started (checking every ' + _config.checkIntervalMinutes + ' minute)');
  }

  /**
   * Stop automatic token refresh
   */
  function stopAutoRefresh() {
    if (_state.refreshInterval) {
      clearInterval(_state.refreshInterval);
      _state.refreshInterval = null;
      console.log('✅ Auto-refresh stopped');
    }
  }

  /**
   * Manually refresh token
   * @returns {Promise<boolean>} Success status
   */
  async function refreshToken() {
    if (_state.isRefreshing) {
      console.warn('⚠️ Token refresh already in progress');
      return false;
    }

    _state.isRefreshing = true;

    try {
      console.log('🔄 Refreshing token...');

      var refreshToken = StorageManager.getRefreshToken();

      if (!refreshToken) {
        console.error('❌ No refresh token found');
        _handleRefreshFailure();
        return false;
      }

      // Check if refresh token is expired
      if (StorageManager.isRefreshTokenExpired()) {
        console.error('❌ Refresh token expired');
        _handleRefreshFailure();
        return false;
      }

      // Call refresh token API
      var response = await ApiCallManager.post(
        AppConfig.getApiUrl(),
        '/refresh-token',
        { RefreshToken: refreshToken },
        {
          retry: false,
          showErrorNotifications: false,
          skipTokenRefresh: true // Important: Prevent infinite loop
        }
      );

      if (!response || !response.Data) {
        throw new Error('Invalid refresh token response');
      }

      // Store new tokens
      StorageManager.setTokens(response.Data);

      console.log('✅ Token refreshed successfully');

      // Trigger event
      if (typeof EventBus !== 'undefined') {
        EventBus.publish('token:refreshed', response.Data);
      }

      return true;

    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      _handleRefreshFailure();
      return false;

    } finally {
      _state.isRefreshing = false;
    }
  }

  // ============================================
  // PRIVATE - Helper Functions
  // ============================================

  /**
   * Check if token needs refresh and refresh if needed
   */
  async function _checkAndRefreshToken() {
    // Check if user is authenticated
    if (!AppConfig.isAuthenticated()) {
      return;
    }

    // Check if access token is expired or about to expire
    if (StorageManager.isAccessTokenExpired()) {
      console.log('🔄 Access token expired, refreshing...');
      await refreshToken();
    }
  }

  /**
   * Handle refresh token failure
   */
  function _handleRefreshFailure() {
    console.error('❌ Refresh token failed, logging out...');

    // Stop auto-refresh
    stopAutoRefresh();

    // Clear tokens
    StorageManager.clearTokens();
    StorageManager.clearUserInfo();

    // Trigger event
    if (typeof EventBus !== 'undefined') {
      EventBus.publish('auth:logout', { reason: 'refresh_failed' });
    }

    // Redirect to login
    setTimeout(function () {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.alert.warning(
          'Session Expired',
          'Your session has expired. Please log in again.',
          function () {
            window.location.href = AppConfig.getUiUrl() + '/Home/Login';
          }
        );
      } else {
        alert('Session Expired\n\nYour session has expired. Please log in again.');
        window.location.href = AppConfig.getUiUrl() + '/Home/Login';
      }
    }, 100);
  }

  // ============================================
  // PUBLIC - Utility Functions
  // ============================================

  /**
   * Get current token status
   * @returns {object}
   */
  function getTokenStatus() {
    return {
      hasAccessToken: !!StorageManager.getAccessToken(),
      hasRefreshToken: !!StorageManager.getRefreshToken(),
      isAccessTokenExpired: StorageManager.isAccessTokenExpired(),
      isRefreshTokenExpired: StorageManager.isRefreshTokenExpired(),
      accessTokenExpiry: StorageManager.getAccessTokenExpiry(),
      refreshTokenExpiry: StorageManager.getRefreshTokenExpiry()
    };
  }

  /**
   * Check if token exists
   * @returns {boolean}
   */
  function hasToken() {
    return !!StorageManager.getAccessToken();
  }

  /**
   * Clear session and tokens
   */
  function clearSession() {
    stopAutoRefresh();
    StorageManager.clearTokens();
    StorageManager.clearUserInfo();
  }

  /**
   * Redirect to login page
   */
  function redirectToLogin() {
    var loginUrl = (typeof AppConfig !== 'undefined' && AppConfig.getUiUrl)
      ? AppConfig.getUiUrl() + '/Home/Login'
      : '/Home/Login';
    window.location.href = loginUrl;
  }

  /**
   * Check and refresh token if needed
   * @returns {Promise<void>}
   */
  async function checkAndRefresh() {
    await _checkAndRefreshToken();
  }

  // PUBLIC API 
  return {
    startAutoRefresh: startAutoRefresh,
    stopAutoRefresh: stopAutoRefresh,
    refreshToken: refreshToken,
    getTokenStatus: getTokenStatus,
    // New methods
    hasToken: hasToken,
    clearSession: clearSession,
    redirectToLogin: redirectToLogin,
    checkAndRefresh: checkAndRefresh
  };
})();

console.log('%c[TokenManager] ✓ Loaded', 'color: #4CAF50; font-weight: bold;');
// Token এখন AppConfig থেকে আসবে
if (typeof AppConfig !== 'undefined' && AppConfig.getToken) {
  return AppConfig.getToken(); // ✅ Working
}