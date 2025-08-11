/// <reference path="../../common/common.js" />
/// <reference path="paymentmethod.js" />
/// <reference path="paymentmethoddetails.js" />

var PaymentMethodSummaryManager = {
  getSummaryPaymentMethodGridDataSource: function () {
    return VanillaApiCallManager.GenericGridDataSource({
      apiUrl: baseApi + "/payment-method-summary",
      requestType: "POST",
      async: true,
      modelFields: {},
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Data.Items",
      schemaTotal: "Data.TotalCount"
    });
  },

  fetchPaymentMethodComboBoxData: async function () {
    const serviceUrl = "/payment-method-ddl";
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load payment method data");
      }
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  fetchOnlinePaymentMethodComboBoxData: async function () {
    const serviceUrl = "/online-payment-method-ddl";
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load online payment method data");
      }
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  }
};

var PaymentMethodSummaryHelper = {
  initPaymentMethodSummary: function () {
    this.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    var Columns = this.generateColumns();
    var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(Columns);
    var gridWidth = totalColumnsWidth > (window.innerWidth - 323) ? (window.innerWidth - 323).toString() : `${totalColumnsWidth}px`;

    const gridOptions = {
      toolbar: [
        { template: '<button type="button" id="btnAddNewPaymentMethod" class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" onclick="PaymentMethodDetailsHelper.openPaymentMethodPopUp();"><span class="k-button-text"> + Create New </span></button>' },
        { name: "excel" },
        { name: "pdf" },
        { template: '<button type="button" id="btnExportCsvPaymentMethod" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }
      ],
      excel: {
        fileName: "PaymentMethodList" + Date.now() + ".xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      pdf: {
        fileName: "PaymentMethod_Information.pdf",
        allPages: true,
        paperSize: "A4",
        landscape: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        scale: 0.9,
        repeatHeaders: true,
        columns: [
          { field: "PaymentMethodName", width: 200 },
          { field: "PaymentMethodCode", width: 120 },
          { field: "Description", width: 250 },
          { field: "ProcessingFee", width: 120 },
          { field: "ProcessingFeeType", width: 120 },
          { field: "IsOnlinePayment", width: 120 },
          { field: "IsActive", width: 100 }
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
        console.log("Grid Error:", e);
        kendo.alert({
          title: "Error",
          content: "Error: " + e.errors
        });
      }
    };

    $("#gridSummaryPaymentMethod").kendoGrid(gridOptions);

    $("#btnExportCsvPaymentMethod").on("click", function () {
      CommonManager.GenerateCSVFileAllPages("gridSummaryPaymentMethod", "PaymentMethodListCSV", "Actions");
    });

    const grid = $("#gridSummaryPaymentMethod").data("kendoGrid");
    if (grid) {
      const ds = PaymentMethodSummaryManager.getSummaryPaymentMethodGridDataSource();

      ds.bind("error", function (e) {
        console.log("DataSource Error Event:", e);
        console.log("DataSource Error Event:", e.response);
        kendo.alert({
          title: "Error",
          content: "Error: " + e.response
        });
      });

      ds.bind("requestEnd", function (e) {
        console.log(e);
        console.log(e.response);
        if (e.response && e.response.isSuccess === false) {
          console.log("API returned error:", e.response.message);
          kendo.alert({
            title: "Error",
            content: "Error: " + e.response.message
          });
        }
      });

      grid.setDataSource(ds);
    }
  },

  generateColumns: function () {
    return [
      { field: "PaymentMethodId", hidden: true },
      { field: "PaymentMethodName", title: "Payment Method Name", width: "200px" },
      { field: "PaymentMethodCode", title: "Method Code", width: "120px" },
      { field: "Description", title: "Description", width: "250px" },
      { field: "ProcessingFee", title: "Processing Fee", width: "120px", template: "#= ProcessingFee ? ProcessingFee : '' #" },
      { field: "ProcessingFeeType", title: "Fee Type", width: "120px" },
      { field: "IsOnlinePayment", title: "Online Payment", width: "120px", template: "#= IsOnlinePayment ? 'Yes' : 'No' #" },
      { field: "IsActive", title: "Status", width: "100px", template: "#= IsActive ? 'Active' : 'Inactive' #" },
      { field: "CreatedDate", title: "Created Date", width: "150px", template: "#= kendo.toString(kendo.parseDate(CreatedDate), 'MM/dd/yyyy') #" },
      { field: "CreatedBy", title: "Created By", width: "120px" },
      { field: "UpdatedDate", title: "Updated Date", width: "150px", template: "#= UpdatedDate ? kendo.toString(kendo.parseDate(UpdatedDate), 'MM/dd/yyyy') : '' #" },
      { field: "UpdatedBy", title: "Updated By", width: "120px" },
      {
        field: "Action", title: "#", filterable: false, width: "230px",
        template: `
                    <input type="button" class="btn btn-outline-success widthSize30_per"
                        value="View" onClick="PaymentMethodSummaryHelper.clickEventForViewButton(event)" />
                    <input type="button" class="btn btn-outline-dark me-1 widthSize30_per"
                        value="Edit" onClick="PaymentMethodSummaryHelper.clickEventForEditButton(event)" />
                    <input type="button" class="btn btn-outline-danger widthSize33_per"
                        value="Delete" onClick="PaymentMethodSummaryHelper.clickEventForDeleteButton(event)" />
                `
      }
    ];
  },

  _getGridItem: function (event) {
    const grid = $("#gridSummaryPaymentMethod").data("kendoGrid");
    const tr = $(event.target).closest("tr");
    return grid.dataItem(tr);
  },

  clickEventForViewButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      PaymentMethodDetailsHelper.clearForm();
      const windowId = "PaymentMethodPopUp";
      CommonManager.openKendoWindow(windowId, "View Payment Method", "70%");
      CommonManager.appandCloseButton(windowId);
      PaymentMethodDetailsHelper.populateObject(item);
      CommonManager.MakeFormReadOnly("#PaymentMethodForm");
      $("#btnPaymentMethodSaveOrUpdate").prop("disabled", "disabled");
    }
  },

  clickEventForEditButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      PaymentMethodDetailsHelper.clearForm();
      const windowId = "PaymentMethodPopUp";
      CommonManager.openKendoWindow(windowId, "Edit Payment Method", "70%");
      CommonManager.appandCloseButton(windowId);
      PaymentMethodDetailsHelper.populateObject(item);
      CommonManager.MakeFormEditable("#PaymentMethodForm");
    }
  },

  clickEventForDeleteButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      PaymentMethodDetailsManager.deleteItem(item);
    }
  }
};