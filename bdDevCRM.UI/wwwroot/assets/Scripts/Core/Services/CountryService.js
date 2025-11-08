/*=========================================================
 * Country Service
 * File: CountryService.js
 * Description: Handles Country API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var CountryService = {
  
  // Get country dropdown data
  getCountryDropdown: async function() {
    return await BaseManager.fetchData(
      AppConfig.endpoints.country,
      "Failed to load country list"
    );
  },

  // Get cached country dropdown
  getCountryDropdownCached: async function() {
    const cacheKey = 'country-dropdown';
    const cached = CacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.getCountryDropdown();
    CacheManager.set(cacheKey, data, 30 * 60 * 1000); // Cache for 30 minutes
    return data;
  }
};
