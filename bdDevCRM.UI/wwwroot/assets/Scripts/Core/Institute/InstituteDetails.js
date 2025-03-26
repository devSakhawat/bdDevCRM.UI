
var initiateDetailsManager = {

    SaveInstitute: function () {
        
        var isToUpdateOrCreate = $("#hdnId").val();
        var successmsg = isToUpdateOrCreate == 0 ? "New Institute Saved Successfully." : "Institute Information Updated Successfully.";
        var apiLink = isToUpdateOrCreate == 0 ? "/Institute/SaveInstitute" : "/Institute/UpdateInstitute";
        var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save Institute information?" : "Do you want to update Institute information?";

        AjaxManager.MsgBox('information', 'center', 'Confirmation', confmsg,
            [{
                addClass: 'btn btn-primary',
                text: 'Yes',
                onClick: function ($noty) {
                    $noty.close();
                    var obj = instituteDetailsHelper.CreateNewObject();
                    var jsonObject = JSON.stringify(obj);
                    var msg = AjaxManager.PostDataForDotnetCore(menuandModuleInfo.ModuleApiPath, apiLink, jsonObject);
                    if (msg === "Success") {
                        Message.Success(successmsg);
                        instituteDetailsHelper.ClosePopupInformation();
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

    FullLogoUpload: function () {

        $("#files").kendoUpload({
            upload: onUpload,
            multiple: false,
            success: onSuccess,
            error: onError,
            async: {
                saveUrl: "../DocumentUpload/UploadImageFile",
                removeUrl: "../DocumentUpload/RemoveImageFile",
                autoUpload: true
            }
        });

        function onUpload(e) {

            var files = e.files;
            $.each(files, function () {
                if ((this.extension != ".jpg") && (this.extension != ".png")) {
                    alert("Only.jpg /.png files and up to file size 500 kb can be uploaded as Company logo.");
                    e.preventDefault();
                }
            });
        }

        function onSuccess(e) {

            var files = e.files;
            if (e.operation == "upload") {
                //

            }
        }
        function onError(e) {

            var files = e.files;

            if (e.operation == "upload") {

                alert("Failed to uploaded " + files.length + " files");
            }
        }
    },

    ReportLogoUpload: function () {

        $("#filesForReportLogo").kendoUpload({
            upload: onUpload,
            multiple: false,
            success: onSuccess,
            error: onError,
            async: {
                saveUrl: "../DocumentUpload/UploadImageFile",
                removeUrl: "../DocumentUpload/RemoveImageFile",
                autoUpload: true
            }
        });

        function onUpload(e) {

            var files = e.files;
            $.each(files, function () {
                if ((this.extension != ".jpg") && (this.extension != ".png")) {
                    alert("Only .jpg/.png files and up to file size 500 kb can be uploaded as Company logo.");
                    e.preventDefault();
                }
            });
        }

        function onSuccess(e) {

            var files = e.files;
            if (e.operation == "upload") {
               

            }
        }
        function onError(e) {

            var files = e.files;

            if (e.operation == "upload") {

                alert("Failed to uploaded " + files.length + " files");
            }
        }
    },

};

var instituteDetailsHelper = {

    initiateInstituteDetails: function () {

        cesCommonHelper.GenerareHierarchyInstitueCombo("cmbParent");
        cesCommonHelper.GenerareAllActiveInstituteTypeCombo("cmbInstituteType");
        cesCommonHelper.GenerareAllActiveBoardCombo("cmbBoard");
        cesCommonHelper.GenerareAllActiveDistrictCombo("cmbDistrict");
        cesCommonHelper.GenerareAllActiveThanaCombo("cmbThana");
        cesCommonHelper.GenerareStaticStatusDropDown("cmbStatus");

        $("#btnSave").click(function () {
            instituteDetailsHelper.SaveInformation();
        });

        $("#btnClose").click(function () {
            instituteDetailsHelper.CloseInformation();
        });

        initiateDetailsManager.FullLogoUpload();
        initiateDetailsManager.ReportLogoUpload();

    },

    AddNewInformation: function () {

        AjaxManager.PopupWindow("divDetails", "Details Information", "80%");
        instituteDetailsHelper.ClearInformation();

    },

    SaveInformation: function () {
        if (instituteDetailsHelper.validator()) {
            initiateDetailsManager.SaveInstitute();
        }

    },

    CloseInformation: function () {

        $("#divDetails").data("kendoWindow").close();
        instituteDetailsHelper.ClearInformation();
        

    },

    ClearInformation: function () {
        $("#hdnId").val("0");
        $("#hdnCreateBy").val("");
        $("#hdnCreateDate").val("");
        $("#hdnUpdateBy").val("");
        $("#hdnUpdateDate").val("");

        $("#txtCode").val("");
        $("#txtName").val("");
        $("#txtAreaAddress").val("");
        $("#txtPhone").val("");
        $("#txtFax").val("");
        $("#txtEmail").val("");
        $("#txtTin").val("");
        $("#txtBin").val("");
        $("#txtWebsite").val("");
        $("#txtRegisterNo").val("");
        $("#txtShortName").val("");
        $("#cmbInstituteType").data("kendoComboBox").value("");
        $("#cmbBoard").data("kendoComboBox").value("");
        $("#cmbDistrict").data("kendoComboBox").value("");
        $("#cmbThana").data("kendoComboBox").value("");
        $("#cmbParent").data("kendoComboBox").value("");
        $("#cmbStatus").data("kendoDropDownList").value("1");
        $("#hfFullLogoPath").val("");
        $("#hfFullLogoPathForReport").val("");

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
        obj.InstituteId = $("#hdnId").val();
        obj.InstituteCode = $("#txtCode").val();
        obj.InstituteName = $("#txtName").val();
        obj.InstituteAddress = $("#txtAreaAddress").val();
        obj.InstituePhone = $("#txtPhone").val();
        obj.InstitueFax = $("#txtFax").val();
        obj.InstitueEmail = $("#txtEmail").val();
        obj.InstitueFullLogo = $("#hfFullLogoPath").val();
        obj.BoardId = $("#cmbBoard").data("kendoComboBox").value();
        obj.DistrictId = $("#cmbDistrict").data("kendoComboBox").value();
        obj.ThanaId = $("#cmbThana").data("kendoComboBox").value();
        obj.InstituteTypeId = $("#cmbInstituteType").data("kendoComboBox").value();
        obj.ParentInstitueId = $("#cmbParent").data("kendoComboBox").value();
        obj.InstitueTinNo = $("#txtTin").val();
        obj.InstitueBinNo = $("#txtBin").val();
        obj.WebSiteAddress = $("#txtWebsite").val();
        obj.RegistrationNumber = $("#txtRegisterNo").val();
        obj.InstitueShortName = $("#txtShortName").val();
        obj.InstitueReportLogo = $("#hfFullLogoPathForReport").val();
        obj.IsActive = $("#cmbStatus").data("kendoDropDownList").value();

        if (obj.ParentInstitueId == "") {
            obj.ParentInstitueId = 0;
        }
        if (obj.InstituteTypeId == "") {
            obj.InstituteTypeId = 0;
        }
        if (obj.ThanaId == "") {
            obj.ThanaId = 0;
        }
        if (obj.DistrictId == "") {
            obj.DistrictId = 0;
        }
        if (obj.BoardId == "") {
            obj.BoardId = 0;
        }

        if (obj.InstituteId == 0) {
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

        $("#hdnId").val(obj.InstituteId);
        $("#txtCode").val(obj.InstituteCode);
        $("#txtName").val(obj.InstituteName);
        $("#txtAreaAddress").val(obj.InstituteAddress);

        $("#cmbBoard").data("kendoComboBox").value(obj.BoardId);
        $("#cmbInstituteType").data("kendoComboBox").value(obj.InstituteTypeId);
        $("#cmbDistrict").data("kendoComboBox").value(obj.DistrictId);
        $("#cmbThana").data("kendoComboBox").value(obj.ThanaId);

        $("#txtPhone").val(obj.InstituePhone);
        $("#txtFax").val(obj.InstitueFax);
        $("#txtEmail").val(obj.InstitueEmail);
        $("#hfFullLogoPath").val(obj.InstitueFullLogo);
        $("#cmbParent").data("kendoComboBox").value(obj.ParentInstitueId);
        $("#txtTin").val(obj.InstitueTinNo);
        $("#txtBin").val(obj.InstitueBinNo);
        $("#txtWebsite").val(obj.WebSiteAddress);
        $("#txtRegisterNo").val(obj.RegistrationNumber);
        $("#txtShortName").val(obj.InstitueShortName);
        $("#hfFullLogoPathForReport").val(obj.InstitueReportLogo);
        if (obj.UpdateBy > 0) {
            $("#hdnUpdateBy").val(obj.UpdateBy);
            $("#hdnUpdateDate").val(obj.UpdateDate);
            $("#hdnCreateBy").val(obj.CreatedBy);
            $("#hdnCreateDate").val(obj.CreatedDate);
        }
        $("#cmbStatus").data("kendoDropDownList").value(obj.isActive);


    }

};
