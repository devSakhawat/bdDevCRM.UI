
// <reference path="UserDetails.js" />
/// <reference path="../../Common/common.js" />
/// <reference path="GroupMembership.js" />


var UserInfoManager = {

  getEmployeeTypes: function () {
    let groups = [];
    var jsonParams = "";
    var serviceUrl = "/employeetypes";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
        groups = jsonData;
        resolve(groups);
      }

      function onFailed(jqXHR, textStatus, errorThrown) {
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: jqXHR.responseJSON?.message + "(" + jqXHR.responseJSON?.statusCode + ")",
          type: 'error',
        });
        reject(errorThrown);
      }

      AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, true, false, onSuccess, onFailed);
    });
  },

  fetchBranchData: async function (companyId) {
    //let comboBox = $("#cmbCompanyNameForSummary").data("kendoComboBox");
    //let companyId = comboBox.value();

    const serviceUrl = `/branches-by-compnayId-for-combo/companyId?companyId=${companyId}`;

    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load country data");
      }
    } catch (error) {
      console.error("Error loading country data:", error);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  fetchDepartmentData: async function (companyId) {
    var serviceUrl = `/departments-by-compnayId-for-combo/companyId?companyId=${companyId}`;

    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load country data");
      }
    } catch (error) {
      console.error("Error loading country data:", error);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  fetchEmployeeByCompanyAndBranchAndDepartment: async function (companyId, branchId, departmentId) {

    //let groups = [];
    //var jsonParams = "companyId=" + companyId + "&branchId=" + branchId + "&departmentId=" + departmentId;
    //var serviceUrl = `/employees-by-indentities`;

    //return new Promise(function (resolve, reject) {
    //  function onSuccess(jsonData) {
    //    groups = jsonData;
    //    resolve(groups);
    //  }

    //  function onFailed(jqXHR, textStatus, errorThrown) {
    //    ToastrMessage.showToastrNotification({
    //      preventDuplicates: true,
    //      closeButton: true,
    //      timeOut: 0,
    //      message: jqXHR.responseJSON?.message + "(" + jqXHR.responseJSON?.statusCode + ")",
    //      type: 'error',
    //    });
    //    reject(errorThrown);
    //  }
    //  AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, true, false, onSuccess, onFailed);
    //});


    var serviceUrl = `/employees-by-indentities?companyid=${companyId}&branchId=${branchId}&departmentId=${departmentId}`;
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load country data");
      }
    } catch (error) {
      console.error("Error loading country data:", error);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }

  },

  // will be deleted after emplementation of these alternative function
  GenerateBranchCombo: function (companyId) {
    var objBranch = "";
    var jsonParam = "companyId=" + companyId;
    var serviceUrl = "../../Branch/GetBranchByCompanyIdForCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objBranch = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objBranch;
  },

  GetDepartmentByCompanyId: function (companyId) {
    var objDepartment = "";
    var jsonParam = "companyId=" + companyId;
    var serviceUrl = "../../Department/GetDepartmentByCompanyId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objDepartment = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDepartment;
  },

  GetEmployeeByCompanyIdAndBranchIdAndDepartmentId: function (companyId, branchId, departmentId) {
    var objEmployee = "";
    var jsonParam = "companyId=" + companyId + "&branchId=" + branchId + "&departmentId=" + departmentId;
    var serviceUrl = "../../Employee/GetEmployeeByCompanyIdAndBranchIdAndDepartmentId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objEmployee = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployee;
  },
};

var UserInfoHelper = {

  initUserInfo: async function () {
    //UserInfoHelper.employeeTypeCombo(); //// I have to find that what is the reponsibilities of this function

    // load init combo
    UserInfoHelper.generateCompanyCombo();
    UserInfoHelper.generateBranchCombo();
    UserInfoHelper.generateDepartmentCombo();
    // this is static so, need to pupulate datasource
    UserInfoHelper.generateDashboardDropdown();
    UserInfoHelper.generateEmployeeCombo();
  },

  // initialize all combo box.
  generateCompanyCombo: function () {
    $("#cmbCompanyNameDetails").kendoComboBox({
      placeholder: "Please Select Company Name",
      dataTextField: "CompanyName",
      dataValueField: "CompanyId",
      dataSource: [],
    });
  },

  generateBranchCombo: function () {
    $("#cmbBranchDetails").kendoComboBox({
      placeholder: "All",
      dataTextField: "Branchname",
      dataValueField: "Branchid",
      dataSource: []
    });
  },

  generateDepartmentCombo: function () {
    $("#cmbDepartmentNameDetails").kendoComboBox({
      placeholder: "All",
      dataTextField: "DepartmentName",
      dataValueField: "DepartmentId",
      dataSource: []
    });
  },

  generateDashboardDropdown: function () {
    $("#ddlCommonDashboard").kendoDropDownList({
      dataTextField: "text",
      dataValueField: "id",
      dataSource: [
        {
          id: 1,
          text: "CRM Home"
        },
        {
          id: 2,
          text: "Common Dashboard"
        },
        {
          id: 3,
          text: "CRM Dashboard"
        }
      ]
    });
  },

  generateEmployeeCombo: function () {
    $("#cmbEmployee").kendoComboBox({
      placeholder: "All",
      dataTextField: "FullName",
      dataValueField: "HrRecordId",
      dataSource: []
    });
  },

  populateUserDetailsBasedOnSummaryCompanyId: async function () {
    let comboBox = $("#cmbCompanyNameForSummary").data("kendoComboBox");
    let companyId = comboBox.value();
    if (companyId > 0) {
      let companyComboBox = $("#cmbCompanyNameDetails").data("kendoComboBox");
      // Check if companyComboBox dataSource has data before populating
      if (companyComboBox && companyComboBox.dataSource.data().length === 0) {
        await this.populateCompanyCombo();
      }
      await this.populateBranchCombo(companyId);
      await this.populateDepartmentCombo(companyId);
    }
  },

  // populate datasource to combo box
  populateCompanyCombo: async function () {
    try {
      const companies = await UserSummaryManager.GetMotherCompany();

      let companyComboBox = $("#cmbCompanyNameDetails").data("kendoComboBox");
      companyComboBox.setDataSource(companies);

    } catch (e) {
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 0,
        message: "Failed to load company data" + ": " + e,
        type: 'error',
      });
    }
  },

  populateBranchCombo: async function (companyId) {
    let comboBox = $("#cmbBranchDetails").data("kendoComboBox");
    if (comboBox) {
      await UserInfoManager.fetchBranchData(companyId).then(data => {
        comboBox.setDataSource(data);
      }).catch(error => {
        console.error("Error loading country data:", error);
        comboBox.setDataSource([]);
      });
    }
  },

  populateDepartmentCombo: async function (companyId) {
    let comboBox = $("#cmbDepartmentNameDetails").data("kendoComboBox");
    if (comboBox) {
      await UserInfoManager.fetchDepartmentData(companyId).then(data => {
        comboBox.setDataSource(data);
      }).catch(error => {
        console.error("Error loading country data:", error);
        comboBox.setDataSource([]);
      });
    }
  },

  populateEmployeeByCompanyBranchDepartment: async function (companyId, branchId, departmentId) {
    let comboBox = $("#cmbEmployee").data("kendoComboBox");
    if (comboBox) {
      await UserInfoManager.fetchEmployeeByCompanyAndBranchAndDepartment(companyId, branchId, departmentId).then(data => {
        console.log(data);
        comboBox.setDataSource(data);
      }).catch(error => {
        console.error("Error loading country data:", error);
        comboBox.setDataSource([]);
      });
    }
    
    
  },

  populateUserInformationDetails: async function (selectedItem) {
    await UserInfoHelper.clearUserInfoForm();
    $("#btnSave").text("Update");

    $("#hdnUserId").val(selectedItem.UserId);

    var company = $("#cmbCompanyNameDetails").data("kendoComboBox");
    company.value(selectedItem.CompanyId);

    //var branch = $("#cmbBranchDetails").data("kendoComboBox");
    //branch.destroy();
    //await cesCommonManager.generateBranchByCompanyWithHtmlId(selectedItem.CompanyId, "cmbBranchDetails");

    await  UserInfoHelper.populateBranchCombo(selectedItem.CompanyId);
    branch = $("#cmbBranchDetails").data("kendoComboBox");
    branch.value(selectedItem.BranchId);

    await  UserInfoHelper.populateDepartmentCombo(selectedItem.CompanyId);
    department = $("#cmbDepartmentNameDetails").data("kendoComboBox");
    department.value(selectedItem.DepartmentId);

    if (selectedItem.DepartmentId == 0) {
      department.value('');
    }

    
    await UserInfoHelper.populateEmployeeByCompanyBranchDepartment(selectedItem.CompanyId, selectedItem.BranchId, selectedItem.DepartmentId);
    combobox = $("#cmbEmployee").data("kendoComboBox");
    combobox.value(selectedItem.EmployeeId);

    $("#txtLoginId").val(selectedItem.LoginId);
    $("#txtUserName").val(selectedItem.UserName);
    $("#txtIMEI").val(selectedItem.IMEI);

    if (selectedItem.AccessParentCompany == 1) {
      $('#chkAccessAllSbu').attr('checked', true);
    } else {
      $('#chkAccessAllSbu').attr('checked', false);
    }

    $('#chkIsActive').attr('checked', selectedItem.IsActive);
    $("#ddlCommonDashboard").data('kendoDropDownList').value(selectedItem.DefaultDashboard);

    //GroupMembershipHelper.getGroupByCompanyId(selectedItem.CompanyId);
    await GroupMembershipHelper.getGroups(selectedItem);
  },

  // have to work with these method.
  employeeTypeCombo: async function () {
    try {
      const employeeTypes = await UserInfoManager.getEmployeeTypes();
      $("#cmbEmployeeType").kendoComboBox({
        placeholder: "All",
        dataTextField: "EmployeeTypeName",
        dataValueField: "EmployeeTypeId",
        dataSource: employeeTypes,
        suggest: true,
        filter: "contains",
        index: 0
      });
    } catch (e) {
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 0,
        message: "Failed to load employee types" + ": " + e,
        type: 'error',
      });
    }
  },

  changeDepartmentName: function () {

    var companyData = $("#cmbCompanyNameDetails").data("kendoComboBox");
    var companyId = companyData.value();
    var companyName = companyData.text();

    var comboboxbranch = $("#cmbBranchDetails").data("kendoComboBox");
    var branchId = comboboxbranch.value();
    var branchName = comboboxbranch.text();

    var comboboxDep = $("#cmbDepartmentNameDetails").data("kendoComboBox");
    var departmentId = comboboxDep.value();
    var departmentName = comboboxDep.text();

    var comboboxEmp = $("#cmbEmployee").data("kendoComboBox");



    if (departmentId == "") {

      departmentId = 0;
    } else {
      if (comboboxEmp != undefined) {
        comboboxEmp.value('');
        comboboxEmp.destroy();
      }
    }
    UserInfoHelper.GenerateEmployeeByCompanyId(companyId, branchId, departmentId);
  },

  GetDepartmentByCompanyId: function (companyId) {
    var objDepartment = new Object();

    objDepartment = userInfoManager.GetDepartmentByCompanyId(companyId);

    $("#cmbDepartmentNameDetails").kendoComboBox({
      placeholder: "All",
      dataTextField: "DepartmentName",
      dataValueField: "DepartmentId",
      dataSource: objDepartment
    });
  },

  //populateEmployeeByCompanyId: function (companyId, branchId, departmentId) {
  //  var objEmp = new Object();
  //  if (branchId == 0) {
  //    objEmp = null;
  //  }
  //  else {
  //    objEmp = userInfoManager.GetEmployeeByCompanyIdAndBranchIdAndDepartmentId(companyId, branchId, departmentId);
  //  }
  //  $("#cmbEmployee").kendoComboBox({
  //    placeholder: "All",
  //    dataTextField: "FullName",
  //    dataValueField: "HRRecordId",
  //    dataSource: objEmp
  //  });
  //},

  changeCompanyName: function () {
    debugger;
    var companyData = $("#cmbCompanyNameDetails").data("kendoComboBox");
    var companyId = companyData.value();
    var companyName = companyData.text();

    var comboboxbranch = $("#cmbBranchDetails").data("kendoComboBox");
    var comboboxDep = $("#cmbDepartmentNameDetails").data("kendoComboBox");
    var comboboxEmp = $("#cmbEmployee").data("kendoComboBox");


    if (companyId == companyName) {
      companyData.value('');
      comboboxbranch.value('');
      comboboxbranch.destroy();

      comboboxDep.value('');
      comboboxDep.destroy();
      comboboxEmp.value('');
      comboboxEmp.destroy();

      UserInfoHelper.generateBranchCombo();
      UserInfoHelper.getDepartmentByCompanyId();
      //UserInfoHelper.generateDesignationCombo(0);
      UserInfoHelper.generateEmployeeCombo();

      return false;
    }
    if (comboboxbranch != undefined) {
      comboboxbranch.value('');
      comboboxbranch.destroy();
    }
    if (comboboxDep != undefined) {
      comboboxDep.value('');
      comboboxDep.destroy();
    }

    if (comboboxEmp != undefined) {
      comboboxEmp.value('');
      comboboxEmp.destroy();
    }

    UserInfoHelper.generateCompanyCombo();
    UserInfoHelper.generateBranchCombo();
    UserInfoHelper.generateDepartmentCombo();

    UserInfoHelper.populateBranchCombo(companyId);
    UserInfoHelper.populateBranchCombo(companyId);
    UserInfoHelper.generateDepartmentCombo(companyId);
    UserInfoHelper.populateEmployeeByCompanyBranchDepartment(companyId, 0, 0);
    GroupMembershipHelper.getGroups();
    // in .net companyId don't use.
    //groupMembershipHelper.GetGroupByCompanyId(companyId);
  },

  changeBranchName: function () {

    var comboboxbranch = $("#cmbBranchDetails").data("kendoComboBox");
    var comboboxDep = $("#cmbDepartmentNameDetails").data("kendoComboBox");
    var comboboxEmp = $("#cmbEmployee").data("kendoComboBox");


    var companyData = $("#cmbCompanyNameDetails").data("kendoComboBox");
    var companyId = companyData.value();
    var companyName = companyData.text();

    var branchId = comboboxbranch.value();
    var branchName = comboboxbranch.text();
    if (branchId == branchName) {
      comboboxbranch.value('');
      if (comboboxDep != undefined) {
        comboboxDep.value('');
        comboboxDep.destroy();
      }

      if (comboboxEmp != undefined) {
        comboboxEmp.value('');
        comboboxEmp.destroy();
      }

      UserInfoHelper.GetDepartmentByCompanyId(companyId);
      UserInfoHelper.GenerateEmployeeByCompanyId(companyId, 0, 0);
      return false;
    }

    if (comboboxDep != undefined) {
      comboboxDep.value('');
      comboboxDep.destroy();
    }

    if (comboboxEmp != undefined) {
      comboboxEmp.value('');
      comboboxEmp.destroy();
    }

    UserInfoHelper.GetDepartmentByCompanyId(companyId);
    UserInfoHelper.GenerateEmployeeByCompanyId(companyId, branchId, 0);
  },

  clearUserInfoForm: async function () {
    $("#btnSave").text("+ Add New Item");

    $("#hdnUserId").val("0");
    $("#cmbCompanyName").val("");
    $("#txtLoginId").val("");
    $("#txtNewPassword").val("");
    $("#txtConfirmPassword").val("");
    $("#txtUserName").val("");
    $("#txtEmail").val("");
    $("#cmbEmployee").val("");
    $("#txtIMEI").val('');

    
    //await UserInfoHelper.populateCompanyCombo();

    let comboBox = $("#cmbCompanyNameDetails").data("kendoComboBox");
    if (comboBox) {
      comboBox.value("");
      comboBox.text("")
      //comboBox.trigger("change");
    }


    var branch = $("#cmbBranchDetails").data("kendoComboBox");
    if (branch) {
      branch.destroy();
      // Remove leftover HTML
      $("#cmbBranchDetails").empty();
    }
    UserInfoHelper.generateBranchCombo();

    var department = $("#cmbDepartmentNameDetails").data("kendoComboBox");
    if (department) {
      department.destroy();
      $("#cmbDepartmentNameDetails").empty();
    }
    UserInfoHelper.generateDepartmentCombo();

    var combobox = $("#cmbEmployee").data("kendoComboBox");
    if (combobox) {
      combobox.destroy();
      $("#cmbEmployee").empty();
    }
    UserInfoHelper.generateEmployeeCombo();


    $('.chkBox').attr('checked', false);

    //$("#divUserInfo > form").kendoValidator();
    //$("#divUserInfo").find("span.k-tooltip-validation").hide();
    //var status = $(".status");
    //status.text("").removeClass("invalid");

    $("#ddlDefaultDashboard").val(1);

  },

  validateUserInfoForm: function () {
    var data = [];

    var validator = $("#divUserInfo").kendoValidator().data("kendoValidator"),
      status = $(".status");
    if (validator.validate()) {
      status.text("").addClass("valid");
      var companyId = $("#cmbCompanyNameDetails").val();
      var comboboxforCompany = $("#cmbCompanyNameDetails").data("kendoComboBox");
      var companyName = comboboxforCompany.text();
      if (companyId == companyName) {
        status.text("Oops! Company Name is invalid.").addClass("invalid");
        $("#cmbCompanyName").val("");
        UserInfoHelper.GenerateMotherCompanyCombo();
        return false;
      }

      var userId = $("#hdnUserId").val();
      if (userId == "0") {
        if ($("#txtNewPassword").val() == "") {
          status.text("Oops! Please Insert Password.").addClass("invalid");
          $("#txtNewPassword").val("");
          return false;
        }
        if ($("#txtConfirmPassword").val() == "") {
          status.text("Oops! Please Insert Confirm Password.").addClass("invalid");
          $("#txtConfirmPassword").val("");
          return false;
        }
        if ($("#txtNewPassword").val() != $("#txtConfirmPassword").val()) {
          status.text("Oops! Password and Confirm password not match.").addClass("invalid");
          $("#txtNewPassword").val("");
          $("#txtConfirmPassword").val("");
          return false;
        }
      }

      var employeeId = $("#cmbEmployee").val();
      var comboboxforEmployee = $("#cmbEmployee").data("kendoComboBox");
      var employeeName = comboboxforEmployee.text();
      if (employeeId == employeeName) {
        status.text("Oops! Employee Name is invalid.").addClass("invalid");
        $("#cmbEmployee").val("");
        UserInfoHelper.GetEmployeeByCompanyId(companyId);
        return false;
      }

      return true;
    } else {
      status.text("Oops! There is invalid data in the form.").addClass("invalid");
      return false;
    }
  },

  createUserInformationForSaveData: function () {
    debugger;
    var objUser = new Object();
    objUser.UserId = $("#hdnUserId").val();
    objUser.CompanyId = $("#cmbCompanyNameDetails").val();
    objUser.LoginId = $("#txtLoginId").val();
    objUser.UserName = $("#txtUserName").val();
    //objUser.EmailAddress = $("#txtEmail").val();
    objUser.EmployeeId = $("#cmbEmployee").val();
    objUser.Password = $("#txtNewPassword").val();
    objUser.IMEI = $("#txtIMEI").val();
    //var kendoDataItemFromCombobox = $("#cmbEmployee").data("kendoComboBox").dataItem();
    //console.log(kendoDataItemFromCombobox);
    //objUser.Employee_Id = $("#cmbEmployee").data("kendoComboBox").dataItem().EmployeeId;
    //objUser.DefaultDashboard = $("#ddlDefaultDashboard").val();


    objUser.DefaultDashboard = $("#ddlCommonDashboard").data('kendoDropDownList').value();
    if ($("#chkIsActive").is(':checked') == true) {
      objUser.IsActive = true;
    }
    else {
      objUser.IsActive = false;
    }

    if ($("#chkAccessAllSbu").is(':checked') == true) {
      objUser.AccessParentCompany = 1;
    }
    else {
      objUser.AccessParentCompany = 0;
    }
    return objUser;
  },




};