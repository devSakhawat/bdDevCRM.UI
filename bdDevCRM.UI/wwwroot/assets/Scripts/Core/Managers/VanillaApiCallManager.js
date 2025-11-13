/*=========================================================
 * Vanilla API Call Manager
 * File: VanillaApiCallManager.js
 * Description: Handles all API calls using Fetch API
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var VanillaApiManager = {
  
  // Base request method with proper error handling
  request: async function(baseUrl, endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    const token = AppConfig.getToken();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      ...options
    };

    // Merge headers properly
    if (options.headers) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        ...options.headers
      };
    }

    try {
      const response = await fetch(url, defaultOptions);
      
      // Handle HTTP errors
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            Message: response.statusText,
            StatusCode: response.status
          };
        }
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
          errorData.Message = "Unauthorized. Please login again.";
          // Redirect to login after showing error
          setTimeout(() => {
            AppConfig.clearStorage();
            window.location.href = AppConfig.ui.baseUrl + "/Home/Login";
          }, 2000);
        }
        
        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },

  // GET method
  get: async function(baseUrl, endpoint) {
    return await this.request(baseUrl, endpoint, {
      method: 'GET'
    });
  },

  // POST method
  post: async function(baseUrl, endpoint, data) {
    return await this.request(baseUrl, endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // PUT method
  put: async function(baseUrl, endpoint, data) {
    return await this.request(baseUrl, endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // DELETE method
  delete: async function(baseUrl, endpoint) {
    return await this.request(baseUrl, endpoint, {
      method: 'DELETE'
    });
  },

  // Generic request for multipart/form-data and other types
  SendRequestVanilla: async function(baseUrl, endpoint, data, httpMethod) {
    const url = `${baseUrl}${endpoint}`;
    const token = AppConfig.getToken();
    
    const options = {
      method: httpMethod.toUpperCase(),
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };

    // Handle FormData vs JSON
    if (data instanceof FormData) {
      options.body = data;
      // Don't set Content-Type for FormData - browser will set it with boundary
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            Message: response.statusText,
            StatusCode: response.status
          };
        }
        throw errorData;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },

  // Enhanced error handler
  handleApiError: function(error) {
    console.error("API Error:", error);
    
    let errorMessage = "An unexpected error occurred";
    let errorDetails = null;

    // Parse error based on type
    if (typeof error === 'string') {
      try {
        errorDetails = JSON.parse(error);
      } catch {
        errorMessage = error;
      }
    } else if (error && error.Message) {
      errorMessage = error.Message;
      errorDetails = error;
    } else if (error && error.message) {
      errorMessage = error.message;
    }

    // Handle specific HTTP status codes
    if (errorDetails && errorDetails.StatusCode) {
      switch (errorDetails.StatusCode) {
        case 400:
          errorMessage = errorDetails.Message || "Bad request. Please check your input.";
          break;
        case 401:
          errorMessage = "Unauthorized. Please login again.";
          break;
        case 403:
          errorMessage = "Access forbidden. You don't have permission.";
          break;
        case 404:
          errorMessage = "Resource not found.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        case 503:
          errorMessage = "Service unavailable. Please try again later.";
          break;
      }
    }

    // Show error notification
    if (typeof ToastrMessage !== 'undefined') {
      ToastrMessage.showError(errorMessage);
    } else if (typeof toastr !== 'undefined') {
      toastr.error(errorMessage);
    } else {
      alert(errorMessage);
    }

    return {
      IsSuccess: false,
      Message: errorMessage,
      Details: errorDetails
    };
  },

  // Generic Grid DataSource with better error handling
  GenericGridDataSource: function(options) {
    const defaultOptions = {
      apiUrl: '',
      requestType: 'POST',
      async: true,
      modelFields: {},
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: 'Data.Items',
      schemaTotal: 'Data.TotalCount'
    };

    const config = { ...defaultOptions, ...options };

    return new kendo.data.DataSource({
      type: "json",
      transport: {
        read: {
          url: config.apiUrl,
          type: config.requestType,
          dataType: "json",
          contentType: "application/json",
          beforeSend: function(xhr) {
            const token = AppConfig.getToken();
            if (token) {
              xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
          }
        },
        parameterMap: function(data, operation) {
          if (operation === "read") {
            return JSON.stringify({
              Skip: data.skip || 0,
              Take: data.take || config.pageSize,
              Page: data.page || 1,
              PageSize: data.pageSize || config.pageSize,
              Sort: data.sort || null,
              Filter: data.filter || null
            });
          }
          return data;
        }
      },
      schema: {
        data: function(response) {
          if (response && response.IsSuccess && response.Data) {
            return response.Data.Items || [];
          }
          return [];
        },
        total: function(response) {
          if (response && response.IsSuccess && response.Data) {
            return response.Data.TotalCount || 0;
          }
          return 0;
        },
        errors: function(response) {
          if (response && response.IsSuccess === false) {
            return response.Message || "An error occurred";
          }
          return null;
        },
        model: {
          fields: config.modelFields
        }
      },
      pageSize: config.pageSize,
      serverPaging: config.serverPaging,
      serverSorting: config.serverSorting,
      serverFiltering: config.serverFiltering,
      sort: config.allowUnsort ? { allowUnsort: true } : undefined,
      error: function(e) {
        console.error("DataSource Error:", e);
        if (e.xhr) {
          VanillaApiCallManager.handleApiError(e.xhr);
        } else {
          VanillaApiCallManager.handleApiError(e);
        }
      }
    });
  }
};

// ================================
/*=========================================================
 * Vanilla API Call Manager
 * File: VanillaApiCallManager.js
 * Description: Handles all API calls using Fetch API
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var VanillaApiManager2 = {

  // Base request method with proper error handling
  request: async function (baseUrl, endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    const token = AppConfig.getToken();

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      ...options
    };

    // Merge headers properly
    if (options.headers) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        ...options.headers
      };
    }

    try {
      const response = await fetch(url, defaultOptions);

      // Handle HTTP errors
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            Message: response.statusText,
            StatusCode: response.status
          };
        }

        // Handle 401 Unauthorized
        if (response.status === 401) {
          errorData.Message = "Unauthorized. Please login again.";
          // Redirect to login after showing error
          setTimeout(() => {
            AppConfig.clearStorage();
            window.location.href = AppConfig.ui.baseUrl + "/Home/Login";
          }, 2000);
        }

        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },

  // GET method
  get: async function (baseUrl, endpoint) {
    return await this.request(baseUrl, endpoint, {
      method: 'GET'
    });
  },

  // POST method
  post: async function (baseUrl, endpoint, data) {
    return await this.request(baseUrl, endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // PUT method
  put: async function (baseUrl, endpoint, data) {
    return await this.request(baseUrl, endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // DELETE method
  delete: async function (baseUrl, endpoint) {
    return await this.request(baseUrl, endpoint, {
      method: 'DELETE'
    });
  },

  // Generic request for multipart/form-data and other types
  SendRequestVanilla: async function (baseUrl, endpoint, data, httpMethod) {
    const url = `${baseUrl}${endpoint}`;
    const token = AppConfig.getToken();

    const options = {
      method: httpMethod.toUpperCase(),
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };

    // Handle FormData vs JSON
    if (data instanceof FormData) {
      options.body = data;
      // Don't set Content-Type for FormData - browser will set it with boundary
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            Message: response.statusText,
            StatusCode: response.status
          };
        }
        throw errorData;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },

  // Enhanced error handler
  handleApiError: function (error) {
    console.error("API Error:", error);

    let errorMessage = "An unexpected error occurred";
    let errorDetails = null;

    // Parse error based on type
    if (typeof error === 'string') {
      try {
        errorDetails = JSON.parse(error);
      } catch {
        errorMessage = error;
      }
    } else if (error && error.Message) {
      errorMessage = error.Message;
      errorDetails = error;
    } else if (error && error.message) {
      errorMessage = error.message;
    }

    // Handle specific HTTP status codes
    if (errorDetails && errorDetails.StatusCode) {
      switch (errorDetails.StatusCode) {
        case 400:
          errorMessage = errorDetails.Message || "Bad request. Please check your input.";
          break;
        case 401:
          errorMessage = "Unauthorized. Please login again.";
          break;
        case 403:
          errorMessage = "Access forbidden. You don't have permission.";
          break;
        case 404:
          errorMessage = "Resource not found.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        case 503:
          errorMessage = "Service unavailable. Please try again later.";
          break;
      }
    }

    // Show error notification
    if (typeof ToastrMessage !== 'undefined') {
      ToastrMessage.showError(errorMessage);
    } else if (typeof toastr !== 'undefined') {
      toastr.error(errorMessage);
    } else {
      alert(errorMessage);
    }

    return {
      IsSuccess: false,
      Message: errorMessage,
      Details: errorDetails
    };
  },

  // Generic Grid DataSource with better error handling
  GenericGridDataSource: function (options) {
    const defaultOptions = {
      apiUrl: '',
      requestType: 'POST',
      async: true,
      modelFields: {},
      pageSize: 20,
      serverPaging: true,
      serverSorting: true,
      serverFiltering: true,
      allowUnsort: true,
      schemaData: 'Data.Items',
      schemaTotal: 'Data.TotalCount'
    };

    const config = { ...defaultOptions, ...options };

    return new kendo.data.DataSource({
      type: "json",
      transport: {
        read: {
          url: config.apiUrl,
          type: config.requestType,
          dataType: "json",
          contentType: "application/json",
          beforeSend: function (xhr) {
            const token = AppConfig.getToken();
            if (token) {
              xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
          }
        },
        parameterMap: function (data, operation) {
          if (operation === "read") {
            return JSON.stringify({
              Skip: data.skip || 0,
              Take: data.take || config.pageSize,
              Page: data.page || 1,
              PageSize: data.pageSize || config.pageSize,
              Sort: data.sort || null,
              Filter: data.filter || null
            });
          }
          return data;
        }
      },
      schema: {
        data: function (response) {
          if (response && response.IsSuccess && response.Data) {
            return response.Data.Items || [];
          }
          return [];
        },
        total: function (response) {
          if (response && response.IsSuccess && response.Data) {
            return response.Data.TotalCount || 0;
          }
          return 0;
        },
        errors: function (response) {
          if (response && response.IsSuccess === false) {
            return response.Message || "An error occurred";
          }
          return null;
        },
        model: {
          fields: config.modelFields
        }
      },
      pageSize: config.pageSize,
      serverPaging: config.serverPaging,
      serverSorting: config.serverSorting,
      serverFiltering: config.serverFiltering,
      sort: config.allowUnsort ? { allowUnsort: true } : undefined,
      error: function (e) {
        console.error("DataSource Error:", e);
        if (e.xhr) {
          VanillaApiCallManager.handleApiError(e.xhr);
        } else {
          VanillaApiCallManager.handleApiError(e);
        }
      }
    });
  }
};

