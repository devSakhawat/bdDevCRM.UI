/*=========================================================
 * Grid Helper
 * File: GridHelper.js
 * Description: Kendo Grid utilities and helpers
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var GridHelper = {

  /**
  * Initialize generic grid
  * @param {string} gridSelector - Grid container selector (id/class)
  * @param {Array} columns - Grid columns definition
  * @param {kendo.data.DataSource | Array} dataSource - Grid data source
  * @param {Object} options - Extra grid options
  */
 

  createGrid: function (gridId, dataSource, generateColumnsFunc, options = {}) {
    if (!generateColumnsFunc || typeof generateColumnsFunc !== 'function') {
      console.error('generateColumns function is required for grid:', gridId);
      return;
    }

    var columns = generateColumnsFunc();
    var totalColumnsWidth = GridHelper.calculateTotalColumnsWidth(columns);
    var containerWidth = $('#' + gridId).width() || (window.innerWidth - 323);
    var gridWidth = totalColumnsWidth > containerWidth ? '100%' : `${totalColumnsWidth}px`;

    var gridOptions = Object.assign({
      dataSource: dataSource,
      toolbar: options.toolbar || [],
      excel: options.excel || {},
      pdf: options.pdf || {},
      autoBind: true,
      navigatable: true,
      scrollable: true,
      resizable: true,
      width: gridWidth,
      filterable: true,
      sortable: true,
      pageable: options.pageable || {
        refresh: true,
        pageSizes: [10, 20, 50, 100],
        buttonCount: 5,
        input: false,
        numeric: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
      },
      columns: columns,
      editable: false,
      selectable: 'row'
    }, options.extraOptions || {});

    $('#' + gridId).kendoGrid(gridOptions);
    return $('#' + gridId).data('kendoGrid');
  },

  // Generic: Initialize any Kendo grid
  loadGrid: function (gridId, columns, dataSource = [], options = {}) {
    const $grid = $('#' + gridId);
    if ($grid.length === 0) return;

    const containerWidth = $grid.parent().width() || (window.innerWidth - 323);
    const totalColumnsWidth = columns.reduce((sum, col) => sum + (parseInt(col.width) || 100), 0);
    const gridWidth = totalColumnsWidth > containerWidth ? '100%' : totalColumnsWidth + 'px';

    const defaultOptions = {
      dataSource: dataSource,
      columns: columns,
      scrollable: true,
      resizable: true,
      filterable: true,
      sortable: true,
      pageable: {
        refresh: true,
        pageSizes: [20, 50, 100, 500, 1000],
        buttonCount: 5,
        numeric: true
      },
      toolbar: ["excel", "pdf", ...options.toolbar || []],
      width: gridWidth,
      editable: false,
      selectable: 'row',
      autoBind: true
    };

    $grid.kendoGrid($.extend(true, {}, defaultOptions, options));
  },
  
  // Get selected row from grid
  getSelectedRow: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (!grid) return null;
    
    const selectedRow = grid.select();
    if (!selectedRow || selectedRow.length === 0) return null;
    
    return grid.dataItem(selectedRow);
  },

  // Get all selected rows from grid
  getSelectedRows: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (!grid) return [];
    
    const selectedRows = grid.select();
    const items = [];
    
    selectedRows.each(function() {
      const dataItem = grid.dataItem(this);
      items.push(dataItem);
    });
    
    return items;
  },

  // Refresh grid
  refreshGrid: function (gridId) {
    const grid = $('#' + gridId).data('kendoGrid');
    if (grid && grid.dataSource) grid.dataSource.read();
  },

  // Clear grid selection
  clearSelection: function (gridId) {
    const grid = $('#' + gridId).data('kendoGrid');
    if (grid) grid.clearSelection();
  },

  goToPage: function (gridId, pageNumber) {
    const grid = $('#' + gridId).data('kendoGrid');
    if (grid && grid.dataSource) grid.dataSource.page(pageNumber);
  },

  getSelectedItem: function (gridId, event) {
    const grid = $('#' + gridId).data('kendoGrid');
    if (!grid) return null;
    const tr = $(event.target).closest('tr');
    return grid.dataItem(tr);
  },

  // Export grid to Excel
  exportToExcel: function(gridId, fileName = "Export") {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      grid.saveAsExcel();
    }
  },

  // Export grid to PDF
  exportToPDF: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      grid.saveAsPDF();
    }
  },

  // Get grid data
  getGridData: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (!grid) return [];
    return grid.dataSource.data();
  },

  // Get total records count
  getTotalCount: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (!grid) return 0;
    return grid.dataSource.total();
  },

  // Go to first page
  goToFirstPage: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      grid.dataSource.page(1);
    }
  },

  // Go to specific page
  goToPage: function(gridId, pageNumber) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      grid.dataSource.page(pageNumber);
    }
  },

  // Add new row to grid
  addRow: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      grid.addRow();
    }
  },

  // Remove row from grid
  removeRow: function(gridId, dataItem) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid && dataItem) {
      grid.dataSource.remove(dataItem);
    }
  },

  // Show loading indicator
  showLoading: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      kendo.ui.progress($("#" + gridId), true);
    }
  },

  // Hide loading indicator
  hideLoading: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      kendo.ui.progress($("#" + gridId), false);
    }
  },

  // Create action column template
  createActionColumn: function (config) {
    const {
      editCallback = null,
      deleteCallback = null,
      viewCallback = null,
      customButtons = [],
      idField = 'Id'  // ← Default primary key field name
    } = config;

    return function (dataItem) {
      const id = dataItem[idField];  // ← Primary key value

      let html = '<div class="btn-group btn-group" role="group">';

      if (viewCallback) {
        html += `<button type="button" class="btn btn-info btn" 
               onclick="${viewCallback}(${id})">
                <i class="fa fa-eye"></i> View
              </button>`;
      }

      if (editCallback) {
        html += `<button type="button" class="btn btn-primary btn" 
               onclick="${editCallback}(${id})">
                <i class="fa fa-edit"></i> Edit
              </button>`;
      }

      if (deleteCallback) {
        html += `<button type="button" class="btn btn-danger btn" 
               onclick="${deleteCallback}(${id})">
                <i class="fa fa-trash"></i> Delete
              </button>`;
      }

      // Custom buttons
      customButtons.forEach(btn => {
        html += `<button type="button" class="btn ${btn.class} btn" 
               onclick="${btn.callback}(${id})">
                <i class="${btn.icon}"></i>
              </button>`;
      });

      html += '</div>';
      return html;
    };
  },

  formatCurrency: function(value, currencySymbol = '$') {
    if (!value) return `${currencySymbol}0.00`;
    return `${currencySymbol}${parseFloat(value).toFixed(2)}`;
  },

  // Format date column
  formatDateColumn: function(value) {
    return DateHelper.formatDate(value);
  },

  // Format datetime column
  formatDateTimeColumn: function(value) {
    return DateHelper.formatDateTime(value);
  },

  // Format boolean column
  formatBooleanColumn: function(value) {
    return value ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-secondary">No</span>';
  },

  // Format status column
  formatStatusColumn: function(value) {
    const statusMap = {
      'Active': 'success',
      'Inactive': 'secondary',
      'Pending': 'warning',
      'Deleted': 'danger'
    };
    const badgeClass = statusMap[value] || 'secondary';
    return `<span class="badge badge-${badgeClass}">${value}</span>`;
  },

  generateToolbar(buttons = []) {
    // buttons = [{text, class, icon, onClick}]
    return buttons.map(btn => `<button type="button" class="btn ${btn.class}" onclick="${btn.onClick}"><i class="${btn.icon}"></i>${btn.text}</button>`);
  },

  bindGridEvent(gridSelector, event, callback) {
    const grid = $(gridSelector).data("kendoGrid");
    if (grid) grid.bind(event, callback);
  },

  calculateTotalColumnsWidth: function (columns) {
    let totalWidthOfTheGrid = 0;
    columns.forEach(column => {
      if (column.width != undefined && column.width && !column.hidden) {
        const widthValue = parseInt(column.width.toString().replace(/px|%/g, ''));
        if (!isNaN(widthValue)) {
          totalWidthOfTheGrid += widthValue;
        }
      }
      else if (!column.hidden && !column.width) {
        totalWidthOfTheGrid != 120;
      }

    });
    return totalWidthOfTheGrid;
  },
};


/*=========================================================
* Grid Helper (Generic)
* File: GridHelper.js
* Description: Kendo Grid utilities and helpers (Generic)
* Author: devSakhawat
* Date: 2025-11-15
=========================================================*/

const GridHelper23 = {

  /**
   * Initialize generic grid
   * @param {string} gridSelector - Grid container selector (id/class)
   * @param {Array} columns - Grid columns definition
   * @param {kendo.data.DataSource | Array} dataSource - Grid data source
   * @param {Object} options - Extra grid options
   */
  loadGrid(gridSelector, columns, dataSource = [], options = {}) {
    const $grid = $(gridSelector);
    if (!$grid.length) return;

    const containerWidth = $grid.parent().width() || (window.innerWidth - 323);
    const totalColumnsWidth = columns.reduce((sum, col) => sum + (parseInt(col.width) || 100), 0);
    const gridWidth = totalColumnsWidth > containerWidth ? '100%' : `${totalColumnsWidth}px`;

    const defaultOptions = {
      dataSource: dataSource,
      columns: columns,
      scrollable: true,
      resizable: true,
      filterable: true,
      sortable: true,
      pageable: {
        refresh: true,
        pageSizes: [10, 20, 30, 50, 100],
        buttonCount: 5,
        numeric: true
      },
      toolbar: [],
      width: gridWidth,
      editable: false,
      selectable: 'row',
      autoBind: true
    };

    $grid.kendoGrid($.extend(true, {}, defaultOptions, options));
  },

  getSelectedRow(gridSelector) {
    const grid = $(gridSelector).data("kendoGrid");
    if (!grid) return null;
    const selectedRow = grid.select();
    if (!selectedRow || selectedRow.length === 0) return null;
    return grid.dataItem(selectedRow);
  },

  getSelectedRows(gridSelector) {
    const grid = $(gridSelector).data("kendoGrid");
    if (!grid) return [];
    const selectedRows = grid.select();
    return selectedRows.map((_, tr) => grid.dataItem(tr)).get();
  },

  refreshGrid(gridSelector) {
    const grid = $(gridSelector).data("kendoGrid");
    if (grid) grid.dataSource.read();
  },

  clearSelection(gridSelector) {
    const grid = $(gridSelector).data("kendoGrid");
    if (grid) grid.clearSelection();
  },

  goToPage(gridSelector, pageNumber) {
    const grid = $(gridSelector).data("kendoGrid");
    if (grid) grid.dataSource.page(pageNumber);
  },

  showLoading(gridSelector) {
    kendo.ui.progress($(gridSelector), true);
  },

  hideLoading(gridSelector) {
    kendo.ui.progress($(gridSelector), false);
  },

  exportToExcel(gridSelector, fileName = 'Export.xlsx') {
    const grid = $(gridSelector).data("kendoGrid");
    if (grid) grid.saveAsExcel();
  },

  exportToPDF(gridSelector) {
    const grid = $(gridSelector).data("kendoGrid");
    if (grid) grid.saveAsPDF();
  },

  createActionColumn({ editCallback = null, deleteCallback = null, viewCallback = null, customButtons = [] }) {
    return function (dataItem) {
      let html = '<div class="btn-group btn-group" role="group">';
      if (viewCallback) html += `<button type="button" class="btn btn-info btn" onclick="${viewCallback}('${dataItem.uid}')"><i class="fa fa-eye"></i></button>`;
      if (editCallback) html += `<button type="button" class="btn btn-primary btn" onclick="${editCallback}('${dataItem.uid}')"><i class="fa fa-edit"></i></button>`;
      if (deleteCallback) html += `<button type="button" class="btn btn-danger btn" onclick="${deleteCallback}('${dataItem.uid}')"><i class="fa fa-trash"></i></button>`;
      customButtons.forEach(btn => {
        html += `<button type="button" class="btn ${btn.class} btn" onclick="${btn.callback}('${dataItem.uid}')"><i class="${btn.icon}"></i></button>`;
      });
      html += '</div>';
      return html;
    };
  },

  formatCurrency(value, currencySymbol = '$') {
    if (!value) return `${currencySymbol}0.00`;
    return `${currencySymbol}${parseFloat(value).toFixed(2)}`;
  },

  formatDateColumn(value) {
    return DateHelper.formatDate(value);
  },

  formatDateTimeColumn(value) {
    return DateHelper.formatDateTime(value);
  },

  formatBooleanColumn(value) {
    return value ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-secondary">No</span>';
  },

  formatStatusColumn(value) {
    const statusMap = { Active: 'success', Inactive: 'secondary', Pending: 'warning', Deleted: 'danger' };
    const badgeClass = statusMap[value] || 'secondary';
    return `<span class="badge badge-${badgeClass}">${value}</span>`;
  },

  generateToolbar(buttons = []) {
    // buttons = [{text, class, icon, onClick}]
    return buttons.map(btn => `<button type="button" class="btn ${btn.class}" onclick="${btn.onClick}"><i class="${btn.icon}"></i>${btn.text}</button>`);
  },

  bindGridEvent(gridSelector, event, callback) {
    const grid = $(gridSelector).data("kendoGrid");
    if (grid) grid.bind(event, callback);
  }
};
