/*=========================================================
 * Base Manager
 * File: BaseManager.js
 * Description: Base CRUD operations for all modules
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var BaseManager = {
  
  // Standard fetch with error handling
  fetchData: async function(endpoint, errorMsg = "Failed to load data") {
    try {
      const response = await VanillaApiCallManager.get(AppConfig.getApiUrl(), endpoint);
      
      if (response && response.IsSuccess === true) {
        return response.Data;
      }
      throw new Error(errorMsg);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      VanillaApiCallManager.handleApiError(error);
      throw error;
    }
  },

  // Fetch with custom base URL
  fetchDataWithUrl: async function(baseUrl, endpoint, errorMsg = "Failed to load data") {
    try {
      const response = await VanillaApiCallManager.get(baseUrl, endpoint);
      
      if (response && response.IsSuccess === true) {
        return response.Data;
      }
      throw new Error(errorMsg);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      VanillaApiCallManager.handleApiError(error);
      throw error;
    }
  },

  // Standard save/update with confirmation
  saveOrUpdate: async function(config) {
    const {
      id,
      endpoint,
      data,
      onSuccess,
      onError,
      isFormData = false,
      confirmMsg,
      successMsg,
      gridId = null
    } = config;

    const isCreate = !id || id == 0;
    const serviceUrl = isCreate ? endpoint : `${endpoint}/${id}`;
    const httpMethod = isCreate ? "POST" : "PUT";
    const finalConfirmMsg = confirmMsg || (isCreate ? "Do you want to save this information?" : "Do you want to update this information?");
    const finalSuccessMsg = successMsg || (isCreate ? "Data saved successfully." : "Data updated successfully.");

    return new Promise((resolve, reject) => {
      CommonManager.MsgBox(
        "info",
        "center",
        "Confirmation",
        finalConfirmMsg,
        [
          {
            addClass: "btn btn-primary",
            text: "Yes",
            onClick: async function($noty) {
              $noty.close();
              try {
                const response = await VanillaApiCallManager.SendRequestVanilla(
                  AppConfig.getApiUrl(),
                  serviceUrl,
                  data,
                  httpMethod
                );

                if (response && (response.IsSuccess === true || response === "Success")) {
                  ToastrMessage.showSuccess(finalSuccessMsg);
                  
                  // Refresh grid if provided
                  if (gridId && $("#" + gridId).length > 0) {
                    $("#" + gridId).data("kendoGrid").dataSource.read();
                  }
                  
                  if (onSuccess) onSuccess(response);
                  resolve(response);
                } else {
                  throw new Error(response.Message || "Operation failed");
                }
              } catch (error) {
                console.error("Save/Update error:", error);
                VanillaApiCallManager.handleApiError(error);
                if (onError) onError(error);
                reject(error);
              }
            }
          },
          {
            addClass: "btn btn-secondary",
            text: "Cancel",
            onClick: function($noty) {
              $noty.close();
              reject(new Error("Operation cancelled"));
            }
          }
        ],
        0
      );
    });
  },

  // Standard delete with confirmation
  deleteItem: async function(config) {
    const {
      id,
      endpoint,
      itemName = "item",
      onSuccess,
      onError,
      gridId = null
    } = config;

    const serviceUrl = `${endpoint}/${id}`;

    return new Promise((resolve, reject) => {
      CommonManager.MsgBox(
        "warning",
        "center",
        "Delete Confirmation",
        `Are you sure you want to delete this ${itemName}?`,
        [
          {
            addClass: "btn btn-danger",
            text: "Yes, Delete",
            onClick: async function($noty) {
              $noty.close();
              try {
                const response = await VanillaApiCallManager.delete(
                  AppConfig.getApiUrl(),
                  serviceUrl
                );

                if (response && response.IsSuccess === true) {
                  ToastrMessage.showSuccess(`${itemName} deleted successfully.`);
                  
                  // Refresh grid if provided
                  if (gridId && $("#" + gridId).length > 0) {
                    $("#" + gridId).data("kendoGrid").dataSource.read();
                  }
                  
                  if (onSuccess) onSuccess(response);
                  resolve(response);
                } else {
                  throw new Error(response.Message || "Delete failed");
                }
              } catch (error) {
                console.error("Delete error:", error);
                VanillaApiCallManager.handleApiError(error);
                if (onError) onError(error);
                reject(error);
              }
            }
          },
          {
            addClass: "btn btn-secondary",
            text: "Cancel",
            onClick: function($noty) {
              $noty.close();
              reject(new Error("Delete cancelled"));
            }
          }
        ],
        0
      );
    });
  },

  // Get single item by ID
  getById: async function(endpoint, id, errorMsg = "Failed to load item") {
    try {
      const response = await VanillaApiCallManager.get(
        AppConfig.getApiUrl(), 
        `${endpoint}/${id}`
      );
      
      if (response && response.IsSuccess === true) {
        return response.Data;
      }
      throw new Error(errorMsg);
    } catch (error) {
      console.error(`Error fetching item by ID ${id}:`, error);
      VanillaApiCallManager.handleApiError(error);
      throw error;
    }
  },

  // Create grid data source
  createGridDataSource: function(config) {
    return VanillaApiCallManager.GenericGridDataSource(config);
  }
};
