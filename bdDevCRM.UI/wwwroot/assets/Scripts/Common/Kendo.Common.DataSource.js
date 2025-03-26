var KendoDataSourceManager = {

	getAutoCompleteDataSource: function (url) {

		var dataSource = new kendo.data.DataSource({
			type: "json",
			pageSize: 20,
			serverFiltering: true,
			serverPaging: true,
			transport: {
				read: url,

				type: "POST",

				dataType: "json",

				contentType: "application/json; charset=utf-8"
			},
			parameterMap: function (options) {

				return kendo.stringify(options);

			}
		});

		return dataSource;
	},

	getComboBoxDataSource: function (url) {

		var dataSource = new kendo.data.DataSource({
			transport: {
				read: {
					url: url,
					dataType: "json",
					contentType: "application/json; charset=utf-8",
					type: "POST",
				}
			}
		});

		return dataSource;
	},

	getGridDataSource: function (url, pageSize,models) {
		var gridDataSource = new kendo.data.DataSource({
			type: "json",
			serverPaging: true,

			serverSorting: true,

			serverFiltering: true,

			allowUnsort: true,

			pageSize: pageSize,

			transport: {
				read: {
					url: url,

					type: "POST",

					dataType: "json",

					contentType: "application/json; charset=utf-8"
				},

				parameterMap: function (options) {

					return JSON.stringify(options);

				}
			},

			schema: {
               data: "Items", total: "TotalCount",

			}

		});

		return gridDataSource;
	},

	getBasicGridDataSource: function (url) {
	    var gridDataSource = new kendo.data.DataSource({
	        type: "json",
	        serverPaging: true,
	        serverSorting: true,
	        serverFiltering: true,
	        allowUnsort: true,
	        pageSize: 100,
	        transport: {
	            read: {
	                url: url,
	                type: "POST",
	                dataType: "json",
	                contentType: "application/json; charset=utf-8"
	            },

	            parameterMap: function (options) {
	                return JSON.stringify(options);
	            }
	        },

	        schema: {
	            data: "Items", total: "TotalCount",
	        }
	    });

	    return gridDataSource;
	},
	 


};
 