/// <reference path="../../common/common.js" />
/// <reference path="course.js" />
/// <reference path="coursesummary.js" />

var CourseDetailsManager = {

  fetchInstituteComboBoxData: async function () {
    debugger;
    const serviceUrl = "/crm-institute-ddl";
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load institute data");
      }
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
    } catch (error) {
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  saveOrUpdateItem: async function () {
    const id = $("#courseId").val() || 0;
    const isCreate = id == 0;
    const serviceUrl = isCreate ? "/crm-course" : `/crm-course/${id}`;
    const httpType = isCreate ? "POST" : "PUT";
    const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
    const successMsg = isCreate ? "New data saved successfully." : "Information updated successfully.";

    const modelDto = CourseDetailsHelper.createItem();
    if (!modelDto) {
      throw new Error("Failed to create DTO object");
    }
    debugger;

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
          var jsonObject = JSON.stringify(modelDto);
          try {
            const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, jsonObject, httpType);
            if (response && (response.IsSuccess === true || response === "Success")) {
              ToastrMessage.showSuccess(successMsg);
              CourseDetailsHelper.clearForm();
              const windowId = "CoursePopUp";
              CommonManager.closeKendoWindow(windowId);
              $("#gridSummaryCourse").data("kendoGrid").dataSource.read();
            } else {
              throw new Error(response.Message || response || "Unknown error occurred");
            }
          } catch (err) {
            console.log(err);
            VanillaApiCallManager?.handleApiError?.(err);
          }
        }
      },
      { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }],
      0
    );
  },

  deleteItem: function (gridItem) {
    if (!gridItem) return;
    const serviceUrl = `/crm-course/${gridItem.CourseId}`;
    AjaxManager.MsgBox(
      "info",
      "center",
      "Confirmation",
      "Are you sure to delete this course?",
      [{
        addClass: "btn btn-primary",
        text: "Yes",
        onClick: async function ($noty) {
          $noty.close();
          try {
            const response = await VanillaApiCallManager.delete(baseApi, serviceUrl);
            if (response && response.IsSuccess === true) {
              ToastrMessage.showSuccess("Data deleted successfully.");
              CourseDetailsHelper.clearForm();
              $("#gridSummaryCourse").data("kendoGrid").dataSource.read();
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

var CourseDetailsHelper = {
  intCourseDetails: function () {
    CommonManager.initializeKendoWindow("#CoursePopUp", "Course Details", "80%");
    this.generateInstituteCombo();
    this.generateCurrencyCombo();
    this.initializeStartDatePicker();
    this.initializeEndDatePicker();
  },

  openCoursePopUp: function () {
    CourseDetailsHelper.clearForm();
    const windowId = "CoursePopUp";
    CommonManager.openKendoWindow(windowId, "Course Details", "80%");
    CommonManager.appandCloseButton(windowId);
  },

  // --- Institute Popup ---
  openInstitutePopup: function () {
    const windowId = "InstitutePopUp_Course";
    CommonManager.openKendoWindow(windowId, "Institute Info", "80%");
    if (typeof InstituteDetailsHelper !== "undefined") {
      InstituteDetailsHelper.instituteInit();
    }
    if (typeof InstituteSummaryHelper !== "undefined") {
      InstituteSummaryHelper.initInstituteSummary();
    }
    const buttonContainer = $(".btnDiv ul li");
    buttonContainer.find(".btn-close-generic").remove();
    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    buttonContainer.append(closeBtn);
  },

  // --- Currency Popup ---
  openCurrencyPopup: function () {
    const windowId = "CurrencyPopUp_Institute";
    CommonManager.openKendoWindow(windowId, "Currency Info", "80%");
    if (typeof CurrencySummaryHelper !== "undefined") {
      CurrencySummaryHelper.initCurrencySummary();
    }
    const buttonContainer = $(".btnDiv ul li");
    buttonContainer.find(".btn-close-generic").remove();
    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    buttonContainer.append(closeBtn);
  },

  refreshInstituteCombo: function () {
    this.generateInstituteCombo();
  },

  refreshCurrencyCombo: function () {
    this.generateCurrencyCombo();
  },

  generateInstituteCombo: function () {
    $("#cmbInstitute_Course").kendoComboBox({
      placeholder: "Select Institute...",
      dataTextField: "InstituteName",
      dataValueField: "InstituteId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    var instituteComboBoxInstant = $("#cmbInstitute_Course").data("kendoComboBox");
    if (instituteComboBoxInstant) {
      CourseDetailsManager.fetchInstituteComboBoxData().then(data => {
        instituteComboBoxInstant.setDataSource(data);
      }).catch(() => {
        instituteComboBoxInstant.setDataSource([]);
      });
    }
  },

  generateCurrencyCombo: function () {
    $("#cmbCurrency_Course").kendoComboBox({
      placeholder: "Select Currency...",
      dataTextField: "CurrencyName",
      dataValueField: "CurrencyId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    var currencyComboBoxInstant = $("#cmbCurrency_Course").data("kendoComboBox");
    if (currencyComboBoxInstant) {
      CourseDetailsManager.fetchCurrencyComboBoxData().then(data => {
        currencyComboBoxInstant.setDataSource(data);
      }).catch(() => {
        currencyComboBoxInstant.setDataSource([]);
      });
    }
  },

  // --- Date Picker Initializers ---
  initializeStartDatePicker: function () {
    $("#startDate_Course").kendoDatePicker({
      parseFormats: CommonManager.getMultiDateFormat(),
      format: "dd-MMM-yyyy"
      // placeholder option is ignored by Kendo DatePicker
    });
    // Set placeholder directly on the input
    $("#startDate_Course").attr("placeholder", "Select Start Date...");
  },

  initializeEndDatePicker: function () {
    $("#EndDate_Course").kendoDatePicker({
      parseFormats: CommonManager.getMultiDateFormat(),
      format: "dd-MMM-yyyy"
      // placeholder option is ignored by Kendo DatePicker
    });
    // Set placeholder directly on the input
    $("#EndDate_Course").attr("placeholder", "Select End Date...");
  },

  clearForm: function () {
    CommonManager.clearFormFields("#CourseForm");
    $("#btnCourseSaveOrUpdate").text("+ Add Course");
    $("#courseId").val(0);
    $("#btnCourseSaveOrUpdate").prop("disabled", false);
    
    // Clear date pickers
    if ($("#startDate_Course").data("kendoDatePicker")) {
      $("#startDate_Course").data("kendoDatePicker").value(null);
    }
    if ($("#EndDate_Course").data("kendoDatePicker")) {
      $("#EndDate_Course").data("kendoDatePicker").value(null);
    }
    
    // Clear ComboBox values but keep dataSource intact
    const instituteCombo = $("#cmbInstitute_Course").data("kendoComboBox");
    const currencyCombo = $("#cmbCurrency_Course").data("kendoComboBox");
    
    if (instituteCombo) {
      instituteCombo.value("");
      instituteCombo.text("");
    }
    if (currencyCombo) {
      currencyCombo.value("");
      currencyCombo.text("");
    }
  },

  createItem: function () {
    const instituteCbo = $("#cmbInstitute_Course").data("kendoComboBox");
    const currencyCbo = $("#cmbCurrency_Course").data("kendoComboBox");

    const instituteId = CommonManager.getComboValue(instituteCbo);
    const instituteName = CommonManager.getComboText(instituteCbo);
    const currencyId = CommonManager.getComboValue(currencyCbo);
    const currencyName = CommonManager.getComboText(currencyCbo);

    var dto = {};
    dto.CourseId = CommonManager.getInputValue("#courseId", 0);
    dto.InstituteId = instituteId;
    dto.CurrencyId = currencyId;
    dto.CourseTitle = CommonManager.getInputValue("#courseTitle");
    dto.CourseLevel = CommonManager.getInputValue("#courseLevel");
    dto.CourseFee = CommonManager.getNumericValue("#courseFee");
    dto.ApplicationFee = CommonManager.getNumericValue("#applicationFee_Course");
    dto.MonthlyLivingCost = CommonManager.getNumericValue("#monthlyLivingCost");
    dto.PartTimeWorkDetails = CommonManager.getInputValue("#partTimeWorkDetails");

    var startDatePicker = $("#startDate_Course").data("kendoDatePicker");
    var endDatePicker = $("#EndDate_Course").data("kendoDatePicker");
    dto.StartDate = startDatePicker ? startDatePicker.value() : null;
    dto.EndDate = endDatePicker ? endDatePicker.value() : null;

    dto.CourseBenefits = CommonManager.getInputValue("#courseBenefits");
    dto.LanguagesRequirement = CommonManager.getInputValue("#languagesRequirement");
    dto.CourseDuration = CommonManager.getInputValue("#courseDuration");
    dto.CourseCategory = CommonManager.getInputValue("#courseCategory");
    dto.AwardingBody = CommonManager.getInputValue("#awardingBody");
    dto.AdditionalInformationOfCourse = CommonManager.getInputValue("#additionalInformationOfCourse");
    dto.GeneralEligibility = CommonManager.getInputValue("#generalEligibility");
    dto.FundsRequirementforVisa = CommonManager.getInputValue("#fundsRequirementforVisa");
    dto.InstitutionalBenefits = CommonManager.getInputValue("#institutionalBenefits");
    dto.VisaRequirement = CommonManager.getInputValue("#visaRequirement");
    dto.CountryBenefits = CommonManager.getInputValue("#countryBenefits");
    dto.KeyModules = CommonManager.getInputValue("#keyModules");
    dto.Status = document.querySelector("#chkStatusCourse")?.checked || false;
    dto.After2YearsPswcompletingCourse = CommonManager.getInputValue("#after2YearsPswcompletingCourse");
    dto.DocumentId = CommonManager.getInputValue("#documentId");
    dto.InstituteName = instituteName;
    dto.CurrencyName = currencyName;
    return dto;
  },

  populateObject: function (item) {
    this.clearForm();
    $("#btnCourseSaveOrUpdate").text("Update Course");
    $("#courseId").val(item.CourseId);
    $("#courseTitle").val(item.CourseTitle);
    $("#courseLevel").val(item.CourseLevel);
    $("#courseFee").val(item.CourseFee);
    $("#applicationFee").val(item.ApplicationFee);
    $("#monthlyLivingCost").val(item.MonthlyLivingCost);
    $("#partTimeWorkDetails").val(item.PartTimeWorkDetails);

    // Set date pickers
    if ($("#startDate_Course").data("kendoDatePicker")) {
      $("#startDate_Course").data("kendoDatePicker").value(item.StartDate ? new Date(item.StartDate) : null);
    }
    if ($("#EndDate_Course").data("kendoDatePicker")) {
      $("#EndDate_Course").data("kendoDatePicker").value(item.EndDate ? new Date(item.EndDate) : null);
    }

    $("#courseBenefits").val(item.CourseBenefits);
    $("#languagesRequirement").val(item.LanguagesRequirement);
    $("#courseDuration").val(item.CourseDuration);
    $("#courseCategory").val(item.CourseCategory);
    $("#awardingBody").val(item.AwardingBody);
    $("#additionalInformationOfCourse").val(item.AdditionalInformationOfCourse);
    $("#generalEligibility").val(item.GeneralEligibility);
    $("#fundsRequirementforVisa").val(item.FundsRequirementforVisa);
    $("#institutionalBenefits").val(item.InstitutionalBenefits);
    $("#visaRequirement").val(item.VisaRequirement);
    $("#countryBenefits").val(item.CountryBenefits);
    $("#keyModules").val(item.KeyModules);
    $("#chkStatusCourse").prop("checked", item.Status);
    $("#after2YearsPswcompletingCourse").val(item.After2YearsPswcompletingCourse);
    $("#documentId").val(item.DocumentId);

    // Set ComboBox values after ensuring data is loaded
    this.setComboBoxValues(item);
  },

  setComboBoxValues: function(item) {
    // Function to set ComboBox values with data loading check
    const setInstituteValue = () => {
      const instituteCombo = $("#cmbInstitute_Course").data("kendoComboBox");
      if (instituteCombo && instituteCombo.dataSource.total() > 0) {
        instituteCombo.value(item.InstituteId);
      } else if (instituteCombo) {
        // If dataSource is empty, load data first
        CourseDetailsManager.fetchInstituteComboBoxData().then(data => {
          instituteCombo.setDataSource(data);
          setTimeout(() => instituteCombo.value(item.InstituteId), 100);
        }).catch(() => {
          instituteCombo.setDataSource([]);
        });
      }
    };

    const setCurrencyValue = () => {
      const currencyCombo = $("#cmbCurrency_Course").data("kendoComboBox");
      if (currencyCombo && currencyCombo.dataSource.total() > 0) {
        currencyCombo.value(item.CurrencyId);
      } else if (currencyCombo) {
        // If dataSource is empty, load data first
        CourseDetailsManager.fetchCurrencyComboBoxData().then(data => {
          currencyCombo.setDataSource(data);
          setTimeout(() => currencyCombo.value(item.CurrencyId), 100);
        }).catch(() => {
          currencyCombo.setDataSource([]);
        });
      }
    };

    // Set values with slight delay to ensure ComboBox is ready
    setTimeout(() => {
      setInstituteValue();
      setCurrencyValue();
    }, 150);
  }
};
