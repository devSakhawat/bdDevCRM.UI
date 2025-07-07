/// <reference path="../../core/currency/currencydetail.js" />
/// <reference path="../../common/common.js" />
/// <reference path="CRMAdditionalInformation.js" />
/// <reference path="CRMEducationNEnglishLanguage.js" />
/// <reference path="CRMApplicationSettings.js" />
/// <reference path="../../core/currency/currencysummary.js" />
/// <reference path="../../core/country/countrydetail.js" />
/// <reference path="../../core/country/countrysummary.js" />
/// <reference path="../../core/crmcourse/coursedetails.js" />
/// <reference path="../../core/crminstitute/institutedetails.js" />

// Global Variable - ??????? ?????????
var isCountryDataLoaded = false;

/* =========================================================
   CRMCourseInformationManager : API Calls Management
=========================================================*/
var CRMCourseInformationManager = {

  fetchCountryComboBoxData: async function () {
    debugger;
    const serviceUrl = "/countryddl";

    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load country data");
      }
    } catch (error) {
      console.error("Error loading country data:", error);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  fetchInstituteComboBoxDataByCountryId: async function (countryId) {
    if (!countryId) {
      return Promise.resolve([]);
    }
    const serviceUrl = `/crm-institut-by-countryid-ddl/${countryId}`;
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load institute data");
      }
    } catch (error) {
      console.error("Error loading institute data:", error);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  //  API call
  fetchCourseByInstituteIdData: async function (instituteId) {
    if (!instituteId) {
      return Promise.resolve([]);
    }

    const serviceUrl = `/crm-course-by-instituteid-ddl/${instituteId}`;
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load course data");
      }
    } catch (error) {
      console.log(`Error loading course data:${error}`);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  //  API call
  fetchInstituteTypeComboBoxData: async function () {
    const serviceUrl = "/crm-institutetype-ddl";

    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load institute type data");
      }
    } catch (error) {
      console.error("Error loading institute type data:", error);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  //
  fetchCurrencyComboBoxData: async function () {
    const serviceUrl = "/currencyddl";

    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load currency data");
      }
    } catch (error) {
      console.error("Error loading currency data:", error);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  // ?????? ????? ?????? ???? ???? ?????
  getIntakeMonthData: function () {
    return [
      { IntakeMonthId: 1, IntakeMonth: "January" },
      { IntakeMonthId: 2, IntakeMonth: "February" },
      { IntakeMonthId: 3, IntakeMonth: "March" },
      { IntakeMonthId: 4, IntakeMonth: "April" },
      { IntakeMonthId: 5, IntakeMonth: "May" },
      { IntakeMonthId: 6, IntakeMonth: "June" },
      { IntakeMonthId: 7, IntakeMonth: "July" },
      { IntakeMonthId: 8, IntakeMonth: "August" },
      { IntakeMonthId: 9, IntakeMonth: "September" },
      { IntakeMonthId: 10, IntakeMonth: "October" },
      { IntakeMonthId: 11, IntakeMonth: "November" },
      { IntakeMonthId: 12, IntakeMonth: "December" }
    ];
  },

  // ?????? ????? ?????? ???? ???? ?????
  getIntakeYearData: function () {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear + i;
      years.push({ IntakeYearId: year, IntakeYear: year.toString() });
    }
    return years;
  },

  // ??????? ??????? ?????? ???? ???? ?????
  getPaymentMethodData: function () {
    return [
      { PaymentMethodId: 1, PaymentMethod: "Credit Card" },
      { PaymentMethodId: 2, PaymentMethod: "Debit Card" },
      { PaymentMethodId: 3, PaymentMethod: "Bank Transfer" },
      { PaymentMethodId: 4, PaymentMethod: "Online Payment" },
      { PaymentMethodId: 5, PaymentMethod: "Check" },
      { PaymentMethodId: 6, PaymentMethod: "Cash" }
    ];
  }
};

/* =========================================================
   CRMCourseInformationHelper : UI Management and Form Handling
=========================================================*/
var CRMCourseInformationHelper = {

  courseInit: function () {
    debugger;
    console.log("=== CRM Course Information Initializing ===");

    //CommonManager.initializeKendoWindow("#CountryPopUp", "Country Details", "80%");
    //CommonManager.initializeKendoWindow("#course_InstitutePopUp", "Institute Details", "80%");
    //CommonManager.initializeKendoWindow("#course_CoursePopUp", "Course Details", "80%");
    //CommonManager.initializeKendoWindow("#CurrencyPopUp_Course", "Currency Details", "80%");

    // ComboBoxes 
    CRMCourseInformationHelper.generateCountryCombo();
    CRMCourseInformationHelper.generateInstituteCombo();
    this.generateCourseCombo();

    //this.generateIntakeMonthCombo();
    //this.generateIntakeYearCombo();
    //this.generateCurrencyCombo();
    //this.generatePaymentMethodCombo();

    //// Personal Details ComboBoxes
    //this.generateGenderCombo();
    //this.generateTitleCombo();
    //this.generateMaritalStatusCombo();

    //// Address ComboBoxes
    //this.generateCountryForPermanentAddressCombo();
    //this.generateCountryForPresentAddressCombo();

    //// Date Pickers ???????????? ???
    //this.initializePaymentDate();
    //this.initializeDateOfBirth();

    console.log("=== CRM Course Information Successfully Initialized ===");
  },

  /* ------ PopUp UI Methods (InstituteDetails.js pattern ????????) ------ */

  //
  generateCountryPopUp: function () {
    console.log("Opening country popup...");
    var countryPopUp = $("#CountryPopUp").data("kendoWindow");
    if (!countryPopUp) return;
    countryPopUp.center().open();

    const grid = $("#gridSummaryCountry").data("kendoGrid");
    if (!grid) {
      if (typeof CountrySummaryHelper !== "undefined") {
        CountrySummaryHelper.initCountrySummary();
        isCountryDataLoaded = true;
      }
    } else {
      grid.resize();
      if (!isCountryDataLoaded) {
        grid.dataSource.read();
        isCountryDataLoaded = true;
      }
    }
  },

  // 
  generateInistitutePopUp: function () {
    console.log("Opening institute popup...");
    const windowId = "InstitutePopUp_Course";
    CommonManager.openKendoWindow(windowId, "Institute Information", "80%");

    // Initialize Institute functionality if available
    if (typeof InstituteDetailsHelper !== "undefined") {
      InstituteDetailsHelper.instituteInit();
    }
    if (typeof InstituteSummaryHelper !== "undefined") {
      InstituteSummaryHelper.initInstituteSummary();
    }

    // Add close button
    const buttonContainer = $(".btnDiv ul li");
    buttonContainer.find(".btn-close-generic").remove();
    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    buttonContainer.append(closeBtn);
  },

  // 
  generateCoursePopUp: function () {
    console.log("Opening course popup...");
    const windowId = "course_CoursePopUp";
    CommonManager.openKendoWindow(windowId, "Course Information", "80%");

    // Initialize Course functionality if available
    if (typeof CourseDetailsHelper !== "undefined") {
      CourseDetailsHelper.intCourseDetails();
    }
    if (typeof CourseSummaryHelper !== "undefined") {
      CourseSummaryHelper.initCourseSummary();
    }

    // Add close button
    const buttonContainer = $(".btnDiv ul li");
    buttonContainer.find(".btn-close-generic").remove();
    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    buttonContainer.append(closeBtn);
  },

  // 
  generateCountryForPermanentAddressPopUp: function () {
    console.log("Opening country popup for permanent address...");
    this.generateCountryPopUp();
  },

  generateCountryForAddressPopUp: function () {
    console.log("Opening country popup for present address...");
    this.generateCountryPopUp();
  },

  /* ------ ComboBox Generation Methods (InstituteDetails.js pattern ????????) ------ */

  generateCountryCombo: function () {
    $("#cmbCountryForCourse").kendoComboBox({
      placeholder: "Select Country...",
      dataTextField: "CountryName",
      dataValueField: "CountryId",
      filter: "contains",
      suggest: true,
      dataSource: [],
      change: CRMCourseInformationHelper.onCountryChange
    });

    var countryComboBoxInstant = $("#cmbCountryForCourse").data("kendoComboBox");
    if (countryComboBoxInstant) {
      CRMCourseInformationManager.fetchCountryComboBoxData().then(data => {
        countryComboBoxInstant.setDataSource(data);
      }).catch(error => {
        console.error("Error loading country data:", error);
        countryComboBoxInstant.setDataSource([]);
      });
    }
  },

  onCountryChange: function (e) {
    const countryId = e.sender.value();

    // clear institute and course combo boxes
    const instituteCombo = $("#cmbInstituteForCourse").data("kendoComboBox");
    const courseCombo = $("#cmbCourseForCourse").data("kendoComboBox");

    if (instituteCombo) {
      instituteCombo.setDataSource([]);
      instituteCombo.value("");
    }
    else {
      this.generateInstituteCombo();
    }

    if (courseCombo) {
      courseCombo.setDataSource({});
      courseCombo.value("");
    }
    else {
      this.generateCourseCombo();
    }

    if (countryId) {
      CRMCourseInformationManager.fetchInstituteComboBoxDataByCountryId(countryId)
        .then(data => { if (instituteCombo) { instituteCombo.setDataSource(data) } })
        .catch(error => {
          console.log("Error loading institute data for country");
          if (instituteCombo) {
            instituteCombo.setDataSource([]);
          }
        });
    }
  },

  generateInstituteCombo: function () {
    $("#cmbInstituteForCourse").kendoComboBox({
      placeholder: "Select Institute...",
      dataTextField: "InstituteName",
      dataValueField: "InstituteId",
      filter: "contains",
      suggest: true,
      dataSource: [],
      change: CRMCourseInformationHelper.onInstituteChange
    });

    //var instituteComboBoxInstant = $("#cmbInstituteForCourse").data("kendoComboBox");
    //if (instituteComboBoxInstant) {
    //  CRMCourseInformationManager.fetchInstituteComboBoxData().then(data => {
    //    instituteComboBoxInstant.setDataSource(data);
    //  }).catch(error => {
    //    console.error("Error loading institute data:", error);
    //    instituteComboBoxInstant.setDataSource([]);
    //  });
    //}
  },

  onInstituteChange: function (e) {
    const instituteId = e.sender.value();
    // clear course combo box
    const courseCombo = $("#cmbCourseForCourse").data("kendoComboBox");

    if (!courseCombo) return;

    if (courseCombo) {
      courseCombo.setDataSource([]);
      courseCombo.value("");
      courseCombo.placeholder("Select Course");
    }

    // Load courses based on selected institute
    if (instituteId) {
      CRMCourseInformationHelper.fetchCourseByInstituteIdData(instituteId)
        .then(data => { courseCombo.setDataSource(data) })
        .catch(error => {
          console.log("Error loading course data for institute");
          courseCombo.setDataSource([]);
        });
    }
  },

  generateCourseCombo: function () {
    $("#cmbCourseForCourse").kendoComboBox({
      placeholder: "Select Course...",
      dataTextField: "CourseName",
      dataValueField: "CourseId",
      filter: "contains",
      suggest: true,
      dataSource: [],
      change: CRMCourseInformationHelper.onInstituteChange
    });
  },

  generateIntakeMonthCombo: function () {
    $("#cmbIntakeMonthForCourse").kendoComboBox({
      placeholder: "Select Intake Month...",
      dataTextField: "IntakeMonth",
      dataValueField: "IntakeMonthId",
      filter: "contains",
      suggest: true,
      dataSource: CRMCourseInformationManager.getIntakeMonthData()
    });
  },

  // 
  generateIntakeYearCombo: function () {
    $("#cmbIntakeYearForCourse").kendoComboBox({
      placeholder: "Select Intake Year...",
      dataTextField: "IntakeYear",
      dataValueField: "IntakeYearId",
      filter: "contains",
      suggest: true,
      dataSource: CRMCourseInformationManager.getIntakeYearData()
    });
  },

  // 
  generateCurrencyCombo: function () {
    $("#cmbCurrencyForCourse").kendoComboBox({
      placeholder: "Select Currency...",
      dataTextField: "CurrencyName",
      dataValueField: "CurrencyId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    var currencyComboBoxInstant = $("#cmbCurrencyForCourse").data("kendoComboBox");
    if (currencyComboBoxInstant) {
      CRMCourseInformationManager.fetchCurrencyComboBoxData().then(data => {
        currencyComboBoxInstant.setDataSource(data);
      }).catch(error => {
        console.error("Error loading currency data:", error);
        currencyComboBoxInstant.setDataSource([]);
      });
    }
  },

  // 
  generatePaymentMethodCombo: function () {
    $("#cmbPaymentMethodForCourse").kendoComboBox({
      placeholder: "Select Payment Method...",
      dataTextField: "PaymentMethod",
      dataValueField: "PaymentMethodId",
      filter: "contains",
      suggest: true,
      dataSource: CRMCourseInformationManager.getPaymentMethodData()
    });
  },

  generateGenderCombo: function () {
    $("#cmbGenderForCourse").kendoComboBox({
      placeholder: "Select gender...",
      dataTextField: "GenderName"
    });
  },


}

