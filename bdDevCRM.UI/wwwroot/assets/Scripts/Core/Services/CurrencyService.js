/*=========================================================
 * Currency Service
 * File: CurrencyService.js
 * Description: Handles Currency API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CurrencyService = {
  
  // Get currency dropdown data
  getCurrencyDropdown: async function() {
    return await BaseManager.fetchData(
      AppConfig.endpoints.currency,
      "Failed to load currency list"
    );
  },

  // Get cached currency dropdown
  getCurrencyDropdownCached: async function() {
    const cacheKey = 'currency-dropdown';
    const cached = CacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.getCurrencyDropdown();
    CacheManager.set(cacheKey, data, 30 * 60 * 1000); // Cache for 30 minutes
    return data;
  }
};
