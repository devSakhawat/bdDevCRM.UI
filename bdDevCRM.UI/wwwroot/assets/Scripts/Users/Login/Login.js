
/*=========================================================
 * Login Page with Refresh Token Support
 * File: Login.js
 * Author: devSakhawat
 * Date: 2026-01-31
 * 
 * Features:
 * - Cookie-based refresh token
 * - Auto token refresh
 * - Proper error handling
 * - Token storage management
=========================================================*/

var isEncryptedPass = false;
var isSocialLoginEnable = 0;
var baseApi = "https://localhost:7290/bdDevs-crm";

$(document).ready(function () {
  // Initialize auth system
  if (typeof AuthManager !== 'undefined') {
    AuthManager.init({
      autoRefreshEnabled: true,
      refreshThresholdSeconds: 60,
      checkIntervalMs: 30000
    });
  }

  loginHelper.initiateLoginPage();
});

var loginHelper = {
  initiateLoginPage: function () {
    // Check if already logged in
    if (this.isAlreadyLoggedIn()) {
      console.log('[Login] User already logged in, redirecting...');
      window.location.href = baseUI + "Home/Index";
      return;
    }

    // Login button click
    $("#btnLogin").click(function () {
      loginManager.LogInToSystem();
    });

    // Password field - Enter key
    $("#txtPassword").keypress(function (event) {
      if (event.keyCode == 13) {
        event.preventDefault();
        loginManager.LogInToSystem();
      } else {
        isEncryptedPass = false;
      }
    });

    $("#txtPassword").keyup(function (event) {
      isEncryptedPass = false;
    });

    // Login ID field - Enter key
    $("#txtLoginId").keypress(function (event) {
      if (event.keyCode == 13) {
        event.preventDefault();
        if (isSocialLoginEnable == 1) {
          loginManager.loginIdVerifying();
        } else {
          // Move to password field
          $("#txtPassword").focus();
        }
      } else {
        isEncryptedPass = false;
      }
    });

    // Focus on login ID
    $("#txtLoginId").focus();

    console.log('[Login] Login page initialized');
  },

  /**
   * Check if user is already logged in
   */
  isAlreadyLoggedIn: function () {
    var token = localStorage.getItem("jwtToken");
    if (!token) {
      return false;
    }

    // Check if token is expired using TokenHelper
    if (typeof TokenHelper !== 'undefined') {
      return !TokenHelper.isExpired(token);
    }

    // Fallback: assume logged in if token exists
    return true;
  },

  /**
   * Get logged in user info after successful login
   */
  getLoggedInUserInfo: function () {
    var token = localStorage.getItem("jwtToken");
    if (!token) {
      console.error('[Login] No token found after login');
      alert("Login failed. Please try again.");
      return;
    }

    var serviceURL = baseApi + "/user-info";

    $.ajax({
      url: serviceURL,
      type: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      },
      xhrFields: {
        withCredentials: true // Enable cookies
      },
      success: function (response) {
        console.log('[Login] User info retrieved:', response);

        // Store user info
        localStorage.setItem("userInfo", JSON.stringify(response));

        // Start auto-refresh if AuthManager available
        if (typeof AuthManager !== 'undefined' && AuthManager.startAutoRefresh) {
          AuthManager.startAutoRefresh();
        }

        // Show success message
        if (typeof Message !== 'undefined' && Message.Success) {
          Message.Success('Login successful! Redirecting...');
        }

        // Redirect to home
        setTimeout(function () {
          window.location.href = baseUI + "Home/Index";
        }, 500);
      },
      error: function (xhr, status, error) {
        console.error('[Login] Failed to get user info:', xhr.responseText);

        var errorMessage = 'Failed to retrieve user information';
        if (xhr.responseJSON?.Message) {
          errorMessage = xhr.responseJSON.Message;
        } else if (xhr.responseJSON?.message) {
          errorMessage = xhr.responseJSON.message;
        }

        Message.ErrorWithHeaderText('Login Failed', errorMessage, null);

        // Clear invalid token
        localStorage.removeItem("jwtToken");
      }
    });
  }
};

var loginManager = {
  /**
   * Main login function
   */
  LogInToSystem: function () {
    console.log('[Login] Login process started');

    var logonId = $("#txtLoginId").val().trim();
    var pass = $("#txtPassword").val();

    // Validate login ID
    if (logonId === "") {
      $("#txtLoginId").focus();
      AjaxManager.MsgBox('warning', 'center', 'Warning', "Please enter Login ID!", [
        {
          addClass: 'btn btn-primary',
          text: 'Ok',
          onClick: function ($noty) {
            $noty.close();
          }
        }
      ]);
      return;
    }

    // Validate password
    if (pass === "") {
      $("#txtPassword").focus();
      AjaxManager.MsgBox('warning', 'center', 'Warning', "Please enter password!", [
        {
          addClass: 'btn btn-primary',
          text: 'Ok',
          onClick: function ($noty) {
            $noty.close();
          }
        }
      ]);
      return;
    }

    // Disable login button
    var $btnLogin = $("#btnLogin");
    $btnLogin.prop('disabled', true).val('Logging in...');

    // Prepare payload (lowercase to match backend DTO)
    var payload = {
      loginId: logonId,      // lowercase
      password: pass,        // lowercase
      isRememberMe: $("#chkRememberMe").is(':checked') || false
    };

    var serviceURL = baseApi + "/login";

    console.log('[Login] Sending request to:', serviceURL);
    console.log('[Login] Payload:', { loginId: logonId, password: '***' });

    $.ajax({
      url: serviceURL,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      xhrFields: {
        withCredentials: true // Critical: Enable cookies for refresh token
      },
      success: function (response) {
        console.log('[Login] Login successful:', response);

        // Extract access token from nested response
        var tokenData = response.Data || response.data || response;
        var accessToken = tokenData.AccessToken || tokenData.accessToken;
        var expiresIn = tokenData.ExpiresIn || tokenData.expiresIn || 900;

        if (!accessToken) {
          console.error('[Login] No access token in response');
          Message.ErrorWithHeaderText('Login Failed',
            'Invalid response from server. Please try again.', null);
          $btnLogin.prop('disabled', false).val('Sign in');
          return;
        }

        // Store access token
        localStorage.setItem("jwtToken", accessToken);

        // Store token expiry (optional but useful)
        if (typeof TokenStorage !== 'undefined') {
          TokenStorage.setAccessToken(accessToken, expiresIn);
        }

        console.log('[Login] Access token stored');

        // Get user info and redirect
        loginHelper.getLoggedInUserInfo();
      },
      error: function (xhr, status, error) {
        console.error('[Login] Login failed');
        console.error('[Login] Status:', xhr.status);
        console.error('[Login] Response:', xhr.responseText);
        console.error('[Login] Error:', error);

        // Re-enable login button
        $btnLogin.prop('disabled', false).val('Sign in');

        // Determine error message
        var errorMessage = 'Login failed. Please try again.';

        if (xhr.status === 0) {
          errorMessage = 'Cannot connect to server. Please check:\n' +
            '• Backend is running\n' +
            '• CORS is configured\n' +
            '• Network connection';
        } else if (xhr.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (xhr.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (xhr.responseJSON?.Message) {
          errorMessage = xhr.responseJSON.Message;
        } else if (xhr.responseJSON?.message) {
          errorMessage = xhr.responseJSON.message;
        }

        // Show error message
        Message.ErrorWithHeaderText('Login Failed', errorMessage, null);

        // Focus on password for retry
        $("#txtPassword").focus().select();
      }
    });
  },

  /**
   * Verify login ID (for social login - placeholder)
   */
  loginIdVerifying: function () {
    console.log('[Login] Social login not implemented');
  }
};

var loginLanguage = {};

console.log('%c[Login] ✓ Login page loaded', 'color: #4CAF50; font-weight: bold;');



















///*=========================================================
// * Login Page with Refresh Token Support
// * File: Login.js
// * Author: devSakhawat
// * Date: 2026-01-31
// * 
// * Features:
// * - Cookie-based refresh token
// * - Auto token refresh
// * - Proper error handling
// * - Token storage management
//=========================================================*/

//var isEncryptedPass = false;
//var isSocialLoginEnable = 0;
//var baseApi = "https://localhost:7290/bdDevs-crm";

//var LoginPage = (function () {
//  'use strict';

//  // ============================================================================
//  // PRIVATE STATE
//  // ============================================================================

//  var _elements = {
//    loginId: null,
//    password: null,
//    btnLogin: null,
//    rememberMe: null,
//    errorMessage: null,
//    loadingIndicator: null
//  };

//  var _state = {
//    isLoggingIn: false
//  };

//  // ============================================================================
//  // PRIVATE HELPER METHODS
//  // ============================================================================

//  /**
//   * Initialize DOM elements
//   * @private
//   */
//  function _initElements() {
//    _elements.loginId = $('#txtLoginId');
//    _elements.password = $('#txtPassword');
//    _elements.btnLogin = $('#btnLogin');
//    _elements.rememberMe = $('#chkRememberMe');
//    _elements.errorMessage = $('#errorMessage');
//    _elements.loadingIndicator = $('#loadingIndicator');

//    console.log('[LoginPage] DOM elements initialized');
//  }

//  /**
//   * Bind event listeners
//   * @private
//   */
//  function _bindEvents() {
//    // Login button click
//    _elements.btnLogin.on('click', function (e) {
//      e.preventDefault();
//      _handleLogin();
//    });

//    // Enter key press on password field
//    _elements.password.on('keypress', function (e) {
//      if (e.keyCode === 13) {
//        e.preventDefault();
//        _handleLogin();
//      }
//    });

//    // Enter key press on login ID field
//    _elements.loginId.on('keypress', function (e) {
//      if (e.keyCode === 13) {
//        e.preventDefault();
//        _elements.password.focus();
//      }
//    });

//    // Clear error on input
//    _elements.loginId.add(_elements.password).on('input', function () {
//      _clearError();
//    });

//    console.log('[LoginPage] Event listeners bound');
//  }

//  /**
//   * Validate login form
//   * @private
//   */
//  function _validateForm() {
//    var loginId = _elements.loginId.val().trim();
//    var password = _elements.password.val();

//    if (!loginId) {
//      _showError('Please enter your Login ID');
//      _elements.loginId.focus();
//      return false;
//    }

//    if (!password) {
//      _showError('Please enter your password');
//      _elements.password.focus();
//      return false;
//    }

//    if (password.length < 6) {
//      _showError('Password must be at least 6 characters');
//      _elements.password.focus();
//      return false;
//    }

//    return true;
//  }

//  /**
//   * Show error message
//   * @private
//   */
//  function _showError(message) {
//    if (_elements.errorMessage.length > 0) {
//      _elements.errorMessage.text(message).show();
//    } else {
//      // Fallback to Message utility
//      if (typeof Message !== 'undefined' && Message.ErrorWithHeaderText) {
//        Message.ErrorWithHeaderText('Login Failed', message, null);
//      } else {
//        alert(message);
//      }
//    }
//  }

//  /**
//   * Clear error message
//   * @private
//   */
//  function _clearError() {
//    if (_elements.errorMessage.length > 0) {
//      _elements.errorMessage.hide().text('');
//    }
//  }

//  /**
//   * Show loading state
//   * @private
//   */
//  function _showLoading() {
//    _state.isLoggingIn = true;
//    _elements.btnLogin.prop('disabled', true).text('Logging in...');

//    if (_elements.loadingIndicator.length > 0) {
//      _elements.loadingIndicator.show();
//    }
//  }

//  /**
//   * Hide loading state
//   * @private
//   */
//  function _hideLoading() {
//    _state.isLoggingIn = false;
//    _elements.btnLogin.prop('disabled', false).text('Login');

//    if (_elements.loadingIndicator.length > 0) {
//      _elements.loadingIndicator.hide();
//    }
//  }

//  /**
//   * Handle login process
//   * @private
//   */
//  function _handleLogin() {
//    console.log('[LoginPage] Login process started');

//    // Prevent double submission
//    if (_state.isLoggingIn) {
//      console.warn('[LoginPage] Login already in progress');
//      return;
//    }

//    // Validate form
//    if (!_validateForm()) {
//      return;
//    }

//    debugger;
//    // Get credentials
//    var loginId = _elements.loginId.val().trim();
//    var password = _elements.password.val();
//    var rememberMe = _elements.rememberMe.is(':checked');

//    // Show loading
//    _showLoading();
//    _clearError();

//    // Call authentication service
//    AuthenticationService.authenticate(loginId, password, rememberMe)
//      .then(function (result) {
//        console.log('[LoginPage] Authentication successful:', result);

//        // Save remember me preference
//        if (rememberMe) {
//          _saveRememberMe(loginId);
//        } else {
//          _clearRememberMe();
//        }

//        // Show success message
//        _showSuccess('Login successful! Redirecting...');

//        // Redirect to home/dashboard
//        setTimeout(function () {
//          _redirectToHome();
//        }, 500);
//      })
//      .catch(function (error) {
//        console.error('[LoginPage] Authentication failed:', error);

//        _hideLoading();

//        // Show error message
//        var errorMessage = error.message || 'Login failed. Please try again.';
//        _showError(errorMessage);

//        // Focus on password field for retry
//        _elements.password.focus().select();
//      });
//  }

//  /**
//   * Show success message
//   * @private
//   */
//  function _showSuccess(message) {
//    if (typeof Message !== 'undefined' && Message.Success) {
//      Message.Success(message);
//    } else {
//      console.log('[LoginPage] Success:', message);
//    }
//  }

//  /**
//   * Redirect to home page
//   * @private
//   */
//  function _redirectToHome() {
//    var homeUrl = '/Home/Index';

//    if (typeof AppConfig !== 'undefined' && AppConfig.getFrontendRoute) {
//      homeUrl = AppConfig.getFrontendRoute('home') || homeUrl;
//    } else if (typeof baseUI !== 'undefined') {
//      homeUrl = baseUI + 'Home/Index';
//    }

//    console.log('[LoginPage] Redirecting to:', homeUrl);
//    window.location.href = homeUrl;
//  }

//  /**
//   * Save remember me preference
//   * @private
//   */
//  function _saveRememberMe(loginId) {
//    try {
//      localStorage.setItem('rememberedLoginId', loginId);
//      console.log('[LoginPage] Remember me saved');
//    } catch (error) {
//      console.warn('[LoginPage] Failed to save remember me:', error);
//    }
//  }

//  /**
//   * Clear remember me preference
//   * @private
//   */
//  function _clearRememberMe() {
//    try {
//      localStorage.removeItem('rememberedLoginId');
//      console.log('[LoginPage] Remember me cleared');
//    } catch (error) {
//      console.warn('[LoginPage] Failed to clear remember me:', error);
//    }
//  }

//  /**
//   * Load remember me preference
//   * @private
//   */
//  function _loadRememberMe() {
//    try {
//      var rememberedLoginId = localStorage.getItem('rememberedLoginId');

//      if (rememberedLoginId) {
//        _elements.loginId.val(rememberedLoginId);
//        _elements.rememberMe.prop('checked', true);
//        _elements.password.focus();
//        console.log('[LoginPage] Remember me loaded');
//      } else {
//        _elements.loginId.focus();
//      }
//    } catch (error) {
//      console.warn('[LoginPage] Failed to load remember me:', error);
//      _elements.loginId.focus();
//    }
//  }

//  /**
//   * Check for stored login message
//   * @private
//   */
//  function _checkLoginMessage() {
//    try {
//      var message = sessionStorage.getItem('login_message');

//      if (message) {
//        _showError(message);
//        sessionStorage.removeItem('login_message');
//      }
//    } catch (error) {
//      console.warn('[LoginPage] Failed to check login message:', error);
//    }
//  }

//  /**
//   * Check if already logged in
//   * @private
//   */
//  function _checkExistingSession() {
//    if (AuthenticationService.isAuthenticated()) {
//      console.log('[LoginPage] User already logged in, redirecting...');
//      _redirectToHome();
//      return true;
//    }
//    return false;
//  }

//  // ============================================================================
//  // PUBLIC API
//  // ============================================================================

//  return {
//    /**
//     * Initialize login page
//     */
//    init: function () {
//      console.log('[LoginPage] Initializing...');

//      // Check if already logged in
//      if (_checkExistingSession()) {
//        return;
//      }

//      // Initialize DOM elements
//      _initElements();

//      // Bind events
//      _bindEvents();

//      // Load remember me
//      _loadRememberMe();

//      // Check for login message
//      _checkLoginMessage();

//      console.log('[LoginPage] Initialization complete');
//    },

//    /**
//     * Programmatically trigger login (for testing)
//     * @param {string} loginId - Login ID
//     * @param {string} password - Password
//     */
//    login: function (loginId, password) {
//      _elements.loginId.val(loginId);
//      _elements.password.val(password);
//      _handleLogin();
//    }
//  };
//})();

//// ============================================================================
//// INITIALIZE ON DOCUMENT READY
//// ============================================================================

//$(document).ready(function () {
//  console.log('[LoginPage] Document ready');

//  // Initialize login page
//  LoginPage.init();
//});

//console.log('%c[LoginPage] ✓ Loaded', 'color: #4CAF50; font-weight: bold;');






//var isEncryptedPass = false;
//var isSocialLoginEnable = 0;
//var baseApi = "https://localhost:7290/bdDevs-crm";

//$(document).ready(function () {
//	loginHelper.initiateLoginPage();    
//});

//var loginHelper2 = {
//	initiateLoginPage: function () {
//		$("#btnLogin").click(function () { loginManager.LogInToSystem(); });
//		$("#txtPassword").keypress(function (event) {
//			if (event.keyCode == 13) {
//				loginManager.LogInToSystem();
//			} else {
//				isEncryptedPass = false;
//			}
//		});

//		$("#txtPassword").keyup(function (event) {
//			isEncryptedPass = false;
//		});

//		$("#txtLoginId").keypress(function (event) {
//			if (event.keyCode == 13) {

//				if (isSocialLoginEnable == 1) {
//					loginManager.loginIdVerifying();
//				} else { loginManager.LogInToSystem(); }

//				//
//			} else {
//				isEncryptedPass = false;
//			}
//		});
//		$("#txtLoginId").change(function (event) {
//			//loginManager.GetRememberData();
//		});

//		//loginManager.GetRememberData();


//		if (isSocialLoginEnable == 1) {

//			//var jsonData=AjaxManager.GetJsonResults('../home/GetSocialUser','');
//			//if(jsonData!=null) {
//			//	//$("#txtLoginId").val(user.OfficialEmail);
//			//	//$("#txtName").val(user.UserName);
//			//	loginManager.LoginOnSuccess(jsonData);
//			//}
//		}
//  },

//	getLoggedInUserInfo: function () {
//		var token = localStorage.getItem("jwtToken");
//		if (!token) {
//			alert("Please log in first!");
//			return;
//		}

//		//var serviceURL = baseApi + "/authentication/getUserInfo";
//		var serviceURL = baseApi + "/user-info";

//		$.ajax({
//			url: serviceURL,
//			type: "GET",
//			headers: {
//				"Authorization": "Bearer " + token,
//				"Accept": "application/json"
//			},
//			success: function (response) {
//				localStorage.setItem("userInfo", JSON.stringify(response));
//				window.location.href = baseUI + "Home/Index";
//			},
//			error: function (xhr, status, error) {
//				console.log("Failed to get user info: " + xhr.responseText);
//				// null for message delay time
//				Message.ErrorWithHeaderText('Login Failed', xhr.responseJSON?.statusCode + ": " + xhr.responseJSON?.message, null);
//			}
//		});
//	}
//};

//var loginManager = {

//	LogInToSystem: function () {
//		debugger;
//		var logonId = $("#txtLoginId").val();
//		var pass = $("#txtPassword").val();
//		console.log("Frontend Hosting URL: " + window.location.origin);
//		if (logonId === "") {
//			$("#txtLoginId").focus();
//			AjaxManager.MsgBox('warning', 'center', 'Warning', "Please enter Login ID!", [
//				{
//					addClass: 'btn btn-primary',
//					text: 'Ok',
//					onClick: function ($noty) {
//						$noty.close();
//					}
//				}
//			]);
//			return;
//		}
//		if (pass === "") {
//			$("#txtPassword").focus();
//			AjaxManager.MsgBox('warning', 'center', 'Warning', "Please enter password!", [
//				{
//					addClass: 'btn btn-primary',
//					text: 'Ok',
//					onClick: function ($noty) {
//						$noty.close();
//					}
//				}
//			]);
//			return;
//		}

//		var obj = {
//			LoginId: logonId,
//			Password: pass
//		};

//		var serviceURL = baseApi + "/login";

//		$.ajax({
//			url: serviceURL,
//			type: "POST",
//			async: false,
//			contentType: "application/json",
//			data: JSON.stringify(obj),
//			success: function (response) {
//				debugger;
//				localStorage.setItem("jwtToken", response.Data.AccessToken);
//				loginHelper.getLoggedInUserInfo();
//			},
//			error: function (xhr, status, error) {
//				// null for message delay time
//				console.log(serviceURL);
//				console.log(xhr);
//				console.log(status);
//				console.log(error);
//				Message.ErrorWithHeaderText('Login Failed', xhr.responseJSON?.statusCode + ": " + xhr.responseJSON?.message,null);
//			},
//			//}
//		});
//	},

//};

//var loginLanguage = {
    
//};