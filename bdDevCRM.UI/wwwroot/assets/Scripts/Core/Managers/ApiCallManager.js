/*=========================================================
 * API Call Manager (Enterprise Level)
 * File: ApiCallManager.js
 * Description: Centralized HTTP request manager matching
 *              BackEnd ResponseHelper.cs + ApiException.cs
 *              + ExceptionMiddleware.cs patterns
 * Author: devSakhawat
 * Date: 2026-02-28
 * Version: 3.0.0
 *
 * BackEnd Response Contract (JsonNamingPolicy.CamelCase):
 * ──────────────────────────────────────────────────────
 * Success → ApiResponse<T>:
 *   { statusCode, message, isSuccess, timestamp, data }
 *
 * Error → ApiException (via ExceptionMiddleware):
 *   { statusCode, message, isSuccess, errorType,
 *     correlationId, details, validationErrors, timestamp }
 *
 * Updates v3.0.0:
 * - Fixed PascalCase/camelCase mismatch with BackEnd
 * - Removed debugger statements
 * - Removed Node.js require statement
 * - Fixed stale token in createGridDataSource
 * - Unified get/post with automatic token refresh
 * - Fixed batch() context issue
 * - Removed duplicate _getApiBaseUrl
 * - Added proper content-type handling (blob, text)
 * - Added AbortController timeout support
 * - Added request/response interceptors
=========================================================*/

var ApiCallManager = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Configuration
  // ============================================

  var _config = {
    defaultTimeout: 30000,
    maxRetries: 2,
    retryDelay: 1000,
    showErrorNotifications: true,
    showLoadingForRequests: false,
    // Status codes that are safe to retry
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
  };

  // Request/Response Interceptors
  var _interceptors = {
    request: [],
    response: [],
    error: []
  };

  // ============================================================================
  // PRIVATE - Base Helpers
  // ============================================================================

  /**
   * Get base API URL
   * @private
   */
  function _getBaseUrl() {
    if (typeof AppConfig !== 'undefined' && AppConfig.getApiUrl) {
      return AppConfig.getApiUrl();
    }
    if (typeof baseApi !== 'undefined') {
      return baseApi;
    }
    console.error('[ApiCallManager] baseApi is not defined');
    return '';
  }

  /**
   * Get JWT Token (always fresh)
   * @private
   */
  function _getToken() {
    if (typeof StorageManager !== 'undefined' && StorageManager.getAccessToken) {
      return StorageManager.getAccessToken();
    }
    return '';
  }

  /**
   * Sleep helper for retry delay
   * @private
   */
  function _sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  /**
   * Create AbortController with timeout
   * @private
   */
  function _createTimeoutSignal(timeoutMs) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);
    return { signal: controller.signal, timeoutId: timeoutId };
  }

  /**
   * Map HTTP status code to ErrorType
   * Matches BackEnd ResponseHelper.cs ErrorType values exactly
   * @private
   */
  function _getErrorType(statusCode) {
    var errorTypes = {
      400: 'BadRequest',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'NotFound',
      405: 'MethodNotAllowed',
      408: 'Timeout',
      409: 'Conflict',
      422: 'ValidationError',
      429: 'TooManyRequests',
      500: 'InternalServerError',
      503: 'ServiceUnavailable'
    };
    return errorTypes[statusCode] || 'UnknownError';
  }

  // ============================================================================
  // PRIVATE - Response Normalization
  // ============================================================================

  /**
   * Normalize response property access (handles both PascalCase and camelCase)
   *
   * BackEnd ExceptionMiddleware uses JsonNamingPolicy.CamelCase
   * → JSON comes as camelCase: statusCode, isSuccess, message, data, errorType
   *
   * But some BackEnd endpoints might not go through the same serializer
   * → Could come as PascalCase: StatusCode, IsSuccess, Message, Data, ErrorType
   *
   * This function normalizes to a consistent INTERNAL PascalCase format
   * so the rest of ApiCallManager works uniformly.
   *
   * @param {object} data - Raw response from backend
   * @returns {object} Normalized object with PascalCase properties
   * @private
   */
  function _normalizeResponse(data) {
    if (!data || typeof data !== 'object') return data;

    return {
      StatusCode: data.StatusCode ?? data.statusCode,
      Message: data.Message ?? data.message,
      IsSuccess: data.IsSuccess ?? data.isSuccess,
      Timestamp: data.Timestamp ?? data.timestamp,
      Data: data.Data ?? data.data,
      // ApiException fields
      ErrorType: data.ErrorType ?? data.errorType,
      CorrelationId: data.CorrelationId ?? data.correlationId,
      Details: data.Details ?? data.details,
      ValidationErrors: data.ValidationErrors ?? data.validationErrors
    };
  }

  // ============================================================================
  // PRIVATE - HTTP Response Handler
  // ============================================================================

  /**
   * Handle HTTP Response
   *
   * Matches BackEnd patterns:
   *   Success: ResponseHelper.Success<T>()   → ApiResponse<T>
   *   Error:   ExceptionMiddleware           → ApiException
   *
   * @param {Response} response - Fetch API Response object
   * @returns {Promise<object>} Normalized response
   * @private
   */
  async function _handleHttpResponse(response) {
    var data;

    try {
      var contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        var textResult = await response.text();
        // Wrap text response in standard format
        data = {
          StatusCode: response.status,
          Message: textResult,
          IsSuccess: response.ok,
          Data: textResult
        };
      } else if (contentType.includes('application/octet-stream') ||
        contentType.includes('application/pdf') ||
        contentType.includes('application/zip')) {
        // Binary file download
        var blob = await response.blob();
        return {
          IsSuccess: true,
          StatusCode: response.status,
          Message: 'File downloaded',
          Data: blob,
          Timestamp: new Date().toISOString()
        };
      } else {
        // Try JSON first, fallback to text
        var rawText = await response.text();
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          data = {
            StatusCode: response.status,
            Message: rawText || response.statusText,
            IsSuccess: response.ok,
            Data: rawText
          };
        }
      }
    } catch (parseError) {
      data = {
        IsSuccess: false,
        StatusCode: response.status,
        Message: response.statusText || 'Failed to parse response',
        ErrorType: 'ParseError'
      };
    }

    // Normalize camelCase → PascalCase for internal consistency
    var normalized = _normalizeResponse(data);

    // ✅ SUCCESS (200-299)
    if (response.ok) {
      // Check if BackEnd returned standard ApiResponse format
      if (normalized.IsSuccess === true || normalized.IsSuccess === undefined) {
        return {
          IsSuccess: true,
          StatusCode: normalized.StatusCode || response.status,
          Message: normalized.Message || 'Success',
          Timestamp: normalized.Timestamp || new Date().toISOString(),
          Data: normalized.Data !== undefined ? normalized.Data : data
        };
      }

      // BackEnd returned ok HTTP status but isSuccess=false (business logic error)
      throw {
        IsSuccess: false,
        StatusCode: normalized.StatusCode || response.status,
        Message: normalized.Message || 'Operation failed',
        ErrorType: normalized.ErrorType || 'BusinessError',
        CorrelationId: normalized.CorrelationId || null,
        Details: normalized.Details || null,
        ValidationErrors: normalized.ValidationErrors || null
      };
    }

    // ❌ ERROR (400+) — matches BackEnd ApiException structure
    throw {
      IsSuccess: false,
      StatusCode: normalized.StatusCode || response.status,
      Message: normalized.Message || response.statusText || _getDefaultErrorMessage(response.status),
      ErrorType: normalized.ErrorType || _getErrorType(response.status),
      Details: normalized.Details || null,
      ValidationErrors: normalized.ValidationErrors || null,
      CorrelationId: normalized.CorrelationId || null,
      Timestamp: normalized.Timestamp || new Date().toISOString()
    };
  }

  /**
   * Get default error message for status code
   * Matches BackEnd ApiResponse.GetDefaultMessageForStatusCode()
   * @private
   */
  function _getDefaultErrorMessage(statusCode) {
    var messages = {
      400: 'A bad request, you have made!',
      401: 'Authorized, you are not!',
      403: 'Access forbidden!',
      404: 'Resource found, it was not!',
      405: 'Invalid url',
      408: 'Request timed out',
      409: 'Duplicate data found!',
      422: 'Validation failed!',
      429: 'Too many requests. Please wait.',
      500: 'Internal server error!',
      502: 'Bad gateway',
      503: 'Service unavailable!'
    };
    return messages[statusCode] || 'An error occurred';
  }

  // ============================================================================
  // PRIVATE - Error Handler
  // ============================================================================

  /**
   * Handle and display errors
   * Matches BackEnd ApiException fields:
   *   StatusCode, Message, ErrorType, CorrelationId, Details, ValidationErrors
   *
   * @param {object} error - Error object (already normalized to PascalCase)
   * @param {object} options - Error handling options
   * @private
   */
  function _handleError(error, options) {
    // Use ApiErrorHandler if available (enterprise-level error handling)
    if (typeof ApiErrorHandler !== 'undefined') {
      return ApiErrorHandler.handleError(error, {
        showNotification: _config.showErrorNotifications,
        ...(options || {})
      });
    }

    // Run error interceptors
    for (var i = 0; i < _interceptors.error.length; i++) {
      try { _interceptors.error[i](error); } catch (e) { /* swallow interceptor errors */ }
    }

    console.error('[ApiCallManager Error]', error);

    if (!_config.showErrorNotifications) return;
    if (options && options.silent) return;

    var statusCode = error.StatusCode || error.statusCode || 500;
    var errorType = error.ErrorType || error.errorType || 'Error';
    var message = error.Message || error.message || 'An error occurred';
    var correlationId = error.CorrelationId || error.correlationId || '';

    // Check if MessageManager is available
    if (typeof MessageManager === 'undefined') {
      console.error('[ApiCallManager] MessageManager not available');
      return;
    }

    // ── Authentication errors (401) ──
    if (statusCode === 401 || errorType === 'Unauthorized' || errorType === 'TokenExpired' || errorType === 'InvalidToken') {
      // Don't show notification — _handleSessionExpired will handle it
      return;
    }

    // ── Forbidden (403) ──
    if (statusCode === 403 || errorType === 'Forbidden') {
      MessageManager.notify.warning(message || 'You do not have permission for this action.');
      return;
    }

    // ── Validation errors (400 with ValidationErrors, or 422) ──
    if (statusCode === 422 || errorType === 'ValidationError' ||
      (statusCode === 400 && error.ValidationErrors)) {
      var validationMsg = message;

      if (error.ValidationErrors) {
        validationMsg += '<br><ul style="text-align:left; margin-top:10px;">';
        for (var field in error.ValidationErrors) {
          if (error.ValidationErrors.hasOwnProperty(field)) {
            var fieldErrors = error.ValidationErrors[field];
            if (Array.isArray(fieldErrors)) {
              for (var j = 0; j < fieldErrors.length; j++) {
                validationMsg += '<li><strong>' + field + ':</strong> ' + fieldErrors[j] + '</li>';
              }
            }
          }
        }
        validationMsg += '</ul>';
      }

      MessageManager.alert.warning('Validation Error', validationMsg);
      return;
    }

    // ── Client errors (400, 404, 409 etc.) ──
    if (statusCode >= 400 && statusCode < 500) {
      var title = errorType;

      // Map BackEnd exception names to friendly titles
      if (errorType === 'BadRequestException' || errorType === 'BadRequest' ||
        errorType === 'GenericBadRequestException' || errorType === 'NullModelBadRequestException' ||
        errorType === 'IdMismatchBadRequestException' || errorType === 'InvalidCreateOperationException' ||
        errorType === 'InvalidUpdateOperationException') {
        MessageManager.notify.error(message, 'Bad Request');
      } else if (errorType === 'NotFound' || errorType === 'NotFoundException' ||
        errorType === 'GenericNotFoundException' || errorType === 'KeyNotFound') {
        MessageManager.notify.info(message, 'Not Found');
      } else if (errorType === 'Conflict' || errorType === 'ConflictException' ||
        errorType === 'DuplicateRecordException' || errorType === 'GenericConflictException') {
        MessageManager.notify.warning(message, 'Conflict');
      } else if (errorType === 'UsernamePasswordMismatchException') {
        MessageManager.notify.error(message, 'Authentication Failed');
      } else {
        MessageManager.notify.error(message, title);
      }
      return;
    }

    // ── Server errors (500+) ──
    if (statusCode >= 500) {
      var serverErrorHtml = message;
      if (error.Details) {
        serverErrorHtml += '<br><small class="text-muted">' + error.Details + '</small>';
      }
      if (correlationId) {
        serverErrorHtml += '<br><small class="text-muted">Ref: ' + correlationId + '</small>';
      }

      MessageManager.alert.error('Server Error', serverErrorHtml);
      return;
    }

    // ── Default ──
    MessageManager.notify.error(message);
  }

  // ============================================================================
  // PRIVATE - Retry Logic
  // ============================================================================

  /**
   * Retry with exponential backoff
   *
   * Rules:
   * - 4xx errors (client errors) are NOT retryable (except 408, 429)
   * - 5xx errors are retryable
   * - Network errors are retryable
   *
   * @param {function} requestFn
   * @param {number} retries
   * @returns {Promise<any>}
   * @private
   */
  async function _withRetry(requestFn, retries) {
    var maxRetries = retries !== undefined ? retries : _config.maxRetries;
    var lastError;

    for (var attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Use ApiErrorHandler if available
        if (typeof ApiErrorHandler !== 'undefined') {
          var errType = ApiErrorHandler.getErrorType(error);
          if (!ApiErrorHandler.isRetryable(errType)) {
            throw error;
          }
          if (attempt < maxRetries) {
            var handlerDelay = ApiErrorHandler.getRetryDelay(attempt + 1);
            await _sleep(handlerDelay);
            continue;
          }
        }

        // Fallback retry logic
        var statusCode = error.StatusCode || error.statusCode || 0;

        // Don't retry client errors (except retryable ones)
        if (statusCode >= 400 && statusCode < 500 &&
          _config.retryableStatusCodes.indexOf(statusCode) === -1) {
          throw error;
        }

        if (attempt < maxRetries) {
          var delay = _config.retryDelay * Math.pow(2, attempt);
          console.log('[ApiCallManager] Retry ' + (attempt + 1) + '/' + maxRetries + ' after ' + delay + 'ms');
          await _sleep(delay);
        }
      }
    }

    console.error('[ApiCallManager] All ' + maxRetries + ' retry attempts failed');
    throw lastError;
  }

  // ============================================================================
  // PRIVATE - Request Builder
  // ============================================================================

  /**
   * Build fetch request
   * @private
   */
  function _buildRequest(method, endpoint, data, options) {
    var baseUrl = _getBaseUrl();
    var url = baseUrl + endpoint;
    var token = _getToken(); // Always get fresh token!

    var requestOptions = {
      method: method.toUpperCase(),
      headers: {},
      credentials: 'include' // Enable cookies (for refresh token)
    };

    // Set Authorization header
    if (token) {
      requestOptions.headers['Authorization'] = 'Bearer ' + token;
    }

    // Handle body data
    if (data) {
      if (data instanceof FormData) {
        requestOptions.body = data;
        // Don't set Content-Type — browser will set it with boundary
      } else {
        requestOptions.headers['Content-Type'] = 'application/json';
        requestOptions.body = JSON.stringify(data);
      }
    }

    // Merge custom headers
    if (options && options.headers) {
      Object.assign(requestOptions.headers, options.headers);
    }

    // Handle AbortSignal
    if (options && options.signal) {
      requestOptions.signal = options.signal;
    }

    return { url: url, requestOptions: requestOptions };
  }

  /**
   * Prepare request options with defaults
   * @private
   */
  function _prepareRequestOptions(options) {
    var defaults = {
      retry: true,
      maxRetries: _config.maxRetries,
      retryDelay: _config.retryDelay,
      timeout: _config.defaultTimeout,
      showLoadingIndicator: false,
      showErrorNotifications: _config.showErrorNotifications,
      skipTokenRefresh: false,
      silent: false,
      params: null
    };

    return Object.assign({}, defaults, options || {});
  }

  /**
   * Build query string from params and append to endpoint
   * @private
   */
  function _buildUrlWithParams(endpoint, params) {
    if (!params || typeof params !== 'object' || Object.keys(params).length === 0) {
      return endpoint;
    }
    var queryString = new URLSearchParams(params).toString();
    return endpoint.includes('?')
      ? endpoint + '&' + queryString
      : endpoint + '?' + queryString;
  }

  // ============================================================================
  // PRIVATE - Request Execution Engine
  // ============================================================================

  /**
   * Core request executor with retry and loading support
   * @private
   */
  async function _executeRequest(method, endpoint, data, options) {
    var requestFn = async function () {
      var built = _buildRequest(method, endpoint, data, options);

      // Create timeout
      var timeout = null;
      var fetchOptions = built.requestOptions;

      if (!fetchOptions.signal && options && options.timeout) {
        timeout = _createTimeoutSignal(options.timeout);
        fetchOptions.signal = timeout.signal;
      }

      try {
        // Run request interceptors
        for (var i = 0; i < _interceptors.request.length; i++) {
          var result = _interceptors.request[i](built.url, fetchOptions);
          if (result) { fetchOptions = result.requestOptions || fetchOptions; }
        }

        var response = await fetch(built.url, fetchOptions);
        var parsed = await _handleHttpResponse(response);

        // Run response interceptors
        for (var j = 0; j < _interceptors.response.length; j++) {
          try { _interceptors.response[j](parsed); } catch (e) { /* swallow */ }
        }

        return parsed;
      } finally {
        // Clear timeout
        if (timeout && timeout.timeoutId) {
          clearTimeout(timeout.timeoutId);
        }
      }
    };

    // Wrap with retry if enabled
    var executeFn = (options && options.retry !== false)
      ? function () { return _withRetry(requestFn, options ? options.maxRetries : undefined); }
      : requestFn;

    // Wrap with loading indicator if enabled
    if (_config.showLoadingForRequests && typeof MessageManager !== 'undefined' && MessageManager.loading) {
      return await MessageManager.loading.wrap(
        executeFn(),
        (options && options.loadingMessage) || 'Processing...'
      );
    }

    return await executeFn();
  }

  // ============================================================================
  // PRIVATE - Token Refresh Engine
  // ============================================================================

  /**
   * Execute API call with automatic token refresh
   *
   * Flow (matches BackEnd JWT Auth):
   * 1. Check if access token is expired/expiring
   * 2. If yes → refresh via cookie-based refresh token
   * 3. Execute API call
   * 4. If 401 → attempt refresh once → retry
   * 5. If refresh fails → session expired → redirect to login
   *
   * @param {Function} apiCall
   * @param {object} options
   * @returns {Promise}
   * @private
   */
  async function _executeWithTokenRefresh(apiCall, options) {
    // Skip if explicitly disabled
    if (options.skipTokenRefresh) {
      return await apiCall();
    }

    // Skip if dependencies not available
    if (typeof StorageManager === 'undefined' || typeof TokenManager === 'undefined') {
      return await apiCall();
    }

    try {
      // ── PHASE 1: Pre-flight token check ──
      var isExpired = StorageManager.isAccessTokenExpired();
      var shouldRefresh = StorageManager.shouldRefreshAccessToken(60);

      if (isExpired || shouldRefresh) {
        // Check if refresh token cookie is still valid
        if (StorageManager.isRefreshTokenExpired()) {
          _handleSessionExpired();
          throw { StatusCode: 401, Message: 'Session expired', ErrorType: 'SessionExpired' };
        }

        var preRefreshSuccess = await TokenManager.refreshToken();
        if (!preRefreshSuccess) {
          _handleSessionExpired();
          throw { StatusCode: 401, Message: 'Token refresh failed', ErrorType: 'RefreshFailed' };
        }
      }

      // ── PHASE 2: Execute API call ──
      return await apiCall();

    } catch (error) {
      // ── PHASE 3: Handle 401 → Retry once ──
      var is401 = (
        error.StatusCode === 401 ||
        error.statusCode === 401 ||
        error.status === 401
      );

      if (is401 && !options._retryAttempted) {
        if (StorageManager.isRefreshTokenExpired()) {
          _handleSessionExpired();
          throw error;
        }

        var refreshSuccess = await TokenManager.refreshToken();

        if (refreshSuccess) {
          var retryOpts = Object.assign({}, options, { _retryAttempted: true });
          return await _executeWithTokenRefresh(apiCall, retryOpts);
        } else {
          _handleSessionExpired();
        }
      }

      throw error;
    }
  }

  /**
   * Handle session expiry
   * @private
   */
  function _handleSessionExpired() {
    console.error('[ApiCallManager] Session expired');

    if (typeof TokenManager !== 'undefined' && TokenManager.stopAutoRefresh) {
      TokenManager.stopAutoRefresh();
    }

    if (typeof StorageManager !== 'undefined' && StorageManager.clearAll) {
      StorageManager.clearAll();
    }

    if (typeof MessageManager !== 'undefined') {
      MessageManager.alert.warning(
        'Session Expired',
        'Your session has expired. Please log in again.',
        function () { _redirectToLogin(); }
      );
    } else {
      _redirectToLogin();
    }
  }

  /**
   * Redirect to login page
   * @private
   */
  function _redirectToLogin() {
    var loginUrl = (typeof AppConfig !== 'undefined' && AppConfig.getUiUrl)
      ? AppConfig.getUiUrl() + '/Home/Login'
      : (typeof baseUI !== 'undefined' ? baseUI + '/Home/Login' : '/Home/Login');

    window.location.href = loginUrl;
  }

  // ============================================================================
  // PUBLIC - Core HTTP Methods (Always with Token Refresh)
  // ============================================================================

  /**
   * GET Request
   * @param {string} endpoint - API endpoint
   * @param {object} [options] - Request options
   * @param {object} [options.params] - Query parameters
   * @param {boolean} [options.retry=true] - Enable retry
   * @param {number} [options.maxRetries] - Max retry attempts
   * @param {AbortSignal} [options.signal] - Abort signal
   * @param {boolean} [options.raw=false] - Return full response instead of Data only
   * @returns {Promise<*>} Response Data (or full response if options.raw=true)
   *
   * @example
   * const courses = await ApiCallManager.get('/crm-course-ddl');
   * const filtered = await ApiCallManager.get('/users', { params: { status: 'active' } });
   * const fullResp = await ApiCallManager.get('/users', { raw: true });
   */
  async function get(endpoint, options) {
    options = _prepareRequestOptions(options);

    return await _executeWithTokenRefresh(async function () {
      try {
        var url = _buildUrlWithParams(endpoint, options.params);
        var response = await _executeRequest('GET', url, null, options);
        return options.raw ? response : response.Data;
      } catch (error) {
        _handleError(error, options);
        throw error;
      }
    }, options);
  }

  /**
   * POST Request
   * @param {string} endpoint - API endpoint
   * @param {object|FormData} data - Request payload
   * @param {object} [options] - Request options
   * @returns {Promise<*>} Response Data
   *
   * @example
   * const newCourse = await ApiCallManager.post('/crm-course', courseData);
   */
  async function post(endpoint, data, options) {
    options = _prepareRequestOptions(options);

    return await _executeWithTokenRefresh(async function () {
      try {
        var response = await _executeRequest('POST', endpoint, data, options);
        return options.raw ? response : response.Data;
      } catch (error) {
        _handleError(error, options);
        throw error;
      }
    }, options);
  }

  /**
   * PUT Request
   * @param {string} endpoint - API endpoint
   * @param {object|FormData} data - Request payload
   * @param {object} [options] - Request options
   * @returns {Promise<*>} Response Data
   *
   * @example
   * const updated = await ApiCallManager.put('/crm-course/123', courseData);
   */
  async function put(endpoint, data, options) {
    options = _prepareRequestOptions(options);

    return await _executeWithTokenRefresh(async function () {
      try {
        var response = await _executeRequest('PUT', endpoint, data, options);
        return options.raw ? response : response.Data;
      } catch (error) {
        _handleError(error, options);
        throw error;
      }
    }, options);
  }

  /**
   * DELETE Request
   * @param {string} endpoint - API endpoint
   * @param {object} [options] - Request options
   * @returns {Promise<*>} Response Data
   *
   * @example
   * await ApiCallManager.delete('/crm-course/123');
   */
  async function deleteRequest(endpoint, options) {
    options = _prepareRequestOptions(options);

    return await _executeWithTokenRefresh(async function () {
      try {
        var response = await _executeRequest('DELETE', endpoint, null, options);
        return options.raw ? response : response.Data;
      } catch (error) {
        _handleError(error, options);
        throw error;
      }
    }, options);
  }

  /**
   * PATCH Request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request payload
   * @param {object} [options] - Request options
   * @returns {Promise<*>} Response Data
   */
  async function patch(endpoint, data, options) {
    options = _prepareRequestOptions(options);

    return await _executeWithTokenRefresh(async function () {
      try {
        var response = await _executeRequest('PATCH', endpoint, data, options);
        return options.raw ? response : response.Data;
      } catch (error) {
        _handleError(error, options);
        throw error;
      }
    }, options);
  }

  // ============================================================================
  // PUBLIC - Grid Methods
  // ============================================================================

  /**
   * POST for Kendo Grid (matching backend CRMGridOptions pattern)
   * @param {string} endpoint - API endpoint
   * @param {object} gridOptions - Grid pagination/sort/filter options
   * @returns {Promise<{Items: Array, TotalCount: number}>}
   *
   * @example
   * const gridData = await ApiCallManager.postForGrid('/crm-course-summary', {
   *   skip: 0, take: 20, page: 1, pageSize: 20
   * });
   */
  async function postForGrid(endpoint, gridOptions) {
    var payload = {
      Skip: gridOptions.skip || 0,
      Take: gridOptions.take || gridOptions.pageSize || 20,
      Page: gridOptions.page || 1,
      PageSize: gridOptions.pageSize || 20,
      Sort: gridOptions.sort || null,
      Filter: gridOptions.filter || null
    };

    return await post(endpoint, payload, { retry: false });
  }

  /**
   * Create Kendo Grid DataSource
   *
   * BackEnd returns: ApiResponse<GridResult<T>>
   * → { isSuccess: true, data: { items: [...], totalCount: n } }
   *
   * NOTE: Token is fetched fresh on every request (not captured in closure)
   */
  function createGridDataSource(config) {
    if (!config || !config.endpoint) {
      throw new Error('ApiCallManager.createGridDataSource: endpoint is required');
    }

    var baseUrl = _getBaseUrl();

    return new kendo.data.DataSource({
      type: 'json',
      transport: {
        read: {
          url: baseUrl + config.endpoint,
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          beforeSend: function (xhr) {
            // ✅ Fresh token on every request (not stale closure!)
            var freshToken = _getToken();
            if (freshToken) {
              xhr.setRequestHeader('Authorization', 'Bearer ' + freshToken);
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
          if (!response) return [];

          // Normalize response (handle both camelCase and PascalCase)
          var norm = _normalizeResponse(response);

          if (norm.IsSuccess === false) {
            _handleError(norm);
            return [];
          }

          if (norm.Data) {
            // Handle both camelCase and PascalCase data fields
            return norm.Data.Items || norm.Data.items || [];
          }

          console.warn('[ApiCallManager] Unexpected grid response format:', response);
          return [];
        },
        total: function (response) {
          if (!response) return 0;

          var norm = _normalizeResponse(response);
          if (norm.Data) {
            return norm.Data.TotalCount || norm.Data.totalCount || 0;
          }
          return 0;
        },
        errors: function (response) {
          if (!response) return null;
          var norm = _normalizeResponse(response);
          if (norm.IsSuccess === false) {
            return norm.Message || 'An error occurred';
          }
          return null;
        },
        model: {
          id: config.primaryKey || 'Id',
          fields: config.modelFields || {}
        }
      },
      pageSize: config.pageSize || 20,
      serverPaging: config.serverPaging !== false,
      serverSorting: config.serverSorting !== false,
      serverFiltering: config.serverFiltering !== false,
      error: function (e) {
        console.error('[ApiCallManager] DataSource Error:', e);

        if (e.xhr) {
          try {
            var errorData = JSON.parse(e.xhr.responseText);
            _handleError(_normalizeResponse(errorData));
          } catch (parseErr) {
            _handleError({
              StatusCode: e.xhr.status,
              Message: e.xhr.statusText || 'DataSource error',
              ErrorType: _getErrorType(e.xhr.status)
            });
          }
        } else if (e.errorThrown) {
          _handleError({
            StatusCode: 500,
            Message: e.errorThrown || 'DataSource error',
            ErrorType: 'DataSourceError'
          });
        }
      }
    });
  }

  // ============================================================================
  // PUBLIC - Specialized Methods
  // ============================================================================

  /**
   * Upload file with FormData
   * @param {string} endpoint - API endpoint
   * @param {File} file - File to upload
   * @param {object} [additionalData] - Additional form fields
   * @param {object} [options] - Request options
   * @returns {Promise<*>} Response Data
   *
   * @example
   * const result = await ApiCallManager.uploadFile('/upload', fileInput.files[0], {
   *   category: 'documents'
   * });
   */
  async function uploadFile(endpoint, file, additionalData, options) {
    var formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      var keys = Object.keys(additionalData);
      for (var i = 0; i < keys.length; i++) {
        formData.append(keys[i], additionalData[keys[i]]);
      }
    }

    return await post(endpoint, formData, Object.assign({
      loadingMessage: 'Uploading file...'
    }, options || {}));
  }

  /**
   * Convert nested object with files to FormData
   * @param {object} obj - Nested object
   * @param {FormData} [formData] - Existing FormData
   * @param {string} [prefix] - Field prefix
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

    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      var value = obj[key];
      var fieldName = prefix ? prefix + '.' + key : key;

      if (value === null || value === undefined) continue;

      if (value instanceof File || value instanceof Blob) {
        formData.append(fieldName, value);
      } else if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
          var item = value[i];
          if (item instanceof File || item instanceof Blob) {
            formData.append(fieldName + '[' + i + ']', item);
          } else if (typeof item === 'object' && item !== null) {
            convertToFormData(item, formData, fieldName + '[' + i + ']');
          } else {
            formData.append(fieldName + '[' + i + ']', item);
          }
        }
      } else if (value instanceof Date) {
        formData.append(fieldName, value.toISOString());
      } else if (typeof value === 'object') {
        convertToFormData(value, formData, fieldName);
      } else {
        formData.append(fieldName, value.toString());
      }
    }

    return formData;
  }

  /**
   * Batch parallel requests
   * @param {Array<{method: string, endpoint: string, data?: any, options?: object}>} requests
   * @returns {Promise<Array<{success: boolean, data: any, error: any}>>}
   *
   * @example
   * const results = await ApiCallManager.batch([
   *   { method: 'GET', endpoint: '/countryddl' },
   *   { method: 'GET', endpoint: '/currencyddl' }
   * ]);
   */
  async function batch(requests) {
    // ✅ Fixed: Map method names to actual functions (no 'this' context issue)
    var methodMap = {
      get: get,
      post: post,
      put: put,
      delete: deleteRequest,
      patch: patch
    };

    var promises = requests.map(function (req) {
      var method = (req.method || 'GET').toLowerCase();
      var fn = methodMap[method] || get;

      var callPromise;
      if (method === 'get' || method === 'delete') {
        callPromise = fn(req.endpoint, req.options);
      } else {
        callPromise = fn(req.endpoint, req.data, req.options);
      }

      return callPromise
        .then(function (data) { return { success: true, data: data, error: null }; })
        .catch(function (error) { return { success: false, data: null, error: error }; });
    });

    return Promise.all(promises);
  }

  /**
   * Manual retry wrapper
   * @param {Function} requestFn
   * @param {number} [maxRetries]
   * @returns {Promise<*>}
   */
  async function withRetry(requestFn, maxRetries) {
    return await _withRetry(requestFn, maxRetries);
  }

  /**
   * Refresh access token
   * @returns {Promise<boolean>}
   */
  async function refreshToken() {
    try {
      if (typeof StorageManager !== 'undefined' && StorageManager.isRefreshTokenExpired()) {
        return false;
      }

      var response = await _executeRequest(
        'POST',
        (typeof AppConfig !== 'undefined' && AppConfig.endpoints && AppConfig.endpoints.refreshToken)
          ? AppConfig.endpoints.refreshToken
          : '/refresh-token',
        null,
        { retry: false, skipTokenRefresh: true }
      );

      if (!response.Data) {
        throw new Error('Invalid refresh response');
      }

      if (typeof StorageManager !== 'undefined' && StorageManager.setTokens) {
        StorageManager.setTokens(response.Data);
      }

      return true;
    } catch (error) {
      console.error('[ApiCallManager] Token refresh failed:', error);
      return false;
    }
  }

  // ============================================================================
  // PUBLIC - Configuration & Utilities
  // ============================================================================

  function getConfig() {
    return Object.assign({}, _config);
  }

  function setConfig(newConfig) {
    if (newConfig && typeof newConfig === 'object') {
      Object.assign(_config, newConfig);
    }
  }

  function getBaseUrl() {
    return _getBaseUrl();
  }

  function isReady() {
    return !!_getBaseUrl();
  }

  function getInfo() {
    return {
      name: 'ApiCallManager',
      version: '3.0.0',
      author: 'devSakhawat',
      date: '2026-02-28',
      baseUrl: _getBaseUrl(),
      ready: isReady(),
      config: getConfig(),
      backendPattern: 'ResponseHelper.cs + ApiException.cs + ExceptionMiddleware.cs'
    };
  }

  // ============================================================================
  // PUBLIC - Interceptors
  // ============================================================================

  /**
   * Add request interceptor
   * @param {Function} fn - Interceptor function (url, options) => options
   * @returns {Function} Unsubscribe function
   */
  function addRequestInterceptor(fn) {
    _interceptors.request.push(fn);
    return function () {
      var idx = _interceptors.request.indexOf(fn);
      if (idx > -1) _interceptors.request.splice(idx, 1);
    };
  }

  /**
   * Add response interceptor
   * @param {Function} fn - Interceptor function (response) => void
   * @returns {Function} Unsubscribe function
   */
  function addResponseInterceptor(fn) {
    _interceptors.response.push(fn);
    return function () {
      var idx = _interceptors.response.indexOf(fn);
      if (idx > -1) _interceptors.response.splice(idx, 1);
    };
  }

  /**
   * Add error interceptor
   * @param {Function} fn - Interceptor function (error) => void
   * @returns {Function} Unsubscribe function
   */
  function addErrorInterceptor(fn) {
    _interceptors.error.push(fn);
    return function () {
      var idx = _interceptors.error.indexOf(fn);
      if (idx > -1) _interceptors.error.splice(idx, 1);
    };
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    // Core HTTP Methods (all include token refresh automatically)
    get: get,
    post: post,
    put: put,
    delete: deleteRequest,
    patch: patch,

    // Grid Methods
    postForGrid: postForGrid,
    createGridDataSource: createGridDataSource,

    // Token Management
    refreshToken: refreshToken,

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
    getInfo: getInfo,

    // Interceptors
    addRequestInterceptor: addRequestInterceptor,
    addResponseInterceptor: addResponseInterceptor,
    addErrorInterceptor: addErrorInterceptor
  };
})();




















///*=========================================================
// * API Call Manager (Updated with Interceptor Support)
// * File: ApiCallManager.js
// * Description: Centralized HTTP request manager with interceptor
// * Author: devSakhawat
// * Date: 2026-01-30
// * 
// * Updates:
// * - Integrated HttpInterceptor
// * - Automatic token attachment
// * - 401 error handling
// * - Cookie support
//=========================================================*/

//const { debug } = require("node:console");

//var ApiCallManager = (function () {
//  'use strict';

//  // ============================================
//  // PRIVATE - Configuration
//  // ============================================

//  var _config = {
//    defaultTimeout: 30000,
//    maxRetries: 2,
//    retryDelay: 1000,
//    showErrorNotifications: true,
//    showLoadingForRequests: false
//  };

//  // ============================================================================
//  // PRIVATE HELPER METHODS
//  // ============================================================================

//  /**
//   * Create Grid DataSource
//   */
//  function createGridDataSource(config) {
//    if (!config || !config.endpoint) {
//      throw new Error('ApiCallManager.createGridDataSource: endpoint is required');
//    }

//    const baseUrl = _getBaseUrl();
//    const token = _getToken();

//    return new kendo.data.DataSource({
//      type: 'json',
//      transport: {
//        read: {
//          url: baseUrl + config.endpoint,
//          type: 'POST',
//          dataType: 'json',
//          contentType: 'application/json',
//          beforeSend: function (xhr) {
//            if (token) {
//              xhr.setRequestHeader('Authorization', 'Bearer ' + token);
//            }
//          }
//        },
//        parameterMap: function (data, operation) {
//          if (operation === 'read') {
//            return JSON.stringify({
//              Skip: data.skip || 0,
//              Take: data.take || config.pageSize || 20,
//              Page: data.page || 1,
//              PageSize: data.pageSize || config.pageSize || 20,
//              Sort: data.sort || null,
//              Filter: data.filter || null
//            });
//          }
//          return data;
//        }
//      },
//      schema: {
//        data: function (response) {

//          //NULL check
//          if (!response) {
//            console.error('Response is NULL or undefined');
//            return [];
//          }

//          //Check if response is successful
//          if (response.IsSuccess === false) {
//            console.error('API returned error:', response.Message);
//            _handleError(response);
//            return [];
//          }

//          //Extract data
//          if (response && response.IsSuccess && response.Data) {
//            const items = response.Data.Items || [];
//            return items;
//          }

//          console.warn('Unexpected response format:', response);
//          return [];
//        },
//        total: function (response) {
//          //NULL check
//          if (!response) {
//            return 0;
//          }

//          if (response && response.IsSuccess && response.Data) {
//            return response.Data.TotalCount || 0;
//          }
//          return 0;
//        },
//        errors: function (response) {
//          if (response && response.IsSuccess === false) {
//            return response.Message || 'An error occurred';
//          }
//          return null;
//        },
//        model: {
//          id: config.primaryKey || 'Id',
//          fields: config.modelFields || {}
//        }
//      },
//      pageSize: config.pageSize || 20,
//      serverPaging: config.serverPaging !== false,
//      serverSorting: config.serverSorting !== false,
//      serverFiltering: config.serverFiltering !== false,
//      error: function (e) {
//        console.error('DataSource Error:', e);

//        //Handle XHR errors
//        if (e.xhr) {
//          console.error('XHR Status:', e.xhr.status);
//          console.error('XHR Response:', e.xhr.responseText);

//          try {
//            const errorData = JSON.parse(e.xhr.responseText);
//            _handleError(errorData);
//          } catch {
//            _handleError({
//              StatusCode: e.xhr.status,
//              Message: e.xhr.statusText || 'DataSource error'
//            });
//          }
//        } else if (e.errorThrown) {
//          _handleError({
//            StatusCode: 500,
//            Message: e.errorThrown || 'DataSource error'
//          });
//        } else {
//          console.error('Unknown DataSource error:', e);
//        }
//      }
//    });
//  }

//  /**
//   * Get base API URL
//   */
//  function _getBaseUrl() {
//    if (typeof AppConfig !== 'undefined' && AppConfig.getApiUrl) {
//      return AppConfig.getApiUrl();
//    }
//    if (typeof baseApi !== 'undefined') {
//      return baseApi;
//    }
//    console.error('ApiCallManager: baseApi is not defined');
//    return '';
//  }

//  /**
// * Get API base URL
// * @private
// */
//  function _getApiBaseUrl() {
//    if (typeof AppConfig !== 'undefined' && AppConfig.getApiUrl) {
//      return AppConfig.getApiUrl();
//    }
//    return typeof baseApi !== 'undefined' ? baseApi : '';
//  }

//  /**
//   * Get JWT Token
//   */
//  function _getToken() {
//    if (typeof StorageManager !== 'undefined') {
//      return StorageManager.getAccessToken();
//    }
//    return '';
//  }
//  //function _getToken() {
//  //  if (typeof TokenManager !== 'undefined' && TokenManager.hasToken) {
//  //    if (TokenManager.hasToken()) {
//  //      if (typeof AppConfig !== 'undefined' && AppConfig.getToken) {
//  //        return AppConfig.getToken();
//  //      }
//  //    }
//  //  }
//  //  return localStorage.getItem('access_token') || '';
//  //}

//  /**
//   * Sleep helper for retry delay
//   */
//  function _sleep(ms) {
//    return new Promise(resolve => setTimeout(resolve, ms));
//  }

//  /**
//   * Get error type from status code
//   */
//  function _getErrorType(statusCode) {
//    const errorTypes = {
//      400: 'BadRequest',
//      401: 'Unauthorized',
//      403: 'Forbidden',
//      404: 'NotFound',
//      409: 'Conflict',
//      422: 'ValidationError',
//      500: 'InternalServerError',
//      503: 'ServiceUnavailable'
//    };
//    return errorTypes[statusCode] || 'UnknownError';
//  }

//  /**
//   * Handle and display errors (with MessageManager integration)
//   */
//  /**
//   * Handle API error with enterprise-level error handler
//   * @param {object} error - Error object
//   * @param {object} options - Optional error handling options
//   * @returns {object} Parsed error object
//   */
//  function _handleError(error, options) {
//    // Use ApiErrorHandler if available (enterprise-level error handling)
//    if (typeof ApiErrorHandler !== 'undefined') {
//      return ApiErrorHandler.handleError(error, {
//        showNotification: _config.showErrorNotifications,
//        ...options
//      });
//    }

//    // Fallback to basic error handling if ApiErrorHandler not loaded
//    console.error('[ApiCallManager Error]', error);

//    if (!_config.showErrorNotifications) return;

//    const statusCode = error.StatusCode || error.statusCode || error?.response?.status || 500;
//    const errorType = error.ErrorType || error.errorType || 'Error';
//    const message = error.Message || error.message || 'An error occurred';

//    // Check if MessageManager is available
//    if (typeof MessageManager === 'undefined') {
//      console.error('MessageManager not available, using fallback');
//      alert(message);
//      return;
//    }

//    // Authentication errors (401, 403)
//    if (statusCode === 401 || errorType === 'Unauthorized') {
//      MessageManager.alert.warning(
//        'Authentication Required',
//        message + '<br><strong>Please login again.</strong>',
//        function () {
//          if (typeof TokenManager !== 'undefined') {
//            TokenManager.clearSession();
//            TokenManager.redirectToLogin();
//          } else {
//            window.location.href = (typeof baseUI !== 'undefined' ? baseUI : '') + '/Home/Login';
//          }
//        }
//      );
//      return;
//    }

//    if (statusCode === 403 || errorType === 'Forbidden') {
//      MessageManager.notify.warning(message);
//      return;
//    }

//    // Validation errors (422)
//    if (statusCode === 422 || errorType === 'ValidationError') {
//      let validationMessage = message;

//      if (error.ValidationErrors) {
//        validationMessage += '<br><ul style="text-align:left; margin-top:10px;">';
//        for (const field in error.ValidationErrors) {
//          const errors = error.ValidationErrors[field];
//          if (Array.isArray(errors)) {
//            errors.forEach(err => {
//              validationMessage += `<li><strong>${field}:</strong> ${err}</li>`;
//            });
//          }
//        }
//        validationMessage += '</ul>';
//      }

//      MessageManager.alert.warning('Validation Error', validationMessage);
//      return;
//    }

//    // Client errors (400, 404, 409)
//    if (statusCode >= 400 && statusCode < 500) {
//      if (errorType === 'BadRequestException') {
//        MessageManager.notify.error(message, 'Bad Request Exception');
//      }
//      else if (errorType === 'NotFound') {
//        MessageManager.notify.info(message, 'Not Found');
//      } else if (errorType === 'Conflict') {
//        MessageManager.notify.warning(message, errorType);
//      } else {
//        MessageManager.notify.error(message, errorType);
//      }
//      return;
//    }

//    // Server errors (500+)
//    if (statusCode >= 500) {
//      MessageManager.alert.error(
//        'Server Error',
//        message + (error.Details ? '<br><small>' + error.Details + '</small>' : '')
//      );
//      return;
//    }

//    // Default error handling
//    MessageManager.notify.error(message);
//  }

//  /**
//   * Retry logic with exponential backoff (enterprise-level)
//   * @param {function} requestFn - Request function to retry
//   * @param {number} retries - Number of retries
//   * @returns {Promise<any>} Request result
//   */
//  async function _withRetry(requestFn, retries) {
//    const maxRetries = retries !== undefined ? retries : _config.maxRetries;
//    let lastError;

//    for (let attempt = 0; attempt <= maxRetries; attempt++) {
//      try {
//        return await requestFn();
//      } catch (error) {
//        lastError = error;

//        // Use ApiErrorHandler to check if error is retryable
//        if (typeof ApiErrorHandler !== 'undefined') {
//          const errorType = ApiErrorHandler.getErrorType(error);
//          const isRetryable = ApiErrorHandler.isRetryable(errorType);

//          if (!isRetryable) {
//            console.log(`[ApiCallManager] Error type ${errorType} is not retryable, throwing immediately`);
//            throw error;
//          }

//          if (attempt < maxRetries) {
//            const delay = ApiErrorHandler.getRetryDelay(attempt + 1);
//            console.log(`[ApiCallManager] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms for error type ${errorType}`);
//            await _sleep(delay);
//          }
//        } else {
//          // Fallback: Don't retry on client errors (4xx)
//          const statusCode = error.StatusCode || error.statusCode || 0;
//          if (statusCode >= 400 && statusCode < 500) {
//            console.log(`[ApiCallManager] Client error ${statusCode}, not retrying`);
//            throw error;
//          }

//          if (attempt < maxRetries) {
//            const delay = _config.retryDelay * Math.pow(2, attempt); // Exponential backoff
//            console.log(`[ApiCallManager] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
//            await _sleep(delay);
//          }
//        }
//      }
//    }

//    console.error(`[ApiCallManager] All ${maxRetries} retry attempts failed`);
//    throw lastError;
//  }

//  /**
//  * Handle HTTP Response (matching backend ResponseHelper pattern)
//  * @param {Response} response - Fetch API response
//  * @returns {Promise<object>}
//  */
//  async function _handleHttpResponse(response) {
//    debugger;
//    let data;
//    console.log(response);
//    try {
//      data = await response.json();
//      console.log(data);
//    } catch (e) {
//      // If JSON parsing fails, create error object
//      data = {
//        IsSuccess: false,
//        StatusCode: response.status,
//        Message: response.statusText || 'Unknown error',
//        ErrorType: 'ParseError'
//      };
//    }

//    // Success responses (200-299)
//    if (response.ok) {
//      // Backend always returns { IsSuccess, StatusCode, Message, Data }
//      if (data.IsSuccess === true) {
//        return data; // Return full response for flexibility
//      }
//      // Fallback if backend doesn't follow standard
//      return {
//        IsSuccess: true,
//        StatusCode: response.status,
//        Message: 'Success',
//        Data: data
//      };
//    }

//    // Error responses (400+)
//    throw {
//      IsSuccess: false,
//      StatusCode: data.StatusCode || response.status,
//      Message: data.Message || response.statusText,
//      ErrorType: data.ErrorType || _getErrorType(response.status),
//      Details: data.Details || null,
//      ValidationErrors: data.ValidationErrors || null,
//      CorrelationId: data.CorrelationId || null
//    };
//  }


//  // ============================================
//  // PRIVATE - Request Builder
//  // ============================================


//  // ============================================
//  // PUBLIC - Core HTTP Methods
//  // ============================================

//  /**
//   * GET Request With Refresh Token
//   * @param {string} baseUrl - Base API url
//   * @param {string} endpoint - API endpoint
//   * @param {object} options - Request options
//   * @param {object} options.params - Query parameters
//   * @param {boolean} options.retry - Enable retry (default: true)
//   * @param {number} options.maxRetries - Max retry attempts
//   * @param {AbortSignal} options.signal - Abort signal
//   * @returns {Promise<*>} Response data
//   * 
//   * @example
//   * const users = await ApiCallManager.get('/crm-course-ddl');
//   * const filtered = await ApiCallManager.get('/users', { params: { status: 'active' } });
//   */
//  async function getWithRefreshToken(endpoint, options) {
//    options = _prepareRequestOptions(options);

//    return await _executeWithTokenRefresh(async function () {
//      try {
//        // Build query string if params provided
//        let url = endpoint;
//        if (options?.params) {
//          const queryString = new URLSearchParams(options.params).toString();
//          url = endpoint.includes('?') ? `${endpoint}&${queryString}` : `${endpoint}?${queryString}`;
//        }

//        const response = await _executeRequest('GET', url, null, options);
//        return response.Data;
//      } catch (error) {
//        _handleError(error);
//        throw error;
//      }
//    }, options);
//  }

//  /**
//   * POST Request
//   * @param {string} endpoint - API endpoint
//   * @param {object|FormData} data - Request payload
//   * @param {object} options - Request options
//   * @returns {Promise<*>} Response data
//   * 
//   * @example
//   * const newCourse = await ApiCallManager.post('/crm-course', courseData);
//   */
//  async function postWithRefreshToken(endpoint, data, options) {
//    options = _prepareRequestOptions(options);

//    return await _executeWithTokenRefresh(async function () {
//      try {
//        const response = await _executeRequest('POST', endpoint, data, options);
//        return response.Data;
//      } catch (error) {
//        _handleError(error);
//        throw error;
//      }
//    }, options);
//  }

//  /**
//   * PUT Request
//   * @param {string} endpoint - API endpoint
//   * @param {object|FormData} data - Request payload
//   * @param {object} options - Request options
//   * @returns {Promise<*>} Response data
//   * 
//   * @example
//   * const updated = await ApiCallManager.put('/crm-course/123', courseData);
//   */
//  async function putWithRefreshToken(endpoint, data, options) {
//    options = _prepareRequestOptions(options);

//    return await _executeWithTokenRefresh(async function () {
//      try {
//        const response = await _executeRequest('PUT', endpoint, data, options);
//        return response.Data;
//      } catch (error) {
//        _handleError(error);
//        throw error;
//      }
//    }, options);
//  }

//  /**
//   * DELETE Request
//   * @param {string} endpoint - API endpoint
//   * @param {object} options - Request options
//   * @returns {Promise<*>} Response data
//   * 
//   * @example
//   * await ApiCallManager.delete('/crm-course/123');
//   */
//  async function deleteWithRefreshToken(endpoint, options) {
//    options = _prepareRequestOptions(options);

//    return await _executeWithTokenRefresh(async function () {
//      try {
//        const response = await _executeRequest('DELETE', endpoint, null, options);
//        return response.Data;
//      } catch (error) {
//        _handleError(error);
//        throw error;
//      }
//    }, options);
//  }

//  /**
//   * PATCH Request
//   * @param {string} endpoint - API endpoint
//   * @param {object} data - Request payload
//   * @param {object} options - Request options
//   * @returns {Promise<*>} Response data
//   */
//  async function patchWithRefreshToken(endpoint, data, options) {
//    options = _prepareRequestOptions(options);

//    return await _executeWithTokenRefresh(async function () {
//      try {
//        const response = await _executeRequest('PATCH', endpoint, data, options);
//        return response.Data;
//      } catch (error) {
//        _handleError(error);
//        throw error;
//      }
//    }, options);
//  }



//  /**
//     * Refresh access token using refresh token cookie
//     * @returns {Promise<boolean>} Success status
//     */
//  async function refreshToken() {
//    try {
//      debugger;
//      console.log('[ApiCallManager]  Refreshing token...');

//      // Check if refresh token expired
//      if (typeof StorageManager !== 'undefined') {
//        if (StorageManager.isRefreshTokenExpired()) {
//          console.error('[ApiCallManager]  Refresh token expired');
//          return false;
//        }
//      }

//      // Use existing _executeRequest infrastructure
//      var response = await _executeRequest(
//        'POST',
//        AppConfig.endpoints.refreshToken || '/refresh-token',
//        null,  // No body needed
//        {
//          retry: false,  // Don't retry refresh calls
//          skipTokenRefresh: true  // CRITICAL: Prevent infinite loop!
//        }
//      );

//      // Response format: { IsSuccess: true, Data: { AccessToken, ExpiresIn, ... } }
//      if (!response.Data) {
//        throw new Error('Invalid refresh response');
//      }

//      // Store new access token
//      if (typeof StorageManager !== 'undefined') {
//        StorageManager.setTokens(response.Data);
//      }

//      console.log('[ApiCallManager] Token refreshed successfully');
//      return true;

//    } catch (error) {
//      console.error('[ApiCallManager] Token refresh failed:', error);

//      // Don't call _handleError here to avoid showing error to user
//      // Let the caller handle it
//      return false;
//    }
//  }



//  /**
//   * GET Request
//   * @param {string} endpoint - API endpoint
//   * @param {object} options - Request options
//   * @param {object} options.params - Query parameters
//   * @param {boolean} options.retry - Enable retry (default: true)
//   * @param {number} options.maxRetries - Max retry attempts
//   * @param {AbortSignal} options.signal - Abort signal
//   * @returns {Promise<*>} Response data
//   * 
//   * @example
//   * const users = await ApiCallManager.get('/crm-course-ddl');
//   * const filtered = await ApiCallManager.get('/users', { params: { status: 'active' } });
//   */
//  async function get(endpoint, options) {
//    try {
//      // Build query string if params provided
//      let url = endpoint;
//      if (options?.params) {
//        const queryString = new URLSearchParams(options.params).toString();
//        url = endpoint.includes('?') ? `${endpoint}&${queryString}` : `${endpoint}?${queryString}`;
//      }

//      const response = await _executeRequest('GET', url, null, options);

//      // Return only Data field for cleaner API (matching backend pattern)
//      return response.Data;
//    } catch (error) {
//      _handleError(error);
//      throw error;
//    }
//  }

//  /**
//   * POST Request
//   * @param {string} endpoint - API endpoint
//   * @param {object|FormData} data - Request payload
//   * @param {object} options - Request options
//   * @returns {Promise<*>} Response data
//   * 
//   * @example
//   * const newCourse = await ApiCallManager.post('/crm-course', courseData);
//   */
//  async function post(endpoint, data, options) {
//    try {
//      const response = await _executeRequest('POST', endpoint, data, options);
//      return response.Data;
//    } catch (error) {
//      _handleError(error);
//      throw error;
//    }
//  }

//  /**
//   * PUT Request
//   * @param {string} endpoint - API endpoint
//   * @param {object|FormData} data - Request payload
//   * @param {object} options - Request options
//   * @returns {Promise<*>} Response data
//   * 
//   * @example
//   * const updated = await ApiCallManager.put('/crm-course/123', courseData);
//   */
//  async function put(endpoint, data, options) {
//    try {
//      const response = await _executeRequest('PUT', endpoint, data, options);
//      return response.Data;
//    } catch (error) {
//      _handleError(error);
//      throw error;
//    }
//  }

//  /**
//   * DELETE Request
//   * @param {string} endpoint - API endpoint
//   * @param {object} options - Request options
//   * @returns {Promise<*>} Response data
//   * 
//   * @example
//   * await ApiCallManager.delete('/crm-course/123');
//   */
//  async function deleteRequest(endpoint, options) {
//    try {
//      const response = await _executeRequest('DELETE', endpoint, null, options);
//      return response.Data;
//    } catch (error) {
//      _handleError(error);
//      throw error;
//    }
//  }

//  /**
//   * PATCH Request
//   * @param {string} endpoint - API endpoint
//   * @param {object} data - Request payload
//   * @param {object} options - Request options
//   * @returns {Promise<*>} Response data
//   */
//  async function patch(endpoint, data, options) {
//    try {
//      const response = await _executeRequest('PATCH', endpoint, data, options);
//      return response.Data;
//    } catch (error) {
//      _handleError(error);
//      throw error;
//    }
//  }


//  // ================================================================
//  // PUBLIC - Grid-Specific Method (matching CRMGridOptions)
//  // ================================================================
//  /**
//   * POST for Kendo Grid (matching backend CRMGridOptions pattern)
//   * @param {string} endpoint - API endpoint (e.g., '/crm-course-summary')
//   * @param {object} gridOptions - Grid options
//   * @returns {Promise<{Items: Array, TotalCount: number}>}
//   * 
//   * @example
//   * const gridData = await ApiCallManager.postForGrid('/crm-course-summary', {
//   *   skip: 0,
//   *   take: 20,
//   *   page: 1,
//   *   pageSize: 20,
//   *   sort: null,
//   *   filter: null
//   * });
//   */
//   async function postForGrid(endpoint, gridOptions) {
//    try {
//      const requestPayload = {
//        Skip: gridOptions.skip || 0,
//        Take: gridOptions.take || gridOptions.pageSize || 20,
//        Page: gridOptions.page || 1,
//        PageSize: gridOptions.pageSize || 20,
//        Sort: gridOptions.sort || null,
//        Filter: gridOptions.filter || null
//      };

//      const response = await _executeRequest('POST', endpoint, requestPayload, { retry: false });

//      // Return Data which should contain { Items: [], TotalCount: 0 }
//      return response.Data;
//    } catch (error) {
//      _handleError(error);
//      throw error;
//    }
//  }

//  // ============================================
//  // PUBLIC - Specialized Methods
//  // ============================================

//  /**
//   * Upload file with FormData
//   * @param {string} endpoint - API endpoint
//   * @param {File} file - File to upload
//   * @param {object} additionalData - Additional form fields
//   * @param {object} options - Request options
//   * @returns {Promise<*>} Response data
//   * 
//   * @example
//   * const result = await ApiCallManager.uploadFile('/upload', fileInput.files[0], {
//   *   category: 'documents'
//   * });
//   */
//   async function uploadFile(endpoint, file, additionalData, options) {
//    try {
//      const formData = new FormData();
//      formData.append('file', file);

//      // Add additional fields
//      if (additionalData) {
//        Object.keys(additionalData).forEach(key => {
//          formData.append(key, additionalData[key]);
//        });
//      }

//      const response = await _executeRequest('POST', endpoint, formData, {
//        ...options,
//        loadingMessage: options?.loadingMessage || 'Uploading file...'
//      });

//      return response.Data;
//    } catch (error) {
//      _handleError(error);
//      throw error;
//    }
//  }

//  /**
//   * Convert nested object with files to FormData (for complex forms like CRM Application)
//   * @param {object} obj - Nested object
//   * @param {FormData} formData - Existing FormData (optional)
//   * @param {string} prefix - Field prefix (optional)
//   * @returns {FormData}
//   * 
//   * @example
//   * const formData = ApiCallManager.convertToFormData(applicationData);
//   * await ApiCallManager.post('/crm-application', formData);
//   */
//  function convertToFormData(obj, formData, prefix) {
//    if (!formData) {
//      formData = new FormData();
//    }

//    for (const key in obj) {
//      if (!obj.hasOwnProperty(key)) continue;

//      const value = obj[key];
//      const fieldName = prefix ? `${prefix}.${key}` : key;

//      if (value === null || value === undefined) {
//        continue;
//      }

//      // Handle File objects
//      if (value instanceof File) {
//        formData.append(fieldName, value);
//      }
//      // Handle Arrays
//      else if (Array.isArray(value)) {
//        value.forEach((item, index) => {
//          if (item instanceof File) {
//            formData.append(`${fieldName}[${index}]`, item);
//          } else if (typeof item === 'object' && item !== null) {
//            convertToFormData(item, formData, `${fieldName}[${index}]`);
//          } else {
//            formData.append(`${fieldName}[${index}]`, item);
//          }
//        });
//      }
//      // Handle Date objects
//      else if (value instanceof Date) {
//        formData.append(fieldName, value.toISOString());
//      }
//      // Handle nested objects
//      else if (typeof value === 'object' && !(value instanceof File)) {
//        convertToFormData(value, formData, fieldName);
//      }
//      // Handle primitive values
//      else {
//        formData.append(fieldName, value.toString());
//      }
//    }

//    return formData;
//  }

//  /**
//   * Batch requests (parallel execution)
//   * @param {Array<{method, endpoint, data}>} requests - Array of requests
//   * @returns {Promise<Array<{success, data, error}>>}
//   * 
//   * @example
//   * const results = await ApiCallManager.batch([
//   *   { method: 'GET', endpoint: '/countryddl' },
//   *   { method: 'GET', endpoint: '/currencyddl' }
//   * ]);
//   */
//  async function batch(requests) {
//    const promises = requests.map(req => {
//      const method = (req.method || 'GET').toLowerCase();
//      const apiFn = this[method] || this.get;

//      return apiFn.call(this, req.endpoint, req.data, req.options)
//        .then(data => ({ success: true, data, error: null }))
//        .catch(error => ({ success: false, data: null, error }));
//    });

//    return Promise.all(promises);
//  }

//  /**
//   * Manual retry wrapper
//   * @param {Function} requestFn - Request function
//   * @param {number} maxRetries - Max retry attempts
//   * @returns {Promise<*>}
//   * 
//   * @example
//   * const data = await ApiCallManager.withRetry(
//   *   () => ApiCallManager.get('/unstable-endpoint'),
//   *   3
//   * );
//   */
//  async function withRetry(requestFn, maxRetries) {
//    return await _withRetry(requestFn, maxRetries);
//  }

//  // ============================================
//  // PUBLIC - Configuration
//  // ============================================

//  /**
//   * Get current configuration
//   */
//  function getConfig() {
//    return Object.assign({}, _config);
//  }

//  /**
//   * Update configuration
//   * @param {object} newConfig - New configuration
//   * 
//   * @example
//   * ApiCallManager.setConfig({
//   *   showErrorNotifications: false,
//   *   maxRetries: 5
//   * });
//   */
//  function setConfig(newConfig) {
//    if (newConfig && typeof newConfig === 'object') {
//      Object.assign(_config, newConfig);
//    }
//  }

//  // ============================================
//  // PUBLIC - Utilities
//  // ============================================

//  /**
//   * Get base API URL
//   */
//  function getBaseUrl() {
//    return _getBaseUrl();
//  }

//  /**
//   * Check if ready
//   */
//  function isReady() {
//    return !!_getBaseUrl();
//  }

//  /**
//   * Get version info
//   */
//  function getInfo() {
//    return {
//      name: 'ApiCallManager',
//      version: '2.0.0',
//      author: 'devSakhawat',
//      date: '2025-01-13',
//      baseUrl: _getBaseUrl(),
//      ready: isReady(),
//      config: getConfig(),
//      backendPattern: 'ResponseHelper.cs'
//    };
//  }

//  // ============================================
//  // PRIVATE - Request Interceptor (Updated)
//  // ============================================


//  /**
//   * Build fetch request
//   */
//  async function _buildRequest(method, endpoint, data, options) {
//    const baseUrl = _getBaseUrl();
//    const url = baseUrl + endpoint;
//    const token = _getToken();

//    const requestOptions = {
//      method: method.toUpperCase(),
//      headers: {
//        'Authorization': token ? 'Bearer ' + token : ''
//      },
//      signal: options?.signal,
//      // enable cookies
//      credentials: 'include'
//    };

//    // Handle body data
//    if (data) {
//      if (data instanceof FormData) {
//        // For FormData, don't set Content-Type (browser will set it with boundary)
//        requestOptions.body = data;
//      } else {
//        // For JSON
//        requestOptions.headers['Content-Type'] = 'application/json';
//        requestOptions.body = JSON.stringify(data);
//      }
//    }

//    // Merge custom headers
//    if (options?.headers) {
//      Object.assign(requestOptions.headers, options.headers);
//    }

//    return { url, requestOptions };
//  }

//  /**
//   * Prepare request options
//   * @param {object} options - User-provided options
//   * @returns {object} Prepared options
//   */
//  function _prepareRequestOptions(options) {
//    var defaultOptions = {
//      retry: true,
//      maxRetries: 3,
//      retryDelay: 1000,
//      timeout: 30000,
//      showLoadingIndicator: false,
//      showErrorNotifications: true,
//      skipTokenRefresh: false,
//      params: {}
//    };

//    return Object.assign({}, defaultOptions, options || {});
//  }

//  /**
// * Execute request with retry and loading
// */
//  async function _executeRequest(method, endpoint, data, options) {
//    const requestFn = async () => {
//      const { url, requestOptions } = await _buildRequest(method, endpoint, data, options);
//      const response = await fetch(url, requestOptions);
//      return await _handleHttpResponse(response);
//    };

//    // Wrap with retry if enabled
//    const executeWithRetry = options?.retry !== false
//      ? () => _withRetry(requestFn, options?.maxRetries)
//      : requestFn;

//    // Wrap with loading indicator if enabled
//    if (_config.showLoadingForRequests && typeof MessageManager !== 'undefined') {
//      return await MessageManager.loading.wrap(
//        executeWithRetry(),
//        options?.loadingMessage || 'Processing...'
//      );
//    }

//    return await executeWithRetry();
//  }


//  /**
// * Execute API call with automatic token refresh
// * 
// * Flow:
// * 1. Check if token is expired or expiring soon
// * 2. If yes, refresh token first
// * 3. Execute API call
// * 4. If 401 error, refresh and retry once
// * 5. Handle refresh failures gracefully
// * 
// * @param {Function} apiCall - The actual API call function
// * @param {object} options - Request options
// * @param {boolean} options.skipTokenRefresh - Skip token refresh logic
// * @returns {Promise}
// */
//  async function _executeWithTokenRefresh(apiCall, options) {
//    // Skip if disabled
//    if (options.skipTokenRefresh) {
//      return await apiCall();
//    }

//    // Check dependencies
//    if (typeof StorageManager === 'undefined' || typeof TokenManager === 'undefined') {
//      return await apiCall();
//    }

//    try {
//      // ============================================
//      // PHASE 1: Pre-flight Check
//      // ============================================

//      var isExpired = StorageManager.isAccessTokenExpired();
//      var shouldRefresh = StorageManager.shouldRefreshAccessToken(60);

//      if (isExpired || shouldRefresh) {
//        console.log('[ApiCallManager] Token expired/expiring, refreshing...');

//        // Check if refresh token (cookie) is still valid
//        if (StorageManager.isRefreshTokenExpired()) {
//          console.error('[ApiCallManager] Refresh token expired');
//          _handleSessionExpired();
//          throw new Error('Session expired');
//        }

//        // Call refresh endpoint
//        // → Browser automatically sends refresh token cookie
//        // → Backend validates cookie
//        // → Returns new access token
//        // → StorageManager stores new access token
//        var refreshSuccess = await TokenManager.refreshToken();

//        if (!refreshSuccess) {
//          console.error('[ApiCallManager] Refresh failed');
//          throw new Error('Token refresh failed');
//        }

//        console.log('[ApiCallManager] Token refreshed');
//      }

//      // ============================================
//      // PHASE 2: Execute API Call
//      // ============================================

//      return await apiCall();

//    } catch (error) {
//      // ============================================
//      // PHASE 3: Handle 401 Error
//      // ============================================

//      var is401Error = (
//        error.StatusCode === 401 ||
//        error.statusCode === 401 ||
//        error.status === 401
//      );

//      if (is401Error && !options.skipTokenRefresh && !options._retryAttempted) {
//        console.log('[ApiCallManager] Got 401, refreshing token...');

//        // Check if refresh token cookie is still valid
//        if (StorageManager.isRefreshTokenExpired()) {
//          console.error('[ApiCallManager] Refresh token expired');
//          _handleSessionExpired();
//          throw error;
//        }

//        // Attempt refresh
//        // → Hit /auth/refresh-token
//        // → Cookie sent automatically
//        var refreshSuccess = await TokenManager.refreshToken();

//        if (refreshSuccess) {
//          console.log('[ApiCallManager]  Refreshed, retrying...');

//          // Retry with new token
//          var retryOptions = Object.assign({}, options, { _retryAttempted: true });
//          return await _executeWithTokenRefresh(apiCall, retryOptions);
//        } else {
//          _handleSessionExpired();
//        }
//      }

//      throw error;
//    }
//  }

//  /**
//   * Handle session expiry
//   * @private
//   */
//  function _handleSessionExpired() {
//    console.error('[ApiCallManager] Session expired, cleaning up...');

//    // Stop auto-refresh
//    if (typeof TokenManager !== 'undefined') {
//      TokenManager.stopAutoRefresh();
//    }

//    // Clear storage
//    if (typeof StorageManager !== 'undefined') {
//      StorageManager.clearAll();
//    }

//    // Notify user
//    if (typeof MessageManager !== 'undefined') {
//      MessageManager.alert.warning(
//        'Session Expired',
//        'Your session has expired. Please log in again.',
//        function () {
//          _redirectToLogin();
//        }
//      );
//    } else {
//      alert('Session Expired\n\nYour session has expired. Please log in again.');
//      _redirectToLogin();
//    }
//  }


//  /**
//   * Redirect to login page
//   * @private
//   */
//  function _redirectToLogin() {
//    var loginUrl = (typeof AppConfig !== 'undefined' && AppConfig.getUiUrl)
//      ? AppConfig.getUiUrl() + '/Home/Login'
//      : (typeof baseUI !== 'undefined' ? baseUI + '/Home/Login' : '/Home/Login');

//    window.location.href = loginUrl;
//  }

// // /**
// //* Execute API call with token refresh support
// //* @param {Function} apiCall - The actual API call function
// //* @param {object} options - Request options
// //* @returns {Promise}
// //*/
// // async function _executeWithTokenRefresh(apiCall, options) {
// //   try {
// //     // Check if token refresh is needed (and not skipped)
// //     if (!options.skipTokenRefresh && typeof StorageManager !== 'undefined') {
// //       if (StorageManager.isAccessTokenExpired() && !StorageManager.isRefreshTokenExpired()) {

// //         if (typeof TokenManager !== 'undefined') {
// //           var refreshSuccess = await TokenManager.refreshToken();

// //           if (!refreshSuccess) {
// //             throw new Error('Token refresh failed');
// //           }
// //         }
// //       }
// //     }

// //     // Execute the API call
// //     return await apiCall();

// //   } catch (error) {
// //     // If 401 Unauthorized, try to refresh token
// //     if (error.status === 401 && !options.skipTokenRefresh) {

// //       if (typeof TokenManager !== 'undefined') {
// //         var refreshSuccess = await TokenManager.refreshToken();

// //         if (refreshSuccess) {
// //           // Retry the original request
// //           return await apiCall();
// //         }
// //       }
// //     }

// //     throw error;
// //   }
// // }


//  // ============================================
//  // PUBLIC API
//  // ============================================

//  return {
//    // Core HTTP Methods
//    get: get,
//    post: post,
//    put: put,
//    delete: deleteRequest,
//    patch: patch,

//    // Core HTTP Methods (with token refresh) 
//    getWithRefreshToken: getWithRefreshToken,
//    postWithRefreshToken: postWithRefreshToken,
//    putWithRefreshToken: putWithRefreshToken,
//    deleteWithRefreshToken: deleteWithRefreshToken,
//    patchWithRefreshToken: patchWithRefreshToken,

//    // Grid Methods
//    postForGrid: postForGrid,
//    createGridDataSource: createGridDataSource,

//    // Refresh token method
//    refreshToken: refreshToken,

//    // Specialized Methods
//    uploadFile: uploadFile,
//    convertToFormData: convertToFormData,
//    batch: batch,
//    withRetry: withRetry,

//    // Configuration
//    getConfig: getConfig,
//    setConfig: setConfig,

//    // Utilities
//    getBaseUrl: getBaseUrl,
//    isReady: isReady,
//    getInfo: getInfo,

//    // prevent this because of when apimanager call get, post, put, delete, put then it cover error autometically.
//    //handleError: _handleError
//  };
//})();


//// ============================================
//// Auto-initialization Check
//// ============================================
////(function () {
////  if (!ApiCallManager.isReady()) {
////    console.error(
////      '%c[ApiCallManager] ERROR: Base API URL not configured!',
////      'color: red; font-weight: bold; font-size: 14px;'
////    );
////  } else {
////    console.log(
////      '%c[ApiCallManager] ✓ Loaded successfully',
////      'color: #4CAF50; font-weight: bold; font-size: 12px;'
////    );

////    if (typeof console !== 'undefined' && console.table) {
////      console.table(ApiCallManager.getInfo());
////    }
////  }
////})();