/*=========================================================
 * Group Controller
 * File: GroupController.js
 * Description: Business logic for Group module
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

class GroupController {
  constructor(options = {}) {
    this.service = options.service;
    this.currentGroup = null;
  }

  // Load group by ID
  async loadGroup(groupId) {
    try {
      App.Logger.debug(`Loading group: ${groupId}`);

      const group = await this.service.getById(groupId);
      this.currentGroup = group;

      // Publish event
      App.EventBus.emit('group:loaded', { group: group });

      return group;
    } catch (error) {
      App.Logger.error('Failed to load group:', error);
      throw error;
    }
  }

  // Save or update group
  async saveGroup(groupData) {
    try {
      const isCreate = !groupData.GroupId || groupData.GroupId == 0;

      App.Logger.debug(`${isCreate ? 'Creating' : 'Updating'} group`, groupData);

      let result;
      if (isCreate) {
        result = await this.service.create(groupData);
      } else {
        result = await this.service.update(groupData.GroupId, groupData);
      }

      this.currentGroup = result;

      // Publish event
      App.EventBus.emit('group:saved', {
        group: result,
        isCreate: isCreate
      });

      return result;
    } catch (error) {
      App.Logger.error('Failed to save group:', error);
      throw error;
    }
  }

  // Delete group
  async deleteGroup(groupId) {
    try {
      App.Logger.debug(`Deleting group: ${groupId}`);

      await this.service.delete(groupId);

      // Publish event
      App.EventBus.emit('group:deleted', { groupId: groupId });

      this.currentGroup = null;
    } catch (error) {
      App.Logger.error('Failed to delete group:', error);
      throw error;
    }
  }

  // Validate group data
  validateGroup(groupData) {
    const errors = [];

    if (!groupData.GroupName || groupData.GroupName.trim() === '') {
      errors.push('Group name is required');
    }

    if (groupData.ModuleList && groupData.ModuleList.length === 0) {
      errors.push('At least one module must be selected');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Clear current group
  clearGroup() {
    this.currentGroup = null;
    App.EventBus.emit('group:cleared');
  }
}