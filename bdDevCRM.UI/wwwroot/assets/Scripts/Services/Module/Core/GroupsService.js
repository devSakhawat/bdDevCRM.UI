/*=========================================================
 * Group Service
 * File: GroupService.js
 * Description: Centralized API service for Group Settings module
 * Author: devSakhawat
 * Date: 2026-01-18
=========================================================*/

var GroupService = {

  /**
   * Get all groups
   */
  getAllGroups: async function () {
    try {
      const data = await ApiCallManager.get(AppConfig.endpoints.groups);
      return data;
    } catch (error) {
      console.error('Error loading groups:', error);
      throw error;
    }
  },

  /**
   * Get group by ID
   */
  getById: async function (id) {
    if (!id || id <= 0) {
      throw new Error('Invalid group ID');
    }

    try {
      const data = await ApiCallManager.get(`${AppConfig.endpoints.groupUpdate}/${id}`);
      return data;
    } catch (error) {
      console.error('Error loading group:', error);
      throw error;
    }
  },

  /**
  * Get modules for dropdown
  */
  getModules: async function () {
    try {
      debugger;
      console.log('Loading modules from:', AppConfig.endpoints.modules);
      const data = await ApiCallManager.get(AppConfig.endpoints.modules);
      console.log('Modules loaded:', data);
      return data;
    } catch (error) {
      console.error('Error loading modules:', error);
      return [];
    }
  },

  /**
  * Get groups by module ID
  */
  getGroupsByModuleId: async function (moduleId) {
    if (!moduleId || moduleId <= 0) {
      console.warn('Invalid module ID');
      return [];
    }

    try {
      const endpoint = `${AppConfig.endpoints.groupsByModuleId}/${moduleId}`;
      console.log('Loading groups from:', endpoint);
      const data = await ApiCallManager.get(endpoint);
      console.log('Groups loaded:', data);
      return data;
    } catch (error) {
      console.error('Error loading groups by module:', error);
      return [];
    }
  },

  /**
   * Get menus by module ID
   */
  getMenusByModuleId: async function (moduleId) {
    if (!moduleId || moduleId <= 0) {
      console.warn('Invalid module ID');
      return [];
    }

    try {
      const endpoint = `${AppConfig.endpoints.menusByModuleId}/${moduleId}`;
      console.log('Loading menus from:', endpoint);
      const data = await ApiCallManager.get(endpoint);
      console.log('Menus loaded:', data);
      return data;
    } catch (error) {
      console.error('Error loading menus by module:', error);
      return [];
    }
  },

  /**
   * Get group permissions by group ID
   * Permission for group.
   */
  getGroupPermissions: async function (groupId) {
    if (!groupId || groupId <= 0) {
      console.warn('Invalid group ID');
      return [];
    }

    try {
      const endpoint = `${AppConfig.endpoints.groupPermission}/${groupId}`;
      console.log('Loading group permissions from:', endpoint);
      const data = await ApiCallManager.get(endpoint);
      console.log('Group permissions loaded:', data);
      return data;
    } catch (error) {
      console.error('Error loading group permissions:', error);
      return [];
    }
  },

  /**
   * Get all access controls
   * all access control
   */
  getAccessControls: async function () {
    try {
      const endpoint = AppConfig.endpoints.accessControls || '/getaccess';
      console.log('Loading access controls from:', endpoint);
      const data = await ApiCallManager.get(endpoint);
      console.log('Access controls loaded:', data);
      return data;
    } catch (error) {
      console.error('Error loading access controls:', error);
      return [];
    }
  },

  /**
   * Get status/states by menu ID
   */
  getStatusByMenuId: async function (menuId) {
    if (!menuId || menuId <= 0) {
      console.warn('Invalid menu ID');
      return [];
    }

    try {
      const endpoint = `${AppConfig.endpoints.statusByMenu || '/status/key'}/${menuId}`;
      console.log('Loading status from:', endpoint);
      const data = await ApiCallManager.get(endpoint);
      console.log('Status loaded:', data);
      return data;
    } catch (error) {
      console.error('Error loading status by menu:', error);
      return [];
    }
  },

  /**
   * Get actions by status ID
   */
  getActionsByStatusId: async function (statusId) {
    if (!statusId || statusId <= 0) {
      console.warn('Invalid status ID');
      return [];
    }

    try {
      const endpoint = `${AppConfig.endpoints.actionsByStatus || '/actions-4-group/status'}?statusId=${statusId}`;
      console.log('Loading actions from:', endpoint);
      const data = await ApiCallManager.get(endpoint);
      console.log('Actions loaded:', data);
      return data;
    } catch (error) {
      console.error('Error loading actions by status:', error);
      return [];
    }
  },

  /**
   * Get customized reports
   */
  getReports: async function () {
    try {
      const endpoint = AppConfig.endpoints.customizedReports || '/customized-report';
      console.log('Loading reports from:', endpoint);
      const data = await ApiCallManager.get(endpoint);
      console.log('Reports loaded:', data);
      return data;
    } catch (error) {
      console.error('Error loading reports:', error);
      return [];
    }
  },

  /**
   * Create group
   */
  create: async function (groupData) {
    console.log('Creating group:', groupData);

    if (!this.validateGroup(groupData)) {
      throw new Error('Invalid group data');
    }

    try {
      const result = await ApiCallManager.post(AppConfig.endpoints.groupCreate || '/group', groupData);
      return result;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  /**
   * Update group
   * Group update
   */
  update: async function (id, groupData) {
    if (!id || id <= 0) {
      throw new Error('Invalid group ID');
    }

    console.log('Updating group:', id, groupData);

    if (!this.validateGroup(groupData)) {
      throw new Error('Invalid group data');
    }

    try {
      const result = await ApiCallManager.put(`${AppConfig.endpoints.groupUpdate || '/group'}/${id}`, groupData);
      return result;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  },

  /**
   * Delete group
   * Group delete
   */
  delete: async function (id) {
    if (!id || id <= 0) {
      throw new Error('Invalid group ID');
    }

    try {
      const result = await ApiCallManager.delete(`${AppConfig.endpoints.groupDelete || '/Group'}/${id}`);
      return result;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  },

  /**
     * Validate group data
     * Group data validation করা
     */
  validateGroup: function (groupData) {
    if (!groupData.GroupName || groupData.GroupName.trim() === '') {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('Group name is required');
      }
      return false;
    }

    // At least one module should be selected
    if (!groupData.ModuleList || groupData.ModuleList.length === 0) {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('Please select at least one module');
      }
      return false;
    }

    return true;
  },

  /**
   * Get grid data source
   * Grid এর জন্য data source তৈরি করা
   */
  getGridDataSource: function (config) {
    console.log('Creating grid DataSource with endpoint:', AppConfig.endpoints.groupSummary || '/group-summary');

    const gridConfig = Object.assign({}, {
      endpoint: AppConfig.endpoints.groupSummary || '/group-summary',
      pageSize: 13,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      modelFields: {
        GroupId: { type: 'number' },
        GroupName: { type: 'string' },
        IsDefault: { type: 'number' },
        CreatedDate: { type: 'date' }
      },
      primaryKey: 'GroupId'
    }, config || {});

    return ApiCallManager.createGridDataSource(gridConfig);
  }
};
