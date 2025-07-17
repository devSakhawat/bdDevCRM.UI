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

    // Applicant image preview
    CRMCourseInformationHelper.initApplicantImagePreview();


    // Address ComboBoxes
    this.generateCountryForPermanentAddressCombo();
    this.generateCountryForPresentAddressCombo();

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

    // Same as permanent address checkbox functionality
    $("#chkDoPermanentAddress").on("change", this.toggleSameAsPermanentAddress);

    //// Applicant image preview click
    //$("#applicantImageThumb").on("click", function () {
    //  CRMCourseInformationHelper.openApplicantImagePreview();
    //});

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
      dataValueField: "GenderId",
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
      dataValueField: "TitleValue",
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
      dataValueField: "MaritalStatusId",
      filter: "contains",
      suggest: true,
      dataSource: CRMCourseInformationManager.getMaritalStatusData(),
    });
  },

  /* ------ Address ComboBox Generation Methods ------ */
  generateCountryForPermanentAddressCombo: function () {
    $("#cmbCountryForPermanentAddress").kendoComboBox({
      placeholder: "Select Country...",
      dataTextField: "CountryName",
      dataValueField: "CountryId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    var countryComboBoxInstant = $("#cmbCountryForPermanentAddress").data("kendoComboBox");
    if (countryComboBoxInstant) {
      CRMCourseInformationManager.fetchCountryComboBoxData().then(data => {
        countryComboBoxInstant.setDataSource(data);
      }).catch(error => {
        console.error("Error loading country data for permanent address:", error);
        countryComboBoxInstant.setDataSource([]);
      });
    }
  },

  generateCountryForPresentAddressCombo: function () {
    $("#cmbCountryForAddress").kendoComboBox({
      placeholder: "Select Country...",
      dataTextField: "CountryName",
      dataValueField: "CountryId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    var countryComboBoxInstant = $("#cmbCountryForAddress").data("kendoComboBox");
    if (countryComboBoxInstant) {
      CRMCourseInformationManager.fetchCountryComboBoxData().then(data => {
        countryComboBoxInstant.setDataSource(data);
      }).catch(error => {
        console.error("Error loading country data for present address:", error);
        countryComboBoxInstant.setDataSource([]);
      });
    }
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
      if (show && !existingStar) {
        const star = document.createElement("span");
        star.className = "redstart";
        star.innerHTML = " *";
        label.appendChild(star);
      } else if (!show && existingStar) {
        existingStar.remove();
      }
    };

    const issuePicker = issueDateInput.data("kendoDatePicker");
    const expiryPicker = expiryDateInput.data("kendoDatePicker");

    if (isYes) {
      // Enable input fields
      passportNumber.disabled = false;
      passportNumber.setAttribute("required", "true");

      if (issuePicker) {
        issuePicker.enable(true); // enable calendar icon
        issueDateInput.removeAttr("disabled").attr("required", true);
      }

      if (expiryPicker) {
        expiryPicker.enable(true); // enable calendar icon
        expiryDateInput.removeAttr("disabled").attr("required", true);
        expiryPicker.value(new Date());
      }

      // Add required star
      toggleStar(lblPassportNumber, true);
      toggleStar(lblIssueDate, true);
      toggleStar(lblExpiryDate, true);

      // Set expiry min date = issue date if available
      const issueDate = issuePicker?.value();
      if (issueDate && expiryPicker) {
        expiryPicker.min(issueDate);
      } else {
        expiryPicker?.min(new Date());
      }

    } else {
      // Disable input fields
      passportNumber.disabled = true;
      passportNumber.removeAttribute("required");
      passportNumber.value = "";

      if (issuePicker) {
        issuePicker.value(null);
        issuePicker.enable(false); // disables input + calendar icon
      }

      if (expiryPicker) {
        expiryPicker.value(null);
        expiryPicker.enable(false); // disables input + calendar icon
        expiryPicker.min(new Date(1900, 0, 1)); // Optional reset
      }

      // Remove required stars
      toggleStar(lblPassportNumber, false);
      toggleStar(lblIssueDate, false);
      toggleStar(lblExpiryDate, false);
    }
  },

  /* ------ Image Preview Methods ------ */

  initApplicantImagePreview: function () {
    $("#ApplicantImageFile").on("change", function () {
      const file = this.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e =>
          $("#applicantImageThumb").attr("src", e.target.result).removeClass("d-none");
        reader.readAsDataURL(file);
      } else {
        $("#applicantImageThumb").addClass("d-none").attr("src", "#");
      }
    });
  },

  /* ------ Address Toggle Methods ------ */
  toggleSameAsPermanentAddress: function () {
    const isChecked = $("#chkDoPermanentAddress").is(":checked");

    if (isChecked) {
      // Copy permanent address values to present address
      $("#txtPresentAddress").val($("#txtPermanentAddress").val());
      $("#txtPresentCity").val($("#txtPermanentCity").val());
      $("#txtPresentState").val($("#txtPermanentState").val());
      $("#txtPostalCode").val($("#txtPostalCode_PermanenetAddress").val());

      // Copy country selection
      const permanentCountryCombo = $("#cmbCountryForPermanentAddress").data("kendoComboBox");
      const presentCountryCombo = $("#cmbCountryForAddress").data("kendoComboBox");

      if (permanentCountryCombo && presentCountryCombo) {
        presentCountryCombo.value(permanentCountryCombo.value());
      }

      // Disable present address fields
      $("#txtPresentAddress, #txtPresentCity, #txtPresentState, #txtPostalCode").prop("disabled", true);
      if (presentCountryCombo) {
        presentCountryCombo.enable(false);
      }
    } else {
      // Enable present address fields
      $("#txtPresentAddress, #txtPresentCity, #txtPresentState, #txtPostalCode").prop("disabled", false);
      const presentCountryCombo = $("#cmbCountryForAddress").data("kendoComboBox");
      if (presentCountryCombo) {
        presentCountryCombo.enable(true);
      }
    }
  },



  //// Create first tab object.
  clearCRMApplicationCourse: function () {
    try {
      // Form Fields Clear - Basic form elements and kendo widgets
      CommonManager.clearFormFields("crmApplicationCourseInfo");
      // Clear Applicant Picture containers
      $("#applicantImageThumb").empty();
      // Grid Data Clear - Remove all grid records
      this.clearAllGrids();


    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
      ToastrMessage.showError("Error clearing in Course tab: " + error.message, "Applciation Course Clearing Error", 0);
    }
  },


  /* ------ Data Object Creation Methods ------ */
  createApplicationCourseInformation: function () {
    try {
      const applicationCourseInformation = {
        ApplicantCourse: this.createCourseDetailsObject(),
        PersonalDetails: this.createPersonalDetailsObject(),
        ApplicantAddress: this.createApplicantAddressObject()
      };
      console.log(applicationCourseInformation);
      debugger;

      console.log("Application Course Information object created:", applicationCourseInformation);
      return applicationCourseInformation;

    } catch (error) {
      console.error("Error creating Application Course Information object:", error);
      return null;
    }
  },

  createCourseDetailsObject: function () {
    try {
      // Get Kendo ComboBox and DatePicker instances
      const countryCombo = $("#cmbCountryForCourse").data("kendoComboBox");
      const instituteCombo = $("#cmbInstituteForCourse").data("kendoComboBox");
      const courseCombo = $("#cmbCourseForCourse").data("kendoComboBox");
      const intakeMonthCombo = $("#cmbIntakeMonthForCourse").data("kendoComboBox");
      const intakeYearCombo = $("#cmbIntakeYearForCourse").data("kendoComboBox");
      const currencyCombo = $("#cmbCurrencyForCourse").data("kendoComboBox");
      const paymentMethodCombo = $("#cmbPaymentMethodForCourse").data("kendoComboBox");
      const paymentDatePicker = $("#datePickerPaymentDate").data("kendoDatePicker");

      const applicantCourseDetails = {
        ApplicantCourseId: parseInt($("#hdnApplicantCourseId").val()) || 0,
        ApplicantId: parseInt($("#hdnApplicantId").val()) || 0,

        CountryId: countryCombo && countryCombo.value() ? parseInt(countryCombo.value()) : 0,
        CountryName: countryCombo ? countryCombo.text() : "",

        InstituteId: instituteCombo && instituteCombo.value() ? parseInt(instituteCombo.value()) : 0,
        InstituteName: instituteCombo ? instituteCombo.text() : "",

        CourseId: courseCombo && courseCombo.value() ? parseInt(courseCombo.value()) : 0,
        CourseTitle: courseCombo ? courseCombo.text() : "",

        IntakeMonthId: intakeMonthCombo && intakeMonthCombo.value() ? parseInt(intakeMonthCombo.value()) : 0,
        IntakeMonth: intakeMonthCombo ? intakeMonthCombo.text() : "",

        IntakeYearId: intakeYearCombo && intakeYearCombo.value() ? parseInt(intakeYearCombo.value()) : 0,
        IntakeYear: intakeYearCombo ? intakeYearCombo.text() : "",

        ApplicationFee: $("#txtApplicationFeeForCourse").val() || "0", // string in DTO

        CurrencyId: currencyCombo && currencyCombo.value() ? parseInt(currencyCombo.value()) : 0,
        CurrencyName: currencyCombo ? currencyCombo.text() : "",

        PaymentMethodId: paymentMethodCombo && paymentMethodCombo.value() ? parseInt(paymentMethodCombo.value()) : 0,
        PaymentMethod: paymentMethodCombo ? paymentMethodCombo.text() : "",

        PaymentReferenceNumber: $("#txtPaymentReferenceNumberCourse").val() || "",
        PaymentDate: paymentDatePicker ? paymentDatePicker.value() : null,

        Remarks: $("#txtareaRemarks").val() || "",

        CreatedDate: new Date().toISOString(),  // Required in C# DTO
        CreatedBy: 0,                            // You should set actual userId from session
        UpdatedDate: null,
        UpdatedBy: null
      };

      return applicantCourseDetails;
    } catch (error) {
      console.error("Error creating Course Details object:", error);
      return {};
    }
  },

  createPersonalDetailsObject: function () {
    try {
      const genderCombo = $("#cmbGenderForCourse").data("kendoComboBox");
      const titleCombo = $("#cmbTitleForCourse").data("kendoComboBox");
      const maritalStatusCombo = $("#cmbMaritalStatusForCourse").data("kendoComboBox");
      const dateOfBirthPicker = $("#datePickerDateOfBirth").data("kendoDatePicker");
      const passportIssuePicker = $("#datepickerPassportIssueDate").data("kendoDatePicker");
      const passportExpiryPicker = $("#datepickerPassportExpiryDate").data("kendoDatePicker");

      const passportIssueDate = passportIssuePicker ? passportIssuePicker.value() : null;
      let passportExpiryDate = passportExpiryPicker ? passportExpiryPicker.value() : null;
      if (!passportIssueDate || isNaN(new Date(passportIssueDate).getTime())) {
        passportExpiryDate = null;
      }

      const now = new Date().toISOString();

      const personalDetails = {
        ApplicantId: parseInt($("#hdnApplicantId").val()) || 0,
        ApplicationId: 0, // Will be set later in backend
        GenderId: genderCombo && genderCombo.value() ? parseInt(genderCombo.value()) : 0,
        GenderName: genderCombo ? genderCombo.text() : "",

        TitleValue: titleCombo ? titleCombo.value() : "",
        TitleText: titleCombo ? titleCombo.text() : "",

        FirstName: $("#txtFirstName").val() || "",
        LastName: $("#txtLastName").val() || "",
        DateOfBirth: dateOfBirthPicker ? dateOfBirthPicker.value() : null,

        MaritalStatusId: maritalStatusCombo && maritalStatusCombo.value() ? parseInt(maritalStatusCombo.value()) : 0,
        MaritalStatusName: maritalStatusCombo ? maritalStatusCombo.text() : "",

        Nationality: $("#txtNationality").val() || "",
        HasValidPassport: $("input[name='ValidPassport']:checked").val() || "",
        PassportNumber: $("#txtPassportNumberForCourse").val() || "",
        assportIssueDate: passportIssueDate,
        PassportExpiryDate: passportExpiryDate,

        PhoneCountryCode: $("#txtPhoneCountrycodeForCourse").val() || "",
        PhoneAreaCode: $("#txtPhoneAreacodeForCourse").val() || "",
        PhoneNumber: $("#txtPhoneNumberForCourse").val() || "",
        Mobile: $("#txtMobileForCourse").val() || "",
        EmailAddress: $("#txtEmailAddressForCourse").val() || "",
        SkypeId: $("#txtSkypeIDForCourse").val() || "",

        ApplicantImagePath: "", // Will be set in backend after file upload

        CreatedDate: now,
        CreatedBy: 0, // Set from backend after login
        UpdatedDate: null,
        UpdatedBy: null
      };

      return personalDetails;
    } catch (error) {
      ToastrMessage.showError("Error creating Personal Details object: " + error, "Error");
      return {};
    }
  },

  createApplicantAddressObject: function () {
    try {
      const permanentCountryCombo = $("#cmbCountryForPermanentAddress").data("kendoComboBox");
      const presentCountryCombo = $("#cmbCountryForAddress").data("kendoComboBox");

      const now = new Date().toISOString();
      const applicantId = parseInt($("#hdnApplicantId").val()) || 0;

      return {
        PermanentAddress: {
          PermanentAddressId: parseInt($("#hdnPermanentAddressId").val()) || 0,
          ApplicantId: applicantId,
          Address: $("#txtPermanentAddress").val() || "",
          City: $("#txtPermanentCity").val() || "",
          State: $("#txtPermanentState").val() || "",
          CountryId: permanentCountryCombo && permanentCountryCombo.value() ? parseInt(permanentCountryCombo.value()) : 0,
          CountryName: permanentCountryCombo ? permanentCountryCombo.text() : "",
          PostalCode: $("#txtPostalCode_PermanenetAddress").val() || "",
          CreatedDate: now,
          CreatedBy: 0,
          UpdatedDate: null,
          UpdatedBy: null
        },

        PresentAddress: {
          PresentAddressId: parseInt($("#hdnPresentAddressId").val()) || 0,
          ApplicantId: applicantId,
          SameAsPermanentAddress: $("#chkDoPermanentAddress").is(":checked"),
          Address: $("#txtPresentAddress").val() || "",
          City: $("#txtPresentCity").val() || "",
          State: $("#txtPresentState").val() || "",
          CountryId: presentCountryCombo && presentCountryCombo.value() ? parseInt(presentCountryCombo.value()) : 0,
          CountryName: presentCountryCombo ? presentCountryCombo.text() : "",
          PostalCode: $("#txtPostalCode").val() || "",
          CreatedDate: now,
          CreatedBy: 0,
          UpdatedDate: null,
          UpdatedBy: null
        }
      };
    } catch (error) {
      console.error("Error creating Applicant Address object:", error);
      return {};
    }
  },


  //createPersonalDetailsObject: function () {
  //  try {
  //    // Get ComboBox instances
  //    const genderCombo = $("#cmbGenderForCourse").data("kendoComboBox");
  //    const titleCombo = $("#cmbTitleForCourse").data("kendoComboBox");
  //    const maritalStatusCombo = $("#cmbMaritalStatusForCourse").data("kendoComboBox");
  //    const dateOfBirthPicker = $("#datePickerDateOfBirth").data("kendoDatePicker");
  //    const passportIssuePicker = $("#datepickerPassportIssueDate").data("kendoDatePicker");
  //    const passportExpiryPicker = $("#datepickerPassportExpiryDate").data("kendoDatePicker");

  //    const applicantPersonalInfo = {
  //      // Basic Information

  //      // Hidden Fields
  //      ApplicantId: $("#hdnApplicantId").val() || 0,

  //      // Gender (dataValueField: "GenderId", dataTextField: "GenderName")
  //      GenderId: genderCombo ? genderCombo.value() : "",
  //      GenderName: genderCombo ? genderCombo.text() : "",

  //      // Title (dataValueField: "TitleValue", dataTextField: "TitleText")
  //      TitleValue: titleCombo ? titleCombo.value() : "",
  //      TitleText: titleCombo ? titleCombo.text() : "",

  //      // Personal Info
  //      FirstName: $("#txtFirstName").val(),
  //      LastName: $("#txtLastName").val(),
  //      DateOfBirth: dateOfBirthPicker ? dateOfBirthPicker.value() : null,

  //      // Marital Status (dataValueField: "MaritalStatusId", dataTextField: "MaritalStatusName")
  //      MaritalStatusId: maritalStatusCombo ? maritalStatusCombo.value() : "",
  //      MaritalStatusName: maritalStatusCombo ? maritalStatusCombo.text() : "",

  //      Nationality: $("#txtNationality").val(),

  //      // Passport Information
  //      HasValidPassport: $("input[name='ValidPassport']:checked").val() || "",
  //      PassportNumber: $("#txtPassportNumberForCourse").val(),
  //      PassportIssueDate: passportIssuePicker ? passportIssuePicker.value() : null,
  //      PassportExpiryDate: passportExpiryPicker ? passportExpiryPicker.value() : null,

  //      // Contact Information
  //      PhoneCountryCode: $("#txtPhoneCountrycodeForCourse").val(),
  //      PhoneAreaCode: $("#txtPhoneAreacodeForCourse").val(),
  //      PhoneNumber: $("#txtPhoneNumberForCourse").val(),
  //      Mobile: $("#txtMobileForCourse").val(),
  //      EmailAddress: $("#txtEmailAddressForCourse").val(),
  //      SkypeId: $("#txtSkypeIDForCourse").val(),

  //      // Applicant Image
  //      ApplicantImageFile: $("#ApplicantImageFile")[0].files[0] || null,
  //      ApplicantImagePreview: $("#applicantImageThumb").attr("src") || ""
  //    };
  //    return applicantPersonalInfo;

  //  } catch (error) {
  //    //console.error("Error creating Personal Details object:", error);
  //    ToastrMessage.showError("Error creating Personal Details object:" + error, "Creating Personal Details",);
  //    VanillaApiCallManager.handleApiError(error);
  //    return {};
  //  }
  //},

  //createApplicantAddressObject: function () {
  //  try {
  //    // Get ComboBox instances
  //    const permanentCountryCombo = $("#cmbCountryForPermanentAddress").data("kendoComboBox");
  //    const presentCountryCombo = $("#cmbCountryForAddress").data("kendoComboBox");

  //    return {
  //      // Permanent Address
  //      PermanentAddress: {
  //        // Hidden Fields
  //        PermanentAddressId: $("#hdnPermanentAddressId").val(),

  //        Address: $("#txtPermanentAddress").val(),
  //        City: $("#txtPermanentCity").val(),
  //        State: $("#txtPermanentState").val(),

  //        // Country (dataValueField: "CountryId", dataTextField: "CountryName")
  //        CountryId: permanentCountryCombo ? permanentCountryCombo.value() : "",
  //        CountryName: permanentCountryCombo ? permanentCountryCombo.text() : "",

  //        PostalCode: $("#txtPostalCode_PermanenetAddress").val()
  //      },

  //      // Present Address
  //      PresentAddress: {
  //        // Hidden Fields
  //        PermanentAddressId: $("#hdnPermanentAddressId").val(),

  //        SameAsPermanentAddress: $("#chkDoPermanentAddress").is(":checked"),
  //        Address: $("#txtPresentAddress").val(),
  //        City: $("#txtPresentCity").val(),
  //        State: $("#txtPresentState").val(),

  //        // Country (dataValueField: "CountryId", dataTextField: "CountryName")
  //        CountryId: presentCountryCombo ? presentCountryCombo.value() : "",
  //        CountryName: presentCountryCombo ? presentCountryCombo.text() : "",

  //        PostalCode: $("#txtPostalCode").val()
  //      }
  //    };
  //  } catch (error) {
  //    console.error("Error creating Applicant Address object:", error);
  //    return {};
  //  }
  //},


  /* ------ Utility Methods ------ */
  exportFormDataAsJSON: function () {
    try {
      const applicationData = this.createApplicationCourseInformation();
      const jsonData = JSON.stringify(applicationData, null, 2);

      console.log("=== Course Information Form Data (JSON) ===");
      console.log(jsonData);

      // You can also display in modal or download as file
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showSuccess("Form data exported to console. Check browser console for JSON output.", "Export Successful", 3000);
      }

      return jsonData;
    } catch (error) {
      console.log("Error exporting form data as JSON:", error);
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error exporting form data: " + error.message, "Export Error", 0);
      }
      return null;
    }
  },

  validateCompleteForm: function () {
    try {
      console.log("=== Validating Course Information Form ===");

      const validationErrors = [];

      // Validate Course Details
      const courseValidation = this.validateCourseDetails();
      if (courseValidation.length > 0) {
        validationErrors.push(...courseValidation);
      }

      // Validate Personal Details
      const personalValidation = this.validatePersonalDetails();
      if (personalValidation.length > 0) {
        validationErrors.push(...personalValidation);
      }

      // Validate Address
      const addressValidation = this.validateApplicantAddress();
      if (addressValidation.length > 0) {
        validationErrors.push(...addressValidation);
      }

      if (validationErrors.length === 0) {
        console.log("Form validation passed successfully");
        if (typeof ToastrMessage !== "undefined") {
          ToastrMessage.showSuccess("Form validation passed successfully!", "Validation Success", 3000);
        }
        return true;
      } else {
        console.log("Form validation failed:", validationErrors);
        if (typeof ToastrMessage !== "undefined") {
          ToastrMessage.showError("Form validation failed. Check console for details.", "Validation Error", 0);
        }
        return false;
      }
    } catch (error) {
      console.error("Error validating form:", error);
      return false;
    }
  },

  validateCourseDetails: function () {
    const errors = [];

    const countryCombo = $("#cmbCountryForCourse").data("kendoComboBox");
    if (!countryCombo || !countryCombo.value()) {
      errors.push("Country is required");
    }

    return errors;
  },

  validatePersonalDetails: function () {
    const errors = [];

    const genderCombo = $("#cmbGenderForCourse").data("kendoComboBox");
    if (!genderCombo || !genderCombo.value()) {
      errors.push("Gender is required");
    }

    const titleCombo = $("#cmbTitleForCourse").data("kendoComboBox");
    if (!titleCombo || !titleCombo.value()) {
      errors.push("Title is required");
    }

    if (!$("#txtFirstName").val().trim()) {
      errors.push("First Name is required");
    }

    if (!$("#txtLastName").val().trim()) {
      errors.push("Last Name is required");
    }

    const dateOfBirthPicker = $("#datePickerDateOfBirth").data("kendoDatePicker");
    if (!dateOfBirthPicker || !dateOfBirthPicker.value()) {
      errors.push("Date of Birth is required");
    }

    const maritalStatusCombo = $("#cmbMaritalStatusForCourse").data("kendoComboBox");
    if (!maritalStatusCombo || !maritalStatusCombo.value()) {
      errors.push("Marital Status is required");
    }

    if (!$("#txtNationality").val().trim()) {
      errors.push("Nationality is required");
    }

    return errors;
  },

  validateApplicantAddress: function () {
    const errors = [];

    const permanentCountryCombo = $("#cmbCountryForPermanentAddress").data("kendoComboBox");
    if (!permanentCountryCombo || !permanentCountryCombo.value()) {
      errors.push("Permanent Address Country is required");
    }

    const presentCountryCombo = $("#cmbCountryForAddress").data("kendoComboBox");
    if (!presentCountryCombo || !presentCountryCombo.value()) {
      errors.push("Present Address Country is required");
    }

    return errors;
  },

  fillDemoData: function () {
    try {
      console.log("=== Filling Demo Data ===");

      // Fill Course Details Demo Data
      this.fillCourseDetailsDemo();

      // Fill Personal Details Demo Data
      this.fillPersonalDetailsDemo();

      // Fill Address Demo Data
      this.fillAddressDemo();

      console.log("Demo data filled successfully");
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showSuccess("Demo data filled successfully!", "Demo Data", 3000);
      }

    } catch (error) {
      console.error("Error filling demo data:", error);
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error filling demo data: " + error.message, "Demo Data Error", 0);
      }
    }
  },

  fillCourseDetailsDemo: function () {
    // Demo data for Course Details
    $("#txtApplicationFeeForCourse").val("500");
    $("#txtPaymentReferenceNumberCourse").val("REF123456789");
    $("#txtareaRemarks").val("Demo application for testing purposes");

    // Set payment date to today
    const paymentDatePicker = $("#datePickerPaymentDate").data("kendoDatePicker");
    if (paymentDatePicker) {
      paymentDatePicker.value(new Date());
    }
  },

  fillPersonalDetailsDemo: function () {
    // Demo data for Personal Details
    $("#txtFirstName").val("John");
    $("#txtLastName").val("Doe");
    $("#txtNationality").val("American");
    $("#txtPassportNumberForCourse").val("A12345678");
    $("#txtPhoneCountrycodeForCourse").val("+1");
    $("#txtPhoneAreacodeForCourse").val("555");
    $("#txtPhoneNumberForCourse").val("1234567");
    $("#txtMobileForCourse").val("9876543210");
    $("#txtEmailAddressForCourse").val("john.doe@example.com");
    $("#txtSkypeIDForCourse").val("john.doe.skype");

    // Set date of birth
    const dateOfBirthPicker = $("#datePickerDateOfBirth").data("kendoDatePicker");
    if (dateOfBirthPicker) {
      dateOfBirthPicker.value(new Date(1995, 5, 15)); // June 15, 1995
    }

    // Set passport dates
    const passportIssuePicker = $("#datepickerPassportIssueDate").data("kendoDatePicker");
    const passportExpiryPicker = $("#datepickerPassportExpiryDate").data("kendoDatePicker");

    if (passportIssuePicker) {
      passportIssuePicker.value(new Date(2020, 0, 1)); // Jan 1, 2020
    }

    if (passportExpiryPicker) {
      passportExpiryPicker.value(new Date(2030, 0, 1)); // Jan 1, 2030
    }

    // Set passport radio button
    $("#radioIsPassportYes").prop("checked", true).trigger("change");
  },

  fillAddressDemo: function () {
    // Demo data for Permanent Address
    $("#txtPermanentAddress").val("123 Main Street, Apartment 4B");
    $("#txtPermanentCity").val("New York");
    $("#txtPermanentState").val("NY");
    $("#txtPostalCode_PermanenetAddress").val("10001");

    // Demo data for Present Address
    $("#txtPresentAddress").val("456 Oak Avenue, Suite 2A");
    $("#txtPresentCity").val("Boston");
    $("#txtPresentState").val("MA");
    $("#txtPostalCode").val("02101");
  }


}

