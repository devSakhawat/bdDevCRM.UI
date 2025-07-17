/// <reference path="CRMAdditionalInformation.js" />
/// <reference path="CRMCourseInformation.js" />
/// <reference path="CRMEducationNEnglishLanguage.js" />

$(document).ready(function () {

  console.log("=== CRM Application System Initializing ===");
  console.log("Bangladesh Development CRM System - Managing Institute and Course Information from Various Countries");

  CRMApplicationHelper.createTabstrip();

  CRMCourseInformationHelper.intCourse();
  CRMEducationNEnglishLanguagHelper.initEducationNEnglishtLanguage();
  CRMAdditionalInformationHelper.initAdditionalInformation();

});

/* =========================================================
   CRMApplicationManager : Save/Update Application Form
=========================================================*/
var CRMApplicationManager = {

  /* -------- Save ⬌ Update -------- */
  saveOrUpdateItem: async function () {
    try {
      const id = $("#applicationId").val() || 0; // Assuming there's a hidden applicationId field
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

      // Create FormData for file uploads
      const formData = new FormData();

      // Append all files from different sections
      CRMApplicationHelper.appendAllFilesToFormData(formData);

      // Append application data as JSON string (for complex nested objects)
      formData.append("ApplicationData", JSON.stringify(applicationData));

      // Alternatively, if the API expects flat structure, append each section separately:
      // formData.append("CourseInformation", JSON.stringify(applicationData.courseInformation));
      // formData.append("EducationInformation", JSON.stringify(applicationData.educationInformation));
      // formData.append("AdditionalInformation", JSON.stringify(applicationData.additionalInformation));

      // Confirmation popup before sending
      CommonManager.MsgBox("info", "center", "Confirmation", confirmMsg, [
        {
          addClass: "btn btn-primary",
          text: "Yes",
          onClick: async function ($noty) {
            $noty.close();

            // Show loading indicator and lock screen
            CRMApplicationHelper.showProcessingOverlay("Saving application... Please wait.");

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

              // Hide loading indicator
              CRMApplicationHelper.hideProcessingOverlay();

              if (response && response.IsSuccess === true) {
                ToastrMessage.showSuccess(successMsg, "Success", 3000);

                // Clear all form sections
                CRMApplicationHelper.clearAllForms();

                // Close any open windows
                if (typeof CommonManager !== "undefined") {
                  CommonManager.closeKendoWindow("ApplicationWindow");
                }

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
              console.error("=== Application Save Error ===", err);

              // Hide loading indicator
              CRMApplicationHelper.hideProcessingOverlay();

              VanillaApiCallManager.handleApiError(err);
              ToastrMessage.showError("Failed to save application. Please try again.", "Save Error", 0);
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
      const completeApplicationData = this.createCompleteApplicationObject();
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
  }
};



var CRMApplicationManager2 = {

  /* -------- Save ⬌ Update -------- */
  saveOrUpdateItem: async function () {
    try {
      const id = $("#applicationId").val() || 0; // Assuming there's a hidden applicationId field
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

      // Create FormData for file uploads
      const formData = new FormData();

      // Append all files from different sections
      CRMApplicationHelper.appendAllFilesToFormData(formData);

      // Append application data as JSON string (for complex nested objects)
      formData.append("ApplicationData", JSON.stringify(applicationData));

      // Alternatively, if the API expects flat structure, append each section separately:
      // formData.append("CourseInformation", JSON.stringify(applicationData.courseInformation));
      // formData.append("EducationInformation", JSON.stringify(applicationData.educationInformation));
      // formData.append("AdditionalInformation", JSON.stringify(applicationData.additionalInformation));

      // Confirmation popup before sending
      CommonManager.MsgBox("info", "center", "Confirmation", confirmMsg, [
        {
          addClass: "btn btn-primary",
          text: "Yes",
          onClick: async function ($noty) {
            $noty.close();

            // Show loading indicator
            if (typeof ToastrMessage !== "undefined") {
              ToastrMessage.showInfo("Saving application... Please wait.", "Processing", 0);
            }

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
                ToastrMessage.showSuccess(successMsg);

                // Clear all form sections
                CRMApplicationHelper.clearAllForms();

                // Close any open windows
                if (typeof CommonManager !== "undefined") {
                  CommonManager.closeKendoWindow("ApplicationWindow");
                }

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
              console.error("=== Application Save Error ===", err);
              VanillaApiCallManager.handleApiError(err);
              ToastrMessage.showError("Failed to save application. Please try again.", "Save Error", 0);
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
      const completeApplicationData = this.createCompleteApplicationObject();
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
  }
};




var CRMApplicationHelper = {

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

  /* -------- Processing Overlay Functions -------- */
  showProcessingOverlay: function (message = "Processing... Please wait.") {
    // Remove existing overlay if any
    this.hideProcessingOverlay();

    // Create overlay HTML
    const overlayHtml = `
      <div id="crmProcessingOverlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 99999;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: white;
          padding: 30px 40px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          text-align: center;
          min-width: 300px;
        ">
          <div style="
            margin-bottom: 20px;
          ">
            <div style="
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #007bff;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 15px auto;
            "></div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
          <div style="
            font-size: 16px;
            color: #333;
            font-weight: 500;
            line-height: 1.4;
          ">
            ${message}
          </div>
          <div style="
            font-size: 12px;
            color: #666;
            margin-top: 10px;
          ">
            Please do not close or refresh the page
          </div>
        </div>
      </div>
    `;

    // Add overlay to body
    $("body").append(overlayHtml);

    // Disable scrolling
    $("body").css("overflow", "hidden");

    // Disable all form inputs to prevent user interaction
    $("input, button, select, textarea").prop("disabled", true);
    $("a").css("pointer-events", "none");

    console.log("Processing overlay shown:", message);
  },

  hideProcessingOverlay: function () {
    // Remove overlay
    $("#crmProcessingOverlay").remove();

    // Re-enable scrolling
    $("body").css("overflow", "");

    // Re-enable all form inputs
    $("input, button, select, textarea").prop("disabled", false);
    $("a").css("pointer-events", "");

    console.log("Processing overlay hidden");
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

      console.log("=== Complete Application Object Created ===", completeApplication);
      return completeApplication;

    } catch (error) {
      console.error("Error creating complete application object:", error);
      return null;
    }
  },

  /* -------- Append All Files to FormData -------- */
  appendAllFilesToFormData: function (formData) {
    try {
      // Course Information Files
      // Applicant Image
      const applicantImageFile = $("#ApplicantImageFile")[0];
      if (applicantImageFile && applicantImageFile.files.length > 0) {
        formData.append("ApplicantImageFile", applicantImageFile.files[0]);
      }

      // Education & English Language Files
      // IELTS Files
      if (typeof ieltsFileData !== "undefined" && ieltsFileData) {
        formData.append("IELTSScannedCopyFile", ieltsFileData);
      }

      // TOEFL Files
      if (typeof toeflFileData !== "undefined" && toeflFileData) {
        formData.append("TOEFLScannedCopyFile", toeflFileData);
      }

      // PTE Files
      if (typeof pteFileData !== "undefined" && pteFileData) {
        formData.append("PTEScannedCopyFile", pteFileData);
      }

      // GMAT Files
      if (typeof gmatFileData !== "undefined" && gmatFileData) {
        formData.append("GMATScannedCopyFile", gmatFileData);
      }

      // OTHERS Files
      if (typeof othersFileData !== "undefined" && othersFileData) {
        formData.append("OTHERSScannedCopyFile", othersFileData);
      }

      // Education Grid Files
      if (typeof educationPdfFileData !== "undefined" && educationPdfFileData) {
        Object.keys(educationPdfFileData).forEach((key, index) => {
          formData.append(`EducationDocumentFile_${index}`, educationPdfFileData[key]);
        });
      }

      // Work Experience Files
      if (typeof workExperienceFileData !== "undefined" && workExperienceFileData) {
        Object.keys(workExperienceFileData).forEach((key, index) => {
          formData.append(`WorkExperienceDocumentFile_${index}`, workExperienceFileData[key]);
        });
      }

      // Additional Information Files
      // Statement of Purpose
      if (typeof statementOfPurposeFileData !== "undefined" && statementOfPurposeFileData) {
        formData.append("StatementOfPurposeFile", statementOfPurposeFileData);
      }

      // Additional Documents
      if (typeof additionalDocumentsFileData !== "undefined" && additionalDocumentsFileData) {
        Object.keys(additionalDocumentsFileData).forEach((key, index) => {
          formData.append(`AdditionalDocumentFile_${index}`, additionalDocumentsFileData[key]);
        });
      }

      console.log("All files appended to FormData successfully");

    } catch (error) {
      console.error("Error appending files to FormData:", error);
    }
  },


  /* -------- Clear All Forms -------- */
  clearAllForms: function () {
    try {
      console.log("=== Clearing All Application Forms ===");

      // Clear Course Information
      if (typeof CRMCourseInformationHelper !== "undefined" &&
        typeof CRMCourseInformationHelper.clearCRMApplicationCourse === "function") {
        CRMCourseInformationHelper.clearCRMApplicationCourse();
      }

      // Clear Education & English Language
      if (typeof CRMEducationNEnglishLanguagHelper !== "undefined" &&
        typeof CRMEducationNEnglishLanguagHelper.clearEducationNEnglishLanguageForm === "function") {
        CRMEducationNEnglishLanguagHelper.clearEducationNEnglishLanguageForm();
      }

      // Clear Additional Information
      if (typeof CRMAdditionalInformationHelper !== "undefined" &&
        typeof CRMAdditionalInformationHelper.clearAdditionalInformationForm === "function") {
        CRMAdditionalInformationHelper.clearAdditionalInformationForm();
      }

      // Reset application ID
      $("#applicationId").val(0);

      console.log("All application forms cleared successfully");

    } catch (error) {
      console.error("Error clearing application forms:", error);
    }
  },

  ///* -------- Append All Files to FormData -------- */
  //appendAllFilesToFormData: function (formData) {
  //  try {
  //    // Course Information Files
  //    // Applicant Image
  //    const applicantImageFile = $("#ApplicantImageFile")[0];
  //    if (applicantImageFile && applicantImageFile.files.length > 0) {
  //      formData.append("ApplicantImageFile", applicantImageFile.files[0]);
  //    }

  //    // Education & English Language Files
  //    // IELTS Files
  //    if (typeof ieltsFileData !== "undefined" && ieltsFileData) {
  //      formData.append("IELTSScannedCopyFile", ieltsFileData);
  //    }

  //    // TOEFL Files
  //    if (typeof toeflFileData !== "undefined" && toeflFileData) {
  //      formData.append("TOEFLScannedCopyFile", toeflFileData);
  //    }

  //    // PTE Files
  //    if (typeof pteFileData !== "undefined" && pteFileData) {
  //      formData.append("PTEScannedCopyFile", pteFileData);
  //    }

  //    // GMAT Files
  //    if (typeof gmatFileData !== "undefined" && gmatFileData) {
  //      formData.append("GMATScannedCopyFile", gmatFileData);
  //    }

  //    // OTHERS Files
  //    if (typeof othersFileData !== "undefined" && othersFileData) {
  //      formData.append("OTHERSScannedCopyFile", othersFileData);
  //    }

  //    // Education Grid Files
  //    if (typeof educationPdfFileData !== "undefined" && educationPdfFileData) {
  //      Object.keys(educationPdfFileData).forEach((key, index) => {
  //        formData.append(`EducationDocumentFile_${index}`, educationPdfFileData[key]);
  //      });
  //    }

  //    // Work Experience Files
  //    if (typeof workExperienceFileData !== "undefined" && workExperienceFileData) {
  //      Object.keys(workExperienceFileData).forEach((key, index) => {
  //        formData.append(`WorkExperienceDocumentFile_${index}`, workExperienceFileData[key]);
  //      });
  //    }

  //    // Additional Information Files
  //    // Statement of Purpose
  //    if (typeof statementOfPurposeFileData !== "undefined" && statementOfPurposeFileData) {
  //      formData.append("StatementOfPurposeFile", statementOfPurposeFileData);
  //    }

  //    // Additional Documents
  //    if (typeof additionalDocumentsFileData !== "undefined" && additionalDocumentsFileData) {
  //      Object.keys(additionalDocumentsFileData).forEach((key, index) => {
  //        formData.append(`AdditionalDocumentFile_${index}`, additionalDocumentsFileData[key]);
  //      });
  //    }

  //    console.log("All files appended to FormData successfully");

  //  } catch (error) {
  //    console.error("Error appending files to FormData:", error);
  //  }
  //},

  ///* -------- Clear All Forms -------- */
  //clearAllForms: function () {
  //  try {
  //    console.log("=== Clearing All Application Forms ===");

  //    // Clear Course Information
  //    if (typeof CRMCourseInformationHelper !== "undefined" &&
  //      typeof CRMCourseInformationHelper.clearCRMApplicationCourse === "function") {
  //      CRMCourseInformationHelper.clearCRMApplicationCourse();
  //    }

  //    // Clear Education & English Language
  //    if (typeof CRMEducationNEnglishLanguagHelper !== "undefined" &&
  //      typeof CRMEducationNEnglishLanguagHelper.clearEducationNEnglishLanguageForm === "function") {
  //      CRMEducationNEnglishLanguagHelper.clearEducationNEnglishLanguageForm();
  //    }

  //    // Clear Additional Information
  //    if (typeof CRMAdditionalInformationHelper !== "undefined" &&
  //      typeof CRMAdditionalInformationHelper.clearAdditionalInformationForm === "function") {
  //      CRMAdditionalInformationHelper.clearAdditionalInformationForm();
  //    }

  //    // Reset application ID
  //    $("#applicationId").val(0);

  //    console.log("All application forms cleared successfully");

  //  } catch (error) {
  //    console.error("Error clearing application forms:", error);
  //  }
  //},
}

