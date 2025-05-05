// <reference path="workflowsummary.js" />
// <reference path="statedetails.js" />
// <reference path="actiondetail.js" />

var WorkFlowDetailsManager = {

}

var WorkFlowDetailsHelper = {
  //createTabstrip: function () {
  //  $("#tabstrip").kendoTabStrip({});
  //},

  createTabstrip: function () {
    $("#tabstrip").kendoTabStrip({
      select: function (e) {
        // Ensure only one tab has the 'k-state-active' class
        $("#tabstrip ul li").removeClass("k-state-active");
        $(e.item).addClass("k-state-active");
      }
    });

    var tabStrip = $("#tabstrip").data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0); // Ensure the first tab is selected by default
    } else {
      console.log("Kendo TabStrip is not initialized.");
    }
  },

}