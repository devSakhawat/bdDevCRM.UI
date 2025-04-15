
var accessArray = [];
var accessPermissionArray = [];
var gbModuleId = 0;
var AccessControlManager = {
  getAllAccessControl: function () {

    var jsonParams = "";
    var serviceUrl = "/getaccess";

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

var AccessControlHelper = {
  getAllAccessControl: async function (moduleId) {
    accessArray = [];
    gbModuleId = moduleId;
    var objAccessList = await AccessControlManager.getAllAccessControl();
    var link = "";

    for (var i = 0; i < objAccessList.length; i++) {
      link += "<div><input type=\"checkbox\" class=\"chkBox\" id=\"chkAccess" + objAccessList[i].AccessId + "\" onclick=\"AccessControlHelper.populateAccessPermissionArray(" + objAccessList[i].AccessId + ", '" + objAccessList[i].AccessName + "', this.id)\"/> " + objAccessList[i].AccessName + "</div>";
      accessArray.push(objAccessList[i]);
    }
    $("#checkboxAccess").html(link);
    AccessControlHelper.checkExistingAccessPermission(moduleId);
  },

  populateAccessPermissionArray: function (accessId, accessName) {

    if ($("#chkAccess" + accessId).is(':checked') == true) {
      var obj = new Object();
      obj.ReferenceID = accessId;
      obj.ParentPermission = gbModuleId;
      obj.PermissionTableName = "Access";
      accessPermissionArray.push(obj);
    }
    else {
      for (var i = 0; i < accessPermissionArray.length; i++) {
        if (accessPermissionArray[i].ReferenceID == accessId && accessPermissionArray[i].ParentPermission == gbModuleId) {
          accessPermissionArray.splice(i, 1);
          break;
        }
      }
    }
  },

  createAccessPermission: function (objGroupInfo) {
    objGroupInfo.AccessList = accessPermissionArray;
    return objGroupInfo;
  },

  clearAccessPermission: function () {
    accessPermissionArray = [];
    gbModuleId = 0;
    $('.chkBox').prop('checked', false);
  },
  PopulateExistingAccessInArray: function (objGroupPermission) {
    accessPermissionArray = [];
    for (var i = 0; i < objGroupPermission.length; i++) {
      if (objGroupPermission[i].PermissionTableName == "Access") {
        var obj = new Object();
        obj.ReferenceID = objGroupPermission[i].ReferenceID;
        obj.ParentPermission = objGroupPermission[i].ParentPermission;
        obj.PermissionTableName = "Access";
        accessPermissionArray.push(obj);
        //$('#chkAccess' + objGroupPermission[i].ReferenceID).prop('checked', true);
      }
    }
  },

  RemoveAccessPermissionByModuleId: function (moduleId) {
    for (var i = 0; i < accessPermissionArray.length; i++) {
      if (accessPermissionArray[i].ParentPermission == moduleId) {
        accessPermissionArray.splice(i, 1);
        i = i - 1;
      }
    }
  },

  checkExistingAccessPermission: function (moduleId) {
    for (var j = 0; j < accessPermissionArray.length; j++) {
      if (accessPermissionArray[j].ParentPermission == moduleId) {
        $('#chkAccess' + accessPermissionArray[j].ReferenceID).prop('checked', true);
      }
    }
  }

};