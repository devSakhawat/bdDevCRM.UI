/// <reference path="accesscontrolsettings.js" />
/// <reference path="accesscontrolsummary.js" />


var AccessControlDetailsManager = {

  SaveAccessControlInformation: function () {
    if (accessControlDetailsHelper.validator()) {

      var objAccessControl = accessControlDetailsHelper.CreateAccessControlForSaveData();

      objAccessControl = JSON.stringify(objAccessControl).replace(/&/g, "^");
      var jsonParam = 'strobjAccessControlInfo=' + objAccessControl;
      var serviceUrl = "../AccessControl/SaveAccessControl/";
      AjaxManager.SendJson(serviceUrl, jsonParam, onSuccess, onFailed);

    }
    function onSuccess(jsonData) {

      if (jsonData == "Success") {
        AjaxManager.MsgBox('success', 'center', 'Success:', 'Access Name Saved Successfully',
          [{
            addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
              $noty.close();
              accessControlDetailsHelper.clearAccessControlForm();
              $("#gridAccessControl").data("kendoGrid").dataSource.read();
              $("#txtAccessControlName").focus();
            }
          }]);

      }
      else {
        AjaxManager.MsgBox('error', 'center', 'Failed', jsonData,
          [{
            addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
              $noty.close();
            }
          }]);
      }
    }

    function onFailed(error) {
      AjaxManager.MsgBox('error', 'center', 'Failed', error.statusText,
        [{
          addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
            $noty.close();
          }
        }]);
    }
  },

  
  SaveData: function () {
    debugger;
    var isToUpdateOrCreate = $("#hdnAccessControlId").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    var serviceUrl = isToUpdateOrCreate == 0 ? "/access-control" : "/access-control/" + isToUpdateOrCreate;
    var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";
    var httpType = isToUpdateOrCreate > 0 ? "PUT" : "POST";

    var obj = AccessControlDetailsHelper.CreateObject();

    AjaxManager.MsgBox(
      'info',
      'center',
      'Confirmation',
      confmsg,
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: function ($noty) {
            $noty.close();
            var jsonObject = JSON.stringify(obj);
            var responseData = AjaxManager.PostDataForDotnetCoreWithHttp(baseApi, serviceUrl, jsonObject, httpType, onSuccess, onFailed);
            function onSuccess(responseData) {
              //Message.Success(successmsg);
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 3000,
                message: successmsg,
                type: 'success',
              });
              AccessControlDetailsHelper.ClearInformation();
              $("#gridSummary").data("kendoGrid").dataSource.read();
            }
            function onFailed(jqXHR, textStatus, errorThrown) {
              //Message.Warning(textStatus, ": ", errorThrown);
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 0,
                message: jqXHR.responseJSON?.statusCode + ": " + jqXHR.responseJSON?.message,
                type: 'error',
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
        }
      ]
      , 0
    );
  },


  saveOrUpdateItem: async function () {
    try {
      const id = $("#hdnAccessControlId").val() || 0;
      const isCreate = id == 0;
      const serviceUrl = isCreate ? "/access-control" : `/access-control/${id}`;
      const httpType = isCreate ? "POST" : "PUT";
      const confirmMsg = isCreate ? "Do you want to save the date?" : "Do you want to update the date?";
      const successMsg = isCreate ? "New data saved successfully." : "Updated data successfully.";

      var modelDto = AccessControlDetailsHelper.CreateObject();

      if (!modelDto) {
        throw new Error("Failed to create data object");
      }

      // Confirmation popup before sending
      CommonManager.MsgBox("info", "center", "Confirmation", confirmMsg, [
        {
          addClass: "btn btn-primary",
          text: "Yes",
          onClick: async function ($noty) {
            $noty.close();
            // Show loading indicator and lock screen
            CommonManager.showProcessingOverlay("Saving new data... Please wait.");

            try {
              var jsonObject = JSON.stringify(modelDto);
              const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, jsonObject, httpType);

              if (response && response.IsSuccess === true) {
                ToastrMessage.showSuccess(successMsg, "Success", 3000);

                AccessControlDetailsHelper.clearForm();

                // Refresh any related grids if they exist
                const grid = $("#gridSummary").data("kendoGrid");
                if (grid) {
                  grid.dataSource.read();
                }

                // Store Access Control ID for future updates (not Application ID)
                if (isCreate && response.Data && response.Data.AccessId) {
                  $("#hdnAccessControlId").val(response.Data.AccessId);
                }

              } else {
                throw new Error(response.Message || "Unknown error occurred while saving application");
              }
            } catch (err) {
              VanillaApiCallManager.handleApiError(err);
              //ToastrMessage.showError("Failed to save data. Please try again.", "Save Error", 0);
            }
            finally {
              // Hide loading indicator
              CommonManager.hideProcessingOverlay();
            }
          }
        },
        { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }
      ], 0);

    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
    }
  },
};

var AccessControlDetailsHelper = {


  //ClearInformation: function () {
  //  $("#btnSave").text("Save");

  //  $("#hdnAccessControlId").val(0);
  //  $("#txtAccessControlName").val("");

  //},

  clearForm: function () {
    debugger;
    // Use enhanced common clearFormFields 
    CommonManager.clearFormFields("#accessControlForm");

    $("#btnSave").text("+ Add New");
    $("#hdnAccessControlId").val(0);
    $("#btnSave").prop("disabled", false);
  },


  validator: function () {
    var data = [];
    var validator = $("#accessControlDetailsDiv").kendoValidator().data("kendoValidator"),
      status = $(".status");
    if (validator.validate()) {

      var chkspAcesName = AjaxManager.checkSpecialCharacters("txtAccessControlName");
      if (!chkspAcesName) {
        status.text("Oops! There is invalid data in the form.").addClass("invalid");
        return false;
      }
      status.text("").addClass("valid");
      return true;
    } else {
      status.text("Oops! There is invalid data in the form.").addClass("invalid");
      return false;
    }
  },

  CreateObject: function () {
    var obj = new Object();
    obj.AccessId = $("#hdnAccessControlId").val();
    obj.AccessName = $("#txtAccessControlName").val();

    return obj;
  },
  
  PopulateObject: function (obj) {
    AccessControlDetailsHelper.clearForm();
    $("#hdnAccessControlId").val(obj.AccessId);
    $("#txtAccessControlName").val(obj.AccessName);
    $("#btnSave").text("Update");
  },

};