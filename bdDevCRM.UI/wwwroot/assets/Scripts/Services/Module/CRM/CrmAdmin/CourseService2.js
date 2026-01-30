/// <reference path="../../core/managers/apicallmanager.js" />
/*=========================================================
 * Course Service
 * File: CourseService.js
 * Path: wwwroot/assets/Scripts/Core/Services/CourseService.js
 * Description: Centralized API service for Course module
 * Author: devSakhawat
 * Date: 2025-01-13
=========================================================*/


var CourseServiceOld = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Configuration
  // ============================================

  var _config = {
    endpoints: {
      base: '/crm-course',
      summary: '/crm-course-summary',
      ddl: '/crm-course-ddl',
      instituteDDL: '/crm-institute-ddl',
      byInstituteId: '/crm-course-by-instituteid-ddl',
      currencyDropdownEndpoint: "/currencyddl",
      //summaryEndpoint: "/crm-institute-summary",
      //dropdownEndpoint: "/crm-institute-ddl",
      //instituteDropdownEndpoint: "/crm-institute-ddl",
      //currencyDropdownEndpoint: "/currencyddl",
    },
    gridId: 'gridSummaryCourse',
    modelFields: {
      CourseId: { type: 'number' },
      InstituteId: { type: 'number' },
      CurrencyId: { type: 'number' },
      CourseTitle: { type: 'string' },
      InstituteName: { type: 'string' },
      CourseLevel: { type: 'string' },
      CourseFee: { type: 'number' },
      ApplicationFee: { type: 'number' },
      MonthlyLivingCost: { type: 'number' },
      StartDate: { type: 'date' },
      EndDate: { type: 'date' },
      Status: { type: 'boolean' }
    }
  };

  // ============================================
  // PUBLIC - CRUD Operations
  // ============================================

  /**
   * Get all courses (dropdown)
   */
  async function getAll() {
    try {
      return await ApiCallManager.get(_config.endpoints.ddl);
    } catch (error) {
      console.error('CourseService.getAll error:', error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  async function getById(id) {
    if (!id || id <= 0) {
      throw new Error('Invalid course ID');
    }

    try {
      return await ApiCallManager.get(`${_config.endpoints.base}/${id}`);
    } catch (error) {
      console.error('CourseService.getById error:', error);
      throw error;
    }
  }

  /**
   * Get courses by institute ID
   */
  async function getCoursesByInstituteId(instituteId) {
    if (!instituteId || instituteId <= 0) {
      console.warn('CourseService: Invalid institute ID, returning empty array');
      return [];
    }

    try {
      return await ApiCallManager.get(`${_config.endpoints.byInstituteId}/${instituteId}`);
    } catch (error) {
      console.error('CourseService.getCoursesByInstituteId error:', error);
      return [];
    }
  }

  /**
   * Get availableInstitute
   */
  async function getInstitute() {
    //if (!instituteId || instituteId <= 0) {
    //  console.warn('CourseService: Invalid institute ID, returning empty array');
    //  return [];
    //}

    try {
      return await ApiCallManager.get(`${_config.endpoints.instituteDDL}`);
    } catch (error) {
      console.error('CourseService.getCoursesByInstituteId error:', error);
      return [];
    }
  }

  /**
   * Create new course
   */
  async function create(courseData) {
    if (!courseData) {
      throw new Error('Course data is required');
    }

    try {
      return await ApiCallManager.post(_config.endpoints.base, courseData);
    } catch (error) {
      console.error('CourseService.create error:', error);
      throw error;
    }
  }

  /**
   * Update existing course
   */
  async function update(id, courseData) {
    if (!id || id <= 0) {
      throw new Error('Invalid course ID');
    }

    if (!courseData) {
      throw new Error('Course data is required');
    }

    try {
      return await ApiCallManager.put(`${_config.endpoints.base}/${id}`, courseData);
    } catch (error) {
      console.error('CourseService.update error:', error);
      throw error;
    }
  }

  /**
   * Delete course
   */
  async function deleteCourse(id, courseData) {
    if (!id || id <= 0) {
      throw new Error('Invalid course ID');
    }

    try {
      // Backend expects DELETE with body
      const baseUrl = typeof baseApi !== 'undefined' ? baseApi : '';
      const response = await fetch(baseUrl + `${_config.endpoints.base}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (typeof AppConfig !== 'undefined' && AppConfig.getToken ? AppConfig.getToken() : localStorage.getItem('jwtToken') || '')
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      const data = await response.json();

      if (data.IsSuccess) {
        return data.Data;
      } else {
        throw new Error(data.Message || 'Delete failed');
      }
    } catch (error) {
      console.error('CourseService.delete error:', error);
      throw error;
    }
  }

  /**
   * Smart Save or Update
   */
  async function saveOrUpdate(courseData) {
    if (!courseData) {
      throw new Error('Course data is required');
    }

    const isCreate = !courseData.CourseId || courseData.CourseId === 0;

    if (isCreate) {
      return await create(courseData);
    } else {
      return await update(courseData.CourseId, courseData);
    }
  }

  // ============================================
  // PUBLIC - Grid DataSource
  // ============================================

  /**
   * Get Kendo Grid DataSource
   */
  function getGridDataSource(config) {
    // Check if ApiCallManager exists
    if (typeof ApiCallManager === 'undefined') {
      console.error('ApiCallManager not loaded! Using VanillaApiCallManager as fallback.');

      // Fallback to VanillaApiCallManager
      if (typeof VanillaApiCallManager !== 'undefined') {
        const baseUrl = typeof baseApi !== 'undefined' ? baseApi : '';
        return VanillaApiCallManager.GenericGridDataSource({
          apiUrl: baseUrl + _config.endpoints.summary,
          requestType: 'POST',
          async: true,
          modelFields: _config.modelFields,
          pageSize: config?.pageSize || 20,
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          allowUnsort: true,
          schemaData: 'Data.Items',
          schemaTotal: 'Data.TotalCount'
        });
      }

      throw new Error('No API manager available');
    }

    const gridConfig = Object.assign({}, {
      endpoint: _config.endpoints.summary,
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      modelFields: _config.modelFields
    }, config || {});

    return ApiCallManager.createGridDataSource(gridConfig);
  }

  /**
   * Refresh grid data
   */
  function refreshGrid(gridId) {
    const id = gridId || _config.gridId;
    const grid = $('#' + id).data('kendoGrid');

    if (grid && grid.dataSource) {
      grid.dataSource.read();
    } else {
      console.warn('CourseService.refreshGrid: Grid not found with ID:', id);
    }
  }

  // ============================================
  // PUBLIC - With Confirmation (if MessageManager available)
  // ============================================

  /**
   * Create with confirmation dialog
   */
  async function createWithConfirm(courseData, options) {
    options = options || {};

    // Check if MessageManager available
    if (typeof MessageManager !== 'undefined' && MessageManager.confirm) {
      return await MessageManager.confirm.save(async () => {
        const result = await MessageManager.loading.wrap(
          create(courseData),
          'Creating course...'
        );

        MessageManager.notify.success('Course created successfully!');
        refreshGrid();

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      }, options.onCancel);
    } else {
      // Fallback without MessageManager
      const result = await create(courseData);
      refreshGrid();

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    }
  }

  /**
   * Update with confirmation dialog
   */
  async function updateWithConfirm(id, courseData, options) {
    options = options || {};

    if (typeof MessageManager !== 'undefined' && MessageManager.confirm) {
      return await MessageManager.confirm.update(async () => {
        const result = await MessageManager.loading.wrap(
          update(id, courseData),
          'Updating course...'
        );

        MessageManager.notify.success('Course updated successfully!');
        refreshGrid();

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      }, options.onCancel);
    } else {
      // Fallback without MessageManager
      const result = await update(id, courseData);
      refreshGrid();

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    }
  }

  /**
   * Delete with confirmation dialog
   */
  async function deleteWithConfirm(id, courseData, options) {
    options = options || {};

    if (typeof MessageManager !== 'undefined' && MessageManager.confirm) {
      return await MessageManager.confirm.delete('course', async () => {
        await MessageManager.loading.wrap(
          deleteCourse(id, courseData),
          'Deleting course...'
        );

        MessageManager.notify.success('Course deleted successfully!');
        refreshGrid();

        if (options.onSuccess) {
          options.onSuccess();
        }
      }, options.onCancel);
    } else {
      // Fallback without MessageManager
      await deleteCourse(id, courseData);
      refreshGrid();

      if (options.onSuccess) {
        options.onSuccess();
      }
    }
  }

  /**
   * Save or Update with confirmation
   */
  async function saveOrUpdateWithConfirm(courseData, options) {
    const isCreate = !courseData.CourseId || courseData.CourseId == 0;

    if (isCreate) {
      return await createWithConfirm(courseData, options);
    } else {
      return await updateWithConfirm(courseData.CourseId, courseData, options);
    }
  }

  // ============================================
  // PUBLIC - Utility Methods
  // ============================================

  /**
   * Get configuration
   */
  function getConfig() {
    return Object.assign({}, _config);
  }

  /**
   * Get service info
   */
  function getInfo() {
    return {
      name: 'CourseService',
      version: '1.0.0',
      author: 'devSakhawat',
      date: '2025-01-13',
      endpoints: _config.endpoints,
      gridId: _config.gridId
    };
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // Basic CRUD
    getAll: getAll,
    getById: getById,
    getCoursesByInstituteId: getCoursesByInstituteId,
    create: create,
    update: update,
    delete: deleteCourse,
    saveOrUpdate: saveOrUpdate,

    // DDL
    getInstitute: getInstitute,

    // Grid
    getGridDataSource: getGridDataSource,
    refreshGrid: refreshGrid,

    // With Confirmation
    createWithConfirm: createWithConfirm,
    updateWithConfirm: updateWithConfirm,
    deleteWithConfirm: deleteWithConfirm,
    saveOrUpdateWithConfirm: saveOrUpdateWithConfirm,

    // Utilities
    getConfig: getConfig,
    getInfo: getInfo
  };
})();

// Log initialization
if (typeof console !== 'undefined' && console.log) {
  console.log(
    '%c[CourseService] ✓ Loaded successfully',
    'color: #2196F3; font-weight: bold; font-size: 12px;'
  );

  if (console.table) {
    console.table(CourseService.getInfo());
  }
}