/// <reference path="accesscontrolpermission.js" />
/// <reference path="actionpermission.js" />
/// <reference path="groupdetails.js" />
/// <reference path="groupinfo.js" />
/// <reference path="grouppermission.js" />
/// <reference path="groupsummary.js" />
/// <reference path="menupermission.js" />
/// <reference path="reportpermission.js" />
/// <reference path="statepermission.js" />


var GroupManager = {};

var GroupHelper = {
  initGroupHelper: function () {
    //GroupSummaryHelper.initGroupSummary();
    //GroupDetailsHelper.initGroupDetails();
    //GroupInfoHelper.initGroupInfoHelper();

    GroupDetailsHelper.createTab();
    GroupInfoHelper.generateModuleForGroupInfo();
    GroupSummaryHelper.initializeSummaryGrid(); // for groupSummaryManager.GenerateGroupGrid();
    //GroupSummaryHelper.clickEventForEditGroup(); 
    ReportPermissionHelper.GetReportInformation();
  },
};

$(document).ready(function () {
  GroupHelper.initGroupHelper();
  GroupPermissionHelper.initModuleCombo();
});