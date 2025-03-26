var moduleSummaryManager = {

  gridDataSource: function () {
    var apiUrl = coreManagement + "/Module/GetModuleSummary";

    var gridDataSource = new kendo.data.DataSource({
      type: "json",
      serverPaging: true,
      serverSorting: false,
      serverFiltering: true,
      allowUnsort: false,
      pageSize: 10,
      transport: {
        read: {
          url: apiUrl,
          type: "POST",
          dataType: "json",
          async: false,
          contentType: "application/json; charset=utf-8"
        },
        parameterMap: function (options) {
          return JSON.stringify(options);
        }
      },
      schema: {
        data: "items", total: "totalCount",
        model: {
          fields: {
            createdDate: {
              type: "date"
            },
            updateDate: {
              type: "date"
            },
            historyDate: {
              type: "date"
            },

          }
        }
      }
    });

    return gridDataSource;
  },

  gridDataSourceForHistory: function (moduleId) {

    var apiUrl = coreManagement + "/Module/GetModuleHistorySummary/?moduleId=" + moduleId;

    var gridDataSource = new kendo.data.DataSource({
      type: "json",
      serverPaging: true,
      serverSorting: false,
      serverFiltering: true,
      allowUnsort: false,
      pageSize: 10,
      transport: {
        read: {
          url: apiUrl,
          type: "POST",
          dataType: "json",
          async: false,
          contentType: "application/json; charset=utf-8"
        },
        parameterMap: function (options) {
          return JSON.stringify(options);
        }
      },
      schema: {
        data: "items", total: "totalCount",
        model: {
          fields: {
            createdDate: {
              type: "date"
            },
            updateDate: {
              type: "date"
            },
            historyDate: {
              type: "date"
            },

          }
        }
      }
    });

    return gridDataSource;
  },

  getModuleSummaryGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/module-summary", // API endpoint
      requestType: "POST", // HTTP method
      async: true, // Asynchronous requests
      modelFields: {
        createdDate: { type: "date" } // Define model fields
      },
      pageSize: 20, // Number of rows per page
      serverPaging: true, // Enable server-side paging
      serverSorting: true, // Enable server-side sorting
      serverFiltering: true, // Enable server-side filtering
      allowUnsort: true, // Allow unsorting columns
      schemaData: "Items", // Data field in the API response
      schemaTotal: "TotalCount" // Total count field in the API response
    });
  },

  getModuleSummaryGridDataSourceNew: function () {
    return AjaxManager.GenericGridDataSourceNew({
      apiUrl: baseApi + "/module-summary", // API endpoint
      requestType: "POST", // HTTP method
      async: true, // Asynchronous requests
      modelFields: {
        createdDate: { type: "date" } // Define model fields
      },
      pageSize: 20, // Number of rows per page
      serverPaging: true, // Enable server-side paging
      serverSorting: true, // Enable server-side sorting
      serverFiltering: true, // Enable server-side filtering
      allowUnsort: true, // Allow unsorting columns
      schemaData: "Items", // Data field in the API response
      schemaTotal: "TotalCount" // Total count field in the API response
    });
  },


};

var moduleSummaryHelper = {

  initateSummary: function () {
    debugger;
    $("#btnAddNew").click(function () {
      moduleDetailsHelper.AddNewInformation();
    });
    //moduleSummaryHelper.GenerateModuleSummaryGrid();
    moduleSummaryHelper.initializeModuleSummaryGrid();
  },

  initializeModuleSummaryGrid: function () {
    const gridOptions = {
      toolbar: ["excel", "pdf", "csv"], 
      excel: {
        fileName: "ModuleExport.xlsx",
        filterable: true, 
        allPages: true 
      },
      pdf: {
        fileName: "ModuleExport.pdf", 
        allPages: true, 
        paperSize: "a4", 
        landscape: true, 
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" } 
      },
      csv: {
        fileName: "ModuleExport.csv", 
        separator: ",",
        allPages: true 
      },
      dataSource: moduleSummaryManager.getModuleSummaryGridDataSourceNew(), 
      pageable: {
        refresh: true, 
        pageSizes: [5, 10, 15, 20], 
        buttonCount: 5, 
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      height: 600, 
      filterable: true, 
      sortable: true,
      columns: moduleSummaryHelper.GenerateColumns(), 
      editable: false, // Disable inline editing
      navigatable: true, // Enable keyboard navigation
      selectable: "row", // Enable row selection
      //change: function (e) {
      //  // Handle row selection
      //  const selectedRow = this.select();
      //  if (selectedRow.length > 0) {
      //    const selectedItem = this.dataItem(selectedRow); // Get the selected item
      //    console.log("Selected Item:", selectedItem);
      //  }
      //}
    };

    // Initialize the Kendo Grid
    $("#gridSummary").kendoGrid(gridOptions);
  },

  GenerateModuleSummaryGrid: function () {

    $("#gridSummary").kendoGrid({
      toolbar: ["excel"],
      excel: {
        fileName: "ModuleExport.xlsx",
        filterable: true,
        allPages: true
      },
      dataSource: moduleSummaryManager.getModuleSummaryGridDataSource(),
      pageable: {
        refresh: true,
        pageSizes: [10, 20, 30, 40, 50],
        buttonCount: 5
      },
      height: 600,
      sortable: true,
      pageable: true,
      filterable: true,
      columns: moduleSummaryHelper.GenerateColumns(),
      editable: false,
      navigatable: true,
      resizable: true,
      selectable: "row"
    });

  },

  GenerateColumns: function () {

    return columns = [
      { field: "ModuleId", title: "ModuleId", width: 10, hidden: true },
      { field: "ModuleName", title: "Module Name", width: 60,  },
      {
        field: "edit", title: "Edit", filterable: false, width: 40,
        template: `
        <input type="button" class="btn btn-outline-success" style="cursor: pointer;" value="View" id="btnView" onClick="moduleSummaryHelper.clickEventForViewButton(event)"/>
        <input type="button" class="btn btn-outline-info" style="cursor: pointer; margin-right: 5px;" value="Edit" id="btnEdit" onClick="moduleSummaryHelper.clickEventForEditButton(event)"/>
        <input type="button" class="btn btn-outline-danger" style="cursor: pointer; margin-right: 5px;" value="Delete" id="btnDelete" onClick="moduleSummaryHelper.clickEventForDeleteButton(event)"/>
      `, sortable: false }
    ];
  },

  clickEventForEditButton: function (e) {
    debugger;
    $("#btnSave").text("Update Module");
    var grid = $("#gridSummary").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var dataItem = grid.dataItem(row);

    if (dataItem) {
      moduleDetailsHelper.PopulateNewObject(dataItem);
    }
    $('#Module-name').removeAttr('disabled');
  },

  clickEventForViewButton: function (e) {
    debugger;
    var grid = $("#gridSummary").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var dataItem = grid.dataItem(row);

    if (dataItem) {
      moduleDetailsHelper.PopulateNewObject(dataItem);
    }
    $("#Module-name").attr("disabled", "disabled");

  },

  clickEventForDeleteButton: function (e) {
    debugger;
    var grid = $("#gridSummary").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var dataItem = grid.dataItem(row);
    moduleDetailsManager.DeleteData(dataItem);
  },

  clickEventForViewHistory: function () {
    debugger;
    var entityGrid = $("#gridSummary").data("kendoGrid");

    var selectedItem = entityGrid.dataItem(entityGrid.select());
    if (selectedItem != null) {

      moduleSummaryHelper.GenerateHistorySummaryGrid(selectedItem.moduleId);
      AjaxManager.PopupWindow("divHistoryPopupFor", "History Summary", "90%");

    }
  },

  GenerateHistorySummaryGrid: function (moduleId) {
    $("#gridHistoryPopup").kendoGrid({
      // toolbar: ["excel"],
      excel: {
        fileName: "HistoryDataExport.xlsx",
        filterable: true,
        allPages: true
      },
      dataSource: moduleSummaryManager.gridDataSourceForHistory(moduleId),
      pageable: {
        refresh: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      xheight: 450,
      filterable: true,
      sortable: true,
      columns: moduleSummaryHelper.GenerateColumnsForHistory(),
      editable: false,
      navigatable: true,
      selectable: "row"

      //selectable: false

    });
  },

  GenerateColumnsForHistory: function () {
    return columns = [
      { field: "moduleId", title: "ModuleId", width: 50, hidden: true },
      { field: "createdBy", title: "CreatedBy", width: 50, hidden: true },
      { field: "updateBy", title: "UpdateBy", width: 50, hidden: true },
      { field: "moduleName", title: "Name", width: 100 },
      { field: "moduleApiPath", title: "Api Path", width: 100 },
      { field: "moduleDatabaseName", title: "Database Name", width: 100, hidden: true },
      { field: "moduleDatabaseIp", title: "Database IP", width: 100, hidden: true },
      { field: "moduleDatabaseUserId", title: "Database UserID", width: 100, hidden: true },
      { field: "moduleDatabasePassword", title: "ModuleDatabasePassword", width: 100, hidden: true },
      { field: "createdDate", title: "CreatedDate", width: 100, hidden: true, template: '#= kendo.toString(createdDate,"dd-MM-yyyy hh:mm:ss") #' },
      { field: "updateDate", title: "UpdateDate", width: 100, hidden: true, template: '#= kendo.toString(updateDate,"dd-MM-yyyy hh:mm:ss") #' },
      { field: "isAutoTagApplicable", title: "Is Auto Tag?", width: 100, hidden: false, template: "#= data.isAutoTagApplicable==1 ? 'Yes' : 'No' #" },
      { field: "isActive", title: "Status", width: 100, hidden: false, template: "#= data.IsActive==1 ? 'Active' : 'Inactive' #" },
      { field: "historyCreateorName", title: "Generate By", width: 100 },
      { field: "historyDate", title: "Generate Date", width: 100, template: '#= kendo.toString(historyDate,"dd-MM-yyyy hh:mm:ss") #' }

    ];
  },


};