/*=========================================================
 * Group Model
 * File: GroupModel.js
 * Description: Group data model
 * Author: devSakhawat
 * Date: 2025-11-11
=========================================================*/

var GroupModel = (function () {
  'use strict';

  /**
   * Group Model Constructor
   */
  function GroupModel(data) {
    data = data || {};

    // Basic Info
    this.GroupId = data.GroupId || 0;
    this.GroupName = data.GroupName || '';
    this.IsDefault = data.IsDefault || 0;

    // Permissions
    this.ModuleList = data.ModuleList || [];
    this.MenuList = data.MenuList || [];
    this.AccessList = data.AccessList || [];
    this.StatusList = data.StatusList || [];
    this.ActionList = data.ActionList || [];
    this.ReportList = data.ReportList || [];

    // Metadata
    this.CreatedDate = data.CreatedDate || null;
    this.CreatedBy = data.CreatedBy || null;
    this.ModifiedDate = data.ModifiedDate || null;
    this.ModifiedBy = data.ModifiedBy || null;
  }

  /**
   * Convert to JSON
   */
  GroupModel.prototype.toJSON = function () {
    return {
      GroupId: this.GroupId,
      GroupName: this.GroupName,
      IsDefault: this.IsDefault,
      ModuleList: this.ModuleList,
      MenuList: this.MenuList,
      AccessList: this.AccessList,
      StatusList: this.StatusList,
      ActionList: this.ActionList,
      ReportList: this.ReportList
    };
  };

  /**
   * Validate model
   */
  GroupModel.prototype.validate = function () {
    var errors = [];

    if (!this.GroupName || this.GroupName.trim() === '') {
      errors.push('Group name is required');
    }

    if (this.ModuleList.length === 0) {
      errors.push('At least one module must be selected');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  /**
   * Clear model
   */
  GroupModel.prototype.clear = function () {
    this.GroupId = 0;
    this.GroupName = '';
    this.IsDefault = 0;
    this.ModuleList = [];
    this.MenuList = [];
    this.AccessList = [];
    this.StatusList = [];
    this.ActionList = [];
    this.ReportList = [];
  };

  /**
   * Check if new group
   */
  GroupModel.prototype.isNew = function () {
    return this.GroupId === 0 || !this.GroupId;
  };

  return GroupModel;
})();