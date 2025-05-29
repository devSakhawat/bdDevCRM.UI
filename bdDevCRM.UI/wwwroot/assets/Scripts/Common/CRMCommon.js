
//---------------------------------- common--------------------------------------------
/// <reference path="../../jquery-3.7.min.js" />
/// <reference path="postify.js" />
/// <reference path="../../json2.js" />
/// <reference path="../../../UIFramework/MessageBox/js/noty/jquery.noty.js" />
/// <reference path="~/Scripts/eAzolution/Common/CommonMessage.js" />
var baseUI = "https://localhost:7145/"



// Here Ajax call is strongly type.
// Configuration class for Ajax requests
class AjaxConfig {
  // Mandatory fields
  controller = ''; // Controller name
  action = '';     // Action name
  data = null;     // Data to send

  // Optional fields with default values
  method = 'POST';
  cache = false;
  contentType = 'application/json';
  timeout = 30000;
  headers = {};
  beforeSend = null;
  complete = null;
  retries = 3;
  retryDelay = 1000;
  antiForgeryToken = true;  // Whether to include anti-forgery token
  loadingElementId = '';    // ID of element to show/hide during loading
  area = '';               // MVC Area name if using areas

  // Validation method
  validate() {
    const errors = [];

    // Check mandatory fields
    if (!this.controller) errors.push('Controller name is required');
    if (!this.action) errors.push('Action name is required');

    // Validate specific field formats
    if (this.timeout && typeof this.timeout !== 'number')
      errors.push('Timeout must be a number');
    if (this.retries && typeof this.retries !== 'number')
      errors.push('Retries must be a number');

    return errors;
  }
}


// Main Ajax utility for MVC
const MvcAjaxUtils = {
  /**
   * Send asynchronous request to MVC controller action
   * @param {AjaxConfig} config - Configuration object
   * @returns {Promise} - Promise that resolves with the response
   */
  async sendAsync(config) {
    // Validate configuration
    if (!(config instanceof AjaxConfig)) {
      throw new Error('Configuration must be an instance of AjaxConfig');
    }

    const validationErrors = config.validate();
    if (validationErrors.length > 0) {
      throw new Error(`Configuration validation failed: ${validationErrors.join(', ')}`);
    }

    // Build URL
    let url = '';
    if (config.area) {
      url += `/${config.area}`;
    }
    url += `/${config.controller}/${config.action}`;

    // Process data
    let processedData = config.data;
    if (typeof config.data === 'object' && config.contentType.includes('application/json')) {
      processedData = JSON.stringify(config.data);
    }

    // Retry mechanism
    const retry = async (attempt = 1) => {
      try {
        // Show loading element if specified
        if (config.loadingElementId) {
          $(`#${config.loadingElementId}`).show();
        }

        // Get anti-forgery token if enabled
        let headers = { ...config.headers };
        if (config.antiForgeryToken) {
          const token = $('input[name="__RequestVerificationToken"]').val();
          if (token) {
            headers['RequestVerificationToken'] = token;
          }
        }

        const response = await $.ajax({
          url: url,
          method: config.method,
          data: processedData,
          cache: config.cache,
          contentType: config.contentType,
          timeout: config.timeout,
          headers: headers,
          beforeSend: (xhr) => {
            // Add request tracking ID
            xhr.setRequestHeader('X-Request-ID',
              `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

            if (config.beforeSend) {
              config.beforeSend(xhr);
            }
          },
          complete: (xhr, status) => {
            // Hide loading element
            if (config.loadingElementId) {
              $(`#${config.loadingElementId}`).hide();
            }

            if (config.complete) {
              config.complete(xhr, status);
            }
          }
        });

        return response;

      } catch (error) {
        if (attempt < config.retries) {
          // Wait before retrying
          await new Promise(resolve =>
            setTimeout(resolve, config.retryDelay * attempt));

          console.warn(`Retry attempt ${attempt + 1} for ${url}`);
          return retry(attempt + 1);
        }

        throw error;
      }
    };

    return retry();
  }
};

/////////////////////////////////////////////////////////////////////////////////
// Old Code
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
var CurrentUser = null;

var AjaxManager = {

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
      success: function (jsonResult) {
        objResult = jsonResult;
      },
      error: function (error) {
        window.alert(error.statusText);
      }
    });

    return objResult;
  },

  getMultiDateFormat: function () {
    return ['dd.MM.yyyy', 'dd.MM.yy', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy/MM/dd', 'dd-MM-yyyy', 'MM-dd-yyyy', 'yyyy-MM-dd', 'dd/MM/yy', 'ddMMyyyy', 'ddMMyy'];
  },

  getMultiMonthFormat: function () {
    return ['MM.yyyy', 'MMM yyyy', 'MMM yy', 'MMyyyy', 'MMMyyyy', 'MMyy', 'MMMyy'];

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

  SendJson2: function (serviceUrl, jsonParams, successCallback, errorCallback) {
    jQuery.ajax({
      url: serviceUrl,
      async: false,
      type: "POST",
      data: "{" + jsonParams + "}",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
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

  Export1: function (serviceUrl, jsonParams) {

    //  var jsonParam = 'param:' + JSON.stringify(finalSubmitedParam) + ',reportId:' + reportId;
    $.blockUI({
      message: $('#divBlockMessage'),
      onBlock: function () {
        AjaxManager.SendJson(serviceUrl, jsonParams, function (result) {

          $.unblockUI();
          window.open(result, '_self');


        }, function () {
          $.unblockUI();
        });
      }
    });
  },

  //Custome Message Box designed By Sakhawat used sweet alert 2
  //======================================================================================
  // message box with auto hide delay
  MsgBox: function (messageBoxType, displayPosition, messageBoxHeaderText, messageText, buttonsArray, autoHideDelay = 3000) {
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
          swalConfig.confirmButtonClass = primaryButton.addClass || 'btn btn-primary';
          swalConfig.focusConfirm = true;
        }
        if (cancelButton) {
          swalConfig.showCancelButton = true;
          swalConfig.cancelButtonText = cancelButton.text || 'Cancel';
          swalConfig.cancelButtonClass = cancelButton.addClass || 'btn';
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


  MsgBoxWithoutAutoHideDelay: function (messageBoxType, displayPosition, messageBoxHeaderText, messageText, buttonsArray) {
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
          swalConfig.confirmButtonClass = primaryButton.addClass || 'btn btn-primary';
          swalConfig.focusConfirm = true;
        }

        if (cancelButton) {
          swalConfig.showCancelButton = true;
          swalConfig.cancelButtonText = cancelButton.text || 'Cancel';
          swalConfig.cancelButtonClass = cancelButton.addClass || 'btn';
        }
      }

      // Fire the SweetAlert2 dialog
      return Swal.fire(swalConfig).then((result) => {
        if (result.isConfirmed && buttonsArray[0] && typeof buttonsArray[0].onClick === 'function') {
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
  //======================================================================================
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
      visible: false

    });
    $("#" + ctrId).data("kendoWindow").open().center();

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
      //var sqlFormatedDate = dd + '/' + mm + '/' + yyyy + ' ' + timeformat;

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
    debugger;
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
    debugger;
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

  isFloat: function (s) {
    return /^\s*(\d+)?(\.(\d+))?\s*$/.test(s);
  },
  isDate: function (str) {
    var m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    return (m) ? true : false;
  },
  isDigit: function (s) {
    return /^\s*\d+\s*$/.test(s);
  },

  isEmpty: function (s) {
    return !((s != null) && /^\s*(\S+(\s+\S+)*)\s*$/.test(s));
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
  replaceSingleQoute: function (id) {

    var checkString = $("#" + id).val();
    checkString = checkString.replace(/'/g, "''");
    return checkString;

  },


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

  Trim: function (s) {
    //return s.replace(s,"/^ *(\w+ ?)+ *$/", "");
    return (s.replace(/\s+/g, ' ')).trim();
  },
  isValidItem: function (ctrlId, isClear) {

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
  toTitleCase: function (str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  },
  AmountInWord: function (number) {

    var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
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
  },
  getAgeCalculation: function (dateOfBirth) {
    dob = new Date(dateOfBirth);
    var today = new Date();
    var age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  },
};                       //End AjaxManager

var MenuManager2 = {
  getMenu: function (moduleId) {
    var pathName = window.location.pathname;
    var pageName = pathName.substring(pathName.lastIndexOf('/') + 1);
    var serviceURL = "../Menu/SelectMenuByUserPermission/";
    var jsonParam = "";// "moduleId=" + moduleId;
    AjaxManager.GetJsonResult(serviceURL, jsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {
      //MenuManager.populateMenus(jsonData);
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
  },
  getCurrentUser: function (menuRefresh) {
    var jsonParam = '';
    //var pathName = window.location.pathname;
    //var pageName = pathName.substring(pathName.lastIndexOf('/') + 1);
    var serviceURL = "../Home/GetCurrentUser";
    //if (pageName.toLowerCase() == "home.mvc") {
    //    serviceURL = "./Home/GetCurrentUser";
    //}
    //else {
    //    serviceURL = "./GetCurrentUser";
    //}
    AjaxManager.SendJson2(serviceURL, jsonParam, onSuccess, onFailed);
    function onSuccess(jsonData) {
      CurrentUser = jsonData;
      if (CurrentUser != undefined) {
        if (menuRefresh == true) {
          MenuManager.getMenu(1);
        }

        $("#headerLogo").attr('style', 'background-image: url("' + CurrentUser.FullLogoPath + '") !important');
      }

    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
  },
  getCurrentEmployee: function () {
    var jsonParam = '';
    var serviceURL = "../Home/GetCurrentEmployee";
    return AjaxManager.GetSingleObject(serviceURL, jsonParam);

  },



  IsStringEmpty: function (str) {
    if (str && str != '')
      return false;
    else
      return true;
  },



  addchiledMenu: function (objMenuOrginal, menuId, objMenuList) {
    var chiledMenuArray = [];
    var newMenuArray = [];
    for (var j = 0; j < objMenuList.length; j++) {
      if (objMenuList[j].ParentMenuId == menuId) {
        var objMenu = new Object();
        objMenu = objMenuOrginal;
        var objChiledMenu = new Object();
        objChiledMenu.id = objMenuList[j].MenuId;
        objChiledMenu.itemId = objMenuList[j].MenuId;
        objChiledMenu.text = objMenuList[j].MenuName;
        if (objMenuList[j].MenuPath == "") {
          objMenu.url = "";
        }
        else {
          objMenu.url = objMenuList[j].MenuPath;
        }
        objChiledMenu.spriteCssClass = "html";
        chiledMenuArray = objMenuOrginal.items;
        if (chiledMenuArray == undefined || chiledMenuArray.length == 0) {
          chiledMenuArray = [];
        }
        else {
          objChiledMenu.expanded = true,
            objChiledMenu.spriteCssClass = "folder";
        }
        newMenuArray = MenuManager.chiledMenu(objChiledMenu, objMenuList[j].MenuId, objMenuList);
        chiledMenuArray.push(objChiledMenu);
        objMenu.items = chiledMenuArray;
      }
    }
    return chiledMenuArray;
  }

};

var currencyConverter = {

  add_commas: function (nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  },
  digitToWordConverter: function (junkVal) {
    junkVal = Math.floor(junkVal);
    var obStr = new String(junkVal);
    numReversed = obStr.split("");
    actnumber = numReversed.reverse();

    if (Number(junkVal) >= 0) {
      //do nothing
    }
    else {
      alert('wrong Number cannot be converted');
      return false;
    }
    if (Number(junkVal) == 0) {
      document.getElementById('container').innerHTML = obStr + '' + 'Rupees Zero Only';
      return false;
    }
    if (actnumber.length > 9) {
      alert('Oops!!!! the Number is too big to covertes');
      return false;
    }

    var iWords = ["Zero", " One", " Two", " Three", " Four", " Five", " Six", " Seven", " Eight", " Nine"];
    var ePlace = ['Ten', ' Eleven', ' Twelve', ' Thirteen', ' Fourteen', ' Fifteen', ' Sixteen', ' Seventeen', ' Eighteen', ' Nineteen'];
    var tensPlace = ['dummy', ' Ten', ' Twenty', ' Thirty', ' Forty', ' Fifty', ' Sixty', ' Seventy', ' Eighty', ' Ninety'];

    var iWordsLength = numReversed.length;
    var totalWords = "";
    var inWords = new Array();
    var finalWord = "";
    j = 0;
    for (i = 0; i < iWordsLength; i++) {
      switch (i) {
        case 0:
          if (actnumber[i] == 0 || actnumber[i + 1] == 1) {
            inWords[j] = '';
          }
          else {
            inWords[j] = iWords[actnumber[i]];
          }
          inWords[j] = inWords[j] + ' Only';
          break;
        case 1:
          tens_complication();
          break;
        case 2:
          if (actnumber[i] == 0) {
            inWords[j] = '';
          }
          else if (actnumber[i - 1] != 0 && actnumber[i - 2] != 0) {
            inWords[j] = iWords[actnumber[i]] + ' Hundred and';
          }
          else {
            inWords[j] = iWords[actnumber[i]] + ' Hundred';
          }
          break;
        case 3:
          if (actnumber[i] == 0 || actnumber[i + 1] == 1) {
            inWords[j] = '';
          }
          else {
            inWords[j] = iWords[actnumber[i]];
          }
          if (actnumber[i + 1] != 0 || actnumber[i] > 0) {
            inWords[j] = inWords[j] + " Thousand";
          }
          break;
        case 4:
          tens_complication();
          break;
        case 5:
          if (actnumber[i] == 0 || actnumber[i + 1] == 1) {
            inWords[j] = '';
          }
          else {
            inWords[j] = iWords[actnumber[i]];
          }
          if (actnumber[i + 1] != 0 || actnumber[i] > 0) {
            inWords[j] = inWords[j] + " Lakh";
          }
          break;
        case 6:
          tens_complication();
          break;
        case 7:
          if (actnumber[i] == 0 || actnumber[i + 1] == 1) {
            inWords[j] = '';
          }
          else {
            inWords[j] = iWords[actnumber[i]];
          }
          inWords[j] = inWords[j] + " Crore";
          break;
        case 8:
          tens_complication();
          break;
        default:
          break;
      }
      j++;
    }

    function tens_complication() {
      if (actnumber[i] == 0) {
        inWords[j] = '';
      }
      else if (actnumber[i] == 1) {
        inWords[j] = ePlace[actnumber[i - 1]];
      }
      else {
        inWords[j] = tensPlace[actnumber[i]];
      }
    }
    inWords.reverse();
    for (i = 0; i < inWords.length; i++) {
      finalWord += inWords[i];
    }
    return finalWord;
  }
};

var FileManager = {
  showFilePopup: function (container, valueContainer) {
    //alert(valueContainer);
    jQuery(container).dialog("destroy");
    jQuery(container).dialog({
      height: 257,
      modal: true,
      title: "File Upload",
      width: 381,
      //bgiframe: true,            
      //autoOpen: false, 
      resizable: false

    });
  },

  getUploadedFileDetails: function (jsonData) {
    alert(jsonData.message);
    alert(jsonData.webpath);
    FileManager.closeFilePopup(container);
  },

  closeFilePopup: function (container) {
    jQuery(container).dialog("close");
    jQuery(container).dialog("destroy");
  }
};

var DistrictManager = {
  GetDistrictInformation: function () {
    var items = [["Barguna"],
    ["Barisal"],
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
  }
};

var bloodgroupManager = {

  GetBloodGroupArray: function () {
    var items = [["A+"], ["A-"], ["B+"], ["B-"], ["AB+"], ["AB-"], ["O+"], ["O-"]];
    return items;
  },
  GetBloodGroupArrayInBangla: function () {
    var items = [["এ+"], ["এ-"], ["বি+"], ["বি-"], ["এবি+"], ["এবি-"], ["ও+"], ["ও-"]];
    return items;
  }
};

var heightManager = {

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
  }
};

var CountryManager = {
  getCountryNames: function () {
    var states = [
      ["Afghanistan"],
      ["Albania"],
      ["Algeria"],
      ["Andorra"],
      ["Angola"],
      ["Antarctica"],
      ["Antigua and Barbuda"],
      ["Argentina"],
      ["Armenia"],
      ["Australia"],
      ["Austria"],
      ["Azerbaijan"],
      ["Bahamas"],
      ["Bahrain"],
      ["Bangladesh"],
      ["Barbados"],
      ["Belarus"],
      ["Belgium"],
      ["Belize"],
      ["Benin"],
      ["Bermuda"],
      ["Bhutan"],
      ["Bolivia"],
      ["Bosnia and Herzegovina"],
      ["Botswana"],
      ["Brazil"],
      ["Brunei"],
      ["Bulgaria"],
      ["Burkina Faso"],
      ["Burma"],
      ["Burundi"],
      ["Cambodia"],
      ["Cameroon"],
      ["Canada"],
      ["Cape Verde"],
      ["Central African Republic"],
      ["Chad"],
      ["Chile"],
      ["China"],
      ["Colombia"],
      ["Comoros"],
      ["Congo"], ["Democratic Republic"],
      ["Congo"], ["Republic of the"],
      ["Costa Rica"],
      ["Cote d'Ivoire"],
      ["Croatia"],
      ["Cuba"],
      ["Cyprus"],
      ["Czech Republic"],
      ["Denmark"],
      ["Djibouti"],
      ["Dominica"],
      ["Dominican Republic"],
      ["East Timor"],
      ["Ecuador"],
      ["Egypt"],
      ["El Salvador"],
      ["Equatorial Guinea"],
      ["Eritrea"],
      ["Estonia"],
      ["Ethiopia"],
      ["Fiji"],
      ["Finland"],
      ["France"],
      ["Gabon"],
      ["Gambia"],
      ["Georgia"],
      ["Germany"],
      ["Ghana"],
      ["Greece"],
      ["Greenland"],
      ["Grenada"],
      ["Guatemala"],
      ["Guinea"],
      ["Guinea-Bissau"],
      ["Guyana"],
      ["Haiti"],
      ["Honduras"],
      ["Hong Kong"],
      ["Hungary"],
      ["Iceland"],
      ["India"],
      ["Indonesia"],
      ["Iran"],
      ["Iraq"],
      ["Ireland"],
      ["Israel"],
      ["Italy"],
      ["Jamaica"],
      ["Japan"],
      ["Jordan"],
      ["Kazakhstan"],
      ["Kenya"],
      ["Kiribati"],
      ["Korea North"],
      ["Korea South"],
      ["Kuwait"],
      ["Kyrgyzstan"],
      ["Laos"],
      ["Latvia"],
      ["Lebanon"],
      ["Lesotho"],
      ["Liberia"],
      ["Libya"],
      ["Liechtenstein"],
      ["Lithuania"],
      ["Luxembourg"],
      ["Macedonia"],
      ["Madagascar"],
      ["Malawi"],
      ["Malaysia"],
      ["Maldives"],
      ["Mali"],
      ["Malta"],
      ["Marshall Islands"],
      ["Mauritania"],
      ["Mauritius"],
      ["Mexico"],
      ["Micronesia"],
      ["Moldova"],
      ["Mongolia"],
      ["Morocco"],
      ["Monaco"],
      ["Mozambique"],
      ["Namibia"],
      ["Nauru"],
      ["Nepal"],
      ["Netherlands"],
      ["New Zealand"],
      ["Nicaragua"],
      ["Niger"],
      ["Nigeria"],
      ["Norway"],
      ["Oman"],
      ["Pakistan"],
      ["Panama"],
      ["Papua New Guinea"],
      ["Paraguay"],
      ["Peru"],
      ["Philippines"],
      ["Poland"],
      ["Portugal"],
      ["Qatar"],
      ["Romania"],
      ["Russia"],
      ["Rwanda"],
      ["Samoa"],
      ["San Marino"],
      ["Sao Tome"],
      ["Saudi Arabia"],
      ["Senegal"],
      ["Serbia and Montenegro"],
      ["Seychelles"],
      ["Sierra Leone"],
      ["Singapore"],
      ["Slovakia"],
      ["Slovenia"],
      ["Solomon Islands"],
      ["Somalia"],
      ["South Africa"],
      ["Spain"],
      ["Sri Lanka"],
      ["Sudan"],
      ["Suriname"],
      ["Swaziland"],
      ["Sweden"],
      ["Switzerland"],
      ["Syria"],
      ["Taiwan"],
      ["Tajikistan"],
      ["Tanzania"],
      ["Thailand"],
      ["Togo"],
      ["Tonga"],
      ["Trinidad and Tobago"],
      ["Tunisia"],
      ["Turkey"],
      ["Turkmenistan"],
      ["Uganda"],
      ["Ukraine"],
      ["United Arab Emirates"],
      ["United Kingdom"],
      ["United States"],
      ["Uruguay"],
      ["Uzbekistan"],
      ["Vanuatu"],
      ["Venezuela"],
      ["Vietnam"],
      ["Yemen"],
      ["Zambia"],
      ["Zimbabwe"]
    ];

    return states;
  }
};

function addExtensionClass(extension) {
  switch (extension) {
    case '.jpg':
    case '.img':
    case '.png':
    case '.gif':
      return "img-file";
    case '.doc':
    case '.docx':
      return "doc-file";
    case '.xls':
    case '.xlsx':
      return "xls-file";
    case '.pdf':
      return "pdf-file";
    case '.zip':
    case '.rar':
      return "zip-file";
    default:
      return "default-file";
  }
}

(function () {
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  Date.prototype.getMonthName = function () {
    return months[this.getMonth()];
  };
  Date.prototype.getDayName = function () {
    return days[this.getDay()];
  };
  Date.prototype.FirstDateOfMonth = function () {

    return new Date(this.getFullYear(), this.getMonth(), 1);

  };
  Date.prototype.getDatesByWeekName = function (weekName) {
    var weekDates = [];
    var totalDays = this.getTotalDays();
    for (var i = 0; i < totalDays; i++) {
      var date = new Date(this.getFullYear(), this.getMonth(), i + 1);
      if (date.getDayName() == weekName) {
        weekDates.push(date);
      }

    }
    return weekDates;


  };
  Date.prototype.getTotalDays = function () {

    return daysInMonth(this.getFullYear(), this.getMonth(), 0);

  };
  function daysInMonth(year, month, day) {

    var d = new Date(year, month + 1, day);
    //var date = new Date(d.setDate(-1));
    return d.getDate();
    //return new Date(year, month, 0).getDate();
  }
})();


(function () {

  Array.prototype.add = function (obj) {

    if (obj == null) {
      throw new TypeError('object is null or not defined');
    }
    return this.push(obj);
  };
  Array.prototype.remove = function (obj) {

    if (this.length < 1) {
      throw new TypeError('Array is empty or not defined');
    }
    if (obj == null) {
      throw new TypeError('object is null or not defined');
    }
    var index = this.indexOfArray(obj);

    if (index != -1) {
      this.splice(index, 1);
    }

  };

  Array.prototype.removeObject = function (obj) {

    if (this.length < 1) {
      throw new TypeError('Array is empty or not defined');
    }
    if (obj == null) {
      throw new TypeError('object is null or not defined');
    }
    var dArray = $.grep(this, function (dt) {
      return (dt != obj);
    });

    var index = this.indexOfArray(obj);

    if (index != -1) {
      this.splice(index, 1);
    }

    return dArray;

  };

  Array.prototype.indexOfArray = function (obj) {
    if (obj == null) {
      throw new TypeError('object is null or not defined');
    }
    var index = -1;
    for (var i = 0; i < this.length; i++) {
      if (JSON.stringify(this[i]) == JSON.stringify(obj)) {
        index = i;
        break;
      }
    }
    return index;
  };

})();



//----------------------------------CRM common--------------------------------------------
//----------------------------------CRM common--------------------------------------------
//----------------------------------CRM common--------------------------------------------
//----------------------------------CRM common--------------------------------------------
var accessArray = [];
var assembly = new Object();
var hris = new Object();

var crmCommonManager = {


  GetAccrudProfit: function (invId) {
    var obj = null;
    var param = "investmentId=" + invId;
    var serviceUrl = "../Investment/GetAccrudProfit";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  getAccountHeadByAccountCode: function (accountCode) {
    var data = AjaxManager.GetSingleObject("../AccountHeadSetup/GetAccountHeadByAccountCode", "accountCode=" + accountCode);
    return data;
  },

  CheckCompanyAccountByCompanyCode: function (companyCode) {
    var data = AjaxManager.GetSingleObject("../PFVoucher/CheckCompanyAccount", "companyCode=" + companyCode);
    return data;

  },

  GetHrisSettingsDetails: function () {
    var objStatus = "";
    var jsonParam = "";
    var serviceUrl = "../HrisSettings/GetHrisSettingsDetails";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objStatus = jsonData;
      hris = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objStatus;
  },

  GetSystemSettingsDataByCompanyId: function (companyId) {
    var objStatus = "";
    var jsonParam = "companyId=" + companyId;
    var serviceUrl = "../SystemSettings/GetSystemSettingsDataByCompanyId";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objStatus = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objStatus;
  },

  GetHierarchyCompany: function () {
    var objCompany = "";
    var jsonParam = "";
    var serviceUrl = "../Company/GetMotherCompany/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objCompany = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objCompany;
  },

  GetAllActiveCompany: function () {
    var objCompany = "";
    var jsonParam = "";
    var serviceUrl = "../Company/GetAllActiveCompany/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objCompany = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objCompany;
  },

  GetAllActiveSection: function () {
    var objSection = "";
    var jsonParam = "";
    var serviceUrl = "../Section/GetAllActiveSection/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objSection = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objSection;
  },

  GenerateBranchCombo: function (companyId) {
    var objBranch = "";
    var jsonParam = "companyId=" + companyId;
    var serviceUrl = "../../Branch/GetBranchByCompanyIdForCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objBranch = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objBranch;
  },


  GetSalaryLocationComboData: function (companyId) {
    var objBranch = "";
    var jsonParam = "companyId=" + companyId;
    var serviceUrl = "../../Branch/GetSalaryLocationComboDataByCompanyId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objBranch = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objBranch;
  },

  //start: newly added
  GetCostCenterByCompanyId: function (companyId) {
    var objCostCenter = "";
    var jsonParam = "companyId=" + companyId;
    var serviceUrl = "../../CostCentre/GetCostCentreDataForComboByCompanyId";
    //"../CostCentre/GetCostCentreDataForComboByCompanyId";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objCostCenter = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objCostCenter;
  },
  //end: newly added

  GetDepartmentByCompanyId: function (companyId) {
    var objDepartment = "";
    var jsonParam = "companyId=" + companyId;
    var serviceUrl = "../../Department/GetDepartmentByCompanyId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objDepartment = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDepartment;
  },

  GetDivisionByCompanyId: function (companyId) {
    var objDivision = "";
    var jsonParam = "companyId=" + companyId;
    var serviceUrl = "../Division/GetDivisionByCompanyId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objDivision = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDivision;
  },

  GetAllActiveFacility: function () {
    var objFacility = "";
    var jsonParam = "";
    var serviceUrl = "../Facility/GetAllActiveFacility/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objFacility = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objFacility;
  },

  GetDivisionDeptByCompanyIdAndDivisionId: function (companyId, divisionId) {
    var objDivisionDept = "";
    var jsonParam = "companyId=" + companyId + "&divisionId=" + divisionId;
    var serviceUrl = "../../Division/GetDivisionDeptByCompanyIdAndDivisionId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objDivisionDept = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDivisionDept;
  },

  GetDepartmentFacilityByDepartmentId: function (departmentId) {
    var objDepartmentFacility = "";
    var jsonParam = "departmentId=" + departmentId;
    var serviceUrl = "../../Facility/GetDepartmentFacilityByDepartmentId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objDepartmentFacility = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDepartmentFacility;
  },

  GetDepartmentSectionByDepartmentId: function (departmentId, companyId) {


    if (companyId == undefined) {
      companyId = 0;
    }

    var objDepartmentSection = "";
    var jsonParam = "departmentId=" + departmentId + "&companyId=" + companyId;
    var serviceUrl = "../../Section/GetDepartmentSectionByDepartmentId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objDepartmentSection = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDepartmentSection;
  },

  GetFacilitySectionByFacilityId: function (facilityId) {
    var objFacilitySection = "";
    var jsonParam = "facilityId=" + facilityId;
    var serviceUrl = "../../Facility/GetFacilitySectionByFacilityId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objFacilitySection = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objFacilitySection;
  },

  GetSectionByCompanyDepartmentAndFacility: function (companyId, departmentId, facilityId) {

    if (companyId == undefined) {
      companyId = 0;
    }
    if (departmentId == undefined) {
      departmentId = 0;
    }
    if (facilityId == undefined) {
      facilityId = 0;
    }

    var objSection = "";

    var jsonParam = "companyId=" + companyId + "&departmentId=" + departmentId + "&facilityId=" + facilityId;

    var serviceUrl = "../../Section/GetSectionByCompanyDepartmentAndFacility/";

    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objSection = jsonData;
    }
    function onFailed(error) {
      ;
      window.alert(error.statusText);
    }
    return objSection;
  },

  GetRegionDivisionByRegionId: function (regionId) {
    var objRegionDivision = "";
    var jsonParam = "regionId=" + regionId;
    var serviceUrl = "../../Region/GetRegionDivisionByRegionId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objRegionDivision = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objRegionDivision;
  },

  GetActiveDepartmentByCompanyIdAndDivisionId: function (companyId, divisionId) {
    var objDivisionDept = "";
    var jsonParam = "companyId=" + companyId + "&divisionId=" + divisionId;
    var serviceUrl = "../../Department/GetActiveDepartmentByCompanyIdAndDivisionIdWithDepartmentRestriction/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objDivisionDept = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDivisionDept;
  },

  GetMovementPolicy: function (hrRecordId) {
    var objDepartment = "";
    var jsonParam = "hrRecordId=" + hrRecordId;
    var serviceUrl = "../../Movement/GetMovementPolicyByHrRecordId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objDepartment = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDepartment;
  },

  GetDepartmentAll: function () {
    var objDepartment = "";
    var jsonParam = "";
    var serviceUrl = "../../Department/GetDepartmentAll/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objDepartment = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDepartment;
  },

  GetEmployeeByCompanyIdAndBranchIdAndDepartmentId: function (companyId, branchId, departmentId) {
    var objEmployee = "";
    var jsonParam = "companyId=" + companyId + "&branchId=" + branchId + "&departmentId=" + departmentId;
    var serviceUrl = "../../Employee/GetEmployeeByCompanyIdAndBranchIdAndDepartmentId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objEmployee = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployee;
  },

  GetEmployeeByDepartmentId: function (departmentId) {
    var objEmployee = "";
    var jsonParam = "departmentId=" + departmentId;
    var serviceUrl = "../../Employee/GenerateEmployeeByDepartmentId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objEmployee = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployee;
  },

  GetEmployeeType: function () {
    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../../Employee/GetEmployeeTypeForCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetEmployeeLevel: function () {
    var objEmployeeLevel = "";
    var jsonParam = "";

    var serviceUrl = "../EmployeeLevel/GetEmployeeLevelForCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeLevel = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeLevel;
  },

  GetRegularEmployeeTypes: function () {
    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../../Employee/GetRegularEmployeeTypes/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetNonRegularEmployeeType: function () {
    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../../Employee/GetNonRegularEmployeeType/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetSalaryStatus: function () {
    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../../Status/GetSalaryStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetSalaryStatusForAdmin: function () {
    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../../Status/GetSalaryStatusForAdmin/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetOtherPaymentStatus: function () {
    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../../Status/GetOtherPaymentStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetGratuityStatus: function () {
    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../../Status/GetGratuityStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetPayrollStatus: function () {
    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../../Status/GetPayrollStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetBonusStatus: function () {
    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../../Status/GetBonusStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetProjectStatus: function () {

    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../Status/GetProjectStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetCoffStatus: function () {
    var objStatus = "";
    var jsonParam = "";
    var serviceUrl = "../Status/GetCoffStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objStatus = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objStatus;
  },

  GetKraStatus: function () {
    var objStatus = "";
    var jsonParam = "";
    var serviceUrl = "../Status/GetKraStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objStatus = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objStatus;
  },
  GetDepartmentKraStatus: function () {
    var objStatus = "";
    var jsonParam = "";
    var serviceUrl = "../Status/GetDepartmentKraStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objStatus = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objStatus;
  },
  GetGoalStatus: function () {
    var objStatus = "";
    var jsonParam = "";
    var serviceUrl = "../Status/GetGoalStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objStatus = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objStatus;
  },
  GetBudgetStatus: function () {
    var objStatus = "";
    var jsonParam = "";
    var serviceUrl = "../Status/GetBudgetStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objStatus = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objStatus;
  },

  GetLeaveForwadingStatus: function () {
    var objStatus = "";
    var jsonParam = "";
    var serviceUrl = "../Status/GetLeaveForwadingStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objStatus = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objStatus;
  },

  GetAccessPermissionForCurrentUserForHrAccountsModule: function () {
    var objEmployeeType = "";
    var jsonParam = "";

    var serviceUrl = "../../Status/GetAccessPermissionForCurrentUserForHrAccountsModule/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objEmployeeType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objEmployeeType;
  },

  GetActionButtonByState: function (stateId) {
    var objAction = "";
    var jsonParam = "stateId=" + stateId;
    var serviceUrl = "../Status/GetActionByStateIdAndUserId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objAction = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objAction;
  },

  GetClient: function (companyId) {
    var objClient = "";
    var jsonParam = "companyId=" + companyId;
    var serviceUrl = "../Client/GetClient/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objClient = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objClient;
  },

  GenerateDesignationCombo: function (companyId) {
    var objDesignation = "";
    var jsonParam = "companyId=" + companyId + "&status=" + 1;
    var serviceUrl = "../Designation/GetAllDesignationByCompanyIdAndStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objDesignation = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDesignation;
  },

  GenerateDesignationByDepartmentIdCombo: function (departmentId) {
    var objDesignation = "";
    var jsonParam = "departmentId=" + departmentId + "&status=" + 1;
    var serviceUrl = "../Designation/GenerateDesignationByDepartmentIdCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objDesignation = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDesignation;
  },

  GenerateDesignationByCompanyIdComboData: function (companyId) {
    var objDesignation = "";
    var jsonParam = "companyId=" + companyId + "&status=" + 1;
    var serviceUrl = "../Designation/GenerateDesignationByCompanyIdCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objDesignation = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDesignation;
  },

  GenerateDesignationAllCombo: function () {
    var objDesignation = "";
    var jsonParam = "";
    var serviceUrl = "../Designation/GenerateDesignationAllCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objDesignation = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objDesignation;
  },

  GetGradeByCompanyAndPayroll: function (companyId, payrollTypeId) {
    var objGrade = "";
    var jsonParam = "companyId=" + companyId + "&payrollTypeId=" + payrollTypeId;
    var serviceUrl = "../GradeSettings/GetGradeByCompanyAndPayroll/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objGrade = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objGrade;
  },

  GenerateGradeComboByCompanyId: function (companyId) {

    var objGrade = "";
    var jsonParam = "companyId=" + companyId;
    var serviceUrl = "../Grade/GenerateGradeComboByCompanyId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objGrade = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objGrade;
  },

  GetAllActiveGradeCombo: function () {

    var objGrade = "";
    var jsonParam = "";
    var serviceUrl = "../Grade/GenerateGradeCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objGrade = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objGrade;
  },

  GetPayrollSettingsByGradeId: function (gradeId) {
    var objGrade = "";
    var jsonParam = "gradeId=" + gradeId;
    var serviceUrl = "../GradeSettings/GetPayrollSettingsByGradeId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objGrade = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objGrade;
  },

  GetCertificateType: function () {
    var objCertificateType = "";
    var jsonParam = "";
    var serviceUrl = "../CertificateType/LoadActiveCertificateType/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objCertificateType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objCertificateType;
  },

  GetIncidentType: function () {
    var objIncidentType = "";
    var jsonParam = "";
    var serviceUrl = "../Incident/GetIncidentType/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objIncidentType = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objIncidentType;
  },

  GetAgencyByAgencyType: function (agencyType) {
    var objAgency = "";
    var jsonParam = "agencyType=" + agencyType;
    var serviceUrl = "../CNF/GetAgencyByAgencyType/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objAgency = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objAgency;
  },

  GetAgentInformationByAgencyId: function (agencyId) {
    var objAgent = "";
    var jsonParam = "agencyId=" + agencyId;
    var serviceUrl = "../CNF/GetAgentInformationByAgencyId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objAgent = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return objAgent;
  },

  GetTaskTypeInformation: function () {
    var objTaskType = "";
    var jsonParam = "";
    var serviceUrl = "../ProjectManagement/GetTaskTypeInformation/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objTaskType = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return objTaskType;
  },

  GetLeaveAccumulationType: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../LeaveEncashmentForwarding/GetLeaveAccumulationType/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetLeaveTypeByAccumulationType: function (accumulationType, hrRecordId) {
    ;
    var obj = "";
    var jsonParam = "accumulationType=" + accumulationType + "&hrRecordId=" + hrRecordId;
    var serviceUrl = "../LeaveEncashmentForwarding/GetLeaveTypeByAccumulationType/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetActiveLeaveType: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../LeavePolicy/GetActiveLeaveType/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetPlanedLeaveType: function (hrRecordId, fiscalYearId) {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../LeavePlan/GetPlanedLeaveType/?hrRecordId=" + hrRecordId + "&fiscalYearId=" + fiscalYearId;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GenerateBonusType: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../Bonus/GenerateBonusType/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetCtcInformation: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../Payroll/GetCtcInformation/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetCtcInformationByOperator: function (opType) {
    var obj = "";
    var jsonParam = "opType=" + opType;
    var serviceUrl = "../Payroll/GetCtcInformationByOperator/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetCtcTypes: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../Payroll/GetCtcTypes/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetCtcTypesByCategory: function (categoryId) {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../PayrollAdjustment/GetCtcPolicyComboData/?categoryId=" + categoryId;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetCtcTypesByCategoryForDailyAllowance: function (categoryId) {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../PayrollAdjustment/GetCtcPolicyComboDataForDailyAllowance/?categoryId=" + categoryId;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetCtcByCategoryForFieldBenefitDailyAllowance: function (categoryId) {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../PayrollAdjustment/GetCtcPolicyComboDataForFieldBenefitDailyAllowance/?categoryId=" + categoryId;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetLoanTypes: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../LoanAdvancedisburseSchedule/GetLoanTypes/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  populateRepostingType: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../TransferPromotion/GetRepostingType/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GenerateFunctionCombo: function () {
    var objFunction = "";
    var JsonParam = "";
    var serviceUrl = "../Function/GetFunctionDataForCombo/";
    AjaxManager.GetJsonResult(serviceUrl, JsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {
      objFunction = jsonData;
    }
    function onFailed() {
      window.alert(error.statusText);
    }

    return objFunction;
  },

  GenerateRsmRegionCombo: function () {
    var objFunction = "";
    var JsonParam = "";
    var serviceUrl = "../RSMRegion/GetAllActiveRsmRegionComboData/";
    AjaxManager.GetJsonResult(serviceUrl, JsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {
      objFunction = jsonData;
    }
    function onFailed() {
      window.alert(error.statusText);
    }
    return objFunction;
  },

  GetAllActiveRsmRegionComboDataForFieldForceAttendance: function () {
    var objFunction = "";
    var JsonParam = "";
    var serviceUrl = "../RSMRegion/GetAllActiveRsmRegionComboDataForFieldForceAttendance/";
    AjaxManager.GetJsonResult(serviceUrl, JsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {
      objFunction = jsonData;
    }
    function onFailed() {
      window.alert(error.statusText);
    }
    return objFunction;
  },

  GeneratePSOLocationCombo: function (rsmCode) {
    var objFunction = "";
    var JsonParam = "";
    var serviceUrl = "../PSOLocation/GetPsoLocationByRsmCode?RsmCode=" + rsmCode;
    AjaxManager.GetJsonResult(serviceUrl, JsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {
      objFunction = jsonData;
    }
    function onFailed() {
      window.alert(error.statusText);
    }

    return objFunction;
  },

  GenerateShiftComboByCompanyAndBranch: function (companyId, branchId) {
    var objShift = "";
    var jsonParam = "companyId=" + companyId + "&branchId=" + branchId;
    var serviceUrl = "../Calender/GenerateShiftComboByCompanyAndBranch/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objShift = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objShift;
  },

  GetShiftData: function () {
    var objShift = new Object();
    var jsonParam = "";
    var serviceUrl = "../Calender/GetShiftData/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objShift = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objShift;
  },

  GetCtcCategoryInformation: function () {
    var obj = "";
    var JsonParam = "";
    var serviceUrl = "../PayrollAdjustment/GetCtcCategory";
    AjaxManager.GetJsonResult(serviceUrl, JsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {

      obj = jsonData;
    }
    function onFailed() {
      window.alert(error.statusText);
    }

    return obj;
  },
  GetEmployeeForKRA: function (hrRecordId) {
    var objEmployee = AjaxManager.GetSingleObject('../KRABGSectorC/GetEmployeeKraPerformance', "hrRecordId=" + hrRecordId);
    return objEmployee;

  },
  GetDeparmentEmployeeForKRA: function (hrRecordId) {
    var objEmployee = AjaxManager.GetSingleObject('../KRABGSectorC/GetDepartmentEmployeeKraPerformance', "hrRecordId=" + hrRecordId);
    return objEmployee;

  },
  GetEmployeeForYearlyVision: function (kraYearId) {
    var EmployeeYearlyVision = AjaxManager.GetSingleObject('../KRAGoalSettingBGSectorC/GetEmployeeForYearlyVision', "kraYearId=" + kraYearId);
    return EmployeeYearlyVision;

  },
  GetEmployeeForVision: function (hrRecordId) {
    var objEmployeeVision = AjaxManager.GetSingleObject('../KRAGoalSettingBGSectorC/GetEmployeeVision', "hrRecordId=" + hrRecordId);
    return objEmployeeVision;

  },
  GetGradeType: function () {
    var obj = "";
    var JsonParam = "";
    var serviceUrl = "../GradeType/GetGradeTypeForCombo";
    AjaxManager.GetJsonResult(serviceUrl, JsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {

      obj = jsonData;
    }
    function onFailed() {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetTrainingType: function () {
    var obj = "";
    var JsonParam = "";
    var serviceUrl = "../TrainingInfo/GetTrainingTypeForCombo";
    AjaxManager.GetJsonResult(serviceUrl, JsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {

      obj = jsonData;
    }
    function onFailed() {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetDataForAnyCombo: function (serviceUrl) {
    var obj = "";
    var JsonParam = "";
    //var serviceUrl = "../TrainingInfo/GetTrainingTypeForCombo";
    AjaxManager.GetJsonResult(serviceUrl, JsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {

      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GenerateCommonGrid: function (ctlId, url, columns) {
    $("#" + ctlId).kendoGrid({
      dataSource: empressCommonManager.gridDataSource(url, 50),
      pageable: {
        refresh: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true

      },

      filterable: true,
      sortable: true,
      columns: columns,
      editable: false,
      navigatable: true,
      selectable: "row",
    });
  },

  GenerateCommonGridWithPaging: function (ctlId, url, columns, pageSize) {
    $("#" + ctlId).kendoGrid({
      dataSource: empressCommonManager.gridDataSource(url, pageSize),
      pageable: {
        refresh: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true,
        pageSizes: [10, 20, 50, 100, 150, 200, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000]
      },
      xheight: 300,
      filterable: true,
      sortable: true,
      columns: columns,
      editable: false,
      navigatable: true,
      selectable: "row",
      scrollable: { virtual: true },
    });
  },

  GenerateCommonGridWithoutPaging: function (ctlId, url, columns, pageSize) {



    $("#" + ctlId).kendoGrid({
      dataSource: empressCommonManager.gridDataSource(url, pageSize),
      //dataSource: [],
      pageable: {
        refresh: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true,
        //pageSizes: [10, 20, 50, 100, 150, 200, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000]
      },
      xheight: 300,
      filterable: true,
      sortable: true,
      columns: columns,
      editable: false,
      navigatable: true,
      selectable: "row",
      scrollable: { virtual: true },
    });
  },

  GenerateCommonScrollableGridWithBlankDataSource: function (ctlId, columns) {

    $("#" + ctlId).kendoGrid({
      dataSource: [],
      pageable: {
        refresh: true,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true,
      },
      xheight: 300,
      filterable: true,
      sortable: true,
      columns: columns,
      editable: false,
      navigatable: true,
      selectable: "row",
      scrollable: { virtual: true },
    });
  },

  gridDataSource: function (url, pageSize) {

    var gridDataSource = new kendo.data.DataSource({
      type: "json",
      serverPaging: true,

      serverSorting: true,

      serverFiltering: true,

      allowUnsort: true,

      pageSize: pageSize,

      transport: {
        read: {

          url: url,

          type: "POST",
          cache: false,
          async: false,

          dataType: "json",

          contentType: "application/json; charset=utf-8"
        },

        parameterMap: function (options, operation) {

          if (operation !== "read" && options.models) {
            return { models: kendo.stringify(options.models) };
          } else {
            return JSON.stringify(options);
          }

        }
      },
      schema: { data: "Items", total: "TotalCount" }
    });
    return gridDataSource;
  },

  GetFiscalYear: function (companyId) {
    var objFiscale = "";
    var jsonParam = "";
    var serviceUrl = "../../Company/GetFiscalYear/?companyId=" + companyId;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objFiscale = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objFiscale;
  },

  GetTrainingInfo: function () {
    var trainigInfos = new kendo.data.DataSource({
      transport: {
        read: {
          url: "../TrainingInfo/GetTrainingInfoForCombo/",
          dataType: "json"
        }
      }
    });

    return trainigInfos;

  },

  GetTrainingInfoAfterComplete: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../TrainingCertificateUpload/GetTrainingInfoComboAfterComplete";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetLeaveTypeByCompanyIdAndhrRecordId: function (companyId, hrRecordId) {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../../LeavePolicy/GetLeaveTypeByCompanyIdAndhrRecordId/?companyId=" + companyId + "&hrRecordId=" + hrRecordId;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetLeaveTypeByhrRecordId: function (hrRecordId) {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../../LeavePolicy/SelectAllLeaveBalanceForLeaveApplicationEditByHrRecordId/?hrRecordId=" + hrRecordId;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetLeaveReason: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../LeaveReason/GetLeaveReason";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetCountryComboData: function () {
    var objCountry = "";
    var jsonParam = "";
    var serviceUrl = "../Nationality/GetCountryComboData";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailde);

    function onSuccess(jsonData) {
      objCountry = jsonData;
    }
    function onFailde(error) {
      window.alert(error.statusText);
    }

    return objCountry;
  },

  GetDistrictComboData: function () {
    var objDistrict = "";
    var jsonParam = "";
    var serviceUrl = "../District/GetDistrictComboData";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objDistrict = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return objDistrict;
  },

  GetVenueComboData: function () {
    var objVenue = "";
    var jsonParam = "";
    var serviceUrl = "../Venue/GetVenueComboData";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objVenue = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return objVenue;
  },

  GetThanaComboData: function () {
    var objThana = "";
    var jsonParam = "";
    var serviceUrl = "../Thana/GetThanaComboData";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objThana = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return objThana;
  },

  GetThanaComboDatabyDistrictId: function (districtId) {
    var objThana = "";
    var jsonParam = "districtId=" + districtId;
    var serviceUrl = "../Thana/GetThanaComboDataByDistrictId";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objThana = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return objThana;
  },

  GetKraYearConfigData: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../KRA/GetKraYearConfigData";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
      console.log(jsonData);
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },
  GetKraStatusData: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../Status/GetKraStatus";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
      console.log(jsonData);
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },
  GetAllBank: function () {
    var objBank = "";
    var jsonParam = "";
    var serviceUrl = "../BankBranch/GetAllBank/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objBank = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objBank;
  },

  GetAllBankForSalary: function () {
    var objBank = "";
    var jsonParam = "";
    var serviceUrl = "../BankBranch/GetAllBankForSalary/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objBank = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objBank;
  },

  GetBranchByBankId: function (bankId) {
    var objBank = "";
    var jsonParam = "bankId=" + bankId;
    var serviceUrl = "../BankBranch/GetBranchByBankId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objBank = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objBank;
  },

  GetAccountByBranchId: function (branchId) {
    var obj = "";
    var jsonParam = "branchId=" + branchId;
    var serviceUrl = "../BankBranch/GetAccountByBranchId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GenerateAccountComboByBranchIdAndCompanyArrayForSalary: function (branchId, companyArray, branchArray) {

    var obj = "";
    var com = JSON.stringify(companyArray).replace(/&/g, "^");
    var jsonParam = "branchId=" + branchId + "&companyArray=" + com + "&branchArray=" + JSON.stringify(branchArray);
    var serviceUrl = "../BankBranch/GenerateAccountComboByBranchIdAndCompanyArrayForSalaryWithBranch/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetAllAccountHead: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../AccountHeadSetup/GetAllAccountHead/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetRootAccountHead: function (isManualHead) {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../AccountHeadSetup/GetRootAccountHead/?isManualHead=" + isManualHead;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetReligionComboData: function () {
    var objReligion = "";
    var jsonParam = "";
    var serviceUrl = "../Religion/GetReligionComboData";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objReligion = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return objReligion;
  },

  GetPaybandComboData: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../Payband/GetPayband";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetEmployeeContributionAccountHeadHeadBySubject: function (subjectId) {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../SubjectOfAccounts/GetEmployeeContributionAccountHeadHeadBySubject/?subjectId=" + subjectId;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetCompanyContributionAccountHeadHeadBySubject: function (subjectId) {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../SubjectOfAccounts/GetCompanyContributionAccountHeadHeadBySubject/?subjectId=" + subjectId;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  SearchEmploymentInformationByEmployeeCode: function (empCode) {
    var obj = null;
    var param = "employeeId=" + empCode;
    var serviceUrl = "../Employee/GetEmploymentByEmployeeId";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;

  },

  GetAccountHeadByRootHead: function (accountHeadId) {
    var obj = "";
    var jsonParam = "rootHead=" + accountHeadId;
    var serviceUrl = "../AccountHeadSetup/GetAccountHeadByRoot/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetEmploymentByEmployeeIdWithoutEmployeeTypeRestruction: function (empCode) {
    ;
    var obj = null;
    var param = "employeeId=" + empCode;
    var serviceUrl = "../Employee/GetEmploymentByEmployeeIdWithoutEmployeeTypeRestruction";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;

  },

  SearchAccountHeadByAccountHeadCode: function (accountHeadCode) {
    var obj = null;
    var param = "accountHeadCode=" + accountHeadCode;
    var serviceUrl = "../AccountHeadSetup/GetAccoutHeadInfoByAccountHeadCode";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;

  },

  SearchSubLedgerHeadBySubLedgerCodeAndLedgerType: function (subledgerCode, ledgerHeadId) {
    var obj = null;
    var param = "sulgType=" + ledgerHeadId + "&accountHeadCode=" + subledgerCode;
    var serviceUrl = "../AccountHeadSetup/GetSubLedgerInfoByCodeAndType";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;

  },

  GetVoucherType: function () {
    var obj = null;
    var param = "";
    var serviceUrl = "../AccountHeadSetup/GetVoucherType";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;

  },

  GetTransectionTypeByVoucherId: function (voucherId) {
    var obj = null;
    var param = "voucherId=" + voucherId;
    var serviceUrl = "../AccountHeadSetup/GetTransectionTypeByVoucherId";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;

  },

  GetSubjectOfAccounts: function () {
    var obj = null;
    var param = "";
    var serviceUrl = "../SubjectOfAccounts/GetSubjectOfAccounts";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;

  },

  GetAllAccountHeadBySubjectId: function (subjectId) {

    var obj = "";
    var jsonParam = "subjectId=" + subjectId;
    var serviceUrl = "../AccountHeadSetup/GetAllAccountHeadBySubjectId/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetJobVacancyData: function () {
    var obj = null;
    var param = "";
    var serviceUrl = "../JobVacancy/GetJobVacancyComboData";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;

  },

  GetEmployeeByIdAndShortName: function (searchKey) {
    debugger;
    var result = new Object();
    var param = "employeeId=" + searchKey;
    var serviceUrl = "../Employee/GetEmploymentByEmployeeId";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, function (jsonData) {
      result = jsonData;

    }, function (error) {
      Message.Error("Internal Server Error");

    });
    return result;
  },

  GetEmployeeByIdAndShortNameWithoutRestriction: function (searchKey) {
    var result = new Object();
    var param = "employeeId=" + searchKey;
    var serviceUrl = "../Employee/GetEmploymentByEmployeeIdWithoutRestriction";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, function (jsonData) {
      result = jsonData;

    }, function (error) {
      Message.Error("Internal Server Error");

    });
    return result;
  },

  GetTaxYearCombo: function () {

    var jsonParam = "";
    var objTaxSlabYearCombo = new Object();
    var serviceUrl = "../../TaxSlub/GetTaxSlabYearForCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objTaxSlabYearCombo = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return objTaxSlabYearCombo;
  },

  GetCategoryComboData: function () {
    var objCategory = "";
    var jsonParam = "";
    var serviceUrl = "../Asset/GetCategoryComboData/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objCategory = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objCategory;
  },

  GetCommonComboData: function (param, url) {
    var obj = "";
    var jsonParam = param;
    var serviceUrl = url;
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetCompetencyComboData: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../CompetencySettings/GetCompetencyDataForCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetCompetencyComboDataRec: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../CompetencySettings/GetCompetencyDataForComboRec/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetCompetencyAreaSectionComboData: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../CompetencySettings/GetCompetencySectionDataForCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetCompetencyLevelComboData: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../CompetencySettings/GetCompetencyLevelComboData/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetCompetencyAreaComboData: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../CompetencySettings/GetCompetencyAreaComboData/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetPmsTabData: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../PMSConfig/GetPmsConfigData/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetPmsInstructionData: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../PMSConfig/GetPmsInstructionData/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;
  },

  GetAllGroupData: function () {
    var obj = new Object();
    var jsonParam = "";
    var serviceUrl = "../Group/GetAllGroupName/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {


      obj = jsonData;

    }
    function onFailed(jqXHR, textStatus, errorThrown) {
      window.alert(errorThrown);
    }

    return obj;
  },

  GetBulkRosterChangeStatus: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../Status/GetBulkRosterChangeStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;

  },

  GetOTAllocationChangeStatus: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../Status/GetOTAllocationChangeStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return obj;

  },

  GetAccessPermisionForCurrentUser: function () {
    var objStatus = "";
    var jsonParam = "";
    var serviceUrl = "../Group/GetAccessPermisionForCurrentUser/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      accessArray = [];
      for (var i = 0; i < jsonData.length; i++) {
        accessArray.push(jsonData[i]);
      }
    }
    function onFailed(error) {

      AjaxManager.MsgBox('error', 'center', 'Error', error.statusText, [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); } }]);
    }
  },

  GetAccessPermisionForCurrentUserTrainingModule: function () {
    var objStatus = "";
    var jsonParam = "";
    var serviceUrl = "../Group/GetAccessPermisionForCurrentUserTrainingModule/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      accessArray = [];
      for (var i = 0; i < jsonData.length; i++) {
        accessArray.push(jsonData[i]);
      }
    }
    function onFailed(error) {

      AjaxManager.MsgBox('error', 'center', 'Error', error.statusText, [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); } }]);
    }
  },

  PfEligibleAmountCombo: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../PfLoan/PfeligibleAmount";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetFundYearCombo: function () {
    var jsonParam = "";
    var objTaxSlabYearCombo = new Object();
    var serviceUrl = "../../TaxSlub/GetFundYears/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {
      objTaxSlabYearCombo = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return objTaxSlabYearCombo;
  },

  GetInvestmentType: function () {
    var obj = null;
    var param = "";
    var serviceUrl = "../Investment/GetInvestmentType";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetSubsidaryAccountCode: function (accHeadCode) {
    var ledgerAccCode = AjaxManager.GetSingleObject('../SubsidaryLedger/GetLedgerAccountCode', 'accountHeadCode=' + accHeadCode);
    return ledgerAccCode;
  },

  GetInvestmentTypeById: function (typeId) {
    var obj = null;
    var param = "typeId=" + typeId;
    var serviceUrl = "../Investment/GetInvestmentTypeById";

    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetVoucherNo: function (transectionType, vDate) {
    if (vDate == null || vDate == "") return "";
    if (transectionType != null && transectionType != "") {
      var data = AjaxManager.GetSingleObject("../Voucher/GetVoucherNo", "transectionType=" + transectionType + "&voucherDate=" + kendo.toString(vDate, "MM/dd/yyyy"));
      return data;
    } else {
      return "";
    }
  },

  GetApprover: function (hrRecordId, moduleId) {
    return AjaxManager.GetSingleObject('../ApproverRecommender/GetApproverByHrRecordId', 'hrRecordId=' + hrRecordId + '&moduleId=' + moduleId);
  },

  GetEligibleComboType: function () {
    var obj = null;
    var param = "";
    var serviceUrl = "../Applicant/GetEligibleTypeComboData";

    AjaxManager.GetJsonResult(serviceUrl, param, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetEmployeeDetailsByEmployeeIdWithoutAnyRestriction: function (employeeId) {
    var result = new Object();
    var param = "employeeId=" + employeeId;
    var serviceUrl = "../Employee/GetEmployeeDetailsByEmployeeIdWithoutAnyRestriction";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, function (jsonData) {
      result = jsonData;

    }, function (error) {
      Message.Error(error.statusText);

    });
    return result;
  },

  GetEmployeeDetailsByHrRecordIdWithoutAnyRestriction: function (hrRecordId) {
    var result = new Object();
    var param = "hrRecordId=" + hrRecordId;
    var serviceUrl = "../Employee/GetEmploymentByHrRecordId";
    AjaxManager.GetJsonResult(serviceUrl, param, false, false, function (jsonData) {
      result = jsonData;

    }, function (error) {
      Message.Error(error.statusText);

    });
    return result;
  },

  GetRegionByZoneWiseForOrion: function (zoneId) {
    var objRegion = "";
    var jsonParam = "zoneId=" + zoneId;
    var serviceUrl = "../FFRegion/GetRegionByZoneWise/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objRegion = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objRegion;
  },

  GetAllZoneForOrion: function () {
    var objZone = "";
    var jsonParam = "";
    var serviceUrl = "../Zone/GetAllZoneComboData/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objZone = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objZone;
  },

  GetRecruitmentTypeCombo: function () {
    var obj = null;
    obj = [{ RecruitmentTypeId: 1, RecruitmentTypeName: 'Regular' },
    { RecruitmentTypeId: 2, RecruitmentTypeName: 'Casual' }];
    return obj;
  },

  GetAssemblyInfo: function () {
    // ;
    var jsonParam = "";
    var objAssemblyInfo = new Object();
    var serviceUrl = "../Assembly/GetAssemblyInformation/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      // ;
      assembly = jsonData;
      objAssemblyInfo = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return objAssemblyInfo;
  },

  GetSalaryIncrementStatus: function () {
    var objSalaryIncrement = "";
    var jsonParam = "";

    var serviceUrl = "../../Status/GetSalaryIncrementStatus/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      objSalaryIncrement = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objSalaryIncrement;
  },



  GetAllZoneCombo: function () {

    var objZone = new Object();
    var jsonParam = "";
    var serviceUrl = "../Zone/GetAllZoneComboData/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objZone = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objZone;
  },

  GetRegionComboByZoneId: function (zoneId) {

    var objRegion = new Object();

    var jsonParam = "zoneId=" + zoneId;
    var serviceUrl = "../FFRegion/GetRegionByZoneWise/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objRegion = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objRegion;
  },

  GetAreaComboByRegionId: function (regionId) {

    var objArea = new Object();

    var jsonParam = "regionId=" + regionId;
    var serviceUrl = "../Area/GetAreaByRegionWise/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objArea = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objArea;
  },

  GetTerritoryComboByAreaId: function (areaId) {

    var objTerritory = new Object();

    var jsonParam = "areaId=" + areaId;
    var serviceUrl = "../Territory/GetTerritoryByAreaWise/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objTerritory = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objTerritory;
  },

  GetCostCentreComboData: function () {
    var obj = "";
    var jsonParam = "";
    var serviceUrl = "../CostCentre/GetActiveCostCentreData/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {
      obj = jsonData;
    }

    function onFailed(error) {
      window.alert(error.statusText);
    }

    return obj;
  },

  GetAccessPermisionForCurrentUserRecruitmentModule: function () {
    var objStatus = "";
    var jsonParam = "";
    var serviceUrl = "../Group/GetAccessPermisionForCurrentUserRecruitmentModule/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      accessArray = [];
      for (var i = 0; i < jsonData.length; i++) {
        accessArray.push(jsonData[i]);
      }
    }
    function onFailed(error) {

      AjaxManager.MsgBox('error', 'center', 'Error', error.statusText, [{ addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) { $noty.close(); } }]);
    }
  },

};

var PSOIdentity = '';

var crmCommonHelper = {

  initePanelBer: function (ctlDivId) {

    var original = $("#" + ctlDivId).clone(true);
    original.find(".k-state-active").removeClass("k-state-active");

    $(".configuration input").change(function () {
      var panelBar = $("#" + ctlDivId),
        clone = original.clone(true);

      panelBar.data("kendoPanelBar").collapse($("#" + ctlDivId + " .k-link"));

      panelBar.replaceWith(clone);

      initPanelBar();
    });

    var initPanelBar = function () {
      $("#" + ctlDivId).kendoPanelBar({ animation: { expand: { duration: 500, } } });
    };

    initPanelBar();

  },

  IsHr: function () {
    var hr = false;
    var serviceUrl = "../Group/IsHrUser/";
    AjaxManager.GetJsonResult(serviceUrl, "", false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {
      hr = jsonData;
    }
    function onFailed(error) { }
    return hr;
  },

  GenerareHierarchyCompanyCombo: function (identity) {
    var objCompany = empressCommonManager.GetHierarchyCompany();
    $("#" + identity).kendoComboBox({

      placeholder: "Select Company",
      dataTextField: "CompanyName",
      dataValueField: "CompanyId",
      dataSource: objCompany

    });
  },

  GenerareAllActiveCompanyCombo: function (identity) {
    // ;
    var objAllCompany = empressCommonManager.GetAllActiveCompany();
    $("#" + identity).kendoComboBox({

      placeholder: "Select Company",
      dataTextField: "CompanyName",
      dataValueField: "CompanyId",
      dataSource: objAllCompany

    });
  },
  ////BG C ////
  GenerateAllActiveNewGradeCombo: function (identity) {    //added by newaz 
    var objGrade = null;
    objGrade = empressCommonManager.GetAllActiveGradeCombo();

    $("#" + identity).kendoComboBox({
      placeholder: "Select",
      dataTextField: "GradeName",
      dataValueField: "GradeId",
      dataSource: objGrade,
    });

    $("#" + identity).parent().css('width', "17.4em");
  },

  GetAllActiveGradeCombo: function () {

    var objGrade = "";
    var jsonParam = "";
    var serviceUrl = "../Grade/GenerateGradeCombo/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

    function onSuccess(jsonData) {

      objGrade = jsonData;
    }
    function onFailed(error) {
      window.alert(error.statusText);
    }
    return objGrade;
  },
  GenerateBranchCombo: function (companyId, identity) {
    var objBranch = new Object();

    objBranch = empressCommonManager.GenerateBranchCombo(companyId);
    $("#" + identity).kendoComboBox({
      placeholder: "Select Location",
      dataTextField: "BranchName",
      dataValueField: "BranchId",
      dataSource: objBranch
    });
  },

  GenerateSalaryLocationCombo: function (companyId, identity) {
    var objSalaryLocation = new Object();

    objSalaryLocation = empressCommonManager.GetSalaryLocationComboData(companyId);

    $("#" + identity).kendoComboBox({
      placeholder: "Select Location",
      dataTextField: "SalaryLocationName",
      dataValueField: "SalaryLocation",
      dataSource: objSalaryLocation
    });
  },

  GenerateBonusType: function (identity, placeholder) {
    debugger;
    var obj = new Object();

    obj = empressCommonManager.GenerateBonusType();

    $("#" + identity).kendoComboBox({
      placeholder: placeholder,
      dataTextField: "BONUSTYPENAME",
      dataValueField: "BONUSTYPEID",
      dataSource: obj
    });
  },

  //start: newly added
  GetCostCenterByCompanyId: function (companyId, identity) {
    debugger;

    var objCostCenter = new Object();

    objCostCenter = empressCommonManager.GetCostCenterByCompanyId(companyId);

    $("#" + identity).kendoComboBox({
      placeholder: "Select CostCenter",
      dataTextField: "CostCentreName",
      dataValueField: "CostCentreId",
      dataSource: objCostCenter
    });

  },
  //end: newly added

  GetDepartmentByCompanyId: function (companyId, identity) {
    debugger;

    var objDepartment = new Object();

    objDepartment = empressCommonManager.GetDepartmentByCompanyId(companyId);

    $("#" + identity).kendoComboBox({
      placeholder: "Select Department",
      dataTextField: "DepartmentName",
      dataValueField: "DepartmentId",
      dataSource: objDepartment
    });

  },

  GenerateDivisionByCompanyId: function (companyId, identity) {
    debugger;
    var objDivision = new Object();

    objDivision = empressCommonManager.GetDivisionByCompanyId(companyId);
    var obj = new Object();
    obj.DivisionId = -1;
    obj.DivisionName = "N/A";
    objDivision.unshift(obj);

    $("#" + identity).kendoComboBox({
      placeholder: "Select Division",
      dataTextField: "DivisionName",
      dataValueField: "DivisionId",
      dataSource: objDivision
    });

  },

  GenerateDivisionDeptByCompanyIdAndDivisionId: function (companyId, divisionId, identity) {
    var objDivisionDept = new Object();

    objDivisionDept = empressCommonManager.GetDivisionDeptByCompanyIdAndDivisionId(companyId, divisionId);
    $("#" + identity).kendoComboBox({
      placeholder: "Select Department",
      dataTextField: "DepartmentName",
      dataValueField: "DepartmentId",
      dataSource: objDivisionDept
    });

  },

  GenerateDepartmentByCompanyIdAndDivisionIdWithDeptRestriction: function (companyId, divisionId, identity) {
    var objDivisionDept = new Object();

    objDivisionDept = empressCommonManager.GetActiveDepartmentByCompanyIdAndDivisionId(companyId, divisionId);
    $("#" + identity).kendoComboBox({
      placeholder: "Select Department",
      dataTextField: "DepartmentName",
      dataValueField: "DepartmentId",
      dataSource: objDivisionDept,
      animation: {
        close: {
          effects: "fadeOut zoom:out",
          duration: 300
        },
        open: {
          effects: "fadeIn zoom:in",
          duration: 300
        }
      }
    });
  },

  GenerateDepartmentFacilityByDepartmentId: function (departmentId, identity) {
    var objFacility = new Object();

    objFacility = empressCommonManager.GetDepartmentFacilityByDepartmentId(departmentId);

    $("#" + identity).kendoComboBox({
      placeholder: "Select Facility",
      dataTextField: "FacilityName",
      dataValueField: "FacilityId",
      dataSource: objFacility
    });

  },


  GenerateFacilitySectionByFacilityId: function (facilityId, identity) {
    var objSection = new Object();

    objSection = empressCommonManager.GetFacilitySectionByFacilityId(facilityId);

    $("#" + identity).kendoComboBox({
      placeholder: "Select Section",
      dataTextField: "SectionName",
      dataValueField: "SectionId",
      dataSource: objSection
    });
  },

  GenerateSectionByCompanyDepartmentAndFacility: function (companyId, departmentId, facilityId, identity) {
    var objSection = new Object();

    objSection = empressCommonManager.GetSectionByCompanyDepartmentAndFacility(companyId, departmentId, facilityId);

    $("#" + identity).kendoComboBox({
      placeholder: "Select Section",
      dataTextField: "SectionName",
      dataValueField: "SectionId",
      dataSource: objSection
    });

  },

  GenerateAllActiveFacility: function (identity) {
    var objFacility = new Object();

    objFacility = empressCommonManager.GetAllActiveFacility();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Facility",
      dataTextField: "FacilityName",
      dataValueField: "FacilityId",
      dataSource: objFacility
    });

  },

  GetDepartmentAll: function (identity) {
    var objDepartment = new Object();

    objDepartment = empressCommonManager.GetDepartmentAll();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Department",
      dataTextField: "DepartmentName",
      dataValueField: "DepartmentId",
      dataSource: objDepartment
    });

  },

  GenerateAllActiveSection: function (identity) {

    var objSection = new Object();

    objSection = empressCommonManager.GetAllActiveSection();

    $("#" + identity).kendoComboBox({
      placeholder: "Select",
      dataTextField: "SectionName",
      dataValueField: "SectionId",
      dataSource: objSection,
      animation: { close: { effects: "fadeOut zoom:out", duration: 300 }, open: { effects: "fadeIn zoom:in", duration: 300 } }
    });

  },

  GetTaskType: function (identity, placeHolder) {
    var objTaskType = new Object();

    objTaskType = empressCommonManager.GetTaskTypeInformation();

    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "Task_Type_Name",
      dataValueField: "Task_Type_Id",
      dataSource: objTaskType
    });

  },

  GetLeaveAccumulationType: function (identity, placeHolder) {
    var obj = new Object();

    obj = empressCommonManager.GetLeaveAccumulationType();

    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "ACCUMULATIONTYPENAME",
      dataValueField: "ACCUMULATIONTYPEID",
      dataSource: obj
    });

  },

  GetLeaveTypeByAccumulationType: function (identity, placeHolder, accumulationType, hrRecordId) {
    var obj = new Object();

    obj = empressCommonManager.GetLeaveTypeByAccumulationType(accumulationType, hrRecordId);

    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "LeaveTypeName",
      dataValueField: "LeaveTypeId",
      dataSource: obj
    });

  },

  GetActiveLeaveType: function (identity, placeHolder) {
    var obj = new Object();

    obj = empressCommonManager.GetActiveLeaveType();

    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "TYPENAME",
      dataValueField: "LeaveTypeId",
      dataSource: obj
    });

  },

  PopulatePlanedLeaveTypeCombo: function (identity, placeHolder, hrRecordId, fiscalYearId) {
    debugger;
    var obj = new Object();

    obj = empressCommonManager.GetPlanedLeaveType(hrRecordId, fiscalYearId);

    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "TypeName",
      dataValueField: "LeaveType",
      dataSource: obj,
      index: 0
    });

  },

  GenerateEmployeeByCompanyId: function (companyId, branchId, departmentId, identity) {
    var objEmp = new Object();
    if (departmentId == 0) {
      objEmp = null;
    }
    else {
      objEmp = empressCommonManager.GetEmployeeByCompanyIdAndBranchIdAndDepartmentId(companyId, branchId, departmentId);
    }
    $("#" + identity).kendoComboBox({
      placeholder: "All",
      dataTextField: "FullName",
      dataValueField: "HRRecordId",
      dataSource: objEmp
    });
  },

  GenerateEmployeeByDepartmentId: function (departmentId, identity) {
    var objEmp = new Object();
    if (departmentId == 0) {
      objEmp = [];
    }
    else {
      objEmp = empressCommonManager.GetEmployeeByDepartmentId(departmentId);

    }



    $("#" + identity).kendoComboBox({
      placeholder: "All",
      dataTextField: "FullName",
      dataValueField: "HRRecordId",
      dataSource: objEmp
    });
  },

  GenerateEmployeeMultySelectByCompanyId: function (companyId, branchId, departmentId, identity) {
    var objEmp = new Object();
    if (departmentId == 0) {
      objEmp = null;
    }
    else {
      objEmp = empressCommonManager.GetEmployeeByCompanyIdAndBranchIdAndDepartmentId(companyId, branchId, departmentId);
    }
    $("#" + identity).kendoComboBox({
      placeholder: "All",
      dataTextField: "FullName",
      dataValueField: "HRRecordId",
      dataSource: objEmp
    });


  },

  EmployeeTypeCombo: function (identity) {
    //debugger;
    var objEmployeeType = new Object();
    objEmployeeType = empressCommonManager.GetEmployeeType();
    $("#" + identity).kendoComboBox({
      placeholder: "All",
      dataTextField: "EmployeeTypeName",
      dataValueField: "EmployeeTypeId",
      dataSource: objEmployeeType
    });
  },

  EmployeeLevelCombo: function (identity) {

    var objEmployeeLevel = new Object();
    objEmployeeLevel = empressCommonManager.GetEmployeeLevel();
    $("#" + identity).kendoComboBox({
      placeholder: "All",
      dataTextField: "EmployeeLevelName",
      dataValueField: "EmployeeLevelId",
      dataSource: objEmployeeLevel
    });
  },

  VerificationStatusCombo: function (identity) {
    debugger;
    var objApplicantSource = new Object();
    objApplicantSource = [
      { VerificationStatusId: 1, VerificationStatusName: "Is verified" },
      { VerificationStatusId: 2, VerificationStatusName: "Is Non-Verified" },
      { VerificationStatusId: 3, VerificationStatusName: " Is-Fake" },
      { VerificationStatusId: 4, VerificationStatusName: " Is-Partially Verified" }
    ]

    $("#" + identity).kendoComboBox({
      placeholder: "Select Verification Status",
      dataTextField: "VerificationStatusName",
      dataValueField: "VerificationStatusId",
      filter: "contains",
      suggest: true,
      dataSource: objApplicantSource,
      change: function () {
        var value = this.value();
        AjaxManager.isValidItem(identity, true);
      }
    });
  },

  GetRegularEmployeeTypes: function (identity) {
    var objEmployeeType = new Object();
    objEmployeeType = empressCommonManager.GetRegularEmployeeTypes();
    $("#" + identity).kendoComboBox({
      placeholder: "All",
      dataTextField: "EmployeeTypeName",
      dataValueField: "EmployeeTypeId",
      dataSource: objEmployeeType
    });
  },

  NonRegularEmployeeTypeCombo: function (identity) {
    var objEmployeeType = new Object();
    objEmployeeType = empressCommonManager.GetNonRegularEmployeeType();
    $("#" + identity).kendoComboBox({
      placeholder: "Select Employee Type",
      dataTextField: "EmployeeTypeName",
      dataValueField: "EmployeeTypeId",
      dataSource: objEmployeeType
    });
  },

  GetSalaryStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetSalaryStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },

  GetSalaryStatusByAdmin: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetSalaryStatusForAdmin();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },

  GetOtherPaymentStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetOtherPaymentStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },

  GetGratuityStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetGratuityStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },

  GetPayrollStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetPayrollStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },

  GetBonusStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetBonusStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },

  GetCoffStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetCoffStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },

  GetLeaveForwadingStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetLeaveForwadingStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },

  GetProjectStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetProjectStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },

  GetKraStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetKraStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },
  GetDepartmentKraStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetDepartmentKraStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },
  GetGoalStatus: function (identity, placeHolder) {
    var objStatus = new Object();
    objStatus = empressCommonManager.GetGoalStatus();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: objStatus
    });
  },

  populateClientCombo: function (companyId, identity) {
    var objClient = new Object();

    objClient = empressCommonManager.GetClient(companyId);
    $("#" + identity).kendoComboBox({
      placeholder: "Select Purpose...",
      dataTextField: "ClientName",
      dataValueField: "ClientCode",
      dataSource: objClient
    });

  },

  checkApproverUser: function (accessArray) {
    var approver = false;
    for (var i = 0; i < accessArray.length; i++) {
      if (accessArray[i].ReferenceID == 4) {
        approver = true;
        break;
      }
    }
    return approver;
  },

  checkIsPossibleClosedStatus: function (statusArray, stateId) {
    var isPosibleClosed = false;
    for (var i = 0; i < statusArray.length; i++) {
      if (statusArray[i].WFStateId == stateId) {
        if (statusArray[i].IsClosed == 1) {
          isPosibleClosed = true;
        }
        break;
      }
    }
    return isPosibleClosed;
  },

  checkIsClosedStatus: function (statusArray, stateId) {
    var isClosed = false;
    for (var i = 0; i < statusArray.length; i++) {
      if (statusArray[i].WFStateId == stateId) {
        if (statusArray[i].IsClosed == 2) {
          isClosed = true;
        }
        break;
      }
    }
    return isClosed;
  },

  GenerateDesignationCombo: function (companyId, identity) {
    var objDesignation = new Object();
    if (companyId != 0) {
      objDesignation = empressCommonManager.GenerateDesignationCombo(companyId);
    }
    else {
      objDesignation = null;
    }

    $("#" + identity).kendoComboBox({
      placeholder: "Select Designation",
      dataTextField: "DesignationName",
      dataValueField: "DesignationId",
      dataSource: objDesignation
    });
  },

  GenerateDesignationByDepartmentIdCombo: function (departmentId, identity) {
    var objDesignation = new Object();
    if (departmentId != 0) {
      objDesignation = empressCommonManager.GenerateDesignationByDepartmentIdCombo(departmentId);
    }
    else {
      objDesignation = null;
    }

    $("#" + identity).kendoComboBox({
      placeholder: "Select Designation",
      dataTextField: "DesignationName",
      dataValueField: "DesignationId",
      dataSource: objDesignation
    });
  },

  GenerateDesignationByCompanyIdCombo: function (companyId, identity) {
    var objDesignation = new Object();
    if (companyId != 0) {
      objDesignation = empressCommonManager.GenerateDesignationByCompanyIdComboData(companyId);
    }
    else {
      objDesignation = null;
    }

    $("#" + identity).kendoComboBox({
      placeholder: "Select Designation",
      dataTextField: "DesignationName",
      dataValueField: "DesignationId",
      dataSource: objDesignation
    });
  },



  GenerateDesignationAllCombo: function (identity) {
    var objDesignation = new Object();
    objDesignation = empressCommonManager.GenerateDesignationAllCombo();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Designation",
      dataTextField: "DesignationName",
      dataValueField: "DesignationId",
      filter: "contains",
      suggest: true,
      dataSource: objDesignation
    });
  },

  GenerateGradeComboByCompanyAndType: function (companyId, payrollTypeId, identity) {

    var objGrade = null;
    if (companyId != 0) {
      objGrade = empressCommonManager.GetGradeByCompanyAndPayroll(companyId, payrollTypeId);
    }

    $("#" + identity).kendoComboBox({
      placeholder: "Select Grade Name",
      dataTextField: "GradeName",
      dataValueField: "GradeSettingsId",
      dataSource: objGrade,
      //change: PayrollHelper.onChangeGradeType
    });

    $("#" + identity).parent().css('width', "20.6em");
  },

  GenerateGradeComboByCompanyId: function (companyId, identity) {
    debugger;
    var objGrade = null;
    if (companyId != 0) {
      objGrade = empressCommonManager.GenerateGradeComboByCompanyId(companyId);
    }

    $("#" + identity).kendoComboBox({
      placeholder: "Select Grade Name",
      dataTextField: "GradeName",
      dataValueField: "GradeId",
      dataSource: objGrade,
      //change: PayrollHelper.onChangeGradeType
    });

    $("#" + identity).parent().css('width', "17.4em");
  },

  GenerareAllSectionCombo: function (identity) {
    var objAllSection = empressCommonManager.GetAllActiveSection();
    $("#" + identity).kendoComboBox({

      placeholder: "Select Section",
      dataTextField: "SectionName",
      dataValueField: "SectionId",
      dataSource: objAllSection,
      filter: "contains",
      animation: {
        close: {
          effects: "fadeOut zoom:out",
          duration: 300
        },
        open: {
          effects: "fadeIn zoom:in",
          duration: 300
        }
      }

    });
  },

  GenerateAllActiveGradeCombo: function (identity) {
    debugger;
    var objGrade = null;
    objGrade = empressCommonManager.GetAllActiveGradeCombo();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Grade Name",
      dataTextField: "GradeName",
      dataValueField: "GradeId",
      dataSource: objGrade,
    });

    $("#" + identity).parent().css('width', "17.4em");
  },

  GenerateCertificateTypeCombo: function (identity) {
    var objCertificateType = new Object();
    objCertificateType = empressCommonManager.GetCertificateType();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Certificate Type",
      dataTextField: "CertificateTypeName",
      dataValueField: "CertificateTypeId",
      dataSource: objCertificateType
    });
  },

  populateMonthCombo: function (identity) {
    $("#" + identity).kendoComboBox({
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "January", value: "1" },
        { text: "February", value: "2" },
        { text: "March", value: "3" },
        { text: "April", value: "4" },
        { text: "May", value: "5" },
        { text: "June", value: "6" },
        { text: "July", value: "7" },
        { text: "August", value: "8" },
        { text: "September", value: "9" },
        { text: "October", value: "10" },
        { text: "November", value: "11" },
        { text: "December", value: "12" }
      ],
      filter: "contains",
      suggest: true
    });
    var month = new Date().getMonth() + 1;
    var monthCombo = $("#" + identity).data("kendoComboBox");
    monthCombo.value(month);
  },

  GenerateYearCombo: function (identity) {
    $("#" + identity).kendoComboBox({
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "2010", value: "2010" },
        { text: "2011", value: "2011" },
        { text: "2012", value: "2012" },
        { text: "2013", value: "2013" },
        { text: "2014", value: "2014" },
        { text: "2015", value: "2015" },
        { text: "2016", value: "2016" },
        { text: "2017", value: "2017" },
        { text: "2018", value: "2018" },
        { text: "2019", value: "2019" },
        { text: "2020", value: "2020" },
        { text: "2021", value: "2021" },
        { text: "2022", value: "2022" },
        { text: "2023", value: "2023" },
        { text: "2024", value: "2024" },
        { text: "2025", value: "2025" },
        { text: "2026", value: "2026" },
        { text: "2027", value: "2027" },
        { text: "2028", value: "2028" },
        { text: "2029", value: "2029" },
        { text: "2030", value: "2030" },
      ],
      filter: "contains",
      suggest: true
    });

    var year = new Date().getFullYear();
    var yearCombo = $("#" + identity).data("kendoComboBox");
    yearCombo.value(year);
  },

  populateMovementTypeCombo: function (identity) {
    $("#" + identity).kendoComboBox({
      placeholder: "Select Movement Type",
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "On Prayer", value: "1" },
        { text: "At Lunch", value: "2" },
        { text: "On Client Visit", value: "3" },
        { text: "Short Leave", value: "5" }
      ],
      filter: "contains",
      suggest: true
    });
  },

  populateEncashmentTypeCombo: function (identity) {
    $("#" + identity).kendoComboBox({
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "None", value: "0" },
        { text: "Full", value: "1" },
        { text: "Half", value: "2" }
      ],
      filter: "contains",
      suggest: true,
      index: 0
    });
  },

  populateValuTypeCombo: function (identity) {

    $("#" + identity).kendoComboBox({
      placeholder: "Select Value Type",
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "Fixed", value: "0" },
        { text: "Percentage", value: "1" }
      ],
      filter: "contains",
      suggest: true
    });

  },

  populateCtcCombo: function (identity, placeholderText) {


    var obj = new Object();
    obj = empressCommonManager.GetCtcInformation();
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "CtcName",
      dataValueField: "CtcId",
      dataSource: obj,
      filter: "contains",
      suggest: true
    });

  },

  populateCtcComboByOperator: function (identity, placeholderText, opType) {


    var obj = new Object();
    obj = empressCommonManager.GetCtcInformationByOperator(opType);
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "CtcName",
      dataValueField: "CtcId",
      dataSource: obj,
      filter: "contains",
      suggest: true
    });

  },

  populateCtcTypeCombo: function (identity, placeholderText) {


    var obj = new Object();
    obj = empressCommonManager.GetCtcTypes();
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "CtcTypeName",
      dataValueField: "CtcTypeId",
      dataSource: obj,
      filter: "contains",
      suggest: true
    });

  },

  populateCtcOperatorCombo: function (identity) {

    $("#" + identity).kendoComboBox({
      placeholder: "Select Value Type",
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "Adition", value: "1" },
        { text: "Deduction", value: "2" }
      ],
      filter: "contains",
      suggest: true
    });

  },

  populateLoanType: function (identity, placeholderText) {


    var obj = new Object();
    obj = empressCommonManager.GetLoanTypes();
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "LoanTypeName",
      dataValueField: "LoanTypeId",
      dataSource: obj,
      filter: "contains",
      suggest: true
    });

  },

  populateEmiType: function (identity) {

    $("#" + identity).kendoComboBox({
      // placeholder: "Select Emi Type",
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "Monthly", value: "1" },
        { text: "Quaterly", value: "2" },
        { text: "HalfYearly", value: "3" },
        { text: "Yearly", value: "4" },
        { text: "3 Years", value: "5" },
        { text: "5 Years", value: "6" }
      ],
      index: 0,
      filter: "contains",
      suggest: true
    });

  },

  populateRepostingType: function (identity, placeholderText) {

    var obj = new Object();
    obj = empressCommonManager.populateRepostingType();
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "PostingTypeName",
      dataValueField: "PostingTypeId",
      dataSource: obj,
      filter: "contains",
      suggest: true
    });

  },

  GenerateFunctionCombo: function (identity, placeholderText) {
    var objFunction = new Object();

    objFunction = empressCommonManager.GenerateFunctionCombo();
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "Function_Name",
      dataValueField: "Func_Id",
      dataSource: objFunction
    });

  },

  GenerateRsmRegionCombo: function (identity, placeholderText, regionManager) {


    var objFunction = new Object();
    objFunction = empressCommonManager.GetAllActiveRsmRegionComboDataForFieldForceAttendance();
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "RSMRegionName",
      dataValueField: "RSMRegionCode",
      dataSource: objFunction,
      change: onChange,
      //  enable: ((regionManager != 0) ? false : true),
    });
    if (regionManager != 0) {
      $("#" + identity).data("kendoComboBox").value(regionManager);
      var rsmCode = $("#" + identity).data("kendoComboBox").value();
      if (rsmCode != '') {
        var PSOLocationSataSource = empressCommonManager.GeneratePSOLocationCombo(rsmCode);
        $("#" + PSOIdentity).kendoComboBox({
          placeholder: placeholderText,
          dataTextField: "PSOLocationName",
          dataValueField: "PSOLocationCode",
          dataSource: PSOLocationSataSource,
        });
      }
    }
    function onChange() {
      var rsmCode = this.element.data("kendoComboBox").value();
      $("#" + PSOIdentity).data("kendoComboBox").value('');
      if (rsmCode != '') {
        var PSOLocationSataSource = empressCommonManager.GeneratePSOLocationCombo(rsmCode);
        $("#" + PSOIdentity).kendoComboBox({
          placeholder: placeholderText,
          dataTextField: "PSOLocationName",
          dataValueField: "PSOLocationCode",
          dataSource: PSOLocationSataSource,
        });

      }
    };
  },

  GeneratePSOLocationCombo: function (identity, placeholderText, rsmCode) {
    var objFunction = new Object();
    PSOIdentity = identity;
    objFunction = empressCommonManager.GeneratePSOLocationCombo(rsmCode);
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "PSOLocationName",
      dataValueField: "PSOLocationCode",
      dataSource: objFunction,
    });
  },

  GenerateShiftComboByCompanyAndBranch: function (companyId, branchId, identity, placeHolderText) {
    var objShift = [];
    if (companyId != 0) {
      objShift = empressCommonManager.GenerateShiftComboByCompanyAndBranch(companyId, branchId);
    }
    else {
      objShift = [];
    }

    //var obj = new Object();
    //obj.ShiftName = "Default";
    //obj.ShiftId = 0;
    //objShift.insert(0,obj);



    $("#" + identity).kendoComboBox({
      placeholder: placeHolderText,
      dataTextField: "ShiftName",
      dataValueField: "ShiftId",
      dataSource: objShift,
      indext: 0
    });
  },

  populateCtcCategoryCombo: function (identity, placeHolder) {
    var obj = new Object();

    obj = empressCommonManager.GetCtcCategoryInformation();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "CtcCategoryName",
      dataValueField: "CtcCategoryId",
      dataSource: obj
    });

  },

  populateGradeTypeCombo: function (identity) {
    var obj = new Object();
    obj = empressCommonManager.GetGradeType();
    $("#" + identity).kendoComboBox({
      placeholder: "Please Select a Grade",
      dataTextField: "GradeTypeName",
      dataValueField: "GradeTypeId",
      dataSource: obj
    });
  },

  populateTrainingTypeCombo: function (identity) {
    var obj = new Object();
    obj = empressCommonManager.GetTrainingType();
    $("#" + identity).kendoComboBox({
      placeholder: "Training Type",
      dataTextField: "TrainingTypeName",
      dataValueField: "TrainingTypeId",
      dataSource: obj
    });
  },

  populateSurveyQuestionCategoryCombo: function (identity) {
    var obj = new Object();
    obj = empressCommonManager.GetDataForAnyCombo("../SurveyQuestion/GetSurveyQuestionDataForCombo/?surveyCategoryid=0");//Here 0 means all
    $("#" + identity).kendoComboBox({
      placeholder: "Please Select a Survey Question",
      dataTextField: "QuestionCategoryDescription",
      dataValueField: "QuestionCategoryId",
      dataSource: obj
      //index: 0
    });
  },

  populateSurveyQuestionCategoryComboBySurveyCategory: function (identity, surveyCategoryId) {
    var obj = new Object();
    obj = empressCommonManager.GetDataForAnyCombo("../SurveyQuestion/GetSurveyQuestionDataForComboBySurveyCategoryId/?surveyCategoryid=" + surveyCategoryId);//Here 0 means all
    $("#" + identity).kendoComboBox({
      placeholder: "Please Select a Survey Question",
      dataTextField: "QuestionCategoryDescription",
      dataValueField: "QuestionCategoryId",
      dataSource: obj
      //index: 0
    });
  },

  populateSurveyCategoryCombo: function (identity) {
    var obj = new Object();

    obj = empressCommonManager.GetDataForAnyCombo("../PublishSurvey/GetSurveyCategoryDataForCombo");

    $("#" + identity).kendoComboBox({
      placeholder: "Please Select a Survey Category",
      dataTextField: "SurveyCategoryDescription",
      dataValueField: "SurveyCategoryId",
      dataSource: obj
      //index: 0
    });
  },

  commonValidator: function (ctlId) {
    var data = [];
    var validator = $("#" + ctlId).kendoValidator().data("kendoValidator"),
      status = $(".status");
    if (validator.validate()) {
      status.text("").addClass("valid");
      return true;
    } else {
      status.text("Oops! There is invalid data in the form.").addClass("invalid");
      return false;
    }

  },

  populateFiscalCombo: function (identity, placeHolder, companyId) {
    debugger;
    var objFiscalYear = new Object();
    objFiscalYear = empressCommonManager.GetFiscalYear(companyId);
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "FiscalYearName",
      dataValueField: "FiscalYearId",
      dataSource: objFiscalYear,
      index: 0
    });
  },

  populateTaxYearCombo: function (identity, placeHolder) {
    var objTaxYear = new Object();
    objTaxYear = empressCommonManager.GetTaxYearCombo();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "TaxYearName",
      dataValueField: "TaxYearId",
      dataSource: objTaxYear,
    });
  },

  populateLeaveTypeCombo: function (identity, placeholderText, companyId, hrRecordId) {
    var obj = new Object();

    obj = empressCommonManager.GetLeaveTypeByCompanyIdAndhrRecordId(companyId, hrRecordId);
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "TypeName",
      dataValueField: "LeaveType",
      dataSource: obj
    });
  },

  populateLeaveTypeComboByHrRecordId: function (identity, placeholderText, hrRecordId) {
    var obj = new Object();

    obj = empressCommonManager.GetLeaveTypeByhrRecordId(hrRecordId);
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "TypeName",
      dataValueField: "LeaveType",
      dataSource: obj
    });
  },

  populateCountryCombo: function (identity) {
    var objCountry = new Object();
    objCountry = empressCommonManager.GetCountryComboData();

    $("#" + identity).kendoComboBox({
      placeholder: "All",
      dataTextField: "CountryName",
      dataValueField: "CountryId",
      dataSource: objCountry
    });
  },

  populateDistrictCombo: function (identity) {
    var objDistrict = new Object();
    objDistrict = empressCommonManager.GetDistrictComboData();
    $("#" + identity).kendoComboBox({
      placeholder: "Select District",
      dataTextField: "DistrictName",
      dataValueField: "DistrictId",
      dataSource: objDistrict
    });

  },

  populateThanaCombo: function (identity) {
    var objThana = new Object();
    objThana = empressCommonManager.GetThanaComboData();
    $("#" + identity).kendoComboBox({
      placeholder: "All",
      dataTextField: "ThanaName",
      dataValueField: "ThanaId",
      dataSource: objThana
    });

  },

  populateThanaComboByDistrictId: function (districtId, identity) {
    var objThana = new Object();
    objThana = empressCommonManager.GetThanaComboDatabyDistrictId(districtId);
    $("#" + identity).kendoComboBox({
      placeholder: "All",
      dataTextField: "ThanaName",
      dataValueField: "ThanaId",
      dataSource: objThana
    });

  },

  populateThanaComboByDistrictIdInBangla: function (districtId, identity) {
    var objThana = new Object();
    objThana = empressCommonManager.GetThanaComboDatabyDistrictId(districtId);
    $("#" + identity).kendoComboBox({
      placeholder: "All",
      dataTextField: "ThanaName_bn",
      dataValueField: "ThanaId",
      dataSource: objThana
    });

  },

  populateKraYearConfigData: function (identity, placeHolderText) {
    var obj = new Object();
    obj = empressCommonManager.GetKraYearConfigData();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolderText,
      dataTextField: "ConfigName",
      dataValueField: "YearConfigId",
      dataSource: obj,
      index: 0,
    });

  },
  populateKraStatusData: function (identity, placeHolderText) {
    var obj = new Object();
    obj = empressCommonManager.GetKraYearConfigData();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolderText,
      dataTextField: "ConfigName",
      dataValueField: "YearConfigId",
      dataSource: obj,
      index: 0,
    });

  },

  GenerateBankCombo: function (identity) {
    var objBank = new Object();
    objBank = empressCommonManager.GetAllBank();
    $("#" + identity).kendoComboBox({
      placeholder: "Select Bank",
      dataTextField: "BankName",
      dataValueField: "BankId",
      dataSource: objBank
    });
  },

  GenerateBankComboForSalary: function (identity) {
    var objBank = new Object();
    objBank = empressCommonManager.GetAllBankForSalary();

    var obj = new Object();
    obj.BankId = "-1";
    obj.BankName = "Cash";

    // objBank.push(obj);

    $("#" + identity).kendoComboBox({
      placeholder: "Select Bank",
      dataTextField: "BankName",
      dataValueField: "BankId",
      dataSource: objBank
    });

    $("#" + identity).data("kendoComboBox").dataSource.insert(0, obj);

    obj = new Object();
    obj.BankId = "-2";
    obj.BankName = "All";
    $("#" + identity).data("kendoComboBox").dataSource.insert(0, obj);

    $("#" + identity).data("kendoComboBox").value(-2);
  },

  GenerateBankBranchCombo: function (identity) {
    var objBank = new Object();
    //objBank = empressCommonManager.GetAllBank();
    $("#" + identity).kendoComboBox({
      placeholder: "Select Branch",
      dataTextField: "BranchName",
      dataValueField: "BranchId",
      dataSource: []
    });
  },

  GenerateAccountComboByBranchId: function (identity, branchId) {
    ;
    var obj = new Object();
    obj = empressCommonManager.GetAccountByBranchId(branchId);
    $("#" + identity).kendoComboBox({
      placeholder: "Select Account No",
      dataTextField: "AccountNo",
      dataValueField: "AccountNo",
      dataSource: obj,
      index: 0
    });
  },

  GenerateAccountComboByBranchIdAndCompanyArrayForSalary: function (identity, branchId, companyArray, branchArray) {
    var obj = new Object();
    obj = empressCommonManager.GenerateAccountComboByBranchIdAndCompanyArrayForSalary(branchId, companyArray, branchArray);
    $("#" + identity).kendoComboBox({
      placeholder: "Select Account No",
      dataTextField: "AccountNo",
      dataValueField: "AccountNo",
      dataSource: obj,
      index: 0
    });
  },

  PopulateAllAccountHeadCombo: function (identity, placeholderText) {
    var obj = new Object();
    obj = empressCommonManager.GetAllAccountHead();
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "AccountHeadName",
      dataValueField: "AccountHeadId",
      template: '${ data.AccountHeadCode }-${ data.AccountHeadName }',
      dataSource: obj
    });
  },

  PopulateRootAccountHeadCombo: function (identity, placeholderText, isManualHead) {
    var obj = new Object();
    obj = empressCommonManager.GetRootAccountHead(isManualHead);
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "AccountHeadName",
      dataValueField: "AccountHeadId",
      template: '${ data.AccountHeadCode }-${ data.AccountHeadName }',
      dataSource: obj
    });
  },

  PopulateAllAccountHeadComboAndShowAccountHeadCode: function (identity, placeholderText) {
    var obj = new Object();
    obj = empressCommonManager.GetAllAccountHead();
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "AccountHeadCode",
      dataValueField: "AccountHeadId",
      template: '${ data.AccountHeadCode }-${ data.AccountHeadName }',
      dataSource: obj
    });
  },

  PopulateNoticeCategoryCombo: function (identity, placeholderText) {
    var obj = new Object();
    obj = empressCommonManager.GetDataForAnyCombo("../NoticeCategory/GetNoticeCategoryDataForCombo");
    $("#" + identity).kendoComboBox({
      placeholder: "Please Select a Notice Category",
      dataTextField: "NoticeCategoryDescription",
      dataValueField: "NoticeCategoryId",
      dataSource: obj
      //index: 0
    });
  },

  PopulateNewsCategoryCombo: function (identity, placeholderText) {
    var obj = new Object();
    obj = empressCommonManager.GetDataForAnyCombo("../NewsCategory/GetNewsCategoryDataForCombo");
    $("#" + identity).kendoComboBox({
      placeholder: "Please Select a News Category",
      dataTextField: "NewsCategoryDescription",
      dataValueField: "NewsCategoryId",
      dataSource: obj
      //index: 0
    });
  },

  populateReligionCombo: function (identity) {
    var objReligion = new Object();
    objReligion = empressCommonManager.GetReligionComboData();
    $("#" + identity).kendoComboBox({
      placeholder: "Select Religion",
      dataTextField: "ReligionName",
      dataValueField: "ReligionId",
      dataSource: objReligion,
      change: function () {
        var value = this.value();
        AjaxManager.isValidItem(identity, true);
      }
    });

  },

  populatePayband: function (identity, textPlaceHolder) {
    var obj = new Object();
    obj = empressCommonManager.GetPaybandComboData();
    $("#" + identity).kendoComboBox({
      placeholder: textPlaceHolder,
      dataTextField: "PaybandName",
      dataValueField: "PaybandId",
      dataSource: obj
    });

  },

  populateCtcByCategory: function (identity, textPlaceHolder, category) {
    var obj = new Object();
    obj = empressCommonManager.GetCtcTypesByCategory(category);

    $("#" + identity).kendoComboBox({
      placeholder: textPlaceHolder,
      dataTextField: "CtcName",
      dataValueField: "CtcId",
      dataSource: obj
    });

  },

  populateCtcByCategoryForDailyAllowance: function (identity, textPlaceHolder, category) {
    var obj = new Object();
    obj = empressCommonManager.GetCtcTypesByCategoryForDailyAllowance(category);

    $("#" + identity).kendoComboBox({
      placeholder: textPlaceHolder,
      dataTextField: "CtcName",
      dataValueField: "CtcId",
      dataSource: obj
    });

  },

  populateCtcByCategoryForFieldBenefitDailyAllowance: function (identity, textPlaceHolder, category) {
    var obj = new Object();
    obj = empressCommonManager.GetCtcByCategoryForFieldBenefitDailyAllowance(category);

    $("#" + identity).kendoComboBox({
      placeholder: textPlaceHolder,
      dataTextField: "CtcName",
      dataValueField: "CtcId",
      dataSource: obj
    });

  },

  clearCommonFields: function (divId) {
    //debugger;;
    $("input[type='text']").val("");
    $("input[type='hidden']").val(0);
    $('textarea').val('');
    $(".k-datepicker input").val('');
    $(".k-input input").val('');
    $("input[type='email']").val("");
    var status = $(".status");
    status.text("").removeClass("invalid");
    $("#" + divId + " > form").kendoValidator();//Div id
    $("#" + divId).find("span.k-tooltip-validation").hide();
  },

  PopulateEmployeeContributionAccountHeadHeadBySubject: function (identity, textPlaceHolder) {

    $("#" + identity).kendoComboBox({
      placeholder: textPlaceHolder,
      dataTextField: "AccountHeadName",
      dataValueField: "AccountHeadId",
      template: '${ data.AccountHeadCode }-${ data.AccountHeadName }',
      dataSource: []
    });
  },

  PopulateCompanyContributionAccountHeadHeadBySubject: function (identity, textPlaceHolder) {

    $("#" + identity).kendoComboBox({
      placeholder: textPlaceHolder,
      dataTextField: "AccountHeadName",
      dataValueField: "AccountHeadId",
      template: '${ data.AccountHeadCode }-${ data.AccountHeadName }',
      dataSource: []
    });
  },

  PopulateVoucherType: function (identity, textPlaceHolder) {

    $("#" + identity).kendoComboBox({
      placeholder: textPlaceHolder,
      dataTextField: "VoucharTypeName",
      dataValueField: "VoucharTypeId",
      dataSource: empressCommonManager.GetVoucherType()
    });
  },

  PopulateTransectionType: function (identity, textPlaceHolder) {

    $("#" + identity).kendoComboBox({
      placeholder: textPlaceHolder,
      dataTextField: "TransectionTypeName",
      dataValueField: "TransectionTypeId",
      dataSource: []
    });
  },

  populateSubjectOfAccounts: function (identity, textPlaceHolder) {
    ;
    var fundSubjects = [];
    var tmp = new Object();
    tmp.SubjectOfAccountName = "Select Fund";
    tmp.SubjectOfAccountId = 0;
    fundSubjects.push(tmp);
    var obj = empressCommonManager.GetSubjectOfAccounts();
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].CtcId == 5 && obj[i].IsActive == 1) {
        fundSubjects.push(obj[i]);
      }
    }
    $("#" + identity).kendoComboBox({
      //placeholder: textPlaceHolder,
      dataTextField: "SubjectOfAccountName",
      dataValueField: "SubjectOfAccountId",
      dataSource: fundSubjects,
      index: 0
    });

  },

  PopulateJobVacancy: function (identity) {
    $("#" + identity).kendoComboBox({
      placeholder: "Select Position ",
      dataTextField: "JobTitle",
      dataValueField: "JobVacancyId",
      dataSource: []
    });
  },

  populateInvestmentTypeCombo: function (identity) {

    $("#" + identity).kendoDropDownList({
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "Fixed Deposit", value: "0" },
        { text: "Shanchay Parta", value: "1" }
      ],
      filter: "contains",
      suggest: true,
      index: 0
    });

  },

  populatePaybandTypeCombo: function (identity) {

    $("#" + identity).kendoDropDownList({
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "Basic", value: "1" },
        { text: "Goal Seek", value: "2" }
      ],
      filter: "contains",
      suggest: true,
      index: 0
    });

  },

  EmployeeSearchTextBox: function (ctrlId) {

    $("#" + ctrlId).kendoSearchTextBox({

    });
    $("#" + ctrlId).bind('keypress', function (e) {

      if (e.keyCode == 13) {

        var that = $("#" + ctrlId).val();
        var data = empressCommonManager.GetEmployeeByIdAndShortName(that);
        if (data != null) {
          $("#" + ctrlId).val(data.EmployeeName);
        } else {
          $("#" + ctrlId).val("");
        }

      }


    });


  },

  PopulateApplicantCombo: function (identity) {
    var obj = new Object();
    obj = empressCommonManager.GetDataForAnyCombo("../Applicant/GetApplicantDataForCombo");
    $("#" + identity).kendoComboBox({
      placeholder: "Please Select a Applicant",
      dataTextField: "ApplicantName",
      dataValueField: "ApplicantId",
      dataSource: obj
      //index: 0
    });
  },

  populateGradeType: function (identity) {

    $("#" + identity).kendoDropDownList({
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "Management", value: "1" },
        { text: "Non Management", value: "2" },
        { text: "Contractual", value: "3" },
        { text: "BOD", value: "4" }
      ],
      filter: "contains",
      suggest: true,
      index: 0
    });

  },

  PopulateGradeTypeCombo: function (identity) {
    var obj = new Object();
    obj = empressCommonManager.GetDataForAnyCombo("../GradeTypeSettings/PopulateGradeTypeCombo");
    $("#" + identity).kendoDropDownList({
      placeholder: "Please Select a Grade Type",
      dataTextField: "GradeTypeName",
      dataValueField: "GradeTypeInfoId",
      dataSource: obj
      //index: 0
    });
  },

  populateFinalSettlementStatus: function (identity) {
    obj = empressCommonManager.GetDataForAnyCombo("../Status/GetDynamicStateInfoByMenuIdAndUserId");
    $("#" + identity).kendoDropDownList({
      placeholder: "Please Select Status",
      dataTextField: "StateName",
      dataValueField: "WFStateId",
      dataSource: obj
    });


  },

  PopulateCategoryCombo: function (identity) {
    var objCategory = new Object();
    objCategory = empressCommonManager.GetCategoryComboData();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Category",
      dataTextField: "AssetCategoryName",
      dataValueField: "AssetCategoryId",
      dataSource: objCategory
    });
  },

  PopulateCommonCombo: function (identity, textField, valueField, placeholder, jsonParam, url) {
    $("#" + identity).kendoComboBox({
      dataTextField: textField,
      dataValueField: valueField,
      dataSource: empressCommonManager.GetCommonComboData(jsonParam, url),
      placeholder: placeholder
    });
  },

  PopulateCompetencyCombo: function (identity) {
    var objCompetency = new Object();
    objCompetency = empressCommonManager.GetCompetencyComboData();

    $("#" + identity).kendoComboBox({
      placeholder: "Select KRA Type",
      dataTextField: "CompetencyName",
      dataValueField: "CompetencyId",
      dataSource: objCompetency,
      filter: "contains",
      suggest: true,
      optionLabel: "Please Select...",
    });
  },

  PopulateCompetencyComboRec: function (identity) {
    var objCompetency = new Object();
    objCompetency = empressCommonManager.GetCompetencyComboDataRec();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Competency",
      dataTextField: "CompetencyName",
      dataValueField: "CompetencyId",
      dataSource: objCompetency,
      filter: "contains",
      suggest: true,
      optionLabel: "Please Select...",
    });
  },

  PopulateCompetencyAreaSectionCombo: function (identity) {
    var objAreaSection = new Object();
    objAreaSection = empressCommonManager.GetCompetencyAreaSectionComboData();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Area Section",
      dataTextField: "Comp_Area_Section_Name",
      dataValueField: "Id",
      dataSource: objAreaSection,
      filter: "contains",
      suggest: true,
    });
  },

  PopulateCompetencyLevelCombo: function (identity) {
    var objCompetencyLevel = new Object();
    objCompetencyLevel = empressCommonManager.GetCompetencyLevelComboData();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Competency Level",
      dataTextField: "LevelTitle",
      dataValueField: "LevelId",
      dataSource: objCompetencyLevel,
      filter: "contains",
      suggest: true,
    });
  },

  PopulateCompetencyAreaCombo: function (identity) {
    var objCompetencyArea = new Object();
    objCompetencyArea = empressCommonManager.GetCompetencyAreaComboData();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Competency Area",
      dataTextField: "CompitencyAreaName",
      dataValueField: "CompetencyAreaId",
      dataSource: objCompetencyArea,
      filter: "contains",
      suggest: true,
    });
  },

  initTopToPageScrooler: function () {
    $(window).scroll(function () {
      if ($(this).scrollTop() > 100) {
        $('.scrollup').fadeIn();
      } else {
        $('.scrollup').fadeOut();
      }
    });

    $('.scrollup').click(function () {
      $("html, body").animate({
        scrollTop: 0
      }, 600);
      return false;
    });
  },

  populateDropDownList: function (identity, textField, valueField, url, jsonParam) {
    if (jsonParam == undefined) {
      jsonParam = "";
    }

    $("#" + identity).kendoDropDownList({
      optionLabel: "Select",
      dataTextField: textField,
      dataValueField: valueField,
      dataSource: empressCommonManager.GetCommonComboData(jsonParam, url),

    });

  },

  PopulateGroup: function (ctrlId) {
    var data = empressCommonManager.GetAllGroupData();
    $("#" + ctrlId).kendoComboBox({
      placeholder: "Select Group",
      dataTextField: "GroupName",
      dataValueField: "GroupId",
      dataSource: data,

    });

  },

  populateLeaveReason: function (ctrlId) {
    $("#" + ctrlId).kendoDropDownList({
      optionLabel: "Select",
      dataTextField: 'Reason',
      dataValueField: 'LeaveReasonId',
      dataSource: empressCommonManager.GetLeaveReason(),

    });
  },

  PopulateAccountHeadCombo: function (identity, placeholderText) {
    var obj = new Object();
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      filter: "startwith",
      dataTextField: "AccountHeadName",
      dataValueField: "AccountHeadId",
      template: '${ data.AccountHeadCode }-${ data.AccountHeadName }',
      dataSource: []
    });
  },

  checkApproverUser: function () {
    var approver = false;
    for (var i = 0; i < accessArray.length; i++) {
      if (accessArray[i].ReferenceID == 4) {
        approver = true;
        break;
      }
    }
    return approver;
  },

  checkRecomanderUser: function () {
    var recomander = false;

    for (var i = 0; i < accessArray.length; i++) {
      if (accessArray[i].ReferenceID == 3) {
        recomander = true;
        break;
      }
    }
    return recomander;
  },

  checkHrUser: function () {
    var hrUser = false;

    for (var i = 0; i < accessArray.length; i++) {
      if (accessArray[i].ReferenceID == 22) {
        hrUser = true;
        break;
      }
    }
    return hrUser;
  },

  populateFundYearCombo: function (identity, placeHolder) {
    var objTaxYear = new Object();
    objTaxYear = empressCommonManager.GetFundYearCombo();
    $("#" + identity).kendoComboBox({
      placeholder: placeHolder,
      dataTextField: "TaxYearName",
      dataValueField: "TaxYearId",
      dataSource: objTaxYear,
      //index: 0
    });
    for (var i = 0; i < objTaxYear.length; i++) {
      if (objTaxYear[i].IsCurrent) {
        $("#" + identity).data("kendoComboBox").value(objTaxYear[i].TaxYearId);
      }
    }
  },

  populateInvestmentType: function (identity, textPlaceHolder) {


    var obj = new Object();
    obj = empressCommonManager.GetInvestmentType();

    $("#" + identity).kendoDropDownList({
      placeholder: textPlaceHolder,

      dataTextField: "InvestmentTypeName",
      dataValueField: "InvestmentTypeId",
      dataSource: obj
    });
  },

  PfEligibleAmountCombo: function (identity, placeholderText) {
    var obj = new Object();
    obj = empressCommonManager.PfEligibleAmountCombo();
    $("#" + identity).kendoComboBox({
      placeholder: (placeholderText ? placeholderText : 'Please select'),
      dataTextField: "PfFundEligibleAmountName",
      dataValueField: "PfFundEligibleAmountId",
      dataSource: obj
    });
  },

  GetIsApprover: function (hrRecordId, moduleId) {
    var approver = empressCommonManager.GetApprover(hrRecordId, moduleId);
    if (approver == null) {
      return false;
    }
    if (approver.Type == 1) {
      return true;
    } else {
      return false;

    }
  },

  GetIsRecommender: function (hrRecordId, moduleId) {
    var recommender = empressCommonManager.GetApprover(hrRecordId, moduleId);
    if (recommender == null) {
      return false;
    }
    if (recommender.Type == 2) {
      return true;
    } else {
      return false;

    }
  },

  AzDatePicker: function (container) {
    $("#" + container).kendoDatePicker({
      start: "date",
      depth: "year",
      format: "MM/dd/yyyy",
      value: ""
    });
  },



  GetReportingLine: function (hrRecordId, applicationId) {
    //debugger;
    var url = '../ApproverRecommender/GetReportingLineDetailses';
    var param = "hrRecordId=" + hrRecordId + "&applicationId=" + applicationId;
    var approverList = AjaxManager.GetJsonResults(url, param);

    return approverList;
  },

  ShowReportingLine: function (container, approvers) {

    if (approvers.length > 0) {
      // ;
      var htmls = "";

      // htmls += "<input type='hidden' id='hdnTotalAppro' value='" + approvers.length + "'>";
      for (var i = 0; i < approvers.length; i++) {

        var appDate = kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd-MM-yyyy") == '01-01-0001' ? '' : kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd MMM yyyy hh:mm:ss tt");
        //var appDate = kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd-MM-yyyy") == '01-01-0001' ? '' : kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd MMM yyyy");

        htmls += "<b>" + approvers[i].TypeName + ": " + approvers[i].SortOrder + "</b><br>";
        //  htmls += "<span> Employee ID:" + approvers[i].ApproverEmployeeId + "&nbsp; Name:" + approvers[i].ApproverName + "(" + approvers[i].ApproverShortName + ")" + "</span><br>";
        htmls += "<span> Employee ID:" + approvers[i].ApproverEmployeeId + "&nbsp; Name:" + approvers[i].ApproverName + "</span><br>";
        htmls += "<span> Designation:" + approvers[i].ApproverDesignation + "&nbsp; Company:" + approvers[i].ApproverCompany + "</span><br>";
      }
      $("#" + container).html(htmls);

    } else {
      $("#" + container).html("No Approver found for the Applicant");
    }
  },

  GetApproverRecommendar: function (hrRecordId, applicationId) {
    var url = '../ApproverRecommender/GetApproverRecomendarDetailses';
    var param = "hrRecordId=" + hrRecordId + "&applicationId=" + applicationId;
    var approverList = AjaxManager.GetJsonResults(url, param);

    return approverList;
  },

  ShowApproverRecommendar: function (container, approvers) {

    if (approvers.length > 0) {
      // ;
      var htmls = "";
      // htmls += "<input type='hidden' id='hdnTotalAppro' value='" + approvers.length + "'>";
      for (var i = 0; i < approvers.length; i++) {
        // var appDate = kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd-MM-yyyy") == '01-01-0001' ? '' : kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd MMM yyyy hh:mm:ss tt");
        var appDate = empressCommonHelper.TemplateAppliedDateView(approvers[i].ApprovedDate);
        //var appDate = kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd-MM-yyyy") == '01-01-0001' ? '' : kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd MMM yyyy");

        htmls += "<b>" + approvers[i].TypeName + ": " + approvers[i].SortOrder + "</b></br>";
        // htmls += "<span> Employee ID: " + approvers[i].ApproverEmployeeId + "&nbsp; Name: " + approvers[i].ApproverName + "(" + approvers[i].ApproverShortName + ")" + "</span><br>";
        htmls += "<span> Employee ID: " + approvers[i].ApproverEmployeeId + "&nbsp; Name: " + approvers[i].ApproverName + "</span><br>";
        htmls += "<span> Designation: " + approvers[i].ApproverDesignation + "&nbsp; Company: " + approvers[i].ApproverCompany + "</span><br>";
        htmls += "<input type='hidden' id='appro-" + approvers[i].ApproverId + "' value='" + approvers[i].ApproverId + "'>";
        htmls += "<label class='lbl widthSize20_per'>Approve/Decline:</label><br><input type='checkBox' id='chkAppro-" + approvers[i].ApproverId + "' disabled='disabled' ></br>";
        //htmls += "<label for='cmbLeaveType' class='lbl widthSize20_per'>Remarks:</label><input type='text' id='appro-comments-" + approvers[i].ApproverId + "' class='k-textbox'/></br>";
        htmls += "<label class='lbl widthSize20_per'>Remarks:</label><textarea id='appro-comments-" + approvers[i].ApproverId + "' class='k-textbox'></textarea><br>";
        htmls += "<input type='hidden' id='assignApproId-" + approvers[i].ApproverId + "' value='" + approvers[i].AssignApproverId + "'>";
        htmls += "<label class='lbl widthSize20_per'>Date:</label><input class='k-textbox' id='approvedDate-" + approvers[i].ApproverId + "' value='" + appDate + "' disabled='disabled'></br>";
      }
      $("#" + container).html(htmls);
      for (i = 0; i < approvers.length; i++) {
        if (approvers[i].IsOpen == false || CurrentUser.EmployeeId != approvers[i].ApproverId) {
          $("#" + 'appro-comments-' + approvers[i].ApproverId).val(approvers[i].Comments);
          $("#" + 'appro-comments-' + approvers[i].ApproverId).attr("disabled", "disabled");
          $("#" + 'approvedDate-' + approvers[i].ApproverId).attr("disabled", "disabled");
          $("#" + 'chkAppro-' + approvers[i].ApproverId).prop("checked", !approvers[i].IsOpen);
          $("#" + 'chkAppro-' + approvers[i].ApproverId).prop("disabled", true);
        }
      }

      $("#liAuthorizationPanel").show();

    } else {
      $("#" + container).html("No Approver found for the Applicant");
    }
  },

  ShowApproverRecommendarForJobConfirmation: function (container, approvers) {

    if (approvers.length > 0) {
      // ;
      var htmls = "";
      // htmls += "<input type='hidden' id='hdnTotalAppro' value='" + approvers.length + "'>";
      for (var i = 0; i < approvers.length; i++) {
        // var appDate = kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd-MM-yyyy") == '01-01-0001' ? '' : kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd MMM yyyy hh:mm:ss tt");
        var appDate = empressCommonHelper.TemplateAppliedDateView(approvers[i].ApprovedDate);
        //var appDate = kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd-MM-yyyy") == '01-01-0001' ? '' : kendo.toString(kendo.parseDate(approvers[i].ApprovedDate), "dd MMM yyyy");

        htmls += "<b>" + approvers[i].TypeName + ": " + approvers[i].SortOrder + "</b></br>";
        // htmls += "<span> Employee ID: " + approvers[i].ApproverEmployeeId + "&nbsp; Name: " + approvers[i].ApproverName + "(" + approvers[i].ApproverShortName + ")" + "</span><br>";
        htmls += "<span> Employee ID: " + approvers[i].ApproverEmployeeId + "&nbsp; Name: " + approvers[i].ApproverName + "</span><br>";
        htmls += "<span> Designation: " + approvers[i].ApproverDesignation + "&nbsp; Company: " + approvers[i].ApproverCompany + "</span><br>";
        htmls += "<input type='hidden' id='appro-" + approvers[i].ApproverId + "' value='" + approvers[i].ApproverId + "'>";
        htmls += "<label class='lbl widthSize20_per'>Approve/Decline:</label><br><input type='checkBox' id='chkAppro-" + approvers[i].ApproverId + approvers[i].TypeId + "' disabled='disabled' ></br>";
        //htmls += "<label for='cmbLeaveType' class='lbl widthSize20_per'>Remarks:</label><input type='text' id='appro-comments-" + approvers[i].ApproverId + "' class='k-textbox'/></br>";
        htmls += "<label class='lbl widthSize20_per'>Remarks:</label><textarea id='appro-comments-" + approvers[i].ApproverId + "' class='k-textbox'></textarea><br>";
        htmls += "<input type='hidden' id='assignApproId-" + approvers[i].ApproverId + "' value='" + approvers[i].AssignApproverId + "'>";
        htmls += "<label class='lbl widthSize20_per'>Date:</label><input class='k-textbox' id='approvedDate-" + approvers[i].ApproverId + "' value='" + appDate + "' disabled='disabled'></br>";
      }
      $("#" + container).html(htmls);
      for (i = 0; i < approvers.length; i++) {
        if (approvers[i].IsOpen == false || CurrentUser.EmployeeId != approvers[i].ApproverId) {
          $("#" + 'appro-comments-' + approvers[i].ApproverId).val(approvers[i].Comments);
          $("#" + 'appro-comments-' + approvers[i].ApproverId).attr("disabled", "disabled");
          $("#" + 'approvedDate-' + approvers[i].ApproverId).attr("disabled", "disabled");
          $("#" + 'chkAppro-' + approvers[i].ApproverId + approvers[i].TypeId).prop("checked", !approvers[i].IsOpen);
          $("#" + 'chkAppro-' + approvers[i].ApproverId + approvers[i].TypeId).prop("disabled", true);
        }
      }

      $("#liAuthorizationPanel").show();

    } else {
      $("#" + container).html("No Approver found for the Applicant");
    }
  },



  TemplateAppliedDateView: function (data) {

    var finalDateTime = "";
    var date = kendo.toString(kendo.parseDate(data), "dd-MMM-yyyy");
    var time = kendo.toString(kendo.parseDate(data), "hh:mm tt");
    if (date == '01-01-0001' || date == "01-Jan-0001" || date == "31-Dec-0000") {
      return finalDateTime;
    }
    if (time == "12:00 AM") {
      time = "";
    }
    if (date != "") {
      finalDateTime = date + " " + time;
    }

    return finalDateTime;
  },

  GenerateProfilePicture: function (data) {

    var pathImg = "";
    if (data.ProfilePicture != "") {
      pathImg = data.ProfilePicture;
    } else {
      if (data.Gender == 1) {
        pathImg = '../Images/male.png';
      }
      else if (data.Gender == 2) {
        pathImg = '../Images/female.png';
      }
      else {
        pathImg = '';
      }

    }

    return "<img id=\"imgProfilePicturegrid\" alt='Photo' src=\"" + pathImg + "\" style=\"height:50px; width:50px; border-radius:150px;-webkit-border-radius:150px; -moz-border-radius: 150px;box-shadow:0 0 8px rgba(0, 0, 0, .8); -webkit-box-shadow: 0 0 8px rgba(0, 0, 0, .8); -moz-box-shadow: 0 0 8px rgba(0, 0, 0, .8; \" /> ";

  },


  PopulateAllZoneCombo: function (identity) {
    var objZone = new Object();

    objZone = empressCommonManager.GetAllZoneCombo();

    $("#" + identity).kendoComboBox({
      placeholder: "Select Zone",
      dataTextField: "ZoneName",
      dataValueField: "ZoneId",
      dataSource: objZone
    });
  },

  PopulateRegionComboByZoneId: function (zoneId, identity) {
    var objRegion = new Object();
    if (zoneId == "") {
      zoneId = 0;
    }

    objRegion = empressCommonManager.GetRegionComboByZoneId(zoneId);

    $("#" + identity).kendoComboBox({
      placeholder: "Select Region",
      dataTextField: "RegionName",
      dataValueField: "RegionId",
      dataSource: objRegion
    });
  },

  PopulateAreaComboByRegionId: function (regionId, identity) {
    var objArea = new Object();
    if (regionId == "") {
      regionId = 0;
    }

    objArea = empressCommonManager.GetAreaComboByRegionId(regionId);

    $("#" + identity).kendoComboBox({
      placeholder: "Select Area",
      dataTextField: "AreaName",
      dataValueField: "AreaId",
      dataSource: objArea
    });
  },

  PopulateTerritoryComboAreaId: function (areaId, identity) {
    var objTerritory = new Object();
    if (areaId == "") {
      areaId = 0;
    }

    objTerritory = empressCommonManager.GetTerritoryComboByAreaId(areaId);

    $("#" + identity).kendoComboBox({
      placeholder: "Select Territory",
      dataTextField: "TerritoryName",
      dataValueField: "TerritoryId",
      dataSource: objTerritory
    });

  },

  populateCostCentre: function (identity, placeholderText) {
    var obj = new Object();
    obj = empressCommonManager.GetCostCentreComboData();
    $("#" + identity).kendoComboBox({
      placeholder: placeholderText,
      dataTextField: "CostCentreName",
      dataValueField: "CostCentreId",
      dataSource: obj,
      filter: "contains",
      suggest: true,
    });
  },

  checkOnlyApprovalData: function () {
    var onlyApprovalData = false;

    for (var i = 0; i < accessArray.length; i++) {
      if (accessArray[i].ReferenceID == 29) {
        onlyApprovalData = true;
        break;
      }
    }
    return onlyApprovalData;
  },

  GenerateYearComboWithOptionLabel: function (identity) {
    $("#" + identity).kendoComboBox({
      dataTextField: "text",
      dataValueField: "value",
      dataSource: [
        { text: "2010", value: "2010" },
        { text: "2011", value: "2011" },
        { text: "2012", value: "2012" },
        { text: "2013", value: "2013" },
        { text: "2014", value: "2014" },
        { text: "2015", value: "2015" },
        { text: "2016", value: "2016" },
        { text: "2017", value: "2017" },
        { text: "2018", value: "2018" },
        { text: "2019", value: "2019" },
        { text: "2020", value: "2020" }
      ],
      filter: "contains",
      suggest: true
    });
  },
  IsModuleHr: function (moduleId) {
    //// 
    var hr = false;
    var jsonParam = "moduleId=" + moduleId;
    var serviceUrl = "../Group/IsModuleHrUser/";
    AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);
    function onSuccess(jsonData) {
      hr = jsonData;
    }
    function onFailed(error) { }
    return hr;
  },

  GenerateMonthPicker: function (identity) {

    $("#" + identity).kendoDatePicker({
      start: "year",
      depth: "year",
      format: "MMMM yyyy",
      animation: {
        close: {
          effects: "fadeOut zoom:out",
          duration: 400
        },
        open: {
          effects: "fadeIn zoom:in",
          duration: 400
        }
      }
    });

  },


};

const MenuManager = {
  getMenu: (moduleId) => {
    const pathName = window.location.pathname;
    const pageName = pathName.substring(pathName.lastIndexOf('/') + 1);
    const serviceURL = "../Menu/SelectMenuByUserPermission/";
    const jsonParam = ""; // "moduleId=" + moduleId;

    AjaxManager.GetJsonResult(serviceURL, jsonParam, false, false,
      (jsonData) => {
        // MenuManager.populateMenus(jsonData);
      },
      (error) => {
        window.alert(error.statusText);
      }
    );
  },

  getCurrentUser: (menuRefresh) => {
    debugger;
    const jsonParam = '';
    const serviceURL = "../Home/GetCurrentUser";

    AjaxManager.SendJson2(serviceURL, jsonParam,
      (jsonData) => {
        CurrentUser = jsonData;
        if (CurrentUser) {
          if (menuRefresh) {
            MenuManager.getMenu(1);
          }
          /*  $("#headerLogo").css('background-image', `url("${CurrentUser.FullLogoPath}")`);*/
        }
      },
      (error) => {
        window.alert(error.statusText);
      }
    );
  },

  getCurrentEmployee: () => {
    const jsonParam = '';
    const serviceURL = "../Home/GetCurrentEmployee";
    return AjaxManager.GetSingleObject(serviceURL, jsonParam);
  },

  IsStringEmpty: (str) => {
    return !str || str.trim() === '';
  },

  addchiledMenu: (objMenuOrginal, menuId, objMenuList) => {
    const chiledMenuArray = [];
    const newMenuArray = [];

    objMenuList.forEach((menu) => {
      if (menu.ParentMenuId === menuId) {
        const objMenu = { ...objMenuOrginal };
        const objChiledMenu = {
          id: menu.MenuId,
          itemId: menu.MenuId,
          text: menu.MenuName,
          url: menu.MenuPath || "",
          spriteCssClass: "html"
        };

        let childItems = objMenuOrginal.items || [];
        if (childItems.length > 0) {
          objChiledMenu.expanded = true;
          objChiledMenu.spriteCssClass = "folder";
        }

        const nestedMenu = MenuManager.addchiledMenu(objChiledMenu, menu.MenuId, objMenuList);
        childItems.push(objChiledMenu);
        objMenu.items = childItems;

        chiledMenuArray.push(objChiledMenu);
      }
    });

    return chiledMenuArray;
  }
};





