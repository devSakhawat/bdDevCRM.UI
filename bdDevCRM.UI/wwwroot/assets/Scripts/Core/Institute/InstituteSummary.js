var instituteSummaryManager = {

    gridDataSource: function () {

        var apiUrl = coreApi + "/Institute/GetInstituteSummary";

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
            schema: { data: "items", total: "totalCount" }
        });

        return gridDataSource;

    },

    gridDataSourceForInstituteHistory: function (instituteId) {

        var apiUrl = coreApi + "/Institute/GetInstituteHistorySummary/?instituteId=" + instituteId;

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

var instituteSummaryHelper = {

    initateInstituteSummary: function () {

        $("#btnAddNew").click(function () {
            instituteDetailsHelper.AddNewInformation();
        });

        instituteSummaryHelper.GenerateInstituteSummaryGrid();

    },

    GenerateInstituteSummaryGrid: function () {
        var apiUrl = coreManagement + "/Institute/GetInstituteSummary";

       var ds = KendoDataSourceManager.getBasicGridDataSource(apiUrl);

        $("#gridSummary").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "InstituteInformationExport.xlsx",
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
            columns: instituteSummaryHelper.GenerateColumns(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });

    },

    GenerateColumns: function () {

        return columns = [
            { field: "InstituteId", title: "InstituteId", width: 50, hidden: true },
            { field: "CreatedBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "CreatedDate", title: "CreatedDate", width: 50, hidden: true },
            { field: "UpdateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "UpdateDate", title: "UpdateDate", width: 50, hidden: true },
            { field: "InstituteCode", title: "Code", width: 100 },
            { field: "InstitueShortName", title: "Short<br> Name", width: 100, hidden: true },
            { field: "InstituteName", title: "Name", width: 200 },
            { field: "InstituteAddress", title: "Address", width: 100, hidden: true },
            { field: "InstituePhone", title: "Phone", width: 100},
            { field: "InstitueFax", title: "Fax", width: 100, hidden: true },
            { field: "InstitueEmail", title: "Email", width: 100, hidden: true },
            { field: "InstitueTinNo", title: "TIN No", width: 100 },
            { field: "InstitueBinNo", title: "BIN No", width: 100 },
            { field: "RegistrationNumber", title: "Register No", width: 100 },
            { field: "InstitueFullLogo", title: "InstitueFullLogo", width: 100, hidden: true },
            { field: "BoardId", title: "BoardId", width: 100, hidden: true },
            { field: "DistrictId", title: "DistrictId", width: 100, hidden: true },
            { field: "ThanaId", title: "ThanaId", width: 100, hidden: true },
            { field: "InstituteTypeId", title: "InstituteTypeId", width: 100, hidden: true },
            { field: "ParentInstitueId", title: "ParentInstitueId", width: 100, hidden: true },
            { field: "WebSiteAddress", title: "CompanyWebsite", width: 100, hidden: true },
            { field: "InstitueReportLogo", title: "InstitueReportLogo", width: 100, hidden: true },
            { field: "IsActive", title: "Status", width: 100, hidden: false, template: "#= data.IsActive==1 ? 'Active' : 'Inactive' #" },
            { field: "Edit", title: "Edit", filterable: false, width: 120, template: '<input type="button" class="k-button" value="Edit" id="btnEdit" onClick="instituteSummaryHelper.clickEventForEditButton()"/>&nbsp;&nbsp;<input type="button" class="k-button" value="Change History" id="btnEdit" onClick="instituteSummaryHelper.clickEventForViewHistory()"/>', sortable: false }
        ];
    },

    clickEventForEditButton: function () {

        var entityGrid = $("#gridSummary").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {
            instituteDetailsHelper.PopulateNewObject(selectedItem);
        }

    },

    clickEventForViewHistory: function () {
        var entityGrid = $("#gridSummary").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {

            instituteSummaryHelper.GenerateInstituteHistorySummaryGrid(selectedItem.InstituteId);
            AjaxManager.PopupWindow("divHistoryPopupForInstitute", "Institute History Summary", "90%");

        }
    },


    GenerateInstituteHistorySummaryGrid: function (instituteId) {
        $("#gridHistoryPopupForInstitute").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "InstituteHistoryDataExport.xlsx",
                filterable: true,
                allPages: true
            },
            dataSource: instituteSummaryManager.gridDataSourceForInstituteHistory(instituteId),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            xheight: 450,
            filterable: true,
            sortable: true,
            columns: instituteSummaryHelper.GenerateColumnsForHistory(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });
    },

    GenerateColumnsForHistory: function () {
        return columns = [
            { field: "InstituteId", title: "InstituteId", width: 50, hidden: true },
            { field: "CreatedBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "CreatedDate", title: "CreatedDate", width: 50, hidden: true },
            { field: "UpdateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "UpdateDate", title: "UpdateDate", width: 50, hidden: true },
            { field: "InstituteCode", title: "Code", width: 100 },
            { field: "InstitueShortName", title: "Short<br> Name", width: 100, hidden: true },
            { field: "InstituteName", title: "Name", width: 200 },
            { field: "InstituteAddress", title: "Address", width: 100, hidden: true },
            { field: "InstituePhone", title: "Phone", width: 100 },
            { field: "InstitueFax", title: "Fax", width: 100, hidden: true },
            { field: "InstitueEmail", title: "Email", width: 100, hidden: true },
            { field: "InstitueTinNo", title: "TIN No", width: 100 },
            { field: "InstitueBinNo", title: "BIN No", width: 100 },
            { field: "RegistrationNumber", title: "Register No", width: 100 },
            { field: "InstitueFullLogo", title: "InstitueFullLogo", width: 100, hidden: true },
            { field: "BoardId", title: "BoardId", width: 100, hidden: true },
            { field: "DistrictId", title: "DistrictId", width: 100, hidden: true },
            { field: "ThanaId", title: "ThanaId", width: 100, hidden: true },
            { field: "InstituteTypeId", title: "InstituteTypeId", width: 100, hidden: true },
            { field: "ParentInstitueId", title: "ParentInstitueId", width: 100, hidden: true },
            { field: "WebSiteAddress", title: "WebSiteAddress", width: 100, hidden: true },
            { field: "InstitueReportLogo", title: "InstitueReportLogo", width: 100, hidden: true },
            { field: "IsActive", title: "Status", width: 100, hidden: false, template: "#= data.IsActive==1 ? 'Active' : 'Inactive' #" },
            { field: "historyCreateorName", title: "Generate By", width: 100 },
            { field: "historyDate", title: "Generate Date", width: 100, template: '#= kendo.toString(historyDate,"dd-MM-yyyy hh:mm:ss") #' }

        ];
    },


};