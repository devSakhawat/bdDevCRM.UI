

/// <reference path="../../common/common.js" />
/// <reference path="institute.js" />
/// <reference path="institutesummary.js" />

/* =========================================================
   Global variable
=========================================================*/
let prospectusFileData = null;


/* =========================================================
   InstituteDetailsManager : Fetch / Save / Update / Delete
=========================================================*/

var InstituteDetailsManager = {
  /* -------- DataSource:  DDL -------- */
  fetchInstituteTypeComboBoxData: function () {
    const jsonParams = "";
    const serviceUrl = "/crm-institutetype-ddl";

    return AjaxManager.GetDataAsyncOrSyncronous(
      baseApi,
      serviceUrl,
      jsonParams,
      true,
      false
    );
  },

  fetchCountryComboBoxData: function () {
    const jsonParams = "";
    const serviceUrl = "/crm-countryddl";

    return AjaxManager.GetDataAsyncOrSyncronous(
      baseApi,
      serviceUrl,
      jsonParams,
      true,
      false
    );
  },

  fetchCurrencyComboBoxData: async function () {
    const jsonParams = "";
    const serviceUrl = "/currencyddl";
    return AjaxManager.GetDataAsyncOrSyncronous(
      baseApi,
      serviceUrl,
      jsonParams,
      true,
      false
    );
  },

  /* -------- Save ⬌ Update -------- */

  saveOrUpdateItem: async function () {
    debugger
    const id = $("#instituteId").val() || 0;
    const isCreate = id == 0;
    const serviceUrl = isCreate ? "/crm-institute" : `/crm-institute/${id}`;
    const httpType = isCreate ? "POST" : "PUT";
    const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
    const successMsg = isCreate ? "New data saved successfully." : "Information updated successfully.";

    // object without file and image
    //const dto = InstituteDetailsHelper.createItem();

    const formData = InstituteDetailsHelper.createFormData(id);
    console.table(formData.entries());
    console.table(Object.fromEntries(formData.entries()));

    // Append all DTO properties except display-only fields
    // Properly append form data with type checking
    //for (const [propertyName, propertyValue] of Object.entries(dto)) {
    //  // Skip dropdown text fields that don't exist in backend DTO
    //  if (propertyName === 'CountryName' || propertyName === 'InstituteType' || propertyName === 'CurrencyName') {
    //    continue;
    //  }

    //  // Only append meaningful values (not null, undefined, or empty string)
    //  if (propertyValue !== undefined && propertyValue !== null && propertyValue !== "") {
    //    // Convert boolean to string for FormData
    //    if (typeof propertyValue === 'boolean') {
    //      formData.append(propertyName, propertyValue.toString());
    //    } else {
    //      formData.append(propertyName, propertyValue.toString());
    //    }
    //  } else if (typeof propertyValue === 'boolean') {
    //    // Boolean false values should also be sent
    //    formData.append(propertyName, propertyValue.toString());
    //  }
    //}

    //for (const [propertyName, propertyValue] of Object.entries(dto)) {
    //  if (propertyValue !== undefined && propertyValue !== null) {
    //    formData.append(propertyName, propertyValue);
    //  }
    //}

    //// Properly append form data with type checking
    //for (const [propertyName, propertyValue] of Object.entries(dto)) {
    //  // Skip dropdown text fields that don't exist in DTO
    //  if (propertyName === 'CountryName' || propertyName === 'InstituteType' || propertyName === 'CurrencyName') {
    //    continue;
    //  }

    //  // Only append non-null, non-undefined values
    //  if (propertyValue !== undefined && propertyValue !== null && propertyValue !== "") {
    //    // Convert boolean to string for FormData
    //    if (typeof propertyValue === 'boolean') {
    //      formData.append(propertyName, propertyValue.toString());
    //    } else {
    //      formData.append(propertyName, propertyValue.toString());
    //    }
    //  }
    //}

    // Handle file uploads
    //const logo = $("#institutionLogoFile")[0].files[0];
    //if (logo) formData.append("InstitutionLogoFile", logo);

    //const pdf = $("#prospectusFile")[0].files[0];
    //if (pdf) formData.append("InstitutionProspectusFile", pdf);

    //// Debug: Log form data
    //console.log("=== FormData Contents ===");
    //for (var pair of formData.entries()) {
    //  console.log(pair[0] + ': ' + pair[1]);
    //}
    //console.table(Object.fromEntries(formData.entries()));

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
          try {
            debugger;

            //await AjaxManager.SendRequestAjax(baseApi, serviceUrl, formData, httpType );
            //await AjaxManager.PostDataAjax(baseApi, serviceUrl, JSON.stringify(dto), httpType );

            await AjaxManager.PostFormDataAjax( baseApi, serviceUrl, formData, httpType );

            ToastrMessage.showToastrNotification({
              preventDuplicates: true,
              closeButton: true,
              timeOut: 3000,
              message: successMsg,
              type: "success"
            });

            InstituteDetailsHelper.clearForm();
            $("#gridSummaryInstitute").data("kendoGrid").dataSource.read();
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

    const serviceUrl = `/crm-institute/${gridItem.InstituteId}`;
    AjaxManager.MsgBox(
      "info",
      "center",
      "Confirmation",
      "Are you sure to delete this institute?",
      [{
        addClass: "btn btn-primary",
        text: "Yes",
        onClick: async function ($noty) {
          $noty.close();
          try {
            await AjaxManager.PostDataAjax(
              baseApi, serviceUrl, JSON.stringify(gridItem), "DELETE");

            InstituteDetailsHelper.clearForm();
            ToastrMessage.showToastrNotification({
              preventDuplicates: true, closeButton: true, timeOut: 3000,
              message: "Data deleted successfully.", type: "success"
            });
            $("#gridSummaryInstitute").data("kendoGrid").dataSource.read();
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
   InstituteDetailsHelper : Form Utility
=========================================================*/
var InstituteDetailsHelper = {

  instituteInit: function () {
    CommonManager.initializeKendoWindow("#InstitutePopUp", "Institute Details", "80%");
    CommonManager.initializeKendoWindow("#FilePreviewWin", "Preview", "70%");

    this.generateInstituteTypeCombo();
    this.generateCountryCombo();
    this.generateCurrencyCombo();

    // initialize perview handler to document ready
    this.initLogoPreviewHandler();
    this.initProspectusPreviewHandler();
  },

  /* ------ PopUp UI ------ */
  openInistitutePopUp: function () {
    debugger;
    InstituteDetailsHelper.clearForm();
    const windowId = "InstitutePopUp";
    CommonManager.openKendoWindow(windowId, "Institute Details", "80%");

    // Append Close button dynamically if not already added
    CommonManager.appandCloseButton(windowId);
  },

  openInstituteTypePopup: function () {
    const windowId = "InstituteTypePopUp_Institute";
    CommonManager.openKendoWindow(windowId, "Institute Type Info", "80%");
    // Initialize summary
    InstituteTypeSummaryHelper.initInstituteTypeSummary();

    // Append Close button dynamically if not already added
    const buttonContainer = $(".btnDiv ul li");
    buttonContainer.find(".btn-close-generic").remove();
    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    buttonContainer.append(closeBtn);
  },

  openCountryPopup: function () {
    const windowId = "CountryPopUp_Institute";
    CommonManager.openKendoWindow(windowId, "Country Info", "80%");
    CountrySummaryHelper.initCountrySummary();

    // Append Close button dynamically if not already added
    const buttonContainer = $(".btnDiv ul li");
    buttonContainer.find(".btn-close-generic").remove();
    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    buttonContainer.append(closeBtn);
  },

  openCurrencyPopup: function () {
    const windowId = "CurrencyPopUp_Institute";
    CommonManager.openKendoWindow(windowId, "Currency Info", "80%");
    CurrencySummaryHelper.initCurrencySummary();

    // Append Close button dynamically if not already added
    const buttonContainer = $(".btnDiv ul li");
    buttonContainer.find(".btn-close-generic").remove();
    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    buttonContainer.append(closeBtn);
  },


  /* ------ ComboBox ------ */
  generateInstituteTypeCombo: function () {
    $("#cmbInstituteType").kendoComboBox({
      placeholder: "Select Institute Type...",
      dataTextField: "InstituteTypeName",
      dataValueField: "InstituteTypeId",
      filter: "contains",
      suggest: true,
      dataSource: [],
    });

    var instituteComboBoxInstant = $("#cmbInstituteType").data("kendoComboBox");
    if (instituteComboBoxInstant) {
      InstituteDetailsManager.fetchInstituteTypeComboBoxData().then(data => {
        instituteComboBoxInstant.setDataSource(data);
      });
    }
  },

  generateCountryCombo: function () {
    $("#cmbCountry_Institute").kendoComboBox({
      placeholder: "Select Country...",
      dataTextField: "CountryName",
      dataValueField: "CountryId",
      filter: "contains",
      suggest: true,
      dataSource: [],
    });

    var countryComboBoxInstant = $("#cmbCountry_Institute").data("kendoComboBox");
    if (countryComboBoxInstant) {
      InstituteDetailsManager.fetchCountryComboBoxData().then(data => {
        countryComboBoxInstant.setDataSource(data);
      });
    }
  },

  generateCurrencyCombo: function () {
    $("#cmbCurrency_Institute").kendoComboBox({
      placeholder: "Select Currency...",
      dataTextField: "CurrencyName",
      dataValueField: "CurrencyId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    var currencyComboBoxInstant = $("#cmbCurrency_Institute").data("kendoComboBox");
    if (currencyComboBoxInstant) {
      InstituteDetailsManager.fetchCurrencyComboBoxData().then(data => {
        currencyComboBoxInstant.setDataSource(data);
      });
    }
  },


  /* ------ Clear Form ------ */
  clearForm: function () {
    debugger;
    CommonManager.clearFormFields("#InstituteForm");
    $("#btnInstituteSaveOrUpdate").text("+ Add Institute");
    $("#instituteId").val(0);
    $("#btnInstituteSaveOrUpdate").prop("disabled", false);
    $("#logoThumb").val("");
    $("#pdfThumbnail").val("");
  },

  /* ------ Create DTO Object ------ */
  createItem: function () {
    debugger

    // ComboBox Instance
    const typeCbo = $("#cmbInstituteType").data("kendoComboBox");
    const countryCbo = $("#cmbCountry_Institute").data("kendoComboBox");
    const currencyCbo = $("#cmbCurrency_Institute").data("kendoComboBox");

    // selected text/values - ensure proper null handling
    const countryId = countryCbo?.value() || null;
    const countryName = countryCbo?.text() || "";
    const currencyId = currencyCbo?.value() || null;
    const currencyName = currencyCbo?.text() || "";
    const typeId = typeCbo?.value() || null;
    const typeName = typeCbo?.text() || "";

    /* === DTO Institute === */
    const dto = {
      // --- Primary / Foreign Keys ---
      InstituteId: parseInt($("#instituteId").val()) || 0,
      CountryId: countryId ? parseInt(countryId) : null,
      InstituteTypeId: typeId ? parseInt(typeId) : null,
      CurrencyId: currencyId ? parseInt(currencyId) : null,
      //InstituteTypeId: $("#cmbInstituteType").val(),
      //CountryId: $("#cmbCountry_Institute").val(),
      //CurrencyId: $("#cmbCurrency_Institute").val(),

      // --- Basic Info ---
      InstituteName: $("#instituteName").val()?.trim() || "",
      InstituteCode: $("#instituteCode").val()?.trim() || "",
      InstituteEmail: $("#instituteEmail").val()?.trim() || "",
      InstituteAddress: $("#instituteAddress").val()?.trim() || "",
      InstitutePhoneNo: $("#institutePhoneNo").val()?.trim() || "",
      InstituteMobileNo: $("#instituteMobileNo").val()?.trim() || "",
      Campus: $("#campus").val()?.trim() || "",
      Website: $("#website").val()?.trim() || "",

      // --- Financial / Visa ---
      MonthlyLivingCost: parseFloat($("#monthlyLivingCost").val()) || null,
      FundsRequirementforVisa: $("#fundsRequirementforVisa").val()?.trim() || "",
      ApplicationFee: parseFloat($("#applicationFee").val()) || null,

      // --- Language & Academic ---
      IsLanguageMandatory: $("#chkIsLanguageMandatory").is(":checked"),
      LanguagesRequirement: $("#languagesRequirement").val()?.trim() || "",

      // --- Descriptive Info ---
      InstitutionalBenefits: $("#institutionalBenefits").val()?.trim() || "",
      PartTimeWorkDetails: $("#partTimeWorkDetails").val()?.trim() || "",
      ScholarshipsPolicy: $("#scholarshipsPolicy").val()?.trim() || "",
      InstitutionStatusNotes: $("#institutionStatusNotes").val()?.trim() || "",

      // --- File Paths (file name / path) ---
      InstitutionLogo: $("#institutionLogoFile").val()?.trim() || "",
      InstitutionProspectus: $("#prospectusFile").val()?.trim() || "",

      // --- Status ---
      Status: $("#chkStatusInstitute").is(":checked"),

      // --- Dropdown Text (Name) - These won't be sent in FormData ---
      CountryName: countryName,
      InstituteType: typeName,
      CurrencyName: currencyName
    };

    return dto;
  },

  createFormData: function (id) {
    const formData = new FormData();
    const tryGetValue = (selector) => {
      const val = $(selector).val();
      return val === "" || val == null ? "" : val;
    };

    // PK & FK
    formData.append("InstituteId", id || 0);
    formData.append("CountryId", $("#cmbCountry_Institute").data("kendoComboBox").value());
    formData.append("CurrencyId", $("#cmbCurrency_Institute").data("kendoComboBox")?.value() || null);
    formData.append("InstituteTypeId", $("#cmbInstituteType").data("kendoComboBox")?.value() || null);

    // Basic Info
    formData.append("InstituteName", $("#instituteName").val());
    formData.append("InstituteCode", $("#instituteCode").val());
    formData.append("InstituteEmail", $("#instituteEmail").val());
    formData.append("InstituteAddress", $("#instituteAddress").val());
    formData.append("InstitutePhoneNo", $("#institutePhoneNo").val());
    formData.append("InstituteMobileNo", $("#instituteMobileNo").val());
    formData.append("Campus", $("#campus").val());
    formData.append("Website", $("#website").val());

    // Financial / Visa
    //formData.append("MonthlyLivingCost", $("#monthlyLivingCost").val() || null);
    formData.append("MonthlyLivingCost", tryGetValue("#monthlyLivingCost"));
    formData.append("ApplicationFee", tryGetValue("#applicationFee"));
    //formData.append("FundsRequirementforVisa", tryGetValue("#fundsRequirementforVisa"));

    // Language & Academic
    //formData.append("IsLanguageMandatory", $("#chkIsLanguageMandatory").is(":checked"));
    formData.append("IsLanguageMandatory", $("#chkIsLanguageMandatory").is(":checked").toString());
    formData.append("LanguagesRequirement", $("#languagesRequirement").val());

    // Descriptive Info
    formData.append("InstitutionalBenefits", $("#institutionalBenefits").val());
    formData.append("PartTimeWorkDetails", $("#partTimeWorkDetails").val());
    formData.append("ScholarshipsPolicy", $("#scholarshipsPolicy").val());
    formData.append("InstitutionStatusNotes", $("#institutionStatusNotes").val());

    // Status
    //formData.append("Status", $("#chkStatusInstitute").is(":checked"));
    formData.append("Status", $("#chkStatusInstitute").is(":checked").toString());

    // File Uploads
    const logoFile = $("#institutionLogoFile")[0].files[0];
    if (logoFile) {
      formData.append("InstitutionLogoFile", logoFile);
    }

    const prospectusFile = $("#prospectusFile")[0].files[0];
    if (prospectusFile) {
      formData.append("InstitutionProspectusFile", prospectusFile);
    }

    return formData;
  },

  createItemGPT: function () {
    debugger

    // ComboBox Instance
    const countryCbo = $("#cmbInstituteCountry").data("kendoComboBox");
    const currencyCbo = $("#cmbInstituteCurrency").data("kendoComboBox");
    const typeCbo = $("#cmbInstituteType").data("kendoComboBox");

    // selected text/valus
    const countryId = countryCbo?.value() || null;
    const countryName = countryCbo?.text() || "";
    const currencyId = currencyCbo?.value() || null;
    const currencyName = currencyCbo?.text() || "";
    const typeId = typeCbo?.value() || null;
    const typeName = typeCbo?.text() || "";

    /* === DTO Institute === */
    const dto = {
      // --- Primary / Foreign Keys ---
      InstituteId: $("#instituteId").val() || 0,
      CountryId: countryId,
      InstituteTypeId: typeId,
      CurrencyId: currencyId,

      // --- Basic Info ---
      InstituteName: $("#instituteName").val(),
      InstituteCode: $("#instituteCode").val(),
      InstituteEmail: $("#instituteEmail").val(),
      InstituteAddress: $("#instituteAddress").val(),
      InstitutePhoneNo: $("#institutePhoneNo").val(),
      InstituteMobileNo: $("#instituteMobileNo").val(),
      Campus: $("#campus").val(),
      Website: $("#website").val(),

      // --- Financial / Visa ---
      MonthlyLivingCost: $("#monthlyLivingCost").val(),
      FundsRequirementforVisa: $("#fundsRequirementforVisa").val(),
      ApplicationFee: $("#applicationFee").val(),

      // --- Language & Academic ---
      IsLanguageMandatory: $("#chkIsLanguageMandatory").is(":checked"),
      LanguagesRequirement: $("#languagesRequirement").val(),

      // --- Descriptive Info ---
      InstitutionalBenefits: $("#institutionalBenefits").val(),
      PartTimeWorkDetails: $("#partTimeWorkDetails").val(),
      ScholarshipsPolicy: $("#scholarshipsPolicy").val(),
      InstitutionStatusNotes: $("#institutionStatusNotes").val(),

      // --- File Paths (file name / path) ---
      InstitutionLogo: $("#institutionLogoFile").val(),
      InstitutionProspectus: $("#prospectusFile").val(),

      // --- Status ---
      Status: $("#chkStatusInstitute").is(":checked"),

      // --- Dropdown Text (Name) ---
      CountryName: countryName,
      InstituteType: typeName,
      CurrencyName: currencyName
    };

    return dto;
  },

  /* ------ Populate Grid Item ------ */
  populateObject: function (item) {
    this.clearForm();
    $("#btnInstituteSaveOrUpdate").text("Update Institute");

    $("#instituteId").val(item.InstituteId);

    $("#instituteName").val(item.InstituteName);
    $("#instituteCode").val(item.InstituteCode);
    $("#instituteEmail").val(item.InstituteEmail);
    $("#instituteAddress").val(item.InstituteAddress);
    $("#institutePhoneNo").val(item.InstitutePhoneNo);
    $("#instituteMobileNo").val(item.InstituteMobileNo);
    $("#campus").val(item.Campus);
    $("#website").val(item.Website);

    $("#monthlyLivingCost").val(item.MonthlyLivingCost);
    $("#fundsRequirementforVisa").val(item.FundsRequirementforVisa);
    $("#applicationFee").val(item.ApplicationFee);

    $("#chkIsLanguageMandatory").prop("checked", item.IsLanguageMandatory);
    $("#languagesRequirement").val(item.LanguagesRequirement);

    $("#institutionalBenefits").val(item.InstitutionalBenefits);
    $("#partTimeWorkDetails").val(item.PartTimeWorkDetails);
    $("#scholarshipsPolicy").val(item.ScholarshipsPolicy);
    $("#institutionStatusNotes").val(item.InstitutionStatusNotes);

    /* Combo value set */
    $("#cmbInstituteCountryId").data("kendoComboBox")?.value(item.CountryId);
    $("#cmbInstituteCurrencyId").data("kendoComboBox")?.value(item.CurrencyId);
    $("#cmbInstituteTypeId").data("kendoComboBox")?.value(item.InstituteTypeId);

    /* Files  */
    // $('#institutionLogoFile').val(item.InstitutionLogo);
    // $('#prospectusFile').val(item.InstitutionProspectus);

    $("#chkStatusInstitute").prop("checked", item.Status);
  },

  openPreview: function (type) {
    if (!prospectusFileData) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const blob = new Blob([e.target.result], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (!$("#pdfViewerWindow").data("kendoWindow")) {
        $("#pdfViewerWindow").kendoWindow({
          width: "80%",
          height: "80vh",
          title: "Prospectus Preview",
          modal: true,
          visible: false,
          close: function () {
            $("#pdfViewer").empty();
          }
        });
      }

      $("#pdfViewerWindow").data("kendoWindow").center().open();

      $("#pdfViewer").kendoPDFViewer({
        pdfjsProcessing: { file: url },
        width: "100%",
        height: "100%",
        toolbar: {
          items: [ "pager", "spacer", "zoomIn", "zoomOut", "toggleSelection", "download" ]
        }
      });
    };

    reader.readAsArrayBuffer(prospectusFileData);
  },

  /* ---------- Preview Handler ---------- */
  initLogoPreviewHandler: function () {
    $("#institutionLogoFile").on("change", function () {
      const file = this.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e =>
          $("#logoThumb").attr("src", e.target.result).removeClass("d-none");
        reader.readAsDataURL(file);
      } else {
        $("#logoThumb").addClass("d-none").attr("src", "#");
      }
    });
  },

  // pdf viewer
  initProspectusPreviewHandler: function () {
    debugger;
    $("#prospectusFile").on("change", function () {
      const file = this.files[0];
      if (!file || file.type !== "application/pdf") {
        $("#pdfThumbnail").addClass("d-none").attr("src", "#");
        $("#pdfName").text("");
        prospectusFileData = null;
        return;
      }

      prospectusFileData = file;
      $("#pdfName").text(file.name);

      const reader = new FileReader();
      reader.onload = function () {
        const typedArray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedArray).promise.then(pdf => {
          pdf.getPage(1).then(page => {
            /* rander first page in canvas → dataURL */
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const scale = 200 / page.getViewport({ scale: 1 }).width;
            const viewport = page.getViewport({ scale });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            page.render({ canvasContext: context, viewport })
              .promise.then(() => {
                const imgUrl = canvas.toDataURL("image/png");
                $("#pdfThumbnail")
                  .attr("src", imgUrl)
                  .removeClass("d-none");
              });
          });
        });
      };
      reader.readAsArrayBuffer(file);
    });
  },


};
