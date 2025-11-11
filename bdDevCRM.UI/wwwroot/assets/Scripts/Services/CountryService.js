/*=========================================================
 * Country Service
 * File: CountryService.js
 * Description: Handles Country API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CountryService = GenericService.createService({
  entityName: "Country",
  endpoint: "/country",
  summaryEndpoint: null,
  dropdownEndpoint: "/countryddl",
  gridId: null,
  modelFields: {},
  useFormData: false,
  cacheTime: 60 * 60 * 1000 // 1 hour (rarely changes)
});

// Backward compatibility
CountryService.getCountryDropdown = async function () {
  return await this.getDropdownCached();
};

CountryService.getCountryDropdownCached = async function () {
  return await this.getDropdownCached();
};