/*=========================================================
 * Loading Manager
 * File: LoadingManager.js
 * Description: Manages loading indicators
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var LoadingManager = {
  counter: 0,
  loaderElement: null,
  
  // Initialize loader element
  init: function() {
    if (!this.loaderElement) {
      // Create loader element if doesn't exist
      this.loaderElement = $('<div id="globalLoader" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;"><div class="spinner-border text-light" role="status"><span class="sr-only">Loading...</span></div></div>');
      $('body').append(this.loaderElement);
    }
  },
  
  // Show loading indicator
  show: function(message = "Loading...") {
    this.init();
    this.counter++;
    
    if (this.counter === 1) {
      // Show Kendo progress indicator
      if (typeof kendo !== 'undefined') {
        kendo.ui.progress($("body"), true);
      }
      
      // Show custom loader
      if (this.loaderElement) {
        this.loaderElement.css('display', 'flex');
      }
    }
  },
  
  // Hide loading indicator
  hide: function() {
    this.counter--;
    
    if (this.counter <= 0) {
      this.counter = 0;
      
      // Hide Kendo progress indicator
      if (typeof kendo !== 'undefined') {
        kendo.ui.progress($("body"), false);
      }
      
      // Hide custom loader
      if (this.loaderElement) {
        this.loaderElement.hide();
      }
    }
  },
  
  // Wrap async operation with loading indicator
  wrap: async function(promise, message = "Loading...") {
    this.show(message);
    try {
      const result = await promise;
      return result;
    } finally {
      this.hide();
    }
  },

  // Force hide all loaders
  forceHide: function() {
    this.counter = 0;
    
    if (typeof kendo !== 'undefined') {
      kendo.ui.progress($("body"), false);
    }
    
    if (this.loaderElement) {
      this.loaderElement.hide();
    }
  }
};

// Auto-initialize on document ready
$(document).ready(function() {
  LoadingManager.init();
});
