var moduleArray = [];

var GroupPermissionManager = {

  groupPermissionbyGroupId: function (groupId) {

    var jsonParams = $.param({
      groupId: groupId
    });
    var serviceUrl = "/grouppermission/key/";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
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
  }

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
      moduleArray.push(obj);
    }
    else {
      for (var i = 0; i < moduleArray.length; i++) {
        if (moduleArray[i].ReferenceID == moduleId) {

          MenuPermissionHelper.DeleteFormMenuByModuleId(moduleArray[i].ReferenceID);
          AccessControlHelper.RemoveAccessPermissionByModuleId(moduleArray[i].ReferenceID);
          moduleArray.splice(i, 1);
        }
      }
    }

    $("#cmbApplicationForModule").kendoComboBox({
      placeholder: "Select a module",
      dataTextField: "ModuleName",
      dataValueField: "ReferenceID",
      select: GroupPermissionHelper.onSelect,
      dataSource: moduleArray
    });

  },

  clearGroupPermissionForm: function () {
    moduleArray = [];
    var comboBox = $("#cmbApplicationForModule").data("kendoComboBox");
    if (comboBox) {
      //$('#cmbApplicationForModule').val('');
      comboBox.value("");
      //comboBox.setDataSource(new kendo.data.DataSource({ data: moduleArray }))
    }
    else {
      $("#cmbApplicationForModule").kendoComboBox({
        placeholder: "Select a module",
        dataTextField: "ModuleName",
        dataValueField: "ReferenceID",
        dataSource: moduleArray
      });
    }
    
  },

  onSelect: function (e) {
    var dataItem = this.dataItem(e.item.index());
    MenuPermissionHelper.populateMenuTreeByModuleId(dataItem.ReferenceID);
    AccessControlHelper.getAllAccessControl(dataItem.ReferenceID);
    var mdl = $("#cmbApplicationForModule").data("kendoComboBox");
    mdl.value(dataItem.ReferenceID);
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

      $("#cmbApplicationForModule").kendoComboBox({
        placeholder: "Select a module",
        dataTextField: "ModuleName",
        dataValueField: "ReferenceID",
        select: GroupPermissionHelper.onSelect,
        dataSource: moduleArray
      });

      MenuPermissionHelper.populateExistingMenuInArray(objGroupPermission);
      AccessControlHelper.PopulateExistingAccessInArray(objGroupPermission);
      StateHelper.populateExistingStatusInArray(objGroupPermission);
      ActionHelper.populateExistingActionInArray(objGroupPermission);
      ReportPermissionHelper.populateExistingReportInArray(objGroupPermission);
    } catch (error) {
      console.log(error);
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 0,
        message: error,
        type: 'error',
      });
      return false;
      //Message.ErrorWithHeaderText('Login Failed', xhr.responseJSON?.statusCode + ": " + xhr.responseJSON?.message, null);
    }
    
  },

  createModulePermission: function (objGroup) {
    objGroup.ModuleList = moduleArray;
    return objGroup;
  },



};