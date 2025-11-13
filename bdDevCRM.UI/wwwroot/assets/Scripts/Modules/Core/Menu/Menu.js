
// MenuHelper used for load sidebar menu into common.js file

var menuManager = {};

var menuHelper = {
  initMenuHelper: function () {
    MenuSummaryHelper.initMenuSummary();
    MenuDetailsHelper.initMenuDetails();
  },
};

$(document).ready(function () {
  menuHelper.initMenuHelper();
});