var groupPermisionArray = [];
var groupArray = [];

var GroupMembershipManager = {

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

    var objGroupMemberList = "";
    var jsonParam = "userId=" + userId;
    var serviceUrl = "../Users/GetGroupMemberByUserId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objGroupMemberList = jsonData;
    }
    function onFailed(error) {

      window.alert(error.statusText);
    }
    return objGroupMemberList;
  }

};

var GroupMembershipHelper = {
  initGroupMembers: function () {
    GroupMembershipHelper.getGroups();
  },

  getGroups: async function (companyId) {
    groupArray = [];

    var groups = await GroupMembershipManager.getGroups();
    var link = "";

    for (var i = 0; i < groups.length; i++) {
      link += "<div><input type=\"checkbox\" class=\"chkBox\" id=\"chkGroup" + groups[i].GroupId + "\" onclick=\"GroupMembershipHelper.populateGroupPermisionArray(" + groups[i].GroupId + ", '" + groups[i].GroupName + "', this.id)\"/> " + groups[i].GroupName + "</div>";
      groupArray.push(groups[i]);
    }
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

  CreateGroupMemberForSaveData: function (objUser) {
    objUser.GroupMembers = groupPermisionArray;
    return objUser;
  },

  populateGroupMember: function (objUser) {
    groupPermisionArray = [];
    var memberList = groupMembershipManager.GetGroupMemberByUserId(objUser.UserId);
    for (var i = 0; i < memberList.length; i++) {
      $('#chkGroup' + memberList[i].GroupId).attr('checked', true);
      var obj = new Object();
      obj.GroupId = memberList[i].GroupId;
      obj.GroupName = "";
      groupPermisionArray.push(obj);
    }
  }

};