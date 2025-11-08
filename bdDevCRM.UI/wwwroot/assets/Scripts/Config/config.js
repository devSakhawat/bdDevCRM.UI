/*=========================================================
 * Application Configuration Management
 * File: config.js
 * Description: Centralized configuration for the application
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var AppConfig = {
  // API Configuration
  api: {
    baseUrl: "https://localhost:7290/bdDevs-crm",
    productionUrl: "https://api.production.com/bdDevs-crm",
    timeout: 30000,
    retryAttempts: 3
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
    defaultPageSizes: [10, 20, 30, 50, 100],
    defaultHeight: 600,
    buttonCount: 5,
    defaultPageSize: 20
  },
  
  // Storage keys
  storage: {
    tokenKey: 'jwtToken',
    userInfoKey: 'userInfo',
    themeKey: 'appTheme',
    languageKey: 'appLanguage'
  },
  
  // API Endpoints
  endpoints: {
    // Auth
    login: '/login',
    logout: '/logout',
    refreshToken: '/refresh-token',
    
    // Institute
    institute: '/crm-institute',
    instituteSummary: '/crm-institute-summary',
    instituteDropdown: '/crm-institute-ddl',
    instituteType: '/crm-institutetype-ddl',
    
    // Course
    course: '/crm-course',
    courseSummary: '/crm-course-summary',
    courseByInstitute: '/crm-course-by-instituteid-ddl',
    
    // Common
    country: '/countryddl',
    currency: '/currencyddl'
  },
  
  // Environment detection
  isDevelopment: function() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  },
  
  // Get API URL based on environment
  getApiUrl: function() {
    return this.isDevelopment() 
      ? this.api.baseUrl
      : this.api.productionUrl;
  },
  
  // Get full endpoint URL
  getEndpoint: function(endpointKey) {
    const endpoint = this.endpoints[endpointKey];
    if (!endpoint) {
      console.warn(`Endpoint '${endpointKey}' not found in configuration`);
      return '';
    }
    return this.getApiUrl() + endpoint;
  },
  
  // Get token from storage
  getToken: function() {
    return localStorage.getItem(this.storage.tokenKey);
  },
  
  // Set token to storage
  setToken: function(token) {
    localStorage.setItem(this.storage.tokenKey, token);
  },
  
  // Remove token from storage
  removeToken: function() {
    localStorage.removeItem(this.storage.tokenKey);
  },
  
  // Get user info from storage
  getUserInfo: function() {
    const userInfo = localStorage.getItem(this.storage.userInfoKey);
    return userInfo ? JSON.parse(userInfo) : null;
  },
  
  // Set user info to storage
  setUserInfo: function(userInfo) {
    localStorage.setItem(this.storage.userInfoKey, JSON.stringify(userInfo));
  },
  
  // Remove user info from storage
  removeUserInfo: function() {
    localStorage.removeItem(this.storage.userInfoKey);
  },
  
  // Clear all storage
  clearStorage: function() {
    this.removeToken();
    this.removeUserInfo();
    localStorage.removeItem(this.storage.themeKey);
    localStorage.removeItem(this.storage.languageKey);
  }
};

// Backward compatibility - keep baseApi variable
var baseApi = AppConfig.getApiUrl();
var baseUI = AppConfig.ui.baseUrl;