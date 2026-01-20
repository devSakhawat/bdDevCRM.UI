/// <reference path="../../../core/managers/apicallmanager.js" />
/// <reference path="../../../core/managers/messagemanager.js" />
/// <reference path="../../../services/module/courseservice.js" />
/// <reference path="course.js" />
/// <reference path="coursesummary.js" />


/*=========================================================
 * Course Details Manager
 * File: CourseDetails.js
 * Description: Course form management (uses CourseService)
 * Author: devSakhawat
 * Date: 2025-01-13
=========================================================*/

var CourseDetailsManager = {

  /**
   * Fetch institute combo data (via CourseService)
   */
  fetchInstituteComboBoxData: async function () {
    try {
      // Use CourseService if available, fallback to direct API call
      if (typeof CourseService !== 'undefined') {
        return await CourseService.getInstitute();
      }

      // Fallback
      // return await ApiCallManager.get('/crm-institute-ddl');
    } catch (error) {
      console.error('Error loading institute data:', error);
      return [];
    }
  },

  /**
   * Fetch currency combo data (via CurrencyService)
   */
  fetchCurrencyComboBoxData: async function () {
    try {
      // Use CurrencyService if available, fallback to direct API call
      if (typeof CurrencyService !== 'undefined') {
        return await CurrencyService.getAll();
      }

      // Fallback
      return await ApiCallManager.get('/currencyddl');
    } catch (error) {
      console.error('Error loading currency data:', error);
      return [];
    }
  },

  /**
   * Save or Update item (using CourseService)
   */
  saveOrUpdateItem: async function () {
    const courseData = CourseDetailsHelper.createItem();

    if (!courseData) {
      MessageManager.notify.error('Failed to create course data');
      return;
    }

    try {
      // Use CourseService with confirmation
      await CourseService.saveOrUpdateWithConfirm(courseData, {
        onSuccess: function () {
          // Clear form
          CourseDetailsHelper.clearForm();

          // Close window
          CommonManager.closeKendoWindow('CoursePopUp');
        }
      });
    } catch (error) {
      // Error already handled by CourseService/ApiCallManager
      console.error('Save/Update error:', error);
    }
  },

  /**
   * Delete item (using CourseService)
   */
  deleteItem: async function (gridItem) {
    if (!gridItem || !gridItem.CourseId) {
      MessageManager.notify.warning('Please select a course to delete');
      return;
    }

    try {
      // Use CourseService with confirmation
      await CourseService.deleteWithConfirm(gridItem.CourseId, gridItem, {
        onSuccess: function () {
          // Clear form
          CourseDetailsHelper.clearForm();
        }
      });
    } catch (error) {
      // Error already handled by CourseService/ApiCallManager
      console.error('Delete error:', error);
    }
  }
};

var CourseDetailsHelper = {

  intCourseDetails: function () {
    CommonManager.initializeKendoWindow('#CoursePopUp', 'Course Details', '80%');
    this.generateInstituteCombo();
    this.generateCurrencyCombo();
    this.initializeStartDatePicker();
    this.initializeEndDatePicker();
  },

  openCoursePopUp: function () {
    CourseDetailsHelper.clearForm();
    const windowId = 'CoursePopUp';
    CommonManager.openKendoWindow(windowId, 'Course Details', '80%');
    CommonManager.appandCloseButton(windowId);
  },

  // --- Institute Popup ---
  openInstitutePopup: function () {
    const windowId = 'InstitutePopUp_Course';
    CommonManager.openKendoWindow(windowId, 'Institute Info', '80%');

    if (typeof InstituteDetailsHelper !== 'undefined') {
      InstituteDetailsHelper.instituteInit();
    }
    if (typeof InstituteSummaryHelper !== 'undefined') {
      InstituteSummaryHelper.initInstituteSummary();
    }

    const buttonContainer = $('.btnDiv ul li');
    buttonContainer.find('.btn-close-generic').remove();
    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    buttonContainer.append(closeBtn);
  },

  // --- Currency Popup ---
  openCurrencyPopup: function () {
    const windowId = 'CurrencyPopUp_Institute';
    CommonManager.openKendoWindow(windowId, 'Currency Info', '80%');

    if (typeof CurrencySummaryHelper !== 'undefined') {
      CurrencySummaryHelper.initCurrencySummary();
    }

    const buttonContainer = $('.btnDiv ul li');
    buttonContainer.find('.btn-close-generic').remove();
    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('#${windowId}')">Close</button>`;
    buttonContainer.append(closeBtn);
  },

  refreshInstituteCombo: function () {
    this.generateInstituteCombo();
  },

  refreshCurrencyCombo: function () {
    this.generateCurrencyCombo();
  },

  generateInstituteCombo: function () {
    $('#cmbInstitute_Course').kendoComboBox({
      placeholder: 'Select Institute...',
      dataTextField: 'InstituteName',
      dataValueField: 'InstituteId',
      filter: 'contains',
      suggest: true,
      dataSource: []
    });

    var instituteComboBox = $('#cmbInstitute_Course').data('kendoComboBox');
    if (instituteComboBox) {
      CourseDetailsManager.fetchInstituteComboBoxData()
        .then(data => {
          instituteComboBox.setDataSource(data || []);
        })
        .catch(() => {
          instituteComboBox.setDataSource([]);
        });
    }
  },

  generateCurrencyCombo: function () {
    $('#cmbCurrency_Course').kendoComboBox({
      placeholder: 'Select Currency...',
      dataTextField: 'CurrencyName',
      dataValueField: 'CurrencyId',
      filter: 'contains',
      suggest: true,
      dataSource: []
    });

    var currencyComboBox = $('#cmbCurrency_Course').data('kendoComboBox');
    if (currencyComboBox) {
      CourseDetailsManager.fetchCurrencyComboBoxData()
        .then(data => {
          currencyComboBox.setDataSource(data || []);
        })
        .catch(() => {
          currencyComboBox.setDataSource([]);
        });
    }
  },

  // --- Date Picker Initializers ---
  initializeStartDatePicker: function () {
    $('#startDate_Course').kendoDatePicker({
      parseFormats: CommonManager.getMultiDateFormat(),
      format: 'dd-MMM-yyyy'
    });
    $('#startDate_Course').attr('placeholder', 'Select Start Date...');
  },

  initializeEndDatePicker: function () {
    $('#EndDate_Course').kendoDatePicker({
      parseFormats: CommonManager.getMultiDateFormat(),
      format: 'dd-MMM-yyyy'
    });
    $('#EndDate_Course').attr('placeholder', 'Select End Date...');
  },

  clearForm: function () {
    CommonManager.clearFormFields('#CourseForm');
    $('#btnCourseSaveOrUpdate').text('+ Add Course');
    $('#courseId').val(0);
    $('#btnCourseSaveOrUpdate').prop('disabled', false);

    // Clear date pickers
    if ($('#startDate_Course').data('kendoDatePicker')) {
      $('#startDate_Course').data('kendoDatePicker').value(null);
    }
    if ($('#EndDate_Course').data('kendoDatePicker')) {
      $('#EndDate_Course').data('kendoDatePicker').value(null);
    }

    // Clear ComboBox values but keep dataSource intact
    const instituteCombo = $('#cmbInstitute_Course').data('kendoComboBox');
    const currencyCombo = $('#cmbCurrency_Course').data('kendoComboBox');

    if (instituteCombo) {
      instituteCombo.value('');
      instituteCombo.text('');
    }
    if (currencyCombo) {
      currencyCombo.value('');
      currencyCombo.text('');
    }
  },

  createItem: function () {
    const instituteCbo = $('#cmbInstitute_Course').data('kendoComboBox');
    const currencyCbo = $('#cmbCurrency_Course').data('kendoComboBox');

    const instituteId = CommonManager.getComboValue(instituteCbo);
    const instituteName = CommonManager.getComboText(instituteCbo);
    const currencyId = CommonManager.getComboValue(currencyCbo);
    const currencyName = CommonManager.getComboText(currencyCbo);

    var dto = {};
    dto.CourseId = CommonManager.getInputValue('#courseId', 0);
    dto.InstituteId = instituteId;
    dto.CurrencyId = currencyId;
    dto.CourseTitle = CommonManager.getInputValue('#courseTitle');
    dto.CourseLevel = CommonManager.getInputValue('#courseLevel');
    dto.CourseFee = CommonManager.getNumericValue('#courseFee');
    dto.ApplicationFee = CommonManager.getNumericValue('#applicationFee_Course');
    dto.MonthlyLivingCost = CommonManager.getNumericValue('#monthlyLivingCost');
    dto.PartTimeWorkDetails = CommonManager.getInputValue('#partTimeWorkDetails');

    var startDatePicker = $('#startDate_Course').data('kendoDatePicker');
    var endDatePicker = $('#EndDate_Course').data('kendoDatePicker');
    dto.StartDate = startDatePicker ? startDatePicker.value() : null;
    dto.EndDate = endDatePicker ? endDatePicker.value() : null;

    dto.CourseBenefits = CommonManager.getInputValue('#courseBenefits');
    dto.LanguagesRequirement = CommonManager.getInputValue('#languagesRequirement');
    dto.CourseDuration = CommonManager.getInputValue('#courseDuration');
    dto.CourseCategory = CommonManager.getInputValue('#courseCategory');
    dto.AwardingBody = CommonManager.getInputValue('#awardingBody');
    dto.AdditionalInformationOfCourse = CommonManager.getInputValue('#additionalInformationOfCourse');
    dto.GeneralEligibility = CommonManager.getInputValue('#generalEligibility');
    dto.FundsRequirementforVisa = CommonManager.getInputValue('#fundsRequirementforVisa');
    dto.InstitutionalBenefits = CommonManager.getInputValue('#institutionalBenefits');
    dto.VisaRequirement = CommonManager.getInputValue('#visaRequirement');
    dto.CountryBenefits = CommonManager.getInputValue('#countryBenefits');
    dto.KeyModules = CommonManager.getInputValue('#keyModules');
    dto.Status = document.querySelector('#chkStatusCourse')?.checked || false;
    dto.After2YearsPswcompletingCourse = CommonManager.getInputValue('#after2YearsPswcompletingCourse');
    dto.DocumentId = CommonManager.getInputValue('#documentId');
    dto.InstituteName = instituteName;
    dto.CurrencyName = currencyName;

    return dto;
  },

  populateObject: function (item) {
    this.clearForm();
    $('#btnCourseSaveOrUpdate').text('Update Course');
    $('#courseId').val(item.CourseId);
    $('#courseTitle').val(item.CourseTitle);
    $('#courseLevel').val(item.CourseLevel);
    $('#courseFee').val(item.CourseFee);
    $('#applicationFee_Course').val(item.ApplicationFee);
    $('#monthlyLivingCost').val(item.MonthlyLivingCost);
    $('#partTimeWorkDetails').val(item.PartTimeWorkDetails);

    // Set date pickers
    if ($('#startDate_Course').data('kendoDatePicker')) {
      $('#startDate_Course').data('kendoDatePicker').value(item.StartDate ? new Date(item.StartDate) : null);
    }
    if ($('#EndDate_Course').data('kendoDatePicker')) {
      $('#EndDate_Course').data('kendoDatePicker').value(item.EndDate ? new Date(item.EndDate) : null);
    }

    $('#courseBenefits').val(item.CourseBenefits);
    $('#languagesRequirement').val(item.LanguagesRequirement);
    $('#courseDuration').val(item.CourseDuration);
    $('#courseCategory').val(item.CourseCategory);
    $('#awardingBody').val(item.AwardingBody);
    $('#additionalInformationOfCourse').val(item.AdditionalInformationOfCourse);
    $('#generalEligibility').val(item.GeneralEligibility);
    $('#fundsRequirementforVisa').val(item.FundsRequirementforVisa);
    $('#institutionalBenefits').val(item.InstitutionalBenefits);
    $('#visaRequirement').val(item.VisaRequirement);
    $('#countryBenefits').val(item.CountryBenefits);
    $('#keyModules').val(item.KeyModules);
    $('#chkStatusCourse').prop('checked', item.Status);
    $('#after2YearsPswcompletingCourse').val(item.After2YearsPswcompletingCourse);
    $('#documentId').val(item.DocumentId);

    // Set ComboBox values after ensuring data is loaded
    this.setComboBoxValues(item);
  },

  setComboBoxValues: function (item) {
    // Function to set ComboBox values with data loading check
    const setInstituteValue = () => {
      const instituteCombo = $('#cmbInstitute_Course').data('kendoComboBox');
      if (instituteCombo && instituteCombo.dataSource.total() > 0) {
        instituteCombo.value(item.InstituteId);
      } else if (instituteCombo) {
        // If dataSource is empty, load data first
        CourseDetailsManager.fetchInstituteComboBoxData().then(data => {
          instituteCombo.setDataSource(data);
          setTimeout(() => instituteCombo.value(item.InstituteId), 100);
        }).catch(() => {
          instituteCombo.setDataSource([]);
        });
      }
    };

    const setCurrencyValue = () => {
      const currencyCombo = $('#cmbCurrency_Course').data('kendoComboBox');
      if (currencyCombo && currencyCombo.dataSource.total() > 0) {
        currencyCombo.value(item.CurrencyId);
      } else if (currencyCombo) {
        // If dataSource is empty, load data first
        CourseDetailsManager.fetchCurrencyComboBoxData().then(data => {
          currencyCombo.setDataSource(data);
          setTimeout(() => currencyCombo.value(item.CurrencyId), 100);
        }).catch(() => {
          currencyCombo.setDataSource([]);
        });
      }
    };

    // Set values with slight delay to ensure ComboBox is ready
    setTimeout(() => {
      setInstituteValue();
      setCurrencyValue();
    }, 150);
  }
};