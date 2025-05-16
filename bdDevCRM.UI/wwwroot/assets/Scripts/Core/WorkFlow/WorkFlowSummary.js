
// <reference path="workflowdetail.js" />
// <reference path="statedetails.js" />
// <reference path="actiondetail.js" />


var WrokFlowSummaryManager = {
  getSummaryGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/workflow-summary",
      requestType: "POST",
      async: true,
      modelFields: {
        //createdDate: { type: "date" }
      },
      pageSize: 15,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Items",
      schemaTotal: "TotalCount",
      buttonCount: 3  // Add this explicitly
    });
  },



};


var WorkFlowSummaryHelper = {

  initWorkFlowSummary: function () {
    this.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    const gridOptions = {
      dataSource: [],
      navigatable: true,
      height: 700,
      width: "100%",
      scrollable: true, // Enable both horizontal and vertical scrolling
      resizable: true,
      filterable: true,
      sortable: true,
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
      toolbar: [
        { name: "excel" },
        { name: "pdf" },
        { template: '<button type="button" id="btnExportCsv" onClick="AjaxManager.GenerateCSVFileAllPages(\'gridSummary\', \'UserListCSV\', \'Actions\');" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }
      ],
      excel: {
        fileName: "UsersInformation.xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      pdf: {
        fileName: "UsersInformation.pdf",
        allPages: true,
        paperSize: "A4",
        landscape: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        scale: 0.9,
        repeatHeaders: true,
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
      columns: WorkFlowSummaryHelper.generateColumns(),
      editable: false,
      selectable: "row",
    };

    $("#gridSummary").kendoGrid(gridOptions);

    const gridInstance = $("#gridSummary").data("kendoGrid");
    if (gridInstance) {
      const dataSource = WrokFlowSummaryManager.getSummaryGridDataSource();
      gridInstance.setDataSource(dataSource);
    }
  },

  generateColumns: function () {
    return columns = [

      { field: "WFStateId", hidden: true },
      { field: "MenuID", hidden: true },
      { field: "IsClosed", hidden: true },

      { field: "StateName", title: "State Name", width: 100 },
      { field: "MenuName", title: "Menu Name", width: 100 },
      { field: "IsDefaultStart", title: "Is Default", width: 50, template: "#= IsDefaultStart ? 'Yes' : 'No' #" },
      {
        field: "Edit", title: "Edit", filterable: false, width: 40,
        template: '<input type="button" class="k-button btn btn-outline-dark" value="Edit" id="btnEdit" onClick="WorkFlowSummaryHelper.clickEventForEditButton(event)" />', sortable: false, exportable: false
      }
    ];

  },

  clickEventForEditButton: function (event) {
    const gridInstance = $("#gridSummary").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      WorkFlowSummaryHelper.editItem(selectedItem);
    }
  },

  editItem: async function (item) {
    console.log(item);
    StateDetailsHelper.clearStateForm();
    $("#btnSaveOrUpdate").text("Update Item");

    $("#stateID").val(item.WfstateId);
    var menuComboBoxInstance = $("#cmbMenu").data("kendoComboBox");
    menuComboBoxInstance.value(item.MenuId);
    $("#txtStateName").val(item.StateName);
    $("#cmbIsClose").data("kendoComboBox").value(item.IsClosed);
    $("#chkIsDefault").prop('checked', item.IsDefaultStart);
    ActionDetailHelper.clearActionForm();


    var nextStateComboBox = $("#cmbNextState").data("kendoComboBox");
    if (nextStateComboBox) {
      var nextStateComboBoxDataSource = await ActionDetailHelper.loadNextStateCombo(item.MenuId);
      /*//console.log(nextStateComboBoxDataSource);*/
      nextStateComboBox.setDataSource(nextStateComboBoxDataSource);
    }

    ActionDetailHelper.generateActionGrid(item.WfstateId);
    $("#txtStateName_Action").val(item.StateName);
  },

}