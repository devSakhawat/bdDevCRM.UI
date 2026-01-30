/*=========================================================
 * WorkFlow Module
 * File: WorkFlow.js
 * Description: UI and interaction logic for WorkFlow module
 * Author: devSakhawat
 * Date: 2026-01-24
=========================================================*/

var WorkFlow = {

  /////////////////////////////////////////////////////////////
  // CONFIGURATION
  /////////////////////////////////////////////////////////////

  config: {
    // Tab IDs
    tabStripId: 'tabstrip',

    // Grid IDs
    summaryGridId: 'gridSummary',
    actionGridId: 'gridSummaryAction',

    // Form IDs
    stateFormId: 'WorkflowForm',

    // ComboBox IDs
    menuComboId: 'cmbMenu',
    isCloseComboId: 'cmbIsClose',
    nextStateComboId: 'cmbNextState',

    // Button IDs
    stateSaveButtonId: 'btnSaveOrUpdate',
    actionSaveButtonId: 'btnActionSaveOrUpdate',
    clearButtonId: 'btnClear'
  },

  /////////////////////////////////////////////////////////////
  // INITIALIZATION
  /////////////////////////////////////////////////////////////

  init: async function () {
    console.log('Initializing WorkFlow module...');

    try {
      // Initialize TabStrip
      this.initTabStrip();

      // Initialize Summary Grid
      this.initSummaryGrid();

      // Initialize State Form
      await this.initStateForm();

      // Initialize Action Form
      this.initActionForm();

      // Bind Events
      this.bindEvents();

      console.log('WorkFlow module initialized successfully');
    } catch (error) {
      console.error('Error initializing WorkFlow module:', error);
      MessageManager.notify.error('Failed to initialize WorkFlow module');
    }
  },

  /////////////////////////////////////////////////////////////
  // TAB STRIP
  /////////////////////////////////////////////////////////////

  initTabStrip: function () {
    $("#" + this.config.tabStripId).kendoTabStrip({
      select: (e) => {
        // Ensure only one tab has the 'k-state-active' class
        $("#" + this.config.tabStripId + " ul li").removeClass("k-state-active");
        $(e.item).addClass("k-state-active");
      }
    });

    var tabStrip = $("#" + this.config.tabStripId).data("kendoTabStrip");
    if (tabStrip) {
      tabStrip.select(0); // Select first tab
    }
  },

  /////////////////////////////////////////////////////////////
  // SUMMARY GRID
  /////////////////////////////////////////////////////////////

  initSummaryGrid: function () {
    const gridId = this.config.summaryGridId;

    const columns = this.getSummaryColumns();

    const gridOptions = {
      dataSource: this.getSummaryDataSource(),
      columns: columns,
      pageable: {
        refresh: true,
        pageSizes: [10, 20, 30, 50, 100],
        buttonCount: 5
      },
      filterable: true,
      sortable: true,
      resizable: true,
      scrollable: true,
      selectable: 'row',
      toolbar: ["excel", "pdf"],
      excel: {
        fileName: "WorkflowList_" + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + ".xlsx",
        filterable: true,
        allPages: true
      },
      pdf: {
        fileName: "Workflow_" + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + ".pdf",
        allPages: true
      },
      dataBound: () => {
        this.adjustGridForMobile();
      }
    };

    // Use GridHelper to initialize grid
    GridHelper.loadGrid(gridId, columns, this.getSummaryDataSource(), {
      ...gridOptions,
      heightConfig: {
        headerHeight: 60,
        footerHeight: 40,
        paddingBuffer: 20
      }
    });
  },

  getSummaryColumns: function () {
    const isMobile = window.innerWidth < 768;

    return [
      { field: "WfStateId", hidden: true },
      { field: "MenuId", hidden: true },
      { field: "IsClosed", hidden: true },
      { field: "Sequence", hidden: true },
      { field: "TotalCount", hidden: true },
      {
        field: "RowIndex",
        title: "SL",
        width: 50,
        filterable: false
      },
      {
        field: "StateName",
        title: "State Name",
        width: isMobile ? 150 : 200
      },
      {
        field: "MenuName",
        title: "Menu Name",
        width: isMobile ? 120 : 180,
        hidden: isMobile
      },
      {
        field: "Sequence",
        title: "Sequence",
        width: 100,
        hidden: isMobile
      },
      {
        field: "IsDefaultStart",
        title: "Default",
        width: 80,
        template: "#= IsDefaultStart ? 'Yes' : 'No' #"
      },
      {
        field: "ClosingStateName",
        title: "Status",
        width: 100,
        hidden: isMobile
      },
      {
        field: "Actions",
        title: "Actions",
        width: isMobile ? 100 : 220,
        filterable: false,
        template: (dataItem) => this.getSummaryActionTemplate(dataItem)
      }
    ];
  },

  getSummaryActionTemplate: function (dataItem) {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      return `
        <div class="dropdown">
          <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            Actions
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="WorkFlow.viewState(${dataItem.WfStateId})">View</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="WorkFlow.editState(${dataItem.WfStateId})">Edit</a></li>
            <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="WorkFlow.deleteState(${dataItem.WfStateId})">Delete</a></li>
          </ul>
        </div>
      `;
    } else {
      return `
        <button class="btn btn-outline-success btn-action me-1" onclick="WorkFlow.viewState(${dataItem.WfStateId})">View</button>
        <button class="btn btn-outline-dark btn-action me-1" onclick="WorkFlow.editState(${dataItem.WfStateId})">Edit</button>
        <button class="btn btn-outline-danger btn-action" onclick="WorkFlow.deleteState(${dataItem.WfStateId})">Delete</button>
      `;
    }
  },

  getSummaryDataSource: function () {
    return WorkFlowService.getWorkflowSummaryDataSource();
  },

  /////////////////////////////////////////////////////////////
  // STATE FORM
  /////////////////////////////////////////////////////////////

  initStateForm: async function () {
    // Initialize Menu ComboBox
    await this.initMenuComboBox();

    // Initialize IsClose ComboBox
    this.initIsCloseComboBox();
  },

  initMenuComboBox: async function () {
    const $combo = $("#" + this.config.menuComboId);

    $combo.kendoComboBox({
      placeholder: "Select Menu...",
      dataTextField: "MenuName",
      dataValueField: "MenuId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    // Load menu data
    try {
      const menus = await WorkFlowService.getMenusForDropdown();
      const comboBox = $combo.data("kendoComboBox");
      if (comboBox) {
        comboBox.setDataSource(menus);
      }
    } catch (error) {
      console.error('Error loading menus:', error);
    }
  },

  initIsCloseComboBox: function () {
    const $combo = $("#" + this.config.isCloseComboId);

    const data = [
      { ClosingStateName: "Select Closing Status", closingStateId: 0 },
      { ClosingStateName: "Open", closingStateId: 1 },
      { ClosingStateName: "Possible Close", closingStateId: 2 },
      { ClosingStateName: "Close", closingStateId: 3 },
      { ClosingStateName: "Destroyed", closingStateId: 4 },
      { ClosingStateName: "Draft", closingStateId: 5 },
      { ClosingStateName: "Deligated", closingStateId: 6 },
      { ClosingStateName: "Published", closingStateId: 7 },
      { ClosingStateName: "Extended", closingStateId: 8 }
    ];

    $combo.kendoDropDownList({
      dataTextField: "ClosingStateName",
      dataValueField: "closingStateId",
      dataSource: data,
      valuePrimitive: true,
      value: 0
    });
  },

  /////////////////////////////////////////////////////////////
  // ACTION FORM
  /////////////////////////////////////////////////////////////

  initActionForm: function () {
    // Initialize Next State ComboBox
    this.initNextStateComboBox();

    // Initialize Action Grid
    this.initActionGrid(0);
  },

  initNextStateComboBox: function () {
    const $combo = $("#" + this.config.nextStateComboId);

    $combo.kendoComboBox({
      placeholder: "Select Next State...",
      optionLabel: "Select Next State",
      dataTextField: "StateName",
      dataValueField: "WfStateId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });
  },

  /////////////////////////////////////////////////////////////
  // ACTION GRID
  /////////////////////////////////////////////////////////////

  initActionGrid: function (stateId) {
    const gridId = this.config.actionGridId;

    // Clear existing grid
    const existingGrid = $("#" + gridId).data("kendoGrid");
    if (existingGrid) {
      if (!stateId) {
        existingGrid.dataSource.data([]);
        return;
      } else {
        const newDataSource = this.getActionDataSource(stateId);
        existingGrid.setDataSource(newDataSource);
        return;
      }
    }

    // Create new grid
    const columns = this.getActionColumns();

    const gridOptions = {
      dataSource: stateId ? this.getActionDataSource(stateId) : [],
      columns: columns,
      pageable: false,
      scrollable: true,
      resizable: true,
      selectable: 'row',
      toolbar: ["excel"],
      excel: {
        fileName: "ActionList_" + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + ".xlsx"
      },
      dataBound: (e) => {
        this.adjustActionGridHeight(e);
      },
      noRecords: {
        template: "<div class='text-center p-4'><i class='fas fa-inbox fa-2x text-muted mb-2'></i><br><span class='text-muted'>No actions found</span></div>"
      }
    };

    GridHelper.loadGrid(gridId, columns, gridOptions.dataSource, {
      ...gridOptions,
      heightConfig: {
        headerHeight: 50,
        footerHeight: 40,
        paddingBuffer: 20
      }
    });
  },

  getActionColumns: function () {
    const isMobile = window.innerWidth < 768;

    return [
      { field: "WfActionId", hidden: true },
      { field: "WfStateId", hidden: true },
      { field: "NextStateId", hidden: true },
      {
        field: "ActionName",
        title: "Action Name",
        width: isMobile ? 120 : 200
      },
      {
        field: "NextStateName",
        title: "Next State",
        width: isMobile ? 100 : 180,
        hidden: isMobile
      },
      {
        field: "EmailAlert",
        title: "Email",
        width: 80,
        template: "#= EmailAlert == 1 ? 'Yes' : 'No' #"
      },
      {
        field: "SmsAlert",
        title: "SMS",
        width: 80,
        hidden: isMobile,
        template: "#= SmsAlert == 1 ? 'Yes' : 'No' #"
      },
      {
        field: "Actions",
        title: "Actions",
        width: isMobile ? 100 : 160,
        filterable: false,
        template: (dataItem) => this.getActionActionTemplate(dataItem)
      }
    ];
  },

  getActionActionTemplate: function (dataItem) {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      return `
        <div class="dropdown">
          <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            Actions
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="WorkFlow.editAction(${dataItem.WfActionId})">Edit</a></li>
            <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="WorkFlow.deleteAction(${dataItem.WfActionId})">Delete</a></li>
          </ul>
        </div>
      `;
    } else {
      return `
        <button class="btn btn-outline-dark btn-action me-1" onclick="WorkFlow.editAction(${dataItem.WfActionId})">Edit</button>
        <button class="btn btn-outline-danger btn-action" onclick="WorkFlow.deleteAction(${dataItem.WfActionId})">Delete</button>
      `;
    }
  },

  getActionDataSource: function (stateId) {
    return WorkFlowService.getActionSummaryDataSource(stateId);
  },

  adjustActionGridHeight: function (e) {
    const grid = e.sender;
    const totalItems = grid.dataSource.total();

    const headerHeight = 50;
    const rowHeight = 35;
    const toolbarHeight = 40;
    const borderPadding = 10;
    const minHeight = 150;

    let calculatedHeight;

    if (totalItems === 0) {
      calculatedHeight = minHeight;
      grid.wrapper.find(".k-grid-content").css("overflow-y", "hidden");
    } else if (totalItems <= 10) {
      calculatedHeight = headerHeight + (rowHeight * totalItems) + toolbarHeight + borderPadding;
      grid.wrapper.find(".k-grid-content").css("overflow-y", "hidden");
    } else {
      calculatedHeight = headerHeight + (rowHeight * 10) + toolbarHeight + borderPadding;
      grid.wrapper.find(".k-grid-content").css("overflow-y", "auto");
    }

    grid.wrapper.height(calculatedHeight);
    grid.wrapper.find(".k-grid-content").height(calculatedHeight - headerHeight);
    grid.resize();
  },

  /////////////////////////////////////////////////////////////
  // STATE CRUD OPERATIONS
  /////////////////////////////////////////////////////////////

  viewState: async function (stateId) {
    try {
      this.clearForm();

      // Fetch state data
      const state = await WorkFlowService.getStateById(stateId);

      // Populate form
      await this.populateStateForm(state);

      // Make form read-only
      FormHelper.setFormMode({
        formMode: 'view',
        formId: this.config.stateFormId,
        saveOrUpdateButtonId: this.config.stateSaveButtonId,
        clearButtonId: this.config.clearButtonId
      });

    } catch (error) {
      console.error('Error viewing state:', error);
      MessageManager.notify.error('Failed to load state details');
    }
  },

  editState: async function (stateId) {
    try {
      this.clearForm();

      // Fetch state data
      const state = await WorkFlowService.getStateById(stateId);

      // Populate form
      await this.populateStateForm(state);

      // Set form to edit mode
      FormHelper.setFormMode({
        formMode: 'edit',
        formId: this.config.stateFormId,
        saveOrUpdateButtonId: this.config.stateSaveButtonId,
        clearButtonId: this.config.clearButtonId,
        editButtonText: 'Update',
        editButtonIcon: 'fas fa-check'
      });

    } catch (error) {
      console.error('Error editing state:', error);
      MessageManager.notify.error('Failed to load state for editing');
    }
  },

  deleteState: async function (stateId) {
    try {
      // Get state details for confirmation message
      const state = await WorkFlowService.getStateById(stateId);

      MessageManager.confirm.delete(
        `State: ${state.StateName}`,
        async () => {
          try {
            await WorkFlowService.deleteState(stateId);

            // Clear form
            this.clearForm();

            // Refresh grid
            this.refreshSummaryGrid();

            // Show success message
            MessageManager.notify.success('Workflow state deleted successfully');

          } catch (error) {
            console.error('Error deleting state:', error);
          }
        }
      );

    } catch (error) {
      console.error('Error in delete state:', error);
    }
  },

  saveState: async function () {
    // Validate form
    if (!FormHelper.validate(this.config.stateFormId)) {
      MessageManager.notify.warning('Please fill all required fields');
      return;
    }

    // Get form data
    const stateData = this.prepareStateData();

    // Get state ID
    const stateId = $("#stateID").val() || 0;
    const isCreate = stateId == 0;

    // Confirmation
    const confirmMsg = isCreate ? 'Do you want to save this workflow state?' : 'Do you want to update this workflow state?';

    MessageManager.confirm.ask(
      'Confirmation',
      confirmMsg,
      async () => {
        try {
          if (isCreate) {
            await WorkFlowService.createState(stateData);
            MessageManager.notify.success('Workflow state created successfully');
          } else {
            await WorkFlowService.updateState(stateId, stateData);
            MessageManager.notify.success('Workflow state updated successfully');
          }

          // Clear form
          this.clearForm();

          // Refresh grid
          this.refreshSummaryGrid();

        } catch (error) {
          console.error('Error saving state:', error);
        }
      }
    );
  },

  prepareStateData: function () {
    const menuCombo = $("#" + this.config.menuComboId).data("kendoComboBox");
    const isCloseCombo = $("#" + this.config.isCloseComboId).data("kendoDropDownList");

    return {
      WFStateId: $("#stateID").val() || 0,
      StateName: $("#txtStateName").val(),
      MenuID: menuCombo.value(),
      MenuName: menuCombo.text(),
      Sequence: $("#txtSequenceNo").val(),
      IsClosed: isCloseCombo.value(),
      IsDefaultStart: $("#chkIsDefault").is(':checked')
    };
  },

  populateStateForm: async function (state) {
    $("#stateID").val(state.WfStateId);
    $("#txtStateName").val(state.StateName);
    $("#txtSequenceNo").val(state.Sequence);

    // Set Menu ComboBox
    const menuCombo = $("#" + this.config.menuComboId).data("kendoComboBox");
    if (menuCombo) {
      menuCombo.value(state.MenuId);
    }

    // Set IsClose DropDownList
    const isCloseCombo = $("#" + this.config.isCloseComboId).data("kendoDropDownList");
    if (isCloseCombo) {
      isCloseCombo.value(state.IsClosed);
    }

    // Set Default checkbox
    $("#chkIsDefault").prop('checked', state.IsDefaultStart);

    // Load Next State ComboBox for Actions
    const nextStateCombo = $("#" + this.config.nextStateComboId).data("kendoComboBox");
    if (nextStateCombo) {
      const nextStates = await WorkFlowService.getNextStatesByMenuId(state.MenuId);
      nextStateCombo.setDataSource(nextStates);
    }

    // Set state name in action section
    $("#txtStateName_Action").val(state.StateName);

    // Load action grid
    this.initActionGrid(state.WfStateId);
  },

  /////////////////////////////////////////////////////////////
  // ACTION CRUD OPERATIONS
  /////////////////////////////////////////////////////////////

  editAction: async function (actionId) {
    try {
      // Get current state ID
      const stateId = $("#stateID").val();
      if (!stateId || stateId <= 0) {
        MessageManager.notify.warning('Please select a workflow state first');
        return;
      }

      // Get all actions for the state
      const actions = await WorkFlowService.getActionsByStateId(stateId);

      // Find the action to edit
      const action = actions.find(a => a.WfActionId == actionId);
      if (!action) {
        MessageManager.notify.error('Action not found');
        return;
      }

      // Populate action form
      this.populateActionForm(action);

      // Change button text to "Update Item"
      $("#" + this.config.actionSaveButtonId).text("Update Item");

    } catch (error) {
      console.error('Error editing action:', error);
      MessageManager.notify.error('Failed to load action for editing');
    }
  },

  deleteAction: async function (actionId) {
    try {
      // Get current state ID
      const stateId = $("#stateID").val();
      if (!stateId || stateId <= 0) {
        MessageManager.notify.warning('Please select a workflow state first');
        return;
      }

      // Get all actions for the state
      const actions = await WorkFlowService.getActionsByStateId(stateId);

      // Find the action to delete
      const action = actions.find(a => a.WfActionId == actionId);
      if (!action) {
        MessageManager.notify.error('Action not found');
        return;
      }

      MessageManager.confirm.delete(
        `Action: ${action.ActionName}`,
        async () => {
          try {
            await WorkFlowService.deleteAction(actionId);

            // Clear action form
            this.clearActionForm();

            // Refresh action grid
            this.refreshActionGrid();

            // Show success message
            MessageManager.notify.success('Workflow action deleted successfully');

          } catch (error) {
            console.error('Error deleting action:', error);
          }
        }
      );

    } catch (error) {
      console.error('Error in delete action:', error);
    }
  },

  saveAction: async function () {
    // Get form data
    const actionData = this.prepareActionData();

    // Get action ID
    const actionId = $("#actionID").val() || 0;
    const isCreate = actionId == 0;

    // Confirmation
    const confirmMsg = isCreate ? 'Do you want to save this action?' : 'Do you want to update this action?';

    MessageManager.confirm.ask(
      'Confirmation',
      confirmMsg,
      async () => {
        try {
          if (isCreate) {
            await WorkFlowService.createAction(actionData);
            MessageManager.notify.success('Action created successfully');
          } else {
            await WorkFlowService.updateAction(actionId, actionData);
            MessageManager.notify.success('Action updated successfully');
          }

          // Clear action form
          this.clearActionForm();

          // Refresh action grid
          this.refreshActionGrid();

        } catch (error) {
          console.error('Error saving action:', error);
        }
      }
    );
  },

  prepareActionData: function () {
    const nextStateCombo = $("#" + this.config.nextStateComboId).data("kendoComboBox");

    return {
      WfactionId: $("#actionID").val() || 0,
      WfstateId: $("#stateID").val() || 0,
      ActionName: $("#txtActionName").val(),
      NextStateId: parseInt(nextStateCombo.value()) || null,
      AcSortOrder: $("#numSortOrder").val() || 0,
      EmailAlert: $("#chkIsEmail").is(':checked') ? 1 : 0,
      SmsAlert: $("#chkIsSms").is(':checked') ? 1 : 0
    };
  },

  populateActionForm: function (action) {
    $("#actionID").val(action.WfActionId);
    $("#txtActionName").val(action.ActionName);
    $("#numSortOrder").val(action.AcSortOrder);

    // Set Next State ComboBox
    const nextStateCombo = $("#" + this.config.nextStateComboId).data("kendoComboBox");
    if (nextStateCombo) {
      nextStateCombo.value(action.NextStateId);
    }

    // Set checkboxes
    $("#chkIsEmail").prop('checked', action.EmailAlert == 1);
    $("#chkIsSms").prop('checked', action.SmsAlert == 1);
  },

  /////////////////////////////////////////////////////////////
  // FORM OPERATIONS
  /////////////////////////////////////////////////////////////

  clearForm: function () {
    try {
      // Clear State Form
      this.clearStateForm();

      // Clear Action Form
      this.clearActionForm();

      // Reset Tab
      const tabStrip = $("#" + this.config.tabStripId).data("kendoTabStrip");
      if (tabStrip) {
        tabStrip.select(0);
      }

      // Set form to create mode
      FormHelper.setFormMode({
        formMode: 'create',
        formId: this.config.stateFormId,
        saveOrUpdateButtonId: this.config.stateSaveButtonId,
        clearButtonId: this.config.clearButtonId,
        createButtonText: 'Add Item',
        createButtonIcon: 'fas fa-plus'
      });

      console.log('Form cleared successfully');

    } catch (error) {
      console.error('Error clearing form:', error);
    }
  },

  clearStateForm: function () {
    $("#stateID").val(0);
    $("#txtStateName").val('');
    $("#txtSequenceNo").val('');

    const menuCombo = $("#" + this.config.menuComboId).data("kendoComboBox");
    if (menuCombo) {
      menuCombo.value('');
      menuCombo.text('');
    }

    const isCloseCombo = $("#" + this.config.isCloseComboId).data("kendoDropDownList");
    if (isCloseCombo) {
      isCloseCombo.value(0);
    }

    $("#chkIsDefault").prop('checked', false);

    // Clear action grid
    const actionGrid = $("#" + this.config.actionGridId).data("kendoGrid");
    if (actionGrid) {
      actionGrid.dataSource.data([]);
    }
  },

  clearActionForm: function () {
    $("#actionID").val(0);
    $("#txtActionName").val('');
    $("#numSortOrder").val(0);

    const nextStateCombo = $("#" + this.config.nextStateComboId).data("kendoComboBox");
    if (nextStateCombo) {
      nextStateCombo.value('');
      nextStateCombo.text('');
    }

    $("#chkIsEmail").prop('checked', false);
    $("#chkIsSms").prop('checked', false);

    $("#" + this.config.actionSaveButtonId).text("+ Add Item");
  },

  /////////////////////////////////////////////////////////////
  // GRID REFRESH
  /////////////////////////////////////////////////////////////

  refreshSummaryGrid: function () {
    GridHelper.refreshGrid(this.config.summaryGridId);
  },

  refreshActionGrid: function () {
    const stateId = $("#stateID").val();
    if (stateId && stateId > 0) {
      const grid = $("#" + this.config.actionGridId).data("kendoGrid");
      if (grid) {
        grid.dataSource.read();
      }
    }
  },

  /////////////////////////////////////////////////////////////
  // EVENT BINDING
  /////////////////////////////////////////////////////////////

  bindEvents: function () {
    const self = this;

    // State Save Button
    $("#" + this.config.stateSaveButtonId).off('click').on('click', function () {
      self.saveState();
    });

    // Action Save Button
    $("#" + this.config.actionSaveButtonId).off('click').on('click', function () {
      self.saveAction();
    });

    // Clear Button
    $("#" + this.config.clearButtonId).off('click').on('click', function () {
      self.clearForm();
    });
  },

  /////////////////////////////////////////////////////////////
  // UTILITY METHODS
  /////////////////////////////////////////////////////////////

  adjustGridForMobile: function () {
    if (window.innerWidth < 768) {
      $(".k-grid-toolbar").find(".k-button").addClass("btn-sm");
      $(".k-pager-wrap").addClass("k-pager-sm");
    }
  }
};

// Auto-initialize when DOM is ready
$(document).ready(function () {
  WorkFlow.init();
});

// Make available globally
if (typeof window !== 'undefined') {
  window.WorkFlow = WorkFlow;
  console.log('WorkFlow module initialized and available globally');
}