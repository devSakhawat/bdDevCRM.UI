

// <reference path="CRMAdditionalInformation.js" />
// <reference path="CRMEducationNEnglishLanguage.js" />
// <reference path="CRMApplicationSettings.js" />
// <reference path=""


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

  //fetchCountryComboBoxData: function () {
  //  let branches = [];
  //  var jsonParams = "";
  //  //var serviceUrl = "/menus-4-ddl";
  //  var serviceUrl = "/crm-countryddl";;

  //  return new Promise(function (resolve, reject) {
  //    function onSuccess(jsonData) {
  //      branches = jsonData;
  //      resolve(branches);
  //    }

  //    function onFailed(jqXHR, textStatus, errorThrown) {
  //      ToastrMessage.showToastrNotification({
  //        preventDuplicates: true,
  //        closeButton: true,
  //        timeOut: 0,
  //        //message: jqXHR.responseJSON?.message + "(" + jqXHR.responseJSON?.statusCode + ")",
  //        message: jqXHR.status + " : " + jqXHR.responseText,
  //        type: 'error',
  //      });
  //      reject(errorThrown);
  //    }

  //    AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, true, false, onSuccess, onFailed);
  //  });
  //},


}

var CRMCourseInformationHelper = {

  courseInit: function () {
    CRMCourseInformationHelper.countryPopUpInit();
    CRMCourseInformationHelper.generateCountryCombo();
    CRMCourseInformationHelper.generateInstituteCombo();
    CRMCourseInformationHelper.generateCourseCombo();
    CRMCourseInformationHelper.generateIntakeMonthCombo();
    CRMCourseInformationHelper.generateIntakeYearCombo();
    CRMCourseInformationHelper.generateCurrencyCombo();
    CRMCourseInformationHelper.generatePaymentMethodCombo();
    CRMCourseInformationHelper.initializePaymentDate();
  },

  countryPopUpInit: function () {
    $("#CountryPopUp").kendoWindow({
      title: "Country Information",
      resizeable: false,
      width: "60%",
      actions: ["Pin", "Refresh", "Maximize", "Close"],
      modal: true,
      visible: false,
      //content: "../country/countryInfo"
    });
  },

  generateCountryPopUp: function () {
    var countryPopUp = $("#CountryPopUp").data("kendoWidow");
    if (countryPopUp) {
      countryPopUp.open().center();
    }
  },

  //loadCountryCombo: async function (menuId) {
  //  try {
  //    const nextStateComboDataSource = await CRMCourseInformationManager.fetchCountryComboBoxData();
  //    console.log(nextStateComboDataSource);
  //    return nextStateComboDataSource;
  //    //nextStateComboBox.setDataSource(nextStateComboDataSource);
  //  } catch (error) {
  //    console.log(error);
  //    //ToastrMessage.showToastrNotification({
  //    //  preventDuplicates: true,
  //    //  closeButton: true,
  //    //  timeOut: 0,
  //    //  message: "Failed to load data" + ": " + error,
  //    //  type: 'error',
  //    //});
  //  }
  //},

  generateCountryCombo: function () {
    $("#cmbCountryForCourse").kendoComboBox({
      placeholder: "Select Country...",
      dataTextField: "CountryName",
      dataValueField: "CountryId",
      filter: "contains",
      suggest: true,
      dataSource: []
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
      dataSource: [], change: CRMCourseInformationHelper.onCountryChange
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
      parseFormats: AjaxManager.getMultiDateFormat(),
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


  }
}