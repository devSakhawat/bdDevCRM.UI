/// <reference path="../../core/currency/currencydetail.js" />

/// <reference path="../../common/common.js" />
/// <reference path="CRMAdditionalInformation.js" />
/// <reference path="CRMEducationNEnglishLanguage.js" />
/// <reference path="CRMApplicationSettings.js" />

/// <reference path="../../core/currency/currencydetail.js" />
/// <reference path="../../core/currency/currencysummary.js" />

/// <reference path="../../core/country/countrydetail.js" />
/// <reference path="../../core/country/countrysummary.js" />

/// <reference path=""


// Global Variable - গ্লোবাল ভেরিয়েবল
var isCountryDataLoaded = false;

var CRMCourseInformationManager = {

  // দেশের তালিকা আনার জন্য API call
  fetchCountryComboBoxData: function () {
    const jsonParams = "";
    const serviceUrl = "/crm-countryddl";

    return AjaxManager.GetDataAsyncOrSyncronous(
      baseApi,
      serviceUrl,
      jsonParams,
      true,
      false
    );
  },

  // ইনস্টিটিউটের তালিকা আনার জন্য API call (specified URL ব্যবহার করে)
  fetchInstituteComboBoxData: async function () {
    const serviceUrl = "/crm-institute-ddl";
    
    try {
      // VanillaApiCallManager এর বিকল্প হিসেবে AjaxManager ব্যবহার করা
      if (typeof VanillaApiCallManager !== 'undefined') {
        const response = await VanillaApiCallManager.get("https://localhost:7290/bdDevs-crm", serviceUrl);
        if (response && response.IsSuccess === true) {
          return Promise.resolve(response.Data);
        }
      } else {
        // Fallback to existing AjaxManager
        const response = await AjaxManager.GetDataAsyncOrSyncronous(
          "https://localhost:7290/bdDevs-crm",
          serviceUrl,
          "",
          true,
          false
        );
        return Promise.resolve(response);
      }
      throw new Error("ইনস্টিটিউট ডেটা লোড করতে ব্যর্থ");
    } catch (error) {
      console.error("ইনস্টিটিউট ডেটা আনতে সমস্যা:", error);
      if (typeof VanillaApiCallManager !== 'undefined' && VanillaApiCallManager.handleApiError) {
        VanillaApiCallManager.handleApiError(error);
      }
      return Promise.reject(error);
    }
  },

  // নির্বাচিত ইনস্টিটিউট অনুযায়ী কোর্সের তালিকা আনার জন্য API call
  fetchCourseByInstituteIdData: async function (instituteId) {
    if (!instituteId) {
      return Promise.resolve([]);
    }
    
    const serviceUrl = `/crm-course-by-instituteid-ddl/${instituteId}`;
    
    try {
      // VanillaApiCallManager এর বিকল্প হিসেবে AjaxManager ব্যবহার করা
      if (typeof VanillaApiCallManager !== 'undefined') {
        const response = await VanillaApiCallManager.get("https://localhost:7290/bdDevs-crm", serviceUrl);
        if (response && response.IsSuccess === true) {
          return Promise.resolve(response.Data);
        }
      } else {
        // Fallback to existing AjaxManager
        const response = await AjaxManager.GetDataAsyncOrSyncronous(
          "https://localhost:7290/bdDevs-crm",
          serviceUrl,
          "",
          true,
          false
        );
        return Promise.resolve(response);
      }
      throw new Error("কোর্স ডেটা লোড করতে ব্যর্থ");
    } catch (error) {
      console.error("কোর্স ডেটা আনতে সমস্যা:", error);
      if (typeof VanillaApiCallManager !== 'undefined' && VanillaApiCallManager.handleApiError) {
        VanillaApiCallManager.handleApiError(error);
      }
      return Promise.reject(error);
    }
  },

  fetchInstituteTypeComboBoxData: async function () {
    const jsonParams = "";
    const serviceUrl = "/crm-institute-type";
    return AjaxManager.GetDataAsyncOrSyncronous(
      baseApi,
      serviceUrl,
      jsonParams,
      true,
      false
    );
  },

  // মুদ্রার তালিকা আনার জন্য API call (specified URL ব্যবহার করে)
  fetchCurrencyComboBoxData: async function () {
    const serviceUrl = "/currencyddl";
    
    try {
      // VanillaApiCallManager এর বিকল্প হিসেবে AjaxManager ব্যবহার করা
      if (typeof VanillaApiCallManager !== 'undefined') {
        const response = await VanillaApiCallManager.get("https://localhost:7290/bdDevs-crm", serviceUrl);
        if (response && response.IsSuccess === true) {
          return Promise.resolve(response.Data);
        }
      } else {
        // Fallback to existing AjaxManager
        const response = await AjaxManager.GetDataAsyncOrSyncronous(
          "https://localhost:7290/bdDevs-crm",
          serviceUrl,
          "",
          true,
          false
        );
        return Promise.resolve(response);
      }
      throw new Error("মুদ্রা ডেটা লোড করতে ব্যর্থ");
    } catch (error) {
      console.error("মুদ্রা ডেটা আনতে সমস্যা:", error);
      if (typeof VanillaApiCallManager !== 'undefined' && VanillaApiCallManager.handleApiError) {
        VanillaApiCallManager.handleApiError(error);
      }
      return Promise.reject(error);
    }
  },

}

var CRMCourseInformationHelper = {

  // কোর্স ইনফরমেশন ইনিশিয়ালাইজ করার ফাংশন
  courseInit: function () {
    console.log("কোর্স ইনফরমেশন ইনিশিয়ালাইজ হচ্ছে...");
    
    // Kendo Windows ইনিশিয়ালাইজ করা
    CommonManager.initializeKendoWindow("#CountryPopUp", "দেশের বিস্তারিত", "80%");
    CommonManager.initializeKendoWindow("#course_InstitutePopUp", "ইনস্টিটিউটের বিস্তারিত", "80%");
    CommonManager.initializeKendoWindow("#course_CoursePopUp", "কোর্সের বিস্তারিত", "80%");
    CommonManager.initializeKendoWindow("#CurrencyPopUp_Course", "মুদ্রার বিস্তারিত", "80%");

    // ComboBoxes ইনিশিয়ালাইজ করা
    this.generateCountryCombo();
    this.generateInstituteCombo();
    this.generateCourseCombo();
    this.generateIntakeMonthCombo();
    this.generateIntakeYearCombo();
    this.generateCurrencyCombo();
    this.generatePaymentMethodCombo();
    this.generateGenderCombo();
    this.generateTitleCombo();
    this.generateMaritalStatusCombo();
    this.initializePaymentDate();
    this.initializeDateOfBirth();
  },

  // দেশ পপআপ তৈরি করার ফাংশন
  generateCountryPopUp: function () {
    debugger;
    var countryPopUp = $("#CountryPopUp").data("kendoWindow");
    if (!countryPopUp) return;
    countryPopUp.center().open();

    if (countryPopUp) {
      var countryGridInstance = $("#gridSummaryCountry").data("kendoGrid")
      
      const grid = $("#gridSummaryCountry").data("kendoGrid");
      if (!grid) {
        CountrySummaryHelper.initCountrySummary();
        if (grid?.dataSource) {
          isCountryDataLoaded = true;
        }
      } else {
        grid.resize();
        if (!isCountryDataLoaded) {
          grid.dataSource.read();
          isCountryDataLoaded = true;
        }
      }
    }
  },

  // ইনস্টিটিউট পপআপ তৈরি করার ফাংশন
  generateInistitutePopUp: function () {
    var institutePopUp = $("#course_InstitutePopUp").data("kendoWindow");
    if (institutePopUp) {
      institutePopUp.open().center();
    }
  },

  // কোর্স পপআপ তৈরি করার ফাংশন
  generateCoursePopUp: function () {
    var couresePopUp = $("#course_CoursePopUp").data("kendoWindow");
    if (couresePopUp) {
      couresePopUp.open().center();
    }
  },

  // দেশের কম্বো বক্স তৈরি করার ফাংশন
  generateCountryCombo: function () {
    $("#cmbCountryForCourse").kendoComboBox({
      placeholder: "দেশ নির্বাচন করুন...",
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
        console.error("দেশের ডেটা লোড করতে সমস্যা:", error);
        countryComboBoxInstant.setDataSource([]);
      });
    }
  },

  // ইনস্টিটিউটের কম্বো বক্স তৈরি করার ফাংশন
  generateInstituteCombo: function () {
    $("#cmbInstituteForCourse").kendoComboBox({
      placeholder: "ইনস্টিটিউট নির্বাচন করুন...",
      dataTextField: "InstituteName",
      dataValueField: "InstituteId",
      filter: "contains",
      suggest: true,
      dataSource: [],
      change: CRMCourseInformationHelper.onInstituteChange
    });

    var instituteComboBoxInstant = $("#cmbInstituteForCourse").data("kendoComboBox");
    if (instituteComboBoxInstant) {
      CRMCourseInformationManager.fetchInstituteComboBoxData().then(data => {
        instituteComboBoxInstant.setDataSource(data);
      }).catch(error => {
        console.error("ইনস্টিটিউটের ডেটা লোড করতে সমস্যা:", error);
        instituteComboBoxInstant.setDataSource([]);
      });
    }
  },

  // কোর্সের কম্বো বক্স তৈরি করার ফাংশন
  generateCourseCombo: function () {
    $("#cmbCourseForCourse").kendoComboBox({
      placeholder: "কোর্স নির্বাচন করুন...",
      dataTextField: "CourseName",
      dataValueField: "CourseId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  generateIntakeMonthCombo: function () {
    $("#cmbIntakeMonthForCourse").kendoComboBox({
      placeholder: "ভর্তির মাস নির্বাচন করুন...",
      dataTextField: "IntakeMonth",
      dataValueField: "IntakeMonthId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  generateIntakeYearCombo: function () {
    $("#cmbIntakeYearForCourse").kendoComboBox({
      placeholder: "ভর্তির বছর নির্বাচন করুন...",
      dataTextField: "IntakeYear",
      dataValueField: "IntakeYearId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  // মুদ্রার কম্বো বক্স তৈরি করার ফাংশন
  generateCurrencyCombo: function () {
    $("#cmbCurrencyForCourse").kendoComboBox({
      placeholder: "মুদ্রা নির্বাচন করুন...",
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
        console.error("মুদ্রার ডেটা লোড করতে সমস্যা:", error);
        currencyComboBoxInstant.setDataSource([]);
      });
    }
  },

  generatePaymentMethodCombo: function () {
    $("#cmbPaymentMethodForCourse").kendoComboBox({
      placeholder: "পেমেন্ট পদ্ধতি নির্বাচন করুন...",
      dataTextField: "PaymentMethod",
      dataValueField: "PaymentMethodId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  // লিঙ্গের কম্বো বক্স তৈরি করার ফাংশন
  generateGenderCombo: function () {
    $("#cmbGenderForCourse").kendoComboBox({
      placeholder: "লিঙ্গ নির্বাচন করুন...",
      dataTextField: "GenderName",
    });
  },

  clearInstituteForm: function () {
    console.log("ইনস্টিটিউট ফর্ম ক্লিয়ার হচ্ছে...");
    CommonManager.clearFormFields();
  },

  // টেস্ট ফাংশন - ডেমো ডেটা দিয়ে ফর্ম পূরণ করার জন্য
  fillDemoData: function () {
    console.log("ডেমো ডেটা দিয়ে ফর্ম পূরণ হচ্ছে...");
    
    // Course Details demo data
    $("#txtApplicationFeeForCourse").val("5000");
    $("#txtPaymentReferenceNumberCourse").val("PAY123456");
    $("#txtareaRemarks").val("এটি একটি নমুনা আবেদন।");
    
    // Personal Details demo data
    $("#txtFirstName").val("মোহাম্মদ");
    $("#txtLastName").val("রহমান");
    $("#txtNationality").val("বাংলাদেশী");
    $("#txtPassportNumberForCourse").val("BP1234567");
    $("#txtPhoneCountrycodeForCourse").val("+880");
    $("#txtPhoneAreacodeForCourse").val("2");
    $("#txtPhoneNumberForCourse").val("9876543");
    $("#txtMobileForCourse").val("01712345678");
    $("#txtEmailAddressForCourse").val("mohammad.rahman@email.com");
    $("#txtSkypeIDForCourse").val("mohammad.rahman.skype");
    
    // Address demo data
    $("#txtPermanentAddress").val("১২৩, ধানমন্ডি");
    $("#txtPermanentCity").val("ঢাকা");
    $("#txtPermanentState").val("ঢাকা বিভাগ");
    $("#txtPostalCode_PermanenetAddress").val("1205");
    
    $("#txtPresentAddress").val("৪৫৬, বনানী");
    $("#txtPresentCity").val("ঢাকা");
    $("#txtPresentState").val("ঢাকা বিভাগ");
    $("#txtPostalCode").val("1213");
    
    // Set radio button
    $("#radioIsPassportYes").prop('checked', true);
    
    console.log("ডেমো ডেটা সফলভাবে পূরণ হয়েছে!");
  },

  // সম্পূর্ণ ফর্ম ভ্যালিডেশন
  validateCompleteForm: function () {
    console.log("ফর্ম ভ্যালিডেশন শুরু হচ্ছে...");
    
    var errors = [];
    
    // Required fields validation
    var requiredFields = [
      { id: "#txtFirstName", name: "প্রথম নাম" },
      { id: "#txtLastName", name: "শেষ নাম" },
      { id: "#txtNationality", name: "জাতীয়তা" },
      { id: "#txtEmailAddressForCourse", name: "ইমেইল ঠিকানা" }
    ];
    
    requiredFields.forEach(function(field) {
      if (!$(field.id).val() || $(field.id).val().trim() === "") {
        errors.push(field.name + " আবশ্যক।");
      }
    });
    
    // Email validation
    var email = $("#txtEmailAddressForCourse").val();
    if (email && !this.isValidEmail(email)) {
      errors.push("বৈধ ইমেইল ঠিকানা প্রদান করুন।");
    }
    
    // ComboBox validation
    var countryCombo = $("#cmbCountryForCourse").data("kendoComboBox");
    if (!countryCombo || !countryCombo.value()) {
      errors.push("দেশ নির্বাচন করুন।");
    }
    
    var genderCombo = $("#cmbGenderForCourse").data("kendoComboBox");
    if (!genderCombo || !genderCombo.value()) {
      errors.push("লিঙ্গ নির্বাচন করুন।");
    }
    
    if (errors.length > 0) {
      console.log("ভ্যালিডেশন ত্রুটি:", errors);
      alert("দয়া করে নিম্নলিখিত সমস্যাগুলি সংশোধন করুন:\n\n" + errors.join("\n"));
      return false;
    }
    
    console.log("ফর্ম ভ্যালিডেশন সফল!");
    return true;
  },

  // ইমেইল ভ্যালিডেশন হেল্পার ফাংশন
  isValidEmail: function (email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // ফর্ম ডেটা JSON এ রূপান্তর করার ফাংশন
  exportFormDataAsJSON: function () {
    console.log("ফর্ম ডেটা JSON এ রূপান্তর করা হচ্ছে...");
    
    if (!this.validateCompleteForm()) {
      return null;
    }
    
    var completeData = this.createCompleteApplicationObject();
    var jsonString = JSON.stringify(completeData, null, 2);
    
    console.log("JSON ডেটা তৈরি হয়েছে:", jsonString);
    
    // JSON ডেটা console এ প্রিন্ট করা
    console.log("=== সম্পূর্ণ আবেদনের JSON ডেটা ===");
    console.log(jsonString);
    
    return jsonString;
  },

  // ফর্ম সাবমিট করার ফাংশন
  submitApplication: function () {
    console.log("আবেদন সাবমিট করা হচ্ছে...");
    
    var jsonData = this.exportFormDataAsJSON();
    if (!jsonData) {
      return false;
    }
    
    // এখানে API call করা হবে
    console.log("API এ পাঠানোর জন্য প্রস্তুত ডেটা:", jsonData);
    
    // Temporary success message
    alert("আবেদন সফলভাবে সাবমিট হয়েছে!\n\nNote: এটি একটি ডেমো। আসল API integration এর জন্য backend setup প্রয়োজন।");
    
    return true;
  }
}