/*=========================================================
 * Institute Type Service
 * File: InstituteTypeService.js
 * Description: Handles Institute Type API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var InstituteTypeService = {
  
  // Get institute type dropdown data
  getInstituteTypeDropdown: async function() {
    return await BaseManager.fetchData(
      AppConfig.endpoints.instituteType,
      "Failed to load institute type list"
    );
  },

  // Get cached institute type dropdown
  getInstituteTypeDropdownCached: async function() {
    const cacheKey = 'instituteType-dropdown';
    const cached = CacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.getInstituteTypeDropdown();
    CacheManager.set(cacheKey, data, 10 * 60 * 1000); // Cache for 10 minutes
    return data;
  }
};
