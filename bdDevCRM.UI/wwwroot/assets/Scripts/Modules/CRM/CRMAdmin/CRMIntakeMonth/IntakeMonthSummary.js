/// <reference path="../../common/common.js" />
/// <reference path="intakemonth.js" />
/// <reference path="intakemonthdetails.js" />

var IntakeMonthSummaryManager = {
  getSummaryIntakeMonthGridDataSource: function () {
    return VanillaApiCallManager.GenericGridDataSource({
      apiUrl: baseApi + "/intake-month-summary",
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

  fetchIntakeMonthComboBoxData: async function () {
    const serviceUrl = "/intake-month-ddl";
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load intake month data");
      }
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  }
};

var IntakeMonthSummaryHelper = {
  initIntakeMonthSummary: function () {
    this.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    var Columns = this.generateColumns();
    var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(Columns);

    var containerWidth = $("#divSummary").width() || (window.innerWidth - 323);

    var gridWidth = totalColumnsWidth > containerWidth
      ? "100%"
      : `${totalColumnsWidth}px`;

    const gridOptions = {
      toolbar: [
        { template: '<button type="button" id="btnAddNewIntakeMonth" class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" onclick="IntakeMonthDetailsHelper.openIntakeMonthPopUp();"><span class="k-button-text"> + Create New </span></button>' },
        { name: "excel" },
        { name: "pdf" },
        { template: '<button type="button" id="btnExportCsvIntakeMonth" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }
      ],
      excel: {
        fileName: "IntakeMonthList" + Date.now() + ".xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      pdf: {
        fileName: "IntakeMonth_Information.pdf",
        allPages: true,
        paperSize: "A4",
        landscape: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        scale: 0.9,
        repeatHeaders: true,
        columns: [
          { field: "MonthName", width: 200 },
          { field: "MonthCode", width: 120 },
          { field: "MonthNumber", width: 120 },
          { field: "Description", width: 250 },
          { field: "IsActive", width: 100 }
        ]
      },
      dataSource: [],
      autoBind: true,
      navigatable: true,
      scrollable: true, // Enable scrolling
      resizable: true,
      width: gridWidth, // Dynamic width
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

    $("#gridSummaryIntakeMonth").kendoGrid(gridOptions);

    $("#btnExportCsvIntakeMonth").on("click", function () {
      CommonManager.GenerateCSVFileAllPages("gridSummaryIntakeMonth", "IntakeMonthListCSV", "Actions");
    });

    const grid = $("#gridSummaryIntakeMonth").data("kendoGrid");
    if (grid) {
      const ds = IntakeMonthSummaryManager.getSummaryIntakeMonthGridDataSource();

      ds.bind("error", function (e) {
        VanillaApiCallManager.handleApiError(e);
        //console.log("DataSource Error Event:", e);
        //console.log("DataSource Error Event:", e.response);
        //kendo.alert({
        //  title: "Error",
        //  content: "Error: " + e.response
        //});
      });

      ds.bind("requestEnd", function (e) {
        console.log(e);
        console.log(e.response);
        if (e.response && e.response.isSuccess === false) {
          VanillaApiCallManager.handleApiError(e);
          //console.log("API returned error:", e.response.message);
          //kendo.alert({
          //  title: "Error",
          //  content: "Error: " + e.response.message
          //});
        }
      });

      grid.setDataSource(ds);
    }
  },

  generateColumns: function () {
    return [
      { field: "IntakeMonthId", hidden: true },
      { field: "MonthName", title: "Month Name", width: "200px" },
      { field: "MonthCode", title: "Month Code", width: "120px" },
      { field: "MonthNumber", title: "Month Number", width: "120px" },
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
                        value="View" onClick="IntakeMonthSummaryHelper.clickEventForViewButton(event)" />
                    <input type="button" class="btn btn-outline-dark me-1 widthSize30_per"
                        value="Edit" onClick="IntakeMonthSummaryHelper.clickEventForEditButton(event)" />
                    <input type="button" class="btn btn-outline-danger widthSize33_per"
                        value="Delete" onClick="IntakeMonthSummaryHelper.clickEventForDeleteButton(event)" />
                `
      }
    ];
  },

  _getGridItem: function (event) {
    const grid = $("#gridSummaryIntakeMonth").data("kendoGrid");
    const tr = $(event.target).closest("tr");
    return grid.dataItem(tr);
  },

  clickEventForViewButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      IntakeMonthDetailsHelper.clearForm();
      const windowId = "IntakeMonthPopUp";
      CommonManager.openKendoWindow(windowId, "View Intake Month", "60%");
      CommonManager.appandCloseButton(windowId);
      IntakeMonthDetailsHelper.populateObject(item);
      CommonManager.MakeFormReadOnly("#IntakeMonthForm");
      $("#btnIntakeMonthSaveOrUpdate").prop("disabled", "disabled");
    }
  },

  clickEventForEditButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      IntakeMonthDetailsHelper.clearForm();
      const windowId = "IntakeMonthPopUp";
      CommonManager.openKendoWindow(windowId, "Edit Intake Month", "60%");
      CommonManager.appandCloseButton(windowId);
      IntakeMonthDetailsHelper.populateObject(item);
      CommonManager.MakeFormEditable("#IntakeMonthForm");
    }
  },

  clickEventForDeleteButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      IntakeMonthDetailsManager.deleteItem(item);
    }
  }
};