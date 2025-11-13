/*=========================================================
 * Token Manager
 * File: TokenManager.js
 * Description: JWT Token management, validation, and refresh
 * Uses: AppConfig.js for token storage
 * Author: devSakhawat
 * Date: 2025-01-13
=========================================================*/

var TokenManager = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Helper Functions
  // ============================================

  /**
   * Check if AppConfig is available
   */
  function _checkDependency() {
    if (typeof AppConfig === 'undefined') {
      console.error('TokenManager: AppConfig is required but not found');
      return false;
    }
    return true;
  }

  /**
   * Get token from AppConfig
   */
  function _getToken() {
    return _checkDependency() ? AppConfig.getToken() : localStorage.getItem('jwtToken');
  }

  /**
   * Set token via AppConfig
   */
  function _setToken(token) {
    if (_checkDependency()) {
      AppConfig.setToken(token);
    } else {
      localStorage.setItem('jwtToken', token);
    }
  }

  /**
   * Remove token via AppConfig
   */
  function _removeToken() {
    if (_checkDependency()) {
      AppConfig.removeToken();
    } else {
      localStorage.removeItem('jwtToken');
    }
  }

  /**
   * Get API URL
   */
  function _getApiUrl() {
    return _checkDependency() ? AppConfig.getApiUrl() : (typeof baseApi !== 'undefined' ? baseApi : '');
  }

  // ============================================
  // PUBLIC - Token Validation
  // ============================================

  /**
   * Check if token exists
   * @returns {boolean}
   */
  function hasToken() {
    const token = _getToken();
    return !!token;
  }

  /**
   * Check if token is expired
   * @returns {boolean}
   */
  function isTokenExpired() {
    const token = _getToken();
    if (!token) return true;

    try {
      // Decode JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      // Check if token expires in next 5 minutes (buffer time)
      return currentTime >= (expiryTime - (5 * 60 * 1000));
    } catch (error) {
      console.error('TokenManager: Error parsing token:', error);
      return true;
    }
  }

  /**
   * Get token expiry date
   * @returns {Date|null}
   */
  function getTokenExpiry() {
    const token = _getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('TokenManager: Error parsing token:', error);
      return null;
    }
  }

  /**
   * Get remaining time before token expires (in seconds)
   * @returns {number}
   */
  function getRemainingTime() {
    const expiry = getTokenExpiry();
    if (!expiry) return 0;

    const remaining = Math.floor((expiry.getTime() - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  }

  // ============================================
  // PUBLIC - Token Refresh
  // ============================================

  /**
   * Refresh the JWT token
   * @returns {Promise<boolean>}
   */
  async function refreshToken() {
    try {
      const apiUrl = _getApiUrl();
      const token = _getToken();

      const response = await fetch(apiUrl + '/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.Token) {
          _setToken(data.Token);
          console.log('TokenManager: Token refreshed successfully');
          return true;
        }
      }

      console.warn('TokenManager: Token refresh failed - server response not ok');
      return false;
    } catch (error) {
      console.error('TokenManager: Token refresh error:', error);
      return false;
    }
  }

  /**
   * Check token and refresh if needed
   * @returns {Promise<boolean>}
   */
  async function checkAndRefresh() {
    if (!hasToken()) {
      console.warn('TokenManager: No token found');
      redirectToLogin('No authentication token found');
      return false;
    }

    if (isTokenExpired()) {
      console.log('TokenManager: Token expired, attempting refresh...');
      const refreshed = await refreshToken();

      if (!refreshed) {
        redirectToLogin('Session expired. Please login again.');
        return false;
      }
    }

    return true;
  }

  // ============================================
  // PUBLIC - User Info from Token
  // ============================================

  /**
   * Get user info from token
   * @returns {object|null}
   */
  function getUserInfoFromToken() {
    const token = _getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.sub || payload.userId || payload.nameid,
        username: payload.unique_name || payload.username || payload.name,
        email: payload.email,
        roles: payload.role || payload.roles || [],
        exp: payload.exp,
        iat: payload.iat
      };
    } catch (error) {
      console.error('TokenManager: Error parsing token:', error);
      return null;
    }
  }

  /**
   * Get user ID from token
   * @returns {string|null}
   */
  function getUserId() {
    const userInfo = getUserInfoFromToken();
    return userInfo ? userInfo.userId : null;
  }

  /**
   * Get username from token
   * @returns {string|null}
   */
  function getUsername() {
    const userInfo = getUserInfoFromToken();
    return userInfo ? userInfo.username : null;
  }

  /**
   * Get user email from token
   * @returns {string|null}
   */
  function getUserEmail() {
    const userInfo = getUserInfoFromToken();
    return userInfo ? userInfo.email : null;
  }

  /**
   * Get user roles from token
   * @returns {Array<string>}
   */
  function getUserRoles() {
    const userInfo = getUserInfoFromToken();
    if (!userInfo || !userInfo.roles) return [];

    return Array.isArray(userInfo.roles) ? userInfo.roles : [userInfo.roles];
  }

  // ============================================
  // PUBLIC - Role Checks
  // ============================================

  /**
   * Check if user has specific role
   * @param {string} roleName - Role name to check
   * @returns {boolean}
   */
  function hasRole(roleName) {
    const roles = getUserRoles();
    return roles.includes(roleName);
  }

  /**
   * Check if user has any of the specified roles
   * @param {Array<string>} roleNames - Array of role names
   * @returns {boolean}
   */
  function hasAnyRole(roleNames) {
    if (!Array.isArray(roleNames)) return false;

    const userRoles = getUserRoles();
    return roleNames.some(function (role) {
      return userRoles.includes(role);
    });
  }

  /**
   * Check if user has all specified roles
   * @param {Array<string>} roleNames - Array of role names
   * @returns {boolean}
   */
  function hasAllRoles(roleNames) {
    if (!Array.isArray(roleNames)) return false;

    const userRoles = getUserRoles();
    return roleNames.every(function (role) {
      return userRoles.includes(role);
    });
  }

  // ============================================
  // PUBLIC - Session Management
  // ============================================

  /**
   * Clear token and user data
   */
  function clearSession() {
    _removeToken();

    if (_checkDependency()) {
      AppConfig.removeUserInfo();
    } else {
      localStorage.removeItem('userInfo');
    }

    console.log('TokenManager: Session cleared');
  }

  /**
   * Redirect to login page
   * @param {string} message - Optional message to show
   */
  function redirectToLogin(message) {
    clearSession();

    // Show message if MessageManager is available
    if (typeof MessageManager !== 'undefined') {
      MessageManager.notify.warning(message || 'Your session has expired. Please login again.');
    } else if (typeof ToastrMessage !== 'undefined') {
      ToastrMessage.showWarning(message || 'Your session has expired. Please login again.');
    }

    // Redirect after a short delay
    setTimeout(function () {
      const loginUrl = _checkDependency()
        ? AppConfig.getUiUrl() + '/Home/Login'
        : (typeof baseUI !== 'undefined' ? baseUI + '/Home/Login' : '/Home/Login');

      window.location.href = loginUrl;
    }, 1500);
  }

  /**
   * Auto refresh token before expiry
   * @param {number} refreshBeforeSeconds - Refresh token this many seconds before expiry (default: 300 = 5 minutes)
   */
  function enableAutoRefresh(refreshBeforeSeconds) {
    refreshBeforeSeconds = refreshBeforeSeconds || 300; // Default 5 minutes

    setInterval(async function () {
      const remaining = getRemainingTime();

      if (remaining > 0 && remaining <= refreshBeforeSeconds) {
        console.log('TokenManager: Auto-refreshing token (remaining: ' + remaining + 's)');
        await checkAndRefresh();
      }
    }, 60000); // Check every minute
  }

  // ============================================
  // PUBLIC - Utilities
  // ============================================

  /**
   * Get token info for debugging
   * @returns {object}
   */
  function getTokenInfo() {
    return {
      hasToken: hasToken(),
      isExpired: isTokenExpired(),
      expiryDate: getTokenExpiry(),
      remainingSeconds: getRemainingTime(),
      userInfo: getUserInfoFromToken()
    };
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // Token validation
    hasToken: hasToken,
    isTokenExpired: isTokenExpired,
    getTokenExpiry: getTokenExpiry,
    getRemainingTime: getRemainingTime,

    // Token refresh
    refreshToken: refreshToken,
    checkAndRefresh: checkAndRefresh,
    enableAutoRefresh: enableAutoRefresh,

    // User info
    getUserInfoFromToken: getUserInfoFromToken,
    getUserId: getUserId,
    getUsername: getUsername,
    getUserEmail: getUserEmail,
    getUserRoles: getUserRoles,

    // Role checks
    hasRole: hasRole,
    hasAnyRole: hasAnyRole,
    hasAllRoles: hasAllRoles,

    // Session management
    clearSession: clearSession,
    redirectToLogin: redirectToLogin,

    // Utilities
    getTokenInfo: getTokenInfo
  };
})();

// ============================================
// Auto-initialization Check
// ============================================
(function () {
  if (typeof AppConfig === 'undefined') {
    console.warn(
      '%c[TokenManager] Warning: AppConfig not found. Token storage will use localStorage directly.',
      'color: orange; font-weight: bold;'
    );
  } else {
    console.log(
      '%c[TokenManager] ✓ Loaded successfully',
      'color: #4CAF50; font-weight: bold; font-size: 12px;'
    );
  }
})();