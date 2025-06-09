

/// <reference path="../../common/common.js" />
/// <reference path="institute.js" />
/// <reference path="institutesummary.js" />

/* =========================================================
   InstituteDetailsManager : Save / Update / Delete
=========================================================*/

var InitiateDetailsManager = {
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
    const id = $("#instituteId").val() || 0;
    const isCreate = id == 0;
    /* ⬇️ শুধুই আলাদা এন্ডপয়েন্ট ব্যবহার করছি */
    const serviceUrl = isCreate
      ? "/crm-institute/create"
      : `/crm-institute/update/${id}`;
    const httpType = isCreate ? "POST" : "PUT";
    const confirmMsg = isCreate
      ? "Do you want to save information?"
      : "Do you want to update information?";
    const successMsg = isCreate
      ? "New data saved successfully."
      : "Information updated successfully.";

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
          const dto = InstituteDetailsHelper.createItem();
          try {
            await AjaxManager.PostDataAjax(
              baseApi, serviceUrl, JSON.stringify(dto), httpType);

            ToastrMessage.showToastrNotification({
              preventDuplicates: true, closeButton: true,
              timeOut: 3000, message: successMsg, type: "success"
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

    const serviceUrl = `/crm-institute/delete/${gridItem.InstituteId}`;
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
    //CommonManager.initializeKendoWindow("InstituteTypePopUp_Institute", "Institute Type Info", "80%");
    //CommonManager.initializeKendoWindow("CountryPopUp_Institute", "Country Info", "80%");
    //CommonManager.initializeKendoWindow("CurrencyPopUp_Institute", "Currency Info", "80%");
    this.generateInstituteTypeCombo();
    this.generateCountryCombo();
    this.generateCurrencyCombo();

    //CommonManager.initializeKendoWindow("#CountryPopUp", "Country Details", "80%");
    //CommonManager.initializeKendoWindow("#course_InstitutePopUp", "Inistitute Details", "80%");
    //CommonManager.initializeKendoWindow("#course_CoursePopUp", "Course Details", "80%");
    //CommonManager.initializeKendoWindow("#CurrencyPopUp_Course", "Currency Details", "80%");

    //this.generateCountryCombo_Institute();
    //this.generateCountryCombo();
    //this.generateInstituteCombo();
    //this.generateCourseCombo();
    //this.generateIntakeMonthCombo();
    //this.generateIntakeYearCombo();
    //this.generateCurrencyCombo();
    //this.generatePaymentMethodCombo();
    //this.initializePaymentDate();

  },

  /* ------ PopUp UI ------ */
  openInistitutePopUp: function () {
    CommonManager.openKendoWindow("#InstitutePopUp", "Institute Details", "80%");
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
    CommonManager.openKendoWindow("CountryPopUp_Institute", "Country Info", "80%");
    CountrySummaryHelper.initCountrySummary();
  },

  openCurrencyPopup: function () {
    CommonManager.openKendoWindow("CurrencyPopUp_Institute", "Currency Info", "80%");
    CurrencySummaryHelper.initCurrencySummary();
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
      InitiateDetailsManager.fetchInstituteTypeComboBoxData().then(data => {
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
      InitiateDetailsManager.fetchCountryComboBoxData().then(data => {
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
      InitiateDetailsManager.fetchCurrencyComboBoxData().then(data => {
        currencyComboBoxInstant.setDataSource(data);
      });
    }
  },






  /* ------ Clear Form ------ */
  clearForm: function () {
    CommonManager.clearFormFields("#InstituteForm");
    $("#btnInstituteSaveOrUpdate").text("+ Add Institute");
    $("#instituteId").val(0);
  },

  /* ------ Create DTO Object ------ */
  createItem: function () {

    // ComboBox Instance
    const countryCbo = $("#cmbInstituteCountryId").data("kendoComboBox");
    const currencyCbo = $("#cmbInstituteCurrencyId").data("kendoComboBox");
    const typeCbo = $("#cmbInstituteTypeId").data("kendoComboBox");

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

    /* Files (পাথ শো করতে চাইলে) */
    // $('#institutionLogoFile').val(item.InstitutionLogo);
    // $('#prospectusFile').val(item.InstitutionProspectus);

    $("#chkStatusInstitute").prop("checked", item.Status);
  },


  /* ------ PopUP ------ */


  generateCountryPopUp: function () {
    debugger;
    var countryPopUp = $("#CountryPopUp").data("kendoWindow");
    if (!countryPopUp) return;
    countryPopUp.center().open();

    if (countryPopUp) {
      var countryGridInstance = $("#gridSummaryCountry").data("kendoGrid")

      const grid = $("#gridSummaryCountry").data("kendoGrid");
      if (!grid) {
        CountrySummaryHelper.initCountrySummary();
        if (grid?.dataSource) {
          isCountryDataLoaded = true;
        }
      } else {
        grid.resize();
        if (!isCountryDataLoaded) {
          grid.dataSource.read();
          isCountryDataLoaded = true;
        }
      }
    }
  },
  generateCoursePopUp: function () {
    var couresePopUp = $("#course_CoursePopUp").data("kendoWindow");
    if (couresePopUp) {
      couresePopUp.open().center();
    }
  },



};
