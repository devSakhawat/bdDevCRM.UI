$(document).ready(function () {

    userInformationHelper.initiateUsersInformationHelper();


});



var userInformationManager = {};

var userInformationHelper = {

    initiateUsersInformationHelper: function () {
        userInformationDetailsHelper.initiateUserInformationDetails();
        userInformationSummaryHelper.initateUserInformationSummary();

    }

};