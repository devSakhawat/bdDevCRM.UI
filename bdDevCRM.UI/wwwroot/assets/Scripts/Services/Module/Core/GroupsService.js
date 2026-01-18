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
   * সব group এর list পাওয়া
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
   * নির্দিষ্ট group এর details পাওয়া
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
   * Module list পাওয়া (dropdown এ দেখানোর জন্য)
   */
  getModules: async function () {
    try {
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
   * নির্দিষ্ট module এর সব group পাওয়া
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
   * নির্দিষ্ট module এর সব menu পাওয়া (menu permission এর জন্য)
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
   * নির্দিষ্ট group এর সব permission পাওয়া
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
   * সব access control পাওয়া
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
   * নির্দিষ্ট menu এর সব status/state পাওয়া
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
   * নির্দিষ্ট status এর সব action পাওয়া
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
   * সব customized report পাওয়া
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
   * নতুন group তৈরি করা
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
   * Group update করা
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
   * Group delete করা
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
    if (!groupData.ModuleList || groupData.ModuleList.len