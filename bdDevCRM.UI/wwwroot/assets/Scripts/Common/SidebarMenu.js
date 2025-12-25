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
    searchInputId: 'sidebarSearchInput',
    searchButtonId: 'btnSearch', // ✅ NEW: Search button ID
    clearSearchBtnId: 'btnClearSearch',
    noResultsId: 'noSearchResults',
    cacheKeyPrefix: 'menuCache_',
    cacheExpiryHours: 1,
    maxRetries: 3,
    retryDelay: 1000,

    // ✅ UPDATED: Search config
    searchDebounceMs: 1000,        // ✅ Changed from 300ms to 1000ms (1 second)
    minSearchLength: 1,            // Minimum characters to trigger search
    maxVisibleResults: 100,        // Limit visible results for performance
    highlightClass: 'search-highlight'
  };

  // ============================================
  // PRIVATE - State
  // ============================================
  var _state = {
    menuData: null,
    isLoading: false,
    retryCount: 0,
    searchTerm: ''
  };


  // ============================================
  // PUBLIC - Main Method
  // ============================================

  /**
   * Get and render menu information
   * Menu information fetch and then render
   * 
   * Flow:
   * 1. Check cache
   * 2. If cache exists → render from cache
   * 3. If no cache → fetch from API
   * 4. Cache the result
   * 5.  Render menu
   */
  async function GetMenuInformation() {
    if (_state.isLoading) {
      console.warn('⚠️ Menu already loading...');
      return;
    }

    _state.isLoading = true;

    try {
      console.log('🔄 Loading menu information...');

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
        _initSearchFunctionality();
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
      _initSearchFunctionality();

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
          showLoadingIndicator: true,
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

    // Find root menus (ParentMenu = null or 0)
    return menus.filter(function (menu) {
      return !menu.ParentMenu ||
        menu.ParentMenu === 0 ||
        menu.ParentMenu === null
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
    $li.attr('data-menu-name', (menu.MenuName || menu.Name).toLowerCase());

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
      linkHtml += '<i class="bi bi-chevron-right submenu-arrow' + (shouldExpand ? ' rotate-down' : '') + '"></i>';

      $link.html(linkHtml);
      $li.append($link);

      // Create submenu
      var $submenu = $('<ul>')
        .attr('id', 'submenu-' + menu.MenuId)
        .addClass('collapse submenu nav flex-column')
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

    var menuUrl = menu.MenuPath || menu.MenuUrl || menu.Url || menu.Path;

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
  // ============================================
  // PRIVATE - Event Handlers (NO ACCORDION)
  // ============================================

  function _bindMenuEvents() {
    var $sidebar = $('#' + _config.sidebarId);

    // ✅ Arrow rotation on toggle (NO AUTO-CLOSE)
    $sidebar.find('[data-bs-toggle="collapse"]').on('click', function (e) {
      e.preventDefault();

      var $this = $(this);
      var $arrow = $this.find('.submenu-arrow');
      var targetId = $this.attr('data-bs-target');
      var $target = $(targetId);

      $target.collapse('toggle');

      if ($this.attr('aria-expanded') === 'true') {
        $arrow.removeClass('rotate-down');
      } else {
        $arrow.addClass('rotate-down');
      }
    });

    // ✅ Update arrow after collapse animation completes
    $sidebar.find('.collapse').on('shown.bs.collapse', function () {
      var $parentLink = $(this).prev('[data-bs-toggle="collapse"]');
      $parentLink.find('.submenu-arrow').addClass('rotate-down');
      $parentLink.attr('aria-expanded', 'true');
    });

    $sidebar.find('.collapse').on('hidden.bs.collapse', function () {
      var $parentLink = $(this).prev('[data-bs-toggle="collapse"]');
      $parentLink.find('.submenu-arrow').removeClass('rotate-down');
      $parentLink.attr('aria-expanded', 'false');
    });

    // ❌ NO ACCORDION BEHAVIOR - REMOVED
    // All menus can be open simultaneously
  }

  // ============================================
  // PRIVATE - Debounce Utility
  // ============================================

  /**
   * Debounce function - delays execution until user stops typing
   * User typing বন্ধ করার পর function execute করা
   * 
   * @param {Function} func - Function to debounce
   * @param {Number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function _debounce(func, wait) {
    var timeout;
    return function executedFunction() {
      var context = this;
      var args = arguments;

      var later = function () {
        timeout = null;
        func.apply(context, args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }


  // ============================================
  // PRIVATE - Search Functionality (3-WAY TRIGGER)
  // ============================================

  /**
   * Initialize search functionality with 3 trigger methods:
   * 1. Auto search after user stops typing for 1 second (debounced)
   * 2. Enter key press (instant)
   * 3. Search icon click (instant)
   */
  function _initSearchFunctionality() {
    var $searchInput = $('#' + _config.searchInputId);
    var $searchButton = $('#' + _config.searchButtonId); // ✅ NEW: Search button
    var $clearBtn = $('#' + _config.clearSearchBtnId);
    var $noResults = $('#' + _config.noResultsId);

    if ($searchInput.length === 0) {
      console.warn('⚠️ Search input not found');
      return;
    }

    // ✅ Create debounced search function (1 second delay)
    var debouncedSearch = _debounce(function (searchTerm) {
      if (searchTerm.length >= _config.minSearchLength) {
        console.log('🔍 Auto search triggered (1 sec after typing stopped)');
        _filterMenus(searchTerm);
      } else {
        _clearSearch();
      }
    }, _config.searchDebounceMs); // 1000ms = 1 second

    // ✅ METHOD 1: Auto search on input (with 1 second debounce)
    $searchInput.on('input', function () {
      var searchTerm = $(this).val().trim();
      _state.searchTerm = searchTerm;

      if (searchTerm.length > 0) {
        $clearBtn.show();

        // Show loading indicator
        _showSearchLoading();

        // Call debounced search (waits 1 second after typing stops)
        debouncedSearch(searchTerm);
      } else {
        $clearBtn.hide();
        _clearSearch();
        _hideSearchLoading();
      }
    });

    // ✅ METHOD 2: Enter key search (immediate, no debounce)
    $searchInput.on('keypress', function (e) {
      if (e.which === 13) { // Enter key
        e.preventDefault();
        var searchTerm = $(this).val().trim();

        if (searchTerm.length > 0) {
          console.log('🔍 Enter key search triggered');
          _showSearchLoading();
          _filterMenus(searchTerm);
        }
      }
    });

    // ✅ METHOD 3: Search button/icon click (immediate, no debounce)
    if ($searchButton.length > 0) {
      $searchButton.on('click', function (e) {
        e.preventDefault();
        var searchTerm = $searchInput.val().trim();

        if (searchTerm.length > 0) {
          console.log('🔍 Search icon clicked');
          _showSearchLoading();
          _filterMenus(searchTerm);
        }
      });
    }

    // ✅ Clear button
    $clearBtn.on('click', function () {
      $searchInput.val('');
      $searchInput.focus();
      _clearSearch();
      _hideSearchLoading();
      $(this).hide();
    });

    console.log('✅ Search functionality initialized');
    console.log('   ↳ Auto search: 1 second after typing stops');
    console.log('   ↳ Enter key: Instant search');
    console.log('   ↳ Search icon: Instant search');
  }

  /**
 * Filter menus (OPTIMIZED for 500+ menus)
 */
  function _filterMenus(searchTerm) {
    var startTime = performance.now(); // Performance tracking

    var $sidebar = $('#' + _config.sidebarId);
    var $noResults = $('#' + _config.noResultsId);

    // ✅ Sanitize search term (only alphanumeric + spaces)
    searchTerm = searchTerm.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();

    if (!searchTerm) {
      _clearSearch();
      return;
    }

    var hasResults = false;
    var visibleCount = 0;
    var matchedItems = [];

    // ✅ First Pass: Collect all matches (without DOM manipulation)
    $sidebar.find('.nav-item').each(function () {
      var $item = $(this);
      var menuName = $item.attr('data-menu-name') || '';
      var $link = $item.children('.nav-link');
      var $textSpan = $link.find('.nav-link-text');
      var originalText = $textSpan.text();

      // ✅ Check if menu name contains search term (case-insensitive)
      if (menuName.indexOf(searchTerm) !== -1) {
        matchedItems.push({
          $item: $item,
          $textSpan: $textSpan,
          originalText: originalText,
          searchTerm: searchTerm
        });
      }
    });

    // ✅ Second Pass: Update DOM in batch
    $sidebar.find('.nav-item').addClass('hidden'); // Hide all first

    matchedItems.forEach(function (match) {
      if (visibleCount >= _config.maxVisibleResults) {
        return; // Stop after max results
      }

      hasResults = true;
      visibleCount++;

      // Show matched item
      match.$item.removeClass('hidden');

      // Highlight matched text
      var highlightedText = _highlightText(match.originalText, match.searchTerm);
      match.$textSpan.html(highlightedText);

      // Expand parent menus
      match.$item.parents('.collapse').each(function () {
        $(this).collapse('show');
      });

      // Expand child menus if any
      var $childCollapse = match.$item.find('.collapse').first();
      if ($childCollapse.length > 0) {
        $childCollapse.collapse('show');
      }
    });

    // ✅ Show/hide no results message
    if (hasResults) {
      $noResults.hide();
      $sidebar.show();

      // Show count if limited
      if (visibleCount >= _config.maxVisibleResults) {
        _showResultsLimitMessage(visibleCount, matchedItems.length);
      }
    } else {
      $noResults.show();
      $sidebar.hide();
    }

    // ✅ Hide loading indicator
    _hideSearchLoading();

    // Performance logging
    var endTime = performance.now();
    console.log('🔍 Search completed in ' + (endTime - startTime).toFixed(2) + 'ms (' + visibleCount + ' results)');
  }

  /**
 * Highlight text (OPTIMIZED - Alphabetic only)
 */
  function _highlightText(text, searchTerm) {
    if (!searchTerm) return text;

    // ✅ Escape special regex characters
    var escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // ✅ Create regex for case-insensitive matching
    var regex = new RegExp('(' + escapedTerm + ')', 'gi');

    return text.replace(regex, '<span class="' + _config.highlightClass + '">$1</span>');
  }

  /**
   * Show search loading indicator
   * Search loading indicator দেখানো
   */
  function _showSearchLoading() {
    var $searchInput = $('#' + _config.searchInputId);
    var $searchWrapper = $searchInput.closest('.search-wrapper');

    // Remove existing spinner first
    $searchWrapper.find('.search-spinner').remove();

    // Add loading class
    $searchWrapper.addClass('searching');

    // Add spinner icon
    var $spinner = $('<span class="search-spinner"><i class="bi bi-hourglass-split"></i></span>');
    $searchWrapper.append($spinner);
  }

  /**
   * Hide search loading indicator
   * Search loading indicator লুকানো
   */
  function _hideSearchLoading() {
    var $searchInput = $('#' + _config.searchInputId);
    var $searchWrapper = $searchInput.closest('.search-wrapper');

    $searchWrapper.removeClass('searching');
    $searchWrapper.find('.search-spinner').remove();
  }

  /**
   * Show results limit message
   * Results limit message দেখানো
   */
  function _showResultsLimitMessage(visible, total) {
    var $sidebar = $('#' + _config.sidebarId);

    // Remove existing message
    $sidebar.find('.search-limit-msg').remove();

    // Add new message
    var $msg = $('<div class="search-limit-msg text-muted text-center py-2">')
      .html('<small>Showing ' + visible + ' of ' + total + ' results</small>');

    $sidebar.prepend($msg);
  }

  /**
   * Clear search and restore all menus
   * Search clear করা এবং সব menus restore করা
   */
  function _clearSearch() {
    var $sidebar = $('#' + _config.sidebarId);
    var $noResults = $('#' + _config.noResultsId);

    // Show all menu items
    $sidebar.find('.nav-item').removeClass('hidden');

    // Remove highlights
    $sidebar.find('.nav-link-text').each(function () {
      var $span = $(this);
      $span.html($span.text()); // Remove HTML, keep text only
    });

    // Remove limit message
    $sidebar.find('.search-limit-msg').remove();

    $noResults.hide();
    $sidebar.show();
    _state.searchTerm = '';

    console.log('✅ Search cleared');
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
          'Failed to load menu after ' + _config.maxRetries + ' attempts. Please refresh the page.'
        );
      } else {
        alert('Failed to load menu. Please refresh the page.');
      }
      return;
    }

    console.log('🔄 Retrying menu load (attempt ' + _state.retryCount + ')...');

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
   * Current user info
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
   */
  function collapseAllSubmenus() {
    var $sidebar = $('#' + _config.sidebarId);
    $sidebar.find('.collapse').collapse('hide');
  }

  /**
   * Expand all submenus
   */
  function expandAllSubmenus() {
    var $sidebar = $('#' + _config.sidebarId);
    $sidebar.find('.collapse').collapse('show');
  }


  // ============================================
  // PRIVATE - Highlight Active Menu
  // ============================================

  /**
   * Highlight active menu item based on current URL
   * বর্তমান URL অনুযায়ী active menu item highlight করা
   * 
   * @param {string} currentPath - Current URL path (e.g., '/Core/MenuSettings')
   */
  function _highlightActiveMenu(currentPath) {
    debugger;
    // Default to current location if not provided
    if (!currentPath) {
      currentPath = window.location.pathname;
    }

    console.log('🎯 Highlighting active menu for path:', currentPath);

    var $sidebar = $('#' + _config.sidebarId);

    if ($sidebar.length === 0) {
      console.warn('⚠️ Sidebar element not found');
      return;
    }

    // Step 1: Remove all existing active states
    $sidebar.find('.nav-link').removeClass('active');
    $sidebar.find('.nav-item').removeClass('active');
    $sidebar.find('.submenu').removeClass('show');
    $sidebar.find('.nav-link[data-bs-toggle="collapse"]').addClass('collapsed');

    // Step 2: Normalize current path (remove trailing slash, convert to lowercase)
    var normalizedPath = _normalizePath(currentPath);

    // Step 3: Find matching menu item
    var $activeLink = null;
    var bestMatchScore = 0;

    $sidebar.find('.nav-link').each(function () {
      var $link = $(this);
      var href = $link.attr('href');

      // Skip if no href or is a collapse toggle without real URL
      if (!href || href === '#' || href.startsWith('#submenu-')) {
        return;
      }

      // Normalize the href
      var normalizedHref = _normalizePath(href);

      // Calculate match score
      var matchScore = _calculateMatchScore(normalizedPath, normalizedHref);

      if (matchScore > bestMatchScore) {
        bestMatchScore = matchScore;
        $activeLink = $link;
      }
    });

    // Step 4: Apply active state to best match
    if ($activeLink && bestMatchScore > 0) {
      _applyActiveState($activeLink);
      console.log('✅ Active menu set:', $activeLink.text().trim());
    } else {
      console.log('⚠️ No matching menu item found for:', currentPath);
    }
  }

  /**
   * Normalize URL path for comparison
   * URL path কে normalize করা comparison এর জন্য
   * 
   * @param {string} path - URL path
   * @returns {string} Normalized path
   */
  function _normalizePath(path) {
    if (!path) return '';

    try {
      // Extract pathname if full URL
      if (path.startsWith('http://') || path.startsWith('https://')) {
        var url = new URL(path);
        path = url.pathname;
      }

      // Remove trailing slash
      path = path.replace(/\/+$/, '');

      // Convert to lowercase
      path = path.toLowerCase();

      // Remove leading slash for comparison
      path = path.replace(/^\/+/, '');

      return path;
    } catch (error) {
      console.error('Error normalizing path:', error);
      return path.toLowerCase();
    }
  }

  /**
   * Calculate match score between current path and menu href
   * Current path এবং menu href এর মধ্যে match score calculate করা
   * 
   * @param {string} currentPath - Current URL path (normalized)
   * @param {string} menuHref - Menu item href (normalized)
   * @returns {number} Match score (0 = no match, higher = better match)
   */
  function _calculateMatchScore(currentPath, menuHref) {
    if (!currentPath || !menuHref) return 0;

    // Exact match - highest score
    if (currentPath === menuHref) {
      return 100;
    }

    // Current path starts with menu href (e.g., /Core/MenuSettings/Edit matches /Core/MenuSettings)
    if (currentPath.startsWith(menuHref + '/')) {
      // Score based on how much of the path matches
      return 50 + (menuHref.length / currentPath.length) * 40;
    }

    // Menu href starts with current path (less common but handle it)
    if (menuHref.startsWith(currentPath + '/')) {
      return 30;
    }

    // Partial match - check if paths share common segments
    var currentSegments = currentPath.split('/').filter(Boolean);
    var menuSegments = menuHref.split('/').filter(Boolean);

    var matchingSegments = 0;
    var minLength = Math.min(currentSegments.length, menuSegments.length);

    for (var i = 0; i < minLength; i++) {
      if (currentSegments[i] === menuSegments[i]) {
        matchingSegments++;
      } else {
        break; // Stop at first non-matching segment
      }
    }

    if (matchingSegments > 0) {
      // Score based on matching segments
      return (matchingSegments / Math.max(currentSegments.length, menuSegments.length)) * 25;
    }

    return 0;
  }

  /**
   * Apply active state to menu link and expand parent submenus
   * Menu link এ active state apply করা এবং parent submenu expand করা
   * 
   * @param {jQuery} $link - jQuery element of the active link
   */
  function _applyActiveState($link) {
    if (!$link || $link.length === 0) return;

    // Add active class to the link
    $link.addClass('active');

    // Add active class to parent nav-item
    var $navItem = $link.closest('.nav-item');
    $navItem.addClass('active');

    // Expand all parent submenus
    var $parentSubmenu = $link.closest('.submenu');

    while ($parentSubmenu.length > 0) {
      // Show the submenu
      $parentSubmenu.addClass('show');

      // Find the toggle link and remove collapsed class
      var submenuId = $parentSubmenu.attr('id');
      if (submenuId) {
        var $toggleLink = $parentSubmenu
          .closest('.nav-item')
          .find('[data-bs-toggle="collapse"][href="#' + submenuId + '"], [data-bs-toggle="collapse"][data-bs-target="#' + submenuId + '"]');

        if ($toggleLink.length > 0) {
          $toggleLink.removeClass('collapsed');
          $toggleLink.attr('aria-expanded', 'true');
        }
      }

      // Add active class to parent nav-item
      $parentSubmenu.closest('.nav-item').addClass('active');

      // Move up to next parent submenu
      $parentSubmenu = $parentSubmenu.parent().closest('.submenu');
    }

    // Scroll active item into view (optional)
    _scrollActiveIntoView($link);
  }

  /**
   * Scroll active menu item into view
   * Active menu item কে visible area তে scroll করা
   * 
   * @param {jQuery} $link - jQuery element of the active link
   */
  function _scrollActiveIntoView($link) {
    if (!$link || $link.length === 0) return;

    var $sidebar = $('#' + _config.sidebarId);
    var $scrollContainer = $sidebar.closest('.sidebar-scroll, .sidebar, .side-navbar');

    if ($scrollContainer.length === 0) {
      $scrollContainer = $sidebar;
    }

    // Check if element is in view
    var linkOffset = $link.offset();
    var containerOffset = $scrollContainer.offset();
    var containerHeight = $scrollContainer.height();

    if (linkOffset && containerOffset) {
      var relativeTop = linkOffset.top - containerOffset.top;

      // If element is outside visible area, scroll to it
      if (relativeTop < 0 || relativeTop > containerHeight - 50) {
        var scrollTop = $scrollContainer.scrollTop() + relativeTop - (containerHeight / 3);

        $scrollContainer.animate({
          scrollTop: Math.max(0, scrollTop)
        }, 300);
      }
    }
  }

  /**
   * Set active menu by URL (Public method)
   * URL দিয়ে active menu set করা (Public method)
   * 
   * @param {string} url - URL to match
   */
  function setActiveMenuByUrl(url) {
    if (!url) {
      url = window.location.pathname;
    }

    _highlightActiveMenu(url);
  }







  // ============================================
  // PUBLIC API
  // ============================================
  return {
    // Main methods
    GetMenuInformation: GetMenuInformation,
    loadMenu: GetMenuInformation,  // Alias
    refreshMenu: refreshMenu,
    getMenuData: getMenuData,

    // ✅ Active menu highlighting
    setActiveMenuByUrl: setActiveMenuByUrl,
    highlightActiveMenu: function (path) {
      _highlightActiveMenu(path);
    },

    // Cache methods
    renderFromCache: function (menuData) {
      if (!menuData || menuData.length === 0) {
        console.warn('⚠️ No menu data to render');
        return;
      }
      console.log('🎨 Rendering menu from cache:', menuData.length, 'items');
      // Store in state
      _state.menuData = menuData;

      // Render menu + _bindMenuEvents executed into _renderMenu
      _renderMenu(menuData);

      // Initialize search
      if (typeof _initSearchFunctionality === 'function') {
        _initSearchFunctionality();
      }

      // ✅ Highlight active menu
      _highlightActiveMenu();
      console.log('✅ Menu rendered from cache');

      //// Highlight active item
      //var currentPath = window.location.pathname;
      //_highlightActiveMenu(currentPath);
    },

    // Check if cache exists
    hasCache: function () {
      var cached = _getCachedMenu();
      return cached && cached.length > 0;
    },

    // ✅ Force refresh (clear cache + reload)
    forceRefresh: function () {
      console.log('🔄 Force refreshing menu.. .');
      _clearMenuCache();
      return GetMenuInformation();  // ✅ GetMenuInformation কল করবে
    },

    // ✅ Clear cache
    clearCache: _clearMenuCache,

    // ✅ Get cache info
    getCacheInfo: function () {
      var cached = _getCachedMenu();
      return {
        exists: !!cached,
        itemCount: cached ? cached.length : 0
      };
    },

    // Submenu controls
    collapseAllSubmenus: collapseAllSubmenus,
    expandAllSubmenus: expandAllSubmenus

  };
})();

// Auto-log
console.log('%c[MenuHelper] ✓ Loaded', 'color: #4CAF50; font-weight: bold;');