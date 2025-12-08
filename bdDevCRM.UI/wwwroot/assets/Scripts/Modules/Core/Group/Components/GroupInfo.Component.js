/*=========================================================
 * Group Info Component
 * File: GroupInfo.Component.js
 * Description: Group information form component
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var GroupInfoComponent = (function () {
  'use strict';

  /**
   * Constructor
   */
  function GroupInfoComponent(options) {
    // Call parent constructor
    BaseComponent.call(this, options);

    this.controller = options.controller;
    this.name = 'GroupInfoComponent';

    // Selectors
    this.selectors = {
      groupId: '#hdnGroupId',
      groupName: '#txtGroupName',
      isDefault: '#chkIsDefault',
      moduleCheckbox: '[id^="chkModule"]',
      moduleContainer: '#dynamicCheckBoxForModule'
    };

    // Data
    this.allModules = [];
  }

  // Inherit from BaseComponent
  GroupInfoComponent.prototype = Object.create(BaseComponent.prototype);
  GroupInfoComponent.prototype.constructor = GroupInfoComponent;

  /**
   * Before initialization
   */
  GroupInfoComponent.prototype.beforeInit = function () {
    App.Logger.debug('GroupInfoComponent: beforeInit');

    // Subscribe to events
    this.subscribe('group:loaded', this.onGroupLoaded.bind(this));
    this.subscribe('group:cleared', this.onGroupCleared.bind(this));
    this.subscribe('group:saved', this.onGroupSaved.bind(this));
  };

  /**
   * Render component
   */
  GroupInfoComponent.prototype.render = function () {
    App.Logger.debug('GroupInfoComponent: render');

    // Initialize modules checkboxes
    this.loadModules();
  };

  /**
   * Bind events
   */
  GroupInfoComponent.prototype.bindEvents = function () {
    var self = this;

    // Group name change
    $(this.selectors.groupName).on('change', function () {
      self.onGroupNameChanged();
    });

    // Is default change
    $(this.selectors.isDefault).on('change', function () {
      self.onIsDefaultChanged();
    });

    // Module checkbox change
    this.$el.on('change', this.selectors.moduleCheckbox, function (e) {
      self.onModuleToggled(e);
    });
  };

  /**
   * Load modules
   */
  GroupInfoComponent.prototype.loadModules = async function () {
    try {
      App.Logger.debug('GroupInfoComponent: Loading modules...');

      // Get modules from API
      var modules = await this.fetchModules();
      this.allModules = modules;

      // Render module checkboxes
      this.renderModuleCheckboxes(modules);

      App.Logger.info('GroupInfoComponent: Modules loaded', modules.length);

    } catch (error) {
      App.Logger.error('GroupInfoComponent: Failed to load modules', error);
      ToastrMessage.showError('Failed to load modules');
    }
  };

  /**
   * Fetch modules from API
   */
  GroupInfoComponent.prototype.fetchModules = async function () {
    // Use existing API call
    var serviceUrl = "/modules";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
        resolve(jsonData);
      }

      function onFailed(jqXHR, textStatus, errorThrown) {
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: jqXHR.responseJSON?.statusCode + ": " + jqXHR.responseJSON?.message,
          type: 'error',
        });
        reject(errorThrown);
      }

      AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, "", false, false, onSuccess, onFailed);
    });
  };

  /**
   * Render module checkboxes
   */
  GroupInfoComponent.prototype.renderModuleCheckboxes = function (modules) {
    var html = '<div class="row">';

    for (var i = 0; i < modules.length; i++) {
      html += '<div class="col-12 mb-1">';
      html += '  <div class="d-flex justify-content-start align-items-center pb-01">';
      html += '    <span class="widthSize40_per">' + modules[i].ModuleName + '</span>';
      html += '    <input type="checkbox" class="form-check-input" ';
      html += '           id="chkModule' + modules[i].ModuleId + '" ';
      html += '           data-module-id="' + modules[i].ModuleId + '" ';
      html += '           data-module-name="' + modules[i].ModuleName + '" />';
      html += '  </div>';
      html += '</div>';
    }

    html += '</div>';

    $(this.selectors.moduleContainer).html(html);
  };

  /**
   * Event: Group name changed
   */
  GroupInfoComponent.prototype.onGroupNameChanged = function () {
    var groupName = $(this.selectors.groupName).val();

    App.Logger.debug('GroupInfoComponent: Group name changed', groupName);

    // Update state
    this.setState('group:name', groupName);

    // Publish event
    this.publish('groupinfo:name-changed', { groupName: groupName });
  };

  /**
   * Event: Is default changed
   */
  GroupInfoComponent.prototype.onIsDefaultChanged = function () {
    var isDefault = $(this.selectors.isDefault).is(':checked');

    App.Logger.debug('GroupInfoComponent: Is default changed', isDefault);

    // Update state
    this.setState('group:isDefault', isDefault);

    // Publish event
    this.publish('groupinfo:isdefault-changed', { isDefault: isDefault });
  };

  /**
   * Event: Module toggled
   */
  GroupInfoComponent.prototype.onModuleToggled = function (e) {
    var $checkbox = $(e.target);
    var moduleId = $checkbox.data('module-id');
    var moduleName = $checkbox.data('module-name');
    var checked = $checkbox.is(':checked');

    App.Logger.debug('GroupInfoComponent: Module toggled', moduleId, checked);

    // Publish event for other components
    this.publish('module:toggled', {
      moduleId: moduleId,
      moduleName: moduleName,
      checked: checked
    });
  };

  /**
   * Event: Group loaded
   */
  GroupInfoComponent.prototype.onGroupLoaded = function (data) {
    var group = data.group;

    App.Logger.debug('GroupInfoComponent: Group loaded', group);

    // Update UI
    $(this.selectors.groupId).val(group.GroupId);
    $(this.selectors.groupName).val(group.GroupName);
    $(this.selectors.isDefault).prop('checked', group.IsDefault == 1);

    // Check module checkboxes
    if (group.ModuleList && group.ModuleList.length > 0) {
      group.ModuleList.forEach(function (module) {
        $('#chkModule' + module.ReferenceID).prop('checked', true);
      });
    }
  };

  /**
   * Event: Group cleared
   */
  GroupInfoComponent.prototype.onGroupCleared = function () {
    App.Logger.debug('GroupInfoComponent: Group cleared');

    // Clear form
    $(this.selectors.groupId).val('0');
    $(this.selectors.groupName).val('');
    $(this.selectors.isDefault).prop('checked', false);
    $(this.selectors.moduleCheckbox).prop('checked', false);

    // Clear validation
    var $form = this.$el.find('form');
    if ($form.length > 0 && $form.data('kendoValidator')) {
      $form.data('kendoValidator').hideMessages();
    }
  };

  /**
   * Event: Group saved
   */
  GroupInfoComponent.prototype.onGroupSaved = function (data) {
    App.Logger.info('GroupInfoComponent: Group saved', data);

    // Update group ID if it was a new group
    if (data.isCreate && data.group) {
      $(this.selectors.groupId).val(data.group.GroupId);
    }
  };

  /**
   * Get form data
   */
  GroupInfoComponent.prototype.getFormData = function () {
    var groupId = $(this.selectors.groupId).val();
    var groupName = $(this.selectors.groupName).val();
    var isDefault = $(this.selectors.isDefault).is(':checked') ? 1 : 0;

    // Get selected modules
    var moduleList = [];
    $(this.selectors.moduleCheckbox + ':checked').each(function () {
      var $cb = $(this);
      moduleList.push({
        ReferenceID: $cb.data('module-id'),
        ModuleName: $cb.data('module-name'),
        PermissionTableName: 'Module'
      });
    });

    return {
      GroupId: parseInt(groupId) || 0,
      GroupName: groupName,
      IsDefault: isDefault,
      ModuleList: moduleList
    };
  };

  /**
   * Validate form
   */
  GroupInfoComponent.prototype.validate = function () {
    var data = this.getFormData();

    // Use Kendo validator if available
    var $form = this.$el.find('form');
    if ($form.length > 0) {
      var validator = $form.data('kendoValidator');
      if (!validator) {
        validator = $form.kendoValidator().data('kendoValidator');
      }

      if (!validator.validate()) {
        return false;
      }
    }

    // Custom validation
    if (!data.GroupName || data.GroupName.trim() === '') {
      ToastrMessage.showWarning('Group name is required');
      $(this.selectors.groupName).focus();
      return false;
    }

    if (data.ModuleList.length === 0) {
      ToastrMessage.showWarning('Please select at least one module');
      return false;
    }

    return true;
  };

  return GroupInfoComponent;
})();