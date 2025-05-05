// <reference path="workflowsummary.js" />
// <reference path="workflowdetail.js" />
// <reference path="statedetails.js" />
// <reference path="actiondetail.js" />


$(document).ready(function () {
  WorkFlowDetailsHelper.createTabstrip();
  WorkFlowSummaryHelper.initWorkFlowSummary();
  StateDetailsHelper.initStateDetails();
  ActionDetailHelper.initActionDetails();

  //StateDetailsHelper.initStateDetails().then(function () {
  //  ActionDetailHelper.initActionDetails();
  //});
});

var WorkFlowSettingsHelper = {


  createImageBitmap: function (image) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var image = new Image();
    image.src = "/assets/Images/WorkFlow/WorkFlowSettings.png";
    image.onload = function () {
      context.drawImage(image, 0, 0);
      var bitmap = context.getImageData(0, 0, canvas.width, canvas.height);
      return bitmap;
    };
  },
};