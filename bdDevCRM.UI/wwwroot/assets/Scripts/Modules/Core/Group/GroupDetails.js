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

  SaveData: async function () {
    debugger;
    var isToUpdateOrCreate = $("#hdnGroupId").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    var serviceUrl = isToUpdateOrCreate == 0 ? "/group" : "/group/" + isToUpdateOrCreate;
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
          onClick: async function ($noty) {
            $noty.close();
            //var jsonObject = GroupDetailsHelper.CreateObject();
            var obj = GroupDetailsHelper.CreateObject();
            var jsonObject = JSON.stringify(obj);
            console.log(jsonObject);
            try {
              const response = await VanillaApiCallManager.put(baseApi, serviceUrl, jsonObject);
              //const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, jsonObject, httpType);
              if (response && response.IsSuccess === true) {
                return Promise.resolve(response.Data);
              } else {
                throw new Error("Failed to load data");
              }
            } catch (error) {
              console.log("Error loading data:" + error);
              VanillaApiCallManager.handleApiError(error);
              return Promise.reject(error);
            }

            // when you use replease you must your use replace on .net
            //var jsonObject = 'strGroupInfo=' + JSON.stringify(obj).replace(/&/g, "^");
            //var jsonObject = JSON.stringify(obj);
            //var responseData = AjaxManager.PostDataForDotnetCoreWithHttp(baseApi, serviceUrl, jsonObject, httpType ,onSuccess ,onFailed);
            //function onSuccess(responseData) {
            //  Message.Success(successmsg);
            //  GroupDetailsHelper.clearGroupForm();
            //  $("#gridSummary").data("kendoGrid").dataSource.read();
            //}
            //function onFailed(jqXHR, textStatus, errorThrown) {
            //  ToastrMessage.showToastrNotification({
            //    preventDuplicates: true,
            //    closeButton: true,
            //    timeOut: 0,
            //    message: jqXHR.responseJSON?.statusCode + ": " + jqXHR.responseJSON?.message,
            //    type: 'error',
            //  });
            //}

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

  //clearGroupForm: function () {
  //  // set button text and enable
  //  try { $("#btnSave").text("Save").show().prop("disabled", false); } catch (e) { }

  //  // call helper clears for all sections
  //  try {
  //    if (typeof GroupInfoHelper !== "undefined" && typeof GroupInfoHelper.clearGroupInfo === "function") {
  //      GroupInfoHelper.clearGroupInfo();
  //    }
  //  } catch (e) {
  //    console.warn("Error clearing GroupInfo:", e);
  //  }

  //  try {
  //    if (typeof GroupPermissionHelper !== "undefined" && typeof GroupPermissionHelper.clearGroupPermissionForm === "function") {
  //      GroupPermissionHelper.clearGroupPermissionForm();
  //    }
  //  } catch (e) {
  //    console.warn("Error clearing GroupPermission:", e);
  //  }

  //  try {
  //    if (typeof MenuPermissionHelper !== "undefined" && typeof MenuPermissionHelper.clearMenuPermission === "function") {
  //      MenuPermissionHelper.clearMenuPermission();
  //    }
  //  } catch (e) {
  //    console.warn("Error clearing MenuPermission:", e);
  //  }

  //  try {
  //    if (typeof AccessControlHelper !== "undefined" && typeof AccessControlHelper.clearAccessPermission === "function") {
  //      AccessControlHelper.clearAccessPermission();
  //    }
  //  } catch (e) {
  //    console.warn("Error clearing AccessControl:", e);
  //  }

  //  try {
  //    if (typeof StateHelper !== "undefined" && typeof StateHelper.clearStatusPermission === "function") {
  //      StateHelper.clearStatusPermission();
  //    }
  //  } catch (e) {
  //    console.warn("Error clearing StatePermission:", e);
  //  }

  //  try {
  //    if (typeof ActionHelper !== "undefined" && typeof ActionHelper.clearActionPermission === "function") {
  //      ActionHelper.clearActionPermission();
  //    }
  //  } catch (e) {
  //    console.warn("Error clearing ActionPermission:", e);
  //  }

  //  try {
  //    if (typeof ReportPermissionHelper !== "undefined" && typeof ReportPermissionHelper.clearReportPermission === "function") {
  //      ReportPermissionHelper.clearReportPermission();
  //    }
  //  } catch (e) {
  //    console.warn("Error clearing ReportPermission:", e);
  //  }

  //  // DOM widget resets (defensive)
  //  try {
  //    // basic fields
  //    $("#hdnGroupId").val("0");
  //    $("#txtGroupName").val("");
  //    $("#chkIsDefault").prop("checked", false);

  //    // kendo combobox resets
  //    var cmdModule = $("#cmd-module").data("kendoComboBox");
  //    if (cmdModule) { cmdModule.value(""); cmdModule.setDataSource(new kendo.data.DataSource({ data: [] })); }

  //    var cmbParent = $("#cmb-parent-Group").data("kendoComboBox");
  //    if (cmbParent) { cmbParent.value(""); cmbParent.setDataSource(new kendo.data.DataSource({ data: [] })); }

  //    var cmbAppModule = $("#cmbApplicationForModule").data("kendoComboBox");
  //    if (cmbAppModule) { cmbAppModule.value(""); cmbAppModule.setDataSource(new kendo.data.DataSource({ data: [] })); }

  //    // destroy / clear treeview
  //    if ($("#treeview").length) {
  //      var tv = $("#treeview").data("kendoTreeView");
  //      if (tv && typeof tv.destroy === "function") tv.destroy();
  //      $("#treeview").empty();
  //    }

  //    // validation / status
  //    $("#divdetailsForDetails").find(".k-tooltip-validation").hide();
  //    $("#divdetailsForDetails").find(".field-validation-error").removeClass("field-validation-error").addClass("field-validation-valid");
  //    $(".status").text("").removeClass("invalid valid");

  //    // reset tabs
  //    var tabStrip = $("#tabstrip").data("kendoTabStrip");
  //    if (tabStrip) tabStrip.select(0);

  //  } catch (e) {
  //    console.warn("Error resetting DOM widgets:", e);
  //  }

  //  // reset in-memory arrays used across permission helpers
  //  try { if (typeof moduleArray !== "undefined") moduleArray.length = 0; } catch (e) { }
  //  try { if (typeof menuArray !== "undefined") menuArray.length = 0; } catch (e) { }
  //  try { if (typeof allmenuArray !== "undefined") allmenuArray.length = 0; } catch (e) { }
  //  try { if (typeof allmoduleArray !== "undefined") allmoduleArray.length = 0; } catch (e) { }
  //  try { if (typeof accessArray !== "undefined") accessArray.length = 0; } catch (e) { }
  //  try { if (typeof groupPermisionArray !== "undefined") groupPermisionArray.length = 0; } catch (e) { }

  //  console.debug("GroupDetailsHelper.clearGroupForm: All sections cleared - UI widgets, permission arrays, and helper forms reset.");
  //},

  clearGroupForm: function () {
    // set button text and enable
    try { $("#btnSave").text("Save").show().prop("disabled", false); } catch (e) { }

    // call helper clears defensively
    //try { if (typeof GroupInfoHelper !== "undefined" && typeof GroupInfoHelper.clearGroupInfo === "function") GroupInfoHelper.clearGroupInfo(); } catch (e) { console.warn(e); }
    //try { if (typeof GroupPermissionHelper !== "undefined" && typeof GroupPermissionHelper.clearGroupPermissionForm === "function") GroupPermissionHelper.clearGroupPermissionForm(); } catch (e) { console.warn(e); }
    //try { if (typeof MenuPermissionHelper !== "undefined" && typeof MenuPermissionHelper.clearMenuPermission === "function") MenuPermissionHelper.clearMenuPermission(); } catch (e) { console.warn(e); }
    //try { if (typeof AccessControlHelper !== "undefined" && typeof AccessControlHelper.clearAccessPermission === "function") AccessControlHelper.clearAccessPermission(); } catch (e) { console.warn(e); }
    //try { if (typeof StateHelper !== "undefined" && typeof StateHelper.clearStatusPermission === "function") StateHelper.clearStatusPermission(); } catch (e) { console.warn(e); }
    //try { if (typeof ActionHelper !== "undefined" && typeof ActionHelper.clearActionPermission === "function") ActionHelper.clearActionPermission(); } catch (e) { console.warn(e); }
    //try { if (typeof ReportPermissionHelper !== "undefined" && typeof ReportPermissionHelper.clearReportPermission === "function") ReportPermissionHelper.clearReportPermission(); } catch (e) { console.warn(e); }

    // DOM widget resets (defensive)
    try {
      // basic fields
      $("#hdnGroupId").val("0");
      $("#txtGroupName").val("");

      // 01. Clear "Is Default" checkbox
      $("#chkIsDefault").prop("checked", false);

      // 02. Clear dynamically generated Module Permission checkboxes
      $("#dynamicCheckBoxForModule .module-checkbox").prop("checked", false);

      // Clear access control
      accessArray = [];
      if ($("#checkboxAccess").length > 0) {
        $("#checkboxAccess").empty();
      }

      // 03. Clear Customized Report Permission checkboxes
      reportPermissionArray = [];
      if ($("#checkboxReportPermission").length > 0) {
        $("#checkboxReportPermission input[type='checkbox']").prop("checked", false);
      }

      // kendo combobox resets
      var cmdModule = $("#cmd-module").data("kendoComboBox");
      if (cmdModule) { cmdModule.value(""); cmdModule.setDataSource(new kendo.data.DataSource({ data: [] })); }

      var cmbParent = $("#cmb-parent-Group").data("kendoComboBox");
      if (cmbParent) { cmbParent.value(""); cmbParent.setDataSource(new kendo.data.DataSource({ data: [] })); }

      var cmbAppModule = $("#cmbApplicationForModule").data("kendoComboBox");
      if (cmbAppModule) { cmbAppModule.value(""); cmbAppModule.setDataSource(new kendo.data.DataSource({ data: [] })); }

      // destroy / clear treeview
      if ($("#treeview").length) {
        var tv = $("#treeview").data("kendoTreeView");
        if (tv && typeof tv.destroy === "function") tv.destroy();
        $("#treeview").empty();
      }

      // Clear State Section
      stateArray = [];
      statePermissionArray = [];
      if ($("#checkboxStatePermission").length > 0) {
        $("#checkboxStatePermission").empty();
      }

      // Clear Action Section
      actionArray = [];
      if ($("#checkboxActionPermission").length > 0) {
        $("#checkboxActionPermission").empty();
      }

      // validation / status
      $("#divdetailsForDetails").find(".k-tooltip-validation").hide();
      $("#divdetailsForDetails").find(".field-validation-error").removeClass("field-validation-error").addClass("field-validation-valid");
      $(".status").text("").removeClass("invalid valid");

      //// reset tabs
      //var tabStrip = $("#tabstrip").data("kendoTabStrip");
      //if (tabStrip) tabStrip.select(0);

    } catch (e) {
      console.warn("Error resetting DOM widgets:", e);
    }

    // reset in-memory arrays used across permission helpers
    try { if (typeof moduleArray !== "undefined") moduleArray.length = 0; } catch (e) {}
    try { if (typeof menuArray !== "undefined") menuArray.length = 0; } catch (e) {}
    try { if (typeof allmenuArray !== "undefined") allmenuArray.length = 0; } catch (e) {}
    try { if (typeof accessArray !== "undefined") accessArray.length = 0; } catch (e) {}
    try { if (typeof groupPermisionArray !== "undefined") groupPermisionArray.length = 0; } catch (e) {}

    console.debug("GroupDetailsHelper.clearGroupForm: UI widgets and in-memory permission arrays cleared.");
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
    try { if (cmbParentGroup && typeof cmbParentGroup.destroy === "function") cmbParentGroup.destroy(); } catch (e) {}

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
    //objGroupInfo = MenuPermissionHelper.createMenuPermission(objGroupInfo);
    //objGroupInfo = AccessControlHelper.createAccessPermission(objGroupInfo);
    //objGroupInfo = StateHelper.createStatusPermission(objGroupInfo);
    //objGroupInfo = ActionHelper.createActionPermission(objGroupInfo);
    //objGroupInfo = ReportPermissionHelper.createReportPermission(objGroupInfo);
    return objGroupInfo;
  },

};
