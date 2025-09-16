// <reference path="workflowdetail.js" />
// <reference path="statedetails.js" />
// <reference path="actiondetail.js" />


var WrokFlowSummaryManager = {

  getSummaryGridDataSource: function () {
    return VanillaApiCallManager.GenericGridDataSource({
      apiUrl: baseApi + "/workflow-summary",
      requestType: "POST",
      async: true,
      modelFields: {},
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Data.Items",
      schemaTotal: "Data.TotalCount",
      buttonCount: 3
    });
  }


};

var WorkFlowSummaryHelper = {

  initWorkFlowSummary: function () {
    this.initializeResponsiveGrid();
    this.bindResizeEvents();
  },

  initializeResponsiveGrid: function () {
    var columns = this.generateResponsiveColumns();
    var dataSource = WrokFlowSummaryManager.getSummaryGridDataSource();
    console.log(dataSource);
    $("#gridSummary").kendoGrid({
      dataSource: dataSource,
      height: this.calculateGridHeight(),
      width: "100%",
      scrollable: {
        virtual: false
      },
      resizable: true,
      sortable: true,
      filterable: true,
      pageable: {
        refresh: true,
        pageSizes: [10, 20, 50],
        buttonCount: 3
      },
      columns: columns,
      mobile: true,
      toolbar: this.getToolbarConfig(),
      dataBound: function () {
        WorkFlowSummaryHelper.adjustGridForMobile();
      }
    });
  },

  generateResponsiveColumns: function () {
    var isMobile = window.innerWidth < 768;

    var columns = [
      { field: "WfStateId", hidden: true },
      { field: "MenuId", hidden: true },
      { field: "IsClosed", hidden: true },
      { field: "Sequence", hidden: true },
      { field: "ModuleId", hidden: true },
      { field: "TotalCount", hidden: true },
      {
        field: "RowIndex", 
        title: "SL",
        width: isMobile ? 40 : 40,
        filterable: false, 
        attributes: {
          style: "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        }
      },
      {
        field: "StateName",
        title: "State Name",
        width: isMobile ? 120 : 200,
        attributes: {
          style: "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        }
      },
      {
        field: "MenuName", 
        title: "Menu Name",
        width: isMobile ? 120 : 180,
        hidden: isMobile,
        attributes: {
          style: "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        }
      },
      {
        field: "ModuleName",
        title: "Module",
        width: isMobile ? 100 : 150,
        hidden: isMobile,
        attributes: {
          style: "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        }
      },
      {
        field: "Sequence",
        title: "Sequence",
        width: isMobile ? 60 : 100,
        hidden: isMobile
      },
      {
        field: "IsDefaultStart",
        title: "Default",
        width: isMobile ? 60 : 80,
        template: "#= IsDefaultStart ? 'Yes' : 'No' #"
      },
      {
        field: "IsClosed",
        title: "Status",
        width: isMobile ? 60 : 80,
        template: "#= IsClosed == 1 ? 'Closed' : 'Open' #"
      },
      {
        field: "Action",
        title: "Actions",
        filterable: false,
        width: isMobile ? 100 : 220,
        template: this.getActionTemplate()
      }
    ];

    return columns;
  },

  getActionTemplate: function () {
    if (window.innerWidth < 768) {
      // Mobile dropdown menu - Fixed template with proper escaping
      return '<div class="dropdown">' +
        '<button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">' +
        'Actions' +
        '</button>' +
        '<ul class="dropdown-menu">' +
        '<li><a class="dropdown-item" href="javascript:void(0)" onclick="WorkFlowSummaryHelper.clickEventForViewButton(event)">View</a></li>' +
        '<li><a class="dropdown-item" href="javascript:void(0)" onclick="WorkFlowSummaryHelper.clickEventForEditButton(event)">Edit</a></li>' +
        '<li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="WorkFlowSummaryHelper.deleteItemFromGrid(event)">Delete</a></li>' +
        '</ul>' +
        '</div>';
    } else {
      // Desktop buttons - Fixed template
      return '<button class="btn btn-outline-success btn-action me-1" onclick="WorkFlowSummaryHelper.clickEventForViewButton(event)">View</button>' +
        '<button class="btn btn-outline-dark btn-action me-1" onclick="WorkFlowSummaryHelper.clickEventForEditButton(event)">Edit</button>' +
        '<button class="btn btn-outline-danger btn-action" onclick="WorkFlowSummaryHelper.deleteItemFromGrid(event)">Delete</button>';
    }
  },

  getToolbarConfig: function () {
    if (window.innerWidth < 768) {
      return ["excel"]; // Only Excel for mobile
    }
    return ["excel", "pdf",
      { template: '<button type="button" id="btnExportCsvWorkFlow" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }
    ];
  },

  calculateGridHeight: function () {
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;

    if (windowWidth < 576) {
      return 400; // Mobile
    } else if (windowWidth < 992) {
      return 450; // Tablet
    } else {
      return Math.min(600, windowHeight - 300); // Desktop
    }
  },

  adjustGridForMobile: function () {
    if (window.innerWidth < 768) {
      // Additional mobile adjustments
      $(".k-grid-toolbar").find(".k-button").addClass("btn-sm");
      $(".k-pager-wrap").addClass("k-pager-sm");
    }
  },

  bindResizeEvents: function () {
    var resizeTimer;
    $(window).on('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var grid = $("#gridSummary").data("kendoGrid");
        if (grid) {
          // Destroy and reinitialize for major changes
          if (window.innerWidth < 768 !== WorkFlowSummaryHelper.wasMobile) {
            grid.destroy();
            $("#gridSummary").empty();
            WorkFlowSummaryHelper.initializeResponsiveGrid();
            WorkFlowSummaryHelper.wasMobile = window.innerWidth < 768;
          } else {
            // Just resize for minor changes
            grid.resize();
          }
        }
      }, 250);
    });

    // Track mobile state
    this.wasMobile = window.innerWidth < 768;
  },

  _getGridItem: function (event) {
    const grid = $("#gridSummary").data("kendoGrid");
    const tr = $(event.target).closest("tr");
    return grid.dataItem(tr);
  },

  clickEventForViewButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      WorkFlowDetailsHelper.clearForm();
      const windowId = "WorkflowPopUp";
      CommonManager.openKendoWindow(windowId, "View Workflow", "80%");
      CommonManager.appandCloseButton(windowId);
      WorkFlowDetailsHelper.populateObject(item);
      CommonManager.MakeFormReadOnly("#WorkflowForm");
      $("#btnWorkflowSaveOrUpdate").prop("disabled", "disabled");
    }
  },

  clickEventForEditButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      console.log(item);
      WorkFlowDetailsHelper.clearForm();

      const ensureComboBoxInit = () => {
        const menuCombo = $("#cmbMenu").data("kendoComboBox");
        const isCloseCombo = $("#cmbIsClose").data("kendoComboBox");

        if (!menuCombo || !isCloseCombo) {
          StateDetailsHelper.initStateDetails();
          setTimeout(() => WorkFlowDetailsHelper.populateObject(item), 200);
        } else {
          WorkFlowDetailsHelper.populateObject(item);
        }
      };

      setTimeout(ensureComboBoxInit, 100);

      CommonManager.MakeFormEditable("#WorkflowForm");
    }
  },

  clickEventForDeleteButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      WorkflowDetailsManager.deleteItem(item);
    }
  },

};
