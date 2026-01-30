/*=========================================================
 * Course Service
 * File: CourseService.js
 * Description: Centralized API service for Course module
 * Author: devSakhawat
 * Date: 2026-01-24
=========================================================*/

var CourseService = {

  /////////////////////////////////////////////////////////////
  // COURSE CRUD OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get all courses
   */
  getAllCourses: async function () {
    try {
      console.log('Fetching all courses...');
      const endpoint = AppConfig.endpoints.courses || '/courses';
      const data = await ApiCallManager.get(endpoint);
      console.log('Courses fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading courses:', error);
      MessageManager.notify.error('Failed to load courses');
      throw error;
    }
  },

  /**
   * Get course by ID
   */
  getCourseById: async function (courseId) {
    if (!courseId || courseId <= 0) {
      console.error('Invalid course ID:', courseId);
      throw new Error('Invalid course ID');
    }

    try {
      console.log('Fetching course by ID:', courseId);
      const endpoint = `${AppConfig.endpoints.course || '/course'}/${courseId}`;
      const data = await ApiCallManager.get(endpoint);
      console.log('Course fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error loading course:', error);
      MessageManager.notify.error('Failed to load course details');
      throw error;
    }
  },

  /**
   * Create new course
   */
  createCourse: async function (courseData) {
    console.log('Creating new course:', courseData);

    // Validation
    if (!this.validateCourse(courseData)) {
      throw new Error('Invalid course data');
    }

    try {
      const endpoint = AppConfig.endpoints.courseCreate || '/course';
      const result = await ApiCallManager.post(endpoint, courseData, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true
      });

      console.log('Course created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating course:', error);
      MessageManager.notify.error('Failed to create course');
      throw error;
    }
  },

  /**
   * Update existing course
   */
  updateCourse: async function (courseId, courseData) {
    if (!courseId || courseId <= 0) {
      console.error('Invalid course ID:', courseId);
      throw new Error('Invalid course ID');
    }

    console.log('Updating course:', courseId, courseData);

    // Validation
    if (!this.validateCourse(courseData)) {
      throw new Error('Invalid course data');
    }

    try {
      const endpoint = `${AppConfig.endpoints.courseUpdate || '/course'}/${courseId}`;
      const result = await ApiCallManager.put(endpoint, courseData, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true
      });

      console.log('Course updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating course:', error);
      MessageManager.notify.error('Failed to update course');
      throw error;
    }
  },

  /**
   * Delete course
   */
  deleteCourse: async function (courseId) {
    if (!courseId || courseId <= 0) {
      console.error('Invalid course ID:', courseId);
      throw new Error('Invalid course ID');
    }

    console.log('Deleting course:', courseId);

    try {
      const endpoint = `${AppConfig.endpoints.courseDelete || '/course'}/${courseId}`;
      const result = await ApiCallManager.delete(endpoint, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true
      });

      console.log('Course deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error deleting course:', error);
      MessageManager.notify.error('Failed to delete course');
      throw error;
    }
  },

  /**
   * Validate course data
   */
  validateCourse: function (courseData) {
    // Course title validation
    if (!courseData.CourseTitle || courseData.CourseTitle.trim() === '') {
      MessageManager.notify.error('Course title is required');
      return false;
    }

    // Course title length validation
    if (courseData.CourseTitle.trim().length < 3) {
      MessageManager.notify.error('Course title must be at least 3 characters');
      return false;
    }

    if (courseData.CourseTitle.trim().length > 200) {
      MessageManager.notify.error('Course title must not exceed 200 characters');
      return false;
    }

    // Institute validation
    if (!courseData.InstituteId || courseData.InstituteId <= 0) {
      MessageManager.notify.error('Please select an institute');
      return false;
    }

    // Currency validation
    if (!courseData.CurrencyId || courseData.CurrencyId <= 0) {
      MessageManager.notify.error('Please select a currency');
      return false;
    }

    console.log('Course data validation passed');
    return true;
  },

  /////////////////////////////////////////////////////////////
  // INSTITUTE OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get all institutes for dropdown
   */
  getInstitutes: async function () {
    try {
      console.log('Fetching institutes...');
      const endpoint = AppConfig.endpoints.institutesDDL || '/crm-institute-ddl';
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });
      console.log('Institutes fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading institutes:', error);
      MessageManager.notify.error('Failed to load institutes');
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // CURRENCY OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get all currencies for dropdown
   */
  getCurrencies: async function () {
    try {
      console.log('Fetching currencies...');
      const endpoint = AppConfig.endpoints.currenciesDDL || '/currencyddl';
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });
      console.log('Currencies fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading currencies:', error);
      MessageManager.notify.error('Failed to load currencies');
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
    console.log('Creating course grid DataSource...');

    const defaultConfig = {
      endpoint: AppConfig.endpoints.courseSummary || '/course-summary',
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      modelFields: {
        CourseId: { type: 'number' },
        CourseTitle: { type: 'string' },
        InstituteId: { type: 'number' },
        InstituteName: { type: 'string' },
        CurrencyId: { type: 'number' },
        CurrencyName: { type: 'string' },
        CourseLevel: { type: 'string' },
        CourseFee: { type: 'number' },
        ApplicationFee: { type: 'number' },
        MonthlyLivingCost: { type: 'number' },
        StartDate: { type: 'date' },
        EndDate: { type: 'date' },
        Status: { type: 'boolean' }
      },
      primaryKey: 'CourseId'
    };

    const gridConfig = Object.assign({}, defaultConfig, config || {});
    console.log('Course grid DataSource config:', gridConfig);

    return ApiCallManager.createGridDataSource(gridConfig);
  },

  /////////////////////////////////////////////////////////////
  // UTILITY METHODS
  /////////////////////////////////////////////////////////////

  /**
   * Check if course title already exists
   */
  checkCourseTitleExists: async function (courseTitle, excludeCourseId, instituteId) {
    if (!courseTitle || courseTitle.trim() === '') {
      return false;
    }

    try {
      const courses = await this.getAllCourses();

      const exists = courses.some(course =>
        course.CourseTitle.toLowerCase().trim() === courseTitle.toLowerCase().trim() &&
        course.InstituteId === instituteId &&
        course.CourseId !== excludeCourseId
      );

      return exists;
    } catch (error) {
      console.error('Error checking course title:', error);
      return false;
    }
  },

  /**
   * Get course statistics
   */
  getCourseStatistics: async function () {
    try {
      const courses = await this.getAllCourses();

      return {
        totalCourses: courses.length,
        activeCourses: courses.filter(c => c.Status === true).length,
        inactiveCourses: courses.filter(c => c.Status === false).length
      };
    } catch (error) {
      console.error('Error getting course statistics:', error);
      return {
        totalCourses: 0,
        activeCourses: 0,
        inactiveCourses: 0
      };
    }
  },

  /**
   * Export course data
   */
  exportCourseData: async function (courseId) {
    if (!courseId || courseId <= 0) {
      throw new Error('Invalid course ID');
    }

    try {
      const courseData = await this.getCourseById(courseId);

      return {
        course: courseData,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting course data:', error);
      throw error;
    }
  },

  /**
   * Clone course
   */
  cloneCourse: async function (sourceCourseId, newCourseTitle) {
    if (!sourceCourseId || sourceCourseId <= 0) {
      throw new Error('Invalid source course ID');
    }

    if (!newCourseTitle || newCourseTitle.trim() === '') {
      throw new Error('New course title is required');
    }

    try {
      console.log('Cloning course:', sourceCourseId, 'as', newCourseTitle);

      // Get source course data
      const sourceCourse = await this.getCourseById(sourceCourseId);

      // Prepare new course data
      const newCourseData = {
        ...sourceCourse,
        CourseId: 0, // New course
        CourseTitle: newCourseTitle
      };

      // Create new course
      const result = await this.createCourse(newCourseData);
      console.log('Course cloned successfully:', result);

      return result;
    } catch (error) {
      console.error('Error cloning course:', error);
      MessageManager.notify.error('Failed to clone course');
      throw error;
    }
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  window.CourseService = CourseService;
  console.log('CourseService initialized and available globally');
}