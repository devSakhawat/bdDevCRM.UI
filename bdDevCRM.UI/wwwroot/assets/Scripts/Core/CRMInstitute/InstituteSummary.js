

/// <reference path="../../common/common.js" />
/// <reference path="institute.js" />
/// <reference path="institutedetails.js" />
/// <reference path=""

/* -------------------------------------------------
   InstituteSummaryManager : grid DataSource
--------------------------------------------------*/
var InstituteSummaryManager = {

  getSummaryInstituteGridDataSourcejQuery: function () {
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


  getSummaryInstituteGridDataSourceVanilla: function () {
    return VanillaApiCallManager.GenericGridDataSource({
      apiUrl: baseApi + "/crm-institute-summary",
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


/* -------------------------------------------------
   InstituteSummaryHelper : Grid Generation + Action
--------------------------------------------------*/
var InstituteSummaryHelper = {

  initInstituteSummary: function () {
    this.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    var Columns = this.generateColumns();
    var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(this.generateColumns());
    var gridWidth = totalColumnsWidth > (window.innerWidth - 323) ? (window.innerWidth - 323).toString() : `${totalColumnsWidth}px`;

    const gridOptions = {
      toolbar: [
        { template: '<button type="button" id="btnAddNew" class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" onclick="InstituteDetailsHelper.openInistitutePopUp();"><span class="k-button-text"> + Create New </span></button>' },
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
        fileName: "Institute_Information.pdf",
        allPages: true,
        paperSize: "A4",
        landscape: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        scale: 0.9,
        repeatHeaders: true,
        columns: [
          { field: "InstituteName", width: 200 }
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
        VanillaApiCallManager.handleApiError(error);
        //console.error("Grid Error:", e);
        //kendo.alert("Grid Error: " + e.errors);
      }
    };

    // Initialize the Kendo Grid
    $("#gridSummaryInstitute").kendoGrid(gridOptions);

    // CSV Export button event
    $("#btnExportCsv").on("click", function () {
      CommonManager.GenerateCSVFileAllPages("gridSummaryInstitute", "InstituteTypeListCSV", "Actions");
    });

    const grid = $("#gridSummaryInstitute").data("kendoGrid");
    if (grid) {
      const ds = InstituteSummaryManager.getSummaryInstituteGridDataSourceVanilla();

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


  /* Grid Columns */
  generateColumns: function () {
    return [
      // hidden fields
      { field: "InstituteId", hidden: true },
      { field: "CountryId", hidden: true },
      { field: "CurrencyId", hidden: true },
      { field: "InstituteTypeId", hidden: true },

      // Logo
      {
        field: "InstitutionLogo",
        title: "Logo",
        width: "110px",
        template: function (dataItem) {
          if (!dataItem.InstitutionLogo) return `<span style="color:#888">No Logo</span>`;
          const fullUrl = `${baseApiFilePath}${dataItem.InstitutionLogo}`;
          return `<img src="${fullUrl}" 
                 style="height:50px; max-width:100px; object-fit:contain; cursor:pointer;"
                 onclick="PreviewManger.openGridImagePreview('${dataItem.InstitutionLogo}')" />`;
        }
      },

      // InstitutionProspectus as PDF link
      {
        field: "InstitutionProspectus",
        title: "Prospectus",
        width: 150,
        template: function (dataItem) {
          if (dataItem.InstitutionProspectus) {
            return `<a href="#" style= "contain; cursor:pointer;"
            onclick="PreviewManger.openPreview('${dataItem.InstitutionProspectus}'); ">📄 View PDF</a>`;
          } else {
            return `<span style="color:#888">No File</span>`;
          }
        }
      },

      // Basic Info fields
      { field: "InstituteName", title: "Name", width: "200px" },
      { field: "InstituteCode", title: "Code", width: "100px" },
      { field: "InstituteEmail", title: "Email", width: "150px" },
      { field: "InstituteAddress", title: "Address", width: "150px" },
      { field: "InstitutePhoneNo", title: "Phone No", width: "150px" },
      { field: "InstituteMobileNo", title: "Mobile No", width: "150px" },
      { field: "Campus", title: "Campus", width: "150px" },
      { field: "Website", title: "Website", width: "150px" },

      // Financial / Visa fields
      { field: "MonthlyLivingCost", title: "Monthly<br/>Living Cost", width: "100px" },
      { field: "FundsRequirementforVisa", title: "Funds<br/>for Visa", width: "90px" },
      { field: "ApplicationFee", title: "Application<br/>Fee", width: "100px" },

      // Language & Academic fields
      { field: "IsLanguageMandatory", title: "Language<br/>Mandatory", width: "100px", template: "#= IsLanguageMandatory ? 'Yes' : 'No' #" },
      { field: "LanguagesRequirement", title: "Languages<br/>Requirement", width: "100px" },

      // Descriptive Info fields
      { field: "InstitutionalBenefits", title: "Institutional<br/>Benefits", width: "100px" },
      { field: "PartTimeWorkDetails", title: "Part Time<br/>Work", width: "100px" },
      { field: "ScholarshipsPolicy", title: "Scholarships<br/>Policy", width: "150px" },
      { field: "InstitutionStatusNotes", title: "Institution<br/>Status Notes", width: "150px" },

      //// File Paths fields
      //{ field: "InstitutionLogo", title: "Logo", width: "70px" },
      //{ field: "InstitutionProspectus", title: "Prospectus", width: "100px" },

      // Status field
      { field: "Status", title: "Status", width: "80px", template: "#= Status ? 'Yes' : 'No' #" },

      // Dropdown Name fields
      { field: "CountryName", title: "Country", width: "100px" },
      { field: "CurrencyName", title: "Currency", width: "90px" },
      { field: "InstituteTypeName", title: "Institute<br/>Type", width: "100px" },


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
  },


  // Helper functions
  openImagePreview: function (url) {
    if (!$("#pdfViewerWindow").data("kendoWindow")) {
      $("#pdfViewerWindow").kendoWindow({
        width: "50%",
        height: "auto",
        title: "Logo Preview",
        modal: true,
        visible: false
      });
    }

    $("#pdfViewerWindow").data("kendoWindow").center().open();
    $("#pdfViewer").html(`<img src="${url}" style="max-width:100%;height:auto;" />`);
  },

  openPdfPreview: function (pdfUrl) {
    if (!$("#pdfViewerWindow").data("kendoWindow")) {
      $("#pdfViewerWindow").kendoWindow({
        width: "80%",
        height: "80vh",
        title: "PDF Preview",
        modal: true,
        visible: false,
        close: function () {
          $("#pdfViewer").empty();
        }
      });
    }

    $("#pdfViewerWindow").data("kendoWindow").center().open();

    $("#pdfViewer").kendoPDFViewer({
      pdfjsProcessing: { file: pdfUrl },
      width: "100%",
      height: "100%",
      toolbar: {
        items: ["pager", "spacer", "zoomIn", "zoomOut", "toggleSelection", "download"]
      }
    });
  },



};




