/*=========================================================
 * Grid Helper
 * File: GridHelper.js
 * Description: Kendo Grid utilities with dynamic height
 * Author: devSakhawat
 * Date: 2025-01-18
=========================================================*/

var GridHelper = {

  /**
   * Calculate dynamic grid height based on window size
   */
  calculateGridHeight: function (options = {}) {
    const headerHeight = options.headerHeight || 65;
    const footerHeight = options.footerHeight || 40;
    const paddingBuffer = options.paddingBuffer || 0; //30;
    const toolbarHeight = options.toolbarHeight || 0;// 40;
    const pagerHeight = options.pagerHeight || 0; // 30;

    const availableHeight = window.innerHeight
      - headerHeight
      - footerHeight
      - paddingBuffer
      - toolbarHeight
      - pagerHeight;

    return availableHeight > 300 ? availableHeight : 300; // Minimum 300px
  },

  /**
  * Calculate actual content height based on data rows
  * @param {number} rowCount - Number of rows in grid
  * @param {number} rowHeight - Height per row (default: 40px)
  * @param {number} headerHeight - Grid header height (default: 40px)
  * @param {number} pagerHeight - Pager height (default: 50px)
  * @param {number} toolbarHeight - Toolbar height (default: 40px)
  * @returns {number} Calculated height in pixels
  */

  /**
   * Calculate actual content height based on data rows
   */
  calculateContentHeight: function (rowCount, options = {}) {
    const rowHeight = options.rowHeight || 40;
    const headerHeight = options.gridHeaderHeight || 40;
    const pagerHeight = options.pagerHeight || 50;
    const toolbarHeight = options.toolbarHeight || 40;
    const minHeight = options.minHeight || 300;

    // Total content height
    const contentHeight = (rowCount * rowHeight) + headerHeight + pagerHeight + toolbarHeight + 20;

    return contentHeight < minHeight ? minHeight : contentHeight;
  },


  /**
  * Get optimal grid height
  */
  getOptimalGridHeight: function (rowCount, heightConfig = {}) {
    const windowBasedHeight = this.calculateGridHeight(heightConfig);
    const contentBasedHeight = this.calculateContentHeight(rowCount, heightConfig);

    // Return the smaller height to avoid empty space
    return Math.min(windowBasedHeight, contentBasedHeight);
  },

  /**
     * Auto adjust grid height on window resize
     */
  enableAutoResize: function (gridId, heightConfig = {}) {
    const selector = gridId.startsWith('#') ? gridId : '#' + gridId;
    let resizeTimer;
    $(window).on('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const grid = $(selector).data('kendoGrid');
        if (grid) {
          const rowCount = grid.dataSource.total();
          const optimalHeight = this.getOptimalGridHeight(rowCount, heightConfig);

          const wrapper = grid.wrapper;
          if (wrapper) {
            wrapper.height(optimalHeight);

            const content = wrapper.find('.k-grid-content');
            if (content.length > 0) {
              const headerHeight = wrapper.find('.k-grid-header').outerHeight() || 40;
              const pagerHeight = wrapper.find('.k-grid-pager').outerHeight() || 50;
              const toolbarHeight = wrapper.find('.k-grid-toolbar').outerHeight() || 0;

              const contentHeight = optimalHeight - headerHeight - pagerHeight - toolbarHeight;
              content.height(contentHeight);
            }
          }
        }
      }, 250);
    });
  },

  /**
  * Update grid height after data load
  */
  updateGridHeightAfterDataBound: function (gridId, heightConfig = {}) {
    const grid = $('#' + gridId).data('kendoGrid');
    if (!grid) return;

    grid.bind('dataBound', function (e) {
      const rowCount = e.sender.dataSource.total();
      const optimalHeight = GridHelper.getOptimalGridHeight(rowCount, heightConfig);
      //e.sender.setOptions({ height: optimalHeight });
    });
  },

  /**
     * Initialize generic grid with FIXED height (will update after data loads)
     */
  loadGrid: function (gridId, columns, dataSource = [], options = {}) {
    const selector = gridId.startsWith('#') ? gridId : '#' + gridId;
    const $grid = $(selector);
    if ($grid.length === 0) {
      console.error('Grid element not found:', gridId);
      return;
    }

    const containerWidth = $grid.parent().width() || (window.innerWidth - 323);
    const totalColumnsWidth = columns.reduce((sum, col) => sum + (parseInt(col.width) || 100), 0);
    const gridWidth = totalColumnsWidth > containerWidth ? '100%' : totalColumnsWidth + 'px';

    const initialHeight = this.calculateGridHeight(options.heightConfig || {});

    const defaultExports = ["excel", "pdf"];
    const finalToolbar = Array.isArray(options.toolbar) ? options.toolbar.concat(defaultExports) : defaultExports;

    const defaultOptions = {
      pdf: {
        fileName: (options.fileName || gridId) + "_" + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + ".pdf",
        allPages: true,
      },
      excel: {
        fileName: (options.fileName || gridId) + "_" + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + ".xlsx",
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
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
      toolbar: finalToolbar || ["pdf", "excel"],
      height: initialHeight,
      width: gridWidth,
      editable: false,
      selectable: 'row',
      autoBind: true
    };

    const finalOptions = $.extend(true, {}, defaultOptions, options);
    delete finalOptions.heightConfig;
    delete finalOptions.fileName;

    // ✅ Initialize grid
    $grid.kendoGrid(finalOptions);

    // ✅ Get grid instance
    const grid = $grid.data('kendoGrid');

    if (grid) {
      // ✅ Bind dataBound event to adjust height AFTER data loads
      grid.bind('dataBound', function (e) {
        const rowCount = e.sender.dataSource.total();
        const heightConfig = options.heightConfig || {};

        // Calculate optimal height
        const optimalHeight = GridHelper.getOptimalGridHeight(rowCount, heightConfig);

        // ✅ Use wrapper element to set height
        const wrapper = e.sender.wrapper;
        if (wrapper) {
          wrapper.height(optimalHeight);

          // Also adjust content area
          const content = wrapper.find('.k-grid-content');
          if (content.length > 0) {
            // Calculate content area height (total - header - pager - toolbar)
            const headerHeight = wrapper.find('.k-grid-header').outerHeight() || 40;
            const pagerHeight = wrapper.find('.k-grid-pager').outerHeight() || 50;
            const toolbarHeight = wrapper.find('.k-grid-toolbar').outerHeight() || 0;

            const contentHeight = optimalHeight - headerHeight - pagerHeight - toolbarHeight;
            content.height(contentHeight);
          }

          console.log('✅ Grid height adjusted:', optimalHeight + 'px', 'for', rowCount, 'rows');
        }
      });
    }

    // Enable auto resize on window resize
    this.enableAutoResize(gridId, options.heightConfig || {});
  },

  // Get selected row from grid
  getSelectedRow: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (!grid) return null;

    const selectedRow = grid.select();
    if (!selectedRow || selectedRow.length === 0) return null;

    return grid.dataItem(selectedRow);
  },

  // Get all selected rows from grid
  getSelectedRows: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (!grid) return [];

    const selectedRows = grid.select();
    const items = [];

    selectedRows.each(function () {
      const dataItem = grid.dataItem(this);
      items.push(dataItem);
    });

    return items;
  },

  // Refresh grid
  refreshGrid: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data('kendoGrid');
    if (grid && grid.dataSource) grid.dataSource.read();
  },

  // Clear grid selection
  clearSelection: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data('kendoGrid');
    if (grid) grid.clearSelection();
  },

  // Go to specific page
  goToPage: function (gridSelector, pageNumber) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data('kendoGrid');
    if (grid && grid.dataSource) grid.dataSource.page(pageNumber);
  },

  getSelectedItem: function (gridSelector, event) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data('kendoGrid');
    if (!grid) return null;
    const tr = $(event.target).closest('tr');
    return grid.dataItem(tr);
  },

  // Export grid to Excel
  exportToExcel: function (gridSelector, fileName = "Export") {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (grid) {
      grid.saveAsExcel();
    }
  },

  // Export grid to PDF
  exportToPDF: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (grid) {
      grid.saveAsPDF();
    }
  },

  // Get grid data
  getGridData: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (!grid) return [];
    return grid.dataSource.data();
  },

  // Get total records count
  getTotalCount: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (!grid) return 0;
    return grid.dataSource.total();
  },

  // Go to first page
  goToFirstPage: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (grid) {
      grid.dataSource.page(1);
    }
  },

  // Add new row to grid
  addRow: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (grid) {
      grid.addRow();
    }
  },

  // Remove row from grid
  removeRow: function (gridSelector, dataItem) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (grid && dataItem) {
      grid.dataSource.remove(dataItem);
    }
  },

  // Show loading indicator
  showLoading: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (grid) {
      kendo.ui.progress($(selector), true);
    }
  },

  // Hide loading indicator
  hideLoading: function (gridSelector) {
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (grid) {
      kendo.ui.progress($(selector), false);
    }
  },

  // Create action column template
  createActionColumn: function (config) {
    const {
      viewCallback = null,
      editCallback = null,
      deleteCallback = null,
      idField = 'Id'
    } = config;

    return function (dataItem) {
      const id = dataItem[idField];
      let html = '<div class="btn-group" role="group">';

      if (viewCallback) {
        html += `<button type="button" class="btn btn-outline-success" 
               onclick="${viewCallback}(${id})">View</button>`;
      }

      if (editCallback) {
        html += `<button type="button" class="btn btn-outline-dark" 
               onclick="${editCallback}(${id})">Edit</button>`;
      }

      if (deleteCallback) {
        html += `<button type="button" class="btn btn-outline-danger" 
               onclick="${deleteCallback}(${id})">Delete</button>`;
      }

      html += '</div>';
      return html;
    };
  },

  //// Get all selected rows from grid
  //getSelectedRows: function(gridId) {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (!grid) return [];

  //  const selectedRows = grid.select();
  //  const items = [];

  //  selectedRows.each(function() {
  //    const dataItem = grid.dataItem(this);
  //    items.push(dataItem);
  //  });

  //  return items;
  //},

  //// Refresh grid
  //refreshGrid: function (gridId) {
  //  const grid = $('#' + gridId).data('kendoGrid');
  //  if (grid && grid.dataSource) {
  //    grid.dataSource.read();
  //  }
  //},

  //// Clear grid selection
  //clearSelection: function (gridId) {
  //  const grid = $('#' + gridId).data('kendoGrid');
  //  if (grid) grid.clearSelection();
  //},

  //goToPage: function (gridId, pageNumber) {
  //  const grid = $('#' + gridId).data('kendoGrid');
  //  if (grid && grid.dataSource) grid.dataSource.page(pageNumber);
  //},

  //getSelectedItem: function (gridId, event) {
  //  const grid = $('#' + gridId).data('kendoGrid');
  //  if (!grid) return null;
  //  const tr = $(event.target).closest('tr');
  //  return grid.dataItem(tr);
  //},

  //// Export grid to Excel
  //exportToExcel: function(gridId, fileName = "Export") {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (grid) {
  //    grid.saveAsExcel();
  //  }
  //},

  //// Export grid to PDF
  //exportToPDF: function(gridId) {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (grid) {
  //    grid.saveAsPDF();
  //  }
  //},

  //// Get grid data
  //getGridData: function(gridId) {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (!grid) return [];
  //  return grid.dataSource.data();
  //},

  //// Get total records count
  //getTotalCount: function(gridId) {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (!grid) return 0;
  //  return grid.dataSource.total();
  //},

  //// Go to first page
  //goToFirstPage: function(gridId) {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (grid) {
  //    grid.dataSource.page(1);
  //  }
  //},

  //// Go to specific page
  //goToPage: function(gridId, pageNumber) {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (grid) {
  //    grid.dataSource.page(pageNumber);
  //  }
  //},

  //// Add new row to grid
  //addRow: function(gridId) {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (grid) {
  //    grid.addRow();
  //  }
  //},

  //// Remove row from grid
  //removeRow: function(gridId, dataItem) {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (grid && dataItem) {
  //    grid.dataSource.remove(dataItem);
  //  }
  //},

  //// Show loading indicator
  //showLoading: function(gridId) {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (grid) {
  //    kendo.ui.progress($("#" + gridId), true);
  //  }
  //},

  //// Hide loading indicator
  //hideLoading: function(gridId) {
  //  const grid = $("#" + gridId).data("kendoGrid");
  //  if (grid) {
  //    kendo.ui.progress($("#" + gridId), false);
  //  }
  //},

  //// don't use now.
  //createGrid: function (gridId, dataSource, generateColumnsFunc, options = {}) {
  //  if (!generateColumnsFunc || typeof generateColumnsFunc !== 'function') {
  //    console.error('generateColumns function is required for grid:', gridId);
  //    return;
  //  }

  //  var columns = generateColumnsFunc();
  //  var totalColumnsWidth = GridHelper.calculateTotalColumnsWidth(columns);
  //  var containerWidth = $('#' + gridId).width() || (window.innerWidth - 323);
  //  var gridWidth = totalColumnsWidth > containerWidth ? '100%' : `${totalColumnsWidth}px`;

  //  var gridOptions = Object.assign({
  //    dataSource: dataSource,
  //    toolbar: options.toolbar || [],
  //    excel: options.excel || {},
  //    pdf: options.pdf || {},
  //    autoBind: true,
  //    navigatable: true,
  //    scrollable: true,
  //    resizable: true,
  //    width: gridWidth,
  //    filterable: true,
  //    sortable: true,
  //    pageable: options.pageable || {
  //      refresh: true,
  //      pageSizes: [20, 50, 100, 500, 1000],
  //      buttonCount: 5,
  //      input: false,
  //      numeric: true,
  //      serverPaging: true,
  //      serverFiltering: true,
  //      serverSorting: true
  //    },
  //    columns: columns,
  //    editable: false,
  //    selectable: 'row'
  //  }, options.extraOptions || {});

  //  $('#' + gridId).kendoGrid(gridOptions);
  //  return $('#' + gridId).data('kendoGrid');
  //},

  //createActionColumn: function (config) {
  //  const {
  //    editCallback = null,
  //    deleteCallback = null,
  //    viewCallback = null,
  //    customButtons = [],
  //    idField = 'Id'  // ← Default primary key field name
  //  } = config;

  //  return function (dataItem) {
  //    const id = dataItem[idField];  // ← Primary key value

  //    let html = '<div class="btn-group btn-group" role="group">';

  //    if (viewCallback) {
  //      html += `<button type="button" class="btn btn-info btn" 
  //             onclick="${viewCallback}(${id})">
  //              <i class="fa fa-eye"></i> View
  //            </button>`;
  //    }

  //    if (editCallback) {
  //      html += `<button type="button" class="btn btn-outline-success widthSize30_per" 
  //             onclick="${editCallback}(${id})">
  //              <i class="fa fa-edit"></i> Edit
  //            </button>`;
  //    }

  //    if (deleteCallback) {
  //      html += `<button type="button" class="btn btn-danger btn" 
  //             onclick="${deleteCallback}(${id})">
  //              <i class="fa fa-trash"></i> Delete
  //            </button>`;
  //    }

  //    // Custom buttons
  //    customButtons.forEach(btn => {
  //      html += `<button type="button" class="btn ${btn.class} btn" 
  //             onclick="${btn.callback}(${id})">
  //              <i class="${btn.icon}"></i>
  //            </button>`;
  //    });

  //    html += '</div>';
  //    return html;
  //  };
  //},

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
    const selector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    const grid = $(selector).data("kendoGrid");
    if (grid) grid.bind(event, callback);
  },

  //bindGridEvent(gridSelector, event, callback) {
  //  const grid = $(gridSelector).data("kendoGrid");
  //  if (grid) grid.bind(event, callback);
  //},

  // Calculate total columns width
  calculateTotalColumnsWidth: function (columns) {
    let totalWidth = 0;
    columns.forEach(column => {
      if (column.width && !column.hidden) {
        const widthValue = parseInt(column.width.toString().replace(/px|%/g, ''));
        if (!isNaN(widthValue)) {
          totalWidth += widthValue;
        }
      } else if (!column.hidden && !column.width) {
        totalWidth += 120;
      }
    });
    return totalWidth;
  }

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

  //getSelectedRows(gridSelector) {
  //  const grid = $(gridSelector).data("kendoGrid");
  //  if (!grid) return [];
  //  const selectedRows = grid.select();
  //  return selectedRows.map((_, tr) => grid.dataItem(tr)).get();
  //},

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
