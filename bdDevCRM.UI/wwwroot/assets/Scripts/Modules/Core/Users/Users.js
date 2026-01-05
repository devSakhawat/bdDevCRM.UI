/// <reference path="../../../services/module/core/userservice.js" />
/*=========================================================
 * User Module (Complete CRUD with FormHelper)
 * File: User.js
 * Author: devSakhawat
 * Date: 2026-01-02
=========================================================*/

var User = {

  // Configuration
  config: {
    gridId: 'gridUserSummary',
    formId: 'userForm', // Assuming the main form container has this ID
    modalId: 'userDetailsModal', // Assuming there is a modal for user details
    // Summary Page ComboBoxes
    companyComboForSummaryId: 'cmbCompanyNameForSummary',
    // Details Page ComboBoxes and Fields
    companyComboId: 'cmbCompanyNameDetails',
    branchComboId: 'cmbBranchDetails',
    departmentComboId: 'cmbDepartmentNameDetails',
    employeeComboId: 'cmbEmployee',
    dashboardId: 'ddlCommonDashboard',
    isActiveCheckboxId: 'chkIsActive',
    accessParentCompanyCheckboxId: 'chkAccessAllSbu',
    hiddenUserIdId: 'hdnUserId',
    groupMembershipContainerId: 'checkboxGroup',
    // grid report 
    reportName: 'UserList'
  },

  /**
   * Initialize module
   */
  init: function () {
    debugger;
    this.initTab();
    this.initGrid();
    this.initSummaryComboBoxes();
    ////this.initModal();
    this.initForm();

    //// Initial population of company dropdowns
    this.populateCompanyComboForSummary();
    //this.populateCompanyComboForDetails();

    this.setGridDataSource();
    console.log('User Module initialized successfully');
  },

  initTab: function () {
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
      console.error("Kendo TabStrip is not initialized.");
    }
  },

  /**
   * Initialize Kendo Grid
   */
  initGrid: function () {
    // The dataSource will be set later when a company is selected
    GridHelper.loadGrid(this.config.gridId, this.getColumns(), [], {
      toolbar: [
        {
          template: `<button type="button" onclick="User.openCreateModal()" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">
                      <span class="k-icon k-i-plus"></span>
                      <span class="k-button-text">Create New User</span>
                    </button>`
        }
      ],
      fileName: this.config.reportName,
      heightConfig: {
        headerHeight: 65,
        footerHeight: 50,
        paddingBuffer: 30
      }
    });
  },

  /**
   * Get grid columns
   */
  getColumns: function () {
    return [
      { field: "UserId", hidden: true},
      { field: "UserName", title: "User Name", hidden: true},
      { field: "AccessParentCompany", hidden: true},
      { field: "EmployeeId", hidden: true},//HrRecordId
      { field: "CompanyId", hidden: true},
      { field: "Password", hidden: true},
      { field: "FailedLoginNo", hidden: true},
      { field: "IsExpired", hidden: true},
      { field: "LastLoginDate", hidden: true},
      { field: "CreatedDate", hidden: true},
      { field: "BranchId", hidden: true},
      { field: "DepartmentId", hidden: true},
      { field: "Employee_Id", title: "Employee Id", width: "250" },//EmployeeId in Employement
      { field: "LoginId", title: "Login ID", width: "200" },
      { field: "DepartmentName", title: "Department", width: "350" },
      { field: "DESIGNATIONNAME", title: "Designation", width: "350" },
      { field: "ShortName", title: "Short Name", width: "300" },//EmployeeId in Employement
      { field: "IsActive", title: "Is Active", width: "80", template: "#= IsActive ? 'Active' : 'Inactive' #" },
      {
        field: "ResetPassword", title: "Reset Password", filterable: false, width: "500",
        template: '<input type="button" class="k-button btn btn-outline-warning" value="Reset Password" id="btnResetPassword" />', sortable: false, exportable: false
      },
      {
        field: "Edit", title: "Edit", filterable: false, width: "300",
        template: '<input type="button" class="k-button btn btn-outline-dark" value="Edit" id="btnEdit" onClick="UserSummaryHelper.clickEventForEditButton(event)"  />', sortable: false, exportable: false
      },
      {
        field: "Actions",
        title: "Actions",
        width: 200,
        template: GridHelper.createActionColumn({
          idField: 'UserId',
          editCallback: 'User.edit',
          deleteCallback: 'User.delete',
          viewCallback: 'User.view'
        })
      }
    ];
  },

  /**
   * Initialize Kendo Window (Modal)
   */
  initModal: function () {
    const modal = $('#' + this.config.modalId);
    if (modal.length === 0) {
      console.error('Modal element not found:', this.config.modalId);
      return;
    }
    // FormHelper.initKendoWindow('#' + this.config.modalId, 'User Details', '80%', '90%');
  },

  /**
   * Initialize Form with FormHelper
   */
  initForm: function () {
    FormHelper.initForm(this.config.formId);
    this.initComboBoxes();
    this.initGroupMembership();
  },

  /**
   * Initialize ComboBoxes
   */
  initSummaryComboBoxes: function () {
    // User Summary Company ComboBox
    $('#' + this.config.companyComboForSummaryId).kendoComboBox({
      placeholder: "Select Company...",
      dataTextField: "CompanyName",
      dataValueField: "CompanyId",
      filter: "contains",
      suggest: true,
      dataSource: [],
      //change: this.onCompanyChange.bind(this)
    });
  },

  /**
   * Initialize ComboBoxes
   */
  initComboBoxes: function () {
    // Company ComboBox
    $('#' + this.config.companyComboId).kendoComboBox({
      placeholder: "Select Company...",
      dataTextField: "CompanyName",
      dataValueField: "CompanyId",
      filter: "contains",
      suggest: true,
      dataSource: [],
      change: this.onCompanyChange.bind(this)
    });

    // Branch ComboBox
    $('#' + this.config.branchComboId).kendoComboBox({
      placeholder: "All",
      dataTextField: "Branchname",
      dataValueField: "Branchid",
      filter: "contains",
      suggest: true,
      dataSource: [],
      change: this.onBranchChange.bind(this)
    });

    // Department ComboBox
    $('#' + this.config.departmentComboId).kendoComboBox({
      placeholder: "All",
      dataTextField: "DepartmentName",
      dataValueField: "DepartmentId",
      filter: "contains",
      suggest: true,
      dataSource: [],
      change: this.onDepartmentChange.bind(this)
    });

    // Employee ComboBox
    $('#' + this.config.employeeComboId).kendoComboBox({
      placeholder: "All",
      dataTextField: "FullName",
      dataValueField: "HrRecordId",
      filter: "contains",
      suggest: true,
      dataSource: []
    });

    // Dashboard DropDownList
    $('#' + this.config.dashboardId).kendoDropDownList({
      dataTextField: "text",
      dataValueField: "id",
      dataSource: [
        { id: 1, text: "CRM Home" },
        { id: 2, text: "Common Dashboard" },
        { id: 3, text: "CRM Dashboard" }
      ]
    });
  },

  /**
   * Initialize Group Membership Section
   */
  initGroupMembership: async function () {
    await this.loadGroups();
  },

  /**
   * Load companies for dropdowns
   */
  populateCompanyComboForSummary: async function () {
    try {
      const companies = await UserService.getMotherCompanies();
      const combo = $('#' + this.config.companyComboForSummaryId).data('kendoComboBox');
      if (combo) {
        combo.setDataSource(companies);
        // Set default company if available, e.g., from CurrentUser object
        // combo.value(CurrentUser.CompanyId);
      }
    } catch (error) {
      console.error('Error loading companies for summary:', error);
    }
  },

  populateCompanyComboForDetails: async function () {
    try {
      const companies = await UserService.getMotherCompanies();
      const combo = $('#' + this.config.companyComboId).data('kendoComboBox');
      if (combo) {
        combo.setDataSource(companies);
      }
    } catch (error) {
      console.error('Error loading companies for details:', error);
    }
  },

  /**
   * On company change - load branches and departments
   */
  onCompanyChange: async function (e) {
    const companyId = e.sender.value();
    if (!companyId) return;

    // Clear dependent combos
    this.clearComboBox(this.config.branchComboId);
    this.clearComboBox(this.config.departmentComboId);
    this.clearComboBox(this.config.employeeComboId);

    try {
      const [branches, departments] = await Promise.all([
        UserService.getBranchesByCompanyId(companyId),
        UserService.getDepartmentsByCompanyId(companyId)
      ]);

      const branchCombo = $('#' + this.config.branchComboId).data('kendoComboBox');
      if (branchCombo) branchCombo.setDataSource(branches);

      const deptCombo = $('#' + this.config.departmentComboId).data('kendoComboBox');
      if (deptCombo) deptCombo.setDataSource(departments);

    } catch (error) {
      console.error('Error loading branches/departments:', error);
    }
  },

  /**
   * On branch change - load employees
   */
  onBranchChange: async function (e) {
    const companyId = $('#' + this.config.companyComboId).data('kendoComboBox').value();
    const branchId = e.sender.value();
    const departmentId = $('#' + this.config.departmentComboId).data('kendoComboBox').value();
    this.loadEmployees(companyId, branchId || 0, departmentId || 0);
  },

  /**
   * On department change - load employees
   */
  onDepartmentChange: async function (e) {
    const companyId = $('#' + this.config.companyComboId).data('kendoComboBox').value();
    const branchId = $('#' + this.config.branchComboId).data('kendoComboBox').value();
    const departmentId = e.sender.value();
    this.loadEmployees(companyId, branchId || 0, departmentId || 0);
  },

  /**
   * Load employees based on filters
   */
  loadEmployees: async function (companyId, branchId, departmentId) {
    this.clearComboBox(this.config.employeeComboId);
    try {
      const employees = await UserService.getEmployeesByFilters(companyId, branchId, departmentId);
      const combo = $('#' + this.config.employeeComboId).data('kendoComboBox');
      if (combo) combo.setDataSource(employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  },

  /**
   * Load groups for group membership
   */
  loadGroups: async function () {
    try {
      const groups = await UserService.getGroups();
      const container = $('#' + this.config.groupMembershipContainerId);
      let html = "<div class='row'>";
      groups.forEach(group => {
        html += `
          <div class="col-12 mb-2">
            <div class="d-flex justify-content-between align-items-center border-bottom pb-1">
              <span>${group.GroupName}</span>
              <input type="checkbox" class="form-check-input"
                     id="chkGroup${group.GroupId}"
                     data-group-id="${group.GroupId}"
                     data-group-name="${group.GroupName}" />
            </div>
          </div>
        `;
      });
      html += "</div>";
      container.html(html);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  },

  /**
   * Open modal for creating new user
   */
  openCreateModal: function () {
    this.clearForm();
    FormHelper.openKendoWindow(this.config.modalId, 'Create New User', '80%', '90%');
    this.setFormMode('create');
  },

  /**
   * Edit user
   */
  edit: async function (userId) {
    if (!userId || userId <= 0) {
      MessageManager.notify.warning('Invalid user ID');
      return;
    }

    try {
      const grid = $('#' + this.config.gridId).data('kendoGrid');
      const dataItem = grid.dataSource.get(userId);
      if (dataItem) {
        await this.populateForm(dataItem);
        FormHelper.openKendoWindow(this.config.modalId, 'Edit User', '80%', '90%');
        this.setFormMode('edit');
      }
    } catch (error) {
      console.error('Error loading user for edit:', error);
    }
  },

  /**
   * Reset user password with confirmation
   */
  resetPassword: async function (userId) {
    if (!userId || userId <= 0) {
      MessageManager.notify.warning('Invalid user ID');
      return;
    }

    // Get company ID from the grid row
    const grid = $('#' + this.config.gridId).data('kendoGrid');
    const dataItem = grid.dataSource.get(userId);
    const companyId = dataItem.CompanyId;

    MessageManager.confirm.delete('the password for this user', async () => {
      try {
        await MessageManager.loading.wrap(
          UserService.resetPassword(companyId, userId),
          'Resetting password...'
        );
        MessageManager.notify.success('Password reset successfully!');
      } catch (error) {
        console.error('Reset password error:', error);
      }
    });
  },

  /**
   * Save or update user
   */
  saveOrUpdate: async function () {
    const userData = this.getFormData();
    const isCreate = !userData.UserId || userData.UserId === 0;

    if (!this.validateForm(userData)) {
      return;
    }

    try {
      if (isCreate) {
        await MessageManager.loading.wrap(
          UserService.create(userData),
          'Creating user...'
        );
        MessageManager.notify.success('User created successfully!');
      } else {
        await MessageManager.loading.wrap(
          UserService.update(userData.UserId, userData),
          'Updating user...'
        );
        MessageManager.notify.success('User updated successfully!');
      }

      this.closeModal();
      this.refreshGrid();
    } catch (error) {
      console.error('Save/Update error:', error);
    }
  },

  /**
   * Close modal
   */
  closeModal: function () {
    FormHelper.closeKendoWindow(this.config.modalId);
  },

  /**
   * Refresh the grid
   */
  refreshGrid: function () {
    GridHelper.refreshGrid(this.config.gridId);
  },

  /**
   * Set grid data source based on selected company
   */
  setGridDataSource: function () {
    debugger;
    let companyId = 0;
    const combo = $('#' + this.config.companyComboForSummaryId).data('kendoComboBox');
    if (combo && combo.value() !== '') {
      const parsed = parseInt(combo.value(), 10);
      companyId = (parsed > 0) ? parsed : 0;
    }

    const grid = $("#" + this.config.gridId).data("kendoGrid");
    if (grid) {
      const ds = UserService.getSummaryGridDataSource(companyId);

      // Add data source error handling
      ds.bind("error", function (error) {
        ApiCallManager._handleError(error);
      });

      // Add data source success handling
      ds.bind("requestEnd", function (e) {
        console.log(ds);
        if (e.response && e.response.isSuccess === false) {
          ApiCallManager._handleError(error);
        }
      });

      grid.setDataSource(ds);
    }
  },

  /**
   * Set form mode (create/edit/view)
   */
  setFormMode: function (mode) {
    const saveBtn = $('#btnSave'); // Assuming the save button has this ID

    if (mode === 'view') {
      FormHelper.makeFormReadOnly('#' + this.config.formId);
      saveBtn.hide();
    } else {
      FormHelper.makeFormEditable('#' + this.config.formId);
      saveBtn.show();

      if (mode === 'create') {
        saveBtn.html('<span class="k-icon k-i-plus"></span> Add User');
      } else if (mode === 'edit') {
        saveBtn.html('<span class="k-icon k-i-check"></span> Update User');
      }
    }
  },

  /**
   * Clear form
   */
  clearForm: function () {
    FormHelper.clearFormFields('#' + this.config.formId);
    $('#' + this.config.hiddenUserIdId).val(0);

    this.clearComboBox(this.config.companyComboId);
    this.clearComboBox(this.config.branchComboId);
    this.clearComboBox(this.config.departmentComboId);
    this.clearComboBox(this.config.employeeComboId);

    const dashboardDdl = $('#' + this.config.dashboardId).data('kendoDropDownList');
    if (dashboardDdl) dashboardDdl.value(1);

    $('#' + this.config.isActiveCheckboxId).prop('checked', false);
    $('#' + this.config.accessParentCompanyCheckboxId).prop('checked', false);

    // Clear group checkboxes
    $('#' + this.config.groupMembershipContainerId + ' input[type="checkbox"]').prop('checked', false);
  },

  /**
   * Helper to clear a Kendo ComboBox
   */
  clearComboBox: function (comboId) {
    const combo = $('#' + comboId).data('kendoComboBox');
    if (combo) {
      combo.value('');
      combo.text('');
      combo.setDataSource([]);
    }
  },

  /**
   * Populate form with data
   */
  populateForm: async function (data) {
    if (!data) return;
    this.clearForm();

    // Set basic fields
    FormHelper.setFormData('#' + this.config.formId, data);
    $('#' + this.config.hiddenUserIdId).val(data.UserId);

    // Set checkbox values
    $('#' + this.config.isActiveCheckboxId).prop('checked', data.IsActive);
    $('#' + this.config.accessParentCompanyCheckboxId).prop('checked', data.AccessParentCompany);

    // Set dropdowns in a cascading manner
    const companyCbo = $('#' + this.config.companyComboId).data('kendoComboBox');
    if (companyCbo) companyCbo.value(data.CompanyId);

    // Trigger the change to load branches/departments
    await this.onCompanyChange({ sender: companyCbo });

    const branchCbo = $('#' + this.config.branchComboId).data('kendoComboBox');
    if (branchCbo) branchCbo.value(data.BranchId);

    const deptCbo = $('#' + this.config.departmentComboId).data('kendoComboBox');
    if (deptCbo) deptCbo.value(data.DepartmentId);

    // Load employees after setting branch/dept
    await this.loadEmployees(data.CompanyId, data.BranchId, data.DepartmentId);
    const empCbo = $('#' + this.config.employeeComboId).data('kendoComboBox');
    if (empCbo) empCbo.value(data.EmployeeId);

    const dashboardDdl = $('#' + this.config.dashboardId).data('kendoDropDownList');
    if (dashboardDdl) dashboardDdl.value(data.DefaultDashboard);

    // Populate group memberships
    await this.populateGroupMembers(data.UserId);
  },

  /**
   * Populate group member checkboxes for a user
   */
  populateGroupMembers: async function (userId) {
    try {
      const memberGroups = await UserService.getGroupMembersByUserId(userId);
      memberGroups.forEach(member => {
        $(`#chkGroup${member.GroupId}`).prop('checked', true);
      });
    } catch (error) {
      console.error('Error populating group members:', error);
    }
  },

  /**
   * Get form data
   */
  getFormData: function () {
    let formData = FormHelper.getFormDataTyped(this.config.formId);

    // Manual conversion for ComboBoxes
    const companyCbo = $('#' + this.config.companyComboId).data('kendoComboBox');
    const branchCbo = $('#' + this.config.branchComboId).data('kendoComboBox');
    const deptCbo = $('#' + this.config.departmentComboId).data('kendoComboBox');
    const empCbo = $('#' + this.config.employeeComboId).data('kendoComboBox');

    formData.CompanyId = companyCbo ? parseInt(companyCbo.value()) || 0 : 0;
    formData.BranchId = branchCbo ? parseInt(branchCbo.value()) || 0 : 0;
    formData.DepartmentId = deptCbo ? parseInt(deptCbo.value()) || 0 : 0;
    formData.EmployeeId = empCbo ? parseInt(empCbo.value()) || 0 : 0;

    // Get checkbox values
    formData.IsActive = $('#' + this.config.isActiveCheckboxId).is(':checked');
    formData.AccessParentCompany = $('#' + this.config.accessParentCompanyCheckboxId).is(':checked') ? 1 : 0;

    // Get selected groups
    formData.GroupMembers = [];
    $('#' + this.config.groupMembershipContainerId + ' input[type="checkbox"]:checked').each(function () {
      formData.GroupMembers.push({
        GroupId: parseInt($(this).data('group-id')),
        GroupName: $(this).data('group-name')
      });
    });

    return formData;
  },

  /**
   * Validate form
   */
  validateForm: function (formData) {
    if (!FormHelper.validate('#' + this.config.formId)) {
      return false;
    }

    if (!formData.UserName || formData.UserName.trim() === '') {
      MessageManager.notify.error('User name is required');
      $('#txtUserName').focus();
      return false;
    }

    if (!formData.CompanyId || formData.CompanyId === 0) {
      MessageManager.notify.error('Please select a company');
      $('#' + this.config.companyComboId).focus();
      return false;
    }

    // Add password validation for create mode
    const userId = $('#' + this.config.hiddenUserIdId).val();
    if (!userId || userId === 0) {
      const password = $('#txtNewPassword').val();
      const confirmPassword = $('#txtConfirmPassword').val();
      if (!password) {
        MessageManager.notify.error('Password is required');
        return false;
      }
      if (password !== confirmPassword) {
        MessageManager.notify.error('Password and Confirm Password do not match');
        return false;
      }
    }

    return true;
  }
};

// Register with ModuleRegistry
if (typeof ModuleRegistry !== 'undefined') {
  ModuleRegistry.register('User', User, {
    dependencies: ['UserService', 'ApiCallManager', 'MessageManager', 'FormHelper', 'GridHelper'],
    priority: 5,
    autoInit: false,
    route: AppConfig.getFrontendRoute("intUser") // Assuming a route for user pages
  });

  console.log('User registered');
} else {
  console.error('ModuleRegistry not loaded! Cannot register User');
}