
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