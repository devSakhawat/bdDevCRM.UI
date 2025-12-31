/*=========================================================
 * Debug Helper
 * File: debug-helper.js
 * Description: Debugging utilities for development
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

(function () {
  'use strict';

  // Only enable in development
  if (!AppConfig.isDevelopment()) {
    return;
  }

  /**
   * Get Group Module info
   */
  window.getGroupModule = function () {
    if (typeof App === 'undefined') {
      console.error('App not available');
      return null;
    }

    var module = App.getModule('Group');
    if (!module) {
      console.error('Group module not found');
      return null;
    }

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #9C27B0');
    console.log('%c   Group Module Information', 'color: #9C27B0; font-size: 14px; font-weight: bold');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #9C27B0');

    console.log('Name:', module.config.name);
    console.log('Version:', module.config.version);
    console.log('Author:', module.config.author);
    console.log('Initialized:', module.isInitialized());

    console.log('\nComponents:');
    console.log('  - Summary:', module.getComponent('summary'));
    console.log('  - Details:', module.getComponent('details'));
    console.log('  - Info:', module.getComponent('info'));

    console.log('\n🎮 Controller:');
    console.log(module.getController());

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #9C27B0');

    return module;
  };

  /**
   * Test Group Module
   */
  window.testGroupModule = function () {
    console.log('%c🧪 Testing Group Module...', 'color: #FF9800; font-size: 12px');

    var module = App.getModule('Group');
    if (!module) {
      console.error('Group module not found');
      return;
    }

    console.log('Module found');
    console.log('Initialized:', module.isInitialized());

    // Test components
    var summary = module.getComponent('summary');
    var details = module.getComponent('details');
    var info = module.getComponent('info');

    console.log('Summary component:', summary ? 'OK' : 'MISSING');
    console.log('Details component:', details ? 'OK' : 'MISSING');
    console.log('Info component:', info ? 'OK' : 'MISSING');

    // Test controller
    var controller = module.getController();
    console.log('Controller:', controller ? 'OK' : 'MISSING');

    // Test events
    console.log('\nTesting EventBus...');
    var testEventReceived = false;

    App.EventBus.on('test:group', function (data) {
      testEventReceived = true;
      console.log('Event received:', data);
    });

    App.EventBus.emit('test:group', { message: 'Test from Group Module' });

    if (testEventReceived) {
      console.log('EventBus working');
    } else {
      console.error('EventBus not working');
    }

    App.EventBus.off('test:group');

    console.log('%c🧪 Test Complete!', 'color: #FF9800; font-size: 12px');
  };

  /**
   * Get current group data
   */
  window.getCurrentGroup = function () {
    var module = App.getModule('Group');
    if (!module) {
      console.error('Group module not found');
      return null;
    }

    var controller = module.getController();
    if (!controller) {
      console.error('Controller not found');
      return null;
    }

    var currentGroup = controller.getCurrentGroup();
    console.log('Current Group:', currentGroup);
    return currentGroup;
  };

  /**
   * Clear group form
   */
  window.clearGroupForm = function () {
    var module = App.getModule('Group');
    if (!module) {
      console.error('Group module not found');
      return;
    }

    var controller = module.getController();
    if (controller) {
      controller.clearGroup();
      console.log('Group form cleared');
    }
  };

  /**
   * Simulate group save
   */
  window.testGroupSave = function () {
    var module = App.getModule('Group');
    if (!module) {
      console.error('Group module not found');
      return;
    }

    var infoComponent = module.getComponent('info');
    if (!infoComponent) {
      console.error('Info component not found');
      return;
    }

    var formData = infoComponent.getFormData();
    console.log('Form Data:', formData);

    var controller = module.getController();
    if (controller) {
      controller.saveGroup(formData).then(function (result) {
        console.log('Save test complete:', result);
      }).catch(function (error) {
        console.error('Save test failed:', error);
      });
    }
  };

  // Log available debug commands
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #00BCD4');
  console.log('%c   🐛 Debug Helper Loaded', 'color: #00BCD4; font-size: 12px; font-weight: bold');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #00BCD4');
  console.log('%cAvailable commands:', 'color: #00BCD4; font-weight: bold');
  console.log('  • getGroupModule()    - Get module info');
  console.log('  • testGroupModule()   - Test module functionality');
  console.log('  • getCurrentGroup()   - Get current group data');
  console.log('  • clearGroupForm()    - Clear group form');
  console.log('  • testGroupSave()     - Test group save');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #00BCD4');

})();