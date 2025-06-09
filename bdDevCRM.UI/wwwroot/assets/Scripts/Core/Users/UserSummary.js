/// <reference path="UserDetails.js" />
/// <reference path="UserInfo.js" />


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
    var companies = [];
    var jsonParams = "";
    var serviceUrl = "/mother-companies";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
        companies = jsonData;
        resolve(companies);
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

  initSummary: async function () {
    // I am use this code into settings file directly because Userinfo file code has dependancy on populateCompany.
    // So I need to load populateCompany data first and then grid data
    //await UserSummaryHelper.populateCompany();
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
      //pageable: {
      //  //pageSizes: [5, 10, 20, 100],
      //  buttonCount: 5,
      //  refresh: true,
      //  serverPaging: true,
      //  serverFiltering: true,
      //  serverSorting: true
      //},
      pageable: {
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
      //console.log(dataSource);
      gridInstance.setDataSource(dataSource);
    }

  },

  GenerateColumns: function () {
    return columns = [

      { field: "UserId", hidden: true, width: "250" },
      { field: "UserName", title: "User Name", hidden: true, width: "250" },
      { field: "AccessParentCompany", hidden: true, width: "250" },
      { field: "EmployeeId", hidden: true, width: "250" },//HrRecordId
      { field: "CompanyId", hidden: true, width: "250" },
      { field: "Password", hidden: true, width: "250" },
      { field: "FailedLoginNo", hidden: true, width: "250" },
      { field: "IsExpired", hidden: true, width: "250" },
      { field: "LastLoginDate", hidden: true, width: "250" },
      { field: "CreatedDate", hidden: true, width: "250" },
      { field: "BranchId", hidden: true, width: "250" },
      { field: "DepartmentId", hidden: true, width: "250" },
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
        template: '<input type="button" class="k-button btn btn-outline-dark" value="Edit" id="btnEdit" onClick="UserSummaryHelper.clickEventForEditButton(event)"  />', sortable: false, exportable: false
      }
    ];
  },

  generateCompany: function () {
    $("#cmbCompanyNameForSummary").kendoComboBox({
      placeHolder: "All",
      dataTextField: "CompanyName",
      dataValueField: "CompanyId",
      dataSource: [],
    });
  },

  populateCompany: async function () {
    
    try {
      let companies = await UserSummaryManager.GetMotherCompany();
      $("#cmbCompanyNameForSummary").kendoComboBox({
        placeHolder: "All",
        dataTextField: "CompanyName",
        dataValueField: "CompanyId",
        dataSource: companies,
      });
      if (CurrentUser.CompanyId != null) {
        var companyComboBox = $("#cmbCompanyNameForSummary").data("kendoComboBox");
        companyComboBox.value(CurrentUser.CompanyId);
      }
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

  clickEventForEditButton: async function (e) {
    debugger;

    //var entityGrid = $("#gridSummary").data("kendoGrid");

    //var selectedItem = entityGrid.dataItem(entityGrid.select());

    var grid = $("#gridSummary").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var selectedItem = grid.dataItem(row);

    if (selectedItem) {
      await UserInfoHelper.populateUserInformationDetails(selectedItem);
      GroupMembershipHelper.populateGroupMember(selectedItem);
    }


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