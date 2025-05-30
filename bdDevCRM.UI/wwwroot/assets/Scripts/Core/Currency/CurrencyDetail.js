/// <reference path="../../common/common.js" />
/// <reference path="Currency.js" />
/// <reference path="CurrencySummary.js" />
/// <reference path=""

var CurrencyDetailsManager = {
  // SaveOrUpdateOrDelete
  saveOrUpdateItem: async function () {
    debugger;
    //if (UserDetailsHelper.validateUserDetaisForm()) {

    // default
    var isToUpdateOrCreate = $("#currencyId").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    //var serviceUrl = isToUpdateOrCreate == 0 ? "/currency" : "/currency/" + isToUpdateOrCreate;
    var serviceUrl = "/currency/" + isToUpdateOrCreate;
    var confirmmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";
    //var httpType = isToUpdateOrCreate > 0 ? "PUT" : "POST";
    var httpType = "POST";

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

              CurrencyDetailsHelper.clearForm();
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

  deleteItem: function (actionGridData) {
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
              CurrencyDetailsHelper.clearForm();
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

var CurrencyDetailsHelper = {

  clearForm: function () {
    debugger;
    CommonManager.clearFormFields("#CurrencyPopUp_Course");
    $("#btnCurrencySaveOrUpdate").text("+ Add Currency");
  },

  createItem: function () {
    var currency = new Object();

    currency.CurrencyId = $("#currencyId").val() == '' ? '0' : $("#currencyId").val();
    currency.CurrencyName = $("#currencyName").val();
    if ($("#chkIsDefaultCurrency").is(':checked') == true) {
      currency.IsDefault = 1;
    } else {
      currency.IsDefault = 0;
    }
    if ($("#chkIsActiveCurrency").is(':checked') == true) {
      currency.IsActive = 1;
    } else {
      currency.IsActive = 0;
    }

    return currency;
  },

  editItem: async function (item) {
    $("#btnCurrencySaveOrUpdate").text("Update Currency");
    $("#currencyName").val(item.CurrencyName);
    $('#chkIsDefaultCurrency').prop('checked', item.IsDefault == 1 ? true : false);
    $('#chkIsActiveCurrency').prop('checked', item.IsActive == 1 ? true : false);

    $("#currencyId").val(item.CurrencyId);
  },

}