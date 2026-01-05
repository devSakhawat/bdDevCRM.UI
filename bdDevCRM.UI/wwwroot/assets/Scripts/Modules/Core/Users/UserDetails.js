/// <reference path="GroupMembership.js" />

var UserDetailsManager = {
  saveUserInfo: function () {
    //if (UserDetailsHelper.validateUserDetaisForm()) {

    // default
    //var isToUpdateOrCreate = $("#hdnUserId").val();
    //var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    //var serviceUrl = isToUpdateOrCreate == 0 ? "/user" : "/user/" + isToUpdateOrCreate;
    //var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";
    //var httpType = isToUpdateOrCreate > 0 ? "PUT" : "POST";

    // for this User settings it is custom
    var isToUpdateOrCreate = $("#hdnUserId").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    var serviceUrl = "/user";
    var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";
    var httpType = "POST";

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
            var objUser = UserInfoHelper.createUserInformationForSaveData();
            objUser = GroupMembershipHelper.createGroupMemberForSaveData(objUser);

            var jsonObject = JSON.stringify(objUser);
            var responseData = AjaxManager.PostDataForDotnetCoreWithHttp(baseApi, serviceUrl, jsonObject, httpType, onSuccess, onFailed);
            function onSuccess(responseData) {
              Message.Success(successmsg);
              GroupDetailsHelper.clearGroupForm();
              $("#gridSummary").data("kendoGrid").dataSource.read();
            }
            function onFailed(jqXHR, textStatus, errorThrown) {
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
        },
      ]
      , 0
    );

    //}
    function onSuccess(jsonData) {
      //var js = jsonData.split('"');
      if (jsonData == "Success") {
        AjaxManager.MsgBox('success', 'center', 'Success:', 'User Saved Successfully',
          [{
            addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
              $noty.close();
              UserDetailsHelper.clearUserForm();
              $("#gridUser").data("kendoGrid").dataSource.read();
              $("#btnSave").text("Save");
              $("#cmbCompanyNameDetails").focus();
            }
          }]);
      }
      else {
        AjaxManager.MsgBox('warning', 'center', 'Failed', jsonData,
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

    /* -------- Save Or Update -------- */
  saveOrUpdateItem: async function () {
    try {
      const id = $("#hdnUserId").val() || 0;
      const isCreate = id == 0;
      const serviceUrl = isCreate ? "/user" : `/user/${id}`;
      const httpType = isCreate ? "POST" : "PUT";
      const confirmMsg = isCreate ? "Do you want to save the date?" : "Do you want to update the date?";
      const successMsg = isCreate ? "New data saved successfully." : "Updated data successfully.";

      //// Validate all form sections before proceeding
      //if (!CRMApplicationManager.validateAllSections()) {
      //  ToastrMessage.showError("Please complete all required fields before saving.", "Validation Error", 0);
      //  return;
      //}

      var modelDto = UserInfoHelper.createUserInformationForSaveData();
      modelDto = GroupMembershipHelper.createGroupMemberForSaveData(modelDto);

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

                await UserInfoHelper.clearUserInfoForm();

                // Refresh any related grids if they exist
                const grid = $("#gridSummary").data("kendoGrid");
                if (grid) {
                  grid.dataSource.read();
                }

                // Store application ID for future updates
                if (isCreate && response.Data && response.Data.ApplicationId) {
                  $("#hdnUserId").val(response.Data.ApplicationId);
                }

              } else {
                throw new Error(response.Message || "Unknown error occurred while saving application");
              }
            } catch (err) {
              VanillaApiCallManager.handleApiError(err);
              ToastrMessage.showError("Failed to save data. Please try again.", "Save Error", 0);
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
      //ToastrMessage.showError("Error preparing data: " + error.message, "Preparation Error", 0);
    }
  },
};

var UserDetailsHelper = {
  initDetails: function () {
    UserDetailsHelper.createTab();
  },

  clearUserForm: function () {
    UserInfoHelper.clearUserInfoForm();
    GroupMembershipHelper.clearGroupMembershipForm();
    GroupMembershipHelper.getGroups();
    var tabStrip = $("#tabstrip").kendoTabStrip().data("kendoTabStrip");
    tabStrip.select(0);
  },

  //createTab: function () {
  //  $("#tabstrip").kendoTabStrip({});
  //},

  createTab: function () {
    $("#tabstrip").kendoTabStrip({
      select: function (e) {
        // Ensure only one tab has the 'k-state-active' class
        $("#tabstrip ul li").removeClass("k-state-active");
        $(e.item).addClass("k-state-active");
      }
    });

    var tabStrip = $("#tabstrip").data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0); // Ensure the first tab is selected by default
    } else {
      console.error("Kendo TabStrip is not initialized.");
    }
  },

  validateUserDetaisForm: function () {
    var mes = false;
    var res = userInfoHelper.ValidateUserInfoForm();
    if (res == false) {
      return mes;
    }
    mes = true;
    return mes;
  }



};