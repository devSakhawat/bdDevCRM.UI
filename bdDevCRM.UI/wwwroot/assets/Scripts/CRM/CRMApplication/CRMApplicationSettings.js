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
      const id = $("#applicationId").val() || 0;
      const isCreate = id == 0;
      const serviceUrl = isCreate ? "/crm-application" : `/crm-application/${id}`;
      const httpType = isCreate ? "POST" : "PUT";
      const confirmMsg = isCreate ? "Do you want to save the application?" : "Do you want to update the application?";
      const successMsg = isCreate ? "Application saved successfully." : "Application updated successfully.";

      // Validate all form sections before proceeding
      if (!CRMApplicationManager.validateAllSections()) {
        ToastrMessage.showError("Please complete all required fields before saving.", "Validation Error", 0);
        return;
      }

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
  }
};




/* =========================================================
   CRMApplicationHelper : Application Form
=========================================================*/
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



  /* -------- NEW: Convert Nested Object to FormData with Files Integration -------- */
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

  /* -------- UPDATED: Integrate All Files into Complete FormData -------- */
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

        // Work Experience Files
        if (applicationData.EducationInformation.WorkExperience &&
          applicationData.EducationInformation.WorkExperience.WorkExperienceHistory) {
          applicationData.EducationInformation.WorkExperience.WorkExperienceHistory.forEach((work, index) => {
            if (typeof workExperienceFileData !== "undefined" && workExperienceFileData[work.uid]) {
              work.ScannedCopyFile = workExperienceFileData[work.uid];
            }
          });
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


}



