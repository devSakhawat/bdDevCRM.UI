/// <reference path="../../../services/module/core/GroupsService.js.js" />

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
   * ============================================================
   * MENU PERMISSION SECTION
   * ============================================================
   */

  /**
   * Menu Permission Arrays
   */
  menuArray: [],
  allMenuArray: [],
  currentModuleIdForMenu: 0,

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
      // Loader show
      $("#" + this.config.menuContentId).css("min-height", "50px");
      loaderContainer.show();
      loader.show();

      // Previous tree remove
      $("#" + this.config.menuTreeViewId).remove();
      $("#" + this.config.menuContentId).html('<div id="' + this.config.menuTreeViewId + '"></div>');

      // Store current module ID
      this.currentModuleIdForMenu = moduleId;

      // API থেকে menus load
      const menus = await GroupService.getMenusByModuleId(moduleId);

      if (!menus || menus.length === 0) {
        console.warn('No menus found for module:', moduleId);
        $("#" + this.config.menuContentId).html('<p class="text-muted">No menus available for this module</p>');
        return;
      }

      // Store all menus for reference
      this.allMenuArray = menus;

      // Hierarchical data structure তৈরি
      const treeData = this.buildMenuHierarchy(menus);

      // TreeView initialize
      const treeView = $("#" + this.config.menuTreeViewId).kendoTreeView({
        checkboxes: {
          checkChildren: true,
          template: "<input type='checkbox' id='chkMenu#= item.id #' />"
        },
        dataSource: treeData,
        check: this.onMenuCheck.bind(this),
        expand: function (e) {
          // Auto expand functionality
        },
        dataBound: function (e) {
          // Tree bound হওয়ার পরে
        }
      }).data("kendoTreeView");

      // Existing menu selection restore
      this.restoreMenuSelection();

      console.log('Menu tree loaded successfully for module:', moduleId);

    } catch (error) {
      console.error('Error loading menu tree:', error);
      MessageManager.notify.error('Failed to load menus');
      $("#" + this.config.menuContentId).html('<p class="text-danger">Failed to load menus</p>');
    } finally {
      loader.hide();
      $("#" + this.config.menuContentId).css("min-height", "auto");
      loaderContainer.hide();
    }
  },
  /**
   * Build Menu Hierarchy
   * Flat menu list থেকে hierarchical structure তৈরি
   */
  buildMenuHierarchy: function (menus) {
    const hierarchy = [];

    // Parent menus filter (যাদের ParentMenu null বা 0)
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
   * Get Child Menus (Recursive)
   * Parent এর সব child menu পাওয়া
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
 * On Menu Check Event Handler
 * Menu checkbox check/uncheck করলে
 */
  onMenuCheck: async function (e) {
    const treeView = e.sender;
    const dataItem = treeView.dataItem(e.node);
    const menuId = dataItem.id;
    const isChecked = e.node.find('> . k-checkbox-wrapper > input[type=checkbox]').is(':checked');

    console.log('Menu check event:', menuId, isChecked);

    if (isChecked) {
      // Menu checked হলে
      await this.addMenuToArray(menuId);

      // Parent menu automatically check করা
      this.checkParentMenus(menuId);

      // Child menus automatically add করা
      this.addChildMenusToArray(menuId);

      // Status/State load করা
      await this.loadStatesByMenuId(menuId);

    } else {
      // Menu unchecked হলে
      this.removeMenuFromArray(menuId);

      // Child menus remove করা
      this.removeChildMenusFromArray(menuId);

      // States remove করা
      this.removeStatesByMenuId(menuId);
    }
  },

  /**
 * Add Menu to Array
 * Menu কে array তে add করা
 */
  addMenuToArray: function (menuId) {
    // Check already আছে কিনা
    const exists = this.menuArray.some(item => item.ReferenceID === menuId);

    if (!exists) {
      const menuObj = {
        ReferenceID: menuId,
        ParentPermission: this.currentModuleIdForMenu,
        PermissionTableName: "Menu"
      };

      this.menuArray.push(menuObj);
      console.log('Menu added to array:', menuObj);
    }
  },

  /**
 * Remove Menu from Array
 * Menu কে array থেকে remove করা
 */
  removeMenuFromArray: function (menuId) {
    const initialLength = this.menuArray.length;

    this.menuArray = this.menuArray.filter(item => item.ReferenceID !== menuId);

    if (this.menuArray.length < initialLength) {
      console.log('Menu removed from array:', menuId);
    }
  },

  /**
   * Check Parent Menus
   * Parent menu গুলো automatically check করা
   */
  checkParentMenus: function (menuId) {
    // Find menu in allMenuArray
    const menu = this.allMenuArray.find(m => m.MenuId === menuId);

    if (menu && menu.ParentMenu && menu.ParentMenu !== 0) {
      const parentId = menu.ParentMenu;

      // Parent already added কিনা check
      const alreadyAdded = this.menuArray.some(item => item.ReferenceID === parentId);

      if (!alreadyAdded) {
        // Parent add করা
        this.addMenuToArray(parentId);

        // Parent এর checkbox check করা
        $('#chkMenu' + parentId).prop('checked', true);

        // Recursively parent এর parent check করা
        this.checkParentMenus(parentId);
      }
    }
  },

  /**
   * Add Child Menus to Array
   * সব child menu automatically add করা
   */
  addChildMenusToArray: function (menuId) {
    // Find all child menus
    const childMenus = this.allMenuArray.filter(m => m.ParentMenu === menuId);

    childMenus.forEach(child => {
      const alreadyAdded = this.menuArray.some(item => item.ReferenceID === child.MenuId);

      if (!alreadyAdded) {
        this.addMenuToArray(child.MenuId);

        // Child এর checkbox check করা
        $('#chkMenu' + child.MenuId).prop('checked', true);

        // Recursively child এর child add করা
        this.addChildMenusToArray(child.MenuId);
      }
    });
  },

  /**
   * Remove Child Menus from Array
   * সব child menu remove করা
   */
  removeChildMenusFromArray: function (menuId) {
    // Find all child menus
    const childMenus = this.allMenuArray.filter(m => m.ParentMenu === menuId);

    childMenus.forEach(child => {
      this.removeMenuFromArray(child.MenuId);

      // Child এর checkbox uncheck করা
      $('#chkMenu' + child.MenuId).prop('checked', false);

      // States remove করা
      this.removeStatesByMenuId(child.MenuId);

      // Recursively child এর child remove করা
      this.removeChildMenusFromArray(child.MenuId);
    });
  },

  /**
   * Restore Menu Selection
   * Edit mode এ existing menu selection restore করা
   */
  restoreMenuSelection: function () {
    this.menuArray.forEach(item => {
      if (item.ParentPermission === this.currentModuleIdForMenu) {
        const checkbox = $('#chkMenu' + item.ReferenceID);
        if (checkbox.length > 0) {
          checkbox.prop('checked', true);
        }
      }
    });

    console.log('Menu selection restored');
  },

  /**
 * Remove Menus by Module ID
 * Module remove করার সময় এর সব menu remove করা
 */
  removeMenusByModuleId: function (moduleId) {
    const initialLength = this.menuArray.length;

    // Filter out menus belonging to this module
    this.menuArray = this.menuArray.filter(item => {
      if (item.ParentPermission === moduleId) {
        // States এবং actions ও remove করা
        this.removeStatesByMenuId(item.ReferenceID);
        return false;
      }
      return true;
    });

    console.log(`Removed ${initialLength - this.menuArray.length} menus for module: `, moduleId);

    // TreeView clear করা
    $("#" + this.config.menuTreeViewId).remove();
    $("#" + this.config.menuContentId).html('<div id="' + this.config.menuTreeViewId + '"></div>');
  },

  /**
   * Populate Existing Menu in Array
   * Edit mode এ existing menu array তে populate করা
   */
  populateExistingMenuInArray: function (groupPermissions) {
    if (!Array.isArray(groupPermissions)) {
      console.warn('Invalid group permissions data for menu');
      return;
    }

    // Filter menu permissions
    const menuPermissions = groupPermissions.filter(item => item.PermissionTableName === "Menu");

    menuPermissions.forEach(item => {
      const menuObj = {
        ReferenceID: item.ReferenceID,
        ParentPermission: item.ParentPermission,
        PermissionTableName: "Menu"
      };

      // Check already আছে কিনা
      const exists = this.menuArray.some(m =>
        m.ReferenceID === menuObj.ReferenceID &&
        m.ParentPermission === menuObj.ParentPermission
      );

      if (!exists) {
        this.menuArray.push(menuObj);
      }
    });

    console.log('Existing menus populated:', this.menuArray.length);
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

  /**
 * ============================================================
 * STATE/STATUS PERMISSION SECTION
 * ============================================================
 */

  /**
   * State Permission Arrays
   */
  stateArray: [],
  statePermissionArray: [],

  /**
   * Load States by Menu ID
   * নির্দিষ্ট menu এর states/status load করা
   */
  loadStatesByMenuId: async function (menuId) {
    try {
      // Clear previous states
      $("#" + this.config.stateCheckboxContainerId).empty();

      // API থেকে states load
      const states = await GroupService.getStatusByMenuId(menuId);

      if (!states || states.length === 0) {
        $("#" + this.config.stateCheckboxContainerId).html(
          '<p class="text-muted">No states available for this menu</p>'
        );
        return;
      }

      // Store states for reference
      this.stateArray = states;

      // HTML তৈরি
      let html = '<div class="row">';
      states.forEach(state => {
        html += `
        <div class="col-12 mb-1">
          <div class="d-flex justify-content-start align-items-center">
            <input type="checkbox" 
                   class="form-check-input" 
                   id="chkStatus${state.WfStateId}" 
                   data-state-id="${state.WfStateId}"
                   data-state-name="${state.StateName}"
                   data-menu-id="${menuId}" />
            <label for="chkStatus${state.WfStateId}" class="tree-label ms-2">
              ${state.StateName}
            </label>
          </div>
        </div>
      `;
      });
      html += '</div>';

      $("#" + this.config.stateCheckboxContainerId).html(html);

      // Event listeners attach
      $("#" + this.config.stateCheckboxContainerId).find('input[type="checkbox"]')
        .on('change', (e) => {
          const stateId = $(e.target).data('state-id');
          const menuId = $(e.target).data('menu-id');
          this.onStateCheckboxChange(stateId, menuId);
        });

      // Existing state selection restore
      this.restoreStateSelection(menuId);

      console.log('States loaded successfully for menu:', menuId);

    } catch (error) {
      console.error('Error loading states:', error);
      MessageManager.notify.error('Failed to load states');
      $("#" + this.config.stateCheckboxContainerId).html(
        '<p class="text-danger">Failed to load states</p>'
      );
    }
  },

  /**
   * On State Checkbox Change
   * State checkbox change হলে
   */
  onStateCheckboxChange: async function (stateId, menuId) {
    const isChecked = $("#chkStatus" + stateId).is(':checked');

    if (isChecked) {
      // State checked হলে
      this.addStateToArray(stateId, menuId);

      // Actions load করা
      await this.loadActionsByStatusId(stateId);

    } else {
      // State unchecked হলে
      this.removeStateFromArray(stateId);

      // Actions remove করা
      this.removeActionsByStatusId(stateId);
    }
  },

  /**
   * Add State to Array
   * State কে array তে add করা
   */
  addStateToArray: function (stateId, menuId) {
    // Check already আছে কিনা
    const exists = this.statePermissionArray.some(
      item => item.ReferenceID === stateId && item.ParentPermission === menuId
    );

    if (!exists) {
      const stateObj = {
        ReferenceID: stateId,
        ParentPermission: menuId,
        PermissionTableName: "Status"
      };

      this.statePermissionArray.push(stateObj);
      console.log('State added to array:', stateObj);
    }
  },

  /**
   * Remove State from Array
   * State কে array থেকে remove করা
   */
  removeStateFromArray: function (stateId) {
    const initialLength = this.statePermissionArray.length;

    this.statePermissionArray = this.statePermissionArray.filter(
      item => item.ReferenceID !== stateId
    );

    if (this.statePermissionArray.length < initialLength) {
      console.log('State removed from array:', stateId);
    }
  },

  /**
   * Restore State Selection
   * Edit mode এ existing state selection restore করা
   */
  restoreStateSelection: function (menuId) {
    this.statePermissionArray.forEach(item => {
      if (item.ParentPermission === menuId && item.PermissionTableName === "Status") {
        const checkbox = $('#chkStatus' + item.ReferenceID);
        if (checkbox.length > 0) {
          checkbox.prop('checked', true);
        }
      }
    });

    console.log('State selection restored for menu:', menuId);
  },

  /**
   * Remove States by Menu ID
   * Menu remove করার সময় এর সব state remove করা
   */
  removeStatesByMenuId: function (menuId) {
    const initialLength = this.statePermissionArray.length;

    // Filter out states belonging to this menu
    this.statePermissionArray = this.statePermissionArray.filter(item => {
      if (item.ParentPermission === menuId) {
        // Actions ও remove করা
        this.removeActionsByStatusId(item.ReferenceID);
        return false;
      }
      return true;
    });

    console.log(`Removed ${initialLength - this.statePermissionArray.length} states for menu: `, menuId);

    // Clear UI
    $("#" + this.config.stateCheckboxContainerId).empty();
    this.stateArray = [];
  },

  /**
   * Clear All States
   * সব state clear করা
   */
  clearAllStates: function () {
    this.stateArray = [];
    this.statePermissionArray = [];

    $("#" + this.config.stateCheckboxContainerId).empty();

    console.log('All states cleared');
  },

  /**
   * Populate Existing State in Array
   * Edit mode এ existing state array তে populate করা
   */
  populateExistingStateInArray: function (groupPermissions) {
    if (!Array.isArray(groupPermissions)) {
      console.warn('Invalid group permissions data for state');
      return;
    }

    // Filter state permissions
    const statePermissions = groupPermissions.filter(item => item.PermissionTableName === "Status");

    statePermissions.forEach(item => {
      const stateObj = {
        ReferenceID: item.ReferenceID,
        ParentPermission: item.ParentPermission,
        PermissionTableName: "Status"
      };

      // Check already আছে কিনা
      const exists = this.statePermissionArray.some(s =>
        s.ReferenceID === stateObj.ReferenceID &&
        s.ParentPermission === stateObj.ParentPermission
      );

      if (!exists) {
        this.statePermissionArray.push(stateObj);
      }
    });

    console.log('Existing states populated:', this.statePermissionArray.length);
  },

  /**
 * ============================================================
 * ACTION PERMISSION SECTION
 * ============================================================
 */

  /**
   * Action Permission Arrays
   */
  actionArray: [],
  actionPermissionArray: [],

  /**
   * Load Actions by Status ID
   * নির্দিষ্ট status এর actions load করা
   */
  loadActionsByStatusId: async function (statusId) {
    try {
      // Clear previous actions
      $("#" + this.config.actionCheckboxContainerId).empty();

      // API থেকে actions load
      const actions = await GroupService.getActionsByStatusId(statusId);

      if (!actions || actions.length === 0) {
        $("#" + this.config.actionCheckboxContainerId).html(
          '<p class="text-muted">No actions available for this status</p>'
        );
        return;
      }

      // Store actions for reference
      this.actionArray = actions;

      // HTML তৈরি
      let html = '<div class="row">';
      actions.forEach(action => {
        html += `
        <div class="col-12 mb-1">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <input type="checkbox" 
                     class="form-check-input me-2" 
                     id="chkAction${action.WfactionId}" 
                     data-action-id="${action.WfactionId}"
                     data-action-name="${action.ActionName}"
                     data-status-id="${statusId}" />
              <span>${action.ActionName}</span>
            </div>
          </div>
        </div>
      `;
      });
      html += '</div>';

      $("#" + this.config.actionCheckboxContainerId).html(html);

      // Event listeners attach
      $("#" + this.config.actionCheckboxContainerId).find('input[type="checkbox"]')
        .on('change', (e) => {
          const actionId = $(e.target).data('action-id');
          const statusId = $(e.target).data('status-id');
          this.onActionCheckboxChange(actionId, statusId);
        });

      // Existing action selection restore
      this.restoreActionSelection(statusId);

      console.log('Actions loaded successfully for status:', statusId);

    } catch (error) {
      console.error('Error loading actions:', error);
      MessageManager.notify.error('Failed to load actions');
      $("#" + this.config.actionCheckboxContainerId).html(
        '<p class="text-danger">Failed to load actions</p>'
      );
    }
  },

  /**
   * On Action Checkbox Change
   * Action checkbox change হলে
   */
  onActionCheckboxChange: function (actionId, statusId) {
    const isChecked = $("#chkAction" + actionId).is(':checked');

    if (isChecked) {
      // Action checked হলে
      this.addActionToArray(actionId, statusId);
    } else {
      // Action unchecked হলে
      this.removeActionFromArray(actionId);
    }
  },

  /**
   * Add Action to Array
   * Action কে array তে add করা
   */
  addActionToArray: function (actionId, statusId) {
    // Check already আছে কিনা
    const exists = this.actionPermissionArray.some(
      item => item.ReferenceID === actionId && item.ParentPermission === statusId
    );

    if (!exists) {
      const actionObj = {
        ReferenceID: actionId,
        ParentPermission: statusId,
        PermissionTableName: "Action"
      };

      this.actionPermissionArray.push(actionObj);
      console.log('Action added to array:', actionObj);
    }
  },

  /**
   * Remove Action from Array
   * Action কে array থেকে remove করা
   */
  removeActionFromArray: function (actionId) {
    const initialLength = this.actionPermissionArray.length;

    this.actionPermissionArray = this.actionPermissionArray.filter(
      item => item.ReferenceID !== actionId
    );

    if (this.actionPermissionArray.length < initialLength) {
      console.log('Action removed from array:', actionId);
    }
  },

  /**
   * Restore Action Selection
   * Edit mode এ existing action selection restore করা
   */
  restoreActionSelection: function (statusId) {
    this.actionPermissionArray.forEach(item => {
      if (item.ParentPermission === statusId && item.PermissionTableName === "Action") {
        const checkbox = $('#chkAction' + item.ReferenceID);
        if (checkbox.length > 0) {
          checkbox.prop('checked', true);
        }
      }
    });

    console.log('Action selection restored for status:', statusId);
  },

  /**
   * Remove Actions by Status ID
   * Status remove করার সময় এর সব action remove করা
   */
  removeActionsByStatusId: function (statusId) {
    const initialLength = this.actionPermissionArray.length;

    this.actionPermissionArray = this.actionPermissionArray.filter(
      item => item.ParentPermission !== statusId
    );

    console.log(`Removed ${initialLength - this.actionPermissionArray.length} actions for status:`, statusId);

    // Clear UI
    $("#" + this.config.actionCheckboxContainerId).empty();
    this.actionArray = [];
  },

  /**
   * Clear All Actions
   * সব action clear করা
   */
  clearAllActions: function () {
    this.actionArray = [];
    this.actionPermissionArray = [];

    $("#" + this.config.actionCheckboxContainerId).empty();

    console.log('All actions cleared');
  },

  /**
   * Populate Existing Action in Array
   * Edit mode এ existing action array তে populate করা
   */
  populateExistingActionInArray: function (groupPermissions) {
    if (!Array.isArray(groupPermissions)) {
      console.warn('Invalid group permissions data for action');
      return;
    }

    // Filter action permissions
    const actionPermissions = groupPermissions.filter(item => item.PermissionTableName === "Action");

    actionPermissions.forEach(item => {
      const actionObj = {
        ReferenceID: item.ReferenceID,
        ParentPermission: item.ParentPermission,
        PermissionTableName: "Action"
      };

      // Check already আছে কিনা
      const exists = this.actionPermissionArray.some(a =>
        a.ReferenceID === actionObj.ReferenceID &&
        a.ParentPermission === actionObj.ParentPermission
      );

      if (!exists) {
        this.actionPermissionArray.push(actionObj);
      }
    });

    console.log('Existing actions populated:', this.actionPermissionArray.length);
  },

  /**
 * ============================================================
 * REPORT PERMISSION SECTION
 * ============================================================
 */

  /**
   * Report Permission Arrays
   */
  reportArray: [],
  reportPermissionArray: [],

  /**
   * Initialize Report Permissions
   * Report permissions load এবং display করা
   */
  initReportPermissions: async function () {
    try {
      // API থেকে reports load
      const reports = await GroupService.getReports();

      if (!reports || reports.length === 0) {
        $("#" + this.config.reportCheckboxContainerId).html(
          '<p class="text-muted">No reports available</p>'
        );
        return;
      }

      // Store reports for reference
      this.reportArray = reports;

      // HTML তৈরি
      let html = '<div class="row">';
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
      html += '</div>';

      $("#" + this.config.reportCheckboxContainerId).html(html);

      // Event listeners attach
      $("#" + this.config.reportCheckboxContainerId).find('input[type="checkbox"]')
        .on('change', (e) => {
          const reportId = $(e.target).data('report-id');
          const reportName = $(e.target).data('report-name');
          this.onReportCheckboxChange(reportId, reportName);
        });

      console.log('Reports loaded successfully');

    } catch (error) {
      console.error('Error loading reports:', error);
      MessageManager.notify.error('Failed to load reports');
      $("#" + this.config.reportCheckboxContainerId).html(
        '<p class="text-danger">Failed to load reports</p>'
      );
    }
  },

  /**
   * On Report Checkbox Change
   * Report checkbox change হলে
   */
  onReportCheckboxChange: function (reportId, reportName) {
    const isChecked = $("#chkReport" + reportId).is(':checked');

    if (isChecked) {
      // Report checked হলে
      this.addReportToArray(reportId);
    } else {
      // Report unchecked হলে
      this.removeReportFromArray(reportId);
    }
  },

  /**
   * Add Report to Array
   * Report কে array তে add করা
   */
  addReportToArray: function (reportId) {
    // Check already আছে কিনা
    const exists = this.reportPermissionArray.some(
      item => item.ReferenceID === reportId
    );

    if (!exists) {
      const reportObj = {
        ReferenceID: reportId,
        ParentPermission: -1, // Report এর কোন parent নেই
        PermissionTableName: "Customized Report"
      };

      this.reportPermissionArray.push(reportObj);
      console.log('Report added to array:', reportObj);
    }
  },

  /**
   * Remove Report from Array
   * Report কে array থেকে remove করা
   */
  removeReportFromArray: function (reportId) {
    const initialLength = this.reportPermissionArray.length;

    this.reportPermissionArray = this.reportPermissionArray.filter(
      item => item.ReferenceID !== reportId
    );

    if (this.reportPermissionArray.length < initialLength) {
      console.log('Report removed from array:', reportId);
    }
  },

  /**
   * Restore Report Selection
   * Edit mode এ existing report selection restore করা
   */
  restoreReportSelection: function () {
    this.reportPermissionArray.forEach(item => {
      if (item.PermissionTableName === "Customized Report") {
        const checkbox = $('#chkReport' + item.ReferenceID);
        if (checkbox.length > 0) {
          checkbox.prop('checked', true);
        }
      }
    });

    console.log('Report selection restored');
  },

  /**
   * Clear All Reports
   * সব report clear করা
   */
  clearAllReports: function () {
    this.reportArray = [];
    this.reportPermissionArray = [];

    // Uncheck all report checkboxes
    $("#" + this.config.reportCheckboxContainerId).find('input[type="checkbox"]')
      .prop('checked', false);

    console.log('All reports cleared');
  },

  /**
   * Populate Existing Report in Array
   * Edit mode এ existing report array তে populate করা
   */
  populateExistingReportInArray: function (groupPermissions) {
    if (!Array.isArray(groupPermissions)) {
      console.warn('Invalid group permissions data for report');
      return;
    }

    // Filter report permissions
    const reportPermissions = groupPermissions.filter(
      item => item.PermissionTableName === "Customized Report"
    );

    reportPermissions.forEach(item => {
      const reportObj = {
        ReferenceID: item.ReferenceID,
        ParentPermission: item.ParentPermission || -1,
        PermissionTableName: "Customized Report"
      };

      // Check already আছে কিনা
      const exists = this.reportPermissionArray.some(r =>
        r.ReferenceID === reportObj.ReferenceID
      );

      if (!exists) {
        this.reportPermissionArray.push(reportObj);
      }
    });

    console.log('Existing reports populated:', this.reportPermissionArray.length);
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