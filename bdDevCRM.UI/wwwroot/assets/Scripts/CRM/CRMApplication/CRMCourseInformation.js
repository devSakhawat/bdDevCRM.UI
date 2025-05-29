
/// <reference path="../../common/common.js" />
/// <reference path="CRMAdditionalInformation.js" />
/// <reference path="CRMEducationNEnglishLanguage.js" />
/// <reference path="CRMApplicationSettings.js" />
/// <reference path=""


var CRMCourseInformationManager = {

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

  fetchInstituteComboBoxData: async function (countryId) {
    const jsonParams = $.param({ countryId });
    const serviceUrl = "/crm-institute-country";
    return AjaxManager.GetDataAsyncOrSyncronous(
      baseApi,
      serviceUrl,
      jsonParams,
      true,
      false
    );

    //try {
    //  const result = await AjaxManager.GetDataAsyncOrSyncronous(
    //    baseApi,
    //    serviceUrl,
    //    jsonParams,
    //    true,
    //    false
    //  );
    //  return result;
    //} catch (jqXHR) {
    //  ToastrMessage.showToastrNotification({
    //    preventDuplicates: true,
    //    closeButton: true,
    //    timeOut: 0,
    //    message: jqXHR.status + " : " + jqXHR.responseText,
    //    type: 'error',
    //  });
    //  throw jqXHR;
    //}
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



}

var CRMCourseInformationHelper = {

  courseInit: function () {
    //CRMCourseInformationHelper.countryPopUpInit();
    CommonManager.initializeKendoWindow("#CountryPopUp", "Country Details", "80%");
    CommonManager.initializeKendoWindow("#course_InstitutePopUp", "Inistitute Details", "80%");
    CommonManager.initializeKendoWindow("#course_CoursePopUp", "Course Details", "80%");
    this.generateCountryCombo();
    this.generateInstituteCombo();
    this.generateCourseCombo();
    this.generateIntakeMonthCombo();
    this.generateIntakeYearCombo();
    this.generateCurrencyCombo();
    this.generatePaymentMethodCombo();
    this.initializePaymentDate();

    // Insistitute Form code 
    this.generateCountryCombo_Institute();
  },                           

  //countryPopUpInit: function () {
  //  $("#CountryPopUp").kendoWindow({
  //    title: "Country Information",
  //    resizeable: false,
  //    width: "60%",
  //    actions: ["Pin", "Refresh", "Maximize", "Close"],
  //    modal: true,
  //    visible: false,
  //    //content: "../country/countryInfo"
  //  });
  //},

  generateCountryPopUp: function () {
    var countryPopUp = $("#CountryPopUp").data("kendoWindow");
    if (countryPopUp) {
      countryPopUp.open().center();
    }
  },

  generateInistitutePopUp: function () {
    var institutePopUp = $("#course_InstitutePopUp").data("kendoWindow");
    if (institutePopUp) {
      institutePopUp.open().center();
    }
  },

  generateCoursePopUp: function () {
    var couresePopUp = $("#course_CoursePopUp").data("kendoWindow");
    if (couresePopUp) {
      couresePopUp.open().center();
    }
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
      CRMCourseInformationManager.fetchCountryComboBoxData().then(data => {
        countryComboBoxInstant.setDataSource(data);
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
      change: CRMCourseInformationHelper.onCountryChange
    });
  },

  generateCourseCombo: function () {
    $("#cmbCourseForCourse").kendoComboBox({
      placeholder: "Select Course...",
      dataTextField: "CourseName",
      dataValueField: "CourseId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  generateIntakeMonthCombo: function () {
    $("#cmbIntakeMonthForCourse").kendoComboBox({
      placeholder: "Select  ...",
      dataTextField: "IntakeMonth",
      dataValueField: "IntakeMonthId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  generateIntakeYearCombo: function () {
    $("#cmbIntakeYearForCourse").kendoComboBox({
      placeholder: "Select  Intake Year...",
      dataTextField: "IntakeYear",
      dataValueField: "IntakeYearId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  generateCurrencyCombo: function () {
    $("#cmbCurrencyForCourse").kendoComboBox({
      placeholder: "Select  ...",
      dataTextField: "Currency",
      dataValueField: "CurrencyId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  generatePaymentMethodCombo: function () {
    $("#cmbPaymentMethodForCourse").kendoComboBox({
      placeholder: "Select  ...",
      dataTextField: "PaymentMethod",
      dataValueField: "PaymentMethodId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  initializePaymentDate: function () {
    $("#datePickerPaymentDate").kendoDatePicker({
      parseFormats: CommonManager.getMultiDateFormat(),
      format: "dd-MMM-yyyy"
    });
  },

  GenerateMaritalStatusGrid: function () {
    $("#gridMaritalStatusSummary").kendoGrid({
      dataSource: PersonalInformationDetailsManager.gridDataSourceForMaritalStatus(),
      pageable: {
        refresh: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      xheight: 450,
      filterable: true,
      sortable: true,
      columns: PersonalInformationDetailsHelper.GenerateMaritalStatusColumns(),
      editable: false,
      navigatable: true,
      selectable: "row"
    });
  },

  onCountryChange: function () {
    var countryCombo = $("cmbCountryForCourse").data("kendoComboBox");
    var selectedCountryValue = countryCombo.value();
    var selectedCountryText = countryCombo.text();
  },

  // Insistitute Form code 
  
  generateCountryCombo_Institute: function () {
    $("#cmbInstituteCountryId").kendoComboBox({
      placeholder: "Select Country...",
      dataTextField: "CountryName",
      dataValueField: "CountryId",
      filter: "contains",
      suggest: true,
      dataSource: [],
    });

    var countryComboBoxInstant = $("#cmbInstituteCountryId").data("kendoComboBox");
    if (countryComboBoxInstant) {
      CRMCourseInformationManager.fetchCountryComboBoxData().then(data => {
        countryComboBoxInstant.setDataSource(data);
      });
    }
  },

  generateInstituteTypeCombo: function () {
    $("#cmbInstituteType").kendoComboBox({
      placeholder: "Select  ...",
      dataTextField: "InstituteTypeName",
      dataValueField: "InstituteTypeId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    var instituteTypComboInstant = $("cmbInstituteType").data("kendoComboBox");
    if (instituteTypComboInstant) {
      CRMCourseInformationManager.fetchInstituteTypeComboBoxData().then(data => { instituteTypComboInstant.setDataSource(data); });
    }
    
  },


  

  onCountryChange_Institute: function () {
    var countryCombo = $("cmbInstituteCountryId").data("kendoComboBox");
    var countryId = countryCombo.value();
    var countryName = countryCombo.text();
  },
}