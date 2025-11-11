/*=========================================================
 * Group Info Component
 * File: GroupInfo.Component.js
 * Description: Group information form component
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

class GroupInfoComponent extends BaseComponent {
  constructor(options) {
    super(options);
    this.controller = options.controller;
    this.viewModel = new GroupInfoViewModel();
  }

  beforeInit() {
    App.Logger.debug('GroupInfoComponent: beforeInit');

    // Subscribe to events
    this.subscribe('group:loaded', this.onGroupLoaded.bind(this));
    this.subscribe('group:cleared', this.onGroupCleared.bind(this));
  }

  render() {
    // Modules already rendered by Razor
    // Just initialize Kendo widgets if needed
  }

  bindEvents() {
    // Bind form events
    $('#txtGroupName', this.$el).on('change', () => {
      this.viewModel.setGroupName($('#txtGroupName').val());
    });

    $('#chkIsDefault', this.$el).on('change', () => {
      this.viewModel.setIsDefault($('#chkIsDefault').is(':checked'));
    });

    // Module checkboxes
    this.$el.on('change', '[id^="chkModule"]', (e) => {
      const moduleId = $(e.target).attr('id').replace('chkModule', '');
      const checked = $(e.target).is(':checked');

      if (checked) {
        this.viewModel.addModule(moduleId);
      } else {
        this.viewModel.removeModule(moduleId);
      }

      // Publish event
      this.publish('module:toggled', {
        moduleId: moduleId,
        checked: checked
      });
    });
  }

  onGroupLoaded(data) {
    const group = data.group;

    // Update view model
    this.viewModel.setGroupId(group.GroupId);
    this.viewModel.setGroupName(group.GroupName);
    this.viewModel.setIsDefault(group.IsDefault == 1);

    // Update UI
    $('#hdnGroupId').val(group.GroupId);
    $('#txtGroupName').val(group.GroupName);
    $('#chkIsDefault').prop('checked', group.IsDefault == 1);
  }

  onGroupCleared() {
    this.viewModel.clear();

    // Clear UI
    $('#hdnGroupId').val('0');
    $('#txtGroupName').val('');
    $('#chkIsDefault').prop('checked', false);
    $('[id^="chkModule"]').prop('checked', false);
  }

  validate() {
    return this.viewModel.validate();
  }

  getData() {
    return this.viewModel.toJSON();
  }
}