

var globalmyLeaveSummaryManager = {
    gridDataSource: function (hrRecordId,companyId) {
        
        var gridDataSource = new kendo.data.DataSource({
            type: "json",

            serverPaging: true,
            serverSorting: true,

            pageSize: 100,
            //page: 1,

            transport: {
                read: {

                    url: '../Leave/GetMyLeaveStatusSummary/?hrRecordId=' + hrRecordId + "&companyId="+companyId,

                    type: "POST",

                    dataType: "json",

                    contentType: "application/json; charset=utf-8"
                },

                parameterMap: function (options) {

                    return JSON.stringify(options);

                }
            },
            schema: {
                data: "Items", total: "TotalCount",
                model: {
                    //fields: {
                    //    Leave: {
                    //        type: "string"
                    //    }
                    //}
                }

            }


        });

        return gridDataSource;
    }
};

var globalmyLeaveSummaryHelper = {
    GenerateMyLeaveStatusGrid: function (hrRecordId,companyId) {

        $("#gridmyLeaveStatus").kendoGrid({

            dataSource: globalmyLeaveSummaryManager.gridDataSource(hrRecordId,companyId),
            autoBind: true,
            //height: 177,
            filterable: false,
            sortable: false,
            columns: globalmyLeaveSummaryHelper.GeneratedMyLeaveStatusColumns(),
            editable: false,
            scrollable: true,
            navigatable: true
        });

    },

    GeneratedMyLeaveStatusColumns: function () {
        return columns = [
            { filed: "TypeName", title: "Leave Type", width: 100, sortable: false, template: '#= globalmyLeaveSummaryHelper.GenerateLeaveName(data) #' },
            { field: "OpeningLeaveBalance", title: "Current Year Opening", width: 100, sortable: false },
            { field: "LeaveBroughtForward", title: "Leave Accumulated", width: 100, sortable: false },
            { field: "Totalleave", title: "Total Leave Entitled", width: 100, sortable: false, template: '#=OpeningLeaveBalance+LeaveBroughtForward #' },
            { field: "LeaveEnjoied", title: "Leave Used", width: 100, sortable: false },
            { field: "LeaveDeducted", title: "Leave Deducted", width: 100, sortable: false },
            { field: "ClosingLeaveBalance", title: "Leave Balance", width: 100, sortable: false }
        ];
        
        //return columns = [
        //    { filed: "LeaveName", title: "Leave", width: 100, sortable: false, template: '#= globalmyLeaveSummaryHelper.GenerateLeaveName(data) #' },
        //    { field: "Casual", title: "Casual", width: 100, sortable: false },
        //    { field: "Medical", title: "Medical", width: 100, sortable: false },
        //    { field: "Annual", title: "Annual", width: 100, sortable: false },
        //    { field: "Short", title: "Short", width: 100, sortable: false },
        //    { field: "COff", title: "COff", width: 100, sortable: false },
        //    { field: "Special", title: "Special", width: 100, sortable: false },
        //    { field: "WithoutPay", title: "Without Pay", width: 100, sortable: false }
        //];
    },
    
    GenerateLeaveName: function (data) {
        return data.TypeName;
    }
};

