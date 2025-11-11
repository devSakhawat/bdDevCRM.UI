
var userGroupDetailsManager = {

    SaveData: function () {
        
        var isToUpdateOrCreate = $("#hdnId").val();
        var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
        var apiLink = isToUpdateOrCreate == 0 ? "/UsersGroups/SaveUsersGroups" : "/UsersGroups/UpdateUsersGroups";
        var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";

        AjaxManager.MsgBox('information', 'center', 'Confirmation', confmsg,
            [{
                addClass: 'btn btn-primary',
                text: 'Yes',
                onClick: function ($noty) {
                    $noty.close();
                    var obj = userGroupDetailsHelper.CreateNewObject();
                    var jsonObject = JSON.stringify(obj);
                    var msg = AjaxManager.PostDataForDotnetCore(menuandModuleInfo.ModuleApiPath, apiLink, jsonObject);
                    if (msg === "Success") {
                        Message.Success(successmsg);
                        userGroupDetailsHelper.ClosePopupInformation();
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

var userGroupDetailsHelper = {

    initiateUserGroupDetails: function () {

        $("#tabstrip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            }
        });

        cesCommonHelper.GenerareStaticStatusDropDown("cmbStatus");
        cesCommonHelper.GenerareStaticYesNoDropDown("cmbDefaultGroup");
        cesCommonHelper.GenerareAllActiveUsersTypeCombo("cmbUsertype");
        $("#btnSave").click(function () {
            userGroupDetailsHelper.SaveInformation();
        });

        $("#btnClose").click(function () {
            userGroupDetailsHelper.CloseInformation();
        });
        userGroupPermissionHelper.initateuserGroupPermission();

    },

    AddNewInformation: function () {

        AjaxManager.PopupWindow("divDetails", "Details Information", "80%");
        userGroupDetailsHelper.ClearInformation();

    },

    SaveInformation: function () {
        if (userGroupDetailsHelper.validator()) {
            userGroupDetailsManager.SaveData();
        }

    },

    CloseInformation: function () {

        $("#divDetails").data("kendoWindow").close();
        userGroupDetailsHelper.ClearInformation();
        

    },

    ClearInformation: function () {
        $("#hdnId").val("0");
        $("#txtCode").val("");
        $("#hdnCreateBy").val("");
        $("#hdnCreateDate").val("");
        $("#hdnUpdateBy").val("");
        $("#hdnUpdateDate").val("");
        $("#txtName").val("");

        $("#cmbStatus").data("kendoDropDownList").value("1");
        $("#cmbDefaultGroup").data("kendoDropDownList").value("1");
        $("#cmbUsertype").data("kendoComboBox").value("");

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
        obj.UsersGroupsId = $("#hdnId").val();
        obj.UsersGroupsCode = $("#txtCode").val();
        obj.UsersGroupsName = $("#txtName").val();
        obj.IsActive = $("#cmbStatus").data("kendoDropDownList").value();
        obj.IsDefaultGroups = $("#cmbDefaultGroup").data("kendoDropDownList").value();
        obj.UsersTypeId = $("#cmbUsertype").data("kendoComboBox").value();

       
        if (obj.UsersGroupsId == 0) {
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

        $("#hdnId").val(obj.UsersGroupsId);
        $("#txtCode").val(obj.UsersGroupsCode);
        $("#txtName").val(obj.UsersGroupsName);
        if (obj.UpdateBy > 0) {
            $("#hdnUpdateBy").val(obj.UpdateBy);
            $("#hdnUpdateDate").val(obj.UpdateDate);
            $("#hdnCreateBy").val(obj.CreatedBy);
            $("#hdnCreateDate").val(obj.CreatedDate);
        }
        $("#cmbStatus").data("kendoDropDownList").value(obj.isActive);
        $("#cmbDefaultGroup").data("kendoDropDownList").value(obj.IsDefaultGroups);
        $("#cmbUsertype").data("kendoComboBox").value(obj.UsersTypeId);


    }

};
