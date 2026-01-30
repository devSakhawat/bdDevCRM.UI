/*=========================================================
 * Course Module
 * File: Course.js
 * Description: UI and interaction logic for Course module
 * Author: devSakhawat
 * Date: 2026-01-24
=========================================================*/

var Course = {

  /////////////////////////////////////////////////////////////
  // CONFIGURATION
  /////////////////////////////////////////////////////////////

  config: {
    // Grid IDs
    summaryGridId: 'gridSummaryCourse',

    // Form IDs
    courseFormId: 'CourseForm',

    // Window IDs
    courseWindowId: 'CoursePopUp',
    instituteWindowId: 'InstitutePopUp_Course',
    currencyWindowId: 'CurrencyPopUp_Institute',

    // ComboBox IDs
    instituteComboId: 'cmbInstitute_Course',
    currencyComboId: 'cmbCurrency_Course',

    // DatePicker IDs
    startDateId: 'startDate_Course',
    endDateId: 'EndDate_Course',

    // Button IDs
    saveCourseButtonId: 'btnCourseSaveOrUpdate',
    addCourseButtonId: 'btnAddNewCourse'
  },

  /////////////////////////////////////////////////////////////
  // INITIALIZATION
  /////////////////////////////////////////////////////////////

  init: async function () {
    console.log('Initializing Course module...');

    try {
      // Check dependencies
      if (!this.checkDependencies()) {
        return;
      }

      // Initialize Window
      this.initCourseWindow();

      // Initialize Summary Grid
      this.initSummaryGrid();

      // Initialize Course Form
      await this.initCourseForm();

      // Bind Events
      this.bindEvents();

      console.log('Course module initialized successfully');
    } catch (error) {
      console.error('Error initializing Course module:', error);
      MessageManager.notify.error('Failed to initialize Course module');
    }
  },

  checkDependencies: function () {
    if (typeof CourseService === 'undefined') {
      console.error('CourseService not loaded!');
      return false;
    }

    if (typeof ApiCallManager === 'undefined') {
      console.error('ApiCallManager not loaded!');
      return false;
    }

    if (typeof MessageManager === 'undefined') {
      console.error('MessageManager not loaded!');
      return false;
    }

    return true;
  },

  /////////////////////////////////////////////////////////////
  // WINDOW
  /////////////////////////////////////////////////////////////

  initCourseWindow: function () {
    FormHelper.initializeKendoWindow(
      '#' + this.config.courseWindowId,
      'Course Details',
      '80%'
    );
  },

  openCourseWindow: function (title) {
    FormHelper.openKendoWindow(
      this.config.courseWindowId,
      title || 'Course Details',
      '80%',
      '80%'
    );
  },

  closeCourseWindow: function () {
    FormHelper.closeKendoWindow('#' + this.config.courseWindowId);
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
      toolbar: [
        {
          template: `<button type="button" id="${this.config.addCourseButtonId}" 
                            class="btn-primary k-button k-button-md k-rounded-md k-button-solid k-button-solid-base" 
                            onclick="Course.addNewCourse()">
                       <span class="k-button-text">+ Add Course</span>
                     </button>`
        },
        'excel',
        'pdf',
        {
          template: `<button type="button" id="btnExportCsvCourse" 
                            class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base">
                       <span class="k-button-text">Export to CSV</span>
                     </button>`
        }
      ],
      excel: {
        fileName: 'CourseList_' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.xlsx',
        filterable: true,
        allPages: true
      },
      pdf: {
        fileName: 'Course_' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.pdf',
        allPages: true
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

    // Bind CSV export
    $('#btnExportCsvCourse').on('click', () => {
      FormHelper.GenerateCSVFileAllPages(gridId, 'CourseListCSV', 'Actions');
    });
  },

  getSummaryColumns: function () {
    const isMobile = window.innerWidth < 768;

    return [
      { field: 'CourseId', hidden: true },
      { field: 'InstituteId', hidden: true },
      { field: 'CurrencyId', hidden: true },
      {
        field: 'CourseTitle',
        title: 'Title',
        width: isMobile ? 150 : 200
      },
      {
        field: 'InstituteName',
        title: 'Institute',
        width: isMobile ? 120 : 150,
        hidden: isMobile
      },
      {
        field: 'CourseLevel',
        title: 'Level',
        width: 100
      },
      {
        field: 'CourseFee',
        title: 'Course Fee',
        width: 100,
        hidden: isMobile
      },
      {
        field: 'ApplicationFee',
        title: 'Application Fee',
        width: 120,
        hidden: isMobile
      },
      {
        field: 'MonthlyLivingCost',
        title: 'Monthly Living Cost',
        width: 150,
        hidden: isMobile
      },
      {
        field: 'StartDate',
        title: 'Start Date',
        width: 120,
        hidden: isMobile,
        template: "#= kendo.toString(StartDate, 'yyyy-MM-dd') #"
      },
      {
        field: 'EndDate',
        title: 'End Date',
        width: 120,
        hidden: isMobile,
        template: "#= kendo.toString(EndDate, 'yyyy-MM-dd') #"
      },
      {
        field: 'Status',
        title: 'Status',
        width: 80,
        template: "#= Status ? 'Active' : 'Inactive' #"
      },
      {
        field: 'Actions',
        title: 'Actions',
        width: isMobile ? 100 : 230,
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
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="Course.viewCourse(${dataItem.CourseId})">View</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="Course.editCourse(${dataItem.CourseId})">Edit</a></li>
            <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="Course.deleteCourse(${dataItem.CourseId})">Delete</a></li>
          </ul>
        </div>
      `;
    } else {
      return `
        <button class="btn btn-outline-success btn-action me-1" onclick="Course.viewCourse(${dataItem.CourseId})">View</button>
        <button class="btn btn-outline-dark btn-action me-1" onclick="Course.editCourse(${dataItem.CourseId})">Edit</button>
        <button class="btn btn-outline-danger btn-action" onclick="Course.deleteCourse(${dataItem.CourseId})">Delete</button>
      `;
    }
  },

  getSummaryDataSource: function () {
    return CourseService.getGridDataSource();
  },

  /////////////////////////////////////////////////////////////
  // COURSE FORM
  /////////////////////////////////////////////////////////////

  initCourseForm: async function () {
    // Initialize Institute ComboBox
    await this.initInstituteComboBox();

    // Initialize Currency ComboBox
    await this.initCurrencyComboBox();

    // Initialize Date Pickers
    this.initStartDatePicker();
    this.initEndDatePicker();
  },

  initInstituteComboBox: async function () {
    const $combo = $('#' + this.config.instituteComboId);

    $combo.kendoComboBox({
      placeholder: 'Select Institute...',
      dataTextField: 'InstituteName',
      dataValueField: 'InstituteId',
      filter: 'contains',
      suggest: true,
      dataSource: []
    });

    // Load institute data
    try {
      const institutes = await CourseService.getInstitutes();
      const comboBox = $combo.data('kendoComboBox');
      if (comboBox) {
        comboBox.setDataSource(institutes);
      }
    } catch (error) {
      console.error('Error loading institutes:', error);
    }
  },

  initCurrencyComboBox: async function () {
    const $combo = $('#' + this.config.currencyComboId);

    $combo.kendoComboBox({
      placeholder: 'Select Currency...',
      dataTextField: 'CurrencyName',
      dataValueField: 'CurrencyId',
      filter: 'contains',
      suggest: true,
      dataSource: []
    });

    // Load currency data
    try {
      const currencies = await CourseService.getCurrencies();
      const comboBox = $combo.data('kendoComboBox');
      if (comboBox) {
        comboBox.setDataSource(currencies);
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  },

  initStartDatePicker: function () {
    $('#' + this.config.startDateId).kendoDatePicker({
      parseFormats: ['dd-MMM-yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'],
      format: 'dd-MMM-yyyy'
    });
    $('#' + this.config.startDateId).attr('placeholder', 'Select Start Date...');
  },

  initEndDatePicker: function () {
    $('#' + this.config.endDateId).kendoDatePicker({
      parseFormats: ['dd-MMM-yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'],
      format: 'dd-MMM-yyyy'
    });
    $('#' + this.config.endDateId).attr('placeholder', 'Select End Date...');
  },

  /////////////////////////////////////////////////////////////
  // COURSE CRUD OPERATIONS
  /////////////////////////////////////////////////////////////

  addNewCourse: function () {
    this.clearForm();
    this.openCourseWindow('Add New Course');

    // Set form to create mode
    FormHelper.setFormMode({
      formMode: 'create',
      formId: this.config.courseFormId,
      saveOrUpdateButtonId: this.config.saveCourseButtonId,
      createButtonText: '+ Add Course',
      createButtonIcon: 'fas fa-plus'
    });
  },

  viewCourse: async function (courseId) {
    try {
      this.clearForm();

      // Fetch course data
      const course = await CourseService.getCourseById(courseId);

      // Open window
      this.openCourseWindow('View Course');

      // Populate form
      await this.populateCourseForm(course);

      // Make form read-only
      FormHelper.setFormMode({
        formMode: 'view',
        formId: this.config.courseFormId,
        saveOrUpdateButtonId: this.config.saveCourseButtonId
      });

    } catch (error) {
      console.error('Error viewing course:', error);
      MessageManager.notify.error('Failed to load course details');
    }
  },

  editCourse: async function (courseId) {
    try {
      this.clearForm();

      // Fetch course data
      const course = await CourseService.getCourseById(courseId);

      // Open window
      this.openCourseWindow('Edit Course');

      // Populate form
      await this.populateCourseForm(course);

      // Set form to edit mode
      FormHelper.setFormMode({
        formMode: 'edit',
        formId: this.config.courseFormId,
        saveOrUpdateButtonId: this.config.saveCourseButtonId,
        editButtonText: 'Update Course',
        editButtonIcon: 'fas fa-check'
      });

    } catch (error) {
      console.error('Error editing course:', error);
      MessageManager.notify.error('Failed to load course for editing');
    }
  },

  deleteCourse: async function (courseId) {
    try {
      // Get course details for confirmation message
      const course = await CourseService.getCourseById(courseId);

      MessageManager.confirm.delete(
        `Course: ${course.CourseTitle}`,
        async () => {
          try {
            await CourseService.deleteCourse(courseId);

            // Clear form
            this.clearForm();

            // Refresh grid
            this.refreshSummaryGrid();

            // Show success message
            MessageManager.notify.success('Course deleted successfully');

          } catch (error) {
            console.error('Error deleting course:', error);
          }
        }
      );

    } catch (error) {
      console.error('Error in delete course:', error);
    }
  },

  saveCourse: async function () {
    // Validate form
    if (!FormHelper.validate(this.config.courseFormId)) {
      MessageManager.notify.warning('Please fill all required fields');
      return;
    }

    // Get form data
    const courseData = this.prepareCourseData();

    // Get course ID
    const courseId = $('#courseId').val() || 0;
    const isCreate = courseId == 0;

    // Confirmation
    const confirmMsg = isCreate ? 'Do you want to save this course?' : 'Do you want to update this course?';

    MessageManager.confirm.ask(
      'Confirmation',
      confirmMsg,
      async () => {
        try {
          if (isCreate) {
            await CourseService.createCourse(courseData);
            MessageManager.notify.success('Course created successfully');
          } else {
            await CourseService.updateCourse(courseId, courseData);
            MessageManager.notify.success('Course updated successfully');
          }

          // Clear form
          this.clearForm();

          // Close window
          this.closeCourseWindow();

          // Refresh grid
          this.refreshSummaryGrid();

        } catch (error) {
          console.error('Error saving course:', error);
        }
      }
    );
  },

  prepareCourseData: function () {
    const instituteCombo = $('#' + this.config.instituteComboId).data('kendoComboBox');
    const currencyCombo = $('#' + this.config.currencyComboId).data('kendoComboBox');
    const startDatePicker = $('#' + this.config.startDateId).data('kendoDatePicker');
    const endDatePicker = $('#' + this.config.endDateId).data('kendoDatePicker');

    return {
      CourseId: $('#courseId').val() || 0,
      InstituteId: instituteCombo.value(),
      InstituteName: instituteCombo.text(),
      CurrencyId: currencyCombo.value(),
      CurrencyName: currencyCombo.text(),
      CourseTitle: $('#courseTitle').val(),
      CourseLevel: $('#courseLevel').val(),
      CourseFee: parseFloat($('#courseFee').val()) || 0,
      ApplicationFee: parseFloat($('#applicationFee_Course').val()) || 0,
      MonthlyLivingCost: parseFloat($('#monthlyLivingCost').val()) || 0,
      PartTimeWorkDetails: $('#partTimeWorkDetails').val(),
      StartDate: startDatePicker ? startDatePicker.value() : null,
      EndDate: endDatePicker ? endDatePicker.value() : null,
      CourseBenefits: $('#courseBenefits').val(),
      LanguagesRequirement: $('#languagesRequirement').val(),
      CourseDuration: $('#courseDuration').val(),
      CourseCategory: $('#courseCategory').val(),
      AwardingBody: $('#awardingBody').val(),
      AdditionalInformationOfCourse: $('#additionalInformationOfCourse').val(),
      GeneralEligibility: $('#generalEligibility').val(),
      FundsRequirementforVisa: $('#fundsRequirementforVisa').val(),
      InstitutionalBenefits: $('#institutionalBenefits').val(),
      VisaRequirement: $('#visaRequirement').val(),
      CountryBenefits: $('#countryBenefits').val(),
      KeyModules: $('#keyModules').val(),
      Status: $('#chkStatusCourse').is(':checked'),
      After2YearsPswcompletingCourse: $('#after2YearsPswcompletingCourse').val(),
      DocumentId: $('#documentId').val()
    };
  },

  populateCourseForm: async function (course) {
    $('#courseId').val(course.CourseId);
    $('#courseTitle').val(course.CourseTitle);
    $('#courseLevel').val(course.CourseLevel);
    $('#courseFee').val(course.CourseFee);
    $('#applicationFee_Course').val(course.ApplicationFee);
    $('#monthlyLivingCost').val(course.MonthlyLivingCost);
    $('#partTimeWorkDetails').val(course.PartTimeWorkDetails);

    // Set date pickers
    const startDatePicker = $('#' + this.config.startDateId).data('kendoDatePicker');
    if (startDatePicker) {
      startDatePicker.value(course.StartDate ? new Date(course.StartDate) : null);
    }

    const endDatePicker = $('#' + this.config.endDateId).data('kendoDatePicker');
    if (endDatePicker) {
      endDatePicker.value(course.EndDate ? new Date(course.EndDate) : null);
    }

    $('#courseBenefits').val(course.CourseBenefits);
    $('#languagesRequirement').val(course.LanguagesRequirement);
    $('#courseDuration').val(course.CourseDuration);
    $('#courseCategory').val(course.CourseCategory);
    $('#awardingBody').val(course.AwardingBody);
    $('#additionalInformationOfCourse').val(course.AdditionalInformationOfCourse);
    $('#generalEligibility').val(course.GeneralEligibility);
    $('#fundsRequirementforVisa').val(course.FundsRequirementforVisa);
    $('#institutionalBenefits').val(course.InstitutionalBenefits);
    $('#visaRequirement').val(course.VisaRequirement);
    $('#countryBenefits').val(course.CountryBenefits);
    $('#keyModules').val(course.KeyModules);
    $('#chkStatusCourse').prop('checked', course.Status);
    $('#after2YearsPswcompletingCourse').val(course.After2YearsPswcompletingCourse);
    $('#documentId').val(course.DocumentId);

    // Set ComboBox values
    await this.setComboBoxValues(course);
  },

  setComboBoxValues: async function (course) {
    const instituteCombo = $('#' + this.config.instituteComboId).data('kendoComboBox');
    const currencyCombo = $('#' + this.config.currencyComboId).data('kendoComboBox');

    // Ensure data is loaded before setting values
    if (instituteCombo) {
      if (instituteCombo.dataSource.total() === 0) {
        const institutes = await CourseService.getInstitutes();
        instituteCombo.setDataSource(institutes);
      }
      setTimeout(() => instituteCombo.value(course.InstituteId), 100);
    }

    if (currencyCombo) {
      if (currencyCombo.dataSource.total() === 0) {
        const currencies = await CourseService.getCurrencies();
        currencyCombo.setDataSource(currencies);
      }
      setTimeout(() => currencyCombo.value(course.CurrencyId), 100);
    }
  },

  /////////////////////////////////////////////////////////////
  // FORM OPERATIONS
  /////////////////////////////////////////////////////////////

  clearForm: function () {
    try {
      FormHelper.clearFormFields('#' + this.config.courseFormId);

      // Reset hidden fields
      $('#courseId').val(0);

      // Reset ComboBoxes (clear value but keep dataSource)
      const instituteCombo = $('#' + this.config.instituteComboId).data('kendoComboBox');
      const currencyCombo = $('#' + this.config.currencyComboId).data('kendoComboBox');

      if (instituteCombo) {
        instituteCombo.value('');
        instituteCombo.text('');
      }

      if (currencyCombo) {
        currencyCombo.value('');
        currencyCombo.text('');
      }

      // Reset Date Pickers
      const startDatePicker = $('#' + this.config.startDateId).data('kendoDatePicker');
      const endDatePicker = $('#' + this.config.endDateId).data('kendoDatePicker');

      if (startDatePicker) {
        startDatePicker.value(null);
      }

      if (endDatePicker) {
        endDatePicker.value(null);
      }

      // Reset button text
      $('#' + this.config.saveCourseButtonId).text('+ Add Course');
      $('#' + this.config.saveCourseButtonId).prop('disabled', false);

      console.log('Course form cleared successfully');

    } catch (error) {
      console.error('Error clearing form:', error);
    }
  },

  /////////////////////////////////////////////////////////////
  // GRID REFRESH
  /////////////////////////////////////////////////////////////

  refreshSummaryGrid: function () {
    GridHelper.refreshGrid(this.config.summaryGridId);
  },

  /////////////////////////////////////////////////////////////
  // INSTITUTE/CURRENCY POPUPS
  /////////////////////////////////////////////////////////////

  openInstitutePopup: function () {
    const windowId = this.config.instituteWindowId;
    FormHelper.openKendoWindow(windowId, 'Institute Info', '80%');

    // Initialize Institute module if available
    if (typeof Institute !== 'undefined' && Institute.init) {
      Institute.init();
    }
  },

  openCurrencyPopup: function () {
    const windowId = this.config.currencyWindowId;
    FormHelper.openKendoWindow(windowId, 'Currency Info', '80%');

    // Initialize Currency module if available
    if (typeof Currency !== 'undefined' && Currency.init) {
      Currency.init();
    }
  },

  refreshInstituteCombo: async function () {
    const instituteCombo = $('#' + this.config.instituteComboId).data('kendoComboBox');
    if (instituteCombo) {
      const institutes = await CourseService.getInstitutes();
      instituteCombo.setDataSource(institutes);
    }
  },

  refreshCurrencyCombo: async function () {
    const currencyCombo = $('#' + this.config.currencyComboId).data('kendoComboBox');
    if (currencyCombo) {
      const currencies = await CourseService.getCurrencies();
      currencyCombo.setDataSource(currencies);
    }
  },

  /////////////////////////////////////////////////////////////
  // EVENT BINDING
  /////////////////////////////////////////////////////////////

  bindEvents: function () {
    const self = this;

    // Save Course Button
    $('#' + this.config.saveCourseButtonId).off('click').on('click', function () {
      self.saveCourse();
    });
  }
};

// Auto-initialize when DOM is ready
$(document).ready(function () {
  Course.init();
});

// Make available globally
if (typeof window !== 'undefined') {
  window.Course = Course;
  console.log('Course module initialized and available globally');
}