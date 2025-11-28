/// <reference path="../../libs/jquery/dist/jquery.js" />

//var reportServerAPI = "http://localhost:5724/";
//var baseUI = "https://localhost:7145/"

var customFilterManu = {
  extra: true,
  operators: {
    string: {
      contains: "Contains",
      startswith: "Starts with",
      eq: "Is equal to",
      neq: "Is not equal to"
    }
  }
}

var LoggedInUserName = '';
var serviceRoot = "..";
// CurrentUser from common.js file > getCurrentUser function
var CurrentUser = null;
var baseApiFilePath = "https://localhost:7290"
var baseApi = "https://localhost:7290/bdDevs-crm";
var baseUI = "https://localhost:7145/"
var token = null;

var AjaxManager = {

  getDefaultHeaders: function () {
    TokenManger.CheckToken();
    return {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
  },

  validateAndGetHeaders: function (providedHeaders) {
    var defaultHeaders = this.getDefaultHeaders();


    if (!providedHeaders) {
      return defaultHeaders;
    }


    var hasAuth = providedHeaders.hasOwnProperty("Authorization");
    var hasAccept = providedHeaders.hasOwnProperty("Accept");


    if (hasAuth && hasAccept) {
      return providedHeaders;
    }


    var mergedHeaders = { ...providedHeaders };

    if (!hasAuth) {
      mergedHeaders["Authorization"] = defaultHeaders["Authorization"];
    }

    if (!hasAccept) {
      mergedHeaders["Accept"] = defaultHeaders["Accept"];
    }

    return mergedHeaders;
  },

  // Generic error handler for AJAX requests
  handleAjaxError: function (xhr, status, error) {
    // Generate correlation ID for error tracking
    debugger;
    const correlationId = "err_" + Math.random().toString(36).substr(2, 9);
    console.error(`Request error: ${correlationId} - ${error}`, xhr);

    // Default error message
    let message = "An unexpected error occurred.";
    let details = null;
    let ErrorType = null;
    let messageBoxHeaderText = null;

    try {
      // Parse the response if possible
      const response = xhr.responseJSON || JSON.parse(xhr.responseText);

      // Use server-provided error message if available
      if (response && response.message) {
        message = response.message;
      }

      // Include details in development mode
      if (response && response.details) {
        details = response.details;
      }

      // Include details in development mode
      if (response && response.ErrorType) {
        ErrorType = response.ErrorType;
      }
      messageBoxHeaderText = ErrorType || "Error"

      // Special handling for 401 errors - logout the user
      if (xhr.status === 401 || xhr.responseJSON?.statusCode) {
        // Show message to user
        AjaxManager.MsgBox(
          'error',
          'center',
          messageBoxHeaderText,
          //'Confirmation',
          confmsg,
          [
            {
              addClass: 'btn btn-primary',
              text: 'Yes',
              onClick: function ($noty) {
                $noty.close();
                MenuManager.Logout();
              }
            },
            {
              addClass: 'btn',
              text: 'Cancel',
              onClick: function ($noty) {
                $noty.close();
              }
            },
          ]
          , 0
        );
        return;
      }

      // Handle specific status codes
      switch (xhr.status || xhr.responseJSON?.statusCode) {
        case 400: // Bad Request
          //MsgBox.Show({
          //  title: "Invalid Request",
          //  message: message,
          //  icon: "error"
          //});
          //break;

          ToastrMessage.showToastrNotification({
            preventDuplicates: true,
            closeButton: true,
            timeOut: 0,
            message: ErrorType + ": " + message,
            type: 'error',
          });
          break;

        case 403: // Forbidden
          //MsgBox.Show({
          //  title: "Access Denied",
          //  message: message || "You don't have permission to perform this action.",
          //  icon: "error"
          //});
          //break;

          ToastrMessage.showToastrNotification({
            preventDuplicates: true,
            closeButton: true,
            timeOut: 0,
            message: ErrorType + ": " + message || "You don't have permission to perform this action.",
            type: 'error',
          });
          break;

        case 404: // Not Found
          //MsgBox.Show({
          //  title: "Not Found",
          //  message: message || "The requested resource was not found.",
          //  icon: "warning"
          //});
          //break;

          ToastrMessage.showToastrNotification({
            preventDuplicates: true,
            closeButton: true,
            timeOut: 0,
            message: ErrorType + ": " + message || "The requested resource was not found.",
            type: 'error',
          });
          break;

        case 409: // Conflict
          //MsgBox.Show({
          //  title: "Conflict",
          //  message: message || "This operation could not be completed due to a conflict.",
          //  icon: "warning"
          //});
          //break;

          ToastrMessage.showToastrNotification({
            preventDuplicates: true,
            closeButton: true,
            timeOut: 0,
            message: ErrorType + ": " + message || "This operation could not be completed due to a conflict.",
            type: 'error',
          });
          break;

        case 500: // Server Error
          //MsgBox.Show({
          //  title: "Server Error",
          //  message: message || "An unexpected server error occurred. Please try again later.",
          //  icon: "error",
          //  details: details ? `Error ID: ${correlationId}\n${details}` : `Error ID: ${correlationId}`
          //});
          //break;

          ToastrMessage.showToastrNotification({
            preventDuplicates: true,
            closeButton: true,
            timeOut: 0,
            message: ErrorType + ": " + message || "An unexpected server error occurred. Please try again later.",
            type: 'error',
          });
          break;

        case 503: // Service Unavailable
          //MsgBox.Show({
          //  title: "Service Unavailable",
          //  message: message || "The service is currently unavailable. Please try again later.",
          //  icon: "error"
          //});
          //break;

          ToastrMessage.showToastrNotification({
            preventDuplicates: true,
            closeButton: true,
            timeOut: 0,
            message: ErrorType + ": " + message || "The service is currently unavailable. Please try again later.",
            type: 'error',
          });
          break;

        default:
          //MsgBox.Show({
          //  title: "Error",
          //  message: message,
          //  icon: "error",
          //  details: `Error ID: ${correlationId}`
          //});
          //break;

          ToastrMessage.showToastrNotification({
            preventDuplicates: true,
            closeButton: true,
            timeOut: 0,
            message: ErrorType + ": " + message || "An unexpected error occurred while processing your request.",
            type: 'error',
          });
          break;
      }
    } catch (e) {
      // Could not parse the response
      ToastrMessage.showToastrNotification({
        preventDuplicates: true,
        closeButton: true,
        timeOut: 0,
        message: ErrorType + ": " + message || "An unexpected error occurred while processing your request.",
        type: 'error',
      });
      //console.error("Error parsing error response", e);
      //MsgBox.Show({
      //  title: "Error",
      //  message: "An unexpected error occurred while processing your request.",
      //  icon: "error",
      //  details: `Status: ${xhr.status}, Error ID: ${correlationId}`
      //});
    }
  },

  GenericGridDataSource: function (options) {
    var apiUrl = options.apiUrl;
    var serverPaging = options.serverPaging !== undefined ? options.serverPaging : true;
    var serverSorting = options.serverSorting !== undefined ? options.serverSorting : true;
    var serverFiltering = options.serverFiltering !== undefined ? options.serverFiltering : true;
    var pageSize = options.pageSize || 20;
    var modelFields = options.modelFields || {};
    //var modelFields = options.modelFields || {};

    //console.log(token);

    // Create a new Kendo DataSource with dynamic configurations
    var gridDataSource = new kendo.data.DataSource({
      //type: "json",
      serverPaging: serverPaging,
      serverSorting: serverSorting,
      serverFiltering: serverFiltering,
      allowUnsort: options.allowUnsort || false,
      pageSize: pageSize,
      page: 1,
      pageable: {
        buttonCount: options.buttonCount || 5,
        input: false,
        numeric: true
      },
      transport: {
        read: {
          url: apiUrl,
          type: options.requestType || "POST", // Fixed to use requestType parameter
          dataType: "json",
          async: options.async !== undefined ? options.async : false,
          contentType: options.contentType || "application/json; charset=utf-8",
          headers: TokenManger.getDefaultApplicationJsonHeaders(),
          error: function (xhr, status, error) {
            // Use the generic error handler
            AjaxManager.handleAjaxError(xhr, status, error);

            //// For datasource error handling
            //this.success({});
          },
        },
        parameterMap: options.parameterMap || function (options) {
          // Create a new object with properly capitalized property names
          var transformedOptions = {
            Skip: options.skip,
            Take: options.take,
            Page: options.page,
            PageSize: options.pageSize,
            Filter: options.filter
          };

          // Handle the sort property separately to make sure it's properly transformed
          if (options.sort && options.sort.length > 0) {
            transformedOptions.Sort = [];
            for (var i = 0; i < options.sort.length; i++) {
              transformedOptions.Sort.push({
                field: options.sort[i].field,
                dir: options.sort[i].dir
              });
            }
          } else {
            transformedOptions.Sort = null;
          }

          //console.log("Transformed options:", transformedOptions);

          return JSON.stringify(transformedOptions);
        }
      },
      schema: {
        data: options.schemaData || "items",
        total: options.schemaTotal || "totalCount",
        // when needed
        parse: function (response) {
          if (response.items && response.items.length > 0) {
            var sampleRecord = response.items[0];
            var inferredFields = {};
            for (var key in sampleRecord) {
              if (sampleRecord.hasOwnProperty(key)) {
                if (typeof sampleRecord[key] === "number") {
                  inferredFields[key] = { type: "number" };
                } else if (typeof sampleRecord[key] === "boolean") {
                  inferredFields[key] = { type: "boolean" };
                } else if (Object.prototype.toString.call(sampleRecord[key]) === "[object Date]") {
                  inferredFields[key] = { type: "date" };
                } else {
                  inferredFields[key] = { type: "string" };
                }
              }
            }
            return { items: response.items, totalCount: response.totalCount, inferredFields: inferredFields };
          }
          return response;
        },
        model: {
          fields: modelFields
        }
      }
    });
    return gridDataSource;
  },

  GetDataSource: function (serviceUrl, jsonParams) {
    var objResult = new Object();
    $.ajax({
      type: "GET",
      async: false,
      cache: false,
      url: serviceUrl,
      data: jsonParams,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: AjaxManager.getDefaultHeaders(),
      success: function (jsonResult) {
        objResult = jsonResult;
      },
      error: function (error) {
        window.alert(error.statusText);
      }
    });

    return objResult;
  },

  //MVC call
  GetJsonResult: function (serviceUrl, jsonParams, isAsync, isCache, successCallback, errorCallback) {
    $.ajax({
      type: "GET",
      async: isAsync,
      cache: isCache,
      url: serviceUrl,
      data: jsonParams,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: successCallback,
      error: errorCallback
    });
  },

  GetAsyncData: function (serviceUrl, jsonParams, successCallback) {
    $.ajax({
      type: "GET",
      async: true,
      cache: true,
      url: serviceUrl,
      data: jsonParams,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: successCallback,
      error: function (error) {
        Message.Error(error.statusText);
      }
    });
  },

  GetApiData: function (serviceUrl, jsonParams, successCallback) {
    var apiPath = assembly.ApiPath;

    $.ajax({
      type: "GET",
      async: true,
      cache: true,
      headers: { 'Request-Type': 'EmpressWeb/1' },
      url: apiPath + serviceUrl,
      data: jsonParams,
      contentType: "application/json; charset=utf-8",
      dataType: "jsonp",
      success: successCallback,
      error: function (error) {
        //Message.Error(error.statusText);
        console.log(error.statusText);
      }
    });
  },

  GetJsonResults: function (serviceUrl, jsonParams) {
    var obj = new Object();
    $.ajax({
      type: "GET",
      async: false,
      cache: false,
      url: serviceUrl,
      data: jsonParams,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (jsonData) {
        obj = jsonData;
      },
      error: function () {
        alert("Internal Server Error");
      }


    });
    return obj;
  },

  SendFormDataAjax: async function (baseApi, serviceUrl, jsonParams, httpType) {
    var token = localStorage.getItem("jwtToken");
    if (!token) {
      AjaxManager.MsgBox(
        'error',
        'center',
        'Authentication Failed!',
        "Please log in first!",
        [
          { addClass: 'btn btn-primary', text: 'Yes', onClick: ($noty) => $noty.close() },
          { addClass: 'btn', text: 'Cancel', onClick: ($noty) => $noty.close() }
        ],
        0
      );
      return Promise.reject("No token found");
    }

    try {

      const response = await $.ajax({
        type: httpType,
        url: baseApi + serviceUrl,
        data: jsonParams,
        crossDomain: true,
        processData: false,
        contentType: false,
        enctype: "multipart/form-data",
        headers: TokenManger.getDefaultFormDataHeaders(),
      });

      return Promise.resolve(response);

    } catch (xhr) {
      return Promise.reject(xhr);
    }
  },

  PostDataAjax: async function (baseApi, serviceUrl, jsonParams, httpType) {
    var token = localStorage.getItem("jwtToken");
    if (!token) {
      AjaxManager.MsgBox(
        'error',
        'center',
        'Authentication Failed!',
        "Please log in first!",
        [
          { addClass: 'btn btn-primary', text: 'Yes', onClick: ($noty) => $noty.close() },
          { addClass: 'btn', text: 'Cancel', onClick: ($noty) => $noty.close() }
        ],
        0
      );
      return Promise.reject("No token found");
    }

    try {
      const isFormData = jsonParams instanceof FormData;

      const response = await $.ajax({
        type: httpType,
        url: baseApi + serviceUrl,
        data: jsonParams,
        crossDomain: true,
        processData: !isFormData ? true : false,
        contentType: !isFormData ? "application/json; charset=utf-8" : false,
        headers: !isFormData ? TokenManger.getDefaultApplicationJsonHeaders() : TokenManger.getDefaultFormDataHeaders()
      });

      return Promise.resolve(response);

    } catch (xhr) {
      return Promise.reject(xhr);
    }
  },

  // send json params without stringify.
  SendRequestAjax: async function (baseApi, serviceUrl, jsonParams, httpType) {
    var token = localStorage.getItem("jwtToken");
    if (!token) {
      AjaxManager.MsgBox(
        'error', 'center', 'Authentication Failed!',
        "Please log in first!",
        [{ addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }],
        0
      );
      return Promise.reject("No token found");
    }

    try {
      const isFormData = jsonParams instanceof FormData;

      const response = await $.ajax({
        type: httpType,
        url: baseApi + serviceUrl,
        data: jsonParams,
        crossDomain: true,
        processData: !isFormData ? true : false,
        contentType: !isFormData ? "application/json; charset=utf-8" : false,
        headers: !isFormData ? TokenManger.getDefaultApplicationJsonHeaders() : TokenManger.getDefaultFormDataHeaders()
      });

      // special settings For FormData
      if (isFormData) {
        ajaxSettings.processData = false;
        ajaxSettings.contentType = false;
      } else {
        ajaxSettings.data = JSON.stringify(jsonParams);
        ajaxSettings.contentType = "application/json; charset=utf-8";
        ajaxSettings.processData = true;
      }

      response = await $.ajax(ajaxSettings);
      return Promise.resolve(response);

    } catch (xhr) {
      console.error("Ajax Error:", xhr);
      return Promise.reject(xhr);
    }
  },

  SendRequestAjaxOld: async function (baseApi, serviceUrl, jsonParams, httpType) {
    var token = localStorage.getItem("jwtToken");
    if (!token) {
      AjaxManager.MsgBox(
        'error',
        'center',
        'Authentication Failed!',
        "Please log in first!",
        [
          { addClass: 'btn btn-primary', text: 'Yes', onClick: ($noty) => $noty.close() },
          { addClass: 'btn', text: 'Cancel', onClick: ($noty) => $noty.close() }
        ],
        0
      );
      return Promise.reject("No token found");
    }

    try {
      const isFormData = jsonParams instanceof FormData;

      const response = await $.ajax({
        type: httpType,
        url: baseApi + serviceUrl,
        data: !isFormData ? JSON.stringify(jsonParams) : jsonParams,
        crossDomain: true,
        processData: !isFormData ? true : false,
        contentType: !isFormData ? "application/json; charset=utf-8" : false,
        headers: AjaxManager.getDefaultHeaders()
      });

      return Promise.resolve(response);

    } catch (xhr) {
      return Promise.reject(xhr);
    }
  },

  PostDataForDotnetCoreWithHttp: function (baseApi, serviceUrl, jsonParams, httpType, onSuccess, onFailed) {
    var token = localStorage.getItem("jwtToken");
    if (!token) {
      //alert("Please log in first!");
      AjaxManager.MsgBox(
        'error',
        'center',
        'Authentication Failed!',
        "Please log in first!",
        [
          { addClass: 'btn btn-primary', text: 'Yes', onClick: function ($noty) { $noty.close(); } },
          { addClass: 'btn', text: 'Cancel', onClick: function ($noty) { $noty.close(); } },
        ]
        , 0
      );
      return false;
    }
    var res = null;
    $.ajax({
      type: httpType,
      url: baseApi + serviceUrl,
      async: false,
      data: jsonParams,
      crossDomain: true,
      contentType: "application/json; charset=utf-8",
      headers: AjaxManager.getDefaultHeaders(),
      //success: function (response) {
      //  onSuccess(response);
      //},
      success: function () {
        // Pass all original arguments: response, textStatus, xhr
        if (typeof onSuccess === "function") {
          onSuccess.apply(null, arguments); // 👈 Important
        }
      },
      error: function (xhr, status, error) {
        console.log("Failed to get info: " + xhr.responseText);
        console.log("AJAX Error:", xhr, status, error);
        onFailed(xhr, status, error);
      }
    });
    return res;
  },

  PostDataForDotnetCore: function (baseApi, serviceUrl, jsonParams) {
    debugger;
    var token = localStorage.getItem("jwtToken");
    if (!token) {
      //alert("Please log in first!");
      AjaxManager.MsgBox(
        'error',
        'center',
        'Authentication Failed!',
        "Please log in first!",
        [
          { addClass: 'btn btn-primary', text: 'Yes', onClick: function ($noty) { $noty.close(); } },
          { addClass: 'btn', text: 'Cancel', onClick: function ($noty) { $noty.close(); } },
        ]
        , 0
      );
      return false;
    }
    var res = "";
    $.ajax({
      type: "POST",
      url: baseApi + serviceUrl,
      async: false,
      data: jsonParams,
      crossDomain: true,
      headers: AjaxManager.getDefaultHeaders(),
      success: function (data) {
        res = data;
      }
    });
    return res;
  },

  GetDataForDotnetCoreAsync: function (baseApi, serviceUrl, jsonParams, isAsync, isCache, onSuccess, onFailed) {
    jQuery.support.cors = true;

    $.ajax({
      url: baseApi + serviceUrl,
      method: "GET",
      async: isAsync,
      cache: isCache,
      data: jsonParams,
      contentType: "application/json; charset=utf-8",
      headers: this.getDefaultHeaders(),
      success: function (response) {
        onSuccess(response);
      },
      error: function (xhr, status, error) {
        onFailed(xhr, status, error);
      }
    });
  },

  GetDataAsyncOrSyncronous: function (baseApi, serviceUrl, jsonParams, isAsync, isCache) {
    jQuery.support.cors = true;

    return new Promise(function (resolve, reject) {
      $.ajax({
        url: baseApi + serviceUrl,
        method: "GET",
        async: isAsync,
        cache: isCache,
        data: jsonParams,
        contentType: "application/json; charset=utf-8",
        headers: AjaxManager.getDefaultHeaders(),
        success: function (response) {
          console.log(response);
          resolve(response);
        },
        error: function (xhr, status, error) {
          console.log(xhr);
          let response = xhr.responseJSON || {};

          let customMessage = "";
          let responseMessage = "";
          if (xhr.responseJSON && xhr.responseJSON.message) {
            responseMessage = xhr.reponseJson.message;
          } else if (xhr.responseText) {
            try {
              const json = JSON.parse(xhr.responseText);
              responseMessage = json.message || xhr.responseText;
            } catch {
              responseMessage = xhr.responseText;
            }
          }

          if (xhr.status === 404) {
            if (responseMessage) {
              customMessage = `404 Not Found\n ${responseMessage}`;
            } else {
              customMessage = `API URL Not Found: [${baseApi + serviceUrl}]\n Please check if the serviceUrl is correct.`;
            }
          } else if (xhr.status === 0) {
            customMessage = `Request could not reach server. Check network or baseApi: [${baseApi}]`;
          } else if (xhr.status === 405) {
            customMessage = `Method Not Allowed. Check the method: [${serviceUrl}]`;
          } else if (xhr.status === 500) {
            customMessage = `Internal Server Error from API: [${baseApi + serviceUrl}]\n ${responseMessage}`;
          } else {
            customMessage = `Error ${xhr.status}: ${xhr.statusText}\n ${responseMessage}`;
          }

          // Developer Info (Optional)
          if (response.correlationId) {
            customMessage += `\n Correlation ID: ${response.correlationId}`;
          }

          ToastrMessage.showToastrNotification({
            preventDuplicates: true,
            closeButton: true,
            timeOut: 0,
            message: customMessage,
            type: 'error',
          });

          reject(xhr); // এখানে xhr টা catch ব্লকে যাবে


          //switch (xhr.status) {
          //  case 400:
          //    customMessage = `Bad Request\n${responseMessage}`;
          //    break;
          //  case 401:
          //    customMessage = `Unauthorized\n${responseMessage}`;
          //    break;
          //  case 403:
          //    customMessage = `Forbidden\n${responseMessage}`;
          //    break;
          //  case 404:
          //    customMessage = `Not Found\n${responseMessage}`;
          //    break;
          //  case 409:
          //    customMessage = `Conflict\n${responseMessage}`;
          //    break;
          //  case 500:
          //    customMessage = `Internal Server Error\n${responseMessage}`;
          //    break;
          //  default:
          //    customMessage = `Error ${xhr.status}: ${xhr.statusText}\n${responseMessage}`;
          //    break;
          //}
        }
      });
    });
  },

  GetDataForDotnetCore: function (baseUrl, serviceUrl, jsonParams, onSuccess, onFailed) {
    jQuery.support.cors = true;

    // Perform the AJAX request
    $.ajax({
      url: baseUrl + serviceUrl,
      method: "GET", // Use GET method
      async: false, // Ensure asynchronous behavior
      cache: false, // Disable caching
      data: jsonParams, // Pass parameters directly
      contentType: "application/json; charset=utf-8",
      headers: this.getDefaultHeaders(), // Add headers from getDefaultHeaders
      success: function (response) {
        onSuccess(response);
      },
      error: function (xhr, status, error) {
        console.log("Failed to get user info: " + xhr.responseText);
        console.log("AJAX Error:", status, error);
        onFailed(xhr, status, error);
      }
    });
  },

  // Updated GetDataForDotnetCore function
  GetDataForDotnetCore3: function (baseUrl, serviceUrl, jsonParams) {
    debugger;
    var obj = null;
    jQuery.support.cors = true;

    console.log(this.getDefaultHeaders());

    $.ajax({
      url: baseUrl + serviceUrl,
      method: "GET",
      async: false,
      cache: false,
      data: JSON.stringify(jsonParams),
      contentType: "application/json; charset=utf-8",
      headers: this.getDefaultHeaders(),
      success: function (response) {
        onSuccess(response);
      },
      error: function (xhr, status, error) {
        console.log("Failed to get user info: " + xhr.responseText);
        console.log("AJAX Error:", status, error);
        onFailed(xhr, status, error);
      }
    });

    return obj;
  },

  GetDataForDotnetCoreAZ: function (baseUrl, serviceUrl, jsonParams) {
    var obj = "";
    jQuery.support.cors = true;
    $.ajax({
      url: baseUrl + serviceUrl,
      method: "GET",
      async: true,
      cache: false,
      data: JSON.stringify(jsonParams),
      contentType: "application/json charset=utf - 8",
      statusCode: {
        200: function (res) {
          obj = res;
        },
        404: function (err) {
          alert(err.statusText);
        }
      }
    });
    return obj;

  },

  GetSingleObject: function (serviceUrl, jsonParams) {
    var rvObj = new Object();
    $.ajax({
      type: "GET",
      async: false,
      cache: false,
      url: serviceUrl,
      data: jsonParams,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (jsonData) {
        rvObj = jsonData;
      },
      error: function (error) {
        Message.Error(error.statusText);
      },
    });

    return rvObj;
  },

  GetJson: function (serviceUrl, jsonParams, successCallback, errorCallback) {
    jQuery.ajax({
      url: serviceUrl,
      data: jsonParams,
      type: "POST",
      processData: true,
      contentType: "application/json",
      dataType: "json",
      success: successCallback,
      error: errorCallback
    });
  },

  SendJson: function (serviceUrl, jsonParams, successCallback, errorCallback) {
    jQuery.ajax({
      url: serviceUrl,
      data: jsonParams,
      async: false,
      cache: false,
      type: "POST",
      success: successCallback,
      error: errorCallback
    });
  },

  SaveObject: function (serviceUrl, jsonParams, successCallback) {
    jQuery.ajax({
      url: serviceUrl,
      async: false,
      type: "POST",
      data: "{" + jsonParams + "}",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: successCallback,
      error: function () {
        Message.Error("Internal Server Error");

      }
    });
  },

  GetReport: function (serviceUrl, jsonParams, errorCallback) {
    //  ////debugger;
    jQuery.ajax({
      url: serviceUrl,
      async: false,
      type: "POST",
      data: "{" + jsonParams + "}",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: function () {
        window.open('../Reports/ReportViewer.aspx', '_blank');
        //window.open("../Reports/ReportViewer.aspx", 'mywindow', 'fullscreen=yes, scrollbars=auto',);
      },
      error: errorCallback
    });

  },

  SendReportServer: function (serviceUrl, jsonParams) {
    jQuery.ajax({
      url: reportServerAPI + serviceUrl,
      type: "POST",
      data: jsonParams,
      dataType: "text",
      contentType: "application/json; charset=utf-8",
      success: function (data) {

        var url = reportServerAPI + "API/HRDocumentReport/GetPdf?fileName=" + data;

        window.open(url, '_blank');
        //window.open("../Reports/ReportViewer.aspx", 'mywindow', 'fullscreen=yes, scrollbars=auto',);
      },
      error: function (error, sts, xrs) {
        ////debugger;
        Message.Warning("Not Found");
      }
    });
  },

  GetString: function (serviceUrl, jsonParams, onSucess) {
    jQuery.ajax({
      url: serviceUrl,
      async: false,
      type: "POST",
      data: "{" + jsonParams + "}",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: onSucess,
      error: function (error) {
        Message.Error(error.statusText);

      }
    });

  },

  Export: function (serviceUrl, jsonParams) {
    //  var jsonParam = 'param:' + JSON.stringify(finalSubmitedParam) + ',reportId:' + reportId;
    $.blockUI({
      message: $('#divBlockMessage'),
      onBlock: function () {
        AjaxManager.SendJson2(serviceUrl, jsonParams, function (result) {

          $.unblockUI();
          //    window.open(result,'_blank');
          window.open(result, '_self');


        }, function () {
          $.unblockUI();
        });
      }
    });
  },

  MsgBox: function (messageBoxType, displayPosition, messageBoxHeaderText, messageText, buttonsArray, autoHideDelay = 2000) {
    try {
      // Map Noty message types to SweetAlert2 types
      const typeMap = {
        'success': 'success',
        'error': 'error',
        'warning': 'warning',
        'info': 'info',
        'information': 'info',
        'alert': 'question'
      };
      // Get the appropriate icon type
      const iconType = typeMap[messageBoxType] || 'info';
      // Set up the SweetAlert2 configuration
      const swalConfig = {
        title: messageBoxHeaderText || '',
        html: messageText || '',
        icon: iconType,
        timer: autoHideDelay, // Auto-close after specified delay (default 3000ms)
        timerProgressBar: true, // Show a progress bar
        showClass: {
          popup: 'swal2-show',
          backdrop: 'swal2-backdrop-show',
          icon: 'swal2-icon-show'
        },
        hideClass: {
          popup: 'swal2-hide',
          backdrop: 'swal2-backdrop-hide',
          icon: 'swal2-icon-hide'
        },
        customClass: {
          container: 'custom-swal-zindex' // Optional: If you want to apply a custom class
        },
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        focusConfirm: false,
        // Add the didOpen hook here
        didOpen: () => {
          document.querySelector('.swal2-container').style.zIndex = '9999'; // Set z-index dynamically
        }
      };

      // Handle auto-hide delay
      if (autoHideDelay > 0) {
        swalConfig.timer = autoHideDelay; // Auto-close after specified delay
        swalConfig.timerProgressBar = true; // Show a progress bar
      }

      // Handle positioning
      if (displayPosition.includes('top')) {
        swalConfig.position = 'top';
      } else if (displayPosition.includes('bottom')) {
        swalConfig.position = 'bottom';
      } else {
        swalConfig.position = 'center';
      }
      // Process buttons
      if (Array.isArray(buttonsArray) && buttonsArray.length > 0) {
        const primaryButton = buttonsArray.find(btn => btn.addClass && btn.addClass.includes('btn-primary'));
        const cancelButton = buttonsArray.find(btn => btn.text === 'Cancel' || btn.text === 'No');
        if (primaryButton) {
          swalConfig.showConfirmButton = true;
          swalConfig.confirmButtonText = primaryButton.text || 'OK';
          swalConfig.customClass = swalConfig.customClass || {};
          swalConfig.customClass.confirmButton = primaryButton.addClass || 'btn btn-primary';
        }

        if (cancelButton) {
          swalConfig.showCancelButton = true;
          swalConfig.cancelButtonText = cancelButton.text || 'Cancel';
          swalConfig.customClass = swalConfig.customClass || {};
          swalConfig.customClass.cancelButton = cancelButton.addClass || 'btn';
        }
      }
      // Fire the SweetAlert2 dialog
      return Swal.fire(swalConfig).then((result) => {
        // Check if auto-closed by timer
        if (result.dismiss === Swal.DismissReason.timer) {
          // Optional: Handle timer-based dismissal if needed
          console.log('Message box was closed by the timer');
        } else if (result.isConfirmed && buttonsArray[0] && typeof buttonsArray[0].onClick === 'function') {
          const notyMock = { close: () => { } };
          buttonsArray[0].onClick(notyMock);
        } else if (result.isDismissed && buttonsArray[1] && typeof buttonsArray[1].onClick === 'function') {
          const notyMock = { close: () => { } };
          buttonsArray[1].onClick(notyMock);
        }
      });
    } catch (error) {
      console.error("Error in SweetAlert MsgBox:", error);
      alert(messageText || "Operation confirmation required");
      return Promise.resolve();
    }
  },

  getGridConfig: function (opt, urllink, sortColumnName, orderBy) {

    return $.extend(true, {
      url: urllink,
      datatype: 'json',
      mtype: 'GET',
      pager: jQuery('#pager'),
      rowNum: 10,
      rowList: [5, 10, 15, 20, 50, 100],
      sortname: sortColumnName,
      sortorder: orderBy, //"DESC" OR ASC,
      viewrecords: true,
      jsonReader: {
        root: "Data",
        page: "PageIndex",
        total: "TotalPages",
        records: "TotalCount",
        repeatitems: false
      },
      loadBeforeSend: function (xhr) {
        xhr.setRequestHeader("content-type", "application/json");
      },
      prmNames: { page: 'pageIndex', rows: 'pageSize', sort: 'orderByField', order: 'orderByType' },
      height: 'auto'
    }, opt);
  },

  multilineGridColumn: function (el, cellval, opts) {
    $(el).attr('style', 'white-space: normal;');
    $(el).html(cellval);
    //return 'style="white-space: normal;'
  },

  disablePopup: function (popupDivName, backgroundDivName) {
    $(popupDivName).fadeOut("slow");
    $(backgroundDivName).fadeOut("slow");
  },

  centerPopup: function (popupDivName) {
    var windowWidth = document.documentElement.clientWidth;
    var windowHeight = document.documentElement.clientHeight;
    var popupHeight = $(popupDivName).height();
    var popupHeight = popupHeight;
    var popupWidth = $(popupDivName).width();

    $(popupDivName).css({
      "position": "absolute",
      "top": windowHeight / 2 - popupHeight / 2,
      "left": windowWidth / 2 - popupWidth / 2,
      "height": popupHeight
    });

    $('#backgroundPopup').css({
      "height": windowHeight
    });

  },

  PopupWindow: function (ctrId, title, width) {
    $("#" + ctrId).kendoWindow({

      title: title,
      resizeable: false,
      width: width,
      actions: ["Pin", "Refresh", "Maximize", "Close"],
      modal: true,
      visible: false,
      zIndex: 10,

    });
    $("#" + ctrId).data("kendoWindow").open().center();
    $("#" + ctrId).find("input, textarea").css("width", "94%");
    $("#" + ctrId).find("select ,option").css("width", "90");
    $("#" + ctrId).find("input[type='checkbox']").css({
      "width": "15px",
      "height": "15px",
      "cursor": "pointer",
      "border": "2px solid #6200ea",
      "border-radius": "4px"
    });
  },

  initPopupWindow: function (ctrId, title, width) {

    $("#" + ctrId).kendoWindow({
      position: {
        top: 0, // or "100px"
        left: "10%",
        right: "10%"
      },
      title: title,
      resizeable: false,
      width: width,
      actions: ["Pin", "Refresh", "Maximize", "Close"],
      modal: true,
      visible: false,
      //minHeight: '80%',
    });
  },

  showlink: function (el, cellval, opts) {
    var op = { baseLinkUrl: opts.baseLinkUrl, showAction: opts.showAction, addParam: opts.addParam };
    if (!isUndefined(opts.colModel.formatoptions)) {
      op = $.extend({}, op, opts.colModel.formatoptions);
    }
    idUrl = op.baseLinkUrl + op.showAction + '?id=' + opts.rowId + op.addParam;
    if (isString(cellval)) {	//add this one even if its blank string
      $(el).html("<a class=\"aColumn\" href=\"#\"" + "onclick=\"Page.Test(' " + opts.rowId + "')\">" + cellval + "</a>");
    } else {
      $.fn.fmatter.defaultFormat(el, cellval);
    }
  },

  jqGridDate: function (el, cellval, opts) {
    if (!isEmpty(cellval) && cellval != "/Date(-62135596800000)/")
      $(el).html(AjaxManager.changeDateFormat(cellval, 0));
  },

  jqGridDateTime: function (el, cellval, opts) {

    if (!isEmpty(cellval) && cellval != "/Date(-62135596800000)/")
      $(el).html(AjaxManager.changeDateFormat(cellval, 1));
  },

  checkSpecialCharacters: function (id) {

    var checkString = $("#" + id).val();

    var regex = /[^\w\s&()-]/gi;


    if (checkString != "") {
      if (regex.test(checkString)) {
        AjaxManager.MsgBox('warning', 'center', 'Special Characters:', 'Your search string contains illegal characters.',
          [{
            addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
              $noty.close();
              return (false);
            }
          }]);

      }
      else {
        return true;
      }
    }

  },

  GetSingleObject2: function (serviceUrl, jsonParams) {
    var rvObj = new Object();
    $.ajax({
      type: "POST",
      async: false,
      cache: false,
      url: serviceUrl,
      data: "{" + jsonParams + "}",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (jsonData) {
        rvObj = jsonData;
      },
      error: function (error) {
        Message.Error(error.statusText);
      },
    });

    return rvObj;
  }
};
//End AjaxManager



/* =========================================================
    Menu Api Call Functions
=========================================================*/
// Menu start
var MenuManager = {

  getMenu: function () {
    TokenManger.CheckToken();
    var objMenuList = "";

    const jsonParam = "";
    const serviceURL = baseApi + "/menus-by-user-permission";

    $.ajax({
      url: serviceURL,
      type: "GET",
      async: false,
      cache: false,
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      },
      success: function (response) {
        objMenuList = response;
      },
      error: function (xhr, status, error) {
        alert("Failed to get user info: " + xhr.responseText);
      }
    });

    return objMenuList;
  },

  getLoggedInUserInfo: function () {

    TokenManger.CheckToken();

    var serviceURL = baseApi + "/user-info";

    $.ajax({
      url: serviceURL,
      type: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      },
      success: function (response) {
        localStorage.setItem("userInfo", response);
        window.location.href = baseUI + "Home/Index";
      },
      error: function (xhr, status, error) {
        alert("Failed to get user info: " + xhr.responseText);
      }
    });
  },

  getParentMenuByMenu: function (parentMenuId) {
    TokenManger.CheckToken();
    var objParentMenuList = "";
    var serviceURL = baseApi + "/parent-Menu-By-Menu";

    $.ajax({
      url: serviceURL,
      type: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      },
      success: function (response) {
        objParentMenuList = response;
      },
      error: function (xhr, status, error) {
        alert("Failed to get Parent menu: " + xhr.responseText);
      }
    });
    return objParentMenuList;
  },

  getCurrentUser: function (menuRefresh) {
    TokenManger.CheckToken();

    var currentUserString = JSON.parse(localStorage.getItem("userInfo"));
    //console.log(currentUserString);
    CurrentUser = MenuHelper.parseCurrentUser(currentUserString); //JSON.parse(localStorage.getItem("userInfo"));

    if (CurrentUser != null) {
      if (CurrentUser.ProfilePicture != null && CurrentUser.ProfilePicture != "") {
        $("#profilePicture").attr('src', '../' + CurrentUser.ProfilePicture);
      }
    } else {
      if (CurrentUser.Gender == 1) {
        $("#profilePicture").attr('src', '/assets/images/male.png');
      } else {
        $("#profilePicture").attr('src', '/assets/images/female.png');
      }
    }
    $("#userName").text(CurrentUser.UserName.replace(/^"|"$/g, ''));

    if (CurrentUser.FullLogoPath != null && CurrentUser.FullLogopath != "") {
      $("#bran-logo").attr('src', CurrentUser.FullLogoPath);
    }
    else {
      $("#bran-logo").attr('src', '/assets/images/logo/sountwels.png');
    }
  },

  Logout: function (event) {
    debugger;
    event.preventDefault(); // Prevent navigation
    TokenManger.CheckToken();
    // Optionally, call the backend logout endpoint
    var serviceURL = baseApi + "/logout";
    $.ajax({
      url: serviceURL,
      type: "POST",
      headers: {
        //"Authorization": "Bearer " + localStorage.getItem("jwtToken") 
        "Authorization": "Bearer " + token
      },
      success: function () {
        // Clear JWT token from localStorage
        localStorage.removeItem("jwtToken");

        // Clear user info from localStorage
        localStorage.removeItem("userInfo");
        // Redirect to the login page
        window.location.href = baseUI + "Home/Login";
        console.log("Logged out successfully.");
      },
      error: function (xhr, status, error) {
        console.error("Logout failed: " + xhr.responseText);
      }
    });
  },

};


var MenuHelper = {

  GetMenuInformation: function () {
    var objMenuList = MenuManager.getMenu();
    MenuHelper.populateBootstrapVerticalMenu(objMenuList);
    MenuManager.getCurrentUser(true);
  },

  // New function to populate Bootstrap vertical menu
  populateBootstrapVerticalMenu: function (menus) {
    var parentMenubyMenuId = [];
    var pathName = window.location.pathname;

    // Find active menu based on current path
    for (var j = 0; j < menus.length; j++) {
      if (menus[j].MenuPath == ".." + pathName) {
        var parentMenu = MenuManager.getParentMenuByMenu(menus[j].ParentMenu);
        // Ensure parentMenubyMenuId is always an array
        parentMenubyMenuId = Array.isArray(parentMenu) ? parentMenu : (parentMenu === "" ? [] : [parentMenu]);
      }
    }

    var menuHtml = "";

    // Generate top-level menu items
    for (var i = 0; i < menus.length; i++) {
      if (menus[i].ParentMenu == null || menus[i].ParentMenu == 0) {
        const isActive = menus[i].MenuPath == ".." + pathName; // Check if the menu is active
        menuHtml += this.createMenuItem(menus[i], menus, parentMenubyMenuId, isActive);
      }
    }

    // Add About menu item
    menuHtml += `
      <li class="nav-item">
        <a class="nav-link" href="#!" id="liAboutUs">
          <i data-feather="info" class="nav-icon icon-xs me-2"></i>
          About
        </a>
      </li>
    `;

    // Insert the generated menu into the DOM
    $("#sideNavbar").html(menuHtml);

    // Initialize feather icons if using them
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  },

  // Create a menu item with potential sub-menus
  createMenuItem: function (menuItem, allMenus, parentMenubyMenuId) {
    var menuId = menuItem.MenuId;
    var hasChildren = this.hasChildMenus(menuId, allMenus);
    var isActiveParent = this.isActiveParentMenu(menuId, parentMenubyMenuId);
    var collapseId = "navMenu" + menuId;

    // Start building menu item
    var menuHtml = `<li class="nav-item">`;

    // Create menu link with appropriate attributes
    if (hasChildren) {
      // Add right or down arrow icon for menus with children
      var arrowIcon = isActiveParent ? 'chevron-down' : 'chevron-right'; // Down arrow when expanded, right arrow when collapsed
      menuHtml += `
            <a class="nav-link has-arrow ${isActiveParent ? '' : 'collapsed'}" 
               href="#!" 
               data-bs-toggle="collapse" 
               data-bs-target="#${collapseId}" 
               aria-expanded="${isActiveParent ? 'true' : 'false'}" 
               aria-controls="${collapseId}">
                <i data-feather="${arrowIcon}" class="arrow-icon nav-icon icon-xs me-2"></i>
                ${menuItem.MenuName}
            </a>
        `;
      // Create submenu container
      menuHtml += `
            <div id="${collapseId}" 
                 class="collapse ${isActiveParent ? 'show' : ''}" 
                 data-bs-parent="#sideNavbar">
                <ul class="nav flex-column">
                    ${this.createSubmenuItems(menuId, allMenus, parentMenubyMenuId)}
                </ul>
            </div>
        `;
    } else {
      // Menu without children is a simple link
      menuHtml += `
            <a class="nav-link" href="${menuItem.MenuPath || '#!'}">
                <i data-feather="file" class="nav-icon icon-xs me-2"></i>
                ${menuItem.MenuName}
            </a>
        `;
    }

    menuHtml += `</li>`;
    return menuHtml;
  },

  // Create submenu items for a given parent menu
  createSubmenuItems: function (parentMenuId, allMenus, parentMenubyMenuId, level = 1) {
    var submenuHtml = "";

    for (var i = 0; i < allMenus.length; i++) {
      if (allMenus[i].ParentMenu == parentMenuId) {
        var childMenuId = allMenus[i].MenuId;
        var hasGrandchildren = this.hasChildMenus(childMenuId, allMenus);
        var collapseId = "navMenu" + childMenuId;

        submenuHtml += `<li class="nav-item">`;

        if (hasGrandchildren) {
          // This submenu has its own children
          submenuHtml += `
            <a class="nav-link has-arrow collapsed" 
               href="#!" 
               data-bs-toggle="collapse" 
               data-bs-target="#${collapseId}" 
               aria-expanded="false" 
               aria-controls="${collapseId}">
              ${allMenus[i].MenuName}
            </a>
            <div id="${collapseId}" 
                 class="collapse" 
                 data-bs-parent="#navMenu${parentMenuId}">
              <ul class="nav flex-column">
                ${this.createSubmenuItems(childMenuId, allMenus, parentMenubyMenuId, level + 1)}
              </ul>
            </div>
          `;
        } else {
          // This is a leaf menu item
          if (allMenus[i].MenuPath == null || allMenus[i].MenuPath == "") {
            submenuHtml += `<a class="nav-link" href="#!">${allMenus[i].MenuName}</a>`;
          } else {
            submenuHtml += `<a class="nav-link" href="${allMenus[i].MenuPath}">${allMenus[i].MenuName}</a>`;
          }
        }

        submenuHtml += `</li>`;
      }
    }

    return submenuHtml;
  },

  // Helper function to check if a menu has child menus
  hasChildMenus: function (menuId, allMenus) {
    for (var i = 0; i < allMenus.length; i++) {
      if (allMenus[i].ParentMenu == menuId) {
        return true;
      }
    }
    return false;
  },

  // Helper function to check if a menu is an active parent
  isActiveParentMenu: function (menuId, parentMenubyMenuId) {
    // Handle the case where parentMenubyMenuId might be empty or not an array
    if (!parentMenubyMenuId || parentMenubyMenuId === "" || !Array.isArray(parentMenubyMenuId) || parentMenubyMenuId.length === 0) {
      return false;
    }

    for (var i = 0; i < parentMenubyMenuId.length; i++) {
      if (parentMenubyMenuId[i] && parentMenubyMenuId[i].MenuId == menuId) {
        return true;
      }
    }
    return false;
  },

  parseCurrentUser: function (currentUserString) {
    if (typeof currentUserString === "object") {
      return currentUserString
    }

    try {
      let currentUserObject = JSON.parse(currentUserString);
      return currentUserObject;
    } catch (e) {
      console.error("Error parsing user info", error);
      return null;
    }

    return currentUserObject;
  },
};
// Menu end

/* =========================================================
    Vanilla Api Call Functions
=========================================================*/
// Vanilla Api Call Mechanism start
const VanillaApiCallManager = {

  //Generic Error Handler
  handleApiError: function (errorResponse) {
    var apiError = this._convertToApiError(errorResponse);

    let statusCode = apiError.statusCode || 500;
    let errorType = apiError.errorType || "Error";
    let message = apiError.message || "Unknown error";
    let correlationId = apiError.correlationId || "";
    let timestamp = apiError.timestamp ? new Date(apiError.timestamp).toLocaleString() : "";
    let details = apiError.details || "";

    //// For End User (Display Message)
    //let displayMessage = `<strong>[${statusCode}] ${errorType}</strong><br>`;
    //displayMessage += `${message}<br>`;

    // For Developer (Console Message)
    let consoleMessage = `%c[ERROR] ${errorType} (${statusCode})`;
    let consoleStyle = "color: red; font-weight: bold;";
    let additionalInfo = `\nMessage: ${message}`;

    if (correlationId) {
      additionalInfo += `\nCorrelation ID: ${correlationId}`;
    }
    if (timestamp) {
      additionalInfo += `\nTimestamp: ${timestamp}`;
    }
    if (details) {
      additionalInfo += `\nDetails: ${details}`;
    }

    console.log(consoleMessage + additionalInfo, consoleStyle);

    // === USER-FRIENDLY ERROR DISPLAY (No Technical Details) ===
    let userFriendlyMessage = message;

    switch (errorType) {
      // === AUTHENTICATION & AUTHORIZATION ERRORS ===
      case 'UsernamePasswordMismatchException':
      case 'UnauthorizedException':
      case 'TokenExpired':
      case 'InvalidToken':
      case 'AUTH_ERROR':
        this._handleAuthenticationError(userFriendlyMessage, errorType, statusCode);
        return;

      // === VALIDATION & BUSINESS LOGIC ERRORS (Use Toastr) ===
      case 'BadRequestException':
      case 'ValidationException':
      case 'InvalidCreateOperationException':
      case 'Validation':
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: userFriendlyMessage,
          type: 'warning',
        });
        break;

      // === DATA CONFLICT ERRORS (Use Toastr) ===
      case 'DuplicateRecordException':
      case 'ConflictException':
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: userFriendlyMessage,
          type: 'warning',
        });
        break;

      // === RESOURCE NOT FOUND (Use Toastr) ===
      case 'NotFoundException':
      case 'NotFound':
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: userFriendlyMessage,
          type: 'info',
        });
        break;

      // === FORBIDDEN ACCESS (Use Toastr) ===
      case 'ForbiddenAccessException':
        ToastrMessage.showToastrNotification({
          preventDuplicates: true,
          closeButton: true,
          timeOut: 0,
          message: userFriendlyMessage,
          type: 'warning',
        });
        break;

      // === SERVER & INFRASTRUCTURE ERRORS (Use Modal) ===
      case 'ServiceUnavailableException':
      case 'DatabaseError':
      case 'TIMEOUT_ERROR':
      case 'NETWORK_ERROR':
        CommonManager.MsgBox(
          "error",
          "center",
          "System Error",
          userFriendlyMessage,
          [{
            addClass: "btn btn-primary",
            text: "OK",
            onClick: function ($noty) {
              $noty.close();
            }
          }],
          0
        );
        break;

      // === HTTP ERRORS (Status Code Based) ===
      case 'HTTP_ERROR':
        if (statusCode >= 400 && statusCode < 500) {
          // Client errors - use toastr (less intrusive)
          const toastrType = statusCode === 409 ? 'warning' :
            statusCode === 404 ? 'info' : 'warning';

          ToastrMessage.showToastrNotification({
            preventDuplicates: true,
            closeButton: true,
            timeOut: 0,
            message: userFriendlyMessage,
            type: toastrType,
          });
        } else {
          // Server errors - use modal (more attention)
          CommonManager.MsgBox(
            "error",
            "center",
            "Server Error",
            userFriendlyMessage,
            [{
              addClass: "btn btn-primary",
              text: "OK",
              onClick: function ($noty) {
                $noty.close();
              }
            }],
            0
          );
        }
        break;

      // === DEFAULT HANDLING ===
      default:
        if (statusCode >= 500) {
          // Server errors - use modal for attention
          CommonManager.MsgBox(
            "error",
            "center",
            errorType,
            userFriendlyMessage,
            [{
              addClass: "btn btn-primary",
              text: "OK",
              onClick: function ($noty) {
                $noty.close();
              }
            }],
            0
          );
        } else {
          // Client errors - use toastr
          ToastrMessage.showToastrNotification({
            preventDuplicates: true,
            closeButton: true,
            timeOut: 0,
            message: userFriendlyMessage,
            type: 'error',
          });
        }
        break;
    }
  },


  // Handle authentication errors with logout option
  _handleAuthenticationError: function (message, errorType, statusCode) {
    const shouldLogout = ['TokenExpired', 'InvalidToken', 'UnauthorizedException', 'AUTH_ERROR'].includes(errorType);

    let authMessage = message;
    if (shouldLogout) {
      authMessage += "<br><strong>You need to log in again.</strong>";
    }

    CommonManager.MsgBox(
      "warning",
      "center",
      "Authentication Required",
      authMessage,
      [{
        addClass: "btn btn-primary",
        text: shouldLogout ? "Login Again" : "OK",
        onClick: function ($noty) {
          $noty.close();
          if (shouldLogout) {
            // Clear tokens and redirect to login
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("userInfo");
            window.location.href = baseUI + "Home/Login";
          }
        }
      }],
      0
    );
  },

  // Convert various error formats to handleApiError expected format
  _convertToApiError: function (error) {
    let apiError = {
      statusCode: 500,
      errorType: "Error",
      message: "Unknown error",
      correlationId: "",
      timestamp: new Date().toISOString(),
      details: ""
    };

    // === HANDLE API RESPONSE STRUCTURE ===
    // Check if this is your API's standard error response (from C# middleware)
    if (error && (error.statusCode || error.errorType || error.message)) {
      return {
        statusCode: error.statusCode || error.status || 500,
        errorType: error.errorType || error.type || "Error",
        message: error.message || "Unknown error",
        correlationId: error.correlationId || "",
        timestamp: error.timestamp || new Date().toISOString(),
        details: error.details || ""
      };
    }

    // === HANDLE FETCH API ERRORS FROM _performRequest ===
    if (error.type) {
      switch (error.type) {
        case 'HTTP_ERROR':
          apiError.statusCode = error.status || 500;
          apiError.errorType = "HTTP_ERROR";
          apiError.message = error.statusText || "HTTP Error";
          apiError.details = error.responseText || "";

          // Parse API response from HTTP error (C# ApiException)
          if (error.response && typeof error.response === 'object') {
            apiError.statusCode = error.response.statusCode || apiError.statusCode;
            apiError.errorType = error.response.errorType || apiError.errorType;
            apiError.message = error.response.message || apiError.message;
            apiError.correlationId = error.response.correlationId || "";
            apiError.details = error.response.details || "";
          }
          break;

        case 'TIMEOUT_ERROR':
          apiError.statusCode = 408;
          apiError.errorType = "TIMEOUT_ERROR";
          apiError.message = "Request timeout";
          apiError.details = "The request took too long to complete";
          break;

        case 'NETWORK_ERROR':
          apiError.statusCode = 0;
          apiError.errorType = "NETWORK_ERROR";
          apiError.message = "Network connection failed";
          apiError.details = "Unable to connect to the server";
          break;

        case 'AUTH_ERROR':
          apiError.statusCode = 401;
          apiError.errorType = "AUTH_ERROR";
          apiError.message = "Authentication failed";
          apiError.details = error.error || "Authentication token is missing or invalid";
          break;

        default:
          apiError.errorType = error.type;
          apiError.message = error.responseText || error.statusText || "Unknown error";
          apiError.statusCode = error.status || 500;
          apiError.details = JSON.stringify(error);
      }
    }
    // === HANDLE VanillaApiCallManager CUSTOM ERRORS ===
    else if (error.errorType && error.statusCode) {
      // Already in expected format from VanillaApiCallManager
      return error;
    }
    // === HANDLE GENERIC ERRORS ===
    else {
      apiError.message = error.message || error.toString() || "Unknown error occurred";
      apiError.details = JSON.stringify(error);
    }

    return apiError;
  },

  // for grid.
  GenericGridDataSource: function (options) {
    var apiUrl = options.apiUrl;
    var serverPaging = options.serverPaging !== undefined ? options.serverPaging : true;
    var serverSorting = options.serverSorting !== undefined ? options.serverSorting : true;
    var serverFiltering = options.serverFiltering !== undefined ? options.serverFiltering : true;
    var pageSize = options.pageSize || 20;
    var modelFields = options.modelFields || {};

    var gridDataSource = new kendo.data.DataSource({
      serverPaging: serverPaging,
      serverSorting: serverSorting,
      serverFiltering: serverFiltering,
      allowUnsort: options.allowUnsort || false,
      pageSize: pageSize,
      page: 1,

      pageable: {
        buttonCount: options.buttonCount || 5,
        input: false,
        numeric: true
      },

      transport: {
        read: {
          url: apiUrl,
          type: options.requestType || "POST",
          dataType: "json",
          async: options.async !== undefined ? options.async : false,
          contentType: options.contentType || "application/json; charset=utf-8",
          headers: TokenManger.getDefaultApplicationJsonHeaders(),

          // Updated Error Handling
          error: function (xhr, status, error) {
            console.log("Grid API Error:", {
              status: xhr.status,
              statusText: xhr.statusText,
              responseText: xhr.responseText,
              error: error
            });

            let errorResponse;
            try {
              errorResponse = JSON.parse(xhr.responseText);
            } catch {
              errorResponse = { message: "Unknown error occurred" };
            }

            // Centralized error handler
            VanillaApiCallManager.handleApiError(errorResponse);

            // Return empty data source
            this.success({ data: { Items: [], TotalCount: 0 } });
          },

          // Success callback to handle API response
          success: function (data) {
            if (data && data.IsSuccess === false) {
              console.error("API returned error:", data.message);
              VanillaApiCallManager.handleApiError(data);
              return { data: { Items: [], TotalCount: 0 } };
            }
            return data;
          }
        },

        parameterMap: options.parameterMap || function (options) {
          var transformedOptions = {
            Skip: options.skip,
            Take: options.take,
            Page: options.page,
            PageSize: options.pageSize,
            Filter: options.filter
          };

          if (options.sort && options.sort.length > 0) {
            transformedOptions.Sort = [];
            for (var i = 0; i < options.sort.length; i++) {
              transformedOptions.Sort.push({
                field: options.sort[i].field,
                dir: options.sort[i].dir
              });
            }
          } else {
            transformedOptions.Sort = null;
          }

          return JSON.stringify(transformedOptions);
        }
      },
      schema: {

        data: function (response) {
          // Handle the new API response structure
          if (response.IsSuccess && response.Data) {
            return response.Data.Items || [];
          }
          return [];
        },

        total: function (response) {
          // Handle the new API response structure
          if (response.IsSuccess && response.Data) {
            return response.Data.TotalCount || 0;
          }
          return 0;
        },

        parse: function (response) {

          if (response.IsSuccess === false) {
            console.error("API Error:", response.Message);
            VanillaApiCallManager.handleApiError(response);
            return {
              Data: { Items: [], TotalCount: 0 },
              IsSuccess: false,
              Message: response.Message
            };
          }

          if (response.IsSuccess && response.Data && response.Data.Items) {
            var items = response.Data.Items;
            var totalCount = response.Data.TotalCount || 0;

            var inferredFields = {};
            if (items.length > 0) {
              var sampleRecord = items[0];
              for (var key in sampleRecord) {
                if (sampleRecord.hasOwnProperty(key)) {
                  if (typeof sampleRecord[key] === "number") {
                    inferredFields[key] = { type: "number" };
                  } else if (typeof sampleRecord[key] === "boolean") {
                    inferredFields[key] = { type: "boolean" };
                  } else if (Object.prototype.toString.call(sampleRecord[key]) === "[object Date]") {
                    inferredFields[key] = { type: "date" };
                  } else {
                    inferredFields[key] = { type: "string" };
                  }
                }
              }
            }

            return {
              Data: { Items: items, TotalCount: totalCount },
              inferredFields: inferredFields,
              IsSuccess: true
            };
          }

          return {
            Data: { Items: [], TotalCount: 0 },
            IsSuccess: true
          };
        },

        model: {
          fields: modelFields
        },

        errors: function (response) {
          if (response.IsSuccess === false) {
            return response.Message || "An error occurred";
          }
          return null;
        }
      },

      // Error handling
      error: function (e) {
        console.log("DataSource Error:", e);
        VanillaApiCallManager.handleApiError({
          statusCode: e.status || 0,
          errorType: "NetworkError",
          message: e.errorThrown || "Request failed",
          details: e.xhr ? e.xhr.responseText : ""
        });
      }
    });

    return gridDataSource;
  },

  // Function to send a request using Fetch API For Crud not grid.
  SendRequestVanilla: async function (baseApi, serviceUrl, jsonParams, httpType, options = {}) {
    // Default configuration
    const defaultOptions = {
      timeout: 3000000,
      retries: 0,
      retryDelay: 1000,
      showErrorMessage: true,
      validateStatus: (status) => status >= 200 && status < 300,
      requireAuth: true,
      ...options
    };

    // JWT Token validation
    if (defaultOptions.requireAuth) {
      var token = localStorage.getItem("jwtToken");
      if (!token) {
        if (defaultOptions.showErrorMessage) {
          CommonManager.MsgBox(
            'error', 'center', 'Authentication Failed!',
            "Please log in first!",
            [{ addClass: 'btn btn-primary', text: 'OK', onClick: ($noty) => $noty.close() }],
            0
          );
        }
        return Promise.reject({
          statusCode: 401,
          errorType: 'AUTH_ERROR',
          message: "No token found",
          correlationId: "",
          timestamp: new Date().toISOString(),
          details: "Authentication token not found in localStorage"
        });
      }
    }

    // Retry mechanism with exponential backoff
    let lastError;
    for (let attempt = 0; attempt <= defaultOptions.retries; attempt++) {
      try {
        const result = await this._performRequest(baseApi, serviceUrl, jsonParams, httpType, defaultOptions);
        return Promise.resolve(result);
      } catch (error) {
        console.log(error);
        // Convert error to handleApiError expected format
        lastError = this._convertToApiError(error);

        // Don't retry for certain error types
        if (this._shouldNotRetry(error) || attempt >= defaultOptions.retries) {
          break;
        }

        // Wait before retry (exponential backoff)
        const delay = defaultOptions.retryDelay * Math.pow(2, attempt);
        await this._sleep(delay);

        VanillaApiCallManager.handleApiError(lastError);
      }
    }

    // Show final error if all retries failed
    if (defaultOptions.showErrorMessage && lastError) {
      VanillaApiCallManager.handleApiError(lastError);
    }

    return Promise.reject(lastError);
  },

  // Core request performer
  _performRequest: async function (baseApi, serviceUrl, jsonParams, httpType, options) {
    const isFormData = jsonParams instanceof FormData;
    const isFile = jsonParams instanceof File;
    const isBlob = jsonParams instanceof Blob;
    const isArrayBuffer = jsonParams instanceof ArrayBuffer;

    // Prepare headers
    const headers = this._prepareHeaders(isFormData, options);

    // Prepare request body
    const requestBody = this._prepareRequestBody(jsonParams, isFormData, isFile, isBlob, isArrayBuffer);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      const response = await fetch(baseApi + serviceUrl, {
        method: httpType.toUpperCase(),
        headers: headers,
        body: requestBody,
        mode: 'cors',
        credentials: 'same-origin', // need to know
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!options.validateStatus(response.status)) {
        console.log(response);
        const errorData = await this._parseResponse(response);
        console.log(JSON.stringify(errorData));
        const error = {
          status: response.status,
          statusText: response.statusText,
          responseText: typeof errorData === 'string' ? errorData : JSON.stringify(errorData),
          response: errorData,
          readyState: 4,
          type: 'HTTP_ERROR'
        };
        throw error;
      }

      // Parse successful response
      return await this._parseResponse(response);

    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        throw {
          status: 0,
          statusText: 'Timeout',
          responseText: 'Request timeout',
          readyState: 0,
          type: 'TIMEOUT_ERROR'
        };
      }

      if (fetchError.name === 'TypeError') {
        throw {
          status: 0,
          statusText: 'Network Error',
          responseText: 'Network connection failed',
          readyState: 0,
          type: 'NETWORK_ERROR'
        };
      }
      console.log(fetchError);
      throw fetchError;
    }
  },

  // Prepare headers based on content type
  _prepareHeaders: function (isFormData, options) {
    let headers = {};

    // Get default headers
    if (isFormData) {
      headers = { ...TokenManger.getDefaultFormDataHeaders() };
    } else {
      headers = { ...TokenManger.getDefaultApplicationJsonHeaders() };
    }

    // Add custom headers from options
    if (options.customHeaders) {
      headers = { ...headers, ...options.customHeaders };
    }

    // Don't set Content-Type for FormData - browser will set it automatically
    if (isFormData) {
      for (const key in headers) {
        if (key.toLowerCase() === 'content-type') {
          delete headers[key];
        }
      }
    }

    return headers;
  },

  // Prepare request body based on data type
  _prepareRequestBody: function (jsonParams, isFormData, isFile, isBlob, isArrayBuffer) {
    if (isFormData || isFile || isBlob || isArrayBuffer) {
      return jsonParams;
    }

    if (jsonParams === null || jsonParams === undefined) {
      return null;
    }

    if (typeof jsonParams === 'string') {
      return jsonParams;
    }

    // For objects, stringify to JSON
    return JSON.stringify(jsonParams);
  },

  // Parse response based on content type
  _parseResponse: async function (response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/')) {
      return await response.text();
    } else if (contentType.includes('application/octet-stream') || contentType.includes('application/pdf')) {
      return await response.blob();
    } else {
      // Try to parse as JSON first, fallback to text
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
  },

  // Check if error should not be retried
  _shouldNotRetry: function (error) {
    // Don't retry auth errors, client errors (4xx), or specific network issues
    const noRetryStatuses = [400, 401, 403, 404, 422, 429];
    const noRetryTypes = ['AUTH_ERROR', 'VALIDATION_ERROR'];

    return noRetryStatuses.includes(error.status) ||
      noRetryTypes.includes(error.type) ||
      (error.status >= 400 && error.status < 500);
  },

  // Sleep utility for retry delays
  _sleep: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Convenience methods for different HTTP methods
  get: function (baseApi, serviceUrl, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${serviceUrl}?${queryString}` : serviceUrl;
    return this.SendRequestVanilla(baseApi, url, null, 'GET', options);
  },

  post: function (baseApi, serviceUrl, data, options = {}) {
    return this.SendRequestVanilla(baseApi, serviceUrl, data, 'POST', options);
  },

  put: function (baseApi, serviceUrl, data, options = {}) {
    return this.SendRequestVanilla(baseApi, serviceUrl, data, 'PUT', options);
  },

  delete: function (baseApi, serviceUrl, options = {}) {
    return this.SendRequestVanilla(baseApi, serviceUrl, null, 'DELETE', options);
  },

  patch: function (baseApi, serviceUrl, data, options = {}) {
    return this.SendRequestVanilla(baseApi, serviceUrl, data, 'PATCH', options);
  },

  // File upload helper
  uploadFile: function (baseApi, serviceUrl, file, additionalData = {}, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional form data
    Object.keys(additionalData).forEach(key => {
      if (typeof additionalData[key] === 'object') {
        formData.append(key, JSON.stringify(additionalData[key]));
      } else {
        formData.append(key, additionalData[key]);
      }
    });

    return this.post(baseApi, serviceUrl, formData, options);
  },

  // Batch requests
  batch: async function (requests) {
    const promises = requests.map(req =>
      this.SendRequestVanilla(req.baseApi, req.serviceUrl, req.data, req.method, req.options)
    );

    try {
      return await Promise.all(promises);
    } catch (error) {
      // Return results with errors for partial success handling
      const results = await Promise.allSettled(promises);
      return results.map(result =>
        result.status === 'fulfilled' ? result.value : { error: result.reason }
      );
    }
  }

};
// Vanilla Api Call Machanism end


/* =========================================================
    Token Manger Functions
=========================================================*/
var TokenManger = {
  CheckToken: function () {
    token = localStorage.getItem("jwtToken");
    if (!token) {
      // Clear JWT token from localStorage
      localStorage.removeItem("jwtToken");

      // Clear user info from localStorage
      localStorage.removeItem("userInfo");

      // Redirect to the login page
      window.location.href = "https://localhost:44381/Home/Login";
    }
  },

  // Function to get default headers for json
  getDefaultApplicationJsonHeaders: function () {
    this.CheckToken(); // Ensure the token is valid
    return {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
  },

  // Function to get default headers for formData
  getDefaultFormDataHeaders: function () {
    this.CheckToken(); // Ensure the token is valid
    return {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
    };
  },

};


/* =========================================================
    Common Manager Functions
=========================================================*/
var CommonManager = {
  // Emsure SweetAlert2 with High z-index
  MsgBox: function (messageBoxType, displayPosition, messageBoxHeaderText, messageText, buttonsArray, autoHideDelay = 2000) {
    try {
      const typeMap = { success: 'success', error: 'error', warning: 'warning', info: 'info', information: 'info', alert: 'question' };
      const iconType = typeMap[messageBoxType] || 'info';
      const swalConfig = {
        title: messageBoxHeaderText || '',
        html: messageText || '',
        icon: iconType,
        timer: autoHideDelay,
        timerProgressBar: autoHideDelay > 0,
        customClass: { container: 'custom-swal-zindex' },
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        focusConfirm: false,
        didOpen: () => {
          const z = 2147482000; 
          const c = document.querySelector('.swal2-container');
          if (c) {
            c.style.zIndex = z.toString();
            const p = c.querySelector('.swal2-popup');
            if (p) p.style.zIndex = (z + 1).toString();
          }
        }
      };

      // Handle auto-hide delay
      if (autoHideDelay > 0) {
        swalConfig.timer = autoHideDelay; // Auto-close after specified delay
        swalConfig.timerProgressBar = true; // Show a progress bar
      }

      // Handle positioning
      if (displayPosition.includes('top')) {
        swalConfig.position = 'top';
      } else if (displayPosition.includes('bottom')) {
        swalConfig.position = 'bottom';
      } else {
        swalConfig.position = 'center';
      }
      // Process buttons
      if (Array.isArray(buttonsArray) && buttonsArray.length > 0) {
        const primaryButton = buttonsArray.find(btn => btn.addClass && btn.addClass.includes('btn-primary'));
        const cancelButton = buttonsArray.find(btn => btn.text === 'Cancel' || btn.text === 'No');
        if (primaryButton) {
          swalConfig.showConfirmButton = true;
          swalConfig.confirmButtonText = primaryButton.text || 'OK';
          swalConfig.customClass = swalConfig.customClass || {};
          swalConfig.customClass.confirmButton = primaryButton.addClass || 'btn btn-primary';
        }

        if (cancelButton) {
          swalConfig.showCancelButton = true;
          swalConfig.cancelButtonText = cancelButton.text || 'Cancel';
          swalConfig.customClass = swalConfig.customClass || {};
          swalConfig.customClass.cancelButton = cancelButton.addClass || 'btn';
        }
      }
      // Fire the SweetAlert2 dialog
      return Swal.fire(swalConfig).then((result) => {
        // Check if auto-closed by timer
        if (result.dismiss === Swal.DismissReason.timer) {
          // Optional: Handle timer-based dismissal if needed
          console.log('Message box was closed by the timer');
        } else if (result.isConfirmed && buttonsArray[0] && typeof buttonsArray[0].onClick === 'function') {
          const notyMock = { close: () => { } };
          buttonsArray[0].onClick(notyMock);
        } else if (result.isDismissed && buttonsArray[1] && typeof buttonsArray[1].onClick === 'function') {
          const notyMock = { close: () => { } };
          buttonsArray[1].onClick(notyMock);
        }
      });
    } catch (error) {
      console.error("Error in SweetAlert MsgBox:", error);
      alert(messageText || "Operation confirmation required");
      return Promise.resolve();
    }
  },

  // Unified Confirm: if Kendo Window then Kendo Dialog other wise SweetAlert2
  showConfirm: function (title, message, onYes, onCancel) {
    const anyKendoOverlay = $(".k-overlay").length > 0 || $(".k-window:visible").length > 0;

    if (anyKendoOverlay) {
      const $dlg = $("<div></div>").kendoDialog({
        width: "450px",
        title: title || "Confirmation",
        modal: true,
        closable: false,
        content: message || "",
        actions: [
          { text: "Cancel", action: function () { if (onCancel) onCancel(); return true; } },
          { text: "Yes", primary: true, action: function () { if (onYes) onYes(); return true; } }
        ],
        open: function () {
          const z = 2147482000; 
          const w = this.wrapper;
          w.css("z-index", z + 1);
          $(".k-animation-container:has(.k-dialog)").css("z-index", z);
          $(".k-overlay").last().css("z-index", z - 1);
        },
        close: function () { this.destroy(); }
      }).data("kendoDialog");
      $dlg.open();
      return;
    }

    // Fallback: SweetAlert2
    this.MsgBox("info", "center", title || "Confirmation", message || "", [
      { addClass: "btn btn-primary", text: "Yes", onClick: () => onYes && onYes() },
      { addClass: "btn", text: "Cancel", onClick: () => onCancel && onCancel() }
    ], 0);
  },

  MakeFormReadOnly: function (formSelector) {
    const containerSelector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    const $c = $(containerSelector);
    if ($c.length === 0) {
      console.log("Container '" + containerSelector + "' not found.");
      return;
    }

    $c.find('input[type="text"], input[type="password"], input[type="number"], input[type="tel"], input[type="email"], input[type="url"], textarea')
      .attr("readonly", true);

    $c.find('input[type="checkbox"], input[type="radio"]')
      .prop("disabled", true)
      .css("pointer-events", "none");

    $c.find('select, input[type="file"]').prop("disabled", true);

    $c.find('[data-role="dropdownlist"], [data-role="combobox"], [data-role="multiselect"]').each(function () {
      const widget = $(this).data("kendoDropDownList") || $(this).data("kendoComboBox") || $(this).data("kendoMultiSelect");
      if (widget) widget.enable(false);
    });

    $c.find('[data-role="datepicker"], [data-role="datetimepicker"]').each(function () {
      const dp = $(this).data("kendoDatePicker") || $(this).data("kendoDateTimePicker");
      if (dp) dp.enable(false);
    });

    $c.find('[data-role="numerictextbox"], [data-role="maskedtextbox"]').each(function () {
      const nt = $(this).data("kendoNumericTextBox") || $(this).data("kendoMaskedTextBox");
      if (nt) nt.enable(false);
    });

    $c.find('[data-role="upload"]').each(function () {
      const up = $(this).data("kendoUpload");
      if (up) up.enable(false);
    });


    $c.find("#btnSave, #btnClear").hide();
  },

  MakeFormEditable: function (formSelector) {
    const containerSelector = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    const $c = $(containerSelector);
    if ($c.length === 0) {
      console.log("Container '" + containerSelector + "' not found.");
      return;
    }


    $c.find('input[type="text"], input[type="password"], input[type="number"], input[type="tel"], input[type="email"], input[type="url"], textarea')
      .removeAttr("readonly");

    $c.find('input[type="checkbox"], input[type="radio"]')
      .prop("disabled", false)
      .css("pointer-events", "");

    $c.find('select, input[type="file"]').prop("disabled", false);


    $c.find('[data-role="dropdownlist"], [data-role="combobox"], [data-role="multiselect"]').each(function () {
      const widget = $(this).data("kendoDropDownList") || $(this).data("kendoComboBox") || $(this).data("kendoMultiSelect");
      if (widget) widget.enable(true);
    });

    $c.find('[data-role="datepicker"], [data-role="datetimepicker"]').each(function () {
      const dp = $(this).data("kendoDatePicker") || $(this).data("kendoDateTimePicker");
      if (dp) dp.enable(true);
    });

    $c.find('[data-role="numerictextbox"], [data-role="maskedtextbox"]').each(function () {
      const nt = $(this).data("kendoNumericTextBox") || $(this).data("kendoMaskedTextBox");
      if (nt) nt.enable(true);
    });

    $c.find('[data-role="upload"]').each(function () {
      const up = $(this).data("kendoUpload");
      if (up) up.enable(true);
    });

    $c.find("#btnSave, #btnClear").show();
  },

  clearFormFields: function (formContainer) {
    const formSelector = formContainer.startsWith('#') ? formContainer : '#' + formContainer;
    var $Container = $(formSelector);

    // Clear text, password, number, hidden, tel, email, url inputs
    $Container.find('input[type="text"], input[type="password"], input[type="number"], input[type="hidden"], input[type="tel"], input[type="email"], input[type="url"]').val('');

    // Clear checkbox and radio
    $Container.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);

    // Clear textarea
    $Container.find('textarea').val('');

    // Reset selects
    $Container.find('select').each(function () {
      $(this).val('');
      if ($(this).data('kendoDropDownList')) {
        $(this).data('kendoDropDownList').value('');
      } else if ($(this).data('kendoComboBox')) {
        $(this).data('kendoComboBox').value('');
      } else if ($(this).data('kendoMultiSelect')) {
        $(this).data('kendoMultiSelect').value([]);
      }
    });

    // Clear Kendo DatePickers and DateTimePickers
    $Container.find("input[data-role='datepicker'], input[data-role='datetimepicker']").each(function () {
      var datePicker = $(this).data("kendoDatePicker") || $(this).data("kendoDateTimePicker");
      if (datePicker) {
        datePicker.value(null);
      }
    });

    // Clear Kendo Uploads (file input)
    $Container.find("input[type='file']").each(function () {
      var kendoUpload = $(this).data("kendoUpload");
      if (kendoUpload) {
        kendoUpload.clearAllFiles();
      } else {
        // fallback for non-Kendo file input
        $(this).val('');
      }
    });

    // ========= Enhanced File Preview Cleanup =========
    // Clear image thumbnails/previews
    $Container.find("img[id*='thumb'], img[id*='Thumb'], img[id*='thumbnail'], img[id*='Thumbnail'], img[id*='preview'], img[id*='Preview']").each(function() {
      $(this).addClass("d-none").attr("src", "#").off("click");
    });
    
    // Clear PDF/document previews
    $Container.find("button[id*='preview'], button[id*='Preview']").addClass("d-none").off("click");
    
    // Clear file name displays
    $Container.find("span[id*='Name'], span[id*='name']").text("");


    //// Clear global prospectus file data variable if exists
    //if (typeof prospectusFileData !== 'undefined') {
    //  prospectusFileData = null;
    //}
    
    //// Clear any other file-related global variables
    //if (typeof logoFileData !== 'undefined') {
    //  logoFileData = null;
    //}

    // Remove validation messages
    $Container.find(".hint").text('');
  },

  // use d-none class to initially hide content.
  formShowGridHide: function(formId, gridId){
    const formIdSelector = formId.startsWith('#') ? formId : '#' + formId;
    const gridIdSelector = gridId.startsWith('#') ? gridId : '#' + gridId;
    const $formIdSelector = $(formIdSelector);
    const $gridIdSelector = $(gridIdSelector);

    if ($formIdSelector.length === 0) {
      console.log($formIdSelector + "' not found.");
      return;
    }

    if ($gridIdSelector.length === 0) {
      console.log( $gridIdSelector + "' not found.");
      return;
    }

    // Show form and hide grid
    $formIdSelector.removeClass("d-none");
    $gridIdSelector.addClass("d-none");
  },

  // use d-none class to initially hide content.
  formHideGridShow: function(formId, gridId){
    const formIdSelector = formId.startsWith('#') ? formId : '#' + formId;
    const gridIdSelector = gridId.startsWith('#') ? gridId : '#' + gridId;
    const $formIdSelector = $(formIdSelector);
    const $gridIdSelector = $(gridIdSelector);

    if ($formIdSelector.length === 0) {
      console.log($formIdSelector + "' not found.");
      return;
    }

    if ($gridIdSelector.length === 0) {
      console.log( $gridIdSelector + "' not found.");
      return;
    }

    // Show form and hide grid
    $formIdSelector.addClass("d-none");
    $gridIdSelector.removeClass("d-none");

  },

  initializeKendoWindow: function (windowSelector, kendowWindowTitle = "", kendowWindowWidth = "50%") {
    const gridSelector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
    $(gridSelector).kendoWindow({
      title: kendowWindowTitle,
      resizeable: false,
      width: kendowWindowWidth,
      actions: ["Pin", "Refresh", "Maximize", "Close"],
      modal: true,
      visible: false,
    });
  },

  openKendoWindow: function (windowSelector, kendowWindowTitle, kendowWindowWidth = "50%") {
    const gridSelector = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;
    var popUp = $(gridSelector).data("kendoWindow");
    if (!popUp) {
      this.initializeKendoWindow(windowSelector, kendowWindowTitle, kendowWindowWidth);
    }
    if (kendowWindowTitle && kendowWindowTitle != "") {
      popUp = $(gridSelector).data("kendoWindow");
      popUp.title = kendowWindowTitle;
    }
    popUp.center().open();
    if (typeof popUp.toFront === "function") {
      popUp.toFront(); // নতুন উইন্ডো টপে আনুন
    }
  },

  closeKendoWindow: function (windowSelector) {

    if (!windowSelector.startsWith("#")) {
      windowSelector = "#" + windowSelector;
    }

    var window = $(windowSelector).data("kendoWindow");
    if (window) {
      window.close();
    } else {
      kendo.warning("No Kendo Window found for selector:", windowSelector);
    }
  },

  appandCloseButton: function (windowSelector) {
    const windowId = windowSelector.startsWith('#') ? windowSelector : '#' + windowSelector;

    const $context = $(windowId);
    const $buttonContainer = $context.find(".btnDiv ul li").first();
    if ($buttonContainer.length === 0) return;

    $buttonContainer.find(".btn-close-generic").remove();

    const closeBtn = `<button type="button" class="btn btn-danger me-2 btn-close-generic" onclick="CommonManager.closeKendoWindow('${windowId}')">Close</button>`;
    $buttonContainer.append(closeBtn);
  },

  // three parameters need, (gridId, filename and actions column name to remove from file)
  GenerateCSVFileAllPages: function (htmlId, willBeGeneratedfileName, actionsColumnName) {
    debugger;
    var grid = $("#" + htmlId).data("kendoGrid");
    var fileName = CommonManager.getFileNameWithDateTime(willBeGeneratedfileName);

    if (!grid) {
      console.error("Grid not initialized");
      return;
    }

    if (!grid.dataSource) {
      console.error("DataSource not found");
      return;
    }

    var deferred = $.Deferred();

    function generateCSV(allData) {
      var csv = "";

      var columns = grid.columns;
      var headers = [];

      for (var i = 0; i < columns.length; i++) {
        if (columns[i].field && columns[i].title !== actionsColumnName) {
          headers.push('"' + (columns[i].title || columns[i].field) + '"');
        }
      }

      csv += headers.join(",") + "\n";

      for (var i = 0; i < allData.length; i++) {
        var row = [];
        for (var j = 0; j < columns.length; j++) {
          if (columns[j].field && columns[j].title !== actionsColumnName) {
            var value = allData[i][columns[j].field] || "";
            value = String(value).replace(/"/g, '""');
            row.push('"' + value + '"');
          }
        }
        csv += row.join(",") + "\n";
      }

      // Create download
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var link = document.createElement("a");
      var url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", fileName + ".csv");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }


    if (grid.dataSource.options.serverPaging) {

      var dataSource = grid.dataSource;
      var originalPageSize = dataSource.pageSize();
      var originalPage = dataSource.page();
      var allData = [];


      dataSource.pageSize(9999);
      dataSource.page(1);

      // Request the data
      dataSource.fetch(function () {
        allData = dataSource.data();

        dataSource.pageSize(originalPageSize);
        dataSource.page(originalPage);

        generateCSV(allData);
      });
    } else {
      var allData = grid.dataSource.data();
      generateCSV(allData);
    }
  },

  // three parameters need, (gridId, filename and actions column name to remove from file)
  GenerateCSVFileCurrentPage: function (gridHtmlId, fileName, action) {

    var grid = $("#" + gridHtmlId).data("kendoGrid");

    if (!grid) {
      console.error("Grid not initialized");
      return;
    }
    console.log(grid);

    if (!grid.dataSource) {
      console.error("DataSource not found");
      return;
    }
    //console.log(grid.dataSource);

    var data = grid.dataSource.view();
    var csv = "";

    var columns = grid.columns;
    var headers = [];

    for (var i = 0; i < columns.length; i++) {
      if (columns[i].field && columns[i].title !== actionsColumnName) {
        headers.push('"' + (columns[i].title || columns[i].field) + '"');
      }
    }

    csv += headers.join(",") + "\n";

    for (var i = 0; i < data.length; i++) {
      var row = [];
      for (var j = 0; j < columns.length; j++) {
        if (columns[j].field && columns[j].title !== actionsColumnName) {
          var value = data[i][columns[j].field] || "";
          value = value.toString().replace(/"/g, '""');
          row.push('"' + value + '"');
        }
      }
      csv += row.join(",") + "\n";
    }

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", fileName + ".csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getMultiDateFormat: function () {
    return ['dd.MM.yyyy', 'dd.MM.yy', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy/MM/dd', 'dd-MM-yyyy', 'MM-dd-yyyy', 'yyyy-MM-dd', 'dd/MM/yy', 'ddMMyyyy', 'ddMMyy', 'MMddyyyy'];

  },

  getMultiMonthFormat: function () {
    return ['MM.yyyy', 'MMM yyyy', 'MMM yy', 'MMyyyy', 'MMMyyyy', 'MMyy', 'MMMyy'];

  },

  getFileNameWithDateTime: function (baseName) {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    const timestamp = `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
    return `${baseName}${timestamp}`;
  },

  // Store active resize handlers for cleanup
  _activeResizeHandlers: {},

  calculateTotalColumnsWidth: function (columns) {
    let totalWidthOfTheGrid = 0;
    columns.forEach(column => {
      if (column.width != undefined && column.width && !column.hidden) {
        const widthValue = parseInt(column.width.toString().replace(/px|%/g, ''));
        if (!isNaN(widthValue)) {
          totalWidthOfTheGrid += widthValue;
        }
      }
      else if (!column.hidden && !column.width) {
        totalWidthOfTheGrid != 120;
      }

    });
    return totalWidthOfTheGrid;
  },

  calculateGridResponsiveWidth: function (gridId, columnsArray, marginOffset = 323) {
    const containerElement = $("#" + gridId).parent();
    let availableWidth;

    // Container এর actual width নিন (zoom এর সাথে adjust হবে)
    if (containerElement.length > 0) {
      availableWidth = containerElement.width() - 40; // 40px padding জন্য
    } else {
      // Fallback: viewport এর effective width
      availableWidth = Math.floor(window.innerWidth / window.devicePixelRatio) - marginOffset;
    }

    const totalColumnsWidth = this.calculateTotalColumnsWidth(columnsArray);

    // যদি columns এর width বেশি হয় তাহলে available width ব্যবহার করুন
    return totalColumnsWidth > availableWidth ? availableWidth + "px" : totalColumnsWidth + "px";
  },

  attachGridZoomAndResizeHandlers: function (gridId, columnsArray, marginOffset = 323) {
    let resizeTimeout;
    const self = this;

    // Unique namespace 
    const eventNamespace = 'resize.kendoGrid_' + gridId;

    $(window).off(eventNamespace);

    // Window resize handler
    $(window).on(eventNamespace, function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        self.adjustGridWidth(gridId, columnsArray, marginOffset);
      }, 250);
    });

    // Zoom detection
    if (window.gridZoomIntervals && window.gridZoomIntervals[gridId]) {
      clearInterval(window.gridZoomIntervals[gridId]);
    }

    // Initialize zoom intervals object
    if (!window.gridZoomIntervals) {
      window.gridZoomIntervals = {};
    }

    // Zoom detection interval set 
    let currentZoom = window.devicePixelRatio;
    window.gridZoomIntervals[gridId] = setInterval(function () {
      if (window.devicePixelRatio !== currentZoom) {
        currentZoom = window.devicePixelRatio;
        self.adjustGridWidth(gridId, columnsArray, marginOffset);
      }
    }, 500); 
  },

  adjustGridWidth: function (gridId, columnsArray, marginOffset = 323) {
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      const newWidth = this.calculateGridResponsiveWidth(gridId, columnsArray, marginOffset);

      // Grid wrapper element  width update 
      grid.wrapper.width(newWidth);

      // Grid  table element  width update 
      grid.table.width("100%");

      // Optional: Grid header  width  update 
      if (grid.thead) {
        grid.thead.width("100%");
      }

      //  refresh Grid layout 
      setTimeout(function () {
        grid.resize();
      }, 50);
    }
  },

  destroyGridHandlers: function (gridId) {
    // Event listeners remove
    const eventNamespace = 'resize.kendoGrid_' + gridId;
    $(window).off(eventNamespace);

    // Zoom detection interval clear 
    if (window.gridZoomIntervals && window.gridZoomIntervals[gridId]) {
      clearInterval(window.gridZoomIntervals[gridId]);
      delete window.gridZoomIntervals[gridId];
    }

    // Grid destroy (optional)
    const grid = $("#" + gridId).data("kendoGrid");
    if (grid) {
      grid.destroy();
    }
  },

  /**
   * Multiple grids bulk cleanup
   * @param {Array} gridIds - Grid IDs array
   */
  destroyMultipleGridHandlers: function (gridIds) {
    const self = this;
    gridIds.forEach(function (gridId) {
      self.destroyGridHandlers(gridId);
    });
  },

  setupResponsiveGrid: function (gridId, gridOptions, columnsArray, marginOffset = 323) {

    gridOptions.width = this.calculateGridResponsiveWidth(gridId, columnsArray, marginOffset);

    $("#" + gridId).kendoGrid(gridOptions);

    this.attachGridZoomAndResizeHandlers(gridId, columnsArray, marginOffset);

    return gridOptions;
  },

  // Clean up when Grid destroy 
  cleanup: function (gridSelector) {
    const containerSelector = gridSelector.startsWith('#') ? gridSelector : '#' + gridSelector;
    CommonManager.destroyGridHandlers(containerSelector);
  },

  // Helper function to get combobox values safely
  getComboValue: function (combo, defaultValue = null) {
    if (!combo) return defaultValue;
    const value = combo.value();
    return (value !== "" && value !== null && value !== undefined) ? parseInt(value) : defaultValue;
  },

  getComboText: function (combo, defaultValue = "") {
    if (!combo) return defaultValue;
    const text = combo.text(); 
    return text || defaultValue;
  },

  getInputValue: function (selector, defaultValue = "") {
    const element = document.querySelector(selector);
    if (!element) return defaultValue;

    const value = element.value;
    return (value !== null && value !== undefined) ? value.toString().trim() : defaultValue;
  },

  getNumericValue: function (selector, defaultValue = null) {
    const value = this.getInputValue(selector, "");
    if (value === "") return defaultValue;

    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  },

  getDropDownListValue: function (dropdownlist, defaultValue = null) {
    if (!dropdownlist) return defaultValue;
    const value = dropdownlist.value();
    return (value !== "" && value !== null && value !== undefined) ? parseInt(value) : defaultValue;
  },

  getDropDownListText: function (dropdownlist, defaultValue = "") {
    if (!dropdownlist) return defaultValue;
    const dataItem = dropdownlist.dataItem();
    return dataItem ? dataItem.text || dataItem[dropdownlist.options.dataTextField] || defaultValue : defaultValue;
  },

  getMultiSelectValues: function (multiselect, defaultValue = []) {
    if (!multiselect) return defaultValue;

    const values = multiselect.value();
    if (!Array.isArray(values)) return defaultValue;

    const filteredValues = values.filter(v => v !== null && v !== undefined && v !== "");

    return filteredValues.length > 0 ? filteredValues.map(v => parseInt(v)) : defaultValue;
  },

  getMultiSelectTexts: function (multiselect, defaultValue = []) {
    if (!multiselect) return defaultValue;

    const dataItems = multiselect.dataItems();
    if (!dataItems || dataItems.length === 0) return defaultValue;

    return dataItems.map(item => item.text || item[multiselect.options.dataTextField] || "").filter(Boolean);
  },

  getBooleanValue: function (selector, defaultValue = false) {
    const element = $(selector);
    return element.length ? element.is(":checked") : defaultValue;
  },

  changeDateFormat: function (value, isTime) {
    var time = value.replace(/\/Date\(([0-9]*)\)\//, '$1');
    var date = new Date();
    date.setTime(time);
    if (isTime == 0) {
      return (date.getDate().toString().length == 2 ? date.getDate() : '0' + date.getDate()) + '-' + ((date.getMonth() + 1).toString().length == 2 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + date.getFullYear();
    }
    else {
      return (date.getDate().toString().length == 2 ? date.getDate() : '0' + date.getDate()) + '-' + ((date.getMonth() + 1).toString().length == 2 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + date.getFullYear()
        + '<br> ' + (date.getHours().toString().length == 2 ? date.getHours() : '0' + date.getHours()) + ':' + (date.getMinutes().toString().length == 2 ? date.getMinutes() : '0' + date.getMinutes()) + ':' + (date.getSeconds().toString().length == 2 ? date.getSeconds() : '0' + date.getSeconds());
    }
  },

  getCurrentDateTime: function () {
    var date = new Date();
    var day = (date.getDate().toString().length == 2 ? date.getDate() : '0' + date.getDate()).toString();
    var month = ((date.getMonth() + 1).toString().length == 2 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)).toString();
    var year = date.getFullYear().toString();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var suffix = "AM";
    if (hours >= 12) {
      suffix = "PM";
      hours = hours - 12;
    }
    if (hours == 0) {
      hours = 12;
    }

    if (minutes < 10)
      minutes = "0" + minutes;
    //var CurrentDateTime = day + "/" + month + "/" + year + " " + hours + ":" + minutes + " " + suffix;
    //var CurrentDateTime = day + "/" + month + "/" + year + " " + hours + ":" + minutes;
    var CurrentDateTime = day + "-" + month + "-" + year;
    return CurrentDateTime;
  },

  changeToSQLDateFormat: function (value, isTime) {

    if (value != "/Date(-62135596800000)/") {
      var time = value.replace(/\/Date\(([0-9]*)\)\//, '$1');
      var date = new Date();
      date.setTime(time);
      var dd = (date.getDate().toString().length == 2 ? date.getDate() : '0' + date.getDate()).toString();
      var mm = ((date.getMonth() + 1).toString().length == 2 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)).toString();
      var yyyy = date.getFullYear().toString();
      var timeformat = "";
      if (isTime == 1) {
        timeformat = (date.getHours().toString().length == 2 ? date.getHours() : '0' + date.getHours()) + ':' + (date.getMinutes().toString().length == 2 ? date.getMinutes() : '0' + date.getMinutes()) + ':' + (date.getSeconds().toString().length == 2 ? date.getSeconds() : '0' + date.getSeconds());
      }
      var sqlFormatedDate = mm + '/' + dd + '/' + yyyy + ' ' + timeformat;
      return sqlFormatedDate;
    }
    else {
      return "";
    }
  },

  changeReverseDateFormat: function (value) {
    dtvalue = value.split('-');
    var datetime = dtvalue[1] + "/" + dtvalue[0] + "/" + dtvalue[2];
    return datetime;
  },

  changeFormattedDate: function (value, format) {
    var date = new Date(value);
    if (format == "DDMMYYYY") {
      var val = (date.getDate().toString().length == 2 ? date.getDate() : '0' + date.getDate()) + '-' + ((date.getMonth() + 1).toString().length == 2 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + date.getFullYear();
      if (val == "0NaN-0NaN-NaN") {
        return "";
      } else {
        return val;
      }
    }
    if (format == "MMDDYYYY") {
      return ((date.getMonth() + 1).toString().length == 2 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate().toString().length == 2 ? date.getDate() : '0' + date.getDate()) + '-' + date.getFullYear();
    }
  },

  getDayDifference: function (date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = new Date(date1).getTime();
    var date2_ms = new Date(date2).getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return
    return Math.round(difference_ms / ONE_DAY);

  },

  getMonthDifference: function (date1, date2) {

    // The number of milliseconds in one Month
    var Month_DAY = 1000 * 60 * 60 * 24 * 30;

    // Convert both dates to milliseconds
    var date1_ms = new Date(date1).getTime();
    var date2_ms = new Date(date2).getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return
    return Math.round(difference_ms / Month_DAY);

  },

  getYearDifference: function (currentDate, backdate) {

    var ageDifMs = currentDate - backdate.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);

  },

  getYearDifferenceWithFloor: function (currentDate, backdate) {

    var ageDifMs = currentDate - backdate.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.floor(ageDate.getUTCFullYear() - 1970);

  },

  hideMasterDetailsForPrint: function () {
    $("#header").hide();
    $("#dynamicmenu").hide();
    $("#divWelcome").hide();
    $("#content").hide();
    $("#main").css({
      "background-color": "#ffffff"
    });
    $("body").css({
      "background-color": "#ffffff"
    });
    $("#footer").hide();
  },

  showMasterDetailsForPrint: function () {
    $("#header").show();
    $("#dynamicmenu").show();
    $("#divWelcome").show();
    $("#content").show();
    $("#main").css({
      "background-color": "#A6D77B"
    });
    $("body").css({
      "background-color": "#A6D77B"
    });
    $("#footer").show();
  },

  GetHeightArray: function () {
    var items = [["3'0\""], ["3'1\""], ["3'2\""], ["3'3\""],
    ["3'4\""], ["3'5\""], ["3'6\""], ["3'7\""], ["3'8\""],
    ["3'9\""], ["3'10\""], ["3'11\""], ["4'0\""], ["4'1\""],
    ["4'2\""], ["4'3\""], ["4'4\""], ["4'5\""], ["4'6\""], ["4'7\""],
    ["4'8\""], ["4'9\""], ["4'10\""], ["4'11\""], ["5'0\""], ["5'1\""],
    ["5'2\""], ["5'3\""], ["5'4\""], ["5'5\""], ["5'6\""], ["5'7\""], ["5'8\""],
    ["5'9\""], ["5'10\""], ["5'11\""], ["6'0\""], ["6'1\""], ["6'2\""],
    ["6'3\""], ["6'4\""], ["6'5\""], ["6'6\""], ["6'7\""], ["6'8\""],
    ["6'9\""], ["6'10\""], ["6'11\""], ["7'0\""], ["7'1\""], ["7'2\""],
    ["7'3\""], ["7'4\""], ["7'5\""], ["7'6\""], ["7'7\""], ["7'8\""],
    ["7'9\""], ["7'10\""], ["7'11\""], ["8'0\""]];
    return items;
  },

  /**/
  /**
   * 
* Calculate the number of months between two dates

* @param {Date} date1 - The start date

* @param {Date} date2 - The end date

* @returns {number} - The number of months between the two dates

*/

  daysBetween: function (date1, date2) {

    var d1 = new Date(date1);
    var d2 = new Date(date2);

    date1 = (d1.getMonth() + 1) + '/' + d1.getDate() + '/' + d1.getFullYear();
    date2 = (d2.getMonth() + 1) + '/' + d2.getDate() + '/' + d2.getFullYear();
    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = new Date(date1).getTime();
    var date2_ms = new Date(date2).getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return
    return Math.round(difference_ms / ONE_DAY);

  },

  GetBloodGroupArray: function () {
    var items = [["A+"], ["A-"], ["B+"], ["B-"], ["AB+"], ["AB-"], ["O+"], ["O-"]];
    return items;
  },

  GetBloodGroupArrayInBangla: function () {
    var items = [["এ+"], ["এ-"], ["বি+"], ["বি-"], ["এবি+"], ["এবি-"], ["ও+"], ["ও-"]];
    return items;
  },

  GetDistrictInformation: function () {
    var items = [["Barguna"],
    ["Barishal"],
    ["Bhola"],
    ["Jhalokati"],
    ["Patuakhali"],
    ["Pirojpur"],
    ["Bandarban"],
    ["Brahmanbaria"],
    ["Chandpur"],
    ["Chittagong"],
    ["Comilla"],
    ["Coxs Bazar"],
    ["Feni"],
    ["Khagrachhari"],
    ["Lakshmipur"],
    ["Noakhali"],
    ["Rangamati"],
    ["Dhaka"],
    ["Faridpur"],
    ["Gazipur"],
    ["Gopalganj"],
    ["Jamalpur"],
    ["Kishoreganj"],
    ["Madaripur"],
    ["Manikganj"],
    ["Munshiganj"],
    ["Mymensingh"],
    ["Narayanganj"],
    ["Narsingdi"],
    ["Netrakona"],
    ["Rajbari"],
    ["Shariatpur"],
    ["Sherpur"],
    ["Tangail"],
    ["Bagerhat"],
    ["Chuadanga"],
    ["Jessore"],
    ["Jhenaidah"],
    ["Khulna"],
    ["Kushtia"],
    ["Magura"],
    ["Meherpur"],
    ["Narail"],
    ["Satkhira"],
    ["Bogra"],
    ["Joypurhat"],
    ["Naogaon"],
    ["Natore"],
    ["Nawabganj"],
    ["Pabna"],
    ["Rajshahi"],
    ["Sirajganj"],
    ["Dinajpur"],
    ["Gaibandha"],
    ["Kurigram"],
    ["Lalmonirhat"],
    ["Nilphamari"],
    ["Panchagarh"],
    ["Rangpur"],
    ["Thakurgaon"],
    ["Habiganj"],
    ["Moulvibazar"],
    ["Sunamganj"],
    ["Sylhet"]];
    return items;
  },

  getCountryNames: function () { return [["Afghanistan"], ["Albania"], ["Algeria"], ["Andorra"], ["Angola"], ["Antarctica"], ["Antigua and Barbuda"], ["Argentina"], ["Armenia"], ["Australia"], ["Austria"], ["Azerbaijan"], ["Bahamas"], ["Bahrain"], ["Bangladesh"], ["Barbados"], ["Belarus"], ["Belgium"], ["Belize"], ["Benin"], ["Bermuda"], ["Bhutan"], ["Bolivia"], ["Bosnia and Herzegovina"], ["Botswana"], ["Brazil"], ["Brunei"], ["Bulgaria"], ["Burkina Faso"], ["Burma"], ["Burundi"], ["Cambodia"], ["Cameroon"], ["Canada"], ["Cape Verde"], ["Central African Republic"], ["Chad"], ["Chile"], ["China"], ["Colombia"], ["Comoros"], ["Congo"], ["Democratic Republic"], ["Congo"], ["Republic of the"], ["Costa Rica"], ["Cote d'Ivoire"], ["Croatia"], ["Cuba"], ["Cyprus"], ["Czech Republic"], ["Denmark"], ["Djibouti"], ["Dominica"], ["Dominican Republic"], ["East Timor"], ["Ecuador"], ["Egypt"], ["El Salvador"], ["Equatorial Guinea"], ["Eritrea"], ["Estonia"], ["Ethiopia"], ["Fiji"], ["Finland"], ["France"], ["Gabon"], ["Gambia"], ["Georgia"], ["Germany"], ["Ghana"], ["Greece"], ["Greenland"], ["Grenada"], ["Guatemala"], ["Guinea"], ["Guinea-Bissau"], ["Guyana"], ["Haiti"], ["Honduras"], ["Hong Kong"], ["Hungary"], ["Iceland"], ["India"], ["Indonesia"], ["Iran"], ["Iraq"], ["Ireland"], ["Israel"], ["Italy"], ["Jamaica"], ["Japan"], ["Jordan"], ["Kazakhstan"], ["Kenya"], ["Kiribati"], ["Korea North"], ["Korea South"], ["Kuwait"], ["Kyrgyzstan"], ["Laos"], ["Latvia"], ["Lebanon"], ["Lesotho"], ["Liberia"], ["Libya"], ["Liechtenstein"], ["Lithuania"], ["Luxembourg"], ["Macedonia"], ["Madagascar"], ["Malawi"], ["Malaysia"], ["Maldives"], ["Mali"], ["Malta"], ["Marshall Islands"], ["Mauritania"], ["Mauritius"], ["Mexico"], ["Micronesia"], ["Moldova"], ["Mongolia"], ["Morocco"], ["Monaco"], ["Mozambique"], ["Namibia"], ["Nauru"], ["Nepal"], ["Netherlands"], ["New Zealand"], ["Nicaragua"], ["Niger"], ["Nigeria"], ["Norway"], ["Oman"], ["Pakistan"], ["Panama"], ["Papua New Guinea"], ["Paraguay"], ["Peru"], ["Philippines"], ["Poland"], ["Portugal"], ["Qatar"], ["Romania"], ["Russia"], ["Rwanda"], ["Samoa"], ["San Marino"], ["Sao Tome"], ["Saudi Arabia"], ["Senegal"], ["Serbia and Montenegro"], ["Seychelles"], ["Sierra Leone"], ["Singapore"], ["Slovakia"], ["Slovenia"], ["Solomon Islands"], ["Somalia"], ["South Africa"], ["Spain"], ["Sri Lanka"], ["Sudan"], ["Suriname"], ["Swaziland"], ["Sweden"], ["Switzerland"], ["Syria"], ["Taiwan"], ["Tajikistan"], ["Tanzania"], ["Thailand"], ["Togo"], ["Tonga"], ["Trinidad and Tobago"], ["Tunisia"], ["Turkey"], ["Turkmenistan"], ["Uganda"], ["Ukraine"], ["United Arab Emirates"], ["United Kingdom"], ["United States"], ["Uruguay"], ["Uzbekistan"], ["Vanuatu"], ["Venezuela"], ["Vietnam"], ["Yemen"], ["Zambia"], ["Zimbabwe"]]; },

  getCountryArray: function () {
    var countryList = [["Barguna"], ["Barishal"], ["Bhola"], ["Jhalokati"], ["Patuakhali"], ["Pirojpur"], ["Bandarban"], ["Brahmanbaria"], ["Chandpur"], ["Chittagong"], ["Comilla"], ["Coxs Bazar"], ["Feni"], ["Khagrachhari"], ["Lakshmipur"], ["Noakhali"], ["Rangamati"], ["Dhaka"], ["Faridpur"], ["Gazipur"], ["Gopalganj"], ["Jamalpur"], ["Kishoreganj"], ["Madaripur"], ["Manikganj"], ["Munshiganj"], ["Mymensingh"], ["Narayanganj"], ["Narsingdi"], ["Netrakona"], ["Rajbari"], ["Shariatpur"], ["Sherpur"], ["Tangail"], ["Bagerhat"], ["Chuadanga"], ["Jessore"], ["Jhenaidah"], ["Khulna"], ["Kushtia"], ["Magura"], ["Meherpur"], ["Narail"], ["Satkhira"], ["Bogra"], ["Joypurhat"], ["Naogaon"], ["Natore"], ["Nawabganj"], ["Pabna"], ["Rajshahi"], ["Sirajganj"], ["Dinajpur"], ["Gaibandha"], ["Kurigram"], ["Lalmonirhat"], ["Nilphamari"], ["Panchagarh"], ["Rangpur"], ["Thakurgaon"], ["Habiganj"], ["Moulvibazar"], ["Sunamganj"], ["Sylhet"]];

    let countryDictionary = {};

    countryList.forEach((country, index) => {
      countryDictionary[index + 1] = country;
    });

    return countryDictionary;
  },

  getCountryData: function () {
    debugger;
    var countries = CountryManager.getCountryArray();

    var countryArray = Object.entries(countries).map(([key, value]) => {
      return {
        CountryId: parseInt(key),
        CountryName: value
      };
    });
  },

  replaceSingleQoute: function (formSelector) {
    const checkString = formSelector.startsWith('#') ? formSelector : '#' + formSelector;
    checkString = checkString.replace(/'/g, "''");
    return checkString;

  },

  Trim: function (s) {
    //return s.replace(s,"/^ *(\w+ ?)+ *$/", "");
    return (s.replace(/\s+/g, ' ')).trim();
  },

  toTitleCase: function (str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  },

  AmountInWord: function (number) {

    var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];


    if ((number = number.toString()).length > 9) return 'overflow';
    n = ('000000000' + number).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";
    var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
  },

  /* -------- Grid Date time input field -------- */
  datePickerEditor: function (container, options) {
    $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '"/>')
      .appendTo(container)
      .kendoDatePicker({
        format: "dd-MMM-yyyy",
        parseFormats: ["yyyy-MM-dd", "dd/MM/yyyy", "dd-MMM-yyyy"],
        placeholder: "Select Date"
      });
  },

  /* -------- Grid Textarea editor -------- */
  textareaEditor: function (container, options) {
    $('<textarea data-bind="value:' + options.field + '" rows="3" style="width: 100%; resize: vertical;"></textarea>')
      .appendTo(container);
  },

  /* -------- Processing Overlay Functions -------- */
  showProcessingOverlay: function (message = "Processing... Please wait.") {
    // Remove existing overlay if any
    this.hideProcessingOverlay();

    // Create overlay HTML
    const overlayHtml = `
      <div id="crmProcessingOverlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 99999;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: white;
          padding: 30px 40px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          text-align: center;
          min-width: 300px;
        ">
          <div style="
            margin-bottom: 20px;
          ">
            <div style="
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #007bff;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 15px auto;
            "></div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
          <div style="
            font-size: 16px;
            color: #333;
            font-weight: 500;
            line-height: 1.4;
          ">
            ${message}
          </div>
          <div style="
            font-size: 12px;
            color: #666;
            margin-top: 10px;
          ">
            Please do not close or refresh the page
          </div>
        </div>
      </div>
    `;

    // Add overlay to body
    $("body").append(overlayHtml);

    // Disable scrolling
    $("body").css("overflow", "hidden");

    // Disable all form inputs to prevent user interaction
    $("input, button, select, textarea").prop("disabled", true);
    $("a").css("pointer-events", "none");

    console.log("Processing overlay shown:", message);
  },

  hideProcessingOverlay: function () {
    // Remove overlay
    $("#crmProcessingOverlay").remove();

    // Re-enable scrolling
    $("body").css("overflow", "");

    // Re-enable all form inputs
    $("input, button, select, textarea").prop("disabled", false);
    $("a").css("pointer-events", "");

    console.log("Processing overlay hidden");
  },

};

/* =========================================================
    Toastr Message
=========================================================*/
var ToastrMessage = {

  showToastrNotification: function (options = {}) {
    const defaultOptions = {
      preventDuplicates: true,
      closeButton: options.timeOut === 0 ? true : false,
      progressBar: options.timeOut > 0 ? true : false,
      timeOut: options.timeOut || 5000,
      positionClass: options.positionClass || 'toast-top-right',
      extendedTimeOut: 1000,
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut',
      escapeHtml: false // Allow HTML in Toastr messages
    };

    toastr.options = defaultOptions;

    const title = options.title || null;
    const message = options.message || 'This is a message';
    const type = options.type ? options.type.toLowerCase() : 'info';

    switch (type) {
      case 'success':
        toastr.success(message, title);
        break;
      case 'error':
        toastr.error(message, title);
        break;
      case 'warning':
        toastr.warning(message, title);
        break;
      case 'info':
      default:
        toastr.info(message, title);
        break;
    }
  },

  showSuccess: function (message, title = null, timeOut = 3000) {
    ToastrMessage.showToastrNotification({ message, title, type: 'success', timeOut });
  },

  showError: function (message, title = null, timeOut = 0) {
    ToastrMessage.showToastrNotification({ message, title, type: 'error', timeOut });
  },

  showWarning: function (message, title = null, timeOut = 5000) {
    ToastrMessage.showToastrNotification({ message, title, type: 'warning', timeOut });
  },

  showInfo: function (message, title = null, timeOut = 3000) {
    ToastrMessage.showToastrNotification({ message, title, type: 'info', timeOut });
  },

  formatApiErrorMessage: function (errorResponse) {
    debugger;
    let statusCode = errorResponse.statusCode || 500;
    let errorType = errorResponse.errorType || "Error";
    let message = errorResponse.message || "Unknown error";
    let correlationId = errorResponse.correlationId || "";
    let details = errorResponse.details || "";
    let consoleMessage = "";

    let displayMessage = `<strong>[${statusCode}] ${errorType}</strong><br>`;
    displayMessage += `${message}<br>`;

    if (correlationId) {
      consoleMessage = displayMessage + `<small>Correlation ID: ${correlationId}</small><br>`;
    }

    if (details) {
      consoleMessage += `<small><strong>Details:</strong> ${details.replace(/\r\n/g, "<br>")}</small>`;
    }

    console.log(consoleMessage);
    return displayMessage;
  }

};

/* =========================================================
   Validator Functions
=========================================================*/
var ValidatorManager = {

  validator: function (divId) {

    var validator = divId.kendoValidator().data("kendoValidator"),
      status = $(".status");

    if (validator.validate()) {
      status.text("").addClass("valid");
      return true;
    } else {
      status.text("Oops! There is invalid data in the form.").addClass("invalid");
      return false;
    }
  },

  isValidItem: function (ctrlId, isClear) {
    debugger;
    var cmbBox = $("#" + ctrlId).data("kendoComboBox");

    if (cmbBox.value() != "" && cmbBox.value() == cmbBox.text()) {
      AjaxManager.MsgBox('warning', 'center', 'Invalid Item:', 'No Item matched with your Input data as like "[' + cmbBox.text() + ']"!', [{
        addClass: 'btn btn-primary',
        text: 'Ok',
        onClick: function ($noty) {
          $noty.close();
          //cmbBox.focus();
          if (isClear)
            cmbBox.value('');


        }
      }
      ]);
      return false;
    } else {
      return true;
    }
  },

  isEmpty: function (s) {
    return !((s != null) && /^\s*(\S+(\s+\S+)*)\s*$/.test(s));
  },

  isFloat: function (s) {
    return /^\s*(\d+)?(\.(\d+))?\s*$/.test(s);
  },

  isDate: function (str) {
    if (str != null) {
      var m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      return (m) ? true : false;
    }
    return false;

  },

  isDigit: function (s) {
    return /^\s*\d+\s*$/.test(s);
  },

  isValidDate: function (ctrlId) {
    var res = false;
    var dateTo = $("#" + ctrlId).val();
    if (!AjaxManager.isDate(dateTo)) {
      AjaxManager.MsgBox('warning', 'center', 'Invalid Date', 'Invalid Date. e.g.: MM/dd/yyyy', [{
        addClass: 'btn btn-primary',
        text: 'Ok',
        onClick: function ($noty) {
          $noty.close();
          $("#" + ctrlId).val('');
          $("#" + ctrlId).focus();
        }
      }
      ]);
      res = false;
    } else {
      res = true;
    }
    return res;
  },

};


/* =========================================================
   Global File Validation Functions
=========================================================*/
var FileValidationManager = {
  
  /**
   * Validates image file for size (max 2MB) and type
   * @param {File} file - The file to validate
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result {isValid: boolean, errorMessage: string}
   */

  validateImageFile: function (file, options = {}) {
    const config = {
      maxSizeInMB: options.maxSizeInMB || 2, // Default 2MB
      allowedTypes: options.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions: options.allowedExtensions || ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      showToast: options.showToast !== false // Default true
    };

    if (!file) {
      return {
        isValid: false,
        errorMessage: "No file selected"
      };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type.toLowerCase())) {
      const errorMsg = `Invalid file type. Only ${config.allowedTypes.join(', ')} files are allowed.`;
      if (config.showToast && typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError(errorMsg, "Invalid File Type", 5000);
      }
      return {
        isValid: false,
        errorMessage: errorMsg
      };
    }

    // Check file extension
    if (file.name) {
      const fileName = file.name.toLowerCase();
      const hasValidExtension = config.allowedExtensions.some(ext => fileName.endsWith(ext));
      if (!hasValidExtension) {
        const errorMsg = `Invalid file extension. Only ${config.allowedExtensions.join(', ')} files are allowed.`;
        if (config.showToast && typeof ToastrMessage !== "undefined") {
          ToastrMessage.showError(errorMsg, "Invalid File Extension", 5000);
        }
        return {
          isValid: false,
          errorMessage: errorMsg
        };
      }
    }

    // Check file size (convert MB to bytes)
    const maxSizeInBytes = config.maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const errorMsg = `File size (${fileSizeInMB} MB) exceeds maximum allowed size of ${config.maxSizeInMB} MB.`;
      if (config.showToast && typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError(errorMsg, "File Size Exceeded", 5000);
      }
      return {
        isValid: false,
        errorMessage: errorMsg
      };
    }

    // All validations passed
    return {
      isValid: true,
      errorMessage: null,
      fileInfo: {
        name: file.name,
        size: file.size,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
        type: file.type
      }
    };
  },

  /**
   * Validates any file for size
   * @param {File} file - The file to validate
   * @param {number} maxSizeInMB - Maximum file size in MB
   * @param {boolean} showToast - Whether to show toast message
   * @returns {Object} - Validation result
   */

  validateFileSize: function (file, maxSizeInMB = 2, showToast = true) {
    if (!file) {
      return {
        isValid: false,
        errorMessage: "No file selected"
      };
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const errorMsg = `File size (${fileSizeInMB} MB) exceeds maximum allowed size of ${maxSizeInMB} MB.`;
      
      if (showToast && typeof ToastrMessage !== "undefined") {
        ToastrMessage.showError(errorMsg, "File Size Exceeded", 5000);
      }
      
      return {
        isValid: false,
        errorMessage: errorMsg
      };
    }

    return {
      isValid: true,
      errorMessage: null,
      fileInfo: {
        name: file.name,
        size: file.size,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
        type: file.type
      }
    };
  },

  /**
   * Get formatted file size
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize: function(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

var accessArray = [];
var CommonFunctions = {

  /**
   * Get access permissions for current user
   * @param {number} moduleId - Module ID (optional, default: 0)
   * @param {number} menuId - Menu ID (optional, default: 0)
   * @returns {Promise<Array>} - Access permissions array
   */
  GetAccessPermisionForCurrentUser: async function (moduleId = 0, menuId = 0) {
    try {
      const serviceUrl = "/groups/accesspermisionforcurrentuser";
      const commonProperty = { ModuleId: moduleId, MenuId: menuId, UserId: 0 };
      const res = await VanillaApiCallManager.post( baseApi, serviceUrl, commonProperty );

      if (res && res.IsSuccess === true && Array.isArray(res.Data)) {
        accessArray = [];

        for (var i = 0; i < res.Data.length; i++) {
          accessArray.push(res.Data[i]);
        }

        console.log(`Access permissions loaded: ${accessArray.length} items`);
        return res.Data;
      } else {
        console.warn("No access permissions found or API returned error");
        return [];
      }
    } catch (err) {
      console.error("Error loading access permissions:", err);

      if (typeof VanillaApiCallManager !== "undefined") {
        VanillaApiCallManager.handleApiError(err);
      }

      return [];
    }
  },

  /**
   * Check if current user is HR
   * @returns {boolean}
   */
  checkCurrentUser: function () {
    var hr = false;

    for (var i = 0; i < accessArray.length; i++) {
      if (accessArray[i].ReferenceID == 22) {
        hr = true;
        break;
      }
    }

    return hr;
  },

  /**
   * Check if user has specific reference ID permission
   * @param {number} referenceId - Reference ID to check
   * @returns {boolean}
   */
  hasPermission: function (referenceId) {
    return accessArray.some(function (item) {
      return item.ReferenceID === referenceId;
    });
  },

  /**
   * Get all permissions for current user
   * @returns {Array}
   */
  getAllPermissions: function () {
    return accessArray;
  }
};
