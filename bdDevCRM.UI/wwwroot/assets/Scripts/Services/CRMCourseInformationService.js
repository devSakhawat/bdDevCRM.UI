/*=========================================================
 * CRM Application Service
 * File: CRMApplicationService.js
 * Description: Handles CRM Application API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CRMApplicationService = GenericService.createService({
  entityName: "Application",
  endpoint: "/crm-application",
  summaryEndpoint: "/crm-application-summary",
  dropdownEndpoint: "/crm-application-ddl",
  gridId: "gridSummaryApplication",
  modelFields: {
    ApplicationDate: { type: "date" },
    CreatedDate: { type: "date" }
  },
  useFormData: false,
  cacheTime: 5 * 60 * 1000 // 5 minutes
});

// Custom method for updating application status
CRMApplicationService.updateApplicationStatus = async function (applicationId, status, onSuccess, onError) {
  return await this.customPost(
    "/status",
    { ApplicationId: applicationId, Status: status },
    "Failed to update application status"
  ).then(result => {
    ToastrMessage.showSuccess("Application status updated successfully.");
    if (onSuccess) onSuccess(result);
    return result;
  }).catch(error => {
    if (onError) onError(error);
    throw error;
  });
};

// Backward compatibility
CRMApplicationService.getApplicationSummary = function () {
  return this.getGridDataSource();
};

CRMApplicationService.getApplicationById = async function (applicationId) {
  return await this.getById(applicationId);
};

CRMApplicationService.createApplication = async function (applicationData, onSuccess, onError) {
  return await this.create(applicationData, {
    confirmMsg: "Do you want to submit this application?",
    successMsg: "Application submitted successfully.",
    onSuccess,
    onError
  });
};

CRMApplicationService.updateApplication = async function (applicationId, applicationData, onSuccess, onError) {
  return await this.update(applicationId, applicationData, { onSuccess, onError });
};

CRMApplicationService.deleteApplication = async function (applicationId, onSuccess, onError) {
  return await this.delete(applicationId, { onSuccess, onError });
};