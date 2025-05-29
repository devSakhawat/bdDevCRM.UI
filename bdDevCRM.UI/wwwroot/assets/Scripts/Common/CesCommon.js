

var cesCommonManager = {

	GetRecursiveInstitue: function () {
		var objList = AjaxManager.GetDataForDotnetCore(baseApi, "/Institute/GetRecursiveInstitue", "");
		return objList;

	},

	GetActiveInstitue: function () {
		var objList = AjaxManager.GetDataForDotnetCore(baseApi, "/Institute/GetInstitute", "");
		return objList;

	},

	GetActiveInstitueType: function () {
		var objList = AjaxManager.GetDataForDotnetCore(baseApi, "/InstituteType/GetInstituteType", "");
		return objList;

	},

	GetActiveBoard: function () {
		var objList = AjaxManager.GetDataForDotnetCore(baseApi, "/Board/GetBoard", "");
		return objList;

	},

	GetActiveDistrict: function () {
		var objList = AjaxManager.GetDataForDotnetCore(baseApi, "/District/GetDistrict", "");
		return objList;

	},

	GetActiveThana: function () {
		var objList = AjaxManager.GetDataForDotnetCore(baseApi, "/Thana/GetThana", "");
		return objList;

	},

	GetActiveModule: function (callback) {
		var jsonParams = "";
		var serviceUrl = "/modules";

		function onSuccess(jsonData) {
			console.log("API Response:", jsonData);
			if (callback) {
				callback(jsonData); 
			}
		}

		function onFailed(error) {
			console.log(error);
		}

		AjaxManager.GetDataForDotnetCore(baseApi, serviceUrl, jsonParams, onSuccess, onFailed);
	},

	GetActiveMenu: function () {
		debugger;
		var jsonParams = "";
		var serviceUrl = "/menus";

		// Success callback function
		function onSuccess(jsonData) {
			console.log("API Response:", jsonData);
			return jsonData;
		}

		// Failure callback function
		function onFailed(error) {

			console.log(error);
			//// Handle specific HTTP status codes
			//AjaxManager.MsgBox('error', 'center', 'Failed', error.status + ": " + error.statusText,
			//	[{
			//		addClass: 'btn btn-warning', text: 'Ok', onClick: function ($noty) {
			//			$noty.close();
			//		}
			//	}]);
		}

		AjaxManager.GetDataForDotnetCore(baseApi, serviceUrl, jsonParams, onSuccess, onFailed);

	},

	GetActiveStatusByMenuId: function (menuId) {
		var jsonParam = "menuId=" + menuId;
		var objList = AjaxManager.GetDataForDotnetCore(baseApi, "/WorkflowState/GetWorkflowStateByMenuId", jsonParam);
		return objList;

	},

	GetActiveBranchByInstritueId: function (instituteId) {
		var jsonParam = "instituteId=" + instituteId;
		var objList = AjaxManager.GetDataForDotnetCore(baseApi, "/Branch/GetActiveBranchByInstritueId", jsonParam);
		return objList;

	},

	GetUsersType: function () {
		var objList = AjaxManager.GetDataForDotnetCore(baseApi, "/UsersType/GetUsersType");
		return objList;

	},


	//GenerateBranchCombo: function (companyId) {
		//var objBranch = "";
		//var jsonParam = "companyId=" + companyId;
		//var serviceUrl = "../../Branch/GetBranchByCompanyIdForCombo/";
		//AjaxManager.GetJsonResult(serviceUrl, jsonParam, false, false, onSuccess, onFailed);

		//function onSuccess(jsonData) {
		//	objBranch = jsonData;
		//}
		//function onFailed(error) {
		//	window.alert(error.statusText);
		//}
		//return objBranch;


	generateBranchByCompany: function (companyId) {
		var jsonParams = $.param({
			companyId: companyId
		});
		var serviceUrl = "/branches-by-compnayId-for-combo/companyId/";

		return new Promise(function (resolve, reject) {
			function onSuccess(jsonData) {
				groups = jsonData;
				resolve(groups);
			}

			function onFailed(jqXHR, textStatus, errorThrown) {
				ToastrMessage.showToastrNotification({
					preventDuplicates: true,
					closeButton: true,
					timeOut: 0,
					message: jqXHR.responseJSON?.message + "(" + jqXHR.responseJSON?.statusCode + ")",
					type: 'error',
				});
				reject(errorThrown);
			}

			AjaxManager.GetDataForDotnetCoreAsync(baseApi, serviceUrl, jsonParams, true, false, onSuccess, onFailed);
		});
	},

	//GenerateBranchCombo: function (companyId, identity) {
	generateBranchByCompanyWithHtmlId: async function (companyId, identity) {
		//var branches = new Object();

		var branches = await cesCommonManager.generateBranchByCompany(companyId);
		$("#" + identity).kendoComboBox({
			placeholder: "Select Location",
			dataTextField: "BranchName",
			dataValueField: "BranchId",
			dataSource: branches
		});
	},
	
	

};

var cesCommonHelper = {

	GenerareHierarchyInstitueCombo: function (identity) {
		var objList = cesCommonManager.GetRecursiveInstitue();
		
		$("#" + identity).kendoComboBox({

			placeholder: "Select Institute",
			dataTextField: "InstituteName",
			dataValueField: "InstituteId",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}
		});
	},

	GenerareAllActiveInstituteCombo: function (identity) {
		// 
		var objList = cesCommonManager.GetActiveInstitue();
		$("#" + identity).kendoComboBox({

			placeholder: "Select Institute",
			dataTextField: "InstituteName",
			dataValueField: "InstituteId",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareAllActiveInstituteTypeCombo: function (identity) {
		// 
		var objList = cesCommonManager.GetActiveInstitueType();
		$("#" + identity).kendoComboBox({

			placeholder: "Select Type",
			dataTextField: "InstituteTypeName",
			dataValueField: "InstituteTypeId",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareAllActiveUsersTypeCombo: function (identity) {
		// 
		var objList = cesCommonManager.GetUsersType();
		$("#" + identity).kendoComboBox({

			placeholder: "Select Type",
			dataTextField: "UsersTypeName",
			dataValueField: "UsersTypeId",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareAllActiveBoardCombo: function (identity) {
		// 
		var objList = cesCommonManager.GetActiveBoard();

		$("#" + identity).kendoComboBox({

			placeholder: "Select Board",
			dataTextField: "BoardName",
			dataValueField: "BoardId",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareAllActiveDistrictCombo: function (identity) {
		// 
		var objList = cesCommonManager.GetActiveDistrict();

		$("#" + identity).kendoComboBox({

			placeholder: "Select District",
			dataTextField: "districtName",
			dataValueField: "districtId",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareAllActiveThanaCombo: function (identity) {
		// 
		var objList = cesCommonManager.GetActiveThana();

		$("#" + identity).kendoComboBox({

			placeholder: "Select Thana",
			dataTextField: "ThanaName",
			dataValueField: "ThanaId",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareStaticStatusDropDown: function (identity) {
		// 
		var objList = [{ text: "Active", value: "1" }, { text: "Inactive", value: "0" }];
		$("#" + identity).kendoDropDownList({

			placeholder: "Select Status",
			dataTextField: "text",
			dataValueField: "value",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareModuleComboBox: function (identity) {
		cesCommonManager.GetActiveModule(function (objList) {
			console.log(objList); 

			$("#" + identity).kendoComboBox({
				placeholder: "Select Module",
				dataTextField: "ModuleName",
				dataValueField: "ModuleId",
				dataSource: objList, 
				filter: "contains",
				animation: {
					close: {
						effects: "fadeOut zoom:out",
						duration: 300
					},
					open: {
						effects: "fadeIn zoom:in",
						duration: 300
					}
				}
			});
		});
	},

	GenerareMenuComboBox: function (identity) {
		// 
		var objList = cesCommonManager.GetActiveMenu();
		console.log(objList);

		$("#" + identity).kendoComboBox({

			placeholder: "Select Menu",
			dataTextField: "MenuName",
			dataValueField: "MenuId",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareStateComboBoxByMenuId: function (identity, menuId) {
		// 
		var objList = cesCommonManager.GetActiveStatusByMenuId(menuId);

		$("#" + identity).kendoComboBox({

			placeholder: "Select Status",
			dataTextField: "WorkflowStateName",
			dataValueField: "WorkflowStateId",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GetActiveBranchByInstritueId: function (identity, instituteId) {
		// 
		var objList = cesCommonManager.GetActiveBranchByInstritueId(instituteId);

		$("#" + identity).kendoComboBox({

			placeholder: "Select Branch",
			dataTextField: "BranchName",
			dataValueField: "BranchId",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	

	GenerareStaticQuickLinkDropDown: function (identity) {
		// 
		var objList = [{ text: "Yes", value: "1" }, { text: "No", value: "0" }];
		$("#" + identity).kendoDropDownList({

			placeholder: "Select Quick Link",
			dataTextField: "text",
			dataValueField: "value",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareStaticIsAutoTagApplicableDropDown: function (identity) {
		// 
		var objList = [{ text: "Yes", value: "1" }, { text: "No", value: "2" }];
		$("#" + identity).kendoDropDownList({

			placeholder: "Select Is Auto Tag Applicable?",
			dataTextField: "text",
			dataValueField: "value",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareStaticMenuTypeDropDown: function (identity) {
		// 
		var objList = [{ text: "Web", value: "1" }, { text: "App", value: "2" }, { text: "Both", value: "3" }];
		$("#" + identity).kendoDropDownList({

			placeholder: "Select Menu Type",
			dataTextField: "text",
			dataValueField: "value",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	validator: function (identity, identityMsg) {
		var data = [];
		var validator = $("#" + identity).kendoValidator().data("kendoValidator"),
			status = $("." + identityMsg);
		if (validator.validate()) {
			status.text("").addClass("valid");
			return true;
		} else {
			status.text("Oops! There is invalid data in the form.").addClass("invalid");
			return false;
		}

	},

	GenerareStaticYesNoDropDown: function (identity) {
		// 
		var objList = [{ text: "Yes", value: "1" }, { text: "No", value: "0" }];
		$("#" + identity).kendoDropDownList({

			placeholder: "Select Quick Link",
			dataTextField: "text",
			dataValueField: "value",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareStaticWorkflowDefinationDropDown: function (identity) {
		// 
		var objList = [{ text: "Is Draft", value: "1" }, { text: "Is Open", value: "2" }, { text: "Is Possible Close", value: "3" }, { text: "Is Close", value: "4" }, { text: "Is Destroyed", value: "5" }];
		$("#" + identity).kendoDropDownList({

			placeholder: "Select Workflow Defination",
			dataTextField: "text",
			dataValueField: "value",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareDefaultDashboardDropDown: function (identity) {
		// 
		var objList = [{ text: "Dashboard-1", value: "1" }, { text: "Dashboard-2", value: "2" }];
		$("#" + identity).kendoDropDownList({

			placeholder: "Select",
			dataTextField: "text",
			dataValueField: "value",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

	GenerareDefaultThemeDropDown: function (identity) {
		// 
		var objList = [{ text: "Default", value: "1" }, { text: "Blue", value: "2" }];
		$("#" + identity).kendoDropDownList({

			placeholder: "Select",
			dataTextField: "text",
			dataValueField: "value",
			dataSource: objList,
			filter: "contains",
			animation: {
				close: {
					effects: "fadeOut zoom:out",
					duration: 300
				},
				open: {
					effects: "fadeIn zoom:in",
					duration: 300
				}
			}

		});
	},

};