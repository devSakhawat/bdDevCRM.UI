/*=========================================================
 * Access Control Service
 * File: AccessControlService.js
 * Description: Centralized API service for Access Control
 * Author: devSakhawat
 * Date: 2025-01-18 ,2026-01-02
 * Last Update: 2026-01-02
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
      const data = await ApiCallManager.get(`${AppConfig.endpoints.accessControlById}/${id}`);
      return data;
    } catch (error) {
      console.error('Error loading accessControl:', error);
      throw error;
    }
  },

  /**
   * Create AccessControl
   */
  create: async function (formData) {
    console.log(formData);
    if (!this.validateFormData(formData)) {
      throw new Error('Invalid access control data');
    }

    try {
      const result = await ApiCallManager.post(AppConfig.endpoints.accessControlCreate, formData);
      return result;
    } catch (error) {
      console.error('Error creating accessControl:', error);
      throw error;
    }
  },

  /**
   * Update AccessControl
   */
  update: async function (id, formData) {
    if (!id || id <= 0) {
      throw new Error('Invalid accessControl ID');
    }

    if (!this.validateFormData(formData)) {
      throw new Error('Invalid access control data');
    }

    try {
      const result = await ApiCallManager.put(`${AppConfig.endpoints.accessControlUpdate}/${id}`, formData);
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
  validateFormData: function (formData) {
    if (!formData.AccessName || formData.AccessName.trim() === '') {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('Access Control name is required');
      }
      return false;
    }

    return true;
  },

  /**
   * Get grid data source
   */
  getGridDataSource: function (config) {
    console.log('Creating grid DataSource with endpoint:', AppConfig.endpoints.accessControlSummary);

    const gridConfig = Object.assign({}, {
      endpoint: AppConfig.endpoints.accessControlSummary,
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      modelFields: {
        AccessId: { type: 'number' },
        AccessName: { type: 'string' },
      },
      primaryKey: 'AccessId'
    }, config || {});

    return ApiCallManager.createGridDataSource(gridConfig);
  }
};

// Log initialization
console.log('%c[AccessControlService] ✓ Loaded', 'color: #2196F3; font-weight: bold;');

