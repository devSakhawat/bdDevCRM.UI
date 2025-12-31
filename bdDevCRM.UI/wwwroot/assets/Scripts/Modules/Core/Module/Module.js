/// <reference path="../../../config/appconfig.js" />
/// <reference path="../../../core/helpers/formhelper.js" />
/// <reference path="../../../core/helpers/gridhelper.js" />
/// <reference path="../../../core/managers/apicallmanager.js" />
/// <reference path="../../../core/managers/messagemanager.js" />
/// <reference path="../../../core/managers/appinitializer.js" />
/// <reference path="../../../core/moduleregistry.js" />
/// <reference path="../../../core/appinitializer.js" />

/*=========================================================
 * Menu Module (Complete CRUD with FormHelper)
 * File: Menu.js
 * Author: devSakhawat
 * Date: 2025-01-18
=========================================================*/

var Module = {

    // Configuration
    config: {
        gridId: 'gridSummaryModule',
        formId: 'moduleForm',
        modalId: 'ModulePopUp'
    },

    /**
     * Initialize module
     */
    init: function () {
        if (!this._checkDependencies()) {
            throw new Error('Module dependencies not satisfied');
        }

        this.initGrid();
        this.initModal();
        this.initForm();
    },

    /**
     * Check module dependencies
     */
    _checkDependencies: function () {
        var deps = {
            ModuleService: typeof ModuleService !== 'undefined',
            ApiCallManager: typeof ApiCallManager !== 'undefined',
            MessageManager: typeof MessageManager !== 'undefined',
            FormHelper: typeof FormHelper !== 'undefined',
            GridHelper: typeof GridHelper !== 'undefined'
        };

        for (var dep in deps) {
            if (!deps[dep]) {
                console.error('Missing dependency:', dep);
                return false;
            }
        }

        return true;
    },

    /**
     * Initialize Kendo Grid
     */
    initGrid: function () {
        const dataSource = ModuleService.getGridDataSource({});

        GridHelper.loadGrid(this.config.gridId, this.getColumns(), dataSource, {
            toolbar: [
                {
                    template: `<button type="button" onclick="Module.openCreateModal()" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">
                      <span class="k-icon k-i-plus"></span>
                      <span class="k-button-text">Create New</span>
                    </button>`
                }
            ],
            fileName: "ModuleList",
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
        return columns = [
            { field: "ModuleId", title: "ModuleId", width: 10, hidden: true },
            { field: "ModuleName", title: "Module Name", width: 60, },
            {
                field: "Actions",
                title: "Actions",
                width: 200,
                template: GridHelper.createActionColumn({
                    idField: 'ModuleId',
                    editCallback: 'Module.edit',
                    deleteCallback: 'Module.delete',
                    viewCallback: 'Module.view'
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
    },

    /**
     * Initialize Form with FormHelper
     */
    initForm: function () {
        FormHelper.initForm(this.config.formId);
        this.initComboBoxes();
    },

    /**
     * Initialize ComboBoxes
     */
    initComboBoxes: function () {        
        $('#' + this.config.isActive).kendoDropDownList({
            dataTextField: "text",
            dataValueField: "value",
            filter: "contains",
            optionLabel: "Select Status...",
            suggest: true,
            dataSource: [
                { text: "Active", value: 1 },
                { text: "Inactive", value: 0 }
            ]
        });

        this.loadModules();
    },

    /**
     * Load modules for dropdown
     */
    loadModules: async function () {
        try {
            const modules = await MenuService.getModules();
            const combo = $('#' + this.config.moduleComboId).data('kendoComboBox');
            if (combo) {
                combo.setDataSource(modules || []);
            }
        } catch (error) {
            console.error('Error loading modules:', error);
        }
    },

    /**
     * On module change - load parent menus
     */
    onModuleChange: async function (e) {
        const moduleId = e.sender.value();
        if (!moduleId) return;

        try {
            const menus = await MenuService.getMenusByModuleId(moduleId);
            const combo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');
            if (combo) {
                combo.setDataSource(menus || []);
            }
        } catch (error) {
            console.error('Error loading parent menus:', error);
        }
    },

    /**
     * Open modal for creating new module
     */
    openCreateModal: function () {
        this.clearForm();
        this.openModal('Create New Module');
        this.setFormMode('create');
    },

    view: async function (moduleId) {
        if (!moduleId || moduleId <= 0) {
            MessageManager.notify.warning('Invalid module ID');
            return;
        }

        try {
            // Data From Grid
            this.clearForm();
            const grid = $('#gridSummaryModule').data('kendoGrid');
            const dataItem = grid.dataSource.get(moduleId);
            if (dataItem) {
                Module.populateForm(dataItem);
                Module.openModal('View Module Details');
                Module.setFormMode('view');
            }
        } catch (error) {
            console.error('Error loading module:', error);
        }
    },

    /**
     * Edit module
     */
    edit: async function (menuId) {
        if (!menuId || menuId <= 0) {
            MessageManager.notify.warning('Invalid menu ID');
            return;
        }

        try {
            const grid = $('#gridSummaryMenu').data('kendoGrid');
            const dataItem = grid.dataSource.get(menuId);
            if (dataItem) {
                MenuModule.populateForm(dataItem);
                MenuModule.openModal('Edit Menu');
                MenuModule.setFormMode('edit');
            }
        } catch (error) {
            console.error('Error loading menu:', error);
        }
    },

    /**
     * Delete menu with confirmation
     */
    delete: async function (menuId) {
        if (!menuId || menuId <= 0) {
            MessageManager.notify.warning('Invalid menu ID');
            return;
        }

        MessageManager.confirm.delete('this menu', async () => {
            try {
                await MessageManager.loading.wrap(
                    MenuService.delete(menuId),
                    'Deleting menu...'
                );
                MessageManager.notify.success('Menu deleted successfully!');
                GridHelper.refreshGrid(MenuModule.config.gridId);
            } catch (error) {
                console.error('Delete error:', error);
            }
        });
    },

    /**
     * Save or update menu
     */
    saveOrUpdate: async function () {
        if (!this.validateForm()) {
            return;
        }

        //(Type-safe)
        const menuData = this.getFormData();
        console.log(menuData);
        //const menuData = this.getFormData();
        const isCreate = !menuData.MenuId || menuData.MenuId === 0;

        try {
            if (isCreate) {
                await MessageManager.loading.wrap(
                    MenuService.create(menuData),
                    'Creating menu...'
                );
                MessageManager.notify.success('Menu created successfully!');
            } else {
                await MessageManager.loading.wrap(
                    MenuService.update(menuData.MenuId, menuData),
                    'Updating menu...'
                );
                MessageManager.notify.success('Menu updated successfully!');
            }

            this.closeModal();
            GridHelper.refreshGrid(this.config.gridId);
        } catch (error) {
            console.error('Save/Update error:', error);
        }
    },

    /**
     * Open modal
     */
    openModal: function (title) {
        FormHelper.openKendoWindow(this.config.modalId, title || 'Menu Details', '80%', '90%');
    },

    /**
     * Close modal
     */
    closeModal: function () {
        FormHelper.closeKendoWindow(this.config.modalId);
    },

    /**
     * On modal close
     */
    onModalClose: function () {
        this.clearForm();
    },

    /**
     * Set form mode (create/edit/view)
     */
    setFormMode: function (mode) {
        const saveBtn = $('#btnMenuSaveOrUpdate');

        if (mode === 'view') {
            FormHelper.makeFormReadOnly('#' + this.config.formId);
            saveBtn.hide();
        } else {
            FormHelper.makeFormEditable('#' + this.config.formId);
            saveBtn.show();

            if (mode === 'create') {
                saveBtn.html('<span class="k-icon k-i-plus"></span> Add Menu');
            } else if (mode === 'edit') {
                saveBtn.html('<span class="k-icon k-i-check"></span> Update Menu');
            }
        }
    },

    /**
     * Clear form
     */
    clearForm: function () {
        FormHelper.clearFormFields('#' + this.config.formId);
        $('#hdMenuId').val(0);
        $('#hdSortOrder').val(0);

        const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
        const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');
        const isActiveCbo = $('#' + this.config.isActive).data('kendoDropDownList');

        if (moduleCbo) {
            moduleCbo.value('');
            moduleCbo.text('');
        }

        if (parentCbo) {
            parentCbo.value('');
            parentCbo.text('');
            parentCbo.setDataSource([]);
        }

        if (isActiveCbo) {
            isActiveCbo.value('');
            isActiveCbo.text('');
        }

        $('#chkIsQuickLink').prop('checked', false);
    },

    /**
     * Populate form with data
     */
    populateForm: function (data) {
        if (!data) return;
        this.clearForm();

        FormHelper.setFormData('#' + this.config.formId, data);

        const isActiveCbo = $('#' + this.config.isActive).data('kendoDropDownList');
        if (isActiveCbo && data.IsActive) {
            isActiveCbo.value(data.IsActive);
        }

        const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
        if (moduleCbo && data.ModuleId) {
            moduleCbo.value(data.ModuleId);
        }

        if (data.ModuleId) {
            MenuService.getMenusByModuleId(data.ModuleId).then(menus => {
                const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');
                if (parentCbo) {
                    parentCbo.setDataSource(menus || []);
                    if (data.ParentMenu) {
                        setTimeout(() => parentCbo.value(data.ParentMenu), 100);
                    }
                }
            });
        }
    },

    /**
     * Get form data
     */
    getFormData: function () {
        //Type-safe form data
        let formData = FormHelper.getFormDataTyped('menuForm');

        //Manual conversion for ComboBoxes
        const moduleCbo = $('#' + this.config.moduleComboId).data('kendoComboBox');
        const parentCbo = $('#' + this.config.parentMenuComboId).data('kendoComboBox');

        formData.ModuleId = moduleCbo ? parseInt(moduleCbo.value()) || 0 : 0;
        formData.ParentMenu = parentCbo ? parseInt(parentCbo.value()) || 0 : 0;

        //Ensure IsQuickLink is int (0 or 1)
        formData.IsQuickLink = formData.IsQuickLink ? 1 : 0;

        //Ensure IsActive is int
        formData.IsActive = parseInt(formData.IsActive) || 0;

        return formData;
    },

    /**
     * Validate form
     */
    validateForm: function () {
        if (!FormHelper.validate('#' + this.config.formId)) {
            return false;
        }

        const data = this.getFormData();

        if (!data.MenuName || data.MenuName.trim() === '') {
            MessageManager.notify.error('Menu name is required');
            $('#menu-name').focus();
            return false;
        }

        if (!data.ModuleId || data.ModuleId === 0) {
            MessageManager.notify.error('Please select a module');
            $('#' + this.config.moduleComboId).focus();
            return false;
        }

        return true;
    }
};

// Backward compatibility aliases
var ModuleDetailsManager = {
    saveOrUpdateItem: function () {
        MenuModule.saveOrUpdate();
    }
};

var ModuleDetailsHelper = {
    clearForm: function () {
        MenuModule.clearForm();
    },
    closeForm: function () {
        MenuModule.closeModal();
    }
};

if (typeof ModuleRegistry !== 'undefined') {
    ModuleRegistry.register('Module', Module, {
        dependencies: ['ModuleService', 'ApiCallManager', 'MessageManager', 'FormHelper', 'GridHelper'],
        priority: 5,
        autoInit: false, 
        route: AppConfig.getFrontendRoute("intModule") 
    });

    console.log('Module registered');
} else {
    console.error('ModuleRegistry not loaded!  Cannot register Module');
}


