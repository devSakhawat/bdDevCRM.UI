/// <reference path="../../common/common.js" />

/// <reference path="crmadditionalinformation.js" />
/// <reference path="crmapplicationsettings.js" />
/// <reference path="crmcourseinformation.js" />

// Global Variables for PDF handling (similar to institute pattern)
let educationPdfFileData = {};
let workExperienceFileData = {};

var CRMEducationNEnglishLanguagManager = {

  fileUpload: function (docuid) {
    debugger;
    $("#uploadDocumentPhoto").kendoUpload({
      upload: onUpload,
      localization: {
        select: '<span class="k-icon k-i-plus"></span>Select Document'
      },
      multiple: false,
      success: onSuccess,
      error: onError,
      async: {
        saveUrl: "../Employee/save",
        removeUrl: "../Employee/remove",
        autoUpload: true
      },
      validation: {
        maxFileSize: 6194304,
        allowedExtensions: [".pdf"],
        requiredExtensions: [".pdf"]
      }
    });

    function onUpload(e) {
      debugger;
      var files = e.files;

      // Additional PDF validation
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.extension && file.extension.toLowerCase() !== '.pdf') {
          alert("Only PDF files are allowed. Please select a PDF document.");
          e.preventDefault();
          return;
        }
        if (file.rawFile && file.rawFile.type !== 'application/pdf') {
          alert("Only PDF files are allowed. Please select a PDF document.");
          e.preventDefault();
          return;
        }
      }
    }

    function onSuccess(e) {
      debugger;
      // Array with information about the uploaded files
      var files = e.files;
      if (e.operation == "upload") {
        // Update the grid row with document information
        CRMEducationNEnglishLanguagHelper.updateGridRowWithDocument(docuid, files[0]);

        var kendoFileUpload = $("#windDocumentPhotoUpload").data('kendoWindow');
        if (kendoFileUpload) {
          kendoFileUpload.close();
        }

        $(".k-upload-files").remove();
        $(".k-upload-status").remove();
        $(".k-upload.k-header").addClass("k-upload-empty");
        $(".k-upload-button").removeClass("k-state-focused");
      }
    }

    function onError(e) {
      debugger;
      // Array with information about the uploaded files
      var files = e.files;

      if (e.operation == "upload") {
        alert("Failed to upload " + files.length + " files. Please ensure you are uploading a valid PDF document.");
      }
    }
  },

  // PDF file validation helper
  validatePdfFile: function (file) {
    if (!file) return false;

    // Check file extension
    if (file.name && !file.name.toLowerCase().endsWith('.pdf')) {
      return false;
    }

    // Check MIME type
    if (file.type && file.type !== 'application/pdf') {
      return false;
    }

    return true;
  },

  // Work Experience file validation (PDF + Images)
  validateWorkFile: function (file) {
    if (!file) return false;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];

    // Check MIME type
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      return false;
    }

    // Check file extension
    if (file.name) {
      const fileName = file.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      if (!hasValidExtension) {
        return false;
      }
    }

    return true;
  },

  // Generate PDF Thumbnail (adapted from institute pattern)
  generatePdfThumbnail: function (file, docuid, callback) {
    if (!file || file.type !== 'application/pdf') {
      if (callback) callback(null);
      return;
    }

    // Store file data globally for later preview - CLEAR OLD DATA FIRST
    if (educationPdfFileData[docuid]) {
      delete educationPdfFileData[docuid];
    }
    educationPdfFileData[docuid] = file;

    const reader = new FileReader();
    reader.onload = function () {
      const typedArray = new Uint8Array(this.result);

      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.getDocument(typedArray).promise.then(pdf => {
          pdf.getPage(1).then(page => {
            // Create canvas for thumbnail generation
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            // Scale for 100px height (instead of 200px like institute)
            const scale = 100 / page.getViewport({ scale: 1 }).height;
            const viewport = page.getViewport({ scale });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            page.render({ canvasContext: context, viewport })
              .promise.then(() => {
                const imgUrl = canvas.toDataURL("image/png");
                if (callback) callback(imgUrl);
              });
          });
        }).catch(error => {
          console.error("Error generating PDF thumbnail:", error);
          if (callback) callback(null);
        });
      } else {
        console.error("PDF.js library not loaded");
        if (callback) callback(null);
      }
    };
    reader.readAsArrayBuffer(file);
  },

  // Generate Work Experience file thumbnail (PDF + Images)
  generateWorkFileThumbnail: function (file, docuid, callback) {
    if (!file) {
      if (callback) callback(null);
      return;
    }

    // Clear old data first
    if (workExperienceFileData[docuid]) {
      delete workExperienceFileData[docuid];
    }
    workExperienceFileData[docuid] = file;

    // Handle different file types
    if (file.type === 'application/pdf') {
      // Use PDF thumbnail generation
      this.generateWorkPdfThumbnail(file, docuid, callback);
    } else if (file.type.startsWith('image/')) {
      // Use image thumbnail generation
      this.generateWorkImageThumbnail(file, callback);
    } else {
      if (callback) callback(null);
    }
  },

  // Generate PDF thumbnail for work experience
  generateWorkPdfThumbnail: function (file, docuid, callback) {
    const reader = new FileReader();
    reader.onload = function () {
      const typedArray = new Uint8Array(this.result);

      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.getDocument(typedArray).promise.then(pdf => {
          pdf.getPage(1).then(page => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const scale = 100 / page.getViewport({ scale: 1 }).height;
            const viewport = page.getViewport({ scale });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            page.render({ canvasContext: context, viewport })
              .promise.then(() => {
                const imgUrl = canvas.toDataURL("image/png");
                if (callback) callback(imgUrl);
              });
          });
        }).catch(error => {
          console.error("Error generating work PDF thumbnail:", error);
          if (callback) callback(null);
        });
      } else {
        console.error("PDF.js library not loaded");
        if (callback) callback(null);
      }
    };
    reader.readAsArrayBuffer(file);
  },

  // Generate Image thumbnail for work experience
  generateWorkImageThumbnail: function (file, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Calculate dimensions for 100px height
        const scale = 100 / img.height;
        canvas.width = img.width * scale;
        canvas.height = 100;

        // Draw resized image
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL("image/png");

        if (callback) callback(thumbnailUrl);
      };
      img.onerror = function () {
        console.error("Error loading image for thumbnail");
        if (callback) callback(null);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

var CRMEducationNEnglishLanguagHelper = {

  initEducationNEnglishtLanguage: function () {
    CRMEducationNEnglishLanguagHelper.initializeEducationSummaryGrid();
    CRMEducationNEnglishLanguagHelper.initializeWorkExperienceGrid();

    // Initialize Kendo Windows with controlled height
    CommonManager.initializeKendoWindow("#windDocumentPhotoUpload", "Upload Document", "60%");

    // Fixed preview window height instead of full PDF size
    //if (!$("#previewWindow").data("kendoWindow")) {
    //  $("#previewWindow").kendoWindow({
    //    width: "80%",
    //    height: "600px", // Fixed height instead of 80vh
    //    title: "Document Preview",
    //    modal: true,
    //    visible: false,
    //    close: function () {
    //      // Clean up any blob URLs
    //      PreviewManger.cleanupPreviewResources();
    //    }
    //  });
    //}
  },

  initializeEducationSummaryGrid: function () {
    const gridOption = {
      dataSource: new kendo.data.DataSource({
        data: [],
        schema: {
          model: {
            id: "EducationHistoryId",
            fields: {
              EducationHistoryId: { type: "number", editable: false, nullable: true },
              Institution: { type: "string" },
              Qualification: { type: "string" },
              PassingYear: { type: "number" },
              Grade: { type: "string" },
              AttachedDocument: { type: "string" },
              DocumentName: { type: "string" },
              PdfThumbnail: { type: "string" }
            }
          }
        }
      }),
      toolbar: ["create"],
      scrollable: true,
      resizable: true,
      width: "400px",
      columns: CRMEducationNEnglishLanguagHelper.generateEducationSummaryColumn(),
      editable: { model: "inline" },
      navigatable: true,
      selectable: true,
    };

    $("#gridEducationSummary").kendoGrid(gridOption);
    const gridInstance = $("#gridEducationSummary").data("kendoGrid");
    if (gridInstance) {
      //const dataSource = CRMEducationNEnglishLanguagManager.educationSummaryDataSource();
    }
  },

  generateEducationSummaryColumn: function () {
    return [
      { field: "EducationHistoryId", title: "EducationHistoryId", hidden: true },
      { field: "Institution", title: "Name of Institution", width: "200px" },
      { field: "Qualification", title: "Qualification", width: "200px" },
      { field: "PassingYear", title: "Year of Passing", width: "150px" },
      { field: "Grade", title: "Grade", width: "150px" },
      {
        field: "AttachedDocument",
        title: "Upload Document",
        template: '#= CRMEducationNEnglishLanguagHelper.editorFileUpload(data) #',
        filterable: false,
        width: "200px"
      },
      {
        field: "View",
        title: "View Document",
        template: '#= CRMEducationNEnglishLanguagHelper.ViewDetails(data) #',
        editable: false,
        filterable: false,
        width: "200px"
      },
      { command: "destroy", title: "Action", width: "100px" }
    ];
  },

  editorFileUpload: function (data) {
    // If document is already uploaded, show document name
    if (data.AttachedDocument && data.DocumentName) {
      return '<div class="document-info">' +
        '<span class="document-name" title="' + data.DocumentName + '">' +
        (data.DocumentName.length > 20 ? data.DocumentName.substring(0, 20) + '...' : data.DocumentName) +
        '</span><br/>' +
        '<input type="file" accept=".pdf" class="k-button form-control" ' +
        'onchange="CRMEducationNEnglishLanguagHelper.handleDirectFileUpload(this, \'' + data.uid + '\')" ' +
        'title="Replace document"/>' +
        '</div>';
    } else {
      // If no document uploaded, show file input
      return '<input type="file" accept=".pdf" value="Select PDF file" class="k-button form-control" ' +
        'onchange="CRMEducationNEnglishLanguagHelper.handleDirectFileUpload(this, \'' + data.uid + '\')" ' +
        'title="Upload PDF document only"/>';
    }
  },

  // Handle direct file upload from grid
  handleDirectFileUpload: function (input, docuid) {
    debugger;
    const file = input.files[0];

    if (!file) return;

    // Validate PDF file
    if (!CRMEducationNEnglishLanguagManager.validatePdfFile(file)) {
      alert("Only PDF files are allowed. Please select a PDF document.");
      input.value = ''; // Clear the input
      return;
    }

    // IMPORTANT: Clear old file data before storing new one to fix replacement issue
    if (educationPdfFileData[docuid]) {
      delete educationPdfFileData[docuid];
    }

    educationPdfFileData[docuid] = file;

    // Generate PDF thumbnail and update grid
    CRMEducationNEnglishLanguagManager.generatePdfThumbnail(file, docuid, function (thumbnailUrl) {
      // For now, simulate successful upload and update grid
      // In real implementation, you would upload to server here
      const fileName = file.name;
      const filePath = "/uploads/education/" + fileName; // This would come from server response

      // Update the grid row
      CRMEducationNEnglishLanguagHelper.updateGridRowWithDocument(docuid, {
        name: fileName,
        response: filePath,
        thumbnail: thumbnailUrl
      });

      // Show success message
      if (typeof ToastrMessage !== 'undefined') {
        ToastrMessage.showSuccess("Document uploaded successfully!");
      } else {
        alert("Document uploaded successfully!");
      }
    });
  },

  // Update grid row with document information
  updateGridRowWithDocument: function (docuid, fileInfo) {
    const grid = $("#gridEducationSummary").data("kendoGrid");
    if (!grid) return;

    const dataSource = grid.dataSource;
    const data = dataSource.data();

    // Find the row by uid
    for (let i = 0; i < data.length; i++) {
      if (data[i].uid === docuid) {
        // Update the row data
        data[i].set("AttachedDocument", fileInfo.response || fileInfo.name);
        data[i].set("DocumentName", fileInfo.name);
        data[i].set("PdfThumbnail", fileInfo.thumbnail || "");
        break;
      }
    }

    // Refresh the grid to show updated data
    grid.refresh();
  },

  SelectFileBrowser: function (docuid) {
    debugger;
    const uploadWindow = $("#windDocumentPhotoUpload").data('kendoWindow');
    if (uploadWindow) {
      uploadWindow.center().open();
      CRMEducationNEnglishLanguagManager.fileUpload(docuid);
    }
  },

  ViewDetails: function (data) {
    if (data.AttachedDocument != null && data.AttachedDocument != "") {
      const fileName = data.DocumentName || data.AttachedDocument.split("/").pop();
      const thumbnailSrc = data.PdfThumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+UERGPC90ZXh0Pgo8L3N2Zz4K';

      return '<div class="document-preview" style="height: 100px; width: auto; text-align: center;">' +
        '<img src="' + thumbnailSrc + '" alt="PDF" style="height: 100px; width: auto; cursor: pointer; border: 1px solid #ddd; border-radius: 4px;" ' +
        'onclick="CRMEducationNEnglishLanguagHelper.openDocumentPreview(\'' + data.AttachedDocument + '\', \'' + data.uid + '\', \'' + fileName + '\')" ' +
        'title="Click to preview: ' + fileName + '"/>' +
        '<div style="font-size: 12px; text-align: center; margin-top: 5px; color: #666;">' + fileName + '</div>' +
        '</div>';
    } else {
      return '<div style="text-align: center; color: #999; padding: 20px; height: 100px; display: flex; align-items: center; justify-content: center;">No document uploaded</div>';
    }
  },

  // Open document preview using iframe (as requested)
  openDocumentPreview: function (documentPath, docuid, fileName) {
    debugger;
    if (!documentPath) {
      alert("No document available for preview.");
      return;
    }

    try {
      // Check if we have the file data stored locally
      const fileData = educationPdfFileData[docuid];
      if (fileData) {
        PreviewManger.previewFileBlob(fileData, fileName);
      } else {
        PreviewManger.openPreview(documentPath, fileName);
      }

      //if (fileData) {
      //  // Preview local file data using iframe
      //  this.previewLocalPdfFileWithIframe(fileData, fileName);
      //} else {
      //  // Use the existing PreviewManger for server files
      //  if (typeof PreviewManger !== 'undefined' && PreviewManger.openPreview) {
      //    PreviewManger.openPreview(documentPath);
      //  } else {
      //    // Fallback: open in new tab
      //    window.open(documentPath, '_blank');
      //  }
      //}
    } catch (error) {
      console.error("Error opening document preview:", error);
      // Fallback: open in new tab
      window.open(documentPath, '_blank');
    }
  },

  // Preview local PDF file using iframe (fixed height issue)
  previewLocalPdfFileWithIframe: function (fileData, fileName) {
    if (!fileData) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const blob = new Blob([e.target.result], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Get or create the preview window with fixed height
      const previewWindow = $("#previewWindow").data("kendoWindow");
      if (previewWindow) {
        previewWindow.setOptions({
          title: "Document Preview - " + fileName
        });
        previewWindow.center().open();
      }

      // Clean up any existing content
      $("#preview").empty();

      // Use iframe with controlled height - NOT full PDF size
      $("#preview").html(`
        <iframe 
            src="${url}" 
            width="100%" 
            height="100%" 
            frameborder="0"
            style="border: none;">
            <p>Your browser does not support iframes. <a href="${url}" target="_blank">Click here to view the PDF</a></p>
        </iframe>
      `);

      // Clean up the blob URL when window closes
      const currentWindow = $("#previewWindow").data("kendoWindow");
      if (currentWindow) {
        currentWindow.bind("close", function () {
          URL.revokeObjectURL(url);
        });
      }
    };

    reader.readAsArrayBuffer(fileData);
  },

  openPreview: async function (fileUrl) {
    debugger;
    if (!fileUrl) return;
    const fullUrl = `${baseApiFilePath}${fileUrl}`;
    const fileName = fullUrl.split("/").pop();
    const mimeType = fullUrl.toLowerCase().endsWith(".pdf") ? "application/pdf" : "";

    // Kendo Window setup
    if (!$("#previewWindow").data("kendoWindow")) {
      $("#previewWindow").kendoWindow({
        width: "90%",
        height: "90vh",
        title: "PDF Preview",
        modal: true,
        visible: false,
        resizable: true,
        close: function () {
          $("#preview").empty();
        }
      });
    }

    $("#previewWindow").data("kendoWindow").center().open();

    // Iframe দিয়ে PDF show করুন - CORS issue হবে না
    $("#preview").html(`
          <iframe
              src="${fullUrl}"
              width: "100%"
              height: "100%"
              frameborder="0"
              style="border: none;">
          </iframe>
      `);

    //const file = await PreviewManger.createFileFromUrl(fullUrl, fileName, mimeType);
    //if (!file) return;

    //const reader = new FileReader();
    //reader.onload = function (e) {
    //  const blob = new Blob([e.target.result], { type: mimeType });
    //  const url = URL.createObjectURL(blob);

    //  if (!$("#previewWindow").data("kendoWindow")) {
    //    $("#previewWindow").kendoWindow({
    //      width: "80%",
    //      height: "80vh",
    //      title: "Preview",
    //      modal: true,
    //      visible: false,
    //      close: function () {
    //        $("#preview").empty();
    //      }
    //    });
    //  }

    //  $("#previewWindow").data("kendoWindow").center().open();

    //  if (mimeType === "application/pdf") {
    //    $("#preview").kendoPDFViewer({
    //      pdfjsProcessing: { file: url },
    //      width: "100%",
    //      height: "100%",
    //      toolbar: {
    //        items: ["pager", "spacer", "zoomIn", "zoomOut", "toggleSelection", "download"]
    //      }
    //    });
    //  } else {
    //    $("#preview").html(`<img src="${url}" style="width:100%; height:auto;" />`);
    //  }
    //};

    //reader.readAsArrayBuffer(file);
  },

  initializeWorkExperienceGrid: function () {
    const gridOption = {
      dataSource: new kendo.data.DataSource({
        data: [],
        schema: {
          model: {
            id: "WorkExperienceId",
            fields: {
              WorkExperienceId: { type: "number", editable: false, nullable: true },
              NameOfEmployer: { type: "string" },
              Position: { type: "string" },
              StartDate: { type: "date" },
              EndDate: { type: "date" },
              Period: { type: "string" },
              MainResponsibility: { type: "string" },
              ScannedCopy: { type: "string" },
              DocumentName: { type: "string" },
              FileThumbnail: { type: "string" }
            }
          }
        }
      }),
      toolbar: ["create"],
      scrollable: true,
      resizable: true,
      width: "400px",
      columns: CRMEducationNEnglishLanguagHelper.generateWorkExperienceColumn(),
      editable: { model: "inline" },
      navigatable: true,
      selectable: true,
    };

    $("#gridWorkExperience").kendoGrid(gridOption);
  },

  generateWorkExperienceColumn: function () {
    return [
      { field: "WorkExperienceId", title: "WorkExperienceId", hidden: true },
      { field: "NameOfEmployer", title: "Name of Employer", width: "200px" },
      { field: "Position", title: "Position", width: "150px" },
      { field: "StartDate", title: "Start Date", width: "120px", format: "{0:dd/MM/yyyy}" },
      { field: "EndDate", title: "End Date", width: "120px", format: "{0:dd/MM/yyyy}" },
      { field: "Period", title: "Period", width: "100px" },
      { field: "MainResponsibility", title: "Main Responsibility", width: "250px" },
      {
        field: "ScannedCopy",
        title: "Scanned Copy",
        template: '#= CRMEducationNEnglishLanguagHelper.editorWorkFileUpload(data) #',
        filterable: false,
        width: "200px"
      },
      {
        field: "ViewScanned",
        title: "View Scanned Copy",
        template: '#= CRMEducationNEnglishLanguagHelper.ViewWorkDetails(data) #',
        editable: false,
        filterable: false,
        width: "200px"
      },
      { command: "destroy", title: "Action", width: "100px" }
    ];
  },

  editorWorkFileUpload: function (data) {
    if (data.ScannedCopy && data.DocumentName) {
      return '<div class="document-info">' +
        '<span class="document-name" title="' + data.DocumentName + '">' +
        (data.DocumentName.length > 20 ? data.DocumentName.substring(0, 20) + '...' : data.DocumentName) +
        '</span><br/>' +
        '<input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif" class="k-button form-control" ' +
        'onchange="CRMEducationNEnglishLanguagHelper.handleDirectWorkFileUpload(this, \'' + data.uid + '\')" ' +
        'title="Replace document"/>' +
        '</div>';
    } else {
      return '<input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif" value="Select PDF/Image file" class="k-button form-control" ' +
        'onchange="CRMEducationNEnglishLanguagHelper.handleDirectWorkFileUpload(this, \'' + data.uid + '\')" ' +
        'title="Upload PDF or Image document"/>';
    }
  },

  handleDirectWorkFileUpload: function (input, docuid) {
    const file = input.files[0];
    if (!file) return;

    // Validate file (PDF + Images)
    if (!CRMEducationNEnglishLanguagManager.validateWorkFile(file)) {
      alert("Only PDF, JPG, PNG, and GIF files are allowed. Please select a valid document or image.");
      input.value = '';
      return;
    }

    // Clear old file data
    if (workExperienceFileData[docuid]) {
      delete workExperienceFileData[docuid];
    }

    // Generate thumbnail and update grid
    CRMEducationNEnglishLanguagManager.generateWorkFileThumbnail(file, docuid, function (thumbnailUrl) {
      const fileName = file.name;
      const filePath = "/uploads/workexperience/" + fileName;

      CRMEducationNEnglishLanguagHelper.updateWorkGridRowWithDocument(docuid, {
        name: fileName,
        response: filePath,
        thumbnail: thumbnailUrl
      });

      if (typeof ToastrMessage !== 'undefined') {
        ToastrMessage.showSuccess("Work document uploaded successfully!");
      } else {
        alert("Work document uploaded successfully!");
      }
    });
  },

  updateWorkGridRowWithDocument: function (docuid, fileInfo) {
    const grid = $("#gridWorkExperience").data("kendoGrid");
    if (!grid) return;

    const dataSource = grid.dataSource;
    const data = dataSource.data();

    for (let i = 0; i < data.length; i++) {
      if (data[i].uid === docuid) {
        data[i].set("ScannedCopy", fileInfo.response || fileInfo.name);
        data[i].set("DocumentName", fileInfo.name);
        data[i].set("FileThumbnail", fileInfo.thumbnail || "");
        break;
      }
    }
    grid.refresh();
  },

  ViewWorkDetails: function (data) {
    if (data.ScannedCopy != null && data.ScannedCopy != "") {
      const fileName = data.DocumentName || data.ScannedCopy.split("/").pop();
      const thumbnailSrc = data.FileThumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+RklMRTwvdGV4dD4KPC9zdmc+';

      return '<div class="document-preview" style="height: 100px; width: auto; text-align: center;">' +
        '<img src="' + thumbnailSrc + '" alt="File" style="height: 100px; width: auto; cursor: pointer; border: 1px solid #ddd; border-radius: 4px;" ' +
        'onclick="CRMEducationNEnglishLanguagHelper.openWorkDocumentPreview(\'' + data.ScannedCopy + '\', \'' + data.uid + '\', \'' + fileName + '\')" ' +
        'title="Click to preview: ' + fileName + '"/>' +
        '<div style="font-size: 12px; text-align: center; margin-top: 5px; color: #666;">' + fileName + '</div>' +
        '</div>';
    } else {
      return '<div style="text-align: center; color: #999; padding: 20px; height: 100px; display: flex; align-items: center; justify-content: center;">No document uploaded</div>';
    }
  },

  openWorkDocumentPreview: function (documentPath, docuid, fileName) {
    if (!documentPath) {
      alert("No document available for preview.");
      return;
    }

    try {
      const fileData = workExperienceFileData[docuid];
      if (fileData) {
        PreviewManger.previewFileBlob(fileData, fileName);
      } else {
        PreviewManger.openPreview(documentPath, fileName);
      }
    } catch (error) {
      console.error("Error opening work document preview:", error);
      window.open(documentPath, '_blank');
    }
  }
}


