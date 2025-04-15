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

  fetchBranchData: function (companyId) {
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

  initUserInfo: function () {
    UserInfoHelper.populateCompany();
    UserInfoHelper.employeeTypeCombo();
    UserInfoHelper.generateDashboardDropdown();
    UserInfoHelper.generateBranchCombo();
  },

  populateCompany: function () {

    UserSummaryManager.GetMotherCompany().then(function (objCompany) {
      $("#cmbCompanyNameDetails").kendoComboBox({
        placeholder: "All",
        dataTextField: "CompanyName",
        dataValueField: "CompanyId",
        dataSource: objCompany
      });

      if (CurrentUser.CompanyId != null) {
        var companyData = $("#cmbCompanyNameDetails").data("kendoComboBox");
        companyData.value(CurrentUser.CompanyId);
      }
    }).catch(function (error) {
      console.log("Error loading company data:", error);
    });

  },

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

  generateDashboardDropdown: function (companyId) {
    $("#ddlDefaultDashboard").kendoDropDownList({
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

  generateBranchCombo: function () {
    //var objBranch = new Object();

    //objBranch = userInfoManager.GenerateBranchCombo(companyId);

    $("#cmbBranchDetails").kendoComboBox({
      placeholder: "All",
      dataTextField: "BranchName",
      dataValueField: "BranchId",
      dataSource: []
      //dataSource: objBranch
    });
  },

  fetchBranchData: function (companyId) {
    objBranch = userInfoManager.GenerateBranchCombo(companyId);
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

  GenerateEmployeeByCompanyId: function (companyId, branchId, departmentId) {
    var objEmp = new Object();
    if (branchId == 0) {
      objEmp = null;
    }
    else {
      objEmp = userInfoManager.GetEmployeeByCompanyIdAndBranchIdAndDepartmentId(companyId, branchId, departmentId);
    }
    $("#cmbEmployee").kendoComboBox({
      placeholder: "All",
      dataTextField: "FullName",
      dataValueField: "HRRecordId",
      dataSource: objEmp
    });
  },

  changeCompanyName: function () {

    var comboboxbranch = $("#cmbBranchDetails").data("kendoComboBox");
    var comboboxDep = $("#cmbDepartmentNameDetails").data("kendoComboBox");
    var comboboxEmp = $("#cmbEmployee").data("kendoComboBox");

    var companyData = $("#cmbCompanyNameDetails").data("kendoComboBox");
    var companyId = companyData.value();
    var companyName = companyData.text();
    if (companyId == companyName) {
      companyData.value('');
      comboboxbranch.value('');
      comboboxbranch.destroy();

      comboboxDep.value('');
      comboboxDep.destroy();
      comboboxEmp.value('');
      comboboxEmp.destroy();

      UserInfoHelper.GenerateBranchCombo(0);
      UserInfoHelper.GetDepartmentByCompanyId(0);
      UserInfoHelper.GenerateDesignationCombo(0);
      UserInfoHelper.GenerateEmployeeByCompanyId(0, 0, 0);

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

    UserInfoHelper.GenerateBranchCombo(companyId);
    UserInfoHelper.GetDepartmentByCompanyId(companyId);
    UserInfoHelper.GenerateEmployeeByCompanyId(companyId, 0, 0);
    groupMembershipHelper.GetGroupByCompanyId(companyId);
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

  clearUserInfoForm: function () {
    $("#btnSave").text("Save");

    $("#hdnUserId").val("0");
    $("#cmbCompanyName").val("");
    UserInfoHelper.populateCompany();
    $("#txtLoginId").val("");
    $("#txtNewPassword").val("");
    $("#txtConfirmPassword").val("");
    $("#txtUserName").val("");
    $("#txtEmail").val("");
    $("#cmbEmployee").val("");
    $("#txtIMEI").val('');

    var branch = $("#cmbBranchDetails").data("kendoComboBox");
    branch.destroy();

    empressCommonHelper.GenerateBranchCombo(CurrentUser.CompanyId, "cmbBranchDetails");


    var department = $("#cmbDepartmentNameDetails").data("kendoComboBox");
    department.destroy();
    UserInfoHelper.GetDepartmentByCompanyId(CurrentUser.CompanyId);

    var combobox = $("#cmbEmployee").data("kendoComboBox");
    combobox.destroy();
    UserInfoHelper.GenerateEmployeeByCompanyId(CurrentUser.CompanyId, CurrentUser.BranchId, 0);

    $('.chkBox').attr('checked', false);

    $("#divUserInfo > form").kendoValidator();
    $("#divUserInfo").find("span.k-tooltip-validation").hide();
    var status = $(".status");

    status.text("").removeClass("invalid");

    $("#ddlDefaultDashboard").val(1);

  },

  ValidateUserInfoForm: function () {
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

  CreateUserInformationForSaveData: function () {
    var objUser = new Object();
    objUser.UserId = $("#hdnUserId").val();
    objUser.CompanyId = $("#cmbCompanyNameDetails").val();
    objUser.LoginId = $("#txtLoginId").val();
    objUser.UserName = $("#txtUserName").val();
    //objUser.EmailAddress = $("#txtEmail").val();
    objUser.EmployeeId = $("#cmbEmployee").val();
    objUser.Password = $("#txtNewPassword").val();
    objUser.IMEI = $("#txtIMEI").val();

    objUser.Employee_Id = $("#cmbEmployee").data("kendoComboBox").dataItem().EmployeeId;

    objUser.DefaultDashboard = $("#ddlDefaultDashboard").data('kendoDropDownList').value();
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

  populateUserInformationDetails: function (objUser) {
    UserInfoHelper.clearUserInfoForm();
    $("#btnSave").text("Update");

    $("#hdnUserId").val(objUser.UserId);

    var company = $("#cmbCompanyNameDetails").data("kendoComboBox");
    company.value(objUser.CompanyId);

    var branch = $("#cmbBranchDetails").data("kendoComboBox");
    branch.destroy();

    empressCommonHelper.GenerateBranchCombo(objUser.CompanyId, "cmbBranchDetails");
    branch = $("#cmbBranchDetails").data("kendoComboBox");
    branch.value(objUser.BranchId);

    var department = $("#cmbDepartmentNameDetails").data("kendoComboBox");
    department.destroy();

    UserInfoHelper.GetDepartmentByCompanyId(objUser.CompanyId);



    department = $("#cmbDepartmentNameDetails").data("kendoComboBox");
    department.value(objUser.DepartmentId);

    if (objUser.DepartmentId == 0) {
      department.value('');

    }

    var combobox = $("#cmbEmployee").data("kendoComboBox");
    combobox.destroy();
    UserInfoHelper.GenerateEmployeeByCompanyId(objUser.CompanyId, objUser.BranchId, objUser.DepartmentId);

    combobox = $("#cmbEmployee").data("kendoComboBox");
    combobox.value(objUser.EmployeeId);

    $("#txtLoginId").val(objUser.LoginId);
    $("#txtUserName").val(objUser.UserName);
    $("#txtIMEI").val(objUser.IMEI);
    //$("#txtEmail").val(objUser.EmailAddress);
    //$("#txtNewPassword").val(objUser.Password);
    //$("#txtConfirmPassword").val(objUser.Password);
    if (objUser.AccessParentCompany == 1) {
      $('#chkAccessAllSbu').attr('checked', true);
    } else {
      $('#chkAccessAllSbu').attr('checked', false);
    }

    $('#chkIsActive').attr('checked', objUser.IsActive);
    $("#ddlDefaultDashboard").data('kendoDropDownList').value(objUser.DefaultDashboard);
    //var employee = $("#cmbEmployee").data("kendoComboBox");
    //employee.value(objUser.EmployeeId);

    groupMembershipHelper.GetGroupByCompanyId(objUser.CompanyId);
  },




};