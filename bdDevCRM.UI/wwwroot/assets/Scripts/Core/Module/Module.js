$(document).ready(function () {
    moduleHelper.initiateHelper();


});



var moduleManager = {};

var moduleHelper = {
    initiateHelper: function () {
        moduleDetailsHelper.initiateDetails();
        moduleSummaryHelper.initateSummary();

    }

};