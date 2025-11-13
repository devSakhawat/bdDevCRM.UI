/*=========================================================
 * Institute Type Service
 * File: InstituteTypeService.js
 * Description: Handles Institute Type API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var InstituteTypeService = GenericService.createService({
  entityName: "InstituteType",
  endpoint: "/crm-institutetype",
  summaryEndpoint: null, // No grid for institute types
  dropdownEndpoint: "/crm-institutetype-ddl",
  gridId: null,
  modelFields: {},
  useFormData: false,
  cacheTime: 30 * 60 * 1000 // 30 minutes (rarely changes)
});

// Backward compatibility
InstituteTypeService.getInstituteTypeDropdown = async function () {
  return await this.getDropdownCached();
};

InstituteTypeService.getInstituteTypeDropdownCached = async function () {
  return await this.getDropdownCached();
};