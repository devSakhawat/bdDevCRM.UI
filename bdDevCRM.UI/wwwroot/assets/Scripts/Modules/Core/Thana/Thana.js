$(document).ready(function () {

    thanaHelper.initiateHelper();


});



var thanaManager = {};

var thanaHelper = {

    initiateHelper: function () {
        thanaDetailsHelper.initiateDetails();
        thanaSummaryHelper.initateSummary();

    }

};