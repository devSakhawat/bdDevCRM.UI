/// <reference path="../../common/common.js" />
/// <reference path="intakemonth.js" />
/// <reference path="intakemonthsummary.js" />

var IntakeMonthDetailsManager = {
  saveOrUpdateItem: async function () {
    try {
      const id = $("#intakeMonthId").val() || 0;
      const isCreate = id == 0;
      const serviceUrl = isCreate ? "/intake-month" : `/intake-month-saveORupdate/${id}`;
      const httpType = "POST";
      const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
      const successMsg = isCreate ? "New data saved successfully." : "Information updated successfully.";

      const modelDto = IntakeMonthDetailsHelper.createItem();
      if (!modelDto) {
        throw new Error("Failed to create DTO object");
      }

      CommonManager.MsgBox(
        "info",
        "center", 
        "Confirmation",
        confirmMsg,
        [{
          addClass: "btn btn-primary",
          text: "Yes",
          onClick: async function ($noty) {
            $noty.close();
            const jsonObject = JSON.stringify(modelDto);
            try {
              const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, jsonObject, httpType);
              if (response && (response.IsSuccess === true || response === "Success")) {
                ToastrMessage.showSuccess(successMsg);
                IntakeMonthDetailsHelper.clearForm();
                const windowId = "IntakeMonthPopUp";
                CommonManager.closeKendoWindow(windowId);
                $("#gridSummaryIntakeMonth").data("kendoGrid").dataSource.read();
              } else {
                throw new Error(response.Message || response || "Unknown error occurred");
              }
            } catch (err) {
              VanillaApiCallManager.handleApiError(err);
            }
          }
        },
        { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }],
        0
      );
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
    }
  },

  deleteItem: function (gridItem) {
    if (!gridItem) return;

    const serviceUrl = `/intake-month/${gridItem.IntakeMonthId}`;

    CommonManager.MsgBox(
      "info",
      "center",
      "Confirmation", 
      "Are you sure to delete this intake month?",
      [{
        addClass: "btn btn-primary",
        text: "Yes",
        onClick: async function ($noty) {
          $noty.close();
          try {
            const response = await VanillaApiCallManager.delete(baseApi, serviceUrl);

            if (response && response.IsSuccess === true) {
              ToastrMessage.showSuccess("Data deleted successfully.");
              IntakeMonthDetailsHelper.clearForm();
              $("#gridSummaryIntakeMonth").data("kendoGrid").dataSource.read();
            } else {
              throw new Error(response.Message || "Delete operation failed.");
            }
          } catch (err) {
            console.error("=== Delete Error ===", err);
            VanillaApiCallManager.handleApiError(err);
          }
        }
      },
      { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }],
      0
    );
  }
};

var IntakeMonthDetailsHelper = {
  intakeMonthInit: function () {
    CommonManager.initializeKendoWindow("#IntakeMonthPopUp", "Intake Month Details", "60%");
  },

  openIntakeMonthPopUp: function () {
    IntakeMonthDetailsHelper.clearForm();
    const windowId = "IntakeMonthPopUp";
    CommonManager.openKendoWindow(windowId, "Intake Month Details", "60%");
    CommonManager.appandCloseButton(windowId);
  },

  clearForm: function () {
    CommonManager.clearFormFields("#IntakeMonthForm");
    $("#btnIntakeMonthSaveOrUpdate").text("+ Add Intake Month");
    $("#intakeMonthId").val(0);
    $("#monthName").val("");
    $("#monthCode").val("");
    $("#monthNumber").val("");
    $("#description").val("");
    $("#chkIsActiveIntakeMonth").prop("checked", false);
    $("#btnIntakeMonthSaveOrUpdate").prop("disabled", false);
  },

  createItem: function () {
    const dto = {
      IntakeMonthId: parseInt($("#intakeMonthId").val()) || 0,
      MonthName: $("#monthName").val()?.trim() || "",
      MonthCode: $("#monthCode").val()?.trim() || null,
      MonthNumber: parseInt($("#monthNumber").val()) || 0,
      Description: $("#description").val()?.trim() || null,
      IsActive: document.querySelector("#chkIsActiveIntakeMonth")?.checked || false
    };

    return dto;
  },

  populateObject: function (item) {
    this.clearForm();
    $("#btnIntakeMonthSaveOrUpdate").text("Update Intake Month");

    $("#intakeMonthId").val(item.IntakeMonthId);
    $("#monthName").val(item.MonthName || "");
    $("#monthCode").val(item.MonthCode || "");
    $("#monthNumber").val(item.MonthNumber || "");
    $("#description").val(item.Description || "");
    $("#chkIsActiveIntakeMonth").prop("checked", item.IsActive || false);
  }
};