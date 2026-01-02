/*=========================================================
 * Module Service
 * File: ModuleService.js
 * Description: Centralized API service for Module Menu
 * Author: devSakhawat
 * Date: 2025-01-18
=========================================================*/

var ModuleService = {

  /**
   * Get all modules
   */
  getAllModules: async function () {
    try {
      const data = await ApiCallManager.get(AppConfig.endpoints.modules);
      return data;
    } catch (error) {
      console.error('Error loading modules:', error);
      throw error;
    }
  },

  /**
   * Get module by ID
   */
  getById: async function (id) {
    if (!id || id <= 0) {
      throw new Error('Invalid module ID');
    }

    try {
      const data = await ApiCallManager.get(`${AppConfig.endpoints.moduleUpdate}/${id}`);
      return data;
    } catch (error) {
      console.error('Error loading module:', error);
      throw error;
    }
  },

  /**
   * Create module
   */
  create: async function (moduleData) {
    console.log(moduleData);
    debugger;
    if (!this.validateModule(moduleData ,true)) {
      throw new Error('Invalid menu data');
    }

    try {
      const result = await ApiCallManager.post(AppConfig.endpoints.moduleCreate, moduleData);
      return result;
    } catch (error) {
      console.error('Error creating menu:', error);
      throw error;
    }
  },

  /**
   * Update module
   */
  update: async function (id, moduleData) {
    if (!id || id <= 0) {
      throw new Error('Invalid module ID');
    }

    if (!this.validateModule(moduleData ,true)) {
      throw new Error('Invalid module data');
    }

    try {
      const result = await ApiCallManager.put(`${AppConfig.endpoints.moduleUpdate}/${id}`, moduleData);
      return result;
    } catch (error) {
      console.error('Error updating menu:', error);
      throw error;
    }
  },

  /**
   * Delete module
   */
  delete: async function (id) {
    if (!id || id <= 0) {
      throw new Error('Invalid module ID');
    }

    try {
      const result = await ApiCallManager.delete(`${AppConfig.endpoints.moduleDelete}/${id}`);
      return result;
    } catch (error) {
      console.error('Error deleting Module:', error);
      throw error;
    }
  },

  /**
   * Validate module data
   */
  validateModule: function (moduleData, isCreate) {
    if (!moduleData.ModuleName || moduleData.ModuleName.trim() === '') {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('Module name is required');
      }
      return false;
    }
    if ((!moduleData.ModuleId || moduleData.ModuleId === 0) && !isCreate) {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('ModuleId is required');
      }
      return false;
    }
    return true;
  },

  /**
   * Get grid data source
   */
  getGridDataSource: function (config) {
    const gridConfig = Object.assign({}, {
      endpoint: AppConfig.endpoints.moduleSummary,
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      modelFields: {
        ModuleId: { type: 'number' },
        ModuleName: { type: 'string' }
      },
      primaryKey: 'ModuleId' 
    }, config || {});

    return ApiCallManager.createGridDataSource(gridConfig);
  }
};



