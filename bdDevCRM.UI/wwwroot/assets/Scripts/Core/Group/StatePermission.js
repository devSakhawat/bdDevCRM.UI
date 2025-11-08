/// <reference path="accesscontrolpermission.js" />
/// <reference path="actionpermission.js" />
/// <reference path="group.js" />
/// <reference path="groupdetails.js" />
/// <reference path="groupinfo.js" />
/// <reference path="grouppermission.js" />
/// <reference path="menupermission.js" />
/// <reference path="groupsummary.js" />
/// <reference path="reportpermission.js" />

var stateArray = [];
var statePermissionArray = [];

var StateManager = {

  GetStatusByMenuId: async function (menuId) {
    debugger;
    const serviceUrl = `/status/key/${menuId}`;
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

var StateHelper = {
  GetStatusByMenuId: async function (menuId) {
    stateArray = [];

    var objStatusList = await StateManager.GetStatusByMenuId(menuId);
    var link = "";

    for (var i = 0; i < objStatusList.length; i++) {
      link += `
              <div class="col-12">
                <div class="d-flex justify-content-start align-items-center access-item">
                  <input type="checkbox"
                         class="form-check-input"
                         id="chkStatus${objStatusList[i].WfStateId}"
                         onclick="StateHelper.populateStateArray(${objStatusList[i].WfStateId}, '${objStatusList[i].MenuId}', this.id)" />
                  <label for="chkAccess${objStatusList[i].WfStateId}" class="tree-label ms-2">${objStatusList[i].StateName}</label>
                </div>
              </div>
            `;

      stateArray.push(objStatusList[i]);
      console.log(objStatusList);
      console.log(stateArray);
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
    $('.chkBox').prop('checked', false);
    stateArray = [];
    statePermissionArray = [];
    if ($("#checkboxStatePermission").length > 0) {
      $("#checkboxStatePermission").empty();
    }
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