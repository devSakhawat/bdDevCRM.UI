/*=========================================================
 * Token Manager
 * File: TokenManager.js
 * Description: JWT Token management and refresh
 * Author: devSakhawat
 * Date: 2025-11-08
=========================================================*/

var TokenManager = {
  
  // Refresh the JWT token
  refreshToken: async function() {
    try {
      const response = await fetch(AppConfig.getApiUrl() + "/refresh-token", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AppConfig.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.Token) {
          AppConfig.setToken(data.Token);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  },

  // Check if token is expired
  isTokenExpired: function() {
    const token = AppConfig.getToken();
    if (!token) return true;

    try {
      // Decode JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // Check if token expires in next 5 minutes
      return currentTime >= (expiryTime - (5 * 60 * 1000));
    } catch (error) {
      console.error("Error parsing token:", error);
      return true;
    }
  },

  // Check token and refresh if needed
  checkAndRefresh: async function() {
    if (this.isTokenExpired()) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        // Redirect to login
        this.redirectToLogin();
        return false;
      }
    }
    return true;
  },

  // Redirect to login page
  redirectToLogin: function() {
    AppConfig.clearStorage();
    ToastrMessage.showWarning("Your session has expired. Please login again.");
    setTimeout(() => {
      window.location.href = AppConfig.ui.baseUrl + "/Home/Login";
    }, 1500);
  },

  // Get user info from token
  getUserInfoFromToken: function() {
    const token = AppConfig.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.sub || payload.userId,
        username: payload.unique_name || payload.username,
        email: payload.email,
        roles: payload.role || []
      };
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  },

  // Check if user has specific role
  hasRole: function(roleName) {
    const userInfo = this.getUserInfoFromToken();
    if (!userInfo || !userInfo.roles) return false;

    if (Array.isArray(userInfo.roles)) {
      return userInfo.roles.includes(roleName);
    }
    return userInfo.roles === roleName;
  }
};
