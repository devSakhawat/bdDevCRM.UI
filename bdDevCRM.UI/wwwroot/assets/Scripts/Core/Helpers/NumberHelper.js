/*=========================================================
 * Number Helper
 * File: NumberHelper.js
 * Description: Number formatting and manipulation utilities
 * Author: devSakhawat
 * Date: 2025-11-13
=========================================================*/

var NumberHelper = (function () {
  'use strict';

  /**
   * Format number with thousand separators
   */
  function formatNumber(num, decimals) {
    if (num === null || num === undefined) return '';

    decimals = decimals !== undefined ? decimals : 2;

    var parts = parseFloat(num).toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  /**
   * Format currency
   */
  function formatCurrency(num, symbol, decimals) {
    symbol = symbol || '৳';
    decimals = decimals !== undefined ? decimals : 2;

    if (num === null || num === undefined) return symbol + '0.00';

    var formatted = formatNumber(num, decimals);
    return symbol + ' ' + formatted;
  }

  /**
   * Format percentage
   */
  function formatPercentage(num, decimals) {
    decimals = decimals !== undefined ? decimals : 2;

    if (num === null || num === undefined) return '0%';

    return parseFloat(num).toFixed(decimals) + '%';
  }

  /**
   * Parse string to number
   */
  function parse(str) {
    if (!str) return 0;

    // Remove non-numeric characters except . and -
    var cleaned = str.toString().replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  /**
   * Round number to decimals
   */
  function round(num, decimals) {
    decimals = decimals || 0;
    var multiplier = Math.pow(10, decimals);
    return Math.round(num * multiplier) / multiplier;
  }

  /**
   * Ceiling to decimals
   */
  function ceil(num, decimals) {
    decimals = decimals || 0;
    var multiplier = Math.pow(10, decimals);
    return Math.ceil(num * multiplier) / multiplier;
  }

  /**
   * Floor to decimals
   */
  function floor(num, decimals) {
    decimals = decimals || 0;
    var multiplier = Math.pow(10, decimals);
    return Math.floor(num * multiplier) / multiplier;
  }

  /**
   * Check if number is valid
   */
  function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  /**
   * Check if integer
   */
  function isInteger(value) {
    return Number.isInteger(value);
  }

  /**
   * Check if positive
   */
  function isPositive(value) {
    return isNumber(value) && value > 0;
  }

  /**
   * Check if negative
   */
  function isNegative(value) {
    return isNumber(value) && value < 0;
  }

  /**
   * Check if in range
   */
  function isInRange(value, min, max) {
    return isNumber(value) && value >= min && value <= max;
  }

  /**
   * Clamp number between min and max
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Generate random number
   */
  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate random integer
   */
  function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
  }

  /**
   * Convert to compact notation (1K, 1M, 1B)
   */
  function toCompact(num) {
    if (num === null || num === undefined) return '0';

    var absNum = Math.abs(num);
    var sign = num < 0 ? '-' : '';

    if (absNum >= 1e9) return sign + (absNum / 1e9).toFixed(1) + 'B';
    if (absNum >= 1e6) return sign + (absNum / 1e6).toFixed(1) + 'M';
    if (absNum >= 1e3) return sign + (absNum / 1e3).toFixed(1) + 'K';

    return num.toString();
  }

  /**
   * Convert bytes to human readable
   */
  function formatBytes(bytes, decimals) {
    if (bytes === 0) return '0 Bytes';

    decimals = decimals !== undefined ? decimals : 2;
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  /**
   * Sum array of numbers
   */
  function sum(numbers) {
    return numbers.reduce(function (acc, val) {
      return acc + (parseFloat(val) || 0);
    }, 0);
  }

  /**
   * Average of array of numbers
   */
  function average(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    return sum(numbers) / numbers.length;
  }

  /**
   * Get min value from array
   */
  function min(numbers) {
    return Math.min.apply(null, numbers);
  }

  /**
   * Get max value from array
   */
  function max(numbers) {
    return Math.max.apply(null, numbers);
  }

  // Public API
  return {
    formatNumber: formatNumber,
    formatCurrency: formatCurrency,
    formatPercentage: formatPercentage,
    parse: parse,
    round: round,
    ceil: ceil,
    floor: floor,
    isNumber: isNumber,
    isInteger: isInteger,
    isPositive: isPositive,
    isNegative: isNegative,
    isInRange: isInRange,
    clamp: clamp,
    random: random,
    randomInt: randomInt,
    toCompact: toCompact,
    formatBytes: formatBytes,
    sum: sum,
    average: average,
    min: min,
    max: max
  };
})();