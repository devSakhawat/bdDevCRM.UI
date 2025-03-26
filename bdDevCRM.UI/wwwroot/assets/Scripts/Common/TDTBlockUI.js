$(document).ready(function () {

    $("#TdtBlockUi").kendoWindow({
       title:false,
        resizeable: false,
        width: "30%",
        actions:false,
        modal: true,
        visible: false,
    });
});
var TdtBlockUI = {
    Start: function () {
       
        $("#TdtBlockUi").data("kendoWindow").open().center();
    },
    Close: function() {
        $("#TdtBlockUi").data("kendoWindow").close();
    }
};
