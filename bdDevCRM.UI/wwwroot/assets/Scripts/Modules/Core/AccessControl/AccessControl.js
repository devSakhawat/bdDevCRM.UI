﻿/// <reference path="../../../config/appconfig.js" />
/// <reference path="../../../core/helpers/formhelper.js" />
/// <reference path="../../../core/helpers/gridhelper.js" />
/// <reference path="../../../core/managers/apicallmanager.js" />
/// <reference path="../../../core/managers/messagemanager.js" />
/// <reference path="../../../services/module/core/accesscontrol.js" />


/*=========================================================
 * Access Controll Form (Complete CRUD with)
 * File: AccessControl.js
 * Author: devSakhawat
 * Date: 2025-01-18
 * Update Date: 2026-01-01
=========================================================*/
var AccessControl = {
  // Configuration
  config: {
    gridId: 'gridSummaryAccessControl',
    formId: 'accessControlForm',
    isActive: 'is-active',
    reportName: 'AccessControlList',
    initPageRoute: 'intAccessControll'
  },

  /**
   * Initialize module
   */
  init: function () {
    console.log('Initializing Access Control Screen...');
    this.initGrid();
    this.initForm();
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
      { field: "AccessName", title: "Access Name", width: 250 },
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

  view: async function (accessId) {
    debugger;
    if (!accessId || accessId <= 0) {
      MessageManager.notify.warning('Invalid accessId');
      return;
    }

    try {
      FormHelper.clearFormFields('#' + this.config.formId);
      const grid = $('#' + this.config.gridId).data('kendoGrid');
      const dataItem = grid.dataSource.get(accessId);
      if (dataItem) {
        FormHelper.setFormData('#' + this.config.formId, dataItem);
        FormHelper.setFormMode({
          formId: this.config.formId,
          formMode: 'view',
          saveOrUpdateButtonId: 'btnAccessControlSaveOrUpdate'
        });
      }
    } catch (error) {
      console.error('Error loading module:', error);
    }
  },

  /**
   * Edit access control
   */
  edit: async function (accessId) {
    debugger;
    if (!accessId || accessId <= 0) {
      MessageManager.notify.warning('Invalid access control ID');
      return;
    }

    try {
      FormHelper.clearFormFields('#' + this.config.formId);
      const grid = $('#' + this.config.gridId).data('kendoGrid');
      const dataItem = grid.dataSource.get(accessId);
      if (dataItem) {
        //this.populateForm(dataItem); // for medium and large form
        FormHelper.setFormData('#' + this.config.formId, dataItem);
        FormHelper.setFormMode({
          formId: this.config.formId,
          formMode: 'edit',
          saveOrUpdateButtonId: 'btnAccessControlSaveOrUpdate'
        });
      }
    } catch (error) {
      console.error('Error loading access control:', error);
    }
  },

  /**
   * Delete menu with confirmation
   */
  delete: async function (accessId) {
    debugger;
    if (!accessId || accessId <= 0) {
      MessageManager.notify.warning('Invalid access ID');
      return;
    }

    MessageManager.confirm.delete('this access control', async () => {
      try {
        await MessageManager.loading.wrap(
          AccessControlService.delete(accessId),
          'Deleting access control...'
        );
        MessageManager.notify.success('Access control deleted successfully!');
        GridHelper.refreshGrid(AccessControl.config.gridId);
      } catch (error) {
        console.error('Delete error:', error);
      }
    });
  },

  /**
   * Save or update menu
   */
  saveOrUpdate: async function () {
    debugger;
    const formData = FormHelper.getFormDataTyped(this.config.formId);
    const isCreate = !formData.AccessId || formData.AccessId === 0;

    try {
      if (isCreate) {
        await MessageManager.loading.wrap(
          AccessControlService.create(formData),
          'Creating Access Control...'
        );
        MessageManager.notify.success('Access control created successfully!');
      } else {
        await MessageManager.loading.wrap(
          AccessControlService.update(formData.AccessId, formData),
          'Updating Access control...'
        );
        MessageManager.notify.success('Access control updated successfully!');
      }
      this.clearForm();
      GridHelper.refreshGrid(this.config.gridId);
    } catch (error) {
      console.error('Save/Update error:', error);
    }
  },

  /**
   * Clear form
   */
  clearForm: function () {
    FormHelper.clearFormFields('#' + this.config.formId);
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
    let formData = FormHelper.getFormDataTyped(this.config.formId);
    return formData;
  },
};

// ============================================
// MODULE REGISTRY REGISTRATION
// ============================================
if (typeof ModuleRegistry !== 'undefined') {
  ModuleRegistry.register('AccessControl', AccessControl, {
    dependencies: ['AccessControlService', 'ApiCallManager', 'MessageManager', 'FormHelper', 'GridHelper'],
    priority: 5,
    autoInit: false,  // Will be initialized by route
    route: AppConfig.getFrontendRoute(AccessControl.config.initPageRoute)  // Only initialize when on Access Controll Page pages
  });
} else {
  console.error('ModuleRegistry not loaded!  Cannot register Access Control Screen');
}
