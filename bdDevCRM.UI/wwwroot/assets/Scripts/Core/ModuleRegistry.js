/*=========================================================
 * Module Registry
 * File: ModuleRegistry.js
 * Description: Central registry for all application modules
 * Author: devSakhawat
 * Date: 2025-11-26
=========================================================*/

var ModuleRegistry = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Module Storage
  // ============================================
  var _modules = {};
  var _initialized = [];
  var _failed = [];

  // ============================================
  // PRIVATE - Module States
  // ============================================
  var ModuleState = {
    REGISTERED: 'registered',
    INITIALIZING: 'initializing',
    INITIALIZED: 'initialized',
    FAILED: 'failed'
  };

  // ============================================
  // PUBLIC - Module Registration
  // ============================================

  /**
   * Register a module
   * @param {string} name - Module name (e.g., 'Menu', 'Course')
   * @param {object} module - Module object with init() method
   * @param {object} config - Module configuration
   * @param {Array<string>} config.dependencies - Required dependencies
   * @param {number} config.priority - Initialization priority (1-10, lower = earlier)
   * @param {boolean} config.autoInit - Auto initialize on app start
   * @param {string} config.route - Route pattern to initialize module (e.g., '/Menu/*')
   */
  function register(name, module, config) {
    if (!name || typeof name !== 'string') {
      throw new Error('Module name is required and must be a string');
    }

    if (!module || typeof module.init !== 'function') {
      throw new Error('Module must have an init() method');
    }

    var defaultConfig = {
      dependencies: [],
      priority: 5,
      autoInit: false,
      route: null
    };

    _modules[name] = {
      name: name,
      module: module,
      config: Object.assign({}, defaultConfig, config || {}),
      state: ModuleState.REGISTERED
    };

    console.log('📦 Module registered:', name);
  }

  /**
   * Initialize a specific module
   * @param {string} name - Module name
   * @returns {Promise<void>}
   */
  async function initModule(name) {
    var moduleEntry = _modules[name];

    if (!moduleEntry) {
      throw new Error('Module "' + name + '" not registered');
    }

    if (moduleEntry.state === ModuleState.INITIALIZED) {
      console.log('✅ Module already initialized:', name);
      return;
    }

    if (moduleEntry.state === ModuleState.INITIALIZING) {
      console.warn('⚠️ Module already initializing:', name);
      return;
    }

    // Mark as initializing
    moduleEntry.state = ModuleState.INITIALIZING;

    try {
      console.log('🔧 Initializing module:', name);

      // Check dependencies
      if (moduleEntry.config.dependencies.length > 0) {
        await _checkDependencies(name, moduleEntry.config.dependencies);
      }

      // Initialize module
      if (typeof moduleEntry.module.init === 'function') {
        await moduleEntry.module.init();
      }

      // Mark as initialized
      moduleEntry.state = ModuleState.INITIALIZED;
      _initialized.push(name);

      console.log('✅ Module initialized:', name);
    } catch (error) {
      moduleEntry.state = ModuleState.FAILED;
      _failed.push({ name: name, error: error.message });

      console.error('❌ Module initialization failed:', name, error);
      throw error;
    }
  }

  /**
   * Initialize all registered modules
   * @returns {Promise<void>}
   */
  async function initAll() {
    console.log('🚀 Initializing all modules.. .');

    // Get modules sorted by priority
    var sortedModules = Object.keys(_modules)
      .map(function (key) { return _modules[key]; })
      .sort(function (a, b) { return a.config.priority - b.config.priority; });

    // Initialize modules in order
    for (var i = 0; i < sortedModules.length; i++) {
      var moduleEntry = sortedModules[i];

      if (moduleEntry.config.autoInit) {
        try {
          await initModule(moduleEntry.name);
        } catch (error) {
          console.error('Failed to initialize module:', moduleEntry.name, error);
          // Continue with other modules even if one fails
        }
      }
    }

    console.log('✅ All auto-init modules initialized');
  }

  /**
   * Initialize modules based on current route
   * @param {string} currentPath - Current URL path
   * @returns {Promise<void>}
   */
  async function initByRoute(currentPath) {
    console.log('🛣️ Initializing modules for route:', currentPath);

    for (var name in _modules) {
      if (_modules.hasOwnProperty(name)) {
        var moduleEntry = _modules[name];

        if (moduleEntry.config.route) {
          var routePattern = new RegExp(moduleEntry.config.route);

          if (routePattern.test(currentPath)) {
            try {
              await initModule(name);
            } catch (error) {
              console.error('Failed to initialize module:', name, error);
            }
          }
        }
      }
    }
  }

  // ============================================
  // PRIVATE - Dependency Checking
  // ============================================

  /**
   * Check if dependencies are satisfied
   * @param {string} moduleName - Module name
   * @param {Array<string>} dependencies - Required dependencies
   * @returns {Promise<void>}
   */
  async function _checkDependencies(moduleName, dependencies) {
    for (var i = 0; i < dependencies.length; i++) {
      var depName = dependencies[i];

      // Check if dependency is a global object
      if (typeof window[depName] === 'undefined') {
        throw new Error(
          'Module "' + moduleName + '" requires "' + depName + '" but it is not loaded'
        );
      }

      // Check if dependency is a registered module
      if (_modules[depName]) {
        if (_modules[depName].state !== ModuleState.INITIALIZED) {
          // Initialize dependency first
          await initModule(depName);
        }
      }
    }
  }

  // ============================================
  // PUBLIC - Status & Info
  // ============================================

  /**
   * Get module status
   * @param {string} name - Module name
   * @returns {string|null} - Module state or null if not found
   */
  function getModuleState(name) {
    return _modules[name] ? _modules[name].state : null;
  }

  /**
   * Check if module is initialized
   * @param {string} name - Module name
   * @returns {boolean}
   */
  function isInitialized(name) {
    return _modules[name] && _modules[name].state === ModuleState.INITIALIZED;
  }

  /**
   * Get all registered modules
   * @returns {Array<string>}
   */
  function getRegisteredModules() {
    return Object.keys(_modules);
  }

  /**
   * Get initialization status
   * @returns {object}
   */
  function getStatus() {
    return {
      total: Object.keys(_modules).length,
      initialized: _initialized.length,
      failed: _failed.length,
      modules: _modules,
      initializedList: _initialized,
      failedList: _failed
    };
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    register: register,
    initModule: initModule,
    initAll: initAll,
    initByRoute: initByRoute,
    getModuleState: getModuleState,
    isInitialized: isInitialized,
    getRegisteredModules: getRegisteredModules,
    getStatus: getStatus
  };
})();

// Auto-log on load
(function () {
  console.log(
    '%c[ModuleRegistry] ✓ Loaded',
    'color: #4CAF50; font-weight: bold; font-size: 12px;'
  );
})();