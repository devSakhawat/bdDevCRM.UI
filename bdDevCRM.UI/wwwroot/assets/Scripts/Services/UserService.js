/*=========================================================
 * User Service
 * File: UserService.js
 * Description: Handles User and Authentication API calls
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var UserService = {
  
  // User login
  login: async function(username, password) {
    try {
      const response = await VanillaApiCallManager.post(
        AppConfig.getApiUrl(),
        AppConfig.endpoints.login,
        { Username: username, Password: password }
      );

      if (response && response.IsSuccess && response.Data) {
        // Store token
        AppConfig.setToken(response.Data.Token);
        
        // Store user info
        AppConfig.setUserInfo(response.Data.UserInfo);
        
        return response;
      }
      
      throw new Error(response.Message || "Login failed");
    } catch (error) {
      console.error("Login error:", error);
      VanillaApiCallManager.handleApiError(error);
      throw error;
    }
  },

  // User logout
  logout: async function() {
    try {
      await VanillaApiCallManager.post(
        AppConfig.getApiUrl(),
        AppConfig.endpoints.logout,
        {}
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear storage regardless of API response
      AppConfig.clearStorage();
      window.location.href = AppConfig.ui.baseUrl + "/Home/Login";
    }
  },

  // Get current user info
  getCurrentUser: function() {
    return AppConfig.getUserInfo();
  },

  // Check if user is logged in
  isLoggedIn: function() {
    return AppConfig.getToken() !== null;
  },

  // Get user profile
  getUserProfile: async function() {
    return await BaseManager.fetchData(
      "/user/profile",
      "Failed to load user profile"
    );
  },

  // Update user profile
  updateUserProfile: async function(profileData) {
    return await BaseManager.saveOrUpdate({
      id: profileData.UserId,
      endpoint: "/user/profile",
      data: JSON.stringify(profileData),
      confirmMsg: "Do you want to update your profile?",
      successMsg: "Profile updated successfully."
    });
  }
};
