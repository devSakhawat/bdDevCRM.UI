$(document).ready(function () {

    userGroupsHelper.initiateUsersGroupHelper();


});



var userGroupsManager = {};

var userGroupsHelper = {

    initiateUsersGroupHelper: function () {
        userGroupDetailsHelper.initiateUserGroupDetails();
        userGroupSummaryHelper.initateUserGroupSummary();

    }

};