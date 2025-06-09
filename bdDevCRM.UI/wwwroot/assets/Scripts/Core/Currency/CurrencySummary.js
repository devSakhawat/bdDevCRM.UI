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
    const gridOptions = {
      dataSource: [],
      autoBind: true,
      navigatable: true,
      width: "400px",
      scrollable: false,
      resizable: false,
      filterable: false,
      sortable: false,
      columns: this.generateCurrencyColumns(),
      editable: false,
      selectable: "row",
    };

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

  generateCurrencyColumns: function () {
    return columns = [
      /*{ field: "SlNo", title: "Sl No", width: 40, template: "#= ++rowNumber #" },*/
      { field: "CurrencyId", hidden: true },
      { field: "CurrencyName", title: "Currency Name", width: 70 },
      { field: "IsDefault", title: "Is Default", width: 50, template: "#= IsDefault == 1 ? 'Yes' : 'No' #" },
      { field: "IsActive", title: "Is Active", width: 50, template: "#= IsActive == 1 ? 'Yes' : 'No' #" },
      { field: "Action", title: "#", filterable: false, width: 120, template: '<input type="button" class="btn btn-outline-dark me-1 widthSize40_per" value="Edit" id="" onClick="CurrencySummaryHelper.clickEventForEditButton(event)"  /><input type="button" class="btn btn-outline-danger widthSize50_per" value="Delete" id="" onClick="CurrencySummaryHelper.clickEventForDeleteButton(event)"  />' },
    ];
  },

  clickEventForEditButton: function (event) {
    const gridInstance = $("#gridSummaryCurrency").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      CurrencyDetailsHelper.editItem(selectedItem);
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