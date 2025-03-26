$(document).ready(function () {

    instituteTypeHelper.initiateInstituteTypeHelper();


});



var instituteTypeManager = {};

var instituteTypeHelper = {

    initiateInstituteTypeHelper: function () {
        instituteTypeDetailsHelper.initiateInstituteDetails();
        instituteTypeSummaryHelper.initateInstituteTypeSummary();

    }

};