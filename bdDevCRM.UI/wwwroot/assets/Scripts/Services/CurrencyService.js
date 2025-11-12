/*=========================================================
 * Currency Service
 * File: CurrencyService.js
 * Description: Handles Currency API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CurrencyService = GenericService.createService({
  entityName: "Currency",
  endpoint: "/currency",
  summaryEndpoint: null,
  dropdownEndpoint: "/currencyddl",
  gridId: null,
  modelFields: {},
  useFormData: false,
  cacheTime: 60 * 60 * 1000 // 1 hour (rarely changes)
});

// Backward compatibility
CurrencyService.getCurrencyDropdown = async function () {
  return await this.getDropdownCached();
};

CurrencyService.getCurrencyDropdownCached = async function () {
  return await this.getDropdownCached();
};