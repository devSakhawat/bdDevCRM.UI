var gbUsersGroups = [];

var groupMappingSummaryManager = {

};

var groupMappingSummaryHelper = {

    initateGroupMappingSummary: function () {

        groupMappingSummaryHelper.GenerateSummaryGrid();
      //  groupMappingSummaryHelper.GetRowDataForUsersGroupsGrid();

    },

    GenerateSummaryGrid: function () {
        var userId = 1;
        var apiUrl = coreManagement + "/UsersGroups/GetUsersGroupsSummaryByUserId/?userId=" + userId;

       var ds = KendoDataSourceManager.getBasicGridDataSource(apiUrl);

        $("#gridSummaryForUserGroupMember").kendoGrid({
            
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
            columns: groupMappingSummaryHelper.GenerateColumns(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });

    },

    GenerateColumns: function () {

        return columns = [
            { field: "check_rowForGroups", title: "Select", width: 35, editable: false, filterable: false, sortable: false, template: '#= groupMappingSummaryHelper.checkedDataForGroups(data) #', headerTemplate: '<input type="checkbox" id="checkAllForGroups" />' },

            { field: "usersGroupsId", title: "UsersGroupsId", width: 50, hidden: true },
            { field: "usersGroupsName", title: "Group Name", width: 500 }
        ];
    },

    checkedDataForGroups: function (data) {
        debugger;
        if (gbUsersGroups.length > 0) {

            var result = gbUsersGroups.filter(function (obj) {
                return obj.UsersGroupsId == data.UsersGroupsId;
            });
            if (result.length > 0) {
                return '<input id="check_rowForGroups" class="check_rowForGroups" type="checkbox" checked="checked"/>';
            } else {
                return '<input id="check_rowForGroups" class="check_rowForGroups" type="checkbox"/>';
            }

        } else {
            return '<input id="check_rowForGroups" class="check_rowForGroups" type="checkbox"/>';
        }
    },

    GetRowDataForUsersGroupsGrid: function () {
        
        $('.check_rowForGroups').live('click', function (e) {
            var $cb = $(this);

            var gridSummary = $("#gridSummaryForUserGroupMember").data("kendoGrid");
            var selectedItem = gridSummary.dataItem(gridSummary.select());//$kgrid.attr('k-state-selected');
            if ($cb.is(':checked')) {
                if (selectedItem != null) {

                    var obj = new Object();
                    obj.UsersGroupsId = selectedItem.UsersGroupsId;
                    gbUsersGroups.push(obj);

                } else {
                    $cb.removeProp('checked', false);
                }
            } else {
                gbUsersGroups = $.grep(gbUsersGroups, function (n) {
                    return n.UsersGroupsId != selectedItem.UsersGroupsId;

                });

            }

        });//Indivisual row selection

        $('#checkAllForGroups').live('click', function (e) {
            gbSelectedEmployeeList = [];
            var gridSummary = $("#gridSummaryForUserGroupMember").data("kendoGrid");
            var selectAll = document.getElementById("checkAllForGroups");
            if (selectAll.checked == true) {
                $("#gridSummaryForUserGroupMember tbody input:checkbox").attr("checked", this.checked);
                $("#gridSummaryForUserGroupMember table tr").addClass('k-state-selected');
                var gridData = gridSummary.dataSource.data();
                for (var i = 0; i < gridData.length; i++) {
                    var emp = gridData[i];
                    var obj = new Object();
                    obj.UsersGroupsId = emp.UsersGroupsId;

                    gbUsersGroups.push(obj);
                }
                gridSummary.refresh();
            }
            else {
                $("#gridSummaryForUserGroupMember tbody input:checkbox").removeAttr("checked", this.checked);
                $("#gridSummaryForUserGroupMember table tr").removeClass('k-state-selected');
                gbUsersGroups = [];

            }
        });// All Row Selection 

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

            branchSummaryHelper.GenerateHistorySummaryGrid(selectedItem.branchId);
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
            dataSource: branchSummaryManager.gridDataSourceForHistory(branchId),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            xheight: 450,
            filterable: true,
            sortable: true,
            columns: branchSummaryHelper.GenerateColumnsForHistory(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });
    },

    GenerateColumnsForHistory: function () {
        return columns = [
            { field: "branchId", title: "BranchId", width: 50, hidden: true },
            { field: "createdBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "updateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "branchCode", title: "Code", width: 100 },
            { field: "branchName", title: "Name", width: 100 },
            { field: "createByName", title: "Create By", width: 100 },
            { field: "createdDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(createdDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "updateByName", title: "Update By", width: 100 },
            { field: "updateDate", title: "UpdateDate", width: 100, hidden: false, template: '#= kendo.toString(updateDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "isActive", title: "Status", width: 100, hidden: false, template: "#= data.isActive==1 ? 'Active' : 'Inactive' #" },
            { field: "historyCreateorName", title: "Generate By", width: 100 },
            { field: "historyDate", title: "Generate Date", width: 100, template: '#= kendo.toString(historyDate,"dd-MM-yyyy hh:mm:ss") #' }

        ];
    },


};