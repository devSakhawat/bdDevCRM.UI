/*=========================================================
 * State Manager
 * File: StateManager.js
 * Description: Global application state management
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var App = App || {};

App.StateManager = (function () {
  'use strict';

  var _state = {};
  var _initialized = false;

  function _init() {
    if (_initialized) return;
    _initialized = true;

    if (typeof App.Logger !== 'undefined') {
      App.Logger.info('StateManager initialized');
    }
  }

  return {
    init: _init,

    /**
     * Set state value
     * @param {string} key - State key
     * @param {*} value - State value
     * @param {boolean} silent - If true, don't emit event (default: false)
     */
    setState: function (key, value, silent) {
      var oldValue = _state[key];
      _state[key] = value;

      if (typeof App.Logger !== 'undefined') {
        App.Logger.debug('StateManager: Set', key, value);
      }

      // Emit state change event
      if (!silent && typeof App.EventBus !== 'undefined') {
        App.EventBus.emit('state:changed', {
          key: key,
          oldValue: oldValue,
          newValue: value
        });

        // Also emit specific state change event
        App.EventBus.emit('state:changed:' + key, {
          oldValue: oldValue,
          newValue: value
        });
      }
    },

    /**
     * Get state value
     * @param {string} key - State key
     * @param {*} defaultValue - Default value if key not found
     * @returns {*} State value
     */
    getState: function (key, defaultValue) {
      return _state.hasOwnProperty(key) ? _state[key] : defaultValue;
    },

    /**
     * Check if state exists
     * @param {string} key - State key
     * @returns {boolean}
     */
    hasState: function (key) {
      return _state.hasOwnProperty(key);
    },

    /**
     * Remove state
     * @param {string} key - State key
     * @param {boolean} silent - If true, don't emit event (default: false)
     */
    removeState: function (key, silent) {
      if (_state.hasOwnProperty(key)) {
        delete _state[key];

        if (typeof App.Logger !== 'undefined') {
          App.Logger.debug('StateManager: Removed', key);
        }

        if (!silent && typeof App.EventBus !== 'undefined') {
          App.EventBus.emit('state:removed', { key: key });
          App.EventBus.emit('state:removed:' + key);
        }
      }
    },

    /**
     * Clear all state
     * @param {boolean} silent - If true, don't emit event (default: false)
     */
    clearState: function (silent) {
      _state = {};

      if (typeof App.Logger !== 'undefined') {
        App.Logger.debug('StateManager: Cleared all state');
      }

      if (!silent && typeof App.EventBus !== 'undefined') {
        App.EventBus.emit('state:cleared');
      }
    },

    /**
     * Get all state (for debugging)
     * @returns {object} Copy of state object
     */
    getAllState: function () {
      return JSON.parse(JSON.stringify(_state));
    },

    /**
     * Update multiple states at once
     * @param {object} updates - Object with key-value pairs
     * @param {boolean} silent - If true, don't emit events (default: false)
     */
    updateStates: function (updates, silent) {
      if (typeof updates !== 'object') return;

      for (var key in updates) {
        if (updates.hasOwnProperty(key)) {
          this.setState(key, updates[key], silent);
        }
      }
    }
  };
})();