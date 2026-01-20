/// <reference path="../../common/common.js" />
/// <reference path="paymentmethod.js" />
/// <reference path="paymentmethodsummary.js" />

var PaymentMethodDetailsManager = {
  saveOrUpdateItem: async function () {
    try {
      const id = $("#paymentMethodId").val() || 0;
      const isCreate = id == 0;
      const serviceUrl = isCreate ? "/payment-method" : `/payment-method-saveORupdate/${id}`;
      const httpType = "POST";
      const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
      const successMsg = isCreate ? "New data saved successfully." : "Information updated successfully.";

      const modelDto = PaymentMethodDetailsHelper.createItem();
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
            CommonManager.showProcessingOverlay("Saving payment method information...");
            
            const jsonObject = JSON.stringify(modelDto);
            try {
              const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, jsonObject, httpType);
              
              // Hide processing overlay
              CommonManager.hideProcessingOverlay();
              
              if (response && (response.IsSuccess === true || response === "Success")) {
                ToastrMessage.showSuccess(successMsg);
                PaymentMethodDetailsHelper.clearForm();
                const windowId = "PaymentMethodPopUp";
                CommonManager.closeKendoWindow(windowId);
                $("#gridSummaryPaymentMethod").data("kendoGrid").dataSource.read();
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

    const serviceUrl = `/payment-method/${gridItem.PaymentMethodId}`;

    CommonManager.MsgBox(
      "info",
      "center",
      "Confirmation",
      "Are you sure to delete this payment method?",
      [{
        addClass: "btn btn-primary",
        text: "Yes",
        onClick: async function ($noty) {
          $noty.close();
          
          // Show processing overlay for delete
          CommonManager.showProcessingOverlay("Deleting payment method...");
          
          try {
            const response = await VanillaApiCallManager.delete(baseApi, serviceUrl);

            // Hide processing overlay
            CommonManager.hideProcessingOverlay();

            if (response && response.IsSuccess === true) {
              ToastrMessage.showSuccess("Data deleted successfully.");
              PaymentMethodDetailsHelper.clearForm();
              $("#gridSummaryPaymentMethod").data("kendoGrid").dataSource.read();
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

var PaymentMethodDetailsHelper = {
  paymentMethodInit: function () {
    CommonManager.initializeKendoWindow("#PaymentMethodPopUp", "Payment Method Details", "70%");
  },

  openPaymentMethodPopUp: function () {
    PaymentMethodDetailsHelper.clearForm();
    const windowId = "PaymentMethodPopUp";
    CommonManager.openKendoWindow(windowId, "Payment Method Details", "70%");
    CommonManager.appandCloseButton(windowId);
  },

  clearForm: function () {
    CommonManager.clearFormFields("#PaymentMethodForm");
    $("#btnPaymentMethodSaveOrUpdate").text("+ Add Payment Method");
    $("#paymentMethodId").val(0);
    $("#paymentMethodName").val("");
    $("#paymentMethodCode").val("");
    $("#processingFee").val("");
    $("#processingFeeType").val("");
    $("#description").val("");
    $("#chkIsOnlinePayment").prop("checked", false);
    $("#chkIsActivePaymentMethod").prop("checked", false);
    $("#btnPaymentMethodSaveOrUpdate").prop("disabled", false);
  },

  createItem: function () {
    const dto = {
      PaymentMethodId: parseInt($("#paymentMethodId").val()) || 0,
      PaymentMethodName: $("#paymentMethodName").val()?.trim() || "",
      PaymentMethodCode: $("#paymentMethodCode").val()?.trim() || null,
      Description: $("#description").val()?.trim() || null,
      ProcessingFee: parseFloat($("#processingFee").val()) || null,
      ProcessingFeeType: $("#processingFeeType").val()?.trim() || null,
      IsOnlinePayment: document.querySelector("#chkIsOnlinePayment")?.checked || false,
      IsActive: document.querySelector("#chkIsActivePaymentMethod")?.checked || false
    };

    return dto;
  },

  populateObject: function (item) {
    this.clearForm();
    $("#btnPaymentMethodSaveOrUpdate").text("Update Payment Method");

    $("#paymentMethodId").val(item.PaymentMethodId);
    $("#paymentMethodName").val(item.PaymentMethodName || "");
    $("#paymentMethodCode").val(item.PaymentMethodCode || "");
    $("#processingFee").val(item.ProcessingFee || "");
    $("#processingFeeType").val(item.ProcessingFeeType || "");
    $("#description").val(item.Description || "");
    $("#chkIsOnlinePayment").prop("checked", item.IsOnlinePayment || false);
    $("#chkIsActivePaymentMethod").prop("checked", item.IsActive || false);
  }
};