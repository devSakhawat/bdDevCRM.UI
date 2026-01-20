/*=========================================================
 * Logger
 * File: Logger.js
 * Description: Centralized logging system
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var App = App || {};

App.Logger = (function () {
  'use strict';

  var _logLevel = 'INFO'; // DEBUG, INFO, WARN, ERROR
  var _enabled = true;

  var LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };

  function _getCurrentLevel() {
    return LogLevel[_logLevel] || LogLevel.INFO;
  }

  function _shouldLog(level) {
    return _enabled && LogLevel[level] >= _getCurrentLevel();
  }

  function _formatMessage(level, args) {
    var timestamp = new Date().toISOString();
    var prefix = '[' + timestamp + '] [' + level + ']';
    return [prefix].concat(Array.prototype.slice.call(args));
  }

  return {
    init: function (level) {
      _logLevel = level || 'INFO';
      console.log('Logger initialized with level:', _logLevel);
    },

    setLevel: function (level) {
      _logLevel = level;
    },

    enable: function () {
      _enabled = true;
    },

    disable: function () {
      _enabled = false;
    },

    debug: function () {
      if (_shouldLog('DEBUG')) {
        console.log.apply(console, _formatMessage('DEBUG', arguments));
      }
    },

    info: function () {
      if (_shouldLog('INFO')) {
        console.info.apply(console, _formatMessage('INFO', arguments));
      }
    },

    warn: function () {
      if (_shouldLog('WARN')) {
        console.warn.apply(console, _formatMessage('WARN', arguments));
      }
    },

    error: function () {
      if (_shouldLog('ERROR')) {
        console.error.apply(console, _formatMessage('ERROR', arguments));
      }
    },

    group: function (label) {
      if (_enabled) {
        //console.group(label);
      }
    },

    groupEnd: function () {
      if (_enabled) {
        //console.groupEnd();
      }
    }
  };
})();