/*=========================================================
 * Menu Service
 * File: MenuService.js
 * Description: Centralized API service for Menu module
 * Author: devSakhawat
 * Date: 2025-01-18
=========================================================*/

var MenuService = {

  /**
   * Get all menus
   */
  getAllMenus: async function () {
    try {
      const data = await ApiCallManager.get(AppConfig.endpoints.menus);
      return data;
    } catch (error) {
      console.error('Error loading menus:', error);
      throw error;
    }
  },

  /**
   * Get menu by ID
   */
  getById: async function (id) {
    if (!id || id <= 0) {
      throw new Error('Invalid menu ID');
    }

    try {
      const data = await ApiCallManager.get(`${AppConfig.endpoints.menuUpdate}/${id}`);
      return data;
    } catch (error) {
      console.error('Error loading menu:', error);
      throw error;
    }
  },

  /**
   * Get modules for dropdown
   */
  getModules: async function () {
    try {
      console.log('📡 Loading modules from:', AppConfig.endpoints.modules);
      const data = await ApiCallManager.get(AppConfig.endpoints.modules);
      console.log('✅ Modules loaded:', data);
      return data;
    } catch (error) {
      console.error('❌ Error loading modules:', error);
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
      console.log('📡 Loading menus from:', endpoint);
      const data = await ApiCallManager.get(endpoint);
      console.log('✅ Menus loaded:', data);
      return data;
    } catch (error) {
      console.error('❌ Error loading menus by module:', error);
      return [];
    }
  },

  /**
   * Create menu
   */
  create: async function (menuData) {
    console.log(menuData);
    if (!this.validateMenu(menuData)) {
      throw new Error('Invalid menu data');
    }

    try {
      const result = await ApiCallManager.post(AppConfig.endpoints.menuCreate, menuData);
      return result;
    } catch (error) {
      console.error('Error creating menu:', error);
      throw error;
    }
  },

  /**
   * Update menu
   */
  update: async function (id, menuData) {
    if (!id || id <= 0) {
      throw new Error('Invalid menu ID');
    }

    if (!this.validateMenu(menuData)) {
      throw new Error('Invalid menu data');
    }

    try {
      const result = await ApiCallManager.put(`${AppConfig.endpoints.menuUpdate}/${id}`, menuData);
      return result;
    } catch (error) {
      console.error('Error updating menu:', error);
      throw error;
    }
  },

  /**
   * Delete menu
   */
  delete: async function (id) {
    if (!id || id <= 0) {
      throw new Error('Invalid menu ID');
    }

    try {
      const result = await ApiCallManager.delete(`${AppConfig.endpoints.menuDelete}/${id}`);
      return result;
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw error;
    }
  },

  /**
   * Validate menu data
   */
  validateMenu: function (menuData) {
    if (!menuData.MenuName || menuData.MenuName.trim() === '') {
      if (typeof MessageManager !== 'undefined') {
        MessageManager.notify.error('Menu name is required');
      }
      return false;
    }
    if (!menuData.ModuleId || menuData.ModuleId === 0) {
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
    console.log('🔧 Creating grid DataSource with endpoint:', AppConfig.endpoints.menuSummary);

    const gridConfig = Object.assign({}, {
      endpoint: AppConfig.endpoints.menuSummary,
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      //idField: "MenuId",
      modelFields: {
        MenuId: { type: 'number' },
        ModuleId: { type: 'number' },
        ParentMenu: { type: 'number' },
        MenuName: { type: 'string' },
        MenuPath: { type: 'string' },
        ParentMenuName: { type: 'string' },
        ModuleName: { type: 'string' },
        MenuCode: { type: 'string' },
        MenuType: { type: 'number' },
        SortOrder: { type: 'number' },
        IsQuickLink: { type: 'boolean' },
        IsActive: { type: 'number' }
      },
      primaryKey: 'MenuId'
    }, config || {});

    return ApiCallManager.createGridDataSource(gridConfig);
  }
};

// Log initialization
console.log('%c[MenuService] ✓ Loaded', 'color: #2196F3; font-weight: bold;');


