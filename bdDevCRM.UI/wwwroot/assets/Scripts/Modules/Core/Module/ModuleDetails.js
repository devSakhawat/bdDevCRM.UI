
var ModuleDetailsManager = {

  SaveDataModule: function () {
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
            var obj = ModuleDetailsHelper.CreateObject();
            var jsonObject = JSON.stringify(obj);
            var data = AjaxManager.PostDataForDotnetCore(baseApi, serviceUrl, jsonObject);
            console.log(data);
            if (data != null || data == "") {
              Message.Success(successmsg);
              ModuleDetailsHelper.CloseInformation();
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

   SaveData: function () {
      debugger;

      var isToUpdateOrCreate = $("#hdModuleId").val();
      var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
      var serviceUrl = isToUpdateOrCreate == 0 ? "/module" : "/module/" + isToUpdateOrCreate;
      var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";
      var httpType = isToUpdateOrCreate > 0 ? "PUT" : "POST";

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
                  var obj = ModuleDetailsHelper.CreateObject();
                  var jsonObject = JSON.stringify(obj);
                  var responseData = AjaxManager.PostDataForDotnetCoreWithHttp(baseApi, serviceUrl, jsonObject, httpType, onSuccess, onFailed);
                  function onSuccess(responseData) {
                     Message.Success(successmsg);
                     ModuleDetailsHelper.CloseInformation();
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

var ModuleDetailsHelper = {

  initializeDetails: function () {

  },

  AddNewInformation: function () {
    AjaxManager.PopupWindow("divDetails", "Details Information", "50%");
    ModuleDetailsHelper.ClearInformation();

  },

  SaveInformation: function () {
    if (ModuleDetailsHelper.validator()) {
      
    }
    ModuleDetailsManager.SaveData();
  },

  CloseInformation: function () {
    $("#divDetails").data("kendoWindow").close();
     ModuleDetailsHelper.ClearInformation();
     $("#btnSave").text("Save");
  },

  ClearInformation: function () {
    debugger;
    $("#hdModuleId").val("0");
    $("#Module-name").val("");
    $('#myInputID').removeAttr('disabled');
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

  CreateObject: function () {
    var obj = new Object();
    obj.ModuleId = $("#hdModuleId").val();
    obj.ModuleName = $("#Module-name").val();
    return obj;
  },

   PopulateObject: function (obj) {
      ModuleDetailsHelper.ClearInformation();
      AjaxManager.PopupWindow("divDetails", "Details Information", "60%");
      var kendoWindow = $("#divDetails").data("kendoWindow");

       kendoWindow.bind("activate", function () {
         $("#hdModuleId").val(obj.ModuleId);
         $("#Module-name").val(obj.ModuleName);
         $("#Module-name").focus();
       });
   },

   //PopulateObject: function (obj) {
   //   MenuDetailsHelper.ClearInformation();
   //   AjaxManager.PopupWindow("divDetails", "Details Information", "50%");

   //   $("#hdModuleId").val(obj.ModuleId);
   //   $("#Module-name").val(obj.ModuleName);
   //   $("#Module-name").focus();
   //},


};
