/*=========================================================
 * API Call Manager
 * File: ApiCallManager.js
 * Description: Unified API call manager matching backend ResponseHelper pattern
 * Backend Pattern: ResponseHelper.cs (Success/Error responses)
 * Author: devSakhawat
 * Date: 2025-01-13
=========================================================*/

var ApiCallManager = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Configuration
  // ============================================

  var _config = {
    defaultTimeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    showErrorNotifications: true,
    showLoadingForRequests: false
  };

  // ============================================
  // PRIVATE - Helper Functions
  // ============================================

  /**
   * Create Grid DataSource
   */
  function createGridDataSource(config) {
    if (!config || !config.endpoint) {
      throw new Error('ApiCallManager.createGridDataSource: endpoint is required');
    }

    const baseUrl = _getBaseUrl();
    const token = _getToken();

    return new kendo.data.DataSource({
      type: 'json',
      transport: {
        read: {
          url: baseUrl + config.endpoint,
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          beforeSend: function (xhr) {
            if (token) {
              xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            }
          }
        },
        parameterMap: function (data, operation) {
          if (operation === 'read') {
            return JSON.stringify({
              Skip: data.skip || 0,
              Take: data.take || config.pageSize || 20,
              Page: data.page || 1,
              PageSize: data.pageSize || config.pageSize || 20,
              Sort: data.sort || null,
              Filter: data.filter || null
            });
          }
          return data;
        }
      },
      schema: {
        data: function (response) {
          console.log('📥 Grid DataSource Response:', response);

          // ✅ NULL check
          if (!response) {
            console.error('❌ Response is NULL or undefined');
            return [];
          }

          // ✅ Check if response is successful
          if (response.IsSuccess === false) {
            console.error('❌ API returned error:', response.Message);
            _handleError(response);
            return [];
          }

          // ✅ Extract data
          if (response && response.IsSuccess && response.Data) {
            const items = response.Data.Items || [];
            console.log('✅ Grid data loaded:', items.length, 'items');
            return items;
          }

          console.warn('⚠️ Unexpected response format:', response);
          return [];
        },
        total: function (response) {
          // ✅ NULL check
          if (!response) {
            return 0;
          }

          if (response && response.IsSuccess && response.Data) {
            return response.Data.TotalCount || 0;
          }
          return 0;
        },
        errors: function (response) {
          if (response && response.IsSuccess === false) {
            return response.Message || 'An error occurred';
          }
          return null;
        },
        model: {
          fields: config.modelFields || {}
        }
      },
      pageSize: config.pageSize || 20,
      serverPaging: config.serverPaging !== false,
      serverSorting: config.serverSorting !== false,
      serverFiltering: config.serverFiltering !== false,
      error: function (e) {
        console.error('❌ DataSource Error:', e);

        // ✅ Handle XHR errors
        if (e.xhr) {
          console.error('XHR Status:', e.xhr.status);
          console.error('XHR Response:', e.xhr.responseText);

          try {
            const errorData = JSON.parse(e.xhr.responseText);
            _handleError(errorData);
          } catch {
            _handleError({
              StatusCode: e.xhr.status,
              Message: e.xhr.statusText || 'DataSource error'
            });
          }
        } else if (e.errorThrown) {
          _handleError({
            StatusCode: 500,
            Message: e.errorThrown || 'DataSource error'
          });
        } else {
          console.error('Unknown DataSource error:', e);
        }
      }
    });
  }



  /**
   * Get base API URL
   */
  function _getBaseUrl() {
    if (typeof AppConfig !== 'undefined' && AppConfig.getApiUrl) {
      return AppConfig.getApiUrl();
    }
    if (typeof baseApi !== 'undefined') {
      return baseApi;
    }
    console.error('ApiCallManager: baseApi is not defined');
    return '';
  }

  /**
   * Get JWT Token
   */
  function _getToken() {
    if (typeof TokenManager !== 'undefined' && TokenManager.hasToken) {
      if (TokenManager.hasToken()) {
        if (typeof AppConfig !== 'undefined' && AppConfig.getToken) {
          return AppConfig.getToken();
        }
      }
    }
    return localStorage.getItem('jwtToken') || '';
  }

  /**
   * Sleep helper for retry delay
   */
  function _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle HTTP Response (matching backend ResponseHelper pattern)
   * @param {Response} response - Fetch API response
   * @returns {Promise<object>}
   */
  async function _handleHttpResponse(response) {
    let data;

    try {
      data = await response.json();
      console.log(data);
    } catch (e) {
      // If JSON parsing fails, create error object
      data = {
        IsSuccess: false,
        StatusCode: response.status,
        Message: response.statusText || 'Unknown error',
        ErrorType: 'ParseError'
      };
    }

    // Success responses (200-299)
    if (response.ok) {
      // Backend always returns { IsSuccess, StatusCode, Message, Data }
      if (data.IsSuccess === true) {
        return data; // Return full response for flexibility
      }
      // Fallback if backend doesn't follow standard
      return {
        IsSuccess: true,
        StatusCode: response.status,
        Message: 'Success',
        Data: data
      };
    }

    // Error responses (400+)
    throw {
      IsSuccess: false,
      StatusCode: data.StatusCode || response.status,
      Message: data.Message || response.statusText,
      ErrorType: data.ErrorType || _getErrorType(response.status),
      Details: data.Details || null,
      ValidationErrors: data.ValidationErrors || null,
      CorrelationId: data.CorrelationId || null
    };
  }

  /**
   * Get error type from status code
   */
  function _getErrorType(statusCode) {
    const errorTypes = {
      400: 'BadRequest',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'NotFound',
      409: 'Conflict',
      422: 'ValidationError',
      500: 'InternalServerError',
      503: 'ServiceUnavailable'
    };
    return errorTypes[statusCode] || 'UnknownError';
  }

  /**
   * Handle and display errors (with MessageManager integration)
   */
  function _handleError(error) {
    console.error('[ApiCallManager Error]', error);

    if (!_config.showErrorNotifications) return;

    const statusCode = error.StatusCode || 500;
    const errorType = error.ErrorType || 'Error';
    const message = error.Message || 'An error occurred';

    // Check if MessageManager is available
    if (typeof MessageManager === 'undefined') {
      console.error('MessageManager not available, using fallback');
      alert(message);
      return;
    }

    // Authentication errors (401, 403)
    if (statusCode === 401 || errorType === 'Unauthorized') {
      MessageManager.alert.warning(
        'Authentication Required',
        message + '<br><strong>Please login again.</strong>',
        function () {
          if (typeof TokenManager !== 'undefined') {
            TokenManager.clearSession();
            TokenManager.redirectToLogin();
          } else {
            window.location.href = (typeof baseUI !== 'undefined' ? baseUI : '') + '/Home/Login';
          }
        }
      );
      return;
    }

    if (statusCode === 403 || errorType === 'Forbidden') {
      MessageManager.notify.warning(message);
      return;
    }

    // Validation errors (422)
    if (statusCode === 422 || errorType === 'ValidationError') {
      let validationMessage = message;

      if (error.ValidationErrors) {
        validationMessage += '<br><ul style="text-align:left; margin-top:10px;">';
        for (const field in error.ValidationErrors) {
          const errors = error.ValidationErrors[field];
          if (Array.isArray(errors)) {
            errors.forEach(err => {
              validationMessage += `<li><strong>${field}:</strong> ${err}</li>`;
            });
          }
        }
        validationMessage += '</ul>';
      }

      MessageManager.alert.warning('Validation Error', validationMessage);
      return;
    }

    // Client errors (400, 404, 409)
    if (statusCode >= 400 && statusCode < 500) {
      if (errorType === 'NotFound') {
        MessageManager.notify.info(message);
      } else if (errorType === 'Conflict') {
        MessageManager.notify.warning(message);
      } else {
        MessageManager.notify.error(message);
      }
      return;
    }

    // Server errors (500+)
    if (statusCode >= 500) {
      MessageManager.alert.error(
        'Server Error',
        message + (error.Details ? '<br><small>' + error.Details + '</small>' : '')
      );
      return;
    }

    // Default error handling
    MessageManager.notify.error(message);
  }

  /**
   * Retry logic with exponential backoff
   */
  async function _withRetry(requestFn, retries) {
    const maxRetries = retries !== undefined ? retries : _config.maxRetries;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.StatusCode >= 400 && error.StatusCode < 500) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delay = _config.retryDelay * Math.pow(2, attempt); // Exponential backoff
          console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
          await _sleep(delay);
        }
      }
    }

    throw lastError;
  }

  // ============================================
  // PRIVATE - Request Builder
  // ============================================

  /**
   * Build fetch request
   */
  async function _buildRequest(method, endpoint, data, options) {
    const baseUrl = _getBaseUrl();
    const url = baseUrl + endpoint;
    const token = _getToken();

    const requestOptions = {
      method: method.toUpperCase(),
      headers: {
        'Authorization': token ? 'Bearer ' + token : ''
      },
      signal: options?.signal
    };

    // Handle body data
    if (data) {
      if (data instanceof FormData) {
        // For FormData, don't set Content-Type (browser will set it with boundary)
        requestOptions.body = data;
      } else {
        // For JSON
        requestOptions.headers['Content-Type'] = 'application/json';
        requestOptions.body = JSON.stringify(data);
      }
    }

    // Merge custom headers
    if (options?.headers) {
      Object.assign(requestOptions.headers, options.headers);
    }

    return { url, requestOptions };
  }

  /**
   * Execute request with retry and loading
   */
  async function _executeRequest(method, endpoint, data, options) {
    const requestFn = async () => {
      const { url, requestOptions } = await _buildRequest(method, endpoint, data, options);
      const response = await fetch(url, requestOptions);
      return await _handleHttpResponse(response);
    };

    // Wrap with retry if enabled
    const executeWithRetry = options?.retry !== false
      ? () => _withRetry(requestFn, options?.maxRetries)
      : requestFn;

    // Wrap with loading indicator if enabled
    if (_config.showLoadingForRequests && typeof MessageManager !== 'undefined') {
      return await MessageManager.loading.wrap(
        executeWithRetry(),
        options?.loadingMessage || 'Processing...'
      );
    }

    return await executeWithRetry();
  }

  // ============================================
  // PUBLIC - Core HTTP Methods
  // ============================================

  /**
   * GET Request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @param {object} options.params - Query parameters
   * @param {boolean} options.retry - Enable retry (default: true)
   * @param {number} options.maxRetries - Max retry attempts
   * @param {AbortSignal} options.signal - Abort signal
   * @returns {Promise<*>} Response data
   * 
   * @example
   * const users = await ApiCallManager.get('/crm-course-ddl');
   * const filtered = await ApiCallManager.get('/users', { params: { status: 'active' } });
   */
  async function get(endpoint, options) {
    try {
      // Build query string if params provided
      let url = endpoint;
      if (options?.params) {
        const queryString = new URLSearchParams(options.params).toString();
        url = endpoint.includes('?') ? `${endpoint}&${queryString}` : `${endpoint}?${queryString}`;
      }

      const response = await _executeRequest('GET', url, null, options);

      // Return only Data field for cleaner API (matching backend pattern)
      return response.Data;
    } catch (error) {
      _handleError(error);
      throw error;
    }
  }

  /**
   * POST Request
   * @param {string} endpoint - API endpoint
   * @param {object|FormData} data - Request payload
   * @param {object} options - Request options
   * @returns {Promise<*>} Response data
   * 
   * @example
   * const newCourse = await ApiCallManager.post('/crm-course', courseData);
   */
  async function post(endpoint, data, options) {
    try {
      const response = await _executeRequest('POST', endpoint, data, options);
      return response.Data;
    } catch (error) {
      _handleError(error);
      throw error;
    }
  }

  /**
   * PUT Request
   * @param {string} endpoint - API endpoint
   * @param {object|FormData} data - Request payload
   * @param {object} options - Request options
   * @returns {Promise<*>} Response data
   * 
   * @example
   * const updated = await ApiCallManager.put('/crm-course/123', courseData);
   */
  async function put(endpoint, data, options) {
    try {
      const response = await _executeRequest('PUT', endpoint, data, options);
      return response.Data;
    } catch (error) {
      _handleError(error);
      throw error;
    }
  }

  /**
   * DELETE Request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise<*>} Response data
   * 
   * @example
   * await ApiCallManager.delete('/crm-course/123');
   */
  async function deleteRequest(endpoint, options) {
    try {
      const response = await _executeRequest('DELETE', endpoint, null, options);
      return response.Data;
    } catch (error) {
      _handleError(error);
      throw error;
    }
  }

  /**
   * PATCH Request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request payload
   * @param {object} options - Request options
   * @returns {Promise<*>} Response data
   */
  async function patch(endpoint, data, options) {
    try {
      const response = await _executeRequest('PATCH', endpoint, data, options);
      return response.Data;
    } catch (error) {
      _handleError(error);
      throw error;
    }
  }

  // ================================================================
  // PUBLIC - Grid-Specific Method (matching CRMGridOptions)
  // ================================================================
  /**
   * POST for Kendo Grid (matching backend CRMGridOptions pattern)
   * @param {string} endpoint - API endpoint (e.g., '/crm-course-summary')
   * @param {object} gridOptions - Grid options
   * @returns {Promise<{Items: Array, TotalCount: number}>}
   * 
   * @example
   * const gridData = await ApiCallManager.postForGrid('/crm-course-summary', {
   *   skip: 0,
   *   take: 20,
   *   page: 1,
   *   pageSize: 20,
   *   sort: null,
   *   filter: null
   * });
   */
  async function postForGrid(endpoint, gridOptions) {
    try {
      const requestPayload = {
        Skip: gridOptions.skip || 0,
        Take: gridOptions.take || gridOptions.pageSize || 20,
        Page: gridOptions.page || 1,
        PageSize: gridOptions.pageSize || 20,
        Sort: gridOptions.sort || null,
        Filter: gridOptions.filter || null
      };

      const response = await _executeRequest('POST', endpoint, requestPayload, { retry: false });

      // Return Data which should contain { Items: [], TotalCount: 0 }
      return response.Data;
    } catch (error) {
      _handleError(error);
      throw error;
    }
  }

  // ============================================
  // PUBLIC - Grid DataSource Builder
  // ============================================
  function createGridDataSource(config) {
    if (!config || !config.endpoint) {
      throw new Error('ApiCallManager.createGridDataSource: endpoint is required');
    }

    const baseUrl = _getBaseUrl();
    const token = _getToken();

    return new kendo.data.DataSource({
      type: 'json',
      transport: {
        read: {
          url: baseUrl + config.endpoint,
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          beforeSend: function (xhr) {
            if (token) {
              xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            }
          }
        },
        parameterMap: function (data, operation) {
          if (operation === 'read') {
            return JSON.stringify({
              Skip: data.skip || 0,
              Take: data.take || config.pageSize || 20,
              Page: data.page || 1,
              PageSize: data.pageSize || config.pageSize || 20,
              Sort: data.sort || null,
              Filter: data.filter || null
            });
          }
          return data;
        }
      },
      schema: {
        data: function (response) {
          // Backend pattern: { IsSuccess: true, Data: { Items: [], TotalCount: 0 } }
          if (response && response.IsSuccess && response.Data) {
            return response.Data.Items || [];
          }
          return [];
        },
        total: function (response) {
          if (response && response.IsSuccess && response.Data) {
            return response.Data.TotalCount || 0;
          }
          return 0;
        },
        errors: function (response) {
          if (response && response.IsSuccess === false) {
            return response.Message || 'An error occurred';
          }
          return null;
        },
        model: {
          fields: config.modelFields || {}
        }
      },
      pageSize: config.pageSize || 20,
      serverPaging: config.serverPaging !== false,
      serverSorting: config.serverSorting !== false,
      serverFiltering: config.serverFiltering !== false,
      error: function (e) {
        console.error('DataSource Error:', e);
        // Handle xhr errors
        if (e.xhr) {
          try {
            const errorData = JSON.parse(e.xhr.responseText);
            _handleError(errorData);
          } catch {
            _handleError({
              StatusCode: e.xhr.status,
              Message: e.xhr.statusText || 'DataSource error'
            });
          }
        } else {
          _handleError({
            StatusCode: 500,
            Message: e.errorThrown || 'DataSource error'
          });
        }
      }
    });
  }

  // ============================================
  // PUBLIC - Specialized Methods
  // ============================================

  /**
   * Upload file with FormData
   * @param {string} endpoint - API endpoint
   * @param {File} file - File to upload
   * @param {object} additionalData - Additional form fields
   * @param {object} options - Request options
   * @returns {Promise<*>} Response data
   * 
   * @example
   * const result = await ApiCallManager.uploadFile('/upload', fileInput.files[0], {
   *   category: 'documents'
   * });
   */
  async function uploadFile(endpoint, file, additionalData, options) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add additional fields
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }

      const response = await _executeRequest('POST', endpoint, formData, {
        ...options,
        loadingMessage: options?.loadingMessage || 'Uploading file...'
      });

      return response.Data;
    } catch (error) {
      _handleError(error);
      throw error;
    }
  }

  /**
   * Convert nested object with files to FormData (for complex forms like CRM Application)
   * @param {object} obj - Nested object
   * @param {FormData} formData - Existing FormData (optional)
   * @param {string} prefix - Field prefix (optional)
   * @returns {FormData}
   * 
   * @example
   * const formData = ApiCallManager.convertToFormData(applicationData);
   * await ApiCallManager.post('/crm-application', formData);
   */
  function convertToFormData(obj, formData, prefix) {
    if (!formData) {
      formData = new FormData();
    }

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      const value = obj[key];
      const fieldName = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        continue;
      }

      // Handle File objects
      if (value instanceof File) {
        formData.append(fieldName, value);
      }
      // Handle Arrays
      else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File) {
            formData.append(`${fieldName}[${index}]`, item);
          } else if (typeof item === 'object' && item !== null) {
            convertToFormData(item, formData, `${fieldName}[${index}]`);
          } else {
            formData.append(`${fieldName}[${index}]`, item);
          }
        });
      }
      // Handle Date objects
      else if (value instanceof Date) {
        formData.append(fieldName, value.toISOString());
      }
      // Handle nested objects
      else if (typeof value === 'object' && !(value instanceof File)) {
        convertToFormData(value, formData, fieldName);
      }
      // Handle primitive values
      else {
        formData.append(fieldName, value.toString());
      }
    }

    return formData;
  }

  /**
   * Batch requests (parallel execution)
   * @param {Array<{method, endpoint, data}>} requests - Array of requests
   * @returns {Promise<Array<{success, data, error}>>}
   * 
   * @example
   * const results = await ApiCallManager.batch([
   *   { method: 'GET', endpoint: '/countryddl' },
   *   { method: 'GET', endpoint: '/currencyddl' }
   * ]);
   */
  async function batch(requests) {
    const promises = requests.map(req => {
      const method = (req.method || 'GET').toLowerCase();
      const apiFn = this[method] || this.get;

      return apiFn.call(this, req.endpoint, req.data, req.options)
        .then(data => ({ success: true, data, error: null }))
        .catch(error => ({ success: false, data: null, error }));
    });

    return Promise.all(promises);
  }

  /**
   * Manual retry wrapper
   * @param {Function} requestFn - Request function
   * @param {number} maxRetries - Max retry attempts
   * @returns {Promise<*>}
   * 
   * @example
   * const data = await ApiCallManager.withRetry(
   *   () => ApiCallManager.get('/unstable-endpoint'),
   *   3
   * );
   */
  async function withRetry(requestFn, maxRetries) {
    return await _withRetry(requestFn, maxRetries);
  }

  // ============================================
  // PUBLIC - Configuration
  // ============================================

  /**
   * Get current configuration
   */
  function getConfig() {
    return Object.assign({}, _config);
  }

  /**
   * Update configuration
   * @param {object} newConfig - New configuration
   * 
   * @example
   * ApiCallManager.setConfig({
   *   showErrorNotifications: false,
   *   maxRetries: 5
   * });
   */
  function setConfig(newConfig) {
    if (newConfig && typeof newConfig === 'object') {
      Object.assign(_config, newConfig);
    }
  }

  // ============================================
  // PUBLIC - Utilities
  // ============================================

  /**
   * Get base API URL
   */
  function getBaseUrl() {
    return _getBaseUrl();
  }

  /**
   * Check if ready
   */
  function isReady() {
    return !!_getBaseUrl();
  }

  /**
   * Get version info
   */
  function getInfo() {
    return {
      name: 'ApiCallManager',
      version: '2.0.0',
      author: 'devSakhawat',
      date: '2025-01-13',
      baseUrl: _getBaseUrl(),
      ready: isReady(),
      config: getConfig(),
      backendPattern: 'ResponseHelper.cs'
    };
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // Core HTTP Methods
    get: get,
    post: post,
    put: put,
    delete: deleteRequest,
    patch: patch,

    // Grid Methods
    postForGrid: postForGrid,
    createGridDataSource: createGridDataSource,

    // Specialized Methods
    uploadFile: uploadFile,
    convertToFormData: convertToFormData,
    batch: batch,
    withRetry: withRetry,

    // Configuration
    getConfig: getConfig,
    setConfig: setConfig,

    // Utilities
    getBaseUrl: getBaseUrl,
    isReady: isReady,
    getInfo: getInfo
  };
})();

// ============================================
// Auto-initialization Check
// ============================================
(function () {
  if (!ApiCallManager.isReady()) {
    console.error(
      '%c[ApiCallManager] ERROR: Base API URL not configured!',
      'color: red; font-weight: bold; font-size: 14px;'
    );
  } else {
    console.log(
      '%c[ApiCallManager] ✓ Loaded successfully',
      'color: #4CAF50; font-weight: bold; font-size: 12px;'
    );

    if (typeof console !== 'undefined' && console.table) {
      console.table(ApiCallManager.getInfo());
    }
  }
})();