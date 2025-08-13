var PreviewManger = {
  // Helper: Image preview with bottom Close button + zoom
  openGridImagePreview: function (filePath) {
    debugger;
    if (!filePath) return;

    const isAbsoluteOrData = /^https?:\/\//i.test(filePath) || filePath.startsWith("data:");
    const fullUrl = isAbsoluteOrData ? filePath : `${baseApiFilePath}${filePath}`;

    this.ensureKendoWindow("Image Preview");
    $("#previewWindow").find(".btnDiv .btn-close-generic").remove();

    $("#preview").html(`
      <div id="pw-img-wrap" style="
          position:relative;
          width:100%;
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#000;
          overflow:auto;
        ">
        <img id="pw-image" src="${fullUrl}" alt="preview" style="
            max-width:100%;
            max-height:100%;
            object-fit:contain;
            transform: scale(1);
            transform-origin:center center;
            transition: transform .2s ease;
            user-select:none;
            -webkit-user-drag:none;
          " />

        <!-- Zoom toolbar (top-right) -->
        <div style="position:absolute; right:16px; top:16px; display:flex; gap:8px; z-index:2;">
          <button id="pw-zoom-in"  class="btn btn-light btn-sm" title="Zoom In (+)">+</button>
          <button id="pw-zoom-out" class="btn btn-light btn-sm" title="Zoom Out (-)">−</button>
        </div>

        <!-- Bottom bar with Close button -->
        <div id="pw-bottom-bar" style="
            position:absolute;
            left:0; right:0; bottom:0;
            display:flex; align-items:center; justify-content:center;
            gap:12px; padding:12px;
            background: rgba(0,0,0,.35);
            z-index:2;
          ">
          <button id="pw-close" class="btn btn-danger btn-sm">Close</button>
        </div>
      </div>
    `);

    // Zoom controls
    let scale = 1;
    const minScale = 0.25;
    const maxScale = 5;
    const step = 0.2;

    const $img = $("#pw-image");
    const $wrap = $("#pw-img-wrap");
    const applyScale = () => $img.css("transform", `scale(${scale})`);

    $("#pw-zoom-in").on("click", function (e) {
      e.preventDefault();
      scale = Math.min(maxScale, +(scale + step).toFixed(2));
      applyScale();
    });

    $("#pw-zoom-out").on("click", function (e) {
      e.preventDefault();
      scale = Math.max(minScale, +(scale - step).toFixed(2));
      applyScale();
    });

    // Double-click to reset zoom
    $img.on("dblclick", function () {
      scale = 1;
      applyScale();
    });

    // Mouse wheel zoom
    $wrap.on("wheel", function (e) {
      e.preventDefault();
      const delta = e.originalEvent.deltaY;
      if (delta < 0) {
        scale = Math.min(maxScale, +(scale + step).toFixed(2));
      } else {
        scale = Math.max(minScale, +(scale - step).toFixed(2));
      }
      applyScale();
    });

    // Keyboard shortcuts: +/- zoom, Esc close, R reset
    const onKey = function (e) {
      if (e.key === "Escape") {
        $("#previewWindow").data("kendoWindow").close();
      } else if (e.key === "+" || e.key === "=") {
        scale = Math.min(maxScale, +(scale + step).toFixed(2));
        applyScale();
      } else if (e.key === "-" || e.key === "_") {
        scale = Math.max(minScale, +(scale - step).toFixed(2));
        applyScale();
      } else if ((e.key || "").toLowerCase() === "r") {
        scale = 1;
        applyScale();
      }
    };
    $(document).on("keydown.imgprev", onKey);

    // Bottom Close button
    $("#pw-close").on("click", function () {
      $("#previewWindow").data("kendoWindow").close();
    });

    // Cleanup on close
    const win = $("#previewWindow").data("kendoWindow");
    win.unbind("close.imgprev").bind("close.imgprev", function () {
      $(document).off("keydown.imgprev");
      $("#preview").empty();
    });
  },

  // Preview from URL (PDF only) — single canonical version
  openPreview: async function (fileUrl, customTitle) {
    debugger;
    this.cleanupPreviewResources();
    if (!fileUrl) return;

    const isAbsoluteOrData = /^(https?:|data:)/i.test(fileUrl);
    const fullUrl = isAbsoluteOrData ? fileUrl : `${baseApiFilePath}${fileUrl}`;
    const previewTitle = customTitle || "PDF Preview";

    this.ensureKendoWindow(previewTitle);
    $("#previewWindow").find(".btnDiv .btn-close-generic").remove();

    // Bottom action bar: Open, Download, Close
    $("#preview").html(`
      <div id="pw-pdf-wrap" style="
          position:relative;
          width:100%;
          height:100%;
          background:#000;
          overflow:hidden;
        ">
        <iframe 
          id="pw-pdf"
          src="${fullUrl}" 
          width="100%" 
          height="100%" 
          frameborder="0"
          style="border:none;background:#fff;">
        </iframe>

        <div id="pw-bottom-bar" style="
            position:absolute;
            left:0; right:0; bottom:0;
            display:flex; align-items:center; justify-content:center;
            gap:12px; padding:12px;
            background: rgba(0,0,0,.35);
            z-index:2;
          ">
          <a id="pw-open-new" href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-light btn-sm">Open in new tab</a>
          <a id="pw-download"  href="${fullUrl}" download class="btn btn-light btn-sm">Download</a>
          <button id="pw-close" class="btn btn-danger btn-sm">Close</button>
        </div>
      </div>
    `);

    // Esc -> close
    const onKey = function (e) {
      if (e.key === "Escape") {
        $("#previewWindow").data("kendoWindow").close();
      }
    };
    $(document).on("keydown.pwpdf", onKey);

    $("#pw-close").on("click", function () {
      $("#previewWindow").data("kendoWindow").close();
    });

    // Cleanup on close
    const win = $("#previewWindow").data("kendoWindow");
    win.unbind("close.pwpdf").bind("close.pwpdf", function () {
      $(document).off("keydown.pwpdf");
      $("#preview").empty();
    });
  },

  // Preview from Blob/File (local PDF from input)
  previewFileBlob: function (file, customTitle) {
    debugger;
    if (!file) return;
    this.cleanupPreviewResources();

    const previewTitle = customTitle || file.name || "PDF Preview";
    const mimeType = file.type || "application/pdf";

    const reader = new FileReader();
    reader.onload = (e) => {
      const blob = new Blob([e.target.result], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      this.ensureKendoWindow(previewTitle);
      $("#previewWindow").find(".btnDiv .btn-close-generic").remove();

      $("#preview").html(`
        <div id="pw-pdf-wrap" style="
            position:relative;
            width:100%;
            height:100%;
            background:#000;
            overflow:hidden;
          ">
          <iframe 
            id="pw-pdf"
            src="${blobUrl}" 
            width="100%" 
            height="100%" 
            frameborder="0"
            style="border:none;background:#fff;">
          </iframe>

          <div id="pw-bottom-bar" style="
              position:absolute;
              left:0; right:0; bottom:0;
              display:flex; align-items:center; justify-content:center;
              gap:12px; padding:12px;
              background: rgba(0,0,0,.35);
              z-index:2;
            ">
            <a id="pw-open-new" href="${blobUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-light btn-sm">Open in new tab</a>
            <a id="pw-download"  href="${blobUrl}" download="${file.name || 'document.pdf'}" class="btn btn-light btn-sm">Download</a>
            <button id="pw-close" class="btn btn-danger btn-sm">Close</button>
          </div>
        </div>
      `);

      const onKey = function (e) {
        if (e.key === "Escape") {
          $("#previewWindow").data("kendoWindow").close();
        }
      };
      $(document).on("keydown.pwblob", onKey);

      $("#pw-close").on("click", function () {
        $("#previewWindow").data("kendoWindow").close();
      });

      // Cleanup on close: revoke blob URL and unbind keys
      const win = $("#previewWindow").data("kendoWindow");
      win.unbind("close.pwblob").bind("close.pwblob", function () {
        $(document).off("keydown.pwblob");
        URL.revokeObjectURL(blobUrl);
        $("#preview").empty();
      });
    };

    reader.readAsArrayBuffer(file);
  },

  //openGridImagePreview: function (filePath) {
  //  debugger;
  //  if (!filePath) return;

  //  // Support absolute http/https and data: URLs
  //  const isAbsoluteOrData = /^https?:\/\//i.test(filePath) || filePath.startsWith("data:");
  //  const fullUrl = isAbsoluteOrData ? filePath : `${baseApiFilePath}${filePath}`;

  //  if (!$("#previewWindow").data("kendoWindow")) {
  //    $("#previewWindow").kendoWindow({
  //      width: "70%",
  //      height: "auto",
  //      title: "Image Preview",
  //      modal: true,
  //      visible: false,
  //      resizable: true
  //    });
  //  }

  //  $("#previewWindow").data("kendoWindow").center().open();
  //  $("#preview").html(`<img src="${fullUrl}" style="max-width:100%;height:auto;" />`);
  //},


  //// Preview from URL (PDF only)
  //openPreview: async function (fileUrl, customTitle) {
  //  debugger;
  //  this.cleanupPreviewResources();
  //  if (!fileUrl) return;

  //  const previewTitle = customTitle || "PDF Preview";
  //  const fullUrl = `${baseApiFilePath}${fileUrl}`;

  //  this.ensureKendoWindow(previewTitle);

  //  $("#preview").html(`
  //    <iframe 
  //      src="${fullUrl}" 
  //      width="100%" 
  //      height="100%" 
  //      frameborder="0"
  //      style="border: none;">
  //    </iframe>
  //  `);
  //},

  //// Preview from Blob (File Object)
  //previewFileBlob: function (file, customTitle) {
  //  debugger;
  //  if (!file) return;
  //  this.cleanupPreviewResources();

  //  const previewTitle = customTitle || file.name || "PDF Preview";
  //  const mimeType = file.type || "application/pdf";

  //  const reader = new FileReader();
  //  reader.onload = (e) => {
  //    const blob = new Blob([e.target.result], { type: mimeType });
  //    const blobUrl = URL.createObjectURL(blob);

  //    this.ensureKendoWindow(previewTitle);

  //    $("#preview").html(`
  //      <iframe 
  //        src="${blobUrl}" 
  //        width="100%" 
  //        height="100%" 
  //        frameborder="0"
  //        style="border: none;">
  //      </iframe>
  //    `);

  //    // Clean up blob after window close
  //    $("#previewWindow").data("kendoWindow").bind("close", function () {
  //      URL.revokeObjectURL(blobUrl);
  //    });
  //  };

  //  reader.readAsArrayBuffer(file);
  //},

  // Clean preview DOM + blob
  cleanupPreviewResources: function () {
    debugger;
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
    debugger;
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

  // Fetch remote file and return as Blob
  createFileFromUrl: async function (fullUrl, fileName, mimeType) {
    debugger;
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


  //openPreview: async function (fileUrl) {
  //  debugger;
  //  this.cleanupPreviewResources();
  //  debugger;
  //  if (!fileUrl) return;
  //  const fullUrl = `${baseApiFilePath}${fileUrl}`;
  //  const fileName = fullUrl.split("/").pop();
  //  const mimeType = fullUrl.toLowerCase().endsWith(".pdf") ? "application/pdf" : "";

  //  // Kendo Window setup
  //  if (!$("#previewWindow").data("kendoWindow")) {
  //    $("#previewWindow").kendoWindow({
  //      width: "90%",
  //      height: "90vh",
  //      title: "PDF Preview",
  //      modal: true,
  //      visible: false,
  //      resizable: true,
  //      actions: ["Minimize", "Maximize", "Close"],
  //      close: function () {
  //        $("#preview").empty();
  //      }
  //    });
  //  }

  //  $("#previewWindow").data("kendoWindow").center().open();

  //  // Iframe 
  //  $("#preview").html(`
  //        <iframe
  //            src="${fullUrl}"
  //            width="100%"
  //            height="100%"
  //            frameborder="0"
  //            style="border: none;">
  //        </iframe>
  //    `);
  //},



  //  Institution Logo Preview from File Input
  initLogoPreviewHandler: function () {
    debugger;
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
    debugger;
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

