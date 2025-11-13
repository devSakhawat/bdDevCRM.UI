/*=========================================================
 * Course Service
 * File: CourseService.js
 * Path: wwwroot/assets/Scripts/Core/Services/CourseService.js
 * Description: Centralized API service for Course module
 * Author: devSakhawat
 * Date: 2025-01-13
=========================================================*/

var CourseService = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Configuration
  // ============================================

  var _config = {
    endpoints: {
      base: '/crm-course',
      summary: '/crm-course-summary',
      ddl: '/crm-course-ddl',
      byInstituteId: '/crm-course-by-instituteid-ddl'
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
   * Backend: [HttpGet] CourseDDL
   * @returns {Promise<Array>}
   * 
   * @example
   * const courses = await CourseService.getAll();
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
   * @param {number} id - Course ID
   * @returns {Promise<object>}
   * 
   * @example
   * const course = await CourseService.getById(123);
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
   * Backend: [HttpGet] CourseByInstituteIdDDL
   * @param {number} instituteId - Institute ID
   * @returns {Promise<Array>}
   * 
   * @example
   * const courses = await CourseService.getCoursesByInstituteId(5);
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
   * Create new course
   * Backend: [HttpPost] CreateNewRecord
   * @param {object} courseData - Course data
   * @returns {Promise<object>}
   * 
   * @example
   * const newCourse = await CourseService.create(courseData);
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
   * Backend: [HttpPut] UpdateCourse
   * @param {number} id - Course ID
   * @param {object} courseData - Course data
   * @returns {Promise<object>}
   * 
   * @example
   * const updated = await CourseService.update(123, courseData);
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
   * Backend: [HttpDelete] DeleteCourse
   * @param {number} id - Course ID
   * @param {object} courseData - Course data (for audit)
   * @returns {Promise<void>}
   * 
   * @example
   * await CourseService.delete(123, courseData);
   */
  async function deleteCourse(id, courseData) {
    if (!id || id <= 0) {
      throw new Error('Invalid course ID');
    }

    try {
      // Backend expects course data in body for delete operation
      return await ApiCallManager.delete(`${_config.endpoints.base}/${id}`, {
        data: courseData
      });
    } catch (error) {
      console.error('CourseService.delete error:', error);
      throw error;
    }
  }

  /**
   * Smart Save or Update (auto-detect create/update)
   * @param {object} courseData - Course data
   * @returns {Promise<object>}
   * 
   * @example
   * const result = await CourseService.saveOrUpdate(courseData);
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
   * Backend: [HttpPost] SummaryGrid
   * @param {object} config - Grid configuration (optional)
   * @returns {kendo.data.DataSource}
   * 
   * @example
   * const dataSource = CourseService.getGridDataSource({ pageSize: 50 });
   * $('#grid').kendoGrid({ dataSource: dataSource });
   */
  function getGridDataSource(config) {
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
   * @param {string} gridId - Grid element ID (optional, uses default)
   * 
   * @example
   * CourseService.refreshGrid();
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
  // PUBLIC - With Confirmation & UI Integration
  // ============================================

  /**
   * Create with confirmation dialog
   * @param {object} courseData - Course data
   * @param {object} options - Options { onSuccess, onError }
   * @returns {Promise<object>}
   * 
   * @example
   * await CourseService.createWithConfirm(courseData, {
   *   onSuccess: () => { console.log('Created!'); }
   * });
   */
  async function createWithConfirm(courseData, options) {
    options = options || {};

    return await MessageManager.confirm.save(async () => {
      const result = await MessageManager.loading.wrap(
        create(courseData),
        'Creating course...'
      );

      MessageManager.notify.success('Course created successfully!');

      // Refresh grid
      refreshGrid();

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    }, options.onCancel);
  }

  /**
   * Update with confirmation dialog
   * @param {number} id - Course ID
   * @param {object} courseData - Course data
   * @param {object} options - Options { onSuccess, onError }
   * @returns {Promise<object>}
   * 
   * @example
   * await CourseService.updateWithConfirm(123, courseData);
   */
  async function updateWithConfirm(id, courseData, options) {
    options = options || {};

    return await MessageManager.confirm.update(async () => {
      const result = await MessageManager.loading.wrap(
        update(id, courseData),
        'Updating course...'
      );

      MessageManager.notify.success('Course updated successfully!');

      // Refresh grid
      refreshGrid();

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    }, options.onCancel);
  }

  /**
   * Delete with confirmation dialog
   * @param {number} id - Course ID
   * @param {object} courseData - Course data
   * @param {object} options - Options { onSuccess, onError }
   * @returns {Promise<void>}
   * 
   * @example
   * await CourseService.deleteWithConfirm(123, courseData);
   */
  async function deleteWithConfirm(id, courseData, options) {
    options = options || {};

    return await MessageManager.confirm.delete('course', async () => {
      await MessageManager.loading.wrap(
        deleteCourse(id, courseData),
        'Deleting course...'
      );

      MessageManager.notify.success('Course deleted successfully!');

      // Refresh grid
      refreshGrid();

      if (options.onSuccess) {
        options.onSuccess();
      }
    }, options.onCancel);
  }

  /**
   * Save or Update with confirmation (smart operation)
   * @param {object} courseData - Course data
   * @param {object} options - Options { onSuccess, onError }
   * @returns {Promise<object>}
   * 
   * @example
   * await CourseService.saveOrUpdateWithConfirm(courseData);
   */
  async function saveOrUpdateWithConfirm(courseData, options) {
    const isCreate = !courseData.CourseId || courseData.CourseId === 0;

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
}