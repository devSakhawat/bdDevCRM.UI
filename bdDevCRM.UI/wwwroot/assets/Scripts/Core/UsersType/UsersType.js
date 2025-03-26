$(document).ready(function () {

    usersTypeHelper.initiateHelper();


});



var usersTypeManager = {};

var usersTypeHelper = {

    initiateHelper: function () {
        userTypeDetailsHelper.initiateDetails();
        userTypeSummaryHelper.initateSummary();

    }

};