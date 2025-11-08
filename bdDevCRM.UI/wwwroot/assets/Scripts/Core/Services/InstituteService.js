/*=========================================================
 * Institute Service
 * File: InstituteService.js
 * Description: Handles all Institute-related API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var InstituteService = {
  
  // Get institute summary (grid data)
  getInstituteSummary: function() {
    return BaseManager.createGridDataSource({
      apiUrl: AppConfig.getApiUrl() + AppConfig.endpoints.instituteSummary,
      requestType: "POST",
      async: true,
      modelFields: { 
        CreatedDate: { type: "date" },
        EstablishedDate: { type: "date" }
      },
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: "Data.Items",
      schemaTotal: "Data.TotalCount"
    });
  },

  // Get institute by ID
  getInstituteById: async function(instituteId) {
    return await BaseManager.getById(
      AppConfig.endpoints.institute,
      instituteId,
      "Failed to load institute details"
    );
  },

  // Get institute dropdown data
  getInstituteDropdown: async function() {
    return await BaseManager.fetchData(
      AppConfig.endpoints.instituteDropdown,
      "Failed to load institute list"
    );
  },

  // Create new institute
  createInstitute: async function(formData, onSuccess, onError) {
    return await BaseManager.saveOrUpdate({
      id: 0,
      endpoint: AppConfig.endpoints.institute,
      data: formData,
      isFormData: true,
      confirmMsg: "Do you want to save this institute?",
      successMsg: "Institute saved successfully.",
      gridId: "gridSummaryInstitute",
      onSuccess: onSuccess,
      onError: onError
    });
  },

  // Update existing institute
  updateInstitute: async function(instituteId, formData, onSuccess, onError) {
    return await BaseManager.saveOrUpdate({
      id: instituteId,
      endpoint: AppConfig.endpoints.institute,
      data: formData,
      isFormData: true,
      confirmMsg: "Do you want to update this institute?",
      successMsg: "Institute updated successfully.",
      gridId: "gridSummaryInstitute",
      onSuccess: onSuccess,
      onError: onError
    });
  },

  // Delete institute
  deleteInstitute: async function(instituteId, onSuccess, onError) {
    return await BaseManager.deleteItem({
      id: instituteId,
      endpoint: AppConfig.endpoints.institute,
      itemName: "institute",
      gridId: "gridSummaryInstitute",
      onSuccess: onSuccess,
      onError: onError
    });
  }
};
