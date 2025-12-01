/// <reference path="../core/managers/apicallmanager.js" />
/// <reference path="../core/managers/storagemanager.js" />

/*=========================================================
 * Menu Helper
 * File: SidebarMenu.js
 * Description: Sidebar menu management with caching
 * Author: devSakhawat
 * Date: 2025-11-26
=========================================================*/

var SidebarMenu = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Configuration
  // ============================================
  var _config = {
    sidebarId: 'sideNavbar',
    cacheKeyPrefix: 'menuCache_',
    cacheExpiryHours: 1,
    maxRetries: 3,
    retryDelay: 1000
  };

  // ============================================
  // PRIVATE - State
  // ============================================
  var _state = {
    menuData: null,
    isLoading: false,
    retryCount: 0
  };

  // ============================================
  // PUBLIC - Main Method
  // ============================================

  /**
   * Get and render menu information
   * Menu information fetch করে render করা
   * 
   * Flow:
   * 1. Check cache
   * 2. If cache exists → render from cache
   * 3. If no cache → fetch from API
   * 4. Cache the result
   * 5.  Render menu
   */
  async function GetMenuInformation() {
    debugger;
    if (_state.isLoading) {
      console.warn('⚠️ Menu already loading.. .');
      return;
    }

    _state.isLoading = true;

    try {
      console.log('🔄 Loading menu information...');

      // Show skeleton loader
      _showSkeletonLoader();

      // Step 1: Check cache first
      var cacheSource = (typeof StorageManager !== 'undefined') ? 'StorageManager' : 'localStorage';
      var cachedMenu = _getCachedMenu();
      console.log('📦 Cached menu source:', cacheSource);
      console.log('📦 Cached menu value:', cachedMenu);

      // Detect cached ParseError object (some code may have cached the full response/error accidentally)
      if (cachedMenu && typeof cachedMenu === 'object' && cachedMenu.IsSuccess === false && cachedMenu.ErrorType === 'ParseError') {
        console.warn('❌ Cached menu is a ParseError object — clearing cache and refetching');
        _clearMenuCache();
        cachedMenu = null;
      }

      // If cachedMenu is a wrapper object (unexpected), try to extract Data
      if (cachedMenu && !Array.isArray(cachedMenu) && cachedMenu.Data && Array.isArray(cachedMenu.Data)) {
        console.log('🔧 Cached menu was wrapped, extracting Data property');
        cachedMenu = cachedMenu.Data;
      }

      if (cachedMenu && Array.isArray(cachedMenu) && cachedMenu.length > 0) {
        console.log('✅ Menu loaded from cache');
        _renderMenu(cachedMenu);
        _state.menuData = cachedMenu;
        return;
      }

      // Step 2: Fetch from API
      var menus = await _fetchMenuFromApi();

      if (!menus || menus.length === 0) {
        console.warn('⚠️ No menus found for current user');
        _showEmptyState();
        return;
      }

      // Step 3: Cache menu
      _cacheMenu(menus);

      // Step 4: Store in state
      _state.menuData = menus;

      // Step 5: Render menu
      _renderMenu(menus);

      console.log('✅ Menu loaded successfully');

    } catch (error) {
      console.error('❌ Failed to load menu:', error);
      _handleMenuLoadError(error);

    } finally {
      _state.isLoading = false;
      _hideSkeletonLoader();
    }
  }

  // ============================================
  // PRIVATE - API Calls
  // ============================================

  /**
   * Fetch menu from API
   */
  async function _fetchMenuFromApi() {
    try {
      // Correct signature: only endpoint and options
      var response = await ApiCallManager.getWithRefreshToken(
        AppConfig.getApiUrl(),
        AppConfig.endpoints.menusByUserPermission || '/menus-by-user-permission',
        {
          showLoadingIndicator: false,
          showErrorNotifications: false
        }
      );

      // Debug logging
      console.log('📥 Menu API Response:', response);
      console.log('📋 Is Array?', Array.isArray(response));

      // Validate response
      if (!response) {
        console.error('❌ Response is null or undefined');
        return [];
      }

      // Response is already unwrapped (response.Data)
      if (Array.isArray(response)) {
        return response;
      }

      // Double-wrapped case (shouldn't happen but handle it)
      if (response.Data && Array.isArray(response.Data)) {
        return response.Data;
      }

      // Unexpected format
      console.error('❌ Unexpected response format. Expected array, got:', typeof response);
      console.error('Response:', response);
      return [];

    } catch (error) {
      console.error('❌ API call failed:', error);
      throw error;
    }
  }

  // ============================================
  // PRIVATE - Cache Management
  // ============================================

  /**
   * Get cached menu from localStorage
   * localStorage থেকে cached menu নেওয়া
   */
  function _getCachedMenu() {
    try {
      if (typeof StorageManager !== 'undefined') {
        return StorageManager.getCachedMenu();
      }

      // Fallback: Direct localStorage access
      var userInfo = _getUserInfo();
      if (!userInfo || !userInfo.UserId) return null;

      var cacheKey = _config.cacheKeyPrefix + userInfo.UserId;
      var cached = localStorage.getItem(cacheKey);
      console.log(cached);
      if (!cached) return null;

      var cacheData = JSON.parse(cached);

      // Check expiry
      var cacheTime = new Date(cacheData.timestamp);
      var hoursDiff = (new Date() - cacheTime) / (1000 * 60 * 60);

      if (hoursDiff > _config.cacheExpiryHours) {
        _clearMenuCache();
        return null;
      }

      return cacheData.data;

    } catch (error) {
      console.error('Error reading menu cache:', error);
      return null;
    }
  }

  /**
   * Cache menu to localStorage
   * Menu কে localStorage এ cache করা
   */
  function _cacheMenu(menuData) {
    try {
      if (typeof StorageManager !== 'undefined') {
        StorageManager.cacheMenu(menuData);
        return;
      }

      // Fallback: Direct localStorage access
      var userInfo = _getUserInfo();
      if (!userInfo || !userInfo.UserId) return;

      var cacheKey = _config.cacheKeyPrefix + userInfo.UserId;
      var cacheData = {
        data: menuData,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('✅ Menu cached successfully');

    } catch (error) {
      console.error('Error caching menu:', error);
    }
  }

  /**
   * Clear menu cache
   * Menu cache clear করা
   */
  function _clearMenuCache() {
    try {
      if (typeof StorageManager !== 'undefined') {
        StorageManager.clearMenuCache();
        return;
      }

      // Fallback
      var userInfo = _getUserInfo();
      if (!userInfo || !userInfo.UserId) return;

      var cacheKey = _config.cacheKeyPrefix + userInfo.UserId;
      localStorage.removeItem(cacheKey);
      console.log('✅ Menu cache cleared');

    } catch (error) {
      console.error('Error clearing menu cache:', error);
    }
  }

  // ============================================
  // PRIVATE - Menu Rendering
  // ============================================

  /**
   * Render menu in sidebar
   * Sidebar এ menu render করা
   * 
   * Supports:
   * - Nested menus (unlimited levels)
   * - Icons
   * - Active states
   * - Collapsible submenus
   */
  function _renderMenu(menus) {
    var $sidebar = $('#' + _config.sidebarId);

    if ($sidebar.length === 0) {
      console.error('Sidebar element not found:', _config.sidebarId);
      return;
    }

    // Clear existing content
    $sidebar.empty();

    // Get current path for active state
    var currentPath = window.location.pathname;

    // Build menu tree
    var menuTree = _buildMenuTree(menus);

    // Render top-level menus
    menuTree.forEach(function (menu) {
      var $menuItem = _createMenuItemHtml(menu, menus, currentPath);
      $sidebar.append($menuItem);
    });

    // Bind events
    _bindMenuEvents();

    console.log('✅ Menu rendered successfully');
  }

  /**
   * Build menu tree structure
   * Menu tree structure তৈরি করা (parent-child relationship)
   */
  function _buildMenuTree(menus) {
    if (!menus || menus.length === 0) return [];

    // Find root menus (ParentMenuId = null or 0)
    return menus.filter(function (menu) {
      return !menu.ParentMenuId ||
        menu.ParentMenuId === 0 ||
        menu.ParentMenuId === null ||
        menu.ParentMenu === 0 ||
        menu.ParentMenu === null;
    }).sort(function (a, b) {
      // Sort by SortOrder or OrderNo
      var orderA = a.SortOrder || a.OrderNo || 0;
      var orderB = b.SortOrder || b.OrderNo || 0;
      return orderA - orderB;
    });
  }

  /**
   * Create menu item HTML (ENHANCED VERSION)
   * Menu item এর HTML তৈরি করা
   */
  function _createMenuItemHtml(menu, allMenus, currentPath) {
    var hasChildren = _hasChildMenus(menu.MenuId, allMenus);
    var isActive = _isMenuActive(menu, currentPath);
    var menuUrl = _getMenuUrl(menu);
    var icon = menu.MenuIcon || menu.Icon || '';

    var $li = $('<li>').addClass('nav-item');

    if (hasChildren) {
      // Parent menu with children
      var childMenus = _getChildMenus(menu.MenuId, allMenus);
      var hasActiveChild = _hasActiveChild(childMenus, currentPath);
      var shouldExpand = isActive || hasActiveChild;

      var $link = $('<a>')
        .addClass('nav-link')
        .addClass(shouldExpand ? 'active' : '')
        .attr('href', '#')
        .attr('data-bs-toggle', 'collapse')
        .attr('data-bs-target', '#submenu-' + menu.MenuId)
        .attr('aria-expanded', shouldExpand ? 'true' : 'false')
        .attr('aria-controls', 'submenu-' + menu.MenuId);

      // Build HTML content
      var linkHtml = '';

      // Add icon if exists
      if (icon) {
        linkHtml += '<i class="' + icon + '"></i>';
      }

      linkHtml += '<span class="nav-link-text">' + (menu.MenuName || menu.Name) + '</span>';
      linkHtml += '<i class="bi bi-chevron-down submenu-arrow' + (shouldExpand ? ' rotate-down' : '') + '"></i>';

      $link.html(linkHtml);
      $li.append($link);

      // Create submenu
      var $submenu = $('<ul>')
        .attr('id', 'submenu-' + menu.MenuId)
        .addClass('collapse nav flex-column')
        .addClass(shouldExpand ? 'show' : '');

      // Render child menus recursively
      childMenus.forEach(function (child) {
        var $childItem = _createMenuItemHtml(child, allMenus, currentPath);
        $submenu.append($childItem);
      });

      $li.append($submenu);

    } else {
      // Leaf menu (no children)
      var $link = $('<a>')
        .addClass('nav-link')
        .addClass(isActive ? 'active' : '')
        .attr('href', menuUrl);

      var linkHtml = '';

      if (icon) {
        linkHtml += '<i class="' + icon + '"></i>';
      }

      linkHtml += '<span class="nav-link-text">' + (menu.MenuName || menu.Name) + '</span>';

      $link.html(linkHtml);
      $li.append($link);
    }

    return $li;
  }

  /**
   * Check if menu has child menus
   * Menu এর child আছে কিনা check করা
   */
  function _hasChildMenus(menuId, allMenus) {
    return allMenus.some(function (menu) {
      return menu.ParentMenuId === menuId || menu.ParentMenu === menuId;
    });
  }

  /**
   * Get child menus
   * Child menus গুলো নেওয়া
   */
  function _getChildMenus(menuId, allMenus) {
    return allMenus
      .filter(function (menu) {
        return menu.ParentMenuId === menuId || menu.ParentMenu === menuId;
      })
      .sort(function (a, b) {
        var orderA = a.SortOrder || a.OrderNo || 0;
        var orderB = b.SortOrder || b.OrderNo || 0;
        return orderA - orderB;
      });
  }

  /**
 * Check if menu is active (IMPROVED VERSION)
 * check Menu is active or not.
 */
  function _isMenuActive(menu, currentPath) {
    if (!menu.MenuUrl && !menu.Url && !menu.Path) return false;

    var menuUrl = menu.MenuUrl || menu.Url || menu.Path;

    // Normalize URLs (remove leading slash and convert to lowercase)
    menuUrl = menuUrl.replace(/^\//, '').toLowerCase();
    currentPath = currentPath.replace(/^\//, '').toLowerCase();

    // Exact match check
    if (currentPath === menuUrl) {
      return true;
    }

    // Partial match check (for nested routes)
    // Example: currentPath = "crm/application/details/123"
    //          menuUrl = "crm/application"
    // This should match
    if (currentPath.indexOf(menuUrl) === 0) {
      // Make sure it's a proper path segment match
      // Prevent false positives like "user" matching "users"
      var nextChar = currentPath.charAt(menuUrl.length);
      return nextChar === '/' || nextChar === '';
    }

    return false;
  }

  /**
   * Check if any child menu is active (IMPROVED VERSION)
   * check child menu is active or not.
   */
  function _hasActiveChild(childMenus, currentPath) {
    return childMenus.some(function (child) {
      var isChildActive = _isMenuActive(child, currentPath);

      // Recursively check nested children
      if (!isChildActive && _hasChildMenus(child.MenuId, _getAllMenus())) {
        var nestedChildren = _getChildMenus(child.MenuId, _getAllMenus());
        isChildActive = _hasActiveChild(nestedChildren, currentPath);
      }

      return isChildActive;
    });
  }

  /**
   * Get menu URL
   * Menu এর URL নেওয়া
   */
  function _getMenuUrl(menu) {
    var menuUrl = menu.MenuPath || '#';

    if (menuUrl === '#') return '#';

    // Check if AppConfig exists
    if (typeof AppConfig !== 'undefined' && AppConfig.getUiUrl) {
      try {
        var fullUrl = new URL(menuUrl, AppConfig.getUiUrl());
        return fullUrl.href;
      } catch (e) {
        console.error('Error constructing URL:', e);
        // Fallback to string concatenation if URL fails
      }
    }

    // Fallback for when AppConfig is missing (local path only)
    if (menuUrl.indexOf('/') !== 0) {
      menuUrl = '/' + menuUrl;
    }

    return menuUrl;
  }

  // Helper function to get all menus (add this to your code)
  function _getAllMenus() {
    return _state.menuData || [];
  }

  // ============================================
  // PRIVATE - Event Handlers
  // ============================================

  /**
   * Bind menu events
   * Menu events bind করা
   */
  function _bindMenuEvents() {
    var $sidebar = $('#' + _config.sidebarId);

    // Submenu toggle animation
    $sidebar.find('[data-bs-toggle="collapse"]').on('click', function (e) {
      var $this = $(this);
      var $arrow = $this.find('.submenu-arrow');

      // Rotate arrow animation
      setTimeout(function () {
        if ($this.attr('aria-expanded') === 'true') {
          $arrow.addClass('rotate-down');
        } else {
          $arrow.removeClass('rotate-down');
        }
      }, 10);
    });

    // Close other submenus when opening one (accordion behavior)
    $sidebar.find('.collapse').on('show.bs.collapse', function () {
      var $this = $(this);
      $sidebar.find('. collapse.show').each(function () {
        if (this !== $this[0]) {
          $(this).collapse('hide');
        }
      });
    });
  }

  // ============================================
  // PRIVATE - UI States
  // ============================================

  /**
   * Show skeleton loader
   * Skeleton loader দেখানো
   */
  function _showSkeletonLoader() {
    var $sidebar = $('#' + _config.sidebarId);

    if ($sidebar.length === 0) return;

    var skeletonHtml = `
      <li class="nav-item skeleton-loader">
        <div class="skeleton skeleton-line" style="width: 85%; height: 18px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-line" style="width: 70%; height: 18px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-line" style="width: 80%; height: 18px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-line" style="width: 75%; height: 18px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-line" style="width: 65%; height: 18px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-line" style="width: 90%; height: 18px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-line" style="width: 60%; height: 18px; margin-bottom: 12px;"></div>
      </li>
    `;

    $sidebar.html(skeletonHtml);
  }

  /**
   * Hide skeleton loader
   * Skeleton loader লুকানো
   */
  function _hideSkeletonLoader() {
    var $sidebar = $('#' + _config.sidebarId);
    $sidebar.find('.skeleton-loader').remove();
  }

  /**
   * Show empty state
   * Empty state দেখানো
   */
  function _showEmptyState() {
    var $sidebar = $('#' + _config.sidebarId);

    if ($sidebar.length === 0) return;

    var emptyStateHtml = `
      <li class="nav-item empty-state">
        <div class="text-center py-4">
          <i class="bi bi-inbox" style="font-size: 48px; color: #ccc;"></i>
          <p class="text-muted mt-2">No menu items available</p>
        </div>
      </li>
    `;

    $sidebar.html(emptyStateHtml);
  }

  /**
   * Show error state with retry button
   * Error state retry button সহ দেখানো
   */
  function _showErrorState() {
    var $sidebar = $('#' + _config.sidebarId);

    if ($sidebar.length === 0) return;

    var errorStateHtml = `
      <li class="nav-item error-state">
        <div class="text-center py-4">
          <i class="bi bi-exclamation-triangle" style="font-size: 48px; color: #dc3545;"></i>
          <p class="text-danger mt-2">Failed to load menu</p>
          <button id="btnRetryMenuLoad" class="btn btn-sm btn-outline-primary mt-2">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Retry
          </button>
        </div>
      </li>
    `;

    $sidebar.html(errorStateHtml);

    // Bind retry button
    $('#btnRetryMenuLoad').on('click', function () {
      _retryMenuLoad();
    });
  }

  // ============================================
  // PRIVATE - Error Handling
  // ============================================

  /**
   * Handle menu load error
   * Menu load error handle করা
   */
  function _handleMenuLoadError(error) {
    _showErrorState();

    // Show notification
    if (typeof MessageManager !== 'undefined') {
      MessageManager.notify.error('Failed to load navigation menu');
    }
  }

  /**
   * Retry menu loading
   * Menu loading retry করা
   */
  async function _retryMenuLoad() {
    _state.retryCount++;

    if (_state.retryCount > _config.maxRetries) {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.alert.error(
          'Menu Load Failed',
          'Failed to load menu after ' + _config.maxRetries + ' attempts.  Please refresh the page.'
        );
      } else {
        alert('Failed to load menu.  Please refresh the page.');
      }
      return;
    }

    console.log('🔄 Retrying menu load (attempt ' + _state.retryCount + ').. .');

    // Clear cache before retry
    _clearMenuCache();

    // Delay before retry
    await new Promise(function (resolve) {
      setTimeout(resolve, _config.retryDelay);
    });

    // Retry
    await GetMenuInformation();
  }

  // ============================================
  // PRIVATE - Utilities
  // ============================================

  /**
   * Get current user info
   * Current user এর info নেওয়া
   */
  function _getUserInfo() {
    if (typeof StorageManager !== 'undefined') {
      return StorageManager.getUserInfo();
    }

    if (typeof AppConfig !== 'undefined' && AppConfig.getUserInfo) {
      return AppConfig.getUserInfo();
    }

    // Fallback
    try {
      var userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  }

  // ============================================
  // PUBLIC - Additional Methods
  // ============================================

  /**
   * Refresh menu (clear cache and reload)
   * Menu refresh করা
   */
  async function refreshMenu() {
    console.log('🔄 Refreshing menu...');
    _clearMenuCache();
    _state.retryCount = 0;
    await GetMenuInformation();
  }

  /**
   * Get current menu data
   * Current menu data নেওয়া
   */
  function getMenuData() {
    return _state.menuData;
  }

  /**
   * Set active menu by URL (PUBLIC API)
   * URL দিয়ে active menu set করা
   */
  function setActiveMenuByUrl(url) {
    var $sidebar = $('#' + _config.sidebarId);

    // Remove all active classes
    $sidebar.find('.nav-link').removeClass('active');

    // Normalize URL
    url = url.replace(/^\//, '').toLowerCase();

    // Find and activate matching menu (most specific match first)
    var matches = [];

    $sidebar.find('.nav-link').each(function () {
      var $link = $(this);
      var href = $link.attr('href');

      if (href && href !== '#') {
        var menuPath = href.replace(/^\//, '').toLowerCase();

        if (url.indexOf(menuPath) === 0) {
          var nextChar = url.charAt(menuPath.length);
          if (nextChar === '/' || nextChar === '' || menuPath === url) {
            matches.push({
              element: $link,
              length: menuPath.length
            });
          }
        }
      }
    });

    // Sort by length (longest match = most specific)
    matches.sort(function (a, b) {
      return b.length - a.length;
    });

    // Activate the most specific match
    if (matches.length > 0) {
      var $activeLink = matches[0].element;
      $activeLink.addClass('active');

      // Expand parent menus
      $activeLink.parents('.collapse').each(function () {
        $(this).addClass('show');
        var $parentLink = $(this).prev('.nav-link');
        $parentLink.attr('aria-expanded', 'true');
        $parentLink.find('.submenu-arrow').addClass('rotate-down');
      });

      // Scroll into view
      var navContainer = $sidebar.find('.sidebar-nav')[0];
      if (navContainer && $activeLink[0]) {
        var linkTop = $activeLink[0].offsetTop;
        var linkHeight = $activeLink[0].offsetHeight;
        var containerHeight = navContainer.offsetHeight;
        var scrollTop = navContainer.scrollTop;

        if (linkTop < scrollTop || linkTop + linkHeight > scrollTop + containerHeight) {
          navContainer.scrollTop = linkTop - (containerHeight / 2) + (linkHeight / 2);
        }
      }

      console.log('✅ Active menu set:', url);
    }
  }

  /**
   * Collapse all submenus
   * সব submenus collapse করা
   */
  function collapseAllSubmenus() {
    var $sidebar = $('#' + _config.sidebarId);
    $sidebar.find('.collapse').collapse('hide');
  }

  /**
   * Expand all submenus
   * সব submenus expand করা
   */
  function expandAllSubmenus() {
    var $sidebar = $('#' + _config.sidebarId);
    $sidebar.find('.collapse').collapse('show');
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    GetMenuInformation: GetMenuInformation,
    refreshMenu: refreshMenu,
    getMenuData: getMenuData,
    setActiveMenuByUrl: setActiveMenuByUrl,
    collapseAllSubmenus: collapseAllSubmenus,
    expandAllSubmenus: expandAllSubmenus
  };
})();

// Auto-log
console.log('%c[MenuHelper] ✓ Loaded', 'color: #4CAF50; font-weight: bold;');