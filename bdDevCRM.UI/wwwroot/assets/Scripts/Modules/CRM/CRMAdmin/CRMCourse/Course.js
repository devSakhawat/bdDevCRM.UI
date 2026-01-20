/// <reference path="../../common/common.js" />
/// <reference path="CourseDetails.js" />
/// <reference path="CourseSummary.js" />

/*=========================================================
 * Course Main
 * File: Course.js
 * Description: Course module initialization
 * Author: devSakhawat
 * Date: 2025-01-13
=========================================================*/

$(document).ready(function () {
  // Check dependencies
  if (typeof CourseService === 'undefined') {
    console.error('CourseService not loaded! Please ensure CourseService.js is loaded before Course.js');
    return;
  }

  if (typeof ApiCallManager === 'undefined') {
    console.error('ApiCallManager not loaded! Please ensure ApiCallManager.js is loaded');
    return;
  }

  if (typeof MessageManager === 'undefined') {
    console.error('MessageManager not loaded! Please ensure MessageManager.js is loaded');
    return;
  }

  // Initialize components
  try {
    debugger;
    CourseSummaryHelper.initCourseSummary();
    CourseDetailsHelper.intCourseDetails();

    console.log('Course module initialized successfully');
  } catch (error) {
    console.error('Error initializing Course module:', error);
    if (typeof MessageManager !== 'undefined') {
      MessageManager.notify.error('Failed to initialize Course module');
    }
  }
});

// Keep empty objects for backward compatibility
var CourseManager = {};
var CourseHelper = {};