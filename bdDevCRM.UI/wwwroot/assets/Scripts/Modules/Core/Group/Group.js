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
    // Details
    detailsDivId: 'divdetailsForDetails',

    // Grid
    groupGridId: 'gridGroupSummary',

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
    //console.log('Initializing Group Settings Module...');

    try {
      debugger;
      // The order of initialization is important
      this.initTab();           // 1. First, create the Tab
      this.initGrid();          // 2. Then the Grid
      await this.initForm();    // 3. Form and all its components
      FormHelper.generateHeightWithoutHeaderAndFooter(this.config.detailsDivId, 80, 50)

      //console.log('Group Settings Module initialized successfully');
    } catch (error) {
      //console.error('Error initializing Group Settings:', error);
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
        //setTimeout(() => {
        //  this.initTabContentScrollbars();
        //}, 0);
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
   */
  initGrid: function () {
    GridHelper.loadGrid(this.config.groupGridId, this.getColumns(), [], {
      toolbar: [
        //{
        //  template: `<button type="button" onclick="GroupSettings.openCreateModal()" 
        //            class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">
        //            <span class="k-icon k-i-plus"></span>
        //            <span class="k-button-text">Create New Group</span>
        //          </button>`
        //}
      ],
      fileName: this.config.reportName,
      heightConfig: {
        headerHeight: 65,
        footerHeight: 50,
        paddingBuffer: 30
      },
      width: '100%'
    });

    this.setGridDataSource();
  },

  /**
 * Get Grid Columns
 */
  getColumns: function () {
    return columns = [
      { field: "GroupId", title: "Group Id", width: 0, hidden: true },
      { field: "GroupName", title: "Group Name", width: "70%" },
      {
        field: "Actions",
        title: "Actions",
        width: '30%',
        template: GridHelper.createActionColumn({
          idField: 'GroupId',
          editCallback: 'Groups.edit',
          //deleteCallback: 'Groups.delete',
          //viewCallback: 'Groups.view'
        })
      }
    ];
  },
  
  /**
 * Set Grid DataSource
 */
  setGridDataSource: function () {
    const grid = $("#" + this.config.groupGridId).data("kendoGrid");
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
 */
  getSummaryGridDataSource: function () {
    return GroupService.getGridDataSource();
  },

  /**
 * Initialize Form
 */
  initForm: async function () {
    FormHelper.initForm(this.config.formId);

    await this.initModuleCheckboxes();    // Module permission checkboxes
    this.initModuleCombo();               // Module selection combo
    //this.initTreeView();                  // Menu tree view
    //await this.initReportPermissions();   // Report permissions

    //await this.populateModuleCombo();
    console.log('Form initialized successfully');
  },

  /**
 * Initialize Module Checkboxes
 */
  initModuleCheckboxes: async function () {
    try {
      const modules = await GroupService.getModules();
      debugger;
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
 */
  initModuleCombo: function () {
    $("#" + this.config.moduleComboId).kendoComboBox({
      placeholder: "Select a module",
      dataTextField: "ModuleName",
      dataValueField: "ModuleId",
      dataSource: [],
      filter: "contains",
      suggest: true,
      //change: this.onModuleComboChange.bind(this)
    });
  },

  /**
   * Load companies for dropdowns
   */
  populateModuleCombo: async function () {
    try {
      const combo = $('#' + this.config.moduleComboId).data('kendoComboBox');
      if (combo) {
        const modules = await GroupService.getModules();
        combo.setDataSource(modules);
      }
    } catch (error) {
      console.log('Error loading modules :', error);
    }
  },

  /**
   * Initialize TreeView for Menu Permission
   */
  initTreeView: function () {
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
 */
  initReportPermissions: async function () {
    try {
      //const reports = await this.getReports();

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

  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  /**
 * Module Arrays - For permission track 
 */
  moduleArray: [],
  allModuleArray: [],

  /**
   * On Module Checkbox Change
   * Module checkbox এ click করলে এই function call হবে
   */
  onModuleCheckboxChange: function (moduleId, moduleName, controlId) {
    debugger;
    const isChecked = $("#" + controlId).is(':checked');

    if (isChecked) {
      // Module select করা হলে array তে add করব
      this.addModuleToArray(moduleId, moduleName);
    } else {
      // Module unselect করা হলে array থেকে remove করব
      this.removeModuleFromArray(moduleId);
    }

    // Module ComboBox update করব
    this.updateModuleComboBox();
  },

  /**
   * Add Module to Array
   * Module কে array তে যোগ করা
   */
  addModuleToArray: function (moduleId, moduleName) {
    // Check করব module already আছে কিনা
    const exists = this.moduleArray.some(item => item.ModuleId === moduleId);

    if (!exists) {
      const moduleObj = {
        ModuleId: moduleId,
        ModuleName: moduleName,
        ReferenceID: moduleId,
        PermissionTableName: "Module"
      };

      this.moduleArray.push(moduleObj);
      console.log('Module added:', moduleObj);
    }
  },

  /**
   * Remove Module from Array
   * Module কে array থেকে সরানো
   */
  removeModuleFromArray: function (moduleId) {
    // Module remove করার আগে এর সব dependent data remove করব
    this.removeMenusByModuleId(moduleId);
    this.removeAccessByModuleId(moduleId);

    // Module array থেকে remove করব
    this.moduleArray = this.moduleArray.filter(item => item.ModuleId !== moduleId);

    console.log('Module removed:', moduleId);
  },

  /**
   * Update Module ComboBox
   * Module ComboBox এ selected modules দেখানো
   */
  updateModuleComboBox: function () {
    const combo = $("#" + this.config.moduleComboId).data("kendoComboBox");

    if (combo) {
      // DataSource update করব
      combo.setDataSource(this.moduleArray);

      // Event unbind করে আবার bind করব (duplicate event এড়ানোর জন্য)
      combo.unbind("select");
      combo.bind("select", this.onModuleComboSelect.bind(this));
    }
  },

  /**
   * On Module Combo Select
   * ComboBox থেকে module select করলে menu এবং access load করব
   */
  onModuleComboSelect: async function (e) {
    debugger;
    try {
      const dataItem = this.dataItem(e.item.index());
      const moduleId = dataItem.ModuleId;

      console.log('Module selected from combo:', moduleId);

      // Parallel এ menu এবং access load করব
      await Promise.all([
        this.loadMenuTreeByModuleId(moduleId),
        this.loadAccessControlByModuleId(moduleId)
      ]);

      // ComboBox value set করব
      const combo = $("#" + this.config.moduleComboId).data("kendoComboBox");
      if (combo) {
        combo.value(moduleId);
      }

    } catch (error) {
      console.error('Error in module combo select:', error);
      MessageManager.notify.error('Failed to load module data');
    }
  },

  /**
   * On Module Combo Change
   * ComboBox change event handler
   */
  onModuleComboChange: async function (e) {
    const moduleId = e.sender.value();

    if (!moduleId) {
      return;
    }

    console.log('Module combo changed:', moduleId);

    try {
      // Menu এবং Access Control load করব
      await Promise.all([
        this.loadMenuTreeByModuleId(moduleId),
        this.loadAccessControlByModuleId(moduleId)
      ]);
    } catch (error) {
      console.error('Error loading module data:', error);
    }
  },

  /**
   * Load Menu Tree by Module ID
   * নির্দিষ্ট module এর menu tree load করা
   */
  loadMenuTreeByModuleId: async function (moduleId) {
    const loaderContainer = $('#' + this.config.menuLoaderContainerId);
    const loader = loaderContainer.kendoLoader({
      size: 'large',
      type: 'infinite-spinner',
      themeColor: 'primary'
    }).data("kendoLoader");

    try {
      // Loader show করব
      $("#" + this.config.menuContentId).css("min-height", "50px");
      loaderContainer.show();
      loader.show();

      // Previous tree remove করব
      $("#" + this.config.menuTreeViewId).remove();
      $("#" + this.config.menuContentId).html('<div id="' + this.config.menuTreeViewId + '"></div>');

      // API থেকে menus load করব
      const menus = await GroupService.getMenusByModuleId(moduleId);

      if (!menus || menus.length === 0) {
        console.warn('No menus found for module:', moduleId);
        return;
      }

      // Hierarchical data structure তৈরি করব
      const treeData = this.buildMenuHierarchy(menus);

      // TreeView initialize করব
      const treeView = $("#" + this.config.menuTreeViewId).kendoTreeView({
        checkboxes: {
          checkChildren: true,
          template: "<input type='checkbox' id='chkMenu#= item.id #' />"
        },
        dataSource: treeData,
        check: this.onMenuCheck.bind(this),
        dataBound: function (e) {
          // Auto expand করব
          if (this.expandRoot) {
            this.expand(e.node.find(".k-item"));
          }
        }
      }).data("kendoTreeView");

      // Existing menu selection restore করব
      this.restoreMenuSelection();

      console.log('Menu tree loaded successfully');

    } catch (error) {
      console.error('Error loading menu tree:', error);
      MessageManager.notify.error('Failed to load menus');
    } finally {
      loader.hide();
      $("#" + this.config.menuContentId).css("min-height", "auto");
      loaderContainer.hide();
    }
  },

  /**
   * Build Menu Hierarchy
   * Flat menu list থেকে hierarchical structure তৈরি করা
   */
  buildMenuHierarchy: function (menus) {
    const hierarchy = [];

    // Parent menus filter করব (যাদের ParentMenu null বা 0)
    const parentMenus = menus.filter(m => !m.ParentMenu || m.ParentMenu === 0);

    parentMenus.forEach(parent => {
      const menuItem = {
        id: parent.MenuId,
        text: parent.MenuName,
        value: parent.MenuId,
        expanded: true,
        items: this.getChildMenus(parent.MenuId, menus)
      };

      hierarchy.push(menuItem);
    });

    return hierarchy;
  },

  /**
   * Get Child Menus
   * Recursive function - parent এর সব child menu পাওয়া
   */
  getChildMenus: function (parentId, allMenus) {
    const children = allMenus.filter(m => m.ParentMenu === parentId);

    return children.map(child => {
      return {
        id: child.MenuId,
        text: child.MenuName,
        value: child.MenuId,
        expanded: true,
        items: this.getChildMenus(child.MenuId, allMenus)
      };
    });
  },

  /**
   * Load Access Control by Module ID
   * নির্দিষ্ট module এর access control load করা
   */
  loadAccessControlByModuleId: async function (moduleId) {
    const loaderContainer = $('#' + this.config.accessLoaderContainerId);
    const loader = loaderContainer.kendoLoader({
      size: 'large',
      type: 'infinite-spinner',
      themeColor: 'primary'
    }).data("kendoLoader");

    try {
      // Loader show করব
      loaderContainer.show();
      loader.show();

      // Previous content clear করব
      $("#" + this.config.accessCheckboxContainerId).empty();

      // API থেকে access controls load করব
      const accessList = await GroupService.getAccessControls();

      if (!accessList || accessList.length === 0) {
        $("#" + this.config.accessCheckboxContainerId).html(
          '<div class="col-12"><p class="text-muted">No access controls available</p></div>'
        );
        return;
      }

      // HTML তৈরি করব
      let html = '<div class="row">';
      accessList.forEach(access => {
        html += `
        <div class="col-12 mb-1">
          <div class="d-flex justify-content-start align-items-center access-item">
            <input type="checkbox" 
                   class="form-check-input" 
                   id="chkAccess${access.AccessId}" 
                   data-access-id="${access.AccessId}"
                   data-access-name="${access.AccessName}"
                   data-module-id="${moduleId}" />
            <label for="chkAccess${access.AccessId}" class="tree-label ms-2">
              ${access.AccessName}
            </label>
          </div>
        </div>
      `;
      });
      html += '</div>';

      $("#" + this.config.accessCheckboxContainerId).html(html);

      // Event listeners attach করব
      $("#" + this.config.accessCheckboxContainerId).find('input[type="checkbox"]')
        .on('change', (e) => {
          const accessId = $(e.target).data('access-id');
          const accessName = $(e.target).data('access-name');
          const modId = $(e.target).data('module-id');
          this.onAccessCheckboxChange(accessId, accessName, modId);
        });

      // Existing selection restore করব
      this.restoreAccessSelection(moduleId);

      console.log('Access controls loaded successfully');

    } catch (error) {
      console.error('Error loading access controls:', error);
      $("#" + this.config.accessCheckboxContainerId).html(
        '<div class="col-12"><p class="text-danger">Failed to load access controls</p></div>'
      );
    } finally {
      loader.hide();
      loaderContainer.hide();
    }
  },

  /**
   * Remove Menus by Module ID
   * Module remove করার সময় এর সব menu ও remove করব
   */
  removeMenusByModuleId: function (moduleId) {
    // এটা পরে implement করব যখন menu array তৈরি করব
    console.log('Removing menus for module:', moduleId);

    // TreeView clear করব
    $("#" + this.config.menuTreeViewId).remove();
    $("#" + this.config.menuContentId).html('<div id="' + this.config.menuTreeViewId + '"></div>');
  },

  /**
   * Remove Access by Module ID
   * Module remove করার সময় এর সব access ও remove করব
   */
  removeAccessByModuleId: function (moduleId) {
    // এটা পরে implement করব যখন access array তৈরি করব
    console.log('Removing access for module:', moduleId);

    // Access checkboxes clear করব
    $("#" + this.config.accessCheckboxContainerId).empty();
  },
};


// Register with ModuleRegistry
if (typeof ModuleRegistry !== 'undefined') {
  ModuleRegistry.register('Groups', Groups, {
    dependencies: ['GroupService', 'ApiCallManager', 'MessageManager', 'FormHelper', 'GridHelper'],
    priority: 5,
    autoInit: false,
    route: AppConfig.getFrontendRoute("intGroup") // Assuming a route for user pages
  });

  console.log('User registered');
} else {
  console.error('ModuleRegistry not loaded! Cannot register User');
}