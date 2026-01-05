/*=========================================================
 * User Service
 * File: UserService.js
 * Description: Centralized API service for User module
 * Author: devSakhawat
 * Pattern: MenuService aligned (Level-1 Safe Refactor)
 * Date: 2025-01-18, 2026-01-02
 * Last Update: 2026-01-02
=========================================================*/

var UserService = {

  /**
   * Get all groups for group membership
   */
  getGroups: async function () {
    try {
      const data = await ApiCallManager.get(AppConfig.endpoints.groups);
      return data;
    } catch (error) {
      console.error('Error loading groups:', error);
      throw error;
    }
  },

  /**
   * Get all modules
   */
  getModules: async function () {
    try {
      const data = await ApiCallManager.get(AppConfig.endpoints.modules);
      return data;
    } catch (error) {
      console.error('Error loading modules:', error);
      throw error;
    }
  },

  /**
   * Get group members by User ID
   */
  getGroupMembersByUserId: async function (userId) {
    if (!userId || userId <= 0) {
      console.warn('Invalid user ID provided to getGroupMembersByUserId');
      return [];
    }
    try {
      const data = await ApiCallManager.get(`${AppConfig.endpoints.groupMembersByUserId}/${userId}`);
      return data;
    } catch (error) {
      console.error('Error loading group members for user:', error);
      throw error;
    }
  },

  /**
   * Get all mother companies
   */
  getMotherCompanies: async function () {
    try {
      const data = await ApiCallManager.get(AppConfig.endpoints.motherCompanies);
      return data;
    } catch (error) {
      console.error('Error loading mother companies:', error);
      throw error;
    }
  },

  /**
   * Get employee types
   */
  getEmployeeTypes: async function () {
    try {
      const data = await ApiCallManager.get(AppConfig.endpoints.employeeTypes);
      return data;
    } catch (error) {
      console.error('Error loading employee types:', error);
      throw error;
    }
  },

  /**
   * Get branches by company ID
   */
  getBranchesByCompanyId: async function (companyId) {
    if (!companyId || companyId <= 0) {
      console.warn('Invalid company ID provided to getBranchesByCompanyId');
      return [];
    }
    try {
      const data = await ApiCallManager.get(`${AppConfig.endpoints.branchesByCompanyId}/${companyId}`);
      return data;
    } catch (error) {
      console.error('Error loading branches:', error);
      throw error;
    }
  },

  /**
   * Get departments by company ID
   */
  getDepartmentsByCompanyId: async function (companyId) {
    if (!companyId || companyId <= 0) {
      console.warn('Invalid company ID provided to getDepartmentsByCompanyId');
      return [];
    }
    try {
      const data = await ApiCallManager.get(`${AppConfig.endpoints.departmentsByCompanyId}/${companyId}`);
      return data;
    } catch (error) {
      console.error('Error loading departments:', error);
      throw error;
    }
  },

  /**
   * Get employees by company, branch, and department
   */
  getEmployeesByFilters: async function (companyId, branchId, departmentId) {
    try {
      const endpoint = `${AppConfig.endpoints.employeesByFilters}?companyId=${companyId}&branchId=${branchId}&departmentId=${departmentId}`;
      const data = await ApiCallManager.get(endpoint);
      return data;
    } catch (error) {
      console.error('Error loading employees:', error);
      throw error;
    }
  },

  /**
   * Create a new user
   */
  create: async function (userData) {
    if (!this.validateUser(userData)) {
      throw new Error('Invalid user data');
    }
    try {
      const result = await ApiCallManager.post(AppConfig.endpoints.user, userData);
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update an existing user
   */
  update: async function (id, userData) {
    if (!id || id <= 0) {
      throw new Error('Invalid user ID');
    }
    if (!this.validateUser(userData)) {
      throw new Error('Invalid user data');
    }
    try {
      const result = await ApiCallManager.put(`${AppConfig.endpoints.user}/${id}`, userData);
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Reset user password
   */
  resetPassword: async function (companyId, userId) {
    if (!companyId || companyId <= 0 || !userId || userId <= 0) {
      throw new Error('Invalid company or user ID');
    }
    try {
      // Assuming the endpoint expects a body, adjust if it's just a URL parameter
      const result = await ApiCallManager.post(AppConfig.endpoints.resetPassword, { companyId, userId });
      return result;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  /**
   * Get grid data source for the user summary grid
   */
  getSummaryGridDataSource: function (companyId) {
    const gridConfig = {
      endpoint: `${AppConfig.endpoints.userSummary}?companyId=${companyId}`,
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      modelFields: {
        UserId: { type: 'number' },
        CompanyId: { type: 'number' },
        BranchId: { type: 'number' },
        DepartmentId: { type: 'number' },
        EmployeeId: { type: 'number' }, // This is HrRecordId
        LoginId: { type: 'string' },
        UserName: { type: 'string' },
        DepartmentName: { type: 'string' },
        DESIGNATIONNAME: { type: 'string' },
        ShortName: { type: 'string' },
        IsActive: { type: 'boolean' },
        AccessParentCompany: { type: 'boolean' }
      },
      primaryKey: 'UserId'
    };

    return ApiCallManager.createGridDataSource(gridConfig);
  },

  /**
   * Get configuration for Kendo Upload component
   */
  getUploadConfig: function () {
    return {
      async: {
        saveUrl: AppConfig.endpoints.userUpload, // e.g., "/user/upload"
        removeUrl: AppConfig.endpoints.userUploadRemove, // e.g., "/user/upload/remove"
        autoUpload: true
      }
    };
  },

  /**
   * Trigger the import process for uploaded data
   */
  importUploadedData: async function () {
    try {
      const result = await ApiCallManager.get(AppConfig.endpoints.userImport); // e.g., "/user/import"
      return result;
    } catch (error) {
      console.error('Error importing uploaded data:', error);
      throw error;
    }
  },

  /**
   * Validate user data before sending to API
   */
  validateUser: function (userData) {
    if (!userData) {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('User data is required');
      }
      return false;
    }
    if (!userData.UserName || userData.UserName.trim() === '') {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('User name is required');
      }
      return false;
    }
    if (!userData.CompanyId || userData.CompanyId === 0) {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('Company is required');
      }
      return false;
    }
    // Add other necessary validations
    return true;
  }
};

// Log initialization
console.log('%c[UserService] ✓ Loaded', 'color: #2196F3; font-weight: bold;');