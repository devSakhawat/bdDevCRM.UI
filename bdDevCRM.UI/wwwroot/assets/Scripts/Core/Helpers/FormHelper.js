

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

  /**
   * Set Form Mode (View/Create/Edit)
   */
  setFormMode: function (config) {
    const {
      formMode = null,           // 'view', 'create', 'edit'
      formId = null,                    // Form ID (required)
      saveOrUpdateButtonId = null,       // Save button ID
      clearButtonId = 'btnClear', 
      createButtonText = 'Save',      // Create mode button text
      editButtonText = 'Update',      // Edit mode button text
      createButtonIcon = 'fas fa-save', // Create mode icon
      editButtonIcon = 'fas fa-check'   // Edit mode icon
    } = config;

    // Validate formId
    if (!formId) {
      console.error('Form ID is required for setFormMode!');
      return;
    }

    if (!saveOrUpdateButtonId) {
      console.error('Button ID is required!');
      return;
    }

    // Get buttons with proper jQuery selector
    const saveBtn = $(saveOrUpdateButtonId.startsWith('#') ? saveOrUpdateButtonId : '#' + saveOrUpdateButtonId);
    const clearBtn = $(clearButtonId.startsWith('#') ? clearButtonId : '#' + clearButtonId);

    if (!saveBtn.length) {
      console.error(`Save button with ID "${saveOrUpdateButtonId}" not found!`);
      return;
    }

    if (formMode === 'view') {
      FormHelper.makeFormReadOnly('#' + formId);
      saveBtn.hide();
      clearBtn.hide();

    } else {
      FormHelper.makeFormEditable('#' + formId);
      saveBtn.show();
      clearBtn.show();

      if (formMode === 'create') {
        // Create Mode
        saveBtn.html(`<i class="${createButtonIcon}"></i> ${createButtonText}`);
      } else if (formMode === 'edit') {
        // Edit Mode
        saveBtn.html(`<i class="${editButtonIcon}"></i> ${editButtonText}`);
      }
    }
  },

  /**
   * Product Form with additional button
   * CommonHelper.createFormActionButtons({
   * formId: 'productForm',
   * closeCallback: 'ProductFormActions.closeForm()',
   * clearCallback: 'ProductFormActions.clearForm()',
   * saveCallback: 'ProductFormActions.saveOrUpdate()',
   * saveButtonId: 'btnSaveProduct',
   * additionalButtons: [
   *   {
   *     text: 'Preview',
   *     icon: 'fas fa-eye',
   *     className: 'btn-info',
   *      callback: 'ProductFormActions.preview()'
   *     }
   *   ]
   * });
   */
  createFormActionButtons: function (config) {
    const {
      showClose = true,
      showClear = true,
      showSave = true,
      closeCallback = null,
      clearCallback = null,
      saveCallback = null,
      saveButtonId = null,
      saveButtonText = 'Save',
      formId = null,
      additionalButtons = []
    } = config;

    // Check if formId is provided
    if (!formId) {
      console.error('Form ID is required!');
      return;
    }

    // Get form element
    const formElement = document.getElementById(formId);
    if (!formElement) {
      console.error(`Form with ID "${formId}" not found!`);
      return;
    }

    let html = '<div class="d-flex justify-content-end gap-2 mt-4">';

    // Close Button
    if (showClose) {
      const closeFunc = closeCallback || 'closeModal()';
      html += `
      <button type="button" class="btn btn-secondary" onclick="${closeFunc}">
        <i class="fas fa-times"></i> Close
      </button>`;
    }

    // Clear Button
    if (showClear) {
      const clearFunc = clearCallback || 'clearForm()';
      html += `
      <button type="button" class="btn btn-warning" id="btnClear" onclick="${clearFunc}">
        <i class="fas fa-eraser"></i> Clear
      </button>`;
    }

    // Additional Custom Buttons
    if (additionalButtons.length > 0) {
      additionalButtons.forEach(btn => {
        html += `
        <button type="button" 
                class="btn ${btn.className || 'btn-info'}" 
                onclick="${btn.callback}">
          <i class="${btn.icon || 'fas fa-cog'}"></i> ${btn.text}
        </button>`;
      });
    }

    // Save Button
    if (showSave) {
      if (!saveButtonId) {
        console.error('Save button ID is required!');
        return;
      }

      const saveFunc = saveCallback || 'saveOrUpdate()';
      html += `
      <button type="button" 
              class="btn btn-primary" 
              id="${saveButtonId}" 
              onclick="${saveFunc}">
        <i class="fas fa-save"></i> ${saveButtonText}
      </button>`;
    }

    html += '</div>';

    // Insert buttons into form
    formElement.insertAdjacentHTML('beforeend', html);
  },

  /**
 * Get form data with type conversion (Type-safe version)
 * @param {string} formSelector - Form ID
 * @returns {object} Type-converted form data
 */
  getFormDataTyped: function (formSelector) {    
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector; // selector string    
    const $form = $(selector); // create jquery object

    //const $form = $(formSelector.startsWith('#') ? formSelector : '#' + formSelector);
    //const $form = $('#' + formSelector);
    const data = {};

    $form.find('[name]').each(function () {
      const $field = $(this);
      const name = $field.attr('name');

      if (!name) return; // Skip fields without name

      // Ignore Kendo ComboBox text inputs
      if (name.endsWith('_input')) return;

      // Get data-type attribute
      let fieldType = $field.attr('data-type') || 'string';
      let rawValue;

      // Special handling for different input types
      if ($field.is(':checkbox')) {
        rawValue = $field.prop('checked');
        fieldType = 'bool'; // Force boolean for checkbox
      }
      else if ($field.is(':radio')) {
        if ($field.is(':checked')) {
          rawValue = $field.val();
        } else {
          return; // Skip unchecked radio
        }
      }
      else if ($field.is('select')) {
        rawValue = $field.val();
      }
      else {
        rawValue = $field.val();
      }

      data[name] = TypeConverter.convert(rawValue, fieldType);
    });

    return data;
  },

  /**
 * Set form data with type awareness
 * @param {string} formId - Form ID  
 * @param {object} data - Data object to populate
 */
  setFormDataTyped: function (formId, data) {
    const $form = $('#' + formId);

    for (let key in data) {
      if (!data.hasOwnProperty(key)) continue;

      const $field = $form.find('[name="' + key + '"]');
      if (!$field.length) continue;

      const fieldType = $field.attr('data-type') || 'string';
      const value = data[key];

      // Set value based on field type
      if ($field.is(':checkbox')) {
        $field.prop('checked', TypeConverter.toBool(value));
      }
      else if ($field.is(':radio')) {
        $form.find('[name="' + key + '"][value="' + value + '"]')
          .prop('checked', true);
      }
      else if (fieldType === 'date' || fieldType === 'datetime') {
        // Kendo DatePicker check
        const datePicker = $field.data('kendoDatePicker') ||
          $field.data('kendoDateTimePicker');
        if (datePicker) {
          datePicker.value(value ? new Date(value) : null);
        } else {
          $field.val(value || '');
        }
      }
      else {
        $field.val(value || '');
      }
    }
  },

  makeValidSelector: function (formSelector) {
    const selector = $(formSelector.startsWith('#') ? formSelector : '#' + formSelector);
    return selector;
  },

  makeFormReadOnly: function (formSelector) {
    const selector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    $(selector).find("input, select, textarea").prop("disabled", true);

    // disable Kendo ComboBox
    $(selector).find("[data-role='combobox']").each(function () {
      $(this).data("kendoComboBox").enable(false);
    });

    // disable Kendo DropDownList
    $(selector).find("[data-role='dropdownlist']").each(function () {
      $(this).data("kendoDropDownList").enable(false);
    });

    // disable Kendo DatePicker
    $(selector).find("[data-role='datepicker']").each(function () {
      $(this).data("kendoDatePicker").enable(false);
    });

    // disable Kendo CheckBox / Switch
    $(selector).find("[data-role='switch'], [data-role='checkbox']").each(function () {
      const widget = $(this).data("kendoSwitch") || $(this).data("kendoCheckBox");
      if (widget) widget.enable(false);
    });

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
      // console.log(gridSel + " not found.");
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
      // console.log(formSel + " not found.");
      return;
    }

    if ($gridSel.length === 0) {
      // console.log(gridSel + " not found.");
      return;
    }

    $formSel.addClass("d-none");
    $gridSel.removeClass("d-none");
  },

  initializeKendoWindow: function (windowSelector, kendowWindowTitle = "", kendowWindowWidth = "50%" , top = "auto") {
    const selector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
    $(selector).kendoWindow({
      title: kendowWindowTitle,
      resizable: true,
      width: kendowWindowWidth,
      actions: ["Pin", "Refresh", "Maximize", "Close"],
      position: {
        top: top
      },
      modal: true,
      visible: false,
    });
  },

  openKendoWindow: function (
    windowSelector,
    kendowWindowTitle,
    kendowWindowWidth = "50%",
    kendowWindowheight = "50%",
    animationType = "default",
    animateOpacity = true,
    onOpenCallback = null  // Generic callback parameter
  ) {
    const selector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
    var popUp = $(selector).data("kendoWindow");
    var iskendowWindowheightValuePercentage = kendowWindowheight.includes('%');
    var kendowWindowheightValue = parseFloat(kendowWindowheight);

    // Build animation config
    var effects = "";
    var animationConfig = null;

    if (animationType === "default") {
      animationConfig = {
        open: {
          effects: "zoom:in fadeIn",
          duration: 300
        },
        close: {
          effects: "zoom:out fadeOut",
          duration: 200
        }
      };
    }
    else if (animationType === "expand") {
      effects = "expand:vertical";
      if (animateOpacity) {
        effects += " fadeIn";
      }
      animationConfig = {
        open: {
          effects: effects,
          duration: 300
        },
        close: {
          effects: effects,
          reverse: true,
          duration: 200
        }
      };
    }

    // Calculate horizontal center position
    var leftPosition = "auto";
    if (kendowWindowWidth) {
      var widthValue = parseFloat(kendowWindowWidth);
      var isPercentage = kendowWindowWidth.includes('%');

      if (isPercentage) {
        leftPosition = ((100 - widthValue) / 2) + "%";
      } else {
        leftPosition = "calc((100% - " + kendowWindowWidth + ") / 2)";
      }
    }

    // Calculate maximum height
    var browserHeight = $(window).height();
    var kendowWindowHeight = 0;

    //// no need to calculate content height. Caller will pass kendow window height value. then (-) top and bottom value.
    //if (iskendowWindowheightValuePercentage) {
    //  kendowWindowHeight = ((kendowWindowheightValue / 100) * (browserHeight - 20));
    //} else {
    //  kendowWindowHeight = kendowWindowheightValue;
    //}

    var maxHeight = browserHeight - 50;
    kendowWindowHeight = browserHeight - 50;

    //// Handle top position
    //if (!isTopValuePercentage) {
    //  if (topValue >= 200) {
    //    top = "120px";
    //  }
    //} else {
    //  top = "200px";
    //}

    // Create or update Kendo Window
    if (!popUp) {
      $(selector).kendoWindow({
        title: kendowWindowTitle,
        resizable: true,
        width: kendowWindowWidth,
        height: kendowWindowHeight,
        actions: ["Pin", "Refresh", "Maximize", "Close"],
        position: {
          top: '20px',
          left: leftPosition
        },
        modal: true,
        visible: false,
        animation: animationConfig,
        // Generic callback execution
        open: function () {
          setTimeout(function () {
            if (typeof onOpenCallback === 'function') {
              onOpenCallback(selector, kendowWindowHeight);
            }
          }, 100);
        }
      });
      popUp = $(selector).data("kendoWindow");
    } else {
      popUp.setOptions({
        width: kendowWindowWidth,
        height: kendowWindowHeight,
        position: {
          top: '20px',
          left: leftPosition
        },
        animation: animationConfig
      });
    }

    if (kendowWindowTitle) {
      popUp.title(kendowWindowTitle);
    }

    popUp.center().open();

    //if (isTopValuePercentage) {
    //  popUp.center().open();
    //} else {
    //  popUp.open();
    //}

    if (typeof popUp.toFront === "function") {
      popUp.toFront();
    }

    // Generic window resize handler
    $(window).off('resize.kendoWindow' + selector).on('resize.kendoWindow' + selector, function () {
      var newBrowserHeight = $(window).height();
/*      var newTopPositionPx = isTopValuePercentage ? (topValue / 100) * newBrowserHeight : topValue;*/
      var newMaxHeight = newBrowserHeight - 20;

      //var newTopPositionPx = isTopValuePercentage ? (topValue / 100) * newBrowserHeight : topValue;
      //var newMaxHeight = newBrowserHeight - newTopPositionPx - 50;

      if (popUp) {
        popUp.setOptions({
          height: newMaxHeight
        });
        if (typeof onOpenCallback === 'function') {
          onOpenCallback(selector, newMaxHeight);
        }
      }
    });
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
      // console.log("Grid not initialized");
      return;
    }

    if (!grid.dataSource) {
      // console.log("DataSource not found");
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

  generateHeightWithoutHeaderAndFooter: function (selector, headerHeight, footerHeight) {
    const $el = selector.startsWith('#') || selector.startsWith('.')
      ? $(selector)
      : $('#' + selector);

    if ($el.length === 0) {
      console.error('Element not found:', selector);
      return;
    }

    // Normalize headerHeight to number (px)
    if (typeof headerHeight === 'string') {
      headerHeight = parseInt(headerHeight.replace('px', ''), 10) || 0;
    } else {
      headerHeight = headerHeight || 0;
    }

    // Normalize footerHeight to number (px)
    if (typeof footerHeight === 'string') {
      footerHeight = parseInt(footerHeight.replace('px', ''), 10) || 0;
    } else {
      footerHeight = footerHeight || 0;
    }

    // Function to calculate and apply height
    const applyHeight = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const finalHeight = vh - headerHeight - footerHeight;
      const heightValue = (finalHeight > 0 ? finalHeight : 0) + 'px';

      // Apply height with !important
      $el[0].style.setProperty('height', heightValue, 'important');
    };

    // Apply initially
    applyHeight();

    // Enable auto-resize on window resize
    $(window).off('resize.generateHeight').on('resize.generateHeight', applyHeight);
  },




};
