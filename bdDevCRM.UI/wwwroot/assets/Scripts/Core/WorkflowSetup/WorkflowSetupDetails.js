
var workflowDetailsManager = {

    SaveData: function () {
        
        var isToUpdateOrCreate = $("#hdnId").val();
        var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
        var apiLink = isToUpdateOrCreate == 0 ? "/WorkflowState/SaveWorkflowState" : "/WorkflowState/UpdateWorkflowState";
        var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";

        AjaxManager.MsgBox('information', 'center', 'Confirmation', confmsg,
            [{
                addClass: 'btn btn-primary',
                text: 'Yes',
                onClick: function ($noty) {
                    $noty.close();
                    var obj = workflowDetailsHelper.CreateNewObject();
                    var jsonObject = JSON.stringify(obj);
                    var msg = AjaxManager.PostDataForDotnetCore(menuandModuleInfo.ModuleApiPath, apiLink, jsonObject);
                    if (msg === "Success") {
                        Message.Success(successmsg);
                        workflowDetailsHelper.CloseInformation();
                        $("#gridSummary").data("kendoGrid").dataSource.read();
                    } else {
                        Message.Warning(msg);
                    }

                }
            }, {
                addClass: 'btn',
                text: 'Cancel',
                onClick: function ($noty) {
                    $noty.close();
                }
            }
            ]);

    },

    SaveDataForAction: function () {

        var isToUpdateOrCreate = $("#hdnIdAction").val();
        var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
        var apiLink = isToUpdateOrCreate == 0 ? "/WorkflowAction/SaveWorkflowAction" : "/WorkflowAction/UpdateWorkflowAction";
        var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";

        AjaxManager.MsgBox('information', 'center', 'Confirmation', confmsg,
            [{
                addClass: 'btn btn-primary',
                text: 'Yes',
                onClick: function ($noty) {
                    $noty.close();
                    var obj = workflowDetailsHelper.CreateNewObjectForAction();
                    var jsonObject = JSON.stringify(obj);
                    var msg = AjaxManager.PostDataForDotnetCore(menuandModuleInfo.ModuleApiPath, apiLink, jsonObject);
                    if (msg === "Success") {
                        Message.Success(successmsg);
                        workflowDetailsHelper.CloseActionInformation();
                        $("#gridActionSummry").data("kendoGrid").dataSource.read();
                    } else {
                        Message.Warning(msg);
                    }

                }
            }, {
                addClass: 'btn',
                text: 'Cancel',
                onClick: function ($noty) {
                    $noty.close();
                }
            }
            ]);

    },

    gridDataSourceForHistory: function (workflowActionId) {

        var apiUrl = coreApi + "/WorkflowAction/GetWorkflowActionHistorySummary/?workflowActionId=" + workflowActionId;

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

var workflowDetailsHelper = {

    initiateDetails: function () {

        $("#tabstrip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            }
        });
        $("#numWorkflowStateOrder").kendoNumericTextBox({
            format: "#",
            min: "0",
        }).parent().parent().css('width', "17.4em");
        cesCommonHelper.GenerareMenuComboBox("cmbMenu");

        cesCommonHelper.GenerareStaticYesNoDropDown("cmbDefalutState");

        cesCommonHelper.GenerareStaticWorkflowDefinationDropDown("cmbWorkflowDefination");

        cesCommonHelper.GenerareStaticStatusDropDown("cmbStatus");

        cesCommonHelper.GenerareStateComboBoxByMenuId("cmbStateAction", "0");
        cesCommonHelper.GenerareStateComboBoxByMenuId("cmbNextStatusForAction","0");
        cesCommonHelper.GenerareStaticYesNoDropDown("cmbIsSentEmail");
        cesCommonHelper.GenerareStaticYesNoDropDown("cmbIsSentSms");
        $("#numWorkflowActionOrder").kendoNumericTextBox({
            format: "#",
            min: "0",
        }).parent().parent().css('width', "17.4em");

        workflowDetailsHelper.GenerateSummaryGridForAction();

        $("#btnSave").click(function () {
            workflowDetailsHelper.SaveInformation();
        });

        $("#btnClose").click(function () {
            workflowDetailsHelper.CloseInformation();
        });

        $("#btnSaveAction").click(function () {
            workflowDetailsHelper.SaveActionInformation();
        });

        $("#btnCloseAction").click(function () {
            workflowDetailsHelper.CloseActionInformation();
        });

        $("#btnAddNewAction").click(function () {
            workflowDetailsHelper.AddNewInformationForAction();
        });

    },

    AddNewInformation: function () {

        AjaxManager.PopupWindow("divDetails", "Details Information", "80%");
        workflowDetailsHelper.ClearInformation();

    },

    AddNewInformationForAction: function () {

        AjaxManager.PopupWindow("divDetailsForAction", "Details Information", "40%");
        workflowDetailsHelper.ClearActionInformation();

    },

    SaveInformation: function () {
        if (cesCommonHelper.validator("StateDiv", "status")) {
            workflowDetailsManager.SaveData();
        }

    },

    SaveActionInformation: function () {
        if (cesCommonHelper.validator("divDetailsForAction", "statusForAction")) {
            workflowDetailsManager.SaveDataForAction();
        }
    },

    CloseInformation: function () {

        $("#divDetails").data("kendoWindow").close();
        workflowDetailsHelper.ClearInformation();
    },

    CloseActionInformation: function () {
        $("#divDetailsForAction").data("kendoWindow").close();
        workflowDetailsHelper.ClearActionInformation();

    },

    

    ClearInformation: function () {
        $("#hdnId").val("0");
        $("#txtName").val("");
        $("#hdnCreateBy").val("");
        $("#hdnCreateDate").val("");
        $("#hdnUpdateBy").val("");
        $("#hdnUpdateDate").val("");
        $("#cmbMenu").data("kendoComboBox").value("");
        $("#numWorkflowStateOrder").data("kendoNumericTextBox").value("");
        $("#cmbWorkflowDefination").data("kendoDropDownList").value("");
        $("#cmbDefalutState").data("kendoDropDownList").value("0");
        $("#cmbStatus").data("kendoDropDownList").value("1");

    },

    ClearActionInformation: function () {
        $("#hdnIdAction").val("0");
        $("#txtNameAction").val("");
        $("#hdnCreateByAction").val("");
        $("#hdnCreateDateAction").val("");
        $("#hdnUpdateByAction").val("");
        $("#hdnUpdateDateAction").val("");
        $("#cmbStateAction").data("kendoComboBox").value("");
        $("#cmbNextStatusForAction").data("kendoComboBox").value("");
        $("#numWorkflowActionOrder").data("kendoNumericTextBox").value("");
        $("#cmbIsSentEmail").data("kendoDropDownList").value("");
        $("#cmbIsSentSms").data("kendoDropDownList").value("");
        $("#cmbStatus").data("kendoDropDownList").value("1");

    },

    

    CreateNewObject: function () {

        var obj = new Object();
        obj.WorkflowStateId = $("#hdnId").val();
        obj.WorkflowStateName = $("#txtName").val();
        obj.MenuId = $("#cmbMenu").data("kendoComboBox").value();
        obj.IsDefaultStart = $("#cmbDefalutState").data("kendoDropDownList").value();
        obj.WorkflowStateDefination = $("#cmbWorkflowDefination").data("kendoDropDownList").value();
        obj.WorkflowStateOrder = $("#numWorkflowStateOrder").data("kendoNumericTextBox").value();
        obj.IsActive = $("#cmbStatus").data("kendoDropDownList").value();

       
        if (obj.WorkflowStateId == 0) {
            obj.CreatedBy = 1;
            obj.CreateDate = null;
            obj.UpdateBy = null;
            obj.UpdateDate = null;
        }
        else {
            obj.CreatedBy = $("#hdnCreateBy").val() == "" ? 1 : $("#hdnCreateBy").val();
            obj.CreateDate = $("#hdnCreateDate").val();
            obj.UpdateBy = 1;
            obj.UpdateDate = null;
        }

        return obj;


    },

    CreateNewObjectForAction: function () {

        var obj = new Object();
        obj.WorkflowActionId = $("#hdnIdAction").val();
        obj.WorkflowActionName = $("#txtNameAction").val();
        obj.WorkflowStateId = $("#cmbStateAction").data("kendoComboBox").value();
        obj.NextWorkflowStateId = $("#cmbNextStatusForAction").data("kendoComboBox").value();
        obj.WorkFlowActionOrder = $("#numWorkflowActionOrder").data("kendoNumericTextBox").value();
        obj.IsEmailAlert = $("#cmbIsSentEmail").data("kendoDropDownList").value();
        obj.IsSmsAlert = $("#cmbIsSentSms").data("kendoDropDownList").value();
        obj.IsActive = $("#cmbStatus").data("kendoDropDownList").value();


        if (obj.WorkflowActionId == 0) {
            obj.CreatedBy = 1;
            obj.CreateDate = null;
            obj.UpdateBy = null;
            obj.UpdateDate = null;
        }
        else {
            obj.CreatedBy = $("#hdnCreateBy").val() == "" ? 1 : $("#hdnCreateBy").val();
            obj.CreateDate = $("#hdnCreateDate").val();
            obj.UpdateBy = 1;
            obj.UpdateDate = null;
        }

        return obj;


    },

    PopulateNewObject: function (obj) {

        $("#hdnId").val(obj.workflowStateId);
        $("#txtName").val(obj.workflowStateName);
        $("#cmbMenu").data("kendoComboBox").value(obj.menuId);
        $("#cmbDefalutState").data("kendoDropDownList").value(obj.isDefaultStart);
        $("#cmbWorkflowDefination").data("kendoDropDownList").value(obj.workflowStateDefination);
        $("#numWorkflowStateOrder").data("kendoNumericTextBox").value(obj.workflowStateOrder);
        if (obj.updateBy > 0) {
            $("#hdnUpdateBy").val(obj.updateBy);
            $("#hdnUpdateDate").val(obj.updateDate);
            $("#hdnCreateBy").val(obj.createdBy);
            $("#hdnCreateDate").val(obj.createdDate);
        }
        $("#cmbStatus").data("kendoDropDownList").value(obj.isActive);


    },

    PopulateNewObjectForAction: function (obj) {

        $("#hdnIdAction").val(obj.workflowActionId);
        $("#txtNameAction").val(obj.workflowActionName);
        $("#cmbStateAction").data("kendoComboBox").value(obj.workflowStateId);
        $("#cmbNextStatusForAction").data("kendoComboBox").value(obj.nextWorkflowStateId);
        $("#numWorkflowActionOrder").data("kendoNumericTextBox").value(obj.workFlowActionOrder);
        $("#cmbIsSentEmail").data("kendoDropDownList").value(obj.isEmailAlert);
        $("#cmbIsSentSms").data("kendoDropDownList").value(obj.isSmsAlert);
        if (obj.updateBy > 0) {
            $("#hdnUpdateBy").val(obj.updateBy);
            $("#hdnUpdateDate").val(obj.updateDate);
            $("#hdnCreateBy").val(obj.createdBy);
            $("#hdnCreateDate").val(obj.createdDate);
        }
        $("#cmbStatus").data("kendoDropDownList").value(obj.isActive);


    },

    GenerateSummaryGridForAction: function () {

        var workflowStateId = $("#hdnId").val();
        if (workflowStateId == "") {
            workflowStateId = "0";
        }

        var apiUrl = coreManagement + "/WorkflowAction/GetWorkflowActionSummary/?workflowStateId=" + workflowStateId;

        var ds = KendoDataSourceManager.getBasicGridDataSource(apiUrl);

        $("#gridActionSummry").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "ExportActionInfo.xlsx",
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
            columns: workflowDetailsHelper.GenerateColumnsForAction(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });
    },

    GenerateColumnsForAction: function () {
        return columns = [
            { field: "workflowActionId", title: "WorkflowActionId", width: 50, hidden: true },
            { field: "workflowStateId", title: "WorkflowStateId", width: 50, hidden: true },
            { field: "nextWorkflowStateId", title: "NextWorkflowStateId", width: 50, hidden: true },
            { field: "workFlowActionOrder", title: "WorkFlowActionOrder", width: 50, hidden: true },
            { field: "createdBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "updateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "workflowActionName", title: "Action Name", width: 100 },
            { field: "createByName", title: "Create By", width: 100 },
            { field: "createdDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(createdDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "updateByName", title: "Update By", width: 100 },
            { field: "updateDate", title: "UpdateDate", width: 100, hidden: false, template: '#= kendo.toString(updateDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "isEmailAlert", title: "Is Email Sent", width: 100, hidden: false, template: "#= data.isEmailAlert==1 ? 'Yes' : 'No' #" },
            { field: "isSmsAlert", title: "Is SMS Sent", width: 100, hidden: false, template: "#= data.isSmsAlert==1 ? 'Yes' : 'No' #" },
            { field: "isActive", title: "Status", width: 100, hidden: false, template: "#= data.isActive==1 ? 'Active' : 'Inactive' #" },
            { field: "Edit", title: "Edit", filterable: false, width: 120, template: '<input type="button" class="k-button" value="Edit" id="btnEdit" onClick="workflowDetailsHelper.clickEventForEditButton()"/>&nbsp;&nbsp;<input type="button" class="k-button" value="Change History" id="btnEdit" onClick="workflowDetailsHelper.clickEventForViewHistory()"/>', sortable: false }
        ];
    },

    clickEventForEditButton: function () {

        var entityGrid = $("#gridActionSummry").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {
            workflowDetailsHelper.PopulateNewObjectForAction(selectedItem);
        }

    },

    clickEventForViewHistory: function () {
        var entityGrid = $("#gridActionSummry").data("kendoGrid");

        var selectedItem = entityGrid.dataItem(entityGrid.select());
        if (selectedItem != null) {

            workflowDetailsHelper.GenerateHistorySummaryGrid(selectedItem.workflowActionId);
           // AjaxManager.PopupWindow("divHistoryPopupFor", "History Summary", "90%");

        }
    },


    GenerateHistorySummaryGrid: function (WorkflowActionId) {
        $("#gridHistoryPopupForAction").kendoGrid({
            toolbar: ["excel"],
            excel: {
                fileName: "HistoryDataExport.xlsx",
                filterable: true,
                allPages: true
            },
            dataSource: workflowDetailsManager.gridDataSourceForHistory(WorkflowActionId),
            pageable: {
                refresh: true,
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true
            },
            xheight: 450,
            filterable: true,
            sortable: true,
            columns: workflowDetailsHelper.GenerateColumnsForHistory(),
            editable: false,
            navigatable: true,
            selectable: "row"

            //selectable: false

        });
    },

    GenerateColumnsForHistory: function () {
        return columns = [
            { field: "workflowActionId", title: "WorkflowActionId", width: 50, hidden: true },
            { field: "workflowStateId", title: "WorkflowStateId", width: 50, hidden: true },
            { field: "nextWorkflowStateId", title: "NextWorkflowStateId", width: 50, hidden: true },
            { field: "workFlowActionOrder", title: "WorkFlowActionOrder", width: 50, hidden: true },
            { field: "createdBy", title: "CreatedBy", width: 50, hidden: true },
            { field: "updateBy", title: "UpdateBy", width: 50, hidden: true },
            { field: "workflowActionName", title: "Action Name", width: 100 },
            { field: "createByName", title: "Create By", width: 100 },
            { field: "createdDate", title: "CreatedDate", width: 100, hidden: false, template: '#= kendo.toString(createdDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "updateByName", title: "Update By", width: 100 },
            { field: "updateDate", title: "UpdateDate", width: 100, hidden: false, template: '#= kendo.toString(updateDate,"dd-MM-yyyy hh:mm:ss") #' },
            { field: "isEmailAlert", title: "Is Email Sent", width: 100, hidden: false, template: "#= data.isEmailAlert==1 ? 'Yes' : 'No' #" },
            { field: "isSmsAlert", title: "Is SMS Sent", width: 100, hidden: false, template: "#= data.isSmsAlert==1 ? 'Yes' : 'No' #" },
            { field: "isActive", title: "Status", width: 100, hidden: false, template: "#= data.isActive==1 ? 'Active' : 'Inactive' #" },
            { field: "historyCreateorName", title: "Generate By", width: 100 },
            { field: "historyDate", title: "Generate Date", width: 100, template: '#= kendo.toString(historyDate,"dd-MM-yyyy hh:mm:ss") #' }

        ];
    },

};
