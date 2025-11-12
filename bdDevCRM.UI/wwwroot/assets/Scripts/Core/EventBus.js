/*=========================================================
 * Event Bus
 * File: EventBus.js
 * Description: Central event management system
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var App = App || {};

App.EventBus = (function () {
  'use strict';

  var _events = {};
  var _initialized = false;

  function _init() {
    if (_initialized) return;
    _initialized = true;

    if (typeof App.Logger !== 'undefined') {
      App.Logger.info('EventBus initialized');
    }
  }

  return {
    init: _init,

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {function} callback - Callback function
     * @param {object} context - Context for callback (optional)
     */
    on: function (eventName, callback, context) {
      if (!eventName || typeof callback !== 'function') {
        console.error('EventBus.on: Invalid parameters');
        return;
      }

      if (!_events[eventName]) {
        _events[eventName] = [];
      }

      _events[eventName].push({
        callback: callback,
        context: context || null
      });

      if (typeof App.Logger !== 'undefined') {
        App.Logger.debug('EventBus: Subscribed to', eventName);
      }
    },

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {function} callback - Callback function to remove
     */
    off: function (eventName, callback) {
      if (!_events[eventName]) return;

      if (!callback) {
        // Remove all handlers for this event
        delete _events[eventName];
        return;
      }

      _events[eventName] = _events[eventName].filter(function (handler) {
        return handler.callback !== callback;
      });

      if (_events[eventName].length === 0) {
        delete _events[eventName];
      }

      if (typeof App.Logger !== 'undefined') {
        App.Logger.debug('EventBus: Unsubscribed from', eventName);
      }
    },

    /**
     * Emit an event
     * @param {string} eventName - Name of the event
     * @param {*} data - Data to pass to handlers
     */
    emit: function (eventName, data) {
      if (!_events[eventName]) return;

      if (typeof App.Logger !== 'undefined') {
        App.Logger.debug('EventBus: Emitting', eventName, data);
      }

      var handlers = _events[eventName].slice(); // Copy array to avoid issues if handler modifies it

      handlers.forEach(function (handler) {
        try {
          if (handler.context) {
            handler.callback.call(handler.context, data);
          } else {
            handler.callback(data);
          }
        } catch (error) {
          console.error('EventBus: Error in handler for', eventName, error);
          if (typeof App.Logger !== 'undefined') {
            App.Logger.error('EventBus: Handler error', eventName, error);
          }
        }
      });
    },

    /**
     * Clear all handlers
     * @param {string} eventName - Optional event name to clear specific event
     */
    clear: function (eventName) {
      if (eventName) {
        delete _events[eventName];
      } else {
        _events = {};
      }

      if (typeof App.Logger !== 'undefined') {
        App.Logger.debug('EventBus: Cleared', eventName || 'all events');
      }
    },

    /**
     * Get all registered events (for debugging)
     */
    getEvents: function () {
      return Object.keys(_events);
    }
  };
})();