var AccessControlSummaryManager = {

  getSummaryGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/access-control-summary",
      requestType: "POST",
      async: true,
      modelFields: {
        createdDate: { type: "date" }
      },
      pageSize: 15,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Items",
      schemaTotal: "TotalCount"
    });
  },

};

var AccessControlSummaryHelper = {

  initAccessControlSummary: function () {
    AccessControlSummaryHelper.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    const gridOptions = {
      toolbar: [
        { name: "excel" },
        { template: '<button type="button" id="btnExportCsv" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }
      ],
      excel: {
        fileName: "AccessControlExport.xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      dataSource: [],
      pageable: {
        refresh: true,
        pageSizes: [10, 15, 20, 30, 50],
        buttonCount: 5,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      height: 700,
      filterable: true,
      sortable: true,
      columns: AccessControlSummaryHelper.GenerateColumns(),
      editable: false, // Disable inline editing
      navigatable: true, // Enable keyboard navigation
      selectable: "row", // Enable row selection
    };

    // Initialize the Kendo Grid
    $("#gridSummary").kendoGrid(gridOptions);

    $("#btnExportCsv").on("click", function () {
      AjaxManager.GenerateCSVFileAllPages("gridSummary", "MenuListCSV", "Actions");
    });

    // Fetch and set the data source after the grid is initialized
    const gridInstance = $("#gridSummary").data("kendoGrid");
    if (gridInstance) {
      const dataSource = AccessControlSummaryManager.getSummaryGridDataSource();
      gridInstance.setDataSource(dataSource);
    }

  },

  GenerateColumns: function () {
    return columns = [
      { field: "AccessControlId", title: "Access Control Id", width: 0, hidden: true },
      { field: "AccessName", title: "Access Name", width: "70%", headerAttributes: { style: "white-space: normal;" } },
      {
        field: "Edit", title: "Actions", filterable: false, width: "28%",
        template: `
        <input type="button" class="btn btn-outline-dark " style="cursor: pointer; margin-right: 5px;" value="Edit" id="btnEdit" onClick="AccessControlSummaryHelper.clickEventForEditButton(event)"/>`
        , sortable: false, exportable: false
      }
    ];
  },

  clickEventForEditButton: function (e) {

    var grid = $("#gridSummary").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var dataItem = grid.dataItem(row);

    if (dataItem) {
      AjaxManager.MakeFormEditable("#divdetailsForDetails");
      AccessControlDetailsHelper.PopulateObject(dataItem);
    }
  },

};