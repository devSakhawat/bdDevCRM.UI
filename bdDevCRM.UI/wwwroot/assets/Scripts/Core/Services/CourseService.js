/*=========================================================
 * Course Service
 * File: CourseService.js
 * Description: Handles all Course-related API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CourseService = {
  
  // Get course summary (grid data)
  getCourseSummary: function() {
    return BaseManager.createGridDataSource({
      apiUrl: AppConfig.getApiUrl() + AppConfig.endpoints.courseSummary,
      requestType: "POST",
      async: true,
      modelFields: { 
        StartDate: { type: "date" }, 
        EndDate: { type: "date" },
        CreatedDate: { type: "date" }
      },
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Data.Items",
      schemaTotal: "Data.TotalCount"
    });
  },

  // Get course by ID
  getCourseById: async function(courseId) {
    return await BaseManager.getById(
      AppConfig.endpoints.course,
      courseId,
      "Failed to load course details"
    );
  },

  // Get courses by institute ID
  getCoursesByInstituteId: async function(instituteId) {
    if (!instituteId) {
      return Promise.resolve([]);
    }
    
    return await BaseManager.fetchData(
      `${AppConfig.endpoints.courseByInstitute}/${instituteId}`,
      "Failed to load courses for selected institute"
    );
  },

  // Create new course
  createCourse: async function(courseData, onSuccess, onError) {
    return await BaseManager.saveOrUpdate({
      id: 0,
      endpoint: AppConfig.endpoints.course,
      data: JSON.stringify(courseData),
      confirmMsg: "Do you want to save this course?",
      successMsg: "Course saved successfully.",
      gridId: "gridSummaryCourse",
      onSuccess: onSuccess,
      onError: onError
    });
  },

  // Update existing course
  updateCourse: async function(courseId, courseData, onSuccess, onError) {
    return await BaseManager.saveOrUpdate({
      id: courseId,
      endpoint: AppConfig.endpoints.course,
      data: JSON.stringify(courseData),
      confirmMsg: "Do you want to update this course?",
      successMsg: "Course updated successfully.",
      gridId: "gridSummaryCourse",
      onSuccess: onSuccess,
      onError: onError
    });
  },

  // Delete course
  deleteCourse: async function(courseId, onSuccess, onError) {
    return await BaseManager.deleteItem({
      id: courseId,
      endpoint: AppConfig.endpoints.course,
      itemName: "course",
      gridId: "gridSummaryCourse",
      onSuccess: onSuccess,
      onError: onError
    });
  },

  // Get course dropdown data
  getCourseDropdown: async function() {
    return await BaseManager.fetchData(
      "/crm-course-ddl",
      "Failed to load course list"
    );
  }
};
