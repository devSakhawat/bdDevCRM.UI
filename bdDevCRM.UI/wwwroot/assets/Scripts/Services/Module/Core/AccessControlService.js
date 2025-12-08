/*=========================================================
 * Access Control Service
 * File: AccessControlService.js
 * Description: Centralized API service for Access Control
 * Author: devSakhawat
 * Date: 2025-01-18
=========================================================*/

var AccessControlService = {

  /**
   * Get accessControl by ID
   */
  getById: async function (id) {
    if (!id || id <= 0) {
      throw new Error('Invalid accessControl ID');
    }

    try {
      const data = await ApiCallManager.get(`${AppConfig.endpoints.accessControlUpdate}/${id}`);
      return data;
    } catch (error) {
      console.error('Error loading accessControl:', error);
      throw error;
    }
  },

  /**
   * Create AccessControl
   */
  create: async function (accessControlData) {
    console.log(accessControlData);
    if (!this.validateAccessControl(accessControlData)) {
      throw new Error('Invalid accessControl data');
    }

    try {
      const result = await ApiCallManager.post(AppConfig.endpoints.accessControlCreate, accessControlData);
      return result;
    } catch (error) {
      console.error('Error creating accessControl:', error);
      throw error;
    }
  },

  /**
   * Update AccessControl
   */
  update: async function (id, accessControlData) {
    if (!id || id <= 0) {
      throw new Error('Invalid accessControl ID');
    }

    if (!this.validateAccessControl(accessControlData)) {
      throw new Error('Invalid accessControl data');
    }

    try {
      const result = await ApiCallManager.put(`${AppConfig.endpoints.accessControlUpdate}/${id}`, accessControlData);
      return result;
    } catch (error) {
      console.error('Error updating accessControl:', error);
      throw error;
    }
  },

  /**
   * Delete AccessControl
   */
  delete: async function (id) {
    if (!id || id <= 0) {
      throw new Error('Invalid accessControl ID');
    }

    try {
      const result = await ApiCallManager.delete(`${AppConfig.endpoints.accessControlDelete}/${id}`);
      return result;
    } catch (error) {
      console.error('Error deleting accessControl:', error);
      throw error;
    }
  },

  /**
   * Validate accessControl data
   */
  validateAccessControl: function (accessControlData) {
    if (!accessControlData.AccessControlName || accessControlData.AccessControlName.trim() === '') {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('AccessControl name is required');
      }
      return false;
    }
    if (!accessControlData.ModuleId || accessControlData.ModuleId === 0) {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('Module is required');
      }
      return false;
    }
    return true;
  },

  /**
   * Get grid data source
   */
  getGridDataSource: function (config) {
    console.log('🔧 Creating grid DataSource with endpoint:', AppConfig.endpoints.accessControlSummary);

    const gridConfig = Object.assign({}, {
      endpoint: AppConfig.endpoints.accessControlSummary,
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      //idField: "AccessControlId",
      modelFields: {
        AccessId: { type: 'number' },
        AccessName: { type: 'string' },
        //IsActive: { type: 'number' }
      },
      primaryKey: 'AccessId'
    }, config || {});

    return ApiCallManager.createGridDataSource(gridConfig);
  }
};

// Log initialization
console.log('%c[AccessControlService] ✓ Loaded', 'color: #2196F3; font-weight: bold;');

