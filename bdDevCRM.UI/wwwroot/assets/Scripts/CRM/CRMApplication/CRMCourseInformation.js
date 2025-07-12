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

// Global Variable
var isCountryDataLoaded = false;

/* =========================================================
   CRMCourseInformationManager : API Calls Management
=========================================================*/
var CRMCourseInformationManager = {

  fetchCountryComboBoxData: async function () {
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

  getIntakeYearData: function () {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i < 7; i++) {
      const year = currentYear + i;
      years.push({ IntakeYearId: year, IntakeYear: year.toString() });
    }
    return years;
  },

  getPaymentMethodData: function () {
    return [
      { PaymentMethodId: 1, PaymentMethod: "Cash" },
      { PaymentMethodId: 2, PaymentMethod: "By Cheque" },
      { PaymentMethodId: 3, PaymentMethod: "Bank Transfer" },
      { PaymentMethodId: 4, PaymentMethod: "Demand Draft" },
      { PaymentMethodId: 5, PaymentMethod: "Credit Card" },
      { PaymentMethodId: 6, PaymentMethod: "Paypal" },
      { PaymentMethodId: 7, PaymentMethod: "Paytm" },
      { PaymentMethodId: 8, PaymentMethod: "UPI" }
    ];
  },

  getGenderData: function () {
    return [
      { GenderId: 1, GenderName: "Male" },
      { GenderId: 2, GenderName: "Female" },
      { GenderId: 3, GenderName: "Others" }
    ];
  },

  getTitleData: function () {
    return [
      { TitleValue: "Mr", TitleText: "Mr" },
      { TitleValue: "Mrs", TitleText: "Mrs" },
      { TitleValue: "Miss", TitleText: "Miss" },
      { TitleValue: "Ms", TitleText: "Ms" },
    ]
  },

  getMaritalStatusData: function () {
    return [
      { MaritalStatusId: "1", MaritalStatusName: "Married" },
      { MaritalStatusId: "2", MaritalStatusName: "Unmarried" },
      { MaritalStatusId: "3", MaritalStatusName: "Divorced" },
    ]
  },

};

/* =========================================================
   CRMCourseInformationHelper : UI Management and Form Handling
=========================================================*/
var CRMCourseInformationHelper = {

  intCourse: function () {
    debugger;
    console.log("=== CRM Course Information Initializing ===");
    //// Kendo window
    //CommonManager.initializeKendoWindow("#CountryPopUp", "Country Details", "80%");
    //CommonManager.initializeKendoWindow("#course_InstitutePopUp", "Institute Details", "80%");
    //CommonManager.initializeKendoWindow("#course_CoursePopUp", "Course Details", "80%");
    //CommonManager.initializeKendoWindow("#CurrencyPopUp_Course", "Currency Details", "80%");

    // ComboBoxes 
    CRMCourseInformationHelper.generateCountryCombo();
    CRMCourseInformationHelper.generateInstituteCombo();
    CRMCourseInformationHelper.generateCourseCombo();
    CRMCourseInformationHelper.generateIntakeMonthCombo();
    CRMCourseInformationHelper.generateIntakeYearCombo();

    CRMCourseInformationHelper.generateCurrencyCombo();
    CRMCourseInformationHelper.generatePaymentMethodCombo();

    //// Personal Details ComboBoxes
    CRMCourseInformationHelper.generateGenderCombo();
    CRMCourseInformationHelper.generateTitleCombo();
    CRMCourseInformationHelper.generateMeritalStatusCombo();

    // Passport

    CRMCourseInformationHelper.initializePaymentDate();
    CRMCourseInformationHelper.initializeDateOfBirth();
    CRMCourseInformationHelper.initializePassportIssueDate();
    CRMCourseInformationHelper.initializePassportExpiryDate();

    //// Address ComboBoxes
    //this.generateCountryForPermanentAddressCombo();
    //this.generateCountryForPresentAddressCombo();

    this.bindEvents();
  },

  bindEvents: function () {
    //$("#btnSave").on("click", this.saveForm);
    $("input[name='ValidPassport']").on("change", this.togglePassportFieldsByRadio);

    // if the
    $("#datepickerPassportIssueDate").data("kendoDatePicker").bind("change", function () {
      const issueDate = this.value();
      const expiryPicker = $("#datepickerPassportExpiryDate").data("kendoDatePicker");

      if (issueDate && expiryPicker) {
        expiryPicker.min(issueDate);
      }
    });

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
          if (instituteCombo) {
            instituteCombo.setDataSource([]);
          }
          VanillaApiCallManager.handleApiError(error);
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

    if (!courseCombo) this.generateCourseCombo();

    if (courseCombo) {
      courseCombo.setDataSource([]);
      courseCombo.value("");
      courseCombo.input.attr("placeholder", "Select Course");
    }

    // Load courses based on selected institute
    if (instituteId) {
      CRMCourseInformationManager.fetchCourseByInstituteIdData(instituteId)
        .then(data => { courseCombo.setDataSource(data) })
        .catch(error => {
          if (courseCombo) {
            courseCombo.setDataSource([]);
          }
          VanillaApiCallManager.handleApiError(error);
        });
    }
  },

  generateCourseCombo: function () {
    $("#cmbCourseForCourse").kendoComboBox({
      placeholder: "Select Course...",
      dataTextField: "CourseTitle",
      dataValueField: "CourseId",
      filter: "contains",
      suggest: true,
      dataSource: [],
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
      placeholder: "Select Gender...",
      dataTextField: "GenderName",
      dataValuseField: "GenderId",
      dataSource: CRMCourseInformationManager.getGenderData(),
    });
  },

  initializePaymentDate: function () {
    $("#datePickerPaymentDate").kendoDatePicker({
      format: "dd-MMM-yyyy",
      parseFormats: "yyyy-MM-dd",
      value: new Date(),
      placeholder: "Select Payment Date"
    });
  },

  generateTitleCombo: function () {
    $("#cmbTitleForCourse").kendoComboBox({
      placeholder: "Select Title",
      dataTextField: "TitleText",
      dataValuesField: "TitleValue",
      filter: "contains",
      suggest: true,
      dataSource: CRMCourseInformationManager.getTitleData(),
    });
  },

  initializeDateOfBirth: function () {
    const dobInput = $("#datePickerDateOfBirth");

    dobInput.kendoDatePicker({
      format: "dd-MMM-yyyy",
      parseFormats: ["yyyy-MM-dd"],
      max: new Date()
    });

    // Set placeholder manually after widget initialized
    dobInput.attr("placeholder", "Select Date of Birth");
  },

  generateMeritalStatusCombo: function () {
    $("#cmbMaritalStatusForCourse").kendoComboBox({
      placeholder: "Select Title",
      dataTextField: "MaritalStatusName",
      dataValuesField: "MaritalStatusId",
      filter: "contains",
      suggest: true,
      dataSource: CRMCourseInformationManager.getMaritalStatusData(),
    });
  },

  initializePassportIssueDate: function () {
    const passportInssueDate = $("#datepickerPassportIssueDate");
    passportInssueDate.kendoDatePicker({
      format: "dd-MMM-yyyy",
      parseFormats: "yyyy-MM-dd",
      max: new Date(),
      value: null
    });

    passportInssueDate.attr("placeholder", "Select Passport Issue Date");
  },

  initializePassportExpiryDate: function () {
    const passportExpiryDate = $("#datepickerPassportExpiryDate");
    $("#datepickerPassportExpiryDate").kendoDatePicker({
      format: "dd-MMM-yyyy",
      parseFormats: "yyyy-MM-dd",
      value: new Date(),
    });

    passportExpiryDate.attr("placeholder", "Select Passport Expire Date");
  },

  togglePassportFieldsByRadio: function () {
    debugger;
    const isYes = document.getElementById("radioIsPassportYes").checked;

    const passportNumber = document.getElementById("txtPassportNumberForCourse");
    const issueDateInput = $("#datepickerPassportIssueDate");
    const expiryDateInput = $("#datepickerPassportExpiryDate");

    const lblPassportNumber = document.querySelector("label[for='PassportNumber']");
    const lblIssueDate = document.querySelector("label[for='PassportIssueDate']");
    const lblExpiryDate = document.querySelector("label[for='PassportExpiryDate']");

    const toggleStar = (label, show) => {
      if (!label) return;

      const existingStar = label.querySelector(".redstart");

      if (show) {
        if (!existingStar) {
          const star = document.createElement("span");
          star.className = "redstart";
          star.innerHTML = " *";
          label.appendChild(star);
        }
      } else {
        if (existingStar) existingStar.remove();
      }
    };

    if (isYes) {
      passportNumber.disabled = false;
      passportNumber.setAttribute("required", "true");

      issueDateInput.prop("disabled", false).attr("required", true);
      expiryDateInput.prop("disabled", false).attr("required", true);

      toggleStar(lblPassportNumber, true);
      toggleStar(lblIssueDate, true);
      toggleStar(lblExpiryDate, true);

      // 👉 Set min of expiry = issue date (if selected)
      const issuePicker = issueDateInput.data("kendoDatePicker");
      const expiryPicker = expiryDateInput.data("kendoDatePicker");


      const issueDate = issuePicker?.value();
      if (issueDate && expiryPicker) {
        expiryPicker.min(issueDate); // 👈 Prevent expiry before issue
      }
      else {
        expiryPicker.value(new Date());
      }

    } else {
      passportNumber.disabled = true;
      passportNumber.removeAttribute("required");
      passportNumber.value = "";

      issueDateInput.prop("disabled", true).removeAttr("required");
      expiryDateInput.prop("disabled", true).removeAttr("required");

      const issuePicker = issueDateInput.data("kendoDatePicker");
      const expiryPicker = expiryDateInput.data("kendoDatePicker");


      //
      if (issuePicker) {
        issuePicker.value(null);
        issuePicker.enable(false);
      }
      if (expiryPicker) {
        expiryPicker.value(null);
        expiryPicker.enable(false);
      }

      if (issuePicker) issuePicker.value(null);
      if (expiryPicker) {
        expiryPicker.value(null);
        expiryPicker.min(new Date());
      }

      toggleStar(lblPassportNumber, false);
      toggleStar(lblIssueDate, false);
      toggleStar(lblExpiryDate, false);
    }
  },


}

