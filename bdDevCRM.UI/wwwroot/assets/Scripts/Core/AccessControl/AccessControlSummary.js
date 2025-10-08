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

  initializeResponsiveGrid: function () {
    var Columns = this.generateResponsiveColumns();
    var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(Columns);
    var containerWidth = $("#divSummary").width() || (window.innerWidth - 323);
    var gridWidth = totalColumnsWidth > containerWidth ? "100%" : `${totalColumnsWidth}px`;

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
      },
      dataSource: [],
      autoBind: true,
      navigatable: true,
      scrollable: true,
      resizable: true,
      height: this.calculateGridHeight(),
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
        // FIX: use the correct variable
        VanillaApiCallManager.handleApiError(e);
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
      const ds = AccessControlSummaryManager.getSummaryGridDataSource();

      // Add data source error handling
      ds.bind("error", function (error) {
        VanillaApiCallManager.handleApiError(error);
      });

      // Add data source success handling
      ds.bind("requestEnd", function (e) {
        if (e.response && e.response.isSuccess === false) {
          VanillaApiCallManager.handleApiError(e.response);
        }
      });

      grid.setDataSource(ds);

      // Ensure correct height after binding (accounts for toolbar/header/pager)
      grid.setOptions({ height: AccessControlSummaryHelper.calculateGridHeight() });
      grid.resize();
    }

    // Recalculate on window resize
    $(window).off("resize.accessControlGrid").on("resize.accessControlGrid", function () {
      const g = $("#gridSummary").data("kendoGrid");
      if (g) {
        g.setOptions({ height: AccessControlSummaryHelper.calculateGridHeight() });
        g.resize();
      }
    });
  },

  generateResponsiveColumns: function () {
    var isMobile = window.innerWidth < 768;

    var columns = [
      { field: "AccessControlId", hidden: true },
      {
        field: "AccessName",
        title: isMobile ? "Name" : "Access Name",
        width: isMobile ? 120 : 200,
      },
      {
        field: "Action",
        title: "Actions",
        filterable: false,
        width: isMobile ? 100 : 220,
        template: this.getActionTemplate()
      },
    ];

    return columns;
  },

  getActionTemplate: function () {
    // Desktop buttons - Fixed template
    return '<button class="btn btn-outline-dark me-1" onclick="AccessControlSummaryHelper.clickEventForEditButton(event)">Edit</button>'
      + '<button class="btn btn-outline-danger" onclick="AccessControlSummaryHelper.clickEventForDeleteButton(event)">Delete</button>';
  },

  // New calculation that uses the grid's top offset to get true available height
  calculateGridHeight: function () {
    var windowHeight = window.innerHeight;
    var $grid = $("#gridSummary");

    // Wait for DOM to be ready
    if (!$grid.length) {
      return 500; // fallback if grid not yet rendered
    }

    var top = $grid.offset().top;

    // Footer space: keep 30px at the bottom + account for any browser chrome
    var bottomPadding = 40;

    // available viewport space from grid top to bottom
    var available = Math.max(0, windowHeight - top - bottomPadding);

    // clamp per breakpoint (remove maxH constraint for full viewport use)
    var windowWidth = window.innerWidth;
    var minH = windowWidth < 576 ? 300 : (windowWidth < 992 ? 350 : 400);

    // Use available height directly (no max limit) but ensure minimum
    var finalH = Math.max(minH, available);

    // Expose to CSS so the wrapper can size itself without extra reflow
    var el = document.getElementById("gridSummary");
    if (el) {
      el.style.setProperty("--gridSummaryHeight", finalH + "px");
    }

    return finalH;
  },

  adjustGridForMobile: function () {
    if (window.innerWidth < 768) {
      $(".k-grid-toolbar").find(".k-button").addClass("btn-sm");
      $(".k-pager-wrap").addClass("k-pager-sm");
    }
  },

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