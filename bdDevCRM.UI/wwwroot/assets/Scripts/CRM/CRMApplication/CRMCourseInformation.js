

// <reference path="CRMAdditionalInformation.js" />
// <reference path="CRMEducationNEnglishLanguage.js" />
// <reference path="CRMApplicationSettings.js" />



var CRMCourseInformationManager = {
  fetchCountryComboBoxData: async function (menuId) {
    const jsonParams = $.param({ menuId });
    const serviceUrl = "/next-states-by-menu";

    try {
      const result = await AjaxManager.GetDataAsyncOrSyncronous(
        baseApi,
        serviceUrl,
        jsonParams,
        true,
        false
      );
      return result;
    } catch (jqXHR) {
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 0,
        message: jqXHR.status + " : " + jqXHR.responseText,
        type: 'error',
      });
      throw jqXHR;
    }
  },

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
    $("#CouuntryPopUp").kendoWindow({
      title: "Marital Status",
      resizeable: false,
      width: "60%",
      actions: ["Pin", "Refresh", "Maximize", "Close"],
      modal: true,
      visible: false,
      //content: "../country/countryInfo"
    });
  },

  generateCountryPopUp: function () {
    $("#CouuntryPopUp").data("kendoWindow").open().center();
  },

  generateCountryCombo: function () {
    $("#cmbCountryForCourse").kendoComboBox({
      placeholder: "Select Country...",
      //optionLabel: "-- Select Next State --",
      dataTextField: "CountryName",
      dataValueField: "CountryId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  generateInstituteCombo: function () {
    $("#cmbInstituteForCourse").kendoComboBox({
      placeholder: "Select Institute...",
      dataTextField: "InstituteName",
      dataValueField: "InstituteId",
      filter: "contains",
      suggest: true,
      dataSource: []
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


}