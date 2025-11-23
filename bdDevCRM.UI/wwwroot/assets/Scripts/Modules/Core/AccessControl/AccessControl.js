/// <reference path="../../../config/appconfig.js" />
/// <reference path="../../../core/helpers/formhelper.js" />
/// <reference path="../../../core/helpers/gridhelper.js" />
/// <reference path="../../../core/managers/apicallmanager.js" />
/// <reference path="../../../core/managers/messagemanager.js" />
/// <reference path="../../../services/module/core/accesscontrol.js" />


/*=========================================================
 * Access Controll Form (Complete CRUD with)
 * File: AccessControll.js
 * Author: devSakhawat
 * Date: 2025-01-18
=========================================================*/
var AccessControll = {
  // Configuration
  config: {
    gridId: 'gridSummaryAccessControl',
    formId: 'accessControlForm',
    isActive: 'is-active',
    reportName: 'AccessControlList'
  },

  /**
   * Initialize module
   */
  init: function () {
    console.log('🔧 Initializing Menu Module...');
    this.initGrid();
    //this.initModal();
    //this.initForm();
  },

  /**
   * Initialize Kendo Grid
   */
  initGrid: function () {
    const dataSource = AccessControlService.getGridDataSource({});

    GridHelper.loadGrid(this.config.gridId, this.getColumns(), dataSource, {
      fileName: this.config.reportName,
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
      { field: "AccessId", title: "Access Id", width: 0, hidden: true },
      { field: "AccessName", title: "Access Name", width: 120 },
      //{ field: "IsActive", title: "Status", width: 80, template: "#= data.IsActive == 1 ? 'Active' : 'Inactive' #" },
      {
        field: "Actions",
        title: "Actions",
        width: 200,
        template: GridHelper.createActionColumn({
          idField: 'AccessId',
          editCallback: 'AccessControl.edit',
          deleteCallback: 'AccessControl.delete',
          viewCallback: 'AccessControl.view'
        })
      }
    ];
  },

  /**
   * Initialize Form with FormHelper
   */
  initForm: function () {
    FormHelper.initForm(this.config.formId);
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
    if (!this.validateForm()) {
      return;
    }

    // ✅ (Type-safe)
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
          MenuService.update(menuData.MenuId, menuData),
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
    // ✅ Type-safe form data
    let formData = FormHelper.getFormDataTyped('menuForm');

    // ✅ Manual conversion for ComboBoxes
    const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
    const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');

    formData.ModuleId = moduleCbo ? parseInt(moduleCbo.value()) || 0 : 0;
    formData.ParentMenu = parentCbo ? parseInt(parentCbo.value()) || 0 : 0;

    // ✅ Ensure IsQuickLink is int (0 or 1)
    formData.IsQuickLink = formData.IsQuickLink ? 1 : 0;

    // ✅ Ensure IsActive is int
    formData.IsActive = parseInt(formData.IsActive) || 0;

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

// Initialize on document ready
$(document).ready(function () {
  // Check dependencies
  if (typeof AccessControlService === 'undefined') {
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
    AccessControll.init();
    console.log('✅ Menu Module initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Menu module:', error);
  }
});




//$(document).ready(function () {
//    //AccessControlSummaryManager.GenerateAccessControlGrid();
//  //AccessControlSummaryHelper.GeRowDataOfAccessControlGrid();

//  AccessControlSummaryHelper.initAccessControlSummary();

//    $("#txtAccessControlName").focus();
//});