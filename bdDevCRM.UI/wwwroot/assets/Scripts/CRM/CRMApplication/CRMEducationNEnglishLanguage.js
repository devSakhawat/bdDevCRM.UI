/// <reference path="../../common/common.js" />
/// <reference path="../../core/currency/currencydetail.js" />
/// <reference path="../../core/currency/currencysummary.js" />
/// <reference path="../../core/country/countrydetail.js" />
/// <reference path="../../core/country/countrysummary.js" />
/// <reference path="../../core/crmcourse/coursedetails.js" />
/// <reference path="../../core/crminstitute/institutedetails.js" />


/// <reference path="crmadditionalinformation.js" />
/// <reference path="crmapplicationsettings.js" />
/// <reference path="crmcourseinformation.js" />


var CRMEducationNEnglishLanguagManager = {

  fileUpload: function (docuid) {
    debugger;
    $("#uploadDocumentPhoto").kendoUpload({
      upload: onUpload,
      localization: {
        select: '<span class="k-icon k-i-plus"></span>Select Donument'
      },
      multiple: false,
      success: onSuccess,
      error: onError,
      async: {
        saveUrl: "../Employee/save",
        removeUrl: "../Employee/remove",
        autoUpload: true
      },
      validation: {
        maxFileSize: 6194304
      }
    });

    function onUpload(e) {
      debugger;
      var files = e.files;
    }

    function onSuccess(e) {
      debugger;
      // Array with information about the uploaded files

      var files = e.files;
      if (e.operation == "upload") {
        DocumentManager.GetUplodedDocumentData(docuid);

        var kendoFileUpload = $("#windDocumentPhotoUpload").data('kendoWindow');
        kendoFileUpload.close();

        $(".k-upload-files").remove();
        $(".k-upload-status").remove();
        $(".k-upload.k-header").addClass("k-upload-empty");
        $(".k-upload-button").removeClass("k-state-focused");
      }
    }
    function onError(e) {
      debugger;
      // Array with information about the uploaded files

      var files = e.files;

      if (e.operation == "upload") {
        alert("Failed to uploaded " + files.length + " files");
      }
    }
  },
}

var CRMEducationNEnglishLanguagHelper = {

  initEducationNEnglishtLanguage: function () {
    CRMEducationNEnglishLanguagHelper.initializeEducationSummaryGrid();
  },

  initializeEducationSummaryGrid: function () {
    const gridOption = {
      dataSource: new kendo.data.DataSource({
        data: [],
        schema: {
          model: {
            id: "EducationHistoryId",
            fields: {
              EducationHistoryId: { type: "number", editable: false, nullable: true },
              Institution: { type: "string" },
              Qualification: { type: "string" },
              PassingYear: { type: "number" },
              Grade: { type: "string" },
              AttachedDocument: { type: "string" }
            }
          }
        }
      }),
      toolbar: ["create"],
      scrollable: true,
      resizable: true,
      width: "400px",
      columns: CRMEducationNEnglishLanguagHelper.generateEducationSummaryColumn(),
      editable: { model: "inline" },
      navigatable: true,
      selectable: true,
    };

    $("#gridEducationSummary").kendoGrid(gridOption);
    const gridInstance = $("#gridEducationSummary").data("kendoGrid");
    if (gridInstance) {
      //const dataSource = CRMEducationNEnglishLanguagManager.educationSummaryDataSource();
    }

  },

  generateEducationSummaryColumn: function () {
    return [
      { field: "EducationHistoryId", title: "EducationHistoryId", hidden: true },
      { field: "Institution", title: "Name of Institution", width:"200px"},
      { field: "Qualification", title: "Qualification", width: "200px" },
      { field: "PassingYear", title: "Year of Passing", width: "150px" },
      { field: "Grade", title: "Grade", width: "150px" },
      { field: "AttachedDocument", title: "Upload Document", template: '#= CRMEducationNEnglishLanguagHelper.editorFileUpload(data) #', filterable: false, width: "200px" },
      {
        field: "View", title: "View Document", template: '#= CRMEducationNEnglishLanguagHelper.ViewDetails(data) #',
        editable: false, filterable: false, width: "200px"
      },
      { command: "destroy", title: "Action", width: "100px" }
    ];
  },

  editorFileUpload: function (data) {
    return '<input type="file" value="Select file"  class="k-button form-control btn" onclick="CRMEducationNEnglishLanguagHelper.SelectFileBrowser(\'' + data.uid + '\')"/>';
  },

  SelectFileBrowser: function (docuid) {
    debugger;
    $("#windDocumentPhotoUpload").data('kendoWindow').center().open();
    DocumentManager.fileUpload(docuid);

  },


  ViewDetails: function (data) {
    if (data.AttachedDocument != null && data.AttachedDocument != "") {
      var res = '<a href="' + data.AttachedDocument + '" target="_blank" title="View"> View Document</a>';
    }
    else {
      res = "";
    }
    return res;
  },


  
}

