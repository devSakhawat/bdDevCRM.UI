/*=========================================================
 * CRM Application Service
 * File: CRMApplicationService.js
 * Description: Handles CRM Application API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CRMApplicationService = {
  
  // Get application summary
  getApplicationSummary: function() {
    return BaseManager.createGridDataSource({
      apiUrl: AppConfig.getApiUrl() + "/crm-application-summary",
      requestType: "POST",
      async: true,
      modelFields: { 
        ApplicationDate: { type: "date" },
        CreatedDate: { type: "date" }
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

  // Get application by ID
  getApplicationById: async function(applicationId) {
    return await BaseManager.getById(
      "/crm-application",
      applicationId,
      "Failed to load application details"
    );
  },

  // Create new application
  createApplication: async function(applicationData, onSuccess, onError) {
    return await BaseManager.saveOrUpdate({
      id: 0,
      endpoint: "/crm-application",
      data: JSON.stringify(applicationData),
      confirmMsg: "Do you want to submit this application?",
      successMsg: "Application submitted successfully.",
      gridId: "gridSummaryApplication",
      onSuccess: onSuccess,
      onError: onError
    });
  },

  // Update application
  updateApplication: async function(applicationId, applicationData, onSuccess, onError) {
    return await BaseManager.saveOrUpdate({
      id: applicationId,
      endpoint: "/crm-application",
      data: JSON.stringify(applicationData),
      confirmMsg: "Do you want to update this application?",
      successMsg: "Application updated successfully.",
      gridId: "gridSummaryApplication",
      onSuccess: onSuccess,
      onError: onError
    });
  },

  // Delete application
  deleteApplication: async function(applicationId, onSuccess, onError) {
    return await BaseManager.deleteItem({
      id: applicationId,
      endpoint: "/crm-application",
      itemName: "application",
      gridId: "gridSummaryApplication",
      onSuccess: onSuccess,
      onError: onError
    });
  },

  // Update application status
  updateApplicationStatus: async function(applicationId, status, onSuccess, onError) {
    return await BaseManager.saveOrUpdate({
      id: applicationId,
      endpoint: "/crm-application/status",
      data: JSON.stringify({ ApplicationId: applicationId, Status: status }),
      confirmMsg: `Do you want to change the status to ${status}?`,
      successMsg: "Application status updated successfully.",
      gridId: "gridSummaryApplication",
      onSuccess: onSuccess,
      onError: onError
    });
  }
};
