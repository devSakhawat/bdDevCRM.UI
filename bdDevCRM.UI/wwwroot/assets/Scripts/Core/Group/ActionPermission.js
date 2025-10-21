/// <reference path="accesscontrolpermission.js" />
/// <reference path="group.js" />
/// <reference path="groupdetails.js" />
/// <reference path="groupinfo.js" />
/// <reference path="grouppermission.js" />
/// <reference path="groupsummary.js" />
/// <reference path="menupermission.js" />
/// <reference path="reportpermission.js" />
/// <reference path="statepermission.js" />

var actionArray = [];
var actionPermissionArray = [];

var ActionManager = {

  GetActionByStatusId: function (statusId) {

    var jsonParams = $.param({
      statusId: statusId
    });
    var serviceUrl = "/actions-4-group/status/";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
/*        console.log(jsonData);*/
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

      AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, true, false, onSuccess, onFailed);
    });
  }

};

var ActionHelper = {
  GetActionByStatusId: async function (statusId) {
    actionArray = [];

    var objActionList = await ActionManager.GetActionByStatusId(statusId);
    var link = "";

    for (var i = 0; i < objActionList.length; i++) {

      link += `
            <div class="col-12 mb-1">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <input type="checkbox" class="form-check-input me-2"
                         id="chkAction${objActionList[i].WfactionId}"
                         onclick="ActionHelper.populateActionArray(${objActionList[i].WfactionId}, '${objActionList[i].WfstateId}', this.id)" />
                  <span>${objActionList[i].ActionName}</span>
                </div>
              </div>
            </div>
          `;



      stateArray.push(objActionList[i]);
    }
    $("#checkboxActionPermission").html(link);
    ActionHelper.checkedExistingActionChangeByStatus(statusId);

  },
  populateActionArray: function (actionId, statusId) {
    if ($("#chkAction" + actionId).is(':checked') == true) {
      var obj = new Object();
      obj.ReferenceID = actionId;
      obj.ParentPermission = statusId;
      obj.PermissionTableName = "Action";
      actionPermissionArray.push(obj);
    }
    else {
      for (var i = 0; i < actionPermissionArray.length; i++) {
        if (actionPermissionArray[i].ReferenceID == actionId) {
          actionPermissionArray.splice(i, 1);
          break;
        }
      }
    }
  },

  checkedExistingActionChangeByStatus: function (statusId) {

    for (var i = 0; i < actionPermissionArray.length; i++) {
      if (actionPermissionArray[i].PermissionTableName == "Action" && actionPermissionArray[i].ParentPermission == statusId) {
        $('#chkAction' + actionPermissionArray[i].ReferenceID).prop('checked', true);
      }
    }
  },

  createActionPermission: function (objGroupInfo) {
    objGroupInfo.ActionList = actionPermissionArray;
    return objGroupInfo;
  },

  clearActionPermission: function () {
    actionPermissionArray = [];
    $('.chkBox').prop('checked', false);
  },

  populateExistingActionInArray: function (objGroupPermission) {
    actionPermissionArray = [];

    for (var i = 0; i < objGroupPermission.length; i++) {
      if (objGroupPermission[i].PermissionTableName == "Action") {
        var obj = new Object();
        obj.ReferenceID = objGroupPermission[i].ReferenceID;
        obj.ParentPermission = objGroupPermission[i].ParentPermission;
        obj.PermissionTableName = "Action";
        actionPermissionArray.push(obj);
      }
    }
  },

  RemoveActionByStatusId: function (statusId) {
    for (var i = 0; i < actionPermissionArray.length; i++) {
      if (actionPermissionArray[i].ParentPermission == statusId) {
        actionPermissionArray.splice(i, 1);
        i = i - 1;
      }
    }
    $("#checkboxActionPermission").html("");
  }
};

