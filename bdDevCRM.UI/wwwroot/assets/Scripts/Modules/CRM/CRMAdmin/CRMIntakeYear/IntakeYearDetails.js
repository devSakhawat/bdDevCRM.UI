/// <reference path="../../common/common.js" />
/// <reference path="intakeyear.js" />
/// <reference path="intakeyearsummary.js" />

var IntakeYearDetailsManager = {
  saveOrUpdateItem: async function () {
    try {
      const id = $("#intakeYearId").val() || 0;
      const isCreate = id == 0;
      const serviceUrl = isCreate ? "/intake-year" : `/intake-year-saveORupdate/${id}`;
      const httpType = "POST";
      const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
      const successMsg = isCreate ? "New data saved successfully." : "Information updated successfully.";

      const modelDto = IntakeYearDetailsHelper.createItem();
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
            
            // Show processing overlay
            CommonManager.showProcessingOverlay("Saving intake year information...");
            
            const jsonObject = JSON.stringify(modelDto);
            try {
              const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, jsonObject, httpType);
              
              // Hide processing overlay
              CommonManager.hideProcessingOverlay();
              
              if (response && (response.IsSuccess === true || response === "Success")) {
                ToastrMessage.showSuccess(successMsg);
                IntakeYearDetailsHelper.clearForm();
                const windowId = "IntakeYearPopUp";
                CommonManager.closeKendoWindow(windowId);
                $("#gridSummaryIntakeYear").data("kendoGrid").dataSource.read();
              } else {
                throw new Error(response.Message || response || "Unknown error occurred");
              }
            } catch (err) {
              // Hide processing overlay on error
              CommonManager.hideProcessingOverlay();
              VanillaApiCallManager.handleApiError(err);
            }
          }
        },
        { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }],
        0
      );
    } catch (error) {
      CommonManager.hideProcessingOverlay();
      VanillaApiCallManager.handleApiError(error);
    }
  },

  deleteItem: function (gridItem) {
    if (!gridItem) return;

    const serviceUrl = `/intake-year/${gridItem.IntakeYearId}`;

    CommonManager.MsgBox(
      "info",
      "center",
      "Confirmation",
      "Are you sure to delete this intake year?",
      [{
        addClass: "btn btn-primary",
        text: "Yes",
        onClick: async function ($noty) {
          $noty.close();
          
          // Show processing overlay for delete
          CommonManager.showProcessingOverlay("Deleting intake year...");
          
          try {
            const response = await VanillaApiCallManager.delete(baseApi, serviceUrl);

            // Hide processing overlay
            CommonManager.hideProcessingOverlay();

            if (response && response.IsSuccess === true) {
              ToastrMessage.showSuccess("Data deleted successfully.");
              IntakeYearDetailsHelper.clearForm();
              $("#gridSummaryIntakeYear").data("kendoGrid").dataSource.read();
            } else {
              throw new Error(response.Message || "Delete operation failed.");
            }
          } catch (err) {
            // Hide processing overlay on error
            CommonManager.hideProcessingOverlay();
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

var IntakeYearDetailsHelper = {
  intakeYearInit: function () {
    CommonManager.initializeKendoWindow("#IntakeYearPopUp", "Intake Year Details", "60%");
  },

  openIntakeYearPopUp: function () {
    IntakeYearDetailsHelper.clearForm();
    const windowId = "IntakeYearPopUp";
    CommonManager.openKendoWindow(windowId, "Intake Year Details", "60%");
    CommonManager.appandCloseButton(windowId);
  },

  clearForm: function () {
    CommonManager.clearFormFields("#IntakeYearForm");
    $("#btnIntakeYearSaveOrUpdate").text("+ Add Intake Year");
    $("#intakeYearId").val(0);
    $("#yearName").val("");
    $("#yearCode").val("");
    $("#yearValue").val("");
    $("#description").val("");
    $("#chkIsActiveIntakeYear").prop("checked", false);
    $("#btnIntakeYearSaveOrUpdate").prop("disabled", false);
  },

  createItem: function () {
    const dto = {
      IntakeYearId: parseInt($("#intakeYearId").val()) || 0,
      YearName: $("#yearName").val()?.trim() || "",
      YearCode: $("#yearCode").val()?.trim() || null,
      YearValue: parseInt($("#yearValue").val()) || 0,
      Description: $("#description").val()?.trim() || null,
      IsActive: document.querySelector("#chkIsActiveIntakeYear")?.checked || false
    };

    return dto;
  },

  populateObject: function (item) {
    this.clearForm();
    $("#btnIntakeYearSaveOrUpdate").text("Update Intake Year");

    $("#intakeYearId").val(item.IntakeYearId);
    $("#yearName").val(item.YearName || "");
    $("#yearCode").val(item.YearCode || "");
    $("#yearValue").val(item.YearValue || "");
    $("#description").val(item.Description || "");
    $("#chkIsActiveIntakeYear").prop("checked", item.IsActive || false);
  }
};