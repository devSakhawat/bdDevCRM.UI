// <reference path="workflowsummary.js" />
// <reference path="workflowdetail.js" />
// <reference path="statedetails.js" />




var ActionDetailManager = {

  fetchNextStateComboBoxData: async function (menuId) {
    const jsonParams = $.param({ menuId });
    const serviceUrl = "/next-states-by-menu";

    try {
      const result = await AjaxManager.GetDataAsyncOrSyncronous(
        baseApi,
        serviceUrl,
        jsonParams,
        true,
        false
      );
      return result;
    } catch (jqXHR) {
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 0,
        message: jqXHR.status + " : " + jqXHR.responseText,
        type: 'error',
      });
      throw jqXHR;
    }
  },

  getSummaryGridDataSource: function (stateId) {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/get-action-summary-by-statusId?stateId=" + encodeURIComponent(stateId),
      requestType: "POST",
      async: true,
      modelFields: {
        createdDate: { type: "date" }
      },
      pageSize: 13,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Items",
      schemaTotal: "TotalCount"
    });
  },

  saveOrUpdate: async function () {
    //if (UserDetailsHelper.validateUserDetaisForm()) {

    // default
    var isToUpdateOrCreate = $("#actionID").val();
    var successmsg = isToUpdateOrCreate == 0 ? "New Data Saved Successfully." : "Information Updated Successfully.";
    var serviceUrl = isToUpdateOrCreate == 0 ? "/wf-action" : "/wf-action/" + isToUpdateOrCreate;
    var confirmmsg = isToUpdateOrCreate == 0 ? "Do you want to save information?" : "Do you want to update information?";
    var httpType = isToUpdateOrCreate > 0 ? "PUT" : "POST";

    AjaxManager.MsgBox(
      'info',
      'center',
      'Confirmation',
      confirmmsg,
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: async function ($noty) {
            $noty.close();
            var action = ActionDetailHelper.createActionData();
            console.log(action);
            var jsonObject = JSON.stringify(action);
            try {
              const responseData = await AjaxManager.PostDataAjax(baseApi, serviceUrl, jsonObject, httpType);
              ActionDetailHelper.clearActionForm();
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 3000,
                message: responseData === "Success" ? successmsg : responseData,
                type: 'success',
              });
              $("#gridSummaryAction").data("kendoGrid").dataSource.read();
            } catch (error) {
              let errorMessage = error.responseText || error.statusText || "Unknown error occurred";
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 0,
                message: `${error.status} : ${errorMessage}`,
                type: 'error'
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
  },

  deleteData: function (actionGridData) {
    // default
    console.log(actionGridData);
    if (actionGridData == null || actionGridData == undefined) return false;
   
    var successmsg = "Data Deleted Successfully.";
    var serviceUrl = "/wf-action/" + actionGridData.WfactionId;
    var confirmmsg = "Are you sure to Delete this action?";
    var httpType = "DELETE";

    AjaxManager.MsgBox(
      'info',
      'center',
      'Confirmation',
      confirmmsg,
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: async function ($noty) {
            $noty.close();
            var jsonObject = JSON.stringify(actionGridData);
            try {
              const responseData = await AjaxManager.PostDataAjax(baseApi, serviceUrl, jsonObject, httpType);
              ActionDetailHelper.clearActionForm();
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 3000,
                message: responseData === "Success" ? successmsg : responseData,
                type: 'success',
              });

              $("#gridSummaryAction").data("kendoGrid").dataSource.read();
            } catch (error) {
              let errorMessage = error.responseText || error.statusText || "Unknown error occurred";
              ToastrMessage.showToastrNotification({
                preventDuplicates: true,
                closeButton: true,
                timeOut: 0,
                message: `${error.status} : ${errorMessage}`,
                type: 'error'
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

  },

}


var ActionDetailHelper = {

  initActionDetails: function () {
    //ActionDetailHelper.initializeSummaryGrid();
    ActionDetailHelper.generateNextStateCombo();
  },

  generateActionGrid: function (stateId) {
    const gridOptions = {
      dataSource: [],
      autoBind: true,
      navigatable: true,
      //height: 700,
      width: "100%",
      scrollable: false, // Enable both horizontal and vertical scrolling
      resizable: false,
      filterable: false,
      sortable: false,
      columns: ActionDetailHelper.GenerateColumns(),
      editable: false,
      selectable: "row",
    };

    $("#gridSummaryAction").kendoGrid(gridOptions);

    const gridInstance = $("#gridSummaryAction").data("kendoGrid");
    if (gridInstance) {
      const dataSource = ActionDetailManager.getSummaryGridDataSource(stateId);
      gridInstance.setDataSource(dataSource);

      // Wait for data to load
      // After setting dataSource
      dataSource.fetch(function () {
        //console.log(dataSource.data());
      });
    }

  },

  GenerateColumns: function () {
    return columns = [

      { field: "WfactionId", hidden: true },
      { field: "WfstateId", hidden: true },
      /*      { field: "StateName", hidden: true },*/
      { field: "NextStateId", hidden: true },
      { field: "AcSortOrder", hidden: true },
      { field: "IsDefaultStart", hidden: true },
      { field: "IsClosed", hidden: true },
      { field: "ActionName", title: "Action Name", width: 70 },
      { field: "NextStateName", title: "Next State", width: 80 },
      { field: "EmailAlert", title: "Email", width: 40, template: "#= EmailAlert == 1 ? 'Yes' : 'No' #" },
      { field: "SmsAlert", title: "SMS", width: 40, template: "#= SmsAlert == 1 ? 'Yes' : 'No' #" },
      { field: "Edit", title: "#", filterable: false, width: 120, template: '<input type="button" class="k-button btn btn-outline-dark me-1" value="Edit" id="btnEditAction" onClick="ActionDetailHelper.clickEventForEditButton(event)"  /><input type="button" class="k-button btn btn-outline-danger" value="Delete" id="btnDeleteAction" onClick="ActionDetailHelper.clickEventForDeleteButton(event)"  />' },
    ];
  },

  // initialize all combo box.
  generateNextStateCombo: function () {
    $("#cmbNextState").kendoComboBox({
      placeholder: "Select Next State...",
      //optionLabel: "-- Select Next State --",
      dataTextField: "StateName",
      dataValueField: "WfstateId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  clearActionForm: function () {

    $("#txtStateName_Action").val('');
    $("#txtActionName").val('');
    var nextStateComboBox = $("#cmbNextState").data("kendoComboBox");
    if (nextStateComboBox) {
      nextStateComboBox.text('');
    }

    $("#numSortOrder").val("0");
    $('#chkIsEmail').prop('checked', false);
    $('#chkIsSms').prop('checked', false);

    //$("#stateID").val('');
    $("#actionID").val('');
    //actionDetailManager.clearActionValidatorMsg();
    $("#btnActionSaveOrUpdate").text("+ Add Item");
  },

  loadNextStateCombo: async function (menuId) {
    var nextStateComboBox = $("#cmbNextState").data("kendoComboBox");
    if (nextStateComboBox) {
      try {
        const nextStateComboDataSource = await ActionDetailManager.fetchNextStateComboBoxData(menuId);
        console.log(nextStateComboDataSource);
        return nextStateComboDataSource;
        //nextStateComboBox.setDataSource(nextStateComboDataSource);
      } catch (error) {
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: "Failed to load data" + ": " + error,
          type: 'error',
        });
      }
    }
  },

  createActionData: function () {
    var action = new Object();

    action.WfactionId = $("#actionID").val() == '' ? '0' : $("#actionID").val();
    action.WfstateId = $("#stateID").val() == '' ? '0' : $("#stateID").val();
    action.ActionName = $("#txtActionName").val();
    action.StateName = "";
    //action.NextStateId = $("#cmbNextState").val() == '' ? '0' : $("#cmbNextState").val();
    action.NextStateId = parseInt($("#cmbNextState").val()) || null;
    action.NextStateName = "";
    action.AcSortOrder = $("#numSortOrder").val();
    if (action.AcSortOrder == "") {
      action.AcSortOrder = 0;
    }

    if ($("#chkIsEmail").is(':checked') == true) {
      action.EmailAlert = 1;
    } else {
      action.EmailAlert = 0;
    }
    if ($("#chkIsSms").is(':checked') == true) {
      action.SmsAlert = 1;
    } else {
      action.SmsAlert = 0;
    }

    action.IsDefaultStart = "0";
    action.IsClosed = "0";
    return action;
  },

  editItem: async function (item) {
    $("#btnActionSaveOrUpdate").text("Update Item");
    var nextState = $("#cmbNextState").data("kendoComboBox");
    nextState.value(item.NextStateId);
    $("#txtStateName_Action").val(item.StateName);
    $("#txtActionName").val(item.ActionName);
    $("#numSortOrder").val(item.AcSortOrder);
    $('#chkIsEmail').attr('checked', item.EmailAlert == 1 ? true : false);
    $('#chkIsSms').attr('checked', item.SmsAlert == 1 ? true : false);

    $("#actionID").val(item.WfactionId);
  },

  clickEventForEditButton: function (event) {
    const gridInstance = $("#gridSummaryAction").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      ActionDetailHelper.editItem(selectedItem);
    }
  },

  clickEventForDeleteButton: function (event) {
    const gridInstance = $("#gridSummaryAction").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      ActionDetailManager.deleteData(selectedItem);
    }
  },

}

