/// <reference path="../../../services/module/core/GroupsService.js.js" />

///// <reference path="accesscontrolpermission.js" />
///// <reference path="actionpermission.js" />
///// <reference path="groupdetails.js" />
///// <reference path="groupinfo.js" />
///// <reference path="grouppermission.js" />
///// <reference path="groupsummary.js" />
///// <reference path="menupermission.js" />
///// <reference path="reportpermission.js" />
///// <reference path="statepermission.js" />

//var allmoduleArray = [];

//var GroupManager = {};

//var GroupHelper = {
//  initGroupHelper: function () {
//    //GroupSummaryHelper.initGroupSummary();
//    //GroupDetailsHelper.initGroupDetails();
//    //GroupInfoHelper.initGroupInfoHelper();

//    GroupDetailsHelper.createTab();
//    GroupInfoHelper.generateModuleForGroupInfo();
//    GroupSummaryHelper.initializeSummaryGrid(); // for groupSummaryManager.GenerateGroupGrid();
//    //GroupSummaryHelper.clickEventForEditGroup();
//    ReportPermissionHelper.GetReportInformation();
//  },
//};

////$(document).ready(function () {
////  GroupHelper.initGroupHelper();
////  GroupPermissionHelper.initModuleCombo();
////});


/*=========================================================
* Group Settings Screen (Complete CRUD with FormHelper)
* File: GroupGroups.js
* Author: devSakhawat
* Date: 2026-01-17
=========================================================*/

var Groups = {

  // Configuration - All ID and setting are here.
  config: {
    // Grid
    gridId: 'gridGroupSummary',

    // Form and Modal
    formId: 'groupForm',
    modalId: 'groupModal',

    // Tab Strip
    tabStripId: 'tabstripGroups',
    groupInfoTabId: 'divGroupId',
    modulePermissionTabId: 'divModulePermission',
    menuPermissionTabId: 'divMenuPermission',
    accessControlTabId: 'divAccessControl',
    statePermissionTabId: 'divStatePermission',
    actionPermissionTabId: 'divActionPermission',
    reportPermissionTabId: 'divReportPermission',

    // Hidden Fields
    hiddenGroupIdId: 'hdnGroupId',

    // Text Fields
    groupNameId: 'txtGroupName',

    // Checkboxes
    isDefaultCheckboxId: 'chkIsDefault',

    // ComboBoxes
    moduleComboId: 'cmbApplicationForModule',

    // Dynamic Checkbox Containers
    moduleCheckboxContainerId: 'dynamicCheckBoxForModule',
    accessCheckboxContainerId: 'checkboxAccess',
    stateCheckboxContainerId: 'checkboxStatePermission',
    actionCheckboxContainerId: 'checkboxActionPermission',
    reportCheckboxContainerId: 'checkboxReportPermission',

    // TreeView
    menuTreeViewId: 'treeview',
    menuContentId: 'menuContent',

    // Loaders
    menuLoaderContainerId: 'menuSectionLoader',
    accessLoaderContainerId: 'accessSectionLoader',

    // Buttons
    btnSave: 'btnSave',
    btnClear: 'btnClear',

    // Report name for grid export
    reportName: 'GroupList'
  },

  /**
   * Module Initialize - Main initialization function
   */
  init: async function () {
    debugger;
    console.log('Initializing Group Settings Module...');

    try {
      // The order of initialization is important
      this.initTab();           // 1. First, create the Tab
      this.initGrid();          // 2. Then the Grid
      await this.initForm();    // 3. Form and all its components

      console.log('Group Settings Module initialized successfully');
    } catch (error) {
      console.error('Error initializing Group Settings:', error);
      MessageManager.notify.error('Failed to initialize Group Settings module');
    }
  },

  /**
 * Initialize Kendo TabStrip
 * Tabs are created and configured
 */
  initTab: function () {
    $("#" + this.config.tabStripId).kendoTabStrip({
      select: (e) => {
        // heighlited Active tab
        $("#" + this.config.tabStripId + " ul li").removeClass("k-state-active");
        $(e.item).addClass("k-state-active");

        // scrollbar setup for Tab content
        setTimeout(() => {
          this.initTabContentScrollbars();
        }, 0);
      }
    });

    // select first tab.
    var tabStrip = $("#" + this.config.tabStripId).data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0);
    } else {
      console.error("Kendo TabStrip is not initialized.");
    }
  },


  /**
   * Initialize Kendo Grid
   * Summary grid তৈরি করা যেখানে সব group দেখাবে
   */
  initGrid: function () {
    GridHelper.loadGrid(this.config.gridId, this.getColumns(), [], {
      toolbar: [
        {
          template: `<button type="button" onclick="GroupSettings.openCreateModal()" 
                    class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">
                    <span class="k-icon k-i-plus"></span>
                    <span class="k-button-text">Create New Group</span>
                  </button>`
        }
      ],
      fileName: this.config.reportName,
      heightConfig: {
        headerHeight: 65,
        footerHeight: 50,
        paddingBuffer: 30
      }
    });

    // Grid এর data source set করা
    this.setGridDataSource();
  },

  /**
 * Get Grid Columns
 * Grid এর column definition
 */
  getColumns: function () {
    return [
      {
        field: "GroupId",
        title: "Group Id",
        hidden: true
      },
      {
        field: "GroupName",
        title: "Group Name",
        width: "70%"
      },
      {
        field: "Actions",
        title: "Actions",
        width: "28%",
        filterable: false,
        sortable: false,
        exportable: false,
        template: GridHelper.createActionColumn({
          idField: 'GroupId',
          editCallback: 'GroupSettings.edit',
          deleteCallback: 'GroupSettings.delete',
          viewCallback: 'GroupSettings.view'
        })
      }
    ];
  },

  /**
 * Set Grid DataSource
 * Grid এ data load করার জন্য datasource configure করা
 */
  setGridDataSource: function () {
    const grid = $("#" + this.config.gridId).data("kendoGrid");
    if (grid) {
      const ds = this.getSummaryGridDataSource();

      // Error handling
      ds.bind("error", function (error) {
        ApiCallManager._handleError(error);
      });

      // Success handling
      ds.bind("requestEnd", function (e) {
        if (e.response && e.response.isSuccess === false) {
          ApiCallManager._handleError(e.response);
        }
      });

      grid.setDataSource(ds);
    }
  },

  /**
 * Get Summary Grid DataSource
 * Grid এর জন্য Kendo DataSource তৈরি করা
 */
  getSummaryGridDataSource: function () {
    return new kendo.data.DataSource({
      transport: {
        read: {
          url: baseApi + "/group-summary",
          type: "POST",
          dataType: "json",
          contentType: "application/json"
        },
        parameterMap: function (data, type) {
          if (type === "read") {
            return JSON.stringify(data);
          }
          return data;
        }
      },
      schema: {
        data: "Items",
        total: "TotalCount",
        model: {
          id: "GroupId",
          fields: {
            GroupId: { type: "number" },
            GroupName: { type: "string" },
            CreatedDate: { type: "date" }
          }
        }
      },
      pageSize: 13,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true
    });
  },

  /**
 * Initialize Form
 * Form এবং এর সব components initialize করা
 */
  initForm: async function () {
    // FormHelper দিয়ে basic form initialize
    FormHelper.initForm(this.config.formId);

    // সব components initialize করা
    await this.initModuleCheckboxes();    // Module permission checkboxes
    this.initModuleCombo();               // Module selection combo
    this.initTreeView();                  // Menu tree view
    await this.initReportPermissions();   // Report permissions

    console.log('Form initialized successfully');
  },

  /**
 * Initialize Module Checkboxes
 * Module permission এর জন্য dynamic checkboxes তৈরি করা
 */
  initModuleCheckboxes: async function () {
    try {
      const modules = await this.getModules();

      let html = "<div class='row'>";
      modules.forEach(module => {
        html += `
        <div class="col-12 mb-1">
          <div class="d-flex justify-content-start align-items-center pb-01">
            <span class="widthSize40_per">${module.ModuleName}</span>
            <input type="checkbox" 
                   class="form-check-input module-checkbox" 
                   id="chkModule${module.ModuleId}"
                   data-module-id="${module.ModuleId}"
                   data-module-name="${module.ModuleName}" />
          </div>
        </div>
      `;
      });
      html += "</div>";

      $("#" + this.config.moduleCheckboxContainerId).html(html);

      // Event listener attach করা
      $("#" + this.config.moduleCheckboxContainerId).find('.module-checkbox')
        .on('change', (e) => {
          const moduleId = $(e.target).data('module-id');
          const moduleName = $(e.target).data('module-name');
          const controlId = $(e.target).attr('id');
          this.onModuleCheckboxChange(moduleId, moduleName, controlId);
        });

    } catch (error) {
      console.error('Error loading modules:', error);
      MessageManager.notify.error('Failed to load modules');
    }
  },

  /**
 * Initialize Module ComboBox
 * Module selection এর জন্য ComboBox
 */
  initModuleCombo: function () {
    $("#" + this.config.moduleComboId).kendoComboBox({
      placeholder: "Select a module",
      dataTextField: "ModuleName",
      dataValueField: "ModuleId",
      dataSource: [],
      filter: "contains",
      suggest: true,
      change: this.onModuleComboChange.bind(this)
    });
  },

  /**
   * Initialize TreeView for Menu Permission
   * Menu permission এর জন্য TreeView initialize করা
   */
  initTreeView: function () {
    // প্রথমে empty TreeView তৈরি করা
    if ($("#" + this.config.menuTreeViewId).length === 0) {
      $("#" + this.config.menuContentId).html('<div id="' + this.config.menuTreeViewId + '"></div>');
    }

    $("#" + this.config.menuTreeViewId).kendoTreeView({
      checkboxes: {
        checkChildren: true
      },
      dataSource: []
    });
  },

  /**
 * Initialize Report Permissions
 * Report permission checkboxes load করা
 */
  initReportPermissions: async function () {
    try {
      const reports = await this.getReports();

      let html = "<div class='row'>";
      reports.forEach(report => {
        html += `
        <div class="col-12 mb-1">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <input type="checkbox" 
                     class="form-check-input me-2" 
                     id="chkReport${report.ReportHeaderId}"
                     data-report-id="${report.ReportHeaderId}"
                     data-report-name="${report.ReportHeader}" />
              <span>${report.ReportHeader}</span>
            </div>
          </div>
        </div>
      `;
      });
      html += "</div>";

      $("#" + this.config.reportCheckboxContainerId).html(html);

      // Event listener
      $("#" + this.config.reportCheckboxContainerId).find('input[type="checkbox"]')
        .on('change', (e) => {
          const reportId = $(e.target).data('report-id');
          const reportName = $(e.target).data('report-name');
          this.onReportCheckboxChange(reportId, reportName);
        });

    } catch (error) {
      console.error('Error loading reports:', error);
      MessageManager.notify.error('Failed to load reports');
    }
  },

  /**
 * Initialize Tab Content Scrollbars
 * Tab content এর জন্য custom scrollbar setup করা
 */
  initTabContentScrollbars: function () {
    const tabStrip = $("#" + this.config.tabStripId).data("kendoTabStrip");
    if (!tabStrip) return;

    const $selected = tabStrip.select();
    if (!$selected || $selected.length === 0) return;

    const selectedIndex = $selected.index();
    if (selectedIndex < 0) return;

    const contentElement = tabStrip.contentElement(selectedIndex);
    if (!contentElement) return;

    const $content = $(contentElement);
    if ($content.length === 0) return;

    // Height calculation
    const windowHeight = $("#" + this.config.modalId).height() || 0;
    const legendHeight = 40;
    const tabHeaderHeight = 50;
    const buttonPanelHeight = 60;
    const padding = 20;

    const contentHeight = Math.max(150, windowHeight - legendHeight - tabHeaderHeight - buttonPanelHeight - padding);

    // Set content height
    $content.css({
      height: contentHeight + "px",
      maxHeight: contentHeight + "px",
      overflow: "hidden"
    });

    // Create/Reuse wrapper
    let $scrollHost = $content.children(".tabContentScroll");
    if ($scrollHost.length === 0) {
      $scrollHost = $('<div class="tabContentScroll"></div>');
      $scrollHost.append($content.children());
      $content.append($scrollHost);
    }

    $scrollHost.css({
      height: contentHeight + "px",
      maxHeight: contentHeight + "px"
    });

    // Destroy previous SimpleBar
    if ($scrollHost[0].SimpleBar) {
      $scrollHost[0].SimpleBar.unMount();
    }

    // Init SimpleBar
    if (typeof SimpleBar !== "undefined") {
      new SimpleBar($scrollHost[0], {
        autoHide: false,
        scrollbarMaxSize: 50
      });
    }
  },

};


// Register with ModuleRegistry
if (typeof ModuleRegistry !== 'undefined') {
  ModuleRegistry.register('Groups', Groups, {
    dependencies: ['GroupsService', 'ApiCallManager', 'MessageManager', 'FormHelper', 'GridHelper'],
    priority: 5,
    autoInit: false,
    route: AppConfig.getFrontendRoute("intGroup") // Assuming a route for user pages
  });

  console.log('User registered');
} else {
  console.error('ModuleRegistry not loaded! Cannot register User');
}