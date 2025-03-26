$(document).ready(function () {

    districtHelper.initiateDistrictHelper();


});



var districtManager = {};

var districtHelper = {

    initiateDistrictHelper: function () {
        districtDetailsHelper.initiateDistrictDetails();
        districtSummaryHelper.initateDistrictSummary();

    }

};