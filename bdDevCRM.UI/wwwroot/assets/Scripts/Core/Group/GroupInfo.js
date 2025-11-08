/// <reference path="accesscontrolpermission.js" />
/// <reference path="actionpermission.js" />
/// <reference path="group.js" />
/// <reference path="groupdetails.js" />
/// <reference path="grouppermission.js" />
/// <reference path="groupsummary.js" />
/// <reference path="menupermission.js" />
/// <reference path="reportpermission.js" />
/// <reference path="statepermission.js" />

var GroupInfoManager = {

  getModules: async function () {
    const serviceUrl = "/modules";

    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load modules");
      }
    } catch (error) {
      console.log("Error loading modules:" + error);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

};

var GroupInfoHelper = {
  initGroupInfoHelper: function () {
    GroupInfoHelper.generateModuleForGroupInfo();
  },

  generateModuleForGroupInfo: async function () {
    var link = "<div class='row'>";
    allmoduleArray = [];

    try {
      const objModuleList = await GroupInfoManager.getModules();

      for (var i = 0; i < objModuleList.length; i++) {
        link += `
                <div class="col-12 mb-1">
                  <div class="d-flex justify-content-start align-items-center pb-01">
                    <span class="widthSize40_per">${objModuleList[i].ModuleName}</span>
                    <input type="checkbox" class="form-check-input module-checkbox" 
                           id="chkModule${objModuleList[i].ModuleId}"
                           data-module-id="${objModuleList[i].ModuleId}"
                           data-module-name="${objModuleList[i].ModuleName}" />
                  </div>
                </div>
                `;
        allmoduleArray.push(objModuleList[i]);
      }
      link += "</div>";

      $("#dynamicCheckBoxForModule").html(link);
      
      // Attach event listeners to all checkboxes
      $("#dynamicCheckBoxForModule").find('.module-checkbox').on('change', function() {
        var moduleId = $(this).data('module-id');
        var moduleName = $(this).data('module-name');
        var controlId = $(this).attr('id');
        GroupPermissionHelper.populateModuleCombo(moduleId, moduleName, controlId);
      });

    } catch (error) {
      console.error("Error fetching modules:", error);
      Message.ErrorWithHeaderText(error);
    }
  },

  clearGroupInfo: function () {
    try {
      // Uncheck and remove dynamic checkboxes
      $("#dynamicCheckBoxForModule").find('input[type="checkbox"]').prop('checked', false);
      //$("#dynamicCheckBoxForModule").empty();

      // Reset text fields and hidden ids
      $('#txtGroupName').val('');
      $("#hdnGroupId").val('0');

      // Reset validator messages and tooltip validations
      try {
        $("#divGroupId > form").kendoValidator();
        $("#divGroupId").find("span.k-tooltip-validation").hide();
      } catch (e) { /* ignore if validator not present */ }

      // Reset status text
      var status = $(".status");
      status.text("").removeClass("invalid").removeClass("valid");

      //// Clear global module array
      //// this array should not be cleared because of this array are responsible after clear the form.
      //try { if (typeof allmoduleArray !== "undefined") allmoduleArray.length = 0; } catch (e) {}

      // Ensure first tab selected
      var tabStrip = $("#tabstrip").data("kendoTabStrip");
      if (tabStrip) {
        tabStrip.select(0); // Select the first tab
      }
    } catch (e) {
      console.warn("GroupInfoHelper.clearGroupInfo error:", e);
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

