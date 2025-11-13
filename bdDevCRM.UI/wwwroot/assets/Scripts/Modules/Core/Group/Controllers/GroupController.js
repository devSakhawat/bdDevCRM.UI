/*=========================================================
 * Group Controller
 * File: GroupController.js
 * Description: Group business logic controller
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var GroupController = (function () {
  'use strict';

  /**
   * Constructor
   */
  function GroupController(options) {
    options = options || {};

    this.service = options.service || null;
    this.currentGroup = new GroupModel();

    // Get service from DI if not provided
    if (!this.service && typeof App !== 'undefined' && App.DI) {
      // We'll create GroupService later, for now use placeholder
      this.service = {
        getById: function (id) { return Promise.resolve(null); },
        create: function (data) { return Promise.resolve(null); },
        update: function (id, data) { return Promise.resolve(null); },
        delete: function (id) { return Promise.resolve(null); }
      };
    }

    if (typeof App !== 'undefined' && App.Logger) {
      App.Logger.debug('GroupController created');
    }
  }

  /**
   * Load group by ID
   */
  GroupController.prototype.loadGroup = async function (groupId) {
    try {
      if (typeof App !== 'undefined' && App.Logger) {
        App.Logger.info('Loading group:', groupId);
      }

      // For now, emit event with groupId
      // Later we'll fetch from API
      if (typeof App !== 'undefined' && App.EventBus) {
        App.EventBus.emit('group:loading', { groupId: groupId });
      }

      // TODO: Fetch from API when service is ready
      // const group = await this.service.getById(groupId);
      // this.currentGroup = new GroupModel(group);

      if (typeof App !== 'undefined' && App.EventBus) {
        App.EventBus.emit('group:loaded', {
          groupId: groupId,
          group: this.currentGroup
        });
      }

      return this.currentGroup;

    } catch (error) {
      if (typeof App !== 'undefined' && App.Logger) {
        App.Logger.error('Failed to load group:', error);
      }
      throw error;
    }
  };

  /**
   * Save group (create or update)
   */
  GroupController.prototype.saveGroup = async function (groupData) {
    try {
      // Create model from data
      var group = new GroupModel(groupData);

      // Validate
      var validation = group.validate();
      if (!validation.isValid) {
        if (typeof ToastrMessage !== 'undefined') {
          validation.errors.forEach(function (error) {
            ToastrMessage.showWarning(error);
          });
        }
        return null;
      }

      var isCreate = group.isNew();

      if (typeof App !== 'undefined' && App.Logger) {
        App.Logger.info(isCreate ? 'Creating group' : 'Updating group', group.toJSON());
      }

      // Emit saving event
      if (typeof App !== 'undefined' && App.EventBus) {
        App.EventBus.emit('group:saving', {
          group: group,
          isCreate: isCreate
        });
      }

      // TODO: Save to API when service is ready
      // let result;
      // if (isCreate) {
      //     result = await this.service.create(group.toJSON());
      // } else {
      //     result = await this.service.update(group.GroupId, group.toJSON());
      // }

      // For now, just update current group
      this.currentGroup = group;

      // Emit saved event
      if (typeof App !== 'undefined' && App.EventBus) {
        App.EventBus.emit('group:saved', {
          group: group,
          isCreate: isCreate
        });
      }

      return group;

    } catch (error) {
      if (typeof App !== 'undefined' && App.Logger) {
        App.Logger.error('Failed to save group:', error);
      }

      if (typeof App !== 'undefined' && App.EventBus) {
        App.EventBus.emit('group:save-failed', { error: error });
      }

      throw error;
    }
  };

  /**
   * Delete group
   */
  GroupController.prototype.deleteGroup = async function (groupId) {
    try {
      if (typeof App !== 'undefined' && App.Logger) {
        App.Logger.info('Deleting group:', groupId);
      }

      // Emit deleting event
      if (typeof App !== 'undefined' && App.EventBus) {
        App.EventBus.emit('group:deleting', { groupId: groupId });
      }

      // TODO: Delete from API when service is ready
      // await this.service.delete(groupId);

      // Clear current group if it's the deleted one
      if (this.currentGroup.GroupId === groupId) {
        this.currentGroup.clear();
      }

      // Emit deleted event
      if (typeof App !== 'undefined' && App.EventBus) {
        App.EventBus.emit('group:deleted', { groupId: groupId });
      }

    } catch (error) {
      if (typeof App !== 'undefined' && App.Logger) {
        App.Logger.error('Failed to delete group:', error);
      }
      throw error;
    }
  };

  /**
   * Clear current group
   */
  GroupController.prototype.clearGroup = function () {
    this.currentGroup.clear();

    if (typeof App !== 'undefined' && App.EventBus) {
      App.EventBus.emit('group:cleared');
    }

    if (typeof App !== 'undefined' && App.Logger) {
      App.Logger.debug('Group cleared');
    }
  };

  /**
   * Get current group
   */
  GroupController.prototype.getCurrentGroup = function () {
    return this.currentGroup;
  };

  /**
   * Validate group
   */
  GroupController.prototype.validateGroup = function (groupData) {
    var group = new GroupModel(groupData);
    return group.validate();
  };

  return GroupController;
})();