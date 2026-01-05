/*=========================================================
 * Application Configuration
 * File: AppConfig.js
 * Description: Centralized configuration management
 * Author: devSakhawat
 * Date: 2025-01-18
=========================================================*/

var AppConfig = (function () {
  'use strict';

  // Private configuration
  var _config = {
    // API Configuration
    api: {
      // Development URL
      developmentUrl: "https://localhost:7290/bdDevs-crm",

      // Production URL (update this when deploying)
      productionUrl: "https://api.production.com/bdDevs-crm",

      // Request timeout in milliseconds
      timeout: 30000,

      // Retry attempts for failed requests
      retryAttempts: 2
    },

    // UI Configuration
    ui: {
      baseUrl: window.location.origin,
      defaultPageSize: 20,
      maxPageSize: 100,
      minPageSize: 10
    },

    // Grid Configuration
    grid: {
      defaultPageSizes: [20, 50, 100, 500, 1000],
      defaultHeight: 600,
      buttonCount: 5,
      defaultPageSize: 20
    },

    // Storage keys for localStorage/sessionStorage
    storage: {
      tokenKey: 'jwtToken',
      userInfoKey: 'userInfo',
      themeKey: 'appTheme',
      languageKey: 'appLanguage',
      preferencesKey: 'userPreferences'
    },

    // Application information
    app: {
      name: 'bdDevCRM',
      version: '2.0.0',
      author: 'devSakhawat',
      copyright: '© 2025 bdDevCRM. All rights reserved.'
    },

    // Feature flags
    features: {
      enableCache: true,
      enableLogger: true,
      enableEventBus: true,
      enableStateManager: true,
      cacheTimeout: 5 * 60 * 1000 // 5 minutes
    },

    // API Endpoints
    endpoints: {
      // Authentication
      login: '/login',
      logout: '/logout',
      refreshToken: '/refresh-token',

      // Group
      group: '/Group',
      groupSummary: '/group-summary',
      groupPermission: '/grouppermission/key/',

      // ========================================
      // MODULE ENDPOINTS (From Screenshot)
      // ========================================
      modules: '/modules',                          // GET - Get all modules
      moduleSummary: '/module-summary',             // POST - Get module summary grid
      moduleCreate: '/module',                      // POST - Create module
      moduleUpdate: '/module',                      // PUT - Update module /{key}
      moduleDelete: '/module',                      // DELETE - Delete module /{key}

      // ========================================
      // MENU ENDPOINTS (From Screenshot)
      // ========================================
      menus: '/menus',                              // GET - Get all menus
      menusByModuleId: '/menus-by-moduleId',        // GET - Get menus by module /{moduleId}
      menusByUserPermission: '/menus-by-user-permission', // GET - Get menus by user permission
      parentMenuByMenu: '/parent-Menu-By-Menu',     // GET - Get parent menu by menu
      menuSummary: '/menu-summary',                 // POST - Get menu summary grid
      menuCreate: '/menu',                          // POST - Create menu
      menuUpdate: '/menu',                          // PUT - Update menu /{key}
      menuDelete: '/menu',                          // DELETE - Delete menu /{key}
      menuDDL: '/menus-4-ddl',

      // =======================================================================================
      // AccessControl ENDPOINTS (From Screenshot)
      // =======================================================================================
      accessControlSummary: '/access-control-summary', // POST - Get access control summary grid
      accessControls: '/access-controls',              // GET - Get all access controls
      accessControlById: '/access-control/',           // GET - Get access control by ID
      accessControlCreate: '/access-control',          // POST - Create access control
      accessControlUpdate: '/access-control',          // PUT - Update access control /{key}
      accessControlDelete: '/access-control',          // DELETE - Delete access control /{key}

      // --- User Management ---
      userSummary: "/user-summary",                    // For the main grid data
      resetPassword: "/Users/ResetPassword/",          // For resetting a user's password
      motherCompanies: "/mother-companies",            // To get the list of companies
      employeeTypes: "/employeetypes",                 // To get employee types for dropdown
      userCreate: "/user",                             // POST (create) and PUT (update)
      userUpdate: "/user",                             // PUT (update)
      userDelete: "/user",                             // DELETE (delete)

      // --- User Details (Cascading Combos) ---
      branchesByCompanyId: "/branches-by-compnayId/companyId",       // Get branches for a company
      departmentsByCompanyId: "/departments-by-compnayId/companyId", // Get departments for a company
      employeesByFilters: "/employees-by-indentities",               // Get employees based on company, branch, department
      employeeTypes: "/employeetypes",

      // --- Group Membership ---
      groups: "/groups",                                             // To get all groups
      groupMembersByUserId: "/groups/group-members-by-userId",       // To get groups a user belongs to

      // --- User Upload (Excel) ---
      userUpload: "/user/upload",                                    // Endpoint for Kendo Upload to save the file
      userUploadRemove: "/user/upload/remove",                       // Endpoint for Kendo Upload to remove the file
      userImport: "/user/import",                                    // Endpoint to trigger the import process after upload

      // =======================================================================================
      // AccessControl ENDPOINTS (From Screenshot)
      // =======================================================================================
      // Access Control
      access: '/getaccess',

      // =======================================================================================
      // Workflow
      // =======================================================================================
      status: '/status/key/',
      actions: '/actions-4-group/status/',

      // Report
      customizedReport: '/customized-report',

      // Institute
      institute: '/crm-institute',
      instituteSummary: '/crm-institute-summary',
      instituteDropdown: '/crm-institute-ddl',
      instituteType: '/crm-institutetype-ddl',

      // Course
      course: '/crm-course',
      courseSummary: '/crm-course-summary',
      courseDropdown: '/crm-course-ddl',
      courseByInstitute: '/crm-course-by-instituteid-ddl',

      // CRM Application
      crmApplication: '/crm-application',
      crmApplicationSummary: '/crm-application-summary',

      // Common Dropdowns
      country: '/countryddl',
      currency: '/currencyddl',
      district: '/districtddl',
      thana: '/thanaddl',
      branch: '/branchddl'
    },

    // Front-end page init endpoints
    frontendRoutes: {
      dashboard: '/dashboard',
      settings: '/settings',
      reportViewer: '/report-viewer',

      // menu
      intMenu: '/Core/MenuSettings',

      // Module
      intModule: '/Core/ModuleSettings',

      // Access Controll Screen
      intAccessControll: '/Core/AccessSettings',

      // User Screen
      intUser: '/Core/UserSettings',
    },


  };

  // Public API
  return {
    /**
     * Check if running in development environment
     * @returns {boolean}
     */
    isDevelopment: function () {
      var hostname = window.location.hostname;
      return hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.indexOf('192.168.') === 0 ||
        hostname.indexOf('10.') === 0;
    },

    /**
     * Check if running in production environment
     * @returns {boolean}
     */
    isProduction: function () {
      return !this.isDevelopment();
    },

    /**
     * Get API base URL based on environment
     * @returns {string}
     */
    getApiUrl: function () {
      return this.isDevelopment() ? _config.api.developmentUrl : _config.api.productionUrl;
    },

    /**
     * Get full endpoint URL
     * @param {string} endpointKey - Key from endpoints config
     * @returns {string}
     */
    getEndpoint: function (endpointKey) {
      var endpoint = _config.endpoints[endpointKey];
      if (!endpoint) {
        console.warn('AppConfig: Endpoint "' + endpointKey + '" not found');
        return '';
      }
      return this.getApiUrl() + endpoint;
    },

    /**
   * Get front-end route URL
   * @param {string} key
   * @returns {string}
   */
    getFrontendRoute: function (key) {
      var route = _config.frontendRoutes[key];
      if (!route) {
        console.warn(`AppConfig: Front-end route "${key}" not found`);
        return '';
      }
      return route;
    },

    /**
     * Get UI base URL
     * @returns {string}
     */
    getUiUrl: function () {
      return _config.ui.baseUrl;
    },

    /**
     * Get configuration value by path
     * @param {string} path - Dot notation path (e.g., 'api.timeout')
     * @param {*} defaultValue - Default value if not found
     * @returns {*}
     */
    get: function (path, defaultValue) {
      var keys = path.split('.');
      var value = _config;

      for (var i = 0; i < keys.length; i++) {
        if (value && value.hasOwnProperty(keys[i])) {
          value = value[keys[i]];
        } else {
          return defaultValue;
        }
      }

      return value;
    },

    /**
     * Get all configuration (for debugging)
     * @returns {object}
     */
    getAll: function () {
      return JSON.parse(JSON.stringify(_config));
    },

    // Token Management

    /**
     * Get JWT token from storage
     * @returns {string|null}
     */
    getToken: function () {
      return localStorage.getItem(_config.storage.tokenKey);
    },

    /**
     * Set JWT token to storage
     * @param {string} token
     */
    setToken: function (token) {
      if (token) {
        localStorage.setItem(_config.storage.tokenKey, token);
      }
    },

    /**
     * Remove JWT token from storage
     */
    removeToken: function () {
      localStorage.removeItem(_config.storage.tokenKey);
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated: function () {
      return !!this.getToken();
    },

    /**
     * Get user info from storage
     * @returns {object|null}
     */
    getUserInfo: function () {
      var userInfo = localStorage.getItem(_config.storage.userInfoKey);
      try {
        return userInfo ? JSON.parse(userInfo) : null;
      } catch (e) {
        console.error('AppConfig: Failed to parse user info', e);
        return null;
      }
    },

    /**
     * Set user info to storage
     * @param {object} userInfo
     */
    setUserInfo: function (userInfo) {
      if (userInfo) {
        localStorage.setItem(_config.storage.userInfoKey, JSON.stringify(userInfo));
      }
    },

    /**
     * Remove user info from storage
     */
    removeUserInfo: function () {
      localStorage.removeItem(_config.storage.userInfoKey);
    },

    /**
     * Get current user ID
     * @returns {number|null}
     */
    getCurrentUserId: function () {
      var userInfo = this.getUserInfo();
      return userInfo ? userInfo.UserId : null;
    },

    /**
     * Get current username
     * @returns {string|null}
     */
    getCurrentUsername: function () {
      var userInfo = this.getUserInfo();
      return userInfo ? userInfo.Username : null;
    },

    // Theme Management

    /**
     * Get current theme
     * @returns {string}
     */
    getTheme: function () {
      return localStorage.getItem(_config.storage.themeKey) || 'light';
    },

    /**
     * Set theme
     * @param {string} theme
     */
    setTheme: function (theme) {
      localStorage.setItem(_config.storage.themeKey, theme);
    },

    // Language Management

    /**
     * Get current language
     * @returns {string}
     */
    getLanguage: function () {
      return localStorage.getItem(_config.storage.languageKey) || 'en';
    },

    /**
     * Set language
     * @param {string} language
     */
    setLanguage: function (language) {
      localStorage.setItem(_config.storage.languageKey, language);
    },

    // Storage Management

    /**
     * Clear all application storage
     */
    clearStorage: function () {
      this.removeToken();
      this.removeUserInfo();
      localStorage.removeItem(_config.storage.themeKey);
      localStorage.removeItem(_config.storage.languageKey);
      localStorage.removeItem(_config.storage.preferencesKey);

      console.log('AppConfig: Storage cleared');
    },

    /**
     * Clear all localStorage
     */
    clearAllStorage: function () {
      localStorage.clear();
      console.log('AppConfig: All localStorage cleared');
    },

    // App Info

    /**
     * Get application name
     * @returns {string}
     */
    getAppName: function () {
      return _config.app.name;
    },

    /**
     * Get application version
     * @returns {string}
     */
    getAppVersion: function () {
      return _config.app.version;
    },

    /**
     * Get application info
     * @returns {object}
     */
    getAppInfo: function () {
      return {
        name: _config.app.name,
        version: _config.app.version,
        author: _config.app.author,
        copyright: _config.app.copyright,
        environment: this.isDevelopment() ? 'Development' : 'Production',
        apiUrl: this.getApiUrl(),
        uiUrl: this.getUiUrl()
      };
    },

    // Feature Flags

    /**
     * Check if feature is enabled
     * @param {string} feature
     * @returns {boolean}
     */
    isFeatureEnabled: function (feature) {
      return _config.features[feature] === true;
    },

    // Direct access to config objects (backward compatibility)
    api: _config.api,
    ui: _config.ui,
    grid: _config.grid,
    storage: _config.storage,
    endpoints: _config.endpoints,
    features: _config.features
  };
})();

// Backward compatibility - keep these global variables
var baseApi = AppConfig.getApiUrl();
var baseUI = AppConfig.getUiUrl();

// Log configuration on load (only in development)
if (AppConfig.isDevelopment()) {
  console.log('%c[AppConfig] Loaded', 'color: #2196F3; font-weight: bold');
  console.log('Environment:', AppConfig.isDevelopment() ? 'Development' : 'Production');
  console.log('API URL:', AppConfig.getApiUrl());
  console.log('UI URL:', AppConfig.getUiUrl());
  console.log("Pass AppConfig.js file");
}