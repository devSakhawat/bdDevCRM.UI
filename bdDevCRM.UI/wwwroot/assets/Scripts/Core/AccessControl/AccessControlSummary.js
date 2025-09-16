/// <reference path="accesscontroldetails.js" />
/// <reference path="accesscontrolsettings.js" />


var AccessControlSummaryManager = {
  
  getSummaryGridDataSource: function () {
    return VanillaApiCallManager.GenericGridDataSource({
      apiUrl: baseApi + "/access-control-summary",
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

var AccessControlSummaryHelper = {

  initAccessControlSummary: function () {
    AccessControlSummaryHelper.initializeResponsiveGrid();
  },

  initializeResponsiveGrid2: function () {
    var columns = this.generateResponsiveColumns();

    $("#gridSummary").kendoGrid({
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
      dataSource: AccessControlSummaryManager.getSummaryGridDataSource(),
      height: this.calculateGridHeight(),
      width: "100%",
      scrollable: {
        virtual: false
      },
      resizable: true,
      sortable: true,
      filterable: true,
      pageable: {
        refresh: true,
        pageSizes: [10, 20, 50],
        buttonCount: 3
      },
      columns: columns,
      mobile: true,
      /*toolbar: this.getToolbarConfig(),*/
      dataBound: function () {
        AccessControlSummaryHelper.adjustGridForMobile();
      }
    });
  },

  initializeResponsiveGrid: function () {
    var Columns = this.generateResponsiveColumns();
    //var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(this.generateColumns());
    //var gridWidth = totalColumnsWidth > (window.innerWidth - 323) ? (window.innerWidth - 323).toString() : `${totalColumnsWidth}px`;

    const gridOptions = {
      toolbar: [
        { name: "excel" },
        { name: "pdf" },
        { template: '<button type="button" id="btnExportCsv" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }
      ],
      excel: {
        fileName: "AccessControlExport" + Date.now() + ".xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      pdf: {
        fileName: "AccessControlExport" + Date.now() + ".pdf",
        allPages: true,
        paperSize: "A4",
        landscape: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        scale: 0.9,
        repeatHeaders: true,
        //columns: [
        //  { field: "InstituteName", width: 200 }
        //]
      },
      dataSource: [],
      autoBind: true,
      navigatable: true,
      scrollable: true,
      resizable: true,
      //width: gridWidth,
      height: this.calculateGridHeight(),
      width: "100%",
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
        VanillaApiCallManager.handleApiError(error);
        //console.error("Grid Error:", e);
        //kendo.alert("Grid Error: " + e.errors);
      }
    };

    // Initialize the Kendo Grid
    $("#gridSummary").kendoGrid(gridOptions);

    // CSV Export button event
    var accessControlCSV = "AccessControl" + Date.now();
    $("#btnExportCsv").on("click", function () {
      CommonManager.GenerateCSVFileAllPages("gridSummary", accessControlCSV, "Actions");
    });

    const grid = $("#gridSummary").data("kendoGrid");
    if (grid) {
      //const ds = InstituteSummaryManager.getSummaryInstituteGridDataSourceVanilla();
      const ds = AccessControlSummaryManager.getSummaryGridDataSource();

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


  generateResponsiveColumns: function () {
    var isMobile = window.innerWidth < 768;

    var columns = [
      { field: "AccessControlId", hidden: true },
      {
        field: "AccessName",
        title: isMobile ? "Name" : "Access Name",
        width: isMobile ? 120 : 200,
        //attributes: {
        //  style: "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        //}
      },
      {
        field: "Action",
        title: "Actions",
        filterable: false,
        width: isMobile ? 100 : 220,
        template: this.getActionTemplate()
      },
      //// Action buttons
      //{
      //  field: "Action", title: "#", filterable: false, width: "230px",
      //  template: `
      //  <input type="button" class="btn btn-outline-success widthSize30_per"
      //         value="View" onClick="InstituteSummaryHelper.clickEventForViewButton(event)" />
      //  <input type="button" class="btn btn-outline-dark me-1 widthSize30_per"
      //         value="Edit" onClick="InstituteSummaryHelper.clickEventForEditButton(event)" />
      //  <input type="button" class="btn btn-outline-danger widthSize33_per"
      //         value="Delete" onClick="InstituteSummaryHelper.clickEventForDeleteButton(event)" />
      //`
      //}
    ];

    return columns;
  },

  getActionTemplate: function () {
      // Desktop buttons - Fixed template
    return '<button class="btn btn-outline-dark me-1" onclick="AccessControlSummaryHelper.clickEventForEditButton(event)">Edit</button>'
      +'<button class="btn btn-outline-danger" onclick="AccessControlSummaryHelper.clickEventForDeleteButton(event)">Delete</button>';
  },

  calculateGridHeight: function () {
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;

    if (windowWidth < 576) {
      return 400; // Mobile
    } else if (windowWidth < 992) {
      return 450; // Tablet
    } else {
      return Math.min(800, windowHeight - 300); // Desktop
    }
  },

  adjustGridForMobile: function () {
    if (window.innerWidth < 768) {
      // Additional mobile adjustments
      $(".k-grid-toolbar").find(".k-button").addClass("btn-sm");
      $(".k-pager-wrap").addClass("k-pager-sm");
    }
  },

  //clickEventForEditButton: function (e) {

  //  var grid = $("#gridSummary").data("kendoGrid");
  //  var row = $(e.target).closest("tr");
  //  var dataItem = grid.dataItem(row);

  //  if (dataItem) {
  //    CommonManager.MakeFormEditable("#divdetailsForDetails");
  //    AccessControlDetailsHelper.PopulateObject(dataItem);
  //  }
  //},


  /* --- Action Handlers --- */
  _getGridItem: function (event) {
    const grid = $("#gridSummary").data("kendoGrid");
    const tr = $(event.target).closest("tr");
    if (tr.length == 0) {
      var dataItem = grid.dataItem(grid.select());
      return dataItem;
    }
    return grid.dataItem(tr);
  },

  clickEventForEditButton: async function (event) {
    debugger;
    const item = this._getGridItem(event);
    if (item) {
      AccessControlDetailsHelper.PopulateObject(item);
      CommonManager.MakeFormEditable("#accessControlForm");
    }
  },

  clickEventForDeleteButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      InstituteDetailsManager.deleteItem(item);
    }
  },

};