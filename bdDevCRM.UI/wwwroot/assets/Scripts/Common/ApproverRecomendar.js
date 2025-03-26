ApproverRecomendarHelper = {
    ShowApprovers: function (container, approvers) {
       if (approvers.length > 0) {
            var htmls = "";
            htmls += "<input type='hidden' id='hdnTotalAppro' value='" + approvers.length + "'>";
            for (var i = 0; i < approvers.length; i++) {
                htmls += "<b>APPROVER : " + (i + 1) + "</b><br>";
                htmls += "<span> Employee ID : " + approvers[i].ApproverEmployeeId + " ,&nbsp; Name : " + approvers[i].ApproverName + "(" + approvers[i].ApproverShortName + ")" + "</span><br>";
                htmls += "<span> Designation : " + approvers[i].ApproverDesignation + " ,&nbsp; Company : " + approvers[i].ApproverCompany + "</span><br>";
                htmls += "<input type='hidden' id='appro-" + (i + 1) + "' value='" + approvers[i].ApproverId + "'>";
                htmls += "Approve : <input type='checkBox' id='chkAppro-" + (i + 1) + "' disabled='disabled' ></br>";
                htmls += "Remarks : <input type='text' id='appro-comments-" + (i + 1) + "' class='k-textbox'/></br>";
                htmls += "<input type='hidden' id='assignApproId-" + (i + 1) + "' value='" + approvers[i].AssignApproverId + "'>";
                htmls += "<input type='hidden' id='approvedDate-" + (i + 1) + "' value='" + approvers[i].ApprovedDate + "'>";
                htmls += "<input type='hidden' id='hdnRemarksIdApro-" + (i + 1) + "' value='" + approvers[i].RemarksId + "'>";
            }
           
            $("#" + container).html(htmls);
            for (i = 0; i < approvers.length; i++) {
                if (approvers[i].IsOpen == false || CurrentUser.EmployeeId != approvers[i].ApproverId) {
                    $("#" + 'appro-comments-' + (i + 1)).val(approvers[i].Comments);
                    $("#" + 'appro-comments-' + (i + 1)).attr("disabled", "disabled");
                    $("#" + 'chkAppro-' + (i + 1)).prop("checked", !approvers[i].IsOpen);
                    $("#" + 'chkAppro-' + (i + 1)).prop("disabled", true);
                }
            }

        } else {
            $("#" + container).html("No Approver found for the Applicant");
        }

    },
    ShowRecondars: function (container, recomendars) {
        if (recomendars.length > 0) {
            var htmlsRecomendars = "";
            htmlsRecomendars += "<input type='hidden' id='hdnTotalRecom' value='" + recomendars.length + "'>";
            for (var j = 0; j < recomendars.length; j++) {
                htmlsRecomendars += "<b>RECOMMENDAR: " + (j + 1) + "</b><br>";
                htmlsRecomendars += "<span> Employee ID:" + recomendars[j].ApproverEmployeeId + "&nbsp; Name:" + recomendars[j].ApproverName + "(" + recomendars[j].ApproverShortName + ")" + "</span><br>";
                htmlsRecomendars += "<span> Designation:" + recomendars[j].ApproverDesignation + "&nbsp; Company:" + recomendars[j].ApproverCompany + "</span><br>";
                htmlsRecomendars += "<input type='hidden' id='recom-" + (j + 1) + "' value='" + recomendars[j].ApproverId + "'>";
                htmlsRecomendars += "Recommend:<input type='checkBox' id='chkRecom-" + (j + 1) + "'  disabled='disabled' ></br>";
                htmlsRecomendars += "Remarks:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type='text' id='recom-comments-" + (j + 1) + "' class='k-textbox'/></br>";
                htmlsRecomendars += "<input type='hidden' id='assignRecomId-" + (j + 1) + "' value='" + recomendars[j].AssignApproverId + "'>";
                htmlsRecomendars += "<input type='hidden' id='recomDate-" + (j + 1) + "' value='" + recomendars[j].ApprovedDate + "'>";
                htmlsRecomendars += "<input type='hidden' id='hdnRemarksIdRecom-" + (j + 1) + "' value='" + recomendars[j].RemarksId + "'>";

            }
            $("#" + container).html(htmlsRecomendars);
            debugger;
            for (var i = 0; i < recomendars.length; i++) {
                if (recomendars[i].IsOpen == false || CurrentUser.EmployeeId != recomendars[i].ApproverId) {
                    $("#" + 'recom-comments-' + (i + 1)).val(recomendars[i].Comments);
                    $("#" + 'recom-comments-' + (i + 1)).attr("disabled", "disabled");
                    $("#" + 'chkRecom-' + (i + 1)).prop("checked",!recomendars[i].IsOpen);
                    $("#" + 'chkRecom-' + (i + 1)).prop("disabled", true);
                }
            }
        } else {
            $("#" + container).html("No Recomendar found for the Applicant");
        }
    },

    GetApproverRecomendars: function (applicationId) {
        var totalAppro = $("#hdnTotalAppro").val();
        var totalRecom = $("#hdnTotalRecom").val();
        var approvers = [];
        if (totalAppro > 0) {
            for (var i = 1; i <= totalAppro; i++) {
                var appro = new Object();
                appro.RemarksId = $("#" + 'hdnRemarksIdApro-' + i).val();
                appro.ApproverId = $("#" + 'appro-' + i).val();
                appro.Comments = $("#" + 'appro-comments-' + i).val();
                //appro.IsOpen = appro.Comments == ""; 
                appro.IsOpen = $("#" + 'chkAppro-' + (i + 1)).is(":checked");
                appro.ApplicationId = applicationId;
                appro.AssignApproverId = $("#" + 'assignApproId-' + i).val();
                if (!appro.IsOpen && appro.ApproverId == CurrentUser.EmployeeId) {
                    appro.ApprovedDate = new Date();
                } else {
                    var date = $("#" + 'approvedDate-' + i).val();
                    appro.ApprovedDate = new Date();
                }
                approvers.push(appro);
            }
        }
        var recomendars = [];
        if (totalRecom > 0) {
            for (i = 1; i <= totalRecom; i++) {
                var recom = new Object();
                recom.RemarksId = $("#" + 'hdnRemarksIdRecom-' + i).val();
                recom.ApproverId = $("#" + 'recom-' + i).val();
                recom.Comments = $("#" + 'recom-comments-' + i).val();
                // recom.IsOpen = recom.Comments == "";
                recom.IsOpen = $("#" + 'chkRecom-' + (i + 1)).is(":checked");
                recom.ApplicationId = applicationId;
                recom.AssignApproverId = $("#" + 'assignRecomId-' + i).val();
                if (!recom.IsOpen && recom.ApproverId == CurrentUser.EmployeeId) {
                    recom.ApprovedDate = new Date();
                }
                else {
                    var rdate = $("#" + 'recomDate-' + i).val();
                    recom.ApprovedDate = new Date();
                    
                }
                recomendars.push(recom);
            }
        }
        var finalObject = new Object();
        finalObject.Approvers = approvers;
        finalObject.Recomendars = recomendars;
        return finalObject;
    }
};