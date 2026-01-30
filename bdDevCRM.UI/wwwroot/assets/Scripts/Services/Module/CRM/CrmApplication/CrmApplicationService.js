/*=========================================================
 * CRM Application Service
 * File: CRMApplicationService.js
 * Description: Centralized API service for CRM Application module
 * Author: devSakhawat
 * Date: 2026-01-25
=========================================================*/

var CRMApplicationService = {

  /////////////////////////////////////////////////////////////
  // CACHE CONFIGURATION
  /////////////////////////////////////////////////////////////

  cacheConfig: {
    countries: { key: 'crm_countries', ttl: 30 * 60 * 1000 }, // 30 min
    institutes: { key: 'crm_institutes_', ttl: 30 * 60 * 1000 },
    courses: { key: 'crm_courses_', ttl: 30 * 60 * 1000 },
    currencies: { key: 'crm_currencies', ttl: 60 * 60 * 1000 }, // 1 hour
    statuses: { key: 'crm_statuses', ttl: 60 * 60 * 1000 }
  },

  /////////////////////////////////////////////////////////////
  // APPLICATION CRUD OPERATIONS
  /////////////////////////////////////////////////////////////

  /**
   * Get all applications
   */
  getAllApplications: async function () {
    try {
      console.log('Fetching all applications...');
      const endpoint = AppConfig.endpoints.applications || '/applications';
      const data = await ApiCallManager.get(endpoint);
      console.log('Applications fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading applications:', error);
      MessageManager.notify.error('Failed to load applications');
      throw error;
    }
  },

  /**
   * Get application by ID
   */
  getApplicationById: async function (applicationId) {
    if (!applicationId || applicationId <= 0) {
      console.error('Invalid application ID:', applicationId);
      throw new Error('Invalid application ID');
    }

    try {
      console.log('Fetching application by ID:', applicationId);
      const endpoint = `${AppConfig.endpoints.application || '/application'}/${applicationId}`;
      const data = await ApiCallManager.get(endpoint);
      console.log('Application fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error loading application:', error);
      MessageManager.notify.error('Failed to load application details');
      throw error;
    }
  },

  /**
   * Create new application
   */
  createApplication: async function (applicationData) {
    console.log('Creating new application:', applicationData);

    // Validation
    if (!this.validateCompleteApplication(applicationData)) {
      throw new Error('Invalid application data');
    }

    try {
      const endpoint = AppConfig.endpoints.applicationCreate || '/application';

      // Convert to FormData if has files
      const formData = this.convertToFormDataWithFiles(applicationData);

      const result = await ApiCallManager.post(endpoint, formData, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Application created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating application:', error);
      MessageManager.notify.error('Failed to create application');
      throw error;
    }
  },

  /**
   * Update existing application
   */
  updateApplication: async function (applicationId, applicationData) {
    if (!applicationId || applicationId <= 0) {
      console.error('Invalid application ID:', applicationId);
      throw new Error('Invalid application ID');
    }

    console.log('Updating application:', applicationId, applicationData);

    // Validation
    if (!this.validateCompleteApplication(applicationData)) {
      throw new Error('Invalid application data');
    }

    try {
      const endpoint = `${AppConfig.endpoints.applicationUpdate || '/application'}/${applicationId}`;

      // Convert to FormData if has files
      const formData = this.convertToFormDataWithFiles(applicationData);

      const result = await ApiCallManager.put(endpoint, formData, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Application updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating application:', error);
      MessageManager.notify.error('Failed to update application');
      throw error;
    }
  },

  /**
   * Delete application
   */
  deleteApplication: async function (applicationId) {
    if (!applicationId || applicationId <= 0) {
      console.error('Invalid application ID:', applicationId);
      throw new Error('Invalid application ID');
    }

    console.log('Deleting application:', applicationId);

    try {
      const endpoint = `${AppConfig.endpoints.applicationDelete || '/application'}/${applicationId}`;
      const result = await ApiCallManager.delete(endpoint, {
        showLoadingIndicator: true,
        showSuccessNotification: false,
        showErrorNotifications: true
      });

      console.log('Application deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error deleting application:', error);
      MessageManager.notify.error('Failed to delete application');
      throw error;
    }
  },

  /////////////////////////////////////////////////////////////
  // VALIDATION - COMPLETE APPLICATION
  /////////////////////////////////////////////////////////////

  /**
   * Validate complete application
   */
  validateCompleteApplication: function (appData) {
    if (!appData) {
      MessageManager.notify.error('Application data is required');
      return false;
    }

    // Validate Course Information
    if (!this.validateCourseInformation(appData.CourseInformation)) {
      return false;
    }

    // Validate Education Information
    if (!this.validateEducationInformation(appData.EducationInformation)) {
      return false;
    }

    // Validate Additional Information
    if (!this.validateAdditionalInformation(appData.AdditionalInformation)) {
      return false;
    }

    console.log('Complete application validation passed');
    return true;
  },

  /**
   * Validate Course Information Section
   */
  validateCourseInformation: function (courseInfo) {
    if (!courseInfo) {
      MessageManager.notify.error('Course information is required');
      return false;
    }

    // Validate Course Details
    if (!courseInfo.ApplicantCourse) {
      MessageManager.notify.error('Course details are required');
      return false;
    }

    const course = courseInfo.ApplicantCourse;

    if (!course.CountryId || course.CountryId <= 0) {
      MessageManager.notify.error('Please select a country');
      return false;
    }

    if (!course.InstituteId || course.InstituteId <= 0) {
      MessageManager.notify.error('Please select an institute');
      return false;
    }

    if (!course.CourseId || course.CourseId <= 0) {
      MessageManager.notify.error('Please select a course');
      return false;
    }

    // Validate Personal Details
    if (!courseInfo.PersonalDetails) {
      MessageManager.notify.error('Personal details are required');
      return false;
    }

    const personal = courseInfo.PersonalDetails;

    if (!personal.FirstName || personal.FirstName.trim() === '') {
      MessageManager.notify.error('First name is required');
      return false;
    }

    if (!personal.LastName || personal.LastName.trim() === '') {
      MessageManager.notify.error('Last name is required');
      return false;
    }

    if (!personal.Email || personal.Email.trim() === '') {
      MessageManager.notify.error('Email is required');
      return false;
    }

    // Email format validation
    if (!ValidationHelper.isEmail || !ValidationHelper.isEmail(personal.Email)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personal.Email)) {
        MessageManager.notify.error('Invalid email format');
        return false;
      }
    }

    if (!personal.PhoneNumber || personal.PhoneNumber.trim() === '') {
      MessageManager.notify.error('Phone number is required');
      return false;
    }

    // Validate Address
    if (!courseInfo.ApplicantAddress) {
      MessageManager.notify.error('Address information is required');
      return false;
    }

    return true;
  },

  /**
   * Validate Education Information Section
   */
  validateEducationInformation: function (educationInfo) {
    if (!educationInfo) {
      MessageManager.notify.error('Education information is required');
      return false;
    }

    // Validate Education History (at least one entry)
    if (!educationInfo.EducationDetails ||
      !Array.isArray(educationInfo.EducationDetails) ||
      educationInfo.EducationDetails.length === 0) {
      MessageManager.notify.error('At least one education history entry is required');
      return false;
    }

    // Validate each education entry
    for (let i = 0; i < educationInfo.EducationDetails.length; i++) {
      const edu = educationInfo.EducationDetails[i];

      if (!edu.InstitutionName || edu.InstitutionName.trim() === '') {
        MessageManager.notify.error(`Education entry ${i + 1}: Institution name is required`);
        return false;
      }

      if (!edu.DegreeTitle || edu.DegreeTitle.trim() === '') {
        MessageManager.notify.error(`Education entry ${i + 1}: Degree title is required`);
        return false;
      }
    }

    // At least one English test is recommended (warning, not error)
    const hasIELTS = educationInfo.IELTS && educationInfo.IELTS.OverallScore;
    const hasTOEFL = educationInfo.TOEFL && educationInfo.TOEFL.TotalScore;
    const hasPTE = educationInfo.PTE && educationInfo.PTE.OverallScore;
    const hasGMAT = educationInfo.GMAT && educationInfo.GMAT.TotalScore;

    if (!hasIELTS && !hasTOEFL && !hasPTE && !hasGMAT) {
      MessageManager.notify.warning('At least one English proficiency test is recommended');
    }

    return true;
  },

  /**
   * Validate Additional Information Section
   */
  validateAdditionalInformation: function (additionalInfo) {
    if (!additionalInfo) {
      MessageManager.notify.error('Additional information is required');
      return false;
    }

    // Validate Reference Details (at least one)
    if (!additionalInfo.ReferenceDetails ||
      !Array.isArray(additionalInfo.ReferenceDetails) ||
      additionalInfo.ReferenceDetails.length === 0) {
      MessageManager.notify.error('At least one reference is required');
      return false;
    }

    // Validate each reference
    for (let i = 0; i < additionalInfo.ReferenceDetails.length; i++) {
      const ref = additionalInfo.ReferenceDetails[i];

      if (!ref.ReferenceName || ref.ReferenceName.trim() === '') {
        MessageManager.notify.error(`Reference ${i + 1}: Name is required`);
        return false;
      }

      if (!ref.ReferenceEmail || ref.ReferenceEmail.trim() === '') {
        MessageManager.notify.error(`Reference ${i + 1}: Email is required`);
        return false;
      }
    }

    // Statement of Purpose validation
    if (!additionalInfo.StatementOfPurpose) {
      MessageManager.notify.warning('Statement of Purpose is recommended');
    }

    return true;
  },

  /////////////////////////////////////////////////////////////
  // FORMDATA CONVERSION WITH FILES
  /////////////////////////////////////////////////////////////

  /**
   * Convert nested application object to FormData with files
   */
  convertToFormDataWithFiles: function (applicationData) {
    const formData = new FormData();

    // Recursive function to append nested objects
    const appendToFormData = (data, parentKey = '') => {
      if (data === null || data === undefined) {
        return;
      }

      if (data instanceof File) {
        formData.append(parentKey, data);
        return;
      }

      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          const key = `${parentKey}[${index}]`;
          appendToFormData(item, key);
        });
        return;
      }

      if (typeof data === 'object' && !(data instanceof Date)) {
        Object.keys(data).forEach(key => {
          const value = data[key];
          const formKey = parentKey ? `${parentKey}.${key}` : key;
          appendToFormData(value, formKey);
        });
        return;
      }

      // Primitive values
      if (data instanceof Date) {
        formData.append(parentKey, data.toISOString());
      } else {
        formData.append(parentKey, data);
      }
    };

    appendToFormData(applicationData);

    return formData;
  },

  /////////////////////////////////////////////////////////////
  // COUNTRY OPERATIONS (WITH CACHING)
  /////////////////////////////////////////////////////////////

  /**
   * Get all countries (cached)
   */
  getCountries: async function (forceRefresh = false) {
    const cacheKey = this.cacheConfig.countries.key;

    // Check cache first
    if (!forceRefresh && CacheManager) {
      const cached = CacheManager.get(cacheKey);
      if (cached) {
        console.log('Countries loaded from cache');
        return cached;
      }
    }

    try {
      console.log('Fetching countries from API...');
      const endpoint = AppConfig.endpoints.countriesDDL || '/countryddl';
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });

      // Cache the result
      if (CacheManager && data) {
        CacheManager.set(cacheKey, data, this.cacheConfig.countries.ttl);
      }

      console.log('Countries fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading countries:', error);
      MessageManager.notify.error('Failed to load countries');
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // INSTITUTE OPERATIONS (WITH CACHING)
  /////////////////////////////////////////////////////////////

  /**
   * Get institutes by country ID (cached)
   */
  getInstitutesByCountryId: async function (countryId, forceRefresh = false) {
    if (!countryId || countryId <= 0) {
      console.warn('Invalid country ID:', countryId);
      return [];
    }

    const cacheKey = this.cacheConfig.institutes.key + countryId;

    // Check cache first
    if (!forceRefresh && CacheManager) {
      const cached = CacheManager.get(cacheKey);
      if (cached) {
        console.log('Institutes loaded from cache for country:', countryId);
        return cached;
      }
    }

    try {
      console.log('Fetching institutes for country:', countryId);
      const endpoint = `${AppConfig.endpoints.institutesByCountry || '/crm-institute-by-country'}/${countryId}`;
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });

      // Cache the result
      if (CacheManager && data) {
        CacheManager.set(cacheKey, data, this.cacheConfig.institutes.ttl);
      }

      console.log('Institutes fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading institutes:', error);
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // COURSE OPERATIONS (WITH CACHING)
  /////////////////////////////////////////////////////////////

  /**
   * Get courses by institute ID (cached)
   */
  getCoursesByInstituteId: async function (instituteId, forceRefresh = false) {
    if (!instituteId || instituteId <= 0) {
      console.warn('Invalid institute ID:', instituteId);
      return [];
    }

    const cacheKey = this.cacheConfig.courses.key + instituteId;

    // Check cache first
    if (!forceRefresh && CacheManager) {
      const cached = CacheManager.get(cacheKey);
      if (cached) {
        console.log('Courses loaded from cache for institute:', instituteId);
        return cached;
      }
    }

    try {
      console.log('Fetching courses for institute:', instituteId);
      const endpoint = `${AppConfig.endpoints.coursesByInstitute || '/course-by-instituteId'}/${instituteId}`;
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });

      // Cache the result
      if (CacheManager && data) {
        CacheManager.set(cacheKey, data, this.cacheConfig.courses.ttl);
      }

      console.log('Courses fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // CURRENCY OPERATIONS (WITH CACHING)
  /////////////////////////////////////////////////////////////

  /**
   * Get all currencies (cached)
   */
  getCurrencies: async function (forceRefresh = false) {
    const cacheKey = this.cacheConfig.currencies.key;

    // Check cache first
    if (!forceRefresh && CacheManager) {
      const cached = CacheManager.get(cacheKey);
      if (cached) {
        console.log('Currencies loaded from cache');
        return cached;
      }
    }

    try {
      console.log('Fetching currencies from API...');
      const endpoint = AppConfig.endpoints.currenciesDDL || '/currencyddl';
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });

      // Cache the result
      if (CacheManager && data) {
        CacheManager.set(cacheKey, data, this.cacheConfig.currencies.ttl);
      }

      console.log('Currencies fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading currencies:', error);
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // STATUS OPERATIONS (WITH CACHING)
  /////////////////////////////////////////////////////////////

  /**
   * Get statuses by menu user (cached)
   */
  getStatusesByMenuUser: async function (forceRefresh = false) {
    const cacheKey = this.cacheConfig.statuses.key;

    // Check cache first
    if (!forceRefresh && CacheManager) {
      const cached = CacheManager.get(cacheKey);
      if (cached) {
        console.log('Statuses loaded from cache');
        return cached;
      }
    }

    try {
      console.log('Fetching statuses from API...');
      const endpoint = AppConfig.endpoints.statusesByMenuUser || '/status-by-menu-user';
      const data = await ApiCallManager.get(endpoint, {
        showLoadingIndicator: false,
        showErrorNotifications: true
      });

      // Cache the result
      if (CacheManager && data) {
        CacheManager.set(cacheKey, data, this.cacheConfig.statuses.ttl);
      }

      console.log('Statuses fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error loading statuses:', error);
      return [];
    }
  },

  /////////////////////////////////////////////////////////////
  // GRID DATASOURCE
  /////////////////////////////////////////////////////////////

  /**
   * Get application summary grid data source
   */
  getApplicationSummaryDataSource: function (statusId, config) {
    console.log('Creating application summary DataSource for status:', statusId);

    const defaultConfig = {
      endpoint: `${AppConfig.endpoints.applicationSummary || '/application-summary'}?statusId=${statusId || 0}`,
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      modelFields: {
        ApplicationId: { type: 'number' },
        ApplicantName: { type: 'string' },
        CountryName: { type: 'string' },
        InstituteName: { type: 'string' },
        CourseName: { type: 'string' },
        ApplicationDate: { type: 'date' },
        StatusName: { type: 'string' },
        Email: { type: 'string' },
        PhoneNumber: { type: 'string' }
      },
      primaryKey: 'ApplicationId'
    };

    const gridConfig = Object.assign({}, defaultConfig, config || {});
    console.log('Application summary DataSource config:', gridConfig);

    return ApiCallManager.createGridDataSource(gridConfig);
  },

  /**
   * Get education history grid data source (for inline editing)
   */
  getEducationHistoryDataSource: function (educationData) {
    return new kendo.data.DataSource({
      data: educationData || [],
      schema: {
        model: {
          id: 'EducationDetailId',
          fields: {
            EducationDetailId: { type: 'number', editable: false },
            InstitutionName: { type: 'string', validation: { required: true } },
            DegreeTitle: { type: 'string', validation: { required: true } },
            StartYear: { type: 'number', validation: { required: true, min: 1950, max: new Date().getFullYear() + 5 } },
            EndYear: { type: 'number', validation: { required: true, min: 1950, max: new Date().getFullYear() + 10 } },
            Result: { type: 'string' },
            DocumentPath: { type: 'string' }
          }
        }
      }
    });
  },

  /**
   * Get work experience grid data source (for inline editing)
   */
  getWorkExperienceDataSource: function (workData) {
    return new kendo.data.DataSource({
      data: workData || [],
      schema: {
        model: {
          id: 'WorkExperienceId',
          fields: {
            WorkExperienceId: { type: 'number', editable: false },
            CompanyName: { type: 'string', validation: { required: true } },
            Designation: { type: 'string', validation: { required: true } },
            StartDate: { type: 'date', validation: { required: true } },
            EndDate: { type: 'date' },
            Responsibilities: { type: 'string' },
            DocumentPath: { type: 'string' }
          }
        }
      }
    });
  },

  /**
   * Get reference details grid data source (for inline editing)
   */
  getReferenceDetailsDataSource: function (referenceData) {
    return new kendo.data.DataSource({
      data: referenceData || [],
      schema: {
        model: {
          id: 'ReferenceId',
          fields: {
            ReferenceId: { type: 'number', editable: false },
            ReferenceName: { type: 'string', validation: { required: true } },
            ReferenceDesignation: { type: 'string', validation: { required: true } },
            ReferenceOrganization: { type: 'string' },
            ReferenceEmail: { type: 'string', validation: { required: true } },
            ReferencePhone: { type: 'string' }
          }
        }
      }
    });
  },

  /**
   * Get additional documents grid data source (for inline editing)
   */
  getAdditionalDocumentsDataSource: function (documentsData) {
    return new kendo.data.DataSource({
      data: documentsData || [],
      schema: {
        model: {
          id: 'DocumentId',
          fields: {
            DocumentId: { type: 'number', editable: false },
            DocumentTitle: { type: 'string', validation: { required: true } },
            DocumentType: { type: 'string' },
            DocumentPath: { type: 'string' },
            UploadDate: { type: 'date' }
          }
        }
      }
    });
  },

  /////////////////////////////////////////////////////////////
  // CACHE MANAGEMENT
  /////////////////////////////////////////////////////////////

  /**
   * Clear all application-related cache
   */
  clearCache: function () {
    if (!CacheManager) return;

    CacheManager.delete(this.cacheConfig.countries.key);
    CacheManager.clearByPattern(this.cacheConfig.institutes.key);
    CacheManager.clearByPattern(this.cacheConfig.courses.key);
    CacheManager.delete(this.cacheConfig.currencies.key);
    CacheManager.delete(this.cacheConfig.statuses.key);

    console.log('CRM Application cache cleared');
  },

  /**
   * Refresh cache for specific entity
   */
  refreshCache: async function (entityType, entityId = null) {
    switch (entityType) {
      case 'countries':
        await this.getCountries(true);
        break;
      case 'institutes':
        if (entityId) {
          await this.getInstitutesByCountryId(entityId, true);
        }
        break;
      case 'courses':
        if (entityId) {
          await this.getCoursesByInstituteId(entityId, true);
        }
        break;
      case 'currencies':
        await this.getCurrencies(true);
        break;
      case 'statuses':
        await this.getStatusesByMenuUser(true);
        break;
      default:
        console.warn('Unknown entity type:', entityType);
    }
  },

  /////////////////////////////////////////////////////////////
  // UTILITY METHODS
  /////////////////////////////////////////////////////////////

  /**
   * Get application statistics
   */
  getApplicationStatistics: async function () {
    try {
      const applications = await this.getAllApplications();

      return {
        totalApplications: applications.length,
        pendingApplications: applications.filter(a => a.StatusName === 'Pending').length,
        approvedApplications: applications.filter(a => a.StatusName === 'Approved').length,
        rejectedApplications: applications.filter(a => a.StatusName === 'Rejected').length
      };
    } catch (error) {
      console.error('Error getting application statistics:', error);
      return {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0
      };
    }
  },

  /**
   * Export application data
   */
  exportApplicationData: async function (applicationId) {
    if (!applicationId || applicationId <= 0) {
      throw new Error('Invalid application ID');
    }

    try {
      const applicationData = await this.getApplicationById(applicationId);

      return {
        application: applicationData,
        exportedAt: new Date().toISOString(),
        exportedBy: StorageManager.getUserInfo()?.UserName || 'Unknown'
      };
    } catch (error) {
      console.error('Error exporting application data:', error);
      throw error;
    }
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  window.CRMApplicationService = CRMApplicationService;
  console.log('CRMApplicationService initialized and available globally');
}