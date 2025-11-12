/*=========================================================
 * Dependency Injection Container
 * File: DependencyContainer.js
 * Description: Manages dependencies and services
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var App = App || {};

App.DI = (function () {
  'use strict';

  var _container = {};
  var _singletons = {};
  var _initialized = false;

  function _init() {
    if (_initialized) return;
    _initialized = true;

    if (typeof App.Logger !== 'undefined') {
      App.Logger.info('DI Container initialized');
    }
  }

  return {
    init: _init,

    /**
     * Register a service
     * @param {string} name - Service name
     * @param {*} factory - Service factory (function or object)
     * @param {boolean} singleton - If true, create only one instance (default: true)
     */
    register: function (name, factory, singleton) {
      if (!name) {
        console.error('DI.register: Service name is required');
        return;
      }

      if (_container.hasOwnProperty(name)) {
        console.warn('DI.register: Service "' + name + '" already registered. Overwriting.');
      }

      _container[name] = {
        factory: factory,
        singleton: singleton !== false // Default to true
      };

      if (typeof App.Logger !== 'undefined') {
        App.Logger.debug('DI: Registered', name, singleton !== false ? '(singleton)' : '(transient)');
      }
    },

    /**
     * Resolve a service
     * @param {string} name - Service name
     * @returns {*} Service instance
     */
    resolve: function (name) {
      if (!_container.hasOwnProperty(name)) {
        console.error('DI.resolve: Service "' + name + '" not registered');
        return null;
      }

      var config = _container[name];

      // Return singleton instance if exists
      if (config.singleton && _singletons.hasOwnProperty(name)) {
        return _singletons[name];
      }

      // Create new instance
      var instance;
      if (typeof config.factory === 'function') {
        // If factory is a constructor function (ES5 class or function)
        if (config.factory.prototype && config.factory.prototype.constructor === config.factory) {
          instance = new config.factory();
        } else {
          // If factory is a factory function
          instance = config.factory();
        }
      } else {
        // If factory is an object
        instance = config.factory;
      }

      // Store singleton
      if (config.singleton) {
        _singletons[name] = instance;
      }

      if (typeof App.Logger !== 'undefined') {
        App.Logger.debug('DI: Resolved', name);
      }

      return instance;
    },

    /**
     * Check if service is registered
     * @param {string} name - Service name
     * @returns {boolean}
     */
    has: function (name) {
      return _container.hasOwnProperty(name);
    },

    /**
     * Unregister a service
     * @param {string} name - Service name
     */
    unregister: function (name) {
      if (_container.hasOwnProperty(name)) {
        delete _container[name];

        if (_singletons.hasOwnProperty(name)) {
          delete _singletons[name];
        }

        if (typeof App.Logger !== 'undefined') {
          App.Logger.debug('DI: Unregistered', name);
        }
      }
    },

    /**
     * Clear all services
     */
    clear: function () {
      _container = {};
      _singletons = {};

      if (typeof App.Logger !== 'undefined') {
        App.Logger.debug('DI: Cleared all services');
      }
    },

    /**
     * Get all registered service names (for debugging)
     * @returns {Array<string>}
     */
    getRegisteredServices: function () {
      return Object.keys(_container);
    }
  };
})();