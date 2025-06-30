

var PreviewManger = {
  // Helper functions
  openGridImagePreview: function (filePath) {
    debugger;
    const fullUrl = filePath.startsWith("http") ? filePath : `${baseApiFilePath}${filePath}`;
    if (!$("#previewWindow").data("kendoWindow")) {
      $("#previewWindow").kendoWindow({
        width: "70%",
        height: "auto",
        title: "Logo Preview",
        modal: true,
        visible: false
      });
    }

    $("#previewWindow").data("kendoWindow").center().open();
    $("#preview").html(`<img src="${fullUrl}" style="max-width:100%;height:auto;" />`);
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

  createFileFromUrl: async function (fullUrl, fileName, mimeType) {
    debugger;
    try {
      console.log("Attempting to fetch:", fullUrl);
      const response = await fetch(pdfUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf', // Request PDF content
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return new File([blob], fileName, { type: mimeType });
    } catch (err) {
      console.error("Failed to fetch file:", err);
      alert("Failed to fetch file. Please check console or contact admin.");
      return null;
    }
  },


  /* ---------- Preview Handler ---------- */
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

  // pdf viewer
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
            /* rander first page in canvas → dataURL */
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
}
