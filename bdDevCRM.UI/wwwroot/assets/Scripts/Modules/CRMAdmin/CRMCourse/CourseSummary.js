/*=========================================================
 * Course Summary Manager
 * File: CourseSummary.js
 * Description: Course grid management (uses CourseService)
 * Author: devSakhawat
 * Date: 2025-01-13
=========================================================*/

var CourseSummaryManager = {

  /**
   * Get summary grid data source (using CourseService)
   */
  getSummaryCourseGridDataSource: function () {
    return CourseService.getGridDataSource({
      pageSize: 20
    });
  }
};

var CourseSummaryHelper = {

  initCourseSummary: function () {
    this.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    var Columns = this.generateColumns();
    var totalColumnsWidth = CommonManager.calculateTotalColumnsWidth(Columns);
    var containerWidth = $('#divSummary').width() || (window.innerWidth - 323);
    var gridWidth = totalColumnsWidth > containerWidth ? '100%' : `${totalColumnsWidth}px`;

    const gridOptions = {
      toolbar: [
        { template: '<button type="button" id="btnAddNewCourse" class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" onclick="CourseDetailsHelper.openCoursePopUp()"><span class="k-icon k-i-plus"></span> Add New</button>' },
        { name: 'excel' },
        { name: 'pdf' },
        { template: '<button type="button" id="btnExportCsvCourse" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"><span class="k-button-text">Export to CSV</span></button>' }
      ],
      excel: {
        fileName: 'CourseList' + Date.now() + '.xlsx',
        filterable: true,
        allPages: true,
        columnInfo: true,
      },
      pdf: {
        fileName: 'Course_Information.pdf',
        allPages: true,
        paperSize: 'A4',
        landscape: true,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        scale: 0.9,
        repeatHeaders: true,
        columns: [
          { field: 'CourseTitle', width: 200 }
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
      editable: false,
      selectable: 'row'
    };

    $('#gridSummaryCourse').kendoGrid(gridOptions);

    $('#btnExportCsvCourse').on('click', function () {
      CommonManager.GenerateCSVFileAllPages('gridSummaryCourse', 'CourseListCSV', 'Actions');
    });

    const grid = $('#gridSummaryCourse').data('kendoGrid');
    if (grid) {
      // Get DataSource from CourseService
      const ds = CourseSummaryManager.getSummaryCourseGridDataSource();
      grid.setDataSource(ds);
    }
  },

  generateColumns: function () {
    return [
      { field: 'CourseId', hidden: true },
      { field: 'InstituteId', hidden: true },
      { field: 'CurrencyId', hidden: true },
      { field: 'CourseTitle', title: 'Title', width: '200px' },
      { field: 'InstituteName', title: 'Institute', width: '150px' },
      { field: 'CourseLevel', title: 'Level', width: '100px' },
      { field: 'CourseFee', title: 'Course Fee', width: '100px' },
      { field: 'ApplicationFee', title: 'Application Fee', width: '100px' },
      { field: 'MonthlyLivingCost', title: 'Monthly Living Cost', width: '120px' },
      { field: 'StartDate', title: 'Start Date', width: '120px', template: "#= kendo.toString(StartDate, 'yyyy-MM-dd') #" },
      { field: 'EndDate', title: 'End Date', width: '120px', template: "#= kendo.toString(EndDate, 'yyyy-MM-dd') #" },
      { field: 'Status', title: 'Status', width: '80px', template: "#= Status ? 'Active' : 'Inactive' #" },
      {
        field: 'Action',
        title: '#',
        filterable: false,
        width: '230px',
        template: `
          <input type="button" class="btn btn-outline-success widthSize30_per"
              value="View" onClick="CourseSummaryHelper.clickEventForViewButton(event)" />
          <input type="button" class="btn btn-outline-dark me-1 widthSize30_per"
              value="Edit" onClick="CourseSummaryHelper.clickEventForEditButton(event)" />
          <input type="button" class="btn btn-outline-danger widthSize33_per"
              value="Delete" onClick="CourseSummaryHelper.clickEventForDeleteButton(event)" />
        `
      }
    ];
  },

  _getGridItem: function (event) {
    const grid = $('#gridSummaryCourse').data('kendoGrid');
    const tr = $(event.target).closest('tr');
    return grid.dataItem(tr);
  },

  clickEventForViewButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      CourseDetailsHelper.clearForm();
      const windowId = 'CoursePopUp';
      CommonManager.openKendoWindow(windowId, 'View Course', '80%');
      CommonManager.appandCloseButton(windowId);
      CourseDetailsHelper.populateObject(item);
      CommonManager.MakeFormReadOnly('#CourseForm');
      $('#btnCourseSaveOrUpdate').prop('disabled', true);
    }
  },

  clickEventForEditButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      // Clear form first but don't destroy ComboBox dataSource
      CourseDetailsHelper.clearForm();

      const windowId = 'CoursePopUp';
      CommonManager.openKendoWindow(windowId, 'Edit Course', '80%');
      CommonManager.appandCloseButton(windowId);

      // Ensure ComboBoxes are initialized before populating
      const ensureComboBoxInit = () => {
        const instituteCombo = $('#cmbInstitute_Course').data('kendoComboBox');
        const currencyCombo = $('#cmbCurrency_Course').data('kendoComboBox');

        if (!instituteCombo || !currencyCombo) {
          // Re-initialize if ComboBoxes are not found
          CourseDetailsHelper.generateInstituteCombo();
          CourseDetailsHelper.generateCurrencyCombo();
          setTimeout(() => CourseDetailsHelper.populateObject(item), 200);
        } else {
          CourseDetailsHelper.populateObject(item);
        }
      };

      // Small delay to ensure popup is fully opened
      setTimeout(ensureComboBoxInit, 100);

      CommonManager.MakeFormEditable('#CourseForm');
    }
  },

  clickEventForDeleteButton: function (event) {
    const item = this._getGridItem(event);
    if (item) {
      CourseDetailsManager.deleteItem(item);
    }
  },

  afterInstituteChanged: function () {
    if (typeof CourseDetailsHelper !== 'undefined') {
      CourseDetailsHelper.refreshInstituteCombo();
    }
  },

  afterCurrencyChanged: function () {
    if (typeof CourseDetailsHelper !== 'undefined') {
      CourseDetailsHelper.refreshCurrencyCombo();
    }
  }
};