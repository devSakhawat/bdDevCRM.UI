/*=========================================================
 * Validation Helper
 * File: ValidationHelper.js
 * Description: Form validation utilities
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var ValidationHelper = {
  
  // Check if value is required
  isRequired: function(value, fieldName) {
    if (!value || value.toString().trim() === '') {
      ToastrMessage.showWarning(`${fieldName} is required`);
      return false;
    }
    return true;
  },

  // Validate email format
  isEmail: function(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      ToastrMessage.showWarning("Invalid email format");
      return false;
    }
    return true;
  },

  // Validate phone number
  isPhoneNumber: function(phone) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    if (!regex.test(phone)) {
      ToastrMessage.showWarning("Invalid phone number format");
      return false;
    }
    return true;
  },

  // Check if value is a number
  isNumber: function(value, fieldName) {
    if (isNaN(value)) {
      ToastrMessage.showWarning(`${fieldName} must be a number`);
      return false;
    }
    return true;
  },

  // Check if value is positive
  isPositive: function(value, fieldName) {
    if (parseFloat(value) <= 0) {
      ToastrMessage.showWarning(`${fieldName} must be positive`);
      return false;
    }
    return true;
  },

  // Check if value is within range
  isInRange: function(value, min, max, fieldName) {
    const num = parseFloat(value);
    if (num < min || num > max) {
      ToastrMessage.showWarning(`${fieldName} must be between ${min} and ${max}`);
      return false;
    }
    return true;
  },

  // Check minimum length
  hasMinLength: function(value, minLength, fieldName) {
    if (value.toString().length < minLength) {
      ToastrMessage.showWarning(`${fieldName} must be at least ${minLength} characters`);
      return false;
    }
    return true;
  },

  // Check maximum length
  hasMaxLength: function(value, maxLength, fieldName) {
    if (value.toString().length > maxLength) {
      ToastrMessage.showWarning(`${fieldName} must not exceed ${maxLength} characters`);
      return false;
    }
    return true;
  },

  // Validate URL format
  isUrl: function(url) {
    try {
      new URL(url);
      return true;
    } catch {
      ToastrMessage.showWarning("Invalid URL format");
      return false;
    }
  },

  // Validate date format
  isValidDate: function(date, fieldName) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      ToastrMessage.showWarning(`${fieldName} is not a valid date`);
      return false;
    }
    return true;
  },

  // Compare two dates
  isDateAfter: function(startDate, endDate, startLabel, endLabel) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      ToastrMessage.showWarning(`${endLabel} must be after ${startLabel}`);
      return false;
    }
    return true;
  },

  // Validate form with rules
  validateForm: function(fields) {
    for (let field of fields) {
      const { name, value, rules } = field;
      
      for (let rule of rules) {
        if (typeof rule === 'string') {
          // Simple rule
          switch(rule) {
            case 'required':
              if (!this.isRequired(value, name)) return false;
              break;
            case 'email':
              if (value && !this.isEmail(value)) return false;
              break;
            case 'phone':
              if (value && !this.isPhoneNumber(value)) return false;
              break;
            case 'number':
              if (value && !this.isNumber(value, name)) return false;
              break;
            case 'positive':
              if (value && !this.isPositive(value, name)) return false;
              break;
            case 'url':
              if (value && !this.isUrl(value)) return false;
              break;
          }
        } else if (typeof rule === 'object') {
          // Complex rule with parameters
          if (rule.type === 'minLength') {
            if (value && !this.hasMinLength(value, rule.value, name)) return false;
          } else if (rule.type === 'maxLength') {
            if (value && !this.hasMaxLength(value, rule.value, name)) return false;
          } else if (rule.type === 'range') {
            if (value && !this.isInRange(value, rule.min, rule.max, name)) return false;
          }
        }
      }
    }
    return true;
  },

  // Validate jQuery form element
  validateFormElement: function(formSelector) {
    const $form = $(formSelector);
    let isValid = true;

    $form.find('[required]').each(function() {
      const $field = $(this);
      const value = $field.val();
      const fieldName = $field.attr('name') || $field.attr('id') || 'This field';

      if (!value || value.trim() === '') {
        ToastrMessage.showWarning(`${fieldName} is required`);
        $field.focus();
        isValid = false;
        return false; // Break the each loop
      }
    });

    return isValid;
  }
};
