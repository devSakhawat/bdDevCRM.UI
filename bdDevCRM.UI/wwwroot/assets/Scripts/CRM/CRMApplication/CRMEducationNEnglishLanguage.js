/// <reference path="../../common/common.js" />

/// <reference path="crmadditionalinformation.js" />
/// <reference path="crmapplicationsettings.js" />
/// <reference path="crmcourseinformation.js" />

// Global Variables for PDF handling (similar to institute pattern)
let educationPdfFileData = {};
let workExperienceFileData = {};

// Global Variables for storing file data
let ieltsFileData = null;
let toeflFileData = null;
let pteFileData = null;
let gmatFileData = null;
let othersFileData = null;


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
        maxFileSize: 6194304, // ~5.9MB
        allowedExtensions: [".pdf"]
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
    CRMEducationNEnglishLanguagHelper.initializeDatePickers();


    CRMEducationNEnglishLanguagHelper.initializeFileUploads();

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
              ApplicantId: { type: "number", editable: false, nullable: true },
              Institution: { type: "string" },
              Qualification: { type: "string" },
              PassingYear: { type: "number" },
              Grade: { type: "string" },
              AttachedDocumentFile: { type: "object", editable: false, nullable: true },
              DocumentName: { type: "string" },
              AttachedDocument: { type: "string" },
              PdfThumbnail: { type: "string" },
            }
          }
        }
      }),
      toolbar: ["create"],
      scrollable: true,
      resizable: true,
      width: "400px",
      columns: CRMEducationNEnglishLanguagHelper.generateEducationSummaryColumn(),
      editable: { mode: "inline" },
      navigatable: true,
      selectable: true,
    };

    $("#gridEducationSummary").kendoGrid(gridOption);
    const gridInstance = $("#gridEducationSummary").data("kendoGrid");
    if (gridInstance) {
      //const dataSource = CRMEducationNEnglishLanguagManager.educationSummaryDataSource();

      // //Auto put all rows into edit mode
      //gridInstance.tbody.find("tr").each(function () {
      //  grid.editRow($(this));
      //});
    }
  },

  generateEducationSummaryColumn: function () {
    return [
      { field: "EducationHistoryId", title: "EducationHistoryId", hidden: true },
      { field: "ApplicantId", title: "ApplicantId", hidden: true },
      { field: "AttachedDocumentFile", title: "AttachedDocumentFile", hidden: true },
      { field: "Institution", title: "Name of Institution", width: "200px" },
      { field: "Qualification", title: "Qualification", width: "200px" },
      {
        field: "PassingYear",
        title: "Year of Passing",
        width: "140px",
        editor: CRMEducationNEnglishLanguagHelper.yearDropDownEditor
      },
      { field: "Grade", title: "Grade", width: "100px" },
      {
        field: "AttachedDocument",
        title: "Upload Document",
        template: "",
        editor: CRMEducationNEnglishLanguagHelper.editorFileUpload,
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
      { command: ["edit", "destroy"], title: "Action", width: "200px" }
    ];
  },

  yearDropDownEditor: function (container, options) {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 20; i++) {
      years.push({ year: currentYear - i });
    }

    $('<input required name="' + options.field + '"/>')
      .appendTo(container)
      .kendoDropDownList({
        dataTextField: "year",
        dataValueField: "year",
        dataSource: years,
        optionLabel: "Select Year"
      });
  },

  editorFileUpload: function (container, options) {
    const dataItem = options.model;
    const uid = dataItem.uid;

    const wrapper = $('<div class="document-info"></div>').appendTo(container);

    // Show document name always
    if (dataItem.DocumentName) {
      const shortName = dataItem.DocumentName.length > 20
        ? dataItem.DocumentName.substring(0, 20) + '...'
        : dataItem.DocumentName;

      $('<span class="document-name" title="' + dataItem.DocumentName + '">' + shortName + '</span><br/>')
        .appendTo(wrapper);
    }

    // Always allow file input for change
    $('<input type="file" accept=".pdf" class="k-button form-control" />')
      .attr("onchange", 'CRMEducationNEnglishLanguagHelper.handleDirectFileUpload(this, "' + uid + '")')
      .appendTo(wrapper);
  },

  //editorFileUpload: function (data) {
  //  // If document is already uploaded, show document name
  //  if (data.AttachedDocument && data.DocumentName) {
  //    return '<div class="document-info">' +
  //      '<span class="document-name" title="' + data.DocumentName + '">' +
  //      (data.DocumentName.length > 20 ? data.DocumentName.substring(0, 20) + '...' : data.DocumentName) +
  //      '</span><br/>' +
  //      '<input type="file" accept=".pdf" class="k-button form-control" ' +
  //      'onchange="CRMEducationNEnglishLanguagHelper.handleDirectFileUpload(this, \'' + data.uid + '\')" ' +
  //      'title="Replace document"/>' +
  //      '</div>';
  //  } else {
  //    // If no document uploaded, show file input
  //    return '<input type="file" accept=".pdf" value="Select PDF file" class="k-button form-control" ' +
  //      'onchange="CRMEducationNEnglishLanguagHelper.handleDirectFileUpload(this, \'' + data.uid + '\')" ' +
  //      'title="Upload PDF document only"/>';
  //  }
  //},

  ViewDetails: function (data) {
    debugger;
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

  SelectFileBrowser: function (docuid) {
    debugger;
    const uploadWindow = $("#windDocumentPhotoUpload").data('kendoWindow');
    if (uploadWindow) {
      uploadWindow.center().open();
      CRMEducationNEnglishLanguagManager.fileUpload(docuid);
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
      debugger;
      // For now, simulate successful upload and update grid
      const fileName = file.name;
      const filePath = "/uploads/education/" + fileName; // This would come from server response

      // Update the grid row
      CRMEducationNEnglishLanguagHelper.updateGridRowWithDocument(docuid, {
        name: fileName,
        response: filePath,
        thumbnail: thumbnailUrl,
        file: file // Store the file for later preview
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
    debugger;
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

        try {
          // assign directly as Object
          data[i].AttachedDocumentFile = fileInfo.file || null;
        } catch (e) {
          // Fallback: assign directly if set() fails
          // Preferred: try set() if model is observable
          data[i].set("AttachedDocumentFile", fileInfo.file || "");
        }

        break;
      }
    }
    console.log(data);

    // Refresh the grid to show updated data
    grid.refresh();
  },

  // Open document preview using iframe (as requested)
  openDocumentPreview: function (documentPath, docuid, fileName) {
    debugger;
    if (!documentPath) {
      CommonManager.MsgBox('warning', 'center', 'Document Missing', 'No document available for preview.', [
        { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
      ], 0);
      return;
    }

    try {
      const fileData = educationPdfFileData[docuid];
      if (fileData) {
        PreviewManger.previewFileBlob(fileData, fileName);
      } else {
        PreviewManger.openPreview(documentPath, fileName);
      }
    } catch (error) {
      console.error("Error opening document preview:", error);
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
              ApplicantId: { type: "number", editable: false, nullable: true },
              NameOfEmployer: { type: "string" },
              Position: { type: "string" },
              StartDate: { type: "date" },
              EndDate: { type: "date" },
              Period: { type: "string" },
              MainResponsibility: { type: "string" },
              ScannedCopyFile: { type: "object", editable: false, nullable: true },
              ScannedCopyFileName: { type: "string" },
              ScannedCopyPath: { type: "string" },
              //ScannedCopy: { type: "string" },
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
      editable: { mode: "inline" },
      navigatable: true,
      selectable: true,
    };

    $("#gridWorkExperience").kendoGrid(gridOption);
  },

  generateWorkExperienceColumn: function () {
    return [
      { field: "WorkExperienceId", title: "WorkExperienceId", hidden: true },
      { field: "ApplicantId", title: "ApplicantId", hidden: true },

      // Keep these hidden so template can use them
      { field: "ScannedCopyFile", title: "ScannedCopyFile", hidden: true },
      { field: "ScannedCopyFileName", title: "ScannedCopyFileName", hidden: true },
      { field: "ScannedCopyPath", title: "ScannedCopyPath", hidden: true },
      { field: "DocumentName", title: "DocumentName", hidden: true },
      { field: "FileThumbnail", title: "FileThumbnail", hidden: true },

      { field: "NameOfEmployer", title: "Name of Employer", width: "200px" },
      { field: "Position", title: "Position", width: "150px" },
      //{ field: "StartDate", title: "Start Date", width: "120px", format: "{0:dd/MM/yyyy}" },
      //{ field: "EndDate", title: "End Date", width: "120px", format: "{0:dd/MM/yyyy}" },
      {
        field: "StartDate",
        title: "Start Date",
        width: "230px",
        format: "{0:dd/MMM/yyyy}",
        editor: CommonManager.datePickerEditor
      },
      {
        field: "EndDate",
        title: "End Date",
        width: "230px",
        format: "{0:dd/MMM/yyyy}",
        editor: CommonManager.datePickerEditor
      },
      { field: "Period", title: "Period", width: "100px" },
      {
        field: "MainResponsibility",
        title: "Main Responsibility",
        width: "250px",
        editor: CommonManager.textareaEditor
      },
      {
        field: "ScannedCopy",
        title: "Scanned Copy",
        template: "",
        editor: CRMEducationNEnglishLanguagHelper.editorWorkFileUpload,
        filterable: false,
        width: "200px"
      },
      {
        field: "View",
        title: "View Scanned Copy",
        template: '#= CRMEducationNEnglishLanguagHelper.ViewWorkDetails(data) #',
        editable: false,
        filterable: false,
        width: "200px"
      },
      { command: ["edit", "destroy"], title: "Action", width: "200px" }
    ];
  },

  editorWorkFileUpload: function (container, options) {
    const dataItem = options.model;
    const uid = dataItem.uid;

    $('<input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif" class="form-control" />')
      .attr("onchange", 'CRMEducationNEnglishLanguagHelper.handleDirectWorkFileUpload(this, "' + uid + '")')
      .appendTo(container);


    //const wrapper = $('<div class="document-info"></div>').appendTo(container);

    //// Show document name if exists (optional info display)
    //if (dataItem.DocumentName) {
    //  const shortName = dataItem.DocumentName.length > 20
    //    ? dataItem.DocumentName.substring(0, 20) + '...'
    //    : dataItem.DocumentName;

    //  $('<div class="document-name" style="font-size: 11px; color: #666; margin-bottom: 4px;" title="' + dataItem.DocumentName + '">' +
    //    '<i class="k-icon k-i-file" style="margin-right: 4px;"></i>' + shortName +
    //    '</div>')
    //    .appendTo(wrapper);
    //}
    //// Always show file input - regardless of whether document exists or not
    //$('<input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif" class="k-button form-control" />')
    //  .attr("onchange", 'CRMEducationNEnglishLanguagHelper.handleDirectWorkFileUpload(this, "' + uid + '")')
    //  .attr("title", dataItem.DocumentName ? "Replace document" : "Upload PDF or Image document")
    //  .appendTo(wrapper);
  },

  editorWorkFileUpload2: function (data) {
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
        thumbnail: thumbnailUrl,
        file: file
      });

      if (typeof ToastrMessage !== 'undefined') {
        ToastrMessage.showSuccess("Work document uploaded successfully!");
      } else {
        alert("Work document uploaded successfully!");
      }
    });
  },

  updateGridRowWithDocument: function (docuid, fileInfo) {
    debugger;
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

        try {
          // assign directly as Object
          data[i].AttachedDocumentFile = fileInfo.file || null;
        } catch (e) {
          // Fallback: assign directly if set() fails
          // Preferred: try set() if model is observable
          data[i].set("AttachedDocumentFile", fileInfo.file || "");
        }

        break;
      }
    }
    console.log(data);

    // Refresh the grid to show updated data
    grid.refresh();
  },

  updateWorkGridRowWithDocument: function (docuid, fileInfo) {
    const grid = $("#gridWorkExperience").data("kendoGrid");
    if (!grid) return;

    const data = grid.dataSource.data();

    for (let i = 0; i < data.length; i++) {
      if (data[i].uid === docuid) {
        const path = fileInfo.response || fileInfo.name || "";

        data[i].set("ScannedCopy", path);
        data[i].set("ScannedCopyPath", path);
        data[i].set("ScannedCopyFileName", fileInfo.name || data[i].ScannedCopyFileName || "");
        data[i].set("DocumentName", fileInfo.name || data[i].DocumentName || "");
        data[i].set("FileThumbnail", fileInfo.thumbnail || "");

        try {
          data[i].ScannedCopyFile = fileInfo.file || null;
        } catch (e) {
          data[i].set("ScannedCopyFile", fileInfo.file || "");
        }
        break;
      }
    }
    grid.refresh();
  },

  //ViewWorkDetails: function (data) {
  //  const path = data.ScannedCopyPath || "";
  //  if (path) {
  //    const fileName =
  //      data.ScannedCopyFileName ||
  //      data.DocumentName ||
  //      path.split("/").pop();

  //    const thumbnailSrc = data.FileThumbnail ||
  //      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+RklMRTwvdGV4dD4KPC9zdmc+';

  //    return '<div class="document-preview" style="height: 100px; width: auto; text-align: center;">' +
  //      '<img src="' + thumbnailSrc + '" alt="File" style="height: 100px; width: auto; cursor: pointer; border: 1px solid #ddd; border-radius: 4px;" ' +
  //      'onclick="CRMEducationNEnglishLanguagHelper.openWorkDocumentPreview(\'' + path + '\', \'' + data.uid + '\', \'' + fileName + '\')" ' +
  //      'title="Click to preview: ' + fileName + '"/>' +
  //      '<div style="font-size: 12px; text-align: center; margin-top: 5px; color: #666;">' + fileName + '</div>' +
  //      '</div>';
  //  } else {
  //    return '<div style="text-align: center; color: #999; padding: 20px; height: 100px; display: flex; align-items: center; justify-content: center;">No document uploaded</div>';
  //  }
  //},

  ViewWorkDetails: function (data) {
    // Unified path fallback
    const rawPath = data.ScannedCopyPath || data.ScannedCopy || "";
    if (!rawPath) {
      return '<div style="text-align:center; color:#999; padding:20px; height:100px; display:flex; align-items:center; justify-content:center;">No document uploaded</div>';
    }

    // Absolute / relative resolve
    const isAbsolute = /^(https?:)?\/\//i.test(rawPath) || rawPath.startsWith("data:");
    const fullPath = isAbsolute ? rawPath : (typeof baseApiFilePath !== "undefined" ? baseApiFilePath + rawPath : rawPath);

    // Detect image vs pdf
    const cleanName = rawPath.split("?")[0].split("#")[0];
    const ext = (cleanName.substring(cleanName.lastIndexOf(".") + 1) || "").toLowerCase();
    const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(cleanName);
    const isPdf = ext === "pdf";

    // File name fallback
    const fileName =
      data.ScannedCopyFileName ||
      data.DocumentName ||
      (cleanName ? cleanName.split("/").pop() : "Document");

    // Thumbnail logic
    let thumbnailSrc;
    if (isImage) {
      // Use server-provided thumbnail else original image
      if (data.FileThumbnail) {
        thumbnailSrc = data.FileThumbnail.startsWith("data:") ? data.FileThumbnail
          : (/^(https?:)?\/\//i.test(data.FileThumbnail) ? data.FileThumbnail
            : (typeof baseApiFilePath !== "undefined" ? baseApiFilePath + data.FileThumbnail : data.FileThumbnail));
      } else {
        thumbnailSrc = fullPath; // original image
      }
    } else if (isPdf) {
      // PDF: যদি PDF thumbnail (server generated) থাকে সেটি; নইলে placeholder
      thumbnailSrc = data.FileThumbnail
        ? (data.FileThumbnail.startsWith("data:") ? data.FileThumbnail
          : (/^(https?:)?\/\//i.test(data.FileThumbnail) ? data.FileThumbnail
            : (typeof baseApiFilePath !== "undefined" ? baseApiFilePath + data.FileThumbnail : data.FileThumbnail)))
        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+UERGPC90ZXh0Pgo8L3N2Zz4K';
    } else {
      // Other file types – generic placeholder
      thumbnailSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+RklMRTwvdGV4dD4KPC9zdmc+';
    }

    return `
      <div class="document-preview" style="height:100px;width:auto;text-align:center;">
        <img src="${thumbnailSrc}" 
             alt="File" 
             style="height:100px;width:auto;cursor:pointer;border:1px solid #ddd;border-radius:4px; background:#fff;"
             onclick="CRMEducationNEnglishLanguagHelper.openWorkDocumentPreview('${rawPath.replace(/'/g, "\\'")}', '${data.uid}', '${fileName.replace(/'/g, "\\'")}')" 
             title="Click to preview: ${fileName}"
             onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+RklMRTwvdGV4dD4KPC9zdmc+';" />
        <div style="font-size:12px;text-align:center;margin-top:5px;color:#666;">${fileName}</div>
      </div>`;
  },

  openWorkDocumentPreview: function (documentPath, docuid, fileName) {
    const resolvedPath = documentPath || "";
    if (!resolvedPath) {
      CommonManager.MsgBox('warning', 'center', 'Document Missing', 'No document available for preview.', [
        { addClass: 'btn btn-primary', text: 'OK', onClick: ($n) => $n.close() }
      ], 0);
      return;
    }
    try {
      const fileData = workExperienceFileData[docuid];
      if (fileData) {
        PreviewManger.previewFileBlob(fileData, fileName);
      } else {
        PreviewManger.openPreview(resolvedPath, fileName);
      }
    } catch (error) {
      console.error("Error opening work document preview:", error);
      window.open(resolvedPath, '_blank');
    }
  },


  //openWorkDocumentPreview: function (documentPath, docuid, fileName) {
  //  if (!documentPath) {
  //    CommonManager.MsgBox('warning', 'center', 'Document Missing', 'No document available for preview.', [
  //      { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
  //    ], 0);
  //    return;
  //  }

  //  try {
  //    const fileData = workExperienceFileData[docuid];
  //    if (fileData) {
  //      PreviewManger.previewFileBlob(fileData, fileName);
  //    } else {
  //      PreviewManger.openPreview(documentPath, fileName);
  //    }
  //  } catch (error) {
  //    console.error("Error opening work document preview:", error);
  //    window.open(documentPath, '_blank');
  //  }
  //},

  /* =========================================================
   Form Clearing and Data Object Creation Methods
=========================================================*/

  /* ------ Clear Form Methods ------ */
  clearEducationNEnglishLanguageForm: function () {
    try {
      console.log("=== Clearing Education & English Language Form ===");

      // Clear IELTS Information
      this.clearIELTSInformation();

      // Clear TOEFL Information
      this.clearTOEFLInformation();

      // Clear PTE Information  
      this.clearPTEInformation();

      // Clear GMAT Information
      this.clearGMATInformation();

      // Clear OTHERS Information
      this.clearOTHERSInformation();

      // Clear Education Grid
      this.clearEducationGrid();

      // Clear Work Experience Grid
      this.clearWorkExperienceGrid();

      console.log("Education & English Language form cleared successfully");

    } catch (error) {
      console.error("Error clearing Education & English Language form:", error);
      if (typeof VanillaApiCallManager !== "undefined") {
        VanillaApiCallManager.handleApiError(error);
      }
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error clearing Education & English Language form: " + error.message, "Form Clear Error", 0);
      }
    }
  },

  /* ------ Updated Clear Methods with File Data ------ */
  clearIELTSInformation: function () {
    try {
      // Text Fields
      $("#txtIELTSListening").val("");
      $("#txtIELTSReading").val("");
      $("#txtIELTSWriting").val("");
      $("#txtIELTSSpeaking").val("");
      $("#txtIELTSOverallScore").val("");
      $("#txtIELTSAdditionalInformation").val("");

      // Date Fields
      const ieltsDatePicker = $("#dateIELTSDate").data("kendoDatePicker");
      if (ieltsDatePicker) ieltsDatePicker.value(null);

      // File Fields
      $("#fileIELTSScanCopy").val("");

      // Clear file data and reset view button
      ieltsFileData = null;
      this.resetViewButton("#fileIELTSScannedCopyViewBtn", "IELTS");

      console.log("IELTS Information section cleared");
    } catch (error) {
      console.error("Error clearing IELTS Information:", error);
    }
  },

  clearTOEFLInformation: function () {
    try {
      // Text Fields
      $("#txtTOEFLListening").val("");
      $("#txtTOEFLReading").val("");
      $("#txtTOEFLWriting").val("");
      $("#txtTOEFLSpeaking").val("");
      $("#txtTOEFLOverallScore").val("");
      $("#txtTOEFLAdditionalInformation").val("");

      // Date Fields
      const toeflDatePicker = $("#dateTOEFLDate").data("kendoDatePicker");
      if (toeflDatePicker) toeflDatePicker.value(null);

      // File Fields
      $("#fileTOEFLScanCopy").val("");

      // Clear file data and reset view button
      toeflFileData = null;
      this.resetViewButton("#fileTOEFLScannedCopyViewBtn", "TOEFL");

      console.log("TOEFL Information section cleared");
    } catch (error) {
      console.error("Error clearing TOEFL Information:", error);
    }
  },

  clearPTEInformation: function () {
    try {
      // Text Fields
      $("#txtPTEListening").val("");
      $("#txtPTEReading").val("");
      $("#txtPTEWriting").val("");
      $("#txtPTESpeaking").val("");
      $("#txtPTEOverallScore").val("");
      $("#txtPTEAdditionalInformation").val("");

      // Date Fields
      const pteDatePicker = $("#datePTEDate").data("kendoDatePicker");
      if (pteDatePicker) pteDatePicker.value(null);

      // File Fields
      $("#filePTEScanCopy").val("");

      // Clear file data and reset view button
      pteFileData = null;
      this.resetViewButton("#filePTEScannedCopyViewBtn", "PTE");

      console.log("PTE Information section cleared");
    } catch (error) {
      console.error("Error clearing PTE Information:", error);
    }
  },

  clearGMATInformation: function () {
    try {
      // Text Fields
      $("#txtGMATListening").val("");
      $("#txtGMATReading").val("");
      $("#txtGMATWriting").val("");
      $("#txtGMATSpeaking").val("");
      $("#txtGMATOverallScore").val("");
      $("#txtGMATAdditionalInformation").val("");

      // Date Fields
      const gmatDatePicker = $("#dateGMATDate").data("kendoDatePicker");
      if (gmatDatePicker) gmatDatePicker.value(null);

      // File Fields
      $("#fileGMATScanCopy").val("");

      // Clear file data and reset view button
      gmatFileData = null;
      this.resetViewButton("#fileGMATScannedCopyViewBtn", "GMAT");

      console.log("GMAT Information section cleared");
    } catch (error) {
      console.error("Error clearing GMAT Information:", error);
    }
  },

  clearOTHERSInformation: function () {
    try {
      // Text Fields
      $("#txtAdditionalInformation").val("");

      // File Fields
      $("#fileOTHERSScannedCopy").val("");

      // Clear file data and reset view button
      othersFileData = null;
      this.resetViewButton("#oTHERSScannedCopyViewBtn", "OTHERS");

      console.log("OTHERS Information section cleared");
    } catch (error) {
      console.error("Error clearing OTHERS Information:", error);
    }
  },

  clearEducationGrid: function () {
    try {
      const grid = $("#gridEducationSummary").data("kendoGrid");
      if (grid) {
        grid.dataSource.data([]);
      }

      // Clear global file data
      educationPdfFileData = {};

      console.log("Education Grid cleared");
    } catch (error) {
      console.error("Error clearing Education Grid:", error);
    }
  },

  clearWorkExperienceGrid: function () {
    try {
      const grid = $("#gridWorkExperience").data("kendoGrid");
      if (grid) {
        grid.dataSource.data([]);
      }

      // Clear global file data
      workExperienceFileData = {};

      console.log("Work Experience Grid cleared");
    } catch (error) {
      console.error("Error clearing Work Experience Grid:", error);
    }
  },

  /* ------ Reset View Button Helper ------ */
  resetViewButton: function (buttonSelector, testType) {
    const $button = $(buttonSelector);
    if ($button.length) {
      $button.prop("disabled", true);
      $button.attr("title", "");
      $button.html(`<i class="k-icon k-i-preview"></i> View ${testType} Document`);
    }
  },


  /* ------ Date Picker Initialization Methods ------ */
  initializeDatePickers: function () {
    try {
      // Initialize IELTS Date Picker
      $("#dateIELTSDate").kendoDatePicker({
        format: "dd-MMM-yyyy",
        parseFormats: ["yyyy-MM-dd"],
        max: new Date(),
        placeholder: "Select IELTS Date"
      });

      // Initialize TOEFL Date Picker
      $("#dateTOEFLDate").kendoDatePicker({
        format: "dd-MMM-yyyy",
        parseFormats: ["yyyy-MM-dd"],
        max: new Date(),
        placeholder: "Select TOEFL Date"
      });

      // Initialize PTE Date Picker
      $("#datePTEDate").kendoDatePicker({
        format: "dd-MMM-yyyy",
        parseFormats: ["yyyy-MM-dd"],
        max: new Date(),
        placeholder: "Select PTE Date"
      });

      // Initialize GMAT Date Picker
      $("#dateGMATDate").kendoDatePicker({
        format: "dd-MMM-yyyy",
        parseFormats: ["yyyy-MM-dd"],
        max: new Date(),
        placeholder: "Select GMAT Date"
      });

      console.log("Date pickers initialized successfully");
    } catch (error) {
      console.error("Error initializing date pickers:", error);
    }
  },

  /* ------ File Upload Initialization Methods ------ */
  initializeFileUploads: function () {
    try {
      console.log("=== Initializing File Uploads ===");

      // Initialize IELTS file upload
      this.initializeIELTSFileUpload();

      // Initialize TOEFL file upload
      this.initializeTOEFLFileUpload();

      // Initialize PTE file upload
      this.initializePTEFileUpload();

      // Initialize GMAT file upload
      this.initializeGMATFileUpload();

      // Initialize OTHERS file upload
      this.initializeOTHERSFileUpload();

      console.log("File uploads initialized successfully");
    } catch (error) {
      console.error("Error initializing file uploads:", error);
    }
  },

  initializeIELTSFileUpload: function () {
    // Browse Scanned Copy - File Input
    $("#fileIELTSScanCopy").on("change", function () {
      CRMEducationNEnglishLanguagHelper.handleIELTSFileUpload(this);
    });

    // IELTS Scanned Copy - View Button (convert to button for viewing)
    this.convertToViewButton("#fileIELTSScannedCopy", "IELTS", function () {
      CRMEducationNEnglishLanguagHelper.viewIELTSDocument();
    });
  },

  initializeTOEFLFileUpload: function () {
    // Note: fileTOEFLScanCopy has incorrect attribute "file=type", should be "type=file"
    $("#fileTOEFLScanCopy").attr("type", "file").on("change", function () {
      CRMEducationNEnglishLanguagHelper.handleTOEFLFileUpload(this);
    });

    this.convertToViewButton("#fileTOEFLScannedCopy", "TOEFL", function () {
      CRMEducationNEnglishLanguagHelper.viewTOEFLDocument();
    });
  },

  initializePTEFileUpload: function () {
    $("#filePTEScanCopy").on("change", function () {
      CRMEducationNEnglishLanguagHelper.handlePTEFileUpload(this);
    });

    this.convertToViewButton("#filePTEScannedCopy", "PTE", function () {
      CRMEducationNEnglishLanguagHelper.viewPTEDocument();
    });
  },

  initializeGMATFileUpload: function () {
    // Note: fileGMATScanCopy doesn't have type="file" attribute
    $("#fileGMATScanCopy").attr("type", "file").on("change", function () {
      CRMEducationNEnglishLanguagHelper.handleGMATFileUpload(this);
    });

    this.convertToViewButton("#fileGMATScannedCopy", "GMAT", function () {
      CRMEducationNEnglishLanguagHelper.viewGMATDocument();
    });
  },

  initializeOTHERSFileUpload: function () {
    // Browse Scanned Copy - File Input (already has type="file")
    $("#fileOTHERSScannedCopy").on("change", function () {
      CRMEducationNEnglishLanguagHelper.handleOTHERSFileUpload(this);
    });

    // OTHERS Scanned Copy - View Button (convert to button for viewing)
    this.convertToViewButton("#oTHERSScannedCopy", "OTHERS", function () {
      CRMEducationNEnglishLanguagHelper.viewOTHERSDocument();
    });
  },


  /* ------ Utility Method to Convert File Input to View Button ------ */
  convertToViewButton: function (selector, testType, clickHandler) {
    const $element = $(selector);
    const $container = $element.parent();

    // Create view button
    const viewButton = $(`
    <button type="button" class="btn btn-outline-primary w-100" id="${selector.substring(1)}ViewBtn" disabled>
      <i class="k-icon k-i-preview"></i> View ${testType} Document
    </button>
  `);

    // Replace file input with button
    $element.replaceWith(viewButton);

    // Add click handler
    viewButton.on("click", clickHandler);
  },

  /* ------ File Upload Handlers ------ */
  handleIELTSFileUpload: function (input) {
    const file = input.files[0];
    if (!file) return;

    if (!this.validateTestFile(file)) {
      alert("Only PDF, JPG, JPEG, PNG, and GIF files are allowed.");
      input.value = '';
      return;
    }

    ieltsFileData = file;
    this.updateViewButton("#fileIELTSScannedCopyViewBtn", file.name);

    if (typeof ToastrMessage !== "undefined") {
      ToastrMessage.showSuccess("IELTS document uploaded successfully!");
    }
  },

  handleTOEFLFileUpload: function (input) {
    const file = input.files[0];
    if (!file) return;

    if (!this.validateTestFile(file)) {
      alert("Only PDF, JPG, JPEG, PNG, and GIF files are allowed.");
      input.value = '';
      return;
    }

    toeflFileData = file;
    this.updateViewButton("#fileTOEFLScannedCopyViewBtn", file.name);

    if (typeof ToastrMessage !== "undefined") {
      ToastrMessage.showSuccess("TOEFL document uploaded successfully!");
    }
  },

  handlePTEFileUpload: function (input) {
    const file = input.files[0];
    if (!file) return;

    if (!this.validateTestFile(file)) {
      alert("Only PDF, JPG, JPEG, PNG, and GIF files are allowed.");
      input.value = '';
      return;
    }

    pteFileData = file;
    this.updateViewButton("#filePTEScannedCopyViewBtn", file.name);

    if (typeof ToastrMessage !== "undefined") {
      ToastrMessage.showSuccess("PTE document uploaded successfully!");
    }
  },

  handleGMATFileUpload: function (input) {
    const file = input.files[0];
    if (!file) return;

    if (!this.validateTestFile(file)) {
      alert("Only PDF, JPG, JPEG, PNG, and GIF files are allowed.");
      input.value = '';
      return;
    }

    gmatFileData = file; // This was correct
    this.updateViewButton("#fileGMATScannedCopyViewBtn", file.name); // Fixed button selector

    if (typeof ToastrMessage !== "undefined") {
      ToastrMessage.showSuccess("GMAT document uploaded successfully!");
    }
  },

  /* ------ File Upload Handler for OTHERS ------ */
  handleOTHERSFileUpload: function (input) {
    const file = input.files[0];
    if (!file) return;

    if (!this.validateTestFile(file)) {
      alert("Only PDF, JPG, JPEG, PNG, and GIF files are allowed.");
      input.value = '';
      return;
    }

    othersFileData = file;
    this.updateViewButton("#oTHERSScannedCopyViewBtn", file.name);

    if (typeof ToastrMessage !== "undefined") {
      ToastrMessage.showSuccess("OTHERS document uploaded successfully!");
    }
  },


  /* ------ File Validation ------ */
  validateTestFile: function (file) {
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

  /* ------ View Button Update ------ */
  updateViewButton: function (buttonSelector, fileName) {
    const $button = $(buttonSelector);
    if ($button.length) {
      $button.prop("disabled", false);
      $button.attr("title", "Click to view: " + fileName);

      // Update button text to show file name
      const maxLength = 30;
      const displayName = fileName.length > maxLength ?
        fileName.substring(0, maxLength) + '...' : fileName;

      $button.html(`<i class="k-icon k-i-preview"></i> ${displayName}`);
    }
  },

  /* ------ Document View Methods ------ */
  /* ------ Document View Methods (updated: server-path fallback + custom warning box) ------ */
  viewIELTSDocument: function () {
    // 1) Local file selected this session
    if (ieltsFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(ieltsFileData, ieltsFileData.name);
      } else {
        CommonManager.MsgBox('warning', 'center', 'Preview', 'Preview functionality is not available', [
          { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
        ], 0);
      }
      return;
    }

    // 2) Try server file set during populate
    const btn = $("#fileIELTSScannedCopyViewBtn");
    const serverPath = btn.data("filePath");
    const serverName = btn.data("fileName");

    if (serverPath && typeof PreviewManger !== "undefined") {
      PreviewManger.openPreview(serverPath, serverName);
      return;
    }

    // 3) Custom warning box instead of alert
    CommonManager.MsgBox('warning', 'center', 'Document Missing', 'No IELTS document uploaded', [
      { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
    ], 0);
  },

  viewTOEFLDocument: function () {
    if (toeflFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(toeflFileData, toeflFileData.name);
      } else {
        CommonManager.MsgBox('warning', 'center', 'Preview', 'Preview functionality is not available', [
          { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
        ], 0);
      }
      return;
    }

    const btn = $("#fileTOEFLScannedCopyViewBtn");
    const serverPath = btn.data("filePath");
    const serverName = btn.data("fileName");

    if (serverPath && typeof PreviewManger !== "undefined") {
      PreviewManger.openPreview(serverPath, serverName);
      return;
    }

    CommonManager.MsgBox('warning', 'center', 'Document Missing', 'No TOEFL document uploaded', [
      { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
    ], 0);
  },

  viewPTEDocument: function () {
    if (pteFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(pteFileData, pteFileData.name);
      } else {
        CommonManager.MsgBox('warning', 'center', 'Preview', 'Preview functionality is not available', [
          { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
        ], 0);
      }
      return;
    }

    const btn = $("#filePTEScannedCopyViewBtn");
    const serverPath = btn.data("filePath");
    const serverName = btn.data("fileName");

    if (serverPath && typeof PreviewManger !== "undefined") {
      PreviewManger.openPreview(serverPath, serverName);
      return;
    }

    CommonManager.MsgBox('warning', 'center', 'Document Missing', 'No PTE document uploaded', [
      { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
    ], 0);
  },

  viewGMATDocument: function () {
    if (gmatFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(gmatFileData, gmatFileData.name);
      } else {
        CommonManager.MsgBox('warning', 'center', 'Preview', 'Preview functionality is not available', [
          { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
        ], 0);
      }
      return;
    }

    const btn = $("#fileGMATScannedCopyViewBtn");
    const serverPath = btn.data("filePath");
    const serverName = btn.data("fileName");

    if (serverPath && typeof PreviewManger !== "undefined") {
      PreviewManger.openPreview(serverPath, serverName);
      return;
    }

    CommonManager.MsgBox('warning', 'center', 'Document Missing', 'No GMAT document uploaded', [
      { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
    ], 0);
  },

  viewOTHERSDocument: function () {
    if (othersFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(othersFileData, othersFileData.name);
      } else {
        CommonManager.MsgBox('warning', 'center', 'Preview', 'Preview functionality is not available', [
          { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
        ], 0);
      }
      return;
    }

    const btn = $("#oTHERSScannedCopyViewBtn");
    const serverPath = btn.data("filePath");
    const serverName = btn.data("fileName");

    if (serverPath && typeof PreviewManger !== "undefined") {
      PreviewManger.openPreview(serverPath, serverName);
      return;
    }

    CommonManager.MsgBox('warning', 'center', 'Document Missing', 'No OTHERS document uploaded', [
      { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
    ], 0);
  },

  // Also replace alert in preview helpers
  openDocumentPreview: function (documentPath, docuid, fileName) {
    debugger;
    if (!documentPath) {
      CommonManager.MsgBox('warning', 'center', 'Document Missing', 'No document available for preview.', [
        { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
      ], 0);
      return;
    }

    try {
      const fileData = educationPdfFileData[docuid];
      if (fileData) {
        PreviewManger.previewFileBlob(fileData, fileName);
      } else {
        PreviewManger.openPreview(documentPath, fileName);
      }
    } catch (error) {
      console.error("Error opening document preview:", error);
      window.open(documentPath, '_blank');
    }
  },

  openWorkDocumentPreview: function (documentPath, docuid, fileName) {
    if (!documentPath) {
      CommonManager.MsgBox('warning', 'center', 'Document Missing', 'No document available for preview.', [
        { addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }
      ], 0);
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
  },

  //viewIELTSDocument: function () {
  //  if (ieltsFileData) {
  //    if (typeof PreviewManger !== "undefined") {
  //      PreviewManger.previewFileBlob(ieltsFileData, ieltsFileData.name);
  //    } else {
  //      alert("Preview functionality is not available");
  //    }
  //  } else {
  //    alert("No IELTS document uploaded");
  //  }
  //},

  //viewTOEFLDocument: function () {
  //  if (toeflFileData) {
  //    if (typeof PreviewManger !== "undefined") {
  //      PreviewManger.previewFileBlob(toeflFileData, toeflFileData.name);
  //    } else {
  //      alert("Preview functionality is not available");
  //    }
  //  } else {
  //    alert("No TOEFL document uploaded");
  //  }
  //},

  //viewPTEDocument: function () {
  //  if (pteFileData) {
  //    if (typeof PreviewManger !== "undefined") {
  //      PreviewManger.previewFileBlob(pteFileData, pteFileData.name);
  //    } else {
  //      alert("Preview functionality is not available");
  //    }
  //  } else {
  //    alert("No PTE document uploaded");
  //  }
  //},

  //viewGMATDocument: function () {
  //  if (gmatFileData) {
  //    if (typeof PreviewManger !== "undefined") {
  //      PreviewManger.previewFileBlob(gmatFileData, gmatFileData.name);
  //    } else {
  //      alert("Preview functionality is not available");
  //    }
  //  } else {
  //    alert("No GMAT document uploaded");
  //  }
  //},

  //viewOTHERSDocument: function () {
  //  if (othersFileData) {
  //    if (typeof PreviewManger !== "undefined") {
  //      PreviewManger.previewFileBlob(othersFileData, othersFileData.name);
  //    } else {
  //      alert("Preview functionality is not available");
  //    }
  //  } else {
  //    alert("No OTHERS document uploaded");
  //  }
  //},



  /* ------ Data Object Creation Methods ------ */
  createEducationNEnglishLanguageInformation: function () {
    try {
      const educationNEnglishLanguageInformation = {
        EducationDetails: this.createEducationDetailsObject(),
        IELTSInformation: this.createIELTSInformationObject(),
        TOEFLInformation: this.createTOEFLInformationObject(),
        PTEInformation: this.createPTEInformationObject(),
        GMATInformation: this.createGMATInformationObject(),
        OTHERSInformation: this.createOTHERSInformationObject(),
        WorkExperience: this.createWorkExperienceObject()
      };

      console.log("Education & English Language Information object created:", educationNEnglishLanguageInformation);
      return educationNEnglishLanguageInformation;

    } catch (error) {
      console.error("Error creating Education & English Language Information object:", error);
      return null;
    }
  },

  /* ------ Object Creation with File Data ------ */
  createEducationDetailsObject: function () {
    try {
      const grid = $("#gridEducationSummary").data("kendoGrid");
      const educationData = [];
      const attachedFiles = [];

      if (grid) {
        const data = grid.dataSource.data();
        console.log(data);
        data.forEach(function (item) {
          educationData.push({
            EducationHistoryId: item.EducationHistoryId,
            ApplicantId: item.ApplicantId,
            Institution: item.Institution,
            Qualification: item.Qualification,
            PassingYear: item.PassingYear,
            Grade: item.Grade,
            DocumentName: item.DocumentName,
            AttachedDocument: item.AttachedDocument,
            PdfThumbnail: item.PdfThumbnail,
            AttachedDocumentFile: item.AttachedDocumentFile ? item.AttachedDocumentFile : null,
          });

          if (item.AttachedDocumentFile) {
            attachedFiles.push(item.AttachedDocumentFile);
          }

        });
      }

      return {
        EducationHistory: educationData,
        TotalEducationRecords: educationData.length,
        //AttachedDocumentFileList: attachedFiles // attached files for education here.
      };

      //AttachedDocumentFileList:
      //The return object of the createEducationDetailsObject() function correctly contains the AttachedDocumentFileList, 
      //but it cannot be sent directly to the server as JSON, because the File object is not serializable.
      //For this, a separate file needs to be added to the FormData.

    } catch (error) {
      console.log("Error creating Education Details object:" + error);
      return {};
    }
  },

  createIELTSInformationObject: function () {
    try {
      const ieltsDatePicker = $("#dateIELTSDate").data("kendoDatePicker");

      return {
        IELTSInformationId: parseInt($("#hdnIELTSInformationId").val()) || 0,
        ApplicantId: parseInt($("#hdnApplicantId").val()) || 0,
        IELTSListening: $("#txtIELTSListening").val(),
        IELTSReading: $("#txtIELTSReading").val(),
        IELTSWriting: $("#txtIELTSWriting").val(),
        IELTSSpeaking: $("#txtIELTSSpeaking").val(),
        IELTSOverallScore: $("#txtIELTSOverallScore").val(),
        IELTSDate: ieltsDatePicker ? ieltsDatePicker.value() : null,
        //IELTSScannedCopy: ieltsFileData,
        IELTSScannedCopyFile: ieltsFileData,
        IELTSScannedCopyFileName: ieltsFileData ? ieltsFileData.name : "",
        IELTSAdditionalInformation: $("#txtIELTSAdditionalInformation").val()
      };
    } catch (error) {
      console.error("Error creating IELTS Information object:", error);
      return {};
    }
  },

  createTOEFLInformationObject: function () {
    try {
      const toeflDatePicker = $("#dateTOEFLDate").data("kendoDatePicker");

      return {
        TOEFLInformationId: parseInt($("#hdnTOEFLInformationId").val()) || 0,
        ApplicantId: parseInt($("#hdnApplicantId").val()) || 0,
        TOEFLListening: $("#txtTOEFLListening").val(),
        TOEFLReading: $("#txtTOEFLReading").val(),
        TOEFLWriting: $("#txtTOEFLWriting").val(),
        TOEFLSpeaking: $("#txtTOEFLSpeaking").val(),
        TOEFLOverallScore: $("#txtTOEFLOverallScore").val(),
        TOEFLDate: toeflDatePicker ? toeflDatePicker.value() : null,
        TOEFLScannedCopyFile: toeflFileData,
        TOEFLScannedCopyFileName: toeflFileData ? toeflFileData.name : "",
        TOEFLAdditionalInformation: $("#txtTOEFLAdditionalInformation").val()
      };
    } catch (error) {
      console.log("Error creating TOEFL Information object:", error);
      return {};
    }
  },

  createPTEInformationObject: function () {
    try {
      const pteDatePicker = $("#datePTEDate").data("kendoDatePicker");

      return {
        PTEInformationId: parseInt($("#hdnPTEInformationId").val()) || 0,
        ApplicantId: parseInt($("#hdnApplicantId").val()) || 0,
        PTEListening: $("#txtPTEListening").val(),
        PTEReading: $("#txtPTEReading").val(),
        PTEWriting: $("#txtPTEWriting").val(),
        PTESpeaking: $("#txtPTESpeaking").val(),
        PTEOverallScore: $("#txtPTEOverallScore").val(),
        PTEDate: pteDatePicker ? pteDatePicker.value() : null,
        PTEScannedCopyFile: pteFileData,
        PTEScannedCopyFileName: pteFileData ? pteFileData.name : "",
        PTEAdditionalInformation: $("#txtPTEAdditionalInformation").val()
      };
    } catch (error) {
      console.error("Error creating PTE Information object:", error);
      return {};
    }
  },

  createGMATInformationObject: function () {
    try {
      const gmatDatePicker = $("#dateGMATDate").data("kendoDatePicker");

      return {
        GMATInformationId: parseInt($("#hdnGMATInformationId").val()) || 0,
        ApplicantId: parseInt($("#hdnApplicantId").val()) || 0,
        GMATListening: $("#txtGMATListening").val(),
        GMATReading: $("#txtGMATReading").val(),
        GMATWriting: $("#txtGMATWriting").val(),
        GMATSpeaking: $("#txtGMATSpeaking").val(),
        GMATOverallScore: $("#txtGMATOverallScore").val(),
        GMATDate: gmatDatePicker ? gmatDatePicker.value() : null,
        GMATScannedCopyFile: gmatFileData,
        GMATScannedCopyFileName: gmatFileData ? gmatFileData.name : "",
        GMATAdditionalInformation: $("#txtGMATAdditionalInformation").val()
      };
    } catch (error) {
      console.error("Error creating GMAT Information object:", error);
      return {};
    }
  },

  createOTHERSInformationObject: function () {
    try {
      return {
        OthersInformationId: parseInt($("#hdnOTHERSInformationId").val()) || 0,
        ApplicantId: parseInt($("#hdnApplicantId").val()) || 0,
        AdditionalInformation: $("#txtAdditionalInformation").val(),
        OTHERSScannedCopyFile: othersFileData,
        OTHERSScannedCopyFileName: othersFileData ? othersFileData.name : ""
      };
    } catch (error) {
      console.error("Error creating OTHERS Information object:", error);
      return {};
    }
  },

  createWorkExperienceObject: function () {
    try {
      const grid = $("#gridWorkExperience").data("kendoGrid");
      const workExperienceData = [];
      //const scannedCopyFiles = [];

      if (grid) {
        const data = grid.dataSource.data();

        data.forEach(function (item) {
          // File object থাকলে এটিই নিন, নাহলে null
          const file = item.ScannedCopyFile instanceof File ? item.ScannedCopyFile : null;

          workExperienceData.push({
            WorkExperienceId: item.WorkExperienceId || 0,
            ApplicantId: item.ApplicantId || 0,
            NameOfEmployer: item.NameOfEmployer || "",
            Position: item.Position || "",
            StartDate: item.StartDate ? new Date(item.StartDate) : null,
            EndDate: item.EndDate ? new Date(item.EndDate) : null,
            Period: item.Period || "",
            MainResponsibility: item.MainResponsibility || "",

            // Server fields
            ScannedCopyPath: item.ScannedCopyPath || "",
            ScannedCopyFileName: item.ScannedCopyFileName || "",

            // IMPORTANT: File property must be ScannedCopyFile for server binding
            ScannedCopyFile: file,

            DocumentName: item.DocumentName || "",
            FileThumbnail: item.FileThumbnail || ""
          });

          //if (file) scannedCopyFiles.push(file);
        });
      }

      return {
        WorkExperienceHistory: workExperienceData,
        TotalWorkExperienceRecords: workExperienceData.length,
        //ScannedCopyFileList: scannedCopyFiles // optional, server না লাগলে রাখতে হবে না
      };
    } catch (error) {
      console.log("Error creating Work Experience object:" + error);
      return {};
    }
  },

  /* ------ Utility Methods ------ */
  exportEducationFormDataAsJSON: function () {
    try {
      const educationData = this.createEducationNEnglishLanguageInformation();
      const jsonData = JSON.stringify(educationData, null, 2);

      console.log("=== Education & English Language Form Data (JSON) ===");
      console.log(jsonData);

      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showSuccess("Education form data exported to console. Check browser console for JSON output.", "Export Successful", 3000);
      }

      return jsonData;
    } catch (error) {
      console.log("Error exporting education form data as JSON:" + error);
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error exporting education form data: " + error.message, "Export Error", 0);
      }
      return null;
    }
  },

  validateEducationCompleteForm: function () {
    try {
      console.log("=== Validating Education & English Language Form ===");

      const validationErrors = [];

      // Validate IELTS Information (if any field is filled, validate all required fields)
      const ieltsValidation = this.validateIELTSInformation();
      if (ieltsValidation.length > 0) {
        validationErrors.push(...ieltsValidation);
      }

      // Validate TOEFL Information
      const toeflValidation = this.validateTOEFLInformation();
      if (toeflValidation.length > 0) {
        validationErrors.push(...toeflValidation);
      }

      // Validate PTE Information
      const pteValidation = this.validatePTEInformation();
      if (pteValidation.length > 0) {
        validationErrors.push(...pteValidation);
      }

      // Validate GMAT Information
      const gmatValidation = this.validateGMATInformation();
      if (gmatValidation.length > 0) {
        validationErrors.push(...gmatValidation);
      }

      if (validationErrors.length === 0) {
        console.log("Education form validation passed successfully");
        if (typeof ToastrMessage !== "undefined") {
          ToastrMessage.showSuccess("Education form validation passed successfully!", "Validation Success", 3000);
        }
        return true;
      } else {
        console.log("Education form validation failed:", validationErrors);
        if (typeof ToastrMessage !== "undefined") {
          ToastrMessage.showError("Education form validation failed. Check console for details.", "Validation Error", 0);
        }
        return false;
      }
    } catch (error) {
      console.error("Error validating education form:", error);
      return false;
    }
  },

  validateIELTSInformation: function () {
    const errors = [];

    // Check if any IELTS field is filled
    const hasIELTSData = $("#txtIELTSListening").val().trim() ||
      $("#txtIELTSReading").val().trim() ||
      $("#txtIELTSWriting").val().trim() ||
      $("#txtIELTSSpeaking").val().trim() ||
      $("#txtIELTSOverallScore").val().trim();

    if (hasIELTSData) {
      if (!$("#txtIELTSListening").val().trim()) {
        errors.push("IELTS Listening is required when IELTS information is provided");
      }
      if (!$("#txtIELTSReading").val().trim()) {
        errors.push("IELTS Reading is required when IELTS information is provided");
      }
      if (!$("#txtIELTSWriting").val().trim()) {
        errors.push("IELTS Writing is required when IELTS information is provided");
      }
      if (!$("#txtIELTSSpeaking").val().trim()) {
        errors.push("IELTS Speaking is required when IELTS information is provided");
      }
      if (!$("#txtIELTSOverallScore").val().trim()) {
        errors.push("IELTS Overall Score is required when IELTS information is provided");
      }
    }

    return errors;
  },

  validateTOEFLInformation: function () {
    const errors = [];

    // Check if any TOEFL field is filled
    const hasTOEFLData = $("#txtTOEFLListening").val().trim() ||
      $("#txtTOEFLReading").val().trim() ||
      $("#txtTOEFLWriting").val().trim() ||
      $("#txtTOEFLSpeaking").val().trim() ||
      $("#txtTOEFLOverallScore").val().trim();

    if (hasTOEFLData) {
      if (!$("#txtTOEFLListening").val().trim()) {
        errors.push("TOEFL Listening is required when TOEFL information is provided");
      }
      if (!$("#txtTOEFLReading").val().trim()) {
        errors.push("TOEFL Reading is required when TOEFL information is provided");
      }
      if (!$("#txtTOEFLWriting").val().trim()) {
        errors.push("TOEFL Writing is required when TOEFL information is provided");
      }
      if (!$("#txtTOEFLSpeaking").val().trim()) {
        errors.push("TOEFL Speaking is required when TOEFL information is provided");
      }
      if (!$("#txtTOEFLOverallScore").val().trim()) {
        errors.push("TOEFL Overall Score is required when TOEFL information is provided");
      }
    }

    return errors;
  },

  validatePTEInformation: function () {
    const errors = [];

    // Check if any PTE field is filled
    const hasPTEData = $("#txtPTEListening").val().trim() ||
      $("#txtPTEReading").val().trim() ||
      $("#txtPTEWriting").val().trim() ||
      $("#txtPTESpeaking").val().trim() ||
      $("#txtPTEOverallScore").val().trim();

    if (hasPTEData) {
      if (!$("#txtPTEListening").val().trim()) {
        errors.push("PTE Listening is required when PTE information is provided");
      }
      if (!$("#txtPTEReading").val().trim()) {
        errors.push("PTE Reading is required when PTE information is provided");
      }
      if (!$("#txtPTEWriting").val().trim()) {
        errors.push("PTE Writing is required when PTE information is provided");
      }
      if (!$("#txtPTESpeaking").val().trim()) {
        errors.push("PTE Speaking is required when PTE information is provided");
      }
      if (!$("#txtPTEOverallScore").val().trim()) {
        errors.push("PTE Overall Score is required when PTE information is provided");
      }
    }

    return errors;
  },

  validateGMATInformation: function () {
    const errors = [];

    // Check if any GMAT field is filled
    const hasGMATData = $("#txtGMATListening").val().trim() ||
      $("#txtGMATReading").val().trim() ||
      $("#txtGMATWriting").val().trim() ||
      $("#txtGMATSpeaking").val().trim() ||
      $("#txtGMATOverallScore").val().trim();

    if (hasGMATData) {
      if (!$("#txtGMATListening").val().trim()) {
        errors.push("GMAT Listening is required when GMAT information is provided");
      }
      if (!$("#txtGMATReading").val().trim()) {
        errors.push("GMAT Reading is required when GMAT information is provided");
      }
      if (!$("#txtGMATWriting").val().trim()) {
        errors.push("GMAT Writing is required when GMAT information is provided");
      }
      if (!$("#txtGMATSpeaking").val().trim()) {
        errors.push("GMAT Speaking is required when GMAT information is provided");
      }
      if (!$("#txtGMATOverallScore").val().trim()) {
        errors.push("GMAT Overall Score is required when GMAT information is provided");
      }
    }

    return errors;
  },

  fillEducationDemoData: function () {
    try {
      console.log("=== Filling Education Demo Data ===");

      // Fill IELTS Demo Data
      this.fillIELTSDemoData();

      // Fill TOEFL Demo Data
      this.fillTOEFLDemoData();

      // Fill PTE Demo Data
      this.fillPTEDemoData();

      // Fill GMAT Demo Data
      this.fillGMATDemoData();

      // Fill OTHERS Demo Data
      this.fillOTHERSDemoData();

      console.log("Education demo data filled successfully");
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showSuccess("Education demo data filled successfully!", "Demo Data", 3000);
      }

    } catch (error) {
      console.error("Error filling education demo data:", error);
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error filling education demo data: " + error.message, "Demo Data Error", 0);
      }
    }
  },

  fillIELTSDemoData: function () {
    $("#txtIELTSListening").val("7.5");
    $("#txtIELTSReading").val("8.0");
    $("#txtIELTSWriting").val("7.0");
    $("#txtIELTSSpeaking").val("7.5");
    $("#txtIELTSOverallScore").val("7.5");
    $("#txtIELTSAdditionalInformation").val("Demo IELTS test taken for university admission");

    const ieltsDatePicker = $("#dateIELTSDate").data("kendoDatePicker");
    if (ieltsDatePicker) {
      ieltsDatePicker.value(new Date(2024, 5, 15)); // June 15, 2024
    }
  },

  fillTOEFLDemoData: function () {
    $("#txtTOEFLListening").val("25");
    $("#txtTOEFLReading").val("28");
    $("#txtTOEFLWriting").val("24");
    $("#txtTOEFLSpeaking").val("26");
    $("#txtTOEFLOverallScore").val("103");
    $("#txtTOEFLAdditionalInformation").val("Demo TOEFL test for graduate school application");

    const toeflDatePicker = $("#dateTOEFLDate").data("kendoDatePicker");
    if (toeflDatePicker) {
      toeflDatePicker.value(new Date(2024, 4, 20)); // May 20, 2024
    }
  },

  fillPTEDemoData: function () {
    $("#txtPTEListening").val("75");
    $("#txtPTEReading").val("80");
    $("#txtPTEWriting").val("72");
    $("#txtPTESpeaking").val("78");
    $("#txtPTEOverallScore").val("76");
    $("#txtPTEAdditionalInformation").val("Demo PTE Academic test for immigration purposes");

    const pteDatePicker = $("#datePTEDate").data("kendoDatePicker");
    if (pteDatePicker) {
      pteDatePicker.value(new Date(2024, 3, 10)); // April 10, 2024
    }
  },

  fillGMATDemoData: function () {
    $("#txtGMATListening").val("35");
    $("#txtGMATReading").val("38");
    $("#txtGMATWriting").val("32");
    $("#txtGMATSpeaking").val("36");
    $("#txtGMATOverallScore").val("680");
    $("#txtGMATAdditionalInformation").val("Demo GMAT test for MBA application");

    const gmatDatePicker = $("#dateGMATDate").data("kendoDatePicker");
    if (gmatDatePicker) {
      gmatDatePicker.value(new Date(2024, 2, 25)); // March 25, 2024
    }
  },

  fillOTHERSDemoData: function () {
    $("#txtAdditionalInformation").val("Demo additional information for other language certifications or entrance exams");
  },


  /* -------- Populate Education Information Tab -------- */
  populateEducationInformation: function (educationData) {
    try {
      console.log("=== Populating Education Information ===");

      // Populate Education History
      if (educationData.EducationHistories != null && educationData.EducationHistories.length > 0) {
        this.populateEducationHistory(educationData.EducationHistories);
      }

      // Populate IELTS Information
      if (educationData != null) {
        this.populateIELTSInformation(educationData);
      }

      // Populate TOEFL Information
      if (educationData != null) {
        this.populateTOEFLInformation(educationData);
      }

      // Populate PTE Information
      if (educationData != null) {
        this.populatePTEInformation(educationData);
      }

      // Populate GMAT Information
      if (educationData != null) {
        this.populateGMATInformation(educationData);
      }

      // Populate OTHERS Information
      if (educationData != null) {
        this.populateOTHERSInformation(educationData);
      }

      // Populate Work Experience
      if (educationData.WorkExperienceHistories != null && educationData.WorkExperienceHistories.length > 0) {
        this.populateWorkExperience(educationData.WorkExperienceHistories);
      }

      console.log("Education Information populated successfully");
    } catch (error) {
      console.error("Error populating Education Information:", error);
    }
  },

  /* -------- Populate IELTS Information -------- */
  populateIELTSInformation: function (ieltsData) {
    try {
      if (!ieltsData) return;

      // Set hidden fields
      $("#hdnIELTSInformationId").val(ieltsData.IELTSInformationId || 0);

      // Populate IELTS scores
      $("#txtIELTSListening").val(ieltsData.IELTSListening || "");
      $("#txtIELTSReading").val(ieltsData.IELTSReading || "");
      $("#txtIELTSWriting").val(ieltsData.IELTSWriting || "");
      $("#txtIELTSSpeaking").val(ieltsData.IELTSSpeaking || "");
      $("#txtIELTSOverallScore").val(ieltsData.IELTSOverallScore || "");
      $("#txtIELTSAdditionalInformation").val(ieltsData.IELTSAdditionalInformation || "");

      // Populate IELTS Date
      if (ieltsData.IELTSDate) {
        const ieltsDatePicker = $("#dateIELTSDate").data("kendoDatePicker");
        if (ieltsDatePicker) {
          ieltsDatePicker.value(new Date(ieltsData.IELTSDate));
        }
      }

      // Handle IELTS file if exists
      if (ieltsData.IELTSScannedCopyPath && ieltsData.IELTSScannedCopyFileName) {
        const viewButton = $("#fileIELTSScannedCopyViewBtn");
        if (viewButton.length) {
          viewButton.prop("disabled", false);
          viewButton.attr("title", "Click to view: " + ieltsData.IELTSScannedCopyFileName);
          viewButton.html(`<i class="k-icon k-i-preview"></i> ${ieltsData.IELTSScannedCopyFileName}`);

          // Store file path for viewing
          viewButton.data("filePath", ieltsData.IELTSScannedCopyPath);
          viewButton.data("fileName", ieltsData.IELTSScannedCopyFileName);
        }
      }

      console.log("IELTS Information populated");
    } catch (error) {
      console.error("Error populating IELTS Information:", error);
    }
  },

  /* -------- Populate TOEFL Information -------- */
  populateTOEFLInformation: function (toeflData) {
    try {
      if (!toeflData) return;

      // Set hidden fields
      $("#hdnTOEFLInformationId").val(toeflData.TOEFLInformationId || 0);

      // Populate TOEFL scores
      $("#txtTOEFLListening").val(toeflData.TOEFLListening || "");
      $("#txtTOEFLReading").val(toeflData.TOEFLReading || "");
      $("#txtTOEFLWriting").val(toeflData.TOEFLWriting || "");
      $("#txtTOEFLSpeaking").val(toeflData.TOEFLSpeaking || "");
      $("#txtTOEFLOverallScore").val(toeflData.TOEFLOverallScore || "");
      $("#txtTOEFLAdditionalInformation").val(toeflData.TOEFLAdditionalInformation || "");

      // Populate TOEFL Date
      if (toeflData.TOEFLDate) {
        const toeflDatePicker = $("#dateTOEFLDate").data("kendoDatePicker");
        if (toeflDatePicker) {
          toeflDatePicker.value(new Date(toeflData.TOEFLDate));
        }
      }

      // Handle TOEFL file if exists
      if (toeflData.TOEFLScannedCopyPath && toeflData.TOEFLScannedCopyFileName) {
        const viewButton = $("#fileTOEFLScannedCopyViewBtn");
        if (viewButton.length) {
          viewButton.prop("disabled", false);
          viewButton.attr("title", "Click to view: " + toeflData.TOEFLScannedCopyFileName);
          viewButton.html(`<i class="k-icon k-i-preview"></i> ${toeflData.TOEFLScannedCopyFileName}`);

          // Store file path for viewing
          viewButton.data("filePath", toeflData.TOEFLScannedCopyPath);
          viewButton.data("fileName", toeflData.TOEFLScannedCopyFileName);
        }
      }

      console.log("TOEFL Information populated");
    } catch (error) {
      console.error("Error populating TOEFL Information:", error);
    }
  },

  /* -------- Populate PTE Information -------- */
  populatePTEInformation: function (pteData) {
    try {
      if (!pteData) return;

      // Set hidden fields
      $("#hdnPTEInformationId").val(pteData.PTEInformationId || 0);

      // Populate PTE scores
      $("#txtPTEListening").val(pteData.PTEListening || "");
      $("#txtPTEReading").val(pteData.PTEReading || "");
      $("#txtPTEWriting").val(pteData.PTEWriting || "");
      $("#txtPTESpeaking").val(pteData.PTESpeaking || "");
      $("#txtPTEOverallScore").val(pteData.PTEOverallScore || "");
      $("#txtPTEAdditionalInformation").val(pteData.PTEAdditionalInformation || "");

      // Populate PTE Date
      if (pteData.PTEDate) {
        const pteDatePicker = $("#datePTEDate").data("kendoDatePicker");
        if (pteDatePicker) {
          pteDatePicker.value(new Date(pteData.PTEDate));
        }
      }

      // Handle PTE file if exists
      if (pteData.PTEScannedCopyPath && pteData.PTEScannedCopyFileName) {
        const viewButton = $("#filePTEScannedCopyViewBtn");
        if (viewButton.length) {
          viewButton.prop("disabled", false);
          viewButton.attr("title", "Click to view: " + pteData.PTEScannedCopyFileName);
          viewButton.html(`<i class="k-icon k-i-preview"></i> ${pteData.PTEScannedCopyFileName}`);

          // Store file path for viewing
          viewButton.data("filePath", pteData.PTEScannedCopyPath);
          viewButton.data("fileName", pteData.PTEScannedCopyFileName);
        }
      }

      console.log("PTE Information populated");
    } catch (error) {
      console.error("Error populating PTE Information:", error);
    }
  },

  /* -------- Populate GMAT Information -------- */
  populateGMATInformation: function (gmatData) {
    try {
      if (!gmatData) return;

      // Set hidden fields
      $("#hdnGMATInformationId").val(gmatData.GMATInformationId || 0);

      // Populate GMAT scores
      $("#txtGMATListening").val(gmatData.GMATListening || "");
      $("#txtGMATReading").val(gmatData.GMATReading || "");
      $("#txtGMATWriting").val(gmatData.GMATWriting || "");
      $("#txtGMATSpeaking").val(gmatData.GMATSpeaking || "");
      $("#txtGMATOverallScore").val(gmatData.GMATOverallScore || "");
      $("#txtGMATAdditionalInformation").val(gmatData.GMATAdditionalInformation || "");

      // Populate GMAT Date
      if (gmatData.GMATDate) {
        const gmatDatePicker = $("#dateGMATDate").data("kendoDatePicker");
        if (gmatDatePicker) {
          gmatDatePicker.value(new Date(gmatData.GMATDate));
        }
      }

      // Handle GMAT file if exists
      if (gmatData.GMATScannedCopyPath && gmatData.GMATScannedCopyFileName) {
        const viewButton = $("#fileGMATScannedCopyViewBtn");
        if (viewButton.length) {
          viewButton.prop("disabled", false);
          viewButton.attr("title", "Click to view: " + gmatData.GMATScannedCopyFileName);
          viewButton.html(`<i class="k-icon k-i-preview"></i> ${gmatData.GMATScannedCopyFileName}`);

          // Store file path for viewing
          viewButton.data("filePath", gmatData.GMATScannedCopyPath);
          viewButton.data("fileName", gmatData.GMATScannedCopyFileName);
        }
      }

      console.log("GMAT Information populated");
    } catch (error) {
      console.error("Error populating GMAT Information:", error);
    }
  },

  /* -------- Populate OTHERS Information -------- */
  populateOTHERSInformation: function (othersData) {
    try {
      if (!othersData) return;

      // Set hidden fields
      $("#hdnOTHERSInformationId").val(othersData.OthersInformationId || 0);

      // Populate OTHERS information
      $("#txtAdditionalInformation").val(othersData.OTHERSAdditionalInformation || "");

      // Handle OTHERS file if exists
      if (othersData.OTHERSScannedCopyPath && othersData.OTHERSScannedCopyFileName) {
        const viewButton = $("#oTHERSScannedCopyViewBtn");
        if (viewButton.length) {
          viewButton.prop("disabled", false);
          viewButton.attr("title", "Click to view: " + othersData.OTHERSScannedCopyFileName);
          viewButton.html(`<i class="k-icon k-i-preview"></i> ${othersData.OTHERSScannedCopyFileName}`);

          // Store file path for viewing
          viewButton.data("filePath", othersData.OTHERSScannedCopyPath);
          viewButton.data("fileName", othersData.OTHERSScannedCopyFileName);
        }
      }

      console.log("OTHERS Information populated");
    } catch (error) {
      console.error("Error populating OTHERS Information:", error);
    }
  },

  /* -------- Populate Education History Grid -------- */
  populateEducationHistory: function (educationHistory) {
    try {
      if (!educationHistory || !Array.isArray(educationHistory)) return;

      const grid = $("#gridEducationSummary").data("kendoGrid");
      if (!grid) return;
      console.log(grid);
      console.log(educationHistory);
      // Clear existing data
      grid.dataSource.data([]);

      // Add education records to grid
      educationHistory.forEach(education => {
        grid.dataSource.add({
          EducationHistoryId: education.EducationHistoryId || 0,
          ApplicantId: education.ApplicantId || 0,
          Institution: education.Institution || "",
          Qualification: education.Qualification || "",
          PassingYear: education.PassingYear || new Date().getFullYear(),
          Grade: education.Grade || "",
          AttachedDocument: education.DocumentPath || "",
          DocumentName: education.DocumentName || "",
          PdfThumbnail: education.PdfThumbnail || ""
        });
      });

      console.log("Education History populated:", educationHistory.length, "records");
    } catch (error) {
      console.error("Error populating Education History:", error);
    }
  },

  /* -------- Populate Work Experience Grid -------- */
  populateWorkExperience: function (workExperience) {
    try {
      if (!workExperience || !Array.isArray(workExperience)) return;
      const grid = $("#gridWorkExperience").data("kendoGrid");
      if (!grid) return;

      grid.dataSource.data([]);

      workExperience.forEach(work => {
        const rawPath = work.ScannedCopyPath || work.ScannedCopy || "";
        const clean = rawPath.split("?")[0].split("#")[0];
        const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(clean);

        grid.dataSource.add({
          WorkExperienceId: work.WorkExperienceId || 0,
          ApplicantId: work.ApplicantId || 0,
          NameOfEmployer: work.NameOfEmployer || "",
          Position: work.Position || "",
          StartDate: work.StartDate ? new Date(work.StartDate) : null,
          EndDate: work.EndDate ? new Date(work.EndDate) : null,
          Period: work.Period || "",
          MainResponsibility: work.MainResponsibility || "",
          ScannedCopyPath: rawPath,
          ScannedCopy: rawPath,
          ScannedCopyFileName: work.ScannedCopyFileName || work.DocumentName || (clean ? clean.split("/").pop() : ""),
          DocumentName: work.DocumentName || "",
          FileThumbnail: work.FileThumbnail || (isImage ? rawPath : ""),
        });
      });

      console.log("Work Experience populated:", workExperience.length, "records");
    } catch (error) {
      console.error("Error populating Work Experience:", error);
    }
  },


  //populateWorkExperience: function (workExperience) {
  //  try {
  //    if (!workExperience || !Array.isArray(workExperience)) return;
  //    const grid = $("#gridWorkExperience").data("kendoGrid");
  //    if (!grid) return;

  //    grid.dataSource.data([]);

  //    workExperience.forEach(work => {
  //      //const path = work.ScannedCopyPath || work.ScannedCopy || "";
  //      //const name = work.ScannedCopyFileName || work.DocumentName || (path ? path.split("/").pop() : "");

  //      grid.dataSource.add({
  //        WorkExperienceId: work.WorkExperienceId || 0,
  //        ApplicantId: work.ApplicantId || 0,
  //        NameOfEmployer: work.NameOfEmployer || "",
  //        Position: work.Position || "",
  //        StartDate: work.StartDate ? new Date(work.StartDate) : null,
  //        EndDate: work.EndDate ? new Date(work.EndDate) : null,
  //        Period: work.Period || "",
  //        MainResponsibility: work.MainResponsibility || "",

  //        // Map server fields correctly
  //        ScannedCopyPath: work.ScannedCopyPath || "",
  //        ScannedCopyFileName: work.ScannedCopyFileName || "",

  //        // Keep backward compat and View template fallback
  //        ScannedCopy:  work.ScannedCopy || "",

  //        DocumentName: work.DocumentName || "",
  //        FileThumbnail: work.FileThumbnail || ""
  //      });
  //    });

  //    console.log("Work Experience populated:", workExperience.length, "records");
  //  } catch (error) {
  //    console.error("Error populating Work Experience:", error);
  //  }
  //},


}


