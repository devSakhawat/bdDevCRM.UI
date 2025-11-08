/*=========================================================
 * CRM Course Information Service
 * File: CRMCourseInformationService.js
 * Description: Handles CRM Course Information API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CRMCourseInformationService = {
  
  // Get institute dropdown for CRM
  getInstituteDropdown: async function() {
    return await BaseManager.fetchData(
      AppConfig.endpoints.instituteDropdown,
      "Failed to load institute data"
    );
  },

  // Get courses by institute ID for CRM
  getCoursesByInstituteId: async function(instituteId) {
    if (!instituteId) {
      return Promise.resolve([]);
    }
    
    return await BaseManager.fetchData(
      `${AppConfig.endpoints.courseByInstitute}/${instituteId}`,
      "Failed to load course data"
    );
  },

  // Get currency dropdown for CRM
  getCurrencyDropdown: async function() {
    return await BaseManager.fetchData(
      AppConfig.endpoints.currency,
      "Failed to load currency data"
    );
  },

  // Get course details with institute
  getCourseDetailsWithInstitute: async function(courseId) {
    return await BaseManager.getById(
      "/crm-course/details",
      courseId,
      "Failed to load course details"
    );
  },

  // Get all course information for dropdown with caching
  getCourseInformationCached: async function() {
    const cacheKey = 'crm-course-information';
    const cached = CacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await BaseManager.fetchData(
      "/crm-course-information",
      "Failed to load course information"
    );
    
    CacheManager.set(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes
    return data;
  }
};
