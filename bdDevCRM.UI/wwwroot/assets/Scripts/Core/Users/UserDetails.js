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

            //var objUserinfo = JSON.stringify(objUser).replace(/&/g, "^");
            //var jsonParam = 'strobjUserInfo=' + objUserinfo;
            //AjaxManager.SendJson(serviceUrl, jsonParam, onSuccess, onFailed);

            // when you use replease you must your use replace on .net
            //var jsonObject = 'strGroupInfo=' + JSON.stringify(obj).replace(/&/g, "^");

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
  }
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