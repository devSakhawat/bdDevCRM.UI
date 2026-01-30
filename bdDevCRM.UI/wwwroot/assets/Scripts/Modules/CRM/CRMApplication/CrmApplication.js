/*=========================================================
 * CRM Application Module
 * File: CRMApplication.js
 * Description: UI and interaction logic for CRM Application module
 * Author: devSakhawat
 * Date: 2026-01-25
=========================================================*/

var CRMApplication = {

  /////////////////////////////////////////////////////////////
  // CONFIGURATION
  /////////////////////////////////////////////////////////////

  config: {
    // Tab IDs
    tabStripId: 'tabstrip',

    // Grid IDs
    summaryGridId: 'gridSummary',
    educationGridId: 'gridEducationHistory',
    workExperienceGridId: 'gridWorkExperience',
    referenceGridId: 'gridReferenceDetails',
    documentsGridId: 'gridAdditionalDocuments',

    // Form IDs
    courseFormId: 'CRMCourseInformationForm',
    educationFormId: 'CRMEducationForm',
    additionalFormId: 'CRMAdditionalForm',

    // Container IDs
    formContainerId: 'CrmApplcationFormShowHide',
    gridContainerId: 'CrmApplicationGridShowHide',

    // ComboBox IDs - Course Tab
    countryComboId: 'cmbCountry_Course',
    instituteComboId: 'cmbInstitute_Course',
    courseComboId: 'cmbCourse_Course',
    currencyComboId: 'cmbCurrency_Course',
    intakeMonthComboId: 'cmbIntakeMonth_Course',
    intakeYearComboId: 'cmbIntakeYear_Course',
    paymentMethodComboId: 'cmbPaymentMethod_Course',
    maritalStatusComboId: 'cmbMaritalStatus_Course',
    genderComboId: 'cmbGender_Course',
    titleComboId: 'cmbTitle_Course',
    countryPermanentComboId: 'cmbCountryForPermanentAddress_Course',
    countryPresentComboId: 'cmbCountryForAddress_Course',

    // ComboBox IDs - Status
    statusToolbarComboId: 'cmbStatusToolbar',

    // DatePicker IDs
    paymentDateId: 'paymentDate_Course',
    dateOfBirthId: 'dateOfBirth_Course',
    passportIssueDateId: 'passportIssueDate_Course',
    passportExpiryDateId: 'passportExpiryDate_Course',

    // Button IDs
    saveApplicationButtonId: 'btnSaveOrUpdate',
    clearButtonId: 'btnClear',
    closeFormButtonId: 'btnCloseForm',

    // File Upload IDs
    applicantImageId: 'applicantImage_Course',
    ieltsFileId: 'ieltsFile',
    toeflFileId: 'toeflFile',
    pteFileId: 'pteFile',
    gmatFileId: 'gmatFile',
    othersFileId: 'othersFile',
    statementFileId: 'statementFile'
  },

  /////////////////////////////////////////////////////////////
  // STATE MANAGEMENT
  /////////////////////////////////////////////////////////////

  state: {
    currentApplicationId: 0,
    currentMode: 'create', // 'create', 'edit', 'view'
    uploadedFiles: {
      applicantImage: null,
      ieltsFile: null,
      toeflFile: null,
      pteFile: null,
      gmatFile: null,
      othersFile: null,
      statementFile: null,
      educationDocuments: {},
      workDocuments: {},
      additionalDocuments: {}
    }
  },

  /////////////////////////////////////////////////////////////
  // INITIALIZATION
  /////////////////////////////////////////////////////////////

  init: async function () {
    console.log('Initializing CRM Application module...');

    try {
      // Check dependencies
      if (!this.checkDependencies()) {
        return;
      }

      // Initialize TabStrip
      this.initTabStrip();

      // Initialize Summary Grid
      this.initSummaryGrid();

      // Initialize Course Information Tab
      await this.initCourseInformationTab();

      // Initialize Education Tab
      this.initEducationTab();

      // Initialize Additional Information Tab
      this.initAdditionalInformationTab();

      // Bind Events
      this.bindEvents();

      console.log('CRM Application module initialized successfully');
    } catch (error) {
      console.error('Error initializing CRM Application module:', error);
      MessageManager.notify.error('Failed to initialize CRM Application module');
    }
  },

  checkDependencies: function () {
    if (typeof CRMApplicationService === 'undefined') {
      console.error('CRMApplicationService not loaded!');
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

    if (typeof FormHelper === 'undefined') {
      console.error('FormHelper not loaded!');
      return false;
    }

    if (typeof GridHelper === 'undefined') {
      console.error('GridHelper not loaded!');
      return false;
    }

    return true;
  },

  /////////////////////////////////////////////////////////////
  // TAB STRIP
  /////////////////////////////////////////////////////////////

  initTabStrip: function () {
    $('#' + this.config.tabStripId).kendoTabStrip({
      select: (e) => {
        // Ensure only one tab has the 'k-state-active' class
        $('#' + this.config.tabStripId + ' ul li').removeClass('k-state-active');
        $(e.item).addClass('k-state-active');

        // Tab-specific logic
        const selectedTab = $(e.item).find('a').text().trim();
        console.log('Tab selected:', selectedTab);
      }
    });

    var tabStrip = $('#' + this.config.tabStripId).data('kendoTabStrip');
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
      dataSource: this.getSummaryDataSource(0), // Default status: 0 (All)
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
      toolbar: this.getSummaryToolbar(),
      excel: {
        fileName: 'ApplicationList_' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.xlsx',
        filterable: true,
        allPages: true
      },
      pdf: {
        fileName: 'Applications_' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.pdf',
        allPages: true
      },
      dataBound: () => {
        this.adjustGridForMobile();
      }
    };

    // Use GridHelper to initialize grid
    GridHelper.loadGrid(gridId, columns, this.getSummaryDataSource(0), {
      ...gridOptions,
      heightConfig: {
        headerHeight: 60,
        footerHeight: 40,
        paddingBuffer: 20
      }
    });

    // Initialize Status Toolbar ComboBox
    this.initStatusToolbarComboBox();
  },

  getSummaryColumns: function () {
    const isMobile = window.innerWidth < 768;

    return [
      { field: 'ApplicationId', hidden: true },
      { field: 'CountryId', hidden: true },
      { field: 'InstituteId', hidden: true },
      { field: 'CourseId', hidden: true },
      { field: 'StatusId', hidden: true },
      {
        field: 'RowIndex',
        title: 'SL',
        width: 50,
        filterable: false
      },
      {
        field: 'ApplicantName',
        title: 'Applicant Name',
        width: isMobile ? 150 : 200
      },
      {
        field: 'CountryName',
        title: 'Country',
        width: isMobile ? 120 : 150,
        hidden: isMobile
      },
      {
        field: 'InstituteName',
        title: 'Institute',
        width: isMobile ? 120 : 180,
        hidden: isMobile
      },
      {
        field: 'CourseName',
        title: 'Course',
        width: isMobile ? 150 : 200,
        hidden: isMobile
      },
      {
        field: 'ApplicationDate',
        title: 'Application Date',
        width: 120,
        hidden: isMobile,
        template: "#= kendo.toString(ApplicationDate, 'yyyy-MM-dd') #"
      },
      {
        field: 'Email',
        title: 'Email',
        width: 180,
        hidden: isMobile
      },
      {
        field: 'PhoneNumber',
        title: 'Phone',
        width: 130,
        hidden: isMobile
      },
      {
        field: 'StatusName',
        title: 'Status',
        width: 100,
        template: (dataItem) => {
          const statusClass = this.getStatusClass(dataItem.StatusName);
          return `<span class="badge ${statusClass}">${dataItem.StatusName}</span>`;
        }
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
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="CRMApplication.viewApplication(${dataItem.ApplicationId})">View</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="CRMApplication.editApplication(${dataItem.ApplicationId})">Edit</a></li>
            <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="CRMApplication.deleteApplication(${dataItem.ApplicationId})">Delete</a></li>
          </ul>
        </div>
      `;
    } else {
      return `
        <button class="btn btn-outline-success btn-sm me-1" onclick="CRMApplication.viewApplication(${dataItem.ApplicationId})">View</button>
        <button class="btn btn-outline-dark btn-sm me-1" onclick="CRMApplication.editApplication(${dataItem.ApplicationId})">Edit</button>
        <button class="btn btn-outline-danger btn-sm" onclick="CRMApplication.deleteApplication(${dataItem.ApplicationId})">Delete</button>
      `;
    }
  },

  getSummaryToolbar: function () {
    return [
      {
        template: `<button type="button" class="btn btn-primary btn-sm me-2" onclick="CRMApplication.addNewApplication()">
                     <i class="fas fa-plus"></i> Add Application
                   </button>`
      },
      {
        template: `<label class="me-2" style="line-height: 32px;">Filter by Status:</label>
                   <select id="${this.config.statusToolbarComboId}" style="width: 200px;"></select>`
      },
      'excel',
      'pdf'
    ];
  },

  getSummaryDataSource: function (statusId) {
    return CRMApplicationService.getApplicationSummaryDataSource(statusId);
  },

  getStatusClass: function (statusName) {
    const statusMap = {
      'Pending': 'bg-warning',
      'Approved': 'bg-success',
      'Rejected': 'bg-danger',
      'In Progress': 'bg-info',
      'Completed': 'bg-primary'
    };
    return statusMap[statusName] || 'bg-secondary';
  },

  /////////////////////////////////////////////////////////////
  // STATUS TOOLBAR COMBOBOX
  /////////////////////////////////////////////////////////////

  initStatusToolbarComboBox: async function () {
    const $combo = $('#' + this.config.statusToolbarComboId);

    $combo.kendoComboBox({
      placeholder: 'All Statuses',
      dataTextField: 'StatusName',
      dataValueField: 'WfStateId',
      filter: 'contains',
      suggest: true,
      dataSource: [],
      change: (e) => {
        const statusId = e.sender.value() || 0;
        this.filterGridByStatus(statusId);
      }
    });

    // Load status data
    try {
      const statuses = await CRMApplicationService.getStatusesByMenuUser();

      // Add "All" option
      const statusesWithAll = [
        { WfStateId: 0, StatusName: 'All Statuses' },
        ...statuses
      ];

      const comboBox = $combo.data('kendoComboBox');
      if (comboBox) {
        comboBox.setDataSource(statusesWithAll);
        comboBox.value(0);
      }
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  },

  filterGridByStatus: function (statusId) {
    const grid = $('#' + this.config.summaryGridId).data('kendoGrid');
    if (grid) {
      const newDataSource = this.getSummaryDataSource(statusId);
      grid.setDataSource(newDataSource);
    }
  },

  /////////////////////////////////////////////////////////////
  // COURSE INFORMATION TAB
  /////////////////////////////////////////////////////////////

  initCourseInformationTab: async function () {
    // Initialize Static ComboBoxes
    this.initStaticComboBoxes();

    // Initialize Dynamic ComboBoxes
    await this.initDynamicComboBoxes();

    // Initialize DatePickers
    this.initDatePickers();

    // Initialize File Uploads
    this.initFileUploads();

    // Bind Radio Button Events
    this.bindRadioButtonEvents();
  },

  /////////////////////////////////////////////////////////////
  // STATIC COMBOBOXES
  /////////////////////////////////////////////////////////////

  initStaticComboBoxes: function () {
    // Gender
    this.initComboBox(this.config.genderComboId, [
      { text: 'Male', value: 'Male' },
      { text: 'Female', value: 'Female' },
      { text: 'Other', value: 'Other' }
    ], 'text', 'value', 'Select Gender');

    // Title
    this.initComboBox(this.config.titleComboId, [
      { text: 'Mr.', value: 'Mr.' },
      { text: 'Mrs.', value: 'Mrs.' },
      { text: 'Ms.', value: 'Ms.' },
      { text: 'Dr.', value: 'Dr.' }
    ], 'text', 'value', 'Select Title');

    // Marital Status
    this.initComboBox(this.config.maritalStatusComboId, [
      { text: 'Single', value: 'Single' },
      { text: 'Married', value: 'Married' },
      { text: 'Divorced', value: 'Divorced' },
      { text: 'Widowed', value: 'Widowed' }
    ], 'text', 'value', 'Select Marital Status');

    // Intake Month
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthData = months.map((m, i) => ({ text: m, value: i + 1 }));
    this.initComboBox(this.config.intakeMonthComboId, monthData, 'text', 'value', 'Select Month');

    // Intake Year
    const currentYear = new Date().getFullYear();
    const yearData = [];
    for (let i = currentYear; i <= currentYear + 5; i++) {
      yearData.push({ text: i.toString(), value: i });
    }
    this.initComboBox(this.config.intakeYearComboId, yearData, 'text', 'value', 'Select Year');

    // Payment Method
    this.initComboBox(this.config.paymentMethodComboId, [
      { text: 'Cash', value: 'Cash' },
      { text: 'Bank Transfer', value: 'Bank Transfer' },
      { text: 'Credit Card', value: 'Credit Card' },
      { text: 'Cheque', value: 'Cheque' },
      { text: 'Online Payment', value: 'Online Payment' }
    ], 'text', 'value', 'Select Payment Method');
  },

  initComboBox: function (elementId, data, textField, valueField, placeholder) {
    $('#' + elementId).kendoComboBox({
      placeholder: placeholder,
      dataTextField: textField,
      dataValueField: valueField,
      filter: 'contains',
      suggest: true,
      dataSource: data
    });
  },

  /////////////////////////////////////////////////////////////
  // DYNAMIC COMBOBOXES (WITH CACHING)
  /////////////////////////////////////////////////////////////

  initDynamicComboBoxes: async function () {
    // Country ComboBox
    await this.initCountryComboBox();

    // Country for Permanent Address
    await this.initCountryPermanentComboBox();

    // Country for Present Address
    await this.initCountryPresentComboBox();

    // Institute ComboBox (initially empty, loads on country change)
    this.initInstituteComboBox();

    // Course ComboBox (initially empty, loads on institute change)
    this.initCourseComboBox();

    // Currency ComboBox
    await this.initCurrencyComboBox();
  },

  initCountryComboBox: async function () {
    const $combo = $('#' + this.config.countryComboId);

    $combo.kendoComboBox({
      placeholder: 'Select Country...',
      dataTextField: 'CountryName',
      dataValueField: 'CountryId',
      filter: 'contains',
      suggest: true,
      dataSource: [],
      change: (e) => this.onCountryChange(e)
    });

    // Load country data from cache
    try {
      const countries = await CRMApplicationService.getCountries();
      const comboBox = $combo.data('kendoComboBox');
      if (comboBox) {
        comboBox.setDataSource(countries);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  },

  onCountryChange: async function (e) {
    const countryId = e.sender.value();
    console.log('Country changed:', countryId);

    if (countryId && countryId > 0) {
      // Load institutes for selected country
      try {
        const institutes = await CRMApplicationService.getInstitutesByCountryId(countryId);

        const instituteCombo = $('#' + this.config.instituteComboId).data('kendoComboBox');
        if (instituteCombo) {
          instituteCombo.setDataSource(institutes);
          instituteCombo.value('');
          instituteCombo.text('');
        }

        // Clear course combo
        const courseCombo = $('#' + this.config.courseComboId).data('kendoComboBox');
        if (courseCombo) {
          courseCombo.setDataSource([]);
          courseCombo.value('');
          courseCombo.text('');
        }
      } catch (error) {
        console.error('Error loading institutes:', error);
      }
    }
  },

  initInstituteComboBox: function () {
    const $combo = $('#' + this.config.instituteComboId);

    $combo.kendoComboBox({
      placeholder: 'Select Institute...',
      dataTextField: 'InstituteName',
      dataValueField: 'InstituteId',
      filter: 'contains',
      suggest: true,
      dataSource: [],
      change: (e) => this.onInstituteChange(e)
    });
  },

  onInstituteChange: async function (e) {
    const instituteId = e.sender.value();
    console.log('Institute changed:', instituteId);

    if (instituteId && instituteId > 0) {
      // Load courses for selected institute
      try {
        const courses = await CRMApplicationService.getCoursesByInstituteId(instituteId);

        const courseCombo = $('#' + this.config.courseComboId).data('kendoComboBox');
        if (courseCombo) {
          courseCombo.setDataSource(courses);
          courseCombo.value('');
          courseCombo.text('');
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    }
  },

  initCourseComboBox: function () {
    const $combo = $('#' + this.config.courseComboId);

    $combo.kendoComboBox({
      placeholder: 'Select Course...',
      dataTextField: 'CourseTitle',
      dataValueField: 'CourseId',
      filter: 'contains',
      suggest: true,
      dataSource: [],
      change: (e) => this.onCourseChange(e)
    });
  },

  onCourseChange: function (e) {
    const courseId = e.sender.value();
    console.log('Course changed:', courseId);

    // Optionally auto-populate course details (fee, duration, etc.)
    if (courseId && courseId > 0) {
      const selectedCourse = e.sender.dataItem();
      if (selectedCourse) {
        // Auto-fill course-related fields if available
        if (selectedCourse.CourseFee) {
          $('#courseFee_Course').val(selectedCourse.CourseFee);
        }
        if (selectedCourse.ApplicationFee) {
          $('#applicationFee_Course').val(selectedCourse.ApplicationFee);
        }
        if (selectedCourse.CourseDuration) {
          $('#courseDuration_Course').val(selectedCourse.CourseDuration);
        }
      }
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

    // Load currency data from cache
    try {
      const currencies = await CRMApplicationService.getCurrencies();
      const comboBox = $combo.data('kendoComboBox');
      if (comboBox) {
        comboBox.setDataSource(currencies);
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  },

  initCountryPermanentComboBox: async function () {
    const $combo = $('#' + this.config.countryPermanentComboId);

    $combo.kendoComboBox({
      placeholder: 'Select Country...',
      dataTextField: 'CountryName',
      dataValueField: 'CountryId',
      filter: 'contains',
      suggest: true,
      dataSource: []
    });

    // Load country data from cache
    try {
      const countries = await CRMApplicationService.getCountries();
      const comboBox = $combo.data('kendoComboBox');
      if (comboBox) {
        comboBox.setDataSource(countries);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  },

  initCountryPresentComboBox: async function () {
    const $combo = $('#' + this.config.countryPresentComboId);

    $combo.kendoComboBox({
      placeholder: 'Select Country...',
      dataTextField: 'CountryName',
      dataValueField: 'CountryId',
      filter: 'contains',
      suggest: true,
      dataSource: []
    });

    // Load country data from cache
    try {
      const countries = await CRMApplicationService.getCountries();
      const comboBox = $combo.data('kendoComboBox');
      if (comboBox) {
        comboBox.setDataSource(countries);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  },

  /////////////////////////////////////////////////////////////
  // DATEPICKERS
  /////////////////////////////////////////////////////////////

  initDatePickers: function () {
    // Payment Date
    $('#' + this.config.paymentDateId).kendoDatePicker({
      parseFormats: ['dd-MMM-yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'],
      format: 'dd-MMM-yyyy'
    });

    // Date of Birth
    $('#' + this.config.dateOfBirthId).kendoDatePicker({
      parseFormats: ['dd-MMM-yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'],
      format: 'dd-MMM-yyyy',
      max: new Date() // Cannot select future date
    });

    // Passport Issue Date
    $('#' + this.config.passportIssueDateId).kendoDatePicker({
      parseFormats: ['dd-MMM-yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'],
      format: 'dd-MMM-yyyy'
    });

    // Passport Expiry Date
    $('#' + this.config.passportExpiryDateId).kendoDatePicker({
      parseFormats: ['dd-MMM-yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'],
      format: 'dd-MMM-yyyy',
      min: new Date() // Cannot select past date
    });
  },

  /////////////////////////////////////////////////////////////
  // FILE UPLOADS
  /////////////////////////////////////////////////////////////

  initFileUploads: function () {
    // Applicant Image
    this.initFileUpload(this.config.applicantImageId, ['image/jpeg', 'image/png', 'image/jpg'], (file) => {
      this.state.uploadedFiles.applicantImage = file;
      this.previewImage(file, 'applicantImagePreview');
    });

    // IELTS File
    this.initFileUpload(this.config.ieltsFileId, ['application/pdf'], (file) => {
      this.state.uploadedFiles.ieltsFile = file;
      this.convertToViewButton('#' + this.config.ieltsFileId, file.name);
    });

    // TOEFL File
    this.initFileUpload(this.config.toeflFileId, ['application/pdf'], (file) => {
      this.state.uploadedFiles.toeflFile = file;
      this.convertToViewButton('#' + this.config.toeflFileId, file.name);
    });

    // PTE File
    this.initFileUpload(this.config.pteFileId, ['application/pdf'], (file) => {
      this.state.uploadedFiles.pteFile = file;
      this.convertToViewButton('#' + this.config.pteFileId, file.name);
    });

    // GMAT File
    this.initFileUpload(this.config.gmatFileId, ['application/pdf'], (file) => {
      this.state.uploadedFiles.gmatFile = file;
      this.convertToViewButton('#' + this.config.gmatFileId, file.name);
    });

    // Others File
    this.initFileUpload(this.config.othersFileId, ['application/pdf'], (file) => {
      this.state.uploadedFiles.othersFile = file;
      this.convertToViewButton('#' + this.config.othersFileId, file.name);
    });

    // Statement File
    this.initFileUpload(this.config.statementFileId, ['application/pdf'], (file) => {
      this.state.uploadedFiles.statementFile = file;
      this.convertToViewButton('#' + this.config.statementFileId, file.name);
    });
  },

  initFileUpload: function (elementId, acceptedTypes, onUpload) {
    const $input = $('#' + elementId);

    $input.on('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        MessageManager.notify.error('Invalid file type. Accepted: ' + acceptedTypes.join(', '));
        $input.val('');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        MessageManager.notify.error('File size exceeds 5MB');
        $input.val('');
        return;
      }

      if (onUpload) {
        onUpload(file);
      }
    });
  },

  previewImage: function (file, previewId) {
    const reader = new FileReader();
    reader.onload = function (e) {
      $('#' + previewId).attr('src', e.target.result).show();
    };
    reader.readAsDataURL(file);
  },

  convertToViewButton: function (inputSelector, fileName) {
    const $input = $(inputSelector);
    const $container = $input.parent();

    // Replace input with button
    $input.hide();
    $container.append(`
      <button type="button" class="btn btn-sm btn-info view-document-btn">
        <i class="fas fa-eye"></i> View: ${fileName}
      </button>
    `);
  },

  /////////////////////////////////////////////////////////////
  // RADIO BUTTON EVENTS
  /////////////////////////////////////////////////////////////

  bindRadioButtonEvents: function () {
    // Passport requirement toggle
    $('input[name="HasPassport"]').on('change', () => {
      this.togglePassportFields();
    });

    // Same as permanent address toggle
    $('#chkSameAsPermanentAddress').on('change', () => {
      this.toggleSameAsPermanentAddress();
    });

    // Accommodation requirement
    $('input[name="RequireAccommodation"]').on('change', () => {
      console.log('Accommodation requirement changed');
    });

    // Health/medical needs
    $('input[name="HasHealthMedicalNeeds"]').on('change', () => {
      this.toggleHealthMedicalFields();
    });
  },

  togglePassportFields: function () {
    const hasPassport = $('input[name="HasPassport"]:checked').val() === 'true';

    if (hasPassport) {
      $('#passportFieldsContainer').show();
      $('#passportNumber_Course, #passportIssueDate_Course, #passportExpiryDate_Course').prop('required', true);
    } else {
      $('#passportFieldsContainer').hide();
      $('#passportNumber_Course, #passportIssueDate_Course, #passportExpiryDate_Course').prop('required', false);
    }
  },

  toggleSameAsPermanentAddress: function () {
    const isSame = $('#chkSameAsPermanentAddress').is(':checked');

    if (isSame) {
      // Copy permanent address to present address
      $('#presentAddress_Course').val($('#permanentAddress_Course').val());
      $('#presentCity_Course').val($('#permanentCity_Course').val());
      $('#presentPostalCode_Course').val($('#permanentPostalCode_Course').val());

      const permanentCountryId = $('#' + this.config.countryPermanentComboId).data('kendoComboBox').value();
      $('#' + this.config.countryPresentComboId).data('kendoComboBox').value(permanentCountryId);

      // Disable present address fields
      $('#presentAddress_Course, #presentCity_Course, #presentPostalCode_Course').prop('disabled', true);
      $('#' + this.config.countryPresentComboId).data('kendoComboBox').enable(false);
    } else {
      // Enable present address fields
      $('#presentAddress_Course, #presentCity_Course, #presentPostalCode_Course').prop('disabled', false);
      $('#' + this.config.countryPresentComboId).data('kendoComboBox').enable(true);
    }
  },

  toggleHealthMedicalFields: function () {
    const hasNeeds = $('input[name="HasHealthMedicalNeeds"]:checked').val() === 'true';

    if (hasNeeds) {
      $('#healthMedicalDetailsContainer').show();
      $('#healthMedicalDetails').prop('required', true);
    } else {
      $('#healthMedicalDetailsContainer').hide();
      $('#healthMedicalDetails').prop('required', false);
    }
  },

  /////////////////////////////////////////////////////////////
  // EDUCATION TAB
  /////////////////////////////////////////////////////////////

  initEducationTab: function () {
    // Education History Grid
    this.initEducationGrid();

    // Work Experience Grid
    this.initWorkExperienceGrid();
  },

  initEducationGrid: function () {
    const gridId = this.config.educationGridId;

    $('#' + gridId).kendoGrid({
      dataSource: CRMApplicationService.getEducationHistoryDataSource([]),
      columns: [
        { field: 'EducationDetailId', hidden: true },
        { field: 'InstitutionName', title: 'Institution', width: 200 },
        { field: 'DegreeTitle', title: 'Degree', width: 180 },
        { field: 'StartYear', title: 'Start Year', width: 100 },
        { field: 'EndYear', title: 'End Year', width: 100 },
        { field: 'Result', title: 'Result', width: 100 },
        {
          field: 'DocumentPath',
          title: 'Document',
          width: 150,
          template: (dataItem) => {
            if (dataItem.DocumentPath) {
              return `<button class="btn btn-sm btn-info" onclick="CRMApplication.viewEducationDocument('${dataItem.DocumentPath}')">
                        <i class="fas fa-eye"></i> View
                      </button>`;
            }
            return `<input type="file" class="form-control form-control-sm" accept="application/pdf" 
                           onchange="CRMApplication.uploadEducationDocument(event, ${dataItem.EducationDetailId})" />`;
          }
        },
        {
          command: ['edit', 'destroy'],
          title: 'Actions',
          width: 180
        }
      ],
      toolbar: ['create'],
      editable: 'popup',
      pageable: false,
      sortable: true,
      filterable: false
    });
  },

  initWorkExperienceGrid: function () {
    const gridId = this.config.workExperienceGridId;

    $('#' + gridId).kendoGrid({
      dataSource: CRMApplicationService.getWorkExperienceDataSource([]),
      columns: [
        { field: 'WorkExperienceId', hidden: true },
        { field: 'CompanyName', title: 'Company', width: 200 },
        { field: 'Designation', title: 'Designation', width: 150 },
        {
          field: 'StartDate',
          title: 'Start Date',
          width: 120,
          template: "#= kendo.toString(StartDate, 'yyyy-MM-dd') #"
        },
        {
          field: 'EndDate',
          title: 'End Date',
          width: 120,
          template: "#= EndDate ? kendo.toString(EndDate, 'yyyy-MM-dd') : 'Present' #"
        },
        { field: 'Responsibilities', title: 'Responsibilities', width: 250 },
        {
          field: 'DocumentPath',
          title: 'Document',
          width: 150,
          template: (dataItem) => {
            if (dataItem.DocumentPath) {
              return `<button class="btn btn-sm btn-info" onclick="CRMApplication.viewWorkDocument('${dataItem.DocumentPath}')">
                        <i class="fas fa-eye"></i> View
                      </button>`;
            }
            return `<input type="file" class="form-control form-control-sm" accept="application/pdf,image/*" 
                           onchange="CRMApplication.uploadWorkDocument(event, ${dataItem.WorkExperienceId})" />`;
          }
        },
        {
          command: ['edit', 'destroy'],
          title: 'Actions',
          width: 180
        }
      ],
      toolbar: ['create'],
      editable: 'popup',
      pageable: false,
      sortable: true,
      filterable: false
    });
  },

  uploadEducationDocument: function (event, educationId) {
    const file = event.target.files[0];
    if (!file) return;

    // Store file in state
    this.state.uploadedFiles.educationDocuments[educationId] = file;

    MessageManager.notify.success('Document uploaded successfully');
  },

  uploadWorkDocument: function (event, workId) {
    const file = event.target.files[0];
    if (!file) return;

    // Store file in state
    this.state.uploadedFiles.workDocuments[workId] = file;

    MessageManager.notify.success('Document uploaded successfully');
  },

  viewEducationDocument: function (documentPath) {
    window.open(documentPath, '_blank');
  },

  viewWorkDocument: function (documentPath) {
    window.open(documentPath, '_blank');
  },

  /////////////////////////////////////////////////////////////
  // ADDITIONAL INFORMATION TAB
  /////////////////////////////////////////////////////////////

  initAdditionalInformationTab: function () {
    // Reference Details Grid
    this.initReferenceGrid();

    // Additional Documents Grid
    this.initAdditionalDocumentsGrid();
  },

  initReferenceGrid: function () {
    const gridId = this.config.referenceGridId;

    $('#' + gridId).kendoGrid({
      dataSource: CRMApplicationService.getReferenceDetailsDataSource([]),
      columns: [
        { field: 'ReferenceId', hidden: true },
        { field: 'ReferenceName', title: 'Name', width: 180 },
        { field: 'ReferenceDesignation', title: 'Designation', width: 150 },
        { field: 'ReferenceOrganization', title: 'Organization', width: 180 },
        { field: 'ReferenceEmail', title: 'Email', width: 200 },
        { field: 'ReferencePhone', title: 'Phone', width: 130 },
        {
          command: ['edit', 'destroy'],
          title: 'Actions',
          width: 180
        }
      ],
      toolbar: ['create'],
      editable: 'popup',
      pageable: false,
      sortable: true,
      filterable: false
    });
  },

  initAdditionalDocumentsGrid: function () {
    const gridId = this.config.documentsGridId;

    $('#' + gridId).kendoGrid({
      dataSource: CRMApplicationService.getAdditionalDocumentsDataSource([]),
      columns: [
        { field: 'DocumentId', hidden: true },
        { field: 'DocumentTitle', title: 'Title', width: 200 },
        { field: 'DocumentType', title: 'Type', width: 120 },
        {
          field: 'UploadDate',
          title: 'Upload Date',
          width: 120,
          template: "#= kendo.toString(UploadDate, 'yyyy-MM-dd') #"
        },
        {
          field: 'DocumentPath',
          title: 'Document',
          width: 150,
          template: (dataItem) => {
            if (dataItem.DocumentPath) {
              return `<button class="btn btn-sm btn-info" onclick="CRMApplication.viewAdditionalDocument('${dataItem.DocumentPath}')">
                        <i class="fas fa-eye"></i> View
                      </button>`;
            }
            return `<input type="file" class="form-control form-control-sm" accept="application/pdf,image/*" 
                           onchange="CRMApplication.uploadAdditionalDocument(event, ${dataItem.DocumentId})" />`;
          }
        },
        {
          command: ['edit', 'destroy'],
          title: 'Actions',
          width: 180
        }
      ],
      toolbar: ['create'],
      editable: 'popup',
      pageable: false,
      sortable: true,
      filterable: false
    });
  },

  uploadAdditionalDocument: function (event, documentId) {
    const file = event.target.files[0];
    if (!file) return;

    // Store file in state
    this.state.uploadedFiles.additionalDocuments[documentId] = file;

    MessageManager.notify.success('Document uploaded successfully');
  },

  viewAdditionalDocument: function (documentPath) {
    window.open(documentPath, '_blank');
  },

  /////////////////////////////////////////////////////////////
  // APPLICATION CRUD OPERATIONS
  /////////////////////////////////////////////////////////////

  addNewApplication: function () {
    this.clearForm();
    this.showForm();
    this.state.currentMode = 'create';
    this.state.currentApplicationId = 0;

    // Set form to create mode
    FormHelper.setFormMode({
      formMode: 'create',
      formId: this.config.courseFormId,
      saveOrUpdateButtonId: this.config.saveApplicationButtonId,
      createButtonText: 'Save Application',
      createButtonIcon: 'fas fa-save'
    });
  },

  viewApplication: async function (applicationId) {
    try {
      // Fetch application data
      const application = await CRMApplicationService.getApplicationById(applicationId);

      // Show form
      this.showForm();

      // Populate form
      await this.populateApplicationForm(application);

      // Set form to view mode
      this.state.currentMode = 'view';
      this.state.currentApplicationId = applicationId;

      FormHelper.setFormMode({
        formMode: 'view',
        formId: this.config.courseFormId,
        saveOrUpdateButtonId: this.config.saveApplicationButtonId
      });

    } catch (error) {
      console.error('Error viewing application:', error);
      MessageManager.notify.error('Failed to load application details');
    }
  },

  editApplication: async function (applicationId) {
    try {
      // Fetch application data
      const application = await CRMApplicationService.getApplicationById(applicationId);

      // Show form
      this.showForm();

      // Populate form
      await this.populateApplicationForm(application);

      // Set form to edit mode
      this.state.currentMode = 'edit';
      this.state.currentApplicationId = applicationId;

      FormHelper.setFormMode({
        formMode: 'edit',
        formId: this.config.courseFormId,
        saveOrUpdateButtonId: this.config.saveApplicationButtonId,
        editButtonText: 'Update Application',
        editButtonIcon: 'fas fa-check'
      });

    } catch (error) {
      console.error('Error editing application:', error);
      MessageManager.notify.error('Failed to load application for editing');
    }
  },

  deleteApplication: async function (applicationId) {
    try {
      // Get application details for confirmation message
      const application = await CRMApplicationService.getApplicationById(applicationId);

      MessageManager.confirm.delete(
        `Application: ${application.ApplicantName}`,
        async () => {
          try {
            await CRMApplicationService.deleteApplication(applicationId);

            // Refresh grid
            this.refreshSummaryGrid();

            // Show success message
            MessageManager.notify.success('Application deleted successfully');

          } catch (error) {
            console.error('Error deleting application:', error);
          }
        }
      );

    } catch (error) {
      console.error('Error in delete application:', error);
    }
  },

  saveApplication: async function () {
    // Validate complete form
    if (!this.validateCompleteForm()) {
      return;
    }

    // Prepare application data
    const applicationData = this.prepareApplicationData();

    // Get application ID
    const applicationId = this.state.currentApplicationId;
    const isCreate = applicationId === 0;

    // Confirmation
    const confirmMsg = isCreate ? 'Do you want to save this application?' : 'Do you want to update this application?';

    MessageManager.confirm.ask(
      'Confirmation',
      confirmMsg,
      async () => {
        try {
          if (isCreate) {
            await CRMApplicationService.createApplication(applicationData);
            MessageManager.notify.success('Application created successfully');
          } else {
            await CRMApplicationService.updateApplication(applicationId, applicationData);
            MessageManager.notify.success('Application updated successfully');
          }

          // Clear form
          this.clearForm();

          // Hide form
          this.hideForm();

          // Refresh grid
          this.refreshSummaryGrid();

        } catch (error) {
          console.error('Error saving application:', error);
        }
      }
    );
  },

  /////////////////////////////////////////////////////////////
  // FORM DATA PREPARATION
  /////////////////////////////////////////////////////////////

  prepareApplicationData: function () {
    return {
      ApplicationId: this.state.currentApplicationId,
      CourseInformation: this.prepareCourseInformation(),
      EducationInformation: this.prepareEducationInformation(),
      AdditionalInformation: this.prepareAdditionalInformation()
    };
  },

  prepareCourseInformation: function () {
    const countryCombo = $('#' + this.config.countryComboId).data('kendoComboBox');
    const instituteCombo = $('#' + this.config.instituteComboId).data('kendoComboBox');
    const courseCombo = $('#' + this.config.courseComboId).data('kendoComboBox');
    const currencyCombo = $('#' + this.config.currencyComboId).data('kendoComboBox');
    const genderCombo = $('#' + this.config.genderComboId).data('kendoComboBox');
    const titleCombo = $('#' + this.config.titleComboId).data('kendoComboBox');
    const maritalStatusCombo = $('#' + this.config.maritalStatusComboId).data('kendoComboBox');
    const intakeMonthCombo = $('#' + this.config.intakeMonthComboId).data('kendoComboBox');
    const intakeYearCombo = $('#' + this.config.intakeYearComboId).data('kendoComboBox');
    const paymentMethodCombo = $('#' + this.config.paymentMethodComboId).data('kendoComboBox');
    const countryPermanentCombo = $('#' + this.config.countryPermanentComboId).data('kendoComboBox');
    const countryPresentCombo = $('#' + this.config.countryPresentComboId).data('kendoComboBox');

    const paymentDatePicker = $('#' + this.config.paymentDateId).data('kendoDatePicker');
    const dateOfBirthPicker = $('#' + this.config.dateOfBirthId).data('kendoDatePicker');
    const passportIssueDatePicker = $('#' + this.config.passportIssueDateId).data('kendoDatePicker');
    const passportExpiryDatePicker = $('#' + this.config.passportExpiryDateId).data('kendoDatePicker');

    return {
      ApplicantCourse: {
        CountryId: TypeConverter.toInt(countryCombo.value()),
        CountryName: countryCombo.text(),
        InstituteId: TypeConverter.toInt(instituteCombo.value()),
        InstituteName: instituteCombo.text(),
        CourseId: TypeConverter.toInt(courseCombo.value()),
        CourseName: courseCombo.text(),
        CurrencyId: TypeConverter.toInt(currencyCombo.value()),
        CurrencyName: currencyCombo.text(),
        IntakeMonth: TypeConverter.toInt(intakeMonthCombo.value()),
        IntakeYear: TypeConverter.toInt(intakeYearCombo.value()),
        PaymentMethod: paymentMethodCombo.text(),
        PaymentDate: paymentDatePicker ? paymentDatePicker.value() : null,
        CourseFee: TypeConverter.toDecimal($('#courseFee_Course').val()),
        ApplicationFee: TypeConverter.toDecimal($('#applicationFee_Course').val()),
        TuitionFee: TypeConverter.toDecimal($('#tuitionFee_Course').val())
      },
      PersonalDetails: {
        Title: titleCombo.text(),
        FirstName: $('#firstName_Course').val(),
        LastName: $('#lastName_Course').val(),
        Gender: genderCombo.text(),
        DateOfBirth: dateOfBirthPicker ? dateOfBirthPicker.value() : null,
        MaritalStatus: maritalStatusCombo.text(),
        Email: $('#email_Course').val(),
        PhoneNumber: $('#phoneNumber_Course').val(),
        HasPassport: TypeConverter.toBool($('input[name="HasPassport"]:checked').val()),
        PassportNumber: $('#passportNumber_Course').val(),
        PassportIssueDate: passportIssueDatePicker ? passportIssueDatePicker.value() : null,
        PassportExpiryDate: passportExpiryDatePicker ? passportExpiryDatePicker.value() : null,
        ApplicantImage: this.state.uploadedFiles.applicantImage
      },
      ApplicantAddress: {
        PermanentAddress: {
          Address: $('#permanentAddress_Course').val(),
          City: $('#permanentCity_Course').val(),
          PostalCode: $('#permanentPostalCode_Course').val(),
          CountryId: TypeConverter.toInt(countryPermanentCombo.value()),
          CountryName: countryPermanentCombo.text()
        },
        PresentAddress: {
          Address: $('#presentAddress_Course').val(),
          City: $('#presentCity_Course').val(),
          PostalCode: $('#presentPostalCode_Course').val(),
          CountryId: TypeConverter.toInt(countryPresentCombo.value()),
          CountryName: countryPresentCombo.text(),
          IsSameAsPermanent: TypeConverter.toBool($('#chkSameAsPermanentAddress').is(':checked'))
        }
      }
    };
  },

  prepareEducationInformation: function () {
    const educationGrid = $('#' + this.config.educationGridId).data('kendoGrid');
    const workGrid = $('#' + this.config.workExperienceGridId).data('kendoGrid');

    return {
      IELTS: this.prepareIELTSData(),
      TOEFL: this.prepareTOEFLData(),
      PTE: this.preparePTEData(),
      GMAT: this.prepareGMATData(),
      OTHERS: this.prepareOTHERSData(),
      EducationDetails: educationGrid ? educationGrid.dataSource.data().toJSON() : [],
      WorkExperience: workGrid ? workGrid.dataSource.data().toJSON() : []
    };
  },

  prepareIELTSData: function () {
    return {
      OverallScore: TypeConverter.toDecimal($('#ieltsOverall').val()),
      ListeningScore: TypeConverter.toDecimal($('#ieltsListening').val()),
      ReadingScore: TypeConverter.toDecimal($('#ieltsReading').val()),
      WritingScore: TypeConverter.toDecimal($('#ieltsWriting').val()),
      SpeakingScore: TypeConverter.toDecimal($('#ieltsSpeaking').val()),
      TestDate: $('#ieltsDate').val() ? new Date($('#ieltsDate').val()) : null,
      Document: this.state.uploadedFiles.ieltsFile
    };
  },

  prepareTOEFLData: function () {
    return {
      TotalScore: TypeConverter.toInt($('#toeflTotal').val()),
      ReadingScore: TypeConverter.toInt($('#toeflReading').val()),
      ListeningScore: TypeConverter.toInt($('#toeflListening').val()),
      SpeakingScore: TypeConverter.toInt($('#toeflSpeaking').val()),
      WritingScore: TypeConverter.toInt($('#toeflWriting').val()),
      TestDate: $('#toeflDate').val() ? new Date($('#toeflDate').val()) : null,
      Document: this.state.uploadedFiles.toeflFile
    };
  },

  preparePTEData: function () {
    return {
      OverallScore: TypeConverter.toDecimal($('#pteOverall').val()),
      ListeningScore: TypeConverter.toDecimal($('#pteListening').val()),
      ReadingScore: TypeConverter.toDecimal($('#pteReading').val()),
      WritingScore: TypeConverter.toDecimal($('#pteWriting').val()),
      SpeakingScore: TypeConverter.toDecimal($('#pteSpeaking').val()),
      TestDate: $('#pteDate').val() ? new Date($('#pteDate').val()) : null,
      Document: this.state.uploadedFiles.pteFile
    };
  },

  prepareGMATData: function () {
    return {
      TotalScore: TypeConverter.toInt($('#gmatTotal').val()),
      QuantitativeScore: TypeConverter.toInt($('#gmatQuantitative').val()),
      VerbalScore: TypeConverter.toInt($('#gmatVerbal').val()),
      AnalyticalWritingScore: TypeConverter.toDecimal($('#gmatAnalytical').val()),
      TestDate: $('#gmatDate').val() ? new Date($('#gmatDate').val()) : null,
      Document: this.state.uploadedFiles.gmatFile
    };
  },

  prepareOTHERSData: function () {
    return {
      TestName: $('#othersTestName').val(),
      Score: $('#othersScore').val(),
      TestDate: $('#othersDate').val() ? new Date($('#othersDate').val()) : null,
      AdditionalInfo: $('#txtAdditionalInformation').val(),
      Document: this.state.uploadedFiles.othersFile
    };
  },

  prepareAdditionalInformation: function () {
    const referenceGrid = $('#' + this.config.referenceGridId).data('kendoGrid');
    const documentsGrid = $('#' + this.config.documentsGridId).data('kendoGrid');

    return {
      StatementOfPurpose: {
        Statement: $('#statementOfPurpose').val(),
        Document: this.state.uploadedFiles.statementFile
      },
      RequireAccommodation: TypeConverter.toBool($('input[name="RequireAccommodation"]:checked').val()),
      AccommodationDetails: $('#accommodationDetails').val(),
      HasHealthMedicalNeeds: TypeConverter.toBool($('input[name="HasHealthMedicalNeeds"]:checked').val()),
      HealthMedicalDetails: $('#healthMedicalDetails').val(),
      ReferenceDetails: referenceGrid ? referenceGrid.dataSource.data().toJSON() : [],
      AdditionalDocuments: documentsGrid ? documentsGrid.dataSource.data().toJSON() : []
    };
  },

  /////////////////////////////////////////////////////////////
  // FORM POPULATION
  /////////////////////////////////////////////////////////////

  populateApplicationForm: async function (application) {
    if (!application) return;

    // Populate Course Information
    await this.populateCourseInformation(application.CourseInformation);

    // Populate Education Information
    this.populateEducationInformation(application.EducationInformation);

    // Populate Additional Information
    this.populateAdditionalInformation(application.AdditionalInformation);
  },

  populateCourseInformation: async function (courseInfo) {
    if (!courseInfo) return;

    // Populate Course Details
    if (courseInfo.ApplicantCourse) {
      const course = courseInfo.ApplicantCourse;

      // Set Country (and load institutes)
      const countryCombo = $('#' + this.config.countryComboId).data('kendoComboBox');
      if (countryCombo) {
        countryCombo.value(course.CountryId);

        // Load institutes
        if (course.CountryId) {
          const institutes = await CRMApplicationService.getInstitutesByCountryId(course.CountryId);
          const instituteCombo = $('#' + this.config.instituteComboId).data('kendoComboBox');
          if (instituteCombo) {
            instituteCombo.setDataSource(institutes);
            instituteCombo.value(course.InstituteId);

            // Load courses
            if (course.InstituteId) {
              const courses = await CRMApplicationService.getCoursesByInstituteId(course.InstituteId);
              const courseCombo = $('#' + this.config.courseComboId).data('kendoComboBox');
              if (courseCombo) {
                courseCombo.setDataSource(courses);
                courseCombo.value(course.CourseId);
              }
            }
          }
        }
      }

      // Set Currency
      const currencyCombo = $('#' + this.config.currencyComboId).data('kendoComboBox');
      if (currencyCombo) {
        currencyCombo.value(course.CurrencyId);
      }

      // Set Intake
      const intakeMonthCombo = $('#' + this.config.intakeMonthComboId).data('kendoComboBox');
      if (intakeMonthCombo) {
        intakeMonthCombo.value(course.IntakeMonth);
      }

      const intakeYearCombo = $('#' + this.config.intakeYearComboId).data('kendoComboBox');
      if (intakeYearCombo) {
        intakeYearCombo.value(course.IntakeYear);
      }

      // Set Payment
      const paymentMethodCombo = $('#' + this.config.paymentMethodComboId).data('kendoComboBox');
      if (paymentMethodCombo) {
        paymentMethodCombo.text(course.PaymentMethod);
      }

      const paymentDatePicker = $('#' + this.config.paymentDateId).data('kendoDatePicker');
      if (paymentDatePicker && course.PaymentDate) {
        paymentDatePicker.value(new Date(course.PaymentDate));
      }

      // Set Fees
      $('#courseFee_Course').val(course.CourseFee);
      $('#applicationFee_Course').val(course.ApplicationFee);
      $('#tuitionFee_Course').val(course.TuitionFee);
    }

    // Populate Personal Details
    if (courseInfo.PersonalDetails) {
      const personal = courseInfo.PersonalDetails;

      const titleCombo = $('#' + this.config.titleComboId).data('kendoComboBox');
      if (titleCombo) {
        titleCombo.text(personal.Title);
      }

      $('#firstName_Course').val(personal.FirstName);
      $('#lastName_Course').val(personal.LastName);

      const genderCombo = $('#' + this.config.genderComboId).data('kendoComboBox');
      if (genderCombo) {
        genderCombo.text(personal.Gender);
      }

      const dateOfBirthPicker = $('#' + this.config.dateOfBirthId).data('kendoDatePicker');
      if (dateOfBirthPicker && personal.DateOfBirth) {
        dateOfBirthPicker.value(new Date(personal.DateOfBirth));
      }

      const maritalStatusCombo = $('#' + this.config.maritalStatusComboId).data('kendoComboBox');
      if (maritalStatusCombo) {
        maritalStatusCombo.text(personal.MaritalStatus);
      }

      $('#email_Course').val(personal.Email);
      $('#phoneNumber_Course').val(personal.PhoneNumber);

      // Passport
      $(`input[name="HasPassport"][value="${personal.HasPassport}"]`).prop('checked', true);
      this.togglePassportFields();

      if (personal.HasPassport) {
        $('#passportNumber_Course').val(personal.PassportNumber);

        const passportIssuePicker = $('#' + this.config.passportIssueDateId).data('kendoDatePicker');
        if (passportIssuePicker && personal.PassportIssueDate) {
          passportIssuePicker.value(new Date(personal.PassportIssueDate));
        }

        const passportExpiryPicker = $('#' + this.config.passportExpiryDateId).data('kendoDatePicker');
        if (passportExpiryPicker && personal.PassportExpiryDate) {
          passportExpiryPicker.value(new Date(personal.PassportExpiryDate));
        }
      }

      // Applicant Image
      if (personal.ApplicantImagePath) {
        $('#applicantImagePreview').attr('src', personal.ApplicantImagePath).show();
      }
    }

    // Populate Address
    if (courseInfo.ApplicantAddress) {
      const address = courseInfo.ApplicantAddress;

      // Permanent Address
      if (address.PermanentAddress) {
        $('#permanentAddress_Course').val(address.PermanentAddress.Address);
        $('#permanentCity_Course').val(address.PermanentAddress.City);
        $('#permanentPostalCode_Course').val(address.PermanentAddress.PostalCode);

        const countryPermanentCombo = $('#' + this.config.countryPermanentComboId).data('kendoComboBox');
        if (countryPermanentCombo) {
          countryPermanentCombo.value(address.PermanentAddress.CountryId);
        }
      }

      // Present Address
      if (address.PresentAddress) {
        $('#presentAddress_Course').val(address.PresentAddress.Address);
        $('#presentCity_Course').val(address.PresentAddress.City);
        $('#presentPostalCode_Course').val(address.PresentAddress.PostalCode);

        const countryPresentCombo = $('#' + this.config.countryPresentComboId).data('kendoComboBox');
        if (countryPresentCombo) {
          countryPresentCombo.value(address.PresentAddress.CountryId);
        }

        $('#chkSameAsPermanentAddress').prop('checked', address.PresentAddress.IsSameAsPermanent);
        this.toggleSameAsPermanentAddress();
      }
    }
  },

  populateEducationInformation: function (educationInfo) {
    if (!educationInfo) return;

    // Populate IELTS
    if (educationInfo.IELTS) {
      const ielts = educationInfo.IELTS;
      $('#ieltsOverall').val(ielts.OverallScore);
      $('#ieltsListening').val(ielts.ListeningScore);
      $('#ieltsReading').val(ielts.ReadingScore);
      $('#ieltsWriting').val(ielts.WritingScore);
      $('#ieltsSpeaking').val(ielts.SpeakingScore);
      $('#ieltsDate').val(ielts.TestDate ? DateHelper.formatDate(ielts.TestDate) : '');
    }

    // Populate TOEFL
    if (educationInfo.TOEFL) {
      const toefl = educationInfo.TOEFL;
      $('#toeflTotal').val(toefl.TotalScore);
      $('#toeflReading').val(toefl.ReadingScore);
      $('#toeflListening').val(toefl.ListeningScore);
      $('#toeflSpeaking').val(toefl.SpeakingScore);
      $('#toeflWriting').val(toefl.WritingScore);
      $('#toeflDate').val(toefl.TestDate ? DateHelper.formatDate(toefl.TestDate) : '');
    }

    // Populate PTE
    if (educationInfo.PTE) {
      const pte = educationInfo.PTE;
      $('#pteOverall').val(pte.OverallScore);
      $('#pteListening').val(pte.ListeningScore);
      $('#pteReading').val(pte.ReadingScore);
      $('#pteWriting').val(pte.WritingScore);
      $('#pteSpeaking').val(pte.SpeakingScore);
      $('#pteDate').val(pte.TestDate ? DateHelper.formatDate(pte.TestDate) : '');
    }

    // Populate GMAT
    if (educationInfo.GMAT) {
      const gmat = educationInfo.GMAT;
      $('#gmatTotal').val(gmat.TotalScore);
      $('#gmatQuantitative').val(gmat.QuantitativeScore);
      $('#gmatVerbal').val(gmat.VerbalScore);
      $('#gmatAnalytical').val(gmat.AnalyticalWritingScore);
      $('#gmatDate').val(gmat.TestDate ? DateHelper.formatDate(gmat.TestDate) : '');
    }

    // Populate OTHERS
    if (educationInfo.OTHERS) {
      const others = educationInfo.OTHERS;
      $('#othersTestName').val(others.TestName);
      $('#othersScore').val(others.Score);
      $('#othersDate').val(others.TestDate ? DateHelper.formatDate(others.TestDate) : '');
      $('#txtAdditionalInformation').val(others.AdditionalInfo);
    }

    // Populate Education History Grid
    if (educationInfo.EducationDetails) {
      const educationGrid = $('#' + this.config.educationGridId).data('kendoGrid');
      if (educationGrid) {
        const dataSource = CRMApplicationService.getEducationHistoryDataSource(educationInfo.EducationDetails);
        educationGrid.setDataSource(dataSource);
      }
    }

    // Populate Work Experience Grid
    if (educationInfo.WorkExperience) {
      const workGrid = $('#' + this.config.workExperienceGridId).data('kendoGrid');
      if (workGrid) {
        const dataSource = CRMApplicationService.getWorkExperienceDataSource(educationInfo.WorkExperience);
        workGrid.setDataSource(dataSource);
      }
    }
  },

  populateAdditionalInformation: function (additionalInfo) {
    if (!additionalInfo) return;

    // Populate Statement of Purpose
    if (additionalInfo.StatementOfPurpose) {
      $('#statementOfPurpose').val(additionalInfo.StatementOfPurpose.Statement);
    }

    // Populate Accommodation
    $(`input[name="RequireAccommodation"][value="${additionalInfo.RequireAccommodation}"]`).prop('checked', true);
    $('#accommodationDetails').val(additionalInfo.AccommodationDetails);

    // Populate Health/Medical Needs
    $(`input[name="HasHealthMedicalNeeds"][value="${additionalInfo.HasHealthMedicalNeeds}"]`).prop('checked', true);
    this.toggleHealthMedicalFields();
    $('#healthMedicalDetails').val(additionalInfo.HealthMedicalDetails);

    // Populate Reference Grid
    if (additionalInfo.ReferenceDetails) {
      const referenceGrid = $('#' + this.config.referenceGridId).data('kendoGrid');
      if (referenceGrid) {
        const dataSource = CRMApplicationService.getReferenceDetailsDataSource(additionalInfo.ReferenceDetails);
        referenceGrid.setDataSource(dataSource);
      }
    }

    // Populate Additional Documents Grid
    if (additionalInfo.AdditionalDocuments) {
      const documentsGrid = $('#' + this.config.documentsGridId).data('kendoGrid');
      if (documentsGrid) {
        const dataSource = CRMApplicationService.getAdditionalDocumentsDataSource(additionalInfo.AdditionalDocuments);
        documentsGrid.setDataSource(dataSource);
      }
    }
  },

  /////////////////////////////////////////////////////////////
  // FORM VALIDATION
  /////////////////////////////////////////////////////////////

  validateCompleteForm: function () {
    // Validate Course Information
    if (!this.validateCourseInformationForm()) {
      $('#' + this.config.tabStripId).data('kendoTabStrip').select(0);
      return false;
    }

    // Validate Education Information
    if (!this.validateEducationInformationForm()) {
      $('#' + this.config.tabStripId).data('kendoTabStrip').select(1);
      return false;
    }

    // Validate Additional Information
    if (!this.validateAdditionalInformationForm()) {
      $('#' + this.config.tabStripId).data('kendoTabStrip').select(2);
      return false;
    }

    return true;
  },

  validateCourseInformationForm: function () {
    // Basic HTML5 validation
    if (!FormHelper.validate(this.config.courseFormId)) {
      MessageManager.notify.warning('Please fill all required fields in Course Information');
      return false;
    }

    // Additional custom validations
    const countryId = $('#' + this.config.countryComboId).data('kendoComboBox').value();
    if (!countryId || countryId <= 0) {
      MessageManager.notify.error('Please select a country');
      return false;
    }

    const instituteId = $('#' + this.config.instituteComboId).data('kendoComboBox').value();
    if (!instituteId || instituteId <= 0) {
      MessageManager.notify.error('Please select an institute');
      return false;
    }

    const courseId = $('#' + this.config.courseComboId).data('kendoComboBox').value();
    if (!courseId || courseId <= 0) {
      MessageManager.notify.error('Please select a course');
      return false;
    }

    return true;
  },

  validateEducationInformationForm: function () {
    // Check if at least one education entry exists
    const educationGrid = $('#' + this.config.educationGridId).data('kendoGrid');
    if (!educationGrid || educationGrid.dataSource.total() === 0) {
      MessageManager.notify.error('At least one education history entry is required');
      return false;
    }

    return true;
  },

  validateAdditionalInformationForm: function () {
    // Check if at least one reference exists
    const referenceGrid = $('#' + this.config.referenceGridId).data('kendoGrid');
    if (!referenceGrid || referenceGrid.dataSource.total() === 0) {
      MessageManager.notify.error('At least one reference is required');
      return false;
    }

    return true;
  },

  /////////////////////////////////////////////////////////////
  // FORM OPERATIONS
  /////////////////////////////////////////////////////////////

  clearForm: function () {
    try {
      // Clear Course Information
      this.clearCourseInformationForm();

      // Clear Education Information
      this.clearEducationInformationForm();

      // Clear Additional Information
      this.clearAdditionalInformationForm();

      // Reset state
      this.state.currentApplicationId = 0;
      this.state.currentMode = 'create';
      this.state.uploadedFiles = {
        applicantImage: null,
        ieltsFile: null,
        toeflFile: null,
        pteFile: null,
        gmatFile: null,
        othersFile: null,
        statementFile: null,
        educationDocuments: {},
        workDocuments: {},
        additionalDocuments: {}
      };

      console.log('Form cleared successfully');

    } catch (error) {
      console.error('Error clearing form:', error);
    }
  },

  clearCourseInformationForm: function () {
    FormHelper.clearFormFields('#' + this.config.courseFormId);

    // Reset ComboBoxes
    const comboBoxes = [
      this.config.countryComboId,
      this.config.instituteComboId,
      this.config.courseComboId,
      this.config.currencyComboId,
      this.config.genderComboId,
      this.config.titleComboId,
      this.config.maritalStatusComboId,
      this.config.intakeMonthComboId,
      this.config.intakeYearComboId,
      this.config.paymentMethodComboId,
      this.config.countryPermanentComboId,
      this.config.countryPresentComboId
    ];

    comboBoxes.forEach(id => {
      const combo = $('#' + id).data('kendoComboBox');
      if (combo) {
        combo.value('');
        combo.text('');
      }
    });

    // Reset DatePickers
    const datePickers = [
      this.config.paymentDateId,
      this.config.dateOfBirthId,
      this.config.passportIssueDateId,
      this.config.passportExpiryDateId
    ];

    datePickers.forEach(id => {
      const picker = $('#' + id).data('kendoDatePicker');
      if (picker) {
        picker.value(null);
      }
    });

    // Reset Radio Buttons
    $('input[name="HasPassport"]').prop('checked', false);
    $('#chkSameAsPermanentAddress').prop('checked', false);

    // Clear Image Preview
    $('#applicantImagePreview').attr('src', '').hide();
  },

  clearEducationInformationForm: function () {
    // Clear test scores
    $('#ieltsOverall, #ieltsListening, #ieltsReading, #ieltsWriting, #ieltsSpeaking, #ieltsDate').val('');
    $('#toeflTotal, #toeflReading, #toeflListening, #toeflSpeaking, #toeflWriting, #toeflDate').val('');
    $('#pteOverall, #pteListening, #pteReading, #pteWriting, #pteSpeaking, #pteDate').val('');
    $('#gmatTotal, #gmatQuantitative, #gmatVerbal, #gmatAnalytical, #gmatDate').val('');
    $('#othersTestName, #othersScore, #othersDate, #txtAdditionalInformation').val('');

    // Clear grids
    const educationGrid = $('#' + this.config.educationGridId).data('kendoGrid');
    if (educationGrid) {
      educationGrid.dataSource.data([]);
    }

    const workGrid = $('#' + this.config.workExperienceGridId).data('kendoGrid');
    if (workGrid) {
      workGrid.dataSource.data([]);
    }
  },

  clearAdditionalInformationForm: function () {
    // Clear statement of purpose
    $('#statementOfPurpose').val('');

    // Clear radio buttons
    $('input[name="RequireAccommodation"]').prop('checked', false);
    $('input[name="HasHealthMedicalNeeds"]').prop('checked', false);

    // Clear text areas
    $('#accommodationDetails, #healthMedicalDetails').val('');

    // Clear grids
    const referenceGrid = $('#' + this.config.referenceGridId).data('kendoGrid');
    if (referenceGrid) {
      referenceGrid.dataSource.data([]);
    }

    const documentsGrid = $('#' + this.config.documentsGridId).data('kendoGrid');
    if (documentsGrid) {
      documentsGrid.dataSource.data([]);
    }
  },

  showForm: function () {
    FormHelper.formShowGridHide(this.config.formContainerId, this.config.gridContainerId);
  },

  hideForm: function () {
    FormHelper.formHideGridShow(this.config.formContainerId, this.config.gridContainerId);
  },

  /////////////////////////////////////////////////////////////
  // GRID REFRESH
  /////////////////////////////////////////////////////////////

  refreshSummaryGrid: function () {
    GridHelper.refreshGrid(this.config.summaryGridId);
  },

  /////////////////////////////////////////////////////////////
  // EVENT BINDING
  /////////////////////////////////////////////////////////////

  bindEvents: function () {
    const self = this;

    // Save Application Button
    $('#' + this.config.saveApplicationButtonId).off('click').on('click', function () {
      self.saveApplication();
    });

    // Clear Button
    $('#' + this.config.clearButtonId).off('click').on('click', function () {
      self.clearForm();
    });

    // Close Form Button
    $('#' + this.config.closeFormButtonId).off('click').on('click', function () {
      self.hideForm();
    });
  },

  /////////////////////////////////////////////////////////////
  // UTILITY METHODS
  /////////////////////////////////////////////////////////////

  adjustGridForMobile: function () {
    if (window.innerWidth < 768) {
      $('.k-grid-toolbar').find('.k-button').addClass('btn-sm');
      $('.k-pager-wrap').addClass('k-pager-sm');
    }
  }
};

// Auto-initialize when DOM is ready
$(document).ready(function () {
  CRMApplication.init();
});

// Make available globally
if (typeof window !== 'undefined') {
  window.CRMApplication = CRMApplication;
  console.log('CRMApplication module initialized and available globally');
}