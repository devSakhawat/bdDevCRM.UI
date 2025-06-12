

/// <reference path="../../common/common.js" />
/// <reference path="institute.js" />
/// <reference path="institutedetails.js" />
/// <reference path=""

/* -------------------------------------------------
   InstituteSummaryManager : grid DataSource
--------------------------------------------------*/
var InstituteSummaryManager = {

  getSummaryInstituteGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/crm-institute-summary",
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
   InstituteSummaryHelper : Grid Generation + Action
--------------------------------------------------*/
var InstituteSummaryHelper = {

  initInstituteSummary: function () {
    this.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    var Columns = this.generateColumns();
    const gridOptions = {
      toolbar: [
        { template: '<button type="button" id="btnAddNew" class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" onclick="InstituteDetailsHelper.openInistitutePopUp();"><span class="k-button-text"> + Create New </span></button>' },
        { name: "excel" },
        { name: "pdf" },
        { template: '<button type="button" id="btnExportCsv" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }

      ],
      excel: {
        fileName: "InstituteList" + Date.now() + ".xlsx",
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
      //width: "100%",
      width: CommonManager.calculateTotalColumnsWidth(this.generateColumns()) > (window.innerWidth - 323) ? (window.innerWidth - 323).toString() : `${totalColumnsWidth}px`,
      //width: CommonManager.calculateResponsiveWidth(this.generateColumns()),
      filterable: true,
      sortable: true,
      pageable: {
        refresh: true,
        pageSizes: [10, 20, 20, 30, 50,100],
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
    $("#gridSummaryInstitute").kendoGrid(gridOptions);

    $("#btnExportCsv").on("click", function () {
      debugger;
      CommonManager.GenerateCSVFileAllPages("gridSummaryInstitute", "MenuListCSV", "Actions");
    });

    // Fetch and set the data source after the grid is initialized
    const grid = $("#gridSummaryInstitute").data("kendoGrid");
    if (grid) {
      const ds = InstituteSummaryManager.getSummaryInstituteGridDataSource();
      ds.fetch().then(() => grid.setDataSource(ds));
      grid.setDataSource(ds);
    }
  },


  /* Grid Columns */
  generateColumns: function () {
    return [
      // hidden fields
      { field: "InstituteId", hidden: true },
      { field: "CountryId", hidden: true },
      { field: "InstituteTypeId", hidden: true },
      { field: "CurrencyId", hidden: true },

      // Basic Info fields
      { field: "InstituteName", title: "Name", width: "200px" },
      { field: "InstituteCode", title: "Code", width: "100px" },
      { field: "InstituteEmail", title: "Email", width: "100px" },
      { field: "InstitutePhoneNo", title: "Phone No", width: "100px" },
      { field: "InstituteMobileNo", title: "Mobile No", width: "100px" },
      { field: "InstituteAddress", title: "Address", width: "100px" },
      { field: "Campus", title: "Campus", width: "100px" },
      { field: "Website", title: "Website", width: "100px" },

      // Financial / Visa fields
      { field: "MonthlyLivingCost", title: "Monthly<br/>Living Cost", width: "100px" },
      { field: "FundsRequirementforVisa", title: "Funds<br/>for Visa", width: "100px" },
      { field: "ApplicationFee", title: "Application<br/>Fee", width: "100px" },

      // Language & Academic fields
      { field: "IsLanguageMandatory", title: "Language<br/>Mandatory", width: "100px", template: "#= IsLanguageMandatory ? 'Yes' : 'No' #" },
      { field: "LanguagesRequirement", title: "Languages<br/>Requirement", width: "100px" },

      // Descriptive Info fields
      { field: "InstitutionalBenefits", title: "Institutional<br/>Benefits", width: "100px" },
      { field: "PartTimeWorkDetails", title: "Part Time<br/>Work", width: "100px" },
      { field: "ScholarshipsPolicy", title: "Scholarships<br/>Policy", width: "150px" },
      { field: "InstitutionStatusNotes", title: "Institution<br/>Status Notes", width: "150px" },

      // File Paths fields
      { field: "InstitutionLogo", title: "Institution<br/>Logo", width: "100px" },
      { field: "InstitutionProspectus", title: "Institution<br/>Prospectus", width: "150px" },

      // Status field
      { field: "Status", title: "Status", width: "80px", template: "#= Status ? 'Yes' : 'No' #" },

      // Dropdown Name fields
      { field: "CountryName", title: "Country", width: "120px" },
      { field: "InstituteType", title: "Institute<br/>Type", width: "100px" },
      { field: "CurrencyName", title: "Currency", width: "100px" },

      // Action buttons
      {
        field: "Action", title: "#", filterable: false, width: "230px",
        template: `
        <input type="button" class="btn btn-outline-success widthSize30_per"
               value="View" onClick="InstituteSummaryHelper.clickEventForViewButton(event)" />
        <input type="button" class="btn btn-outline-dark me-1 widthSize30_per"
               value="Edit" onClick="InstituteSummaryHelper.clickEventForEditButton(event)" />
        <input type="button" class="btn btn-outline-danger widthSize33_per"
               value="Delete" onClick="InstituteSummaryHelper.clickEventForDeleteButton(event)" />
      `
      }
    ];
  },

  /* --- Action Handlers --- */
  _getGridItem: function (event) {
    const grid = $("#gridSummaryInstitute").data("kendoGrid");
    const tr = $(event.target).closest("tr");
    return grid.dataItem(tr);
  },

  clickEventForViewButton: function (event) {
    debugger;
    const item = this._getGridItem(event);
    console.log(item);
    if (item) {
      InstituteDetailsHelper.clearForm();
      const windowId = "InstitutePopUp";
      CommonManager.openKendoWindow(windowId, "View Institute", "80%");
      // Append Close button dynamically if not already added
      CommonManager.appandCloseButton(windowId);


      InstituteDetailsHelper.populateObject(item);
      CommonManager.MakeFormReadOnly("#InstituteForm");
      $("#btnInstituteSaveOrUpdate").prop("disabled", "disabled");
    }
  },

  clickEventForEditButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      InstituteDetailsHelper.clearForm();
      const windowId = "InstitutePopUp";
      CommonManager.openKendoWindow(windowId, "View Institute", "80%");
      // Append Close button dynamically if not already added
      CommonManager.appandCloseButton(windowId);

      InstituteDetailsHelper.populateObject(item);
      CommonManager.MakeFormEditable("#InstituteForm");
    }
  },

  clickEventForDeleteButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      InstituteDetailsManager.deleteItem(item);
    }
  }

};