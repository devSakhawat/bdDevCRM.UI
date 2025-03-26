
var moduleDetailsManager = {

  SaveData: function () {
    debugger;

    var isToUpdateOrCreate = $("#hdModuleId").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    var serviceUrl = isToUpdateOrCreate == 0 ? "/module" : "/module/" + isToUpdateOrCreate;
    var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";

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
            debugger;
            $noty.close();
            var obj = moduleDetailsHelper.CreateNewObject();
            var jsonObject = JSON.stringify(obj);
            var data = AjaxManager.PostDataForDotnetCore(baseApi, serviceUrl, jsonObject);
            console.log(data);
            if (data != null || data == "") {
              Message.Success(successmsg);
              moduleDetailsHelper.CloseInformation();
              $("#gridSummary").data("kendoGrid").dataSource.read();
            } else {
              Message.Warning(msg);
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
    );
  },

  DeleteData: function (dataFromGrid) {
    debugger;
    if (dataFromGrid == null || dataFromGrid == undefined) return false;

    var successmsg = "Information Deleted Successfully.";
    var serviceUrl = "/module/" + dataFromGrid.ModuleId;
    var confmsg =  "Do you want to Delete information?";
    var httpType = "DELETE";

    AjaxManager.MsgBox(
      'warning',
      'center', 
      'Confirmation',
      confmsg, 
      [
        {
          addClass: 'btn btn-primary', 
          text: 'Yes',
          onClick: function ($noty) {
            debugger;
            $noty.close(); 
            var jsonObject = JSON.stringify(dataFromGrid);
            var responseData = AjaxManager.PostDataForDotnetCoreWithHttp(baseApi, serviceUrl, jsonObject, httpType, onSuccess, onFailed);
            console.log(responseData);
            //if (responseData === "Success") {
            //  Message.Success(successmsg); 
            //  $("#gridSummary").data("kendoGrid").dataSource.read();
            //} else {
            //  Message.Warning(msg);
            //}

            function onSuccess(responseData) {
              Message.Success(successmsg);
              $("#gridSummary").data("kendoGrid").dataSource.read();
            }
            function onFailed(jqXHR, textStatus, errorThrown) {
              Message.Warning(textStatus, ": ", errorThrown);
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
    );
  },



};

var moduleDetailsHelper = {

  initiateDetails: function () {

  },

  AddNewInformation: function () {
    AjaxManager.PopupWindow("divDetails", "Details Information", "50%");
    moduleDetailsHelper.ClearInformation();

  },

  SaveInformation: function () {
    if (moduleDetailsHelper.validator()) {
      
    }
    moduleDetailsManager.SaveData();
  },

  CloseInformation: function () {
    $("#divDetails").data("kendoWindow").close();
    moduleDetailsHelper.ClearInformation();
  },

  ClearInformation: function () {
    debugger;
    $("#hdModuleId").val("0");
    $("#Module-name").val("");
    $('#myInputID').removeAttr('disabled');
    $("#btnSave").text("Add Module");
  },

  validator: function () {
    var data = [];
    var validator = $("#divdetailsForDetails").kendoValidator().data("kendoValidator"),
      status = $(".status");
    if (validator.validate()) {
      status.text("").addClass("valid");
      return true;
    } else {
      status.text("Oops! There is invalid data in the form.").addClass("invalid");
      return false;
    }

  },

  CreateNewObject: function () {
    var obj = new Object();
    obj.ModuleId = $("#hdModuleId").val();
    obj.ModuleName = $("#Module-name").val();
    return obj;
  },

  PopulateNewObject: function (obj) {
    AjaxManager.PopupWindow("divDetails", "Details Information", "60%");
    var kendoWindow = $("#divDetails").data("kendoWindow");

    kendoWindow.bind("activate", function () {
      $("#hdModuleId").val(obj.ModuleId);
      $("#Module-name").val(obj.ModuleName);
      $("#Module-name").focus();
    });
  },

};
