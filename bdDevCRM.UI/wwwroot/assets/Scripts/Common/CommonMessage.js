var Message = {

    Show: function (jsonResult, message, onComplete) {

        if (jsonResult == "Success") {
            AjaxManager.MsgBox('success', 'center', 'Success', message,
            [{
                addClass: 'btn btn-primary',
                text: 'OK',
                onClick: function ($noty) {
                    $noty.close();
                    onComplete();
                }
            }]);
        } else if (jsonResult == "Exists") {

            AjaxManager.MsgBox('warning', 'center', 'Warning', message,
            [{
                addClass: 'btn btn-primary',
                text: 'OK',
                onClick: function ($noty) {
                    $noty.close();
                }
            }]);
        } else if (jsonResult == "Warning") {

            AjaxManager.MsgBox('warning', 'center', 'Warning', message,
            [{
                addClass: 'btn btn-primary',
                text: 'OK',
                onClick: function ($noty) {
                    $noty.close();
                    onComplete();
                }
            }]);
        } else {
            AjaxManager.MsgBox('error', 'center', 'Error', jsonResult,
            [{
                addClass: 'btn btn-primary',
                text: 'OK',
                onClick: function ($noty) {
                    $noty.close();
                }
            }]);
        }

    },

    Confirm: function (message, onYes, onCancel) {
        AjaxManager.MsgBox('information', 'center', 'Confirmation', message,
        [{
            addClass: 'btn btn-primary',
            text: 'Yes',
            onClick: function ($noty) {
                $noty.close();
                onYes();
            }
        },
            {
                addClass: 'btn',
                text: 'No',
                onClick: function ($noty) {
                    $noty.close();
                    onCancel();
                }
            }
        ]);
    },

    Information: function (message) {
        AjaxManager.MsgBox('information', 'center', 'Information', message,
        [{
            addClass: 'btn btn-primary',
            text: 'OK',
            onClick: function ($noty) {
                $noty.close();

            }
        }]);
    },

    Warning: function (message) {
        AjaxManager.MsgBox('warning', 'center', 'Warning', message,
        [{
            addClass: 'btn btn-primary',
            text: 'OK',
            onClick: function ($noty) {
                $noty.close();
            }
        }]);
    },

    Error: function (message) {
        AjaxManager.MsgBox('error', 'center', 'Error', message,
        [{
            addClass: 'btn btn-primary',
            text: 'OK',
            onClick: function ($noty) {
                $noty.close();
            }
        }]);
    },

    Success: function (message) {
        AjaxManager.MsgBox('success', 'center', 'Success', message,
        [{
            addClass: 'btn btn-primary',
            text: 'OK',
            onClick: function ($noty) {
                $noty.close();
            }
        }]);
    },

    SuccessMessage: function (message, onYes) {
        AjaxManager.MsgBox('success', 'center', 'Success', message,
        [{
            addClass: 'btn btn-primary',
            text: 'OK',
            onClick: function ($noty) {
                $noty.close();
                onYes();
            }
        }]);
    },

    WarningMessage: function (message, onYes) {
        AjaxManager.MsgBox('warning', 'center', 'Warning', message,
        [{
            addClass: 'btn btn-primary',
            text: 'OK',
            onClick: function ($noty) {
                $noty.close();
                onYes();
            }
        }]);
    },

    Exists: function (message) {
        AjaxManager.MsgBox('warning', 'center', 'Warning', message,
        [{
            addClass: 'btn btn-primary',
            text: 'OK',
            onClick: function ($noty) {
                $noty.close();
            }
        }]);
    },



};

var MessageBox = {

    Show: function (jsonResult, msg, onComplete) {

        //(jsonResult.Operation == "Success"){}

        Message.Show(jsonResult.Operation, msg, onComplete);



    }
}