/*=========================================================
 * WorkFlow Service
 * File: WorkFlowService.js
 * Description: Centralized API service for WorkFlow module
 * Author: devSakhawat
 * Date: 2026-01-24
=========================================================*/

var WorkFlowService = {

  /////////////////////////////////////////////////////////////
  // WORKFLOW STATE CRUD OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get all workflow states
   */
  getAllStates: async function () {
    try {
      console.log('Fetching all workflow states...');
      const endpoint = AppConfig.endpoints.workflowSummary || '/workflow-summary';
      const data = await ApiCallManager.postForGrid(endpoint, {
        skip: 0,
        take: 9999,
        page: 1,
        pageSize: 9999
      });
      console.log('Workflow states fetched successfully:', data?.Items?.length || 0);
      return data?.Items || [];
    } catch (error) {
      console.error('Error loading workflow states:', error);
      MessageManager.notify.error('Failed to load workflow states');
      throw error;
    }
  },

  /**
   * Get workflow state by ID
   */
  getStateById: async function (stateId) {
    if (!stateId || stateId <= 0) {
      console.error('Invalid state ID:', stateId);
      throw new Error('Invalid state ID');
    }

    try {
      console.log('Fetching workflow state by ID:', stateId);
      const endpoint = `${AppConfig.endpoints.workflow || '/workflow'}/${stateId}`;
      const data = await ApiCallManager.get(endpoint);
      console.log('Workflow state fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error loading workflow state:', error);
      MessageManager.notify.error('Failed to load workflow state details');
      throw error;
    }
  },

  /**
   * Create new workflow state
   */
  createState: async function (stateData) {
    console.log('Creating new workflow state:', stateData);

    // Validation
    if (!this.validateState(stateData)) {
      throw new Error('Invalid workflow state data');
    }

    try {
      const endpoint = AppConfig.endpoints.workflow || '/workflow';
      const result = await ApiCallManager.post(endpoint, stateData, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true
      });

      console.log('Workflow state created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating workflow state:', error);
      MessageManager.notify.error('Failed to create workflow state');
      throw error;
    }
  },

  /**
   * Update existing workflow state
   */
  updateState: async function (stateId, stateData) {
    if (!stateId || stateId <= 0) {
      console.error('Invalid state ID:', stateId);
      throw new Error('Invalid state ID');
    }

    console.log('Updating workflow state:', stateId, stateData);

    // Validation
    if (!this.validateState(stateData)) {
      throw new Error('Invalid workflow state data');
    }

    try {
      const endpoint = `${AppConfig.endpoints.workflow || '/workflow'}/${stateId}`;
      const result = await ApiCallManager.put(endpoint, stateData, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true
      });

      console.log('Workflow state updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating workflow state:', error);
      MessageManager.notify.error('Failed to update workflow state');
      throw error;
    }
  },

  /**
   * Delete workflow state
   */
  deleteState: async function (stateId) {
    if (!stateId || stateId <= 0) {
      console.error('Invalid state ID:', stateId);
      throw new Error('Invalid state ID');
    }

    console.log('Deleting workflow state:', stateId);

    try {
      const endpoint = `${AppConfig.endpoints.workflow || '/workflow'}/${stateId}`;
      const result = await ApiCallManager.delete(endpoint, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true
      });

      console.log('Workflow state deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error deleting workflow state:', error);
      MessageManager.notify.error('Failed to delete workflow state');
      throw error;
    }
  },

  /**
   * Validate workflow state data
   */
  validateState: function (stateData) {
    // State name validation
    if (!stateData.StateName || stateData.StateName.trim() === '') {
      MessageManager.notify.error('State name is required');
      return false;
    }

    // State name length validation
    if (stateData.StateName.trim().length < 3) {
      MessageManager.notify.error('State name must be at least 3 characters');
      return false;
    }

    if (stateData.StateName.trim().length > 100) {
      MessageManager.notify.error('State name must not exceed 100 characters');
      return false;
    }

    // Menu validation
    if (!stateData.MenuId || stateData.MenuId <= 0) {
      MessageManager.notify.error('Please select a menu');
      return false;
    }

    console.log('Workflow state validation passed');
    return true;
  },

  /////////////////////////////////////////////////////////////
  // WORKFLOW ACTION CRUD OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get actions by state ID
   */
  getActionsByStateId: async function (stateId) {
    if (!stateId || stateId <= 0) {
      console.warn('Invalid state ID:', stateId);
      return [];
    }

    try {
      console.log('Fetching actions for state:', stateId);
      const endpoint = `${AppConfig.endpoints.actionsByState || '/get-action-summary-by-statusId'}?stateId=${stateId}`;
      const data = await ApiCallManager.postForGrid(endpoint, {
        skip: 0,
        take: 9999,
        page: 1,
        pageSize: 9999
      });
      console.log('Actions fetched for state:', data?.Items?.length || 0);
      return data?.Items || [];
    } catch (error) {
      console.error('Error loading actions by state:', error);
      return [];
    }
  },

  /**
   * Create new workflow action
   */
  createAction: async function (actionData) {
    console.log('Creating new workflow action:', actionData);

    // Validation
    if (!this.validateAction(actionData)) {
      throw new Error('Invalid workflow action data');
    }

    try {
      const endpoint = AppConfig.endpoints.wfAction || '/wf-action';
      const result = await ApiCallManager.post(endpoint, actionData, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true
      });

      console.log('Workflow action created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating workflow action:', error);
      MessageManager.notify.error('Failed to create workflow action');
      throw error;
    }
  },

  /**
   * Update existing workflow action
   */
  updateAction: async function (actionId, actionData) {
    if (!actionId || actionId <= 0) {
      console.error('Invalid action ID:', actionId);
      throw new Error('Invalid action ID');
    }

    console.log('Updating workflow action:', actionId, actionData);

    // Validation
    if (!this.validateAction(actionData)) {
      throw new Error('Invalid workflow action data');
    }

    try {
      const endpoint = `${AppConfig.endpoints.wfAction || '/wf-action'}/${actionId}`;
      const result = await ApiCallManager.put(endpoint, actionData, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true
      });

      console.log('Workflow action updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating workflow action:', error);
      MessageManager.notify.error('Failed to update workflow action');
      throw error;
    }
  },

  /**
   * Delete workflow action
   */
  deleteAction: async function (actionId) {
    if (!actionId || actionId <= 0) {
      console.error('Invalid action ID:', actionId);
      throw new Error('Invalid action ID');
    }

    console.log('Deleting workflow action:', actionId);

    try {
      const endpoint = `${AppConfig.endpoints.wfAction || '/wf-action'}/${actionId}`;
      const result = await ApiCallManager.delete(endpoint, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true
      });

      console.log('Workflow action deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error deleting workflow action:', error);
      MessageManager.notify.error('Failed to delete workflow action');
      throw error;
    }
  },

  /**
   * Validate workflow action data
   */
  validateAction: function (actionData) {
    // Action name validation
    if (!actionData.ActionName || actionData.ActionName.trim() === '') {
      MessageManager.notify.error('Action name is required');
      return false;
    }

    // Action name length validation
    if (actionData.ActionName.trim().length < 3) {
      MessageManager.notify.error('Action name must be at least 3 characters');
      return false;
    }

    // State ID validation
    if (!actionData.WfStateId || actionData.WfStateId <= 0) {
      MessageManager.notify.error('Invalid state ID');
      return false;
    }

    console.log('Workflow action validation passed');
    return true;
  },

  /////////////////////////////////////////////////////////////
  // MENU OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get menus for dropdown
   */
  getMenusForDropdown: async function () {
    try {
      console.log('Fetching menus for dropdown...');
      const endpoint = AppConfig.endpoints.menusForDDL || '/menus-4-ddl';
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });
      console.log('Menus fetched for dropdown:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading menus:', error);
      MessageManager.notify.error('Failed to load menus');
      return [];
    }
  },

  /**
   * Get next states by menu ID
   */
  getNextStatesByMenuId: async function (menuId) {
    if (!menuId || menuId <= 0) {
      console.warn('Invalid menu ID:', menuId);
      return [];
    }

    try {
      console.log('Fetching next states for menu:', menuId);
      const endpoint = `${AppConfig.endpoints.nextStatesByMenu || '/next-states-by-menu'}/${menuId}`;
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });
      console.log('Next states fetched for menu:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading next states by menu:', error);
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // GRID DATASOURCE
  /////////////////////////////////////////////////////////////

  /**
   * Get workflow summary grid data source
   */
  getWorkflowSummaryDataSource: function (config) {
    console.log('Creating workflow summary DataSource...');

    const defaultConfig = {
      endpoint: AppConfig.endpoints.workflowSummary || '/workflow-summary',
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      modelFields: {
        WfStateId: { type: 'number' },
        StateName: { type: 'string' },
        MenuId: { type: 'number' },
        MenuName: { type: 'string' },
        Sequence: { type: 'number' },
        IsDefaultStart: { type: 'boolean' },
        IsClosed: { type: 'number' }
      },
      primaryKey: 'WfStateId'
    };

    const gridConfig = Object.assign({}, defaultConfig, config || {});
    console.log('Workflow summary DataSource config:', gridConfig);

    return ApiCallManager.createGridDataSource(gridConfig);
  },

  /**
   * Get action summary grid data source
   */
  getActionSummaryDataSource: function (stateId, config) {
    console.log('Creating action summary DataSource for state:', stateId);

    const defaultConfig = {
      endpoint: `${AppConfig.endpoints.actionsByState || '/get-action-summary-by-statusId'}?stateId=${stateId}`,
      pageSize: 10,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      modelFields: {
        WfActionId: { type: 'number' },
        ActionName: { type: 'string' },
        WfStateId: { type: 'number' },
        NextStateId: { type: 'number' },
        NextStateName: { type: 'string' },
        EmailAlert: { type: 'number' },
        SmsAlert: { type: 'number' },
        AcSortOrder: { type: 'number' }
      },
      primaryKey: 'WfActionId'
    };

    const gridConfig = Object.assign({}, defaultConfig, config || {});
    console.log('Action summary DataSource config:', gridConfig);

    return ApiCallManager.createGridDataSource(gridConfig);
  },

  /////////////////////////////////////////////////////////////
  // UTILITY METHODS
  /////////////////////////////////////////////////////////////

  /**
   * Check if state name already exists
   */
  checkStateNameExists: async function (stateName, excludeStateId, menuId) {
    if (!stateName || stateName.trim() === '') {
      return false;
    }

    try {
      const states = await this.getAllStates();

      const exists = states.some(state =>
        state.StateName.toLowerCase().trim() === stateName.toLowerCase().trim() &&
        state.MenuId === menuId &&
        state.WfStateId !== excludeStateId
      );

      return exists;
    } catch (error) {
      console.error('Error checking state name:', error);
      return false;
    }
  },

  /**
   * Get workflow statistics
   */
  getWorkflowStatistics: async function () {
    try {
      const states = await this.getAllStates();

      return {
        totalStates: states.length,
        defaultStates: states.filter(s => s.IsDefaultStart === true).length,
        closedStates: states.filter(s => s.IsClosed > 0).length
      };
    } catch (error) {
      console.error('Error getting workflow statistics:', error);
      return {
        totalStates: 0,
        defaultStates: 0,
        closedStates: 0
      };
    }
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  window.WorkFlowService = WorkFlowService;
  console.log('WorkFlowService initialized and available globally');
}