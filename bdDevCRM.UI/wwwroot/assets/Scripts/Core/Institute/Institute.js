$(document).ready(function () {

    instituteHelper.initiateInstituteHelper();


});



var instituteManager = {};

var instituteHelper = {

    initiateInstituteHelper: function () {
        instituteDetailsHelper.initiateInstituteDetails();
        instituteSummaryHelper.initateInstituteSummary();

    }

};