// <reference path="CRMAdditionalInformation.js" />
// <reference path="CRMCourseInformation.js" />
// <reference path="CRMEducationNEnglishLanguage.js" />

$(document).ready(function () {

  console.log("=== CRM Application System Initialize হচ্ছে ===");
  console.log("বাংলাদেশ ডেভেলপমেন্ট CRM সিস্টেম - বিভিন্ন দেশের ইনস্টিটিউট ও কোর্সের তথ্য ব্যবস্থাপনা");

  CRMApplicationSettingsHelper.createTabstrip();
  CRMCourseInformationHelper.courseInit();

  // Initialize the grid
  CRMEducationNEnglishLanguagHelper.initEducationNEnglishtLanguage();
  CRMAdditionalInformationHelper.initAdditionalInformation();

  // Optional: Add sample data for testing scrolling
  var sampleData = [
    { EducationHistoryId: 1, Institution: "ঢাকা বিশ্ববিদ্যালয়", Qualification: "স্নাতক (সম্মান)", PassingYear: 2020, Grade: "প্রথম শ্রেণী", AttachedDocument: "document1.pdf" },
    { EducationHistoryId: 2, Institution: "অক্সফোর্ড বিশ্ববিদ্যালয়", Qualification: "স্নাতকোত্তর", PassingYear: 2022, Grade: "সম্মাননা", AttachedDocument: "document2.pdf" },
    { EducationHistoryId: 3, Institution: "হার্ভার্ড বিশ্ববিদ্যালয়", Qualification: "পিএইচডি", PassingYear: 2023, Grade: "সামা কাম লড", AttachedDocument: "document3.pdf" }
  ];

  console.log("=== সিস্টেম সফলভাবে Initialize হয়েছে ===");
  console.log("ব্যবহারের জন্য উপলব্ধ ফাংশনসমূহ:");
  console.log("1. CRMCourseInformationHelper.fillDemoData() - ডেমো ডেটা পূরণ");
  console.log("2. CRMCourseInformationHelper.createCompleteApplicationObject() - সম্পূর্ণ আবেদনের অবজেক্ট তৈরি");
  console.log("3. CRMCourseInformationHelper.validateCompleteForm() - ফর্ম ভ্যালিডেশন");
  console.log("4. CRMCourseInformationHelper.exportFormDataAsJSON() - JSON এ রূপান্তর");
  console.log("5. CRMCourseInformationHelper.submitApplication() - আবেদন সাবমিট");

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
    console.log("Kendo TabStrip তৈরি হচ্ছে...");
    
    $("#tabstrip").kendoTabStrip({
      select: function (e) {
        // Ensure only one tab has the 'k-state-active' class
        $("#tabstrip ul li").removeClass("k-state-active");
        $(e.item).addClass("k-state-active");
        
        var selectedTabText = $(e.item).find("a").text().trim();
        console.log("নির্বাচিত ট্যাব:", selectedTabText);
      }
    });

    var tabStrip = $("#tabstrip").data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0); // Ensure the first tab is selected by default
      console.log("TabStrip সফলভাবে তৈরি হয়েছে - প্রথম ট্যাব নির্বাচিত");
    } else {
      console.log("Kendo TabStrip initialize হতে পারেনি।");
    }
  },

  // সম্পূর্ণ সিস্টেমের অবস্থা চেক করার ফাংশন
  checkSystemStatus: function () {
    console.log("=== সিস্টেম স্ট্যাটাস চেক ===");
    
    var status = {
      tabstrip: $("#tabstrip").data("kendoTabStrip") ? "✓ সক্রিয়" : "✗ নিষ্ক্রিয়",
      courseCombo: $("#cmbCourseForCourse").data("kendoComboBox") ? "✓ সক্রিয়" : "✗ নিষ্ক্রিয়",
      instituteCombo: $("#cmbInstituteForCourse").data("kendoComboBox") ? "✓ সক্রিয়" : "✗ নিষ্ক্রিয়",
      currencyCombo: $("#cmbCurrencyForCourse").data("kendoComboBox") ? "✓ সক্রিয়" : "✗ নিষ্ক্রিয়",
      countryCombo: $("#cmbCountryForCourse").data("kendoComboBox") ? "✓ সক্রিয়" : "✗ নিষ্ক্রিয়",
      educationGrid: $("#gridEducationSummary").data("kendoGrid") ? "✓ সক্রিয়" : "✗ নিষ্ক্রিয়",
      additionalGrid: $("#gridAdditionalReferenceSummary").data("kendoGrid") ? "✓ সক্রিয়" : "✗ নিষ্ক্রিয়"
    };
    
    console.log("TabStrip:", status.tabstrip);
    console.log("কোর্স ComboBox:", status.courseCombo);
    console.log("ইনস্টিটিউট ComboBox:", status.instituteCombo);
    console.log("মুদ্রা ComboBox:", status.currencyCombo);
    console.log("দেশ ComboBox:", status.countryCombo);
    console.log("শিক্ষার গ্রিড:", status.educationGrid);
    console.log("অতিরিক্ত তথ্য গ্রিড:", status.additionalGrid);
    
    return status;
  },

  // API endpoints এর তালিকা দেখানোর ফাংশন
  showAPIEndpoints: function () {
    console.log("=== API Endpoints ===");
    console.log("ইনস্টিটিউট: https://localhost:7290/bdDevs-crm/crm-institute-ddl");
    console.log("কোর্স (ইনস্টিটিউট অনুযায়ী): https://localhost:7290/bdDevs-crm/crm-course-by-instituteid-ddl/{instituteId}");
    console.log("মুদ্রা: https://localhost:7290/bdDevs-crm/currencyddl");
    console.log("দেশ: https://localhost:7290/bdDevs-crm/crm-countryddl");
  }

}