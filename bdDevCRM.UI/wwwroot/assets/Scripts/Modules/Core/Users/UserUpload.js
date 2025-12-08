
var userUploadManager = {
    
    userUpload: function () {
        $("#files").kendoUpload({
            upload: onUpload,
            multiple: false,
            success: onSuccess,
            error: onError,
            async: {
                saveUrl: "../Users/UploadUserExcel",
                removeUrl: "../Users/RemoveUserExcel",
                autoUpload: true
            }
        });

        function onUpload(e) {
            var files = e.files;
            $.each(files, function () {
                if ((this.extension != ".xls") && (this.extension != ".xlsx")) {
                    alert("Only .xls/.xlsx files can be uploaded For Roster.");
                    e.preventDefault();
                }
            });
        }

        function onSuccess(e) {
            var files = e.files;
            if (e.operation == "upload") {
                userUploadManager.ImportUplodedData();
            }
        }
        function onError(e) {
            var files = e.files;

            if (e.operation == "upload") {
                alert("Failed to uploaded " + files.length + " files");
            }
        }
    },

    ImportUplodedData: function () {
        var jsonParam = "";
        var serviceUrl = "../Users/ImportUplodedData/";
        AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

        function onSuccess(jsonData) {

            if(jsonData=="Success") {
                AjaxManager.MsgBox('success', 'center', 'Success', 'Users Uploded Successfully.', [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); window.location.reload(); } }]);//window.location.href = "../Core.mvc/UserSettings";
            }
            else if (jsonData == "Data Partially upload") {
                AjaxManager.MsgBox('success', 'center', 'Success', 'Users Partially Uploded. Some Employee Code are not found in Personal Management System', [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); window.location.reload(); } }]);//window.location.href = "../Users/UserSettings";
            }
            else {
                //window.location.href = jsonData;
                AjaxManager.MsgBox('error', 'center', 'Error', jsonData, [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); } }]);
            }
            //var js = jsonData.split('^');


            //if (js.length > 1) {
            //    if (js[0] == "Success" && js[1] == "" && js[2] == "" && js[3] == "") {
            //        AjaxManager.MsgBox('success', 'center', 'Success', 'Users Uploded Successfully.', [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); window.location.href = "../Roster/RosterSettings"; } }]);
            //    }
            //    if (js[0] == "Success" && js[1] != "" && js[2] == "" && js[3] == "") {
            //        AjaxManager.MsgBox('success', 'center', 'Success', 'Users Uploded Partially. Some data are not uploded because of Date mismatch', [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); window.location.href = "../Roster/RosterSettings"; } }]);
            //    }
            //    if (js[0] == "Success" && js[1] == "" && js[2] != "" && js[3] == "") {
            //        AjaxManager.MsgBox('success', 'center', 'Success', 'Users Uploded Partially. Some data are not uploded because Employee Code mismatch', [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); window.location.href = "../Roster/RosterSettings"; } }]);
            //    }
                
            //    if (js[0] == "Success" && js[1] != "" && js[2] != "" && js[3] == "") {
            //        AjaxManager.MsgBox('success', 'center', 'Success', 'Users Uploded Partially. Some data are not uploded because Date mismatch and Employee Code mismatch', [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); window.location.href = "../Roster/RosterSettings"; } }]);
            //    }
                



            //} else {
            //    AjaxManager.MsgBox('error', 'center', 'Error', jsonData, [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); } }]);
            //}
        }
        function onFailed(error) {
            AjaxManager.MsgBox('error', 'center', 'Error', error.statusText, [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); } }]);
        }
    }
};

var userUploadHelper = {

};