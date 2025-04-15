var userDetailsManager = {
  SaveUserInfo: function () {
    if (UserDetailsHelper.validateUserDetaisForm()) {

      var objUser = userInfoHelper.CreateUserInformationForSaveData();

      objUser = groupMembershipHelper.CreateGroupMemberForSaveData(objUser);

      var objUserinfo = JSON.stringify(objUser).replace(/&/g, "^");
      var jsonParam = 'strobjUserInfo=' + objUserinfo;
      var serviceUrl = "../Users/SaveUser/";
      AjaxManager.SendJson(serviceUrl, jsonParam, onSuccess, onFailed);

    }
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
    userInfoHelper.clearUserInfoForm();
    groupMembershipHelper.clearGroupMembershipForm();
    groupMembershipHelper.GetGroupByCompanyId(CurrentUser.CompanyId);
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