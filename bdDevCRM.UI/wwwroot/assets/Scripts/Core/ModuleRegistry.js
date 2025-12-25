/*=========================================================
 * Enhanced Module Registry with Dynamic Loading
 * File: ModuleRegistry.js
 * Description: Module registry with lazy loading support
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
  var _loadedScripts = {}; // Track dynamically loaded scripts

  var ModuleState = {
    REGISTERED: 'registered',
    LOADING: 'loading',      // 🆕 New state
    INITIALIZING: 'initializing',
    INITIALIZED: 'initialized',
    FAILED: 'failed'
  };

  // ============================================
  // PUBLIC - Dynamic Script Loading
  // ============================================

  /**
   * Dynamically load a JavaScript file
   * JavaScript file dynamically load করা
   * 
   * @param {string} scriptUrl - Script URL (e.g., '/assets/Scripts/Modules/Course/Course.js')
   * @returns {Promise<void>}
   * 
   * @example
   * await ModuleRegistry.loadScript('/assets/Scripts/Modules/Course/Course.js');
   */
  function loadScript(scriptUrl) {
    return new Promise(function (resolve, reject) {
      // Check if already loaded
      if (_loadedScripts[scriptUrl]) {
        console.log('✅ Script already loaded:', scriptUrl);
        resolve();
        return;
      }

      console.log('⏳ Loading script:', scriptUrl);

      var script = document.createElement('script');
      script.src = scriptUrl;
      script.async = false; // Maintain execution order

      script.onload = function () {
        _loadedScripts[scriptUrl] = true;
        console.log('✅ Script loaded:', scriptUrl);
        resolve();
      };

      script.onerror = function () {
        console.error('❌ Failed to load script:', scriptUrl);
        reject(new Error('Failed to load script: ' + scriptUrl));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Load multiple scripts in sequence
   * 
   * @param {Array<string>} scriptUrls - Array of script URLs
   * @returns {Promise<void>}
   * 
   * @example
   * await ModuleRegistry.loadScripts([
   *   '/assets/Scripts/Services/CourseService.js',
   *   '/assets/Scripts/Modules/Course/Course.js'
   * ]);
   */
  async function loadScripts(scriptUrls) {
    if (!Array.isArray(scriptUrls)) {
      throw new Error('scriptUrls must be an array');
    }

    for (var i = 0; i < scriptUrls.length; i++) {
      await loadScript(scriptUrls[i]);
    }
  }

  // ============================================
  // PUBLIC - Enhanced Module Registration
  // ============================================

  /**
   * Register a module with optional lazy loading
   * Module register করা (lazy loading support সহ)
   * 
   * @param {string} name - Module name
   * @param {object} module - Module object with init() method
   * @param {object} config - Module configuration
   * @param {Array<string>} config.dependencies - Required dependencies
   * @param {number} config.priority - Initialization priority
   * @param {boolean} config.autoInit - Auto initialize on app start
   * @param {string} config.route - Route pattern to initialize module
   * @param {Array<string>} config.scripts - Scripts to load before init (🆕)
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
      route: null,
      scripts: [] // 🆕 Scripts to load dynamically
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
   * Initialize a specific module (with dynamic script loading)
   * Module initialize করা (dynamic script loading সহ)
   * 
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

    if (moduleEntry.state === ModuleState.INITIALIZING ||
      moduleEntry.state === ModuleState.LOADING) {
      console.warn('⚠️ Module already initializing:', name);
      return;
    }

    try {
      console.log('🔧 Initializing module:', name);

      // 🆕 Step 1: Load required scripts (if any)
      if (moduleEntry.config.scripts && moduleEntry.config.scripts.length > 0) {
        moduleEntry.state = ModuleState.LOADING;
        console.log('⏳ Loading scripts for module:', name);

        await loadScripts(moduleEntry.config.scripts);

        console.log('✅ Scripts loaded for module:', name);
      }

      // Step 2: Mark as initializing
      moduleEntry.state = ModuleState.INITIALIZING;

      // Step 3: Check dependencies
      if (moduleEntry.config.dependencies.length > 0) {
        await _checkDependencies(name, moduleEntry.config.dependencies);
      }

      // Step 4: Initialize module
      if (typeof moduleEntry.module.init === 'function') {
        await moduleEntry.module.init();
      }

      // Step 5: Mark as initialized
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
   * Initialize module by route pattern
   * 
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
            console.log('✅ Route matched for module:', name);

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

  /**
   * Manually load and initialize a module
   * Manually একটা module load এবং initialize করা
   * 
   * @param {string} name - Module name
   * @param {Array<string>} scriptUrls - Scripts to load
   * @returns {Promise<void>}
   * 
   * @example
   * // Load Course module dynamically
   * await ModuleRegistry.loadAndInitModule('CourseModule', [
   *   '/assets/Scripts/Services/CourseService.js',
   *   '/assets/Scripts/Modules/Course/Course.js'
   * ]);
   */
  async function loadAndInitModule(name, scriptUrls) {
    console.log('🔄 Loading and initializing module:', name);

    // Step 1: Load scripts
    if (scriptUrls && scriptUrls.length > 0) {
      await loadScripts(scriptUrls);
    }

    // Step 2: Wait for module to register itself
    await _waitForModuleRegistration(name, 5000); // Wait max 5 seconds

    // Step 3: Initialize module
    await initModule(name);
  }

  /**
   * Wait for a module to register itself
   * Module register হওয়ার জন্য wait করা
   */
  function _waitForModuleRegistration(name, timeout) {
    return new Promise(function (resolve, reject) {
      var startTime = Date.now();

      var checkInterval = setInterval(function () {
        if (_modules[name]) {
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error('Module registration timeout: ' + name));
        }
      }, 100);
    });
  }

  // ============================================
  // PRIVATE - Dependency Checking (existing)
  // ============================================

  async function _checkDependencies(moduleName, dependencies) {
    for (var i = 0; i < dependencies.length; i++) {
      var depName = dependencies[i];

      if (typeof window[depName] === 'undefined') {
        throw new Error(
          'Module "' + moduleName + '" requires "' + depName + '" but it is not loaded'
        );
      }

      if (_modules[depName]) {
        if (_modules[depName].state !== ModuleState.INITIALIZED) {
          await initModule(depName);
        }
      }
    }
  }

  // ============================================
  // PUBLIC - Status & Info (existing)
  // ============================================

  function getModuleState(name) {
    return _modules[name] ? _modules[name].state : null;
  }

  function isInitialized(name) {
    return _modules[name] && _modules[name].state === ModuleState.INITIALIZED;
  }

  function getRegisteredModules() {
    return Object.keys(_modules);
  }

  function getStatus() {
    return {
      total: Object.keys(_modules).length,
      initialized: _initialized.length,
      failed: _failed.length,
      modules: _modules,
      initializedList: _initialized,
      failedList: _failed,
      loadedScripts: Object.keys(_loadedScripts)
    };
  }

  // ============================================
  // PUBLIC - Cleanup
  // ============================================

  /**
   * Unload a module (for SPA-like behavior)
   * Module unload করা
   */
  function unloadModule(name) {
    if (_modules[name]) {
      _modules[name].state = ModuleState.REGISTERED;

      var index = _initialized.indexOf(name);
      if (index > -1) {
        _initialized.splice(index, 1);
      }

      console.log('🗑️ Module unloaded:', name);
    }
  }

  /**
   * Initialize all auto-init modules
   * all the auto-init modules initialization
   * 
   * @returns {Promise<void>}
   */
  async function initAll() {
    console.log('🔧 Initializing all auto-init modules...');

    for (var name in _modules) {
      if (_modules.hasOwnProperty(name)) {
        var moduleEntry = _modules[name];

        // Only init modules with autoInit: true
        if (moduleEntry.config.autoInit &&
          moduleEntry.state !== ModuleState.INITIALIZED) {
          try {
            await initModule(name);
          } catch (error) {
            console.error('Failed to auto-init module:', name, error);
          }
        }
      }
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    // Module registration
    register: register,
    initModule: initModule,
    initByRoute: initByRoute,

    // Dynamic loading (🆕)
    loadScript: loadScript,
    loadScripts: loadScripts,
    loadAndInitModule: loadAndInitModule,

    // Status
    getModuleState: getModuleState,
    isInitialized: isInitialized,
    getRegisteredModules: getRegisteredModules,
    getStatus: getStatus,

    // Cleanup
    unloadModule: unloadModule,

    initAll: initAll,// Initialize all auto-init modules
  };
})();

console.log('%c[ModuleRegistry] ✓ Loaded with Dynamic Loading Support', 'color: #4CAF50; font-weight: bold;');