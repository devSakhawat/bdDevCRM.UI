

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

};

var AccessControlDetailsHelper = {

  SaveInformation: function () {
    //if (AccessControlDetailsHelper.validator()) {

    //}
    AccessControlDetailsManager.SaveData();
  },


  ClearInformation: function () {
    $("#btnSave").text("Save");

    $("#hdnAccessControlId").val(0);
    $("#txtAccessControlName").val("");

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
    AccessControlDetailsHelper.ClearInformation();
    $("#hdnAccessControlId").val(obj.AccessId);
    $("#txtAccessControlName").val(obj.AccessName);
    $("#btnSave").text("Update");
  },

};