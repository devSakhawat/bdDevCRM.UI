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

    const type = this._determineType(fullUrl);
    if (type === "image") {
      this._openImageViewer(fullUrl, previewTitle);
    } else if (type === "pdf") {
      await this._openPdfViewer(fullUrl, previewTitle);
    } else {
      // Generic fallback
      $("#preview").html(`
        <div style="padding:2rem;text-align:center;">
          <p>Unsupported file type. <a href="${fullUrl}" target="_blank" rel="noopener">Open / Download</a></p>
        </div>
      `);
    }

    //// Bottom action bar: Open, Download, Close
    //$("#preview").html(`
    //  <div id="pw-pdf-wrap" style="
    //      position:relative;
    //      width:100%;
    //      height:100%;
    //      background:#000;
    //      overflow:hidden;
    //    ">
    //    <iframe 
    //      id="pw-pdf"
    //      src="${fullUrl}" 
    //      width="100%" 
    //      height="100%" 
    //      frameborder="0"
    //      style="border:none;background:#fff;">
    //    </iframe>

    //    <div id="pw-bottom-bar" style="
    //        position:absolute;
    //        left:0; right:0; bottom:0;
    //        display:flex; align-items:center; justify-content:center;
    //        gap:12px; padding:12px;
    //        background: rgba(0,0,0,.35);
    //        z-index:2;
    //      ">
    //      <a id="pw-open-new" href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-light btn-sm">Open in new tab</a>
    //      <a id="pw-download"  href="${fullUrl}" download class="btn btn-light btn-sm">Download</a>
    //      <button id="pw-close" class="btn btn-danger btn-sm">Close</button>
    //    </div>
    //  </div>
    //`);

    //// Esc -> close
    //const onKey = function (e) {
    //  if (e.key === "Escape") {
    //    $("#previewWindow").data("kendoWindow").close();
    //  }
    //};
    //$(document).on("keydown.pwpdf", onKey);

    //$("#pw-close").on("click", function () {
    //  $("#previewWindow").data("kendoWindow").close();
    //});

    //// Cleanup on close
    //const win = $("#previewWindow").data("kendoWindow");
    //win.unbind("close.pwpdf").bind("close.pwpdf", function () {
    //  $(document).off("keydown.pwpdf");
    //  $("#preview").empty();
    //});
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
  },

  // ---------- TYPE DETECTOR ----------
  _determineType: function (url) {
    const clean = url.split("?")[0].split("#")[0];
    const ext = (clean.substring(clean.lastIndexOf(".") + 1) || "").toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    // data url check
    if (url.startsWith("data:")) {
      if (/data:image\//i.test(url)) return "image";
      if (/data:application\/pdf/i.test(url)) return "pdf";
    }
    return "other";
  },

  // ---------- COMMON TOOLBAR GENERATOR (Bootstrap enhanced) ----------
  _buildToolbarHtml: function () {
    return `
      <div id="pw-toolbar" style="
          position:absolute; top:8px; left:50%; transform:translateX(-50%);
          display:flex; gap:.5rem; align-items:center;
          background:rgba(0,0,0,.55); padding:6px 14px; border-radius:40px;
          z-index:10; color:#fff; font-size:13px; user-select:none;
          box-shadow:0 4px 14px rgba(0,0,0,.35); backdrop-filter:blur(3px);">

        <div class="btn-group" role="group" aria-label="Zoom">
          <button type="button" class="pw-btn btn btn-sm btn-outline-light" data-act="zoom-out" title="Zoom Out ( - )" aria-label="Zoom Out">
            <i class="k-icon k-i-zoom-out"></i>
          </button>
          <span id="pw-zoom-label"
                class="badge text-bg-dark border border-light"
                style="min-width:56px; letter-spacing:.5px;">100%</span>
          <button type="button" class="pw-btn btn btn-sm btn-outline-light" data-act="zoom-in" title="Zoom In ( + )" aria-label="Zoom In">
            <i class="k-icon k-i-zoom-in"></i>
          </button>
        </div>

        <button type="button" class="pw-btn btn btn-sm btn-outline-warning" data-act="zoom-reset" title="Reset Zoom ( R )" aria-label="Reset Zoom">
          <i class="k-icon k-i-reset"></i> Reset
        </button>

        <button type="button" class="pw-btn btn btn-sm btn-success" data-act="download" title="Download" aria-label="Download">
          <i class="k-icon k-i-download"></i>
        </button>

        <button type="button" class="pw-btn btn btn-sm btn-danger" data-act="close" title="Close ( Esc )" aria-label="Close">
          <i class="k-icon k-i-close"></i>
        </button>
      </div>
    `;
  },

  _wireCommonToolbar: function (ctx) {
    // ctx: { getDownloadUrl, onZoomChange, close, getCurrentScale, setScale, minScale, maxScale, step }
    $("#pw-toolbar .pw-btn").off("click").on("click", (e) => {
      const act = $(e.currentTarget).data("act");
      if (act === "zoom-in") {
        let s = Math.min(ctx.maxScale, +(ctx.getCurrentScale() + ctx.step).toFixed(2));
        ctx.setScale(s);
        ctx.onZoomChange(s);
      } else if (act === "zoom-out") {
        let s = Math.max(ctx.minScale, +(ctx.getCurrentScale() - ctx.step).toFixed(2));
        ctx.setScale(s);
        ctx.onZoomChange(s);
      } else if (act === "zoom-reset") {
        ctx.setScale(1);
        ctx.onZoomChange(1);
      } else if (act === "download") {
        const a = document.createElement("a");
        a.href = ctx.getDownloadUrl();
        a.download = "";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (act === "close") {
        ctx.close();
      }
    });
  },

  // ---------- IMAGE VIEWER WITH ZOOM ----------
  _openImageViewer: function (fullUrl, title, isBlob) {
    $("#preview").html(`
      <div id="pw-image-wrap" style="
          position:relative; width:100%; height:100%; background:#000;
          overflow:auto; display:flex; align-items:center; justify-content:center;">
        ${this._buildToolbarHtml()}
        <img id="pw-image" src="${fullUrl}" alt="${title}" style="
            max-width:100%; max-height:100%; transform:scale(1);
            transform-origin:center center; transition:transform .15s ease; user-select:none;"/>
      </div>
    `);

    let scale = 1, minScale = 0.25, maxScale = 5, step = 0.2;
    const $img = $("#pw-image");
    const apply = () => {
      $img.css("transform", `scale(${scale})`);
      $("#pw-zoom-label").text(`${Math.round(scale * 100)}%`);
    };

    // Mouse wheel zoom
    $("#pw-image-wrap").on("wheel", (e) => {
      e.preventDefault();
      if (e.originalEvent.deltaY < 0) {
        scale = Math.min(maxScale, +(scale + step).toFixed(2));
      } else {
        scale = Math.max(minScale, +(scale - step).toFixed(2));
      }
      apply();
    });

    // Double click reset
    $img.on("dblclick", () => { scale = 1; apply(); });

    this._wireCommonToolbar({
      getDownloadUrl: () => fullUrl,
      onZoomChange: () => apply(),
      close: () => $("#previewWindow").data("kendoWindow").close(),
      getCurrentScale: () => scale,
      setScale: (s) => { scale = s; },
      minScale, maxScale, step
    });

    // Esc key
    const onKey = (e) => { if (e.key === "Escape") $("#previewWindow").data("kendoWindow").close(); };
    $(document).on("keydown.pwimg", onKey);

    // Cleanup
    const win = $("#previewWindow").data("kendoWindow");
    win.unbind("close.pwimg").bind("close.pwimg", () => {
      $(document).off("keydown.pwimg");
      $("#preview").empty();
    });
  },

  // ---------- PDF VIEWER (pdf.js) WITH ZOOM ----------
  _openPdfViewer: async function (fullUrl, title, isBlob) {
    $("#preview").html(`
      <div id="pw-pdf-root" style="position:relative; width:100%; height:100%; background:#111; overflow:auto;">
        ${this._buildToolbarHtml()}
        <div id="pw-pdf-pages" style="padding:20px 0; display:flex; flex-direction:column; align-items:center; gap:12px;"></div>
      </div>
    `);

    let scale = 1, minScale = 0.5, maxScale = 4, step = 0.25;
    const $pages = $("#pw-pdf-pages");

    if (typeof pdfjsLib === "undefined") {
      $pages.html(`<p style="color:#fff; padding:2rem;">pdf.js লোড হয়নি। <a href="${fullUrl}" target="_blank" style="color:#4eaaff;">Open in new tab</a></p>`);
      return;
    }

    let pdfDoc = null;
    try {
      pdfDoc = await pdfjsLib.getDocument(fullUrl).promise;
    } catch (err) {
      $pages.html(`<p style="color:#fff; padding:2rem;">PDF লোড করা যায়নি। <a href="${fullUrl}" target="_blank" style="color:#4eaaff;">Open</a></p>`);
      return;
    }

    const renderAll = async () => {
      $pages.empty();
      $("#pw-zoom-label").text(`${Math.round(scale * 100)}%`);
      for (let p = 1; p <= pdfDoc.numPages; p++) {
        const page = await pdfDoc.getPage(p);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.background = "#fff";
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        const wrapper = document.createElement("div");
        wrapper.style.boxShadow = "0 0 6px rgba(0,0,0,.6)";
        wrapper.style.background = "#fff";
        wrapper.appendChild(canvas);
        $pages.append(wrapper);
      }
    };

    await renderAll();

    const reRenderDebounced = (function () {
      let to = null;
      return () => {
        if (to) clearTimeout(to);
        to = setTimeout(() => renderAll(), 160);
      };
    })();

    this._wireCommonToolbar({
      getDownloadUrl: () => fullUrl,
      onZoomChange: () => {
        $("#pw-zoom-label").text(`${Math.round(scale * 100)}%`);
        reRenderDebounced();
      },
      close: () => $("#previewWindow").data("kendoWindow").close(),
      getCurrentScale: () => scale,
      setScale: (s) => { scale = s; },
      minScale, maxScale, step
    });

    // Scroll + Ctrl = zoom (optional)
    $("#pw-pdf-root").on("wheel", (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.originalEvent.deltaY < 0) {
          scale = Math.min(maxScale, +(scale + step).toFixed(2));
        } else {
          scale = Math.max(minScale, +(scale - step).toFixed(2));
        }
        $("#pw-zoom-label").text(`${Math.round(scale * 100)}%`);
        reRenderDebounced();
      }
    });

    // Esc key
    const onKey = (e) => { if (e.key === "Escape") $("#previewWindow").data("kendoWindow").close(); };
    $(document).on("keydown.pwpdfu", onKey);

    const win = $("#previewWindow").data("kendoWindow");
    win.unbind("close.pwpdfu").bind("close.pwpdfu", () => {
      $(document).off("keydown.pwpdfu");
      $("#preview").empty();
    });
  },

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

};

