var reportArray = [];
var reportPermissionArray = [];

var ReportPermissionManager = {

  GetCustomizedReportInfo: async function () {

    var jsonParams = "";
    var serviceUrl = "/customized-report";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
        resolve(jsonData);
      }

      function onFailed(jqXHR, textStatus, errorThrown) {
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: jqXHR.responseJSON?.statusCode + ": " + jqXHR.responseJSON?.message,
          type: 'error',
        });
        reject(errorThrown);
      }

      AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, false, false, onSuccess, onFailed);
    });


  }

};

var ReportPermissionHelper = {

  GetReportInformation: async function () {
    reportArray = [];

    var objReportList = await ReportPermissionManager.GetCustomizedReportInfo();
    try {
      var link = "";

      for (var i = 0; i < objReportList.length; i++) {
        link += "<div><input type=\"checkbox\" class=\"chkBox\" id=\"chkReport" + objReportList[i].ReportHeaderId + "\" onclick=\"ReportPermissionHelper.populateCustmizedReportArray(" + objReportList[i].ReportHeaderId + ", this.id)\"/>" +
          "<a class=\"alinkGroup \" title=\"View Report Permission\"  id=\"areport" + objReportList[i].ReportHeaderId + "\" onclick=\"ReportPermissionHelper.populateCustmizedReportArray(" + objReportList[i].ReportHeaderId + "', this.id)\">" + objReportList[i].ReportHeader + "</a></div>";

        reportArray.push(objReportList[i]);
      }
      $("#checkboxReportPermission").html(link);

    } catch (error) {
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 0,
        message: error,
        type: 'error',
      });
      return false;
      //Message.ErrorWithHeaderText('Login Failed', xhr.responseJSON?.statusCode + ": " + xhr.responseJSON?.message, null);
    }

  },

  populateCustmizedReportArray: function (reportHeaderId) {
    if ($("#chkReport" + reportHeaderId).is(':checked') == true) {
      var obj = new Object();
      obj.ReferenceID = reportHeaderId;
      obj.ParentPermission = -1;
      obj.PermissionTableName = "Customized Report";
      reportPermissionArray.push(obj);
      $(".alinkGroup").removeClass("stateBackground");
      $("#areport" + reportHeaderId).addClass("stateBackground");
    }
    else {
      for (var i = 0; i < reportPermissionArray.length; i++) {
        if (reportPermissionArray[i].ReferenceID == reportHeaderId) {
          reportPermissionArray.splice(i, 1);
          break;
        }
      }
    }
  },

  createReportPermission: function (objGroupInfo) {
    objGroupInfo.ReportList = reportPermissionArray;
    return objGroupInfo;
  },

  clearReportPermission: function () {
    reportPermissionArray = [];
    $('.chkBox').prop('checked', false);
  },

  populateExistingReportInArray: function (objGroupPermission) {
    reportPermissionArray = [];
    for (var i = 0; i < objGroupPermission.length; i++) {
      if (objGroupPermission[i].PermissionTableName == "Customized Report") {
        var obj = new Object();
        obj.ReferenceID = objGroupPermission[i].ReferenceID;
        obj.ParentPermission = objGroupPermission[i].ParentPermission;
        obj.PermissionTableName = "Customized Report";
        $('#chkReport' + objGroupPermission[i].ReferenceID).prop('checked', true);

        reportPermissionArray.push(obj);
      }
    }
  },

};