

var FormHelper = {

  initForm: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    const $form = $(selector);

    if ($form.length === 0) {
      console.warn("Form not found:", selector);
      return null;
    }

    $form.on("submit", function (e) {
      if (FormHelper.isFormLocked($form)) {
        e.preventDefault();
        return false;
      }
      FormHelper.lockForm($form);
    });

    return $form;
  },

  // -----------------------------------
  // 🔵 Loader Start
  // -----------------------------------
  showLoader: function () {
    if ($("#globalFormLoader").length === 0) {
      $("body").append(`
                <div id="globalFormLoader" style="
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: rgba(0,0,0,0.35);
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                ">
                    <div class="spinner-border text-light" style="width: 3rem; height: 3rem;"></div>
                </div>
            `);
    }
    $("#globalFormLoader").show();
  },

  hideLoader: function () {
    $("#globalFormLoader").hide();
  },
  // -----------------------------------
  // 🔵 Loader End
  // -----------------------------------

  lockForm: function ($form) {
    $form.data("locked", true);
    $form.find("button[type=submit]").prop("disabled", true);
    this.showLoader();
  },

  unlockForm: function ($form) {
    $form.data("locked", false);
    $form.find("button[type=submit]").prop("disabled", false);
    this.hideLoader();
  },

  isFormLocked: function ($form) {
    return $form.data("locked") === true;
  },

  clearForm: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    $(selector)[0].reset();
  },

  getFormData: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    var data = {};
    $(selector)
      .find("input, select, textarea")
      .each(function () {
        data[$(this).attr("name")] = $(this).val();
      });
    return data;
  },

  setFormData: function (formSelector, data) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    $(selector)
      .find("input, select, textarea")
      .each(function () {
        var name = $(this).attr("name");
        if (data[name] !== undefined) {
          $(this).val(data[name]);
        }
      });
  },

  makeFormReadOnly: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    $(selector)
      .find("input, select, textarea")
      .prop("disabled", true);
  },

  makeFormEditable: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    $(selector)
      .find("input, select, textarea")
      .prop("disabled", false);
  },

  validate: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    const $form = $(selector);
    let validator = $form.data('kendoValidator');
    if (!validator) validator = $form.kendoValidator().data('kendoValidator');
    return validator.validate();
  },

  hideValidationMessages: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    const validator = $(selector).data('kendoValidator');
    if (validator) validator.hideMessages();
  },

  serialize: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    return $(selector).serialize();
  },

  toFormData: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    const formData = new FormData();
    $(selector).find('input, select, textarea').each(function () {
      const $field = $(this);
      const name = $field.attr('name');
      if (!name) return;
      const type = $field.attr('type');
      if (type === 'file') Array.from($field[0].files).forEach(file => formData.append(name, file));
      else if (type === 'checkbox') formData.append(name, $field.is(':checked'));
      else if (type === 'radio') { if ($field.is(':checked')) formData.append(name, $field.val()); }
      else formData.append(name, $field.val());
    });
    return formData;
  },

  focusFirstInvalid: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    const $invalid = $(selector).find('.k-invalid:first');
    if ($invalid.length) $invalid.focus();
  },

  resetKendoWidgets: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    const $form = $(selector);
    $form.find('[data-role]').each(function () {
      const widget = $(this).data('kendoDropDownList') || $(this).data('kendoComboBox') || $(this).data('kendoMultiSelect') ||
        $(this).data('kendoDatePicker') || $(this).data('kendoDateTimePicker') ||
        $(this).data('kendoNumericTextBox') || $(this).data('kendoMaskedTextBox') ||
        $(this).data('kendoUpload');
      if (widget) {
        if (widget.value) widget.value(null);
        if (widget.clearAllFiles) widget.clearAllFiles();
      }
    });
  },

  populateForm: function (formSelector, data) {
    this.setFormData(formSelector, data);
    this.resetKendoWidgets(formSelector);
  },

  clearFormFields: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    var $Container = $(selector);

    $Container.find('input[type="text"], input[type="password"], input[type="number"], input[type="hidden"], input[type="tel"], input[type="email"], input[type="url"]').val('');
    $Container.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);
    $Container.find('textarea').val('');

    $Container.find('select').each(function () {
      $(this).val('');
      if ($(this).data('kendoDropDownList')) {
        $(this).data('kendoDropDownList').value('');
      } else if ($(this).data('kendoComboBox')) {
        $(this).data('kendoComboBox').value('');
      } else if ($(this).data('kendoMultiSelect')) {
        $(this).data('kendoMultiSelect').value([]);
      }
    });

    $Container.find("input[data-role='datepicker'], input[data-role='datetimepicker']").each(function () {
      var datePicker = $(this).data("kendoDatePicker") || $(this).data("kendoDateTimePicker");
      if (datePicker) {
        datePicker.value(null);
      }
    });

    $Container.find("input[type='file']").each(function () {
      var kendoUpload = $(this).data("kendoUpload");
      if (kendoUpload) {
        kendoUpload.clearAllFiles();
      } else {
        $(this).val('');
      }
    });

    $Container.find("img[id*='thumb'], img[id*='Thumb'], img[id*='thumbnail'], img[id*='Thumbnail'], img[id*='preview'], img[id*='Preview']").each(function () {
      $(this).addClass("d-none").attr("src", "#").off("click");
    });

    $Container.find("button[id*='preview'], button[id*='Preview']").addClass("d-none").off("click");
    $Container.find("span[id*='Name'], span[id*='name']").text("");
    $Container.find(".hint").text('');
  },

  formShowGridHide: function (formSelector, gridSelector) {
    const formSel = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    const gridSel = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const $formSel = $(formSel);
    const $gridSel = $(gridSel);

    if ($formSel.length === 0) {
      console.log(formSel + " not found.");
      return;
    }

    if ($gridSel.length === 0) {
      console.log(gridSel + " not found.");
      return;
    }

    $formSel.removeClass("d-none");
    $gridSel.addClass("d-none");
  },

  formHideGridShow: function (formSelector, gridSelector) {
    const formSel = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    const gridSel = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const $formSel = $(formSel);
    const $gridSel = $(gridSel);

    if ($formSel.length === 0) {
      console.log(formSel + " not found.");
      return;
    }

    if ($gridSel.length === 0) {
      console.log(gridSel + " not found.");
      return;
    }

    $formSel.addClass("d-none");
    $gridSel.removeClass("d-none");
  },

  initializeKendoWindow: function (windowSelector, kendowWindowTitle = "", kendowWindowWidth = "50%") {
    const selector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
    $(selector).kendoWindow({
      title: kendowWindowTitle,
      resizeable: false,
      width: kendowWindowWidth,
      actions: ["Pin", "Refresh", "Maximize", "Close"],
      modal: true,
      visible: false,
    });
  },

  openKendoWindow: function (windowSelector, kendowWindowTitle, kendowWindowWidth = "50%") {
    const selector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
    var popUp = $(selector).data("kendoWindow");
    if (!popUp) {
      this.initializeKendoWindow(windowSelector, kendowWindowTitle, kendowWindowWidth);
      popUp = $(selector).data("kendoWindow");
    }
    if (kendowWindowTitle && kendowWindowTitle != "") {
      popUp.title(kendowWindowTitle);
    }
    popUp.center().open();
    if (typeof popUp.toFront === "function") {
      popUp.toFront();
    }
  },

  closeKendoWindow: function (windowSelector) {
    const selector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
    var window = $(selector).data("kendoWindow");
    if (window) {
      window.close();
    } else {
      console.warn("No Kendo Window found for selector:", selector);
    }
  },

  appandCloseButton: function (windowSelector) {
    const selector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
    const $context = $(selector);
    const $buttonContainer = $context.find(".btnDiv ul li").first();
    if ($buttonContainer.length === 0) return;

    $buttonContainer.find(".btn-close-generic").remove();

    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('${selector}')">Close</button>`;
    $buttonContainer.append(closeBtn);
  },

  GenerateCSVFileAllPages: function (gridSelector, willBeGeneratedfileName, actionsColumnName) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    var grid = $(selector).data("kendoGrid");
    var fileName = CommonManager.getFileNameWithDateTime(willBeGeneratedfileName);

    if (!grid) {
      console.error("Grid not initialized");
      return;
    }

    if (!grid.dataSource) {
      console.error("DataSource not found");
      return;
    }

    function generateCSV(allData) {
      var csv = "";
      var columns = grid.columns;
      var headers = [];

      for (var i = 0; i < columns.length; i++) {
        if (columns[i].field && columns[i].title !== actionsColumnName) {
          headers.push('"' + (columns[i].title || columns[i].field) + '"');
        }
      }

      csv += headers.join(",") + "\n";

      for (var i = 0; i < allData.length; i++) {
        var row = [];
        for (var j = 0; j < columns.length; j++) {
          if (columns[j].field && columns[j].title !== actionsColumnName) {
            var value = allData[i][columns[j].field] || "";
            value = String(value).replace(/"/g, '""');
            row.push('"' + value + '"');
          }
        }
        csv += row.join(",") + "\n";
      }

      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var link = document.createElement("a");
      var url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", fileName + ".csv");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    if (grid.dataSource.options.serverPaging) {
      var dataSource = grid.dataSource;
      var originalPageSize = dataSource.pageSize();
      var originalPage = dataSource.page();
      var allData = [];

      dataSource.pageSize(9999);
      dataSource.page(1);

      dataSource.fetch(function () {
        allData = dataSource.data();
        dataSource.pageSize(originalPageSize);
        dataSource.page(originalPage);
        generateCSV(allData);
      });
    } else {
      var allData = grid.dataSource.data();
      generateCSV(allData);
    }
  },

};


/*var FormHelper = {*/

//initForm: function (formId) {
//  const $form = $("#" + formId);

//  if ($form.length === 0) {
//    console.warn("Form not found:", formId);
//    return null;
//  }

//  // Prevent double submission
//  $form.on("submit", function (e) {
//    if (FormHelper.isFormLocked($form)) {
//      e.preventDefault();
//      return false;
//    }
//    FormHelper.lockForm($form);
//  });

//  return $form;
//},
  //// -----------------------------------
  //// 🔵 Loader Start
  //// -----------------------------------
  //showLoader: function () {
  //  if ($("#globalFormLoader").length === 0) {
  //    $("body").append(`
  //              <div id="globalFormLoader" style="
  //                  position: fixed;
  //                  top: 0; left: 0;
  //                  width: 100%; height: 100%;
  //                  background: rgba(0,0,0,0.35);
  //                  z-index: 9999;
  //                  display: flex;
  //                  justify-content: center;
  //                  align-items: center;
  //              ">
  //                  <div class="spinner-border text-light" style="width: 3rem; height: 3rem;"></div>
  //              </div>
  //          `);
  //  }
  //  $("#globalFormLoader").show();
  //},

  //hideLoader: function () {
  //  $("#globalFormLoader").hide();
  //},
  //// -----------------------------------
  //// 🔵 Loader End
  //// -----------------------------------

//  lockForm: function ($form) {
//    $form.data("locked", true);
//    $form.find("button[type=submit]").prop("disabled", true);
//    this.showLoader();
//  },

//  unlockForm: function ($form) {
//    $form.data("locked", false);
//    $form.find("button[type=submit]").prop("disabled", false);
//    this.hideLoader();
//  },

//  isFormLocked: function ($form) {
//    return $form.data("locked") === true;
//  },

//  clearForm: function (formId) {
//    $("#" + formId)[0].reset();
//  },

//  getFormData: function (formId) {
//    var data = {};
//    $("#" + formId)
//      .find("input, select, textarea")
//      .each(function () {
//        data[$(this).attr("name")] = $(this).val();
//      });
//    return data;
//  },

//  setFormData: function (formId, data) {
//    $("#" + formId)
//      .find("input, select, textarea")
//      .each(function () {
//        var name = $(this).attr("name");
//        if (data[name] !== undefined) {
//          $(this).val(data[name]);
//        }
//      });
//  },

//  makeFormReadOnly: function (formId) {
//    $("#" + formId)
//      .find("input, select, textarea")
//      .prop("disabled", true);
//  },

//  makeFormEditable: function (formId) {
//    const formSelector = formId.startsWith('#') ? formId : '#' + formId;
//    $(formSelector)
//      .find("input, select, textarea")
//      .prop("disabled", false);
//  },

//  validate: function (formSelector) {
//    const $form = $(formSelector);
//    let validator = $form.data('kendoValidator');
//    if (!validator) validator = $form.kendoValidator().data('kendoValidator');
//    return validator.validate();
//  },

//  hideValidationMessages: function (formSelector) {
//    const validator = $(formSelector).data('kendoValidator');
//    if (validator) validator.hideMessages();
//  },

//  serialize: function (formSelector) {
//    return $(formSelector).serialize();
//  },

//  toFormData: function (formSelector) {
//    const formData = new FormData();
//    $(formSelector).find('input, select, textarea').each(function () {
//      const $field = $(this);
//      const name = $field.attr('name');
//      if (!name) return;
//      const type = $field.attr('type');
//      if (type === 'file') Array.from($field[0].files).forEach(file => formData.append(name, file));
//      else if (type === 'checkbox') formData.append(name, $field.is(':checked'));
//      else if (type === 'radio') { if ($field.is(':checked')) formData.append(name, $field.val()); }
//      else formData.append(name, $field.val());
//    });
//    return formData;
//  },

//  focusFirstInvalid: function (formSelector) {
//    const $invalid = $(formSelector).find('.k-invalid:first');
//    if ($invalid.length) $invalid.focus();
//  },

//  resetKendoWidgets: function (formSelector) {
//    const $form = $(formSelector);
//    $form.find('[data-role]').each(function () {
//      const widget = $(this).data('kendoDropDownList') || $(this).data('kendoComboBox') || $(this).data('kendoMultiSelect') ||
//        $(this).data('kendoDatePicker') || $(this).data('kendoDateTimePicker') ||
//        $(this).data('kendoNumericTextBox') || $(this).data('kendoMaskedTextBox') ||
//        $(this).data('kendoUpload');
//      if (widget) {
//        if (widget.value) widget.value(null);
//        if (widget.clearAllFiles) widget.clearAllFiles();
//      }
//    });
//  },

//  populateForm: function (formSelector, data) {
//    this.setFormData(formSelector, data);
//    this.resetKendoWidgets(formSelector);
//  },


//  clearFormFields: function (formContainer) {
//    const formSelector = formContainer.startsWith('#') ? formContainer : '#' + formContainer;
//    var $Container = $(formSelector);

//    // Clear text, password, number, hidden, tel, email, url inputs
//    $Container.find('input[type="text"], input[type="password"], input[type="number"], input[type="hidden"], input[type="tel"], input[type="email"], input[type="url"]').val('');

//    // Clear checkbox and radio
//    $Container.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);

//    // Clear textarea
//    $Container.find('textarea').val('');

//    // Reset selects
//    $Container.find('select').each(function () {
//      $(this).val('');
//      if ($(this).data('kendoDropDownList')) {
//        $(this).data('kendoDropDownList').value('');
//      } else if ($(this).data('kendoComboBox')) {
//        $(this).data('kendoComboBox').value('');
//      } else if ($(this).data('kendoMultiSelect')) {
//        $(this).data('kendoMultiSelect').value([]);
//      }
//    });

//    // Clear Kendo DatePickers and DateTimePickers
//    $Container.find("input[data-role='datepicker'], input[data-role='datetimepicker']").each(function () {
//      var datePicker = $(this).data("kendoDatePicker") || $(this).data("kendoDateTimePicker");
//      if (datePicker) {
//        datePicker.value(null);
//      }
//    });

//    // Clear Kendo Uploads (file input)
//    $Container.find("input[type='file']").each(function () {
//      var kendoUpload = $(this).data("kendoUpload");
//      if (kendoUpload) {
//        kendoUpload.clearAllFiles();
//      } else {
//        // fallback for non-Kendo file input
//        $(this).val('');
//      }
//    });

//    // ========= Enhanced File Preview Cleanup =========
//    // Clear image thumbnails/previews
//    $Container.find("img[id*='thumb'], img[id*='Thumb'], img[id*='thumbnail'], img[id*='Thumbnail'], img[id*='preview'], img[id*='Preview']").each(function () {
//      $(this).addClass("d-none").attr("src", "#").off("click");
//    });

//    // Clear PDF/document previews
//    $Container.find("button[id*='preview'], button[id*='Preview']").addClass("d-none").off("click");

//    // Clear file name displays
//    $Container.find("span[id*='Name'], span[id*='name']").text("");

//    // Remove validation messages
//    $Container.find(".hint").text('');
//  },

//  // use d-none class to initially hide content.
//  formShowGridHide: function (formId, gridId) {
//    const formIdSelector = formId.startsWith('#') ? formId : '#' + formId;
//    const gridIdSelector = gridId.startsWith('#') ? gridId : '#' + gridId;
//    const $formIdSelector = $(formIdSelector);
//    const $gridIdSelector = $(gridIdSelector);

//    if ($formIdSelector.length === 0) {
//      console.log($formIdSelector + "' not found.");
//      return;
//    }

//    if ($gridIdSelector.length === 0) {
//      console.log($gridIdSelector + "' not found.");
//      return;
//    }

//    // Show form and hide grid
//    $formIdSelector.removeClass("d-none");
//    $gridIdSelector.addClass("d-none");
//  },

//  // use d-none class to initially hide content.
//  formHideGridShow: function (formId, gridId) {
//    const formIdSelector = formId.startsWith('#') ? formId : '#' + formId;
//    const gridIdSelector = gridId.startsWith('#') ? gridId : '#' + gridId;
//    const $formIdSelector = $(formIdSelector);
//    const $gridIdSelector = $(gridIdSelector);

//    if ($formIdSelector.length === 0) {
//      console.log($formIdSelector + "' not found.");
//      return;
//    }

//    if ($gridIdSelector.length === 0) {
//      console.log($gridIdSelector + "' not found.");
//      return;
//    }

//    // Show form and hide grid
//    $formIdSelector.addClass("d-none");
//    $gridIdSelector.removeClass("d-none");

//  },

//  initializeKendoWindow: function (windowSelector, kendowWindowTitle = "", kendowWindowWidth = "50%") {
//    const gridSelector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
//    $(gridSelector).kendoWindow({
//      title: kendowWindowTitle,
//      resizeable: false,
//      width: kendowWindowWidth,
//      actions: ["Pin", "Refresh", "Maximize", "Close"],
//      modal: true,
//      visible: false,
//    });
//  },

//  openKendoWindow: function (windowSelector, kendowWindowTitle, kendowWindowWidth = "50%") {
//    const gridSelector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
//    var popUp = $(gridSelector).data("kendoWindow");
//    if (!popUp) {
//      this.initializeKendoWindow(windowSelector, kendowWindowTitle, kendowWindowWidth);
//    }
//    if (kendowWindowTitle && kendowWindowTitle != "") {
//      popUp = $(gridSelector).data("kendoWindow");
//      popUp.title = kendowWindowTitle;
//    }
//    popUp.center().open();
//    if (typeof popUp.toFront === "function") {
//      popUp.toFront(); // নতুন উইন্ডো টপে আনুন
//    }
//  },

//  closeKendoWindow: function (windowSelector) {

//    if (!windowSelector.startsWith("#")) {
//      windowSelector = "#" + windowSelector;
//    }

//    var window = $(windowSelector).data("kendoWindow");
//    if (window) {
//      window.close();
//    } else {
//      kendo.warning("No Kendo Window found for selector:", windowSelector);
//    }
//  },

//  appandCloseButton: function (windowSelector) {
//    const windowId = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;

//    const $context = $(windowId);
//    const $buttonContainer = $context.find(".btnDiv ul li").first();
//    if ($buttonContainer.length === 0) return;

//    $buttonContainer.find(".btn-close-generic").remove();

//    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('${windowId}')">Close</button>`;
//    $buttonContainer.append(closeBtn);
//  },

//  // three parameters need, (gridId, filename and actions column name to remove from file)
//  GenerateCSVFileAllPages: function (htmlId, willBeGeneratedfileName, actionsColumnName) {
//    debugger;
//    var grid = $("#" + htmlId).data("kendoGrid");
//    var fileName = CommonManager.getFileNameWithDateTime(willBeGeneratedfileName);

//    if (!grid) {
//      console.error("Grid not initialized");
//      return;
//    }

//    if (!grid.dataSource) {
//      console.error("DataSource not found");
//      return;
//    }

//    var deferred = $.Deferred();

//    function generateCSV(allData) {
//      var csv = "";

//      var columns = grid.columns;
//      var headers = [];

//      for (var i = 0; i < columns.length; i++) {
//        if (columns[i].field && columns[i].title !== actionsColumnName) {
//          headers.push('"' + (columns[i].title || columns[i].field) + '"');
//        }
//      }

//      csv += headers.join(",") + "\n";

//      for (var i = 0; i < allData.length; i++) {
//        var row = [];
//        for (var j = 0; j < columns.length; j++) {
//          if (columns[j].field && columns[j].title !== actionsColumnName) {
//            var value = allData[i][columns[j].field] || "";
//            value = String(value).replace(/"/g, '""');
//            row.push('"' + value + '"');
//          }
//        }
//        csv += row.join(",") + "\n";
//      }

//      // Create download
//      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//      var link = document.createElement("a");
//      var url = URL.createObjectURL(blob);

//      link.setAttribute("href", url);
//      link.setAttribute("download", fileName + ".csv");

//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//    }


//    if (grid.dataSource.options.serverPaging) {

//      var dataSource = grid.dataSource;
//      var originalPageSize = dataSource.pageSize();
//      var originalPage = dataSource.page();
//      var allData = [];


//      dataSource.pageSize(9999);
//      dataSource.page(1);

//      // Request the data
//      dataSource.fetch(function () {
//        allData = dataSource.data();

//        dataSource.pageSize(originalPageSize);
//        dataSource.page(originalPage);

//        generateCSV(allData);
//      });
//    } else {
//      var allData = grid.dataSource.data();
//      generateCSV(allData);
//    }
//  },


//};


//var FormHelper2 = {

//  getFormData: function (formSelector) {
//    const formData = {};
//    const $form = $(formSelector);
//    $form.find('input, select, textarea').each(function () {
//      const $field = $(this);
//      const name = $field.attr('name') || $field.attr('id');
//      if (!name) return;
//      const type = $field.attr('type');
//      if (type === 'checkbox') formData[name] = $field.is(':checked');
//      else if (type === 'radio') { if ($field.is(':checked')) formData[name] = $field.val(); }
//      else formData[name] = $field.val();
//    });
//    return formData;
//  },

//  setFormData: function (formSelector, data) {
//    const $form = $(formSelector);
//    for (var key in data) {
//      if (!data.hasOwnProperty(key)) continue;
//      const $field = $form.find('[name="' + key + '"], [id="' + key + '"]');
//      if (!$field.length) continue;
//      const type = $field.attr('type');
//      if (type === 'checkbox') $field.prop('checked', !!data[key]);
//      else if (type === 'radio') $form.find('[name="' + key + '"][value="' + data[key] + '"]').prop('checked', true);
//      else $field.val(data[key]);
//    }
//  },

//  clearForm: function (formSelector) {
//    const $form = $(formSelector);
//    $form.find('input, select, textarea').each(function () {
//      const $field = $(this);
//      const type = $field.attr('type');
//      if (type === 'checkbox' || type === 'radio') $field.prop('checked', false);
//      else if ($field.is('select')) {
//        $field.val('');
//        const kendoWidget = $field.data('kendoDropDownList') || $field.data('kendoComboBox') || $field.data('kendoMultiSelect');
//        if (kendoWidget) kendoWidget.value([]);
//      } else $field.val('');
//    });
//    const validator = $form.data('kendoValidator');
//    if (validator) validator.hideMessages();
//  },

//  disableForm: function (formSelector) {
//    $(formSelector).find('input, select, textarea, button').prop('disabled', true);
//  },

//  enableForm: function (formSelector) {
//    $(formSelector).find('input, select, textarea, button').prop('disabled', false);
//  },

//  makeReadonly: function (formSelector) {
//    $(formSelector).find('input, select, textarea').prop('readonly', true);
//    $(formSelector).find('button').not('.btn-close').prop('disabled', true);
//  },

//  removeReadonly: function (formSelector) {
//    $(formSelector).find('input, select, textarea').prop('readonly', false);
//    $(formSelector).find('button').prop('disabled', false);
//  },

//  validate: function (formSelector) {
//    const $form = $(formSelector);
//    let validator = $form.data('kendoValidator');
//    if (!validator) validator = $form.kendoValidator().data('kendoValidator');
//    return validator.validate();
//  },

//  hideValidationMessages: function (formSelector) {
//    const validator = $(formSelector).data('kendoValidator');
//    if (validator) validator.hideMessages();
//  },

//  serialize: function (formSelector) {
//    return $(formSelector).serialize();
//  },

//  toFormData: function (formSelector) {
//    const formData = new FormData();
//    $(formSelector).find('input, select, textarea').each(function () {
//      const $field = $(this);
//      const name = $field.attr('name');
//      if (!name) return;
//      const type = $field.attr('type');
//      if (type === 'file') Array.from($field[0].files).forEach(file => formData.append(name, file));
//      else if (type === 'checkbox') formData.append(name, $field.is(':checked'));
//      else if (type === 'radio') { if ($field.is(':checked')) formData.append(name, $field.val()); }
//      else formData.append(name, $field.val());
//    });
//    return formData;
//  },

//  focusFirstInvalid: function (formSelector) {
//    const $invalid = $(formSelector).find('.k-invalid:first');
//    if ($invalid.length) $invalid.focus();
//  },

//  resetKendoWidgets: function (formSelector) {
//    const $form = $(formSelector);
//    $form.find('[data-role]').each(function () {
//      const widget = $(this).data('kendoDropDownList') || $(this).data('kendoComboBox') || $(this).data('kendoMultiSelect') ||
//        $(this).data('kendoDatePicker') || $(this).data('kendoDateTimePicker') ||
//        $(this).data('kendoNumericTextBox') || $(this).data('kendoMaskedTextBox') ||
//        $(this).data('kendoUpload');
//      if (widget) {
//        if (widget.value) widget.value(null);
//        if (widget.clearAllFiles) widget.clearAllFiles();
//      }
//    });
//  },

//  populateForm: function (formSelector, data) {
//    this.setFormData(formSelector, data);
//    this.resetKendoWidgets(formSelector);
//  },


//  clearFormFields: function (formContainer) {
//    const formSelector = formContainer.startsWith('#') ? formContainer : '#' + formContainer;
//    var $Container = $(formSelector);

//    // Clear text, password, number, hidden, tel, email, url inputs
//    $Container.find('input[type="text"], input[type="password"], input[type="number"], input[type="hidden"], input[type="tel"], input[type="email"], input[type="url"]').val('');

//    // Clear checkbox and radio
//    $Container.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);

//    // Clear textarea
//    $Container.find('textarea').val('');

//    // Reset selects
//    $Container.find('select').each(function () {
//      $(this).val('');
//      if ($(this).data('kendoDropDownList')) {
//        $(this).data('kendoDropDownList').value('');
//      } else if ($(this).data('kendoComboBox')) {
//        $(this).data('kendoComboBox').value('');
//      } else if ($(this).data('kendoMultiSelect')) {
//        $(this).data('kendoMultiSelect').value([]);
//      }
//    });

//    // Clear Kendo DatePickers and DateTimePickers
//    $Container.find("input[data-role='datepicker'], input[data-role='datetimepicker']").each(function () {
//      var datePicker = $(this).data("kendoDatePicker") || $(this).data("kendoDateTimePicker");
//      if (datePicker) {
//        datePicker.value(null);
//      }
//    });

//    // Clear Kendo Uploads (file input)
//    $Container.find("input[type='file']").each(function () {
//      var kendoUpload = $(this).data("kendoUpload");
//      if (kendoUpload) {
//        kendoUpload.clearAllFiles();
//      } else {
//        // fallback for non-Kendo file input
//        $(this).val('');
//      }
//    });

//    // ========= Enhanced File Preview Cleanup =========
//    // Clear image thumbnails/previews
//    $Container.find("img[id*='thumb'], img[id*='Thumb'], img[id*='thumbnail'], img[id*='Thumbnail'], img[id*='preview'], img[id*='Preview']").each(function () {
//      $(this).addClass("d-none").attr("src", "#").off("click");
//    });

//    // Clear PDF/document previews
//    $Container.find("button[id*='preview'], button[id*='Preview']").addClass("d-none").off("click");

//    // Clear file name displays
//    $Container.find("span[id*='Name'], span[id*='name']").text("");


//    //// Clear global prospectus file data variable if exists
//    //if (typeof prospectusFileData !== 'undefined') {
//    //  prospectusFileData = null;
//    //}

//    //// Clear any other file-related global variables
//    //if (typeof logoFileData !== 'undefined') {
//    //  logoFileData = null;
//    //}

//    // Remove validation messages
//    $Container.find(".hint").text('');
//  },

//  // use d-none class to initially hide content.
//  formShowGridHide: function (formId, gridId) {
//    const formIdSelector = formId.startsWith('#') ? formId : '#' + formId;
//    const gridIdSelector = gridId.startsWith('#') ? gridId : '#' + gridId;
//    const $formIdSelector = $(formIdSelector);
//    const $gridIdSelector = $(gridIdSelector);

//    if ($formIdSelector.length === 0) {
//      console.log($formIdSelector + "' not found.");
//      return;
//    }

//    if ($gridIdSelector.length === 0) {
//      console.log($gridIdSelector + "' not found.");
//      return;
//    }

//    // Show form and hide grid
//    $formIdSelector.removeClass("d-none");
//    $gridIdSelector.addClass("d-none");
//  },

//  // use d-none class to initially hide content.
//  formHideGridShow: function (formId, gridId) {
//    const formIdSelector = formId.startsWith('#') ? formId : '#' + formId;
//    const gridIdSelector = gridId.startsWith('#') ? gridId : '#' + gridId;
//    const $formIdSelector = $(formIdSelector);
//    const $gridIdSelector = $(gridIdSelector);

//    if ($formIdSelector.length === 0) {
//      console.log($formIdSelector + "' not found.");
//      return;
//    }

//    if ($gridIdSelector.length === 0) {
//      console.log($gridIdSelector + "' not found.");
//      return;
//    }

//    // Show form and hide grid
//    $formIdSelector.addClass("d-none");
//    $gridIdSelector.removeClass("d-none");

//  },

//  initializeKendoWindow: function (windowSelector, kendowWindowTitle = "", kendowWindowWidth = "50%") {
//    const gridSelector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
//    $(gridSelector).kendoWindow({
//      title: kendowWindowTitle,
//      resizeable: false,
//      width: kendowWindowWidth,
//      actions: ["Pin", "Refresh", "Maximize", "Close"],
//      modal: true,
//      visible: false,
//    });
//  },

//  openKendoWindow: function (windowSelector, kendowWindowTitle, kendowWindowWidth = "50%") {
//    const gridSelector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
//    var popUp = $(gridSelector).data("kendoWindow");
//    if (!popUp) {
//      this.initializeKendoWindow(windowSelector, kendowWindowTitle, kendowWindowWidth);
//    }
//    if (kendowWindowTitle && kendowWindowTitle != "") {
//      popUp = $(gridSelector).data("kendoWindow");
//      popUp.title = kendowWindowTitle;
//    }
//    popUp.center().open();
//    if (typeof popUp.toFront === "function") {
//      popUp.toFront(); // নতুন উইন্ডো টপে আনুন
//    }
//  },

//  closeKendoWindow: function (windowSelector) {

//    if (!windowSelector.startsWith("#")) {
//      windowSelector = "#" + windowSelector;
//    }

//    var window = $(windowSelector).data("kendoWindow");
//    if (window) {
//      window.close();
//    } else {
//      kendo.warning("No Kendo Window found for selector:", windowSelector);
//    }
//  },

//  appandCloseButton: function (windowSelector) {
//    const windowId = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;

//    const $context = $(windowId);
//    const $buttonContainer = $context.find(".btnDiv ul li").first();
//    if ($buttonContainer.length === 0) return;

//    $buttonContainer.find(".btn-close-generic").remove();

//    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('${windowId}')">Close</button>`;
//    $buttonContainer.append(closeBtn);
//  },

//  // three parameters need, (gridId, filename and actions column name to remove from file)
//  GenerateCSVFileAllPages: function (htmlId, willBeGeneratedfileName, actionsColumnName) {
//    debugger;
//    var grid = $("#" + htmlId).data("kendoGrid");
//    var fileName = CommonManager.getFileNameWithDateTime(willBeGeneratedfileName);

//    if (!grid) {
//      console.error("Grid not initialized");
//      return;
//    }

//    if (!grid.dataSource) {
//      console.error("DataSource not found");
//      return;
//    }

//    var deferred = $.Deferred();

//    function generateCSV(allData) {
//      var csv = "";

//      var columns = grid.columns;
//      var headers = [];

//      for (var i = 0; i < columns.length; i++) {
//        if (columns[i].field && columns[i].title !== actionsColumnName) {
//          headers.push('"' + (columns[i].title || columns[i].field) + '"');
//        }
//      }

//      csv += headers.join(",") + "\n";

//      for (var i = 0; i < allData.length; i++) {
//        var row = [];
//        for (var j = 0; j < columns.length; j++) {
//          if (columns[j].field && columns[j].title !== actionsColumnName) {
//            var value = allData[i][columns[j].field] || "";
//            value = String(value).replace(/"/g, '""');
//            row.push('"' + value + '"');
//          }
//        }
//        csv += row.join(",") + "\n";
//      }

//      // Create download
//      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//      var link = document.createElement("a");
//      var url = URL.createObjectURL(blob);

//      link.setAttribute("href", url);
//      link.setAttribute("download", fileName + ".csv");

//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//    }


//    if (grid.dataSource.options.serverPaging) {

//      var dataSource = grid.dataSource;
//      var originalPageSize = dataSource.pageSize();
//      var originalPage = dataSource.page();
//      var allData = [];


//      dataSource.pageSize(9999);
//      dataSource.page(1);

//      // Request the data
//      dataSource.fetch(function () {
//        allData = dataSource.data();

//        dataSource.pageSize(originalPageSize);
//        dataSource.page(originalPage);

//        generateCSV(allData);
//      });
//    } else {
//      var allData = grid.dataSource.data();
//      generateCSV(allData);
//    }
//  },


//};

//var FormHelper23 = {

//  getFormDataOld: function (formSelector) {
//    const formData = {};
//    const $form = $(formSelector);
//    $form.find('input, select, textarea').each(function () {
//      const $field = $(this);
//      const name = $field.attr('name') || $field.attr('id');
//      if (!name) return;
//      const type = $field.attr('type');
//      if (type === 'checkbox') formData[name] = $field.is(':checked');
//      else if (type === 'radio') { if ($field.is(':checked')) formData[name] = $field.val(); }
//      else formData[name] = $field.val();
//    });
//    return formData;
//  },

//  getFormData: function (formId) {
//    var data = {};
//    $(formId + ' [name]').each(function () {
//      var el = $(this);
//      var name = el.attr('name');
//      if (el.is(':checkbox')) {
//        data[name] = el.prop('checked');
//      } else {
//        data[name] = el.val();
//      }
//    });
//    return data;
//  },

//  setFormDataOld: function (formSelector, data) {
//    const $form = $(formSelector);
//    for (var key in data) {
//      if (!data.hasOwnProperty(key)) continue;
//      const $field = $form.find('[name="' + key + '"], [id="' + key + '"]');
//      if (!$field.length) continue;
//      const type = $field.attr('type');
//      if (type === 'checkbox') $field.prop('checked', !!data[key]);
//      else if (type === 'radio') $form.find('[name="' + key + '"][value="' + data[key] + '"]').prop('checked', true);
//      else $field.val(data[key]);
//    }
//  },

//  setFormData: function (formId, data) {
//    for (var key in data) {
//      if (!data.hasOwnProperty(key)) continue;
//      var input = $(formId + ' [name="' + key + '"]');
//      if (input.length > 0) {
//        if (input.is(':checkbox')) {
//          input.prop('checked', data[key]);
//        } else {
//          input.val(data[key]);
//        }
//      }
//    }
//  },

//  clearForm: function (formSelector) {
//    const $form = $(formSelector);
//    $form.find('input, select, textarea').each(function () {
//      const $field = $(this);
//      const type = $field.attr('type');
//      if (type === 'checkbox' || type === 'radio') $field.prop('checked', false);
//      else if ($field.is('select')) {
//        $field.val('');
//        const kendoWidget = $field.data('kendoDropDownList') || $field.data('kendoComboBox') || $field.data('kendoMultiSelect');
//        if (kendoWidget) kendoWidget.value([]);
//      } else $field.val('');
//    });
//    const validator = $form.data('kendoValidator');
//    if (validator) validator.hideMessages();
//  },

//  disableForm: function (formSelector) {
//    $(formSelector).find('input, select, textarea, button').prop('disabled', true);
//  },

//  enableForm: function (formSelector) {
//    $(formSelector).find('input, select, textarea, button').prop('disabled', false);
//  },

//  makeReadonly: function (formSelector) {
//    $(formSelector).find('input, select, textarea').prop('readonly', true);
//    $(formSelector).find('button').not('.btn-close').prop('disabled', true);
//  },

//  removeReadonly: function (formSelector) {
//    $(formSelector).find('input, select, textarea').prop('readonly', false);
//    $(formSelector).find('button').prop('disabled', false);
//  },

//  validate: function (formSelector) {
//    const $form = $(formSelector);
//    let validator = $form.data('kendoValidator');
//    if (!validator) validator = $form.kendoValidator().data('kendoValidator');
//    return validator.validate();
//  },

//  hideValidationMessages: function (formSelector) {
//    const validator = $(formSelector).data('kendoValidator');
//    if (validator) validator.hideMessages();
//  },

//  serialize: function (formSelector) {
//    return $(formSelector).serialize();
//  },

//  toFormData: function (formSelector) {
//    const formData = new FormData();
//    $(formSelector).find('input, select, textarea').each(function () {
//      const $field = $(this);
//      const name = $field.attr('name');
//      if (!name) return;
//      const type = $field.attr('type');
//      if (type === 'file') Array.from($field[0].files).forEach(file => formData.append(name, file));
//      else if (type === 'checkbox') formData.append(name, $field.is(':checked'));
//      else if (type === 'radio') { if ($field.is(':checked')) formData.append(name, $field.val()); }
//      else formData.append(name, $field.val());
//    });
//    return formData;
//  },

//  focusFirstInvalid: function (formSelector) {
//    const $invalid = $(formSelector).find('.k-invalid:first');
//    if ($invalid.length) $invalid.focus();
//  },

//  resetKendoWidgets: function (formSelector) {
//    const $form = $(formSelector);
//    $form.find('[data-role]').each(function () {
//      const widget = $(this).data('kendoDropDownList') || $(this).data('kendoComboBox') || $(this).data('kendoMultiSelect') ||
//        $(this).data('kendoDatePicker') || $(this).data('kendoDateTimePicker') ||
//        $(this).data('kendoNumericTextBox') || $(this).data('kendoMaskedTextBox') ||
//        $(this).data('kendoUpload');
//      if (widget) {
//        if (widget.value) widget.value(null);
//        if (widget.clearAllFiles) widget.clearAllFiles();
//      }
//    });
//  },

//  populateForm: function (formSelector, data) {
//    this.setFormData(formSelector, data);
//    this.resetKendoWidgets(formSelector);
//  }

//};


/////*=========================================================
//// * Form Helper
//// * File: FormHelper.js
//// * Description: Form manipulation utilities
//// * Author: devSakhawat
//// * Date: 2025-11-13
////=========================================================*/

////var FormHelper = (function () {
////  'use strict';

////  /**
////   * Get form data as object
////   */
////  function getFormData(formSelector) {
////    var formData = {};
////    var $form = $(formSelector);

////    $form.find('input, select, textarea').each(function () {
////      var $field = $(this);
////      var name = $field.attr('name') || $field.attr('id');

////      if (!name) return;

////      var type = $field.attr('type');

////      if (type === 'checkbox') {
////        formData[name] = $field.is(':checked');
////      } else if (type === 'radio') {
////        if ($field.is(':checked')) {
////          formData[name] = $field.val();
////        }
////      } else {
////        formData[name] = $field.val();
////      }
////    });

////    return formData;
////  }

////  /**
////   * Set form data from object
////   */
////  function setFormData(formSelector, data) {
////    var $form = $(formSelector);

////    for (var key in data) {
////      if (data.hasOwnProperty(key)) {
////        var $field = $form.find('[name="' + key + '"], [id="' + key + '"]');

////        if ($field.length === 0) continue;

////        var type = $field.attr('type');

////        if (type === 'checkbox') {
////          $field.prop('checked', !!data[key]);
////        } else if (type === 'radio') {
////          $form.find('[name="' + key + '"][value="' + data[key] + '"]')
////            .prop('checked', true);
////        } else {
////          $field.val(data[key]);
////        }
////      }
////    }
////  }

////  /**
////   * Clear form
////   */
////  function clearForm(formSelector) {
////    var $form = $(formSelector);

////    $form.find('input, select, textarea').each(function () {
////      var $field = $(this);
////      var type = $field.attr('type');

////      if (type === 'checkbox' || type === 'radio') {
////        $field.prop('checked', false);
////      } else if ($field.is('select')) {
////        $field.val('');
////        // Reset Kendo dropdown if exists
////        var kendoWidget = $field.data('kendoDropDownList') ||
////          $field.data('kendoComboBox');
////        if (kendoWidget) {
////          kendoWidget.value('');
////        }
////      } else {
////        $field.val('');
////      }
////    });

////    // Clear Kendo validator messages
////    var validator = $form.data('kendoValidator');
////    if (validator) {
////      validator.hideMessages();
////    }
////  }

////  /**
////   * Disable form
////   */
////  function disableForm(formSelector) {
////    $(formSelector).find('input, select, textarea, button').prop('disabled', true);
////  }

////  /**
////   * Enable form
////   */
////  function enableForm(formSelector) {
////    $(formSelector).find('input, select, textarea, button').prop('disabled', false);
////  }

////  /**
////   * Make form readonly
////   */
////  function makeReadonly(formSelector) {
////    $(formSelector).find('input, select, textarea').prop('readonly', true);
////    $(formSelector).find('button').not('.btn-close').prop('disabled', true);
////  }

////  /**
////   * Remove readonly
////   */
////  function removeReadonly(formSelector) {
////    $(formSelector).find('input, select, textarea').prop('readonly', false);
////    $(formSelector).find('button').prop('disabled', false);
////  }

////  /**
////   * Validate form using Kendo
////   */
////  function validate(formSelector) {
////    var $form = $(formSelector);
////    var validator = $form.data('kendoValidator');

////    if (!validator) {
////      validator = $form.kendoValidator().data('kendoValidator');
////    }

////    return validator.validate();
////  }

////  /**
////   * Hide validation messages
////   */
////  function hideValidationMessages(formSelector) {
////    var $form = $(formSelector);
////    var validator = $form.data('kendoValidator');

////    if (validator) {
////      validator.hideMessages();
////    }
////  }

////  /**
////   * Serialize form to query string
////   */
////  function serialize(formSelector) {
////    return $(formSelector).serialize();
////  }

////  /**
////   * Convert form to FormData object
////   */
////  function toFormData(formSelector) {
////    var formData = new FormData();
////    var $form = $(formSelector);

////    $form.find('input, select, textarea').each(function () {
////      var $field = $(this);
////      var name = $field.attr('name');

////      if (!name) return;

////      var type = $field.attr('type');

////      if (type === 'file') {
////        var files = $field[0].files;
////        for (var i = 0; i < files.length; i++) {
////          formData.append(name, files[i]);
////        }
////      } else if (type === 'checkbox') {
////        formData.append(name, $field.is(':checked'));
////      } else if (type === 'radio') {
////        if ($field.is(':checked')) {
////          formData.append(name, $field.val());
////        }
////      } else {
////        formData.append(name, $field.val());
////      }
////    });

////    return formData;
////  }

////  /**
////   * Focus first invalid field
////   */
////  function focusFirstInvalid(formSelector) {
////    var $form = $(formSelector);
////    var $invalid = $form.find('.k-invalid:first');

////    if ($invalid.length > 0) {
////      $invalid.focus();
////    }
////  }

////  // Public API
////  return {
////    getFormData: getFormData,
////    setFormData: setFormData,
////    clearForm: clearForm,
////    disableForm: disableForm,
////    enableForm: enableForm,
////    makeReadonly: makeReadonly,
////    removeReadonly: removeReadonly,
////    validate: validate,
////    hideValidationMessages: hideValidationMessages,
////    serialize: serialize,
////    toFormData: toFormData,
////    focusFirstInvalid: focusFirstInvalid
////  };
////})();