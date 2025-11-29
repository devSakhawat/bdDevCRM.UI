
/*=========================================================
 * Application Initializer
 * File: AppInitializer.js
 * Description: Main application initialization orchestrator
 * Author: devSakhawat
 * Date: 2025-11-26
=========================================================*/

var AppInitializer2 = (function () {
  'use strict';

  // ============================================
  // PRIVATE - State Management
  // ============================================
  var _state = {
    initialized: false,
    initStartTime: null,
    initEndTime: null
  };

  // ============================================
  // PRIVATE - Dependency Check
  // ============================================

  /**
   * Check if all core dependencies are loaded
   * @returns {object} - { allLoaded: boolean, missing: Array }
   */
  function _checkCoreDependencies() {
    var requiredDependencies = [
      'jQuery',
      'kendo',
      'AppConfig',
      'ApiCallManager',
      'MessageManager',
      'ModuleRegistry'
    ];

    var missing = [];

    var depStatus = {
      jQuery: typeof $ !== 'undefined',
      kendo: typeof kendo !== 'undefined',
      AppConfig: typeof AppConfig !== 'undefined',
      ApiCallManager: typeof ApiCallManager !== 'undefined',
      MessageManager: typeof MessageManager !== 'undefined',
      ModuleRegistry: typeof ModuleRegistry !== 'undefined'
    };

    for (var dep in depStatus) {
      if (!depStatus[dep]) {
        missing.push(dep);
      }
    }

    return {
      allLoaded: missing.length === 0,
      missing: missing,
      status: depStatus
    };
  }

  // ============================================
  // PRIVATE - Initialization Steps
  // ============================================

  /**
   * Step 1: Initialize core systems
   */
  async function _initCoreSystems() {
    console.log('🔧 Step 1: Initializing core systems...');

    // Initialize TokenManager if needed
    if (typeof TokenManager !== 'undefined' && TokenManager.init) {
      await TokenManager.init();
    }

    // Initialize StateManager if needed
    if (typeof StateManager !== 'undefined' && StateManager.init) {
      await StateManager.init();
    }

    console.log('✅ Core systems initialized');
  }

  /**
   * Step 2: Load menu (MUST complete before anything else)
   */
  async function _loadMenu() {
    console.log('🔧 Step 2: Loading menu...');

    // Update loading message
    if (typeof MessageManager !== 'undefined') {
      MessageManager.loading.show('Loading menu...');
    }

    // Check if user is authenticated
    if (!AppConfig.isAuthenticated()) {
      console.warn('⚠️ User not authenticated, skipping menu load');
      return;
    }

    // Load menu using MenuHelper from common. js
    if (typeof MenuHelper !== 'undefined' && MenuHelper.GetMenuInformation) {
      await MenuHelper.GetMenuInformation();
      console.log('✅ Menu loaded successfully');
    } else {
      console.error('❌ MenuHelper not found! ');
      throw new Error('MenuHelper is required but not loaded');
    }
  }

  /**
   * Step 3: Initialize route-specific modules
   */
  async function _initRouteModules() {
    console.log('🔧 Step 3: Initializing route-specific modules...');

    var currentPath = window.location.pathname;
    await ModuleRegistry.initByRoute(currentPath);

    console.log('✅ Route modules initialized');
  }

  /**
   * Step 4: Initialize auto-init modules
   */
  async function _initAutoModules() {
    console.log('🔧 Step 4: Initializing auto-init modules...');

    await ModuleRegistry.initAll();

    console.log('✅ Auto-init modules initialized');
  }

  /**
   * Step 5: Post-initialization tasks
   */
  async function _postInit() {
    console.log('🔧 Step 5: Running post-initialization tasks...');

    // Example: Load notifications, check updates, etc. 

    console.log('✅ Post-init tasks completed');
  }

  // ============================================
  // PUBLIC - Main Initialization
  // ============================================

  /**
   * Initialize the entire application
   * @returns {Promise<void>}
   */
  async function init() {
    if (_state.initialized) {
      console.warn('⚠️ App already initialized');
      return;
    }

    _state.initStartTime = Date.now();

    console.log(
      '%c🚀 Initializing bdDevCRM Application.. .',
      'color: #2196F3; font-weight: bold; font-size: 16px;'
    );

    try {
      // Show loading overlay
      if (typeof MessageManager !== 'undefined') {
        MessageManager.loading.show('Initializing application.. .');
      }

      // Step 0: Check dependencies
      console.log('🔍 Checking core dependencies...');
      var depCheck = _checkCoreDependencies();

      if (!depCheck.allLoaded) {
        var errorMsg = 'Missing core dependencies: ' + depCheck.missing.join(', ');
        console.error('❌', errorMsg);

        if (typeof MessageManager !== 'undefined') {
          MessageManager.loading.hide();
          MessageManager.alert.error('Initialization Failed', errorMsg);
        } else {
          alert('Initialization Failed\n\n' + errorMsg);
        }

        throw new Error(errorMsg);
      }

      console.log('✅ All core dependencies loaded');
      console.table(depCheck.status);

      // Step 1: Initialize core systems
      await _initCoreSystems();

      // Step 2: Load menu (CRITICAL - must complete first)
      await _loadMenu();

      // Step 3: Initialize route-specific modules
      await _initRouteModules();

      // Step 4: Initialize auto-init modules
      await _initAutoModules();

      // Step 5: Post-initialization
      await _postInit();

      // Mark as initialized
      _state.initialized = true;
      _state.initEndTime = Date.now();

      var initTime = _state.initEndTime - _state.initStartTime;

      console.log(
        '%c✅ Application initialized successfully in ' + initTime + 'ms',
        'color: #4CAF50; font-weight: bold; font-size: 14px;'
      );

      // Hide loading overlay
      if (typeof MessageManager !== 'undefined') {
        MessageManager.loading.hide();
      }

      // Log module status
      if (typeof ModuleRegistry !== 'undefined') {
        console.table(ModuleRegistry.getStatus());
      }

    } catch (error) {
      console.error('❌ Application initialization failed:', error);

      if (typeof MessageManager !== 'undefined') {
        MessageManager.loading.hide();
        MessageManager.alert.error(
          'Initialization Failed',
          'Failed to initialize application. Please refresh the page. <br><br>Error: ' + error.message
        );
      } else {
        alert('Initialization Failed\n\n' + error.message);
      }

      throw error;
    }
  }

  /**
   * Reinitialize application
   */
  async function reinit() {
    _state.initialized = false;
    await init();
  }

  /**
   * Get initialization status
   * @returns {object}
   */
  function getStatus() {
    return {
      initialized: _state.initialized,
      initTime: _state.initEndTime ? _state.initEndTime - _state.initStartTime : null,
      modules: typeof ModuleRegistry !== 'undefined' ? ModuleRegistry.getStatus() : null
    };
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    init: init,
    reinit: reinit,
    getStatus: getStatus
  };
})();

// Auto-log on load
(function () {
  console.log(
    '%c[AppInitializer] ✓ Loaded',
    'color: #4CAF50; font-weight: bold; font-size: 12px;'
  );
})();