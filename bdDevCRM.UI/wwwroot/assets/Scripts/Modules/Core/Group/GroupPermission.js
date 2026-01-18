/// <reference path="accesscontrolpermission.js" />
/// <reference path="actionpermission.js" />
/// <reference path="group.js" />
/// <reference path="groupdetails.js" />
/// <reference path="groupinfo.js" />
/// <reference path="groupsummary.js" />
/// <reference path="menupermission.js" />
/// <reference path="reportpermission.js" />
/// <reference path="statepermission.js" />

var moduleArray = [];

var GroupPermissionManager = {

  groupPermissionbyGroupId: async function (groupId) {
    debugger;
    if (!groupId) {
      return Promise.resolve([]);
    }

    const serviceUrl = `/grouppermission/${groupId}`;
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
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
  },

};

var GroupPermissionHelper = {

  initModuleCombo: function () {
    $("#cmbApplicationForModule").kendoComboBox({
      placeholder: "Select a module",
      dataTextField: "ModuleName",
      dataValueField: "ReferenceID",
      dataSource: []
    });
  },

  populateModuleCombo: function (moduleId, moduleName, controlId) {
    var obj = new Object();
    obj.ReferenceID = moduleId;
    obj.ModuleName = moduleName;
    obj.PermissionTableName = "Module";
    $("#cmbApplicationForModule").val('');

    if ($("#" + controlId).is(':checked') == true) {
      // Add item to array
      moduleArray.push(obj);
    }
    else {
      // Remove item from array
      moduleArray = moduleArray.filter(function(item) {
        if (item.ReferenceID == moduleId) {
          MenuPermissionHelper.deleteFormMenuByModuleId(item.ReferenceID);
          AccessControlHelper.removeAccessPermissionByModuleId(item.ReferenceID);
          return false; // Remove this item
        }
        return true; // Keep other items
      });
    }

    // Update ComboBox DataSource
    var comboBox = $("#cmbApplicationForModule").data("kendoComboBox");
    if (comboBox) {
      comboBox.setDataSource(moduleArray);

      // Unbind existing select event first to avoid duplicates
      comboBox.unbind("select");

      // Rebind select event
      comboBox.bind("select", GroupPermissionHelper.onSelect);
    } else {
      $("#cmbApplicationForModule").kendoComboBox({
        placeholder: "Select a module",
        dataTextField: "ModuleName",
        dataValueField: "ReferenceID",
        select: GroupPermissionHelper.onSelect,
        dataSource: moduleArray
      });
    }
  },

  clearGroupPermissionForm: function () {
    try {
      moduleArray = [];
      var comboBox = $("#cmbApplicationForModule").data("kendoComboBox");
      if (comboBox) {
        comboBox.value("");
        comboBox.setDataSource(new kendo.data.DataSource({ data: [] }));
      } else {
        $("#cmbApplicationForModule").val("");
      }

      // Ensure menu tree and related arrays cleared if MenuPermissionHelper exists
      try {
        if (typeof MenuPermissionHelper !== "undefined" && typeof MenuPermissionHelper.clearMenuPermission === "function") {
          //MenuPermissionHelper.clearMenuPermission();
        } else {
          if (typeof menuArray !== "undefined") menuArray.length = 0;
          if ($("#treeview").length) {
            var tv = $("#treeview").data("kendoTreeView");
            if (tv && typeof tv.destroy === "function") tv.destroy();
            $("#treeview").empty();
          }
        }
      } catch (e) {
        //console.warn(e);
        VanillaApiCallManager.handleApiError(e);
      }

    } catch (e) {
      //console.warn("GroupPermissionHelper.clearGroupPermissionForm error:", e);
      VanillaApiCallManager.handleApiError(e);
    }
  },

  onSelect: async function (e) {
    debugger;
    try {
      var dataItem = this.dataItem(e.item.index());
      await AccessControlHelper.getAllAccessControl(dataItem.ReferenceID);
      await MenuPermissionHelper.populateMenuTreeByModuleId(dataItem.ReferenceID);
      var mdl = $("#cmbApplicationForModule").data("kendoComboBox");
      mdl.value(dataItem.ReferenceID);
    } catch (e) {
      //console.error("Error in onSelect:", error);
      VanillaApiCallManager.handleApiError(e);
    }
  },

  populateExistingModule: async function (objGroup) {
    try {
      var objGroupPermission = await GroupPermissionManager.groupPermissionbyGroupId(objGroup.GroupId);
      moduleArray = [];

      for (var i = 0; i < objGroupPermission.length; i++) {
        if (objGroupPermission[i].PermissionTableName == "Module") {

          for (var j = 0; j < allmoduleArray.length; j++) {
            if (allmoduleArray[j].ModuleId == objGroupPermission[i].ReferenceID) {
              $('#chkModule' + objGroupPermission[i].ReferenceID).prop('checked', true);
              var obj = new Object();
              obj.ReferenceID = objGroupPermission[i].ReferenceID;
              obj.ModuleName = allmoduleArray[j].ModuleName;
              obj.PermissionTableName = "Module";
              moduleArray.push(obj);
              break;
            }
          }
        }
      }

      var applicationForModule = $("#cmbApplicationForModule").data("kendoComboBox");
      if (applicationForModule) {
        applicationForModule.setDataSource(moduleArray);
        applicationForModule.unbind("select");
        applicationForModule.bind("select", GroupPermissionHelper.onSelect);
      }
      else {
        $("#cmbApplicationForModule").kendoComboBox({
          placeholder: "Select a module",
          dataTextField: "ModuleName",
          dataValueField: "ReferenceID",
          select: GroupPermissionHelper.onSelect,
          dataSource: moduleArray
        });
      }
      

      MenuPermissionHelper.populateExistingMenuInArray(objGroupPermission);
      AccessControlHelper.PopulateExistingAccessInArray(objGroupPermission);
      StateHelper.populateExistingStatusInArray(objGroupPermission);
      ActionHelper.populateExistingActionInArray(objGroupPermission);
      ReportPermissionHelper.populateExistingReportInArray(objGroupPermission);
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
      return false;
    }
    
  },

  createModulePermission: function (objGroup) {
    objGroup.ModuleList = moduleArray;
    return objGroup;
  },

};