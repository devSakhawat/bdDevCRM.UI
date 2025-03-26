$(document).ready(function () {

    boardHelper.initiateBoardHelper();


});



var boardManager = {};

var boardHelper = {

    initiateBoardHelper: function () {
        boardDetailsHelper.initiateBoardDetails();
        boardSummaryHelper.initateBoardSummary();

    }

};