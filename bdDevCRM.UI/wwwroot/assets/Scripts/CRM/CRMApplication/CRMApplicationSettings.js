/// <reference path="CRMAdditionalInformation.js" />
/// <reference path="CRMCourseInformation.js" />
/// <reference path="CRMEducationNEnglishLanguage.js" />

$(document).ready(function () {

  console.log("=== CRM Application System Initializing ===");
  console.log("Bangladesh Development CRM System - Managing Institute and Course Information from Various Countries");

  CRMApplicationHelper.createTabstrip();
  CRMApplicationHelper.initCrmApplicationSummary();

  CRMEducationNEnglishLanguagHelper.initEducationNEnglishtLanguage();
  CRMAdditionalInformationHelper.initAdditionalInformation();

  CRMCourseInformationHelper.intCourse();

});


/* =========================================================
   CRMApplicationManager : Save/Update Application Form
=========================================================*/
var CRMApplicationManager = {


  /* ------- Application Summary Grid Data Source -------- */
  getApplicationGridDataSource: function (statusId) {
    return VanillaApiCallManager.GenericGridDataSource({
      //apiUrl: baseApi + "/crm-application-summary",
      apiUrl: baseApi + `/crm-application-summary/${statusId}`,
      requestType: "POST",
      async: true,
      modelFields: { createdDate: { type: "date" } },
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Data.Items",
      schemaTotal: "Data.TotalCount"
    });
  },

  getApplicationByApplicationId: async function (applicationId) {
    debugger;
    if (!applicationId) {
      return Promise.resolve([]);
    }

    const serviceUrl = `/crm-application-by-applicationId/${applicationId}`;
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load institute data");
      }
    } catch (error) {
      console.log("Error loading institute data:" + error);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },

  /* -------- Save ⬌ Update -------- */
  saveOrUpdateItem: async function () {
    try {
      const id = $("#hdnApplicationId").val() || 0;
      const isCreate = id == 0;
      const serviceUrl = isCreate ? "/crm-application" : `/crm-application/${id}`;
      const httpType = isCreate ? "POST" : "PUT";
      const confirmMsg = isCreate ? "Do you want to save the application?" : "Do you want to update the application?";
      const successMsg = isCreate ? "Application saved successfully." : "Application updated successfully.";

      //// Validate all form sections before proceeding
      //if (!CRMApplicationManager.validateAllSections()) {
      //  ToastrMessage.showError("Please complete all required fields before saving.", "Validation Error", 0);
      //  return;
      //}

      // Create comprehensive application object from all three sections
      const applicationData = CRMApplicationHelper.createCompleteApplicationObject();

      if (!applicationData) {
        throw new Error("Failed to create application data object");
      }

      // NEW APPROACH: Integrate all files into the application data object
      const applicationDataWithFiles = CRMApplicationHelper.integrateAllFilesIntoApplicationData(applicationData);

      // Convert the complete nested object (including files) to FormData
      const formData = CRMApplicationHelper.convertNestedObjectToFormData(applicationDataWithFiles);

      // Log FormData contents to console for debugging
      console.log("=== FormData Contents ===");
      console.log("FormData entries count:", Array.from(formData.entries()).length);

      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [FILE] ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      console.log("=== End FormData Contents ===");


      //console.log("=== FormData Prepared ===");
      //for (let pair of formData.entries()) {
      //  if (pair[1] instanceof File) {
      //    console.log(`${pair[0]} => [FILE: ${pair[1].name}]`);
      //  } else {
      //    console.log(`${pair[0]} => ${pair[1]}`);
      //  }
      //}

      // Confirmation popup before sending
      CommonManager.MsgBox("info", "center", "Confirmation", confirmMsg, [
        {
          addClass: "btn btn-primary",
          text: "Yes",
          onClick: async function ($noty) {
            $noty.close();

            // Show loading indicator and lock screen
            CommonManager.showProcessingOverlay("Saving application... Please wait.");

            try {
              const response = await VanillaApiCallManager.SendRequestVanilla(
                baseApi,
                serviceUrl,
                formData,
                httpType,
                {
                  skipContentTypeHeader: true,
                  timeout: 600000, // Increased timeout for large file uploads
                  requireAuth: true
                }
              );

              if (response && response.IsSuccess === true) {
                ToastrMessage.showSuccess(successMsg, "Success", 3000);

                // Clear all form sections
                CRMApplicationHelper.clearForm();

                //// Close any open windows
                //if (typeof CommonManager !== "undefined") {
                //  CommonManager.closeKendoWindow("ApplicationWindow");
                //}

                // Refresh any related grids if they exist
                const applicationGrid = $("#gridApplicationSummary").data("kendoGrid");
                if (applicationGrid) {
                  applicationGrid.dataSource.read();
                }

                // Store application ID for future updates
                if (isCreate && response.Data && response.Data.ApplicationId) {
                  $("#applicationId").val(response.Data.ApplicationId);
                }

              } else {
                throw new Error(response.Message || "Unknown error occurred while saving application");
              }
            } catch (err) {
             /* console.error("=== Application Save Error ===", err);*/
              VanillaApiCallManager.handleApiError(err);
              ToastrMessage.showError("Failed to save application. Please try again.", "Save Error", 0);
            }
            finally {
              // Hide loading indicator
              CommonManager.hideProcessingOverlay();
            }
          }
        },
        { addClass: "btn", text: "Cancel", onClick: $n => $n.close() }
      ], 0);

    } catch (error) {
      console.error("=== Application Save/Update Error ===", error);
      VanillaApiCallManager.handleApiError(error);
      ToastrMessage.showError("Error preparing application data: " + error.message, "Preparation Error", 0);
    }
  },

  /* -------- Validate All Sections -------- */
  validateAllSections: function () {
    try {
      let isValid = true;
      const validationErrors = [];

      // Validate Course Information
      if (typeof CRMCourseInformationHelper !== "undefined" &&
        typeof CRMCourseInformationHelper.validateCompleteForm === "function") {
        const courseValid = CRMCourseInformationHelper.validateCompleteForm();
        if (!courseValid) {
          isValid = false;
          validationErrors.push("Course Information validation failed");
        }
      }

      // Validate Education & English Language
      if (typeof CRMEducationNEnglishLanguagHelper !== "undefined" &&
        typeof CRMEducationNEnglishLanguagHelper.validateEducationCompleteForm === "function") {
        const educationValid = CRMEducationNEnglishLanguagHelper.validateEducationCompleteForm();
        if (!educationValid) {
          isValid = false;
          validationErrors.push("Education & English Language validation failed");
        }
      }

      // Validate Additional Information
      if (typeof CRMAdditionalInformationHelper !== "undefined" &&
        typeof CRMAdditionalInformationHelper.validateAdditionalInformationForm === "function") {
        const additionalValid = CRMAdditionalInformationHelper.validateAdditionalInformationForm();
        if (!additionalValid) {
          isValid = false;
          validationErrors.push("Additional Information validation failed");
        }
      }

      if (!isValid) {
        console.log("Application validation errors:", validationErrors);
      }

      return isValid;

    } catch (error) {
      console.error("Error validating application sections:", error);
      return false;
    }
  },

  /* -------- Export Complete Application Data -------- */
  exportCompleteApplicationDataAsJSON: function () {
    try {
      const completeApplicationData = CRMApplicationHelper.createCompleteApplicationObject();
      const jsonData = JSON.stringify(completeApplicationData, null, 2);

      console.log("=== Complete Application Data (JSON) ===");
      console.log(jsonData);

      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showSuccess("Complete application data exported to console. Check browser console for JSON output.", "Export Successful", 3000);
      }

      return jsonData;
    } catch (error) {
      console.error("Error exporting complete application data as JSON:", error);
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error exporting complete application data: " + error.message, "Export Error", 0);
      }
      return null;
    }
  },

  /* -------- Fill Demo Data for All Sections -------- */
  fillCompleteApplicationDemoData: function () {
    try {
      console.log("=== Filling Complete Application Demo Data ===");

      // Fill Course Information Demo Data
      if (typeof CRMCourseInformationHelper !== "undefined" &&
        typeof CRMCourseInformationHelper.fillDemoData === "function") {
        CRMCourseInformationHelper.fillDemoData();
      }

      // Fill Education & English Language Demo Data
      if (typeof CRMEducationNEnglishLanguagHelper !== "undefined" &&
        typeof CRMEducationNEnglishLanguagHelper.fillEducationDemoData === "function") {
        CRMEducationNEnglishLanguagHelper.fillEducationDemoData();
      }

      // Fill Additional Information Demo Data
      if (typeof CRMAdditionalInformationHelper !== "undefined" &&
        typeof CRMAdditionalInformationHelper.fillAdditionalInfoDemoData === "function") {
        CRMAdditionalInformationHelper.fillAdditionalInfoDemoData();
      }

      console.log("Complete application demo data filled successfully");
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showSuccess("Complete application demo data filled successfully!", "Demo Data", 3000);
      }

    } catch (error) {
      console.error("Error filling complete application demo data:", error);
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error filling complete application demo data: " + error.message, "Demo Data Error", 0);
      }
    }
  },

  // Replace old GetStatusByMenuUser with this async version
  getStatusByMenuUser: async function () {
    try {
      const serviceUrl = "/crm-application-status";
      const res = await VanillaApiCallManager.get(baseApi, serviceUrl);

      if (res && res.IsSuccess === true && Array.isArray(res.Data)) {
        return res.Data; // expects [{ WFStateId, StateName }, ...]
      }
      return [];
    } catch (err) {
      console.error("Error loading status by menu user:", err);
      if (typeof VanillaApiCallManager !== "undefined") {
        VanillaApiCallManager.handleApiError(err);
      }
      return [];
    }
  },

};




/* =========================================================
   CRMApplicationHelper : Application Form
=========================================================*/
var CRMApplicationHelper = {
  _busy: false,
  _loadRunId: 0,

  createTabstrip: function () {
    console.log("Creating Kendo TabStrip...");

    $("#tabstrip").kendoTabStrip({
      select: function (e) {
        // Ensure only one tab has the 'k-state-active' class
        $("#tabstrip ul li").removeClass("k-state-active");
        $(e.item).addClass("k-state-active");

        var selectedTabText = $(e.item).find("a").text().trim();
        console.log("Selected Tab:", selectedTabText);
      }
    });

    var tabStrip = $("#tabstrip").data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0); // Ensure the first tab is selected by default
      console.log("TabStrip Successfully Created - First Tab Selected");
    } else {
      console.log("Kendo TabStrip Failed to Initialize.");
    }
  },

  /*********************** Common Function Start ***********************************************/
  // Rewrite to use CRMApplicationManager and Kendo safely
  populateStatusByMenuUser: async function (elementSelector = "#cmbStatus") {
    try {
      const $el = $(elementSelector);
      if (!$el.length) return;

      // fetch data
      const data = await CRMApplicationManager.getStatusByMenuUser();
      // insert "All" at 0th sequence
      data.unshift({ StateName: "Select Status", WfStateId: 0 });

      // destroy previous widget if any
      const existing = $el.data("kendoDropDownList");
      if (existing) { existing.destroy(); $el.off(); }

      // init kendo dropdown (without optionLabel)
      $el.kendoDropDownList({
        dataTextField: "StateName",
        dataValueField: "WfStateId",
        dataSource: data,
        valuePrimitive: true,
        value: data[0]?.WfStateId || 0,
        filter: "contains",
        suggest: true
      });

      //// init kendo dropdown with computed default
      //$el.kendoDropDownList({
      //  optionLabel: { StateName: "Select Status", WfStateId: 0 },
      //  dataTextField: "StateName",
      //  dataValueField: "WfStateId",
      //  dataSource: data,
      //  valuePrimitive: true,
      //  value: data[0]?.WfStateId || 0,
      //  filter: "contains",
      //  suggest: true
      //});

      // if admin then set deafult falue otherwise set first sequence of users state data.
      const dd = $el.data("kendoDropDownList");
      if (dd) dd.value(data[0]?.WfStateId || 0);

      //debugger
      //if (accessArray && accessArray.length > 0) {
      //  // Check if any item in accessArray has RefferenceId == 3
      //  if (accessArray.some(function (item) { return item.ReferenceID === 3; })) {

      //    // Proceed to check for "recommendation" in StateName in data
      //    var containsRecommendation = data.find(function (item) {
      //      return item.StateName.toLowerCase().includes("recommendation");
      //    });

      //    // If found, set the value of the Kendo ComboBox
      //    if (containsRecommendation) {
      //      $("#cmbStatusForSummary").data("kendoComboBox").value(containsRecommendation.WFStateId);
      //    }
      //  }

      //  // Check if any item in accessArray has RefferenceId == 4
      //  if (accessArray.some(function (item) { return item.ReferenceID === 4; })) {

      //    // Proceed to check for "recommendation" in StateName in data
      //    var containsApproval = data.find(function (item) {
      //      return item.StateName.toLowerCase().includes("approval");
      //    });

      //    // If found, set the value of the Kendo ComboBox
      //    if (containsApproval) {
      //      $("#cmbStatusForSummary").data("kendoComboBox").value(containsApproval.WFStateId);
      //    }
      //  }


      //  // Check if any item in accessArray has RefferenceId == 22
      //  if (accessArray.some(function (item) { return item.ReferenceID === 22; })) {

      //    // Proceed to check for "recommendation" in StateName in data
      //    var containsHR = data.find(function (item) {
      //      return item.StateName.toLowerCase().includes("hr");
      //    });

      //    // If found, set the value of the Kendo ComboBox
      //    if (containsHR) {
      //      $("#cmbStatusForSummary").data("kendoComboBox").value(containsHR.WFStateId);
      //    }
      //  }

      //  if (assembly.AssemblyInfoId == 14) {
      //    // Check if any item in accessArray has RefferenceId == 22
      //    if (accessArray.some(function (item) { return item.ReferenceID === 31; })) {

      //      // Proceed to check for "recommendation" in StateName in data
      //      var containsHR = data.find(function (item) {
      //        return item.StateName.toLowerCase().includes("higher");
      //      });

      //      // If found, set the value of the Kendo ComboBox
      //      if (containsHR) {
      //        $("#cmbStatusForSummary").data("kendoComboBox").value(containsHR.WFStateId);
      //      }
      //    }
      //  }

      //}



    } catch (err) {
      console.error("Error populating status dropdown:", err);
      if (typeof VanillaApiCallManager !== "undefined") {
        VanillaApiCallManager.handleApiError(err);
      }
    }
  },

  PopulatePerformanceReviewStatusForJobConfirmation: function () {
    var obj = new Object();

    obj = PerformanceReviewManager.PopulatePerformanceReviewStatusForJobConfirmation();

    var combo = $("#cmbStatusForSummary").kendoComboBox({
      placeholder: "Select Section",
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: obj
    }).data('kendoComboBox');
    if (assembly.AssemblyInfoId != 14) {
      combo.dataSource.insert(0, { WFStateId: 0, StateName: 'All' });
    }
    debugger
    if (accessArray && accessArray.length > 0) {
      // Check if any item in accessArray has RefferenceId == 3
      if (accessArray.some(function (item) { return item.ReferenceID === 3; })) {

        // Proceed to check for "recommendation" in StateName in obj
        var containsRecommendation = obj.find(function (item) {
          return item.StateName.toLowerCase().includes("recommendation");
        });

        // If found, set the value of the Kendo ComboBox
        if (containsRecommendation) {
          $("#cmbStatusForSummary").data("kendoComboBox").value(containsRecommendation.WFStateId);
        }
      }

      // Check if any item in accessArray has RefferenceId == 4
      if (accessArray.some(function (item) { return item.ReferenceID === 4; })) {

        // Proceed to check for "recommendation" in StateName in obj
        var containsApproval = obj.find(function (item) {
          return item.StateName.toLowerCase().includes("approval");
        });

        // If found, set the value of the Kendo ComboBox
        if (containsApproval) {
          $("#cmbStatusForSummary").data("kendoComboBox").value(containsApproval.WFStateId);
        }
      }


      // Check if any item in accessArray has RefferenceId == 22
      if (accessArray.some(function (item) { return item.ReferenceID === 22; })) {

        // Proceed to check for "recommendation" in StateName in obj
        var containsHR = obj.find(function (item) {
          return item.StateName.toLowerCase().includes("hr");
        });

        // If found, set the value of the Kendo ComboBox
        if (containsHR) {
          $("#cmbStatusForSummary").data("kendoComboBox").value(containsHR.WFStateId);
        }
      }

      if (assembly.AssemblyInfoId == 14) {
        // Check if any item in accessArray has RefferenceId == 22
        if (accessArray.some(function (item) { return item.ReferenceID === 31; })) {

          // Proceed to check for "recommendation" in StateName in obj
          var containsHR = obj.find(function (item) {
            return item.StateName.toLowerCase().includes("higher");
          });

          // If found, set the value of the Kendo ComboBox
          if (containsHR) {
            $("#cmbStatusForSummary").data("kendoComboBox").value(containsHR.WFStateId);
          }
        }
      }

    }

  },






  /*********************** Common Function End ***********************************************/

  /* -------- CRM Application Grid -------- */

  initCrmApplicationSummary: function () {
    debugger;
    this.initializeSummaryGrid();

    this.loadStatusDropdownData()
      .catch(err => {
        VanillaApiCallManager?.handleApiError?.(err);
      })
      .finally(() => {
        this.setGridDataSource();
      });
  },

  initializeSummaryGrid: function () {

    var Columns = this.generateColumns();
    var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(Columns);
    var containerWidth = $("#divSummary").width() || (window.innerWidth - 323);
    var gridWidth = totalColumnsWidth > containerWidth ? "100%" : `${totalColumnsWidth}px`;


    const gridOptions = {
      toolbar: [
        { template: '<button type="button" id="btnAddNew" class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" onclick="CRMApplicationHelper.showForm();"><span class="k-button-text"> + Create New </span></button>' },
        { name: "excel" },
        { name: "pdf" },
        { template: '<button type="button" id="btnExportApplicationCsv" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' },
        { template: '<div class="ms-auto d-flex align-items-center" style="gap:8px;"><label class="fw-semibold">Status:</label><input id="cmbStatusToolbar" style="width: 240px;" /></div>' }
      ],
      excel: {
        fileName: "Application_List_" + Date.now() + ".xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      pdf: {
        fileName: "Application_List_" + Date.now() + ".pdf",
        allPages: true,
        paperSize: "A4",
        landscape: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        scale: 0.9,
        repeatHeaders: true,
      },
      dataSource: [],
      autoBind: true,
      navigatable: true,
      scrollable: true,
      resizable: true,
      width: gridWidth,
      filterable: true,
      sortable: true,
      pageable: {
        refresh: true,
        pageSizes: [10, 50, 100,500,1000],
        buttonCount: 5,
        input: false,
        numeric: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      columns: Columns,
      editable: false,
      selectable: true,
      error: function (e) {
        VanillaApiCallManager.handleApiError(e);
      }
    };

    // Initialize the Kendo Grid (empty)
    $("#gridSummaryCrmApplication").kendoGrid(gridOptions);

    // CSV Export button event
    $("#btnExportApplicationCsv").on("click", function () {
      CommonManager.GenerateCSVFileAllPages("gridSummaryCrmApplication", "Application", "Actions");
    });
  },

  // Status Dropdown Loader for (Toolbar '#cmbStatusToolbar')
  loadStatusDropdownData: async function () {
    // Populate Dropdown ()
    await CRMApplicationHelper.populateStatusByMenuUser("#cmbStatusToolbar");

    // tiye dropdown change event handler
    const dd = $("#cmbStatusToolbar").data("kendoDropDownList");
    if (dd) {
      dd.bind("change", function () {
        const grid = $("#gridSummaryCrmApplication").data("kendoGrid");
        const statusId = dd.value() || 0;
        // if there are no dataset for grid then no issue for change
        if (grid && grid.dataSource) {
          grid.dataSource.read({ StatusId: statusId });
        }
      });
    }
  },

  setGridDataSource: function () {
    const grid = $("#gridSummaryCrmApplication").data("kendoGrid");
    if (grid) {
      const dd = $("#cmbStatusToolbar").data("kendoDropDownList");
      const ds = CRMApplicationManager.getApplicationGridDataSource(dd.value() || 0);

      // Add data source error handling
      ds.bind("error", function (error) {
        VanillaApiCallManager.handleApiError(error);
      });

      // Add data source success handling
      ds.bind("requestEnd", function (e) {
        console.log(ds);
        if (e.response && e.response.isSuccess === false) {
          VanillaApiCallManager.handleApiError(e.response);
        }
      });

      grid.setDataSource(ds);

      //const dd = $("#cmbStatusToolbar").data("kendoDropDownList");
      //const statusId = dd ? (dd.value() || 0) : 0;
      //ds.read({ StatusId: statusId });
    }
  },

  showForm: function () {
    debugger;
    CommonManager.formShowGridHide("CrmApplcationFormShowHide", "CrmApplicationGridShowHide");
  },

  closeForm: function () {
    debugger;
    this.clearForm();
    CommonManager.formHideGridShow("CrmApplcationFormShowHide", "CrmApplicationGridShowHide");
    CommonManager.MakeFormEditable("#CRMApplicationForm");
  },

  /* -------- Generate Grid Columns -------- */
  generateColumns: function () {
    return [
      // Hidden ID Fields
      { field: "ApplicationId", hidden: true },
      { field: "ApplicantId", hidden: true },
      { field: "ApplicantCourseId", hidden: true },
      { field: "CountryId", hidden: true },
      { field: "InstituteId", hidden: true },
      { field: "CourseId", hidden: true },
      { field: "CurrencyId", hidden: true },
      { field: "PaymentMethodId", hidden: true },
      { field: "GenderId", hidden: true },
      { field: "MaritalStatusId", hidden: true },
      { field: "PermanentAddressId", hidden: true },
      { field: "PresentAddressId", hidden: true },

      //// ApplicantImage
      //{
      //  field: "ApplicantImagePath",
      //  title: "Photo",
      //  width: "100px",
      //  template: function (dataItem) {
      //    if (!dataItem.ApplicantImagePath) return `<span style="color:#888">No Photo</span>`;
      //    // baseApiFilePath from common js
      //    const fullUrl = `${baseApiFilePath}${dataItem.ApplicantImagePath}`;
      //    return `<img src="${fullUrl}" 
      //           style="height:50px; max-width:100px; object-fit:contain; cursor:pointer;"
      //           onclick="PreviewManger.openGridImagePreview('${dataItem.ApplicantImagePath}')" />`;
      //  }
      //}


      { field: "RowIndex", title: "SL", width: "60px", filterable: false },
      // File Indicators
      {
        field: "ApplicantImagePath",
        title: "Photo",
        width: "80px",
        template: function (dataItem) {
          if (dataItem.ApplicantImagePath) `return <span style="color:#888">No Photo</span>`;
          // baseApiFilePath from common js
          const fullUrl = `${baseApiFilePath}${dataItem.ApplicantImagePath}`;
            return `<img src="${fullUrl}" 
                   style="height:40px; width:40px; object-fit:cover; border-radius:50%; cursor:pointer;"
                   onclick="PreviewManger.openGridImagePreview('${dataItem.ApplicantImagePath}')" />`;
         
          
        }
      },

      { field: "ApplicantName", title: "Name", width: "180px" },

      // Basic Application Info
      { field: "ApplicationDate", title: "Application<br/>Date", width: "120px", template: "#= ApplicationDate ? kendo.toString(new Date(ApplicationDate), 'dd-MMM-yyyy') : '' #" },
      { field: "ApplicationStatus", title: "Status", width: "100px" },

      // Personal Details
      { field: "EmailAddress", title: "Email", width: "160px" },
      { field: "Mobile", title: "Mobile", width: "120px" },
      { field: "DateOfBirth", title: "Date of Birth", width: "120px", template: "#= DateOfBirth ? kendo.toString(new Date(DateOfBirth), 'dd-MMM-yyyy') : '' #" },
      { field: "GenderName", title: "Gender", width: "80px" },
      { field: "Nationality", title: "Nationality", width: "100px" },

      // Passport Information
      { field: "HasValidPassport", title: "Valid<br/>Passport", width: "80px" },
      { field: "PassportNumber", title: "Passport No", width: "120px" },
      { field: "PassportExpiryDate", title: "Passport<br/>Expiry", width: "120px", template: "#= PassportExpiryDate ? kendo.toString(new Date(PassportExpiryDate), 'dd-MMM-yyyy') : '' #" },

      // Course Information
      { field: "CountryName", title: "Country", width: "120px" },
      { field: "InstituteName", title: "Institute", width: "200px" },
      { field: "CourseTitle", title: "Course", width: "200px" },
      { field: "IntakeMonth", title: "Intake<br/>Month", width: "100px" },
      { field: "IntakeYear", title: "Intake<br/>Year", width: "80px" },

      // Financial Information
      { field: "ApplicationFee", title: "Application<br/>Fee", width: "100px" },
      { field: "CurrencyName", title: "Currency", width: "90px" },
      { field: "PaymentMethod", title: "Payment<br/>Method", width: "120px" },
      { field: "PaymentDate", title: "Payment<br/>Date", width: "120px", template: "#= PaymentDate ? kendo.toString(new Date(PaymentDate), 'dd-MMM-yyyy') : '' #" },
      { field: "PaymentReferenceNumber", title: "Payment<br/>Reference", width: "140px" },

      // Address Information
      { field: "PermanentCountryName", title: "Permanent<br/>Country", width: "120px" },
      { field: "PermanentCity", title: "Permanent<br/>City", width: "100px" },
      { field: "PresentCountryName", title: "Present<br/>Country", width: "120px" },
      { field: "PresentCity", title: "Present<br/>City", width: "100px" },

      // English Language Tests (Summary)
      { field: "IELTSOverallBand", title: "IELTS<br/>Band", width: "80px" },
      { field: "TOEFLOverallScore", title: "TOEFL<br/>Score", width: "80px" },
      { field: "PTEOverallScore", title: "PTE<br/>Score", width: "80px" },

      // Education Summary
      { field: "HighestEducationLevel", title: "Highest<br/>Education", width: "140px" },
      { field: "EducationGPA", title: "GPA", width: "70px" },

      // Work Experience
      { field: "TotalWorkExperience", title: "Work<br/>Experience", width: "100px" },

      // Additional Information
      { field: "HasStatementOfPurpose", title: "Statement<br/>of Purpose", width: "100px", template: "#= HasStatementOfPurpose ? 'Yes' : 'No' #" },
      { field: "AdditionalDocumentsCount", title: "Additional<br/>Documents", width: "100px" },

      // Action buttons
      {
        field: "Action", title: "#", filterable: false, width: "230px",
        template: `
        <input type="button" class="btn btn-outline-success widthSize30_per"
               value="View" onClick="CRMApplicationHelper.clickEventForViewButton(event)" />
        <input type="button" class="btn btn-outline-dark me-1 widthSize30_per"
               value="Edit" onClick="CRMApplicationHelper.clickEventForEditButton(event)" />
        <input type="button" class="btn btn-outline-danger widthSize33_per"
               value="Delete" onClick="CRMApplicationHelper.clickEventForDeleteButton(event)" />
      `
      }
    ]
  },

  /* -------- Populate Object from Grid Item -------- */

  /* --- Action Handlers --- */
  _getGridItem: function (event) {
    const grid = $("#gridSummaryCrmApplication").data("kendoGrid");
    const tr = $(event.target).closest("tr");
    //return grid.dataItem(tr);
    let selectedItem = grid.dataItem(tr);
    console.log(selectedItem);
    const selectedRows = grid.select();
    if (selectedRows.length > 0) {
      selectedItem = grid.dataItem(selectedRows[0]);
      console.log(selectedItem);
    }

    return selectedItem;
  },

  clickEventForViewButton: async function (event) {
    if (this._busy) return;
    this._busy = true;
    const runId = ++this._loadRunId;
    try {
      const item = this._getGridItem(event);
      if (!item) return;

      CommonManager.formShowGridHide("CrmApplcationFormShowHide", "CrmApplicationGridShowHide");
      //this.clearForm();
      this.clearCRMApplicationCourse();

      const applicationData = await CRMApplicationManager.getApplicationByApplicationId(item.ApplicationId);
      if (runId !== this._loadRunId) return; // stale response

      this.populateObject(applicationData);
      CommonManager.MakeFormReadOnly("#CRMApplicationForm");
      $("#btnSaveOrUpdate").hide();
    } catch (err) {
      VanillaApiCallManager?.handleApiError?.(err);
    } finally {
      this._busy = false;
    }
  },

  // clearCRMApplicationCourse function টা modify করুন:
  clearCRMApplicationCourse: function () {
    try {
      console.log("=== Clearing Course Information Form ===");

      // Clear form fields but preserve combo box data sources
      $("input[type='text'], input[type='number'], input[type='email'], textarea").val("");
      $("input[type='checkbox'], input[type='radio']").prop("checked", false);

      // Clear date pickers
      const datePickerIds = ["#datePickerPaymentDate", "#datePickerDateOfBirth", "#datepickerPassportIssueDate", "#datepickerPassportExpiryDate"];
      datePickerIds.forEach(id => {
        const picker = $(id).data("kendoDatePicker");
        if (picker) picker.value(null);
      });

      // Clear combo box VALUES but keep DATA SOURCES intact
      const comboBoxIds = [
        "#cmbCountryForCourse", "#cmbInstituteForCourse", "#cmbCourseForCourse",
        "#cmbIntakeMonthForCourse", "#cmbIntakeYearForCourse", "#cmbCurrencyForCourse",
        "#cmbPaymentMethodForCourse", "#cmbGenderForCourse", "#cmbTitleForCourse",
        "#cmbMaritalStatusForCourse", "#cmbCountryForPermanentAddress", "#cmbCountryForAddress"
      ];

      comboBoxIds.forEach(id => {
        const combo = $(id).data("kendoComboBox");
        if (combo) {
          combo.value(""); // Clear value but keep data source
        }
      });

      // Clear hidden fields
      $("input[type='hidden']").val(0);

      // Clear applicant image
      $("#applicantImageThumb").addClass("d-none").attr("src", "#");
      applicantImageFile = null;

      $("#btnSaveOrUpdate").text("+ Add Item");

      console.log("Course Information form cleared successfully");
    } catch (error) {
      console.error("Error clearing Course Information form:", error);
      VanillaApiCallManager.handleApiError(error);
    }
  },

  clickEventForEditButton: async function (event) {
    if (this._busy) return;
    this._busy = true;
    const runId = ++this._loadRunId;
    try {
      const item = this._getGridItem(event);
      if (!item) return;

      CommonManager.formShowGridHide("CrmApplcationFormShowHide", "CrmApplicationGridShowHide");
      this.clearForm();

      const applicationData = await CRMApplicationManager.getApplicationByApplicationId(item.ApplicationId);
      if (runId !== this._loadRunId) return; // stale response

      this.populateObject(applicationData);
      CommonManager.MakeFormEditable("#CRMApplicationForm");
      $("#btnSaveOrUpdate").text("Update Item");
    } catch (err) {
      VanillaApiCallManager?.handleApiError?.(err);
    } finally {
      this._busy = false;
    }
  },

  clickEventForDeleteButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      CRMApplicationHelper.deleteItem(item);
    }
  },

  /* -------- Create Complete Application Object -------- */
  createCompleteApplicationObject: function () {
    try {
      const completeApplication = {
        // Basic Application Info
        ApplicationId: $("#hdnApplicationId").val() || 0,
        ApplicationDate: new Date().toISOString(),
        ApplicationStatus: "Draft", // or get from form if available

        // Course Information Section
        CourseInformation: CRMCourseInformationHelper.createApplicationCourseInformation(),

        // Education & English Language Section
        EducationInformation: CRMEducationNEnglishLanguagHelper.createEducationNEnglishLanguageInformation(),

        // Additional Information Section
        AdditionalInformation: CRMAdditionalInformationHelper.createAdditionalInformationObject()
      };
      return completeApplication;

    } catch (error) {
      console.error("Error creating complete application object:", error);
      return null;
    }
  },

  /* -------- Convert Nested Object to FormData with Files Integration -------- */
  convertNestedObjectToFormData: function (obj, formData, prefix) {
    try {
      if (!formData) {
        formData = new FormData();
      }

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          const fieldName = prefix ? `${prefix}.${key}` : key;

          // Skip null or undefined values
          if (value === null || value === undefined) {
            continue;
          }

          // Handle File objects - these should be appended as files
          if (value instanceof File) {
            formData.append(fieldName, value);
            console.log(`File appended: ${fieldName} => ${value.name}`);
          }
          // Handle Arrays
          else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (item !== null && item !== undefined) {
                if (typeof item === 'object' && !(item instanceof File)) {
                  // Recursive call for nested objects in array
                  this.convertNestedObjectToFormData(item, formData, `${fieldName}[${index}]`);
                } else if (item instanceof File) {
                  formData.append(`${fieldName}[${index}]`, item);
                  console.log(`Array File appended: ${fieldName}[${index}] => ${item.name}`);
                } else {
                  formData.append(`${fieldName}[${index}]`, item);
                }
              }
            });
          }
          // Handle nested objects (but not Dates or Files)
          else if (typeof value === 'object' && !(value instanceof Date) && !(value instanceof File)) {
            // Recursive call for nested objects
            this.convertNestedObjectToFormData(value, formData, fieldName);
          }
          // Handle Date objects
          else if (value instanceof Date) {
            formData.append(fieldName, value.toISOString());
          }
          // Handle primitive values
          else {
            formData.append(fieldName, value.toString());
          }
        }
      }

      return formData;
    } catch (error) {
      console.error("Error converting nested object to FormData:", error);
      throw error;
    }
  },

  /* -------- Integrate All Files into Complete FormData -------- */
  integrateAllFilesIntoApplicationData: function (applicationData) {
    try {
      console.log("=== Integrating All Files into Application Data ===");

      // Course Information Files
      if (applicationData.CourseInformation && applicationData.CourseInformation.PersonalDetails) {
        // Applicant Image File
        const applicantImageFile = $("#ApplicantImageFile")[0];
        if (applicantImageFile && applicantImageFile.files.length > 0) {
          applicationData.CourseInformation.PersonalDetails.ApplicantImageFile = applicantImageFile.files[0];
        }
      }

      // Education & English Language Files
      if (applicationData.EducationInformation) {
        // IELTS File
        if (typeof ieltsFileData !== "undefined" && ieltsFileData) {
          applicationData.EducationInformation.IELTSInformation.IELTSScannedCopyFile = ieltsFileData;
        }

        // TOEFL File
        if (typeof toeflFileData !== "undefined" && toeflFileData) {
          applicationData.EducationInformation.TOEFLInformation.TOEFLScannedCopyFile = toeflFileData;
        }

        // PTE File
        if (typeof pteFileData !== "undefined" && pteFileData) {
          applicationData.EducationInformation.PTEInformation.PTEScannedCopyFile = pteFileData;
        }

        // GMAT File
        if (typeof gmatFileData !== "undefined" && gmatFileData) {
          applicationData.EducationInformation.GMATInformation.GMATScannedCopyFile = gmatFileData;
        }

        // OTHERS File
        if (typeof othersFileData !== "undefined" && othersFileData) {
          applicationData.EducationInformation.OTHERSInformation.OTHERSScannedCopyFile = othersFileData;
        }

        // Education History Files
        if (applicationData.EducationInformation.EducationDetails &&
          applicationData.EducationInformation.EducationDetails.EducationHistory) {
          applicationData.EducationInformation.EducationDetails.EducationHistory.forEach((education, index) => {
            if (typeof educationPdfFileData !== "undefined" && educationPdfFileData[education.uid]) {
              education.AttachedDocumentFile = educationPdfFileData[education.uid];
            }
          });
        }

        //// Work Experience Files
        //if (applicationData.EducationInformation.WorkExperience &&
        //  applicationData.EducationInformation.WorkExperience.WorkExperienceHistory) {
        //  applicationData.EducationInformation.WorkExperience.WorkExperienceHistory.forEach((work, index) => {
        //    if (typeof workExperienceFileData !== "undefined" && workExperienceFileData[work.uid]) {
        //      work.ScannedCopyFile = workExperienceFileData[work.uid];
        //    }
        //  });
        //}

        // Work Experience Files - already embedded in DTO by createWorkExperienceObject()
        // No uid-based mapping required
        if (applicationData.EducationInformation?.WorkExperience?.WorkExperienceHistory) {
          applicationData.EducationInformation.WorkExperience.WorkExperienceHistory =
            applicationData.EducationInformation.WorkExperience.WorkExperienceHistory.map(w => w);
        }
      }

      // Additional Information Files
      if (applicationData.AdditionalInformation) {
        // Statement of Purpose File
        if (typeof statementOfPurposeFileData !== "undefined" && statementOfPurposeFileData) {
          applicationData.AdditionalInformation.StatementOfPurpose.StatementOfPurposeFile = statementOfPurposeFileData;
        }

        // Additional Documents Files
        if (applicationData.AdditionalInformation.AdditionalDocuments &&
          applicationData.AdditionalInformation.AdditionalDocuments.Documents) {
          applicationData.AdditionalInformation.AdditionalDocuments.Documents.forEach((doc, index) => {
            if (typeof additionalDocumentsFileData !== "undefined" && additionalDocumentsFileData[doc.uid]) {
              doc.UploadFile = additionalDocumentsFileData[doc.uid];
            }
          });
        }
      }

      console.log("All files integrated into application data successfully");
      return applicationData;

    } catch (error) {
      throw error;
      // if i throw error. Is it call VanillaApiCallManager.handleApiError. as global error handler.
      VanillaApiCallManager.handleApiError(error);



      //////console.log("Error integrating files into application data:", error);
    }
  },

  /* -------- Clear All Forms -------- */
  clearForm: function () {
    try {
      console.log("=== Clearing All Application Forms ===");

      // Clear Course Information
      if (typeof CRMCourseInformationHelper !== "undefined" &&
        typeof CRMCourseInformationHelper.clearCRMApplicationCourse === "function") {
        CRMCourseInformationHelper.clearCRMApplicationCourse();
      }

      //// Clear Education & English Language
      //if (typeof CRMEducationNEnglishLanguagHelper !== "undefined" &&
      //  typeof CRMEducationNEnglishLanguagHelper.clearEducationNEnglishLanguageForm === "function") {
      //  CRMEducationNEnglishLanguagHelper.clearEducationNEnglishLanguageForm();
      //}

      //// Clear Additional Information
      //if (typeof CRMAdditionalInformationHelper !== "undefined" &&
      //  typeof CRMAdditionalInformationHelper.clearAdditionalInformationForm === "function") {
      //  CRMAdditionalInformationHelper.clearAdditionalInformationForm();
      //}

      // Reset application ID
      $("#hdnApplicationId").val(0);

      console.log("All application forms cleared successfully");

    } catch (error) {
      console.error("Error clearing application forms:", error);
    }
  },

  /* -------- Populate Object from applicationData -------- */
  populateObject: function (applicationData) {
    try {
      debugger;
      console.log("=== Populating Application Object ===", applicationData);

      if (!applicationData) {
        console.warn("No application data provided for population");
        return;
      }

      // Set application ID
      if (applicationData.ApplicationId) {
        $("#hdnApplicationId").val(applicationData.ApplicationId);
      }
      if (applicationData.ApplicantId) {
        $("#hdnApplicantId").val(applicationData.ApplicantId);
      }

      debugger;
      console.log(applicationData);
      CRMCourseInformationHelper.populateCourseInformation(applicationData);
      CRMEducationNEnglishLanguagHelper.populateEducationInformation(applicationData);
      CRMAdditionalInformationHelper.populateAdditionalInformation(applicationData);

      //// Populate Course Information tab
      //if (applicationData.CourseInformation || applicationData.PersonalDetails) {
      //  CRMCourseInformationHelper.populateCourseInformation(applicationData);
      //}

      //// Populate Education & English Language tab  
      //if (applicationData.EducationInformation) {
      //  CRMEducationNEnglishLanguagHelper.populateEducationInformation(applicationData.EducationInformation);
      //}

      //// Populate Additional Information tab
      //if (applicationData.AdditionalInformation || applicationData.ReferenceDetails || applicationData.StatementOfPurpose) {
      //  CRMAdditionalInformationHelper.populateAdditionalInformation(applicationData);
      //}

      console.log("Application object populated successfully");

      //if (typeof ToastrMessage !== "undefined") {
      //  ToastrMessage.showSuccess("Application data loaded successfully!", "Data Loaded", 3000);
      //}

    } catch (error) {
      console.error("Error populating application object:", error);
      if (typeof VanillaApiCallManager !== "undefined") {
        VanillaApiCallManager.handleApiError(error);
      }
      else if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error loading application data: " + error.message, "Data Load Error", 0);
      }
    }
  },



}



