/// <reference path="accesscontrolpermission.js" />
/// <reference path="actionpermission.js" />
/// <reference path="group.js" />
/// <reference path="groupdetails.js" />
/// <reference path="groupinfo.js" />
/// <reference path="grouppermission.js" />
/// <reference path="groupsummary.js" />
/// <reference path="reportpermission.js" />
/// <reference path="statepermission.js" />

var menuArray = [];
var allmenuArray = [];
var gbmoduleId = 0;

var MenuPermissionManager = {

  renderMenuByModuleId: async function (moduleId) {
    debugger;
    //if (!moduleId) {
    //  return Promise.resolve([]);
    //}

    const serviceUrl = `/menus-by-moduleId/${moduleId}`;
    try {
      const response = await VanillaApiCallManager.get(baseApi, serviceUrl);
      if (response && response.IsSuccess === true) {
        return Promise.resolve(response.Data);
      } else {
        throw new Error("Failed to load data");
      }
    } catch (error) {
      console.log("Error loading data:" + error);
      VanillaApiCallManager.handleApiError(error);
      return Promise.reject(error);
    }
  },


};

var MenuPermissionHelper = {

  populateMenuTreeByModuleId: async function (moduleId) {
    $("#treeview").remove();

    $('#menuContent').html('<div id="treeview"></div>');
    var objMenuList = new Object();
    var newMenuArray = [];
    objMenuList = await MenuPermissionManager.renderMenuByModuleId(moduleId);
    gbmoduleId = moduleId;
    var treeview = $("#treeview").kendoTreeView({
      checkboxes: {
        checkChildren: true,
        template: "<input type='checkbox' id='chkMenu#= item.id #' onclick='MenuPermissionHelper.onSelect(#= item.id #,event)' />"

      },
      select: MenuPermissionHelper.changeMenu,
      dataSource: {},
      check: function (e) {
        this.expandRoot = e.node;
        this.expand($(this.expandRoot).find(".k-item").addBack());
      },
      dataBound: function (e) {
        if (this.expandRoot) {
          this.expand(e.node.find(".k-item"));
        }
      },
    }).data("kendoTreeView");
    treeview.remove();

    var chiledMenuArray = [];
    for (var i = 0; i < objMenuList.length; i++) {

      if (objMenuList[i].ParentMenu == null || objMenuList[i].ParentMenu == 0) {

        var objMenu = new Object();
        objMenu.id = objMenuList[i].MenuId;
        objMenu.itemId = objMenuList[i].MenuId;
        objMenu.text = objMenuList[i].MenuName;
        objMenu.value = objMenuList[i].MenuId;
        chiledMenuArray = MenuPermissionHelper.chiledMenu(objMenu, objMenuList[i].MenuId, objMenuList);
        objMenu.items = chiledMenuArray;
        objMenu.expanded = true;

        if (objMenu.items.length > 0) {

          //objMenu.spriteCssClass = "folder"
          //    ;
        }
        else {
          objMenu.spriteCssClass = "html";
          objMenu.items = [];

        }
        objMenu.itemValue = objMenuList[i].MenuId;
        newMenuArray.push(objMenu);
      }
    }

    var dataSource = new kendo.data.HierarchicalDataSource({
      data: newMenuArray
    });

    $("#treeview").data("kendoTreeView").setDataSource(dataSource);
    MenuPermissionHelper.autoSelectExistingMenu();
  },

  onSelect: function (menuId, e) {

    debugger;

    if ($("#chkMenu" + menuId).is(':checked') == true) {
      var alreadyadded = MenuPermissionHelper.checkAlreadyAddedthisMenu(menuId);
      if (alreadyadded == false) {
        MenuPermissionHelper.createMenuArray(menuId);

      }

      //Parent Menu Id Add in Array
      for (var p = 0; p < allmenuArray.length; p++) {
        if (allmenuArray[p].MenuId == menuId) {
          if (allmenuArray[p].ParentMenu != null) {
            alreadyadded = MenuPermissionHelper.checkAlreadyAddedthisMenu(allmenuArray[p].ParentMenu);
            if (alreadyadded == false) {
              MenuPermissionHelper.createMenuArray(allmenuArray[p].ParentMenu);
            }
          }
          break;
        }
      }

      //Chiled Menu Add in Array
      MenuPermissionHelper.checkChiledMenuArray(menuId);
      StateHelper.GetStatusByMenuId(menuId);
    }
    else {
      for (var j = 0; j < menuArray.length; j++) {
        if (menuArray[j].ReferenceID == menuId) {
          StateHelper.RemoveStatusByMenuId(menuId);

          menuArray.splice(j, 1);
        }
      }

      //Remove chiled Menu
      MenuPermissionHelper.removeChiledMenuArray(menuId);
    }
  },

  changeMenu: function (e) {
    debugger;
    var menuName = e.node.textContent.trim();
    var menuId = 0;
    for (var i = 0; i < allmenuArray.length; i++) {
      if (menuName == allmenuArray[i].MenuName.trim()) {
        menuId = allmenuArray[i].MenuId;
      }
    }

    MenuPermissionHelper.onSelect(menuId);
  },

  checkChiledMenuArray: function (menuId) {
    for (var ch = 0; ch < allmenuArray.length; ch++) {
      if (allmenuArray[ch].ParentMenu == menuId) {
        var alreadyadded = MenuPermissionHelper.checkAlreadyAddedthisMenu(allmenuArray[ch].MenuId);
        if (alreadyadded == false) {
          MenuPermissionHelper.createMenuArray(allmenuArray[ch].MenuId);
          MenuPermissionHelper.checkChiledMenuArray(allmenuArray[ch].MenuId);
        }
      }
    }
  },

  removeChiledMenuArray: function (menuId) {
    for (var r = 0; r < allmenuArray.length; r++) {
      if (allmenuArray[r].ParentMenu == menuId) {
        for (var cr = 0; cr < menuArray.length; cr++) {
          if (menuArray[cr].ReferenceID == allmenuArray[r].MenuId) {

            StateHelper.RemoveStatusByMenuId(menuArray[cr].ReferenceID);
            menuArray.splice(cr, 1);
            MenuPermissionHelper.removeChiledMenuArray(allmenuArray[r].MenuId);
          }
        }
      }
    }
  },

  createMenuArray: function (menuId) {
    var module = $("#cmbApplicationForModule").data("kendoComboBox");
    var obj = new Object();
    obj.ReferenceID = menuId;
    obj.ParentPermission = gbmoduleId;
    obj.PermissionTableName = "Menu";
    menuArray.push(obj);
  },

  checkAlreadyAddedthisMenu: function (menuId) {
    var alreadyadded = false;
    for (var i = 0; i < menuArray.length; i++) {
      if (menuArray[i].ReferenceID == menuId) {
        alreadyadded = true;
        break;
      }
    }
    return alreadyadded;
  },

  autoSelectExistingMenu: function () {
    for (var i = 0; i < allmenuArray.length; i++) {
      for (var j = 0; j < menuArray.length; j++) {
        if (allmenuArray[i].MenuId == menuArray[j].ReferenceID) {
          $('#chkMenu' + menuArray[j].ReferenceID).prop('checked', true);
          break;
        }
      }
    }

  },

  clearMenuPermission: function () {
    menuArray = [];
    gbmoduleId = 0;
    MenuPermissionHelper.populateMenuTreeByModuleId(0);
  },

  chiledMenu: function (objMenuOrginal, menuId, objMenuList) {
    var chiledMenuArray = [];
    var newMenuArray = [];
    for (var j = 0; j < objMenuList.length; j++) {
      if (objMenuList[j].ParentMenu == menuId) {
        var objMenu = new Object();
        objMenu = objMenuOrginal;
        var objChiledMenu = new Object();
        objChiledMenu.id = objMenuList[j].MenuId;
        objChiledMenu.itemId = objMenuList[j].MenuId;
        objChiledMenu.text = objMenuList[j].MenuName;
        objChiledMenu.itemValue = objMenuList[j].MenuId;
        objChiledMenu.expanded = true;
        //objChiledMenu.spriteCssClass = "html";
        chiledMenuArray = objMenuOrginal.items;
        if (chiledMenuArray == undefined || chiledMenuArray.length == 0) {
          chiledMenuArray = [];
        }
        else {
          objChiledMenu.expanded = true;
          //objChiledMenu.spriteCssClass = "folder";
        }
        newMenuArray = MenuPermissionHelper.chiledMenu(objChiledMenu, objMenuList[j].MenuId, objMenuList);
        chiledMenuArray.push(objChiledMenu);
        objMenu.items = chiledMenuArray;
      }
    }
    return chiledMenuArray;
  },

  createMenuPermission: function (objGroup) {
    objGroup.MenuList = menuArray;
    return objGroup;
  },

  populateExistingMenuInArray: function (objGroupPermission) {
    menuArray = [];
    for (var i = 0; i < objGroupPermission.length; i++) {
      if (objGroupPermission[i].PermissionTableName == "Menu") {
        var obj = new Object();
        obj.ReferenceID = objGroupPermission[i].ReferenceID;
        obj.ParentPermission = objGroupPermission[i].ParentPermission;
        obj.PermissionTableName = "Menu";
        menuArray.push(obj);
      }
    }
  },

  deleteFormMenuByModuleId: function (moduleId) {
    $("#treeview").remove();

    $('#menuContent').html('<div id="treeview"></div>');
    for (var i = 0; i < menuArray.length; i++) {
      if (menuArray[i].ParentPermission == moduleId) {
        stateHelper.RemoveStatusByMenuId(menuArray[i].ReferenceID);
        menuArray.splice(i, 1);
        i = i - 1;
      }
    }
  },


};