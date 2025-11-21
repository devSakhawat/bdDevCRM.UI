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







///*=========================================================
// * Menu Service
// * File: MenuService.js
// * Description: Centralized API service for Menu module
// * Author: devSakhawat
// * Date: 2025-01-18
//=========================================================*/

// //NOTE:
// //GenericService must have:
// //get(url)
// //post(url, data)
// //put(url, data)
// //delete(url)
// //Each function must return Promise.

// //FormHelper loader will be used before and after API calls.

//var MenuService = {

//  baseUrl: AppConfig.getApiUrl(),

//  /**
//    * Get all menus (dropdown)
//    */
//  getAllMenus: async function () {
//    try {
//      const endpoint = AppConfig.endpoints.menus || '/menus-by-moduleId';
//      const data = await ApiCallManager.get(endpoint);
//      return data;
//    } catch (error) {
//      console.error('Error loading menus:', error);
//      throw error;
//    }
//  },

//   //----------------------------------
//   //** GET ALL MENUS
//   //----------------------------------
//  getAllMenus: async function () {
//    try {
//      const data = await ApiCallManager.get(this.baseUrl + '/GetAll');
//      return data;
//    } catch (error) {
//      console.error('Error loading menus:', error);
//      throw error;
//    }
//  },
//   //----------------------------------
//   //** GET MENU BY ID
//   //----------------------------------
//  getMenuById: async function (id) {
//    try {
//      const data = await ApiCallManager.get(this.baseUrl + '/Get/' + id);
//      return data;
//    } catch (error) {
//      console.error('Error loading menu:', error);
//      throw error;
//    }
//  },

//   //----------------------------------
//   //** CREATE MENU
//   //----------------------------------
//  createMenu: async function (menuData) {
//    // ✅ Validation logic here
//    if (!this.validateMenu(menuData)) {
//      throw new Error('Invalid menu data');
//    }

//    try {
//      const result = await ApiCallManager.post(this.baseUrl + '/Create', menuData);
//      MessageManager.notify.success('Menu created successfully!');
//      return result;
//    } catch (error) {
//      console.error('Error creating menu:', error);
//      throw error;
//    }
//  },

//   //----------------------------------
//   //** UPDATE MENU
//   //----------------------------------
//  updateMenu: async function (menuData) {
//    // ✅ Validation logic here
//    if (!this.validateMenu(menuData)) {
//      throw new Error('Invalid menu data');
//    }

//    try {
//      const result = await ApiCallManager.put(this.baseUrl + '/Update', menuData);
//      MessageManager.notify.success('Menu updated successfully!');
//      return result;
//    } catch (error) {
//      console.error('Error updating menu:', error);
//      throw error;
//    }
//  },

//   //----------------------------------
//   //** DELETE MENU
//   //----------------------------------


//  //----------------------------------
//  //** Business Logic: Validation
//  //----------------------------------
//  validateMenu: function (menuData) {
//    if (!menuData.MenuName || menuData.MenuName.trim() === '') {
//      MessageManager.notify.error('Menu name is required');
//      return false;
//    }
//    if (!menuData.ModuleId || menuData.ModuleId === 0) {
//      MessageManager.notify.error('Module is required');
//      return false;
//    }
//    return true;
//  },

//  //----------------------------------
//  //** Get modules for dropdown
//  //----------------------------------
//  getModules: async function () {
//    try {
//      const data = await ApiCallManager.get('/CRM/Module/GetAll');
//      return data;
//    } catch (error) {
//      console.error('Error loading modules:', error);
//      return [];
//    }
//  },

//  //----------------------------------
//  //** Get menus by module
//  //----------------------------------
//  getMenusByModuleId: async function (moduleId) {
//    try {
//      const data = await ApiCallManager.get(this.baseUrl + '/ByModule/' + moduleId);
//      return data;
//    } catch (error) {
//      console.error('Error loading menus by module:', error);
//      return [];
//    }
//  },

//   //----------------------------------
//   //** GET MENU SUMMARY (FOR GRID)
//   //----------------------------------
//  getMenuSummary: async function () {
//    try {
//      FormHelper.showLoader();
//      const result = await GenericService.get(this.baseUrl + "/Summary");
//      return result;
//    } catch (ex) {
//      console.error("Error loading summary:", ex);
//      throw ex;
//    } finally {
//      FormHelper.hideLoader();
//    }
//  },

//   //----------------------------------
//   //** GET MENU DETAILS
//   //----------------------------------
//  getMenuDetails: async function (menuId) {
//    try {
//      FormHelper.showLoader();
//      const result = await GenericService.get(this.baseUrl + "/Details/" + menuId);
//      return result;
//    } catch (ex) {
//      console.error("Error loading menu details:", ex);
//      throw ex;
//    } finally {
//      FormHelper.hideLoader();
//    }
//  }

//};






















//////////////////////////////////////////////////////////////////////////////////////////

//var MenuService2 = {
//  apiBase: "/CRM/Menu/",

//  getAll: function (callback) {
//    GenericService.get(this.apiBase + "GetAll", callback);
//  },

//  getById: function (id, callback) {
//    GenericService.get(this.apiBase + "GetById/" + id, callback);
//  },

//  save: function (formId, button, callback) {
//    var data = FormHelper.getFormData(formId);

//    FormHelper.showLoader(button);
//    FormHelper.blockForm(formId);

//    GenericService.post(this.apiBase + "Create", data,
//      function (res) {
//        FormHelper.hideLoader(button);
//        FormHelper.unblockForm(formId);
//        if (callback) callback(res);
//      },
//      function () {
//        FormHelper.hideLoader(button);
//        FormHelper.unblockForm(formId);
//      }
//    );
//  },

//  update: function (formId, button, callback) {
//    var data = FormHelper.getFormData(formId);

//    FormHelper.showLoader(button);
//    FormHelper.blockForm(formId);

//    GenericService.put(this.apiBase + "Update", data,
//      function (res) {
//        FormHelper.hideLoader(button);
//        FormHelper.unblockForm(formId);
//        if (callback) callback(res);
//      },
//      function () {
//        FormHelper.hideLoader(button);
//        FormHelper.unblockForm(formId);
//      }
//    );
//  },

//  delete: function (id, callback) {
//    GenericService.delete(this.apiBase + "Delete/" + id, callback);
//  }
//};















/////*=========================================================
//// * Menu Service (Refactored)
//// * File: MenuService.js
//// * Description: Centralized API logic for Menu module
//// * Uses: GridHelper.js, FormHelper.js
//// * Author: devSakhawat
//// * Date: 2025-11-15
////=========================================================*/
////var MenuService = (function () {
////  'use strict';

////  // =========================
////  // PRIVATE CONFIGURATION
////  // =========================
////    var _config = {
////      endpoints: {
////        base: '/menu',
////        summary: '/menu-summary',
////        ddl: '/menu-ddl',
////        byModuleId: '/menus-by-moduleId',
////        moduleDDL: '/modules'
////      },
////      gridId: 'gridSummaryMenu',
////      modelFields: {
////        MenuId: { type: 'number' },
////        ModuleId: { type: 'number' },
////        ParentMenu: { type: 'number' },
////        MenuName: { type: 'string' },
////        MenuPath: { type: 'string' },
////        ParentMenuName: { type: 'string' },
////        ModuleName: { type: 'string' },
////        SortOrder: { type: 'number' },
////        IsQuickLink: { type: 'boolean' },
////        Status: { type: 'boolean' }
////      }
////    };

////  // =========================
////  // PRIVATE - GENERIC HELPERS
////  // =========================
////  function _refreshGrid() {
////    GridHelper.refreshGrid(_config.gridId);
////  }

////  function _clearForm() {
////    FormHelper.clearForm(_config.formId);
////  }

////  function _populateForm(data) {
////    FormHelper.setFormData(_config.formId, data);
////  }

////  function _makeFormReadOnly() {
////    FormHelper.makeFormReadOnly(_config.formId);
////  }

////  function _makeFormEditable() {
////    FormHelper.makeFormEditable(_config.formId);
////  }

////  function _getFormData() {
////    return FormHelper.getFormData(_config.formId);
////  }

////  // =========================
////  // PUBLIC - CRUD OPERATIONS
////  // =========================
////  async function getAll() {
////    try {
////      return await ApiCallManager.get(_config.endpoints.ddl);
////    } catch (error) {
////      console.error('MenuService.getAll error:', error);
////      throw error;
////    }
////  }

////  async function getById(id) {
////    if (!id || id <= 0) throw new Error('Invalid menu ID');
////    try {
////      return await ApiCallManager.get(`${_config.endpoints.base}/${id}`);
////    } catch (error) {
////      console.error('MenuService.getById error:', error);
////      throw error;
////    }
////  }

////  async function getMenusByModuleId(moduleId) {
////    if (!moduleId || moduleId <= 0) return [];
////    try {
////      return await ApiCallManager.get(`${_config.endpoints.byModuleId}/${moduleId}`);
////    } catch (error) {
////      console.error('MenuService.getMenusByModuleId error:', error);
////      return [];
////    }
////  }

////  async function getModules() {
////    try {
////      return await ApiCallManager.get(_config.endpoints.moduleDDL);
////    } catch (error) {
////      console.error('MenuService.getModules error:', error);
////      return [];
////    }
////  }

////  async function create(menuData) {
////    if (!menuData) throw new Error('Menu data is required');
////    try {
////      return await ApiCallManager.post(_config.endpoints.base, menuData);
////    } catch (error) {
////      console.error('MenuService.create error:', error);
////      throw error;
////    }
////  }

////  async function update(id, menuData) {
////    if (!id || id <= 0) throw new Error('Invalid menu ID');
////    if (!menuData) throw new Error('Menu data is required');
////    try {
////      return await ApiCallManager.put(`${_config.endpoints.base}/${id}`, menuData);
////    } catch (error) {
////      console.error('MenuService.update error:', error);
////      throw error;
////    }
////  }

////  async function deleteMenu(id, menuData) {
////    if (!id || id <= 0) throw new Error('Invalid menu ID');
////    try {
////      const response = await fetch(`${_config.endpoints.base}/${id}`, {
////        method: 'DELETE',
////        headers: { 'Content-Type': 'application/json' },
////        body: JSON.stringify(menuData)
////      });
////      if (!response.ok) throw new Error('Delete failed');
////      return await response.json();
////    } catch (error) {
////      console.error('MenuService.delete error:', error);
////      throw error;
////    }
////  }

////  async function saveOrUpdate(menuData) {
////    if (!menuData) throw new Error('Menu data is required');
////    return menuData.MenuId && menuData.MenuId > 0 ? await update(menuData.MenuId, menuData) : await create(menuData);
////  }

////  // =========================
////  // PUBLIC - GRID DATASOURCE
////  // =========================
////  function getGridDataSource(config) {
////    const gridConfig = Object.assign({}, {
////      endpoint: _config.endpoints.summary,
////      pageSize: 20,
////      serverPaging: true,
////      serverSorting: true,
////      serverFiltering: true,
////      modelFields: _config.modelFields
////    }, config || {});
////    return ApiCallManager.createGridDataSource(gridConfig);
////  }

////  function refreshGrid() {
////    _refreshGrid();
////  }

////  // =========================
////  // PUBLIC - FORM OPERATIONS
////  // =========================
////  function clearForm() {
////    _clearForm();
////  }

////  function populateForm(data) {
////    _populateForm(data);
////  }

////  function makeFormReadOnly() {
////    _makeFormReadOnly();
////  }

////  function makeFormEditable() {
////    _makeFormEditable();
////  }

////  function getFormData() {
////    return _getFormData();
////  }

////  // =========================
////  // PUBLIC API
////  // =========================
////  return {
////    getAll: getAll,
////    getById: getById,
////    getMenusByModuleId: getMenusByModuleId,
////    getModules: getModules,
////    create: create,
////    update: update,
////    delete: deleteMenu,
////    saveOrUpdate: saveOrUpdate,
////    getGridDataSource: getGridDataSource,
////    refreshGrid: refreshGrid,
////    clearForm: clearForm,
////    populateForm: populateForm,
////    makeFormReadOnly: makeFormReadOnly,
////    makeFormEditable: makeFormEditable,
////    getFormData: getFormData
////  };
////})();






///////// <reference path="../../../modules/core/menu/menu.js" />
///////// <reference path="../../../modules/core/menu/menudetails.js" />
///////// <reference path="../../../modules/core/menu/menusummary.js" />


///////*=========================================================
////// * Menu Service
////// * File: MenuService.js
////// * Path: wwwroot/assets/Scripts/Core/Services/MenuService.js
////// * Description: Centralized API service for Menu module
////// * Author: devSakhawat
////// * Date: 2025-01-14 // Assuming today's date for consistency
//////=========================================================*/
//////var MenuService = (function () {
//////  'use strict';

//////  // ============================================
//////  // PRIVATE - Configuration
//////  // ============================================
//////  var _config = {
//////    endpoints: {
//////      base: '/menu', // Base endpoint for menu operations
//////      summary: '/menu-summary', // Endpoint for summary grid data
//////      ddl: '/menu-ddl', // Endpoint for dropdown data
//////      byModuleId: '/menus-by-moduleId', // Endpoint for menus filtered by module
//////      moduleDDL: '/modules' // Endpoint for module dropdown data
//////    },
//////    gridId: 'gridSummaryMenu', // Default grid ID for menu summary
//////    modelFields: {
//////      MenuId: { type: 'number' },
//////      ModuleId: { type: 'number' },
//////      ParentMenu: { type: 'number' },
//////      MenuName: { type: 'string' },
//////      MenuPath: { type: 'string' },
//////      ParentMenuName: { type: 'string' }, // Assuming this comes from backend
//////      ModuleName: { type: 'string' }, // Assuming this comes from backend
//////      SortOrder: { type: 'number' },
//////      IsQuickLink: { type: 'boolean' }, // Renamed from ToDo for clarity
//////      Status: { type: 'boolean' } // Assuming a status field exists
//////    }
//////  };

//////  // ============================================
//////  // PUBLIC - CRUD Operations
//////  // ============================================

//////  /** 
//////   * Get all menus (dropdown)
//////   */
//////  async function getAll() {
//////    try {
//////      return await ApiCallManager.get(_config.endpoints.ddl);
//////    } catch (error) {
//////      console.error('MenuService.getAll error:', error);
//////      throw error;
//////    }
//////  }

//////  /** 
//////   * Get menu by ID
//////   */
//////  async function getById(id) {
//////    if (!id || id <= 0) {
//////      throw new Error('Invalid menu ID');
//////    }
//////    try {
//////      return await ApiCallManager.get(`${_config.endpoints.base}/${id}`);
//////    } catch (error) {
//////      console.error('MenuService.getById error:', error);
//////      throw error;
//////    }
//////  }

//////  /** 
//////   * Get menus by Module ID
//////   */
//////  async function getMenusByModuleId(moduleId) {
//////    if (!moduleId || moduleId <= 0) {
//////      console.warn('MenuService: Invalid module ID, returning empty array');
//////      return [];
//////    }
//////    try {
//////      return await ApiCallManager.get(`${_config.endpoints.byModuleId}/${moduleId}`);
//////    } catch (error) {
//////      console.error('MenuService.getMenusByModuleId error:', error);
//////      return []; // Return empty array on failure
//////    }
//////  }

//////  /** 
//////   * Get available modules (dropdown)
//////   */
//////  async function getModules() {
//////    try {
//////      return await ApiCallManager.get(`${_config.endpoints.moduleDDL}`);
//////    } catch (error) {
//////      console.error('MenuService.getModules error:', error);
//////      return []; // Return empty array on failure
//////    }
//////  }


//////  /** 
//////   * Create new menu
//////   */
//////  async function create(menuData) {
//////    if (!menuData) {
//////      throw new Error('Menu data is required');
//////    }
//////    try {
//////      return await ApiCallManager.post(_config.endpoints.base, menuData);
//////    } catch (error) {
//////      console.error('MenuService.create error:', error);
//////      throw error;
//////    }
//////  }

//////  /** 
//////   * Update existing menu
//////   */
//////  async function update(id, menuData) {
//////    if (!id || id <= 0) {
//////      throw new Error('Invalid menu ID');
//////    }
//////    if (!menuData) {
//////      throw new Error('Menu data is required');
//////    }
//////    try {
//////      return await ApiCallManager.put(`${_config.endpoints.base}/${id}`, menuData);
//////    } catch (error) {
//////      console.error('MenuService.update error:', error);
//////      throw error;
//////    }
//////  }

//////  /** 
//////   * Delete menu
//////   */
//////  async function deleteMenu(id, menuData) { // Renamed function parameter
//////    if (!id || id <= 0) {
//////      throw new Error('Invalid menu ID');
//////    }
//////    try {
//////      // Backend expects DELETE with body
//////      const baseUrl = typeof baseApi !== 'undefined' ? baseApi : '';
//////      const response = await fetch(baseUrl + `${_config.endpoints.base}/${id}`, {
//////        method: 'DELETE',
//////        headers: {
//////          'Content-Type': 'application/json',
//////          'Authorization': 'Bearer ' + (typeof AppConfig !== 'undefined' && AppConfig.getToken ? AppConfig.getToken() : localStorage.getItem('jwtToken') || '')
//////        },
//////        body: JSON.stringify(menuData)
//////      });
//////      if (!response.ok) {
//////        throw new Error('Delete failed');
//////      }
//////      const data = await response.json();
//////      if (data.IsSuccess) {
//////        return data.Data;
//////      } else {
//////        throw new Error(data.Message || 'Delete failed');
//////      }
//////    } catch (error) {
//////      console.error('MenuService.delete error:', error);
//////      throw error;
//////    }
//////  }

//////  /** 
//////   * Smart Save or Update
//////   */
//////  async function saveOrUpdate(menuData) {
//////    if (!menuData) {
//////      throw new Error('Menu data is required');
//////    }
//////    const isCreate = !menuData.MenuId || menuData.MenuId === 0;
//////    if (isCreate) {
//////      return await create(menuData);
//////    } else {
//////      return await update(menuData.MenuId, menuData);
//////    }
//////  }

//////  // ============================================
//////  // PUBLIC - Grid DataSource
//////  // ============================================

//////  /** 
//////   * Get Kendo Grid DataSource
//////   */
//////  function getGridDataSource(config) {
//////    // Check if ApiCallManager exists
//////    if (typeof ApiCallManager === 'undefined') {
//////      console.error('ApiCallManager not loaded! Using VanillaApiCallManager as fallback.');
//////      // Fallback to VanillaApiCallManager
//////      if (typeof VanillaApiCallManager !== 'undefined') {
//////        const baseUrl = typeof baseApi !== 'undefined' ? baseApi : '';
//////        return VanillaApiCallManager.GenericGridDataSource({
//////          apiUrl: baseUrl + _config.endpoints.summary,
//////          requestType: 'POST', // Assuming POST for summary with filtering/sorting/paging
//////          async: true,
//////          modelFields: _config.modelFields,
//////          pageSize: config?.pageSize || 20,
//////          serverPaging: true,
//////          serverSorting: true,
//////          serverFiltering: true,
//////          allowUnsort: true,
//////          schemaData: 'Data.Items',
//////          schemaTotal: 'Data.TotalCount'
//////        });
//////      }
//////      throw new Error('No API manager available');
//////    }
//////    const gridConfig = Object.assign({}, {
//////      endpoint: _config.endpoints.summary,
//////      pageSize: 20,
//////      serverPaging: true,
//////      serverSorting: true,
//////      serverFiltering: true,
//////      modelFields: _config.modelFields
//////    }, config || {});
//////    return ApiCallManager.createGridDataSource(gridConfig);
//////  }

//////  /** 
//////   * Refresh grid data
//////   */
//////  function refreshGrid(gridId) {
//////    const id = gridId || _config.gridId;
//////    const grid = $('#' + id).data('kendoGrid');
//////    if (grid && grid.dataSource) {
//////      grid.dataSource.read();
//////    } else {
//////      console.warn('MenuService.refreshGrid: Grid not found with ID:', id);
//////    }
//////  }

//////  // ============================================
//////  // PUBLIC - With Confirmation (if MessageManager available)
//////  // ============================================

//////  /** 
//////   * Create with confirmation dialog
//////   */
//////  async function createWithConfirm(menuData, options) {
//////    options = options || {};
//////    // Check if MessageManager available
//////    if (typeof MessageManager !== 'undefined' && MessageManager.confirm) {
//////      return await MessageManager.confirm.save(async () => {
//////        const result = await MessageManager.loading.wrap(
//////          create(menuData),
//////          'Creating menu...'
//////        );
//////        MessageManager.notify.success('Menu created successfully!');
//////        refreshGrid();
//////        if (options.onSuccess) {
//////          options.onSuccess(result);
//////        }
//////        return result;
//////      }, options.onCancel);
//////    } else {
//////      // Fallback without MessageManager
//////      const result = await create(menuData);
//////      refreshGrid();
//////      if (options.onSuccess) {
//////        options.onSuccess(result);
//////      }
//////      return result;
//////    }
//////  }

//////  /** 
//////   * Update with confirmation dialog
//////   */
//////  async function updateWithConfirm(id, menuData, options) {
//////    options = options || {};
//////    if (typeof MessageManager !== 'undefined' && MessageManager.confirm) {
//////      return await MessageManager.confirm.update(async () => {
//////        const result = await MessageManager.loading.wrap(
//////          update(id, menuData),
//////          'Updating menu...'
//////        );
//////        MessageManager.notify.success('Menu updated successfully!');
//////        refreshGrid();
//////        if (options.onSuccess) {
//////          options.onSuccess(result);
//////        }
//////        return result;
//////      }, options.onCancel);
//////    } else {
//////      // Fallback without MessageManager
//////      const result = await update(id, menuData);
//////      refreshGrid();
//////      if (options.onSuccess) {
//////        options.onSuccess(result);
//////      }
//////      return result;
//////    }
//////  }

//////  /** 
//////   * Delete with confirmation dialog
//////   */
//////  async function deleteWithConfirm(id, menuData, options) {
//////    options = options || {};
//////    if (typeof MessageManager !== 'undefined' && MessageManager.confirm) {
//////      return await MessageManager.confirm.delete('menu', async () => {
//////        await MessageManager.loading.wrap(
//////          deleteMenu(id, menuData), // Pass the id and data
//////          'Deleting menu...'
//////        );
//////        MessageManager.notify.success('Menu deleted successfully!');
//////        refreshGrid();
//////        if (options.onSuccess) {
//////          options.onSuccess();
//////        }
//////      }, options.onCancel);
//////    } else {
//////      // Fallback without MessageManager
//////      await deleteMenu(id, menuData); // Pass the id and data
//////      refreshGrid();
//////      if (options.onSuccess) {
//////        options.onSuccess();
//////      }
//////    }
//////  }

//////  /** 
//////   * Save or Update with confirmation
//////   */
//////  async function saveOrUpdateWithConfirm(menuData, options) {
//////    const isCreate = !menuData.MenuId || menuData.MenuId == 0;
//////    if (isCreate) {
//////      return await createWithConfirm(menuData, options);
//////    } else {
//////      return await updateWithConfirm(menuData.MenuId, menuData, options);
//////    }
//////  }

//////  // ============================================
//////  // PUBLIC - Utility Methods
//////  // ============================================

//////  /** 
//////   * Get configuration
//////   */
//////  function getConfig() {
//////    return Object.assign({}, _config);
//////  }

//////  /** 
//////   * Get service info
//////   */
//////  function getInfo() {
//////    return {
//////      name: 'MenuService',
//////      version: '1.0.0',
//////      author: 'devSakhawat',
//////      date: '2025-01-14', // Assuming today's date
//////      endpoints: _config.endpoints,
//////      gridId: _config.gridId
//////    };
//////  }

//////  // ============================================
//////  // PUBLIC API
//////  // ============================================
//////  return {
//////    // Basic CRUD
//////    getAll: getAll,
//////    getById: getById,
//////    getMenusByModuleId: getMenusByModuleId,
//////    getModules: getModules, // Expose module fetching
//////    create: create,
//////    update: update,
//////    delete: deleteMenu, // Expose delete function
//////    saveOrUpdate: saveOrUpdate,
//////    // Grid
//////    getGridDataSource: getGridDataSource,
//////    refreshGrid: refreshGrid,
//////    // With Confirmation
//////    createWithConfirm: createWithConfirm,
//////    updateWithConfirm: updateWithConfirm,
//////    deleteWithConfirm: deleteWithConfirm,
//////    saveOrUpdateWithConfirm: saveOrUpdateWithConfirm,
//////    // Utilities
//////    getConfig: getConfig,
//////    getInfo: getInfo
//////  };
//////})();

//////// Log initialization
//////if (typeof console !== 'undefined' && console.log) {
//////  console.log(
//////    '%c[MenuService] ✓ Loaded successfully',
//////    'color: #2196F3; font-weight: bold; font-size: 12px;'
//////  );
//////  if (console.table) {
//////    console.table(MenuService.getInfo());
//////  }
//////}
