
var stateArray = [];
var statePermissionArray = [];

var StateManager = {
  GetStatusByMenuId: function (menuId) {
    var jsonParams = $.param({
      menuId: menuId
    });
    var serviceUrl = "/status/key/";

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

var StateHelper = {
  GetStatusByMenuId: async function (menuId) {
    stateArray = [];

    var objStatusList = await StateManager.GetStatusByMenuId(menuId);
    var link = "";

    for (var i = 0; i < objStatusList.length; i++) {
      link += "<div><input type=\"checkbox\" class=\"chkBox\" id=\"chkStatus" + objStatusList[i].WFStateId + "\" onclick=\"StateHelper.populateStateArray(" + objStatusList[i].WFStateId + ", '" + objStatusList[i].MenuID + "', this.id)\"/>" +
        "<a class=\"alinkGroup \" title=\"View Action Permission\"  id=\"astatus" + objStatusList[i].WFStateId + "\" onclick=\"StateHelper.populateStateArray(" + objStatusList[i].WFStateId + ", '" + objStatusList[i].MenuID + "', this.id)\">" + objStatusList[i].StateName + "</a></div>";
      stateArray.push(objStatusList[i]);

    }
    $("#checkboxStatePermission").html(link);
    StateHelper.checkedExistingStatusChangeByMenu(menuId);

  },

  populateStateArray: function (stateId, menuId) {


    if ($("#chkStatus" + stateId).is(':checked') == true) {
      var obj = new Object();
      obj.ReferenceID = stateId;
      obj.ParentPermission = menuId;
      obj.PermissionTableName = "Status";
      statePermissionArray.push(obj);
      $(".alinkGroup").removeClass("stateBackground");
      $("#astatus" + stateId).addClass("stateBackground");

      ActionHelper.GetActionByStatusId(stateId);
    }
    else {
      for (var i = 0; i < statePermissionArray.length; i++) {
        if (statePermissionArray[i].ReferenceID == stateId) {

          ActionHelper.RemoveActionByStatusId(stateId);

          statePermissionArray.splice(i, 1);
          break;
        }
      }
    }
  },

  checkedExistingStatusChangeByMenu: function (menuId) {

    for (var i = 0; i < statePermissionArray.length; i++) {
      if (statePermissionArray[i].PermissionTableName == "Status" && statePermissionArray[i].ParentPermission == menuId) {
        $('#chkStatus' + statePermissionArray[i].ReferenceID).prop('checked', true);
      }
    }
  },

  createStatusPermission: function (objGroupInfo) {
    objGroupInfo.StatusList = statePermissionArray;
    return objGroupInfo;
  },

  clearStatusPermission: function () {
    statePermissionArray = [];
    $('.chkBox').prop('checked', false);
  },

  populateExistingStatusInArray: function (objGroupPermission) {
    statePermissionArray = [];
    for (var i = 0; i < objGroupPermission.length; i++) {
      if (objGroupPermission[i].PermissionTableName == "Status") {
        var obj = new Object();
        obj.ReferenceID = objGroupPermission[i].ReferenceID;
        obj.ParentPermission = objGroupPermission[i].ParentPermission;
        obj.PermissionTableName = "Status";
        statePermissionArray.push(obj);
      }
    }
  },

  RemoveStatusByMenuId: function (menuId) {
    for (var i = 0; i < statePermissionArray.length; i++) {
      if (statePermissionArray[i].ParentPermission == menuId) {
        ActionHelper.RemoveActionByStatusId(statePermissionArray[i].ReferenceID);
        statePermissionArray.splice(i, 1);
        i = i - 1;
      }
    }
    $("#checkboxStatePermission").html("");
  }

};