var instituteTypeSummaryManager = {

    gridDataSourceForInstituteTypeHistory: function (instituteTypeId) {

        var apiUrl = coreApi + "/InstituteType/GetInstituteTypeHistorySummary/?instituteTypeId=" + instituteTypeId;

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

var instituteTypeSummaryHelper = {

    initateInstituteTypeSummary: function () {

        $("#btnAddNew").click(function () {
            instituteTypeDetailsHelper.AddNewInformation();
        });

        instituteTypeSummaryHelper.GenerateSummaryGrid();

    },

    GenerateSummaryGrid: function () {
        var apiUrl = coreManagement + "/InstituteType/GetInstituteTypeSummary";

       var ds = KendoDataSourceManager.getBasicGridDataSource(apiUrl);

        $("#gridSummary").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "InstituteTypeExport.xlsx",
                filterable: true,
                allPages: true
            },
            dataSource: ds,//companySummaryManager.gridDataSource(),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            height: 450,
            filterable: true,
            sortable: true,
            columns: instituteTypeSummaryHelper.GenerateColumns(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });

    },

    GenerateColumns: function () {

        return columns = [
            { field: "InstituteTypeId", title: "InstituteTypeId", width: 50, hidden: true },
            { field: "CreatedBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "UpdateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "InstituteTypeCode", title: "Code", width: 100 }, 
            { field: "InstituteTypeName", title: "Name", width: 100 }, 
            { field: "CreateByName", title: "Create By", width: 100 },
            { field: "CreatedDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(CreatedDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "UpdateByName", title: "Update By", width: 100 },
            { field: "UpdateDate", title: "UpdateDate", width: 100, hidden: false, template: '#= kendo.toString(UpdateDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "IsActive", title: "Status", width: 100, hidden: false, template: "#= data.IsActive==1 ? 'Active' : 'Inactive' #" },
            { field: "Edit", title: "Edit", filterable: false, width: 120, template: '<input type="button" class="k-button" value="Edit" id="btnEdit" onClick="instituteTypeSummaryHelper.clickEventForEditButton()"/>&nbsp;&nbsp;<input type="button" class="k-button" value="Change History" id="btnEdit" onClick="instituteTypeSummaryHelper.clickEventForViewHistory()"/>', sortable: false }
        ];
    },

    clickEventForEditButton: function () {

        var entityGrid = $("#gridSummary").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {
            instituteTypeDetailsHelper.PopulateNewObject(selectedItem);
        }

    },

    clickEventForViewHistory: function () {
        var entityGrid = $("#gridSummary").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {

            instituteTypeSummaryHelper.GenerateInstituteHistorySummaryGrid(selectedItem.InstituteTypeId);
            AjaxManager.PopupWindow("divHistoryPopupFor", "History Summary", "90%");

        }
    },


    GenerateInstituteHistorySummaryGrid: function (InstituteTypeId) {
        $("#gridHistoryPopup").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "HistoryDataExport.xlsx",
                filterable: true,
                allPages: true
            },
            dataSource: instituteTypeSummaryManager.gridDataSourceForInstituteTypeHistory(InstituteTypeId),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            xheight: 450,
            filterable: true,
            sortable: true,
            columns: instituteTypeSummaryHelper.GenerateColumnsForHistory(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });
    },

    GenerateColumnsForHistory: function () {
        return columns = [
            { field: "InstituteTypeId", title: "InstituteTypeId", width: 50, hidden: true },
            { field: "CreatedBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "UpdateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "InstituteTypeCode", title: "Code", width: 100 },
            { field: "InstituteTypeName", title: "Name", width: 100 }, 
            { field: "CreateByName", title: "Create By", width: 100 },
            { field: "CreatedDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(CreatedDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "UpdateByName", title: "Update By", width: 100 },
            { field: "UpdateDate", title: "UpdateDate", width: 100, hidden: false, template: '#= kendo.toString(UpdateDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "IsActive", title: "Status", width: 100, hidden: false, template: "#= data.IsActive==1 ? 'Active' : 'Inactive' #" },
            { field: "historyCreateorName", title: "Generate By", width: 100 },
            { field: "historyDate", title: "Generate Date", width: 100, template: '#= kendo.toString(historyDate,"dd-MM-yyyy hh:mm:ss") #' }

        ];
    },


};