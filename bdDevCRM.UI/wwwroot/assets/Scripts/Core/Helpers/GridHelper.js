/*=========================================================
 * Grid Helper
 * File: GridHelper.js
 * Description: Kendo Grid utilities and helpers
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var GridHelper = {
  
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
  refreshGrid: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      grid.dataSource.read();
    }
  },

  // Clear grid selection
  clearSelection: function(gridId) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      grid.clearSelection();
    }
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
  createActionColumn: function(config) {
    const {
      editCallback = null,
      deleteCallback = null,
      viewCallback = null,
      customButtons = []
    } = config;

    return function(dataItem) {
      let html = '<div class="btn-group btn-group-sm" role="group">';

      if (viewCallback) {
        html += `<button type="button" class="btn btn-info btn-sm" onclick="${viewCallback}('${dataItem.uid}')">
                  <i class="fa fa-eye"></i>
                </button>`;
      }

      if (editCallback) {
        html += `<button type="button" class="btn btn-primary btn-sm" onclick="${editCallback}('${dataItem.uid}')">
                  <i class="fa fa-edit"></i>
                </button>`;
      }

      if (deleteCallback) {
        html += `<button type="button" class="btn btn-danger btn-sm" onclick="${deleteCallback}('${dataItem.uid}')">
                  <i class="fa fa-trash"></i>
                </button>`;
      }

      // Add custom buttons
      customButtons.forEach(btn => {
        html += `<button type="button" class="btn ${btn.class} btn-sm" onclick="${btn.callback}('${dataItem.uid}')">
                  <i class="${btn.icon}"></i>
                </button>`;
      });

      html += '</div>';
      return html;
    };
  },

  // Format currency column
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
  }
};
