
var PreviewManger = {
  // Helper: For image preview (e.g. grid image/logo)
  openGridImagePreview: function (filePath) {
    const fullUrl = filePath.startsWith("http") ? filePath : `${baseApiFilePath}${filePath}`;

    if (!$("#previewWindow").data("kendoWindow")) {
      $("#previewWindow").kendoWindow({
        width: "70%",
        height: "auto",
        title: "Image Preview",
        modal: true,
        visible: false,
        resizable: true
      });
    }

    $("#previewWindow").data("kendoWindow").center().open();
    $("#preview").html(`<img src="${fullUrl}" style="max-width:100%;height:auto;" />`);
  },

  // Preview from URL (PDF only)
  openPreview: async function (fileUrl, customTitle) {
    this.cleanupPreviewResources();
    if (!fileUrl) return;

    const previewTitle = customTitle || "PDF Preview";
    const fullUrl = `${baseApiFilePath}${fileUrl}`;

    this.ensureKendoWindow(previewTitle);

    $("#preview").html(`
      <iframe 
        src="${fullUrl}" 
        width="100%" 
        height="100%" 
        frameborder="0"
        style="border: none;">
      </iframe>
    `);
  },

  // Preview from Blob (File Object)
  previewFileBlob: function (file, customTitle) {
    if (!file) return;
    this.cleanupPreviewResources();

    const previewTitle = customTitle || file.name || "PDF Preview";
    const mimeType = file.type || "application/pdf";

    const reader = new FileReader();
    reader.onload = (e) => {
      const blob = new Blob([e.target.result], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      this.ensureKendoWindow(previewTitle);

      $("#preview").html(`
        <iframe 
          src="${blobUrl}" 
          width="100%" 
          height="100%" 
          frameborder="0"
          style="border: none;">
        </iframe>
      `);

      // Clean up blob after window close
      $("#previewWindow").data("kendoWindow").bind("close", function () {
        URL.revokeObjectURL(blobUrl);
      });
    };

    reader.readAsArrayBuffer(file);
  },

  // Clean preview DOM + blob
  cleanupPreviewResources: function () {
    $("#preview").empty();
    const iframes = $("#preview iframe");
    iframes.each(function () {
      const src = $(this).attr('src');
      if (src && src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    });
  },

  //  KendoWindow Creator
  ensureKendoWindow: function (title) {
    if (!$("#previewWindow").data("kendoWindow")) {
      $("#previewWindow").kendoWindow({
        width: "90%",
        height: "90vh",
        title: title,
        modal: true,
        visible: false,
        resizable: true,
        actions: ["Minimize", "Maximize", "Close"],
        close: function () {
          $("#preview").empty();
        }
      });
    } else {
      const win = $("#previewWindow").data("kendoWindow");
      win.setOptions({
        title: title,
        actions: ["Minimize", "Maximize", "Close"] // Optional: to ensure if changed dynamically
      });
    }
    $("#previewWindow").data("kendoWindow").center().open();
  },

  // 📥 Fetch remote file and return as Blob
  createFileFromUrl: async function (fullUrl, fileName, mimeType) {
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: { 'Accept': mimeType || 'application/pdf' }
      });

      if (!response.ok) {
        throw new error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return new File([blob], fileName, { type: mimeType });
    } catch (err) {
      //console.error("Failed to fetch file:", err);
      //alert("Failed to fetch file. Please check console or contact admin.");
      //ToastrMessage.showError("Failed to fetch file. Please check console or contact admin.", "Error In File Upload");
      VanillaApiCallManager.handleApiError(err);
      return null;
    }
  },


  openPreview: async function (fileUrl) {
    this.cleanupPreviewResources();
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
        actions: ["Minimize", "Maximize", "Close"],
        close: function () {
          $("#preview").empty();
        }
      });
    }

    $("#previewWindow").data("kendoWindow").center().open();

    // Iframe 
    $("#preview").html(`
          <iframe
              src="${fullUrl}"
              width="100%"
              height="100%"
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



  //  Institution Logo Preview from File Input
  initLogoPreviewHandler: function () {
    $("#institutionLogoFile").on("change", function () {
      const file = this.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e =>
          $("#logoThumb").attr("src", e.target.result).removeClass("d-none");
        reader.readAsDataURL(file);
      } else {
        $("#logoThumb").addClass("d-none").attr("src", "#");
      }
    });
  },

  // Prospectus PDF Preview from Input (with thumbnail generation)
  initProspectusPreviewHandler: function () {
    $("#prospectusFile").on("change", function () {
      const file = this.files[0];
      if (!file || file.type !== "application/pdf") {
        $("#pdfThumbnail").addClass("d-none").attr("src", "#");
        $("#pdfName").text("");
        prospectusFileData = null;
        return;
      }

      prospectusFileData = file;
      $("#pdfName").text(file.name);

      const reader = new FileReader();
      reader.onload = function () {
        const typedArray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedArray).promise.then(pdf => {
          pdf.getPage(1).then(page => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const scale = 200 / page.getViewport({ scale: 1 }).width;
            const viewport = page.getViewport({ scale });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            page.render({ canvasContext: context, viewport })
              .promise.then(() => {
                const imgUrl = canvas.toDataURL("image/png");
                $("#pdfThumbnail")
                  .attr("src", imgUrl)
                  .removeClass("d-none");
              });
          });
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }
};



//var PreviewManger = {
//  // Helper functions
//  openGridImagePreview: function (filePath) {
//    debugger;
//    const fullUrl = filePath.startsWith("http") ? filePath : `${baseApiFilePath}${filePath}`;
//    if (!$("#previewWindow").data("kendoWindow")) {
//      $("#previewWindow").kendoWindow({
//        width: "70%",
//        height: "auto",
//        title: "Logo Preview",
//        modal: true,
//        visible: false,
//        resizable: true,
//      });
//    }

//    $("#previewWindow").data("kendoWindow").center().open();
//    $("#preview").html(`<img src="${fullUrl}" style="max-width:100%;height:auto;" />`);
//  },

//  openPreview: async function (fileUrl, customTitle) {
//    debugger;
//    this.cleanupPreviewResources();
//    if (!fileUrl) return;
//    const previewTitle = customTitle || "PDF Preview";
//    const fullUrl = `${baseApiFilePath}${fileUrl}`;
//    const fileName = fullUrl.split("/").pop();
//    const mimeType = fullUrl.toLowerCase().endsWith(".pdf") ? "application/pdf" : "";

//    // Kendo Window setup
//    if (!$("#previewWindow").data("kendoWindow")) {
//      $("#previewWindow").kendoWindow({
//        width: "90%",
//        height: "90vh",
//        title: previewTitle,
//        modal: true,
//        visible: false,
//        resizable: true,
//        close: function () {
//          $("#preview").empty();
//        }
//      });
//    }

//    $("#previewWindow").data("kendoWindow").center().open();

//    // Iframe দিয়ে PDF show করুন - CORS issue হবে না
//    $("#preview").html(`
//        <iframe 
//            src="${fullUrl}" 
//            width="100%" 
//            height="100%" 
//            frameborder="0"
//            style="border: none;">
//        </iframe>
//    `);
//  },

//  openPreview: async function (fileUrl) {
//    debugger;
//    if (!fileUrl) return;
//    const fullUrl = `${baseApiFilePath}${fileUrl}`;
//    const fileName = fullUrl.split("/").pop();
//    const mimeType = fullUrl.toLowerCase().endsWith(".pdf") ? "application/pdf" : "";

//    // Kendo Window setup
//    if (!$("#previewWindow").data("kendoWindow")) {
//      $("#previewWindow").kendoWindow({
//        width: "90%",
//        height: "90vh",
//        title: "PDF Preview",
//        modal: true,
//        visible: false,
//        resizable: true,
//        close: function () {
//          $("#preview").empty();
//        }
//      });
//    }

//    $("#previewWindow").data("kendoWindow").center().open();

//    // Iframe দিয়ে PDF show করুন - CORS issue হবে না
//    $("#preview").html(`
//        <iframe 
//            src="${fullUrl}" 
//            width="100%" 
//            height="100%" 
//            frameborder="0"
//            style="border: none;">
//        </iframe>
//    `);

//    //const file = await PreviewManger.createFileFromUrl(fullUrl, fileName, mimeType);
//    //if (!file) return;

//    //const reader = new FileReader();
//    //reader.onload = function (e) {
//    //  const blob = new Blob([e.target.result], { type: mimeType });
//    //  const url = URL.createObjectURL(blob);

//    //  if (!$("#previewWindow").data("kendoWindow")) {
//    //    $("#previewWindow").kendoWindow({
//    //      width: "80%",
//    //      height: "80vh",
//    //      title: "Preview",
//    //      modal: true,
//    //      visible: false,
//    //      close: function () {
//    //        $("#preview").empty();
//    //      }
//    //    });
//    //  }

//    //  $("#previewWindow").data("kendoWindow").center().open();

//    //  if (mimeType === "application/pdf") {
//    //    $("#preview").kendoPDFViewer({
//    //      pdfjsProcessing: { file: url },
//    //      width: "100%",
//    //      height: "100%",
//    //      toolbar: {
//    //        items: ["pager", "spacer", "zoomIn", "zoomOut", "toggleSelection", "download"]
//    //      }
//    //    });
//    //  } else {
//    //    $("#preview").html(`<img src="${url}" style="width:100%; height:auto;" />`);
//    //  }
//    //};

//    //reader.readAsArrayBuffer(file);
//  },

//  createFileFromUrl: async function (fullUrl, fileName, mimeType) {
//    debugger;
//    try {
//      console.log("Attempting to fetch:", fullUrl);
//      const response = await fetch(pdfUrl, {
//      method: 'GET',
//      headers: {
//        'Accept': 'application/pdf', // Request PDF content
//      },
//    });

//    if (!response.ok) {
//      throw new Error(`HTTP error! status: ${response.status}`);
//    }

//      if (!response.ok) {
//        throw new Error(`HTTP error! status: ${response.status}`);
//      }

//      const blob = await response.blob();
//      return new File([blob], fileName, { type: mimeType });
//    } catch (err) {
//      console.error("Failed to fetch file:", err);
//      alert("Failed to fetch file. Please check console or contact admin.");
//      return null;
//    }
//  },

//  // Clean up resources when preview window closes
//  cleanupPreviewResources: function () {
//    $("#preview").empty();
//    const iframes = $("#preview iframe");
//    iframes.each(function () {
//      const src = $(this).attr('src');
//      if (src && src.startsWith('blob:')) {
//        URL.revokeObjectURL(src);
//      }
//    });
//  },

//  /* ---------- Preview Handler ---------- */
//  initLogoPreviewHandler: function () {
//    $("#institutionLogoFile").on("change", function () {
//      const file = this.files[0];
//      if (file && file.type.startsWith("image/")) {
//        const reader = new FileReader();
//        reader.onload = e =>
//          $("#logoThumb").attr("src", e.target.result).removeClass("d-none");
//        reader.readAsDataURL(file);
//      } else {
//        $("#logoThumb").addClass("d-none").attr("src", "#");
//      }
//    });
//  },

//  // pdf viewer
//  initProspectusPreviewHandler: function () {
//    debugger;
//    $("#prospectusFile").on("change", function () {
//      const file = this.files[0];
//      if (!file || file.type !== "application/pdf") {
//        $("#pdfThumbnail").addClass("d-none").attr("src", "#");
//        $("#pdfName").text("");
//        prospectusFileData = null;
//        return;
//      }

//      prospectusFileData = file;
//      $("#pdfName").text(file.name);

//      const reader = new FileReader();
//      reader.onload = function () {
//        const typedArray = new Uint8Array(this.result);

//        pdfjsLib.getDocument(typedArray).promise.then(pdf => {
//          pdf.getPage(1).then(page => {
//            /* rander first page in canvas → dataURL */
//            const canvas = document.createElement("canvas");
//            const context = canvas.getContext("2d");
//            const scale = 200 / page.getViewport({ scale: 1 }).width;
//            const viewport = page.getViewport({ scale });

//            canvas.width = viewport.width;
//            canvas.height = viewport.height;

//            page.render({ canvasContext: context, viewport })
//              .promise.then(() => {
//                const imgUrl = canvas.toDataURL("image/png");
//                $("#pdfThumbnail")
//                  .attr("src", imgUrl)
//                  .removeClass("d-none");
//              });
//          });
//        });
//      };
//      reader.readAsArrayBuffer(file);
//    });
//  },
//}
