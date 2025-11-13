/*=========================================================
 * Group Summary Component
 * File: GroupSummary.Component.js
 * Description: Group grid/summary component
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var GroupSummaryComponent = (function () {
  'use strict';

  /**
   * Constructor
   */
  function GroupSummaryComponent(options) {
    // Call parent constructor
    BaseComponent.call(this, options);

    this.controller = options.controller;
    this.gridId = options.gridId || 'gridSummary';
    this.name = 'GroupSummaryComponent';

    // Grid instance
    this.grid = null;
  }

  // Inherit from BaseComponent
  GroupSummaryComponent.prototype = Object.create(BaseComponent.prototype);
  GroupSummaryComponent.prototype.constructor = GroupSummaryComponent;

  /**
   * Before initialization
   */
  GroupSummaryComponent.prototype.beforeInit = function () {
    App.Logger.debug('GroupSummaryComponent: beforeInit');

    // Subscribe to events
    this.subscribe('group:saved', this.onGroupSaved.bind(this));
    this.subscribe('group:deleted', this.onGroupDeleted.bind(this));
  };

  /**
   * Render component
   */
  GroupSummaryComponent.prototype.render = function () {
    App.Logger.debug('GroupSummaryComponent: render');

    // Initialize Kendo Grid
    this.initializeGrid();
  };

  /**
   * Initialize Kendo Grid
   */
  GroupSummaryComponent.prototype.initializeGrid = function () {
    var self = this;

    var gridOptions = {
      dataSource: this.getDataSource(),
      navigatable: true,
      height: 700,
      width: "100%",
      filterable: true,
      sortable: true,
      pageable: {
        refresh: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      toolbar: [
        { name: "excel" }
      ],
      excel: {
        fileName: "GroupExport.xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true
      },
      columns: this.getColumns(),
      editable: false,
      selectable: "row"
    };

    // Initialize grid
    $('#' + this.gridId).kendoGrid(gridOptions);
    this.grid = $('#' + this.gridId).data("kendoGrid");

    App.Logger.info('GroupSummaryComponent: Grid initialized');
  };

  /**
   * Get grid data source
   */
  GroupSummaryComponent.prototype.getDataSource = function () {
    return VanillaApiManager.GenericGridDataSource({
      apiUrl: baseApi + "/group-summary",
      requestType: "POST",
      async: true,
      modelFields: {
        createdDate: { type: "date" }
      },
      pageSize: 13,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Items",
      schemaTotal: "TotalCount"
    });
  };

  /**
   * Get grid columns
   */
  GroupSummaryComponent.prototype.getColumns = function () {
    var self = this;

    return [
      {
        field: "GroupId",
        title: "Group Id",
        width: 0,
        hidden: true
      },
      {
        field: "GroupName",
        title: "Group Name",
        width: "70%"
      },
      {
        field: "Edit",
        title: "Actions",
        filterable: false,
        width: "28%",
        template: function (dataItem) {
          return '<input type="button" class="btn btn-outline-dark btn-edit-group" ' +
            'style="cursor: pointer; margin-right: 5px;" ' +
            'value="Edit" data-uid="' + dataItem.uid + '" />';
        },
        sortable: false,
        exportable: false
      }
    ];
  };

  /**
   * Bind events
   */
  GroupSummaryComponent.prototype.bindEvents = function () {
    var self = this;

    // Edit button click
    $('#' + this.gridId).on('click', '.btn-edit-group', function (e) {
      e.preventDefault();
      self.onEditButtonClick(e);
    });

    // Row double click
    $('#' + this.gridId).on('dblclick', 'tbody tr', function (e) {
      self.onRowDoubleClick(e);
    });
  };

  /**
   * Event: Edit button clicked
   */
  GroupSummaryComponent.prototype.onEditButtonClick = function (e) {
    if (!this.grid) return;

    var $button = $(e.target);
    var uid = $button.data('uid');
    var dataItem = this.grid.dataSource.getByUid(uid);

    if (dataItem) {
      App.Logger.debug('GroupSummaryComponent: Edit clicked', dataItem);
      this.editGroup(dataItem);
    }
  };

  /**
   * Event: Row double clicked
   */
  GroupSummaryComponent.prototype.onRowDoubleClick = function (e) {
    if (!this.grid) return;

    var row = $(e.target).closest('tr');
    var dataItem = this.grid.dataItem(row);

    if (dataItem) {
      App.Logger.debug('GroupSummaryComponent: Row double clicked', dataItem);
      this.editGroup(dataItem);
    }
  };

  /**
   * Edit group
   */
  GroupSummaryComponent.prototype.editGroup = function (dataItem) {
    // Clear form first
    this.publish('group:edit-requested', { group: dataItem });

    // Load group details
    if (this.controller) {
      this.controller.loadGroup(dataItem.GroupId);
    }

    // Load permissions
    this.loadGroupPermissions(dataItem.GroupId);
  };

  /**
   * Load group permissions
   */
  GroupSummaryComponent.prototype.loadGroupPermissions = async function (groupId) {
    try {
      App.Logger.debug('GroupSummaryComponent: Loading permissions for group', groupId);

      var serviceUrl = "/grouppermission/key/";
      var jsonParams = $.param({ groupId: groupId });

      var permissions = await new Promise(function (resolve, reject) {
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

        AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, false, false, onSuccess, onFailed);
      });

      // Publish permissions loaded event
      this.publish('group:permissions-loaded', {
        groupId: groupId,
        permissions: permissions
      });

      App.Logger.info('GroupSummaryComponent: Permissions loaded', permissions.length);

    } catch (error) {
      App.Logger.error('GroupSummaryComponent: Failed to load permissions', error);
    }
  };

  /**
   * Event: Group saved
   */
  GroupSummaryComponent.prototype.onGroupSaved = function (data) {
    App.Logger.info('GroupSummaryComponent: Group saved, refreshing grid');
    this.refreshGrid();
  };

  /**
   * Event: Group deleted
   */
  GroupSummaryComponent.prototype.onGroupDeleted = function (data) {
    App.Logger.info('GroupSummaryComponent: Group deleted, refreshing grid');
    this.refreshGrid();
  };

  /**
   * Refresh grid
   */
  GroupSummaryComponent.prototype.refreshGrid = function () {
    if (this.grid) {
      this.grid.dataSource.read();
      App.Logger.debug('GroupSummaryComponent: Grid refreshed');
    }
  };

  /**
   * Get selected group
   */
  GroupSummaryComponent.prototype.getSelectedGroup = function () {
    if (!this.grid) return null;

    var selected = this.grid.select();
    if (selected.length > 0) {
      return this.grid.dataItem(selected);
    }

    return null;
  };

  return GroupSummaryComponent;
})();