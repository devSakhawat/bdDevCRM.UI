var groupPermisionArray = [];
var groupArray = [];

var GroupMembershipManager = {

  // in data service don't use companyId
  //GetGroupByCompanyId: function (companyId) {
  getGroups: function () {
    let groups = [];
    var jsonParams = "";
    var serviceUrl = "/groups";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
        groups = jsonData;
        resolve(groups);
      }

      function onFailed(jqXHR, textStatus, errorThrown) {
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: jqXHR.responseJSON?.message + "(" + jqXHR.responseJSON?.statusCode + ")",
          type: 'error',
        });
        reject(errorThrown);
      }

      AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, true, false, onSuccess, onFailed);
    });
  },

  getGroupMemberByUserId: function (userId) {

    var jsonParams = $.param({
      userId: userId
    });
    var serviceUrl = "/groups/group-members-by-userId/";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
        groups = jsonData;
        resolve(groups);
      }

      function onFailed(jqXHR, textStatus, errorThrown) {
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: jqXHR.responseJSON?.message + "(" + jqXHR.responseJSON?.statusCode + ")",
          type: 'error',
        });
        reject(errorThrown);
      }

      AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, true, false, onSuccess, onFailed);
    });
  }

};

var GroupMembershipHelper = {
  initGroupMembers: async function () {
    await GroupMembershipHelper.getGroups();
  },

  //GetGroupByCompanyId
  getGroups: async function (companyId) {
    groupArray = [];

    //GetGroupByCompanyId
    var groups = await GroupMembershipManager.getGroups();
    var link = "<div class='row'>";

    for (var i = 0; i < groups.length; i++) {
      link += `
      <div class="col-12 mb-2">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-1">
          <span>${groups[i].GroupName}</span>
          <input type="checkbox" class="form-check-input"
                 id="chkGroup${groups[i].GroupId}"
                 onclick="GroupMembershipHelper.populateGroupPermisionArray(${groups[i].GroupId}, '${groups[i].GroupName}', this.id)" />
        </div>
      </div>
    `;
      groupArray.push(groups[i]);
    }

    link += "</div>";
    $("#checkboxGroup").html(link);
  },

  populateGroupPermisionArray: function (groupId, groupName) {
    if ($("#chkGroup" + groupId).is(':checked') == true) {
      var obj = new Object();
      obj.GroupId = groupId;
      obj.GroupName = groupName;
      groupPermisionArray.push(obj);
    }
    else {
      for (var i = 0; i < groupPermisionArray.length; i++) {
        if (groupPermisionArray[i].GroupId == groupId) {
          groupPermisionArray.splice(i, 1);
        }
      }
    }
  },

  clearGroupMembershipForm: function () {
    $("#checkboxGroup").html("");
    $('.chkBox').attr('checked', false);
    groupPermisionArray = [];
  },

  createGroupMemberForSaveData: function (objUser) {
    objUser.GroupMembers = groupPermisionArray;
    return objUser;
  },

  populateGroupMember: async function (selectedItem) {
    groupPermisionArray = [];
    var memberList = await GroupMembershipManager.getGroupMemberByUserId(selectedItem.UserId);
    for (var i = 0; i < memberList.length; i++) {
      $('#chkGroup' + memberList[i].GroupId).attr('checked', true);
      var obj = new Object();
      obj.GroupId = memberList[i].GroupId;
      obj.GroupName = "";
      groupPermisionArray.push(obj);
    }
  }

};