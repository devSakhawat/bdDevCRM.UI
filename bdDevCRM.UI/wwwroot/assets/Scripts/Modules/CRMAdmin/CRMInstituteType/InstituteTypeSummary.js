/// <reference path="../../common/common.js" />
/// <reference path="instituteTypeDetails.js" />
/// <reference path="instituteType.js" />

/// <reference path=""


/* -------------------------------------------------
   InstituteTypeSummaryManager : Grud DataSource
--------------------------------------------------*/
var InstituteTypeSummaryManager = {

  getSummaryInstituteTypeGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/crm-institutetype-summary",
      requestType: "POST",
      async: true,
      modelFields: { createdDate: { type: "date" } },
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Items",
      schemaTotal: "TotalCount"
    });
  },


};


/* -------------------------------------------------
   InstituteTypeSummaryHelper : Grid Generation + Action
--------------------------------------------------*/
var InstituteTypeSummaryHelper = {

  initInstituteTypeSummary: function () {
    this.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    var Columns = this.generateColumns();
    var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(this.generateColumns());
    var gridWidth = totalColumnsWidth > (window.innerWidth - 323) ? (window.innerWidth - 323).toString() : `${totalColumnsWidth}px`;

    const gridOptions = {
      toolbar: [
        { name: "excel" },
        { name: "pdf" },
        { template: '<button type="button" id="btnExportCsv" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }

      ],
      excel: {
        fileName: "InstituteTypeList" + Date.now() + ".xlsx",
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
      autoBind: true,
      navigatable: true, // Enable keyboard navigation
      scrollable: true,
      resizable: true,
      width: gridWidth,
      filterable: true,
      sortable: true,
      pageable: {
        refresh: true,
        pageSizes: [10, 20, 20, 30, 50, 100],
        buttonCount: 5,
        input: false,
        numeric: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      columns: Columns,
      editable: false, // Disable inline editing
      selectable: "row", // Enable row selection
    };

    // Initialize the Kendo Grid
    $("#gridSummaryInstituteType").kendoGrid(gridOptions);

    $("#btnExportCsv").on("click", function () {
      debugger;
      CommonManager.GenerateCSVFileAllPages("gridSummaryInstituteType", "MenuListCSV", "Actions");
    });

    // Fetch and set the data source after the grid is initialized
    const grid = $("#gridSummaryInstituteType").data("kendoGrid");
    if (grid) {
      const ds = InstituteTypeSummaryManager.getSummaryInstituteTypeGridDataSource();
      ds.fetch().then(() => grid.setDataSource(ds));
      grid.setDataSource(ds);
    }
  },


  /* Grid Columns */
  generateColumns: function () {
    return [
      // hidden fields
      { field: "InstituteTypeId", hidden: true },
      { field: "InstituteTypeName", title: "Name", width: "200px" },

      // Action buttons
      {
        field: "Action", title: "#", filterable: false, width: "230px",
        template: `
        <input type="button" class="btn btn-outline-success widthSize30_per"
               value="View" onClick="InstituteTypeSummaryHelper.clickEventForViewButton(event)" />
        <input type="button" class="btn btn-outline-dark me-1 widthSize30_per"
               value="Edit" onClick="InstituteTypeSummaryHelper.clickEventForEditButton(event)" />
        <input type="button" class="btn btn-outline-danger widthSize33_per"
               value="Delete" onClick="InstituteTypeSummaryHelper.clickEventForDeleteButton(event)" />
      `
      }
    ];
  },

  /* --- Action Handlers --- */
  _getGridItem: function (event) {
    const grid = $("#gridSummaryInstituteType").data("kendoGrid");
    const tr = $(event.target).closest("tr");
    return grid.dataItem(tr);
  },

  clickEventForViewButton: function (event) {
    debugger;
    const item = this._getGridItem(event);
    console.log(item);
    if (item) {
      InstituteTypeDetailsHelper.populateObject(item);
      CommonManager.MakeFormReadOnly("#InstituteTypeFrom");
      $("#btnInstituteTypeSaveOrUpdate").prop("disabled", "disabled");
    }
  },

  clickEventForEditButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      InstituteTypeDetailsHelper.populateObject(item);
      CommonManager.MakeFormEditable("#InstituteTypeFrom");
    }
  },

  clickEventForDeleteButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      InstituteTypeDetailsManager.deleteItem(item);
    }
  }

};