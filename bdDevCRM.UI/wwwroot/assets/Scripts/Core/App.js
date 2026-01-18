/*=========================================================
 * Application Core
 * File: App.js
 * Description: Main application bootstrap and initialization
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var App = App || {};

(function () {
  'use strict';

  // Private properties
  var _initialized = false;
  var _modules = {};

  /**
   * Initialize core systems
   */
  function _initializeCoreSystems() {

    // Initialize Logger first
    if (App.Logger) {
      App.Logger.init(AppConfig.isDevelopment() ? 'DEBUG' : 'INFO');
    }

    // Initialize EventBus
    if (App.EventBus) {
      App.EventBus.init();
    }

    // Initialize StateManager
    if (App.StateManager) {
      App.StateManager.init();
    }

    // Initialize DI Container
    if (App.DI) {
      App.DI.init();
    }

    App.Logger.info('Core systems initialized');
  }

  /**
   * Register default services
   */
  function _registerDefaultServices() {
    App.Logger.info('Registering default services...');

    // Register existing services if they exist
    if (typeof GroupService !== 'undefined') {
      App.DI.register('GroupService', GroupService);
    }

    if (typeof CourseService !== 'undefined') {
      App.DI.register('CourseService', CourseService);
    }

    if (typeof InstituteService !== 'undefined') {
      App.DI.register('InstituteService', InstituteService);
    }

    if (typeof UserService !== 'undefined') {
      App.DI.register('UserService', UserService);
    }

    if (typeof CRMApplicationService !== 'undefined') {
      App.DI.register('CRMApplicationService', CRMApplicationService);
    }

    App.Logger.info('Default services registered');
  }

  /**
   * Setup global error handler
   */
  function _setupGlobalErrorHandler() {
    window.addEventListener('error', function (event) {
      App.Logger.error('Global Error:', event.error || event.message);
    });

    window.addEventListener('unhandledrejection', function (event) {
      App.Logger.error('Unhandled Promise Rejection:', event.reason);
    });

    App.Logger.info('Global error handlers setup');
  }

  /**
   * Setup token refresh
   */
  function _setupTokenRefresh() {
    if (typeof TokenManager !== 'undefined') {
      // Check token every 5 minutes
      setInterval(function () {
        TokenManager.checkAndRefresh().catch(function (error) {
          App.Logger.error('Token refresh failed:', error);
        });
      }, 5 * 60 * 1000);

      App.Logger.info('Token refresh scheduled');
    }
  }

  /**
   * Main initialization
   */
  App.init = function () {
    if (_initialized) {
      console.warn('App already initialized');
      return;
    }

    // console.log('%c🚀 Initializing bdDevCRM Application...', 'color: #4CAF50; font-size: 16px; font-weight: bold;');

    try {
      // 1. Initialize core systems
      _initializeCoreSystems();

      // 2. Register services
      _registerDefaultServices();

      // 3. Setup global error handler
      _setupGlobalErrorHandler();

      // 4. Setup token refresh
      _setupTokenRefresh();

      _initialized = true;

      // console.log('%cApplication initialized successfully!', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
      App.Logger.info('Application ready');

      // Emit app initialized event
      if (App.EventBus) {
        App.EventBus.emit('app:initialized');
      }

    } catch (error) {
      // console.log('Failed to initialize application:', error);
      if (App.Logger) {
        App.Logger.error('Initialization failed:', error);
      }
    }
  };

  /**
   * Register a module
   */
  App.registerModule = function (name, module) {
    if (!name) {
      // console.log('Module name is required');
      return;
    }

    if (_modules.hasOwnProperty(name)) {
      console.warn('Module "' + name + '" already registered. Overwriting.');
    }

    _modules[name] = module;
    App.Logger.info('Module registered:', name);

    // Emit event
    if (App.EventBus) {
      App.EventBus.emit('module:registered', { name: name });
    }
  };

  /**
   * Get a module
   */
  App.getModule = function (name) {
    return _modules[name] || null;
  };

  /**
   * Start a module
   */
  App.startModule = function (name, config) {
    var module = _modules[name];

    if (!module) {
      App.Logger.error('Module not found:', name);
      return;
    }

    if (typeof module.init === 'function') {
      App.Logger.info('Starting module:', name);
      module.init(config || {});

      // Emit event
      if (App.EventBus) {
        App.EventBus.emit('module:started', { name: name });
      }
    } else {
      App.Logger.warn('Module "' + name + '" has no init method');
    }
  };

  /**
   * Stop a module
   */
  App.stopModule = function (name) {
    var module = _modules[name];

    if (!module) {
      App.Logger.error('Module not found:', name);
      return;
    }

    if (typeof module.destroy === 'function') {
      App.Logger.info('Stopping module:', name);
      module.destroy();

      // Emit event
      if (App.EventBus) {
        App.EventBus.emit('module:stopped', { name: name });
      }
    }
  };

  /**
   * Get all registered modules
   */
  App.getModules = function () {
    return Object.keys(_modules);
  };

  /**
   * Check if app is initialized
   */
  App.isInitialized = function () {
    return _initialized;
  };

})();