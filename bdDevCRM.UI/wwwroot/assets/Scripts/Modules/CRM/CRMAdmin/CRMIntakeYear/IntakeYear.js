/// <reference path="../../common/common.js" />

$(document).ready(function () {
  IntakeYearManager.initIntakeYear();
});

var IntakeYearManager = {
  initIntakeYear: function () {
    IntakeYearDetailsHelper.intakeYearInit();
    IntakeYearSummaryHelper.initIntakeYearSummary();
  }
};