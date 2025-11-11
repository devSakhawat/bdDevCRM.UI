/// <reference path="accesscontroldetails.js" />
/// <reference path="accesscontrolsummary.js" />


$(document).ready(function () {
    //AccessControlSummaryManager.GenerateAccessControlGrid();
  //AccessControlSummaryHelper.GeRowDataOfAccessControlGrid();

  AccessControlSummaryHelper.initAccessControlSummary();

    $("#txtAccessControlName").focus();
});