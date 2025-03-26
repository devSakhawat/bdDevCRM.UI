$(document).ready(function () {

    accessTypeHelper.initiateHelper();


});



var accessTypeManager = {};

var accessTypeHelper = {

    initiateHelper: function () {
        accessTypeDetailsHelper.initiateDetails();
        accessTypeSummaryHelper.initateSummary();

    }

};