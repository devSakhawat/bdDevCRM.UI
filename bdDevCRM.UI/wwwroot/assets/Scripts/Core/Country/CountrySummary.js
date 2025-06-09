
/// <reference path="../../common/common.js" />
/// <reference path="country.js" />
/// <reference path="countrydetail.js" />
/// <reference path=""


var CountrySummaryManager = {

  getSummaryCountryGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/country-summary",
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


var CountrySummaryHelper = {

  initCountrySummary: function () {
    this.generateCountryGrid();
  },

  generateCountryGrid: function () {
    const gridOptions = {
      dataSource: [],
      autoBind: true,
      navigatable: true,
      scrollable: true,
      resizable: true,
      width: "400px",
      //height: "auto",
      filterable: true,
      sortable: false,
      pageable: {
        pageSizes: [10, 20, 50, 100],
        buttonCount: 3, // This sets exactly 3 buttons as required
        refresh: true,
        input: false,
        numeric: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      columns: this.generateCountryColumns(),
      editable: false,
      selectable: "row",
    };

    $("#gridSummaryCountry").kendoGrid(gridOptions);

    const gridInstance = $("#gridSummaryCountry").data("kendoGrid");
    if (gridInstance) {
      const dataSource = CountrySummaryManager.getSummaryCountryGridDataSource();
      console.log(dataSource.data());
/*      console.log(dataSource.view());*/
      dataSource.fetch().then(() => gridInstance.setDataSource(dataSource));
      gridInstance.setDataSource(dataSource);

    }


    //$(window).on("resize", function () {
    //  const newH = $(window).height() * 0.80;
    //  $("#gridSummaryCountry").height(newH);
    //  grid.resize();
    //});

  },

  generateCountryColumns: function () {
    return columns = [
      /*{ field: "SlNo", title: "Sl No", width: 40, template: "#= ++rowNumber #" },*/
      { field: "CountryId", hidden: true },
      { field: "CountryName", title: "Country Name", width: "200px" },
      { field: "CountryCode", title: "Country Code", width: "120px" },
      { field: "Status", title: "Status", width: "70px", template: "#= Status == 1 ? 'Yes' : 'No' #" },
      {
        field: "Action", title: "#", filterable: false, width: "200px", template: `
        <input type="button" class="btn btn-outline-success widthSize30_per" style="cursor: pointer;" value="View" id="" onClick="CountrySummaryHelper.clickEventForViewButton(event)"/>
        <input type="button" class="btn btn-outline-dark me-1 widthSize30_per" style="cursor: pointer;" value="Edit" id="" onClick="CountrySummaryHelper.clickEventForEditButton(event)"  />
        <input type="button" class="btn btn-outline-danger widthSize33_per" style="cursor: pointer;" value="Delete" id="" onClick="CountrySummaryHelper.clickEventForDeleteButton(event)"  />
        `
      },
    ];
  },

  clickEventForViewButton: function (event) {
    debugger;
    var gridInstance = $("#gridSummaryCountry").data("kendoGrid");
    var gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);

    if (selectedItem) {
      CountryDetailsHelper.populateObject(selectedItem);
      CommonManager.MakeFormReadOnly("#CountryFrom");
    }
  },

  clickEventForEditButton: function (event) {
    const gridInstance = $("#gridSummaryCountry").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      CountryDetailsHelper.populateObject(selectedItem);
      CommonManager.MakeFormEditable("#CountryFrom");
    }
  },

  clickEventForDeleteButton: function (event) {
    const gridInstance = $("#gridSummaryCountry").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      CountryDetailsManager.deleteItem(selectedItem);
    }
  },




}