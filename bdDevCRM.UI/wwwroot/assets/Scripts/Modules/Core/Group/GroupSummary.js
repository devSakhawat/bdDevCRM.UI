/// <reference path="accesscontrolpermission.js" />
/// <reference path="actionpermission.js" />
/// <reference path="group.js" />
/// <reference path="groupdetails.js" />
/// <reference path="groupinfo.js" />
/// <reference path="grouppermission.js" />
/// <reference path="menupermission.js" />
/// <reference path="reportpermission.js" />
/// <reference path="statepermission.js" />

var GroupSummaryManager = {

  getSummaryGridDataSource: function () {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/group-summary",
      requestType: "POST",
      async: true,
      modelFields: {
        createdDate: { type: "date" }
      },
      pageSize: 13,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Items", 
      schemaTotal: "TotalCount" 
    });
  },

};

var GroupSummaryHelper = {

  initGroupSummary: function () {
    GroupSummaryHelper.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    const gridOptions = {
      dataSource: [],
      navigatable: true,
      height: 700,
      width: "100%",
      filterable: true,
      sortable: true,
      pageable: {
        //pageSizes: [5, 10, 20, 100],
        //buttonCount: 5,
        refresh: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      toolbar: [
        { name: "excel" }
      ],
      excel: {
        fileName: "GroupExport.xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      columns: GroupSummaryHelper.GenerateColumns(),
      editable: false,
      selectable: "row",
      
      //scrollable: {
      //  virtual: false, // Disable virtual scrolling if not needed
      //  endless: false  // Disable endless scrolling if not needed
      //},
      //resizable: true, // Allow column resizing
      //reorderable: true // Allow column reordering
    };

    $("#gridSummary").kendoGrid(gridOptions);

    const gridInstance = $("#gridSummary").data("kendoGrid");
    if (gridInstance) {
      const dataSource = GroupSummaryManager.getSummaryGridDataSource();
      gridInstance.setDataSource(dataSource);
    }

  },

  GenerateColumns: function () {
      return columns = [
        { field: "GroupId", title: "Group Id", width: 0, hidden: true },
        { field: "GroupName", title: "Group Name", width: "70%"},
        {
          field: "Edit", title: "Actions", filterable: false, width: "28%",
          template: `
        <input type="button" class="btn btn-outline-dark " style="cursor: pointer; margin-right: 5px;" value="Edit" id="btnEdit" onClick="GroupSummaryHelper.clickEventForEditButton(event)"/>`
          , sortable: false, exportable: false 
        }
      ];
  },

  clickEventForEditButton: function (e) {
    debugger;
    GroupDetailsHelper.clearGroupForm();
    $("#btnSave").text("Update");

    var grid = $("#gridSummary").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var selectedItem = grid.dataItem(row);

    GroupInfoHelper.populateGroupInfoDetails(selectedItem);
    GroupPermissionHelper.populateExistingModule(selectedItem);
  },

};