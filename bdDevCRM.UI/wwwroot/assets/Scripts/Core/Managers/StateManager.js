/*=========================================================
 * State Manager
 * File: StateManager.js
 * Description: Lightweight global application state management
 * Author: devSakhawat
 * Date: 2025-01-13
 * Note: Optional - Only use if you need global state management
=========================================================*/

var StateManager = (function () {
  'use strict';

  // Private state storage
  var _state = {};
  var _listeners = {};

  /**
   * Set state value
   * @param {string} key - State key
   * @param {*} value - State value
   */
  function setState(key, value) {
    var oldValue = _state[key];
    _state[key] = value;

    // Trigger listeners
    if (_listeners[key]) {
      _listeners[key].forEach(function (callback) {
        callback(value, oldValue);
      });
    }
  }

  /**
   * Get state value
   * @param {string} key - State key
   * @param {*} defaultValue - Default value if not found
   * @returns {*}
   */
  function getState(key, defaultValue) {
    return _state.hasOwnProperty(key) ? _state[key] : defaultValue;
  }

  /**
   * Remove state
   * @param {string} key - State key
   */
  function removeState(key) {
    delete _state[key];
    delete _listeners[key];
  }

  /**
   * Clear all state
   */
  function clearState() {
    _state = {};
    _listeners = {};
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  function subscribe(key, callback) {
    if (!_listeners[key]) {
      _listeners[key] = [];
    }
    _listeners[key].push(callback);

    // Return unsubscribe function
    return function unsubscribe() {
      var index = _listeners[key].indexOf(callback);
      if (index > -1) {
        _listeners[key].splice(index, 1);
      }
    };
  }

  /**
   * Get all state (for debugging)
   * @returns {object}
   */
  function getAllState() {
    return Object.assign({}, _state);
  }

  // Public API
  return {
    setState: setState,
    getState: getState,
    removeState: removeState,
    clearState: clearState,
    subscribe: subscribe,
    getAllState: getAllState
  };
})();

// Log initialization
if (typeof console !== 'undefined' && console.log) {
  console.log('%c[StateManager] ✓ Loaded successfully (Optional)', 'color: #9C27B0; font-weight: bold; font-size: 12px;');
}