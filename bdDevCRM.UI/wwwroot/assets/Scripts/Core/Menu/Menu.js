
// MenuHelper used for load sidebar menu

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