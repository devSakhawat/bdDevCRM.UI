var thanaSummaryManager = {

    gridDataSource: function () {
        var apiUrl = coreManagement + "/Thana/GetThanaSummary";

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

    gridDataSourceForHistory: function (thanaId) {

        var apiUrl = coreManagement + "/Thana/GetThanaHistorySummary/?thanaId=" + thanaId;

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

var thanaSummaryHelper = {

    initateSummary: function () {

        $("#btnAddNew").click(function () {
            thanaDetailsHelper.AddNewInformation();
        });

        thanaSummaryHelper.GenerateSummaryGrid();

    },

    GenerateSummaryGrid: function () {
        

        $("#gridSummary").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "BranchExport.xlsx",
                filterable: true,
                allPages: true
            },
            dataSource: thanaSummaryManager.gridDataSource(),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            height: 450,
            filterable: true,
            sortable: true,
            columns: thanaSummaryHelper.GenerateColumns(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });

    },

    GenerateColumns: function () {

        return columns = [
            { field: "thanaId", title: "ThanaId", width: 50, hidden: true },
            { field: "districtId", title: "DistrictId", width: 50, hidden: true },
            { field: "createdBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "updateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "thanaCode", title: "Code", width: 100 }, 
            { field: "thanaName", title: "Name", width: 100 }, 
            { field: "thanaNameBangla", title: "Bangla Name", width: 100 },
            { field: "districtName", title: "District Name", width: 100 },
            { field: "createByName", title: "Create By", width: 100 },
            { field: "createdDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(createdDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "updateByName", title: "Update By", width: 100, hidden: true },
            { field: "updateDate", title: "UpdateDate", width: 100, hidden: true, template: '#= kendo.toString(updateDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "isActive", title: "Status", width: 100, hidden: false, template: "#= data.isActive==1 ? 'Active' : 'Inactive' #" },
            { field: "Edit", title: "Edit", filterable: false, width: 120, template: '<input type="button" class="k-button" value="Edit" id="btnEdit" onClick="thanaSummaryHelper.clickEventForEditButton()"/>&nbsp;&nbsp;<input type="button" class="k-button" value="Change History" id="btnEdit" onClick="thanaSummaryHelper.clickEventForViewHistory()"/>', sortable: false }
        ];
    },

    clickEventForEditButton: function () {

        var entityGrid = $("#gridSummary").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {
            thanaDetailsHelper.PopulateNewObject(selectedItem);
        }

    },

    clickEventForViewHistory: function () {
        var entityGrid = $("#gridSummary").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {

            thanaSummaryHelper.GenerateHistorySummaryGrid(selectedItem.thanaId);
            AjaxManager.PopupWindow("divHistoryPopupFor", "History Summary", "90%");

        }
    },


    GenerateHistorySummaryGrid: function (branchId) {
        $("#gridHistoryPopup").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "HistoryDataExport.xlsx",
                filterable: true,
                allPages: true
            },
            dataSource: thanaSummaryManager.gridDataSourceForHistory(branchId),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            xheight: 450,
            filterable: true,
            sortable: true,
            columns: thanaSummaryHelper.GenerateColumnsForHistory(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });
    },

    GenerateColumnsForHistory: function () {
        return columns = [
            { field: "thanaId", title: "ThanaId", width: 50, hidden: true },
            { field: "districtId", title: "DistrictId", width: 50, hidden: true },
            { field: "createdBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "updateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "thanaCode", title: "Code", width: 100 },
            { field: "thanaName", title: "Name", width: 100 },
            { field: "thanaNameBangla", title: "Bangla Name", width: 100 },
            { field: "districtName", title: "District Name", width: 100 },
            { field: "createByName", title: "Create By", width: 100 },
            { field: "createdDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(createdDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "updateByName", title: "Update By", width: 100, hidden: true },
            { field: "updateDate", title: "UpdateDate", width: 100, hidden: true, template: '#= kendo.toString(updateDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "isActive", title: "Status", width: 100, hidden: false, template: "#= data.isActive==1 ? 'Active' : 'Inactive' #" },
            { field: "historyCreateorName", title: "Generate By", width: 100 },
            { field: "historyDate", title: "Generate Date", width: 100, template: '#= kendo.toString(historyDate,"dd-MM-yyyy hh:mm:ss") #' }

        ];
    },


};