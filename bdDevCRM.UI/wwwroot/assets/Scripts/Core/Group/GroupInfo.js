
var GroupInfoManager = {

  getModules: function () {
    var jsonParams = "";
    var serviceUrl = "/modules";

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
  },

};

var GroupInfoHelper = {
  initGroupInfoHelper: function () {
    GroupInfoHelper.generateModuleForGroupInfo();
  },

  generateModuleForGroupInfo: async function () {
    var link = "<ul class='moduleCheckList'>";
    allmoduleArray = [];

    try {
      // Await the result of getModules
      const objModuleList = await GroupInfoManager.getModules();
      //console.log(objModuleList);

      for (var i = 0; i < objModuleList.length; i++) {
        link += "<li class='mb-2'><input type=\"checkbox\" class=\"chkBox\" id=\"chkModule" + objModuleList[i].ModuleId + "\" onclick=\"GroupPermissionHelper.populateModuleCombo(" + objModuleList[i].ModuleId + ", '" + objModuleList[i].ModuleName + "', this.id)\"/> " + objModuleList[i].ModuleName + "</li>";
        allmoduleArray.push(objModuleList[i]);
      }
      link += "</ul>";
      $("#dynamicCheckBoxForModule").html(link);
    } catch (error) {
      console.error("Error fetching modules:", error);
      Message.ErrorWithHeaderText(error);
    }
  },

  clearGroupInfo: function () {
    $('.chkBox').prop('checked', false); // Use .prop() instead of .prop()
    $('#txtGroupName').val('');
    $("#hdnGroupId").val('0');
    $("#divGroupId > form").kendoValidator();
    $("#divGroupId").find("span.k-tooltip-validation").hide();
    var status = $(".status");
    status.text("").removeClass("invalid");

    // Ensure the Kendo TabStrip is fully initialized
    var tabStrip = $("#tabstrip").data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0); // Select the first tab
    } else {
      Message.ErrorWithHeaderText(error);
    }
  },

  populateGroupInfoDetails: function (objGroup) {
    $("#hdnGroupId").val(objGroup.GroupId);
    $("#txtGroupName").val(objGroup.GroupName);
    $('#chkIsDefault').prop('checked', objGroup.IsDefault == 1 ? true : false);
  },

  validateForm: function () {
    var data = [];
    var validator = $("#divGroupId").kendoValidator().data("kendoValidator"),
      status = $(".status");
    if (validator.validate()) {
      status.text("").addClass("valid");
      return true;
    } else {
      var tabStrip = $("#tabstrip").kendoTabStrip().data("kendoTabStrip");
      tabStrip.select(0);
      status.text("Oops! There is invalid data in the form.").addClass("invalid");
      return false;
    }

  },

  createGroupInfo: function () {
    var objGroupInfo = new Object();
    objGroupInfo.GroupId = $("#hdnGroupId").val();
    objGroupInfo.GroupName = $("#txtGroupName").val();
    objGroupInfo.IsDefault = $("#chkIsDefault").is(':checked') == true ? 1 : 0;
    return objGroupInfo;
  },
};

