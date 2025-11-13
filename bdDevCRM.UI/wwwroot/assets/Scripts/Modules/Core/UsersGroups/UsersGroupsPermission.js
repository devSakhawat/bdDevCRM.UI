var gbAccessControll = [];
var gbCustomizedReportViewer = [];
var gbMenu = [];
var gbState = [];
var gbAction = [];

var userGroupPermissionManager = {

};

var userGroupPermissionHelper = {

    initateuserGroupPermission: function () {

        cesCommonHelper.GenerareModuleComboBox("cmbModule");
        userGroupPermissionHelper.GenerateAccessControllGrid();
        userGroupPermissionHelper.GenerateCustomizeReportViewerGrid();
        userGroupPermissionHelper.GenerateMenuGridByModuleId(0);
        //userGroupPermissionHelper.GetRowDataForAccessControllGrid();
        //userGroupPermissionHelper.GetRowDataForCustomizedReportViewerGrid();
        //userGroupPermissionHelper.GetRowDataForSystemPermissionGrid();
    },

    GenerateAccessControllGrid: function () {
        var apiUrl = coreManagement + "/UsersAccessType/GetUsersAccessTypeSummary";

       var ds = KendoDataSourceManager.getBasicGridDataSource(apiUrl);

        $("#gridSummaryForAccessControl").kendoGrid({
           
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
            columns: userGroupPermissionHelper.GenerateAceessTypeColumns(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });

    },

    GenerateAceessTypeColumns: function () {

        return columns = [
            { field: "check_rowForAccessControll", title: "Select", width: 35, editable: false, filterable: false, sortable: false, template: '#= userGroupPermissionHelper.checkedDataForAccessControll(data) #', headerTemplate: '<input type="checkbox" id="checkAllForAccessControll" />' },

            { field: "UsersAccessTypeId", title: "UsersAccessTypeId", width: 50, hidden: true },
            { field: "UsersAccessTypeName", title: "Name", width: 500 }
        ];
    },

    checkedDataForAccessControll: function (data) {
        
        if (gbAccessControll.length > 0) {
            var moduleId = $("#cmbModule").data("kendoComboBox").value();
            if (moduleId == "") {
                moduleId = 0;
            }
            var result = gbAccessControll.filter(function (obj) {
                return obj.UsersAccessTypeId == data.UsersAccessTypeId && obj.ModuleId == moduleId;
            });
            if (result.length > 0) {
                return '<input id="check_rowForAccessControll" class="check_rowForAccessControll" type="checkbox" checked="checked"/>';
            } else {
                return '<input id="check_rowForAccessControll" class="check_rowForAccessControll" type="checkbox"/>';
            }

        } else {
            return '<input id="check_rowForAccessControll" class="check_rowForAccessControll" type="checkbox"/>';
        }
    },

    GetRowDataForAccessControllGrid: function () {
        var moduleId = $("#cmbModule").data("kendoComboBox").value();
        if (moduleId == "") {
            moduleId = 0;
        }

        $('.check_rowForAccessControll').live('click', function (e) {
            var $cb = $(this);

            var gridSummary = $("#gridSummaryForAccessControl").data("kendoGrid");
            var selectedItem = gridSummary.dataItem(gridSummary.select());//$kgrid.attr('k-state-selected');
            if ($cb.is(':checked')) {
                if (selectedItem != null) {

                    var obj = new Object();
                    obj.UsersAccessTypeId = selectedItem.UsersAccessTypeId;
                    obj.ModuleId = moduleId;
                    gbAccessControll.push(obj);

                } else {
                    $cb.removeProp('checked', false);
                }
            } else {
                gbAccessControll = $.grep(gbAccessControll, function (n) {
                    return n.UsersAccessTypeId != selectedItem.UsersAccessTypeId && n.ModuleId != moduleId;
                });

            }

        });//Indivisual row selection

        $('#checkAllForAccessControll').live('click', function (e) {
            gbAccessControll = [];
            var gridSummary = $("#gridSummaryForAccessControl").data("kendoGrid");
            var selectAll = document.getElementById("checkAllForGroups");
            if (selectAll.checked == true) {
                $("#gridSummaryForAccessControl tbody input:checkbox").attr("checked", this.checked);
                $("#gridSummaryForAccessControl table tr").addClass('k-state-selected');
                var gridData = gridSummary.dataSource.data();
                for (var i = 0; i < gridData.length; i++) {
                    var emp = gridData[i];
                    var obj = new Object();
                    obj.UsersAccessTypeId = emp.UsersGroupsId;
                    obj.ModuleId = moduleId;
                    gbAccessControll.push(obj);
                }
                gridSummary.refresh();
            }
            else {
                $("#gridSummaryForAccessControl tbody input:checkbox").removeAttr("checked", this.checked);
                $("#gridSummaryForAccessControl table tr").removeClass('k-state-selected');
                gbAccessControll = [];

            }
        });// All Row Selection 

    },

    GenerateCustomizeReportViewerGrid: function () {
        var apiUrl = coreManagement + "/UsersAccessType/GetUsersAccessTypeSummary";

        var ds = KendoDataSourceManager.getBasicGridDataSource(apiUrl);

        $("#gridSummaryForCustomizeReportViewer").kendoGrid({

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
            columns: userGroupPermissionHelper.GenerateCustomizedReportViewerColumns(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });

    },

    GenerateCustomizedReportViewerColumns: function () {

        return columns = [
            { field: "check_rowForCustomizedReportViewer", title: "Select", width: 35, editable: false, filterable: false, sortable: false, template: '#= userGroupPermissionHelper.checkedDataForCustomizedReportViewer(data) #', headerTemplate: '<input type="checkbox" id="checkAllForCustomizedReportViewer" />' },

            { field: "CustomizedReportViewerId", title: "CustomizedReportViewerId", width: 50, hidden: true },
            { field: "ReportName", title: "Name", width: 500 }
        ];
    },

    checkedDataForCustomizedReportViewer: function (data) {

        if (gbCustomizedReportViewer.length > 0) {
            var moduleId = $("#cmbModule").data("kendoComboBox").value();
            if (moduleId == "") {
                moduleId = 0;
            }
            var result = gbCustomizedReportViewer.filter(function (obj) {
                return obj.CustomizedReportViewerId == data.CustomizedReportViewerId && obj.ModuleId == moduleId;
            });
            if (result.length > 0) {
                return '<input id="check_rowForCustomizedReportViewer" class="check_rowForCustomizedReportViewer" type="checkbox" checked="checked"/>';
            } else {
                return '<input id="check_rowForCustomizedReportViewer" class="check_rowForCustomizedReportViewer" type="checkbox"/>';
            }

        } else {
            return '<input id="check_rowForCustomizedReportViewer" class="check_rowForCustomizedReportViewer" type="checkbox"/>';
        }
    },

    GetRowDataForCustomizedReportViewerGrid: function () {
        var moduleId = $("#cmbModule").data("kendoComboBox").value();
        if (moduleId == "") {
            moduleId = 0;
        }

        $('.check_rowForCustomizedReportViewer').live('click', function (e) {
            var $cb = $(this);

            var gridSummary = $("#gridSummaryForCustomizeReportViewer").data("kendoGrid");
            var selectedItem = gridSummary.dataItem(gridSummary.select());//$kgrid.attr('k-state-selected');
            if ($cb.is(':checked')) {
                if (selectedItem != null) {

                    var obj = new Object();
                    obj.CustomizedReportViewerId = selectedItem.CustomizedReportViewerId;
                    obj.ModuleId = moduleId;
                    gbCustomizedReportViewer.push(obj);

                } else {
                    $cb.removeProp('checked', false);
                }
            } else {
                gbCustomizedReportViewer = $.grep(gbCustomizedReportViewer, function (n) {
                    return n.CustomizedReportViewerId != selectedItem.CustomizedReportViewerId && n.ModuleId != moduleId;
                });

            }

        });//Indivisual row selection

        $('#checkAllForAccessControll').live('click', function (e) {
            gbAccessControll = [];
            var gridSummary = $("#gridSummaryForCustomizeReportViewer").data("kendoGrid");
            var selectAll = document.getElementById("checkAllForGroups");
            if (selectAll.checked == true) {
                $("#gridSummaryForCustomizeReportViewer tbody input:checkbox").attr("checked", this.checked);
                $("#gridSummaryForCustomizeReportViewer table tr").addClass('k-state-selected');
                var gridData = gridSummary.dataSource.data();
                for (var i = 0; i < gridData.length; i++) {
                    var emp = gridData[i];
                    var obj = new Object();
                    obj.CustomizedReportViewerId = emp.CustomizedReportViewerId;
                    obj.ModuleId = moduleId;
                    gbCustomizedReportViewer.push(obj);
                }
                gridSummary.refresh();
            }
            else {
                $("#gridSummaryForCustomizeReportViewer tbody input:checkbox").removeAttr("checked", this.checked);
                $("#gridSummaryForCustomizeReportViewer table tr").removeClass('k-state-selected');
                gbCustomizedReportViewer = [];

            }
        });// All Row Selection 

    },

    GenerateMenuGridByModuleId: function () {
        var moduleId = $("#cmbModule").data("kendoComboBox").value();
        if (moduleId == "") {
            moduleId = 0;
        }

        var apiUrl = coreManagement + "/Menu/GetMenuSummaryByModuleId/?moduleId=" + moduleId;

        var ds = KendoDataSourceManager.getBasicGridDataSource(apiUrl);

        $("#gridSummaryForSystemPermission").kendoGrid({

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
            columns: userGroupPermissionHelper.GenerateSystemPermissionColumns(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });

    },

    GenerateSystemPermissionColumns: function () {

        return columns = [
            { field: "check_rowForSystemPermission", title: "Select", width: 35, editable: false, filterable: false, sortable: false, template: '#= userGroupPermissionHelper.checkedDataForSystemPermission(data) #', headerTemplate: '<input type="checkbox" id="checkAllForSystemPermission" />' },

            { field: "MenuId", title: "MenuId", width: 50, hidden: true },
            { field: "MenuName", title: "Name", width: 500 }
        ];
    },

    checkedDataForSystemPermission: function (data) {

        if (gbCustomizedReportViewer.length > 0) {
            var moduleId = $("#cmbModule").data("kendoComboBox").value();
            if (moduleId == "") {
                moduleId = 0;
            }
            var result = gbMenu.filter(function (obj) {
                return obj.MenuId == data.MenuId && obj.ModuleId == moduleId;
            });
            if (result.length > 0) {
                return '<input id="check_rowForSystemPermission" class="check_rowForSystemPermission" type="checkbox" checked="checked"/>';
            } else {
                return '<input id="check_rowForSystemPermission" class="check_rowForSystemPermission" type="checkbox"/>';
            }

        } else {
            return '<input id="check_rowForSystemPermission" class="check_rowForSystemPermission" type="checkbox"/>';
        }
    },

    GetRowDataForSystemPermissionGrid: function () {
        var moduleId = $("#cmbModule").data("kendoComboBox").value();
        if (moduleId == "") {
            moduleId = 0;
        }

        $('.check_rowForSystemPermission').live('click', function (e) {
            var $cb = $(this);

            var gridSummary = $("#gridSummaryForSystemPermission").data("kendoGrid");
            var selectedItem = gridSummary.dataItem(gridSummary.select());//$kgrid.attr('k-state-selected');
            if ($cb.is(':checked')) {
                if (selectedItem != null) {

                    var obj = new Object();
                    obj.MenuId = selectedItem.MenuId;
                    obj.ModuleId = moduleId;
                    gbMenu.push(obj);

                } else {
                    $cb.removeProp('checked', false);
                }
            } else {
                gbMenu = $.grep(gbMenu, function (n) {
                    return n.MenuId != selectedItem.MenuId && n.ModuleId != moduleId;
                });

            }

        });//Indivisual row selection

        $('#checkAllForAccessControll').live('click', function (e) {
            gbMenu = [];
            var gridSummary = $("#gridSummaryForSystemPermission").data("kendoGrid");
            var selectAll = document.getElementById("checkAllForGroups");
            if (selectAll.checked == true) {
                $("#gridSummaryForSystemPermission tbody input:checkbox").attr("checked", this.checked);
                $("#gridSummaryForSystemPermission table tr").addClass('k-state-selected');
                var gridData = gridSummary.dataSource.data();
                for (var i = 0; i < gridData.length; i++) {
                    var emp = gridData[i];
                    var obj = new Object();
                    obj.MenuId = emp.MenuId;
                    obj.ModuleId = moduleId;
                    gbMenu.push(obj);
                }
                gridSummary.refresh();
            }
            else {
                $("#gridSummaryForSystemPermission tbody input:checkbox").removeAttr("checked", this.checked);
                $("#gridSummaryForSystemPermission table tr").removeClass('k-state-selected');
                gbMenu = [];

            }
        });// All Row Selection 

    },

};