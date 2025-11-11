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
    const id = $("#stateID").val() || 0;
    const isCreate = id == 0;
    const serviceUrl = isCreate ? "/workflow" : `/workflow/${id}`;
    const httpType = isCreate ? "POST" : "PUT";
    const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
    const successMsg = isCreate ? "New data saved successfully." : "Information updated successfully.";

    const modelDto = StateDetailsHelper.createStateInfo();
    if (!modelDto) {
      throw new Error("Failed to create DTO object");
    }

    debugger;
    CommonManager.MsgBox(
      "info",
      "center",
      "Confirmation",
      confirmMsg,
      [
        {
        addClass: "btn btn-primary",
        text: "Yes",
        onClick: async function ($noty) {
          $noty.close();
          var jsonObject = JSON.stringify(modelDto);
          try {
            const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, jsonObject, httpType);
            if (response && (response.IsSuccess === true || response === "Success")) {
              ToastrMessage.showSuccess(successMsg);
              StateDetailsHelper.clearStateForm();
              const grid = $("#gridSummary").data("kendoGrid");
              if (grid) {
                grid.dataSource.read();
              } else {
                console.error("Grid not found with ID: #gridSummary");
              }
            } else {
              throw new Error(response.Message || response || "Unknown error occurred");
            }
          } catch (err) {
            console.log(err);
            VanillaApiCallManager?.handleApiError?.(err);
          }
        }
      },
        { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }
      ],
      0
    );
    
  },


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

  generateIsCloseCombo: async function (elementSelector = "#cmbIsClose") {
    try {
      const $el = $(elementSelector);
      if (!$el.length) return;

      // fetch data
      const data = [
        { ClosingStateName: "Select Closing Status", closingStateId: "0" },
        { ClosingStateName: "Open", closingStateId: "1" },
        { ClosingStateName: "Possible Close", closingStateId: "2" },
        { ClosingStateName: "Close", closingStateId: "3" },
        { ClosingStateName: "Destroyed", closingStateId: "4" },
        { ClosingStateName: "Draft", closingStateId: "5" },
        { ClosingStateName: "Deligated", closingStateId: "6" },
        { ClosingStateName: "Published", closingStateId: "7" },
        { ClosingStateName: "Extended", closingStateId: "8" },
      ];

      // destroy previous widget if any
      const existing = $el.data("kendoDropDownList");
      if (existing) { existing.destroy(); $el.off(); }

      // init kendo dropdown (without optionLabel)
      $el.kendoDropDownList({
        dataTextField: "ClosingStateName",
        dataValueField: "closingStateId",
        dataSource: data,
        valuePrimitive: true,
        value: data[0]?.closingStateId || 0,
        filter: "contains",
        suggest: true
      });


      // if admin then set deafult falue otherwise set first sequence of users state data.
      const dd = $el.data("kendoDropDownList");
      if (dd) dd.value(data[0]?.WfStateId || 0);

    } catch (err) {
      console.error("Error populating status dropdown:", err);
      if (typeof VanillaApiCallManager !== "undefined") {
        VanillaApiCallManager.handleApiError(err);
      }
    }
  },

  createStateInfo: function () {
    var state = new Object();
    state.MenuID = $("#cmbMenu").data("kendoComboBox").value() == '' ? '0' : $("#cmbMenu").data("kendoComboBox").value();
    state.MenuName = $("#cmbMenu").data("kendoComboBox").text();
    //// using jQuery
    //state.MenuID = $("#cmbMenu").val() == '' ? '0' : $("#cmbMenu").val();

    state.Sequence = $("#txtSequenceNo").val();
    state.WFStateId = $("#stateID").val() == '' ? '0' : $("#stateID").val();
    state.StateName = $("#txtStateName").val();
    state.IsClosed = $("#cmbIsClose").data("kendoDropDownList").value() == '' ? '0' : $("#cmbIsClose").data("kendoDropDownList").value();

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
    $("#txtSequenceNo").val('');
    $("#cmbIsClose").data("kendoDropDownList").value(0);
    $("#chkIsDefault").prop("checked", false);

    $("#gridSummaryAction").empty();
    $("#gridSummaryAction").kendoGrid();

    //ActionDetailHelper.clearActionForm();
  }


}


