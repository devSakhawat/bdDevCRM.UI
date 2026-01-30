/*=========================================================
 * Group Service
 * File: GroupService.js
 * Description: Centralized API service for Group Settings module
 * Author: devSakhawat
 * Date:  2026-01-18
 * Updated: 2026-01-20 - Complete Enhancement
=========================================================*/

var GroupService = {

  /////////////////////////////////////////////////////////////
  // GROUP CRUD OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get all groups
   */
  getAllGroups: async function () {
    try {
      console.log('Fetching all groups.. .');
      const endpoint = AppConfig.endpoints.groups || '/groups';
      const data = await ApiCallManager.get(endpoint);
      console.log('Groups fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading groups:', error);
      MessageManager.notify.error('Failed to load groups');
      throw error;
    }
  },

  /**
   * Get group by ID
   */
  getById: async function (id) {
    if (!id || id <= 0) {
      console.error('Invalid group ID:', id);
      throw new Error('Invalid group ID');
    }

    try {
      console.log('Fetching group by ID:', id);
      const endpoint = `${AppConfig.endpoints.groupUpdate || '/group'}/${id}`;
      const data = await ApiCallManager.get(endpoint);
      console.log('Group fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error loading group:', error);
      MessageManager.notify.error('Failed to load group details');
      throw error;
    }
  },

  /**
   * Create new group
   */
  create: async function (groupData) {
    console.log('Creating new group:', groupData);

    // Validation
    if (!this.validateGroup(groupData)) {
      throw new Error('Invalid group data');
    }

    try {
      const endpoint = AppConfig.endpoints.groupCreate || '/group';
      const result = await ApiCallManager.post(endpoint, groupData, {
        showLoadingIndicator: true,
        showSuccessNotification: false, // We'll show custom message
        showErrorNotifications: true
      });

      console.log('Group created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating group:', error);
      MessageManager.notify.error('Failed to create group');
      throw error;
    }
  },

  /**
   * Update existing group
   */
  update: async function (id, groupData) {
    if (!id || id <= 0) {
      console.error('Invalid group ID:', id);
      throw new Error('Invalid group ID');
    }

    console.log('Updating group:', id, groupData);

    // Validation
    if (!this.validateGroup(groupData)) {
      throw new Error('Invalid group data');
    }

    try {
      const endpoint = `${AppConfig.endpoints.groupUpdate || '/group'}/${id}`;
      const result = await ApiCallManager.put(endpoint, groupData, {
        showLoadingIndicator: true,
        showSuccessNotification: false, // We'll show custom message
        showErrorNotifications: true
      });

      console.log('Group updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating group:', error);
      MessageManager.notify.error('Failed to update group');
      throw error;
    }
  },

  /**
   * Delete group
   */
  delete: async function (id) {
    if (!id || id <= 0) {
      console.error('Invalid group ID:', id);
      throw new Error('Invalid group ID');
    }

    console.log('Deleting group:', id);

    try {
      const endpoint = `${AppConfig.endpoints.groupDelete || '/Group'}/${id}`;
      const result = await ApiCallManager.delete(endpoint, {
        showLoadingIndicator: true,
        showSuccessNotification: false, // We'll show custom message
        showErrorNotifications: true
      });

      console.log('Group deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error deleting group:', error);
      MessageManager.notify.error('Failed to delete group');
      throw error;
    }
  },

  /**
   * Validate group data
   */
  validateGroup: function (groupData) {
    // Group name validation
    if (!groupData.GroupName || groupData.GroupName.trim() === '') {
      MessageManager.notify.error('Group name is required');
      return false;
    }

    // Group name length validation
    if (groupData.GroupName.trim().length < 3) {
      MessageManager.notify.error('Group name must be at least 3 characters');
      return false;
    }

    if (groupData.GroupName.trim().length > 100) {
      MessageManager.notify.error('Group name must not exceed 100 characters');
      return false;
    }

    // Module validation - At least one module should be selected
    if (!groupData.ModuleList || !Array.isArray(groupData.ModuleList) || groupData.ModuleList.length === 0) {
      MessageManager.notify.error('Please select at least one module');
      return false;
    }

    // Validate permission arrays structure
    const permissionLists = [
      'ModuleList', 'MenuList', 'AccessList',
      'StatusList', 'ActionList', 'ReportList'
    ];

    for (const listName of permissionLists) {
      if (groupData[listName] && !Array.isArray(groupData[listName])) {
        MessageManager.notify.error(`Invalid ${listName} format`);
        return false;
      }
    }

    console.log('Group data validation passed');
    return true;
  },

  /////////////////////////////////////////////////////////////
  // MODULE OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get all modules
   * All the modules list
   */
  getModules: async function () {
    try {
      console.log('Fetching modules...');
      const endpoint = AppConfig.endpoints.modules || '/modules';
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: true,
        showErrorNotifications: true
      });
      console.log('Modules fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading modules:', error);
      MessageManager.notify.error('Failed to load modules');
      return [];
    }
  },

  /**
   * Get groups by module ID
   */
  getGroupsByModuleId: async function (moduleId) {
    if (!moduleId || moduleId <= 0) {
      console.warn('Invalid module ID:', moduleId);
      return [];
    }

    try {
      console.log('Fetching groups for module:', moduleId);
      const endpoint = `${AppConfig.endpoints.groupsByModuleId || '/Groups-by-moduleId'}/${moduleId}`;
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });
      console.log('Groups fetched for module:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading groups by module:', error);
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // MENU OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get menus by module ID
   */
  getMenusByModuleId: async function (moduleId) {
    if (!moduleId || moduleId <= 0) {
      console.warn('Invalid module ID:', moduleId);
      return [];
    }

    try {
      console.log('Fetching menus for module:', moduleId);
      const endpoint = `${AppConfig.endpoints.menusByModuleId || '/menus-by-moduleId'}/${moduleId}`;
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });
      console.log('Menus fetched for module:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading menus by module:', error);
      MessageManager.notify.error('Failed to load menus');
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // PERMISSION OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get group permissions by group ID
   */
  getGroupPermissions: async function (groupId) {
    if (!groupId || groupId <= 0) {
      console.warn('Invalid group ID:', groupId);
      return [];
    }

    try {
      console.log('Fetching group permissions for group:', groupId);
      const endpoint = `${AppConfig.endpoints.groupPermissions || '/grouppermission'}/${groupId}`;
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: true,
        showErrorNotifications: true
      });
      console.log('Group permissions fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading group permissions:', error);
      MessageManager.notify.error('Failed to load group permissions');
      return [];
    }
  },

  /**
   * Get all access controls
   */
  getAccessControls: async function () {
    try {
      console.log('Fetching access controls...');
      const endpoint = AppConfig.endpoints.access || '/getaccess';
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });
      console.log('Access controls fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading access controls:', error);
      MessageManager.notify.error('Failed to load access controls');
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // STATE/STATUS OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get status/states by menu ID
   */
  getStatusByMenuId: async function (menuId) {
    if (!menuId || menuId <= 0) {
      console.warn('Invalid menu ID:', menuId);
      return [];
    }

    try {
      console.log('Fetching states for menu:', menuId);
      const endpoint = `${AppConfig.endpoints.statusByMenu || '/status/key'}/${menuId}`;
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });
      console.log('States fetched for menu:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading status by menu:', error);
      MessageManager.notify.error('Failed to load states');
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // ACTION OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get actions by status ID
   */
  getActionsByStatusId: async function (statusId) {
    if (!statusId || statusId <= 0) {
      console.warn('Invalid status ID:', statusId);
      return [];
    }

    try {
      console.log('Fetching actions for status:', statusId);
      const endpoint = `${AppConfig.endpoints.actionsByStatus || '/actions-4-group/status'}`;

      // Build query parameters
      const params = { statusId: statusId };
      const queryString = new URLSearchParams(params).toString();
      const fullEndpoint = `${endpoint}?${queryString}`;

      const data = await ApiCallManager.get(fullEndpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });
      console.log('Actions fetched for status:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading actions by status:', error);
      MessageManager.notify.error('Failed to load actions');
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // REPORT OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get customized reports
   * All customized reports get
   */
  getReports: async function () {
    try {
      console.log('Fetching reports...');
      //const endpoint = AppConfig.endpoints.customizedReport || '/customized-report';
      //const data = await ApiCallManager.get(endpoint, {
      //  showLoadingIndicator: false,
      //  showErrorNotifications: true
      //});
      //console.log('Reports fetched:', data?.length || 0);

      const endpoint = AppConfig.endpoints.customizedReport || '/customized-report';
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: true,
        showErrorNotifications: true
      });
      console.log('Reports fetched:', data?.length || 0);

      return data || [];
    } catch (error) {
      console.error('Error loading reports:', error);
      MessageManager.notify.error('Failed to load reports');
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // GRID DATASOURCE
  /////////////////////////////////////////////////////////////

  /**
   * Get grid data source
   */
  getGridDataSource: function (config) {
    console.log('Creating grid DataSource...');

    // Default configuration
    const defaultConfig = {
      endpoint: AppConfig.endpoints.groupSummary || '/group-summary',
      pageSize: 13,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      modelFields: {
        GroupId: { type: 'number' },
        GroupName: { type: 'string' },
        IsDefault: { type: 'number' },
        CreatedDate: { type: 'date' },
        ModifiedDate: { type: 'date' }
      },
      primaryKey: 'GroupId'
    };

    // Merge with provided config
    const gridConfig = Object.assign({}, defaultConfig, config || {});

    console.log('Grid DataSource config:', gridConfig);

    // Use ApiCallManager to create DataSource
    return ApiCallManager.createGridDataSource(gridConfig);
  },

  /////////////////////////////////////////////////////////////
  // UTILITY METHODS
  /////////////////////////////////////////////////////////////

  /**
   * Check if group name already exists
   * Group name duplicate check 
   */
  checkGroupNameExists: async function (groupName, excludeGroupId) {
    if (!groupName || groupName.trim() === '') {
      return false;
    }

    try {
      const groups = await this.getAllGroups();

      const exists = groups.some(group =>
        group.GroupName.toLowerCase().trim() === groupName.toLowerCase().trim() &&
        group.GroupId !== excludeGroupId
      );

      return exists;
    } catch (error) {
      console.error('Error checking group name:', error);
      return false;
    }
  },

  /**
   * Get group summary statistics
   */
  getGroupStatistics: async function () {
    try {
      const groups = await this.getAllGroups();

      return {
        totalGroups: groups.length,
        defaultGroups: groups.filter(g => g.IsDefault === 1).length,
        activeGroups: groups.filter(g => g.IsActive === 1).length
      };
    } catch (error) {
      console.error('Error getting group statistics:', error);
      return {
        totalGroups: 0,
        defaultGroups: 0,
        activeGroups: 0
      };
    }
  },

  /**
   * Export group permissions
   * Group permissions export (for backup/import)
   */
  exportGroupPermissions: async function (groupId) {
    if (!groupId || groupId <= 0) {
      throw new Error('Invalid group ID');
    }

    try {
      const groupData = await this.getById(groupId);
      const permissions = await this.getGroupPermissions(groupId);

      return {
        group: groupData,
        permissions: permissions,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting group permissions:', error);
      throw error;
    }
  },

  /**
   * Clone group with permissions
   */
  cloneGroup: async function (sourceGroupId, newGroupName) {
    if (!sourceGroupId || sourceGroupId <= 0) {
      throw new Error('Invalid source group ID');
    }

    if (!newGroupName || newGroupName.trim() === '') {
      throw new Error('New group name is required');
    }

    try {
      console.log('Cloning group:', sourceGroupId, 'as', newGroupName);

      // Get source group data
      const sourceGroup = await this.getById(sourceGroupId);
      const permissions = await this.getGroupPermissions(sourceGroupId);

      // Prepare new group data
      const newGroupData = {
        GroupId: 0, // New group
        GroupName: newGroupName,
        IsDefault: 0, // Clone should not be default
        ModuleList: permissions.filter(p => p.PermissionTableName === 'Module'),
        MenuList: permissions.filter(p => p.PermissionTableName === 'Menu'),
        AccessList: permissions.filter(p => p.PermissionTableName === 'Access'),
        StatusList: permissions.filter(p => p.PermissionTableName === 'Status'),
        ActionList: permissions.filter(p => p.PermissionTableName === 'Action'),
        ReportList: permissions.filter(p => p.PermissionTableName === 'Customized Report')
      };

      // Create new group
      const result = await this.create(newGroupData);
      console.log('Group cloned successfully:', result);

      return result;
    } catch (error) {
      console.error('Error cloning group:', error);
      MessageManager.notify.error('Failed to clone group');
      throw error;
    }
  },

  /**
   * Batch update group permissions
   */
  batchUpdatePermissions: async function (groupIds, permissionUpdates) {
    if (!Array.isArray(groupIds) || groupIds.length === 0) {
      throw new Error('No groups selected');
    }

    const results = {
      success: [],
      failed: []
    };

    for (const groupId of groupIds) {
      try {
        const groupData = await this.getById(groupId);

        // Merge permission updates
        Object.assign(groupData, permissionUpdates);

        await this.update(groupId, groupData);
        results.success.push(groupId);
      } catch (error) {
        console.error(`Failed to update group ${groupId}: `, error);
        results.failed.push({ groupId, error: error.message });
      }
    }

    return results;
  },

  /**
   * Get permission summary for a group
   */
  getPermissionSummary: async function (groupId) {
    if (!groupId || groupId <= 0) {
      throw new Error('Invalid group ID');
    }

    try {
      const permissions = await this.getGroupPermissions(groupId);

      const summary = {
        modules: permissions.filter(p => p.PermissionTableName === 'Module').length,
        menus: permissions.filter(p => p.PermissionTableName === 'Menu').length,
        access: permissions.filter(p => p.PermissionTableName === 'Access').length,
        states: permissions.filter(p => p.PermissionTableName === 'Status').length,
        actions: permissions.filter(p => p.PermissionTableName === 'Action').length,
        reports: permissions.filter(p => p.PermissionTableName === 'Customized Report').length,
        total: permissions.length
      };

      console.log('Permission summary for group', groupId, ':', summary);
      return summary;
    } catch (error) {
      console.error('Error getting permission summary:', error);
      throw error;
    }
  }
};

// Auto-initialize or register if needed
if (typeof window !== 'undefined') {
  window.GroupService = GroupService;
  console.log('GroupService initialized and available globally');
}