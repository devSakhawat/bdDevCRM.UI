/*=========================================================
 * Application Bootstrap
 * File: app.bootstrap.js
 * Description: Initialize application on page load
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

(function () {
  'use strict';

  // Wait for DOM ready
  $(document).ready(function () {
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #2196F3');
    console.log('%c   bdDevCRM Application Starting...', 'color: #2196F3; font-size: 14px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #2196F3');

    try {
      // Initialize Application
      if (typeof App !== 'undefined' && typeof App.init === 'function') {
        App.init();
      } else {
        console.error('❌ App not found or init method missing');
        return;
      }

      // Test core systems
      _testCoreSystems();

      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50');
      console.log('%c   ✅ Application Ready!', 'color: #4CAF50; font-size: 14px; font-weight: bold');
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50');

    } catch (error) {
      console.error('❌ Application initialization failed:', error);
    }
  });

  /**
   * Test core systems
   */
  function _testCoreSystems() {
    console.log('%c🧪 Testing Core Systems...', 'color: #FF9800; font-size: 12px');

    // Test Logger
    if (typeof App.Logger !== 'undefined') {
      console.log('✅ Logger: OK');
      App.Logger.debug('Logger test message');
    } else {
      console.warn('⚠️ Logger: Not available');
    }

    // Test EventBus
    if (typeof App.EventBus !== 'undefined') {
      console.log('✅ EventBus: OK');

      // Test event
      App.EventBus.on('test:event', function (data) {
        console.log('📡 EventBus test event received:', data);
      });
      App.EventBus.emit('test:event', { message: 'Hello from EventBus!' });
      App.EventBus.off('test:event');

    } else {
      console.warn('⚠️ EventBus: Not available');
    }

    // Test StateManager
    if (typeof App.StateManager !== 'undefined') {
      console.log('✅ StateManager: OK');

      // Test state
      App.StateManager.setState('test', 'value', true); // silent mode
      var testValue = App.StateManager.getState('test');
      console.log('💾 StateManager test value:', testValue);
      App.StateManager.removeState('test', true);

    } else {
      console.warn('⚠️ StateManager: Not available');
    }

    // Test DI Container
    if (typeof App.DI !== 'undefined') {
      console.log('✅ DI Container: OK');

      // Show registered services
      var services = App.DI.getRegisteredServices();
      console.log('📦 Registered services:', services.length, '→', services.join(', '));

    } else {
      console.warn('⚠️ DI Container: Not available');
    }

    // Test BaseComponent
    if (typeof BaseComponent !== 'undefined') {
      console.log('✅ BaseComponent: OK');
    } else {
      console.warn('⚠️ BaseComponent: Not available');
    }

    console.log('%c🧪 Core Systems Test Complete!', 'color: #FF9800; font-size: 12px');
  }

  /**
   * Global app info (for debugging in console)
   */
  window.appInfo = function () {
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #9C27B0');
    console.log('%c   Application Information', 'color: #9C27B0; font-size: 14px; font-weight: bold');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #9C27B0');

    console.log('App Name:', 'bdDevCRM');
    console.log('Version:', '2.0.0');
    console.log('Environment:', AppConfig.isDevelopment() ? 'Development' : 'Production');
    console.log('API URL:', AppConfig.getApiUrl());
    console.log('Initialized:', App.isInitialized());

    if (App.DI) {
      console.log('Registered Services:', App.DI.getRegisteredServices());
    }

    if (App.EventBus) {
      console.log('Active Events:', App.EventBus.getEvents());
    }

    if (App.StateManager) {
      console.log('Current State:', App.StateManager.getAllState());
    }

    console.log('Registered Modules:', App.getModules());

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #9C27B0');
    console.log('%cType appInfo() anytime to see this info', 'color: #9C27B0; font-style: italic');
  };

})();