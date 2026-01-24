/*=========================================================
* Group Settings Screen (Complete CRUD with FormHelper)
* File: Group.js
* Author: devSakhawat
* Date: 2026-01-17
* Updated: 2026-01-20 - Complete Permission Integration
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
    try {
      // The order of initialization is important
      this.initTab();           // 1. First, create the Tab
      this.initGrid();          // 2. Then the Grid
      await this.initForm();    // 3. Form and all its components
      FormHelper.generateHeightWithoutHeaderAndFooter(this.config.detailsDivId, 80, 50);

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
        // Highlight Active tab
        $("#" + this.config.tabStripId + " ul li").removeClass("k-state-active");
        $(e.item).addClass("k-state-active");
      }
    });

    // Select first tab
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
      toolbar: [],
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
    return [
      { field: "GroupId", title: "Group Id", width: 0, hidden: true },
      { field: "GroupName", title: "Group Name", width: "70%" },
      {
        field: "Actions",
        title: "Actions",
        width: '30%',
        template: GridHelper.createActionColumn({
          idField: 'GroupId',
          editCallback: 'Groups.edit',
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
    await this.initReportPermissions();   // Report permissions

    console.log('Form initialized successfully');
  },

  /**
   * Initialize Module Checkboxes
   */
  initModuleCheckboxes: async function () {
    try {
      debugger;
      const modules = await GroupService.getModules();

      this.allModuleArray = modules; // Store for reference

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
    });
  },

  /////////////////////////////////////////////////////////////
  // MODULE PERMISSION SECTION
  /////////////////////////////////////////////////////////////

  /**
   * Module Arrays - For permission track 
   */
  moduleArray: [],
  allModuleArray: [],

  /**
   * On Module Checkbox Change
   */
  onModuleCheckboxChange: function (moduleId, moduleName, controlId) {
    const isChecked = $("#" + controlId).is(':checked');

    if (isChecked) {
      this.addModuleToArray(moduleId, moduleName);
    } else {
      this.removeModuleFromArray(moduleId);
    }

    this.updateModuleComboBox();
  },

  /**
   * Add Module to Array
   */
  addModuleToArray: function (moduleId, moduleName) {
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
   */
  removeModuleFromArray: function (moduleId) {
    this.removeMenusByModuleId(moduleId);
    this.removeAccessByModuleId(moduleId);
    this.moduleArray = this.moduleArray.filter(item => item.ModuleId !== moduleId);

    console.log('Module removed:', moduleId);
  },

  /**
   * Update Module ComboBox
   */
  updateModuleComboBox: function () {
    const combo = $("#" + this.config.moduleComboId).data("kendoComboBox");
    if (combo) {
      combo.setDataSource(this.moduleArray);

      combo.unbind("select");
      combo.bind("select", this.onModuleComboSelect.bind(this));
    }
  },

  /**
   * On Module Combo Select
   */
  onModuleComboSelect: async function (e) {
    try {
      const dataItem = this.dataItem(e.item.index());
      const moduleId = dataItem.ModuleId;

      console.log('Module selected from combo:', moduleId);

      await Promise.all([
        this.loadMenuTreeByModuleId(moduleId),
        this.loadAccessControlByModuleId(moduleId)
      ]);

      const combo = $("#" + this.config.moduleComboId).data("kendoComboBox");
      if (combo) {
        combo.value(moduleId);
      }

    } catch (error) {
      console.error('Error in module combo select:', error);
      MessageManager.notify.error('Failed to load module data');
    }
  },

  /////////////////////////////////////////////////////////////
  // MENU PERMISSION SECTION
  /////////////////////////////////////////////////////////////

  /**
   * Menu Permission Arrays
   */
  menuArray: [],
  allMenuArray: [],
  currentModuleIdForMenu: 0,

  /**
   * Load Menu Tree by Module ID
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

      //From API  menus load
      const menus = await GroupService.getMenusByModuleId(moduleId);

      if (!menus || menus.length === 0) {
        console.warn('No menus found for module:', moduleId);
        $("#" + this.config.menuContentId).html('<p class="text-muted">No menus available for this module</p>');
        return;
      }

      // Store all menus for reference
      this.allMenuArray = menus;

      // Hierarchical data structure
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
          // Tree bound 
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
   */
  buildMenuHierarchy: function (menus) {
    const hierarchy = [];

    // Parent menus filter (ParentMenu null or 0)
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

      this.checkParentMenus(menuId);

      this.addChildMenusToArray(menuId);

      await this.loadStatesByMenuId(menuId);

    } else {
      this.removeMenuFromArray(menuId);

      this.removeChildMenusFromArray(menuId);

      this.removeStatesByMenuId(menuId);
    }
  },

  /**
   * Add Menu to Array
   */
  addMenuToArray: function (menuId) {
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
   */
  checkParentMenus: function (menuId) {
    // Find menu in allMenuArray
    const menu = this.allMenuArray.find(m => m.MenuId === menuId);

    if (menu && menu.ParentMenu && menu.ParentMenu !== 0) {
      const parentId = menu.ParentMenu;

      const alreadyAdded = this.menuArray.some(item => item.ReferenceID === parentId);

      if (!alreadyAdded) {
        this.addMenuToArray(parentId);
        $('#chkMenu' + parentId).prop('checked', true);
        this.checkParentMenus(parentId);
      }
    }
  },

  /**
   * Add Child Menus to Array
   */
  addChildMenusToArray: function (menuId) {
    // Find all child menus
    const childMenus = this.allMenuArray.filter(m => m.ParentMenu === menuId);

    childMenus.forEach(child => {
      const alreadyAdded = this.menuArray.some(item => item.ReferenceID === child.MenuId);

      if (!alreadyAdded) {
        this.addMenuToArray(child.MenuId);
        $('#chkMenu' + child.MenuId).prop('checked', true);
        this.addChildMenusToArray(child.MenuId);
      }
    });
  },

  /**
   * Remove Child Menus from Array
   */
  removeChildMenusFromArray: function (menuId) {
    const childMenus = this.allMenuArray.filter(m => m.ParentMenu === menuId);
    childMenus.forEach(child => {
      this.removeMenuFromArray(child.MenuId);
      $('#chkMenu' + child.MenuId).prop('checked', false);
      this.removeStatesByMenuId(child.MenuId);
      this.removeChildMenusFromArray(child.MenuId);
    });
  },

  /**
   * Restore Menu Selection
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
   */
  removeMenusByModuleId: function (moduleId) {
    const initialLength = this.menuArray.length;

    // Filter out menus belonging to this module
    this.menuArray = this.menuArray.filter(item => {
      if (item.ParentPermission === moduleId) {
        this.removeStatesByMenuId(item.ReferenceID);
        return false;
      }
      return true;
    });

    console.log(`Removed ${initialLength - this.menuArray.length} menus for module: `, moduleId);

    $("#" + this.config.menuTreeViewId).remove();
    $("#" + this.config.menuContentId).html('<div id="' + this.config.menuTreeViewId + '"></div>');
  },

  /**
   * Populate Existing Menu in Array
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

  /////////////////////////////////////////////////////////////
  // ACCESS CONTROL PERMISSION SECTION
  /////////////////////////////////////////////////////////////

  /**
   * Access Control Arrays
   */
  accessArray: [],
  accessPermissionArray: [],
  currentModuleIdForAccess: 0,

  /**
   * Load Access Control by Module ID
   */
  loadAccessControlByModuleId: async function (moduleId) {
    const loaderContainer = $('#' + this.config.accessLoaderContainerId);
    const loader = loaderContainer.kendoLoader({
      size: 'large',
      type: 'infinite-spinner',
      themeColor: 'primary'
    }).data("kendoLoader");

    try {
      // Loader show
      loaderContainer.show();
      loader.show();

      // Store current module ID
      this.currentModuleIdForAccess = moduleId;

      // Previous content clear
      $("#" + this.config.accessCheckboxContainerId).empty();

      // From API access controls load
      const accessList = await GroupService.getAccessControls();

      if (!accessList || accessList.length === 0) {
        $("#" + this.config.accessCheckboxContainerId).html(
          '<div class="col-12"><p class="text-muted">No access controls available</p></div>'
        );
        return;
      }

      // Store for reference
      this.accessArray = accessList;

      // HTML creation
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

      // Event listeners attach
      $("#" + this.config.accessCheckboxContainerId).find('input[type="checkbox"]')
        .on('change', (e) => {
          const accessId = $(e.target).data('access-id');
          const accessName = $(e.target).data('access-name');
          const modId = $(e.target).data('module-id');
          this.onAccessCheckboxChange(accessId, accessName, modId);
        });

      // Existing selection restore
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
   * On Access Checkbox Change
   */
  onAccessCheckboxChange: function (accessId, accessName, moduleId) {
    const isChecked = $(`#chkAccess${accessId}`).is(':checked');

    if (isChecked) {
      this.addAccessToArray(accessId, moduleId);
    } else {
      this.removeAccessFromArray(accessId, moduleId);
    }
  },

  /**
   * Add Access to Array
   */
  addAccessToArray: function (accessId, moduleId) {
    const exists = this.accessPermissionArray.some(
      item => item.ReferenceID === accessId && item.ParentPermission === moduleId
    );

    if (!exists) {
      const accessObj = {
        ReferenceID: accessId,
        ParentPermission: moduleId,
        PermissionTableName: "Access"
      };

      this.accessPermissionArray.push(accessObj);
      console.log('Access added to array:', accessObj);
    }
  },

  /**
   * Remove Access from Array
   */
  removeAccessFromArray: function (accessId, moduleId) {
    const initialLength = this.accessPermissionArray.length;

    this.accessPermissionArray = this.accessPermissionArray.filter(
      item => !(item.ReferenceID === accessId && item.ParentPermission === moduleId)
    );

    if (this.accessPermissionArray.length < initialLength) {
      console.log('Access removed from array:', accessId);
    }
  },

  /**
   * Restore Access Selection
   */
  restoreAccessSelection: function (moduleId) {
    this.accessPermissionArray.forEach(item => {
      if (item.ParentPermission === moduleId) {
        $(`#chkAccess${item.ReferenceID}`).prop('checked', true);
      }
    });

    console.log('Access selection restored for module:', moduleId);
  },

  /**
   * Remove Access by Module ID
   */
  removeAccessByModuleId: function (moduleId) {
    const initialLength = this.accessPermissionArray.length;

    this.accessPermissionArray = this.accessPermissionArray.filter(
      item => item.ParentPermission !== moduleId
    );

    console.log(`Removed ${initialLength - this.accessPermissionArray.length} access for module:`, moduleId);

    // Clear UI
    $("#" + this.config.accessCheckboxContainerId).empty();
  },

  /**
   * Populate Existing Access in Array
   */
  populateExistingAccessInArray: function (groupPermissions) {
    if (!Array.isArray(groupPermissions)) {
      console.warn('Invalid group permissions data for access');
      return;
    }

    const accessPermissions = groupPermissions.filter(item => item.PermissionTableName === "Access");

    accessPermissions.forEach(item => {
      const accessObj = {
        ReferenceID: item.ReferenceID,
        ParentPermission: item.ParentPermission,
        PermissionTableName: "Access"
      };

      const exists = this.accessPermissionArray.some(a =>
        a.ReferenceID === accessObj.ReferenceID &&
        a.ParentPermission === accessObj.ParentPermission
      );

      if (!exists) {
        this.accessPermissionArray.push(accessObj);
      }
    });

    console.log('Existing access populated:', this.accessPermissionArray.length);
  },

  /////////////////////////////////////////////////////////////
  // STATE/STATUS PERMISSION SECTION
  /////////////////////////////////////////////////////////////

  /**
   * State Permission Arrays
   */
  stateArray: [],
  statePermissionArray: [],

  /**
   * Load States by Menu ID
   */
  loadStatesByMenuId: async function (menuId) {
    try {
      // Clear previous states
      $("#" + this.config.stateCheckboxContainerId).empty();

      const states = await GroupService.getStatusByMenuId(menuId);

      if (!states || states.length === 0) {
        $("#" + this.config.stateCheckboxContainerId).html(
          '<p class="text-muted">No states available for this menu</p>'
        );
        return;
      }

      // Store states for reference
      this.stateArray = states;

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
   */
  onStateCheckboxChange: async function (stateId, menuId) {
    const isChecked = $("#chkStatus" + stateId).is(':checked');

    if (isChecked) {
      // State checked 
      this.addStateToArray(stateId, menuId);

      // Actions load 
      await this.loadActionsByStatusId(stateId);

    } else {
      // State unchecked 
      this.removeStateFromArray(stateId);

      // Actions remove 
      this.removeActionsByStatusId(stateId);
    }
  },

  /**
   * Add State to Array
   */
  addStateToArray: function (stateId, menuId) {
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

    console.log(`Removed ${initialLength - this.statePermissionArray.length} states for menu:`, menuId);

    // Clear UI
    $("#" + this.config.stateCheckboxContainerId).empty();
    this.stateArray = [];
  },

  /**
   * Clear All States
   */
  clearAllStates: function () {
    this.stateArray = [];
    this.statePermissionArray = [];

    $("#" + this.config.stateCheckboxContainerId).empty();

    console.log('All states cleared');
  },

  /**
   * Populate Existing State in Array
   */
  populateExistingStateInArray: function (groupPermissions) {
    if (!Array.isArray(groupPermissions)) {
      console.warn('Invalid group permissions data for state');
      return;
    }

    const statePermissions = groupPermissions.filter(item => item.PermissionTableName === "Status");

    statePermissions.forEach(item => {
      const stateObj = {
        ReferenceID: item.ReferenceID,
        ParentPermission: item.ParentPermission,
        PermissionTableName: "Status"
      };

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

  /////////////////////////////////////////////////////////////
  // ACTION PERMISSION SECTION
  /////////////////////////////////////////////////////////////

  /**
   * Action Permission Arrays
   */
  actionArray: [],
  actionPermissionArray: [],

  /**
   * Load Actions by Status ID
   */
  loadActionsByStatusId: async function (statusId) {
    try {
      // Clear previous actions
      $("#" + this.config.actionCheckboxContainerId).empty();

      // API actions load
      const actions = await GroupService.getActionsByStatusId(statusId);

      if (!actions || actions.length === 0) {
        $("#" + this.config.actionCheckboxContainerId).html(
          '<p class="text-muted">No actions available for this status</p>'
        );
        return;
      }

      // Store actions for reference
      this.actionArray = actions;

      // HTML creation
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
   */
  onActionCheckboxChange: function (actionId, statusId) {
    const isChecked = $("#chkAction" + actionId).is(':checked');

    if (isChecked) {
      this.addActionToArray(actionId, statusId);
    } else {
      this.removeActionFromArray(actionId);
    }
  },

  /**
   * Add Action to Array
   */
  addActionToArray: function (actionId, statusId) {
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
   */
  clearAllActions: function () {
    this.actionArray = [];
    this.actionPermissionArray = [];

    $("#" + this.config.actionCheckboxContainerId).empty();

    console.log('All actions cleared');
  },

  /**
   * Populate Existing Action in Array
   */
  populateExistingActionInArray: function (groupPermissions) {
    if (!Array.isArray(groupPermissions)) {
      console.warn('Invalid group permissions data for action');
      return;
    }

    const actionPermissions = groupPermissions.filter(item => item.PermissionTableName === "Action");

    actionPermissions.forEach(item => {
      const actionObj = {
        ReferenceID: item.ReferenceID,
        ParentPermission: item.ParentPermission,
        PermissionTableName: "Action"
      };

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

  /////////////////////////////////////////////////////////////
  // REPORT PERMISSION SECTION
  /////////////////////////////////////////////////////////////

  /**
   * Report Permission Arrays
   */
  reportArray: [],
  reportPermissionArray: [],

  /**
   * Initialize Report Permissions
   */
  initReportPermissions: async function () {
    debugger;
    try {
      const reports = await GroupService.getReports();

      if (!reports || reports.length === 0) {
        $("#" + this.config.reportCheckboxContainerId).html(
          '<p class="text-muted">No reports available</p>'
        );
        return;
      }

      // Store reports for reference
      this.reportArray = reports;

      // HTML creation
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
   */
  onReportCheckboxChange: function (reportId, reportName) {
    const isChecked = $("#chkReport" + reportId).is(':checked');

    if (isChecked) {
      this.addReportToArray(reportId);
    } else {
      this.removeReportFromArray(reportId);
    }
  },

  /**
   * Add Report to Array
   */
  addReportToArray: function (reportId) {
    const exists = this.reportPermissionArray.some(
      item => item.ReferenceID === reportId
    );

    if (!exists) {
      const reportObj = {
        ReferenceID: reportId,
        ParentPermission: -1,
        PermissionTableName: "Customized Report"
      };

      this.reportPermissionArray.push(reportObj);
      console.log('Report added to array:', reportObj);
    }
  },

  /**
   * Remove Report from Array
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
   */
  populateExistingReportInArray: function (groupPermissions) {
    if (!Array.isArray(groupPermissions)) {
      console.warn('Invalid group permissions data for report');
      return;
    }

    const reportPermissions = groupPermissions.filter(
      item => item.PermissionTableName === "Customized Report"
    );

    reportPermissions.forEach(item => {
      const reportObj = {
        ReferenceID: item.ReferenceID,
        ParentPermission: item.ParentPermission || -1,
        PermissionTableName: "Customized Report"
      };

      const exists = this.reportPermissionArray.some(r =>
        r.ReferenceID === reportObj.ReferenceID
      );

      if (!exists) {
        this.reportPermissionArray.push(reportObj);
      }
    });

    console.log('Existing reports populated:', this.reportPermissionArray.length);
  },

  /////////////////////////////////////////////////////////////
  // EDIT FUNCTIONALITY
  /////////////////////////////////////////////////////////////

  /**
   * Edit Group
   */
  edit: async function (groupId) {
    try {
      console.log('Editing group:', groupId);

      // First clear the form
      this.clearForm();

      // Change button text to Update
      $("#" + this.config.btnSave).text("Update");

      const grid = $('#' + this.config.groupGridId).data('kendoGrid');
      const dataItem = grid.dataSource.get(groupId);

      // Populate Group Info (Tab 1)
      this.populateGroupInfo(dataItem);

      // Load group permissions
      const groupPermissions = await GroupService.getGroupPermissions(groupId);

      if (groupPermissions && groupPermissions.length > 0) {
        // Populate all permission arrays
        this.populateExistingMenuInArray(groupPermissions);
        this.populateExistingAccessInArray(groupPermissions);
        this.populateExistingStateInArray(groupPermissions);
        this.populateExistingActionInArray(groupPermissions);
        this.populateExistingReportInArray(groupPermissions);

        // Populate modules and restore selections
        await this.populateExistingModules(groupPermissions);
      }

      // Restore report selections
      this.restoreReportSelection();

      console.log('Group data loaded successfully');

    } catch (error) {
      console.error('Error loading group data:', error);
      MessageManager.notify.error('Failed to load group data');
    }
  },

  /**
   * Populate Group Info
   */
  populateGroupInfo: function (groupData) {
    $("#" + this.config.hiddenGroupIdId).val(groupData.GroupId);
    $("#" + this.config.groupNameId).val(groupData.GroupName);
    $("#" + this.config.isDefaultCheckboxId).prop('checked', groupData.IsDefault === 1);
  },

  /**
   * Populate Existing Modules
   * Edit mode এ modules restore করা
   */
  populateExistingModules: async function (groupPermissions) {
    // Filter module permissions
    const modulePermissions = groupPermissions.filter(
      item => item.PermissionTableName === "Module"
    );

    // Clear module array first
    this.moduleArray = [];

    // Populate module array and check checkboxes
    for (const permission of modulePermissions) {
      const module = this.allModuleArray.find(m => m.ModuleId === permission.ReferenceID);

      if (module) {
        // Check the checkbox
        $('#chkModule' + permission.ReferenceID).prop('checked', true);

        // Add to module array
        const moduleObj = {
          ModuleId: permission.ReferenceID,
          ModuleName: module.ModuleName,
          ReferenceID: permission.ReferenceID,
          PermissionTableName: "Module"
        };
        this.moduleArray.push(moduleObj);
      }
    }

    // Update module combo
    this.updateModuleComboBox();

    // If there are modules, select the first one to load menus and access
    if (this.moduleArray.length > 0) {
      const firstModule = this.moduleArray[0];

      // Load menu and access for first module
      await this.loadMenuTreeByModuleId(firstModule.ModuleId);
      await this.loadAccessControlByModuleId(firstModule.ModuleId);

      // Set combo value
      const combo = $("#" + this.config.moduleComboId).data("kendoComboBox");
      if (combo) {
        combo.value(firstModule.ModuleId);
      }
    }

    console.log('Existing modules populated:', this.moduleArray.length);
  },

  /////////////////////////////////////////////////////////////
  // SAVE FUNCTIONALITY
  /////////////////////////////////////////////////////////////

  /**
   * Save Group
   * Form submit করা (Create/Update)
   */
  save: async function () {
    try {
      // Validate form
      if (!this.validateForm()) {
        return;
      }

      // Prepare data object
      const groupData = this.prepareGroupData();

      console.log('Saving group data:', groupData);

      // Get group ID
      const groupId = $("#" + this.config.hiddenGroupIdId).val();
      const isUpdate = groupId && groupId !== '0';

      // Confirmation message
      const confirmMsg = isUpdate ?
        'Do you want to update this group?' :
        'Do you want to create this group?';

      // Show confirmation dialog
      const confirmed = await MessageManager.confirm.show(confirmMsg);

      if (!confirmed) {
        return;
      }

      // Call API
      let result;
      if (isUpdate) {
        result = await GroupService.update(groupId, groupData);
      } else {
        result = await GroupService.create(groupData);
      }

      // Success message
      const successMsg = isUpdate ?
        'Group updated successfully' :
        'Group created successfully';

      MessageManager.notify.success(successMsg);

      // Refresh grid
      const grid = $("#" + this.config.groupGridId).data("kendoGrid");
      if (grid) {
        grid.dataSource.read();
      }

      // Clear form
      this.clearForm();

      console.log('Group saved successfully');

    } catch (error) {
      console.error('Error saving group:', error);
      MessageManager.notify.error('Failed to save group');
    }
  },

  /**
   * Validate Form
   * Form validation করা
   */
  validateForm: function () {
    // Group name validation
    const groupName = $("#" + this.config.groupNameId).val();
    if (!groupName || groupName.trim() === '') {
      MessageManager.notify.error('Please enter group name');

      // Focus on first tab
      const tabStrip = $("#" + this.config.tabStripId).data("kendoTabStrip");
      if (tabStrip) {
        tabStrip.select(0);
      }

      $("#" + this.config.groupNameId).focus();
      return false;
    }

    // Module validation
    if (this.moduleArray.length === 0) {
      MessageManager.notify.error('Please select at least one module');

      // Focus on first tab
      const tabStrip = $("#" + this.config.tabStripId).data("kendoTabStrip");
      if (tabStrip) {
        tabStrip.select(0);
      }

      return false;
    }

    return true;
  },

  /**
   * Prepare Group Data
   * সব array থেকে data collect করে final object তৈরি করা
   */
  prepareGroupData: function () {
    const groupData = {
      GroupId: $("#" + this.config.hiddenGroupIdId).val() || 0,
      GroupName: $("#" + this.config.groupNameId).val(),
      IsDefault: $("#" + this.config.isDefaultCheckboxId).is(':checked') ? 1 : 0,
      ModuleList: [... this.moduleArray],
      MenuList: [...this.menuArray],
      AccessList: [...this.accessPermissionArray],
      StatusList: [...this.statePermissionArray],
      ActionList: [...this.actionPermissionArray],
      ReportList: [...this.reportPermissionArray]
    };

    return groupData;
  },

  /////////////////////////////////////////////////////////////
  // CLEAR/RESET FUNCTIONALITY
  /////////////////////////////////////////////////////////////

  /**
   * Clear Form
   * Complete form clear এবং reset করা
   */
  clearForm: function () {
    try {
      // Reset button
      $("#" + this.config.btnSave).text("Save").prop("disabled", false);

      // Clear basic fields
      $("#" + this.config.hiddenGroupIdId).val("0");
      $("#" + this.config.groupNameId).val("");
      $("#" + this.config.isDefaultCheckboxId).prop("checked", false);

      // Clear module checkboxes
      $("#" + this.config.moduleCheckboxContainerId + " .module-checkbox").prop("checked", false);

      // Clear all arrays
      this.moduleArray = [];
      this.menuArray = [];
      this.allMenuArray = [];
      this.accessArray = [];
      this.accessPermissionArray = [];
      this.stateArray = [];
      this.statePermissionArray = [];
      this.actionArray = [];
      this.actionPermissionArray = [];
      this.reportPermissionArray = [];

      // Clear module combo
      const combo = $("#" + this.config.moduleComboId).data("kendoComboBox");
      if (combo) {
        combo.value("");
        combo.setDataSource([]);
      }

      // Clear menu tree
      $("#" + this.config.menuTreeViewId).remove();
      $("#" + this.config.menuContentId).html('<div id="' + this.config.menuTreeViewId + '"></div>');

      // Clear access checkboxes
      $("#" + this.config.accessCheckboxContainerId).empty();

      // Clear state checkboxes
      $("#" + this.config.stateCheckboxContainerId).empty();

      // Clear action checkboxes
      $("#" + this.config.actionCheckboxContainerId).empty();

      // Clear report checkboxes (uncheck only)
      $("#" + this.config.reportCheckboxContainerId + " input[type='checkbox']").prop("checked", false);

      // Reset to first tab
      const tabStrip = $("#" + this.config.tabStripId).data("kendoTabStrip");
      if (tabStrip) {
        tabStrip.select(0);
      }

      // Clear validation messages
      $("#" + this.config.detailsDivId).find(". k-tooltip-validation").hide();
      $("#" + this.config.detailsDivId).find(".field-validation-error")
        .removeClass("field-validation-error")
        .addClass("field-validation-valid");

      console.log('Form cleared successfully');

    } catch (error) {
      console.error('Error clearing form:', error);
    }
  }
};

// Register with ModuleRegistry
if (typeof ModuleRegistry !== 'undefined') {
  ModuleRegistry.register('Groups', Groups, {
    dependencies: ['GroupService', 'ApiCallManager', 'MessageManager', 'FormHelper', 'GridHelper'],
    priority: 5,
    autoInit: false,
    route: AppConfig.getFrontendRoute("intGroup")
  });

  console.log('Groups module registered');
} else {
  console.error('ModuleRegistry not loaded!  Cannot register Groups');
}