/*=========================================================
 * Generic Service
 * File: GenericService.js
 * Description: Generic CRUD service for all entities
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var GenericService = {

  /**
   * Create a service instance for a specific entity
   * @param {Object} config - Configuration object
   * @param {string} config.entityName - Name of the entity (e.g., "Course", "Institute")
   * @param {string} config.endpoint - API endpoint (e.g., "/crm-course")
   * @param {string} config.summaryEndpoint - Summary/Grid endpoint (e.g., "/crm-course-summary")
   * @param {string} config.dropdownEndpoint - Dropdown endpoint (optional)
   * @param {string} config.gridId - Grid element ID (optional)
   * @param {Object} config.modelFields - Kendo model fields for grid (optional)
   * @param {boolean} config.useFormData - Use FormData for file uploads (default: false)
   * @param {number} config.cacheTime - Cache time in milliseconds (optional)
   * @returns {Object} Service instance with CRUD methods
   */
  createService: function (config) {
    const {
      entityName,
      endpoint,
      summaryEndpoint,
      dropdownEndpoint = null,
      gridId = null,
      modelFields = {},
      useFormData = false,
      cacheTime = null
    } = config;

    return {
      // Get grid data source
      getGridDataSource: function (customConfig = {}) {
        if (!summaryEndpoint) {
          console.error(`Summary endpoint not configured for ${entityName}`);
          return null;
        }

        const defaultConfig = {
          apiUrl: AppConfig.getApiUrl() + summaryEndpoint,
          requestType: "POST",
          async: true,
          modelFields: modelFields,
          pageSize: 20,
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          allowUnsort: true,
          schemaData: "Data.Items",
          schemaTotal: "Data.TotalCount"
        };

        return BaseManager.createGridDataSource({ ...defaultConfig, ...customConfig });
      },

      // Get by ID
      getById: async function (id) {
        return await BaseManager.
        (
          endpoint,
          id,
          `Failed to load ${entityName.toLowerCase()} details`
        );
      },

      // Get all (dropdown)
      getDropdown: async function () {
        if (!dropdownEndpoint) {
          console.error(`Dropdown endpoint not configured for ${entityName}`);
          return [];
        }

        return await BaseManager.fetchData(
          dropdownEndpoint,
          `Failed to load ${entityName.toLowerCase()} list`
        );
      },

      // Get dropdown with caching
      getDropdownCached: async function (customCacheTime = null) {
        if (!dropdownEndpoint) {
          console.error(`Dropdown endpoint not configured for ${entityName}`);
          return [];
        }

        const cacheKey = `${entityName}-dropdown`;
        const cached = CacheManager.get(cacheKey);

        if (cached) {
          return cached;
        }

        const data = await this.getDropdown();
        const ttl = customCacheTime || cacheTime || (10 * 60 * 1000); // Default 10 minutes
        CacheManager.set(cacheKey, data, ttl);
        return data;
      },

      // Create new entity
      create: async function (data, options = {}) {
        const {
          confirmMsg = `Do you want to save this ${entityName.toLowerCase()}?`,
          successMsg = `${entityName} saved successfully.`,
          onSuccess = null,
          onError = null
        } = options;

        const requestData = useFormData ? data : JSON.stringify(data);

        return await BaseManager.saveOrUpdate({
          id: 0,
          endpoint: endpoint,
          data: requestData,
          isFormData: useFormData,
          confirmMsg: confirmMsg,
          successMsg: successMsg,
          gridId: gridId,
          onSuccess: onSuccess,
          onError: onError
        });
      },

      // Update existing entity
      update: async function (id, data, options = {}) {
        const {
          confirmMsg = `Do you want to update this ${entityName.toLowerCase()}?`,
          successMsg = `${entityName} updated successfully.`,
          onSuccess = null,
          onError = null
        } = options;

        const requestData = useFormData ? data : JSON.stringify(data);

        return await BaseManager.saveOrUpdate({
          id: id,
          endpoint: endpoint,
          data: requestData,
          isFormData: useFormData,
          confirmMsg: confirmMsg,
          successMsg: successMsg,
          gridId: gridId,
          onSuccess: onSuccess,
          onError: onError
        });
      },

      // Delete entity
      delete: async function (id, options = {}) {
        const {
          itemName = entityName.toLowerCase(),
          onSuccess = null,
          onError = null
        } = options;

        return await BaseManager.deleteItem({
          id: id,
          endpoint: endpoint,
          itemName: itemName,
          gridId: gridId,
          onSuccess: onSuccess,
          onError: onError
        });
      },

      // Custom GET request
      customGet: async function (customEndpoint, errorMsg = null) {
        return await BaseManager.fetchData(
          `${endpoint}${customEndpoint}`,
          errorMsg || `Failed to fetch ${entityName.toLowerCase()} data`
        );
      },

      // Custom POST request
      customPost: async function (customEndpoint, data, errorMsg = null) {
        try {
          const response = await VanillaApiCallManager.post(
            AppConfig.getApiUrl(),
            `${endpoint}${customEndpoint}`,
            data
          );

          if (response && response.IsSuccess === true) {
            return response.Data;
          }
          throw new Error(errorMsg || `Failed to process ${entityName.toLowerCase()} request`);
        } catch (error) {
          console.error(`Custom POST error for ${entityName}:`, error);
          VanillaApiCallManager.handleApiError(error);
          throw error;
        }
      },

      // Clear cache for this entity
      clearCache: function () {
        CacheManager.clearByPattern(entityName);
      }
    };
  }
};