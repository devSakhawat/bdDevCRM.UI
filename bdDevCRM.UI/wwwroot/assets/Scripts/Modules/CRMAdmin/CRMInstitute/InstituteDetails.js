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

  /* -------- Save <=> Update -------- */
  saveOrUpdateItem: async function () {
    try {
      if (!this.validateForm()) return;

      const id = $("#instituteId").val() || 0;
      const isCreate = id == 0;
      const serviceUrl = isCreate ? "/crm-institute" : `/crm-institute/${id}`;
      const httpType = isCreate ? "POST" : "PUT";
      const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
      const successMsg = isCreate ? "New data saved successfully." : "Information updated successfully.";

      let modelDto = InstituteDetailsHelper.createItem();
      if (!modelDto) throw new Error("Failed to create DTO object");

      const formData = new FormData();
      const logoFileInput = document.getElementById('institutionLogoFile');
      const prospectusFileInput = document.getElementById('prospectusFile');
      if (logoFileInput && logoFileInput.files.length > 0) formData.append("InstitutionLogoFile", logoFileInput.files[0]);
      if (prospectusFileInput && prospectusFileInput.files.length > 0) formData.append("InstitutionProspectusFile", prospectusFileInput.files[0]);
      for (const key in modelDto) {
        if (Object.prototype.hasOwnProperty.call(modelDto, key) && modelDto[key] !== null && modelDto[key] !== undefined) {
          formData.append(key, modelDto[key]);
        }
      }

      CommonManager.showConfirm("Confirmation", confirmMsg,
        async () => {
          // Yes
          CommonManager.showProcessingOverlay("Saving institute information...");
          try {
            const response = await VanillaApiCallManager.SendRequestVanilla(
              baseApi, serviceUrl, formData, httpType,
              { skipContentTypeHeader: true, timeout: 300000, requireAuth: true }
            );
            CommonManager.hideProcessingOverlay();

            if (response && response.IsSuccess === true) {
              ToastrMessage.showSuccess(successMsg);
              InstituteDetailsHelper.clearForm();
              CommonManager.closeKendoWindow("InstitutePopUp");
              const grid = $("#gridSummaryInstitute").data("kendoGrid");
              if (grid) grid.dataSource.read();
            } else {
              throw new Error(response.Message || "Unknown error occurred");
            }
          } catch (err) {
            CommonManager.hideProcessingOverlay();
            VanillaApiCallManager.handleApiError(err);
          }
        },
        () => {
          // Cancel
          CommonManager.hideProcessingOverlay(); // সেফটি: overlay খোলা থাকলে বন্ধ হবে
          $("#btnInstituteSaveOrUpdate").prop("disabled", false).focus();
          ToastrMessage.showInfo("Operation cancelled", "Cancelled", 2000);
        }
      );
    } catch (error) {
      CommonManager.hideProcessingOverlay();
      VanillaApiCallManager.handleApiError(error);
    }
  },


  //saveOrUpdateItem: async function () {
  //  try {
  //    // ========= Enhanced Form Validation =========
  //    if (!this.validateForm()) {
  //      return; // Stop if validation fails
  //    }

  //    const id = $("#instituteId").val() || 0;
  //    const isCreate = id == 0;
  //    const serviceUrl = isCreate ? "/crm-institute" : `/crm-institute/${id}`;
  //    const httpType = isCreate ? "POST" : "PUT";
  //    const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
  //    const successMsg = isCreate ? "New data saved successfully." : "Information updated successfully.";

  //    // Create model object from form
  //    let modelDto = InstituteDetailsHelper.createItem();

  //    if (!modelDto) {
  //      throw new Error("Failed to create DTO object");
  //    }

  //    const formData = new FormData();

  //    // Append files
  //    const logoFileInput = document.getElementById('institutionLogoFile');
  //    const prospectusFileInput = document.getElementById('prospectusFile');

  //    if (logoFileInput && logoFileInput.files.length > 0) {
  //      formData.append("InstitutionLogoFile", logoFileInput.files[0]);
  //    }

  //    if (prospectusFileInput && prospectusFileInput.files.length > 0) {
  //      formData.append("InstitutionProspectusFile", prospectusFileInput.files[0]);
  //    }

  //    // Append each field separately for model binding
  //    for (const key in modelDto) {
  //      if (modelDto.hasOwnProperty(key) && modelDto[key] !== null && modelDto[key] !== undefined) {
  //        formData.append(key, modelDto[key]);
  //      }
  //    }

  //    // Confirmation popup before sending using SweetAlert2 
  //    CommonManager.MsgBox("info", "center", "Confirmation", confirmMsg, [
  //      {
  //        addClass: "btn btn-primary",
  //        text: "Yes",
  //        onClick: async function ($noty) {
  //          $noty.close();
            
  //          // Show processing overlay
  //          CommonManager.showProcessingOverlay("Saving institute information...");
            
  //          try {
  //            const response = await VanillaApiCallManager.SendRequestVanilla(
  //              baseApi,
  //              serviceUrl,
  //              formData,
  //              httpType,
  //              {
  //                skipContentTypeHeader: true,
  //                timeout: 300000,
  //                requireAuth: true
  //              }
  //            );

  //            // Hide processing overlay
  //            CommonManager.hideProcessingOverlay();

  //            if (response && response.IsSuccess === true) {
  //              ToastrMessage.showSuccess(successMsg);
                
  //              // Enhanced cleanup after successful save
  //              InstituteDetailsHelper.clearForm();
  //              CommonManager.closeKendoWindow("InstitutePopUp");
                
  //              // Refresh grid if it exists
  //              const grid = $("#gridSummaryInstitute").data("kendoGrid");
  //              if (grid) {
  //                grid.dataSource.read();
  //              }
  //            } else {
  //              throw new Error(response.Message || "Unknown error occurred");
  //            }
  //          } catch (err) {
  //            // Hide processing overlay on error
  //            CommonManager.hideProcessingOverlay();
  //            VanillaApiCallManager.handleApiError(err);
  //          }
  //        }
  //      },
  //      { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }
  //    ], 0);
  //  } catch (error) {
  //    CommonManager.hideProcessingOverlay();
  //    VanillaApiCallManager.handleApiError(error);
  //  }
  //},

  deleteItem: function (gridItem) {
    if (!gridItem) return;

    const serviceUrl = `/api/crm-institute/${gridItem.InstituteId}`;

    CommonManager.MsgBox(
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
            const response = await VanillaApiCallManager.delete(
              window.location.origin, // Use current domain
              serviceUrl,
              {
                requireAuth: true // Ensure JWT token is included
              }
            );

            if (response && response.IsSuccess === true) {
              ToastrMessage.showSuccess("Data deleted successfully.");
              InstituteDetailsHelper.clearForm();
              $("#gridSummaryInstitute").data("kendoGrid").dataSource.read();
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
  },

  /* -------- Enhanced Form Validation -------- */
  validateForm: function() {
    let isValid = true;
    const errors = [];

    // Required field validation
    const instituteName = $("#instituteName").val().trim();
    if (!instituteName) {
      this.showFieldError("#instituteName", "Institute Name is required");
      errors.push("Institute Name is required");
      isValid = false;
    }

    // ComboBox validation
    const countryCombo = $("#cmbCountry_Institute").data("kendoComboBox");
    if (!countryCombo || !countryCombo.value()) {
      this.showFieldError("#cmbCountry_Institute_wrapper", "Please select a country");
      errors.push("Country is required");
      isValid = false;
    }

    // Email validation if provided
    const email = $("#instituteEmail").val().trim();
    if (email && !this.isValidEmail(email)) {
      this.showFieldError("#instituteEmail", "Please enter a valid email address");
      errors.push("Invalid email format");
      isValid = false;
    }

    // Website URL validation if provided
    const website = $("#website").val().trim();
    if (website && !this.isValidUrl(website)) {
      this.showFieldError("#website", "Please enter a valid website URL");
      errors.push("Invalid website URL");
      isValid = false;
    }

    // Show summary error message if validation fails
    if (!isValid) {
      ToastrMessage.showError(
        "Please correct the following errors:<br>• " + errors.join("<br>• "),
        "Validation Error",
        5000
      );
    }

    return isValid;
  },

  /* -------- Validation Helper Functions -------- */
  showFieldError: function(fieldSelector, message) {
    const $field = $(fieldSelector);
    $field.addClass("is-invalid");
    
    // Remove existing error message
    $field.next(".invalid-feedback").remove();
    
    // Add error message
    $field.after(`<div class="invalid-feedback">${message}</div>`);
    
    // Clear error on input change
    $field.one("input change", function() {
      $(this).removeClass("is-invalid");
      $(this).next(".invalid-feedback").remove();
    });
  },

  isValidEmail: function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidUrl: function(url) {
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(url) || url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  },


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

    //// Append Close button dynamically if not already added
    //const buttonContainer = $(".btnDiv ul li");
    //buttonContainer.find(".btn-close-generic").remove();
    //const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    //buttonContainer.append(closeBtn);

    CommonManager.appandCloseButton(windowId);
  },

  openCountryPopup: function () {
    const windowId = "CountryPopUp_Institute";
    CommonManager.openKendoWindow(windowId, "Country Info", "80%");
    CountrySummaryHelper.initCountrySummary();

    //// Append Close button dynamically if not already added
    //const buttonContainer = $(".btnDiv ul li");
    //buttonContainer.find(".btn-close-generic").remove();
    //const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    //buttonContainer.append(closeBtn);

    CommonManager.appandCloseButton(windowId);
  },

  openCurrencyPopup: function () {
    const windowId = "CurrencyPopUp_Institute";
    CommonManager.openKendoWindow(windowId, "Currency Info", "80%");
    CurrencySummaryHelper.initCurrencySummary();

    //// Append Close button dynamically if not already added
    //const buttonContainer = $(".btnDiv ul li");
    //buttonContainer.find(".btn-close-generic").remove();
    //const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    //buttonContainer.append(closeBtn);

    CommonManager.appandCloseButton(windowId);
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
    // Use enhanced common clearFormFields 
    CommonManager.clearFormFields("#InstituteForm");
    
    $("#btnInstituteSaveOrUpdate").text("+ Add Institute");
    $("#instituteId").val(0);
    $("#btnInstituteSaveOrUpdate").prop("disabled", false);
    
    // ========= Enhanced File Cleanup =========
    // Clear logo preview completely
    $("#logoThumb").addClass("d-none").attr("src", "#").off("click");
    
    // Clear PDF preview completely  
    $("#pdfThumbnail").addClass("d-none").attr("src", "#").off("click");
    $("#pdfPreviewBtn").addClass("d-none").off("click");
    $("#pdfName").text("");
    
    // Clear file inputs
    $("#institutionLogoFile").val("");
    $("#prospectusFile").val("");
    
    // Reset global file data variables
    if (typeof prospectusFileData !== 'undefined') {
      prospectusFileData = null;
    }
    
    // Clear any validation errors
    $(".field-validation-error").removeClass("field-validation-error").addClass("field-validation-valid").text("");
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
    var dto = {};

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
    dto.Status = document.querySelector("#chkStatusInstitute")?.checked || false;

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
    // Clear form first with enhanced cleanup
    this.clearForm();
    $("#btnInstituteSaveOrUpdate").text("Update Institute");

    // ========= Primary Key =========
    $("#instituteId").val(item.InstituteId || 0);

    // ========= Basic Information =========
    $("#instituteName").val(item.InstituteName || "");
    $("#instituteCode").val(item.InstituteCode || "");
    $("#instituteEmail").val(item.InstituteEmail || "");
    $("#instituteAddress").val(item.InstituteAddress || "");
    $("#institutePhoneNo").val(item.InstitutePhoneNo || "");
    $("#instituteMobileNo").val(item.InstituteMobileNo || "");
    $("#campus").val(item.Campus || "");
    $("#website").val(item.Website || "");

    // ========= Financial Information =========
    $("#monthlyLivingCost").val(item.MonthlyLivingCost || "");
    $("#applicationFee").val(item.ApplicationFee || "");

    // ========= Language Requirements =========
    $("#isLanguageMandatory").prop("checked", item.IsLanguageMandatory || false);
    $("#languagesRequirement").val(item.LanguagesRequirement || "");

    // ========= Descriptive Information =========
    $("#institutionalBenefits").val(item.InstitutionalBenefits || "");
    $("#partTimeWorkDetails").val(item.PartTimeWorkDetails || "");
    $("#scholarshipsPolicy").val(item.ScholarshipsPolicy || "");
    $("#institutionStatusNotes").val(item.InstitutionStatusNotes || "");

    // ========= Status =========
    $("#chkStatusInstitute").prop("checked", item.Status || false);

    // ========= Enhanced ComboBox Population =========
    // Set values after a small delay to ensure data is loaded
    setTimeout(() => {
      const countryCombo = $("#cmbCountry_Institute").data("kendoComboBox");
      const currencyCombo = $("#cmbCurrency_Institute").data("kendoComboBox");
      const typeCombo = $("#cmbInstituteType").data("kendoComboBox");
      
      if (countryCombo && item.CountryId) {
        countryCombo.value(item.CountryId);
        // Force trigger change event if needed for cascading
        countryCombo.trigger("change");
      }
      
      if (currencyCombo && item.CurrencyId) {
        currencyCombo.value(item.CurrencyId);
      }
      
      if (typeCombo && item.InstituteTypeId) {
        typeCombo.value(item.InstituteTypeId);
      }
    }, 100);

    // ========= Enhanced File Preview Handling =========
    // Logo Preview
    if (item.InstitutionLogo && item.InstitutionLogo.trim() !== "") {
      // Check if the URL is valid (starts with http/https or relative path)
      const logoUrl = item.InstitutionLogo.startsWith('http') ? item.InstitutionLogo : 
                      item.InstitutionLogo.startsWith('/') ? item.InstitutionLogo : 
                      '/' + item.InstitutionLogo;
      
      $("#logoThumb")
        .attr("src", logoUrl)
        .removeClass("d-none")
        .css({
          "cursor": "pointer",
          "width": "200px",
          "height": "200px",
          "object-fit": "contain",
          "border": "1px solid #ddd"
        })
        .off("click")
        .on("click", function () {
          // Open preview in modal or new window
          if (typeof PreviewManger !== 'undefined' && PreviewManger.openGridImagePreview) {
            PreviewManger.openGridImagePreview(logoUrl);
          } else {
            // Fallback: open in new window
            window.open(logoUrl, '_blank');
          }
        })
        .on("error", function() {
          // Handle broken image
          $(this).addClass("d-none").attr("src", "#");
          console.warn("Failed to load institution logo:", logoUrl);
        });
    } else {
      $("#logoThumb").addClass("d-none").attr("src", "#").off("click");
    }

    // Prospectus Preview (PDF)
    if (item.InstitutionProspectus && item.InstitutionProspectus.trim() !== "") {
      const prospectusUrl = item.InstitutionProspectus.startsWith('http') ? item.InstitutionProspectus : 
                           item.InstitutionProspectus.startsWith('/') ? item.InstitutionProspectus : 
                           '/' + item.InstitutionProspectus;
      
      // Extract filename from URL
      const fileName = prospectusUrl.split("/").pop() || "Prospectus.pdf";
      $("#pdfName").text(fileName);

      // Show preview button
      $("#pdfPreviewBtn")
        .removeClass("d-none")
        .off("click")
        .on("click", function () {
          if (typeof PreviewManger !== 'undefined') {
            PreviewManger.openPreview(prospectusUrl);
          } else {
            // Fallback: open in new window
            window.open(prospectusUrl, '_blank');
          }
        });

      // Show PDF thumbnail (can be a static PDF icon or generated thumbnail)
      $("#pdfThumbnail")
        .removeClass("d-none")
        .attr("src", "/assets/images/pdf-thumbnail.png") // was: /images/pdf-thumbnail.png
        .css({
          "cursor": "pointer",
          "width": "200px", 
          "height": "200px",
          "object-fit": "cover",
          "border": "1px solid #ddd"
        })
        .off("click")
        .on("click", function () {
          if (typeof PreviewManger !== 'undefined' && PreviewManger.openPreview) {
            PreviewManger.openPreview(prospectusUrl);
          } else {
            window.open(prospectusUrl, '_blank');
          }
        })
        // Stop 404 spam: single error handler + inline SVG fallback
        .off("error").one("error", function () {
          $(this).off("error").attr("src",
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMWYxZjEiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNl bSI+RE9DPC90ZXh0Pjwvc3ZnPg=="
          );
        });
    } else {
      $("#pdfName").text("");
      $("#pdfPreviewBtn").addClass("d-none").off("click");
      $("#pdfThumbnail").addClass("d-none").attr("src", "#").off("click");
    }

    // ========= Form Validation State Reset =========
    // Remove any existing validation classes
    $("#InstituteForm .field-validation-error").removeClass("field-validation-error").addClass("field-validation-valid");
    
    // Enable form for editing
    $("#btnInstituteSaveOrUpdate").prop("disabled", false);
    
    console.log("Institute data populated successfully:", item.InstituteName);
  },

  /* ---------- Enhanced Preview Handlers ---------- */
  initLogoPreviewHandler: function () {
    $("#institutionLogoFile").on("change", function (event) {
      const file = this.files[0];
      const $logoThumb = $("#logoThumb");
      
      if (file && file.type.startsWith("image/")) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          ToastrMessage.showError("Logo file size should not exceed 5MB", "File Size Error");
          $(this).val('');
          $logoThumb.addClass("d-none").attr("src", "#");
          return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          ToastrMessage.showError("Only JPEG, PNG, GIF and WebP files are allowed for logo", "Invalid File Type");
          $(this).val('');
          $logoThumb.addClass("d-none").attr("src", "#");
          return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
          $logoThumb
            .attr("src", e.target.result)
            .removeClass("d-none")
            .css({
              "cursor": "pointer",
              "width": "200px",
              "height": "200px", 
              "object-fit": "contain",
              "border": "1px solid #ddd",
              "border-radius": "4px"
            })
            .off("click")
            .on("click", function() {
              // Use PreviewWindow.js modal
              if (typeof PreviewManger !== 'undefined' && PreviewManger.openGridImagePreview) {
                PreviewManger.openGridImagePreview(e.target.result);
              } else {
                window.open(e.target.result, '_blank');
              }
            });
        };
        
        reader.onerror = function() {
          ToastrMessage.showError("Error reading logo file", "File Read Error");
          $logoThumb.addClass("d-none").attr("src", "#");
        };
        
        reader.readAsDataURL(file);
        
      } else {
        $logoThumb.addClass("d-none").attr("src", "#").off("click");
        if (file) {
          ToastrMessage.showError("Please select a valid image file for logo", "Invalid File Type");
          $(this).val('');
        }
      }
    });
  },

  // Enhanced PDF preview handler
  initProspectusPreviewHandler: function () {
    $("#prospectusFile").on("change", function (event) {
      const file = this.files[0];
      const $pdfThumbnail = $("#pdfThumbnail");
      const $pdfName = $("#pdfName");
      const $pdfPreviewBtn = $("#pdfPreviewBtn");
      
      if (!file) {
        // Clear preview when no file selected
        $pdfThumbnail.addClass("d-none").attr("src", "#").off("click");
        $pdfName.text("");
        $pdfPreviewBtn.addClass("d-none").off("click");
        prospectusFileData = null;
        return;
      }

      if (file.type !== "application/pdf") {
        ToastrMessage.showError("Only PDF files are allowed for prospectus", "Invalid File Type");
        $(this).val('');
        $pdfThumbnail.addClass("d-none").attr("src", "#");
        $pdfName.text("");
        $pdfPreviewBtn.addClass("d-none");
        prospectusFileData = null;
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        ToastrMessage.showError("Prospectus file size should not exceed 10MB", "File Size Error");
        $(this).val('');
        $pdfThumbnail.addClass("d-none").attr("src", "#");
        $pdfName.text("");
        $pdfPreviewBtn.addClass("d-none");
        prospectusFileData = null;
        return;
      }

      // Store file data globally
      prospectusFileData = file;
      $pdfName.text(file.name);

      // Show preview button
      $pdfPreviewBtn
        .removeClass("d-none")
        .off("click")
        .on("click", function() {
          if (typeof PreviewManger !== 'undefined' && PreviewManger.previewFileBlob) {
            PreviewManger.previewFileBlob(file, "Prospectus Preview");
          } else {
            // Fallback
            const url = URL.createObjectURL(file);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 10000);
          }
        });

      // Generate PDF thumbnail using PDF.js if available
      if (typeof pdfjsLib !== 'undefined') {
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const typedArray = new Uint8Array(this.result);
            
            pdfjsLib.getDocument(typedArray).promise.then(pdf => {
              pdf.getPage(1).then(page => {
                // Render first page as thumbnail
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                const scale = 200 / page.getViewport({ scale: 1 }).width;
                const viewport = page.getViewport({ scale });

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                page.render({ canvasContext: context, viewport })
                  .promise.then(() => {
                    const imgUrl = canvas.toDataURL("image/png");
                    $pdfThumbnail
                      .attr("src", imgUrl)
                      .removeClass("d-none")
                      .css({
                        "cursor": "pointer",
                        "width": "200px",
                        "height": "200px",
                        "object-fit": "cover",
                        "border": "1px solid #ddd",
                        "border-radius": "4px"
                      })
                      .off("click")
                      .on("click", function() {
                        if (typeof PreviewManger !== 'undefined' && PreviewManger.previewFileBlob) {
                          PreviewManger.previewFileBlob(file, "Prospectus Preview");
                        } else {
                          const url = URL.createObjectURL(file);
                          window.open(url, '_blank');
                          setTimeout(() => URL.revokeObjectURL(url), 10000);
                        }
                      });
                  })
                  .catch(error => {
                    console.error("Error rendering PDF thumbnail:", error);
                    InstituteDetailsHelper.showStaticPdfThumbnail($pdfThumbnail, file);
                  });
              });
            }).catch(error => {
              console.error("Error loading PDF:", error);
              InstituteDetailsHelper.showStaticPdfThumbnail($pdfThumbnail, file);
            });
          } catch (error) {
            console.error("Error processing PDF:", error);
            InstituteDetailsHelper.showStaticPdfThumbnail($pdfThumbnail, file);
          }
        };
        
        reader.onerror = function() {
          ToastrMessage.showError("Error reading PDF file", "File Read Error");
          InstituteDetailsHelper.showStaticPdfThumbnail($pdfThumbnail, file);
        };
        
        reader.readAsArrayBuffer(file);
      } else {
        // Fallback: show static PDF icon
        InstituteDetailsHelper.showStaticPdfThumbnail($pdfThumbnail, file);
      }
    });
  },

  /* ---------- Preview Helper Functions ---------- */
  showStaticPdfThumbnail: function ($pdfThumbnail, file) {
    $pdfThumbnail
      .removeClass("d-none")
      .attr("src", "/images/pdf-thumbnail.png")
      .css({
        "cursor": "pointer",
        "width": "200px",
        "height": "200px",
        "object-fit": "cover",
        "border": "1px solid #ddd",
        "border-radius": "4px"
      })
      .off("click")
      .on("click", function () {
        if (typeof PreviewManger !== 'undefined' && PreviewManger.previewFileBlob) {
          PreviewManger.previewFileBlob(file, "Prospectus Preview");
        } else {
          // Fallback
          const url = URL.createObjectURL(file);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
      })
      .on("error", function () {
        // Ultimate fallback
        $(this).attr("src", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjFmMWYxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QREYgRmlsZTwvdGV4dD4KPHN2Zz4=");
      });
  },

  openImagePreview: function(imageSrc, fileName) {
    const modalHtml = `
      <div id="imagePreviewModal" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Image Preview: ${fileName || 'Institute Logo'}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center">
              <img src="${imageSrc}" class="img-fluid" alt="Image Preview" style="max-height: 500px;">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Remove existing modal
    $("#imagePreviewModal").remove();
    
    // Add modal to body and show
    $("body").append(modalHtml);
    $("#imagePreviewModal").modal("show");
    
    // Clean up when modal is hidden
    $("#imagePreviewModal").on("hidden.bs.modal", function() {
      $(this).remove();
    });
  },

  openPdfPreview: function(file) {
    if (!file) return;
    
    // Create a blob URL for the PDF
    const blobUrl = URL.createObjectURL(file);
    
    // Open in new window/tab
    const newWindow = window.open(blobUrl, '_blank');
    
    if (!newWindow) {
      ToastrMessage.showError("Please allow popups to preview PDF files", "Popup Blocked");
      // Fallback: create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name;
      link.click();
    }
    
    // Clean up blob URL after some time
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);
  },

};
