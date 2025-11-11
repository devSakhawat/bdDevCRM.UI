// <reference path="workflowsummary.js" />
// <reference path="workflowdetail.js" />
// <reference path="statedetails.js" />


var ActionDetailManager = {

  fetchNextStateComboBoxData: async function (menuId) {
    const jsonParams = $.param({ menuId });
    const serviceUrl = "/next-states-by-menu";

    try {
      const result = await AjaxManager.GetDataAsyncOrSyncronous(
        baseApi,
        serviceUrl,
        jsonParams,
        true,
        false
      );
      return result;
    } catch (jqXHR) {
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 0,
        message: jqXHR.status + " : " + jqXHR.responseText,
        type: 'error',
      });
      throw jqXHR;
    }
  },

  getSummaryGridDataSource2: function (stateId) {
    return AjaxManager.GenericGridDataSource({
      apiUrl: baseApi + "/get-action-summary-by-statusId?stateId=" + encodeURIComponent(stateId),
      requestType: "POST",
      async: true,
      modelFields: {
        createdDate: { type: "date" }
      },
      pageSize: 13,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Items",
      schemaTotal: "TotalCount"
    });
  },

  getSummaryGridDataSource: function (stateId) {
    debugger;
    return VanillaApiCallManager.GenericGridDataSource({
      apiUrl: baseApi + "/get-action-summary-by-statusId?stateId=" + encodeURIComponent(stateId),
      requestType: "POST",
      async: true,
      modelFields: {},
      pageSize: 10,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Data.Items",
      schemaTotal: "Data.TotalCount",
      buttonCount: 3
    });
  },

  saveOrUpdate: async function () {
    const id = $("#actionID").val() || 0;
    const isCreate = id == 0;
    const serviceUrl = isCreate ? "/wf-action" : `/wf-action/${id}`;
    const httpType = isCreate ? "POST" : "PUT";
    const confirmMsg = isCreate ? "Do you want to save information?" : "Do you want to update information?";
    const successMsg = isCreate ? "New Data Saved Successfully." : "Information Updated Successfully.";

    const action = ActionDetailHelper.createActionData();
    if (!action) {
      throw new Error("Failed to create action data");
    }

    AjaxManager.MsgBox(
      'info',
      'center',
      'Confirmation',
      confirmMsg,
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: async function ($noty) {
            $noty.close();
            var action = ActionDetailHelper.createActionData();
            console.log(action);
            var jsonObject = JSON.stringify(action);
            try {
              const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, jsonObject, httpType);
              if (response && (response.IsSuccess === true || response === "Success")) {
                ActionDetailHelper.clearActionForm();
                ToastrMessage.showSuccess(successMsg);
                //ToastrMessage.showToastrNotification({
                //  preventDuplicates: true,
                //  closeButton: true,
                //  timeOut: 3000,
                //  message: successMsg,
                //  type: 'success',
                //});
                const grid = $("#gridSummaryAction").data("kendoGrid");
                if (grid) {
                  grid.dataSource.read();
                } else {
                  console.error("Grid not found with ID: #gridSummaryAction");
                }
              } else {
                throw new Error(response.Message || response || "Unknown error occurred");
              }
            } catch (err) {
              console.log(err);
              VanillaApiCallManager?.handleApiError?.(err);
            }
          }
        },
        {
          addClass: 'btn',
          text: 'Cancel',
          onClick: function ($noty) {
            $noty.close();
          }
        },
      ],
      0
    );
  },

  deleteData: function (item) {
    // Validation: Check if item exists
    if (!item || item == null || item == undefined) {
      console.warn("No item provided for deletion");
      return false;
    }

    // Workflow action ID check
    if (!item.WfActionId || item.WfActionId <= 0) {
      ToastrMessage.showError("Invalid Workflow action ID", "Validation Error", 3000);
      return false;
    }

    const successMsg = "Workflow action state deleted successfully.";
    const serviceUrl = `/wf-action/${item.WfActionId}`;
    const confirmMsg = `Are you sure you want to delete the workflow action state "${item.ActionName}"?`;
    const httpType = "DELETE";

    AjaxManager.MsgBox(
      'warning',
      'center',
      'Delete Confirmation',
      confirmMsg,
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: async function ($noty) {
            $noty.close();
            var jsonObject = JSON.stringify(item);
            try {
              const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, jsonObject, httpType);
              if (response && response.IsSuccess === true) {

                // Clear Action Detail form
                ActionDetailHelper.clearActionForm();

                // Show success message
                ToastrMessage.showSuccess(successMsg);
                const grid = $("#gridSummaryAction").data("kendoGrid");
                if (grid) {
                  grid.dataSource.read();
                }
              } else {
                throw new Error(response.Message || "Delete operation failed.");
              }
            } catch (err) {
              const msg = err.responseText || err.statusText || err.message || "Unknown error";
              VanillaApiCallManager.handleApiError(err.response || msg);
            }
          }
        },
        {
          addClass: 'btn',
          text: 'Cancel',
          onClick: function ($noty) {
            $noty.close();
          }
        },
      ]
      , 0
    );
  },

  deleteItem2: function (item) {
    // Validation: Check if item exists
    if (!item || item == null || item == undefined) {
      console.warn("No item provided for deletion");
      return false;
    }

    // Workflow State ID check
    if (!item.WfStateId || item.WfStateId <= 0) {
      ToastrMessage.showError("Invalid Workflow State ID", "Validation Error", 3000);
      return false;
    }

    const successMsg = "Workflow state deleted successfully.";
    const serviceUrl = `/workflow/${item.WfStateId}`;
    const confirmMsg = `Are you sure you want to delete the workflow state "${item.StateName}"?`;
    const httpType = "DELETE";

    AjaxManager.MsgBox(
      'warning',
      'center',
      'Delete Confirmation',
      confirmMsg,
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: async function ($noty) {
            $noty.close();
            var jsonObject = JSON.stringify(item);
            try {
              const response = await VanillaApiCallManager.SendRequestVanilla(baseApi, serviceUrl, jsonObject, httpType);
              //const response = await VanillaApiCallManager.delete(baseApi, serviceUrl);
              if (response && response.IsSuccess === true) {
                // Clear form after successful deletion
                WorkFlowDetailsHelper.clearForm();

                // Show success message
                ToastrMessage.showSuccess(successMsg);
                const grid = $("#gridSummary").data("kendoGrid");
                if (grid) {
                  grid.dataSource.read();
                }
              } else {
                throw new Error(response.Message || "Delete operation failed.");
              }
            } catch (err) {
              const msg = err.responseText || err.statusText || err.message || "Unknown error";
              VanillaApiCallManager.handleApiError(err.response || msg);
            }
          }
        },
        {
          addClass: 'btn',
          text: 'Cancel',
          onClick: function ($noty) {
            $noty.close();
          }
        },
      ]
      , 0
    );
  },


}


var ActionDetailHelper = {

  initActionDetails: function () {
    //ActionDetailHelper.generateNextStateCombo();
    //this.initializeResponsiveActionGrid(0);
    //this.bindResizeEvents();
  },

  initializeActionSummaryGrid: function () {
    var Columns = this.generateResponsiveColumns();
    var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(Columns);
    var containerWidth = $("#gridSummaryAction").width() || (window.innerWidth - 323);
    var gridWidth = totalColumnsWidth > containerWidth ? "100%" : `${totalColumnsWidth}px`;

    const gridOptions = {
      toolbar: this.getToolbarConfig(),
      excel: {
        fileName: "WorkflowList" + Date.now() + ".xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      pdf: {
        fileName: "Workflow_Information.pdf",
        allPages: true,
        paperSize: "A4",
        landscape: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        scale: 0.9,
        repeatHeaders: true,
        columns: [
          { field: "WorkflowTitle", width: 200 }
        ]
      },
      dataSource: [],
      autoBind: true,
      navigatable: true,
      scrollable: true,
      resizable: true,
      width: gridWidth,
      filterable: true,
      sortable: true,
      pageable: {
        refresh: true,
        pageSizes: [10, 20, 30, 50, 100],
        buttonCount: 5,
        input: false,
        numeric: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      columns: Columns,
      mobile: true,
      toolbar: this.getToolbarConfig(),
      dataBound: function () {
        WorkFlowSummaryHelper.adjustGridForMobile();
      },
      editable: false,
      selectable: "row",
      error: function (e) {
        console.log("Grid Error:", e);
        kendo.alert({
          title: "Error",
          content: "Error: " + e.errors
        });
      }
    };

    $("#gridSummaryAction").kendoGrid(gridOptions);

    $("#btnExportCsvCourse").on("click", function () {
      CommonManager.GenerateCSVFileAllPages("gridSummaryAction", "CourseListCSV", "Actions");
    });

    const grid = $("#gridSummaryAction").data("kendoGrid");
    if (grid) {
      const ds = WrokFlowSummaryManager.getSummaryGridDataSource();

      ds.bind("error", function (e) {
        console.log("DataSource Error Event:", e);
        console.log("DataSource Error Event:", e.response);
        kendo.alert({
          title: "Error",
          content: "Error: " + e.response
        });
      });

      ds.bind("requestEnd", function (e) {
        console.log(e);
        console.log(e.response);
        if (e.response && e.response.isSuccess === false) {
          console.log("API returned error:", e.response.message);
          kendo.alert({
            title: "Error",
            content: "Error: " + e.response.message
          });
        }
      });

      grid.setDataSource(ds);
    }
  },

  generateActionGrid: function (stateId) {
    // Check if grid already exists
    var existingGrid = $("#gridSummaryAction").data("kendoGrid");
    if (existingGrid) {
      if (!stateId) {
        existingGrid.dataSource.data([]);
        return;
      } else {
        var newDataSource = ActionDetailManager.getSummaryGridDataSource(stateId);
        existingGrid.setDataSource(newDataSource);
        return;
      }
    }

    // If grid doesn't exist, create new one
    this.initializeResponsiveActionGrid(stateId);
  },

  initializeResponsiveActionGrid: function (stateId) {
    debugger;
    this.clearActionGrid();
    var Columns = this.generateResponsiveActionColumns();
    var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(Columns);
    //var containerWidth = $("#gridSummaryAction").width() || (window.innerWidth - 323);
    var containerWidth = $("#gridSummaryAction").width();
    var gridWidth = totalColumnsWidth > containerWidth ? "100%" : `${totalColumnsWidth}px`;
    var height = this.calculateDynamicActionGridHeight();

    $("#gridSummaryAction").kendoGrid({
      dataSource: stateId ? ActionDetailManager.getSummaryGridDataSource(stateId) : [],
      height: height,
      scrollable: true, 
      resizable: true,
      width: gridWidth,
      sortable: true,
      filterable: true,
      pageable: false, 
      columns: Columns,
      mobile: true,
      toolbar: this.getActionToolbarConfig(),
      dataBound: function (e) {
        ActionDetailHelper.adjustActionGridForMobile();
        ActionDetailHelper.adjustGridHeightBasedOnData(e);
      },
      editable: false,
      selectable: "row",
      autoBind: true,
      navigatable: true,
      noRecords: {
        template: "<div class='text-center p-4'><i class='fas fa-inbox fa-2x text-muted mb-2'></i><br><span class='text-muted'>No actions found</span></div>"
      }
    });
  },

  calculateDynamicActionGridHeight: function () {
    var returnHeight = 0;
    //var headerHeight = 50;
    //var rowHeight = 35;
    //var maxRows = 10;
    //var toolbarHeight = 40;
    //var borderPadding = 10;
    //var maxHeight = headerHeight + (rowHeight * maxRows) + toolbarHeight + borderPadding;

    var maxHeight = 50 + (35 * 10) + 40 + 10;
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;

    if (windowWidth < 576) {
      returnHeight = Math.min(maxHeight, 400); // Mobile - maximum 400px
    } else if (windowWidth < 992) {
      returnHeight = Math.min(maxHeight, 450); // Tablet - maximum 450px
    } else {
      returnHeight = Math.min(maxHeight, windowHeight); // Desktop
      //if (maxHeight > windowHeight) // Desktop
      //{
      //  returnHeight = windowHeight;
      //}
      //else {
      //  returnHeight = Math.min(maxHeight, windowHeight); // Desktop
      //}
    }
    return returnHeight;
  },

  adjustGridHeightBasedOnData: function (e) {
    debugger;
    var grid = e.sender;
    var dataSource = grid.dataSource;
    var totalItems = dataSource.total();

    // Calculate dynamic height based on data
    var headerHeight = 50;
    var rowHeight = 35;
    var toolbarHeight = 40;
    var borderPadding = 10;
    var minHeight = 150; // Minimum height for empty grid

    var calculatedHeight;

    if (totalItems === 0) {
      // If no data, set minimum height
      calculatedHeight = minHeight;
      // Hide scrollbar when no data
      grid.wrapper.find(".k-grid-content").css("overflow-y", "hidden");
    } else if (totalItems <= 10) {
      // If items <= 10, adjust height to fit all items without scrollbar
      calculatedHeight = headerHeight + (rowHeight * totalItems) + toolbarHeight + borderPadding;
      grid.wrapper.find(".k-grid-content").css("overflow-y", "hidden");
    } else {
      // If items > 10, set height for 10 items and show scrollbar
      calculatedHeight = headerHeight + (rowHeight * 10) + toolbarHeight + borderPadding;
      grid.wrapper.find(".k-grid-content").css("overflow-y", "auto");
    }

    // Apply the calculated height
    grid.wrapper.height(calculatedHeight);
    grid.wrapper.find(".k-grid-content").height(calculatedHeight - headerHeight);
    //grid.wrapper.find(".k-grid-content").height(calculatedHeight - headerHeight - toolbarHeight);

    // Refresh grid layout
    grid.resize();
  },

  generateResponsiveActionColumns: function () {
    var isMobile = window.innerWidth < 768;

    var columns = [
      { field: "WfActionId", hidden: true },
      { field: "WfStateId", hidden: true },
      { field: "NextStateId", hidden: true },
      { field: "AcSortOrder", hidden: true },
      { field: "IsDefaultStart", hidden: true },
      { field: "IsClosed", hidden: true },
      { field: "MenuId", hidden: true },
      { field: "Sequence", hidden: true },
      {
        field: "ActionName",
        title: "Action Name",
        width: isMobile ? 120 : 200,
        attributes: {
          style: "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        }
      },
      {
        field: "NextStateName",
        title: "Next State",
        width: isMobile ? 100 : 180,
        hidden: isMobile,
        attributes: {
          style: "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        }
      },
      {
        field: "EmailAlert",
        title: "Email",
        width: isMobile ? 60 : 80,
        template: "#= EmailAlert == 1 ? 'Yes' : 'No' #"
      },
      {
        field: "SmsAlert",
        title: "SMS",
        width: isMobile ? 60 : 80,
        hidden: isMobile,
        template: "#= SmsAlert == 1 ? 'Yes' : 'No' #"
      },
      {
        field: "Actions",
        title: "Actions",
        filterable: false,
        width: isMobile ? 100 : 160,
        template: this.getActionActionTemplate()
      }
    ];

    return columns;
  },

  getActionActionTemplate: function () {
    if (window.innerWidth < 768) {
      // Mobile dropdown menu - Fixed template with proper escaping
      return '<div class="dropdown">' +
        '<button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">' +
        'Actions' +
        '</button>' +
        '<ul class="dropdown-menu">' +
        '<li><a class="dropdown-item" href="javascript:void(0)" onclick="ActionDetailHelper.clickEventForEditButton(event)">Edit</a></li>' +
        '<li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="ActionDetailHelper.clickEventForDeleteButton(event)">Delete</a></li>' +
        '</ul>' +
        '</div>';
    } else {
      // Desktop buttons - Fixed template
      return '<button class="btn btn-outline-dark btn-action me-1" onclick="ActionDetailHelper.clickEventForEditButton(event)">Edit</button>' +
        '<button class="btn btn-outline-danger btn-action" onclick="ActionDetailHelper.clickEventForDeleteButton(event)">Delete</button>';
    }
  },

  getActionToolbarConfig: function () {
    if (window.innerWidth < 768) {
      return ["excel"]; 
    }
    return ["excel", "pdf"
     /* ,{ template: '<button type="button" id="btnExportCsvWorkFlowAction" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }*/
    ];
  },

  calculateActionGridHeight: function () {
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;

    if (windowWidth < 576) {
      return 350; // Mobile
    } else if (windowWidth < 992) {
      return 400; // Tablet
    } else {
      return Math.min(500, windowHeight - 350); // Desktop
    }
  },

  adjustActionGridForMobile: function () {
    if (window.innerWidth < 768) {
      // Additional mobile adjustments
      $("#gridSummaryAction").find(".k-grid-toolbar").find(".k-button").addClass("btn-sm");
      $("#gridSummaryAction").find(".k-pager-wrap").addClass("k-pager-sm");
    }
  },

  bindResizeEvents: function () {
    var resizeTimer;
    $(window).on('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var grid = $("#gridSummaryAction").data("kendoGrid");
        if (grid) {
          // Destroy and reinitialize for major changes
          if (window.innerWidth < 768 !== ActionDetailHelper.wasMobileAction) {
            grid.destroy();
            $("#gridSummaryAction").empty();
            ActionDetailHelper.initializeResponsiveActionGrid();
            ActionDetailHelper.wasMobileAction = window.innerWidth < 768;
          } else {
            // Just resize for minor changes
            grid.resize();
          }
        }
      }, 250);
    });

    // Track mobile state
    this.wasMobileAction = window.innerWidth < 768;
  },

  // Add method to clear grid data
  clearActionGrid: function () {
    var grid = $("#gridSummaryAction").data("kendoGrid");
    if (grid) {
      grid.dataSource.data([]);
    }
  },

  // Add method to refresh grid with new data
  refreshActionGrid: function (stateId) {
    if (!stateId) {
      this.clearActionGrid();
      return;
    }

    var grid = $("#gridSummaryAction").data("kendoGrid");
    if (grid) {
      var dataSource = ActionDetailManager.getSummaryGridDataSource(stateId);
      grid.setDataSource(dataSource);
    } else {
      this.initializeResponsiveActionGrid(stateId);
    }
  },


  // initialize all combo box.
  generateNextStateCombo: function () {
    $("#cmbNextState").kendoComboBox({
      placeholder: "Select Next State...",
      optionLabel: "Select Next State",
      dataTextField: "StateName",
      dataValueField: "WfStateId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    //// init kendo dropdown (without optionLabel)
    //$el.kendoDropDownList({
    //  dataTextField: "ClosingStateName",
    //  dataValueField: "closingStateId",
    //  dataSource: data,
    //  valuePrimitive: true,
    //  value: data[0]?.closingStateId || 0,
    //  filter: "contains",
    //  suggest: true
    //});


  },

  clearActionForm: function () {

    $("#txtStateName_Action").val('');
    $("#txtActionName").val('');
    var nextStateComboBox = $("#cmbNextState").data("kendoComboBox");
    if (nextStateComboBox) {
      nextStateComboBox.text('');
    }

    $("#numSortOrder").val("0");
    $('#chkIsEmail').prop('checked', false);
    $('#chkIsSms').prop('checked', false);

    //$("#stateID").val('');
    $("#actionID").val('');
    //actionDetailManager.clearActionValidatorMsg();
    $("#btnActionSaveOrUpdate").text("+ Add Item");
  },

  loadNextStateCombo: async function (menuId) {
    var nextStateComboBox = $("#cmbNextState").data("kendoComboBox");
    if (nextStateComboBox) {
      try {
        const nextStateComboDataSource = await ActionDetailManager.fetchNextStateComboBoxData(menuId);
        console.log(nextStateComboDataSource);
        return nextStateComboDataSource;
        //nextStateComboBox.setDataSource(nextStateComboDataSource);
      } catch (error) {
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: "Failed to load data" + ": " + error,
          type: 'error',
        });
      }
    }
  },

  createActionData: function () {
    var action = new Object();

    action.WfactionId = $("#actionID").val() == '' ? '0' : $("#actionID").val();
    action.WfstateId = $("#stateID").val() == '' ? '0' : $("#stateID").val();
    action.ActionName = $("#txtActionName").val();
    action.StateName = "";
    //action.NextStateId = $("#cmbNextState").val() == '' ? '0' : $("#cmbNextState").val();
    action.NextStateId = parseInt($("#cmbNextState").val()) || null;
    action.NextStateName = "";
    action.AcSortOrder = $("#numSortOrder").val();
    if (action.AcSortOrder == "") {
      action.AcSortOrder = 0;
    }

    if ($("#chkIsEmail").is(':checked') == true) {
      action.EmailAlert = 1;
    } else {
      action.EmailAlert = 0;
    }
    if ($("#chkIsSms").is(':checked') == true) {
      action.SmsAlert = 1;
    } else {
      action.SmsAlert = 0;
    }

    //action.IsDefaultStart = "0";
    //action.IsClosed = "0";
    return action;
  },

  editItem: async function (item) {
    $("#btnActionSaveOrUpdate").text("Update Item");   
    $("#txtStateName_Action").val(item.StateName);
    $("#txtActionName").val(item.ActionName);
    $("#numSortOrder").val(item.AcSortOrder);
    $('#chkIsEmail').attr('checked', item.EmailAlert == 1 ? true : false);
    $('#chkIsSms').attr('checked', item.SmsAlert == 1 ? true : false);
    var nextStateComboBox = $("#cmbNextState").data("kendoComboBox");

    if (nextStateComboBox) {
      var nextStateComboBoxDataSource = await ActionDetailHelper.loadNextStateCombo(item.MenuId);
      nextStateComboBox.setDataSource(nextStateComboBoxDataSource.Data);
    }
    nextStateComboBox.value(item.NextStateId);

    $("#actionID").val(item.WfactionId);
  },

  clickEventForEditButton: function (event) {
    const gridInstance = $("#gridSummaryAction").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      ActionDetailHelper.editItem(selectedItem);
    }
  },

  clickEventForDeleteButton: function (event) {
    const gridInstance = $("#gridSummaryAction").data("kendoGrid");
    const gridRow = $(event.target).closest("tr");
    var selectedItem = gridInstance.dataItem(gridRow);
    if (gridInstance) {
      ActionDetailManager.deleteData(selectedItem);
    }
  },

}

