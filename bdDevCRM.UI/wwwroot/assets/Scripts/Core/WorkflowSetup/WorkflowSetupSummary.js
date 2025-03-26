var workflowSummaryManager = {

    gridDataSource: function () {
        
        var apiUrl = coreManagement + "/WorkflowState/GetWorkflowStateSummary";

        var gridDataSource = new kendo.data.DataSource({
            type: "json",
            serverPaging: true,
            serverSorting: false,
            serverFiltering: true,
            allowUnsort: false,
            pageSize: 10,
            transport: {
                read: {
                    url: apiUrl,
                    type: "POST",
                    dataType: "json",
                    async: false,
                    contentType: "application/json; charset=utf-8"
                },
                parameterMap: function (options) {
                    return JSON.stringify(options);
                }
            },
            schema: {
                data: "items", total: "totalCount",
                model: {
                    fields: {
                        createdDate: {
                            type: "date"
                        },
                        updateDate: {
                            type: "date"
                        },
                        historyDate: {
                            type: "date"
                        },

                    }
                }
            }
        });

        return gridDataSource;
    },

    gridDataSourceForHistory: function (workflowStateId) {

        var apiUrl = coreApi + "/WorkflowState/GetWorkflowStateHistorySummary/?workflowStateId=" + workflowStateId;

        var gridDataSource = new kendo.data.DataSource({
            type: "json",
            serverPaging: true,
            serverSorting: false,
            serverFiltering: true,
            allowUnsort: false,
            pageSize: 10,
            transport: {
                read: {
                    url: apiUrl,
                    type: "POST",
                    dataType: "json",
                    async: false,
                    contentType: "application/json; charset=utf-8"
                },
                parameterMap: function (options) {
                    return JSON.stringify(options);
                }
            },
            schema: {
                data: "items", total: "totalCount",
                model: {
                    fields: {
                        createdDate: {
                            type: "date"
                        },
                        updateDate: {
                            type: "date"
                        },
                        historyDate: {
                            type: "date"
                        },

                    }
                }
            }
        });

        return gridDataSource;
    },
};

var workflowSummaryHelper = {

    initateSummary: function () {

        $("#btnAddNew").click(function () {
            workflowDetailsHelper.AddNewInformation();
        });

        workflowSummaryHelper.GenerateSummaryGrid();

    },

    GenerateSummaryGrid: function () {
       
        $("#gridSummary").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "ExportStateInfo.xlsx",
                filterable: true,
                allPages: true
            },
            dataSource: workflowSummaryManager.gridDataSource(),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            height: 450,
            filterable: true,
            sortable: true,
            columns: workflowSummaryHelper.GenerateColumns(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });

    },

    GenerateColumns: function () {

        return columns = [
            { field: "workflowStateId", title: "WorkflowStateId", width: 50, hidden: true },
            { field: "menuId", title: "MenuId", width: 50, hidden: true },
            { field: "workflowStateDefination", title: "WorkflowStateDefination", width: 50, hidden: true },
            { field: "workflowStateOrder", title: "WorkflowStateOrder", width: 50, hidden: true },
            { field: "createdBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "updateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "workflowStateName", title: "State Name", width: 100 }, 
            { field: "menuName", title: "Menu Name", width: 100 }, 
            { field: "createByName", title: "Create By", width: 100 },
            { field: "createdDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(createdDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "updateByName", title: "Update By", width: 100 },
            { field: "updateDate", title: "UpdateDate", width: 100, hidden: false, template: '#= kendo.toString(updateDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "isDefaultStart", title: "Default State", width: 100, hidden: false, template: "#= data.isDefaultStart==1 ? 'Yes' : 'No' #" },
            { field: "isActive", title: "Status", width: 100, hidden: false, template: "#= data.isActive==1 ? 'Active' : 'Inactive' #" },
            { field: "Edit", title: "Edit", filterable: false, width: 120, template: '<input type="button" class="k-button" value="Edit" id="btnEdit" onClick="workflowSummaryHelper.clickEventForEditButton()"/>&nbsp;&nbsp;<input type="button" class="k-button" value="Change History" id="btnEdit" onClick="workflowSummaryHelper.clickEventForViewHistory()"/>', sortable: false }
        ];
    },

    clickEventForEditButton: function () {

        var entityGrid = $("#gridSummary").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {
            workflowDetailsHelper.PopulateNewObject(selectedItem);
        }

    },

    clickEventForViewHistory: function () {
        var entityGrid = $("#gridSummary").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {

            workflowSummaryHelper.GenerateHistorySummaryGrid(selectedItem.workflowStateId);
            AjaxManager.PopupWindow("divHistoryPopupFor", "History Summary", "90%");

        }
    },


    GenerateHistorySummaryGrid: function (WorkflowStateId) {
        $("#gridHistoryPopup").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "HistoryDataExport.xlsx",
                filterable: true,
                allPages: true
            },
            dataSource: workflowSummaryManager.gridDataSourceForHistory(WorkflowStateId),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            xheight: 450,
            filterable: true,
            sortable: true,
            columns: workflowSummaryHelper.GenerateColumnsForHistory(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });
    },

    GenerateColumnsForHistory: function () {
        return columns = [
            { field: "workflowStateId", title: "WorkflowStateId", width: 50, hidden: true },
            { field: "menuId", title: "MenuId", width: 50, hidden: true },
            { field: "workflowStateDefination", title: "WorkflowStateDefination", width: 50, hidden: true },
            { field: "workflowStateOrder", title: "WorkflowStateOrder", width: 50, hidden: true },
            { field: "createdBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "updateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "workflowStateName", title: "State Name", width: 100 },
            { field: "menuName", title: "Menu Name", width: 100 },
            { field: "createByName", title: "Create By", width: 100 },
            { field: "createdDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(createdDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "updateByName", title: "Update By", width: 100 },
            { field: "updateDate", title: "UpdateDate", width: 100, hidden: false, template: '#= kendo.toString(updateDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "isDefaultStart", title: "Default State", width: 100, hidden: false, template: "#= data.isDefaultStart==1 ? 'Yes' : 'No' #" },
            { field: "isActive", title: "Status", width: 100, hidden: false, template: "#= data.isActive==1 ? 'Active' : 'Inactive' #" },
            { field: "historyCreateorName", title: "Generate By", width: 100 },
            { field: "historyDate", title: "Generate Date", width: 100, template: '#= kendo.toString(historyDate,"dd-MM-yyyy hh:mm:ss") #' }

        ];
    },


};