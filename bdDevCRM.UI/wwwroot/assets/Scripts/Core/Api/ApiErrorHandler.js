/*=========================================================
 * API Error Handler - Enterprise Level
 * File: ApiErrorHandler.js
 * Description: Comprehensive API error handling with classification, logging, and user messaging
 * Dependencies: AppConfig, MessageManager
 * Author: devSakhawat
 * Date: 2025-02-28
=========================================================*/

var ApiErrorHandler = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Error Types Classification
  // ============================================

  var ErrorType = {
    // Network & Connection
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    CORS_ERROR: 'CORS_ERROR',
    CONNECTION_REFUSED: 'CONNECTION_REFUSED',
    DNS_ERROR: 'DNS_ERROR',

    // HTTP Status Codes
    BAD_REQUEST: 'BAD_REQUEST',              // 400
    UNAUTHORIZED: 'UNAUTHORIZED',            // 401
    FORBIDDEN: 'FORBIDDEN',                  // 403
    NOT_FOUND: 'NOT_FOUND',                  // 404
    CONFLICT: 'CONFLICT',                    // 409
    VALIDATION_ERROR: 'VALIDATION_ERROR',    // 422
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS', // 429

    // Server Errors
    SERVER_ERROR: 'SERVER_ERROR',            // 500
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE', // 503
    GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',      // 504

    // Application Errors
    PARSE_ERROR: 'PARSE_ERROR',
    BUSINESS_ERROR: 'BUSINESS_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  };

  // ============================================
  // PRIVATE - Configuration
  // ============================================

  var _config = {
    // Logging
    enableConsoleLog: true,
    enableRemoteLog: false,
    logLevel: 'error', // 'all', 'error', 'none'

    // User Notifications
    showUserMessages: true,
    autoCloseSuccessNotifications: true,
    errorNotificationDuration: 0, // 0 = don't auto-close

    // Retry Configuration
    retryableErrors: [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.SERVICE_UNAVAILABLE,
      ErrorType.GATEWAY_TIMEOUT
    ],
    maxRetryAttempts: 3,
    retryDelay: 1000,

    // Error Correlation
    enableCorrelationId: true,
    correlationIdHeader: 'X-Correlation-ID',

    // Circuit Breaker
    circuitBreakerEnabled: false,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000
  };

  // ============================================
  // PRIVATE - State Management
  // ============================================

  var _state = {
    errorHistory: [],
    errorCount: {},
    circuitBreakerOpen: false,
    circuitBreakerOpenTime: null,
    correlationIdCounter: 0
  };

  // ============================================
  // PRIVATE - Error Classification
  // ============================================

  /**
   * Classify error and determine error type
   * @param {object} error - Error object
   * @returns {string} ErrorType constant
   */
  function _classifyError(error) {
    // Check if it's a network error
    if (!error.response && error.request) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return ErrorType.TIMEOUT_ERROR;
      }
      if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
        return ErrorType.NETWORK_ERROR;
      }
      if (error.message.includes('CORS')) {
        return ErrorType.CORS_ERROR;
      }
      if (error.message.includes('ECONNREFUSED')) {
        return ErrorType.CONNECTION_REFUSED;
      }
      if (error.message.includes('ENOTFOUND')) {
        return ErrorType.DNS_ERROR;
      }
      return ErrorType.NETWORK_ERROR;
    }

    // Check HTTP status code
    var statusCode = error.StatusCode || error.statusCode || error?.response?.status;

    if (statusCode) {
      switch (statusCode) {
        case 400: return ErrorType.BAD_REQUEST;
        case 401: return ErrorType.UNAUTHORIZED;
        case 403: return ErrorType.FORBIDDEN;
        case 404: return ErrorType.NOT_FOUND;
        case 409: return ErrorType.CONFLICT;
        case 422: return ErrorType.VALIDATION_ERROR;
        case 429: return ErrorType.TOO_MANY_REQUESTS;
        case 500: return ErrorType.SERVER_ERROR;
        case 503: return ErrorType.SERVICE_UNAVAILABLE;
        case 504: return ErrorType.GATEWAY_TIMEOUT;
        default:
          if (statusCode >= 400 && statusCode < 500) {
            return ErrorType.BAD_REQUEST;
          }
          if (statusCode >= 500) {
            return ErrorType.SERVER_ERROR;
          }
      }
    }

    // Check error type from backend
    var errorType = error.ErrorType || error.errorType;
    if (errorType) {
      switch (errorType.toLowerCase()) {
        case 'unauthorized': return ErrorType.UNAUTHORIZED;
        case 'forbidden': return ErrorType.FORBIDDEN;
        case 'validation': return ErrorType.VALIDATION_ERROR;
        case 'notfound': return ErrorType.NOT_FOUND;
        case 'conflict': return ErrorType.CONFLICT;
        case 'business': return ErrorType.BUSINESS_ERROR;
        default: break;
      }
    }

    return ErrorType.UNKNOWN_ERROR;
  }

  // ============================================
  // PRIVATE - Error Message Mapping
  // ============================================

  /**
   * Get user-friendly error message
   * @param {string} errorType - Error type
   * @param {object} error - Original error object
   * @returns {object} { title, message }
   */
  function _getUserFriendlyMessage(errorType, error) {
    var messages = {
      [ErrorType.NETWORK_ERROR]: {
        title: 'Network Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.'
      },
      [ErrorType.TIMEOUT_ERROR]: {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.'
      },
      [ErrorType.CORS_ERROR]: {
        title: 'Cross-Origin Error',
        message: 'Unable to access the resource due to security restrictions.'
      },
      [ErrorType.CONNECTION_REFUSED]: {
        title: 'Connection Refused',
        message: 'The server refused the connection. Please contact support if this persists.'
      },
      [ErrorType.DNS_ERROR]: {
        title: 'Server Not Found',
        message: 'Unable to locate the server. Please check your connection.'
      },
      [ErrorType.UNAUTHORIZED]: {
        title: 'Authentication Required',
        message: 'Your session has expired. Please login again to continue.'
      },
      [ErrorType.FORBIDDEN]: {
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.'
      },
      [ErrorType.NOT_FOUND]: {
        title: 'Resource Not Found',
        message: 'The requested resource could not be found.'
      },
      [ErrorType.CONFLICT]: {
        title: 'Conflict Error',
        message: 'The operation conflicts with existing data. Please refresh and try again.'
      },
      [ErrorType.VALIDATION_ERROR]: {
        title: 'Validation Error',
        message: 'Please correct the following errors and try again.'
      },
      [ErrorType.TOO_MANY_REQUESTS]: {
        title: 'Too Many Requests',
        message: 'You have made too many requests. Please wait a moment and try again.'
      },
      [ErrorType.SERVER_ERROR]: {
        title: 'Server Error',
        message: 'An unexpected error occurred on the server. Please try again later.'
      },
      [ErrorType.SERVICE_UNAVAILABLE]: {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again in a few moments.'
      },
      [ErrorType.GATEWAY_TIMEOUT]: {
        title: 'Gateway Timeout',
        message: 'The server took too long to respond. Please try again.'
      },
      [ErrorType.PARSE_ERROR]: {
        title: 'Data Parse Error',
        message: 'Unable to process the server response.'
      },
      [ErrorType.BUSINESS_ERROR]: {
        title: 'Business Rule Violation',
        message: error.Message || error.message || 'Operation failed due to business rule validation.'
      },
      [ErrorType.UNKNOWN_ERROR]: {
        title: 'Unknown Error',
        message: 'An unexpected error occurred. Please try again or contact support.'
      }
    };

    var defaultMessage = messages[errorType] || messages[ErrorType.UNKNOWN_ERROR];

    // Override with backend message if available
    var backendMessage = error.Message || error.message;
    if (backendMessage && errorType !== ErrorType.NETWORK_ERROR && errorType !== ErrorType.TIMEOUT_ERROR) {
      defaultMessage.message = backendMessage;
    }

    return defaultMessage;
  }

  // ============================================
  // PRIVATE - Error Parsing
  // ============================================

  /**
   * Parse error object into standardized format
   * @param {object} error - Raw error object
   * @returns {object} Standardized error
   */
  function _parseError(error) {
    var parsedError = {
      correlationId: _generateCorrelationId(),
      timestamp: new Date().toISOString(),
      errorType: _classifyError(error),
      statusCode: error.StatusCode || error.statusCode || error?.response?.status || 0,
      message: error.Message || error.message || 'Unknown error',
      details: error.Details || error.details || null,
      validationErrors: error.ValidationErrors || error.validationErrors || null,
      stackTrace: error.stack || error.StackTrace || null,
      endpoint: error.config?.url || error.Endpoint || null,
      method: error.config?.method?.toUpperCase() || error.Method || null,
      requestData: error.config?.data || null,
      originalError: error
    };

    // Format validation errors
    if (parsedError.validationErrors && Array.isArray(parsedError.validationErrors)) {
      parsedError.formattedValidationErrors = _formatValidationErrors(parsedError.validationErrors);
    }

    return parsedError;
  }

  /**
   * Format validation errors for display
   * @param {array} validationErrors - Array of validation errors
   * @returns {string} Formatted HTML string
   */
  function _formatValidationErrors(validationErrors) {
    if (!validationErrors || validationErrors.length === 0) {
      return '';
    }

    var html = '<ul style="text-align: left; margin: 10px 0; padding-left: 20px;">';

    validationErrors.forEach(function (error) {
      var field = error.PropertyName || error.Field || error.field || 'Field';
      var message = error.ErrorMessage || error.Message || error.message || 'Invalid value';
      html += '<li><strong>' + _escapeHtml(field) + ':</strong> ' + _escapeHtml(message) + '</li>';
    });

    html += '</ul>';

    return html;
  }

  // ============================================
  // PRIVATE - Correlation ID
  // ============================================

  /**
   * Generate unique correlation ID for error tracking
   * @returns {string} Correlation ID
   */
  function _generateCorrelationId() {
    if (!_config.enableCorrelationId) {
      return null;
    }

    _state.correlationIdCounter++;
    var timestamp = new Date().getTime();
    var random = Math.random().toString(36).substring(2, 9);

    return 'ERR-' + timestamp + '-' + _state.correlationIdCounter + '-' + random;
  }

  // ============================================
  // PRIVATE - Error Logging
  // ============================================

  /**
   * Log error to console
   * @param {object} parsedError - Parsed error object
   */
  function _logToConsole(parsedError) {
    if (!_config.enableConsoleLog) return;

    var logStyle = 'color: #f44336; font-weight: bold; font-size: 12px;';

    console.group('%c[ApiErrorHandler] Error Logged', logStyle);
    console.log('%cCorrelation ID:', 'font-weight: bold;', parsedError.correlationId);
    console.log('%cError Type:', 'font-weight: bold;', parsedError.errorType);
    console.log('%cStatus Code:', 'font-weight: bold;', parsedError.statusCode);
    console.log('%cMessage:', 'font-weight: bold;', parsedError.message);

    if (parsedError.endpoint) {
      console.log('%cEndpoint:', 'font-weight: bold;', parsedError.method + ' ' + parsedError.endpoint);
    }

    if (parsedError.validationErrors) {
      console.log('%cValidation Errors:', 'font-weight: bold;', parsedError.validationErrors);
    }

    if (parsedError.details) {
      console.log('%cDetails:', 'font-weight: bold;', parsedError.details);
    }

    if (parsedError.stackTrace) {
      console.log('%cStack Trace:', 'font-weight: bold;', parsedError.stackTrace);
    }

    console.log('%cOriginal Error:', 'font-weight: bold;', parsedError.originalError);
    console.groupEnd();
  }

  /**
   * Log error to remote server (for monitoring)
   * @param {object} parsedError - Parsed error object
   */
  function _logToRemoteServer(parsedError) {
    if (!_config.enableRemoteLog) return;

    try {
      // Prepare log data (exclude sensitive information)
      var logData = {
        correlationId: parsedError.correlationId,
        timestamp: parsedError.timestamp,
        errorType: parsedError.errorType,
        statusCode: parsedError.statusCode,
        message: parsedError.message,
        endpoint: parsedError.endpoint,
        method: parsedError.method,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: AppConfig.getCurrentUserId ? AppConfig.getCurrentUserId() : null
      };

      // Send to logging endpoint (implement as needed)
      // This is a placeholder - replace with actual logging service
      // fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logData)
      // }).catch(function() {
      //   // Silent fail - don't cascade logging errors
      // });

      console.log('[ApiErrorHandler] Remote logging:', logData);
    } catch (e) {
      // Silent fail - don't cascade logging errors
    }
  }

  // ============================================
  // PRIVATE - Error History
  // ============================================

  /**
   * Add error to history for analytics
   * @param {object} parsedError - Parsed error object
   */
  function _addToHistory(parsedError) {
    // Keep last 50 errors
    if (_state.errorHistory.length >= 50) {
      _state.errorHistory.shift();
    }

    _state.errorHistory.push({
      correlationId: parsedError.correlationId,
      timestamp: parsedError.timestamp,
      errorType: parsedError.errorType,
      statusCode: parsedError.statusCode,
      endpoint: parsedError.endpoint
    });

    // Track error count by type
    var errorType = parsedError.errorType;
    _state.errorCount[errorType] = (_state.errorCount[errorType] || 0) + 1;
  }

  // ============================================
  // PRIVATE - Retry Logic
  // ============================================

  /**
   * Check if error is retryable
   * @param {string} errorType - Error type
   * @returns {boolean} True if retryable
   */
  function _isRetryable(errorType) {
    return _config.retryableErrors.indexOf(errorType) !== -1;
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param {number} attemptNumber - Current attempt number
   * @returns {number} Delay in milliseconds
   */
  function _calculateRetryDelay(attemptNumber) {
    return _config.retryDelay * Math.pow(2, attemptNumber - 1);
  }

  // ============================================
  // PRIVATE - User Notifications
  // ============================================

  /**
   * Show error notification to user
   * @param {object} parsedError - Parsed error object
   */
  function _showUserNotification(parsedError) {
    if (!_config.showUserMessages) return;
    if (typeof MessageManager === 'undefined') {
      console.warn('[ApiErrorHandler] MessageManager not found');
      return;
    }

    var userMessage = _getUserFriendlyMessage(parsedError.errorType, parsedError.originalError);
    var fullMessage = userMessage.message;

    // Add validation errors if present
    if (parsedError.formattedValidationErrors) {
      fullMessage += '<br><br>' + parsedError.formattedValidationErrors;
    }

    // Add correlation ID for support
    if (parsedError.correlationId) {
      fullMessage += '<br><br><small style="color: #999;">Error ID: ' + parsedError.correlationId + '</small>';
    }

    // Show appropriate notification based on error type
    switch (parsedError.errorType) {
      case ErrorType.UNAUTHORIZED:
        MessageManager.alert.warning(
          userMessage.title,
          fullMessage,
          function () {
            // Redirect to login
            if (typeof TokenManager !== 'undefined') {
              TokenManager.clearSession();
              TokenManager.redirectToLogin();
            } else {
              window.location.href = AppConfig.getFrontendRoute('login');
            }
          }
        );
        break;

      case ErrorType.FORBIDDEN:
        MessageManager.alert.warning(userMessage.title, fullMessage);
        break;

      case ErrorType.VALIDATION_ERROR:
        MessageManager.notify.warning(fullMessage, userMessage.title, 0);
        break;

      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
      case ErrorType.SERVER_ERROR:
        MessageManager.notify.error(fullMessage, userMessage.title, _config.errorNotificationDuration);
        break;

      default:
        MessageManager.notify.error(fullMessage, userMessage.title, _config.errorNotificationDuration);
    }
  }

  // ============================================
  // PRIVATE - Circuit Breaker
  // ============================================

  /**
   * Check if circuit breaker is open
   * @returns {boolean} True if circuit is open
   */
  function _isCircuitOpen() {
    if (!_config.circuitBreakerEnabled) {
      return false;
    }

    if (_state.circuitBreakerOpen) {
      var timeSinceOpen = Date.now() - _state.circuitBreakerOpenTime;

      if (timeSinceOpen > _config.circuitBreakerTimeout) {
        // Try to close circuit
        _state.circuitBreakerOpen = false;
        _state.circuitBreakerOpenTime = null;
        console.log('[ApiErrorHandler] Circuit breaker closed');
        return false;
      }

      return true;
    }

    return false;
  }

  /**
   * Update circuit breaker state
   * @param {object} parsedError - Parsed error object
   */
  function _updateCircuitBreaker(parsedError) {
    if (!_config.circuitBreakerEnabled) return;

    var recentErrors = _state.errorHistory.filter(function (err) {
      var timeDiff = Date.now() - new Date(err.timestamp).getTime();
      return timeDiff < 60000; // Last minute
    });

    if (recentErrors.length >= _config.circuitBreakerThreshold) {
      _state.circuitBreakerOpen = true;
      _state.circuitBreakerOpenTime = Date.now();
      console.warn('[ApiErrorHandler] Circuit breaker opened due to high error rate');
    }
  }

  // ============================================
  // PRIVATE - Utility Functions
  // ============================================

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function _escapeHtml(text) {
    if (!text) return '';
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function (m) { return map[m]; });
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    /**
     * Handle API error (main entry point)
     * @param {object} error - Error object from API call
     * @param {object} options - Optional configuration
     * @returns {object} Parsed error object
     */
    handleError: function (error, options) {
      options = options || {};

      // Check circuit breaker
      if (_isCircuitOpen() && !options.skipCircuitBreaker) {
        console.warn('[ApiErrorHandler] Circuit breaker is open, request blocked');
        return null;
      }

      // Parse error
      var parsedError = _parseError(error);

      // Log error
      _logToConsole(parsedError);
      _logToRemoteServer(parsedError);

      // Add to history
      _addToHistory(parsedError);

      // Update circuit breaker
      _updateCircuitBreaker(parsedError);

      // Show user notification
      if (options.showNotification !== false) {
        _showUserNotification(parsedError);
      }

      return parsedError;
    },

    /**
     * Check if error type is retryable
     * @param {string} errorType - Error type
     * @returns {boolean} True if retryable
     */
    isRetryable: function (errorType) {
      return _isRetryable(errorType);
    },

    /**
     * Get retry delay for attempt
     * @param {number} attemptNumber - Attempt number
     * @returns {number} Delay in milliseconds
     */
    getRetryDelay: function (attemptNumber) {
      return _calculateRetryDelay(attemptNumber);
    },

    /**
     * Parse error without handling
     * @param {object} error - Error object
     * @returns {object} Parsed error
     */
    parseError: function (error) {
      return _parseError(error);
    },

    /**
     * Get error type from error object
     * @param {object} error - Error object
     * @returns {string} Error type
     */
    getErrorType: function (error) {
      return _classifyError(error);
    },

    /**
     * Get user-friendly message
     * @param {object} error - Error object
     * @returns {object} { title, message }
     */
    getUserFriendlyMessage: function (error) {
      var errorType = _classifyError(error);
      return _getUserFriendlyMessage(errorType, error);
    },

    /**
     * Get error history
     * @returns {array} Array of recent errors
     */
    getErrorHistory: function () {
      return _state.errorHistory.slice();
    },

    /**
     * Get error statistics
     * @returns {object} Error count by type
     */
    getErrorStatistics: function () {
      return Object.assign({}, _state.errorCount);
    },

    /**
     * Clear error history
     */
    clearHistory: function () {
      _state.errorHistory = [];
      _state.errorCount = {};
    },

    /**
     * Update configuration
     * @param {object} newConfig - Configuration updates
     */
    setConfig: function (newConfig) {
      if (newConfig && typeof newConfig === 'object') {
        Object.assign(_config, newConfig);
      }
    },

    /**
     * Get current configuration
     * @returns {object} Current configuration
     */
    getConfig: function () {
      return Object.assign({}, _config);
    },

    /**
     * Check if circuit breaker is open
     * @returns {boolean} True if open
     */
    isCircuitOpen: function () {
      return _isCircuitOpen();
    },

    /**
     * Reset circuit breaker
     */
    resetCircuitBreaker: function () {
      _state.circuitBreakerOpen = false;
      _state.circuitBreakerOpenTime = null;
      console.log('[ApiErrorHandler] Circuit breaker manually reset');
    },

    /**
     * Error types enum
     */
    ErrorType: ErrorType,

    /**
     * Get module info
     * @returns {object} Module information
     */
    getInfo: function () {
      return {
        name: 'ApiErrorHandler',
        version: '1.0.0',
        author: 'devSakhawat',
        date: '2025-02-28',
        errorHistoryCount: _state.errorHistory.length,
        circuitBreakerOpen: _state.circuitBreakerOpen,
        totalErrors: Object.values(_state.errorCount).reduce(function (a, b) { return a + b; }, 0)
      };
    }
  };
})();

// ============================================
// AUTO-INITIALIZATION LOG
// ============================================
if (typeof console !== 'undefined' && console.log) {
  console.log(
    '%c[ApiErrorHandler] ✓ Enterprise-level error handler loaded',
    'color: #4CAF50; font-weight: bold; font-size: 12px;'
  );
}
