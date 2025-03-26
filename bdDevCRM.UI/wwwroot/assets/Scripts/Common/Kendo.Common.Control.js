var KendoControlManager = {

    AutoComplete: function (ctrlId, dataTextField, filter) {
        $("#" + ctrlId).kendoAutoComplete({
            dataTextField: dataTextField,
            filter: filter == null ? "startwith" : filter,
            minLength: 1,

        });
    },

    AutoCompleteWithData: function (ctrlId, dataTextField, placeholder, url) {
        $("#" + ctrlId).kendoAutoComplete({
            dataTextField: dataTextField,
            filter: "contains",
            suggest: true,
            placeholder: placeholder,
            minLength: 1,
            dataSource: {
                type: "json",
                pageSize: 20,
                serverFiltering: true,
                serverPaging: true,
                transport: {
                    read: {
                        url: url,
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8"
                    },

                    parameterMap: function (options) {

                        return JSON.stringify(options);

                    }
                },
            },
        });
    },

    GridPopupEdit: function (ctrlId, columns) {
        var grid = $("#" + ctrlId).kendoGrid({
            dataSource: [],
            pageable: {
                pageSize: 10,
                refresh: true
            },
            //height: 550,
            toolbar: ["create"],
            columns: columns,
            editable: "popup"
        }).data('kendoGrid');
        return grid;
    },

    KendoGridBasic: function (ctrlId, columns) {
        $("#" + ctrlId).kendoGrid({
            dataSource: [],
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

    KendoTemplateEditor: function (ctrlId) {

        $("#" + ctrlId).kendoEditor({
            tools: [
                "pdf",
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "justifyLeft",
                "justifyCenter",
                "justifyRight",
                "justifyFull",
                "insertUnorderedList",
                "insertOrderedList",
                "indent",
                "outdent",
                "createLink",
                "unlink",
                "insertImage",
                //"insertFile",
                "subscript",
                "superscript",
                "createTable",
                "addRowAbove",
                "addRowBelow",
                "addColumnLeft",
                "addColumnRight",
                "deleteRow",
                "deleteColumn",
                "viewHtml",
                "formatting",
                "cleanFormatting",
                "fontSize",
                "foreColor",
                "backColor",
                 "tableWizard", {
                     name: "fontName",
                     items: [{
                         text: "Courier",
                         value: "Courier"
                     }, {
                         text: "Times New Roman",
                         value: "Times New Roman"
                     }, {
                         text: "Trebuchet MS",
                         value: "Trebuchet MS"
                     },
                     {
                         text: "Calibri",
                         value: "Calibri"
                     }]
                 }

            ],
            pdf: {
                author: "A"
            },
            execute: function (e) {
                ////debugger;
                if (e.name == "createtable") {
                    var style = "<style>" +
                        "table,table td {outline: 0;border: 1px solid black;}" +
                        "table {width: 100%;border-spacing: 0;margin: 0 0 1em;}</style>";
                    var table = $($("#" + ctrlId).data("kendoEditor").body);
                    table.append(style);

                    //var win = $("<div id='editorTableWindow' style='display:none'>" +
                    //    "<label for='editorTableWidth'>Set table width</label> " +
                    //    "<input id='editorTableWidth' /> " +
                    //     "<label for='editorTableBorder'>Set table border</label> " +
                    //    "<input id='editorTableBorder' /> " +
                    //    "<button class='k-button' id='editorTableButton'>Apply</button> " +
                    //    "</div>'")
                    //    .appendTo(document.body)
                    //    .kendoWindow({
                    //        title: "Set table properties",
                    //        width: 600,
                    //        visible: false,
                    //        modal: true,
                    //        close: function (e) {
                    //            ////debugger;
                    //            var tableWidth = $("#editorTableWidth").data("kendoNumericTextBox").value();
                    //            var table = $($("#" + ctrlId).data("kendoEditor").body).find("table:not(.manipulated)");
                    //            table.width(tableWidth).addClass("manipulated");

                    //            var tableBorder = $("#editorTableBorder").data("kendoNumericTextBox").value();
                    //           var div = $($("#" + ctrlId).data("kendoEditor").body);
                    //           div.addClass("table-style");


                    //        },
                    //        deactivate: function (e) { e.sender.destroy(); }
                    //    }).data("kendoWindow");
                    //$("#editorTableWidth").kendoNumericTextBox({ min: 1, decimals: 0 });
                    //$("#editorTableBorder").kendoNumericTextBox({ min: 1, decimals: 0 });

                    //win.center().open();
                    //$("#editorTableButton").click(function (e) {
                    //    win.close();
                    //});
                }
            }


        });
        //////debugger;

        //$("#" + ctrlId).addClass('table-style');
    },

    KendoFileUpload: function (ctrlId, saveUrl, removeUrl) {
        $("#" + ctrlId).kendoUpload({
            upload: onUpload,
            multiple: false,
            success: onSuccess,
            error: onError,
            async: {
                saveUrl: saveUrl,
                removeUrl: removeUrl,
                autoUpload: true
            },
            localization: {
                select: "Browse Document"
            }
        });

        function onUpload(e) {
            var files = e.files;
            $.each(files, function () {
                if (Math.ceil(this.size / 1024) > 1024 * 5) //5MB limit
                {
                    Message.Warning("File size can be up to 5MB");
                } else {

                    if ((this.extension.toLowerCase() != ".pdf") && (this.extension.toLowerCase() != ".doc") && (this.extension.toLowerCase() != ".docx")) {
                        Message.Warning("Only .pdf/.docx/doc files can be uploaded.");
                        e.preventDefault();
                    }
                }
            });


        }

        function onSuccess(e) {

            var files = e.files;
            if (e.operation == "upload") {
                e.preventDefault();
            }
        }
        function onError(e) {
            var files = e.files;

            if (e.operation == "upload") {
                Message.Warning("Failed to uploaded " + files.length + " files");

            }
        }


    },

    KendoComboBox: function (ctrlId, dataTextField, dataValueField) {
        $("#" + ctrlId).kendoComboBox({
            placeholder: "Select",
            dataTextField: dataTextField,
            dataValueField: dataValueField,
            dataSource: []
        });
    },

    KendoGrid: function (ctlId, columns, url) {
        var dataSource = [];
        if (url != undefined) {
            dataSource = KendoDataSourceManager.getGridDataSource(url, 50);
        }
        $("#" + ctlId).kendoGrid({
            dataSource: dataSource,
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

    KendoDropDownList: function (ctrlId, dataTextField, dataValueField) {
        $("#" + ctrlId).kendoDropDownList({
            optionLabel: "Select",
            dataTextField: dataTextField,
            dataValueField: dataValueField,
            dataSource: [],

        });
    },

    initePanelBer: function (ctlDivId) {
        //var original = $("#" + ctlDivId).clone(true);
        //original.find(".k-state-active").removeClass("k-state-active");

        //$(".configuration input").change(function () {
        //    var panelBar = $("#" + ctlDivId),
        //        clone = original.clone(true);

        //    panelBar.data("kendoPanelBar").collapse($("#" + ctlDivId + " .k-link"));

        //    panelBar.replaceWith(clone);

        //    initPanelBar();
        //});

        var initPanelBar = function () {
            $("#" + ctlDivId).kendoPanelBar({ animation: { expand: { duration: 500, } } });
        };

        initPanelBar();

    },

    KendoDocumentTemplateEditor: function (ctrlId) {
        $("#" + ctrlId).kendoEditor({
            tools: [
         "bold", "italic", "underline", "strikethrough", {
             name: "fontName",
             items: [{
                 text: "Courier",
                 value: "Courier"
             }, {
                 text: "Times New Roman",
                 value: "Times New Roman"
             }, {
                 text: "Trebuchet MS",
                 value: "Trebuchet MS"
             },
             {
                 text: "Calibri",
                 value: "Calibri"
             }]
         }, "fontSize", "foreColor", "backColor", "justifyLeft", "justifyCenter", "justifyRight",
         "justifyFull", "insertUnorderedList", "insertOrderedList", "indent", "outdent", "formatBlock",
         "createLink", "unlink", "insertImage", "subscript", "superscript", "viewHtml"]
        }).data("kendoEditor");
        function onCustomToolClick(e) {
            var popupHtml =
                '<div class="k-editor-dialog k-popup-edit-form k-edit-form-container" style="width:auto;">' +
                  '<div style="padding: 0 1em;">' +
                    '<p><textarea cols="60" rows="10" style="width:90%"></textarea></p>' +
                  '</div>' +
                  '<div class="k-edit-buttons k-state-default">' +
                    '<button class="k-dialog-insert k-button k-primary">Insert</button>' +
                    '<button class="k-dialog-close k-button">Cancel</button>' +
                  '</div>' +
                '</div>';

            var editor = $(this).data("kendoEditor");

            // Store the editor range object
            // Needed for IE
            var storedRange = editor.getRange();

            // create a modal Window from a new DOM element
            var popupWindow = $(popupHtml)
            .appendTo(document.body)
            .kendoWindow({
                // modality is recommended in this scenario
                modal: true,
                width: 600,
                resizable: false,
                title: "Insert custom content",
                // ensure opening animation
                visible: false,
                // remove the Window from the DOM after closing animation is finished
                deactivate: function (e) { e.sender.destroy(); }
            }).data("kendoWindow")
            .center().open();

            // insert the new content in the Editor when the Insert button is clicked
            popupWindow.element.find(".k-dialog-insert").click(function () {
                var customHtml = popupWindow.element.find("textarea").val();
                editor.selectRange(storedRange);
                editor.exec("inserthtml", { value: customHtml });
            });

            // close the Window when any button is clicked
            popupWindow.element.find(".k-edit-buttons button").click(function () {
                // detach custom event handlers to prevent memory leaks
                popupWindow.element.find(".k-edit-buttons button").off();
                popupWindow.close();
            });
        }
    },

    kendoImageBrowser: function (ctrlId) {
        $("#" + ctrlId).kendoImageBrowser({
            transport: {
                read: "/Upload/Read",
                thumbnailUrl: "/Upload/Thumbnail",
                uploadUrl: "/Upload/UploadImage",
                imageUrl: "/Upload/RetrieveImage?path={0}"

            },
            schema: {
                model: {
                    fields: {
                        name: { field: "name" },
                        type: { field: "type" },
                        size: { field: "size" }


                    }
                }
            },
            change: function (e) {
                // get ListView selection

                var selectedItems = this._selectedItem();
                console.log(selectedItems);
            }
        });
    }




}