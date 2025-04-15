/// <reference path="UserSummary.js" />
/// <reference path="UserDetails.js" />
/// <reference path="UserInfo.js" />
/// <reference path="UserUpload.js" />


$(document).ready(function () {

  UserSummaryHelper.initSummary();
  UserDetailsHelper.initDetails();
  GroupMembershipHelper.initGroupMembers();
  UserInfoHelper.initUserInfo();

  $("#cmbDepartmentNameDetails").change(function () {
    UserInfoHelper.changeDepartmentName();
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
    userInfoHelper.changeCompanyName();
  });
  $("#cmbCompanyNameDetails").focus();
});

var userSettingsManager = {};

var userSettingsHelper = {};

