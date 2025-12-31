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
    checkIntervalMinutes: 1,
    refreshBufferMinutes: 2
  };

  // ============================================
  // PUBLIC - Token Refresh
  // ============================================

  function startAutoRefresh() {
    if (_state.refreshInterval) {
      console.warn('Auto-refresh already started');
      return;
    }

    console.log('🔄 Starting automatic token refresh.. .');
    _checkAndRefreshToken();

    _state.refreshInterval = setInterval(function () {
      _checkAndRefreshToken();
    }, _config.checkIntervalMinutes * 60 * 1000);

    console.log('Auto-refresh started (checking every ' + _config.checkIntervalMinutes + ' minute)');
  }

  function stopAutoRefresh() {
    if (_state.refreshInterval) {
      clearInterval(_state.refreshInterval);
      _state.refreshInterval = null;
      console.log('Auto-refresh stopped');
    }
  }

  async function refreshToken() {
    if (_state.isRefreshing) {
      console.warn('Token refresh already in progress');
      return false;
    }

    _state.isRefreshing = true;

    try {
      console.log('🔄 Refreshing token...');

      var refreshTokenValue = StorageManager.getRefreshToken();

      if (!refreshTokenValue) {
        console.error('No refresh token found');
        _handleRefreshFailure();
        return false;
      }

      if (StorageManager.isRefreshTokenExpired()) {
        console.error('Refresh token expired');
        _handleRefreshFailure();
        return false;
      }

      var response = await ApiCallManager.post(
        AppConfig.getApiUrl(),
        '/refresh-token',
        { RefreshToken: refreshTokenValue },
        {
          retry: false,
          showErrorNotifications: false,
          skipTokenRefresh: true
        }
      );

      if (!response || !response.Data) {
        throw new Error('Invalid refresh token response');
      }

      StorageManager.setTokens(response.Data);
      console.log('Token refreshed successfully');

      if (typeof EventBus !== 'undefined') {
        EventBus.publish('token:refreshed', response.Data);
      }

      return true;

    } catch (error) {
      console.error('Token refresh failed:', error);
      _handleRefreshFailure();
      return false;

    } finally {
      _state.isRefreshing = false;
    }
  }

  // ============================================
  // PRIVATE - Helper Functions
  // ============================================

  async function _checkAndRefreshToken() {
    if (!AppConfig.isAuthenticated()) {
      return;
    }

    if (StorageManager.isAccessTokenExpired()) {
      console.log('🔄 Access token expired, refreshing...');
      await refreshToken();
    }
  }

  function _handleRefreshFailure() {
    console.error('Refresh token failed, logging out.. .');

    stopAutoRefresh();
    StorageManager.clearTokens();
    StorageManager.clearUserInfo();

    if (typeof EventBus !== 'undefined') {
      EventBus.publish('auth:logout', { reason: 'refresh_failed' });
    }

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

  function hasToken() {
    return !!StorageManager.getAccessToken();
  }

  function clearSession() {
    stopAutoRefresh();
    StorageManager.clearTokens();
    StorageManager.clearUserInfo();
  }

  function redirectToLogin() {
    var loginUrl = (typeof AppConfig !== 'undefined' && AppConfig.getUiUrl)
      ? AppConfig.getUiUrl() + '/Home/Login'
      : '/Home/Login';
    window.location.href = loginUrl;
  }

  async function checkAndRefresh() {
    await _checkAndRefreshToken();
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    startAutoRefresh: startAutoRefresh,
    stopAutoRefresh: stopAutoRefresh,
    refreshToken: refreshToken,
    getTokenStatus: getTokenStatus,
    hasToken: hasToken,
    clearSession: clearSession,
    redirectToLogin: redirectToLogin,
    checkAndRefresh: checkAndRefresh
  };
})();

console.log('%c[TokenManager] ✓ Loaded', 'color: #4CAF50; font-weight: bold;');

// নিচের এই লাইনগুলো মুছে ফেলুন - এগুলো ভুল ছিল:
// if (typeof AppConfig !== 'undefined' && AppConfig.getToken) {
//   return AppConfig.getToken(); // ILLEGAL - function এর বাইরে return
// }