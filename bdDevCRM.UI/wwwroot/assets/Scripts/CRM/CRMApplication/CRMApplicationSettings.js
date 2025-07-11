/// <reference path="CRMAdditionalInformation.js" />
/// <reference path="CRMCourseInformation.js" />
/// <reference path="CRMEducationNEnglishLanguage.js" />

$(document).ready(function () {

  console.log("=== CRM Application System Initializing ===");
  console.log("Bangladesh Development CRM System - Managing Institute and Course Information from Various Countries");

  CRMApplicationSettingsHelper.createTabstrip();

  CRMCourseInformationHelper.intCourse();
  CRMEducationNEnglishLanguagHelper.initEducationNEnglishtLanguage();
  CRMAdditionalInformationHelper.initAdditionalInformation();

  //// Optional: Add sample data for testing scrolling
  //var sampleData = [
  //  { EducationHistoryId: 1, Institution: "Dhaka University", Qualification: "Bachelor's (Honors)", PassingYear: 2020, Grade: "First Class", AttachedDocument: "document1.pdf" },
  //  { EducationHistoryId: 2, Institution: "University of Oxford", Qualification: "Master's", PassingYear: 2022, Grade: "Distinction", AttachedDocument: "document2.pdf" },
  //  { EducationHistoryId: 3, Institution: "Harvard University", Qualification: "PhD", PassingYear: 2023, Grade: "Second Class", AttachedDocument: "document3.pdf" }
  //];

  //console.log("=== System Successfully Initialized ===");
  //console.log("Available Functions for Use:");
  //console.log("1. CRMCourseInformationHelper.fillDemoData() - Fill Demo Data");
  //console.log("2. CRMCourseInformationHelper.createCompleteApplicationObject() - Create Complete Application Object");
  //console.log("3. CRMCourseInformationHelper.validateCompleteForm() - Form Validation");
  //console.log("4. CRMCourseInformationHelper.exportFormDataAsJSON() - Convert to JSON");
  //console.log("5. CRMCourseInformationHelper.submitApplication() - Submit Application");

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
    console.log("Creating Kendo TabStrip...");

    $("#tabstrip").kendoTabStrip({
      select: function (e) {
        // Ensure only one tab has the 'k-state-active' class
        $("#tabstrip ul li").removeClass("k-state-active");
        $(e.item).addClass("k-state-active");

        var selectedTabText = $(e.item).find("a").text().trim();
        console.log("Selected Tab:", selectedTabText);
      }
    });

    var tabStrip = $("#tabstrip").data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0); // Ensure the first tab is selected by default
      console.log("TabStrip Successfully Created - First Tab Selected");
    } else {
      console.log("Kendo TabStrip Failed to Initialize.");
    }
  },

  //// Function to check the status of the entire system
  //checkSystemStatus: function () {
  //  console.log("=== Checking System Status ===");

  //  var status = {
  //    tabstrip: $("#tabstrip").data("kendoTabStrip") ? "✓ Active" : "✗ Inactive",
  //    courseCombo: $("#cmbCourseForCourse").data("kendoComboBox") ? "✓ Active" : "✗ Inactive",
  //    instituteCombo: $("#cmbInstituteForCourse").data("kendoComboBox") ? "✓ Active" : "✗ Inactive",
  //    currencyCombo: $("#cmbCurrencyForCourse").data("kendoComboBox") ? "✓ Active" : "✗ Inactive",
  //    countryCombo: $("#cmbCountryForCourse").data("kendoComboBox") ? "✓ Active" : "✗ Inactive",
  //    educationGrid: $("#gridEducationSummary").data("kendoGrid") ? "✓ Active" : "✗ Inactive",
  //    additionalGrid: $("#gridAdditionalReferenceSummary").data("kendoGrid") ? "✓ Active" : "✗ Inactive"
  //  };

  //  console.log("TabStrip:", status.tabstrip);
  //  console.log("Course ComboBox:", status.courseCombo);
  //  console.log("Institute ComboBox:", status.instituteCombo);
  //  console.log("Currency ComboBox:", status.currencyCombo);
  //  console.log("Country ComboBox:", status.countryCombo);
  //  console.log("Education Grid:", status.educationGrid);
  //  console.log("Additional Info Grid:", status.additionalGrid);

  //  return status;
  //},

  //// Function to display API endpoints
  //showAPIEndpoints: function () {
  //  console.log("=== API Endpoints ===");
  //  console.log("Institute: https://localhost:7290/bdDevs-crm/crm-institute-ddl");
  //  console.log("Course (By Institute): https://localhost:7290/bdDevs-crm/crm-course-by-instituteid-ddl/{instituteId}");
  //  console.log("Currency: https://localhost:7290/bdDevs-crm/currencyddl");
  //  console.log("Country: https://localhost:7290/bdDevs-crm/crm-countryddl");
  //}

}