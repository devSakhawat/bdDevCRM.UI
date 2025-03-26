
var usersTypeDetailsManager = {

    SaveData: function () {
        
        var isToUpdateOrCreate = $("#hdnId").val();
        var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
        var apiLink = isToUpdateOrCreate == 0 ? "/UsersType/SaveUsersType" : "/UsersType/UpdateUsersType";
        var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";

        AjaxManager.MsgBox('information', 'center', 'Confirmation', confmsg,
            [{
                addClass: 'btn btn-primary',
                text: 'Yes',
                onClick: function ($noty) {
                    $noty.close();
                    var obj = userTypeDetailsHelper.CreateNewObject();
                    var jsonObject = JSON.stringify(obj);
                    var msg = AjaxManager.PostDataForDotnetCore(coreManagement, apiLink, jsonObject);
                    if (msg === "Success") {
                        Message.Success(successmsg);
                        userTypeDetailsHelper.CloseInformation();
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

var userTypeDetailsHelper = {

    initiateDetails: function () {
        cesCommonHelper.GenerareStaticStatusDropDown("cmbStatus");
        $("#btnSave").click(function () {
            userTypeDetailsHelper.SaveInformation();
        });

        $("#btnClose").click(function () {
            userTypeDetailsHelper.CloseInformation();
        });

    },

    AddNewInformation: function () {

        AjaxManager.PopupWindow("divDetails", "Details Information", "80%");
        userTypeDetailsHelper.ClearInformation();

    },

    SaveInformation: function () {
        if (userTypeDetailsHelper.validator()) {
            usersTypeDetailsManager.SaveData();
        }

    },

    CloseInformation: function () {

        $("#divDetails").data("kendoWindow").close();
        userTypeDetailsHelper.ClearInformation();
        

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
        obj.UsersTypeId = $("#hdnId").val();
        obj.UsersTypeCode = $("#txtCode").val();
        obj.UsersTypeName = $("#txtName").val();
        obj.IsActive = $("#cmbStatus").data("kendoDropDownList").value();

       
        if (obj.UsersTypeId == 0) {
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
        AjaxManager.PopupWindow("divDetails", "Details Information", "80%");
        userTypeDetailsHelper.ClearInformation();

        $("#hdnId").val(obj.usersTypeId);
        $("#txtCode").val(obj.usersTypeCode);
        $("#txtName").val(obj.usersTypeName);
        if (obj.updateBy > 0) {
            $("#hdnUpdateBy").val(obj.updateBy);
            $("#hdnUpdateDate").val(obj.updateDate);
            $("#hdnCreateBy").val(obj.createdBy);
            $("#hdnCreateDate").val(obj.createdDate);
        }
        $("#cmbStatus").data("kendoDropDownList").value(obj.isActive);


    }

};
