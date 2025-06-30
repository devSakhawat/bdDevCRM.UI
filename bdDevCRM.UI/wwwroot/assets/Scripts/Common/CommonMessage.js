var Message = {

  // Show a message based on the result type (Success, Exists, Warning, Error)
  Show: function (jsonResult, message, onComplete) {
    let msgBoxType, headerText;

    if (jsonResult === "Success") {
      msgBoxType = 'success';
      headerText = 'Success';
    } else if (jsonResult === "Exists" || jsonResult === "Warning") {
      msgBoxType = 'warning';
      headerText = 'Warning';
    } else {
      msgBoxType = 'error';
      headerText = 'Error';
    }

    AjaxManager.MsgBox(
      msgBoxType, // Message box type
      'center',   // Display position
      headerText, // Header text
      message,    // Main message
      [{
        addClass: 'btn btn-primary',
        text: 'OK',
        onClick: function () {
          onComplete?.(); // Call onComplete if it exists
        }
      }]
    );
  },

  // Confirm dialog with Yes/No buttons
  Confirm: function (message, onYes, onCancel) {
    AjaxManager.MsgBox(
      'information', // Message box type
      'center',      // Display position
      'Confirmation',// Header text
      message,       // Main message
      [
        {
          addClass: 'btn btn-primary',
          text: 'Yes',
          onClick: function () {
            onYes?.(); // Call onYes if it exists
          }
        },
        {
          addClass: 'btn',
          text: 'No',
          onClick: function () {
            onCancel?.(); // Call onCancel if it exists
          }
        }
      ]
    );
  },

  // Display an informational message
  Information: function (message) {
    AjaxManager.MsgBox(
      'info',      // Message box type
      'center',    // Display position
      'Information',// Header text
      message,     // Main message
      [{
        addClass: 'btn btn-primary',
        text: 'OK',
        onClick: function () {
          // No additional action needed
        }
      }]
    );
  },

  // Display a warning message
  Warning: function (message) {
    AjaxManager.MsgBox(
      'warning',   // Message box type
      'center',    // Display position
      'Warning',   // Header text
      message,     // Main message
      [{
        addClass: 'btn btn-primary',
        text: 'OK',
        onClick: function () {
          // No additional action needed
        }
      }]
    );
  },

  // Display an error message
  Error: function (headerText,message) {
    AjaxManager.MsgBox(
      'error',     // Message box type
      'center',    // Display position
      'Error',     // Header text
      message,     // Main message
      [{
        addClass: 'btn btn-primary',
        text: 'OK',
        onClick: function () {
          // No additional action needed
        }
      }]
    );
  },

  // Display an error message
  ErrorWithHeaderText: function (headerText,message,delayDuration) {
    AjaxManager.MsgBox(
      'error',     // Message box type
      'center',    // Display position
      headerText,     // Header text
      message,     // Main message
      [{
        addClass: 'btn btn-primary',
        text: 'OK',
        onClick: function () {
          // No additional action needed
        }
      }],
      delayDuration
    );
  },

  // Display a success message
  Success: function (message) {
    AjaxManager.MsgBox(
      'success',   // Message box type
      'center',    // Display position
      'Success',   // Header text
      message,     // Main message
      [{
        addClass: 'btn btn-primary',
        text: 'OK',
        onClick: function () {
          // No additional action needed
        }
      }]
    );
  },

  // Display a success message with a callback on OK
  SuccessMessage: function (message, onYes) {
    AjaxManager.MsgBox(
      'success',   // Message box type
      'center',    // Display position
      'Success',   // Header text
      message,     // Main message
      [{
        addClass: 'btn btn-primary',
        text: 'OK',
        onClick: function () {
          onYes?.(); // Call onYes if it exists
        }
      }]
    );
  },

  // Display a warning message with a callback on OK
  WarningMessage: function (message, onYes) {
    AjaxManager.MsgBox(
      'warning',   // Message box type
      'center',    // Display position
      'Warning',   // Header text
      message,     // Main message
      [{
        addClass: 'btn btn-primary',
        text: 'OK',
        onClick: function () {
          onYes?.(); // Call onYes if it exists
        }
      }]
    );
  },

  // Display a warning message for "Exists"
  Exists: function (message) {
    AjaxManager.MsgBox(
      'warning',   // Message box type
      'center',    // Display position
      'Warning',   // Header text
      message,     // Main message
      [{
        addClass: 'btn btn-primary',
        text: 'OK',
        onClick: function () {
          // No additional action needed
        }
      }]
    );
  }
};

var MessageBox = {

  Show: function (jsonResult, msg, onComplete) {

    //(jsonResult.Operation == "Success"){}

    Message.Show(jsonResult.Operation, msg, onComplete);



  }
}



//// calling function
//// this is only for showing operation success or faild so no need to pass title
//ToastrMessage.showToastrNotification({
//  preventDuplicates: true,
//  closeButton: true,
//  timeOut: 0, // Explicitly 0, progressBar will be false
//  //title: 'title will be here', 
//  message: 'This is message',
//  type: 'success / error / warning / info', 
//});
