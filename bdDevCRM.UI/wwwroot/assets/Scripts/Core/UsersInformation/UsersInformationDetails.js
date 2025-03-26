
var userInformationDetailsManager = {

    SaveData: function () {
        
        var isToUpdateOrCreate = $("#hdnId").val();
        var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
        var apiLink = isToUpdateOrCreate == 0 ? "/UsersInformation/SaveUsersInformation" : "/UsersInformation/UpdateUsersInformation";
        var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";

        AjaxManager.MsgBox('information', 'center', 'Confirmation', confmsg,
            [{
                addClass: 'btn btn-primary',
                text: 'Yes',
                onClick: function ($noty) {
                    $noty.close();
                    var obj = userInformationDetailsHelper.CreateNewObject();
                    var jsonObject = JSON.stringify(obj);
                    var msg = AjaxManager.PostDataForDotnetCore(menuandModuleInfo.ModuleApiPath, apiLink, jsonObject);
                    if (msg === "Success") {
                        Message.Success(successmsg);
                        userInformationDetailsHelper.ClosePopupInformation();
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

};

var userInformationDetailsHelper = {

    initiateUserInformationDetails: function () {

        $("#tabstrip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            }
        });


        cesCommonHelper.GenerareStaticStatusDropDown("cmbStatus");
        $("#btnSave").click(function () {
            userInformationDetailsHelper.SaveInformation();
        });

        $("#btnClose").click(function () {
            userInformationDetailsHelper.CloseInformation();
        });
        cesCommonHelper.GenerareHierarchyInstitueCombo("cmbInstitute");
        cesCommonHelper.GetActiveBranchByInstritueId("cmbBranch", 0);
        cesCommonHelper.GenerareAllActiveUsersTypeCombo("cmbUsersType");
        cesCommonHelper.GenerareStaticYesNoDropDown("cmbIsFirstLoginEnable");
        cesCommonHelper.GenerareStaticYesNoDropDown("cmbAccessPrentInstitute");
        cesCommonHelper.GenerareStaticYesNoDropDown("cmbIsExpired");
        cesCommonHelper.GenerareDefaultDashboardDropDown("cmbDefaultDashbaord");
        cesCommonHelper.GenerareDefaultThemeDropDown("cmbTheme");
        groupMappingSummaryHelper.initateGroupMappingSummary();

    },

    AddNewInformation: function () {

        AjaxManager.PopupWindow("divDetails", "Details Information", "80%");
        branchDetailsHelper.ClearInformation();

    },

    SaveInformation: function () {
        if (userInformationDetailsHelper.validator()) {
            userInformationDetailsManager.SaveData();
        }

    },

    CloseInformation: function () {

        $("#divDetails").data("kendoWindow").close();
        userInformationDetailsHelper.ClearInformation();
        

    },

    ClearInformation: function () {
        $("#hdnId").val("0");
        $("#txtLoginId").val("");
        $("#hdnCreateBy").val("");
        $("#hdnCreateDate").val("");
        $("#hdnUpdateBy").val("");
        $("#hdnUpdateDate").val("");
        $("#txtFullName").val("");
        $("#cmbInstitute").data("kendoComboBox").value("");
        $("#cmbUsersType").data("kendoComboBox").value("");
        $("#cmbBranch").data("kendoComboBox").value("");
        $("#password").val("");
        $("#cmbIsExpired").data("kendoDropDownList").value("");
        $("#cmbTheme").data("kendoDropDownList").value("");
        $("#cmbAccessPrentInstitute").data("kendoDropDownList").value("");
        $("#cmbDefaultDashbaord").data("kendoDropDownList").value("");
        $("#cmbIsFirstLoginEnable").data("kendoDropDownList").value("");
        $("#cmbStatus").data("kendoDropDownList").value("1");

    },

    validator: function () {
        var data = [];
        var validator = $("#divdetailsForDetails").kendoValidator().data("kendoValidator"),
            status = $(".status");
        if (validator.validate()) {
            status.text("").addClass("valid");
            return true;
        } else {
            status.text("Oops! There is invalid data in the form.").addClass("invalid");
            return false;
        }

    },

    CreateNewObject: function () {

        var obj = new Object();
        obj.UsersInformationId = $("#hdnId").val();
        obj.LoginId = $("#txtLoginId").val();
        obj.LoginName = $("#txtFullName").val();
        obj.IsActive = $("#cmbStatus").data("kendoDropDownList").value();
        obj.InstituteId= $("#cmbInstitute").data("kendoComboBox").value();
        obj.UsersTypeId=$("#cmbUsersType").data("kendoComboBox").value();
        obj.BranchId=$("#cmbBranch").data("kendoComboBox").value();
        obj.PasswordName=$("#password").val();
        obj.IsExpired=$("#cmbIsExpired").data("kendoDropDownList").value();
        obj.Theme=$("#cmbTheme").data("kendoDropDownList").value();
        obj.AccessPrentInstitute=$("#cmbAccessPrentInstitute").data("kendoDropDownList").value();
        obj.DefaultDashbaord=$("#cmbDefaultDashbaord").data("kendoDropDownList").value();
        obj.IsFirstLoginEnable=$("#cmbIsFirstLoginEnable").data("kendoDropDownList").value();

       
        if (obj.BranchId == 0) {
            obj.CreatedBy = 1;
            obj.CreateDate = null;
            obj.UpdateBy = null;
            obj.UpdateDate = null;
        }
        else {
            obj.CreatedBy = $("#hdnCreateBy").val();
            obj.CreateDate = $("#hdnCreateDate").val();
            obj.UpdateBy = 1;
            obj.UpdateDate = null;
        }

        return obj;


    },

    PopulateNewObject: function (obj) {

        $("#hdnId").val(obj.usersInformationId);
        $("#txtLoginId").val(obj.loginId);
        $("#txtFullName").val(obj.loginName);
        $("#cmbInstitute").data("kendoComboBox").value(obj.instituteId);
        $("#cmbUsersType").data("kendoComboBox").value(obj.usersTypeId);
        $("#cmbBranch").data("kendoComboBox").value(obj.branchId);
        $("#password").val(obj.passwordName);
        $("#cmbIsExpired").data("kendoDropDownList").value(obj.isExpired);
        $("#cmbTheme").data("kendoDropDownList").value(obj.theme);
        $("#cmbAccessPrentInstitute").data("kendoDropDownList").value(obj.accessPrentInstitute);
        $("#cmbDefaultDashbaord").data("kendoDropDownList").value(obj.defaultDashbaord);
        $("#cmbIsFirstLoginEnable").data("kendoDropDownList").value(obj.isFirstLoginEnable);
        
        if (obj.updateBy > 0) {
            $("#hdnUpdateBy").val(obj.updateBy);
            $("#hdnUpdateDate").val(obj.updateDate);
            $("#hdnCreateBy").val(obj.createdBy);
            $("#hdnCreateDate").val(obj.createdDate);
        }
        $("#cmbStatus").data("kendoDropDownList").value(obj.isActive);


    }

};
