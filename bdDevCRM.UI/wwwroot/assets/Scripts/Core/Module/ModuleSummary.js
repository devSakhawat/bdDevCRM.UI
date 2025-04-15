//var moduleSummaryManager2 = {

//  gridDataSource: function () {
//    var apiUrl = coreManagement + "/Module/GetModuleSummary";

//    var gridDataSource = new kendo.data.DataSource({
//      type: "json",
//      serverPaging: true,
//      serverSorting: false,
//      serverFiltering: true,
//      allowUnsort: false,
//      pageSize: 10,
//      transport: {
//        read: {
//          url: apiUrl,
//          type: "POST",
//          dataType: "json",
//          async: false,
//          contentType: "application/json; charset=utf-8"
//        },
//        parameterMap: function (options) {
//          return JSON.stringify(options);
//        }
//      },
//      schema: {
//        data: "items", total: "totalCount",
//        model: {
//          fields: {
//            createdDate: {
//              type: "date"
//            },
//            updateDate: {
//              type: "date"
//            },
//            historyDate: {
//              type: "date"
//            },

//          }
//        }
//      }
//    });

//    return gridDataSource;
//   },

//   getSummaryGridDataSource: function () {
//      return AjaxManager.GenericGridDataSource({
//         apiUrl: baseApi + "/module-summary",
//         requestType: "POST",
//         async: true, 
//         modelFields: {
//            createdDate: { type: "date" } 
//         },
//         pageSize: 20, 
//         serverPaging: true, 
//         serverSorting: true, 
//         serverFiltering: true,
//         allowUnsort: true,
//         schemaData: "Items", 
//         schemaTotal: "TotalCount" 
//      });
//   },

//  gridDataSourceForHistory: function (moduleId) {

//    var apiUrl = coreManagement + "/Module/GetModuleHistorySummary/?moduleId=" + moduleId;

//    var gridDataSource = new kendo.data.DataSource({
//      type: "json",
//      serverPaging: true,
//      serverSorting: false,
//      serverFiltering: true,
//      allowUnsort: false,
//      pageSize: 10,
//      transport: {
//        read: {
//          url: apiUrl,
//          type: "POST",
//          dataType: "json",
//          async: false,
//          contentType: "application/json; charset=utf-8"
//        },
//        parameterMap: function (options) {
//          return JSON.stringify(options);
//        }
//      },
//      schema: {
//        data: "items", total: "totalCount",
//        model: {
//          fields: {
//            createdDate: {
//              type: "date"
//            },
//            updateDate: {
//              type: "date"
//            },
//            historyDate: {
//              type: "date"
//            },

//          }
//        }
//      }
//    });

//    return gridDataSource;
//  },

//  getModuleSummaryGridDataSourceNew: function () {
//    return AjaxManager.GenericGridDataSourceNew({
//      apiUrl: baseApi + "/module-summary", // API endpoint
//      requestType: "POST", // HTTP method
//      async: true, // Asynchronous requests
//      modelFields: {
//        createdDate: { type: "date" } // Define model fields
//      },
//      pageSize: 20, // Number of rows per page
//      serverPaging: true, // Enable server-side paging
//      serverSorting: true, // Enable server-side sorting
//      serverFiltering: true, // Enable server-side filtering
//      allowUnsort: true, // Allow unsorting columns
//      schemaData: "Items", // Data field in the API response
//      schemaTotal: "TotalCount" // Total count field in the API response
//    });
//  },

//};

var ModuleSummaryManager = {

   getSummaryGridDataSource: function () {
      return AjaxManager.GenericGridDataSource({
         apiUrl: baseApi + "/module-summary",
         requestType: "POST",
         async: true,
         //contentType: "application/json; charset=utf-8",
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


var ModuleSummaryHelper = {

   initializeSummary: function () {
      debugger;
      ModuleSummaryHelper.initializeSummaryGrid();
   },

   initializeSummaryGrid: function () {
      debugger;
      const gridOptions = {
         toolbar: [
            { template: '<button type="button" id="btnAddNew" class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text"> + Create New </span></button>' },
            { name: "excel" },
            { name: "pdf" },
            { template: '<button type="button" id="btnExportCsv" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }

         ],
         excel: {
            fileName: "ModuleExport.xlsx",
            filterable: true,
            allPages: true,
            columnInfo: true,
         },
         pdf: {
            fileName: "ModuleExport.pdf",
            allPages: true,
            paperSize: "a4",
            landscape: true,
            margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
            repeatHeaders: true
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
         height: 600,
         filterable: true,
         sortable: true,
         columns: ModuleSummaryHelper.GenerateColumns(),
         editable: false, 
         navigatable: true, 
         selectable: "row", 
      };

      // Initialize the Kendo Grid
      $("#gridSummary").kendoGrid(gridOptions);

      // If you need to attach an event handler to the button
      $("#btnAddNew").on("click", function (e) {
         e.preventDefault();
         ModuleDetailsHelper.AddNewInformation();
      });

      $("#btnExportCsv").on("click", function () {
         debugger;
         AjaxManager.GenerateCSVFileAllPages("gridSummary", "MenuListCSV", "Actions");
      });

      // Fetch and set the data source after the grid is initialized
      const gridInstance = $("#gridSummary").data("kendoGrid");
      if (gridInstance) {
         const dataSource = ModuleSummaryManager.getSummaryGridDataSource();
         gridInstance.setDataSource(dataSource);
      }

   },

   GenerateColumns: function () {
      return columns = [
         { field: "ModuleId", title: "ModuleId", width: 10, hidden: true },
         { field: "ModuleName", title: "Module Name", width: 60, },
         {
            field: "edit", title: "Edit", filterable: false, width: 40,
            template: `
        <input type="button" class="btn btn-outline-success" style="cursor: pointer;" value="View" id="btnView" onClick="ModuleSummaryHelper.clickEventForViewButton(event)"/>
        <input type="button" class="btn btn-outline-dark " style="cursor: pointer; margin-right: 5px;" value="Edit" id="btnEdit" onClick="ModuleSummaryHelper.clickEventForEditButton(event)"/>
        <input type="button" class="btn btn-outline-danger" style="cursor: pointer; margin-right: 5px;" value="Delete" id="btnDelete" onClick="ModuleSummaryHelper.clickEventForDeleteButton(event)"/>`
            , sortable: false, exportable: false
         }
      ];
   },

   clickEventForViewButton: function (e) {
      debugger;

      var grid = $("#gridSummary").data("kendoGrid");
      var row = $(e.target).closest("tr");
      var dataItem = grid.dataItem(row);

      if (dataItem) {
         ModuleDetailsHelper.PopulateObject(dataItem);
         AjaxManager.MakeFormReadOnly("#divdetailsForDetails");
      }

   },

   clickEventForDeleteButton: function (e) {
      debugger;
      var grid = $("#gridSummary").data("kendoGrid");
      var row = $(e.target).closest("tr");
      var dataItem = grid.dataItem(row);

      if (dataItem) {
         ModuleDetailsManager.DeleteData(dataItem);
      }
   },

   clickEventForEditButton: function (e) {
      debugger;
      $("#btnSave").text("Update");

      var grid = $("#gridSummary").data("kendoGrid");
      var row = $(e.target).closest("tr");
      var dataItem = grid.dataItem(row);

      if (dataItem) {
         AjaxManager.MakeFormEditable("#divdetailsForDetails");
         ModuleDetailsHelper.PopulateObject(dataItem);
      }
   },

};


//var moduleSummaryHelper2 = {

//  initateSummary: function () {
//    debugger;
//    moduleSummaryHelper.initializeModuleSummaryGrid();
//  },

//  initializeModuleSummaryGrid: function () {
//    const gridOptions = {
//       toolbar: [
//          { template: '<button type="button" id="btnAddNew" class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text"> + Create New </span></button>' },
//          { name: "excel" },
//          { name: "pdf" },
//          { template: '<button type="button" id="btnExportCsv" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }

//       ],
//       excel: {
//          fileName: "MenuExport.xlsx",
//          filterable: true,
//          allPages: true,
//          columnInfo: true,
//       },
//       pdf: {
//          fileName: "ModuleExport.pdf",
//          allPages: true,
//          paperSize: "a4",
//          landscape: true,
//          margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
//          repeatHeaders: true
//       },
//      dataSource: [], 
//       pageable: {
//          refresh: true,
//          pageSizes: [10, 15, 20, 30, 50],
//          buttonCount: 5,
//          serverPaging: true,
//          serverFiltering: true,
//          serverSorting: true
//       },
//       height: 600,
//       filterable: true,
//       sortable: true,
//       columns: moduleSummaryHelper.GenerateColumns(),
//       editable: false,
//       navigatable: true,
//       selectable: "row",
//    };

//    // Initialize the Kendo Grid
//     $("#gridSummary").kendoGrid(gridOptions);

//     // If you need to attach an event handler to the button
//     $("#btnAddNew").on("click", function (e) {
//        e.preventDefault();
//        moduleDetailsHelper.AddNewInformation();
//     });

//     $("#btnExportCsv").on("click", function () {
//        AjaxManager.GenerateCSVFileAllPages("gridSummary", "ModuleListCSV", "Actions");
//     });

//     const gridInstance = $("#gridSummary").data("kendoGrid");
//     if (gridInstance) {
//        const dataSource = moduleSummaryManager.getSummaryGridDataSource();
//        gridInstance.setDataSource(dataSource);
//     }

//  },

//  GenerateModuleSummaryGrid: function () {

//    $("#gridSummary").kendoGrid({
//      toolbar: ["excel"],
//      excel: {
//        fileName: "ModuleExport.xlsx",
//        filterable: true,
//        allPages: true
//      },
//      dataSource: moduleSummaryManager.getModuleSummaryGridDataSource(),
//      pageable: {
//        refresh: true,
//        pageSizes: [10, 20, 30, 40, 50],
//        buttonCount: 5
//      },
//      height: 600,
//      sortable: true,
//      pageable: true,
//      filterable: true,
//      columns: moduleSummaryHelper.GenerateColumns(),
//      editable: false,
//      navigatable: true,
//      resizable: true,
//      selectable: "row"
//    });

//  },

//  GenerateColumns: function () {
//    return columns = [
//      { field: "ModuleId", title: "ModuleId", width: 10, hidden: true },
//      { field: "ModuleName", title: "Module Name", width: 60,  },
//      {
//        field: "edit", title: "Edit", filterable: false, width: 40,
//        template: `
//        <input type="button" class="btn btn-outline-success" style="cursor: pointer;" value="View" id="btnView" onClick="moduleSummaryHelper.clickEventForViewButton(event)"/>
//        <input type="button" class="btn btn-outline-info" style="cursor: pointer; margin-right: 5px;" value="Edit" id="btnEdit" onClick="moduleSummaryHelper.clickEventForEditButton(event)"/>
//        <input type="button" class="btn btn-outline-danger" style="cursor: pointer; margin-right: 5px;" value="Delete" id="btnDelete" onClick="moduleSummaryHelper.clickEventForDeleteButton(event)"/>
//      `, sortable: false }
//    ];
//  },

//  clickEventForEditButton: function (e) {
//    debugger;
//    $("#btnSave").text("Update Module");
//    var grid = $("#gridSummary").data("kendoGrid");
//    var row = $(e.target).closest("tr");
//    var dataItem = grid.dataItem(row);

//    if (dataItem) {
//      moduleDetailsHelper.PopulateNewObject(dataItem);
//    }
//    $('#Module-name').removeAttr('disabled');
//  },

//  clickEventForViewButton: function (e) {
//    debugger;
//    var grid = $("#gridSummary").data("kendoGrid");
//    var row = $(e.target).closest("tr");
//    var dataItem = grid.dataItem(row);

//    if (dataItem) {
//      moduleDetailsHelper.PopulateNewObject(dataItem);
//    }
//    $("#Module-name").attr("disabled", "disabled");

//  },

//  clickEventForDeleteButton: function (e) {
//    debugger;
//    var grid = $("#gridSummary").data("kendoGrid");
//    var row = $(e.target).closest("tr");
//    var dataItem = grid.dataItem(row);
//    moduleDetailsManager.DeleteData(dataItem);
//  },

//  clickEventForViewHistory: function () {
//    debugger;
//    var entityGrid = $("#gridSummary").data("kendoGrid");

//    var selectedItem = entityGrid.dataItem(entityGrid.select());
//    if (selectedItem != null) {

//      moduleSummaryHelper.GenerateHistorySummaryGrid(selectedItem.moduleId);
//      AjaxManager.PopupWindow("divHistoryPopupFor", "History Summary", "90%");

//    }
//  },

//  GenerateHistorySummaryGrid: function (moduleId) {
//    $("#gridHistoryPopup").kendoGrid({
//      // toolbar: ["excel"],
//      excel: {
//        fileName: "HistoryDataExport.xlsx",
//        filterable: true,
//        allPages: true
//      },
//      dataSource: moduleSummaryManager.gridDataSourceForHistory(moduleId),
//      pageable: {
//        refresh: true,
//        serverPaging: true,
//        serverFiltering: true,
//        serverSorting: true
//      },
//      xheight: 450,
//      filterable: true,
//      sortable: true,
//      columns: moduleSummaryHelper.GenerateColumnsForHistory(),
//      editable: false,
//      navigatable: true,
//      selectable: "row"

//      //selectable: false

//    });
//  },

//  GenerateColumnsForHistory: function () {
//    return columns = [
//      { field: "moduleId", title: "ModuleId", width: 50, hidden: true },
//      { field: "createdBy", title: "CreatedBy", width: 50, hidden: true },
//      { field: "updateBy", title: "UpdateBy", width: 50, hidden: true },
//      { field: "moduleName", title: "Name", width: 100 },
//      { field: "moduleApiPath", title: "Api Path", width: 100 },
//      { field: "moduleDatabaseName", title: "Database Name", width: 100, hidden: true },
//      { field: "moduleDatabaseIp", title: "Database IP", width: 100, hidden: true },
//      { field: "moduleDatabaseUserId", title: "Database UserID", width: 100, hidden: true },
//      { field: "moduleDatabasePassword", title: "ModuleDatabasePassword", width: 100, hidden: true },
//      { field: "createdDate", title: "CreatedDate", width: 100, hidden: true, template: '#= kendo.toString(createdDate,"dd-MM-yyyy hh:mm:ss") #' },
//      { field: "updateDate", title: "UpdateDate", width: 100, hidden: true, template: '#= kendo.toString(updateDate,"dd-MM-yyyy hh:mm:ss") #' },
//      { field: "isAutoTagApplicable", title: "Is Auto Tag?", width: 100, hidden: false, template: "#= data.isAutoTagApplicable==1 ? 'Yes' : 'No' #" },
//      { field: "isActive", title: "Status", width: 100, hidden: false, template: "#= data.IsActive==1 ? 'Active' : 'Inactive' #" },
//      { field: "historyCreateorName", title: "Generate By", width: 100 },
//       { field: "historyDate", title: "Generate Date", width: 100, template: '#= kendo.toString(historyDate,"dd-MM-yyyy hh:mm:ss") #' }

//    ];
//  },


//};