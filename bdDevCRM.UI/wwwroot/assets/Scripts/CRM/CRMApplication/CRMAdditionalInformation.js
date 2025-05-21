

// <reference path="CRMCourseInformation.js" />
// <reference path="CRMEducationNEnglishLanguage.js" />
// <reference path="CRMApplicationSettings.js" />



var CRMAdditionalInformationManager = {


}

var CRMAdditionalInformationHelper = {

  initAdditionalInformation: function () {
    CRMAdditionalInformationHelper.initializeAdditionalReferenceSummaryGrid();
    CRMAdditionalInformationHelper.initializeAdditionalDocumentsSummaryGrid();
  },


  initializeAdditionalReferenceSummaryGrid: function () {
    const gridOption = {
      dataSource: new kendo.data.DataSource({
        data: [],
        schema: {
          model: {
            id: "ApplicantRefferenceId",
            fields: {
              ApplicantRefferenceId: { type: "number", editable: false, nullable: true },
              Name: { type: "string" },
              Designation: { type: "string" },
              EmailID: { type: "email" },
              PhoneNo: { type: "string" },
              FaxNo: { type: "string" },
              Address: { type: "string" },
              City: { type: "string" },
              State: { type: "string" },
              Country: { type: "string" },
              PostOrZipCode: { type: "string" },
            }
          }
        }
      }),
      toolbar: ["create"],
      scrollable: true,
      resizable: true,
      width: "400px",
      columns: CRMAdditionalInformationHelper.generateAdditionalReferenceSummaryColumn(),
      editable: { model: "inline" },
      navigatable: true,
      selectable: true,
    };

    $("#gridAdditionalReferenceSummary").kendoGrid(gridOption);
    const gridInstance = $("#gridAdditionalReferenceSummary").data("kendoGrid");
    if (gridInstance) {
      //const dataSource = CRMEducationNEnglishLanguagManager.educationSummaryDataSource();
    }
  },

  generateAdditionalReferenceSummaryColumn: function () {
    return [
      { field: "ApplicantRefferenceId", title: "ApplicantRefferenceId", hidden: true },
      { field: "Name", title: "Name", width: "200px" },
      { field: "Designation", title: "Designation", width: "200px" },
      { field: "EmailID", title: "Email ID", width: "150px" },
      { field: "PhoneNo", title: "Phone No", width: "150px" },
      { field: "FaxNo", title: "Fax No", width: "150px" },
      { field: "Address", title: "Address", width: "150px" },
      { field: "City", title: "City", width: "150px" },
      { field: "State", title: "State", width: "150px" },
      { field: "Country", title: "Country", width: "150px" },
      { field: "PostOrZipCode", title: "Post/Zip Code", width: "150px" },
      { command: "destroy", title: "Action", width: "100px" }
    ];
  },


  initializeAdditionalDocumentsSummaryGrid: function () {
    const gridOption = {
      dataSource: new kendo.data.DataSource({
        data: [],
        schema: {
          model: {
            id: "DocumentId",
            fields: {
              DocumentId: { type: "number", editable: false, nullable: true },
              HrrecordId: { type: "number" },
              Title: { type: "string" },
              UploadFile: { type: "string" },
            }
          }
        }
      }),
      toolbar: ["create"],
      scrollable: true,
      resizable: true,
      width: "400px",
      columns: CRMAdditionalInformationHelper.generateAdditionalDocumentsSummaryColumn(),
      editable: { model: "inline" },
      navigatable: true,
      selectable: true,
    };

    $("#griAdditionalDocumentsSummary").kendoGrid(gridOption);
    const gridInstance = $("#gridAdditionalReferenceSummary").data("kendoGrid");
    if (gridInstance) {
      //const dataSource = CRMEducationNEnglishLanguagManager.educationSummaryDataSource();
    }
  },

  generateAdditionalDocumentsSummaryColumn: function () {
    return [
      { field: "DocumentId", title: "DocumentId", hidden: true },
      { field: "HrrecordId", title: "HrrecordId", hidden: true },
      { field: "Title", title: "Title", width: "400px" },
      { field: "UploadFile", title: "UploadFile", width: "200px" },
      { command: "destroy", title: "Action", width: "100px" }
    ];
  },

}