/*=========================================================
 * Base Component
 * File: BaseComponent.js
 * Description: Base class for all UI components
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

/**
 * Base Component Class
 * All UI components should extend this class
 */
var BaseComponent = (function () {
  'use strict';

  /**
   * Constructor
   * @param {Object} options - Component options
   * @param {string|HTMLElement|jQuery} options.el - Element selector or element
   * @param {string} options.name - Component name (optional, for debugging)
   */
  function BaseComponent(options) {
    options = options || {};

    this.options = options;
    this.name = options.name || this.constructor.name || 'BaseComponent';
    this.el = options.el || null;
    this.$el = null;

    // Set jQuery element
    if (this.el) {
      if (typeof this.el === 'string') {
        this.$el = $(this.el);
      } else if (this.el instanceof jQuery) {
        this.$el = this.el;
      } else {
        this.$el = $(this.el);
      }
    }

    this.events = {};
    this.initialized = false;
    this.destroyed = false;
  }

  /**
   * Initialize component
   */
  BaseComponent.prototype.init = function () {
    if (this.initialized) {
      console.warn(this.name + ' already initialized');
      return;
    }

    if (this.destroyed) {
      console.error(this.name + ' is destroyed, cannot initialize');
      return;
    }

    if (typeof App !== 'undefined' && App.Logger) {
      App.Logger.debug('Initializing component:', this.name);
    }

    try {
      this.beforeInit();
      this.render();
      this.bindEvents();
      this.afterInit();

      this.initialized = true;

      if (typeof App !== 'undefined' && App.Logger) {
        App.Logger.info('Component initialized:', this.name);
      }
    } catch (error) {
      console.error('Error initializing ' + this.name + ':', error);
      if (typeof App !== 'undefined' && App.Logger) {
        App.Logger.error('Component initialization failed:', this.name, error);
      }
    }
  };

  /**
   * Lifecycle hook: Before initialization
   * Override in subclass
   */
  BaseComponent.prototype.beforeInit = function () {
    // Override in subclass
  };

  /**
   * Lifecycle hook: After initialization
   * Override in subclass
   */
  BaseComponent.prototype.afterInit = function () {
    // Override in subclass
  };

  /**
   * Render component
   * Override in subclass
   */
  BaseComponent.prototype.render = function () {
    // Override in subclass
  };

  /**
   * Bind events
   * Override in subclass
   */
  BaseComponent.prototype.bindEvents = function () {
    // Override in subclass
  };

  /**
   * Unbind events
   */
  BaseComponent.prototype.unbindEvents = function () {
    if (this.$el) {
      this.$el.off();
    }
  };

  /**
   * Subscribe to EventBus
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  BaseComponent.prototype.subscribe = function (eventName, callback) {
    if (typeof App === 'undefined' || !App.EventBus) {
      console.error('EventBus not available');
      return;
    }

    var boundCallback = callback.bind(this);
    App.EventBus.on(eventName, boundCallback, this);
    this.events[eventName] = boundCallback;

    if (App.Logger) {
      App.Logger.debug(this.name + ': Subscribed to', eventName);
    }
  };

  /**
   * Publish to EventBus
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   */
  BaseComponent.prototype.publish = function (eventName, data) {
    if (typeof App === 'undefined' || !App.EventBus) {
      console.error('EventBus not available');
      return;
    }

    App.EventBus.emit(eventName, data);

    if (App.Logger) {
      App.Logger.debug(this.name + ': Published', eventName, data);
    }
  };

  /**
   * Get state from StateManager
   * @param {string} key - State key
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  BaseComponent.prototype.getState = function (key, defaultValue) {
    if (typeof App === 'undefined' || !App.StateManager) {
      console.error('StateManager not available');
      return defaultValue;
    }

    return App.StateManager.getState(key, defaultValue);
  };

  /**
   * Set state in StateManager
   * @param {string} key - State key
   * @param {*} value - State value
   */
  BaseComponent.prototype.setState = function (key, value) {
    if (typeof App === 'undefined' || !App.StateManager) {
      console.error('StateManager not available');
      return;
    }

    App.StateManager.setState(key, value);
  };

  /**
   * Show component
   */
  BaseComponent.prototype.show = function () {
    if (this.$el) {
      this.$el.show();
    }
  };

  /**
   * Hide component
   */
  BaseComponent.prototype.hide = function () {
    if (this.$el) {
      this.$el.hide();
    }
  };

  /**
   * Enable component
   */
  BaseComponent.prototype.enable = function () {
    if (this.$el) {
      this.$el.removeClass('disabled').prop('disabled', false);
    }
  };

  /**
   * Disable component
   */
  BaseComponent.prototype.disable = function () {
    if (this.$el) {
      this.$el.addClass('disabled').prop('disabled', true);
    }
  };

  /**
   * Destroy component
   */
  BaseComponent.prototype.destroy = function () {
    if (this.destroyed) {
      return;
    }

    if (typeof App !== 'undefined' && App.Logger) {
      App.Logger.debug('Destroying component:', this.name);
    }

    try {
      this.beforeDestroy();
      this.unbindEvents();

      // Unsubscribe from all EventBus events
      if (typeof App !== 'undefined' && App.EventBus) {
        for (var eventName in this.events) {
          if (this.events.hasOwnProperty(eventName)) {
            App.EventBus.off(eventName, this.events[eventName]);
          }
        }
      }

      this.afterDestroy();

      // Clear references
      this.events = {};
      this.$el = null;
      this.el = null;
      this.options = null;

      this.destroyed = true;
      this.initialized = false;

      if (typeof App !== 'undefined' && App.Logger) {
        App.Logger.info('Component destroyed:', this.name);
      }
    } catch (error) {
      console.error('Error destroying ' + this.name + ':', error);
    }
  };

  /**
   * Lifecycle hook: Before destroy
   * Override in subclass
   */
  BaseComponent.prototype.beforeDestroy = function () {
    // Override in subclass
  };

  /**
   * Lifecycle hook: After destroy
   * Override in subclass
   */
  BaseComponent.prototype.afterDestroy = function () {
    // Override in subclass
  };

  return BaseComponent;
})();