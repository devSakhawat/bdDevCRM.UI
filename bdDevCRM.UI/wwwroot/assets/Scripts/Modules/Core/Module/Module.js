/// <reference path="../../../config/appconfig.js" />
/// <reference path="../../../core/helpers/formhelper.js" />
/// <reference path="../../../core/helpers/gridhelper.js" />
/// <reference path="../../../core/managers/apicallmanager.js" />
/// <reference path="../../../core/managers/messagemanager.js" />
/// <reference path="../../../core/managers/appinitializer.js" />
/// <reference path="../../../core/moduleregistry.js" />
/// <reference path="../../../core/appinitializer.js" />

/*=========================================================
 * Module (Complete CRUD with FormHelper)
 * File: Module.js
 * Author: devSakhawat
 * Date: 2025-12-31
=========================================================*/

var Module = {
  // Configuration
  config: {
    gridId: 'gridSummaryModule',
    formId: 'moduleForm',
    modalId: 'ModulePopUp'
  },

  /**
   * Initialize module
   */
  init: function () {
    debugger;

    // Product Form with additional button
    FormHelper.createFormActionButtons({
      formId: 'moduleForm',
      closeCallback: 'Module.closeModal()',
      clearCallback: 'Module.clearForm()',
      saveCallback: 'Module.saveOrUpdate()',
      saveButtonId: 'btnSaveModule',
    });

    this.initGrid();
    this.initModal();
    this.initForm();
  },

  /**
   * Initialize Kendo Grid
   */
  initGrid: function () {
    const dataSource = ModuleService.getGridDataSource({});

    GridHelper.loadGrid(this.config.gridId, this.getColumns(), dataSource, {
      toolbar: [
        {
          template: `<button type="button" onclick="Module.openCreateModal()" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">
                      <span class="k-icon k-i-plus"></span>
                      <span class="k-button-text">Create New</span>
                    </button>`
        }
      ],
      fileName: "ModuleList",
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
    return columns = [
      { field: "ModuleId", title: "ModuleId",hidden: true },
      { field: "ModuleName", title: "Module Name", width: 300, },
      {
        field: "Actions",
        title: "Actions",
        width: 200,
        template: GridHelper.createActionColumn({
          idField: 'ModuleId',
          editCallback: 'Module.edit',
          deleteCallback: 'Module.delete',
          viewCallback: 'Module.view'
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
  },

  /**
   * Initialize Form with FormHelper
   */
  initForm: function () {
    FormHelper.initForm(this.config.formId);
  },

  ///**
  // * Load modules for dropdown
  // */
  //loadModules: async function () {
  //  try {
  //    const modules = await MenuService.getModules();
  //    const combo = $('#' + this.config.moduleComboId).data('kendoComboBox');
  //    if (combo) {
  //      combo.setDataSource(modules || []);
  //    }
  //  } catch (error) {
  //    console.error('Error loading modules:', error);
  //  }
  //},

  ///**
  // * On module change - load parent menus
  // */
  //onModuleChange: async function (e) {
  //  const moduleId = e.sender.value();
  //  if (!moduleId) return;

  //  try {
  //    const menus = await MenuService.getMenusByModuleId(moduleId);
  //    const combo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');
  //    if (combo) {
  //      combo.setDataSource(menus || []);
  //    }
  //  } catch (error) {
  //    console.error('Error loading parent menus:', error);
  //  }
  //},

  /**
   * Open modal for creating new module
   */
  openCreateModal: function () {
    debugger;
    this.clearForm();
    //this.openModal('Create New Module');
    FormHelper.openKendoWindow(this.config.modalId, 'Create New Module', '50%');
    FormHelper.setFormMode({
      formMode: 'create', 
      formId: 'moduleForm',
      saveOrUpdateButtonId: 'btnSaveModule'
    });
  },

  view: async function (moduleId) {
    debugger;
    if (!moduleId || moduleId <= 0) {
      MessageManager.notify.warning('Invalid module ID');
      return;
    }

    try {
      // Data From Grid
      this.clearForm();
      const grid = $('#gridSummaryModule').data('kendoGrid');
      const dataItem = grid.dataSource.get(moduleId);
      if (dataItem) {
        Module.populateForm(dataItem);
        Module.openModal('View Module Details');
        FormHelper.setFormMode({
          formId: 'moduleForm',
          formMode: 'view',
          saveOrUpdateButtonId: 'btnSaveModule'
        });
      }
    } catch (error) {
      console.error('Error loading module:', error);
    }
  },

  /**
   * Edit module
   */
  edit: async function (moduleId) {
    if (!moduleId || moduleId <= 0) {
      MessageManager.notify.warning('Invalid module ID');
      return;
    }

    try {
      const grid = $('#gridSummaryModule').data('kendoGrid');
      const dataItem = grid.dataSource.get(moduleId);
      if (dataItem) {
        Module.populateForm(dataItem);
        Module.openModal('Edit Module');
        FormHelper.setFormMode({
          formId: 'moduleForm',
          formMode: 'edit',
          saveOrUpdateButtonId: 'btnSaveModule'
        });
      }
    } catch (error) {
      console.error('Error loading module:', error);
    }
  },

  /**
   * Delete module with confirmation
   */
  delete: async function (moduleId) {
    if (!moduleId || moduleId <= 0) {
      MessageManager.notify.warning('Invalid moduleId ID');
      return;
    }

    MessageManager.confirm.delete('this module', async () => {
      try {
        await MessageManager.loading.wrap(
          ModuleService.delete(moduleId),
          'Deleting module...'
        );
        MessageManager.notify.success('Module deleted successfully!');
        GridHelper.refreshGrid(Module.config.gridId);
      } catch (error) {
        console.error('Delete error:', error);
      }
    });
  },

  /**
   * Save or update module
   */
  saveOrUpdate: async function () {
    debugger;
    const moduleData = this.getFormData();
    const isCreate = !moduleData.ModuleId || moduleData.ModuleId === 0;
    // console.log(moduleData);
    if (!ModuleService.validateModule(moduleData, isCreate)) {
      throw new Error('Invalid module data');
    }

    try {
      if (isCreate) {
        await MessageManager.loading.wrap(
          ModuleService.create(moduleData),
          'Creating Module...'
        );
        MessageManager.notify.success('Module created successfully!');
      } else {
        await MessageManager.loading.wrap(
          ModuleService.update(moduleData.ModuleId, moduleData),
          'Updating module data...'
        );
        MessageManager.notify.success('Module updated successfully!');
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
    FormHelper.openKendoWindow(this.config.modalId, title || 'Module Details', '50%');
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
   * Clear form
   */
  clearForm: function () {
    FormHelper.clearFormFields('#' + this.config.formId);
    $('#hdModuleId').val(0);
  },

  /**
   * Populate form with data
   */
  populateForm: function (data) {
    if (!data) return;
    this.clearForm();
    FormHelper.setFormData('#' + this.config.formId, data);
  },

  /**
   * Get form data
   */
  getFormData: function () {
    //Type-safe form data
    //let formData = FormHelper.getFormDataTyped('menuForm');
    let formData = FormHelper.getFormDataTyped('#' + this.config.formId);

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

    if (!data.ModuleName || data.ModuleName.trim() === '') {
      MessageManager.notify.error('Module name is required');
      $('#module-name').focus();
      return false;
    }

    return true;
  },

};


// ============================================
// MODULE REGISTRY REGISTRATION
// ============================================
if (typeof ModuleRegistry !== 'undefined') {
  ModuleRegistry.register('Module', Module, {
    dependencies: ['ModuleService', 'ApiCallManager', 'MessageManager', 'FormHelper', 'GridHelper'],
    priority: 5,
    autoInit: false,
    route: AppConfig.getFrontendRoute("intModule")
  });

  // console.log('Module registered');
} else {
  console.error('ModuleRegistry not loaded!  Cannot register Module');
}


