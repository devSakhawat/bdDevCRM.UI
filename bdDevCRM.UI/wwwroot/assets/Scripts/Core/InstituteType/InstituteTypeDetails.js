
var initiateTypeDetailsManager = {

    SaveData: function () {
        
        var isToUpdateOrCreate = $("#hdnId").val();
        var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
        var apiLink = isToUpdateOrCreate == 0 ? "/InstituteType/SaveInstituteType" : "/InstituteType/UpdateInstituteType";
        var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";

        AjaxManager.MsgBox('information', 'center', 'Confirmation', confmsg,
            [{
                addClass: 'btn btn-primary',
                text: 'Yes',
                onClick: function ($noty) {
                    $noty.close();
                    var obj = instituteTypeDetailsHelper.CreateNewObject();
                    var jsonObject = JSON.stringify(obj);
                    var msg = AjaxManager.PostDataForDotnetCore(menuandModuleInfo.ModuleApiPath, apiLink, jsonObject);
                    if (msg === "Success") {
                        Message.Success(successmsg);
                        instituteTypeDetailsHelper.ClosePopupInformation();
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

var instituteTypeDetailsHelper = {

    initiateInstituteDetails: function () {
        cesCommonHelper.GenerareStaticStatusDropDown("cmbStatus");
        $("#btnSave").click(function () {
            instituteTypeDetailsHelper.SaveInformation();
        });

        $("#btnClose").click(function () {
            instituteTypeDetailsHelper.CloseInformation();
        });

    },

    AddNewInformation: function () {

        AjaxManager.PopupWindow("divDetails", "Details Information", "80%");
        instituteTypeDetailsHelper.ClearInformation();

    },

    SaveInformation: function () {
        if (instituteTypeDetailsHelper.validator()) {
            initiateTypeDetailsManager.SaveData();
        }

    },

    CloseInformation: function () {

        $("#divDetails").data("kendoWindow").close();
        instituteTypeDetailsHelper.ClearInformation();
        

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
        obj.InstituteTypeId = $("#hdnId").val();
        obj.InstituteTypeCode = $("#txtCode").val();
        obj.InstituteTypeName = $("#txtName").val();
        obj.IsActive = $("#cmbStatus").data("kendoDropDownList").value();

       
        if (obj.InstituteTypeId == 0) {
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

        $("#hdnId").val(obj.InstituteTypeId);
        $("#txtCode").val(obj.InstituteTypeCode);
        $("#txtName").val(obj.InstituteTypeName);
        if (obj.UpdateBy > 0) {
            $("#hdnUpdateBy").val(obj.UpdateBy);
            $("#hdnUpdateDate").val(obj.UpdateDate);
            $("#hdnCreateBy").val(obj.CreatedBy);
            $("#hdnCreateDate").val(obj.CreatedDate);
        }
       $("#cmbStatus").data("kendoDropDownList").value(obj.isActive);


    }

};
