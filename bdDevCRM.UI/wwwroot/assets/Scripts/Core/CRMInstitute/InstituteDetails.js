

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
  fetchInstituteTypeComboBoxData: async function () {
    const serviceUrl = "/crm-institutetype-ddl";

    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);

      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load institute type data");
      }

      return Promise.resolve(response.Data); // assuming response.Data contains the list
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  fetchCountryComboBoxData: async function () {
    const serviceUrl = "/countryddl"; // Service URL

    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);

      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load country data");
      }

      return Promise.resolve(response.Data); // assuming response.Data contains the list
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  fetchCurrencyComboBoxData: async function () {
    const serviceUrl = "/currencyddl";

    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);

      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load currency data.");
      }
      return Promise.resolve(response.Data);
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },


  /* -------- Save ⬌ Update -------- */
  saveOrUpdateItem: async function () {
    debugger;
    const id = $("#instituteId").val() || 0;
    const isCreate = id == 0;
    const serviceUrl = isCreate ? "/crm-institute" : `/crm-institute/${id}`;
    const httpType = isCreate ? "POST" : "PUT";
    const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
    const successMsg = isCreate ? "New data saved successfully." : "Information updated successfully.";

    const modelDto = InstituteDetailsHelper.createItem();

    if (!modelDto) {
      throw new Error("Failed to create DTO object");
    }

    const formData = new FormData();
    const logoFileInput = document.getElementById('institutionLogoFile');
    const prospectusFileInput = document.getElementById('prospectusFile');

    if (logoFileInput.files[0]) {
      formData.append("InstitutionLogoFile", logoFileInput.files[0]);
    }
    if (prospectusFileInput.files[0]) {
      formData.append("InstitutionProspectusFile", prospectusFileInput.files[0]);
    }

    formData.append("modelDto", JSON.stringify(modelDto));

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
          try {
            debugger;

            // Use POST or PUT based on create/update
            const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, formData, httpType);

            // Check if the response has a success message
            if (response && response.IsSuccess === true) {
              ToastrMessage.showSuccess(successMsg);

              InstituteDetailsHelper.clearForm();
              const windowId = "InstitutePopUp";

              CommonManager.closeKendoWindow(windowId);
              $("#gridSummaryInstitute").data("kendoGrid").dataSource.read();
            } else {
              throw new Error(response.Message || "Unknown error occurred");
            }

          } catch (err) {
            // error VanillaApiCallManager.SendRequestVanilla ei function e handle kora ache tai ekha korle abar double hobe.
            console.log(err);
            //const msg = err.responseText || err.statusText || err.message || "Unknown error";
            //VanillaApiCallManager.handleApiError(err.response || msg);
          }
        }
      },
      { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }],
      0
    );
  },

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
            const response = await VanillaApiCallManager.delete(baseApi, serviceUrl);

            if (response && response.IsSuccess === true) {
              ToastrMessage.showSuccess("Data deleted successfully.");

              InstituteDetailsHelper.clearForm();
              $("#gridSummaryInstitute").data("kendoGrid").dataSource.read();
            } else {
              throw new Error(response.Message || "Delete operation failed.");
            }

          } catch (err) {
            const msg = err.responseText || err.statusText || err.message || "Unknown error";
            VanillaApiCallManager.handleApiError(err.response || msg);
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
      dataSource: []
    });

    var instituteComboBoxInstant = $("#cmbInstituteType").data("kendoComboBox");
    if (instituteComboBoxInstant) {
      InstituteDetailsManager.fetchInstituteTypeComboBoxData().then(data => {
        instituteComboBoxInstant.setDataSource(data);
      }).catch(() => {
        instituteComboBoxInstant.setDataSource([]);
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
      dataSource: []
    });

    var countryComboBoxInstant = $("#cmbCountry_Institute").data("kendoComboBox");
    if (countryComboBoxInstant) {
      InstituteDetailsManager.fetchCountryComboBoxData().then(data => {
        countryComboBoxInstant.setDataSource(data);
      }).catch(() => {
        countryComboBoxInstant.setDataSource([]);
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
      }).catch(() => {
        currencyComboBoxInstant.setDataSource([]);
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
  createItemWithoutHelperFunction: function () {
    debugger

    // ComboBox Instance
    const typeCbo = $("#cmbInstituteType").data("kendoComboBox");
    const countryCbo = $("#cmbCountry_Institute").data("kendoComboBox");
    const currencyCbo = $("#cmbCurrency_Institute").data("kendoComboBox");

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
      CountryId: parseInt(countryId),
      InstituteTypeId: parseInt(typeId),
      CurrencyId: parseInt(currencyId),

      // --- Basic Info ---
      InstituteName: $("input[name='InstituteName']").val(),
      InstituteCode: $("input[name='InstituteCode']").val(),
      InstituteEmail: $("input[name='InstituteEmail']").val(),
      InstituteAddress: $("input[name='InstituteAddress']").val(),
      InstitutePhoneNo: $("input[name='InstitutePhoneNo']").val(),
      InstituteMobileNo: $("input[name='InstituteMobileNo']").val(),
      Campus: $("input[name='Campus']").val(),
      Website: $("input[name='Website']").val(),

      // --- Financial / Visa ---
      //FundsRequirementforVisa: $("#fundsRequirementforVisa").val(),
      MonthlyLivingCost: parseFloat($("input[name='MonthlyLivingCost']").val()),
      ApplicationFee: parseFloat($("input[name='ApplicationFee']").val()),

      // --- Language & Academic ---
      IsLanguageMandatory: $("input[name='IsLanguageMandatory']").is(":checked"),
      LanguagesRequirement: $("input[name='LanguagesRequirement']").val(),

      // --- Descriptive Info ---
      InstitutionalBenefits: $("textarea[name='InstitutionalBenefits']").val(),
      PartTimeWorkDetails: $("textarea[name='PartTimeWorkDetails']").val(),
      ScholarshipsPolicy: $("textarea[name='ScholarshipsPolicy']").val(),
      InstitutionStatusNotes: $("textarea[name='InstitutionStatusNotes']").val(),

      // --- Status ---
      Status: $("input[name='Status']").is(":checked"),

      // --- Dropdown Text (Name) ---
      CountryName: countryName,
      InstituteType: typeName,
      CurrencyName: currencyName
    };

    return dto;
  },


  createItem: function () {
    debugger;

    // Get Kendo ComboBox instances
    const typeCbo = $("#cmbInstituteType").data("kendoComboBox");
    const countryCbo = $("#cmbCountry_Institute").data("kendoComboBox");
    const currencyCbo = $("#cmbCurrency_Institute").data("kendoComboBox");

    // Get values using CommonManager helper functions
    const countryId = CommonManager.getComboValue(countryCbo);
    const countryName = CommonManager.getComboText(countryCbo);
    const typeId = CommonManager.getComboValue(typeCbo);
    const typeName = CommonManager.getComboText(typeCbo);
    const currencyId = CommonManager.getComboValue(currencyCbo);
    const currencyName = CommonManager.getComboText(currencyCbo);

    /* === DTO Institute === */
    var dto = new Object();

    //const dto = {
    // --- Primary / Foreign Keys ---
    dto.InstituteId = CommonManager.getInputValue("#instituteId", 0);
    dto.CountryId = countryId;
    dto.InstituteTypeId = typeId;
    dto.CurrencyId = currencyId;

    // --- Basic Info ---
    dto.InstituteName = CommonManager.getInputValue("#instituteName");
    dto.InstituteCode = CommonManager.getInputValue("#instituteCode");
    dto.InstituteEmail = CommonManager.getInputValue("#instituteEmail");
    dto.InstituteAddress = CommonManager.getInputValue("#instituteAddress");
    dto.InstitutePhoneNo = CommonManager.getInputValue("#institutePhoneNo");
    dto.InstituteMobileNo = CommonManager.getInputValue("#instituteMobileNo");
    dto.Campus = CommonManager.getInputValue("#campus");
    dto.Website = CommonManager.getInputValue("#website");

    // --- Financial / Visa ---
    dto.MonthlyLivingCost = CommonManager.getNumericValue("#monthlyLivingCost");
    dto.ApplicationFee = CommonManager.getNumericValue("#applicationFee");

    // --- Language & Academic ---
    dto.IsLanguageMandatory = document.querySelector("#isLanguageMandatory")?.checked || false;
    dto.LanguagesRequirement = CommonManager.getInputValue("#languagesRequirement");

    // --- Descriptive Info ---
    dto.InstitutionalBenefits = CommonManager.getInputValue("#institutionalBenefits");
    dto.PartTimeWorkDetails = CommonManager.getInputValue("#partTimeWorkDetails");
    dto.ScholarshipsPolicy = CommonManager.getInputValue("#scholarshipsPolicy");
    dto.InstitutionStatusNotes = CommonManager.getInputValue("#institutionStatusNotes");

    // --- Status ---
    dto.Status = document.querySelector("#status")?.checked || false;

    // --- Dropdown Text (Name) ---
    dto.CountryName = countryName;
    dto.InstituteType = typeName;
    dto.CurrencyName = currencyName;
    //};

    return dto;
  },

  getFormData: function () {
    const form = new FormData();

    const logoFile = $("input[name='InstitutionLogoFile']")[0].files[0];
    const prospectusFile = $("input[name='InstitutionProspectusFile']")[0].files[0];

    if (logoFile) {
      form.append("InstitutionLogoFile", logoFile);
    }

    if (prospectusFile) {
      form.append("InstitutionProspectusFile", prospectusFile);
    }

    return form;
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

     //Files
     //$('#institutionLogoFile').val(item.InstitutionLogo);
    //$('#prospectusFile').val(item.InstitutionProspectus);

    // --- Logo Preview ---
    if (item.InstitutionLogo) {
      $("#logoThumb")
        .attr("src", item.InstitutionLogo)
        .removeClass("d-none")
        .css("cursor", "pointer")
        .off("click")
        .on("click", function () {
          PreviewManger.openGridImagePreview(item.InstitutionLogo);
        });
    } else {
      $("#logoThumb").addClass("d-none").attr("src", "#");
    }

    // --- Prospectus Preview (PDF) ---
    if (item.InstitutionProspectus) {
      const fileName = item.InstitutionProspectus.split("/").pop();
      $("#pdfName").text(fileName);

      $("#pdfPreviewBtn")
        .removeClass("d-none")
        .off("click")
        .on("click", function () {
          PreviewManger.openPreview(item.InstitutionProspectus);
        });

      $("#pdfThumbnail")
        .removeClass("d-none")
        .attr("src", "/images/pdf-thumbnail.png") // optional static thumbnail or use canvas preview
        .off("click")
        .on("click", function () {
          PreviewManger.openPreview(item.InstitutionProspectus);
        });
    } else {
      $("#pdfName").text("");
      $("#pdfPreviewBtn").addClass("d-none");
      $("#pdfThumbnail").addClass("d-none").attr("src", "#");
    }

    $("#chkStatusInstitute").prop("checked", item.Status);
  },

  openPreview: function (type) {
    debugger;
    if (!prospectusFileData) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const blob = new Blob([e.target.result], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (!$("#previewWindow").data("kendoWindow")) {
        $("#previewWindow").kendoWindow({
          width: "80%",
          height: "80vh",
          title: "Prospectus Preview",
          modal: true,
          visible: false,
          close: function () {
            $("#preview").empty();
          }
        });
      }

      $("#previewWindow").data("kendoWindow").center().open();

      $("#preview").kendoPDFViewer({
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
