/*=========================================================
 * Institute Service
 * File: InstituteService.js
 * Description: Handles all Institute-related API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var InstituteService = GenericService.createService({
  entityName: "Institute",
  endpoint: "/crm-institute",
  summaryEndpoint: "/crm-institute-summary",
  dropdownEndpoint: "/crm-institute-ddl",
  gridId: "gridSummaryInstitute",
  modelFields: {
    CreatedDate: { type: "date" },
    EstablishedDate: { type: "date" }
  },
  useFormData: true, // Institute uses FormData for file uploads
  cacheTime: 10 * 60 * 1000 // 10 minutes
});

// Backward compatibility methods
InstituteService.getInstituteSummary = function () {
  return this.getGridDataSource();
};

InstituteService.getInstituteDropdown = async function () {
  return await this.getDropdownCached();
};

InstituteService.createInstitute = async function (formData, onSuccess, onError) {
  return await this.create(formData, { onSuccess, onError });
};

InstituteService.updateInstitute = async function (instituteId, formData, onSuccess, onError) {
  return await this.update(instituteId, formData, { onSuccess, onError });
};

InstituteService.deleteInstitute = async function (instituteId, onSuccess, onError) {
  return await this.delete(instituteId, { onSuccess, onError });
};