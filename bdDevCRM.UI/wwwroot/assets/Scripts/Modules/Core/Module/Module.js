$(document).ready(function () {
   ModuleHelper.initializeHelper();


});



var ModuleManager = {};

var ModuleHelper = {
   initializeHelper: function () {
      ModuleDetailsHelper.initializeDetails();
      ModuleSummaryHelper.initializeSummary();

    }

};