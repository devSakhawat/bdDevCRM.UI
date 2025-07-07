// InstituteDetailsManager.js
class InstituteDetailsManager {
  constructor () {
    this.apiBaseUrl = '/api/institute'; // Adjust based on your API base URL
    this.currentInstituteId = 0;
    this.isEditMode = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.initializeForm();
  }

  bindEvents() {
    // File preview events
    document.getElementById('institutionLogoFile').addEventListener('change', (e) => {
      this.handleLogoPreview(e);
    });

    document.getElementById('prospectusFile').addEventListener('change', (e) => {
      this.handleProspectusPreview(e);
    });

    // Form validation events
    document.getElementById('instituteName').addEventListener('blur', (e) => {
      this.validateRequiredField(e.target, 'Institute Name is required');
    });

    document.getElementById('cmbCountry_Institute').addEventListener('change', (e) => {
      this.validateRequiredField(e.target, 'Country is required');
    });
  }

  initializeForm() {
    // Initialize Kendo UI components if needed
    this.initializeKendoComponents();
  }

  initializeKendoComponents() {
    // Initialize Kendo ComboBox for Institute Type
    if (typeof kendo !== 'undefined') {
      $("#cmbInstituteType").kendoComboBox({
        dataTextField: "Name",
        dataValueField: "Id",
        placeholder: "Select Institute Type",
        filter: "contains"
      });

      // Initialize Kendo ComboBox for Country
      $("#cmbCountry_Institute").kendoComboBox({
        dataTextField: "Name",
        dataValueField: "Id",
        placeholder: "Select Country",
        filter: "contains",
        change: this.onCountryChange.bind(this)
      });

      // Initialize Kendo ComboBox for Currency
      $("#cmbCurrency_Institute").kendoComboBox({
        dataTextField: "Name",
        dataValueField: "Id",
        placeholder: "Select Currency",
        filter: "contains"
      });
    }
  }

  onCountryChange(e) {
    const countryId = e.sender.value();
    if (countryId) {
      // Load currency based on country selection
      this.loadCurrencyByCountry(countryId);
    }
  }

  async loadCurrencyByCountry(countryId) {
    try {
      const response = await fetch(`/api/currency/by-country/${countryId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const currencyCombo = $("#cmbCurrency_Institute").data("kendoComboBox");
          if (currencyCombo) {
            currencyCombo.setDataSource(result.data);
          }
        }
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  }

  handleLogoPreview(event) {
    const file = event.target.files[0];
    const logoThumb = document.getElementById('logoThumb');

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.showMessage('Invalid file type. Only JPEG, PNG, and GIF are allowed.', 'error');
        event.target.value = '';
        logoThumb.classList.add('d-none');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showMessage('File size must be less than 5MB.', 'error');
        event.target.value = '';
        logoThumb.classList.add('d-none');
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        logoThumb.src = e.target.result;
        logoThumb.classList.remove('d-none');
      };
      reader.readAsDataURL(file);
    } else {
      logoThumb.classList.add('d-none');
    }
  }

  handleProspectusPreview(event) {
    const file = event.target.files[0];
    const pdfName = document.getElementById('pdfName');
    const pdfPreviewBtn = document.getElementById('pdfPreviewBtn');

    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        this.showMessage('Invalid file type. Only PDF files are allowed.', 'error');
        event.target.value = '';
        pdfName.textContent = '';
        pdfPreviewBtn.classList.add('d-none');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.showMessage('File size must be less than 10MB.', 'error');
        event.target.value = '';
        pdfName.textContent = '';
        pdfPreviewBtn.classList.add('d-none');
        return;
      }

      // Show file name and preview button
      pdfName.textContent = file.name;
      pdfPreviewBtn.classList.remove('d-none');
    } else {
      pdfName.textContent = '';
      pdfPreviewBtn.classList.add('d-none');
    }
  }

  validateRequiredField(field, message) {
    const value = field.value.trim();
    const errorElement = field.parentElement.querySelector('.field-validation-error');

    if (!value) {
      if (!errorElement) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-validation-error text-danger';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
      }
      field.classList.add('is-invalid');
      return false;
    } else {
      if (errorElement) {
        errorElement.remove();
      }
      field.classList.remove('is-invalid');
      return true;
    }
  }

  validateForm() {
    let isValid = true;

    // Validate Institute Name
    const instituteName = document.getElementById('instituteName');
    if (!this.validateRequiredField(instituteName, 'Institute Name is required')) {
      isValid = false;
    }

    // Validate Country
    const countryCombo = $("#cmbCountry_Institute").data("kendoComboBox");
    if (countryCombo && !countryCombo.value()) {
      this.showMessage('Please select a Country', 'error');
      isValid = false;
    }

    // Validate email format if provided
    const email = document.getElementById('instituteEmail');
    if (email.value && !this.validateEmail(email.value)) {
      this.showMessage('Please enter a valid email address', 'error');
      isValid = false;
    }

    // Validate website format if provided
    const website = document.getElementById('website');
    if (website.value && !this.validateURL(website.value)) {
      this.showMessage('Please enter a valid website URL', 'error');
      isValid = false;
    }

    return isValid;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async saveOrUpdateItem() {
    try {
      // Show loading state
      this.setLoadingState(true);

      // Validate form
      if (!this.validateForm()) {
        this.setLoadingState(false);
        return;
      }

      // Prepare form data
      const formData = this.prepareFormData();

      // Determine API endpoint and method
      const url = this.isEditMode ?
        `${this.apiBaseUrl}/${this.currentInstituteId}` :
        this.apiBaseUrl;

      const method = this.isEditMode ? 'PUT' : 'POST';

      // Make API call
      const response = await fetch(url, {
        method: method,
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.showMessage(result.message || 'Institute saved successfully!', 'success');

        // Update UI
        this.updateButtonText();
        this.currentInstituteId = result.data.instituteId;
        this.isEditMode = true;

        // Optionally refresh any grids or lists
        this.refreshInstituteList();

      } else {
        this.showMessage(result.message || 'An error occurred while saving the institute.', 'error');
      }

    } catch (error) {
      console.error('Error saving institute:', error);
      this.showMessage('An unexpected error occurred. Please try again.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  prepareFormData() {
    const formData = new FormData();

    // Add basic fields
    formData.append('InstituteId', this.currentInstituteId || 0);
    formData.append('InstituteName', document.getElementById('instituteName').value);
    formData.append('InstituteCode', document.getElementById('instituteCode').value);
    formData.append('Campus', document.getElementById('campus').value);
    formData.append('Website', document.getElementById('website').value);
    formData.append('InstituteEmail', document.getElementById('instituteEmail').value);
    formData.append('InstitutePhoneNo', document.getElementById('institutePhoneNo').value);
    formData.append('InstituteMobileNo', document.getElementById('instituteMobileNo').value);
    formData.append('InstituteAddress', document.getElementById('instituteAddress').value);

    // Add numeric fields
    const monthlyLivingCost = document.getElementById('monthlyLivingCost').value;
    if (monthlyLivingCost) {
      formData.append('MonthlyLivingCost', monthlyLivingCost);
    }

    const applicationFee = document.getElementById('applicationFee').value;
    if (applicationFee) {
      formData.append('ApplicationFee', applicationFee);
    }

    // Add dropdown values
    const instituteTypeCombo = $("#cmbInstituteType").data("kendoComboBox");
    if (instituteTypeCombo && instituteTypeCombo.value()) {
      formData.append('InstituteTypeId', instituteTypeCombo.value());
    }

    const countryCombo = $("#cmbCountry_Institute").data("kendoComboBox");
    if (countryCombo && countryCombo.value()) {
      formData.append('CountryId', countryCombo.value());
    }

    const currencyCombo = $("#cmbCurrency_Institute").data("kendoComboBox");
    if (currencyCombo && currencyCombo.value()) {
      formData.append('CurrencyId', currencyCombo.value());
    }

    // Add textarea fields
    formData.append('LanguagesRequirement', document.getElementById('languagesRequirement').value);
    formData.append('InstitutionalBenefits', document.getElementById('institutionalBenefits').value);
    formData.append('PartTimeWorkDetails', document.getElementById('partTimeWorkDetails').value);
    formData.append('ScholarshipsPolicy', document.getElementById('scholarshipsPolicy').value);
    formData.append('InstitutionStatusNotes', document.getElementById('institutionStatusNotes').value);

    // Add checkbox values
    formData.append('Status', document.getElementById('chkStatusInstitute').checked);
    formData.append('IsLanguageMandatory', document.getElementById('isLanguageMandatory').checked);

    // Add files
    const logoFile = document.getElementById('institutionLogoFile').files[0];
    if (logoFile) {
      formData.append('InstitutionLogoFile', logoFile);
    }

    const prospectusFile = document.getElementById('prospectusFile').files[0];
    if (prospectusFile) {
      formData.append('InstitutionProspectusFile', prospectusFile);
    }

    return formData;
  }

  async loadInstituteForEdit(instituteId) {
    try {
      this.setLoadingState(true);

      const response = await fetch(`${this.apiBaseUrl}/${instituteId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        this.populateForm(result.data);
        this.currentInstituteId = instituteId;
        this.isEditMode = true;
        this.updateButtonText();
      } else {
        this.showMessage(result.message || 'Error loading institute data.', 'error');
      }
    } catch (error) {
      console.error('Error loading institute:', error);
      this.showMessage('Error loading institute data.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  populateForm(data) {
    // Populate basic fields
    document.getElementById('instituteName').value = data.instituteName || '';
    document.getElementById('instituteCode').value = data.instituteCode || '';
    document.getElementById('campus').value = data.campus || '';
    document.getElementById('website').value = data.website || '';
    document.getElementById('instituteEmail').value = data.instituteEmail || '';
    document.getElementById('institutePhoneNo').value = data.institutePhoneNo || '';
    document.getElementById('instituteMobileNo').value = data.instituteMobileNo || '';
    document.getElementById('instituteAddress').value = data.instituteAddress || '';
    document.getElementById('monthlyLivingCost').value = data.monthlyLivingCost || '';
    document.getElementById('applicationFee').value = data.applicationFee || '';

    // Populate textareas
    document.getElementById('languagesRequirement').value = data.languagesRequirement || '';
    document.getElementById('institutionalBenefits').value = data.institutionalBenefits || '';
    document.getElementById('partTimeWorkDetails').value = data.partTimeWorkDetails || '';
    document.getElementById('scholarshipsPolicy').value = data.scholarshipsPolicy || '';
    document.getElementById('institutionStatusNotes').value = data.institutionStatusNotes || '';

    // Populate checkboxes
    document.getElementById('chkStatusInstitute').checked = data.status || false;
    document.getElementById('IsLanguageMandatory').checked = data.isLanguageMandatory || false;

    // Populate Kendo ComboBoxes
    const instituteTypeCombo = $("#cmbInstituteType").data("kendoComboBox");
    if (instituteTypeCombo && data.instituteTypeId) {
      instituteTypeCombo.value(data.instituteTypeId);
    }

    const countryCombo = $("#cmbCountry_Institute").data("kendoComboBox");
    if (countryCombo && data.countryId) {
      countryCombo.value(data.countryId);
    }

    const currencyCombo = $("#cmbCurrency_Institute").data("kendoComboBox");
    if (currencyCombo && data.currencyId) {
      currencyCombo.value(data.currencyId);
    }

    // Show existing files
    this.showExistingFiles(data);
  }

  showExistingFiles(data) {
    const logoThumb = document.getElementById('logoThumb');
    const pdfName = document.getElementById('pdfName');
    const pdfPreviewBtn = document.getElementById('pdfPreviewBtn');

    // Show existing logo
    if (data.institutionLogo) {
      logoThumb.src = `/${data.institutionLogo}`;
      logoThumb.classList.remove('d-none');
    }

    // Show existing prospectus
    if (data.institutionProspectus) {
      pdfName.textContent = 'Current Prospectus';
      pdfPreviewBtn.classList.remove('d-none');
    }
  }

  clearForm() {
    // Reset form
    document.getElementById('InstituteForm').reset();

    // Clear Kendo ComboBoxes
    const instituteTypeCombo = $("#cmbInstituteType").data("kendoComboCombo");
    if (instituteTypeCombo) {
      instituteTypeCombo.value('');
    }

    const countryCombo = $("#cmbCountry_Institute").data("kendoComboBox");
    if (countryCombo) {
      countryCombo.value('');
    }

    const currencyCombo = $("#cmbCurrency_Institute").data("kendoComboBox");
    if (currencyCombo) {
      currencyCombo.value('');
    }

    // Hide file previews
    document.getElementById('logoThumb').classList.add('d-none');
    document.getElementById('pdfName').textContent = '';
    document.getElementById('pdfPreviewBtn').classList.add('d-none');

    // Clear validation errors
    document.querySelectorAll('.field-validation-error').forEach(el => el.remove());
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    // Reset state
    this.currentInstituteId = 0;
    this.isEditMode = false;
    this.updateButtonText();
  }

  updateButtonText() {
    const button = document.getElementById('btnInstituteSaveOrUpdate');
    if (button) {
      button.textContent = this.isEditMode ? '✓ Update Institute' : '+ Add Institute';
    }
  }

  setLoadingState(isLoading) {
    const button = document.getElementById('btnInstituteSaveOrUpdate');
    if (button) {
      if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
      } else {
        button.disabled = false;
        this.updateButtonText();
      }
    }
  }

  showMessage(message, type = 'info') {
    // Using Kendo UI Notification if available
    if (typeof kendo !== 'undefined' && kendo.ui.Notification) {
      const notification = new kendo.ui.Notification();
      notification.show(message, type);
    } else {
      // Fallback to alert or custom notification
      alert(message);
    }
  }

  refreshInstituteList() {
    // Refresh any data grids or lists that show institutes
    // This method should be implemented based on your UI structure
    if (typeof window.refreshInstituteGrid === 'function') {
      window.refreshInstituteGrid();
    }
  }
}

// Initialize the manager when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  window.InstituteDetailsManager = new InstituteDetailsManager();
});

// Helper class for additional functionality
class InstituteDetailsHelper {
  static openInstituteTypePopup() {
    // Open Institute Type popup
    const popup = document.getElementById('InstituteTypePopUp_Institute');
    if (popup) {
      // Use Kendo Window or custom modal
      this.openPopup(popup, 'Institute Type');
    }
  }

  static openCountryPopup() {
    // Open Country popup
    const popup = document.getElementById('CountryPopUp_Institute');
    if (popup) {
      this.openPopup(popup, 'Country');
    }
  }

  static openCurrencyPopup() {
    // Open Currency popup
    const popup = document.getElementById('CurrencyPopUp_Institute');
    if (popup) {
      this.openPopup(popup, 'Currency');
    }
  }

  static openPopup(element, title) {
    // Using Kendo Window
    if (typeof kendo !== 'undefined') {
      const window = $(element).kendoWindow({
        title: title,
        modal: true,
        width: 800,
        height: 600,
        resizable: false
      });
      window.data('kendoWindow').center().open();
    }
  }

  static clearForm() {
    if (window.InstituteDetailsManager) {
      window.InstituteDetailsManager.clearForm();
    }
  }

  static openPreview(type) {
    // Open file preview
    if (type === 'pdf') {
      const fileInput = document.getElementById('prospectusFile');
      const file = fileInput.files[0];

      if (file) {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
      }
    }
  }
}