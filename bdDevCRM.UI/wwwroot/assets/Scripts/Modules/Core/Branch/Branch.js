$(document).ready(function () {

    branchHelper.initiateBranchHelper();


});



var branchManager = {};

var branchHelper = {

    initiateBranchHelper: function () {
        branchDetailsHelper.initiateBranchDetails();
        branchSummaryHelper.initateBranchSummary();

    }

};