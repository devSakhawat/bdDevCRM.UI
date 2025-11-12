
/// <reference path="actionpermission.js" />
/// <reference path="group.js" />
/// <reference path="groupdetails.js" />
/// <reference path="groupinfo.js" />
/// <reference path="grouppermission.js" />
/// <reference path="groupsummary.js" />
/// <reference path="menupermission.js" />
/// <reference path="reportpermission.js" />
/// <reference path="statepermission.js" />

var accessArray = [];
var accessPermissionArray = [];
var gbModuleId = 0;

var AccessControlManager = {
  getAllAccessControl: async function () {
    const serviceUrl = "/getaccess";

    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);

      if (response && response.IsSuccess === true) {
        return response.Data;
      } else {
        throw new Error(response?.Message || "Failed to load access control data");
      }
    } catch (error) {
      console.error("Error loading access control:", error);
      throw error;
    }
  }
};

var AccessControlHelper = {

  //getAllAccessControl: async function (moduleId) {
  //  var mediumLoader = $('#checkboxAccess').kendoLoader({ size: 'medium', type: 'infinite-spinner' }).data("kendoLoader");

  //  try {
  //    accessArray = [];
  //    gbModuleId = moduleId;
  //    const objAccessList = await AccessControlManager.getAllAccessControl();
  //    if (!objAccessList || objAccessList.length === 0) {
  //      $("#checkboxAccess").html('<div class="col-12"><p class="text-muted">No access controls available</p></div>');
  //      return;
  //    }

  //    const checkboxHtml = objAccessList.map(access => {
  //      accessArray.push(access);

  //      return `
  //        <div class="col-12">
  //          <div class="d-flex justify-content-start align-items-center access-item">
  //            <input type="checkbox"
  //                   class="form-check-input"
  //                   id="chkAccess${access.AccessId}"
  //                   onclick="AccessControlHelper.populateAccessPermissionArray(${access.AccessId}, '${access.AccessName}')" />
  //            <label for="chkAccess${access.AccessId}" class="tree-label ms-1">${access.AccessName}</label>
  //          </div>
  //        </div>
  //      `;
  //    }).join('');

  //    $("#checkboxAccess").html(checkboxHtml);
  //    AccessControlHelper.checkExistingAccessPermission(moduleId);

  //  } catch (error) {
  //    console.error("Error in getAllAccessControl:", error);
  //    // Error already shown by VanillaApiCallManager
  //    $("#checkboxAccess").html('<div class="col-12"><p class="text-danger">Failed to load access controls</p></div>');
  //  } finally {
  //    mediumLoader.hide();
  //  }
  //},

  getAllAccessControl: async function (moduleId) {
    $("#checkboxAccess").empty();
    accessArray = [];
    gbModuleId = moduleId;

    var loaderContainer = $('#accessSectionLoader');
    var loader = loaderContainer.kendoLoader({
      size: 'large',
      type: 'infinite-spinner',
      themeColor: 'primary'
    }).data("kendoLoader");

    try {

      loaderContainer.show();
      loader.show();

      const objAccessList = await AccessControlManager.getAllAccessControl();

      if (!objAccessList || objAccessList.length === 0) {
        $("#checkboxAccess").html('<div class="col-12"><p class="text-muted">No access controls available</p></div>');
        return;
      }

      const checkboxHtml = objAccessList.map(access => {
        accessArray.push(access);

        return `
          <div class="col-12">
            <div class="d-flex justify-content-start align-items-center access-item">
              <input type="checkbox" 
                     class="form-check-input" 
                     id="chkAccess${access.AccessId}" 
                     onclick="AccessControlHelper.populateAccessPermissionArray(${access.AccessId}, '${access.AccessName}')" />
              <label for="chkAccess${access.AccessId}" class="tree-label ms-2">${access.AccessName}</label>
            </div>
          </div>
        `;
      }).join('');

      $("#checkboxAccess").html(checkboxHtml);
      AccessControlHelper.checkExistingAccessPermission(moduleId);

    } catch (error) {
      console.error("Error in getAllAccessControl:", error);
      $("#checkboxAccess").html('<div class="col-12"><p class="text-danger">Failed to load access controls</p></div>');
    } finally {
      loaderContainer.hide();
    }
  },

  populateAccessPermissionArray: function (accessId, accessName) {
    const isChecked = $(`#chkAccess${accessId}`).is(':checked');

    if (isChecked) {
      const exists = accessPermissionArray.some(
        item => item.ReferenceID === accessId && item.ParentPermission === gbModuleId
      );

      if (!exists) {
        accessPermissionArray.push({
          ReferenceID: accessId,
          ParentPermission: gbModuleId,
          PermissionTableName: "Access"
        });
      }
    } else {
      const index = accessPermissionArray.findIndex(
        item => item.ReferenceID === accessId && item.ParentPermission === gbModuleId
      );

      if (index !== -1) {
        accessPermissionArray.splice(index, 1);
      }
    }
  },

  createAccessPermission: function (objGroupInfo) {
    objGroupInfo.AccessList = [...accessPermissionArray];
    return objGroupInfo;
  },

  clearAccessPermission: function () {
    accessPermissionArray = [];
    gbModuleId = 0;
    $('.form-check-input[id^="chkAccess"]').prop('checked', false);
  },

  PopulateExistingAccessInArray: function (objGroupPermission) {
    if (!objGroupPermission || !Array.isArray(objGroupPermission)) {
      console.warn("Invalid group permission data");
      return;
    }

    accessPermissionArray = objGroupPermission
      .filter(item => item.PermissionTableName === "Access")
      .map(item => ({
        ReferenceID: item.ReferenceID,
        ParentPermission: item.ParentPermission,
        PermissionTableName: "Access"
      }));
  },

  removeAccessPermissionByModuleId: function (moduleId) {
    accessPermissionArray = accessPermissionArray.filter(
      item => item.ParentPermission !== moduleId
    );
  },

  checkExistingAccessPermission: function (moduleId) {
    accessPermissionArray
      .filter(item => item.ParentPermission === moduleId)
      .forEach(item => {
        $(`#chkAccess${item.ReferenceID}`).prop('checked', true);
      });
  }
};