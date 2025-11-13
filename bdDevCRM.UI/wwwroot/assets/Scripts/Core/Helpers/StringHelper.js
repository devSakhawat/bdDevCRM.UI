/*=========================================================
 * String Helper
 * File: StringHelper.js
 * Description: String manipulation utilities
 * Author: devSakhawat
 * Date: 2025-11-13
=========================================================*/

var StringHelper = (function () {
  'use strict';

  /**
   * Check if string is null or empty
   */
  function isNullOrEmpty(str) {
    return !str || str.trim() === '';
  }

  /**
   * Check if string is null, empty or whitespace
   */
  function isNullOrWhitespace(str) {
    return !str || /^\s*$/.test(str);
  }

  /**
   * Trim string
   */
  function trim(str) {
    return str ? str.trim() : '';
  }

  /**
   * Capitalize first letter
   */
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitalize first letter of each word
   */
  function capitalizeWords(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

  /**
   * Convert to camelCase
   */
  function toCamelCase(str) {
    if (!str) return '';
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Convert to PascalCase
   */
  function toPascalCase(str) {
    if (!str) return '';
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word) {
        return word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Convert to kebab-case
   */
  function toKebabCase(str) {
    if (!str) return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert to snake_case
   */
  function toSnakeCase(str) {
    if (!str) return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  /**
   * Truncate string with ellipsis
   */
  function truncate(str, length, suffix) {
    if (!str) return '';
    suffix = suffix || '...';

    if (str.length <= length) {
      return str;
    }

    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Format string (like C# String.Format)
   */
  function format(str) {
    var args = Array.prototype.slice.call(arguments, 1);
    return str.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  }

  /**
   * Remove HTML tags
   */
  function stripHtml(str) {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '');
  }

  /**
   * Escape HTML
   */
  function escapeHtml(str) {
    if (!str) return '';
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function (m) { return map[m]; });
  }

  /**
   * Unescape HTML
   */
  function unescapeHtml(str) {
    if (!str) return '';
    var map = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'"
    };
    return str.replace(/&(amp|lt|gt|quot|#039);/g, function (m) { return map[m]; });
  }

  /**
   * Check if string contains substring
   */
  function contains(str, search, ignoreCase) {
    if (!str) return false;
    if (ignoreCase) {
      return str.toLowerCase().indexOf(search.toLowerCase()) !== -1;
    }
    return str.indexOf(search) !== -1;
  }

  /**
   * Check if string starts with
   */
  function startsWith(str, search, ignoreCase) {
    if (!str) return false;
    if (ignoreCase) {
      return str.toLowerCase().startsWith(search.toLowerCase());
    }
    return str.startsWith(search);
  }

  /**
   * Check if string ends with
   */
  function endsWith(str, search, ignoreCase) {
    if (!str) return false;
    if (ignoreCase) {
      return str.toLowerCase().endsWith(search.toLowerCase());
    }
    return str.endsWith(search);
  }

  /**
   * Pad left
   */
  function padLeft(str, length, char) {
    str = str || '';
    char = char || ' ';
    while (str.length < length) {
      str = char + str;
    }
    return str;
  }

  /**
   * Pad right
   */
  function padRight(str, length, char) {
    str = str || '';
    char = char || ' ';
    while (str.length < length) {
      str = str + char;
    }
    return str;
  }

  /**
   * Reverse string
   */
  function reverse(str) {
    if (!str) return '';
    return str.split('').reverse().join('');
  }

  /**
   * Generate random string
   */
  function random(length, chars) {
    length = length || 10;
    chars = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    var result = '';
    for (var i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate GUID
   */
  function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Public API
  return {
    isNullOrEmpty: isNullOrEmpty,
    isNullOrWhitespace: isNullOrWhitespace,
    trim: trim,
    capitalize: capitalize,
    capitalizeWords: capitalizeWords,
    toCamelCase: toCamelCase,
    toPascalCase: toPascalCase,
    toKebabCase: toKebabCase,
    toSnakeCase: toSnakeCase,
    truncate: truncate,
    format: format,
    stripHtml: stripHtml,
    escapeHtml: escapeHtml,
    unescapeHtml: unescapeHtml,
    contains: contains,
    startsWith: startsWith,
    endsWith: endsWith,
    padLeft: padLeft,
    padRight: padRight,
    reverse: reverse,
    random: random,
    generateGuid: generateGuid
  };
})();