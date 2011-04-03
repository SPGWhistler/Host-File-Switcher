window.addEventListener("load", function(){
	hostFileSwitcher.init();
}, false);

var main;

var hostFileSwitcher = {
	init: function()
	{
		//Get a reference to the main module.
		main = this.loadSDKModule("main");
		this.mainHostFilesList = document.getElementById("hostfileswitcher-menu-popup1");
	},

	popupShowing: function()
	{
		//main.myNewFunc();
		this.updateHostFilesList(main.hostFiles);
		//main.main.editor.show();
	},

	loadSDKModule: function(module){
		return Components.classes["@mozilla.org/harness-service;1?id=jid0-WgoiC7ooIviowYVA4DUnwzlf994"]
			.getService().wrappedJSObject.loader.require(module);
	},

	updateHostFilesList: function(hostFiles, currentHostFileName)
	{
		//Disable the menu
		this.enableMainMenu(false);
		//Remove any items in the main menu already
		this.removeMenuItems();
		//Create new menu items
		if (typeof hostFiles === 'object')
		{
			var menuitem;
			var numberString;
			//@TODO Fix the access keys
			var j = 9;
			
			//Create a menu item for each host file...
			for (var i in hostFiles)
			{
				//Generate a "numberString" to prepend to the menu item name...
				numberString = (j > 0) ? j + '. ' : '';
				//Create the main menu item...
				menuitem = this.createMenuItem(numberString + i);
				if (j > 0)
				{
					menuitem.setAttribute('accesskey', j);
				}
				menuitem.setAttribute('type', 'radio');
				menuitem.setAttribute('name', 'hostfile');
				//@TODO Need to make this work with multiple host files.
				/*
				if (typeof currentHostFileName === 'string' && currentHostFileName == i)
				{
					menuitem.setAttribute('checked', 'true');
				}
				*/
				//menuitem.addEventListener("command", this.changeHostFileAction, false);
				this.mainHostFilesList.insertBefore(menuitem, this.mainHostFilesList.firstChild);
				
				//Create the edit menu item...
				/*
				menuitem = this.createMenuItem(numberString + curHostFileName);
				if ((i + 1) < 10)
				{
					menuitem.setAttribute('accesskey', (i + 1));
				}
				menuitem.setAttribute('filename', hostFiles[i].path);
				menuitem.setAttribute('nameonly', curHostFileName);
				menuitem.addEventListener("command", this.editFileAction, false);
				this.editHostFilesList.insertBefore(menuitem, this.editHostFilesList.firstChild);
				*/
				j--;
			}
		}
		//Enable menu
		this.enableMainMenu(true);
	},
	
	createMenuItem: function(label)
	{
		const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		var item = document.createElementNS(XUL_NS, "menuitem");
		item.setAttribute("label", label);
		return item;
	},

	/**
	 * Remove all of the menu items that have a tagName of 'menuitem'
	 * and an attribute 'name' of 'hostfile'.
	 * //Also remove all items from the edit menu.
	 */
	removeMenuItems: function()
	{
		var tmpList = new Array();
		var j = 0;
		for (var i = 0; i < this.mainHostFilesList.childNodes.length; i++)
		{
			if (this.mainHostFilesList.childNodes[i].tagName == 'menuitem' && this.mainHostFilesList.childNodes[i].getAttribute('name') == 'hostfile')
			{
				//This is a host file, add it to the list of items to remove.
				tmpList[j] = this.mainHostFilesList.childNodes[i];
				j++;
			}
		}
		//Loop through the list of items to remove and remove each of them...
		for (i = 0; i < tmpList.length; i++)
		{
			this.mainHostFilesList.removeChild(tmpList[i]);
		}
		/*
		//Remove any items in the edit menu already...
		while (this.editHostFilesList.firstChild) {
			this.editHostFilesList.removeChild(this.editHostFilesList.firstChild);
		}
		*/
	},
	
	/**
	 * Enable or disable the main menu.
	 * @param enable (bool)
	 */
	enableMainMenu: function(enable)
	{
		if (enable === true)
		{
			//Enable the main menu...
			document.getElementById('hostfileswitcher-menu').setAttribute('disabled', false);
		}
		else
		{
			//Disable the main menu...
			document.getElementById('hostfileswitcher-menu').setAttribute('disabled', true);
		}
	}
};
