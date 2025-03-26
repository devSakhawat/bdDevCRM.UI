$(document).ready(function () {
    fileBrowerhelper.init();

});

var fileBrowerhelper = {
    init: function () {
        AjaxManager.initPopupWindow('windFileBrowser', 'Photo Browser', '50%');
        KendoControlManager.kendoImageBrowser('imageBrowser');
    },
   

}