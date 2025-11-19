/*=========================================================
 * Type Converter Helper
 * File: TypeConverter.js
 * Description: Global type conversion utility for form data
 * Author: devSakhawat
 * Date: 2025-11-19
=========================================================*/

var TypeConverter = {

  /**
   * Convert value to specified type
   * @param {any} value - Raw value from form
   * @param {string} targetType - Target data type (int, string, bool, date, decimal)
   * @returns {any} Converted value
   */
  convert: function (value, targetType) {
    // Null/undefined/empty check
    if (value === null || value === undefined) {
      return this.getDefaultValue(targetType);
    }

    // Type conversion করা
    switch (targetType.toLowerCase()) {
      case 'int':
      case 'number':
        return this.toInt(value);

      case 'decimal':
      case 'float':
      case 'double':
        return this.toDecimal(value);

      case 'bool':
      case 'boolean':
        return this.toBool(value);

      case 'date':
      case 'datetime':
        return this.toDate(value);

      case 'string':
      default:
        return this.toString(value);
    }
  },

  /**
   * Convert to integer
   */
  toInt: function (value) {
    if (value === '' || value === null || value === undefined) return 0;
    const num = parseInt(value, 10);
    return isNaN(num) ? 0 : num;
  },

  /**
   * Convert to decimal
   */
  toDecimal: function (value) {
    if (value === '' || value === null || value === undefined) return 0.0;
    const num = parseFloat(value);
    return isNaN(num) ? 0.0 : num;
  },

  /**
   * Convert to boolean
   */
  toBool: function (value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return lower === 'true' || lower === '1' || lower === 'yes';
    }
    return false;
  },

  /**
   * Convert to date
   */
  toDate: function (value) {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  },

  /**
   * Convert to string
   */
  toString: function (value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  },

  /**
   * Get default value for type
   */
  getDefaultValue: function (type) {
    const defaults = {
      'int': 0,
      'number': 0,
      'decimal': 0.0,
      'float': 0.0,
      'double': 0.0,
      'bool': false,
      'boolean': false,
      'string': '',
      'date': null,
      'datetime': null
    };
    return defaults[type.toLowerCase()] || null;
  },

  /**
   * Batch convert object properties
   * @param {object} data - Object with properties to convert
   * @param {object} typeMap - Map of property names to types
   * @returns {object} Converted object
   */
  convertObject: function (data, typeMap) {
    const converted = {};
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        const targetType = typeMap[key] || 'string';
        converted[key] = this.convert(data[key], targetType);
      }
    }
    return converted;
  }
};