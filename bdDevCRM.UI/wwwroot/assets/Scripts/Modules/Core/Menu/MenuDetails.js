/// <reference path="../../../core/managers/apicallmanager.js" />
/// <reference path="../../../core/managers/messagemanager.js" />
/// <reference path="../../services/module/menuservice.js" />
/// <reference path="../../common/common.js" />/>


var MenuDetails = {
  formId: "menuForm",
  saveBtn: "#btnSave",

  bindEvents: function () {
    var self = this;
    $(self.saveBtn).on("click", function () {
      if ($("#MenuId").val() === "" || $("#MenuId").val() === "0") {
        MenuService.save(self.formId, self.saveBtn, function () {
          MenuSummary.refresh();
        });
      } else {
        MenuService.update(self.formId, self.saveBtn, function () {
          MenuSummary.refresh();
        });
      }
    });
  },

  loadData: function (id) {
    MenuService.getById(id, function (res) {
      FormHelper.setFormData("menuForm", res);
    });
  }
};


var MenuDetailsManager = {
  fetchModuleComboBoxData: async function () {
    try { return await MenuService.getModules(); }
    catch (e) { console.error(e); return []; }
  },

  fetchMenuByModuleId: async function (moduleId) {
    try { return await MenuService.getMenusByModuleId(moduleId); }
    catch (e) { console.error(e); return []; }
  },

  saveOrUpdateItem: async function () {
    const menuData = MenuDetailsHelper.createItem();
    if (!menuData) return MessageManager.notify.error('Failed to create menu data');

    try {
      await MenuService.saveOrUpdate(menuData);
      FormHelper.clearForm('#divdetailsForDetails');
      CommonManager.closeKendoWindow('divDetails');
      MenuService.refreshGrid();
    } catch (error) { console.error(error); }
  },

  deleteItem: async function (gridItem) {
    if (!gridItem || !gridItem.MenuId) return MessageManager.notify.warning('Please select a menu to delete');
    try {
      await MenuService.delete(gridItem.MenuId, gridItem);
      FormHelper.clearForm('#divdetailsForDetails');
      MenuService.refreshGrid();
    } catch (error) { console.error(error); }
  }
};

var MenuDetailsHelper = {
  initMenuDetails: function () {
    CommonManager.initializeKendoWindow('#divDetails', 'Menu Details', '50%');
    this.generateModuleCombo();
    this.generateParentMenuCombo();
  },

  openMenuPopUp: function () {
    FormHelper.clearForm('#divdetailsForDetails');
    CommonManager.openKendoWindow('divDetails', 'Menu Details', '50%');
    CommonManager.appandCloseButton('divDetails');
  },

  generateModuleCombo: function () {
    const combo = $('#cmd-module').kendoComboBox({
      placeholder: 'Select Module...',
      dataTextField: 'ModuleName',
      dataValueField: 'ModuleId',
      filter: 'contains',
      suggest: true,
      dataSource: []
    }).data('kendoComboBox');

    combo.bind('change', async function () {
      const moduleId = combo.value();
      const parentCombo = $('#cmb-parent-menu').data('kendoComboBox');
      if (moduleId && moduleId != 0) {
        const data = await MenuDetailsManager.fetchMenuByModuleId(moduleId);
        parentCombo.setDataSource(data || []);
        parentCombo.value('');
        parentCombo.text('');
      } else {
        parentCombo.setDataSource([]);
        parentCombo.value('');
        parentCombo.text('');
      }
    });

    MenuDetailsManager.fetchModuleComboBoxData().then(data => combo.setDataSource(data || []));
  },

  generateParentMenuCombo: function () {
    $('#cmb-parent-menu').kendoComboBox({
      placeholder: 'Select Parent Menu...',
      dataTextField: 'MenuName',
      dataValueField: 'MenuId',
      filter: 'contains',
      suggest: true,
      dataSource: []
    });
  },

  clearForm: function () {
    FormHelper.clearForm('#divdetailsForDetails');
    $('#btnSave').text('+ Add Menu');
    $('#hdMenuId').val(0);
    $('#hdSorOrder').val(0);

    const moduleCbo = $('#cmd-module').data('kendoComboBox');
    const parentCbo = $('#cmb-parent-menu').data('kendoComboBox');
    if (moduleCbo) moduleCbo.value('');
    if (parentCbo) parentCbo.value('');
    $('#chkIsQuickLink').prop('checked', false);
  },

  createItem: function () {
    const moduleCbo = $('#cmd-module').data('kendoComboBox');
    const parentCbo = $('#cmb-parent-menu').data('kendoComboBox');

    return {
      MenuId: parseInt($('#hdMenuId').val() || 0),
      ModuleId: parseInt(moduleCbo?.value() || 0),
      ParentMenu: parseInt(parentCbo?.value() || 0),
      MenuName: $('#menu-name').val(),
      MenuPath: $('#menu-path').val(),
      ModuleName: moduleCbo?.text() || '',
      ParentMenuName: parentCbo?.text() || '',
      SortOrder: parseInt($('#hdSorOrder').val() || 0),
      IsQuickLink: $('#chkIsQuickLink').prop('checked')
    };
  },

  populateObject: function (item) {
    this.clearForm();
    $('#btnSave').text('Update Menu');
    $('#hdMenuId').val(item.MenuId);
    $('#hdSorOrder').val(item.SortOrder || 0);
    $('#menu-name').val(item.MenuName || '');
    $('#menu-path').val(item.MenuPath || '');
    $('#chkIsQuickLink').prop('checked', item.IsQuickLink);

    const setComboValues = async () => {
      const moduleCbo = $('#cmd-module').data('kendoComboBox');
      const parentCbo = $('#cmb-parent-menu').data('kendoComboBox');
      if (!moduleCbo || !parentCbo) return;

      const modules = await MenuDetailsManager.fetchModuleComboBoxData();
      moduleCbo.setDataSource(modules || []);
      moduleCbo.value(item.ModuleId);

      if (item.ModuleId) {
        const parents = await MenuDetailsManager.fetchMenuByModuleId(item.ModuleId);
        parentCbo.setDataSource(parents || []);
        parentCbo.value(item.ParentMenu);
      }
    };

    setTimeout(setComboValues, 100);
    FormHelper.makeFormEditable('#divdetailsForDetails');
  }
};















//// wwwroot/assets/Scripts/Modules/Menu/MenuDetails.js
///// <reference path="../../../core/managers/apicallmanager.js" />
///// <reference path="../../../core/managers/messagemanager.js" />
///// <reference path="../../services/module/menuservice.js" /> // Reference to MenuService
///// <reference path="../../common/common.js" /> // Reference to CommonManager for utilities

///*=========================================================
// * Menu Details Manager
// * File: MenuDetails.js
// * Description: Menu form management (uses MenuService)
// * Author: devSakhawat
// * Date: 2025-01-14
//=========================================================*/
//var MenuDetailsManager = {
//  /**
//   * Fetch module combo data (via MenuService)
//   */
//  fetchModuleComboBoxData: async function () {
//    try {
//      // Use MenuService if available
//      if (typeof MenuService !== 'undefined') {
//        return await MenuService.getModules();
//      }
//      // Fallback - This shouldn't be needed if MenuService works correctly
//      // return await ApiCallManager.get('/modules');
//    } catch (error) {
//      console.error('Error loading module data:', error);
//      return [];
//    }
//  },

//  /**
//   * Fetch menu combo data by Module ID (via MenuService)
//   */
//  fetchMenuByModuleId: async function (moduleId) {
//    try {
//      // Use MenuService if available
//      if (typeof MenuService !== 'undefined') {
//        return await MenuService.getMenusByModuleId(moduleId);
//      }
//      // Fallback - This shouldn't be needed if MenuService works correctly
//      // const baseUrl = typeof baseApi !== 'undefined' ? baseApi : '';
//      // return await ApiCallManager.get(`${baseUrl}/menus-by-moduleId/${moduleId}`);
//    } catch (error) {
//      console.error('Error loading menu data by module ID:', error);
//      return [];
//    }
//  },

//  /**
//   * Save or Update item (using MenuService)
//   */
//  saveOrUpdateItem: async function () {
//    const menuData = MenuDetailsHelper.createItem();
//    if (!menuData) {
//      MessageManager.notify.error('Failed to create menu data');
//      return;
//    }
//    try {
//      // Use MenuService with confirmation
//      await MenuService.saveOrUpdateWithConfirm(menuData, {
//        onSuccess: function () {
//          // Clear form
//          MenuDetailsHelper.clearForm();
//          // Close window
//          CommonManager.closeKendoWindow('divDetails'); // Assuming divDetails is the popup ID
//        }
//      });
//    } catch (error) {
//      // Error already handled by MenuService/ApiCallManager
//      console.error('Save/Update error:', error);
//    }
//  },

//  /**
//   * Delete item (using MenuService)
//   */
//  deleteItem: async function (gridItem) {
//    if (!gridItem || !gridItem.MenuId) {
//      MessageManager.notify.warning('Please select a menu to delete');
//      return;
//    }
//    try {
//      // Use MenuService with confirmation
//      await MenuService.deleteWithConfirm(gridItem.MenuId, gridItem, { // Pass the item data as well
//        onSuccess: function () {
//          // Clear form
//          MenuDetailsHelper.clearForm();
//        }
//      });
//    } catch (error) {
//      // Error already handled by MenuService/ApiCallManager
//      console.error('Delete error:', error);
//    }
//  }
//};

//var MenuDetailsHelper = {
//  initMenuDetails: function () {
//    // Initialize Kendo Window for details popup
//    CommonManager.initializeKendoWindow('#divDetails', 'Menu Details', '50%'); // Assuming divDetails is the popup ID

//    // Initialize Comboboxes
//    this.generateModuleCombo();
//    this.generateParentMenuCombo(); // Initialize with empty data source initially
//  },

//  openMenuPopUp: function () {
//    MenuDetailsHelper.clearForm();
//    const windowId = 'divDetails'; // Assuming divDetails is the popup ID
//    CommonManager.openKendoWindow(windowId, 'Menu Details', '50%');
//    CommonManager.appandCloseButton(windowId); // Append close button if needed
//  },

//  // --- Module Combo ---
//  generateModuleCombo: function () {
//    $('#cmd-module').kendoComboBox({
//      placeholder: 'Select Module...',
//      dataTextField: 'ModuleName', // Assuming API returns ModuleName
//      dataValueField: 'ModuleId', // Assuming API returns ModuleId
//      filter: 'contains',
//      suggest: true,
//      dataSource: [],
//      change: function (e) { // Add change event handler
//        const selectedModuleId = this.value();
//        console.log("Selected Module ID:", selectedModuleId);
//        if (selectedModuleId && selectedModuleId != 0) { // Check for valid ID
//          MenuDetailsManager.fetchMenuByModuleId(selectedModuleId)
//            .then(data => {
//              const parentMenuCombo = $('#cmb-parent-menu').data('kendoComboBox');
//              if (parentMenuCombo) {
//                parentMenuCombo.setDataSource(data || []);
//                // Clear parent menu selection when module changes
//                parentMenuCombo.value('');
//                parentMenuCombo.text('');
//              }
//            })
//            .catch(error => {
//              console.error('Error loading parent menus:', error);
//              const parentMenuCombo = $('#cmb-parent-menu').data('kendoComboBox');
//              if (parentMenuCombo) {
//                parentMenuCombo.setDataSource([]);
//                parentMenuCombo.value('');
//                parentMenuCombo.text('');
//              }
//            });
//        } else {
//          // If no module is selected, clear the parent menu combo
//          const parentMenuCombo = $('#cmb-parent-menu').data('kendoComboBox');
//          if (parentMenuCombo) {
//            parentMenuCombo.setDataSource([]);
//            parentMenuCombo.value('');
//            parentMenuCombo.text('');
//          }
//        }
//      }
//    });

//    const moduleComboBox = $('#cmd-module').data('kendoComboBox');
//    if (moduleComboBox) {
//      MenuDetailsManager.fetchModuleComboBoxData()
//        .then(data => {
//          moduleComboBox.setDataSource(data || []);
//        })
//        .catch(() => {
//          moduleComboBox.setDataSource([]);
//        });
//    }
//  },

//  // --- Parent Menu Combo ---
//  generateParentMenuCombo: function () {
//    $('#cmb-parent-menu').kendoComboBox({
//      placeholder: 'Select Parent Menu...',
//      dataTextField: 'MenuName', // Assuming API returns MenuName
//      dataValueField: 'MenuId', // Assuming API returns MenuId
//      filter: 'contains',
//      suggest: true,
//      dataSource: [] // Starts empty, populated based on module selection
//    });
//    // Initialization happens via the module combo change handler
//  },

//  refreshModuleCombo: function () {
//    this.generateModuleCombo();
//  },

//  refreshParentMenuCombo: function (moduleId) { // Accept module ID to re-populate parent menu
//    const parentMenuCombo = $('#cmb-parent-menu').data('kendoComboBox');
//    if (moduleId && moduleId > 0) {
//      MenuDetailsManager.fetchMenuByModuleId(moduleId)
//        .then(data => {
//          if (parentMenuCombo) {
//            parentMenuCombo.setDataSource(data || []);
//          }
//        })
//        .catch(() => {
//          if (parentMenuCombo) {
//            parentMenuCombo.setDataSource([]);
//          }
//        });
//    } else {
//      if (parentMenuCombo) {
//        parentMenuCombo.setDataSource([]);
//        parentMenuCombo.value('');
//        parentMenuCombo.text('');
//      }
//    }
//  },


//  clearForm: function () {
//    CommonManager.clearFormFields('#divdetailsForDetails'); // Assuming form ID is divdetailsForDetails
//    $('#btnSave').text('+ Add Menu'); // Assuming button ID is btnSave
//    $('#hdMenuId').val(0); // Assuming hidden ID field is hdMenuId
//    $('#hdSorOrder').val("0"); // Reset sort order
//    // Clear Combos
//    const moduleCombo = $('#cmd-module').data('kendoComboBox');
//    const parentMenuCombo = $('#cmb-parent-menu').data('kendoComboBox');
//    if (moduleCombo) {
//      moduleCombo.value('');
//      moduleCombo.text('');
//    }
//    if (parentMenuCombo) {
//      parentMenuCombo.value('');
//      parentMenuCombo.text('');
//    }
//    // Clear checkbox
//    $('#chkIsQuickLink').prop('checked', false); // Use prop() for checkboxes
//  },

//  createItem: function () {
//    const moduleCbo = $('#cmd-module').data('kendoComboBox');
//    const parentMenuCbo = $('#cmb-parent-menu').data('kendoComboBox');

//    const moduleId = CommonManager.getComboValue(moduleCbo, 0); // Default to 0 if not selected
//    const parentMenuId = CommonManager.getComboValue(parentMenuCbo, 0); // Default to 0 if not selected

//    var dto = {};
//    dto.MenuId = CommonManager.getInputValue('#hdMenuId', 0);
//    dto.ModuleId = moduleId;
//    dto.ParentMenu = parentMenuId;
//    dto.MenuName = CommonManager.getInputValue('#menu-name', ''); // Assuming input ID
//    dto.MenuPath = CommonManager.getInputValue('#menu-path', ''); // Assuming input ID
//    dto.ParentMenuName = CommonManager.getComboText(parentMenuCbo, ''); // Get text for display
//    dto.ModuleName = CommonManager.getComboText(moduleCbo, ''); // Get text for display
//    dto.SortOrder = CommonManager.getInputValue('#hdSorOrder', 0); // Assuming input ID for SortOrder
//    dto.IsQuickLink = document.querySelector('#chkIsQuickLink')?.checked || false; // Assuming checkbox ID
//    // Assuming a Status field exists, defaulting to true if not present
//    // dto.Status = document.querySelector('#chkStatusMenu')?.checked || true; // Uncomment if needed

//    return dto;
//  },

//  populateObject: function (item) {
//    this.clearForm();
//    $('#btnSave').text('Update Menu'); // Assuming button ID is btnSave
//    $('#hdMenuId').val(item.MenuId);
//    $('#hdSorOrder').val(item.SortOrder || 0);
//    $('#menu-name').val(item.MenuName || '');
//    $('#menu-path').val(item.MenuPath || '');
//    $('#chkIsQuickLink').prop('checked', item.IsQuickLink); // Use prop() for checkboxes

//    // Set Combos after ensuring data is loaded or set them up to load
//    const setComboValues = () => {
//      const moduleCombo = $('#cmd-module').data('kendoComboBox');
//      const parentMenuCombo = $('#cmb-parent-menu').data('kendoComboBox');

//      // Set Module Combo first
//      if (moduleCombo) {
//        if (moduleCombo.dataSource.total() > 0) {
//          moduleCombo.value(item.ModuleId);
//          // After setting module, load parent menus if needed
//          if (item.ModuleId && item.ModuleId > 0 && item.ParentMenu && item.ParentMenu > 0) {
//            MenuDetailsManager.fetchMenuByModuleId(item.ModuleId)
//              .then(data => {
//                if (parentMenuCombo) {
//                  parentMenuCombo.setDataSource(data);
//                  // Allow time for data to bind
//                  setTimeout(() => {
//                    parentMenuCombo.value(item.ParentMenu);
//                  }, 100);
//                }
//              })
//              .catch(() => {
//                if (parentMenuCombo) {
//                  parentMenuCombo.setDataSource([]);
//                  parentMenuCombo.value(item.ParentMenu); // Set value anyway, might not match
//                }
//              });
//          } else if (item.ParentMenu && item.ParentMenu > 0) {
//            // If no module ID is set but parent ID is, try to set parent anyway (might not match)
//            parentMenuCombo.value(item.ParentMenu);
//          }
//        } else {
//          // If dataSource is empty, load data first
//          MenuDetailsManager.fetchModuleComboBoxData().then(moduleData => {
//            if (moduleCombo) {
//              moduleCombo.setDataSource(moduleData);
//              moduleCombo.value(item.ModuleId);
//              // Now fetch parent menus based on the selected module
//              if (item.ModuleId && item.ModuleId > 0 && item.ParentMenu && item.ParentMenu > 0) {
//                MenuDetailsManager.fetchMenuByModuleId(item.ModuleId)
//                  .then(parentData => {
//                    if (parentMenuCombo) {
//                      parentMenuCombo.setDataSource(parentData);
//                      setTimeout(() => {
//                        parentMenuCombo.value(item.ParentMenu);
//                      }, 100);
//                    }
//                  })
//                  .catch(() => {
//                    if (parentMenuCombo) {
//                      parentMenuCombo.setDataSource([]);
//                      parentMenuCombo.value(item.ParentMenu); // Set value anyway
//                    }
//                  });
//              } else if (item.ParentMenu && item.ParentMenu > 0) {
//                // If no module ID is set but parent ID is, try to set parent anyway
//                if (parentMenuCombo) {
//                  parentMenuCombo.value(item.ParentMenu);
//                }
//              }
//            }
//          }).catch(() => {
//            if (moduleCombo) {
//              moduleCombo.setDataSource([]);
//            }
//            // Still try to set the value, might not match
//            if (parentMenuCombo) {
//              parentMenuCombo.value(item.ParentMenu);
//            }
//          });
//        }
//      }
//    };

//    // Set values with slight delay to ensure Combos are ready
//    setTimeout(setComboValues, 150);
//  }
//};
