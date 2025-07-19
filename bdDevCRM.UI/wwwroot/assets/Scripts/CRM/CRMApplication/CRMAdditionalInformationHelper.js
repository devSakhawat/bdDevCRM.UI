//var CRMAdditionalInformationHelper = {
//  initAdditionalInformation: function () {
//    console.log("=== Initializing Additional Information ===");

//    // Initialize grids
//    CRMAdditionalInformationHelper.initializeAdditionalReferenceSummaryGrid();
//    CRMAdditionalInformationHelper.initializeAdditionalDocumentsSummaryGrid();

//    // Initialize file uploads
//    this.initializeFileUploads();

//    // Initialize radio button events
//    this.bindRadioButtonEvents();

//    console.log("Additional Information initialized successfully");
//  },

//  /* =========================================================
//     Grid Initialization Methods
//  =========================================================*/
//  initializeAdditionalReferenceSummaryGrid: function () {
//    const gridOption = {
//      dataSource: new kendo.data.DataSource({
//        data: [],
//        schema: {
//          model: {
//            id: "ApplicantRefferenceId",
//            fields: {
//              ApplicantRefferenceId: { type: "number", editable: false, nullable: true },
//              ApplicantId: { type: "number", editable: false, nullable: true },
//              Name: { type: "string" },
//              Designation: { type: "string" },
//              Institution: { type: "string" },
//              EmailID: { type: "email" },
//              PhoneNo: { type: "string" },
//              FaxNo: { type: "string" },
//              Address: { type: "string" },
//              City: { type: "string" },
//              State: { type: "string" },
//              Country: { type: "string" },
//              PostOrZipCode: { type: "string" },
//            }
//          }
//        }
//      }),
//      toolbar: ["create"],
//      scrollable: true,
//      resizable: true,
//      width: "400px",
//      columns: CRMAdditionalInformationHelper.generateAdditionalReferenceSummaryColumn(),
//      editable: { model: "inline" },
//      navigatable: true,
//      selectable: true,
//    };

//    $("#gridAdditionalReferenceSummary").kendoGrid(gridOption);
//  },

//  generateAdditionalReferenceSummaryColumn: function () {
//    return [
//      { field: "ApplicantRefferenceId", title: "ApplicantRefferenceId", hidden: true },
//      { field: "ApplicantId", title: "ApplicantId", hidden: true },
//      { field: "Name", title: "Name", width: "200px" },
//      { field: "Designation", title: "Designation", width: "200px" },
//      { field: "Institution", title: "Institution", width: "200px" },
//      { field: "EmailID", title: "Email ID", width: "200px" },
//      { field: "PhoneNo", title: "Phone No", width: "150px" },
//      { field: "FaxNo", title: "Fax No", width: "150px" },
//      { field: "Address", title: "Address", width: "250px" },
//      { field: "City", title: "City", width: "150px" },
//      { field: "State", title: "State", width: "150px" },
//      { field: "Country", title: "Country", width: "150px" },
//      { field: "PostOrZipCode", title: "Post/Zip Code", width: "150px" },
//      { command: ["edit", "destroy"], title: "Action", width: "180px" }
//    ];
//  },

//  initializeAdditionalDocumentsSummaryGrid: function () {
//    const gridOption = {
//      dataSource: new kendo.data.DataSource({
//        data: [],
//        schema: {
//          model: {
//            id: "DocumentId",
//            fields: {
//              DocumentId: { type: "number", editable: false, nullable: true },
//              ApplicantId: { type: "number", editable: false, nullable: true },
//              Title: { type: "string" },
//              UploadFile: { type: "string" },
//              DocumentName: { type: "string" },
//              FileThumbnail: { type: "string" }
//            }
//          }
//        }
//      }),
//      toolbar: ["create"],
//      scrollable: true,
//      resizable: true,
//      width: "400px",
//      columns: CRMAdditionalInformationHelper.generateAdditionalDocumentsSummaryColumn(),
//      editable: { model: "inline" },
//      navigatable: true,
//      selectable: true,
//    };

//    $("#griAdditionalDocumentsSummary").kendoGrid(gridOption);
//  },

//  generateAdditionalDocumentsSummaryColumn: function () {
//    return [
//      { field: "DocumentId", title: "DocumentId", hidden: true },
//      { field: "ApplicantId", title: "ApplicantId", hidden: true },
//      { field: "Title", title: "Title", width: "400px" },
//      {
//        field: "UploadFile",
//        title: "Upload Document",
//        template: '#= CRMAdditionalInformationHelper.editorAdditionalDocumentFileUpload(data) #',
//        filterable: false,
//        width: "200px"
//      },
//      {
//        field: "ViewDocument",
//        title: "View Document",
//        template: '#= CRMAdditionalInformationHelper.ViewAdditionalDocumentDetails(data) #',
//        editable: false,
//        filterable: false,
//        width: "200px"
//      },
//      { command: "destroy", title: "Action", width: "100px" }
//    ];
//  },

//  /* =========================================================
//     File Upload Methods
//  =========================================================*/
//  initializeFileUploads: function () {
//    try {
//      // Initialize Statement of Purpose file upload
//      this.initializeStatementOfPurposeFileUpload();

//      console.log("File uploads initialized successfully");
//    } catch (error) {
//      console.error("Error initializing file uploads:", error);
//    }
//  },

//  initializeStatementOfPurposeFileUpload: function () {
//    // Statement of Purpose file upload
//    $("#fileStatementOfPurpose").on("change", function () {
//      CRMAdditionalInformationHelper.handleStatementOfPurposeFileUpload(this);
//    });

//    // Convert view field to button
//    this.convertStatementViewToButton();
//  },

//  convertStatementViewToButton: function () {
//    const $element = $("#statementOfPurposeViewDocument");
//    const $container = $element.parent();

//    // Create view button
//    const viewButton = $(`
//      <button type="button" class="btn btn-outline-primary w-100" id="statementOfPurposeViewBtn" disabled>
//        <i class="k-icon k-i-preview"></i> View Statement Document
//      </button>
//    `);

//    // Replace input with button
//    $element.replaceWith(viewButton);

//    // Add click handler
//    viewButton.on("click", function () {
//      CRMAdditionalInformationHelper.viewStatementOfPurposeDocument();
//    });
//  },

//  handleStatementOfPurposeFileUpload: function (input) {
//    const file = input.files[0];
//    if (!file) return;

//    if (!CRMAdditionalInformationManager.validateStatementFile(file)) {
//      alert("Only PDF, DOC, and DOCX files are allowed for Statement of Purpose.");
//      input.value = '';
//      return;
//    }

//    statementOfPurposeFileData = file;
//    this.updateStatementViewButton(file.name);

//    if (typeof ToastrMessage !== "undefined") {
//      ToastrMessage.showSuccess("Statement of Purpose document uploaded successfully!");
//    }
//  },

//  updateStatementViewButton: function (fileName) {
//    const $button = $("#statementOfPurposeViewBtn");
//    if ($button.length) {
//      $button.prop("disabled", false);
//      $button.attr("title", "Click to view: " + fileName);

//      // Update button text to show file name
//      const maxLength = 25;
//      const displayName = fileName.length > maxLength ?
//        fileName.substring(0, maxLength) + '...' : fileName;

//      $button.html(`<i class="k-icon k-i-preview"></i> ${displayName}`);
//    }
//  },

//  viewStatementOfPurposeDocument: function () {
//    if (statementOfPurposeFileData) {
//      if (typeof PreviewManger !== "undefined") {
//        PreviewManger.previewFileBlob(statementOfPurposeFileData, statementOfPurposeFileData.name);
//      } else {
//        alert("Preview functionality is not available");
//      }
//    } else {
//      alert("No Statement of Purpose document uploaded");
//    }
//  },

//  /* =========================================================
//     Additional Documents Grid File Upload Methods
//  =========================================================*/
//  editorAdditionalDocumentFileUpload: function (data) {
//    if (data.UploadFile && data.DocumentName) {
//      return '<div class="document-info">' +
//        '<span class="document-name" title="' + data.DocumentName + '">' +
//        (data.DocumentName.length > 20 ? data.DocumentName.substring(0, 20) + '...' : data.DocumentName) +
//        '</span><br/>' +
//        '<input type="file" accept=".pdf,.zip" class="k-button form-control" ' +
//        'onchange="CRMAdditionalInformationHelper.handleDirectAdditionalDocumentFileUpload(this, \'' + data.uid + '\')" ' +
//        'title="Replace document"/>' +
//        '</div>';
//    } else {
//      return '<input type="file" accept=".pdf,.zip" value="Select PDF/ZIP file" class="k-button form-control" ' +
//        'onchange="CRMAdditionalInformationHelper.handleDirectAdditionalDocumentFileUpload(this, \'' + data.uid + '\')" ' +
//        'title="Upload PDF or ZIP document"/>';
//    }
//  },

//  handleDirectAdditionalDocumentFileUpload: function (input, docuid) {
//    const file = input.files[0];
//    if (!file) return;

//    // Validate file (PDF + ZIP)
//    if (!CRMAdditionalInformationManager.validateAdditionalDocumentFile(file)) {
//      alert("Only PDF and ZIP files are allowed for additional documents.");
//      input.value = '';
//      return;
//    }

//    // Clear old file data
//    if (additionalDocumentsFileData[docuid]) {
//      delete additionalDocumentsFileData[docuid];
//    }

//    additionalDocumentsFileData[docuid] = file;

//    // Generate thumbnail and update grid
//    this.generateAdditionalDocumentThumbnail(file, docuid, function (thumbnailUrl) {
//      const fileName = file.name;
//      const filePath = "/uploads/additionaldocuments/" + fileName;

//      CRMAdditionalInformationHelper.updateAdditionalDocumentGridRowWithDocument(docuid, {
//        name: fileName,
//        response: filePath,
//        thumbnail: thumbnailUrl
//      });

//      if (typeof ToastrMessage !== 'undefined') {
//        ToastrMessage.showSuccess("Additional document uploaded successfully!");
//      } else {
//        alert("Additional document uploaded successfully!");
//      }
//    });
//  },

//  generateAdditionalDocumentThumbnail: function (file, docuid, callback) {
//    if (!file) {
//      if (callback) callback(null);
//      return;
//    }

//    // Handle different file types
//    if (file.type === 'application/pdf') {
//      // Use PDF thumbnail generation (if PDF.js is available)
//      this.generatePdfThumbnail(file, callback);
//    } else if (file.type.includes('zip')) {
//      // Use ZIP icon for ZIP files
//      const zipIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+WklQPC90ZXh0Pgo8L3N2Zz4K';
//      if (callback) callback(zipIcon);
//    } else {
//      if (callback) callback(null);
//    }
//  },

//  generatePdfThumbnail: function (file, callback) {
//    const reader = new FileReader();
//    reader.onload = function () {
//      const typedArray = new Uint8Array(this.result);

//      if (typeof pdfjsLib !== 'undefined') {
//        pdfjsLib.getDocument(typedArray).promise.then(pdf => {
//          pdf.getPage(1).then(page => {
//            const canvas = document.createElement("canvas");
//            const context = canvas.getContext("2d");
//            const scale = 100 / page.getViewport({ scale: 1 }).height;
//            const viewport = page.getViewport({ scale });

//            canvas.width = viewport.width;
//            canvas.height = viewport.height;

//            page.render({ canvasContext: context, viewport })
//              .promise.then(() => {
//                const imgUrl = canvas.toDataURL("image/png");
//                if (callback) callback(imgUrl);
//              });
//          });
//        }).catch(error => {
//          console.error("Error generating PDF thumbnail:", error);
//          if (callback) callback(null);
//        });
//      } else {
//        console.error("PDF.js library not loaded");
//        if (callback) callback(null);
//      }
//    };
//    reader.readAsArrayBuffer(file);
//  },

//  updateAdditionalDocumentGridRowWithDocument: function (docuid, fileInfo) {
//    const grid = $("#griAdditionalDocumentsSummary").data("kendoGrid");
//    if (!grid) return;

//    const dataSource = grid.dataSource;
//    const data = dataSource.data();

//    for (let i = 0; i < data.length; i++) {
//      if (data[i].uid === docuid) {
//        data[i].set("UploadFile", fileInfo.response || fileInfo.name);
//        data[i].set("DocumentName", fileInfo.name);
//        data[i].set("FileThumbnail", fileInfo.thumbnail || "");
//        break;
//      }
//    }
//    grid.refresh();
//  },

//  ViewAdditionalDocumentDetails: function (data) {
//    if (data.UploadFile != null && data.UploadFile != "") {
//      const fileName = data.DocumentName || data.UploadFile.split("/").pop();
//      const thumbnailSrc = data.FileThumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+RklMRTwvdGV4dD4KPC9zdmc+';

//      return '<div class="document-preview" style="height: 100px; width: auto; text-align: center;">' +
//        '<img src="' + thumbnailSrc + '" alt="File" style="height: 100px; width: auto; cursor: pointer; border: 1px solid #ddd; border-radius: 4px;" ' +
//        'onclick="CRMAdditionalInformationHelper.openAdditionalDocumentPreview(\'' + data.UploadFile + '\', \'' + data.uid + '\', \'' + fileName + '\')" ' +
//        'title="Click to preview: ' + fileName + '"/>' +
//        '<div style="font-size: 12px; text-align: center; margin-top: 5px; color: #666;">' + fileName + '</div>' +
//        '</div>';
//    } else {
//      return '<div style="text-align: center; color: #999; padding: 20px; height: 100px; display: flex; align-items: center; justify-content: center;">No document uploaded</div>';
//    }
//  },

//  openAdditionalDocumentPreview: function (documentPath, docuid, fileName) {
//    if (!documentPath) {
//      alert("No document available for preview.");
//      return;
//    }

//    try {
//      const fileData = additionalDocumentsFileData[docuid];
//      if (fileData) {
//        PreviewManger.previewFileBlob(fileData, fileName);
//      } else {
//        PreviewManger.openPreview(documentPath, fileName);
//      }
//    } catch (error) {
//      console.error("Error opening additional document preview:", error);
//      window.open(documentPath, '_blank');
//    }
//  },

//  /* =========================================================
//     Radio Button Event Handling
//  =========================================================*/
//  bindRadioButtonEvents: function () {
//    // Accommodation radio buttons
//    $("input[name='requireAccommodation']").on("change", function () {
//      CRMAdditionalInformationHelper.handleAccommodationChange();
//    });

//    // Health & Medical Needs radio buttons
//    $("input[name='HealthNMedicalNeeds']").on("change", function () {
//      CRMAdditionalInformationHelper.handleHealthMedicalNeedsChange();
//    });
//  },

//  handleAccommodationChange: function () {
//    const selectedValue = $("input[name='requireAccommodation']:checked").val();
//    console.log("Accommodation requirement changed:", selectedValue);
//    // Add any specific logic for accommodation selection
//  },

//  handleHealthMedicalNeedsChange: function () {
//    const selectedValue = $("input[name='HealthNMedicalNeeds']:checked").val();
//    const remarksField = $("#txtHealthNMedicalNeedsRemarks");

//    if (selectedValue === "Yes") {
//      remarksField.prop("disabled", false).focus();
//    } else if (selectedValue === "No") {
//      remarksField.prop("disabled", true).val("");
//    }
//  },

//  /* =========================================================
//     Form Clearing Methods
//  =========================================================*/
//  clearAdditionalInformationForm: function () {
//    try {
//      console.log("=== Clearing Additional Information Form ===");

//      // Clear Reference Details Grid
//      this.clearReferenceDetailsGrid();

//      // Clear Statement of Purpose
//      this.clearStatementOfPurpose();

//      // Clear Additional Information
//      this.clearAdditionalInformationFields();

//      // Clear Additional Documents Grid
//      this.clearAdditionalDocumentsGrid();

//      console.log("Additional Information form cleared successfully");

//    } catch (error) {
//      console.error("Error clearing Additional Information form:", error);
//      if (typeof VanillaApiCallManager !== "undefined") {
//        VanillaApiCallManager.handleApiError(error);
//      }
//      if (typeof ToastrMessage !== "undefined") {
//        ToastrMessage.showError("Error clearing Additional Information form: " + error.message, "Form Clear Error", 0);
//      }
//    }
//  },

//  clearReferenceDetailsGrid: function () {
//    try {
//      const grid = $("#gridAdditionalReferenceSummary").data("kendoGrid");
//      if (grid) {
//        grid.dataSource.data([]);
//      }
//      console.log("Reference Details Grid cleared");
//    } catch (error) {
//      console.error("Error clearing Reference Details Grid:", error);
//    }
//  },

//  clearStatementOfPurpose: function () {
//    try {
//      // Clear textarea
//      $("#txtStatementOfPurposeRemarks").val("");

//      // Clear file input
//      $("#fileStatementOfPurpose").val("");

//      // Clear file data and reset view button
//      statementOfPurposeFileData = null;
//      this.resetStatementViewButton();

//      console.log("Statement of Purpose section cleared");
//    } catch (error) {
//      console.error("Error clearing Statement of Purpose:", error);
//    }
//  },

//  clearAdditionalInformationFields: function () {
//    try {
//      // Clear radio buttons
//      $("input[name='requireAccommodation']").prop("checked", false);
//      $("input[name='HealthNMedicalNeeds']").prop("checked", false);

//      // Clear text areas
//      $("#txtHealthNMedicalNeedsRemarks").val("").prop("disabled", false);
//      $("#txtAdditionalInformationRemarks").val("");

//      console.log("Additional Information fields cleared");
//    } catch (error) {
//      console.error("Error clearing Additional Information fields:", error);
//    }
//  },

//  clearAdditionalDocumentsGrid: function () {
//    try {
//      const grid = $("#griAdditionalDocumentsSummary").data("kendoGrid");
//      if (grid) {
//        grid.dataSource.data([]);
//      }

//      // Clear global file data
//      additionalDocumentsFileData = {};

//      console.log("Additional Documents Grid cleared");
//    } catch (error) {
//      console.error("Error clearing Additional Documents Grid:", error);
//    }
//  },

//  resetStatementViewButton: function () {
//    const $button = $("#statementOfPurposeViewBtn");
//    if ($button.length) {
//      $button.prop("disabled", true);
//      $button.attr("title", "");
//      $button.html(`<i class="k-icon k-i-preview"></i> View Statement Document`);
//    }
//  },

//  /* =========================================================
//     Data Object Creation Methods
//  =========================================================*/
//  createAdditionalInformationObject: function () {
//    try {
//      const additionalInformation = {
//        ReferenceDetails: this.createReferenceDetailsObject(),
//        StatementOfPurpose: this.createStatementOfPurposeObject(),
//        AdditionalInformation: this.createAdditionalInfoObject(),
//        AdditionalDocuments: this.createAdditionalDocumentsObject()
//      };

//      console.log("Additional Information object created:", additionalInformation);
//      return additionalInformation;

//    } catch (error) {
//      console.error("Error creating Additional Information object:", error);
//      return null;
//    }
//  },

//  createReferenceDetailsObject: function () {
//    try {
//      const grid = $("#gridAdditionalReferenceSummary").data("kendoGrid");
//      const referenceData = [];

//      if (grid) {
//        const dataSource = grid.dataSource;
//        const data = dataSource.data();

//        data.forEach(function (item) {
//          referenceData.push({
//            ApplicantRefferenceId: item.ApplicantRefferenceId,
//            ApplicantId: item.ApplicantId,
//            Name: item.Name,
//            Designation: item.Designation,
//            Institution: item.Institution,
//            EmailID: item.EmailID,
//            PhoneNo: item.PhoneNo,
//            FaxNo: item.FaxNo,
//            Address: item.Address,
//            City: item.City,
//            State: item.State,
//            Country: item.Country,
//            PostOrZipCode: item.PostOrZipCode
//          });
//        });
//      }

//      return {
//        References: referenceData,
//        TotalReferenceRecords: referenceData.length
//      };
//    } catch (error) {
//      console.error("Error creating Reference Details object:", error);
//      return {};
//    }
//  },

//  createStatementOfPurposeObject: function () {
//    try {
//      return {
//        StatementOfPurposeRemarks: $("#txtStatementOfPurposeRemarks").val(),
//        StatementOfPurposeFile: statementOfPurposeFileData,
//        StatementOfPurposeFileName: statementOfPurposeFileData ? statementOfPurposeFileData.name : ""
//      };
//    } catch (error) {
//      console.error("Error creating Statement of Purpose object:", error);
//      return {};
//    }
//  },

//  createAdditionalInfoObject: function () {
//    try {
//      return {
//        RequireAccommodation: $("input[name='requireAccommodation']:checked").val() || "",
//        HealthNMedicalNeeds: $("input[name='HealthNMedicalNeeds']:checked").val() || "",
//        HealthNMedicalNeedsRemarks: $("#txtHealthNMedicalNeedsRemarks").val(),
//        AdditionalInformationRemarks: $("#txtAdditionalInformationRemarks").val()
//      };
//    } catch (error) {
//      console.error("Error creating Additional Info object:", error);
//      return {};
//    }
//  },

//  createAdditionalDocumentsObject: function () {
//    try {
//      const grid = $("#griAdditionalDocumentsSummary").data("kendoGrid");
//      const documentsData = [];

//      if (grid) {
//        const dataSource = grid.dataSource;
//        const data = dataSource.data();

//        data.forEach(function (item) {
//          documentsData.push({
//            DocumentId: item.DocumentId,
//            ApplicantId: item.ApplicantId,
//            Title: item.Title,
//            UploadFile: item.UploadFile,
//            DocumentName: item.DocumentName,
//            FileThumbnail: item.FileThumbnail
//          });
//        });
//      }

//      return {
//        Documents: documentsData,
//        TotalDocumentRecords: documentsData.length
//      };
//    } catch (error) {
//      console.log("Error creating Additional Documents object:", error);
//      return {};
//    }
//  },

//  /* =========================================================
//     Utility Methods
//  =========================================================*/
//  exportAdditionalInfoFormDataAsJSON: function () {
//    try {
//      const additionalInfoData = this.createAdditionalInformationObject();
//      const jsonData = JSON.stringify(additionalInfoData, null, 2);

//      console.log("=== Additional Information Form Data (JSON) ===");
//      console.log(jsonData);

//      if (typeof ToastrMessage !== "undefined") {
//        ToastrMessage.showSuccess("Additional Information form data exported to console. Check browser console for JSON output.", "Export Successful", 3000);
//      }

//      return jsonData;
//    } catch (error) {
//      console.error("Error exporting Additional Information form data as JSON:", error);
//      if (typeof ToastrMessage !== "undefined") {
//        ToastrMessage.showError("Error exporting Additional Information form data: " + error.message, "Export Error", 0);
//      }
//      return null;
//    }
//  },

//  validateAdditionalInformationForm: function () {
//    try {
//      console.log("=== Validating Additional Information Form ===");

//      const validationErrors = [];

//      // Validate Reference Details (at least one reference should be provided)
//      const grid = $("#gridAdditionalReferenceSummary").data("kendoGrid");
//      if (grid && grid.dataSource.data().length === 0) {
//        validationErrors.push("At least one reference is required");
//      }

//      // Validate Health & Medical Needs remarks if Yes is selected
//      const healthNeedsSelected = $("input[name='HealthNMedicalNeeds']:checked").val();
//      if (healthNeedsSelected === "Yes" && !$("#txtHealthNMedicalNeedsRemarks").val().trim()) {
//        validationErrors.push("Please provide details for Health & Medical Needs");
//      }

//      if (validationErrors.length === 0) {
//        console.log("Additional Information form validation passed successfully");
//        if (typeof ToastrMessage !== "undefined") {
//          ToastrMessage.showSuccess("Additional Information form validation passed successfully!", "Validation Success", 3000);
//        }
//        return true;
//      } else {
//        console.log("Additional Information form validation failed:", validationErrors);
//        if (typeof ToastrMessage !== "undefined") {
//          ToastrMessage.showError("Additional Information form validation failed. Check console for details.", "Validation Error", 0);
//        }
//        return false;
//      }
//    } catch (error) {
//      console.error("Error validating Additional Information form:", error);
//      return false;
//    }
//  },

//  fillAdditionalInfoDemoData: function () {
//    try {
//      console.log("=== Filling Additional Information Demo Data ===");

//      // Fill Statement of Purpose
//      $("#txtStatementOfPurposeRemarks").val("I am applying for this program to advance my career in software development and gain expertise in modern technologies. This course aligns perfectly with my professional goals and will help me contribute more effectively to my field.");

//      // Fill Additional Information
//      $("input[name='requireAccommodation'][value='No']").prop("checked", true);
//      $("input[name='HealthNMedicalNeeds'][value='No']").prop("checked", true);
//      $("#txtAdditionalInformationRemarks").val("I am excited about this opportunity and believe I will be a valuable addition to the program.");

//      console.log("Additional Information demo data filled successfully");
//      if (typeof ToastrMessage !== "undefined") {
//        ToastrMessage.showSuccess("Additional Information demo data filled successfully!", "Demo Data", 3000);
//      }

//    } catch (error) {
//      console.error("Error filling Additional Information demo data:", error);
//      if (typeof ToastrMessage !== "undefined") {
//        ToastrMessage.showError("Error filling Additional Information demo data: " + error.message, "Demo Data Error", 0);
//      }
//    }
//  }
//};
