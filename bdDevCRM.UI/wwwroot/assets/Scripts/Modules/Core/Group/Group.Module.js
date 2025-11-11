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
    dependencies: ['GroupService']
  };

  // Initialize module
  function _init(options = {}) {
    if (_initialized) {
      console.warn('Group module already initialized');
      return;
    }

    App.Logger.info('Initializing Group module...');

    // Check dependencies
    if (!_checkDependencies()) {
      App.Logger.error('Group module dependencies not met');
      return;
    }

    // Get service from DI
    const groupService = App.DI.resolve('GroupService');

    // Create controller
    _controller = new GroupController({
      service: groupService
    });

    // Initialize components
    _initializeComponents();

    // Setup module events
    _setupEvents();

    _initialized = true;
    App.Logger.info('Group module initialized successfully');
  }

  function _checkDependencies() {
    return _config.dependencies.every(dep => App.DI.has(dep));
  }

  function _initializeComponents() {
    // Initialize Summary Grid
    _components.summary = new GroupSummaryComponent({
      el: '#divSummary',
      gridId: 'gridSummary',
      controller: _controller
    });
    _components.summary.init();

    // Initialize Details Form
    _components.details = new GroupDetailsComponent({
      el: '#divDetails',
      controller: _controller
    });
    _components.details.init();

    // Initialize Info Component
    _components.info = new GroupInfoComponent({
      el: '#divGroupId',
      controller: _controller
    });
    _components.info.init();

    // Initialize Permission Components
    _components.modulePermission = new ModulePermissionComponent({
      el: '#divGroupPermision',
      controller: _controller
    });
    _components.modulePermission.init();

    _components.menuPermission = new MenuPermissionComponent({
      el: '#divMenuPermission',
      controller: _controller
    });
    _components.menuPermission.init();
  }

  function _setupEvents() {
    // Listen to group events
    App.EventBus.on('group:selected', _onGroupSelected);
    App.EventBus.on('group:saved', _onGroupSaved);
    App.EventBus.on('group:deleted', _onGroupDeleted);
  }

  function _onGroupSelected(data) {
    App.Logger.debug('Group selected:', data);
    _controller.loadGroup(data.groupId);
  }

  function _onGroupSaved(data) {
    App.Logger.debug('Group saved:', data);
    ToastrMessage.showSuccess('Group saved successfully');

    // Refresh grid
    if (_components.summary) {
      _components.summary.refreshGrid();
    }
  }

  function _onGroupDeleted(data) {
    App.Logger.debug('Group deleted:', data);
    ToastrMessage.showSuccess('Group deleted successfully');

    // Refresh grid
    if (_components.summary) {
      _components.summary.refreshGrid();
    }
  }

  // Destroy module
  function _destroy() {
    if (!_initialized) return;

    App.Logger.info('Destroying Group module...');

    // Destroy all components
    Object.values(_components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });

    // Clean up events
    App.EventBus.off('group:selected', _onGroupSelected);
    App.EventBus.off('group:saved', _onGroupSaved);
    App.EventBus.off('group:deleted', _onGroupDeleted);

    _components = {};
    _controller = null;
    _initialized = false;

    App.Logger.info('Group module destroyed');
  }

  // Public API
  return {
    init: _init,
    destroy: _destroy,

    getComponent: function (name) {
      return _components[name];
    },

    getController: function () {
      return _controller;
    },

    config: _config
  };
})();

// Register module with App
App.registerModule('Group', GroupModule);