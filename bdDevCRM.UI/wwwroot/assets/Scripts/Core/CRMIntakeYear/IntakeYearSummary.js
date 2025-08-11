/// <reference path="../../common/common.js" />
/// <reference path="intakeyear.js" />
/// <reference path="intakeyeardetails.js" />

var IntakeYearSummaryManager = {
  getSummaryIntakeYearGridDataSource: function () {
    return VanillaApiCallManager.GenericGridDataSource({
      apiUrl: baseApi + "/intake-year-summary",
      requestType: "POST",
      async: true,
      modelFields: {},
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Data.Items",
      schemaTotal: "Data.TotalCount"
    });
  },

  fetchIntakeYearComboBoxData: async function () {
    const serviceUrl = "/intake-year-ddl";
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load intake year data");
      }
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  }
};

var IntakeYearSummaryHelper = {
  initIntakeYearSummary: function () {
    this.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    var Columns = this.generateColumns();
    var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(Columns);
    var gridWidth = totalColumnsWidth > (window.innerWidth - 323) ? (window.innerWidth - 323).toString() : `${totalColumnsWidth}px`;

    const gridOptions = {
      toolbar: [
        { template: '<button type="button" id="btnAddNewIntakeYear" class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" onclick="IntakeYearDetailsHelper.openIntakeYearPopUp();"><span class="k-button-text"> + Create New </span></button>' },
        { name: "excel" },
        { name: "pdf" },
        { template: '<button type="button" id="btnExportCsvIntakeYear" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }
      ],
      excel: {
        fileName: "IntakeYearList" + Date.now() + ".xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      pdf: {
        fileName: "IntakeYear_Information.pdf",
        allPages: true,
        paperSize: "A4",
        landscape: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        scale: 0.9,
        repeatHeaders: true,
        columns: [
          { field: "YearName", width: 200 },
          { field: "YearCode", width: 120 },
          { field: "YearValue", width: 120 },
          { field: "Description", width: 250 },
          { field: "IsActive", width: 100 }
        ]
      },
      dataSource: [],
      autoBind: true,
      navigatable: true,
      scrollable: true,
      resizable: true,
      width: gridWidth,
      filterable: true,
      sortable: true,
      pageable: {
        refresh: true,
        pageSizes: [10, 20, 30, 50, 100],
        buttonCount: 5,
        input: false,
        numeric: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      columns: Columns,
      editable: false,
      selectable: "row",
      error: function (e) {
        console.log("Grid Error:", e);
        kendo.alert({
          title: "Error",
          content: "Error: " + e.errors
        });
      }
    };

    $("#gridSummaryIntakeYear").kendoGrid(gridOptions);

    $("#btnExportCsvIntakeYear").on("click", function () {
      CommonManager.GenerateCSVFileAllPages("gridSummaryIntakeYear", "IntakeYearListCSV", "Actions");
    });

    const grid = $("#gridSummaryIntakeYear").data("kendoGrid");
    if (grid) {
      const ds = IntakeYearSummaryManager.getSummaryIntakeYearGridDataSource();

      ds.bind("error", function (e) {
        console.log("DataSource Error Event:", e);
        console.log("DataSource Error Event:", e.response);
        kendo.alert({
          title: "Error",
          content: "Error: " + e.response
        });
      });

      ds.bind("requestEnd", function (e) {
        console.log(e);
        console.log(e.response);
        if (e.response && e.response.isSuccess === false) {
          console.log("API returned error:", e.response.message);
          kendo.alert({
            title: "Error",
            content: "Error: " + e.response.message
          });
        }
      });

      grid.setDataSource(ds);
    }
  },

  generateColumns: function () {
    return [
      { field: "IntakeYearId", hidden: true },
      { field: "YearName", title: "Year Name", width: "200px" },
      { field: "YearCode", title: "Year Code", width: "120px" },
      { field: "YearValue", title: "Year Value", width: "120px" },
      { field: "Description", title: "Description", width: "250px" },
      { field: "IsActive", title: "Status", width: "100px", template: "#= IsActive ? 'Active' : 'Inactive' #" },
      { field: "CreatedDate", title: "Created Date", width: "150px", template: "#= kendo.toString(kendo.parseDate(CreatedDate), 'MM/dd/yyyy') #" },
      { field: "CreatedBy", title: "Created By", width: "120px" },
      { field: "UpdatedDate", title: "Updated Date", width: "150px", template: "#= UpdatedDate ? kendo.toString(kendo.parseDate(UpdatedDate), 'MM/dd/yyyy') : '' #" },
      { field: "UpdatedBy", title: "Updated By", width: "120px" },
      {
        field: "Action", title: "#", filterable: false, width: "230px",
        template: `
                    <input type="button" class="btn btn-outline-success widthSize30_per"
                        value="View" onClick="IntakeYearSummaryHelper.clickEventForViewButton(event)" />
                    <input type="button" class="btn btn-outline-dark me-1 widthSize30_per"
                        value="Edit" onClick="IntakeYearSummaryHelper.clickEventForEditButton(event)" />
                    <input type="button" class="btn btn-outline-danger widthSize33_per"
                        value="Delete" onClick="IntakeYearSummaryHelper.clickEventForDeleteButton(event)" />
                `
      }
    ];
  },

  _getGridItem: function (event) {
    const grid = $("#gridSummaryIntakeYear").data("kendoGrid");
    const tr = $(event.target).closest("tr");
    return grid.dataItem(tr);
  },

  clickEventForViewButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      IntakeYearDetailsHelper.clearForm();
      const windowId = "IntakeYearPopUp";
      CommonManager.openKendoWindow(windowId, "View Intake Year", "60%");
      CommonManager.appandCloseButton(windowId);
      IntakeYearDetailsHelper.populateObject(item);
      CommonManager.MakeFormReadOnly("#IntakeYearForm");
      $("#btnIntakeYearSaveOrUpdate").prop("disabled", "disabled");
    }
  },

  clickEventForEditButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      IntakeYearDetailsHelper.clearForm();
      const windowId = "IntakeYearPopUp";
      CommonManager.openKendoWindow(windowId, "Edit Intake Year", "60%");
      CommonManager.appandCloseButton(windowId);
      IntakeYearDetailsHelper.populateObject(item);
      CommonManager.MakeFormEditable("#IntakeYearForm");
    }
  },

  clickEventForDeleteButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      IntakeYearDetailsManager.deleteItem(item);
    }
  }
};