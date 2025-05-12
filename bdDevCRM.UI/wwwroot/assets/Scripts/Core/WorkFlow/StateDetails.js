// <reference path="workflowsummary.js" />
// <reference path="workflowdetail.js" />
// <reference path="actiondetail.js" />


var StateDetailsManager = {

  fetchMenusForDDL: function () {
    let branches = [];
    var jsonParams = "";
    var serviceUrl = "/menus-4-ddl";

    return new Promise(function (resolve, reject) {
      function onSuccess(jsonData) {
        branches = jsonData;
        resolve(branches);
      }

      function onFailed(jqXHR, textStatus, errorThrown) {
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          //message: jqXHR.responseJSON?.message + "(" + jqXHR.responseJSON?.statusCode + ")",
          message: jqXHR.status + " : " + jqXHR.responseText,
          type: 'error',
        });
        reject(errorThrown);
      }

      AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, true, false, onSuccess, onFailed);
    });
  },

  saveOrUpdate: function () {
    //if (UserDetailsHelper.validateUserDetaisForm()) {

    // default
    var isToUpdateOrCreate = $("#stateID").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    var serviceUrl = isToUpdateOrCreate == 0 ? "/workflow" : "/workflow/" + isToUpdateOrCreate;
    var confmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";
    var httpType = isToUpdateOrCreate > 0 ? "PUT" : "POST";

    AjaxManager.MsgBox(
      'info',
      'center',
      'Confirmation',
      confmsg,
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: function ($noty) {
            $noty.close();
            var objWfState = StateDetailsHelper.createStateInfo();

            var jsonObject = JSON.stringify(objWfState);
            var responseData = AjaxManager.PostDataForDotnetCoreWithHttp(baseApi, serviceUrl, jsonObject, httpType, onSuccess, onFailed);
            function onSuccess(responseData, textStatus, xhr) {
              console.log("Status Code:", xhr); // 200
              StateDetailsHelper.clearStateForm();

              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 0,
                //message: successmsg,
                message: responseData == "Success" ? successmsg : responseData,
                type: 'success',
              });
              $("#gridSummary").data("kendoGrid").dataSource.read();
            }

            function onFailed(jqXHR, textStatus, errorThrown) {
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 0,
                message: jqXHR.status + " : " + jqXHR.responseText,
                type: 'error',
              });
            }

          }
        },
        {
          addClass: 'btn',
          text: 'Cancel',
          onClick: function ($noty) {
            $noty.close();
          }
        },
      ]
      , 0
    );

    //}
    //function onSuccess(jsonData) {
    //  //var js = jsonData.split('"');
    //  if (jsonData == "Success") {
    //    AjaxManager.MsgBox('success', 'center', 'Success:', 'User Saved Successfully',
    //      [{
    //        addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
    //          $noty.close();
    //          UserDetailsHelper.clearUserForm();
    //          $("#gridUser").data("kendoGrid").dataSource.read();
    //          $("#btnSave").text("Save");
    //          $("#cmbCompanyNameDetails").focus();
    //        }
    //      }]);
    //  }
    //  else {
    //    AjaxManager.MsgBox('warning', 'center', 'Failed', jsonData,
    //      [{
    //        addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
    //          $noty.close();
    //        }
    //      }]);
    //  }
    //}

    //function onFailed(error) {
    //  AjaxManager.MsgBox('error', 'center', 'Failed', error.statusText,
    //    [{
    //      addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
    //        $noty.close();
    //      }
    //    }]);
    //}
  }
}


var StateDetailsHelper = {

  initStateDetails: async function () {
    StateDetailsHelper.generateMenuCombo();
    StateDetailsHelper.generateIsCloseCombo();
    await this.populateMenuCombo();
  },

  // initialize all combo box.
  generateMenuCombo: function () {
    $("#cmbMenu").kendoComboBox({
      placeholder: "Select Menu...",
      dataTextField: "MenuName",
      dataValueField: "MenuId",
      dataSource: [],
    });
  },

  populateMenuCombo: async function () {
    try {
      const menusForDDL = await StateDetailsManager.fetchMenusForDDL();

      let menuComboBox = $("#cmbMenu").data("kendoComboBox");
      menuComboBox.setDataSource(menusForDDL);
    } catch (error) {
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 0,
        message: "Failed to load menu data" + ": " + error,
        type: 'error',
      });
    }
  },

  generateIsCloseCombo: function () {
    $("#cmbIsClose").kendoComboBox({
      placeholder: "Select from List",
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "Open", value: "0" },
        { text: "Possible Close", value: "1" },
        { text: "Close", value: "2" },
        { text: "Destroyed", value: "3" },
        { text: "Draft", value: "4" },
        { text: "Deligated", value: "5" },
        { text: "Published", value: "6" },
        { text: "Extended", value: "7" },
      ],
      filter: "contains",
      suggest: true
    });
  },

  createStateInfo: function () {
    var state = new Object();
    state.MenuID = $("#cmbMenu").data("kendoComboBox").value() == '' ? '0' : $("#cmbMenu").data("kendoComboBox").value();
    state.MenuName = $("#cmbMenu").data("kendoComboBox").text();
    //// using jQuery
    //state.MenuID = $("#cmbMenu").val() == '' ? '0' : $("#cmbMenu").val();

    //state.StateName = $("#txtStateName").val() == '' ? '0' : $("#stateID").val();
    state.WFStateId = $("#stateID").val() == '' ? '0' : $("#stateID").val();
    state.StateName = $("#txtStateName").val();
    state.IsClosed = $("#cmbIsClose").data("kendoComboBox").value() == '' ? '0' : $("#cmbIsClose").data("kendoComboBox").value();

    if ($("#chkIsDefault").is(':checked') == true) {
      state.IsDefaultStart = true;
    } else {
      state.IsDefaultStart = false;
    }
    return state;
  },

  clearStateForm: function () {
    $("#btnSaveOrUpdate").text('Add Item');
    $("#stateID").val(0);
    $("#cmbMenu").val('');
    $("#cmbMenu").data("kendoComboBox").text('');
    $("#txtStateName").val('');
    $("#cmbIsClose").data("kendoComboBox").value(0);
    $("#chkIsDefault").prop("checked", false);

    $("#gridSummaryAction").empty();
    $("#gridSummaryAction").kendoGrid();

    //ActionDetailHelper.clearActionForm();
  }


}


