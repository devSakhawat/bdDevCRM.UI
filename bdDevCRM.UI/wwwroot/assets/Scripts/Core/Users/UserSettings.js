/// <reference path="UserSummary.js" />
/// <reference path="UserDetails.js" />
/// <reference path="UserInfo.js" />
/// <reference path="UserUpload.js" />


$(document).ready(async function () {
  await UserSummaryHelper.populateCompany();
  await UserInfoHelper.initUserInfo();
  UserSummaryHelper.initSummary();
  UserDetailsHelper.initDetails();
  await GroupMembershipHelper.initGroupMembers();

  $("#cmbDepartmentNameDetails").change(function () {
    UserInfoHelper.changeDepartmentNamechangeDepartmentNamechangeDepartmentName();
  });
  //userInfoHelper.populateCompany();


  // userDetailsHelper.createTab();
  // userSummaryHelper.clickEventForResetPassword();
  // userSummaryHelper.clickEventForEditUser();
  // userSummaryHelper.GenerateMotherCompanyCombo();
  //// userInfoHelper.GenerateMotherCompanyCombo();
  // userSummaryHelper.CompanyIndexChangeEvent();
  // // userInfoHelper.GetEmployeeByCompanyId(0);
  // userUploadManager.userUpload();

  $("#cmbCompanyNameDetails").change(function () {
    UserInfoHelper.changeCompanyName();
  });
  $("#cmbCompanyNameDetails").focus();
});

var userSettingsManager = {};

var userSettingsHelper = {};

