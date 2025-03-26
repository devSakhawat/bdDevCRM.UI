$(document).ready(function () {

    workflowHelper.initiateHelper();


});



var workflowManager = {};

var workflowHelper = {

    initiateHelper: function () {
        workflowDetailsHelper.initiateDetails();
        workflowSummaryHelper.initateSummary();

    }

};