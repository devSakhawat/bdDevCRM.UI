/// <reference path="accesscontrolpermission.js" />
/// <reference path="actionpermission.js" />
/// <reference path="group.js" />
/// <reference path="groupinfo.js" />
/// <reference path="grouppermission.js" />
/// <reference path="groupsummary.js" />
/// <reference path="menupermission.js" />
/// <reference path="reportpermission.js" />
/// <reference path="statepermission.js" />


var GroupDetailsManager = {

  SaveData: function () {
    debugger;
    var isToUpdateOrCreate = $("#hdnGroupId").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    var serviceUrl = isToUpdateOrCreate == 0 ? "/Group" : "/Group/" + isToUpdateOrCreate;
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
            var obj = GroupDetailsHelper.CreateObject();
            // when you use replease you must your use replace on .net
            //var jsonObject = 'strGroupInfo=' + JSON.stringify(obj).replace(/&/g, "^");
            var jsonObject = JSON.stringify(obj);
            var responseData = AjaxManager.PostDataForDotnetCoreWithHttp(baseApi, serviceUrl, jsonObject, httpType ,onSuccess ,onFailed);
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
  },

  DeleteData: function (dataFromGrid) {
    debugger;
    if (dataFromGrid == null || dataFromGrid == undefined) return false;

    var successmsg = "Information Deleted Successfully.";
    var serviceUrl = "/Group/" + dataFromGrid.GroupId;
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

  GetModules: function () {
    var jsonParams = "";
    var serviceUrl = "/modules";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
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
              GroupDetailsManager.GetAllGroupByModuleId(moduleId);
            } else {
              GroupDetailsHelper.InitGroupByModuleId();
            }
          }
        });

        resolve(jsonData);
      }

      function onFailed(jqXHR, textStatus, errorThrown) {
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: jqXHR.responseJSON?.statusCode + ": " + jqXHR.responseJSON?.message,
          type: 'error',
        });
        reject(errorThrown);
      }

      AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, false, false, onSuccess, onFailed);
    });
  },

  GetModulesWithOutPromise: function () {
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
            GroupDetailsManager.GetAllGroupByModuleId(moduleId);
          } else {
            GroupDetailsHelper.InitGroupByModuleId();
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

  GetAllGroupByModuleId: function (moduleId ) {
    var jsonParams = "moduleId=" + moduleId;
    var serviceUrl = "/Groups-by-moduleId/";
    function onSuccess(jsonData) {
      var objGroupuData = new Object();
      objGroupuData = jsonData;
      $("#cmb-parent-Group").kendoComboBox({
        placeholder: "Select Parent Group...",
        dataTextField: "GroupName",
        dataValueField: "GroupId",
        dataSource: objGroupuData,
        change: function () {
          if (this.value() == this.text()) {
            this.value('');
          }
        },
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


    AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, false, false, onSuccess, onFailed);
  },

};

var GroupDetailsHelper = {

  initGroupDetails: function () {
    //cesCommonHelper.GenerareModuleComboBox("cmd-module");
    //GroupDetailsManager.GetModules();
    //GroupDetailsHelper.InitGroupByModuleId();

    GroupDetailsHelper.createTab();
  },

  createTab: function () {
    $("#tabstrip").kendoTabStrip({
      select: function (e) {

      }
    });

    var tabStrip = $("#tabstrip").data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0);
    } else {
      console.error("Kendo TabStrip is not initialized.");
    }
  },

  //ClearInformation: function () {
  //  $("#hdGroupId").val("0");
  //  $("#hdSorOrder").val("0");
  //  $("#Group-name").val("");
  //  $("#Group-path").val("");

  //  var cmbModule = $("#cmd-module").data("kendoComboBox");
  //  if (cmbModule) {
  //    cmbModule.value("");
  //    cmbModule.text("");
  //  }

  //  var cmbParentGroup = $("#cmb-parent-Group").data("kendoComboBox");
  //  if (cmbParentGroup) {
  //    cmbParentGroup.value("");
  //    cmbParentGroup.text("");
  //  }
  //  cmbParentGroup.destroy();

  //  GroupDetailsHelper.InitGroupByModuleId();

  //  $('#chkIsQuickLink').prop('checked', false); // Use prop() for checkboxes
  //},

  clearGroupForm: function () {
    $("#btnSave").text("Save");

    GroupInfoHelper.clearGroupInfo();
    GroupPermissionHelper.clearGroupPermissionForm();
    MenuPermissionHelper.clearMenuPermission();
    AccessControlHelper.clearAccessPermission();
    StateHelper.clearStatusPermission();
    ActionHelper.clearActionPermission();
    ReportPermissionHelper.clearReportPermission();
  },

  SaveInformation: function () {
    //if (groupDetailsHelper.validateGroupForm()) {


    //}
    GroupDetailsManager.SaveData();
  },

  validateGroupForm: function () {
    var mess = false;
    mess = GroupInfoHelper.validateForm();
    if (!mess) {
      return mess;
    }

    mess = true;
    return mess;
  },

  // from menu details
  CloseInformation: function () {
    $("#divDetails").data("kendoWindow").close();
    GroupDetailsHelper.ClearInformation();
  },

  ClearInformation: function () {
    $("#hdGroupId").val("0");
    $("#hdSorOrder").val("0");
    $("#Group-name").val("");
    $("#Group-path").val("");

    var cmbModule = $("#cmd-module").data("kendoComboBox");
    if (cmbModule) {
      cmbModule.value(""); 
      cmbModule.text("");
    }

    var cmbParentGroup = $("#cmb-parent-Group").data("kendoComboBox");
    if (cmbParentGroup) {
      cmbParentGroup.value("");
      cmbParentGroup.text("");
    }
    cmbParentGroup.destroy();

    GroupDetailsHelper.InitGroupByModuleId();

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
    var objGroupInfo = GroupInfoHelper.createGroupInfo();
    objGroupInfo = GroupPermissionHelper.createModulePermission(objGroupInfo);
    objGroupInfo = MenuPermissionHelper.createMenuPermission(objGroupInfo);
    objGroupInfo = AccessControlHelper.createAccessPermission(objGroupInfo);
    objGroupInfo = StateHelper.createStatusPermission(objGroupInfo);
    objGroupInfo = ActionHelper.createActionPermission(objGroupInfo);
    objGroupInfo = ReportPermissionHelper.createReportPermission(objGroupInfo);
    return objGroupInfo;
  },

  //PopulateObject: function (obj) {
  //  GroupDetailsHelper.ClearInformation();
  //  AjaxManager.PopupWindow("divDetails", "Details Information", "50%");

  //  $("#hdGroupId").val(obj.GroupId);
  //  $("#hdSorOrder").val(obj.SortOrder);
  //  $("#Group-name").val(obj.GroupName);
  //  $("#Group-path").val(obj.GroupPath);
  //  $('#chkIsQuickLink').prop('checked', false);
  //  if (obj.ToDo == 1) {
  //    $('#chkIsQuickLink').prop('checked', true);
  //  } else {
  //    $('#chkIsQuickLink').prop('checked', false);
  //  }

  //  // Populate combo box value
  //  var cmbModule = $("#cmd-module").data("kendoComboBox");
  //  if (obj.ModuleId != 0) {
  //    cmbModule.value(obj.ModuleId);

  //    var comboParentGroup = $("#cmb-parent-Group").data("kendoComboBox");
  //    if (comboParentGroup) {
  //      comboParentGroup.destroy();
  //    }

  //    // Call function to load data and set the value
  //    GroupDetailsManager.GetAllGroupByModuleId(obj.ModuleId);
  //    var comboParentGroup = $("#cmb-parent-Group").data("kendoComboBox");
  //    if (comboParentGroup && obj.ParentGroup !== 0) {
  //      comboParentGroup.value(obj.ParentGroup); // Set the value after data is bound
  //    }
  //  };
  //},

  //InitGroupByModuleId: function () {
  //  $("#cmb-parent-Group").kendoComboBox({
  //    placeholder: "Select Group Name",
  //    dataTextField: "GroupName",
  //    dataValueField: "GroupId",
  //    filter: "contains",
  //    suggest: true,
  //    index: -1,
  //    dataSource: [],
  //    clearButton: true 
  //  }).data("kendoComboBox");
  //},

  //InitModules: function () {
  //  $("#cmd-module").kendoComboBox({
  //    placeholder: "Select Module Name",
  //    dataTextField: "ModuleName",
  //    dataValueField: "ModuleId",
  //    filter: "contains",
  //    suggest: true,
  //    index: -1,
  //    dataSource: [],
  //    clearButton: true 
  //  }).data("kendoComboBox");
  //},
};
