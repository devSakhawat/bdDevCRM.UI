/*=========================================================
 * Message Manager
 * File: MessageManager.js
 * Description: Unified message system for notifications, confirmations, alerts, and loading
 * Uses: CommonManager, ToastrMessage from common.js
 * Author: devSakhawat
 * Date: 2025-01-13
=========================================================*/

var MessageManager = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Dependency Checks
  // ============================================

  function _hasToastr() {
    return typeof ToastrMessage !== 'undefined' || typeof toastr !== 'undefined';
  }

  function _hasSweetAlert() {
    return typeof Swal !== 'undefined';
  }

  function _hasCommonManager() {
    return typeof CommonManager !== 'undefined' && typeof CommonManager.MsgBox === 'function';
  }

  function _hasKendo() {
    return typeof kendo !== 'undefined';
  }

  // ============================================
  // MODULE 1: NOTIFICATION (Toast Messages)
  // ============================================

  var Notification = {
    /**
     * Show success notification
     * @param {string} message - Message text
     * @param {string} title - Optional title
     * @param {number} timeOut - Display duration in ms (default: 3000)
     */
    success: function (message, title, timeOut) {
      _showToast(message, title, 'success', timeOut || 3000);
    },

    /**
     * Show error notification
     * @param {string} message - Message text
     * @param {string} title - Optional title
     * @param {number} timeOut - Display duration in ms (default: 0 = no auto-hide)
     */
    error: function (message, title, timeOut) {
      _showToast(message, title, 'error', timeOut !== undefined ? timeOut : 0);
    },

    /**
     * Show warning notification
     * @param {string} message - Message text
     * @param {string} title - Optional title
     * @param {number} timeOut - Display duration in ms (default: 5000)
     */
    warning: function (message, title, timeOut) {
      _showToast(message, title, 'warning', timeOut || 5000);
    },

    /**
     * Show info notification
     * @param {string} message - Message text
     * @param {string} title - Optional title
     * @param {number} timeOut - Display duration in ms (default: 3000)
     */
    info: function (message, title, timeOut) {
      _showToast(message, title, 'info', timeOut || 3000);
    }
  };

  // Private - Show toast notification
  function _showToast(message, title, type, timeOut) {
    if (typeof ToastrMessage !== 'undefined') {
      // Use ToastrMessage if available
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: timeOut === 0,
        timeOut: timeOut,
        message: message,
        title: title || '',
        type: type
      });
    } else if (typeof toastr !== 'undefined') {
      // Fallback to toastr
      toastr.options = {
        closeButton: timeOut === 0,
        progressBar: timeOut > 0,
        timeOut: timeOut,
        preventDuplicates: true
      };
      toastr[type](message, title || '');
    } else {
      // Final fallback to console
      console.log('[' + type.toUpperCase() + '] ' + (title ? title + ': ' : '') + message);
    }
  }

  // ============================================
  // MODULE 2: CONFIRMATION (Modal with Yes/No)
  // ============================================

  var Confirmation = {
    /**
     * Show save confirmation
     * @param {function} onYes - Callback when user clicks Yes
     * @param {function} onNo - Optional callback when user clicks No
     * @param {string} message - Custom message (optional)
     */
    save: function (onYes, onNo, message) {
      _showConfirm({
        title: 'Save Confirmation',
        message: message || 'Do you want to save this information?',
        type: 'info',
        confirmText: 'Yes, Save',
        cancelText: 'Cancel',
        onYes: onYes,
        onNo: onNo
      });
    },

    /**
     * Show update confirmation
     * @param {function} onYes - Callback when user clicks Yes
     * @param {function} onNo - Optional callback when user clicks No
     * @param {string} message - Custom message (optional)
     */
    update: function (onYes, onNo, message) {
      _showConfirm({
        title: 'Update Confirmation',
        message: message || 'Do you want to update this information?',
        type: 'info',
        confirmText: 'Yes, Update',
        cancelText: 'Cancel',
        onYes: onYes,
        onNo: onNo
      });
    },

    /**
     * Show delete confirmation
     * @param {string} itemName - Name of item to delete (e.g., 'user', 'record')
     * @param {function} onYes - Callback when user clicks Yes
     * @param {function} onNo - Optional callback when user clicks No
     */
    delete: function (itemName, onYes, onNo) {
      _showConfirm({
        title: 'Delete Confirmation',
        message: 'Are you sure you want to delete this ' + (itemName || 'item') + '?',
        type: 'warning',
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
        onYes: onYes,
        onNo: onNo
      });
    },

    /**
     * Show discard changes confirmation
     * @param {function} onYes - Callback when user clicks Yes
     * @param {function} onNo - Optional callback when user clicks No
     */
    discard: function (onYes, onNo) {
      _showConfirm({
        title: 'Discard Changes',
        message: 'You have unsaved changes. Do you want to discard them?',
        type: 'warning',
        confirmText: 'Yes, Discard',
        cancelText: 'No, Keep Editing',
        onYes: onYes,
        onNo: onNo
      });
    },

    /**
     * Show custom confirmation
     * @param {object} options - Configuration object
     */
    custom: function (options) {
      _showConfirm(options);
    }
  };

  // Private - Show confirmation dialog
  function _showConfirm(options) {
    var defaults = {
      title: 'Confirmation',
      message: 'Are you sure?',
      type: 'info',
      confirmText: 'Yes',
      cancelText: 'No',
      onYes: null,
      onNo: null
    };

    var config = Object.assign({}, defaults, options);

    // Use CommonManager.MsgBox if available
    if (_hasCommonManager()) {
      CommonManager.MsgBox(
        config.type,
        'center',
        config.title,
        config.message,
        [
          {
            addClass: 'btn btn-primary',
            text: config.confirmText,
            onClick: function ($noty) {
              $noty.close();
              if (config.onYes) config.onYes();
            }
          },
          {
            addClass: 'btn btn-secondary',
            text: config.cancelText,
            onClick: function ($noty) {
              $noty.close();
              if (config.onNo) config.onNo();
            }
          }
        ],
        0
      );
    }
    // Fallback to SweetAlert2
    else if (_hasSweetAlert()) {
      Swal.fire({
        title: config.title,
        html: config.message,
        icon: config.type,
        showCancelButton: true,
        confirmButtonText: config.confirmText,
        cancelButtonText: config.cancelText,
        allowOutsideClick: false
      }).then(function (result) {
        if (result.isConfirmed && config.onYes) {
          config.onYes();
        } else if (result.isDismissed && config.onNo) {
          config.onNo();
        }
      });
    }
    // Fallback to Kendo confirm
    else if (_hasKendo() && kendo.confirm) {
      kendo.confirm(config.message)
        .done(function () {
          if (config.onYes) config.onYes();
        })
        .fail(function () {
          if (config.onNo) config.onNo();
        });
    }
    // Final fallback to browser confirm
    else {
      if (window.confirm(config.message)) {
        if (config.onYes) config.onYes();
      } else {
        if (config.onNo) config.onNo();
      }
    }
  }

  // ============================================
  // MODULE 3: ALERT (Modal with OK only)
  // ============================================

  var Alert = {
    /**
     * Show success alert
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     * @param {function} onClose - Optional callback when closed
     */
    success: function (title, message, onClose) {
      _showAlert(title, message, 'success', onClose);
    },

    /**
     * Show error alert
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     * @param {function} onClose - Optional callback when closed
     */
    error: function (title, message, onClose) {
      _showAlert(title, message, 'error', onClose);
    },

    /**
     * Show warning alert
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     * @param {function} onClose - Optional callback when closed
     */
    warning: function (title, message, onClose) {
      _showAlert(title, message, 'warning', onClose);
    },

    /**
     * Show info alert
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     * @param {function} onClose - Optional callback when closed
     */
    info: function (title, message, onClose) {
      _showAlert(title, message, 'info', onClose);
    }
  };

  // Private - Show alert dialog
  function _showAlert(title, message, type, onClose) {
    // Use CommonManager.MsgBox if available
    if (_hasCommonManager()) {
      CommonManager.MsgBox(
        type,
        'center',
        title,
        message,
        [
          {
            addClass: 'btn btn-primary',
            text: 'OK',
            onClick: function ($noty) {
              $noty.close();
              if (onClose) onClose();
            }
          }
        ],
        0
      );
    }
    // Fallback to SweetAlert2
    else if (_hasSweetAlert()) {
      Swal.fire({
        title: title,
        html: message,
        icon: type,
        confirmButtonText: 'OK'
      }).then(function () {
        if (onClose) onClose();
      });
    }
    // Fallback to Kendo alert
    else if (_hasKendo() && kendo.alert) {
      kendo.alert(message).done(function () {
        if (onClose) onClose();
      });
    }
    // Final fallback to browser alert
    else {
      window.alert(title + '\n\n' + message);
      if (onClose) onClose();
    }
  }

  // ============================================
  // MODULE 4: LOADING (Overlay/Spinner)
  // ============================================

  var Loading = {
    _counter: 0,
    _overlay: null,

    /**
     * Show loading overlay
     * @param {string} message - Loading message (default: "Processing... Please wait.")
     */
    show: function (message) {
      // Use CommonManager if available
      if (_hasCommonManager() && typeof CommonManager.showProcessingOverlay === 'function') {
        CommonManager.showProcessingOverlay(message);
        return;
      }

      // Fallback to custom implementation
      this._counter++;
      if (this._counter === 1) {
        this._createOverlay(message);
      }
    },

    /**
     * Hide loading overlay
     */
    hide: function () {
      // Use CommonManager if available
      if (_hasCommonManager() && typeof CommonManager.hideProcessingOverlay === 'function') {
        CommonManager.hideProcessingOverlay();
        return;
      }

      // Fallback to custom implementation
      this._counter--;
      if (this._counter <= 0) {
        this._counter = 0;
        this._removeOverlay();
      }
    },

    /**
     * Wrap async operation with loading overlay
     * @param {Promise} promise - Async operation
     * @param {string} message - Loading message
     * @returns {Promise} Original promise result
     */
    wrap: async function (promise, message) {
      this.show(message);
      try {
        const result = await promise;
        return result;
      } finally {
        this.hide();
      }
    },

    /**
     * Force hide all loading overlays
     */
    forceHide: function () {
      this._counter = 0;

      // Use CommonManager if available
      if (_hasCommonManager() && typeof CommonManager.hideProcessingOverlay === 'function') {
        CommonManager.hideProcessingOverlay();
      }

      this._removeOverlay();
    },

    // Private - Create loading overlay
    _createOverlay: function (message) {
      if (this._overlay) return;

      var msg = message || 'Processing... Please wait.';

      var overlayHtml = [
        '<div id="messageManagerLoadingOverlay" style="',
        'position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
        'background-color: rgba(0, 0, 0, 0.6); z-index: 99999;',
        'display: flex; justify-content: center; align-items: center;">',
        '<div style="background: white; padding: 30px 40px; border-radius: 8px;',
        'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); text-align: center; min-width: 300px;">',
        '<div style="margin-bottom: 20px;">',
        '<div style="width: 40px; height: 40px; border: 4px solid #f3f3f3;',
        'border-top: 4px solid #007bff; border-radius: 50%;',
        'animation: spin 1s linear infinite; margin: 0 auto 15px auto;"></div>',
        '<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}</style>',
        '</div>',
        '<div style="font-size: 16px; color: #333; font-weight: 500;">',
        msg,
        '</div>',
        '<div style="font-size: 12px; color: #666; margin-top: 10px;">',
        'Please do not close or refresh the page',
        '</div>',
        '</div>',
        '</div>'
      ].join('');

      this._overlay = $(overlayHtml);
      $('body').append(this._overlay);
      $('body').css('overflow', 'hidden');
    },

    // Private - Remove loading overlay
    _removeOverlay: function () {
      if (this._overlay) {
        this._overlay.remove();
        this._overlay = null;
      }
      $('#messageManagerLoadingOverlay').remove();
      $('body').css('overflow', '');
    }
  };

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // Modules
    notify: Notification,
    confirm: Confirmation,
    alert: Alert,
    loading: Loading,

    // Backward compatibility helpers (deprecated)
    showSuccess: function (message, title, timeOut) {
      _logDeprecation('MessageManager.showSuccess', 'MessageManager.notify.success');
      Notification.success(message, title, timeOut);
    },

    showError: function (message, title, timeOut) {
      _logDeprecation('MessageManager.showError', 'MessageManager.notify.error');
      Notification.error(message, title, timeOut);
    },

    showWarning: function (message, title, timeOut) {
      _logDeprecation('MessageManager.showWarning', 'MessageManager.notify.warning');
      Notification.warning(message, title, timeOut);
    },

    showInfo: function (message, title, timeOut) {
      _logDeprecation('MessageManager.showInfo', 'MessageManager.notify.info');
      Notification.info(message, title, timeOut);
    }
  };

  // Private - Log deprecation warning
  function _logDeprecation(oldMethod, newMethod) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        '%c[DEPRECATED] ' + oldMethod + ' is deprecated. Use ' + newMethod + ' instead.',
        'color: orange; font-weight: bold;'
      );
    }
  }
})();

// ============================================
// Auto-initialization Check
// ============================================
(function () {
  var missingDeps = [];

  if (typeof CommonManager === 'undefined') {
    missingDeps.push('CommonManager');
  }
  if (typeof ToastrMessage === 'undefined' && typeof toastr === 'undefined') {
    missingDeps.push('ToastrMessage/toastr');
  }

  if (missingDeps.length > 0) {
    console.warn(
      '%c[MessageManager] Warning: Missing dependencies: ' + missingDeps.join(', ') +
      '. Some features may not work properly.',
      'color: orange; font-weight: bold;'
    );
  } else {
    console.log(
      '%c[MessageManager] ✓ Loaded successfully',
      'color: #2196F3; font-weight: bold; font-size: 12px;'
    );
  }
})();