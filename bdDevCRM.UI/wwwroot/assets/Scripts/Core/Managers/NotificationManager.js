/*=========================================================
 * Centralized Notification Manager
 * File: NotificationManager.js
 * Description: Unified notification/message system
 * Author: devSakhawat
 * Date: 2025-11-12
=========================================================*/

var NotificationManager = (function () {
  'use strict';

  // Private - Default settings
  var _defaults = {
    preventDuplicates: true,
    closeButton: true,
    timeOut: 5000,
    progressBar: true
  };

  /**
   * Show success message
   */
  function showSuccess(message, title) {
    _show(message, title, 'success');
  }

  /**
   * Show error message
   */
  function showError(message, title) {
    _show(message, title, 'error', 0); // No timeout for errors
  }

  /**
   * Show warning message
   */
  function showWarning(message, title) {
    _show(message, title, 'warning');
  }

  /**
   * Show info message
   */
  function showInfo(message, title) {
    _show(message, title, 'info');
  }

  /**
   * Internal show method
   */
  function _show(message, title, type, timeOut) {
    // Use ToastrMessage if available
    if (typeof ToastrMessage !== 'undefined') {
      ToastrMessage.showToastrNotification({
        preventDuplicates: _defaults.preventDuplicates,
        closeButton: _defaults.closeButton,
        timeOut: timeOut !== undefined ? timeOut : _defaults.timeOut,
        message: message,
        title: title || '',
        type: type
      });
    }
    // Fallback to Kendo notification
    else if (typeof kendo !== 'undefined' && kendo.ui && kendo.ui.Notification) {
      var notification = $("<span></span>").kendoNotification({
        position: {
          top: 20,
          right: 20
        },
        autoHideAfter: _defaults.timeOut,
        stacking: "down",
        templates: [{
          type: type,
          template: $("#notificationTemplate").html()
        }]
      }).data("kendoNotification");

      notification.show(message, type);
    }
    // Final fallback to console
    else {
      console.log('[' + type.toUpperCase() + '] ' + (title ? title + ': ' : '') + message);
    }
  }

  /**
   * Show confirmation dialog
   */
  function confirm(message, title, onYes, onNo) {
    // Use existing AjaxManager.MsgBox
    if (typeof AjaxManager !== 'undefined' && AjaxManager.MsgBox) {
      AjaxManager.MsgBox(
        'info',
        'center',
        title || 'Confirmation',
        message,
        [
          {
            addClass: 'btn btn-primary',
            text: 'Yes',
            onClick: function ($noty) {
              $noty.close();
              if (onYes) onYes();
            }
          },
          {
            addClass: 'btn btn-secondary',
            text: 'No',
            onClick: function ($noty) {
              $noty.close();
              if (onNo) onNo();
            }
          }
        ],
        0
      );
    }
    // Fallback to window.confirm
    else {
      if (window.confirm(message)) {
        if (onYes) onYes();
      } else {
        if (onNo) onNo();
      }
    }
  }

  // Public API
  return {
    showSuccess: showSuccess,
    showError: showError,
    showWarning: showWarning,
    showInfo: showInfo,
    confirm: confirm
  };
})();