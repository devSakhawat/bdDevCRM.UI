/*=========================================================
 * Course Service
 * File: CourseService.js
 * Description: Handles all Course-related API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CourseService = GenericService.createService({
  entityName: "Course",
  endpoint: "/crm-course",
  summaryEndpoint: "/crm-course-summary",
  dropdownEndpoint: "/crm-course-ddl",
  gridId: "gridSummaryCourse",
  modelFields: {
    StartDate: { type: "date" },
    EndDate: { type: "date" },
    CreatedDate: { type: "date" }
  },
  useFormData: false,
  cacheTime: 5 * 60 * 1000 // 5 minutes
});

// Add custom methods specific to Course
CourseService.getCoursesByInstituteId = async function (instituteId) {
  if (!instituteId) {
    return Promise.resolve([]);
  }

  return await BaseManager.fetchData(
    `/crm-course-by-instituteid-ddl/${instituteId}`,
    "Failed to load courses for selected institute"
  );
};

// Get course summary (for backward compatibility)
CourseService.getCourseSummary = function () {
  return this.getGridDataSource();
};

// Create course (for backward compatibility)
CourseService.createCourse = async function (courseData, onSuccess, onError) {
  return await this.create(courseData, { onSuccess, onError });
};

// Update course (for backward compatibility)
CourseService.updateCourse = async function (courseId, courseData, onSuccess, onError) {
  return await this.update(courseId, courseData, { onSuccess, onError });
};

// Delete course (for backward compatibility)
CourseService.deleteCourse = async function (courseId, onSuccess, onError) {
  return await this.delete(courseId, { onSuccess, onError });
};