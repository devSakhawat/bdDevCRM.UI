var menuSummaryManager = {

  getSummaryGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/menu-summary",
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

  getMenuSummaryGridDataSource2: function () {
    debugger;
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/menu-summary",
      requestType: "POST",
      async: true, 
      contentType: "application/json; charset=utf-8",
      modelFields: {
        createdDate: { type: "date" },
        //updateDate: { type: "date" },
        //historyDate: { type: "date" }
      },
      pageSize: 15,
      //serverPaging: true,
      //serverSorting: true,
      //allowUnsort: true,
      //schemaData: "items", // Name from your API response
      //schemaTotal: "totalCount", // Name from your API response
      //async: false
    });
  },

  gridDataSourceForHistory: function (menuId) {

    var apiUrl = coreManagement + "/Menu/GetMenuHistorySummary/?menuId=" + menuId;

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
            //updateDate: {
            //  type: "date"
            //},
            //historyDate: {
            //  type: "date"
            //},

          }
        }
      }
    });

    return gridDataSource;
  },
};

var MenuSummaryHelper = {

  initMenuSummary: function () {
    debugger;
    MenuSummaryHelper.initializeSummaryGrid();

    //MenuSummaryHelper.GenerateSummaryGrid();

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
        fileName: "MenuExport.xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
       pdf: {
          fileName: "Menu_Information.pdf",
          allPages: true,
          paperSize: "A4",
          landscape: true,
          margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
          scale: 0.9, // Slight scaling to prevent overflow
          repeatHeaders: true,
          columns: [
             { field: "Name", width: 150 },
             { field: "ParentMenu", width: 120 },
             { field: "ModuleName", width: 150 },
             { field: "Type", width: 80 },
             { field: "Status", width: 80 }
          ],
          // Custom styles for PDF export
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
      columns: MenuSummaryHelper.GenerateColumns(),
      editable: false, // Disable inline editing
      navigatable: true, // Enable keyboard navigation
      selectable: "row", // Enable row selection
    };

    // Initialize the Kendo Grid
    $("#gridSummary").kendoGrid(gridOptions);

    // If you need to attach an event handler to the button
    $("#btnAddNew").on("click", function (e) {
      e.preventDefault();
      MenuDetailsHelper.AddNewInformation();
    });

    $("#btnExportCsv").on("click", function () {
      debugger;
      AjaxManager.GenerateCSVFileAllPages("gridSummary", "MenuListCSV", "Actions");
    });

    // Fetch and set the data source after the grid is initialized
    const gridInstance = $("#gridSummary").data("kendoGrid");
    if (gridInstance) {
      const dataSource = menuSummaryManager.getSummaryGridDataSource();
      gridInstance.setDataSource(dataSource);
     }

  },

  GenerateColumns: function () {
      return columns = [
        { field: "MenuId", title: "Menu Id", width: 0, hidden: true },
        { field: "ModuleId", title: "Module Id", width: 0, hidden: true },
        { field: "MenuPath", title: "Menu Path", width: 0, hidden: true },
        { field: "ParentMenu", title: "Parent Menu Id", width: 0, hidden: true },
        { field: "SortOrder", title: "Sort Order", width: 0, hidden: true },
        { field: "IsQuickLink", title: "Quick Link", width: 0, hidden: true },
        { field: "MenuCode", title: "Code", width: 0, hidden: true },
         { field: "MenuName", title: "Name", width: 140, headerAttributes: { style: "white-space: normal;" } },
         { field: "ParentMenuName", title: "Parent Menu", width: 140, headerAttributes: { style: "white-space: normal;" } },
         { field: "ModuleName", title: "Module Name", width: 120, headerAttributes: {  style: "white-space: normal;" } },
        {
          field: "MenuType",
          title: "Type",
          width: 70,
          hidden: false,
           template: "#= data.MenuType == 1 ? 'Web' : data.MenuType == 2 ? 'App' : 'Both' #",
           headerAttributes: { style: "white-space: normal;" } 
        },
        {
          field: "IsActive",
          title: "Status",
          width: 80,
          hidden: false,
           template: "#= data.IsActive == 1 ? 'Active' : 'Inactive' #",
           headerAttributes: { style: "white-space: normal;" } 
        },
        {
          field: "Edit", title: "Actions", filterable: false, width: 200,
          template: `
        <input type="button" class="btn btn-outline-success widthSize30_per" style="cursor: pointer;" value="View" id="btnView" onClick="MenuSummaryHelper.clickEventForViewButton(event)"/>
        <input type="button" class="btn btn-outline-dark widthSize30_per" style="cursor: pointer;" value="Edit" id="btnEdit" onClick="MenuSummaryHelper.clickEventForEditButton(event)"/>
        <input type="button" class="btn btn-outline-danger widthSize33_per" style="cursor: pointer;" value="Delete" id="btnDelete" onClick="MenuSummaryHelper.clickEventForDeleteButton(event)"/>`
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
      MenuDetailsHelper.PopulateObject(dataItem);
      CommonManager.MakeFormReadOnly("#divdetailsForDetails");
    }

  },

  clickEventForDeleteButton: function (e) {
    debugger;

    var grid = $("#gridSummary").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var dataItem = grid.dataItem(row);

    if (dataItem) {
      MenuDetailsManager.DeleteData(dataItem);
    }
  },

  clickEventForEditButton: function (e) {
    debugger;
     $("#btnSave").text("Update");
     console.log($("#btnSave").text());

    // not working
    //var entityGrid = $("#gridMenu").data("kendoGrid");
    //var selectedItem = entityGrid.dataItem(entityGrid.select());

    var grid = $("#gridSummary").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var dataItem = grid.dataItem(row);

    if (dataItem) {
      CommonManager.MakeFormEditable("#divdetailsForDetails");
      MenuDetailsHelper.PopulateObject(dataItem);
    }
  },

};