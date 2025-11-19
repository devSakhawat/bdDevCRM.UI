/// <reference path="../../../config/appconfig.js" />
/// <reference path="../../../core/helpers/formhelper.js" />
/// <reference path="../../../core/helpers/gridhelper.js" />
/// <reference path="../../../core/managers/apicallmanager.js" />
/// <reference path="../../../core/managers/messagemanager.js" />

/*=========================================================
 * Menu Module (Complete CRUD with FormHelper)
 * File: Menu.js
 * Author: devSakhawat
 * Date: 2025-01-18
=========================================================*/

var MenuModule = {
  // Configuration
  config: {
    gridId: 'gridSummaryMenu',
    formId: 'menuForm',
    modalId: 'MenuPopUp',
    moduleComboId: 'cmd-module',
    parentMenuComboId: 'cmb-parent-menu'
  },

  /**
   * Initialize module
   */
  init: function () {
    console.log('🔧 Initializing Menu Module...');
    this.initGrid();
    this.initModal();
    this.initForm();
  },

  /**
   * Initialize Kendo Grid
   */
  initGrid: function () {
    const dataSource = ApiCallManager.createGridDataSource({
      endpoint: AppConfig.endpoints.menuSummary,
      pageSize: 20,
      modelFields: {
        MenuId: { type: 'number' },
        ModuleId: { type: 'number' },
        ParentMenu: { type: 'number' },
        MenuName: { type: 'string' },
        MenuPath: { type: 'string' },
        ParentMenuName: { type: 'string' },
        ModuleName: { type: 'string' },
        MenuCode: { type: 'string' },
        MenuType: { type: 'number' },
        SortOrder: { type: 'number' },
        IsQuickLink: { type: 'boolean' },
        IsActive: { type: 'boolean' }
      }
    });

    GridHelper.loadGrid(this.config.gridId, this.getColumns(), dataSource, {
      toolbar: [
        {
          template: `<button type="button" onclick="MenuModule.openCreateModal()" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">
                      <span class="k-icon k-i-plus"></span>
                      <span class="k-button-text">Create New</span>
                    </button>`
        }
      ],
      fileName: "MenuList",
      heightConfig: {
        headerHeight: 65,
        footerHeight: 50,
        paddingBuffer: 30
      }
    });
  },

  /**
   * Get grid columns
   */
  getColumns: function () {
    return [
      { field: "MenuId", title: "Menu Id", width: 0, hidden: true },
      { field: "ModuleId", title: "Module Id", width: 0, hidden: true },
      { field: "MenuPath", title: "Menu Path", width: 0, hidden: true },
      { field: "ParentMenu", title: "Parent Menu Id", width: 0, hidden: true },
      { field: "SortOrder", title: "Sort Order", width: 0, hidden: true },
      { field: "IsQuickLink", title: "Quick Link", width: 0, hidden: true },
      { field: "MenuCode", title: "Code", width: 0, hidden: true },
      { field: "MenuName", title: "Name", width: 140 },
      { field: "ParentMenuName", title: "Parent Menu", width: 140 },
      { field: "ModuleName", title: "Module Name", width: 120 },
      {
        field: "MenuType",
        title: "Type",
        width: 70,
        template: "#= data.MenuType == 1 ? 'Web' : data.MenuType == 2 ? 'App' : 'Both' #"
      },
      {
        field: "IsActive",
        title: "Status",
        width: 80,
        template: "#= data.IsActive == 1 ? 'Active' : 'Inactive' #"
      },
      {
        field: "Actions",
        title: "Actions",
        width: 200,
        template: GridHelper.createActionColumn({
          idField: 'MenuId',
          editCallback: 'MenuModule.edit',
          deleteCallback: 'MenuModule.delete',
          viewCallback: 'MenuModule.view'
        })
      }
    ];
  },

  /**
   * Initialize Kendo Window (Modal)
   */
  initModal: function () {
    const modal = $('#' + this.config.modalId);
    if (modal.length === 0) {
      console.error('Modal element not found:', this.config.modalId);
      return;
    }

    // FormHelper.initKendoWindow('#' + this.config.modalId, 'Menu Details', '80%', '90%');
  },

  /**
   * Initialize Form with FormHelper
   */
  initForm: function () {
    FormHelper.initForm(this.config.formId);
    this.initComboBoxes();
  },

  /**
   * Initialize ComboBoxes
   */
  initComboBoxes: function () {
    // Module ComboBox
    $('#' + this.config.moduleComboId).kendoComboBox({
      placeholder: "Select Module...",
      dataTextField: "ModuleName",
      dataValueField: "ModuleId",
      filter: "contains",
      suggest: true,
      dataSource: [],
      change: this.onModuleChange.bind(this)
    });

    // Parent Menu ComboBox
    $('#' + this.config.parentMenuComboId).kendoComboBox({
      placeholder: "Select Parent Menu...",
      dataTextField: "MenuName",
      dataValueField: "MenuId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    this.loadModules();
  },

  /**
   * Load modules for dropdown
   */
  loadModules: async function () {
    try {
      const modules = await MenuService.getModules();
      const combo = $('#' + this.config.moduleComboId).data('kendoComboBox');
      if (combo) {
        combo.setDataSource(modules || []);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  },

  /**
   * On module change - load parent menus
   */
  onModuleChange: async function (e) {
    const moduleId = e.sender.value();
    if (!moduleId) return;

    try {
      const menus = await MenuService.getMenusByModuleId(moduleId);
      const combo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');
      if (combo) {
        combo.setDataSource(menus || []);
      }
    } catch (error) {
      console.error('Error loading parent menus:', error);
    }
  },

  /**
   * Open modal for creating new menu
   */
  openCreateModal: function () {
    this.clearForm();
    this.openModal('Create New Menu');
    this.setFormMode('create');
  },

  /**
   * View menu (read-only)
   */
  view: async function (menuId) {
    if (!menuId || menuId <= 0) {
      MessageManager.notify.warning('Invalid menu ID');
      return;
    }

    try {
      const menu = await MenuService.getMenuById(menuId);
      MenuModule.populateForm(menu);
      MenuModule.openModal('View Menu Details');
      MenuModule.setFormMode('view');
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  },

  /**
   * Edit menu
   */
  edit: async function (menuId) {
    if (!menuId || menuId <= 0) {
      MessageManager.notify.warning('Invalid menu ID');
      return;
    }

    try {
      const menu = await MenuService.getMenuById(menuId);
      MenuModule.populateForm(menu);
      MenuModule.openModal('Edit Menu');
      MenuModule.setFormMode('edit');
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  },

  /**
   * Delete menu with confirmation
   */
  delete: async function (menuId) {
    if (!menuId || menuId <= 0) {
      MessageManager.notify.warning('Invalid menu ID');
      return;
    }

    MessageManager.confirm.delete('this menu', async () => {
      try {
        await MessageManager.loading.wrap(
          MenuService.deleteMenu(menuId),
          'Deleting menu...'
        );
        MessageManager.notify.success('Menu deleted successfully!');
        GridHelper.refreshGrid(MenuModule.config.gridId);
      } catch (error) {
        console.error('Delete error:', error);
      }
    });
  },

  /**
   * Save or update menu
   */
  saveOrUpdate: async function () {
    if (!this.validateForm()) {
      return;
    }

    const menuData = this.getFormData();
    const isCreate = !menuData.MenuId || menuData.MenuId === 0;

    try {
      if (isCreate) {
        await MessageManager.loading.wrap(
          MenuService.createMenu(menuData),
          'Creating menu...'
        );
        MessageManager.notify.success('Menu created successfully!');
      } else {
        await MessageManager.loading.wrap(
          MenuService.updateMenu(menuData),
          'Updating menu...'
        );
        MessageManager.notify.success('Menu updated successfully!');
      }

      this.closeModal();
      GridHelper.refreshGrid(this.config.gridId);
    } catch (error) {
      console.error('Save/Update error:', error);
    }
  },

  /**
   * Open modal
   */
  openModal: function (title) {
    FormHelper.openKendoWindow(this.config.modalId, title || 'Menu Details', '80%', '90%');
  },

  /**
   * Close modal
   */
  closeModal: function () {
    FormHelper.closeKendoWindow(this.config.modalId);
  },

  /**
   * On modal close
   */
  onModalClose: function () {
    this.clearForm();
  },

  /**
   * Set form mode (create/edit/view)
   */
  setFormMode: function (mode) {
    const saveBtn = $('#btnMenuSaveOrUpdate');

    if (mode === 'view') {
      FormHelper.makeFormReadOnly('#' + this.config.formId);
      saveBtn.hide();
    } else {
      FormHelper.makeFormEditable('#' + this.config.formId);
      saveBtn.show();

      if (mode === 'create') {
        saveBtn.html('<span class="k-icon k-i-plus"></span> Add Menu');
      } else if (mode === 'edit') {
        saveBtn.html('<span class="k-icon k-i-check"></span> Update Menu');
      }
    }
  },

  /**
   * Clear form
   */
  clearForm: function () {
    FormHelper.clearFormFields('#' + this.config.formId);
    $('#hdMenuId').val(0);
    $('#hdSortOrder').val(0);

    const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
    const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');

    if (moduleCbo) {
      moduleCbo.value('');
      moduleCbo.text('');
    }

    if (parentCbo) {
      parentCbo.value('');
      parentCbo.text('');
      parentCbo.setDataSource([]);
    }

    $('#chkIsQuickLink').prop('checked', false);
  },

  /**
   * Populate form with data
   */
  populateForm: function (data) {
    if (!data) return;

    FormHelper.setFormData('#' + this.config.formId, data);

    const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
    if (moduleCbo && data.ModuleId) {
      moduleCbo.value(data.ModuleId);
    }

    if (data.ModuleId) {
      MenuService.getMenusByModuleId(data.ModuleId).then(menus => {
        const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');
        if (parentCbo) {
          parentCbo.setDataSource(menus || []);
          if (data.ParentMenu) {
            setTimeout(() => parentCbo.value(data.ParentMenu), 100);
          }
        }
      });
    }
  },

  /**
   * Get form data
   */
  getFormData: function () {
    let formData = FormHelper.getFormData('#' + this.config.formId);

    const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
    const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');

    formData.ModuleId = moduleCbo ? parseInt(moduleCbo.value()) || 0 : 0;
    formData.ParentMenu = parentCbo ? parseInt(parentCbo.value()) || 0 : 0;

    return formData;
  },

  /**
   * Validate form
   */
  validateForm: function () {
    if (!FormHelper.validate('#' + this.config.formId)) {
      return false;
    }

    const data = this.getFormData();

    if (!data.MenuName || data.MenuName.trim() === '') {
      MessageManager.notify.error('Menu name is required');
      $('#menu-name').focus();
      return false;
    }

    if (!data.ModuleId || data.ModuleId === 0) {
      MessageManager.notify.error('Please select a module');
      $('#' + this.config.moduleComboId).focus();
      return false;
    }

    return true;
  }
};

// Backward compatibility aliases
var MenuDetailsManager = {
  saveOrUpdateItem: function () {
    MenuModule.saveOrUpdate();
  }
};

var MenuDetailsHelper = {
  clearForm: function () {
    MenuModule.clearForm();
  },
  closeForm: function () {
    MenuModule.closeModal();
  }
};

// Initialize on document ready
$(document).ready(function () {
  // Check dependencies
  if (typeof MenuService === 'undefined') {
    console.error('❌ MenuService not loaded!');
    return;
  }

  if (typeof ApiCallManager === 'undefined') {
    console.error('❌ ApiCallManager not loaded!');
    return;
  }

  if (typeof MessageManager === 'undefined') {
    console.error('❌ MessageManager not loaded!');
    return;
  }

  if (typeof FormHelper === 'undefined') {
    console.warn('⚠️ FormHelper not loaded!');
    return;
  }

  if (typeof GridHelper === 'undefined') {
    console.error('❌ GridHelper not loaded!');
    return;
  }

  // Initialize module
  try {
    MenuModule.init();
    console.log('✅ Menu Module initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Menu module:', error);
  }
});



















///// <reference path="../../../config/appconfig.js" />
///// <reference path="../../../core/helpers/formhelper.js" />
///// <reference path="../../../core/helpers/gridhelper.js" />
///// <reference path="../../../core/managers/apicallmanager.js" />
///// <reference path="../../../core/managers/messagemanager.js" />

///*=========================================================
// * Menu Module (Complete CRUD with FormHelper)
// * File: Menu.js
// * Description: Menu management with FormHelper integration
// * Author: devSakhawat
// * Date: 2025-01-18
//=========================================================*/


//var MenuModule = {

//  // Configuration
//  config: {
//    gridId: 'gridSummaryMenu',
//    formId: 'menuForm',
//    modalId: 'MenuPopUp',
//    moduleComboId: 'cmbModule',
//    parentMenuComboId: 'cmbParentMenu'
//  },

//  /**
// * Initialize Kendo Grid with error handling
// */
//  initGrid: function () {
//    try {
//      console.log('🔧 Initializing grid...');

//      // Create DataSource
//      const dataSource = MenuService.getGridDataSource({
//        pageSize: 20
//      });

//      // ✅ Check if dataSource is valid
//      if (!dataSource) {
//        console.error('❌ Failed to create grid DataSource');
//        MessageManager.notify.error('Failed to initialize grid');
//        return;
//      }

//      // ✅ Bind error event BEFORE loading grid
//      dataSource.bind('error', function (e) {
//        console.error('❌ Grid DataSource Error:', e);
//        MessageManager.notify.error('Failed to load grid data. Please check console.');
//      });

//      // ✅ Bind requestStart event for debugging
//      dataSource.bind('requestStart', function (e) {
//        console.log('📤 Grid request starting...');
//      });

//      // ✅ Bind requestEnd event for debugging
//      dataSource.bind('requestEnd', function (e) {
//        console.log('📥 Grid request completed');
//        console.log('Response:', e.response);

//        if (e.response && e.response.IsSuccess === false) {
//          console.error('❌ API returned error:', e.response.Message);
//          MessageManager.notify.error(e.response.Message || 'Failed to load data');
//        }
//      });

//      // Load grid
//      GridHelper.loadGrid(this.config.gridId, this.getColumns(), dataSource, {
//        toolbar: [
//          {
//            template: `<button type="button" onclick="MenuModule.openCreateModal()" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">
//                      <span class="k-icon k-i-plus"></span>
//                      <span class="k-button-text">Create New</span>
//                    </button>`
//          }
//        ],
//        fileName: "MenuList",
//        heightConfig: {
//          headerHeight: 65,
//          footerHeight: 50,
//          paddingBuffer: 30,
//          toolbarHeight: 45,
//          pagerHeight: 50,
//          gridHeaderHeight: 40,
//          rowHeight: 40,
//          minHeight: 300
//        }
//      });

//      console.log('✅ Grid initialized');
//    } catch (error) {
//      console.error('❌ Error initializing grid:', error);
//      MessageManager.notify.error('Failed to initialize grid');
//    }
//  },

//  /**
//     * Initialize Kendo Grid with error handling
//     */
//  initGrid: function () {
//    try {
//      // Create DataSource using MenuService
//      const dataSource = MenuService.getGridDataSource({
//        pageSize: 20
//      });

//      // Check if dataSource is valid
//      if (!dataSource) {
//        console.error('Failed to create grid DataSource');
//        MessageManager.notify.error('Failed to initialize grid');
//        return;
//      }

//      // Bind error event
//      dataSource.bind('error', function (e) {
//        console.error('Grid DataSource Error:', e);
//        MessageManager.notify.error('Failed to load grid data');
//      });

//      // Load grid
//      GridHelper.loadGrid(this.config.gridId, this.getColumns(), dataSource, {
//        toolbar: [
//          {
//            template: `<button type="button" onclick="MenuModule.openCreateModal()" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">
//                        <span class="k-icon k-i-plus"></span>
//                        <span class="k-button-text">Create New</span>
//                      </button>`
//          }
//        ],
//        fileName: "MenuList",
//        //heightConfig: {
//        //  headerHeight: 65,
//        //  footerHeight: 50,
//        //  paddingBuffer: 30,
//        //  toolbarHeight: 45,
//        //  pagerHeight: 50,
//        //  gridHeaderHeight: 40,
//        //  rowHeight: 40,
//        //  minHeight: 300
//        //}
//      });

//      console.log('✅ Grid initialized successfully');
//    } catch (error) {
//      console.error('❌ Error initializing grid:', error);
//      MessageManager.notify.error('Failed to initialize grid');
//    }
//  },

//  /**
//   * Get grid columns
//   */
//  getColumns: function () {
//    return [
//      { field: "MenuId", title: "Menu Id", width: "0px", hidden: true },
//      { field: "ModuleId", title: "Module Id", width: "0px", hidden: true },
//      { field: "MenuPath", title: "Menu Path", width: "0px", hidden: true },
//      { field: "ParentMenu", title: "Parent Menu Id", width: "0px", hidden: true },
//      { field: "SortOrder", title: "Sort Order", width: "0px", hidden: true },
//      { field: "IsQuickLink", title: "Quick Link", width: "0px", hidden: true },
//      { field: "MenuCode", title: "Code", width: "0px", hidden: true },
//      {
//        field: "MenuName",
//        title: "Name",
//        width: "180px",
//        headerAttributes: { style: "white-space: normal;" }
//      },
//      {
//        field: "ParentMenuName",
//        title: "Parent Menu",
//        width: "150px",
//        headerAttributes: { style: "white-space: normal;" }
//      },
//      {
//        field: "ModuleName",
//        title: "Module Name",
//        width: "140px",
//        headerAttributes: { style: "white-space: normal;" }
//      },
//      {
//        field: "MenuType",
//        title: "Type",
//        width: "80px",
//        template: "#= data.MenuType == 1 ? 'Web' : data.MenuType == 2 ? 'App' : 'Both' #",
//        headerAttributes: { style: "white-space: normal;" }
//      },
//      {
//        field: "IsActive",
//        title: "Status",
//        width: "90px",
//        template: "#= data.IsActive ? '<span class=\"badge bg-success\">Active</span>' : '<span class=\"badge bg-secondary\">Inactive</span>' #",
//        headerAttributes: { style: "white-space: normal;" }
//      },
//      {
//        field: "Actions",
//        title: "Actions",
//        width: 200,
//        template: GridHelper.createActionColumn({
//          idField: 'MenuId',  // field value from gridDataSource.
//          editCallback: 'MenuModule.edit',
//          deleteCallback: 'MenuModule.delete',
//          viewCallback: 'MenuModule.view'
//        })
//      }
//    ];
//  },

//  /**
//    * Initialize Kendo Window (Modal)
//    */
//  initModal: function () {
//    const modal = $('#' + this.config.modalId);
//    if (modal.length === 0) {
//      console.error('Modal element not found:', this.config.modalId);
//      return;
//    }

//    // Use FormHelper to initialize Kendo Window
//    if (typeof FormHelper !== 'undefined' && FormHelper.initKendoWindow) {
//      FormHelper.initKendoWindow('#' + this.config.modalId, 'Menu Details', '80%', '90%');
//    } else {
//      // Fallback manual initialization
//      modal.kendoWindow({
//        width: "80%",
//        maxHeight: "90%",
//        title: "Menu Details",
//        visible: false,
//        modal: true,
//        actions: ["Close"],
//        close: this.onModalClose.bind(this)
//      });
//    }
//  },

//  /**
//   * Initialize Form with FormHelper
//   */
//  initForm: function () {
//    // Initialize form using FormHelper if available
//    if (typeof FormHelper !== 'undefined' && FormHelper.initForm) {
//      FormHelper.initForm(this.config.formId);
//    }

//    this.initComboBoxes();
//  },

//  /**
//   * Initialize ComboBoxes
//   */
//  initComboBoxes: function () {
//    // Module ComboBox
//    $('#' + this.config.moduleComboId).kendoComboBox({
//      placeholder: "Select Module...",
//      dataTextField: "ModuleName",
//      dataValueField: "ModuleId",
//      filter: "contains",
//      suggest: true,
//      dataSource: [],
//      change: this.onModuleChange.bind(this)
//    });

//    // Parent Menu ComboBox
//    $('#' + this.config.parentMenuComboId).kendoComboBox({
//      placeholder: "Select Parent Menu...",
//      dataTextField: "MenuName",
//      dataValueField: "MenuId",
//      filter: "contains",
//      suggest: true,
//      dataSource: []
//    });

//    // Load modules
//    this.loadModules();
//  },

//  /**
//   * Load modules for dropdown
//   */
//  loadModules: async function () {
//    try {
//      const modules = await MenuService.getModules();
//      const combo = $('#' + this.config.moduleComboId).data('kendoComboBox');
//      if (combo) {
//        combo.setDataSource(modules || []);
//      }
//    } catch (error) {
//      console.error('Error loading modules:', error);
//    }
//  },

//  /**
//    * On module change - load parent menus
//    */
//  onModuleChange: async function (e) {
//    const moduleId = e.sender.value();
//    if (!moduleId) return;

//    try {
//      const menus = await MenuService.getMenusByModuleId(moduleId);
//      const combo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');
//      if (combo) {
//        combo.setDataSource(menus || []);
//      }
//    } catch (error) {
//      console.error('Error loading parent menus:', error);
//    }
//  },

//  /**
//   * Open modal for creating new menu
//   */
//  openCreateModal: function () {
//    // Clear form using FormHelper
//    this.clearForm();

//    // Open modal
//    this.openModal('Create New Menu');

//    // Set form mode
//    this.setFormMode('create');
//  },

//  /**
//   * View menu (read-only)
//   */
//  viewMenu: async function (menuId) {
//    if (!menuId || menuId <= 0) {
//      MessageManager.notify.warning('Invalid menu ID');
//      return;
//    }

//    try {
//      const menu = await MenuService.getById(menuId);

//      // Populate form using FormHelper
//      this.populateForm(menu);

//      // Open modal
//      this.openModal('View Menu Details');

//      // Set form to read-only using FormHelper
//      this.setFormMode('view');
//    } catch (error) {
//      console.error('Error loading menu:', error);
//    }
//  },

//  /**
//   * Edit menu
//   */
//  editMenu: async function (menuId) {
//    if (!menuId || menuId <= 0) {
//      MessageManager.notify.warning('Invalid menu ID');
//      return;
//    }

//    try {
//      const menu = await MenuService.getById(menuId);

//      // Populate form using FormHelper
//      this.populateForm(menu);

//      // Open modal
//      this.openModal('Edit Menu');

//      // Set form to editable
//      this.setFormMode('edit');
//    } catch (error) {
//      console.error('Error loading menu:', error);
//    }
//  },

//  /**
//   * Delete menu with confirmation
//   */
//  deleteMenu: async function (menuId) {
//    if (!menuId || menuId <= 0) {
//      MessageManager.notify.warning('Invalid menu ID');
//      return;
//    }

//    MessageManager.confirm.delete('this menu', async () => {
//      try {
//        await MessageManager.loading.wrap(
//          MenuService.delete(menuId),
//          'Deleting menu...'
//        );

//        MessageManager.notify.success('Menu deleted successfully!');
//        GridHelper.refreshGrid(this.config.gridId);
//      } catch (error) {
//        console.error('Delete error:', error);
//      }
//    });
//  },

//  /**
//   * Save or update menu
//   */
//  saveOrUpdate: async function () {
//    // Validate form using FormHelper
//    if (!this.validateForm()) {
//      return;
//    }

//    // Get form data using FormHelper
//    const menuData = this.getFormData();
//    const isCreate = !menuData.MenuId || menuData.MenuId === 0;

//    try {
//      if (isCreate) {
//        await MessageManager.loading.wrap(
//          MenuService.create(menuData),
//          'Creating menu...'
//        );
//        MessageManager.notify.success('Menu created successfully!');
//      } else {
//        await MessageManager.loading.wrap(
//          MenuService.update(menuData.MenuId, menuData),
//          'Updating menu...'
//        );
//        MessageManager.notify.success('Menu updated successfully!');
//      }

//      // Close modal
//      this.closeModal();

//      // Refresh grid
//      GridHelper.refreshGrid(this.config.gridId);
//    } catch (error) {
//      console.error('Save/Update error:', error);
//    }
//  },

//  /**
//  * Open modal
//  */
//  openModal: function (title) {
//    const window = $('#' + this.config.modalId).data('kendoWindow');
//    if (window) {
//      window.title(title || 'Menu Details');
//      window.center();
//      window.open();
//    }
//  },

//  /**
//   * Close modal
//   */
//  closeModal: function () {
//    const window = $('#' + this.config.modalId).data('kendoWindow');
//    if (window) {
//      window.close();
//    }
//  },

//  /**
//   * On modal close
//   */
//  onModalClose: function () {
//    this.clearForm();
//  },

//  /**
//   * Set form mode (create/edit/view)
//   */
//  setFormMode: function (mode) {
//    const form = $('#' + this.config.formId);
//    const saveBtn = $('#btnMenuSaveOrUpdate');

//    if (mode === 'view') {
//      form.find('input, select, textarea').prop('disabled', true);
//      form.find('.k-widget input').prop('disabled', true);
//      saveBtn.hide();
//    } else {
//      form.find('input, select, textarea').prop('disabled', false);
//      form.find('.k-widget input').prop('disabled', false);
//      saveBtn.show();

//      if (mode === 'create') {
//        saveBtn.html('<span class="k-icon k-i-plus"></span> Add Menu');
//      } else if (mode === 'edit') {
//        saveBtn.html('<span class="k-icon k-i-check"></span> Update Menu');
//      }
//    }
//  },

//  /**
//   * Open modal using FormHelper
//   */
//  openModal: function (title) {
//    if (typeof FormHelper !== 'undefined' && FormHelper.openKendoWindow) {
//      FormHelper.openKendoWindow(this.config.modalId, title || 'Menu Details', '80%', '90%');
//    } else {
//      // Fallback
//      const window = $('#' + this.config.modalId).data('kendoWindow');
//      if (window) {
//        window.title(title || 'Menu Details');
//        window.center();
//        window.open();
//      }
//    }
//  },

//  /**
//   * Close modal using FormHelper
//   */
//  closeModal: function () {
//    if (typeof FormHelper !== 'undefined' && FormHelper.closeKendoWindow) {
//      FormHelper.closeKendoWindow(this.config.modalId);
//    } else {
//      // Fallback
//      const window = $('#' + this.config.modalId).data('kendoWindow');
//      if (window) {
//        window.close();
//      }
//    }
//  },

//  /**
//   * On modal close
//   */
//  onModalClose: function () {
//    this.clearForm();
//  },

//  /**
//   * Set form mode (create/edit/view) using FormHelper
//   */
//  setFormMode: function (mode) {
//    const saveBtn = $('#btnMenuSaveOrUpdate');

//    if (mode === 'view') {
//      // Make form read-only using FormHelper
//      if (typeof FormHelper !== 'undefined' && FormHelper.makeFormReadOnly) {
//        FormHelper.makeFormReadOnly('#' + this.config.formId);
//      } else {
//        // Fallback
//        $('#' + this.config.formId).find('input, select, textarea').prop('disabled', true);
//        $('#' + this.config.formId).find('.k-widget input').prop('disabled', true);
//      }
//      saveBtn.hide();
//    } else {
//      // Make form editable using FormHelper
//      if (typeof FormHelper !== 'undefined' && FormHelper.makeFormEditable) {
//        FormHelper.makeFormEditable('#' + this.config.formId);
//      } else {
//        // Fallback
//        $('#' + this.config.formId).find('input, select, textarea').prop('disabled', false);
//        $('#' + this.config.formId).find('.k-widget input').prop('disabled', false);
//      }
//      saveBtn.show();

//      if (mode === 'create') {
//        saveBtn.html('<span class="k-icon k-i-plus"></span> Add Menu');
//      } else if (mode === 'edit') {
//        saveBtn.html('<span class="k-icon k-i-check"></span> Update Menu');
//      }
//    }
//  },

//  /**
//   * Clear form using FormHelper
//   */
//  clearForm: function () {
//    // Use FormHelper to clear form fields
//    if (typeof FormHelper !== 'undefined' && FormHelper.clearFormFields) {
//      FormHelper.clearFormFields('#' + this.config.formId);
//    } else {
//      // Fallback
//      const form = $('#' + this.config.formId)[0];
//      if (form) {
//        form.reset();
//      }
//    }

//    // Clear hidden fields
//    $('#hdMenuId').val(0);
//    $('#hdSortOrder').val(0);

//    // Clear ComboBoxes
//    const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
//    const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');

//    if (moduleCbo) {
//      moduleCbo.value('');
//      moduleCbo.text('');
//    }

//    if (parentCbo) {
//      parentCbo.value('');
//      parentCbo.text('');
//      parentCbo.setDataSource([]);
//    }

//    // Uncheck checkbox
//    $('#chkIsQuickLink').prop('checked', false);
//  },

//  /**
//   * Populate form with data using FormHelper
//   */
//  populateForm: function (data) {
//    if (!data) return;

//    // Use FormHelper to set form data if available
//    if (typeof FormHelper !== 'undefined' && FormHelper.setFormData) {
//      FormHelper.setFormData('#' + this.config.formId, data);
//    } else {
//      // Fallback manual population
//      $('#hdMenuId').val(data.MenuId || 0);
//      $('#menu-name').val(data.MenuName || '');
//      $('#menu-path').val(data.MenuPath || '');
//      $('#hdSortOrder').val(data.SortOrder || 0);
//      $('#chkIsQuickLink').prop('checked', data.IsQuickLink || false);
//    }

//    // Set ComboBox values (ComboBoxes need manual handling)
//    const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
//    if (moduleCbo && data.ModuleId) {
//      moduleCbo.value(data.ModuleId);
//    }

//    // Set parent menu after loading parent menus for the module
//    if (data.ModuleId) {
//      MenuService.getMenusByModuleId(data.ModuleId).then(menus => {
//        const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');
//        if (parentCbo) {
//          parentCbo.setDataSource(menus || []);
//          if (data.ParentMenu) {
//            setTimeout(() => parentCbo.value(data.ParentMenu), 100);
//          }
//        }
//      });
//    }
//  },

//  /**
//   * Get form data using FormHelper
//   */
//  getFormData: function () {
//    let formData;

//    // Use FormHelper to get form data if available
//    if (typeof FormHelper !== 'undefined' && FormHelper.getFormData) {
//      formData = FormHelper.getFormData('#' + this.config.formId);
//    } else {
//      // Fallback manual data collection
//      formData = {
//        MenuId: parseInt($('#hdMenuId').val()) || 0,
//        MenuName: $('#menu-name').val() || '',
//        MenuPath: $('#menu-path').val() || '',
//        SortOrder: parseInt($('#hdSortOrder').val()) || 0,
//        IsQuickLink: $('#chkIsQuickLink').is(':checked')
//      };
//    }

//    // Add ComboBox values (need manual handling)
//    const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
//    const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');

//    formData.ModuleId = moduleCbo ? parseInt(moduleCbo.value()) || 0 : 0;
//    formData.ParentMenu = parentCbo ? parseInt(parentCbo.value()) || 0 : 0;

//    return formData;
//  },

//  /**
//   * Validate form using FormHelper
//   */
//  validateForm: function () {
//    // Use FormHelper validation if available
//    if (typeof FormHelper !== 'undefined' && FormHelper.validate) {
//      if (!FormHelper.validate('#' + this.config.formId)) {
//        return false;
//      }
//    }

//    // Additional custom validations
//    const data = this.getFormData();

//    if (!data.MenuName || data.MenuName.trim() === '') {
//      MessageManager.notify.error('Menu name is required');
//      $('#menu-name').focus();
//      return false;
//    }

//    if (!data.ModuleId || data.ModuleId === 0) {
//      MessageManager.notify.error('Please select a module');
//      $('#' + this.config.moduleComboId).focus();
//      return false;
//    }

//    return true;
//  },


//  //// Form initialization
//  //initForm: function () {
//  //  FormHelper.initForm('menuForm');
//  //  this.loadComboBoxes();
//  //},

//  loadComboBoxes: async function () {
//    const modules = await MenuService.getModules();

//    $('#cmbModule').kendoComboBox({
//      dataSource: modules,
//      dataTextField: 'ModuleName',
//      dataValueField: 'ModuleId'
//    });
//  },

//  // Event binding
//  bindEvents: function () {
//    $('#btnAdd').on('click', () => this.openNew());
//    $('#btnSave').on('click', () => this.save());
//    $('#btnCancel').on('click', () => this.cancel());
//  },

//  // Open new form
//  openNew: function () {
//    FormHelper.clearFormFields('menuForm');
//    FormHelper.formShowGridHide('menuForm', 'menuGrid');
//  },

//  // View Menu
//  view: function (menuId) {
//    // Data From Grid
//    const grid = $('#gridSummaryMenu').data('kendoGrid');
//    const dataItem = grid.dataSource.get(menuId);  // ← ID দিয়ে data পাবেন

//    if (dataItem) {
//      // Details populate
//      FormHelper.setFormData('detailsForm', dataItem);
//      FormHelper.makeFormReadOnly('detailsForm');

//      // window open
//      FormHelper.openKendoWindow('detailsWindow', 'View Menu Details');
//    }
//  },

//  // Edit menu
//  edit: async function (id) {
//    try {
//      const menu = await MenuService.getMenuById(id);
//      FormHelper.setFormData('menuForm', menu);
//      FormHelper.formShowGridHide('menuForm', 'menuGrid');
//    } catch (error) {
//      // Error already handled by MenuService
//    }
//  },

//  // Delete menu
//  delete: async function (id) {
//    MessageManager.confirm.delete('this menu', async () => {
//      try {
//        await MenuService.deleteMenu(id);
//        GridHelper.refreshGrid('menuGrid');
//      } catch (error) {
//        // Error already handled by MenuService
//      }
//    });
//  },

//  // Save menu
//  save: async function () {
//    if (!FormHelper.validate('#menuForm')) return;

//    const data = FormHelper.getFormData('menuForm');

//    try {
//      if (data.MenuId && data.MenuId > 0) {
//        await MenuService.updateMenu(data);
//      } else {
//        await MenuService.createMenu(data);
//      }

//      this.cancel();
//      GridHelper.refreshGrid('menuGrid');
//    } catch (error) {
//      // Error already handled by MenuService
//    }
//  },

//  // Cancel and return to grid
//  cancel: function () {
//    FormHelper.clearFormFields('menuForm');
//    FormHelper.formHideGridShow('menuForm', 'menuGrid');
//  }
//};

//// Initialize on document ready
//$(document).ready(function () {
//  // Check dependencies
//  if (typeof MenuService === 'undefined') {
//    console.error('MenuService not loaded!');
//    return;
//  }

//  if (typeof ApiCallManager === 'undefined') {
//    console.error('ApiCallManager not loaded!');
//    return;
//  }

//  if (typeof MessageManager === 'undefined') {
//    console.error('MessageManager not loaded!');
//    return;
//  }

//  if (typeof FormHelper === 'undefined') {
//    console.warn('⚠️ FormHelper not loaded! Using fallback methods.');
//  }

//  if (typeof GridHelper === 'undefined') {
//    console.error('GridHelper not loaded!');
//    return;
//  }

  //// Initialize module
  //MenuModule.init();
  ////*************************************************** */
//  console.log('%c=== Menu Module Initialization ===', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
//  console.log('DOM Ready - Checking dependencies...');

//  // Check dependencies with detailed logging
//  const dependencies = {
//    jQuery: typeof $ !== 'undefined',
//    Kendo: typeof kendo !== 'undefined',
//    AppConfig: typeof AppConfig !== 'undefined',
//    ApiCallManager: typeof ApiCallManager !== 'undefined',
//    MessageManager: typeof MessageManager !== 'undefined',
//    GridHelper: typeof GridHelper !== 'undefined',
//    MenuService: typeof MenuService !== 'undefined'
//  };

//  console.table(dependencies);

//  // Find missing dependencies
//  let missingDeps = [];
//  for (let dep in dependencies) {
//    if (!dependencies[dep]) {
//      missingDeps.push(dep);
//    }
//  }

//  if (missingDeps.length > 0) {
//    const errorMsg = '❌ Missing dependencies: ' + missingDeps.join(', ');
//    console.error(errorMsg);
//    alert('Failed to load Menu module.\n\nMissing: ' + missingDeps.join(', ') + '\n\nPlease check browser console for details.');
//    return;
//  }

//  // Log API configuration
//  console.log('%cAPI Configuration:', 'color: #FF9800; font-weight: bold;');
//  console.log('Base URL:', AppConfig.getApiUrl());
//  console.log('Menu Summary Endpoint:', AppConfig.endpoints.menuSummary);
//  console.log('Modules Endpoint:', AppConfig.endpoints.modules);

//  // Initialize module with delay to ensure everything is ready
//  setTimeout(() => {
//    try {
//      MenuModule.init();
//    } catch (error) {
//      console.error('❌ Failed to initialize Menu module:', error);
//      alert('Failed to initialize Menu module.\n\nError: ' + error.message + '\n\nPlease check browser console for details.');
//    }
//  }, 100);
//});


//**কাকে ব্যবহার করে:**
//- ✅ **MenuService** - API calls এর জন্য
//- ✅ **GridHelper** - Grid operations এর জন্য
//- ✅ **FormHelper** - Form operations এর জন্য
//- ✅ **MessageManager** - Confirmations এর জন্য

//---

//## **🔗 ডিপেন্ডেন্সি চেইন:**
//```
//Menu.js
//    ├─→ MenuService ─→ ApiCallManager ─→ AppConfig
//    │                 └─→ MessageManager
//    ├─→ GridHelper(Independent)
//    ├─→ FormHelper(Independent)
//    └─→ MessageManager










//// wwwroot/assets/Scripts/Modules/Menu/Menu.js
///// <reference path="../../../core/managers/apicallmanager.js" />
///// <reference path="../../../core/managers/messagemanager.js" />
///// <reference path="../../services/module/menuservice.js" /> // Reference to MenuService
///// <reference path="menudetails.js" /> // Reference to MenuDetails
///// <reference path="menuserverview.js" /> // Reference to MenuSummary

///*=========================================================
// * Menu Main
// * File: Menu.js
// * Description: Menu module initialization
// * Author: devSakhawat
// * Date: 2025-01-14
//=========================================================*/
//$(document).ready(function () {
//  // Check dependencies
//  if (typeof MenuService === 'undefined') {
//    console.error('MenuService not loaded! Please ensure MenuService.js is loaded before Menu.js');
//    return;
//  }
//  if (typeof ApiCallManager === 'undefined') {
//    console.error('ApiCallManager not loaded! Please ensure ApiCallManager.js is loaded');
//    return;
//  }
//  if (typeof MessageManager === 'undefined') {
//    console.error('MessageManager not loaded! Please ensure MessageManager.js is loaded');
//    return;
//  }

//  // Initialize components
//  try {
//    debugger; // Consider removing for production
//    MenuSummaryHelper.initMenuSummary();
//    //MenuDetailsHelper.initMenuDetails();
//    console.log('✅ Menu module initialized successfully');
//  } catch (error) {
//    console.error('❌ Error initializing Menu module:', error);
//    if (typeof MessageManager !== 'undefined') {
//      MessageManager.notify.error('Failed to initialize Menu module');
//    }
//  }
//});

//// Keep empty objects for backward compatibility if needed by other parts of the system
//var MenuManager = {};
//var MenuHelper = {};
