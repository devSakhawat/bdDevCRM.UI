/*=========================================================
 * Confirmation Manager
 * File: ConfirmationManager.js
 * Description: Confirmation dialog utilities
 * Author: devSakhawat
 * Date: 2025-11-13
=========================================================*/

var ConfirmationManager = (function () {
  'use strict';

  /**
   * Show confirmation dialog
   */
  function confirm(options) {
    var defaults = {
      title: 'Confirmation',
      message: 'Are you sure?',
      type: 'info', // info, warning, danger, success
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: null,
      onCancel: null
    };

    var settings = $.extend({}, defaults, options);

    // Use AjaxManager.MsgBox if available
    if (typeof AjaxManager !== 'undefined' && AjaxManager.MsgBox) {
      AjaxManager.MsgBox(
        settings.type,
        'center',
        settings.title,
        settings.message,
        [
          {
            addClass: 'btn btn-primary',
            text: settings.confirmText,
            onClick: function ($noty) {
              $noty.close();
              if (settings.onConfirm) {
                settings.onConfirm();
              }
            }
          },
          {
            addClass: 'btn btn-secondary',
            text: settings.cancelText,
            onClick: function ($noty) {
              $noty.close();
              if (settings.onCancel) {
                settings.onCancel();
              }
            }
          }
        ],
        0
      );
    }
    // Fallback to Kendo confirm
    else if (typeof kendo !== 'undefined' && kendo.confirm) {
      kendo.confirm(settings.message).done(function () {
        if (settings.onConfirm) {
          settings.onConfirm();
        }
      }).fail(function () {
        if (settings.onCancel) {
          settings.onCancel();
        }
      });
    }
    // Final fallback to browser confirm
    else {
      if (window.confirm(settings.message)) {
        if (settings.onConfirm) {
          settings.onConfirm();
        }
      } else {
        if (settings.onCancel) {
          settings.onCancel();
        }
      }
    }
  }

  /**
   * Delete confirmation
   */
  function confirmDelete(itemName, onConfirm, onCancel) {
    confirm({
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this ' + (itemName || 'item') + '?',
      type: 'warning',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: onConfirm,
      onCancel: onCancel
    });
  }

  /**
   * Save confirmation
   */
  function confirmSave(onConfirm, onCancel) {
    confirm({
      title: 'Save Confirmation',
      message: 'Do you want to save this information?',
      type: 'info',
      confirmText: 'Yes, Save',
      cancelText: 'Cancel',
      onConfirm: onConfirm,
      onCancel: onCancel
    });
  }

  /**
   * Update confirmation
   */
  function confirmUpdate(onConfirm, onCancel) {
    confirm({
      title: 'Update Confirmation',
      message: 'Do you want to update this information?',
      type: 'info',
      confirmText: 'Yes, Update',
      cancelText: 'Cancel',
      onConfirm: onConfirm,
      onCancel: onCancel
    });
  }

  /**
   * Discard changes confirmation
   */
  function confirmDiscard(onConfirm, onCancel) {
    confirm({
      title: 'Discard Changes',
      message: 'You have unsaved changes. Do you want to discard them?',
      type: 'warning',
      confirmText: 'Yes, Discard',
      cancelText: 'No, Keep Editing',
      onConfirm: onConfirm,
      onCancel: onCancel
    });
  }

  // Public API
  return {
    confirm: confirm,
    confirmDelete: confirmDelete,
    confirmSave: confirmSave,
    confirmUpdate: confirmUpdate,
    confirmDiscard: confirmDiscard
  };
})();