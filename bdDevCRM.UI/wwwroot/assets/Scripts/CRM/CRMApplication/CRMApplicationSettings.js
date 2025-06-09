

// <reference path="CRMAdditionalInformation.js" />
// <reference path="CRMCourseInformation.js" />
// <reference path="CRMEducationNEnglishLanguage.js" />



$(document).ready(function () {

  CRMApplicationSettingsHelper.createTabstrip();
  CRMCourseInformationHelper.courseInit();
/*  CRMEducationNEnglishLanguagHelper.initEducationNEnglishtLanguage();*/



  // Initialize the grid
  CRMEducationNEnglishLanguagHelper.initEducationNEnglishtLanguage();
  CRMAdditionalInformationHelper.initAdditionalInformation();

  // Optional: Add sample data for testing scrolling
  var sampleData = [
    { EducationHistoryId: 1, Institution: "Oxford University", Qualification: "Bachelor of Science", PassingYear: 2020, Grade: "First Class", AttachedDocument: "document1.pdf" },
    { EducationHistoryId: 2, Institution: "Cambridge University", Qualification: "Master of Arts", PassingYear: 2022, Grade: "Distinction", AttachedDocument: "document2.pdf" },
    { EducationHistoryId: 3, Institution: "Harvard University", Qualification: "PhD in Computer Science", PassingYear: 2023, Grade: "Cum Laude", AttachedDocument: "document3.pdf" }
  ];

  // Uncomment this to test with sample data
  /*
  var grid = $("#gridEducationSummary").data("kendoGrid");
  grid.dataSource.data(sampleData);
  */
});




var CRMApplicationSettingsManager = {

}

var CRMApplicationSettingsHelper = {

  createTabstrip: function () {
    $("#tabstrip").kendoTabStrip({
      select: function (e) {
        // Ensure only one tab has the 'k-state-active' class
        $("#tabstrip ul li").removeClass("k-state-active");
        $(e.item).addClass("k-state-active");
      }
    });

    var tabStrip = $("#tabstrip").data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0); // Ensure the first tab is selected by default
    } else {
      console.log("Kendo TabStrip is not initialized.");
    }
  },

}