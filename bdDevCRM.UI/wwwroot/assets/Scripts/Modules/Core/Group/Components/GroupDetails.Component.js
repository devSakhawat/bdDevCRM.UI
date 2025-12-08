/*=========================================================
 * Group Details Component
 * File: GroupDetails.Component.js
 * Description: Group details/form wrapper component
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var GroupDetailsComponent = (function () {
  'use strict';

  /**
   * Constructor
   */
  function GroupDetailsComponent(options) {
    // Call parent constructor
    BaseComponent.call(this, options);

    this.controller = options.controller;
    this.name = 'GroupDetailsComponent';

    // Child components (will be set by GroupModule)
    this.infoComponent = null;
    this.permissionComponent = null;

    // Selectors
    this.selectors = {
      tabStrip: '#tabstrip',
      saveButton: '#btnSave',
      clearButton: '#btnClearAll'
    };

    // Tab strip instance
    this.tabStrip = null;
  }

  // Inherit from BaseComponent
  GroupDetailsComponent.prototype = Object.create(BaseComponent.prototype);
  GroupDetailsComponent.prototype.constructor = GroupDetailsComponent;

  /**
   * Before initialization
   */
  GroupDetailsComponent.prototype.beforeInit = function () {
    App.Logger.debug('GroupDetailsComponent: beforeInit');

    // Subscribe to events
    this.subscribe('group:edit-requested', this.onEditRequested.bind(this));
    this.subscribe('group:saved', this.onGroupSaved.bind(this));
  };

  /**
   * Render component
   */
  GroupDetailsComponent.prototype.render = function () {
    App.Logger.debug('GroupDetailsComponent: render');

    // Initialize tab strip
    this.initializeTabStrip();
  };

  /**
   * Initialize Kendo TabStrip
   */
  GroupDetailsComponent.prototype.initializeTabStrip = function () {
    $(this.selectors.tabStrip).kendoTabStrip({
      select: function (e) {
        App.Logger.debug('GroupDetailsComponent: Tab selected', e.item);
      }
    });

    this.tabStrip = $(this.selectors.tabStrip).data("kendoTabStrip");

    if (this.tabStrip) {
      this.tabStrip.select(0); // Select first tab
      App.Logger.info('GroupDetailsComponent: TabStrip initialized');
    } else {
      App.Logger.error('GroupDetailsComponent: Failed to initialize TabStrip');
    }
  };

  /**
   * Bind events
   */
  GroupDetailsComponent.prototype.bindEvents = function () {
    var self = this;

    // Save button click
    $(this.selectors.saveButton).on('click', function (e) {
      e.preventDefault();
      self.onSaveClick();
    });

    // Clear button click
    $(this.selectors.clearButton).on('click', function (e) {
      e.preventDefault();
      self.onClearClick();
    });
  };

  /**
   * Set child components
   */
  GroupDetailsComponent.prototype.setChildComponents = function (infoComponent, permissionComponent) {
    this.infoComponent = infoComponent;
    this.permissionComponent = permissionComponent;

    App.Logger.debug('GroupDetailsComponent: Child components set');
  };

  /**
   * Event: Save button clicked
   */
  GroupDetailsComponent.prototype.onSaveClick = async function () {
    try {
      App.Logger.debug('GroupDetailsComponent: Save clicked');

      // Validate form
      if (!this.validate()) {
        return;
      }

      // Collect data from all components
      var groupData = this.collectFormData();

      App.Logger.debug('GroupDetailsComponent: Collected form data', groupData);

      // Save via controller
      if (this.controller) {
        await this.controller.saveGroup(groupData);
        ToastrMessage.showSuccess('Group saved successfully!');
      }

    } catch (error) {
      App.Logger.error('GroupDetailsComponent: Save failed', error);
      ToastrMessage.showError('Failed to save group');
    }
  };

  /**
   * Event: Clear button clicked
   */
  GroupDetailsComponent.prototype.onClearClick = function () {
    App.Logger.debug('GroupDetailsComponent: Clear clicked');

    // Update button text
    $(this.selectors.saveButton).text('Save');

    // Clear via controller
    if (this.controller) {
      this.controller.clearGroup();
    }

    // Switch to first tab
    if (this.tabStrip) {
      this.tabStrip.select(0);
    }
  };

  /**
   * Event: Edit requested
   */
  GroupDetailsComponent.prototype.onEditRequested = function (data) {
    App.Logger.debug('GroupDetailsComponent: Edit requested', data);

    // Update button text
    $(this.selectors.saveButton).text('Update');

    // Switch to first tab
    if (this.tabStrip) {
      this.tabStrip.select(0);
    }
  };

  /**
   * Event: Group saved
   */
  GroupDetailsComponent.prototype.onGroupSaved = function (data) {
    App.Logger.info('GroupDetailsComponent: Group saved');

    // If it was a create, clear the form
    if (data.isCreate) {
      this.onClearClick();
    }
  };

  /**
   * Validate form
   */
  GroupDetailsComponent.prototype.validate = function () {
    // Validate info component
    if (this.infoComponent && typeof this.infoComponent.validate === 'function') {
      if (!this.infoComponent.validate()) {
        // Switch to info tab
        if (this.tabStrip) {
          this.tabStrip.select(0);
        }
        return false;
      }
    }

    return true;
  };

  /**
   * Collect form data from all components
   */
  GroupDetailsComponent.prototype.collectFormData = function () {
    var data = {};

    // Get data from info component
    if (this.infoComponent && typeof this.infoComponent.getFormData === 'function') {
      var infoData = this.infoComponent.getFormData();
      Object.assign(data, infoData);
    }

    // Get data from permission component (will add later)
    // if (this.permissionComponent && typeof this.permissionComponent.getFormData === 'function') {
    //     var permissionData = this.permissionComponent.getFormData();
    //     Object.assign(data, permissionData);
    // }

    return data;
  };

  return GroupDetailsComponent;
})();