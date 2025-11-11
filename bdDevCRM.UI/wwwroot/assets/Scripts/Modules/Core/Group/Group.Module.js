/*=========================================================
 * Group Module
 * File: Group.Module.js
 * Description: Group feature module definition
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var GroupModule = (function () {
  'use strict';

  // Private properties
  var _components = {};
  var _controller = null;
  var _initialized = false;

  // Module configuration
  var _config = {
    name: 'Group',
    version: '1.0.0',
    author: 'devSakhawat',
    dependencies: []
  };

  /**
   * Initialize module
   */
  function _init(options) {
    if (_initialized) {
      console.warn('GroupModule: Already initialized');
      return;
    }

    options = options || {};

    App.Logger.info('GroupModule: Initializing...');

    try {
      // Create controller
      _controller = new GroupController(options);

      // Initialize components
      _initializeComponents();

      // Setup module events
      _setupEvents();

      _initialized = true;

      App.Logger.info('GroupModule: Initialized successfully');

      // Emit event
      if (App.EventBus) {
        App.EventBus.emit('module:initialized', { name: _config.name });
      }

    } catch (error) {
      App.Logger.error('GroupModule: Initialization failed', error);
      throw error;
    }
  }

  /**
   * Initialize components
   */
  function _initializeComponents() {
    App.Logger.debug('GroupModule: Initializing components...');

    // Initialize Summary Grid
    _components.summary = new GroupSummaryComponent({
      el: '#divSummary',
      gridId: 'gridSummary',
      controller: _controller
    });
    _components.summary.init();

    // Initialize Details Container
    _components.details = new GroupDetailsComponent({
      el: '#divDetails',
      controller: _controller
    });
    _components.details.init();

    // Initialize Group Info Component
    _components.info = new GroupInfoComponent({
      el: '#divGroupId',
      controller: _controller
    });
    _components.info.init();

    // Set child components in details
    _components.details.setChildComponents(_components.info, null);

    App.Logger.info('GroupModule: Components initialized');
  }

  /**
   * Setup module events
   */
  function _setupEvents() {
    App.Logger.debug('GroupModule: Setting up events...');

    // Listen to application events
    App.EventBus.on('group:selected', _onGroupSelected);
    App.EventBus.on('group:saved', _onGroupSaved);
    App.EventBus.on('group:deleted', _onGroupDeleted);

    App.Logger.debug('GroupModule: Events setup complete');
  }

  /**
   * Event: Group selected
   */
  function _onGroupSelected(data) {
    App.Logger.debug('GroupModule: Group selected', data);

    if (_controller) {
      _controller.loadGroup(data.groupId);
    }
  }

  /**
   * Event: Group saved
   */
  function _onGroupSaved(data) {
    App.Logger.info('GroupModule: Group saved', data);
  }

  /**
   * Event: Group deleted
   */
  function _onGroupDeleted(data) {
    App.Logger.info('GroupModule: Group deleted', data);
  }

  /**
   * Destroy module
   */
  function _destroy() {
    if (!_initialized) {
      return;
    }

    App.Logger.info('GroupModule: Destroying...');

    // Destroy all components
    Object.keys(_components).forEach(function (key) {
      var component = _components[key];
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });

    // Clean up events
    App.EventBus.off('group:selected', _onGroupSelected);
    App.EventBus.off('group:saved', _onGroupSaved);
    App.EventBus.off('group:deleted', _onGroupDeleted);

    // Clear references
    _components = {};
    _controller = null;
    _initialized = false;

    App.Logger.info('GroupModule: Destroyed');
  }

  // Public API
  return {
    /**
     * Module configuration
     */
    config: _config,

    /**
     * Initialize module
     */
    init: _init,

    /**
     * Destroy module
     */
    destroy: _destroy,

    /**
     * Get component by name
     */
    getComponent: function (name) {
      return _components[name] || null;
    },

    /**
     * Get controller
     */
    getController: function () {
      return _controller;
    },

    /**
     * Check if initialized
     */
    isInitialized: function () {
      return _initialized;
    }
  };
})();

// Register module with App
if (typeof App !== 'undefined') {
  App.registerModule('Group', GroupModule);
}