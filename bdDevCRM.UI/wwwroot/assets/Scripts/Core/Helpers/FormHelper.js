/*=========================================================
 * Form Helper
 * File: FormHelper.js
 * Description: Form manipulation utilities
 * Author: devSakhawat
 * Date: 2025-11-13
=========================================================*/

var FormHelper = (function () {
  'use strict';

  /**
   * Get form data as object
   */
  function getFormData(formSelector) {
    var formData = {};
    var $form = $(formSelector);

    $form.find('input, select, textarea').each(function () {
      var $field = $(this);
      var name = $field.attr('name') || $field.attr('id');

      if (!name) return;

      var type = $field.attr('type');

      if (type === 'checkbox') {
        formData[name] = $field.is(':checked');
      } else if (type === 'radio') {
        if ($field.is(':checked')) {
          formData[name] = $field.val();
        }
      } else {
        formData[name] = $field.val();
      }
    });

    return formData;
  }

  /**
   * Set form data from object
   */
  function setFormData(formSelector, data) {
    var $form = $(formSelector);

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var $field = $form.find('[name="' + key + '"], [id="' + key + '"]');

        if ($field.length === 0) continue;

        var type = $field.attr('type');

        if (type === 'checkbox') {
          $field.prop('checked', !!data[key]);
        } else if (type === 'radio') {
          $form.find('[name="' + key + '"][value="' + data[key] + '"]')
            .prop('checked', true);
        } else {
          $field.val(data[key]);
        }
      }
    }
  }

  /**
   * Clear form
   */
  function clearForm(formSelector) {
    var $form = $(formSelector);

    $form.find('input, select, textarea').each(function () {
      var $field = $(this);
      var type = $field.attr('type');

      if (type === 'checkbox' || type === 'radio') {
        $field.prop('checked', false);
      } else if ($field.is('select')) {
        $field.val('');
        // Reset Kendo dropdown if exists
        var kendoWidget = $field.data('kendoDropDownList') ||
          $field.data('kendoComboBox');
        if (kendoWidget) {
          kendoWidget.value('');
        }
      } else {
        $field.val('');
      }
    });

    // Clear Kendo validator messages
    var validator = $form.data('kendoValidator');
    if (validator) {
      validator.hideMessages();
    }
  }

  /**
   * Disable form
   */
  function disableForm(formSelector) {
    $(formSelector).find('input, select, textarea, button').prop('disabled', true);
  }

  /**
   * Enable form
   */
  function enableForm(formSelector) {
    $(formSelector).find('input, select, textarea, button').prop('disabled', false);
  }

  /**
   * Make form readonly
   */
  function makeReadonly(formSelector) {
    $(formSelector).find('input, select, textarea').prop('readonly', true);
    $(formSelector).find('button').not('.btn-close').prop('disabled', true);
  }

  /**
   * Remove readonly
   */
  function removeReadonly(formSelector) {
    $(formSelector).find('input, select, textarea').prop('readonly', false);
    $(formSelector).find('button').prop('disabled', false);
  }

  /**
   * Validate form using Kendo
   */
  function validate(formSelector) {
    var $form = $(formSelector);
    var validator = $form.data('kendoValidator');

    if (!validator) {
      validator = $form.kendoValidator().data('kendoValidator');
    }

    return validator.validate();
  }

  /**
   * Hide validation messages
   */
  function hideValidationMessages(formSelector) {
    var $form = $(formSelector);
    var validator = $form.data('kendoValidator');

    if (validator) {
      validator.hideMessages();
    }
  }

  /**
   * Serialize form to query string
   */
  function serialize(formSelector) {
    return $(formSelector).serialize();
  }

  /**
   * Convert form to FormData object
   */
  function toFormData(formSelector) {
    var formData = new FormData();
    var $form = $(formSelector);

    $form.find('input, select, textarea').each(function () {
      var $field = $(this);
      var name = $field.attr('name');

      if (!name) return;

      var type = $field.attr('type');

      if (type === 'file') {
        var files = $field[0].files;
        for (var i = 0; i < files.length; i++) {
          formData.append(name, files[i]);
        }
      } else if (type === 'checkbox') {
        formData.append(name, $field.is(':checked'));
      } else if (type === 'radio') {
        if ($field.is(':checked')) {
          formData.append(name, $field.val());
        }
      } else {
        formData.append(name, $field.val());
      }
    });

    return formData;
  }

  /**
   * Focus first invalid field
   */
  function focusFirstInvalid(formSelector) {
    var $form = $(formSelector);
    var $invalid = $form.find('.k-invalid:first');

    if ($invalid.length > 0) {
      $invalid.focus();
    }
  }

  // Public API
  return {
    getFormData: getFormData,
    setFormData: setFormData,
    clearForm: clearForm,
    disableForm: disableForm,
    enableForm: enableForm,
    makeReadonly: makeReadonly,
    removeReadonly: removeReadonly,
    validate: validate,
    hideValidationMessages: hideValidationMessages,
    serialize: serialize,
    toFormData: toFormData,
    focusFirstInvalid: focusFirstInvalid
  };
})();