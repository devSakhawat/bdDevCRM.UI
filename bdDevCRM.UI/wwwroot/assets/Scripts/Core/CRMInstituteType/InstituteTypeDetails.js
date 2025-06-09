/// <reference path="../../common/common.js" />
/// <reference path="instituteType.js" />
/// <reference path="InstituteTypeSummary.js" />

/// <reference path=""


/* =========================================================
   InstituteTypeDetailsManager : Save / Update / Delete
=========================================================*/

var InstituteTypeDetailsManager = {

  /* -------- Save ⬌ Update -------- */
  saveOrUpdateItem: async function () {
    const id = $("#InstituteTypeId").val() || 0;
    const isCreate = id == 0;
    const serviceUrl = isCreate ? "/crm-institutetype" : `/crm-institutetype/${id}`;
    const httpType = isCreate ? "POST" : "PUT";
    const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
    const successMsg = isCreate ? "New data saved successfully." : "Information updated successfully.";

    AjaxManager.MsgBox(
      "info",
      "center",
      "Confirmation",
      confirmMsg,
      [{
        addClass: "btn btn-primary",
        text: "Yes",
        onClick: async function ($noty) {
          $noty.close();
          const dto = InstituteTypeDetailsHelper.createItem();
          try {
            await AjaxManager.PostDataAjax(
              baseApi, serviceUrl, JSON.stringify(dto), httpType);

            ToastrMessage.showToastrNotification({
              preventDuplicates: true, closeButton: true,
              timeOut: 3000, message: successMsg, type: "success"
            });

            InstituteTypeDetailsHelper.clearForm();
            $("#gridSummaryInstituteType").data("kendoGrid").dataSource.read();
          } catch (err) {
            const msg = err.responseText || err.statusText || "Unknown error";
            ToastrMessage.showToastrNotification({
              preventDuplicates: true, closeButton: true, timeOut: 0,
              message: `${err.status} : ${msg}`, type: "error"
            });
          }
        }
      },
      { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }],
      0 /* modal */
    );
  },

  /* -------- Delete -------- */
  deleteItem: function (gridItem) {
    if (!gridItem) return;

    const serviceUrl = `/crm-institutetype/${gridItem.InstituteTypeId}`;
    AjaxManager.MsgBox(
      "warning",
      "center",
      "Confirmation",
      "Are you sure to delete this instituteType?",
      [{
        addClass: "btn btn-primary",
        text: "Yes",
        onClick: async function ($noty) {
          $noty.close();
          try {
            await AjaxManager.PostDataAjax(
              baseApi, serviceUrl, JSON.stringify(gridItem), "DELETE");

            InstituteTypeDetailsHelper.clearForm();
            ToastrMessage.showToastrNotification({
              preventDuplicates: true, closeButton: true, timeOut: 3000,
              message: "Data deleted successfully.", type: "success"
            });
            $("#gridSummaryInstituteType").data("kendoGrid").dataSource.read();
          } catch (err) {
            const msg = err.responseText || err.statusText || "Unknown error";
            ToastrMessage.showToastrNotification({
              preventDuplicates: true, closeButton: true, timeOut: 0,
              message: `${err.status} : ${msg}`, type: "error"
            });
          }
        }
      },
      { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }],
      0
    );
  }

};

/* =========================================================
   InstituteTypeDetailsHelper : Form Utility
=========================================================*/
var InstituteTypeDetailsHelper = {
  /* ------ Clear Form ------ */
  clearForm: function () {
    CommonManager.clearFormFields("#InstituteTypeFrom");
    $("#btnInstituteTypeSaveOrUpdate").text("+ Add InstituteType");
    $("#InstituteTypeId").val(0);
  },

  /* ------ Create DTO Object ------ */
  createItem: function () {
    /* === DTO InstituteType === */
    const dto = {
      InstituteTypeId: $("#InstituteTypeId").val() || 0,
      InstituteTypeName: $("#InstituteTypeName").val(),
    };

    return dto;
  },

  /* ------ Populate Grid Item ------ */
  populateObject: function (item) {
    this.clearForm();
    $("#btnInstituteTypeSaveOrUpdate").text("Update InstituteType");

    $("#InstituteTypeId").val(item.InstituteTypeId);
    $("#InstituteTypeName").val(item.InstituteTypeName);
  },

};
