var userInformationSummaryManager = {

    gridDataSource: function () {

        var apiUrl = coreManagement + "/UsersInformation/GetUsersInformationSummary";

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

    gridDataSourceForHistory: function (usersInformationId) {

        var apiUrl = coreManagement + "/UsersInformation/GetUsersInformationHistorySummary/?usersInformationId=" + usersInformationId;

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

var userInformationSummaryHelper = {

    initateUserInformationSummary: function () {

        $("#btnAddNew").click(function () {
            userInformationDetailsHelper.AddNewInformation();
        });

        userInformationSummaryHelper.GenerateSummaryGrid();

    },

    GenerateSummaryGrid: function () {
        

        $("#gridSummary").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "UserInformationExport.xlsx",
                filterable: true,
                allPages: true
            },
            dataSource: userInformationSummaryManager.gridDataSource(),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            height: 450,
            filterable: true,
            sortable: true,
            columns: userInformationSummaryHelper.GenerateColumns(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });

    },

    GenerateColumns: function () {

        return columns = [
            { field: "Id", title: "UsersInformationId", width: 50, hidden: true },
            { field: "instituteId", title: "InstituteId", width: 50, hidden: true },
            { field: "usersTypeId", title: "UsersTypeId", width: 50, hidden: true },
            { field: "branchId", title: "BranchId", width: 50, hidden: true },
            { field: "instituteName", title: "Institute Name", width: 150, hidden: false },
            { field: "usersTypeName", title: "Users Type", width: 100, hidden: false },
            { field: "createdBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "updateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "loginId", title: "Login ID", width: 100 }, 
            { field: "loginName", title: "Login Name", width: 150 }, 
            { field: "createByName", title: "Create By", width: 100, hidden: true },
            { field: "createdDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(createdDate,"dd-MM-yyyy hh:mm:ss") #', hidden: true },
            { field: "updateByName", title: "Update By", width: 100, hidden: true },
            { field: "updateDate", title: "UpdateDate", width: 100, hidden: false, template: '#= kendo.toString(updateDate,"dd-MM-yyyy hh:mm:ss") #', hidden: true },
            { field: "isActive", title: "Status", width: 100, hidden: false, template: "#= data.isActive==1 ? 'Active' : 'Inactive' #" },
            { field: "isExpired", title: "Is Expired", width: 100, hidden: false, template: "#= data.isExpired==1 ? 'Yes' : 'No' #" },
            { field: "Edit", title: "Edit", filterable: false, width: 120, template: '<input type="button" class="k-button" value="Edit" id="btnEdit" onClick="initateUserInformationSummary.clickEventForEditButton()"/>&nbsp;&nbsp;<input type="button" class="k-button" value="Change History" id="btnEdit" onClick="initateUserInformationSummary.clickEventForViewHistory()"/>', sortable: false }
        ];
    },

    clickEventForEditButton: function () {

        var entityGrid = $("#gridSummary").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {
            branchDetailsHelper.PopulateNewObject(selectedItem);
        }

    },

    clickEventForViewHistory: function () {
        var entityGrid = $("#gridSummary").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {

            branchSummaryHelper.GenerateHistorySummaryGrid(selectedItem.UsersInformationId);
            AjaxManager.PopupWindow("divHistoryPopupFor", "History Summary", "90%");

        }
    },


    GenerateHistorySummaryGrid: function (usersInformationId) {
        $("#gridHistoryPopup").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "HistoryDataExport.xlsx",
                filterable: true,
                allPages: true
            },
            dataSource: userInformationSummaryManager.gridDataSourceForHistory(usersInformationId),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            xheight: 450,
            filterable: true,
            sortable: true,
            columns: userInformationSummaryHelper.GenerateColumnsForHistory(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });
    },

    GenerateColumnsForHistory: function () {
        return columns = [
            { field: "UsersInformationId", title: "UsersInformationId", width: 50, hidden: true },
            { field: "InstituteId", title: "InstituteId", width: 50, hidden: true },
            { field: "UsersTypeId", title: "UsersTypeId", width: 50, hidden: true },
            { field: "BranchId", title: "BranchId", width: 50, hidden: true },
            { field: "InstituteName", title: "InstituteName", width: 50, hidden: false },
            { field: "UsersTypeName", title: "Users Type", width: 50, hidden: false },
            { field: "CreatedBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "UpdateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "LoginId", title: "Login ID", width: 100 },
            { field: "LoginName", title: "Login Name", width: 100 },
            { field: "CreateByName", title: "Create By", width: 100 },
            { field: "CreatedDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(CreatedDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "UpdateByName", title: "Update By", width: 100 },
            { field: "UpdateDate", title: "UpdateDate", width: 100, hidden: false, template: '#= kendo.toString(UpdateDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "IsActive", title: "Status", width: 100, hidden: false, template: "#= data.IsActive==1 ? 'Active' : 'Inactive' #" },
            { field: "IsExpired", title: "Is Expired", width: 100, hidden: false, template: "#= data.IsExpired==1 ? 'Yes' : 'No' #" },
            { field: "historyCreateorName", title: "Generate By", width: 100 },
            { field: "historyDate", title: "Generate Date", width: 100, template: '#= kendo.toString(historyDate,"dd-MM-yyyy hh:mm:ss") #' }

        ];
    },


};