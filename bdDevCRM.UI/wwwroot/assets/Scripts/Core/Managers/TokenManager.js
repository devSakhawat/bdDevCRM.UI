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
    refreshPromise : null,
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

    _checkAndRefreshToken();

    _state.refreshInterval = setInterval(function () {
      _checkAndRefreshToken();
    }, _config.checkIntervalMinutes * 60 * 1000);

  }

  function stopAutoRefresh() {
    if (_state.refreshInterval) {
      clearInterval(_state.refreshInterval);
      _state.refreshInterval = null;
    }
  }

  async function refreshToken() {
    debugger;
    if (_state.isRefreshing && _state.refreshPromise) {
      return _state.refreshPromise; // Prevent duplicate
    }

    _state.isRefreshing = true;

    _state.refreshPromise = (async function () {
      try {

        // Simply call ApiCallManager's method
        var success = await ApiCallManager.refreshToken();

        if (!success) {
          _handleRefreshFailure();
          return false;
        }

        if (StorageManager.isRefreshTokenExpired()) {
          console.error('[TokenManager] Refresh token expired');
          _handleRefreshFailure();
          return false;
        }

        var baseUrl = AppConfig.getApiUrl();

        // Cookie will be sent automatically
        var response = await fetch(baseUrl + '/auth/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        var data = await response.json();

        if (!data.IsSuccess || !data.Data) {
          throw new Error('Invalid refresh response');
        }

        // Store new access token
        StorageManager.setTokens(data.Data);

        console.log('[TokenManager] Token refreshed successfully');
        return true;

      } catch (error) {
        console.error('[TokenManager] Refresh failed:', error);
        _handleRefreshFailure();
        return false;

      } finally {
        _state.isRefreshing = false;
        _state.refreshPromise = null;
      }
    })();

    return _state.refreshPromise;
  }

  //async function refreshToken() {
  //  if (_state.isRefreshing) {
  //    console.warn('Token refresh already in progress');
  //    return false;
  //  }

  //  _state.isRefreshing = true;

  //  try {

  //    //var refreshTokenValue = StorageManager.getRefreshToken();

  //    //if (!refreshTokenValue) {
  //    //  console.error('No refresh token found');
  //    //  _handleRefreshFailure();
  //    //  return false;
  //    //}

  //    if (StorageManager.isRefreshTokenExpired()) {
  //      console.error('Refresh token expired');
  //      _handleRefreshFailure();
  //      return false;
  //    }

  //    var response = await ApiCallManager.post(
  //      AppConfig.getApiUrl(),
  //      AppConfig.endpoints.refreshToken ||  '/refresh-token',
  //      {
  //        retry: false,
  //        showErrorNotifications: false,
  //        skipTokenRefresh: true
  //      }
  //    );

  //    if (!response.Data || !response.data || response) {
  //      throw new Error('Invalid refresh token response');
  //    }

  //    StorageManager.setTokens(response.Data || response.data || response);
  //    console.log('Token refreshed successfully');

  //    if (typeof EventBus !== 'undefined') {
  //      EventBus.publish('token:refreshed', response.Data);
  //    }

  //    return true;

  //  } catch (error) {
  //    console.error('Token refresh failed:', error);
  //    _handleRefreshFailure();
  //    return false;

  //  } finally {
  //    _state.isRefreshing = false;
  //  }
  //}

  // ============================================
  // PRIVATE - Helper Functions
  // ============================================

  async function _checkAndRefreshToken() {
    if (!StorageManager.hasValidToken()) {
      return;
    }

    if (StorageManager.isAccessTokenExpired()) {
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
      //hasRefreshToken: !!StorageManager.getRefreshToken(),
      isAccessTokenExpired: StorageManager.isAccessTokenExpired(),
      isRefreshTokenExpired: StorageManager.isRefreshTokenExpired(),
      accessTokenExpiry: StorageManager.getAccessTokenExpiry(),
      refreshTokenExpiry: StorageManager.getRefreshTokenExpiry()
    };
  }

  //function hasToken() {
  //  return !!StorageManager.getAccessToken();
  //}

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

  /**
     * Handle login response
     * Stores tokens, user info, and starts auto-refresh
     * 
     * @param {object} loginData - Response from login API
     * @param {string} loginData.AccessToken - JWT access token
     * @param {string} loginData.AccessTokenExpiry - ISO date string
     * @param {number} loginData.ExpiresIn - Seconds until expiry
     * @param {string} loginData.RefreshTokenExpiry - ISO date string (optional)
     * @param {object} loginData.UserSession - User session data (optional)
     * @returns {boolean} Success status
     */
  function handleLoginResponse(loginData) {
    if (!loginData) {
      console.error('[TokenManager] Invalid login data provided');
      return false;
    }

    console.log('[TokenManager] Processing login response...');

    try {
      // 1. Store tokens
      if (typeof StorageManager !== 'undefined') {
        var tokensStored = StorageManager.setTokens(loginData);
        if (!tokensStored) {
          console.error('[TokenManager] Failed to store tokens');
          return false;
        }
      } else {
        console.error('[TokenManager] StorageManager not available');
        return false;
      }

      // 2. Store user session/info if available
      if (loginData.UserSession) {
        if (typeof StorageManager !== 'undefined') {
          StorageManager.setUserInfo(loginData.UserSession);
          console.log('[TokenManager] User session stored');
        }
      }

      // 3. Start auto-refresh mechanism
      startAutoRefresh();
      console.log('[TokenManager] Auto-refresh started');

      // 4. Publish event (if EventBus available)
      if (typeof EventBus !== 'undefined') {
        EventBus.publish('auth:login', {
          userId: loginData.UserSession?.UserId,
          timestamp: new Date().toISOString()
        });
      }

      console.log('[TokenManager] Login handled successfully');
      return true;

    } catch (error) {
      console.error('[TokenManager] Error handling login response:', error);
      return false;
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    startAutoRefresh: startAutoRefresh,
    stopAutoRefresh: stopAutoRefresh,
    refreshToken: refreshToken,
    getTokenStatus: getTokenStatus,
    //hasToken: hasToken,
    clearSession: clearSession,
    redirectToLogin: redirectToLogin,
    checkAndRefresh: checkAndRefresh,
    handleLoginResponse: handleLoginResponse
  };
})();

//console.log('%c[TokenManager] ✓ Loaded', 'color: #4CAF50; font-weight: bold;');
