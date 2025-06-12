/// <reference path="../../common/common.js" />
/// <reference path="CurrencyDetail.js" />
/// <reference path="Currency.js" />
/// <reference path=""


var CurrencySummaryManager = {

  getSummaryCurrencyGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      //apiUrl: baseApi + "/get-action-summary-by-statusId?stateId=" + encodeURIComponent(stateId),
      apiUrl: baseApi + "/currency-summary",
      requestType: "POST",
      async: true,
      modelFields: {
        createdDate: { type: "date" }
      },
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


var CurrencySummaryHelper = {

  initCurrencySummary: function () {
    this.generateCurrencyGrid();
  },

  generateCurrencyGrid: function () {
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

    //const gridOptions = {
    //  dataSource: [],
    //  autoBind: true,
    //  navigatable: true,
    //  //width: "400px",
    //  width: gridWidth,
    //  scrollable: false,
    //  resizable: false,
    //  filterable: false,
    //  sortable: false,
    //  columns: Columns,
    //  editable: false,
    //  selectable: "row",
    //};

    $("#gridSummaryCurrency").kendoGrid(gridOptions);

    const gridInstance = $("#gridSummaryCurrency").data("kendoGrid");
    if (gridInstance) {
      const dataSource = CurrencySummaryManager.getSummaryCurrencyGridDataSource();
      console.log(dataSource.data());
      console.log(dataSource.view());
      dataSource.fetch().then(() => gridInstance.setDataSource(dataSource));
      gridInstance.setDataSource(dataSource);
    }
  },

  generateColumns: function () {
    return columns = [
      /*{ field: "SlNo", title: "Sl No", width: 40, template: "#= ++rowNumber #" },*/
      { field: "CurrencyId", hidden: true },
      { field: "CurrencyName", title: "Currency<br/>Name", width: "100px" },
      { field: "IsDefault", title: "Default", width: "80px", template: "#= IsDefault == 1 ? 'Yes' : 'No' #" },
      { field: "IsActive", title: "Status", width: "80px", template: "#= IsActive == 1 ? 'Active' : 'Inactive' #" },
      {
        field: "Action", title: "#", filterable: false, width: "230px", template: `
        <input type="button" class="btn btn-outline-success widthSize30_per" value="View" onClick="CurrencySummaryHelper.clickEventForViewButton(event)" />
        <input type="button" class="btn btn-outline-dark me-1 widthSize30_per" value="Edit" id="" onClick="CurrencySummaryHelper.clickEventForEditButton(event)"  />
        <input type="button" class="btn btn-outline-danger widthSize33_per" value="Delete" onClick="CurrencySummaryHelper.clickEventForDeleteButton(event)" />
        `
      },
    ];
  },
  clickEventForViewButton: function (event) {
    debugger;
    var gridInstance = $("#gridSummaryCurrency").data("kendoGrid");
    var gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);

    if (selectedItem) {
      CurrencyDetailsHelper.populateObject(selectedItem);
      CommonManager.MakeFormReadOnly("#CurrencyFrom");
      $("#btnCurrencySaveOrUpdate").prop("disabled", "disabled");
    }
  },

  clickEventForEditButton: function (event) {
    const gridInstance = $("#gridSummaryCurrency").data("kendoGrid");
    if (gridInstance) {
      const gridRow = $(event.target).closest("tr");
      var selectedItem = gridInstance.dataItem(gridRow);
      if (selectedItem) {
        CurrencyDetailsHelper.populateObject(selectedItem);
        CommonManager.MakeFormEditable("#CurrencyFrom");
      }
    }
    
  },

  clickEventForDeleteButton: function (event) {
    const gridInstance = $("#gridSummaryCurrency").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      CurrencyDetailsManager.deleteItem(selectedItem);
    }
  },

}