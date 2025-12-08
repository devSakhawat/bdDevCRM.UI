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


  GetMotherCompany: async function () {
    const serviceUrl = "/mother-companies";

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

  getSummaryGridDataSource: function (companyId) {
    const serviceUrl = `/user-summary?companyId=${companyId}`;

    return VanillaApiCallManager.GenericGridDataSource({
      apiUrl: baseApi + serviceUrl,
      requestType: "POST",
      async: true,
      modelFields: { createdDate: { type: "date" } },
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Data.Items",
      schemaTotal: "Data.TotalCount"
    });
  },


};

var UserSummaryHelper = {

  initSummary: async function () {
    this.generateCompany();
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
      //const dataSource = UserSummaryManager.getSummaryGridDataSource();
      //console.log(dataSource);
      //gridInstance.setDataSource(dataSource);
      gridInstance.setDataSource([]);
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
        field: "ResetPassword", title: "Reset Password", filterable: false, width: "500",
        template: '<input type="button" class="k-button btn btn-outline-warning" value="Reset Password" id="btnResetPassword" />',sortable: false, exportable: false
      },
      {
        field: "Edit", title: "Edit", filterable: false, width: "300",
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
      //change: CRMCourseInformationHelper.onCountryChange
    });
  },

  populateCompany: async function () {
    var companyComboBox = $("#cmbCompanyNameForSummary").data("kendoComboBox");
    // details part company dropdown instance.
    var companyComboBoxForDetials = $("#cmbCompanyNameDetails").data("kendoComboBox");
    if (companyComboBox) {
      await UserSummaryManager.GetMotherCompany().then(data => {
        companyComboBox.setDataSource(data);
        companyComboBox.value(CurrentUser.CompanyId);

        // populate mother companies to details part company dropdown.
        if (companyComboBoxForDetials) {
          companyComboBoxForDetials.setDataSource(data);
        }

      }).catch(error => {
        console.error("Error loading company data:", error);
        companyComboBox.setDataSource([]);
      });
    }
  },


  setGridDataSource: function () {
    let companyId = 0;
    let comboBox = $("#cmbCompanyNameForSummary").data("kendoComboBox");
    if (comboBox) {
      companyId = comboBox.value();
    }

    const grid = $("#gridSummary").data("kendoGrid");
    if (grid) {
      const ds = UserSummaryManager.getSummaryGridDataSource(companyId);

      // Add data source error handling
      ds.bind("error", function (error) {
        VanillaApiCallManager.handleApiError(error);
      });

      // Add data source success handling
      ds.bind("requestEnd", function (e) {
        console.log(ds);
        if (e.response && e.response.isSuccess === false) {
          VanillaApiCallManager.handleApiError(e.response);
          //console.error("API returned error:", e.response.message);
          //kendo.alert("Error: " + e.response.message);
        }
      });

      grid.setDataSource(ds);
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