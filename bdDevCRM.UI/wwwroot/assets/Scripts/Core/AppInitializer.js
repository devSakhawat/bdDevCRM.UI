/*=========================================================
 * Application Initializer
 * File: AppInitializer.js
 * Description: Single entry point for application initialization
 * Author: devSakhawat
 * Date: 2025-11-26
=========================================================*/

var AppInitializer = (function () {
  'use strict';

  // ============================================
  // PRIVATE - State
  // ============================================
  var _state = {
    initialized: false,
    initStartTime: null,
    initEndTime: null
  };

  // ============================================
  // PRIVATE - Dependency Check
  // ============================================

  function _checkCoreDependencies() {
    var requiredDependencies = {
      jQuery: typeof $ !== 'undefined',
      kendo: typeof kendo !== 'undefined',
      AppConfig: typeof AppConfig !== 'undefined',
      StorageManager: typeof StorageManager !== 'undefined',
      ApiCallManager: typeof ApiCallManager !== 'undefined',
      MessageManager: typeof MessageManager !== 'undefined',
      TokenManager: typeof TokenManager !== 'undefined',
      EventBus: typeof EventBus !== 'undefined',
      ModuleRegistry: typeof ModuleRegistry !== 'undefined'
    };

    var missing = [];
    for (var dep in requiredDependencies) {
      if (!requiredDependencies[dep]) {
        missing.push(dep);
      }
    }

    return {
      allLoaded: missing.length === 0,
      missing: missing,
      status: requiredDependencies
    };
  }

  // ============================================
  // PRIVATE - Initialization Steps
  // ============================================

  async function _initCoreSystems() {
    //console.log('Step 1: Initializing core systems...');

    // Initialize EventBus
    if (typeof EventBus !== 'undefined' && EventBus.init) {
      EventBus.init();
    }

    // Initialize StateManager
    if (typeof StateManager !== 'undefined' && StateManager.init) {
      StateManager.init();
    }

    // Start token auto-refresh
    if (AppConfig.isAuthenticated()) {
      TokenManager.startAutoRefresh();
      //console.log('Token auto-refresh started');
    }

    //console.log('Core systems initialized');
  }

  async function _loadMenu() {
    //console.log('Step 2: Loading menu.. .');
    //// Debug: Check authentication
    //console.log('🔐 Authentication check:');
    //console.log('  - isAuthenticated:', AppConfig.isAuthenticated());
    //console.log('  - Token exists:', !!AppConfig.getToken());

    // Check authentication first
    if (typeof AppConfig !== 'undefined' && !AppConfig.isAuthenticated()) {
      console.warn('User not authenticated, skipping menu load');
      return;
    }

    try {
      // Step 1: Try to get from cache FIRST (Fast Path)
      var cachedMenu = null;

      if (typeof StorageManager !== 'undefined' && StorageManager.getCachedMenu) {
        cachedMenu = StorageManager.getCachedMenu();
        console.log('Cache check result:', cachedMenu ? cachedMenu.length + ' items found' : 'No cache');
      }

      if (cachedMenu && cachedMenu.length > 0) {
        // FAST PATH: Use cached menu (no skeleton needed)
        console.log('Using cached menu - instant load! ');

        if (typeof SidebarMenu !== 'undefined' && SidebarMenu.renderFromCache) {
          SidebarMenu.renderFromCache(cachedMenu);
        }
        else {
          // Fallback: Direct render
          _renderSidebarMenu(cachedMenu);
        }

        console.log('Menu loaded from cache');
        return;
      }

      // Step 2: No cache - show skeleton and fetch from API
      console.log('No cache found - fetching from API.. .');
      _showMenuSkeleton();

      if (typeof SidebarMenu !== 'undefined' && SidebarMenu.GetMenuInformation) {
        await SidebarMenu.GetMenuInformation();
        console.log('Menu loaded via SidebarMenu');
      }  else {
        throw new Error('No menu loader found (SidebarMenu or MenuHelper)');
      }

      console.log('Menu loaded from API and cached');

    } catch (error) {
      console.error('Menu load error:', error);
      _showMenuError();
    } finally {
      _hideMenuSkeleton();
    }
  }

  // Helper: Direct render (fallback)
  function _renderSidebarMenu(menuData) {
    var $sidebar = $('#sideNavbar');
    if ($sidebar.length === 0) {
      console.error('Sidebar element not found');
      return;
    }

    // Simple render - adjust based on your HTML structure
    var html = '';
    menuData.forEach(function (item) {
      html += '<li class="nav-item" data-menu-id="' + item.MenuId + '">';
      html += '  <a class="nav-link" href="' + (item.MenuPath || '#') + '">';
      html += '    <span class="nav-link-text">' + item.MenuName + '</span>';
      html += '  </a>';
      html += '</li>';
    });

    $sidebar.html(html);
  }

  // Helper: Show menu error
  function _showMenuError() {
    var $sidebar = $('#sideNavbar');
    if ($sidebar.length > 0) {
      $sidebar.html(
        '<li class="nav-item text-danger p-3">' +
        '<i class="fas fa-exclamation-triangle"></i> Failed to load menu ' +
        '<a href="#" onclick="AppInitializer.reinit(); return false;"  class="text-primary">Retry</a>' +
        '</li>'
      );
    }
  }

  async function _initRouteModules() {
    debugger;
    console.log('Step 3: Initializing route-specific modules...');

    var currentPath = window.location.pathname;
    await ModuleRegistry.initByRoute(currentPath);

    console.log('Route modules initialized');
  }

  async function _initAutoModules() {
    console.log('Step 4: Initializing auto-init modules...');
    await ModuleRegistry.initAll();
    console.log('Auto-init modules initialized');
  }

  async function _postInit() {
    console.log('Step 5: Running post-initialization tasks...');

    // Subscribe to auth events
    if (typeof EventBus !== 'undefined') {
      EventBus.subscribe('auth:logout', function () {
        console.log('🔴 Logout event received');
        TokenManager.stopAutoRefresh();
        StorageManager.clearAll();
      });

      EventBus.subscribe('token:refreshed', function (data) {
        console.log('🔄 Token refreshed event received');
      });
    }

    console.log('Post-init tasks completed');
  }

  // ============================================
  // PRIVATE - Skeleton Loader
  // ============================================

  function _showMenuSkeleton() {
    var $sidebar = $('#sideNavbar');
    if ($sidebar.length === 0) return;

    var skeletonHTML = `
      <li class="nav-item skeleton-loader">
        <div class="skeleton skeleton-line" style="width: 80%; height: 20px; margin-bottom: 10px;"></div>
        <div class="skeleton skeleton-line" style="width: 60%; height: 20px; margin-bottom: 10px;"></div>
        <div class="skeleton skeleton-line" style="width: 70%; height: 20px; margin-bottom: 10px;"></div>
        <div class="skeleton skeleton-line" style="width: 85%; height: 20px; margin-bottom: 10px;"></div>
        <div class="skeleton skeleton-line" style="width: 65%; height: 20px; margin-bottom: 10px;"></div>
      </li>
    `;

    $sidebar.html(skeletonHTML);
  }

  function _hideMenuSkeleton() {
    var $sidebar = $('#sideNavbar');
    $sidebar.find('.skeleton-loader').remove();
  }

  // ============================================
  // PUBLIC - Main Initialization
  // ============================================

  async function init() {
    if (_state.initialized) {
      console.warn('App already initialized');
      return;
    }

    _state.initStartTime = Date.now();

    console.log('%c🚀 Initializing bdDevCRM Application...', 'color: #2196F3; font-weight: bold; font-size: 16px;');

    try {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.loading.show('Initializing application...');
      }

      // Step 0: Check dependencies
      var dependancyCheck = _checkCoreDependencies();

      if (!dependancyCheck.allLoaded) {
        var errorMsg = 'Missing core dependencies: ' + dependancyCheck.missing.join(', ');
        console.error('❌', errorMsg);

        if (typeof MessageManager !== 'undefined') {
          MessageManager.loading.hide();
          MessageManager.alert.error('Initialization Failed', errorMsg);
        } else {
          alert('Initialization Failed\n\n' + errorMsg);
        }

        throw new Error(errorMsg);
      }

      console.log('All core dependencies loaded');
      console.table(dependancyCheck.status);

      // Step 1-5: Initialize in sequence
      await _initCoreSystems();
      await _loadMenu();
      await _initRouteModules();
      await _initAutoModules();
      await _postInit();

      _state.initialized = true;
      _state.initEndTime = Date.now();

      var initTime = _state.initEndTime - _state.initStartTime;

      console.log('%cApplication initialized successfully in ' + initTime + 'ms', 'color: #4CAF50; font-weight: bold; font-size: 14px;');

      if (typeof MessageManager !== 'undefined') {
        MessageManager.loading.hide();
      }

      if (typeof ModuleRegistry !== 'undefined') {
        console.table(ModuleRegistry.getStatus());
      }

    } catch (error) {
      console.error('Application initialization failed:', error);

      if (typeof MessageManager !== 'undefined') {
        MessageManager.loading.hide();
        MessageManager.alert.error('Initialization Failed', 'Failed to initialize application. Please refresh the page. <br><br>Error: ' + error.message);
      } else {
        alert('Initialization Failed\n\n' + error.message);
      }

      throw error;
    }
  }

  async function reinit() {
    _state.initialized = false;
    await init();
  }

  function getStatus() {
    return {
      initialized: _state.initialized,
      initTime: _state.initEndTime ? _state.initEndTime - _state.initStartTime : null,
      modules: typeof ModuleRegistry !== 'undefined' ? ModuleRegistry.getStatus() : null,
      tokenStatus: typeof TokenManager !== 'undefined' ? TokenManager.getTokenStatus() : null
    };
  }

  return {
    init: init,
    reinit: reinit,
    getStatus: getStatus
  };
})();

console.log('%c[AppInitializer] ✓ Loaded', 'color: #4CAF50; font-weight: bold;');