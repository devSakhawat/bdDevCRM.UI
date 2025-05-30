
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

  fetchCurrencyComboBoxData: async function () {
    const jsonParams = "";
    const serviceUrl = "/currencyddl";
    return AjaxManager.GetDataAsyncOrSyncronous(
      baseApi,
      serviceUrl,
      jsonParams,
      true,
      false
    );
  },

  // grid code section
  getSummaryCurrencyGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      //apiUrl: baseApi + "/get-action-summary-by-statusId?stateId=" + encodeURIComponent(stateId),
      apiUrl: baseApi + "/currency-summary",
      requestType: "POST",
      async: true,
      modelFields: {
        createdDate: { type: "date" }
      },
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Items",
      schemaTotal: "TotalCount"
    });
  },


  // SaveOrUpdateOrDelete

  saveOrUpdateCurrency: async function () {
    debugger;
    //if (UserDetailsHelper.validateUserDetaisForm()) {

    // default
    var isToUpdateOrCreate = $("#currentyId_CurrencyPopUp").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    //var serviceUrl = isToUpdateOrCreate == 0 ? "/currency" : "/currency/" + isToUpdateOrCreate;
    var serviceUrl = "/currency/" + isToUpdateOrCreate;
    var confirmmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";
    var httpType = isToUpdateOrCreate > 0 ? "PUT" : "POST";

    AjaxManager.MsgBox(
      'info',
      'center',
      'Confirmation',
      confirmmsg,
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: async function ($noty) {
            $noty.close();
            var currency = CRMCourseInformationHelper.createCurrencyData();
            console.log(currency);
            var jsonObject = JSON.stringify(currency);
            try {
              const responseData = await AjaxManager.PostDataAjax(baseApi, serviceUrl, jsonObject, httpType);
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 3000,
                message: responseData === "Success" ? successmsg : responseData,
                type: 'success',
              });

              CRMCourseInformationHelper.clearCurrecyForm();
              $("#gridSummaryCurrency").data("kendoGrid").dataSource.read();
            } catch (error) {
              console.log(error);
              let errorMessage = error.responseText || error.statusText || "Unknown error occurred";
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 0,
                message: `${error.status} : ${errorMessage}`,
                type: 'error'
              });
            }
          }
        },
        {
          addClass: 'btn',
          text: 'Cancel',
          onClick: function ($noty) {
            $noty.close();
          }
        },
      ]
      , 0
    );
  },

  deleteData: function (actionGridData) {
    // default
    console.log(actionGridData);
    if (actionGridData == null || actionGridData == undefined) return false;

    var successmsg = "Data Deleted Successfully.";
    var serviceUrl = "/currency/" + actionGridData.CurrencyId;
    var confirmmsg = "Are you sure to Delete this action?";
    var httpType = "DELETE";

    AjaxManager.MsgBox(
      'info',
      'center',
      'Confirmation',
      confirmmsg,
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: async function ($noty) {
            $noty.close();
            var jsonObject = JSON.stringify(actionGridData);
            try {
              const responseData = await AjaxManager.PostDataAjax(baseApi, serviceUrl, jsonObject, httpType);
              CRMCourseInformationHelper.clearCurrecyForm();
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 3000,
                message: responseData === "Success" ? successmsg : responseData,
                type: 'success',
              });

              $("#gridSummaryCurrency").data("kendoGrid").dataSource.read();
            } catch (error) {
              let errorMessage = error.responseText || error.statusText || "Unknown error occurred";
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 0,
                message: `${error.status} : ${errorMessage}`,
                type: 'error'
              });
            }
          }
        },
        {
          addClass: 'btn',
          text: 'Cancel',
          onClick: function ($noty) {
            $noty.close();
          }
        },
      ]
      , 0
    );
  },


}

var CRMCourseInformationHelper = {

  courseInit: function () {
    //CRMCourseInformationHelper.countryPopUpInit();
    CommonManager.initializeKendoWindow("#CountryPopUp", "Country Details", "80%");
    CommonManager.initializeKendoWindow("#course_InstitutePopUp", "Inistitute Details", "80%");
    CommonManager.initializeKendoWindow("#course_CoursePopUp", "Course Details", "80%");
    CommonManager.initializeKendoWindow("#CurrencyPopUp_Course", "Currency Details", "80%");

    this.generateCountryCombo_Institute();
    this.generateCountryCombo();
    this.generateInstituteCombo();
    this.generateCourseCombo();
    this.generateIntakeMonthCombo();
    this.generateIntakeYearCombo();
    this.generateCurrencyCombo();
    this.generatePaymentMethodCombo();
    this.initializePaymentDate();

    // Institute PopUp code 
    this.generateInstituteTypeCombo();
    this.generateCurrencyCombo_Institute();

    // Curreny PopUp Code
    this.generateCurrencyGrid();
  },

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
    var countryComboBoxInstant_Institute = $("#cmbInstituteCountryId").data("kendoComboBox");
    if (countryComboBoxInstant) {
      CRMCourseInformationManager.fetchCountryComboBoxData().then(data => {
        countryComboBoxInstant.setDataSource(data);
        if (countryComboBoxInstant_Institute) {
          countryComboBoxInstant_Institute.setDataSource(data);
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

    //var countryComboBoxInstant = $("#cmbInstituteCountryId").data("kendoComboBox");
    //if (countryComboBoxInstant) {
    //  CRMCourseInformationManager.fetchCountryComboBoxData().then(data => {
    //    countryComboBoxInstant.setDataSource(data);
    //  });
    //}
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

    var instituteTypComboInstant = $("#cmbInstituteType").data("kendoComboBox");

    if (instituteTypComboInstant) {
      CRMCourseInformationManager.fetchInstituteTypeComboBoxData().then(function (data) {
        var newDataSource = new kendo.data.DataSource({
          data: data
        });
        instituteTypComboInstant.setDataSource(newDataSource);
      });
    }
  },

  generateCurrencyCombo_Institute: function () {
    $("#cmbCurrencyId_Institute").kendoComboBox({
      placeholder: "Select Currency...",
      dataTextField: "CurrencyName",
      dataValueField: "CurrencyId",
      filter: "contains",
      suggest: true,
      dataSource: [],
    });

    var currencyComboBoxInstant = $("#cmbCurrencyId_Institute").data("kendoComboBox");
    if (currencyComboBoxInstant) {
      CRMCourseInformationManager.fetchCurrencyComboBoxData().then(data => {
        currencyComboBoxInstant.setDataSource(data);
      });
    }
  },

  generateCurrencyPopUp: function () {
    this.clearCurrecyForm();

    var currencyPopUp = $("#CurrencyPopUp_Course").data("kendoWindow");
    if (currencyPopUp) {
      currencyPopUp.open().center();
    }
  },

  onCountryChange_Institute: function () {
    var countryCombo = $("cmbInstituteCountryId").data("kendoComboBox");
    var countryId = countryCombo.value();
    var countryName = countryCombo.text();
  },

  // clear form
  clearCRMApplicationForm: function () {
    CommonManager.clearFormFields();
  },

  clearInstituteForm: function () {
    CommonManager.clearFormFields();
  },

  // currency popup section
  // Grid code section
  generateCurrencyGrid: function () {
    const gridOptions = {
      dataSource: [],
      autoBind: true,
      navigatable: true,
      width: "100%",
      scrollable: false,
      resizable: false,
      filterable: false,
      sortable: false,
      columns: this.GenerateCurrencyColumns(),
      editable: false,
      selectable: "row",

      //dataBound: function () {
      //  var grid = this;
      //  var items = grid.items();
      //  var rowNumber = 0;

      //  $(items).each(function () {
      //    var dataItem = grid.dataItem(this);
      //    var row = $(this);
      //    row.find("td:eq(0)").html(++rowNumber);
      //  });
      //}
    };

    $("#gridSummaryCurrency").kendoGrid(gridOptions);

    const gridInstance = $("#gridSummaryCurrency").data("kendoGrid");
    if (gridInstance) {
      const dataSource = CRMCourseInformationManager.getSummaryCurrencyGridDataSource();
      gridInstance.setDataSource(dataSource);
    }
  }
,

  GenerateCurrencyColumns: function () {
    return columns = [
      /*{ field: "SlNo", title: "Sl No", width: 40, template: "#= ++rowNumber #" },*/
      { field: "CurrencyId", hidden: true },
      { field: "CurrencyName", title: "Currency Name", width: 70 },
      { field: "IsDefault", title: "Is Default", width: 50, template: "#= IsDefault == 1 ? 'Yes' : 'No' #" },
      { field: "IsActive", title: "Is Active", width: 50, template: "#= IsActive == 1 ? 'Yes' : 'No' #" },
      { field: "Action", title: "#", filterable: false, width: 120, template: '<input type="button" class="btn btn-outline-dark me-1 widthSize40_per" value="Edit" id="" onClick="CRMCourseInformationHelper.clickEventForCurrencyEditButton(event)"  /><input type="button" class="btn btn-outline-danger widthSize50_per" value="Delete" id="" onClick="CRMCourseInformationHelper.clickEventForCurrencyDeleteButton(event)"  />' },
    ];
  },

  clearCurrecyForm: function () {
    debugger;
    CommonManager.clearFormFields("#CurrencyPopUp_Course");
    $("#btnCurrencySaveOrUpdate").text("+ Add Currency");
  },

  // CUD = Creat, Update, Delete
  createCurrencyData: function () {
    var currency = new Object();

    currency.CurrencyId = $("#currentyId_CurrencyPopUp").val() == '' ? '0' : $("#currentyId_CurrencyPopUp").val();
    currency.CurrencyName = $("#currencyName_CurrencyPopUp").val();   
    if ($("#chkIsDefault_Currency").is(':checked') == true) {
      currency.IsDefault = 1;
    } else {
      currency.IsDefault = 0;
    }
    if ($("#chkIsActive_Currency").is(':checked') == true) {
      currency.IsActive = 1;
    } else {
      currency.IsActive = 0;
    }

    return currency;
  },

  clickEventForCurrencyEditButton: function (event) {
    const gridInstance = $("#gridSummaryCurrency").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      this.editItem(selectedItem);
    }
  },

  editItem: async function (item) {
    $("#btnCurrencySaveOrUpdate").text("Update Currency");
    $("#currencyName_CurrencyPopUp").val(item.CurrencyName);
    $("#currencyCode_CurrencyPopUp").val(item.CurrencyCode);
    $('#chkIsDefault_Currency').prop('checked', item.IsDefault == 1 ? true : false);
    $('#chkIsActive_Currency').prop('checked', item.IsActive == 1 ? true : false);

    $("#currentyId_CurrencyPopUp").val(item.CurrencyId);
  },

  clickEventForCurrencyDeleteButton: function (event) {
    const gridInstance = $("#gridSummaryCurrency").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      CRMCourseInformationManager.deleteData(selectedItem);
    }
  },
}