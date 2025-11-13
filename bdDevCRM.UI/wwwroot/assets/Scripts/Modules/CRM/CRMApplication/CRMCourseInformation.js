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
var applicantImageFile = null;


// Global Cache Object
var CRMCourseInfoDataCache = {
  countries: null,
  currencies: null,
  genders: null,
  titles: null,
  maritalStatuses: null,
  intakeMonths: null,
  intakeYears: null,
  paymentMethods: null,
  lastUpdated: {},

  // Cache expiry time (5 minutes)
  cacheExpiry: 5 * 60 * 1000,

  // Check if cache is valid
  isCacheValid: function (key) {
    if (!this.lastUpdated[key]) return false;
    return (Date.now() - this.lastUpdated[key]) < this.cacheExpiry;
  },

  // Set cache data
  setCache: function (key, data) {
    this[key] = data;
    this.lastUpdated[key] = Date.now();
  },

  // Get cache data
  getCache: function (key) {
    if (this.isCacheValid(key)) {
      return this[key];
    }
    return null;
  },

  // Clear specific cache
  clearCache: function (key) {
    this[key] = null;
    delete this.lastUpdated[key];
  },

  // Clear all cache
  clearAllCache: function () {
    Object.keys(this).forEach(key => {
      if (key !== 'cacheExpiry' && typeof this[key] !== 'function') {
        this[key] = null;
      }
    });
    this.lastUpdated = {};
  }
};


/* =========================================================
   CRMCourseInformationManager : API Calls Management
=========================================================*/
var CRMCourseInformationManager = {

  //fetchCountryComboBoxData: async function () {
  //  const serviceUrl = "/countryddl";

  //  try {
  //    const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
  //    if (response && response.IsSuccess === true) {
  //      return Promise.resolve(response.Data);
  //    } else {
  //      throw new Error("Failed to load country data");
  //    }
  //  } catch (error) {
  //    console.error("Error loading country data:", error);
  //    VanillaApiCallManager.handleApiError(error);
  //    return Promise.reject(error);
  //  }
  //},

  //fetchInstituteComboBoxDataByCountryId: async function (countryId) {
  //  if (!countryId) {
  //    return Promise.resolve([]);
  //  }
  //  const serviceUrl = `/crm-institut-by-countryid-ddl/${countryId}`;
  //  try {
  //    const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
  //    if (response && response.IsSuccess === true) {
  //      return Promise.resolve(response.Data);
  //    } else {
  //      throw new Error("Failed to load institute data");
  //    }
  //  } catch (error) {
  //    console.error("Error loading institute data:", error);
  //    VanillaApiCallManager.handleApiError(error);
  //    return Promise.reject(error);
  //  }
  //},

  //  API call

  fetchCountryComboBoxData: async function (forceRefresh = false) {
    const cacheKey = 'countries';

    // Check cache first
    if (!forceRefresh) {
      const cachedData = CRMCourseInfoDataCache.getCache(cacheKey);
      if (cachedData) {
        console.log('Using cached country data');
        return Promise.resolve(cachedData);
      }
    }

    // Fetch from API
    const serviceUrl = "/countryddl";
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        // Cache the data
        CRMCourseInfoDataCache.setCache(cacheKey, response.Data);
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

  // Dependent data - cache with dependency key
  fetchInstituteComboBoxDataByCountryId: async function (countryId, forceRefresh = false) {
    if (!countryId) return Promise.resolve([]);

    const cacheKey = `institutes_${countryId}`;

    // Check cache first
    if (!forceRefresh) {
      const cachedData = CRMCourseInfoDataCache.getCache(cacheKey);
      if (cachedData) {
        console.log(`Using cached institute data for country ${countryId}`);
        return Promise.resolve(cachedData);
      }
    }

    // Fetch from API
    const serviceUrl = `/crm-institut-by-countryid-ddl/${countryId}`;
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        // Cache the data
        CRMCourseInfoDataCache.setCache(cacheKey, response.Data);
        console.log(`Institute data for country ${countryId} fetched and cached`);
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

  fetchCourseByInstituteIdData: async function (instituteId, forceRefresh = false) {
    if (!instituteId) return Promise.resolve([]);
    const cacheKey = `courses_${instituteId}`;

    // Check cache first
    if (!forceRefresh) {
      const cachedData = CRMCourseInfoDataCache.getCache(cacheKey);
      if (cachedData) {
        console.log(`Using cached course data for institute ${instituteId}`);
        return Promise.resolve(cachedData);
      }
    }



    const serviceUrl = `/crm-course-by-instituteid-ddl/${instituteId}`;
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        console.log(response);
        // Cache the data
        CRMCourseInfoDataCache.setCache(cacheKey, response.Data);
        console.log(`Course data for institute ${instituteId} fetched and cached`);

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

  fetchCurrencyComboBoxData: async function (forceRefresh = false) {
    const cacheKey = 'currencies';

    // Check cache first
    if (!forceRefresh) {
      const cachedData = CRMCourseInfoDataCache.getCache(cacheKey);
      if (cachedData) {
        console.log('Using cached currency data');
        return Promise.resolve(cachedData);
      }
    }

    // Fetch from API
    const serviceUrl = "/currencyddl";
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        // Cache the data
        CRMCourseInfoDataCache.setCache(cacheKey, response.Data);
        console.log('Currency data fetched and cached');
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

  // Static data - no need for API calls
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

  getMaritalStatusData: function () {
    return [
      { MaritalStatusId: "1", MaritalStatusName: "Married" },
      { MaritalStatusId: "2", MaritalStatusName: "Unmarried" },
      { MaritalStatusId: "3", MaritalStatusName: "Divorced" },
    ]
  },

  getGenderData: function () {
    const cacheKey = 'genders';
    let cachedData = CRMCourseInfoDataCache.getCache(cacheKey);

    if (!cachedData) {
      cachedData = [
        { GenderId: 1, GenderName: "Male" },
        { GenderId: 2, GenderName: "Female" },
        { GenderId: 3, GenderName: "Others" }
      ];
      CRMCourseInfoDataCache.setCache(cacheKey, cachedData);
    }

    return cachedData;
  },

  getTitleData: function () {
    const cacheKey = 'titles';
    let cachedData = CRMCourseInfoDataCache.getCache(cacheKey);

    if (!cachedData) {
      cachedData = [
        { TitleValue: "Mr", TitleText: "Mr" },
        { TitleValue: "Mrs", TitleText: "Mrs" },
        { TitleValue: "Miss", TitleText: "Miss" },
        { TitleValue: "Ms", TitleText: "Ms" },
      ];
      CRMCourseInfoDataCache.setCache(cacheKey, cachedData);
    }

    return cachedData;
  },

};

/* =========================================================
   CRMCourseInformationHelper : UI Management and Form Handling
=========================================================*/
var CRMCourseInformationHelper = {

  intCourse: async function () {
    debugger;
    //// Kendo window
    //CommonManager.initializeKendoWindow("#CountryPopUp", "Country Details", "80%");
    //CommonManager.initializeKendoWindow("#course_InstitutePopUp", "Institute Details", "80%");
    //CommonManager.initializeKendoWindow("#course_CoursePopUp", "Course Details", "80%");
    //CommonManager.initializeKendoWindow("#CurrencyPopUp_Course", "Currency Details", "80%");

    //// Initialized date field
    //CRMCourseInformationHelper.initializePaymentDate();
    //CRMCourseInformationHelper.initializeDateOfBirth();
    //CRMCourseInformationHelper.initializePassportIssueDate();
    //CRMCourseInformationHelper.initializePassportExpiryDate();

    // Start: Initialize kendo static field

    this.initializePaymentDate();
    this.initializeDateOfBirth();
    this.initializePassportIssueDate();
    this.initializePassportExpiryDate();
    // Applicant image preview
    this.initApplicantImagePreview();
    // End : Initialize kendo static field

    // ComboBoxes 
    this.initializeStaticComboBoxes();
    await this.initializeDynamicComboBoxes();


    this.bindEvents();
  },

  // Start: Initialize kendo static field
  initializePaymentDate: function () {
    $("#datePickerPaymentDate").kendoDatePicker({
      format: "dd-MMM-yyyy",
      parseFormats: "yyyy-MM-dd",
      value: new Date(),
      placeholder: "Select Payment Date"
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
  // End : Initialize kendo static field


  // Start: Initialize image
  /* ------ NEW: Dedicated Image Preview Function ------ */
  initApplicantImagePreview: function () {
    $("#ApplicantImageFile").on("change", function () {
      const file = this.files[0];
      // Clear previous image file
      applicantImageFile = null;

      if (!file) {
        $("#applicantImageThumb").addClass("d-none").attr("src", "#");
        return;
      }

      // ============ NEW: Apply 2MB Validation ============
      const validationResult = FileValidationManager.validateImageFile(file, {
        maxSizeInMB: 2, // 2MB limit as per API requirement
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        showToast: true
      });

      if (!validationResult.isValid) {
        console.log("Image validation failed:", validationResult.errorMessage);
        // Clear the file input
        this.value = '';
        $("#applicantImageThumb").addClass("d-none").attr("src", "#");
        return;
      }

      // ============ Validation passed, proceed with preview ============
      if (file.type.startsWith("image/")) {
        applicantImageFile = file;

        const reader = new FileReader();
        reader.onload = e => {
          $("#applicantImageThumb")
            .attr("src", e.target.result)
            .removeClass("d-none")
            .css({
              "height": "100px",
              "width": "auto",
              "object-fit": "contain",
              "cursor": "pointer",
              "border": "1px solid #ddd",
              "border-radius": "4px"
            })
            // ============ ADD CLICK EVENT FOR POPUP PREVIEW ============
            .off("click")
            .on("click", function () {
              const imageSrc = $(this).attr("src");
              if (imageSrc && imageSrc !== "#") {
                if (typeof PreviewManger !== 'undefined' && PreviewManger.openGridImagePreview) {
                  PreviewManger.openGridImagePreview(imageSrc);
                } else {
                  // Fallback: open in new window
                  window.open(imageSrc, '_blank');
                }
              }
            });
        };

        reader.onerror = function () {
          console.error("Error reading image file");
          $("#applicantImageThumb").addClass("d-none").attr("src", "#");
          if (typeof ToastrMessage !== "undefined") {
            ToastrMessage.showError("Error reading image file", "File Read Error", 3000);
          }
        };

        reader.readAsDataURL(file);

        // ============ Show success message with file info ============
        if (typeof ToastrMessage !== "undefined") {
          ToastrMessage.showSuccess(
            `Image uploaded successfully!<br>
            File: ${validationResult.fileInfo.name}<br>
            Size: ${validationResult.fileInfo.sizeInMB} MB`,
            "Upload Success",
            3000
          );
        }
      } else {
        $("#applicantImageThumb").addClass("d-none").attr("src", "#");
        if (typeof ToastrMessage !== "undefined") {
          ToastrMessage.showError("Please select a valid image file", "Invalid File Type", 3000);
        }
        this.value = '';
      }
    });
  },

  openApplicantImagePreview: function () {
    const imageSrc = $("#applicantImageThumb").attr("src");
    if (imageSrc && imageSrc !== "#" && !$("#applicantImageThumb").hasClass("d-none")) {
      if (typeof PreviewManger !== 'undefined' && PreviewManger.openGridImagePreview) {
        PreviewManger.openGridImagePreview(imageSrc);
      } else {
        // Fallback: open in new window
        window.open(imageSrc, '_blank');
      }
    } else {
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showInfo("No image to preview", "No Image", 2000);
      }
    }
  },
  // End : Initialize image


  // Start: Initialize all static combo boxes at page load
  initializeStaticComboBoxes: function () {
    // Load all static data once
/*    const promises = [*/
      this.generateGenderCombo(),
      this.generateTitleCombo(),
      this.generateMeritalStatusCombo(),
      this.generateIntakeMonthCombo(),
      this.generateIntakeYearCombo(),
      this.generatePaymentMethodCombo()
    //];

    //await Promise.all(promises);
    //console.log("Static combo boxes initialized");
  },

  generateGenderCombo: function () {
    $("#cmbGenderForCourse").kendoComboBox({
      placeholder: "Select Gender...",
      dataTextField: "GenderName",
      dataValueField: "GenderId",
      dataSource: CRMCourseInformationManager.getGenderData(),
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
  // End: Initialize all static combo boxes at page load


  // Start: Initialize dynamic combo boxes with cached data
  initializeDynamicComboBoxes: async function () {
    console.log("Initializing dynamic combo boxes...");

    // Load commonly used data
    const promises = [
      this.generateCountryCombo(),
      this.generateInstituteCombo(),
      this.generateCourseCombo(),

      this.generateCurrencyCombo(),
      this.generateCountryForPermanentAddressCombo(),
      this.generateCountryForPresentAddressCombo()
    ];

    await Promise.all(promises);
    console.log("Dynamic combo boxes initialized");
  },

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
      CRMCourseInformationManager.fetchCountryComboBoxData()
        .then(data => {
          countryComboBoxInstant.dataSource.data(data || []);
        })
        .catch(error => {
          console.error("Error loading country data:", error);
          countryComboBoxInstant.dataSource.data([]);
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
      change: function (e) {
        const courseCombo = this;
        const selectedItem = courseCombo.dataItem();
        console.log("Selected course:", selectedItem);

        // populate application fee
        if (selectedItem && selectedItem.ApplicationFee) {
          $("#txtApplicationFeeForCourse").val(selectedItem.ApplicationFee);
        } else {
          $("#txtApplicationFeeForCourse").val("");
        }

        // populate currency value
        const currencyCombo = $("#cmbCurrencyForCourse").data("kendoComboBox");
        if (currencyCombo) {
          if (selectedItem && selectedItem.CurrencyId) {
            currencyCombo.value(selectedItem.CurrencyId);
          } else {
            currencyCombo.value(""); // clear if no value
          }
        }
      }
    });
  },

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
  // End: Initialize dynamic combo boxes with cached data

  // Start: Initialize toggle chagne event
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
  },
  /* ------ Passport Toggle Methods ------ */
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
        issuePicker.enable(false); 
      }

      if (expiryPicker) {
        expiryPicker.value(null);
        expiryPicker.enable(false);
        expiryPicker.min(new Date(1900, 0, 1));
      }

      // Remove required stars
      toggleStar(lblPassportNumber, false);
      toggleStar(lblIssueDate, false);
      toggleStar(lblExpiryDate, false);
    }
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
        const permanentCountryValue = permanentCountryCombo.value();
        if (permanentCountryValue) {
          presentCountryCombo.value(permanentCountryValue);
          console.log("Copied country from permanent to present:", permanentCountryValue);
        }
      }

      // Disable present address fields
      $("#txtPresentAddress, #txtPresentCity, #txtPresentState, #txtPostalCode").prop("disabled", true);

      const presentCountryCombo2 = $("#cmbCountryForAddress").data("kendoComboBox");
      if (presentCountryCombo2) {
        presentCountryCombo2.enable(false);
        console.log("Present Country ComboBox disabled");
      } else {
        $("#cmbCountryForAddress").prop("disabled", true);
      }
    } else {
      // Enable present address fields
      $("#txtPresentAddress, #txtPresentCity, #txtPresentState, #txtPostalCode").prop("disabled", false);

      const presentCountryCombo = $("#cmbCountryForAddress").data("kendoComboBox");
      if (presentCountryCombo) {
        presentCountryCombo.enable(true);
      } else {
        $("#cmbCountryForAddress").prop("disabled", false);
      }
    }
  },
  // End: Initialize toggle chagne event

  /* ------ PopUp UI Methods (InstituteDetails.js pattern ????????) ------ */
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
  generateCountryForPermanentAddressPopUp: function () {
    console.log("Opening country popup for permanent address...");
    this.generateCountryPopUp();
  },
  generateCountryForAddressPopUp: function () {
    console.log("Opening country popup for present address...");
    this.generateCountryPopUp();
  },
  /* ------ ComboBox Generation Methods (InstituteDetails.js pattern ????????) ------ */


  //// Create first tab object.
  clearCRMApplicationCourse: function () {
    try {
      // Form Fields Clear - Basic form elements and kendo widgets
      CommonManager.clearFormFields("crmApplicationCourseInfo");
      // Clear Applicant Picture containers
      $("#applicantImageThumb").empty();
      // Grid Data Clear - Remove all grid records
      // this.clearAllGrids();
      $("#btnSaveOrUpdate").text("+ Add Item");
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
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
      //console.log(applicationCourseInformation);
      //console.log("Application Course Information object created:", applicationCourseInformation);
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

      //const applicantCourseDetails = {
      var applicantCourseDetails = new Object();
      applicantCourseDetails.ApplicantCourseId = parseInt($("#hdnApplicantCourseId").val()) || 0;
      applicantCourseDetails.ApplicantId = parseInt($("#hdnApplicantId").val()) || 0;

      applicantCourseDetails.CountryId = countryCombo && countryCombo.value() ? parseInt(countryCombo.value()) : 0;
      applicantCourseDetails.CountryName = countryCombo ? countryCombo.text() : "";


      applicantCourseDetails.InstituteId = instituteCombo && instituteCombo.value() ? parseInt(instituteCombo.value()) : 0;
      applicantCourseDetails.InstituteName = instituteCombo ? instituteCombo.text() : "";

      applicantCourseDetails.CourseId = courseCombo && courseCombo.value() ? parseInt(courseCombo.value()) : 0;
      applicantCourseDetails.CourseTitle = courseCombo ? courseCombo.text() : "";

      applicantCourseDetails.IntakeMonthId = intakeMonthCombo && intakeMonthCombo.value() ? parseInt(intakeMonthCombo.value()) : 0;
      applicantCourseDetails.IntakeMonth = intakeMonthCombo ? intakeMonthCombo.text() : "";

      applicantCourseDetails.IntakeYearId = intakeYearCombo && intakeYearCombo.value() ? parseInt(intakeYearCombo.value()) : 0;
      applicantCourseDetails.IntakeYear = intakeYearCombo ? intakeYearCombo.text() : "";

      applicantCourseDetails.ApplicationFee = $("#txtApplicationFeeForCourse").val() || "0"; // string in DTO

      applicantCourseDetails.CurrencyId = currencyCombo && currencyCombo.value() ? parseInt(currencyCombo.value()) : 0;
      applicantCourseDetails.CurrencyName = currencyCombo ? currencyCombo.text() : "";

      applicantCourseDetails.PaymentMethodId = paymentMethodCombo && paymentMethodCombo.value() ? parseInt(paymentMethodCombo.value()) : 0;
      applicantCourseDetails.PaymentMethod = paymentMethodCombo ? paymentMethodCombo.text() : "";

      applicantCourseDetails.PaymentReferenceNumber = $("#txtPaymentReferenceNumberCourse").val() || "";
      applicantCourseDetails.PaymentDate = paymentDatePicker ? paymentDatePicker.value() : null;

      applicantCourseDetails.Remarks = $("#txtareaRemarks").val() || "";

      applicantCourseDetails.CreatedDate = new Date().toISOString();
      applicantCourseDetails.CreatedBy = 0;
      applicantCourseDetails.UpdatedDate = null;
      applicantCourseDetails.UpdatedBy = null;
      //};

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

      // ============ NEW: Validate applicant image before creating object ============
      let validatedImageFile = null;
      if (applicantImageFile) {
        const imageValidation = FileValidationManager.validateImageFile(applicantImageFile, {
          maxSizeInMB: 2,
          showToast: false // Don't show toast here as it's already validated
        });

        if (imageValidation.isValid) {
          validatedImageFile = applicantImageFile;
        } else {
          console.error("Image validation failed during object creation:", imageValidation.errorMessage);
          // Optionally show error or handle as needed
          validatedImageFile = null;
        }
      }

      //const personalDetails = {
      var personalDetails = new Object();
      personalDetails.ApplicantId = parseInt($("#hdnApplicantId").val()) || 0;
      personalDetails.ApplicationId = parseInt($("#hdnApplicationId").val()) || 0;
      /*      personalDetails.ApplicationId = 0;*/

      // Gender Info
      personalDetails.GenderId = genderCombo && genderCombo.value() ? parseInt(genderCombo.value()) : 0;
      personalDetails.GenderName = genderCombo ? genderCombo.text() : "";

      // Personal Info
      personalDetails.TitleValue = titleCombo ? titleCombo.value() : "";
      personalDetails.TitleText = titleCombo ? titleCombo.text() : "";
      personalDetails.FirstName = $("#txtFirstName").val() || "";
      personalDetails.LastName = $("#txtLastName").val() || "";
      personalDetails.DateOfBirth = dateOfBirthPicker ? dateOfBirthPicker.value() : null;

      // Marital Status
      personalDetails.MaritalStatusId = maritalStatusCombo && maritalStatusCombo.value() ? parseInt(maritalStatusCombo.value()) : 0;
      personalDetails.MaritalStatusName = maritalStatusCombo ? maritalStatusCombo.text() : "";

      // Passport Information
      personalDetails.Nationality = $("#txtNationality").val() || "";
      personalDetails.HasValidPassport = $("input[name='ValidPassport']:checked").val() || "";
      personalDetails.PassportNumber = $("#txtPassportNumberForCourse").val() || "";
      personalDetails.PassportIssueDate = passportIssueDate;
      personalDetails.PassportExpiryDate = passportExpiryDate;

      // Contact Information
      personalDetails.PhoneCountryCode = $("#txtPhoneCountrycodeForCourse").val() || "";
      personalDetails.PhoneAreaCode = $("#txtPhoneAreacodeForCourse").val() || "";
      personalDetails.PhoneNumber = $("#txtPhoneNumberForCourse").val() || "";
      personalDetails.Mobile = $("#txtMobileForCourse").val() || "";
      personalDetails.EmailAddress = $("#txtEmailAddressForCourse").val() || "";
      personalDetails.SkypeId = $("#txtSkypeIDForCourse").val() || "";

      // ============ NEW: Validated Applicant Image ============
      personalDetails.ApplicantImageFile = validatedImageFile;
      personalDetails.ApplicantImagePath = ""; // Will be set in backend after file upload
      personalDetails.ApplicantImagePreview = $("#applicantImageThumb").attr("src") || "";
      //};

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
  },


  /* ----------------- Populate information ----------------------- */
  populateCourseInformation: function (applicationData) {
    try {
      console.log("=== Populating Course Information ===");
      // Populate Course Details
      this.populateApplicantCourse(applicationData);
      // Populate Personal Details
      this.populatePersonalDetails(applicationData);
      // Populate Address Information
      this.populateApplicantAddress(applicationData);

      ////// Populate Course Details
      ////if (applicationData.CourseInformation && applicationData.CourseInformation.ApplicantCourse) {
      ////  this.populateApplicantCourse(applicationData.CourseInformation.ApplicantCourse);
      ////}

      ////// Populate Personal Details
      ////if (applicationData.PersonalDetails) {
      ////  this.populatePersonalDetails(applicationData.PersonalDetails);
      ////}

      ////// Populate Address Information
      ////if (applicationData.CourseInformation && applicationData.CourseInformation.ApplicantAddress) {
      ////  this.populateApplicantAddress(applicationData.CourseInformation.ApplicantAddress);
      ////}

      console.log("Course Information populated successfully");
    } catch (error) {
      console.error("Error populating Course Information:", error);
    }
  },

  /* -------- Populate Applicant Course Details -------- */
  populateApplicantCourse: async function (courseData) {
    try {
      if (!courseData) return;
      const src = courseData.ApplicantCourse ? courseData.ApplicantCourse : courseData;

      // Hidden fields
      $("#hdnApplicantCourseId").val(src.ApplicantCourseId || 0);

      // Use cached data for population
      await this.populateCourseInfoWithCache(src);

      // Populate other fields
      this.populateApplicantOtherFormFields(src);
    } catch (error) {
      console.error("Error in smart population:", error);
    }
  },
  populateCourseInfoWithCache: async function (src) {
    // 1. Country (clear, initialize from cache, then set value)
    if (src.CountryId) {
      const countryCombo = $("#cmbCountryForCourse").data("kendoComboBox");
      if (countryCombo) {
        // Clear existing data source
        countryCombo.dataSource.data([]);
        // Initialize from cache
        const cachedCountries = await CRMCourseInformationManager.fetchCountryComboBoxData();
        countryCombo.dataSource.data(cachedCountries || []);
        // Set value from src
        countryCombo.value(src.CountryId);
      }
    }

    // 2. Institute (load if needed)
    if (src.CountryId && src.InstituteId) {
      const instituteCombo = $("#cmbInstituteForCourse").data("kendoComboBox");
      if (instituteCombo) {
        // Load institute data (cached)
        instituteCombo.dataSource.data([]);
        const institutes = await CRMCourseInformationManager.fetchInstituteComboBoxDataByCountryId(src.CountryId);
        instituteCombo.dataSource.data(institutes || []);
        instituteCombo.value(src.InstituteId);
        console.log(`Institute set: ${src.InstituteId}`);
      }
    }

    // 3. Course (load if needed)
    if (src.InstituteId && src.CourseId) {
      const courseCombo = $("#cmbCourseForCourse").data("kendoComboBox");
      if (courseCombo) {
        // Load course data (cached)
        courseCombo.dataSource.data([]);
        const courses = await CRMCourseInformationManager.fetchCourseByInstituteIdData(src.InstituteId);
        courseCombo.dataSource.data(courses || []);
        courseCombo.value(src.CourseId);;
      }
    }

    // 4. Currency (use cache)
    if (src.CurrencyId) {
      const currencyCombo = $("#cmbCurrencyForCourse").data("kendoComboBox");
      if (currencyCombo) {
        // Load course data (cached)
        currencyCombo.dataSource.data([]);
        const currencies = await CRMCourseInformationManager.fetchCurrencyComboBoxData();
        currencyCombo.dataSource.data(currencies || []);
        currencyCombo.value(src.CurrencyId);;
      }
    }

    // **. Static combo boxes (already cached)
    if (src.IntakeMonthId) {
      const intakeMonthCombo = $("#cmbIntakeMonthForCourse").data("kendoComboBox");
      if (intakeMonthCombo) {
        intakeMonthCombo.dataSource.data([]);
        const intakeMonths = await CRMCourseInformationManager.getIntakeMonthData();
        intakeMonthCombo.dataSource.data(intakeMonths || []);
        intakeMonthCombo.value(src.IntakeMonthId);;
      }
    }

    if (src.IntakeYearId) {
      const intakeYearCombo = $("#cmbIntakeYearForCourse").data("kendoComboBox");
      if (intakeYearCombo) {
        intakeYearCombo.dataSource.data([]);
        const intakeYears = await CRMCourseInformationManager.getIntakeYearData();
        intakeYearCombo.dataSource.data(intakeYears || []);
        intakeYearCombo.value(src.IntakeYearId);;
      }
    }

    if (src.PaymentMethodId) {
      const paymentMethodCombo = $("#cmbPaymentMethodForCourse").data("kendoComboBox");
      if (paymentMethodCombo) {
        paymentMethodCombo.dataSource.data([]);
        const paymentMethods = await CRMCourseInformationManager.getPaymentMethodData();
        paymentMethodCombo.dataSource.data(paymentMethods || []);
        paymentMethodCombo.value(src.PaymentMethodId);;
      }
    }
  },

  populateApplicantOtherFormFields: function (src) {
    // Application Fee
    $("#txtApplicationFeeForCourse").val(src.ApplicationFee || "");
    // Payment Reference Number
    $("#txtPaymentReferenceNumberCourse").val(src.PaymentReferenceNumber || "");
    // Payment Date
    const paymentDatePicker = $("#datePickerPaymentDate").data("kendoDatePicker");
    if (paymentDatePicker) {
      paymentDatePicker.value(src.PaymentDate);
    }
    else {
      //this.initializePaymentDate();
      const paymentDatePicker = $("#datePickerPaymentDate").data("kendoDatePicker");
      paymentDatePicker.value(kendo.parseDate(src.PaymentDate, ["dd-MMM-yyyy", "yyyy-MM-dd"]));
    };

    //// Payment Date (use Kendo DatePicker)
    //const paymentPicker = $("#datePickerPaymentDate").data("kendoDatePicker");
    //if (paymentPicker) {
    //  let dateVal = null;
    //  if (src.PaymentDate) {
    //    dateVal = src.PaymentDate instanceof Date
    //      ? src.PaymentDate
    //      : kendo.parseDate(
    //        src.PaymentDate,
    //        ["dd-MMM-yyyy", "yyyy-MM-dd", "yyyy-MM-ddTHH:mm:ss", "yyyy-MM-ddTHH:mm:ssZ"]
    //      );
    //  }

    // Remarks
    $("#txtareaRemarks").val(src.CourseRemarks || "");

  },


  /* -------- Populate Personal Details -------- */
  populatePersonalDetails: async function (personalData) {
    try {
      if (!personalData) return;
      const src = personalData.PersonalDetails ? personalData.PersonalDetails : personalData;
      //// Set hidden fields
      //$("#hdnApplicantId").val(src.ApplicantId || 0);

      // Populate Gender
      if (src.GenderId) {
        const genderCombo = $("#cmbGenderForCourse").data("kendoComboBox");

        if (genderCombo) {
          // Clear existing data source
          genderCombo.dataSource.data([]);
          // Initialize from cache
          const genders = await CRMCourseInformationManager.getGenderData();
          genderCombo.dataSource.data(genders || []);
          // Set value from src
          genderCombo.value(src.GenderId);
        }
      }

      // Populate Title
      if (src.TitleValue) {
        const titleCombo = $("#cmbTitleForCourse").data("kendoComboBox");
        if (titleCombo) {
          // Clear existing data source
          titleCombo.dataSource.data([]);
          // Initialize from cache
          const titles = await CRMCourseInformationManager.getTitleData();
          titleCombo.dataSource.data(titles || []);
          // Set value from src
          titleCombo.value(src.TitleValue);
        }
      }

      // Populate Name Fields
      $("#txtFirstName").val(src.FirstName || "");
      $("#txtLastName").val(src.LastName || "");

      // Populate Date of Birth
      if (src.DateOfBirth) {
        const dobPicker = $("#datePickerDateOfBirth").data("kendoDatePicker");
        if (dobPicker) {
          dobPicker.value(new Date(src.DateOfBirth));
        }
        else {
          CRMCourseInformationHelper.initializeDateOfBirth();
          dobPicker = $("#datePickerDateOfBirth").data("kendoDatePicker");
          dobPicker.value(new Date(src.DateOfBirth));
        }
      }

      // Populate Marital Status
      if (src.MaritalStatusId) {
        const maritalStatusCombo = $("#cmbMaritalStatusForCourse").data("kendoComboBox");
        if (maritalStatusCombo) {
          maritalStatusCombo.value(src.MaritalStatusId);
          if (maritalStatusCombo) {
            // Clear existing data source
            maritalStatusCombo.dataSource.data([]);
            // Initialize from cache
            const maritalStatuses = await CRMCourseInformationManager.getMaritalStatusData();
            maritalStatusCombo.dataSource.data(maritalStatuses || []);
            // Set value from src
            maritalStatusCombo.value(src.MaritalStatusId);
          }
        }
        else {
          CRMCourseInformationHelper.generateMeritalStatusCombo();
          maritalStatusCombo = $("#cmbMaritalStatusForCourse").data("kendoComboBox");
          maritalStatusCombo.value(src.MaritalStatusId);
        }
      }

      // Populate Nationality
      $("#txtNationality").val(src.Nationality || "");

      // Populate Passport Information
      if (src.HasValidPassport !== null && src.HasValidPassport !== undefined) {
        if (src.HasValidPassport == true || src.HasValidPassport == "true") {
          $("#radioIsPassportYes").prop("checked", true);
        } else {
          $("#radioIsPassportNo").prop("checked", true);
        }
        // Trigger change event to enable/disable passport fields
        $("input[name='ValidPassport']:checked").trigger("change");
      }

      $("#txtPassportNumberForCourse").val(src.PassportNumber || "");

      // Populate Passport Issue Date - JSON এ PassportIssueDate field আছে (PssportIssueDate নয়)
      if (src.PassportIssueDate) {
        const passportIssuePicker = $("#datepickerPassportIssueDate").data("kendoDatePicker");
        if (passportIssuePicker) {
          passportIssuePicker.value(new Date(src.PassportIssueDate));
        }
        else {
          CRMCourseInformationHelper.initializePassportIssueDate();
          passportIssuePicker = $("#datepickerPassportIssueDate").data("kendoDatePicker");
          passportIssuePicker.value(new Date(src.PassportIssueDate));
        }
      }

      // Populate Passport Expiry Date
      if (src.PassportExpiryDate) {
        const passportExpiryPicker = $("#datepickerPassportExpiryDate").data("kendoDatePicker");
        if (passportExpiryPicker) {
          passportExpiryPicker.value(new Date(src.PassportExpiryDate));
        }
        else {
          CRMCourseInformationHelper.initializePassportExpiryDate();
          passportExpiryPicker = $("#datepickerPassportExpiryDate").data("kendoDatePicker");
          passportExpiryPicker.value(new Date(src.PassportExpiryDate));
        }
      }

      // Populate Contact Information
      $("#txtPhoneCountrycodeForCourse").val(src.PhoneCountryCode || "");
      $("#txtPhoneAreacodeForCourse").val(src.PhoneAreaCode || "");
      $("#txtPhoneNumberForCourse").val(src.PhoneNumber || "");
      $("#txtMobileForCourse").val(src.Mobile || "");
      $("#txtEmailAddressForCourse").val(src.EmailAddress || "");
      $("#txtSkypeIDForCourse").val(src.SkypeId || "");

      // Populate Applicant Image
      if (src.ApplicantImagePath) {
        const imageUrl = `${baseApiFilePath}${src.ApplicantImagePath}`;
        $("#applicantImageThumb").attr("src", imageUrl).removeClass("d-none");
      }

      console.log("Personal Details populated");
    } catch (error) {
      console.error("Error populating Personal Details:", error);
    }
  },

  /* -------- Populate Applicant Address -------- */
  populateApplicantAddress: function (addressData) {
    try {
      if (!addressData) return;

      // Populate Permanent Address
      if (addressData) {
        this.populatePermanentAddress(addressData);
      }

      // Populate Present Address
      if (addressData) {
        this.populatePresentAddress(addressData);
      }

      console.log("Applicant Address populated");
    } catch (error) {
      console.error("Error populating Applicant Address:", error);
    }
  },

  /* -------- Populate Permanent Address -------- */
  populatePermanentAddress: async function (permanentData) {
    try {
      if (!permanentData) return;
      //const src = permanentData.PermanentAddress ? permanentData.PermanentAddress : permanentData;
      const src = permanentData;
      // Set hidden fields
      $("#hdnPermanentAddressId").val(src.PermanentAddressId || 0);

      $("#txtPermanentAddress").val(src.PermanentAddress || "");
      $("#txtPermanentCity").val(src.PermanentCity || "");
      $("#txtPermanentState").val(src.PermanentState || "");

      if (src.PermanentCountryId) {
        const permanentCountryCombo = $("#cmbCountryForPermanentAddress").data("kendoComboBox");
        if (permanentCountryCombo) {
          permanentCountryCombo.value(src.PermanentCountryId);
            // Load course data (cached)
          permanentCountryCombo.dataSource.data([]);
          const permanentCountries = await CRMCourseInformationManager.fetchCountryComboBoxData();
          permanentCountryCombo.dataSource.data(permanentCountries || []);
          permanentCountryCombo.value(src.PermanentCountryId);;
        }
        else {
          CRMCourseInformationHelper.generateCountryForPermanentAddressCombo();
          permanentCountryCombo = $("#cmbCountryForPermanentAddress").data("kendoComboBox");
          permanentCountryCombo.value(src.PermanentCountryId);
        }
      }

      $("#txtPostalCode_PermanenetAddress").val(src.PermanentPostalCode || "");
    } catch (error) {
      console.error("Error populating Permanent Address:", error);
    }
  },

  /* -------- Populate Present Address -------- */
  populatePresentAddress: async function (presentData) {
    try {
      if (!presentData) return;
      //const src = presentData.presen ? presentData.PresentAddress : presentData;
      const src = presentData;
      // Set hidden fields
      $("#hdnPresentAddressId").val(src.PresentAddressId || 0);

      //Check if same as permanent address
      if (src.SameAsPermanentAddress) {
        $("#chkDoPermanentAddress").prop("checked", true).trigger("change");
      } else {
        $("#txtPresentAddress").val(src.PresentAddress || "");
        $("#txtPresentCity").val(src.PresentCity || "");
        $("#txtPresentState").val(src.PresentState || "");

        if (src.PresentCountryId) {
          const presentCountryCombo = $("#cmbCountryForAddress").data("kendoComboBox");
          if (presentCountryCombo) {
            // Load course data (cached)
            presentCountryCombo.dataSource.data([]);
            const presentCountries = await CRMCourseInformationManager.fetchCountryComboBoxData();
            presentCountryCombo.dataSource.data(presentCountries || []);
            presentCountryCombo.value(src.PresentAddressId);
          }
          else {
            CRMCourseInformationHelper.generateCountryForPresentAddressCombo();
            presentCountryCombo = $("#cmbCountryForAddress").data("kendoComboBox");
            presentCountryCombo.value(src.PresentCountryId);
          }
        }

      }
      $("#txtPostalCode").val(src.PresentPostalCode || "");

      console.log("Present Address populated");
    } catch (error) {
      console.error("Error populating Present Address:", error);
    }
  },



  // Smart populate with cache
};

// Add cache management functions
var CacheManager = {

  // Refresh specific cache when data changes
  refreshCacheOnDataChange: function (entityType, countryId = null) {
    switch (entityType) {
      case 'country':
        CRMCourseInfoDataCache.clearCache('countries');
        break;
      case 'institute':
        if (countryId) {
          CRMCourseInfoDataCache.clearCache(`institutes_${countryId}`);
        }
        break;
      case 'currency':
        CRMCourseInfoDataCache.clearCache('currencies');
        break;
    }
  },

  // Pre-load commonly used data
  preloadCommonData: async function () {
    const promises = [
      CRMCourseInformationManager.fetchCountryComboBoxData(),
      CRMCourseInformationManager.fetchCurrencyComboBoxData()
    ];

    await Promise.all(promises);
    console.log("Common data pre-loaded");
  },

  // Clear cache on logout
  clearCacheOnLogout: function () {
    CRMCourseInfoDataCache.clearAllCache();
  }
};
