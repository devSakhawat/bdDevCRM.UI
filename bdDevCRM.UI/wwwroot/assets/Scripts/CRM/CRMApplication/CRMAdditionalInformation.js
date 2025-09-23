
let statementOfPurposeFileData = null;
let additionalDocumentsFileData = {};

var CRMAdditionalInformationManager = {

  // File validation helper for Statement of Purpose
  validateStatementFile: function (file) {
    if (!file) return false;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];

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

  // File validation helper for Additional Documents
  validateAdditionalDocumentFile: function (file) {
    if (!file) return false;

    const allowedTypes = ['application/pdf', 'application/zip', 'application/x-zip-compressed'];
    const allowedExtensions = ['.pdf', '.zip'];

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
  }
}

var CRMAdditionalInformationHelper = {

  initAdditionalInformation: function () {
    console.log("=== Initializing Additional Information ===");

    // Initialize grids
    CRMAdditionalInformationHelper.initializeAdditionalReferenceSummaryGrid();
    CRMAdditionalInformationHelper.initializeAdditionalDocumentsSummaryGrid();

    // Initialize file uploads
    this.initializeFileUploads();

    // Initialize radio button events
    this.bindRadioButtonEvents();

    console.log("Additional Information initialized successfully");
  },

  /* =========================================================
     Grid Initialization Methods
  =========================================================*/
  initializeAdditionalReferenceSummaryGrid: function () {
    const gridOption = {
      dataSource: new kendo.data.DataSource({
        data: [],
        schema: {
          model: {
            id: "ApplicantReferenceId",
            fields: {
              ApplicantReferenceId: { type: "number", editable: false, nullable: true },
              ApplicantId: { type: "number", editable: false, nullable: true },
              Name: { type: "string" },
              Designation: { type: "string" },
              Institution: { type: "string" },
              EmailID: { type: "email" },
              PhoneNo: { type: "string" },
              FaxNo: { type: "string" },
              Address: { type: "string" },
              City: { type: "string" },
              State: { type: "string" },
              Country: { type: "string" },
              PostOrZipCode: { type: "string" },
            }
          }
        }
      }),
      toolbar: ["create"],
      scrollable: true,
      resizable: true,
      width: "400px",
      columns: CRMAdditionalInformationHelper.generateAdditionalReferenceSummaryColumn(),
      editable: { mode: "inline" },
      navigatable: true,
      selectable: true,
      //remove: CRMAdditionalInformationHelper.referenceGridRemoveConfirm
    };

    $("#gridAdditionalReferenceSummary").kendoGrid(gridOption);
  },

  // ================= Custom Delete Confirmation (Reference Grid) =================
  referenceGridRemoveConfirm: function (e) {
    e.preventDefault();

    const grid = $("#gridAdditionalReferenceSummary").data("kendoGrid");
    if (!grid) return;

    const model = e.model;
    const nameRaw = model && model.Name ? model.Name : "এই রেফারেন্স";
    const htmlEncode = (window.kendo && kendo.htmlEncode) ? kendo.htmlEncode : function (v) { return $('<div/>').text(v).html(); };
    const name = htmlEncode(nameRaw);

    CommonManager.showConfirm(
      "Delete Confirmation",
      "আপনি কি নিশ্চিত যে আপনি '<b>" + name + "</b>' রেফারেন্সটি মুছে ফেলতে চান?",
      function () { // Yes
        grid.dataSource.remove(model);
        if (typeof ToastrMessage !== "undefined") {
          ToastrMessage.showSuccess("রেফারেন্সটি সফলভাবে মুছে ফেলা হয়েছে");
        }
      },
      function () { /* Cancel - কিছু করবো না */ }
    );
  },

  generateAdditionalReferenceSummaryColumn: function () {
    return [
      { field: "ApplicantReferenceId", title: "ApplicantReferenceId", hidden: true },
      { field: "ApplicantId", title: "ApplicantId", hidden: true },
      { field: "Name", title: "Name", width: "200px" },
      { field: "Designation", title: "Designation", width: "200px" },
      { field: "Institution", title: "Institution", width: "200px" },
      { field: "EmailID", title: "Email ID", width: "200px" },
      { field: "PhoneNo", title: "Phone No", width: "150px" },
      { field: "FaxNo", title: "Fax No", width: "150px" },
      { field: "Address", title: "Address", width: "250px" },
      { field: "City", title: "City", width: "150px" },
      { field: "State", title: "State", width: "150px" },
      { field: "Country", title: "Country", width: "150px" },
      { field: "PostOrZipCode", title: "Post/Zip Code", width: "150px" },
      { command: ["edit", "destroy"], title: "Action", width: "180px" }
    ];
  },

  initializeAdditionalDocumentsSummaryGrid: function () {
    const gridOption = {
      dataSource: new kendo.data.DataSource({
        data: [],
        schema: {
          model: {
            id: "AdditionalDocumentId",
            fields: {
              AdditionalDocumentId: { type: "number", editable: false, nullable: true },
              ApplicantId: { type: "number", editable: false, nullable: true },
              DocumentTitle: { type: "string" },
              DocumentName: { type: "string" },
              UploadFormFile: { type: "object", editable: false, nullable: true },
              DocumentPath: { type: "string" },
              FileThumbnail: { type: "string" }
            }
          }
        }
      }),
      toolbar: ["create"],
      scrollable: true,
      resizable: true,
      width: "400px",
      columns: CRMAdditionalInformationHelper.generateAdditionalDocumentsSummaryColumn(),
      editable: { model: "inline" },
      navigatable: true,
      selectable: true,
    };

    $("#griAdditionalDocumentsSummary").kendoGrid(gridOption);
  },

  // ================= Custom Delete Confirmation (Documents Grid) =================
  documentGridRemoveConfirm: function (e) {
    e.preventDefault();

    const grid = $("#griAdditionalDocumentsSummary").data("kendoGrid");
    if (!grid) return;

    const model = e.model;
    const titleRaw = model && model.Title ? model.Title : "this document";
    const htmlEncode = (window.kendo && kendo.htmlEncode) ? kendo.htmlEncode : function (v) { return $('<div/>').text(v).html(); };
    const title = htmlEncode(titleRaw);

    CommonManager.showConfirm(
      "Delete Confirmation",
      "Are your sure '<b>" + title + "</b>' delete the record?",
      function () { // Yes
        grid.dataSource.remove(model);
        if (typeof ToastrMessage !== "undefined") {
          ToastrMessage.showSuccess("Record deleted successfully");
        }
      },
      function () { /* Cancel */ }
    );
  },

  generateAdditionalDocumentsSummaryColumn: function () {
    return [
      { field: "AdditionalDocumentId", title: "AdditionalDocumentId", hidden: true },
      { field: "ApplicantId", title: "ApplicantId", hidden: true },
      { field: "DocumentTitle", title: "Document Title", width: "400px" },
      { field: "DocumentName", title: "Document Name", width: "400px" },
      //{
      //  field: "UploadFile",
      //  title: "Upload Document",
      //  template: '#= CRMAdditionalInformationHelper.editorAdditionalDocumentFileUpload(data) #',
      //  filterable: false,
      //  width: "200px"
      //},
      {
        field: "UploadFile",
        title: "Upload Document",
        template: '',
        editor: CRMAdditionalInformationHelper.editorAdditionalDocumentFileUpload,
        filterable: false,
        width: "200px"
      },
      {
        field: "ViewDocument",
        title: "View Document",
        template: '#= CRMAdditionalInformationHelper.ViewAdditionalDocumentDetails(data) #',
        editable: false,
        filterable: false,
        width: "200px"
      },
      { command: "destroy", title: "Action", width: "100px" }
    ];
  },

  /* =========================================================
     File Upload Methods
  =========================================================*/
  initializeFileUploads: function () {
    try {
      // Initialize Statement of Purpose file upload
      this.initializeStatementOfPurposeFileUpload();

      console.log("File uploads initialized successfully");
    } catch (error) {
      console.error("Error initializing file uploads:", error);
    }
  },

  initializeStatementOfPurposeFileUpload: function () {
    // Statement of Purpose file upload
    $("#fileStatementOfPurpose").on("change", function () {
      CRMAdditionalInformationHelper.handleStatementOfPurposeFileUpload(this);
    });

    // Convert view field to button
    this.convertStatementViewToButton();
  },

  convertStatementViewToButton: function () {
    const $element = $("#statementOfPurposeViewDocument");
    const $container = $element.parent();

    // Create view button
    const viewButton = $(`
      <button type="button" class="btn btn-outline-primary w-100" id="statementOfPurposeViewBtn" disabled>
        <i class="k-icon k-i-preview"></i> View Statement Document
      </button>
    `);

    // Replace input with button
    $element.replaceWith(viewButton);

    // Add click handler
    viewButton.on("click", function () {
      CRMAdditionalInformationHelper.viewStatementOfPurposeDocument();
    });
  },

  handleStatementOfPurposeFileUpload: function (input) {
    const file = input.files[0];
    if (!file) return;

    if (!CRMAdditionalInformationManager.validateStatementFile(file)) {
      alert("Only PDF, DOC, and DOCX files are allowed for Statement of Purpose.");
      input.value = '';
      return;
    }

    statementOfPurposeFileData = file;
    this.updateStatementViewButton(file.name);

    if (typeof ToastrMessage !== "undefined") {
      ToastrMessage.showSuccess("Statement of Purpose document uploaded successfully!");
    }
  },

  updateStatementViewButton: function (fileName) {
    const $button = $("#statementOfPurposeViewBtn");
    if ($button.length) {
      $button.prop("disabled", false);
      $button.attr("title", "Click to view: " + fileName);

      // Update button text to show file name
      const maxLength = 25;
      const displayName = fileName.length > maxLength ?
        fileName.substring(0, maxLength) + '...' : fileName;

      $button.html(`<i class="k-icon k-i-preview"></i> ${displayName}`);
    }
  },

  viewStatementOfPurposeDocument: function () {
    if (statementOfPurposeFileData) {
      if (typeof PreviewManger !== "undefined") {
        PreviewManger.previewFileBlob(statementOfPurposeFileData, statementOfPurposeFileData.name);
      } else {
        alert("Preview functionality is not available");
      }
    } else {
      alert("No Statement of Purpose document uploaded");
    }
  },

  /* =========================================================
     Additional Documents Grid File Upload Methods
  =========================================================*/

  //editorAdditionalDocumentFileUpload: function (data) {
  //  if (data.UploadFile && data.DocumentName) {
  //    return '<div class="document-info">' +
  //      '<span class="document-name" title="' + data.DocumentName + '">' +
  //      (data.DocumentName.length > 20 ? data.DocumentName.substring(0, 20) + '...' : data.DocumentName) +
  //      '</span><br/>' +
  //      '<input type="file" accept=".pdf,.zip" class="k-button form-control" ' +
  //      'onchange="CRMAdditionalInformationHelper.handleDirectAdditionalDocumentFileUpload(this, \'' + data.uid + '\')" ' +
  //      'title="Replace document"/>' +
  //      '</div>';
  //  } else {
  //    return '<input type="file" accept=".pdf,.zip" value="Select PDF/ZIP file" class="k-button form-control" ' +
  //      'onchange="CRMAdditionalInformationHelper.handleDirectAdditionalDocumentFileUpload(this, \'' + data.uid + '\')" ' +
  //      'title="Upload PDF or ZIP document"/>';
  //  }
  //},

  editorAdditionalDocumentFileUpload: function (container, options) {
    const dataItem = options.model;
    const uid = dataItem.uid;

    $('<input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif" class="form-control" />')
      .attr("onchange", 'CRMAdditionalInformationHelper.handleDirectAdditionalDocumentFileUpload(this, "' + uid + '")')
      .appendTo(container);
  },

  handleDirectAdditionalDocumentFileUpload: function (input, docuid) {
    debugger;
    const file = input.files[0];
    if (!file) return;

    // Validate file (PDF + ZIP)
    if (!CRMAdditionalInformationManager.validateAdditionalDocumentFile(file)) {
      alert("Only PDF and ZIP files are allowed for additional documents.");
      input.value = '';
      return;
    }

    // Clear old file data
    if (additionalDocumentsFileData[docuid]) {
      delete additionalDocumentsFileData[docuid];
    }

    additionalDocumentsFileData[docuid] = file;

    // Generate thumbnail and update grid
    this.generateAdditionalDocumentThumbnail(file, docuid, function (thumbnailUrl) {
      const fileName = file.name;
      const filePath = "/uploads/additionaldocuments/" + fileName;

      CRMAdditionalInformationHelper.updateAdditionalDocumentGridRowWithDocument(docuid, {
        name: fileName,
        response: filePath,
        thumbnail: thumbnailUrl,
        file: file
      });

      if (typeof ToastrMessage !== 'undefined') {
        ToastrMessage.showSuccess("Additional document uploaded successfully!");
      } else {
        alert("Additional document uploaded successfully!");
      }
    });
  },

  //generateAdditionalDocumentThumbnail: function (file, docuid, callback) {
  //  if (!file) {
  //    if (callback) callback(null);
  //    return;
  //  }

  //  // Handle different file types
  //  if (file.type === 'application/pdf') {
  //    // Use PDF thumbnail generation (if PDF.js is available)
  //    this.generatePdfThumbnail(file, callback);
  //  } else if (file.type.includes('zip')) {
  //    // Use ZIP icon for ZIP files
  //    const zipIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+WklQPC90ZXh0Pgo8L3N2Zz4K';
  //    if (callback) callback(zipIcon);
  //  } else {
  //    if (callback) callback(null);
  //  }
  //},


  //generatePdfThumbnail: function (file, callback) {
  //  const reader = new FileReader();
  //  reader.onload = function () {
  //    const typedArray = new Uint8Array(this.result);

  //    if (typeof pdfjsLib !== 'undefined') {
  //      pdfjsLib.getDocument(typedArray).promise.then(pdf => {
  //        pdf.getPage(1).then(page => {
  //          const canvas = document.createElement("canvas");
  //          const context = canvas.getContext("2d");
  //          const scale = 100 / page.getViewport({ scale: 1 }).height;
  //          const viewport = page.getViewport({ scale });

  //          canvas.width = viewport.width;
  //          canvas.height = viewport.height;

  //          page.render({ canvasContext: context, viewport })
  //            .promise.then(() => {
  //              const imgUrl = canvas.toDataURL("image/png");
  //              if (callback) callback(imgUrl);
  //            });
  //        });
  //      }).catch(error => {
  //        console.error("Error generating PDF thumbnail:", error);
  //        if (callback) callback(null);
  //      });
  //    } else {
  //      console.error("PDF.js library not loaded");
  //      if (callback) callback(null);
  //    }
  //  };
  //  reader.readAsArrayBuffer(file);
  //},

  // Generate Additional Document file thumbnail (PDF + Images)

  generateAdditionalDocumentThumbnail: function (file, docuid, callback) {
    if (!file) {
      if (callback) callback(null);
      return;
    }

    // Clear old data first
    if (additionalDocumentsFileData[docuid]) {
      delete additionalDocumentsFileData[docuid];
    }
    additionalDocumentsFileData[docuid] = file;

    // Handle different file types
    if (file.type === 'application/pdf') {
      // Use PDF thumbnail generation
      this.generateAdditionalDocumentPdfThumbnail(file, docuid, callback);
    } else if (file.type.startsWith('image/')) {
      // Use image thumbnail generation
      this.generateAdditionalDocumentImageThumbnail(file, callback);
    } else {
      if (callback) callback(null);
    }
  },
  // Generate PDF thumbnail for work experience
  generateAdditionalDocumentPdfThumbnail: function (file, docuid, callback) {
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
          console.error("Error generating additional document PDF thumbnail:", error);
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
  generateAdditionalDocumentImageThumbnail: function (file, callback) {
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
  },

  updateAdditionalDocumentGridRowWithDocument: function (docuid, fileInfo) {
    const grid = $("#griAdditionalDocumentsSummary").data("kendoGrid");
    if (!grid) return;

    const dataSource = grid.dataSource;
    const data = dataSource.data();
    const path = fileInfo.response || fileInfo.name || "";

    for (let i = 0; i < data.length; i++) {
      if (data[i].uid === docuid) {
        data[i].set("DocumentName", fileInfo.name);
        data[i].set("DocumentPath", path);
        data[i].set("FileThumbnail", fileInfo.thumbnail || "");

        try {
          data[i].UploadFormFile = fileInfo.file || null;
        } catch (e) {
          data[i].set("UploadFormFile", fileInfo.file || "");
        }
        break;
      }
    }
    grid.refresh();
  },

  ViewAdditionalDocumentDetails2: function (data) {
    if (data.UploadFile != null && data.UploadFile != "") {
      const fileName = data.DocumentName || data.UploadFile.split("/").pop();
      const thumbnailSrc = data.FileThumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+RklMRTwvdGV4dD4KPC9zdmc+';

      return '<div class="document-preview" style="height: 100px; width: auto; text-align: center;">' +
        '<img src="' + thumbnailSrc + '" alt="File" style="height: 100px; width: auto; cursor: pointer; border: 1px solid #ddd; border-radius: 4px;" ' +
        'onclick="CRMAdditionalInformationHelper.openAdditionalDocumentPreview(\'' + data.UploadFile + '\', \'' + data.uid + '\', \'' + fileName + '\')" ' +
        'title="Click to preview: ' + fileName + '"/>' +
        '<div style="font-size: 12px; text-align: center; margin-top: 5px; color: #666;">' + fileName + '</div>' +
        '</div>';
    } else {
      return '<div style="text-align: center; color: #999; padding: 20px; height: 100px; display: flex; align-items: center; justify-content: center;">No document uploaded</div>';
    }
  },

  ViewAdditionalDocumentDetails: function (data) {
    // Unified path fallback
    const rawPath = data.UploadFormFile || data.UploadFormFile || "";
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
    const fileName = data.DocumentName || data.DocumentName || (cleanName ? cleanName.split("/").pop() : "Document");

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
      // PDF:if PDF thumbnail (server generated) then it will be other hand placeholder
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
             onclick="CRMAdditionalInformationHelper.openAdditionalDocumentPreview('${rawPath.replace(/'/g, "\\'")}', '${data.uid}', '${fileName.replace(/'/g, "\\'")}')" 
             title="Click to preview: ${fileName}"
             onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzNUgyNVYyNUg3NVYzNUg3NVY3NUgyNVYzNVoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSI+RklMRTwvdGV4dD4KPC9zdmc+';" />
        <div style="font-size:12px;text-align:center;margin-top:5px;color:#666;">${fileName}</div>
      </div>`;
  },

  openAdditionalDocumentPreview: function (documentPath, docuid, fileName) {
    if (!documentPath) {
      alert("No document available for preview.");
      return;
    }

    try {
      const fileData = additionalDocumentsFileData[docuid];
      if (fileData) {
        PreviewManger.previewFileBlob(fileData, fileName);
      } else {
        PreviewManger.openPreview(documentPath, fileName);
      }
    } catch (error) {
      console.error("Error opening additional document preview:", error);
      window.open(documentPath, '_blank');
    }
  },

  /* =========================================================
     Radio Button Event Handling
  =========================================================*/
  bindRadioButtonEvents: function () {
    // Accommodation radio buttons
    $("input[name='requireAccommodation']").on("change", function () {
      CRMAdditionalInformationHelper.handleAccommodationChange();
    });

    // Health & Medical Needs radio buttons
    $("input[name='HealthNMedicalNeeds']").on("change", function () {
      CRMAdditionalInformationHelper.handleHealthMedicalNeedsChange();
    });
  },

  handleAccommodationChange: function () {
    const selectedValue = $("input[name='requireAccommodation']:checked").val();
    console.log("Accommodation requirement changed:", selectedValue);
    // Add any specific logic for accommodation selection
  },

  handleHealthMedicalNeedsChange: function () {
    const selectedValue = $("input[name='HealthNMedicalNeeds']:checked").val();
    const remarksField = $("#txtHealthNMedicalNeedsRemarks");

    if (selectedValue === "Yes") {
      remarksField.prop("disabled", false).focus();
    } else if (selectedValue === "No") {
      remarksField.prop("disabled", true).val("");
    }
  },

  /* =========================================================
     Form Clearing Methods
  =========================================================*/
  clearAdditionalInformationForm: function () {
    try {
      console.log("=== Clearing Additional Information Form ===");

      // Clear Reference Details Grid
      this.clearReferenceDetailsGrid();

      // Clear Statement of Purpose
      this.clearStatementOfPurpose();

      // Clear Additional Information
      this.clearAdditionalInformationFields();

      // Clear Additional Documents Grid
      this.clearAdditionalDocumentsGrid();

      console.log("Additional Information form cleared successfully");

    } catch (error) {
      console.error("Error clearing Additional Information form:", error);
      if (typeof VanillaApiCallManager !== "undefined") {
        VanillaApiCallManager.handleApiError(error);
      }
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error clearing Additional Information form: " + error.message, "Form Clear Error", 0);
      }
    }
  },

  clearReferenceDetailsGrid: function () {
    try {
      const grid = $("#gridAdditionalReferenceSummary").data("kendoGrid");
      if (grid) {
        grid.dataSource.data([]);
      }
      console.log("Reference Details Grid cleared");
    } catch (error) {
      console.error("Error clearing Reference Details Grid:", error);
    }
  },

  clearStatementOfPurpose: function () {
    try {
      // Clear textarea
      $("#txtStatementOfPurposeRemarks").val("");

      // Clear file input
      $("#fileStatementOfPurpose").val("");

      // Clear file data and reset view button
      statementOfPurposeFileData = null;
      this.resetStatementViewButton();

      console.log("Statement of Purpose section cleared");
    } catch (error) {
      console.error("Error clearing Statement of Purpose:", error);
    }
  },

  clearAdditionalInformationFields: function () {
    try {
      // Clear radio buttons
      $("input[name='requireAccommodation']").prop("checked", false);
      $("input[name='HealthNMedicalNeeds']").prop("checked", false);

      // Clear text areas
      $("#txtHealthNMedicalNeedsRemarks").val("").prop("disabled", false);
      $("#txtAdditionalInformationRemarks").val("");

      console.log("Additional Information fields cleared");
    } catch (error) {
      console.error("Error clearing Additional Information fields:", error);
    }
  },

  clearAdditionalDocumentsGrid: function () {
    try {
      const grid = $("#griAdditionalDocumentsSummary").data("kendoGrid");
      if (grid) {
        grid.dataSource.data([]);
      }

      // Clear global file data
      additionalDocumentsFileData = {};

      console.log("Additional Documents Grid cleared");
    } catch (error) {
      console.error("Error clearing Additional Documents Grid:", error);
    }
  },

  resetStatementViewButton: function () {
    const $button = $("#statementOfPurposeViewBtn");
    if ($button.length) {
      $button.prop("disabled", true);
      $button.attr("title", "");
      $button.html(`<i class="k-icon k-i-preview"></i> View Statement Document`);
    }
  },

  /* =========================================================
     Data Object Creation Methods
  =========================================================*/
  createAdditionalInformationObject: function () {
    try {
      const additionalInformation = {
        ReferenceDetails: this.createReferenceDetailsObject(),
        StatementOfPurpose: this.createStatementOfPurposeObject(),
        AdditionalInformation: this.createAdditionalInfoObject(),
        AdditionalDocuments: this.createAdditionalDocumentsObject()
      };

      console.log("Additional Information object created:", additionalInformation);
      return additionalInformation;

    } catch (error) {
      console.error("Error creating Additional Information object:", error);
      return null;
    }
  },

  createReferenceDetailsObject: function () {
    try {
      const grid = $("#gridAdditionalReferenceSummary").data("kendoGrid");
      const referenceData = [];
      const applicantIdGlobal = parseInt($("#hdnApplicantId").val()) || 0;
      if (grid) {
        const dataSource = grid.dataSource;
        const data = dataSource.data();
        console.log(data);
        data.forEach(function (item) {
          referenceData.push({
            ApplicantReferenceId: item.ApplicantReferenceId,
            ApplicantId: item.ApplicantId || applicantIdGlobal,
            Name: item.Name,
            Designation: item.Designation,
            Institution: item.Institution,
            EmailID: item.EmailID,
            PhoneNo: item.PhoneNo,
            FaxNo: item.FaxNo,
            Address: item.Address,
            City: item.City,
            State: item.State,
            Country: item.Country,
            PostOrZipCode: item.PostOrZipCode
          });
        });
      }

      return {
        References: referenceData,
        TotalReferenceRecords: referenceData.length
      };
    } catch (error) {
      console.error("Error creating Reference Details object:", error);
      return {};
    }
  },

  createStatementOfPurposeObject: function () {
    try {
      return {
        StatementOfPurposeId: parseInt($("#hdnStatementOfPurposeId").val()) || 0,
        ApplicantId: parseInt($("#hdnApplicantId").val()) || 0,
        StatementOfPurposeRemarks: $("#txtStatementOfPurposeRemarks").val(),
        StatementOfPurposeFile: statementOfPurposeFileData,
        StatementOfPurposeFileName: statementOfPurposeFileData ? statementOfPurposeFileData.name : ""
      };
    } catch (error) {
      console.error("Error creating Statement of Purpose object:", error);
      return {};
    }
  },

  createAdditionalInfoObject: function () {
    try {
      return {
        RequireAccommodation: $("input[name='requireAccommodation']:checked").val() || "",
        HealthNMedicalNeeds: $("input[name='HealthNMedicalNeeds']:checked").val() || "",
        HealthNMedicalNeedsRemarks: $("#txtHealthNMedicalNeedsRemarks").val(),
        AdditionalInformationRemarks: $("#txtAdditionalInformationRemarks").val()
      };
    } catch (error) {
      console.error("Error creating Additional Info object:", error);
      return {};
    }
  },

  createAdditionalDocumentsObject: function () {
    try {
      const grid = $("#griAdditionalDocumentsSummary").data("kendoGrid");
      const documentsData = [];
      const applicantIdGlobal = parseInt($("#hdnApplicantId").val()) || 0;
      if (grid) {
        const dataSource = grid.dataSource;
        const data = dataSource.data();

        data.forEach(function (item) {
          const file = item.UploadFormFile instanceof File ? item.UploadFormFile : null;
          documentsData.push({
            AdditionalDocumentId: item.AdditionalDocumentId,
            ApplicantId: (item.ApplicantId && parseInt(item.ApplicantId) > 0)
              ? parseInt(item.ApplicantId) : applicantIdGlobal,
            DocumentTitle: item.DocumentTitle || "",
            DocumentName: item.DocumentName || "",
            DocumentPath: item.DocumentPath || "",
            UploadFormFile: file,
            FileThumbnail: item.FileThumbnail || ""
          });
        });
      }

      return {
        Documents: documentsData,
        TotalDocumentRecords: documentsData.length
      };
    } catch (error) {
      console.log("Error creating Additional Documents object:", error);
      return {};
    }
  },

  /* =========================================================
     Utility Methods
  =========================================================*/
  exportAdditionalInfoFormDataAsJSON: function () {
    try {
      const additionalInfoData = this.createAdditionalInformationObject();
      const jsonData = JSON.stringify(additionalInfoData, null, 2);

      console.log("=== Additional Information Form Data (JSON) ===");
      console.log(jsonData);

      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showSuccess("Additional Information form data exported to console. Check browser console for JSON output.", "Export Successful", 3000);
      }

      return jsonData;
    } catch (error) {
      console.error("Error exporting Additional Information form data as JSON:", error);
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error exporting Additional Information form data: " + error.message, "Export Error", 0);
      }
      return null;
    }
  },

  validateAdditionalInformationForm: function () {
    try {
      console.log("=== Validating Additional Information Form ===");

      const validationErrors = [];

      // Validate Reference Details (at least one reference should be provided)
      const grid = $("#gridAdditionalReferenceSummary").data("kendoGrid");
      if (grid && grid.dataSource.data().length === 0) {
        validationErrors.push("At least one reference is required");
      }

      // Validate Health & Medical Needs remarks if Yes is selected
      const healthNeedsSelected = $("input[name='HealthNMedicalNeeds']:checked").val();
      if (healthNeedsSelected === "Yes" && !$("#txtHealthNMedicalNeedsRemarks").val().trim()) {
        validationErrors.push("Please provide details for Health & Medical Needs");
      }

      if (validationErrors.length === 0) {
        console.log("Additional Information form validation passed successfully");
        if (typeof ToastrMessage !== "undefined") {
          ToastrMessage.showSuccess("Additional Information form validation passed successfully!", "Validation Success", 3000);
        }
        return true;
      } else {
        console.log("Additional Information form validation failed:", validationErrors);
        if (typeof ToastrMessage !== "undefined") {
          ToastrMessage.showError("Additional Information form validation failed. Check console for details.", "Validation Error", 0);
        }
        return false;
      }
    } catch (error) {
      console.error("Error validating Additional Information form:", error);
      return false;
    }
  },

  fillAdditionalInfoDemoData: function () {
    try {
      console.log("=== Filling Additional Information Demo Data ===");

      // Fill Statement of Purpose
      $("#txtStatementOfPurposeRemarks").val("I am applying for this program to advance my career in software development and gain expertise in modern technologies. This course aligns perfectly with my professional goals and will help me contribute more effectively to my field.");

      // Fill Additional Information
      $("input[name='requireAccommodation'][value='No']").prop("checked", true);
      $("input[name='HealthNMedicalNeeds'][value='No']").prop("checked", true);
      $("#txtAdditionalInformationRemarks").val("I am excited about this opportunity and believe I will be a valuable addition to the program.");

      console.log("Additional Information demo data filled successfully");
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showSuccess("Additional Information demo data filled successfully!", "Demo Data", 3000);
      }

    } catch (error) {
      console.error("Error filling Additional Information demo data:", error);
      if (typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError("Error filling Additional Information demo data: " + error.message, "Demo Data Error", 0);
      }
    }
  },

  /* -------- Populate Additional Information Tab -------- */
/* -------- Populate Additional Information Tab -------- */
/* -------- Populate Additional Information Tab -------- */
  populateAdditionalInformation: function (applicationData) {
    try {
      console.log("=== Populating Additional Information ===");

      // Populate Reference Details
      if (applicationData.ApplicantReferences != null && applicationData.ApplicantReferences.length > 0) {
        this.populateReferenceDetails(applicationData.ApplicantReferences);
      }

      // Populate Statement of Purpose
      if (applicationData.StatementOfPurpose) {
        this.populateStatementOfPurpose(applicationData.StatementOfPurpose);
      }

      // Populate Additional Information Fields
      if (applicationData.AdditionalInformation) {
        this.populateAdditionalInfoFields(applicationData.AdditionalInformation);
      }

      console.log("Additional Information populated successfully");
    } catch (error) {
      console.error("Error populating Additional Information:", error);
    }
  },

  /* -------- Populate Reference Details Grid -------- */
  populateReferenceDetails: function (references) {
    try {
      if (!references || !Array.isArray(references)) return;

      const grid = $("#gridAdditionalReferenceSummary").data("kendoGrid");
      if (!grid) return;

      // Clear existing data
      grid.dataSource.data([]);

      // Add reference records to grid
      references.forEach(reference => {
        grid.dataSource.add({
          ApplicantReferenceId: reference.ApplicantReferenceId || 0,
          //ApplicantId: reference.ApplicantId || 0,
          ApplicantId: reference.ApplicantId || parseInt($("#hdnApplicantId").val()) || 0,
          Name: reference.Name || "",
          Designation: reference.Designation || "",
          Institution: reference.Institution || "",
          EmailID: reference.EmailID || "",
          PhoneNo: reference.PhoneNo || "",
          FaxNo: reference.FaxNo || "",
          Address: reference.Address || "",
          City: reference.City || "",
          State: reference.State || "",
          Country: reference.Country || "",
          PostOrZipCode: reference.PostOrZipCode || ""
        });
      });

      console.log("Reference Details populated:", references.length, "records");
    } catch (error) {
      console.error("Error populating Reference Details:", error);
    }
  },

  /* -------- Populate Statement of Purpose -------- */
  populateStatementOfPurpose: function (statementData) {
    try {
      if (!statementData) return;

      // Set hidden fields
      $("#hdnStatementOfPurposeId").val(statementData.StatementOfPurposeId || 0);

      // Populate Statement of Purpose text
      $("#txtStatementOfPurposeRemarks").val(statementData.StatementOfPurposeRemarks || "");

      // Handle Statement of Purpose file if exists
      if (statementData.StatementOfPurposeFilePath && statementData.StatementOfPurposeFileName) {
        const viewButton = $("#statementOfPurposeViewBtn");
        if (viewButton.length) {
          viewButton.prop("disabled", false);
          viewButton.attr("title", "Click to view: " + statementData.StatementOfPurposeFileName);
          viewButton.html(`<i class="k-icon k-i-preview"></i> ${statementData.StatementOfPurposeFileName}`);

          // Store file path for viewing
          viewButton.data("filePath", statementData.StatementOfPurposeFilePath);
          viewButton.data("fileName", statementData.StatementOfPurposeFileName);
        }
      }

      console.log("Statement of Purpose populated");
    } catch (error) {
      console.error("Error populating Statement of Purpose:", error);
    }
  },

  /* -------- Populate Additional Information Fields -------- */
  populateAdditionalInfoFields: function (additionalInfo) {
    try {
      if (!additionalInfo) return;

      // Populate Accommodation requirement
      if (additionalInfo.RequireAccommodation) {
        $(`input[name='RequireAccommodation'][value='${additionalInfo.RequireAccommodation}']`).prop("checked", true);
      }

      // Populate Health & Medical Needs
      if (additionalInfo.HealthNMedicalNeeds) {
        $(`input[name='HealthNMedicalNeeds'][value='${additionalInfo.HealthNMedicalNeeds}']`).prop("checked", true);

        // Trigger change event to enable/disable remarks field
        $(`input[name='HealthNMedicalNeeds'][value='${additionalInfo.HealthNMedicalNeeds}']`).trigger("change");
      }

      // Populate Health & Medical Needs Remarks
      $("#txtHealthNMedicalNeedsRemarks").val(additionalInfo.HealthNMedicalNeedsRemarks || "");

      // Populate Additional Information Remarks
      $("#txtAdditionalInformationRemarks").val(additionalInfo.AdditionalInformationRemarks || "");

      console.log("Additional Information fields populated");
    } catch (error) {
      console.error("Error populating Additional Information fields:", error);
    }
  }









} 