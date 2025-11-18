/// <reference path="../../../config/appconfig.js" />
/// <reference path="../../../core/helpers/formhelper.js" />
/// <reference path="../../../core/helpers/gridhelper.js" />
/// <reference path="../../../core/managers/apicallmanager.js" />
/// <reference path="../../../core/managers/messagemanager.js" />


var MenuModule = {
  init: function () {
    this.initGrid();
    this.initForm();
    this.bindEvents();
  },

  // Grid initialization
  initGrid: function () {
    const dataSource = ApiCallManager.createGridDataSource({
      endpoint: '/menu-summary',
      pageSize: 20
    });

    GridHelper.loadGrid('gridSummaryMenu', this.getColumns(), dataSource, {
      toolbar: [
        {
          template: '<button type="button" onclick="MenuModule.openNew()" class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">+ Create New</span></button>'
        }
      ],
      fileName: "Menu",
      heightConfig: {
        headerHeight: 65,
        footerHeight: 50,
        paddingBuffer: 30
      }
    });

    // Enable auto resize
    GridHelper.enableAutoResize('gridSummaryMenu', {
      headerHeight: 65,
      footerHeight: 50,
      paddingBuffer: 30
    });
  },

  getColumns: function () {
    return columns = [
      { field: "MenuId", title: "Menu Id", width: 0, hidden: true },
      { field: "ModuleId", title: "Module Id", width: 0, hidden: true },
      { field: "MenuPath", title: "Menu Path", width: 0, hidden: true },
      { field: "ParentMenu", title: "Parent Menu Id", width: 0, hidden: true },
      { field: "SortOrder", title: "Sort Order", width: 0, hidden: true },
      { field: "IsQuickLink", title: "Quick Link", width: 0, hidden: true },
      { field: "MenuCode", title: "Code", width: 0, hidden: true },
      { field: "MenuName", title: "Name", width: 140, headerAttributes: { style: "white-space: normal;" } },
      { field: "ParentMenuName", title: "Parent Menu", width: 140, headerAttributes: { style: "white-space: normal;" } },
      { field: "ModuleName", title: "Module Name", width: 120, headerAttributes: { style: "white-space: normal;" } },
      {
        field: "MenuType",
        title: "Type",
        width: 70,
        hidden: false,
        template: "#= data.MenuType == 1 ? 'Web' : data.MenuType == 2 ? 'App' : 'Both' #",
        headerAttributes: { style: "white-space: normal;" }
      },
      {
        field: "IsActive",
        title: "Status",
        width: 80,
        hidden: false,
        template: "#= data.IsActive == 1 ? 'Active' : 'Inactive' #",
        headerAttributes: { style: "white-space: normal;" }
      },
      {
        field: "Actions",
        title: "Actions",
        width: 200,
        template: GridHelper.createActionColumn({
          idField: 'MenuId',  // field value from gridDataSource.
          editCallback: 'MenuModule.edit',
          deleteCallback: 'MenuModule.delete',
          viewCallback: 'MenuModule.view'
        })
      }
    ];
  },

  // Form initialization
  initForm: function () {
    FormHelper.initForm('menuForm');
    this.loadComboBoxes();
  },

  loadComboBoxes: async function () {
    const modules = await MenuService.getModules();

    $('#cmbModule').kendoComboBox({
      dataSource: modules,
      dataTextField: 'ModuleName',
      dataValueField: 'ModuleId'
    });
  },

  // Event binding
  bindEvents: function () {
    $('#btnAdd').on('click', () => this.openNew());
    $('#btnSave').on('click', () => this.save());
    $('#btnCancel').on('click', () => this.cancel());
  },

  // Open new form
  openNew: function () {
    FormHelper.clearFormFields('menuForm');
    FormHelper.formShowGridHide('menuForm', 'menuGrid');
  },

  // View Menu
  view: function (menuId) {
    // Data From Grid
    const grid = $('#gridSummaryMenu').data('kendoGrid');
    const dataItem = grid.dataSource.get(menuId);  // ← ID দিয়ে data পাবেন

    if (dataItem) {
      // Details populate
      FormHelper.setFormData('detailsForm', dataItem);
      FormHelper.makeFormReadOnly('detailsForm');

      // window open
      FormHelper.openKendoWindow('detailsWindow', 'View Menu Details');
    }
  },

  // Edit menu
  edit: async function (id) {
    try {
      const menu = await MenuService.getMenuById(id);
      FormHelper.setFormData('menuForm', menu);
      FormHelper.formShowGridHide('menuForm', 'menuGrid');
    } catch (error) {
      // Error already handled by MenuService
    }
  },

  // Delete menu
  delete: async function (id) {
    MessageManager.confirm.delete('this menu', async () => {
      try {
        await MenuService.deleteMenu(id);
        GridHelper.refreshGrid('menuGrid');
      } catch (error) {
        // Error already handled by MenuService
      }
    });
  },

  // Save menu
  save: async function () {
    if (!FormHelper.validate('#menuForm')) return;

    const data = FormHelper.getFormData('menuForm');

    try {
      if (data.MenuId && data.MenuId > 0) {
        await MenuService.updateMenu(data);
      } else {
        await MenuService.createMenu(data);
      }

      this.cancel();
      GridHelper.refreshGrid('menuGrid');
    } catch (error) {
      // Error already handled by MenuService
    }
  },

  // Cancel and return to grid
  cancel: function () {
    FormHelper.clearFormFields('menuForm');
    FormHelper.formHideGridShow('menuForm', 'menuGrid');
  }
};

// Initialize
$(document).ready(() => MenuModule.init());


//**কাকে ব্যবহার করে:**
//- ✅ **MenuService** - API calls এর জন্য
//- ✅ **GridHelper** - Grid operations এর জন্য
//- ✅ **FormHelper** - Form operations এর জন্য
//- ✅ **MessageManager** - Confirmations এর জন্য

//---

//## **🔗 ডিপেন্ডেন্সি চেইন:**
//```
//Menu.js
//    ├─→ MenuService ─→ ApiCallManager ─→ AppConfig
//    │                 └─→ MessageManager
//    ├─→ GridHelper(Independent)
//    ├─→ FormHelper(Independent)
//    └─→ MessageManager










//// wwwroot/assets/Scripts/Modules/Menu/Menu.js
///// <reference path="../../../core/managers/apicallmanager.js" />
///// <reference path="../../../core/managers/messagemanager.js" />
///// <reference path="../../services/module/menuservice.js" /> // Reference to MenuService
///// <reference path="menudetails.js" /> // Reference to MenuDetails
///// <reference path="menuserverview.js" /> // Reference to MenuSummary

///*=========================================================
// * Menu Main
// * File: Menu.js
// * Description: Menu module initialization
// * Author: devSakhawat
// * Date: 2025-01-14
//=========================================================*/
//$(document).ready(function () {
//  // Check dependencies
//  if (typeof MenuService === 'undefined') {
//    console.error('MenuService not loaded! Please ensure MenuService.js is loaded before Menu.js');
//    return;
//  }
//  if (typeof ApiCallManager === 'undefined') {
//    console.error('ApiCallManager not loaded! Please ensure ApiCallManager.js is loaded');
//    return;
//  }
//  if (typeof MessageManager === 'undefined') {
//    console.error('MessageManager not loaded! Please ensure MessageManager.js is loaded');
//    return;
//  }

//  // Initialize components
//  try {
//    debugger; // Consider removing for production
//    MenuSummaryHelper.initMenuSummary();
//    //MenuDetailsHelper.initMenuDetails();
//    console.log('✅ Menu module initialized successfully');
//  } catch (error) {
//    console.error('❌ Error initializing Menu module:', error);
//    if (typeof MessageManager !== 'undefined') {
//      MessageManager.notify.error('Failed to initialize Menu module');
//    }
//  }
//});

//// Keep empty objects for backward compatibility if needed by other parts of the system
//var MenuManager = {};
//var MenuHelper = {};
