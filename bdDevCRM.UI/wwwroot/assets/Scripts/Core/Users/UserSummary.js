///// <reference path="UserInfo.js" />


var UserSummaryManager = {

  ResetPasswordByCompanyIdAndUserId: function (companyId, userId) {
    var jsonParam = 'companyId=' + companyId + "&userId=" + userId;
    var serviceUrl = "../Users/ResetPassword/";
    AjaxManager.SendJson(serviceUrl, jsonParam, onSuccess, onFailed);
    function onSuccess(jsonData) {

      if (jsonData == "Success") {
        alert("Password reset Successfully");
      }
      else {
        alert(jsonData);
      }
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }
  },

  GetMotherCompany: function () {
    var objCompany = "";
    var jsonParams = "";
    var serviceUrl = "/mother-companies";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
        objCompany = jsonData;
        resolve(objCompany);
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

  getSummaryGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/user-summary",
      requestType: "POST",
      async: true,
      modelFields: {
        //createdDate: { type: "date" }
      },
      pageSize: 15,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Items",
      schemaTotal: "TotalCount",
      buttonCount: 3  // Add this explicitly
    });
  },

};

var UserSummaryHelper = {

  initSummary: function () {
    UserSummaryHelper.populateCompany();
    UserSummaryHelper.initializeSummaryGrid();
  },


  initializeSummaryGrid: function () {
    const gridOptions = {
      dataSource: [],
      navigatable: true,
      height: 700,
      width: "100%",
      scrollable: true, // Enable both horizontal and vertical scrolling
      resizable: true,
      filterable: true,
      sortable: true,
      pageable: {
        //pageSizes: [5, 10, 20, 100],
        buttonCount: 5,
        refresh: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      }, pageable: {
        pageSizes: [10, 20, 50, 100],
        buttonCount: 3, // This sets exactly 3 buttons as required
        refresh: true,
        input: false,
        numeric: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      toolbar: [
        { name: "excel" },
        { name: "pdf" },
        { template: '<button type="button" id="btnExportCsv" onClick="AjaxManager.GenerateCSVFileAllPages(\'gridSummary\', \'UserListCSV\', \'Actions\');" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }
      ],
      excel: {
        fileName: "UsersInformation.xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      pdf: {
        fileName: "UsersInformation.pdf",
        allPages: true,
        paperSize: "A4",
        landscape: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        scale: 0.9,
        repeatHeaders: true,
        styles: [
          {
            type: "text",
            style: {
              fontFamily: "Helvetica",
              fontSize: 10
            }
          }
        ]
      },
      columns: UserSummaryHelper.GenerateColumns(),
      editable: false,
      selectable: "row",
    };

    $("#gridSummary").kendoGrid(gridOptions);

    const gridInstance = $("#gridSummary").data("kendoGrid");
    if (gridInstance) {
      const dataSource = UserSummaryManager.getSummaryGridDataSource();
      gridInstance.setDataSource(dataSource);
    }

  },


  GenerateColumns: function () {
    return columns = [

      { field: "UserId", hidden: true },
      { field: "UserName", title: "User Name", hidden: true },
      { field: "AccessParentCompany", hidden: true },
      { field: "EmployeeId", hidden: true },//HrRecordId
      { field: "CompanyId", hidden: true },
      { field: "Password", hidden: true },
      { field: "FailedLoginNo", hidden: true },
      { field: "IsExpired", hidden: true },
      { field: "LastLoginDate", hidden: true },
      { field: "CreatedDate", hidden: true },
      { field: "BranchId", hidden: true },
      { field: "DepartmentId", hidden: true },
      { field: "Employee_Id", title: "Employee Id", width: "250" },//EmployeeId in Employement
      { field: "LoginId", title: "Login ID", width: "200" },
      { field: "DepartmentName", title: "Department", width: "350" },
      { field: "DESIGNATIONNAME", title: "Designation", width: "350" },
      { field: "ShortName", title: "Short Name", width: "300" },//EmployeeId in Employement
      { field: "IsActive", title: "Is Active", width: "80", template: "#= IsActive ? 'Active' : 'Inactive' #" },
      {
        field: "ResetPassword", title: "Reset Password", filterable: false, width: "400",
        template: '<input type="button" class="k-button btn btn-outline-warning" value="Reset Password" id="btnResetPassword" />',sortable: false, exportable: false
      },
      {
        field: "Edit", title: "Edit", filterable: false, width: "60",
        template: '<input type="button" class="k-button btn btn-outline-dark" value="Edit" id="btnEdit" onClick="UserSummaryHelper.clickEventForEditButton()"  />', sortable: false, exportable: false
      }
    ];
  },

  populateCompany: function () {
    var objCompany = new Object();
    UserSummaryManager.GetMotherCompany().then(function (objCompany) {
      $("#cmbCompanyNameForSummary").kendoComboBox({
        placeholder: "All",
        dataTextField: "CompanyName",
        dataValueField: "CompanyId",
        dataSource: objCompany
      });

      if (CurrentUser.CompanyId != null) {
        var companyData = $("#cmbCompanyNameForSummary").data("kendoComboBox");
        companyData.value(CurrentUser.CompanyId);
        //UserInfoHelper.changeCompanyName();
      }
    }).catch(function (error) {
      console.log("Error loading company data:" , error);
    });
    
  },


//  GenerateMotherCompanyCombo: function () {
//    var objCompany = new Object();
//    objCompany = UserSummaryHelper.GetMotherCompany();

//    $("#cmbCompanyNameForSummary").kendoComboBox({
//      placeholder: "Select Company...",
//      dataTextField: "CompanyName",
//      dataValueField: "CompanyId",
//      dataSource: objCompany
//    });
//    if (CurrentUser != null) {
//      var cmbComp = $("#cmbCompanyNameForSummary").data("kendoComboBox");
//      //cmbComp.value(CurrentUser.CompanyId);
//    }
//  },

//  clickEventForResetPassword: function () {
//    $('#btnResetPassword').live('click', function () {
//      var entityGrid = $("#gridUser").data("kendoGrid");

//      var selectedItem = entityGrid.dataItem(entityGrid.select());

//      userSummaryHelper.resetPassword(selectedItem);

//    });
//  },

//  clickEventForEditButton: function () {

//    var entityGrid = $("#gridUser").data("kendoGrid");

//    var selectedItem = entityGrid.dataItem(entityGrid.select());

//    userInfoHelper.populateUserInformationDetails(selectedItem);

//    groupMembershipHelper.populateGroupMember(selectedItem);
//  },

//  resetPassword: function (items) {
//    userSummaryManager.ResetPasswordByCompanyIdAndUserId(items.CompanyId, items.UserId);
//  },

//  clickEventForEditUser: function () {
//    $('#gridUser table tr').live('dblclick', function () {
//      var entityGrid = $("#gridUser").data("kendoGrid");

//      var selectedItem = entityGrid.dataItem(entityGrid.select());

//      userInfoHelper.populateUserInformationDetails(selectedItem);

//      groupMembershipHelper.populateGroupMember(selectedItem);

//    });
//  },

//  CompanyIndexChangeEvent: function (e) {
//    var companyData = $("#cmbCompanyNameForSummary").data("kendoComboBox");
//    var companyId = companyData.value();
//    $("#gridUser").empty();
//    $("#gridUser").kendoGrid();
//    userSummaryHelper.GenerateUserSummaryGrid(companyId);

//  },

};