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
      editable: { mode: "inline" },
      //editable: { mode: "incell" },
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
        //template: '#= CRMEducationNEnglishLanguagHelper.editorFileUpload(data) #',
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
              ApplicantId: { type: "number", editable: false, nullable: true },
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
      { field: "ApplicantId", title: "ApplicantId", hidden: true },
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
      { command: ["edit", "destroy"], title: "Action", width: "100px" }
      //{ command: "destroy", title: "Action", width: "100px" }
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
  },

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
      $("#txtOTHERSAdditionalInformation").val("");

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
  viewIELTSDocument: function () {
    if (ieltsFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(ieltsFileData, ieltsFileData.name);
      } else {
        alert("Preview functionality is not available");
      }
    } else {
      alert("No IELTS document uploaded");
    }
  },

  viewTOEFLDocument: function () {
    if (toeflFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(toeflFileData, toeflFileData.name);
      } else {
        alert("Preview functionality is not available");
      }
    } else {
      alert("No TOEFL document uploaded");
    }
  },

  viewPTEDocument: function () {
    if (pteFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(pteFileData, pteFileData.name);
      } else {
        alert("Preview functionality is not available");
      }
    } else {
      alert("No PTE document uploaded");
    }
  },

  viewGMATDocument: function () {
    if (gmatFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(gmatFileData, gmatFileData.name);
      } else {
        alert("Preview functionality is not available");
      }
    } else {
      alert("No GMAT document uploaded");
    }
  },

  viewOTHERSDocument: function () {
    if (othersFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(othersFileData, othersFileData.name);
      } else {
        alert("Preview functionality is not available");
      }
    } else {
      alert("No OTHERS document uploaded");
    }
  },



  /* ------ Data Object Creation Methods ------ */
  createEducationNEnglishLanguageInformation: function () {
    try {
      const educationNEnglishLanguageInformation = {
        ieltsInformation: this.createIELTSInformationObject(),
        toeflInformation: this.createTOEFLInformationObject(),
        pteInformation: this.createPTEInformationObject(),
        gmatInformation: this.createGMATInformationObject(),
        othersInformation: this.createOTHERSInformationObject(),
        educationDetails: this.createEducationDetailsObject(),
        workExperience: this.createWorkExperienceObject()
      };

      console.log("Education & English Language Information object created:", educationNEnglishLanguageInformation);
      return educationNEnglishLanguageInformation;

    } catch (error) {
      console.log("Error creating Education & English Language Information object:" + error);
      return null;
    }
  },

  /* ------ Updated Object Creation with File Data ------ */
  createIELTSInformationObject: function () {
    try {
      const ieltsDatePicker = $("#dateIELTSDate").data("kendoDatePicker");

      return {
        IELTSListening: $("#txtIELTSListening").val(),
        IELTSReading: $("#txtIELTSReading").val(),
        IELTSWriting: $("#txtIELTSWriting").val(),
        IELTSSpeaking: $("#txtIELTSSpeaking").val(),
        IELTSOverallScore: $("#txtIELTSOverallScore").val(),
        IELTSDate: ieltsDatePicker ? ieltsDatePicker.value() : null,
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
      console.error("Error creating TOEFL Information object:", error);
      return {};
    }
  },

  createPTEInformationObject: function () {
    try {
      const pteDatePicker = $("#datePTEDate").data("kendoDatePicker");

      return {
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
        OTHERSAdditionalInformation: $("#txtOTHERSAdditionalInformation").val(),
        OTHERSScannedCopyFile: othersFileData,
        OTHERSScannedCopyFileName: othersFileData ? othersFileData.name : ""
      };
    } catch (error) {
      console.error("Error creating OTHERS Information object:", error);
      return {};
    }
  },

  createEducationDetailsObject: function () {
    try {
      const grid = $("#gridEducationSummary").data("kendoGrid");
      const educationData = [];

      if (grid) {
        const dataSource = grid.dataSource;
        const data = dataSource.data();

        data.forEach(function (item) {
          educationData.push({
            EducationHistoryId: item.EducationHistoryId,
            Institution: item.Institution,
            Qualification: item.Qualification,
            PassingYear: item.PassingYear,
            Grade: item.Grade,
            AttachedDocument: item.AttachedDocument,
            DocumentName: item.DocumentName,
            PdfThumbnail: item.PdfThumbnail
          });
        });
      }

      return {
        EducationHistory: educationData,
        TotalEducationRecords: educationData.length
      };
    } catch (error) {
      console.log("Error creating Education Details object:" + error);
      return {};
    }
  },

  createWorkExperienceObject: function () {
    try {
      const grid = $("#gridWorkExperience").data("kendoGrid");
      const workExperienceData = [];

      if (grid) {
        const dataSource = grid.dataSource;
        const data = dataSource.data();

        data.forEach(function (item) {
          workExperienceData.push({
            WorkExperienceId: item.WorkExperienceId,
            NameOfEmployer: item.NameOfEmployer,
            Position: item.Position,
            StartDate: item.StartDate,
            EndDate: item.EndDate,
            Period: item.Period,
            MainResponsibility: item.MainResponsibility,
            ScannedCopy: item.ScannedCopy,
            DocumentName: item.DocumentName,
            FileThumbnail: item.FileThumbnail
          });
        });
      }

      return {
        WorkExperienceHistory: workExperienceData,
        TotalWorkExperienceRecords: workExperienceData.length
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
    $("#txtOTHERSAdditionalInformation").val("Demo additional information for other language certifications or entrance exams");
  },

}


