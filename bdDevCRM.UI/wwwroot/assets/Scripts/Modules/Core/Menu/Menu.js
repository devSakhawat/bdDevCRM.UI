/// <reference path="../../../config/appconfig.js" />
/// <reference path="../../../core/helpers/formhelper.js" />
/// <reference path="../../../core/helpers/gridhelper.js" />
/// <reference path="../../../core/managers/apicallmanager.js" />
/// <reference path="../../../core/managers/messagemanager.js" />
/// <reference path="../../../core/managers/appinitializer.js" />
/// <reference path="../../../core/moduleregistry.js" />
/// <reference path="../../../core/appinitializer.js" />

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
    parentMenuComboId: 'cmb-parent-menu',
    isActive : 'is-active'
  },

  /**
   * Initialize module
   */
  init: function () {
    debugger;
    /*console.log('Initializing Menu Module.. .');*/

    //// Check dependencies (now done by ModuleRegistry, but good to double-check)
    //if (!this._checkDependencies()) {
    //  throw new Error('Menu Module dependencies not satisfied');
    //}

    this.initGrid();
    this.initModal();
    this.initForm();

    console.log('Menu Module initialized successfully');
  },

  ///**
  // * Check module dependencies
  // */
  //_checkDependencies: function () {
  //  var deps = {
  //    MenuService: typeof MenuService !== 'undefined',
  //    ApiCallManager: typeof ApiCallManager !== 'undefined',
  //    MessageManager: typeof MessageManager !== 'undefined',
  //    FormHelper: typeof FormHelper !== 'undefined',
  //    GridHelper: typeof GridHelper !== 'undefined'
  //  };

  //  for (var dep in deps) {
  //    if (!deps[dep]) {
  //      console.error('Missing dependency:', dep);
  //      return false;
  //    }
  //  }

  //  return true;
  //},



  /**
   * Initialize Kendo Grid
   */
  initGrid: function () {
    const dataSource = MenuService.getGridDataSource({});

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

    $('#' + this.config.isActive).kendoDropDownList({
      dataTextField: "text",
      dataValueField: "value",
      filter: "contains",
      optionLabel: "Select Status...", 
      suggest: true,
      dataSource: [
        { text: "Active", value: 1 },
        { text: "Inactive", value: 0 }
      ]
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
    debugger;
    this.clearForm();
    //this.openModal('Create New Menu');
    FormHelper.openKendoWindow(this.config.modalId, 'Create New Module', '80%');
    this.setFormMode('create');
  },

  view: async function (menuId) {
    if (!menuId || menuId <= 0) {
      MessageManager.notify.warning('Invalid menu ID');
      return;
    }

    try {
      // Data From Grid
      this.clearForm();
      const grid = $('#gridSummaryMenu').data('kendoGrid');
      const dataItem = grid.dataSource.get(menuId);
      if (dataItem) {
        MenuModule.populateForm(dataItem);
        MenuModule.openModal('View Menu Details');
        MenuModule.setFormMode('view');
      }
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
      const grid = $('#gridSummaryMenu').data('kendoGrid');
      const dataItem = grid.dataSource.get(menuId);
      if (dataItem) {
        MenuModule.populateForm(dataItem);
        MenuModule.openModal('Edit Menu');
        MenuModule.setFormMode('edit');
      }
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
          MenuService.delete(menuId),
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
    //(Type-safe)
    const menuData = this.getFormData();
    console.log(menuData);

    //const menuData = this.getFormData();
    const isCreate = !menuData.MenuId || menuData.MenuId === 0;

    try {
      if (isCreate) {
        await MessageManager.loading.wrap(
          MenuService.create(menuData),
          'Creating menu...'
        );
        MessageManager.notify.success('Menu created successfully!');
      } else {
        await MessageManager.loading.wrap(
          MenuService.update(menuData.MenuId ,menuData),
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
    const isActiveCbo = $('#' + this.config.isActive).data('kendoDropDownList');

    if (moduleCbo) {
      moduleCbo.value('');
      moduleCbo.text('');
    }

    if (parentCbo) {
      parentCbo.value('');
      parentCbo.text('');
      parentCbo.setDataSource([]);
    }

    if (isActiveCbo) {
      isActiveCbo.value('');
      isActiveCbo.text('');
    }

    $('#chkIsQuickLink').prop('checked', false);
  },

  /**
   * Populate form with data
   */
  populateForm: function (data) {
    if (!data) return;
    this.clearForm();

    FormHelper.setFormData('#' + this.config.formId, data);

    const isActiveCbo = $('#' + this.config.isActive).data('kendoDropDownList');
    if (isActiveCbo && data.IsActive) {
      isActiveCbo.value(data.IsActive);
    }

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
    //Type-safe form data
    let formData = FormHelper.getFormDataTyped(this.config.formId);

    //Manual conversion for ComboBoxes
    const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
    const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');

    formData.ModuleId = moduleCbo ? parseInt(moduleCbo.value()) || 0 : 0;
    formData.ParentMenu = parentCbo ? parseInt(parentCbo.value()) || 0 : 0;

    //Ensure IsQuickLink is int (0 or 1)
    formData.IsQuickLink = formData.IsQuickLink ? 1 : 0;

    //Ensure IsActive is int
    formData.IsActive = parseInt(formData.IsActive) || 0;

    return formData;
  },

  /**
   * Validate form
   */
  validateForm: function (formData) {
    if (!FormHelper.validate('#' + this.config.formId)) {
      return false;
    }

    if (!formData.MenuName || formData.MenuName.trim() === '') {
      MessageManager.notify.error('Menu name is required');
      $('#menu-name').focus();
      return false;
    }

    if (!formData.ModuleId || formData.ModuleId === 0) {
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

//NEW WAY - Register with ModuleRegistry
if (typeof ModuleRegistry !== 'undefined') {
  ModuleRegistry.register('MenuModule', MenuModule, {
    dependencies: ['MenuService', 'ApiCallManager', 'MessageManager', 'FormHelper', 'GridHelper'],
    priority: 5,
    autoInit: false,  // Will be initialized by route
    route: AppConfig.getFrontendRoute("intMenu")  // Only initialize when on Menu pages
  });

  console.log('MenuModule registered');
} else {
  console.error('ModuleRegistry not loaded!  Cannot register MenuModule');
}








