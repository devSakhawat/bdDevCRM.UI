// <reference path="workflowsummary.js" />
// <reference path="statedetails.js" />
// <reference path="actiondetail.js" />

var WorkFlowDetailsManager = {

}

var WorkFlowDetailsHelper = {

  createTabstrip: function () {
    $("#tabstrip").kendoTabStrip({
      select: function (e) {
        // Ensure only one tab has the 'k-state-active' class
        $("#tabstrip ul li").removeClass("k-state-active");
        $(e.item).addClass("k-state-active");
      }
    });

    var tabStrip = $("#tabstrip").data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0); // Ensure the first tab is selected by default
    } else {
      console.log("Kendo TabStrip is not initialized.");
    }
  },

  // Enhanced clearForm function using CommonManager.clearFormFields
  clearForm: function () {
    try {
      // State Details form clear
      StateDetailsHelper.clearStateForm();

      // Clear Action Detail form
      ActionDetailHelper.clearActionForm();

      CommonManager.clearFormFields("#tabstrip");

      var tabStrip = $("#tabstrip").data("kendoTabStrip");
      if (tabStrip) {
        tabStrip.select(0);
      }

      // Any additional workflow-specific cleanup
      this.clearWorkflowSpecificFields();

      console.log("Workflow form cleared successfully");

    } catch (error) {
      console.error("Error clearing workflow form:", error);
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 3000,
        message: "Error clearing form: " + error.message,
        type: 'warning'
      });
    }
  },

  // Workflow specific fields clear, additional helper function
  clearWorkflowSpecificFields: function () {
    // Hidden fields reset
    $("#stateID").val(0);
    $("#actionID").val(0);

    // Action grid clear
    var actionGrid = $("#gridSummaryAction").data("kendoGrid");
    if (actionGrid) {
      actionGrid.dataSource.data([]);
    }

    // Any workflow-specific UI state reset
    $("#btnSaveOrUpdate").text("+ Add Item");
    $("#btnActionSaveOrUpdate").text("+ Add Item");

    // Clear any validation messages
    $(".status").text('').removeClass('invalid valid');
  },

  // Complete workflow reset function - if needed for full reset
  resetWorkflowForm: function () {
    // Full reset including grid data and UI state
    this.clearForm();

    // Reset summary grid selection if any
    var summaryGrid = $("#gridSummary").data("kendoGrid");
    if (summaryGrid) {
      summaryGrid.clearSelection();
    }

    // Reset to default state
    $("#tabstrip").find("li:first").trigger("click");

    console.log("Workflow form completely reset");
  },

  populateObject2: async function (item) {
    console.log(item);
    WorkFlowDetailsHelper.clearForm();
    $("#btnSaveOrUpdate").text("Update Item");

    $("#stateID").val(item.WfstateId);
    var menuComboBoxInstance = $("#cmbMenu").data("kendoComboBox");
    menuComboBoxInstance.value(item.MenuId);
    $("#txtStateName").val(item.StateName);
    $("#cmbIsClose").data("kendoComboBox").value(item.IsClosed);
    $("#chkIsDefault").prop('checked', item.IsDefaultStart);
    ActionDetailHelper.clearActionForm();
    var nextStateComboBox = $("#cmbNextState").data("kendoComboBox");
    if (nextStateComboBox) {
      var nextStateComboBoxDataSource = await ActionDetailHelper.loadNextStateCombo(item.MenuId);
      nextStateComboBox.setDataSource(nextStateComboBoxDataSource);
    }
    ActionDetailHelper.generateActionGrid(item.WfstateId);
    $("#txtStateName_Action").val(item.StateName);
  },

  populateObject: async function (item) {
    try {
      debugger;
      console.log("Populating object:", item);
      WorkFlowDetailsHelper.clearForm();
      $("#btnSaveOrUpdate").text("Update Item");
      $("#stateID").val(item.WfStateId);
      $("#txtSequenceNo").val(item.Sequence);

      // Menu ComboBox setup
      var menuComboBoxInstance = $("#cmbMenu").data("kendoComboBox");
      if (menuComboBoxInstance && item.MenuId) {
        menuComboBoxInstance.value(item.MenuId);
      }
      // State name
      $("#txtStateName").val(item.StateName);

      if (item.IsClosed !== null && item.IsClosed !== undefined) {
        $("#cmbIsClose").data("kendoDropDownList").value(item.IsClosed);
      }

      //if (item.IsClosed !== null && item.IsClosed !== undefined) {
      //  var dropDown = $("#cmbIsClose").data("kendoDropDownList");
      //  var targetValue = parseInt(item.IsClosed);

      //  // Check if dropDown and its dataSource exist
      //  if (dropDown && dropDown.dataSource && dropDown.dataSource.data) {
      //    var dataItems = dropDown.dataSource.data();
      //    console.log(dataItems);

      //    // Handle Kendo DataSource object - convert to array or iterate through items
      //    var targetIndex = -1;

      //    // Method 1: Use Kendo DataSource's view() method which returns an array
      //    if (dataItems.view && typeof dataItems.view === 'function') {
      //      var viewItems = dataItems.view();
      //      targetIndex = viewItems.findIndex(dataItem => parseInt(dataItem.value) === targetValue);
      //    }
      //    // Method 2: If view() is not available, iterate through the length property
      //    else if (dataItems.length !== undefined) {
      //      for (var i = 0; i < dataItems.length; i++) {
      //        var dataItem = dataItems[i];
      //        if (dataItem && parseInt(dataItem.value) === targetValue) {
      //          targetIndex = i;
      //          break;
      //        }
      //      }
      //    }
      //    // Method 3: Convert to array if it has indexed properties
      //    else if (dataItems.length !== undefined) {
      //      var itemsArray = [];
      //      for (var i = 0; i < dataItems.length; i++) {
      //        if (dataItems[i]) {
      //          itemsArray.push(dataItems[i]);
      //        }
      //      }
      //      targetIndex = itemsArray.findIndex(dataItem => parseInt(dataItem.value) === targetValue);
      //    }

      //    if (targetIndex >= 0) {
      //      dropDown.select(targetIndex);
      //      console.log("Selected index:", targetIndex, "for value:", targetValue);
      //    } else {
      //      console.warn("Target value not found, trying direct value setting:", targetValue);
      //      // Fallback: try direct value setting
      //      dropDown.value(targetValue.toString());
      //    }
      //  } else {
      //    console.warn("dropDownBox or its dataSource not available");
      //  }
      //}

      // IsDefaultStart checkbox
      $("#chkIsDefault").prop('checked', item.IsDefaultStart === true || item.IsDefaultStart === 1);

      // Set state name in action section
      $("#txtStateName_Action").val(item.StateName);

      //// Additional UI state updates
      //this.updateUIAfterPopulate(item);

      ActionDetailHelper.initializeResponsiveActionGrid(item.WfStateId);

      console.log("Object populated successfully");

    } catch (error) {
      console.log(error);
      console.error("Error populating object:", error);
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 3000,
        message: "Error populating form: " + error.message,
        type: 'error'
      });
    }
  },

  // Force set ComboBox value - specifically for handling value 0
  forceSetComboBoxValue: function (comboBoxSelector, value, retryCount = 0) {
    try {
      var comboBox = $(comboBoxSelector).data("kendoComboBox");
      if (!comboBox) {
        console.error("ComboBox not found:", comboBoxSelector);
        return false;
      }

      var parsedValue = parseInt(value);
      console.log("Force setting value:", parsedValue, "to", comboBoxSelector);

      // Method 1: Direct value setting
      comboBox.value(parsedValue);

      // Method 2: If direct setting failed, try with string conversion
      if (comboBox.value() !== parsedValue) {
        comboBox.value(parsedValue.toString());
      }

      // Method 3: If still not set, find and select by text
      if (comboBox.value() !== parsedValue) {
        var dataItems = comboBox.dataSource.data();
        var matchingItem = dataItems.find(item => item.value === parsedValue);
        if (matchingItem) {
          comboBox.text(matchingItem.text);
          comboBox.value(parsedValue);
        }
      }

      // Trigger change event
      comboBox.trigger("change");

      // Verify setting
      var currentValue = comboBox.value();
      var isSet = (currentValue == parsedValue);

      console.log("Force set result:", isSet, "Current value:", currentValue, "Target value:", parsedValue);

      // Retry if failed and retry count is less than 3
      if (!isSet && retryCount < 3) {
        console.log("Retrying force set, attempt:", retryCount + 1);
        setTimeout(() => {
          this.forceSetComboBoxValue(comboBoxSelector, value, retryCount + 1);
        }, 100);
      }

      return isSet;

    } catch (error) {
      console.error("Error in forceSetComboBoxValue:", error);
      return false;
    }
  },

  // Helper method for setting IsClosed combo value - Updated to handle value 0 properly
  setIsClosedComboValue: function (isClosedValue) {
    try {
      var isCloseComboBox = $("#cmbIsClose").data("kendoComboBox");

      if (!isCloseComboBox) {
        console.error("IsClosed ComboBox not initialized");
        return;
      }

      // Handle null/undefined values
      if (isClosedValue === null || isClosedValue === undefined) {
        console.log("IsClosed value is null/undefined, setting to default (0)");
        isCloseComboBox.value(0);
        isCloseComboBox.trigger("change");
        return;
      }

      // Convert to integer - This is crucial for value 0
      var parsedValue = parseInt(isClosedValue);

      // Validate that it's a valid number (including 0)
      if (isNaN(parsedValue)) {
        console.warn("IsClosed value is not a valid number:", isClosedValue);
        isCloseComboBox.value(0); // Default to "Open"
        isCloseComboBox.trigger("change");
        return;
      }

      console.log("Original IsClosed value:", isClosedValue, "Type:", typeof isClosedValue);
      console.log("Parsed IsClosed value:", parsedValue, "Type:", typeof parsedValue);

      // Get dataSource and check if it exists
      var dataSource = isCloseComboBox.dataSource;
      if (!dataSource || !dataSource.data) {
        console.error("ComboBox dataSource not available");
        return;
      }

      var dataItems = dataSource.data();
      var validValues = dataItems.map(item => item.value);

      console.log("Available values in dataSource:", validValues);
      console.log("Looking for value:", parsedValue);

      // Check if the value exists in dataSource (important for value 0)
      var matchingItem = dataItems.find(function (dataItem) {
        return dataItem.value === parsedValue;
      });

      if (matchingItem) {
        // Clear the current value first (important for value 0)
        isCloseComboBox.value("");

        // Small delay to ensure clearing is processed
        setTimeout(function () {
          isCloseComboBox.value(parsedValue);
          isCloseComboBox.trigger("change");
          console.log("IsClosed combo set successfully to:", matchingItem.text, "with value:", parsedValue);

          // Verify the value was set correctly
          var currentValue = isCloseComboBox.value();
          var currentText = isCloseComboBox.text();
          console.log("Verification - Current value:", currentValue, "Current text:", currentText);

        }, 50);

      } else {
        console.warn("Value", parsedValue, "not found in dataSource. Available values:", validValues);
        // Set to default "Open" (0) if no match found
        isCloseComboBox.value(0);
        isCloseComboBox.trigger("change");
      }

    } catch (error) {
      console.error("Error setting IsClosed combo value:", error);
      // Fallback to default value
      try {
        var isCloseComboBox = $("#cmbIsClose").data("kendoComboBox");
        if (isCloseComboBox) {
          isCloseComboBox.value(0);
          isCloseComboBox.trigger("change");
        }
      } catch (fallbackError) {
        console.error("Even fallback failed:", fallbackError);
      }
    }
  },

  // Helper function to update UI after populating object
  updateUIAfterPopulate: function (item) {
    try {
      if (item.IsClosed === 1) {
        $("#txtStateName").prop('readonly', true);
      } else {
        $("#txtStateName").prop('readonly', false);
      }

      var tabStrip = $("#tabstrip").data("kendoTabStrip");
      if (tabStrip && item.StateName) {
        var stateTab = tabStrip.tabGroup.children().eq(0);
        if (stateTab.length > 0) {
          // Update any dynamic content in tabs
        }
      }

      // Enable/disable action section based on state
      if (item.WfStateId) {
        $("#actionSection").show();
        $("#btnActionSaveOrUpdate").prop('disabled', false);
      } else {
        $("#actionSection").hide();
        $("#btnActionSaveOrUpdate").prop('disabled', true);
      }

    } catch (error) {
      console.error("Error updating UI after populate:", error);
    }
  },

  // Additional method to validate populated data (updated without ModuleId/ModuleName)
  validatePopulatedData: function (item) {
    var validationErrors = [];

    if (!item.WfStateId || item.WfStateId <= 0) {
      validationErrors.push("Invalid State ID");
    }

    if (!item.StateName || item.StateName.trim() === '') {
      validationErrors.push("State Name is required");
    }

    if (!item.MenuId || item.MenuId <= 0) {
      validationErrors.push("Invalid Menu ID");
    }

    if (validationErrors.length > 0) {
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 5000,
        message: "Validation errors: " + validationErrors.join(", "),
        type: 'warning'
      });
      return false;
    }

    return true;
  },

}