var isEncryptedPass = false;
var isSocialLoginEnable = 0;
var baseApi = "https://localhost:7290/bdDevs-crm";

$(document).ready(function () {
	loginHelper.initiateLoginPage();    
});

var loginHelper = {
	initiateLoginPage: function () {
		$("#btnLogin").click(function () { loginManager.LogInToSystem(); });
		$("#txtPassword").keypress(function (event) {
			if (event.keyCode == 13) {
				loginManager.LogInToSystem();
			} else {
				isEncryptedPass = false;
			}
		});

		$("#txtPassword").keyup(function (event) {
			isEncryptedPass = false;
		});

		$("#txtLoginId").keypress(function (event) {
			if (event.keyCode == 13) {

				if (isSocialLoginEnable == 1) {
					loginManager.loginIdVerifying();
				} else { loginManager.LogInToSystem(); }

				//
			} else {
				isEncryptedPass = false;
			}
		});
		$("#txtLoginId").change(function (event) {
			//loginManager.GetRememberData();
		});

		//loginManager.GetRememberData();


		if (isSocialLoginEnable == 1) {

			//var jsonData=AjaxManager.GetJsonResults('../home/GetSocialUser','');
			//if(jsonData!=null) {
			//	//$("#txtLoginId").val(user.OfficialEmail);
			//	//$("#txtName").val(user.UserName);
			//	loginManager.LoginOnSuccess(jsonData);
			//}
		}
  },

	getLoggedInUserInfo: function () {
		var token = localStorage.getItem("jwtToken");
		if (!token) {
			alert("Please log in first!");
			return;
		}

		//var serviceURL = baseApi + "/authentication/getUserInfo";
		var serviceURL = baseApi + "/user-info";

		$.ajax({
			url: serviceURL,
			type: "GET",
			headers: {
				"Authorization": "Bearer " + token,
				"Accept": "application/json"
			},
			success: function (response) {
				localStorage.setItem("userInfo", JSON.stringify(response));
				window.location.href = baseUI + "Home/Index";
			},
			error: function (xhr, status, error) {
				console.log("Failed to get user info: " + xhr.responseText);
				// null for message delay time
				Message.ErrorWithHeaderText('Login Failed', xhr.responseJSON?.statusCode + ": " + xhr.responseJSON?.message, null);
			}
		});
	}
};

var loginManager = {

	LogInToSystem: function () {
		debugger;
		var logonId = $("#txtLoginId").val();
		var pass = $("#txtPassword").val();
		console.log("Frontend Hosting URL: " + window.location.origin);
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

		var obj = {
			LoginId: logonId,
			Password: pass
		};

		var serviceURL = baseApi + "/login";

		$.ajax({
			url: serviceURL,
			type: "POST",
			async: false,
			contentType: "application/json",
			data: JSON.stringify(obj),
			success: function (response) {
				debugger;
				localStorage.setItem("jwtToken", response);
				loginHelper.getLoggedInUserInfo();
			},
			error: function (xhr, status, error) {
				// null for message delay time
				console.log(serviceURL);
				console.log(xhr);
				console.log(status);
				console.log(error);
				Message.ErrorWithHeaderText('Login Failed', xhr.responseJSON?.statusCode + ": " + xhr.responseJSON?.message,null);
			},
			//}
		});
	},

};

var loginLanguage = {
    
};