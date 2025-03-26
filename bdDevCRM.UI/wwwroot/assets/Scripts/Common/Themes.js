$(document).ready(function() {
    //$('#blueTheme').onmouseover(function () {
    //    $('#blueTheme').css('width', '10px');
    //});
	$("#themePanel").show();
	$("#themeSlider").show();
	
});





var ThemeManager = {
    IconWith:function () {
        //$('#blueTheme').css('height', '30px');
    },
// { text: "Default", value: "default" },
//{ text: "Green", value: "metro" },
//{ text: "Gray", value: "gray" },
//{ text: "Blue", value: "blueopal" },
//{ text: "Contrast", value: "highcontrast" },
//{ text: "Metro Black", value: "metroblack" },
//{ text: "Silver", value: "silver" },
//{ text: "Yellow", value: "yellow" },
//{ text: "Orange", value: "orange" },
//{ text: "Black", value: "black" }
    blueTheme: function() {
       
        themeHelper.themeUpdateForUser('default');
      

    },
    pinkTheme: function () {

        themeHelper.themeUpdateForUser('pink');


    },
    yellowTheme: function () {
        ////debugger;
        themeHelper.themeUpdateForUser('serelo');//yellowTheme/ cerelo


    },
    greenTheme: function () {

        themeHelper.themeUpdateForUser('green');//metro means Green theme

    },
    maroonTheme: function () {

        themeHelper.themeUpdateForUser('maroon');//metro means Green theme

    },

    contrastTheme: function () {

        themeHelper.themeUpdateForUser('highcontrast');
    },
    metroblackTheme: function () {

        themeHelper.themeUpdateForUser('metroblack'); 

    },
    silverTheme: function () {

        themeHelper.themeUpdateForUser('silver');

    },
    orangeTheme: function () {

        themeHelper.themeUpdateForUser('orange'); 
    },
    lightorange: function () {

        themeHelper.themeUpdateForUser('lightorange');
    },
   
    blankTheme: function () {

        themeHelper.themeUpdateForUser('default');

    },

    ifadTheme: function () {
        debugger;
        themeHelper.themeUpdateForUser('ifad');

    },
    
    themesPanelBar:function () {
        //$('#themeSlider').removeClass('displayNone').toggle(2000);
        //$('#themesPanelBar').addClass('displayNone');
        
    }
    
};
var themeHelper = {
    
    themeUpdateForUser: function (themeName) {
       
       

        
            var serviceUrL = '../Home/UpdateTheme';
            var strthemeName = "themeName=" + themeName;
            AjaxManager.SendJson(serviceUrL, strthemeName, onSuccess, onFailed);
        
       

        function onSuccess(jsonData) {
            debugger;
            if (jsonData == "Success") {
                window.location.reload();
            } else {

                AjaxManager.MsgBox('error', 'center', 'Error', "Theme not found" ,
                    [{
                        addClass: 'btn btn-primary',
                        text: 'Ok',
                        onClick: function ($noty) {
                            $noty.close();
                        }
                    }]);
            }
        }

        function onFailed(error) {
            AjaxManager.MsgBox('error', 'center', 'Error', error.statusText,
                [{
                    addClass: 'btn btn-primary',
                    text: 'Ok',
                    onClick: function ($noty) {
                        $noty.close();
                    }
                }]);
        }

    }
};

