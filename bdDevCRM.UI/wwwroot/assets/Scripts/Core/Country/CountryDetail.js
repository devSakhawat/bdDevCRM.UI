/// <reference path="../../common/common.js" />
/// <reference path="country.js" />
/// <reference path="countrysummary.js" />
/// <reference path=""

var CountryDetailsManager = {
  // SaveOrUpdateOrDelete
  saveOrUpdateItem: async function () {
    debugger;
    //if (UserDetailsHelper.validateUserDetaisForm()) {

    // default
    var isToUpdateOrCreate = $("#countryId").val();
    var serviceUrl = isToUpdateOrCreate == 0 ? "/country" : "/country/" + isToUpdateOrCreate;
    var serviceUrl = "/country/" + isToUpdateOrCreate;
    var confirmmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";
    var httpType = isToUpdateOrCreate > 0 ? "PUT" : "POST";
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    //var httpType = "POST";

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
            var country = CountryDetailsHelper.createItem();
            console.log(country);
            var jsonObject = JSON.stringify(country);
            try {
              const responseData = await AjaxManager.PostDataAjax(baseApi, serviceUrl, jsonObject, httpType);
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 3000,
                message: responseData === "Success" ? successmsg : responseData,
                type: 'success',
              });

              CountryDetailsHelper.clearForm();
              var gridInstance = $("#gridSummaryCountry").data("kendoGrid");
              if (gridInstance) {
                gridInstance.dataSource.read();
              }
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
    var serviceUrl = "/country/" + actionGridData.CountryId;
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
              CountryDetailsHelper.clearForm();
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 3000,
                message: responseData === "Success" ? successmsg : responseData,
                type: 'success',
              });

              $("#gridSummaryCountry").data("kendoGrid").dataSource.read();
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

var CountryDetailsHelper = {

  clearForm: function () {
    debugger;
    CommonManager.clearFormFields("#CountryFrom");
    $("#btnCountrySaveOrUpdate").text("+ Add Country");
  },

  createItem: function () {
    var country = new Object();

    country.CountryId = $("#countryId").val() == '' ? '0' : $("#countryId").val();
    country.CountryName = $("#countryName").val();
    country.CountryCode = $("#countryCode").val();
   
    if ($("#chkStatusCountry").is(':checked') == true) {
      country.Status = 1;
    } else {
      country.Status = 0;
    }

    return country;
  },

  //editItem: async function (item) {
  //  $("#btnCountrySaveOrUpdate").text("Update Country");
  //  $("#countryName").val(item.CountryName);
  //  $("#countryCode").val(item.CountryCode);
  //  $('#chkStatusCountry').prop('checked', item.Status == 1 ? true : false);

  //  $("#countryId").val(item.CountryId);
  //},

  populateObject: function (item) {
    CountryDetailsHelper.clearForm();

    $("#btnCountrySaveOrUpdate").text("Update Country");
    $("#countryName").val(item.CountryName);
    $("#countryCode").val(item.CountryCode);
    $('#chkStatusCountry').prop('checked', item.Status == 1 ? true : false);

    $("#countryId").val(item.CountryId);
  },

  
}