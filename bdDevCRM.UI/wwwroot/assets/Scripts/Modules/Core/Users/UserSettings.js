/// <reference path="UserSummary.js" />
/// <reference path="UserDetails.js" />
/// <reference path="UserInfo.js" />
/// <reference path="UserUpload.js" />


$(document).ready(async function () {
  UserSummaryHelper.initSummary();
  await UserInfoHelper.initUserInfo();
  await UserSummaryHelper.populateCompany();
  UserDetailsHelper.initDetails();
  await GroupMembershipHelper.initGroupMembers();
  UserSummaryHelper.setGridDataSource();
  $("#cmbCompanyNameDetails").change(function () {
    UserInfoHelper.changeCompanyName();
  });
  $("#cmbCompanyNameDetails").focus();
});

var userSettingsManager = {};

var userSettingsHelper = {};

