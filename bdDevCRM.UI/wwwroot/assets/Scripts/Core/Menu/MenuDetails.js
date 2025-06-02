
var MenuDetailsManager = {

  SaveDataOld: function () {
    debugger;
    var isToUpdateOrCreate = $("#hdMenuId").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    var serviceUrl = isToUpdateOrCreate == 0 ? "/menu" : "/menu/" + isToUpdateOrCreate;
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
            var obj = MenuDetailsHelper.CreateObject();
            var jsonObject = JSON.stringify(obj);
            var responseData = AjaxManager.PostDataForDotnetCoreWithHttp(baseApi, serviceUrl, jsonObject, httpType ,onSuccess ,onFailed);
            function onSuccess(responseData) {
              Message.Success(successmsg);
              MenuDetailsHelper.CloseInformation();
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
      ,0
    );
  },

  SaveData: async function () {
    debugger;
    // default
    var isToUpdateOrCreate = $("#hdMenuId").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    var serviceUrl = isToUpdateOrCreate == 0 ? "/menu" : "/menu/" + isToUpdateOrCreate;
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
            var obj = MenuDetailsHelper.CreateObject();
            console.log(obj);
            var jsonObject = JSON.stringify(obj);
            try {
              const responseData = await AjaxManager.PostDataAjax(baseApi, serviceUrl, jsonObject, httpType);
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 3000,
                message: responseData === "Success" ? successmsg : responseData,
                type: 'success',
              });

              MenuDetailsHelper.CloseInformation();
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



  DeleteData: function (dataFromGrid) {
    debugger;
    if (dataFromGrid == null || dataFromGrid == undefined) return false;

    var successmsg = "Information Deleted Successfully.";
    var serviceUrl = "/menu/" + dataFromGrid.MenuId;
    var confmsg = "Do you want to Delete information?";
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
            function onSuccess(responseData) {
              Message.Success(successmsg);
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
        }
      ]
    );
  },

  GetModules: function () {
    debugger;
    var jsonParams = "";
    var serviceUrl = "/modules";

    function onSuccess(jsonData) {
      debugger;
      var objModuleData = new Object();
      objModuleData = jsonData;
      $("#cmd-module").kendoComboBox({
        placeholder: "Select Module",
        dataTextField: "ModuleName",
        dataValueField: "ModuleId",
        dataSource: objModuleData,
        filter: "contains",
        animation: {
          close: {
            effects: "fadeOut zoom:out",
            duration: 200
          },
          open: {
            effects: "fadeIn zoom:in",
            duration: 200
          }
        },
        change: function () {
          var moduleId = this.value();
          console.log("Selected Module ID:", moduleId);

          if (moduleId) {
            MenuDetailsManager.GetAllMenuByModuleId(moduleId);
          } else {
            MenuDetailsHelper.InitMenuByModuleId();
          }
        }
      });
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

    AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, true, false, onSuccess, onFailed);
  },

  GetAllMenuByModuleId: function (moduleId ) {
    var jsonParams = "moduleId=" + moduleId;
    var serviceUrl = "/menus-by-moduleId/";
    function onSuccess(jsonData) {
      //var objMenuuData = new Object();
      //objMenuuData = jsonData;
      var comboBox = $("#cmb-parent-menu").data("kendoComboBox");
      comboBox.setDataSource(jsonData);
      //$("#cmb-parent-menu").kendoComboBox({
      //  placeholder: "Select Parent Menu...",
      //  dataTextField: "MenuName",
      //  dataValueField: "MenuId",
      //  dataSource: objMenuuData,
      //  change: function () {
      //    //if (this.value() == this.text()) {
      //    //  this.value('');
      //    //}
      //  },
      //  //dataBound: function () {
      //  //  if (callback && typeof callback === "function") {
      //  //    callback();
      //  //  }
      //  //}
      //});
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

    AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, false, false, onSuccess, onFailed);
  },

};

var MenuDetailsHelper = {

  initMenuDetails: function () {
    //cesCommonHelper.GenerareModuleComboBox("cmd-module");
    MenuDetailsManager.GetModules();
    MenuDetailsHelper.InitMenuByModuleId();
  },

  SaveInformation: function () {
    //if (MenuDetailsHelper.validator()) {

    //}
    MenuDetailsManager.SaveData();
  },

  AddNewInformation: function () {
    debugger;
     $("#btnSave").text("Save");
    AjaxManager.PopupWindow("divDetails", "Details Information", "50%");
    MenuDetailsHelper.ClearInformation();
  },

  CloseInformation: function () {
    $("#divDetails").data("kendoWindow").close();
    MenuDetailsHelper.ClearInformation();
  },

  ClearInformation: function () {
    $("#hdMenuId").val("0");
    $("#hdSorOrder").val("0");
    $("#menu-name").val("");
    $("#menu-path").val("");

    var cmbModule = $("#cmd-module").data("kendoComboBox");
    if (cmbModule) {
      cmbModule.value(""); 
      cmbModule.text("");
    }

    var cmbParentMenu = $("#cmb-parent-menu").data("kendoComboBox");
    if (cmbParentMenu) {
      cmbParentMenu.value("");
      cmbParentMenu.text("");
    }
    //cmbParentMenu.destroy();

    //MenuDetailsHelper.InitMenuByModuleId();

    $('#chkIsQuickLink').prop('checked', false); // Use prop() for checkboxes
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
    obj.MenuId = $("#hdMenuId").val();
    obj.MenuName = $("#menu-name").val();
    obj.ModuleId = $("#cmd-module").data("kendoComboBox").value() == "" ? 0 : $("#cmd-module").data("kendoComboBox").value();
    obj.MenuPath = $("#menu-path").val();

    obj.ParentMenu = $("#cmb-parent-menu").data("kendoComboBox").value() == "" ? 0 : $("#cmb-parent-menu").data("kendoComboBox").value();
    obj.ParentMenuName = $("#cmb-parent-menu").data("kendoComboBox").text();
    //obj.ParentMenuName = $("#cmb-parent-menu").data("kendoComboBox").text();

    obj.SortOrder = $("#hdSorOrder").val();
    if ($("#chkIsQuickLink").is(':checked') == true) { obj.ToDo = 1; }
    else { obj.ToDo = 0; }

    return obj;
  },

  PopulateObject: function (obj) {
    MenuDetailsHelper.ClearInformation();
    AjaxManager.PopupWindow("divDetails", "Details Information", "50%");

    $("#hdMenuId").val(obj.MenuId);
    $("#hdSorOrder").val(obj.SortOrder);
    $("#menu-name").val(obj.MenuName);
    $("#menu-path").val(obj.MenuPath);
    $('#chkIsQuickLink').attr('checked', false);
    if (obj.ToDo == 1) {
      $('#chkIsQuickLink').attr('checked', true);
    } else {
      $('#chkIsQuickLink').attr('checked', false);
    }

    debugger;
    // Populate combo box value
    var cmbModule = $("#cmd-module").data("kendoComboBox");
    if (obj.ModuleId != 0) {
      cmbModule.value(obj.ModuleId);

      var comboParentMenu = $("#cmb-parent-menu").data("kendoComboBox");
      if (comboParentMenu) {
        comboParentMenu.destroy();
      }

      // Call function to load data and set the value
      MenuDetailsManager.GetAllMenuByModuleId(obj.ModuleId);
      var comboParentMenu = $("#cmb-parent-menu").data("kendoComboBox");
      if (comboParentMenu && obj.ParentMenu !== 0) {
        comboParentMenu.value(obj.ParentMenu); // Set the value after data is bound
      }
    };
  },

  InitMenuByModuleId: function () {
    $("#cmb-parent-menu").kendoComboBox({
      placeholder: "Select Menu Name",
      dataTextField: "MenuName",
      dataValueField: "MenuId",
      filter: "contains",
      suggest: true,
      index: -1,
      dataSource: [],
      clearButton: true 
    }).data("kendoComboBox");
  },

  InitModules: function () {
    $("#cmd-module").kendoComboBox({
      placeholder: "Select Module Name",
      dataTextField: "ModuleName",
      dataValueField: "ModuleId",
      filter: "contains",
      suggest: true,
      index: -1,
      dataSource: [],
      clearButton: true 
    }).data("kendoComboBox");
  },
};
