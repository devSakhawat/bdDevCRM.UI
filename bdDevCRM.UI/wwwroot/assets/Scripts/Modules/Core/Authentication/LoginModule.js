/*=========================================================
 * Login Module
 * File: LoginModule.js
 * Description: Modern login with refresh token support
 * Author: devSakhawat
 * Date: 2025-11-26
=========================================================*/

var LoginModule = (function () {
  'use strict';

  var _config = {
    formId: 'loginForm',
    loginIdField: 'txtLoginId',
    passwordField: 'txtPassword',
    rememberMeField: 'chkRememberMe',
    loginButton: 'btnLogin',
    dashboardUrl: '/Home/Index'
  };

  var _state = {
    isLoggingIn: false
  };

  // Validation
  function _validateCredentials() {
    var errors = [];
    var loginId = $('#' + _config.loginIdField).val().trim();
    var password = $('#' + _config.passwordField).val();

    if (!loginId || loginId === '') {
      errors.push('Login ID is required');
      $('#' + _config.loginIdField).focus();
    }

    if (!password || password === '') {
      errors.push('Password is required');
      if (errors.length === 1) {
        $('#' + _config.passwordField).focus();
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      credentials: { LoginId: loginId, Password: password }
    };
  }

  // Remember Me
  function _saveRememberMe(loginId) {
    var rememberMe = $('#' + _config.rememberMeField).is(':checked');
    if (rememberMe) {
      StorageManager.setItem('rememberedLoginId', loginId);
    } else {
      StorageManager.removeItem('rememberedLoginId');
    }
  }

  function _loadRememberMe() {
    var rememberedLoginId = StorageManager.getItem('rememberedLoginId');
    if (rememberedLoginId) {
      $('#' + _config.loginIdField).val(rememberedLoginId);
      $('#' + _config.rememberMeField).prop('checked', true);
    }
  }

  // Login Flow
  async function _performLogin() {
    if (_state.isLoggingIn) {
      console.warn('Login already in progress');
      return;
    }

    _state.isLoggingIn = true;

    try {
      var validation = _validateCredentials();

      if (!validation.isValid) {
        if (typeof MessageManager !== 'undefined') {
          MessageManager.alert.warning('Validation Error', validation.errors.join('<br>'));
        } else {
          alert('Validation Error\n\n' + validation.errors.join('\n'));
        }
        return;
      }

      if (typeof MessageManager !== 'undefined') {
        MessageManager.loading.show('Logging in...');
      }

      // Call login API
      var response = await ApiCallManager.post(
        AppConfig.getApiUrl(),
        '/login',
        validation.credentials,
        { retry: false, showErrorNotifications: false }
      );

      if (!response || !response.Data) {
        throw new Error('Invalid login response');
      }

      var tokenResponse = response.Data;

      // Store tokens using StorageManager
      StorageManager.setTokens(tokenResponse);
      console.log('✅ Tokens stored');

      // Get user info
      var userInfoResponse = await ApiCallManager.get(AppConfig.getApiUrl(), '/user-info');

      if (!userInfoResponse) {
        throw new Error('Failed to get user info');
      }

      // Store user info
      StorageManager.setUserInfo(userInfoResponse);
      console.log('✅ User info stored:', userInfoResponse);

      // Save remember me
      _saveRememberMe(validation.credentials.LoginId);

      // Success notification
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.success('Login successful!  Redirecting.. .');
      }

      // Trigger login event
      if (typeof EventBus !== 'undefined') {
        EventBus.publish('auth:login', userInfoResponse);
      }

      // Redirect
      setTimeout(function () {
        window.location.href = AppConfig.getUiUrl() + _config.dashboardUrl;
      }, 500);

    } catch (error) {
      console.error('❌ Login failed:', error);

      if (typeof MessageManager !== 'undefined') {
        MessageManager.loading.hide();
      }

      var errorMessage = 'Login failed. Please try again. ';

      if (error && error.Message) {
        errorMessage = error.Message;
      } else if (error && error.message) {
        errorMessage = error.message;
      }

      if (typeof MessageManager !== 'undefined') {
        MessageManager.alert.error('Login Failed', errorMessage);
      } else {
        alert('Login Failed\n\n' + errorMessage);
      }

    } finally {
      _state.isLoggingIn = false;

      if (typeof MessageManager !== 'undefined') {
        MessageManager.loading.hide();
      }
    }
  }

  // Event Binding
  function _bindEvents() {
    $('#' + _config.loginButton).on('click', function (e) {
      e.preventDefault();
      _performLogin();
    });

    $('#' + _config.passwordField).on('keypress', function (e) {
      if (e.which === 13 || e.keyCode === 13) {
        e.preventDefault();
        _performLogin();
      }
    });

    $('#' + _config.loginIdField).on('keypress', function (e) {
      if (e.which === 13 || e.keyCode === 13) {
        e.preventDefault();
        $('#' + _config.passwordField).focus();
      }
    });
  }

  // Initialization
  function init() {
    console.log('🔧 Initializing Login Module...');

    if (typeof StorageManager === 'undefined') {
      console.error('❌ StorageManager not loaded! ');
      return;
    }

    if (typeof ApiCallManager === 'undefined') {
      console.error('❌ ApiCallManager not loaded!');
      return;
    }

    _loadRememberMe();
    _bindEvents();

    console.log('✅ Login Module initialized');
  }

  return { init: init };
})();

console.log('%c[LoginModule] ✓ Loaded', 'color: #4CAF50; font-weight: bold;');