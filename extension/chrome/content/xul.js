window.addEventListener("load", function(){
	hostFileSwitcher.init();
}, false);

var hostFileSwitcher = {
	main: {},
	mainHostFilesList: {},

	/**
	 * Initialize the xul.
	 * Called from the window load event listener above.
	 */
	init: function()
	{
		var self = this;
		//Get a reference to the main module.
		this.main = this.loadSDKModule("main");
		this.mainHostFilesList = document.getElementById("hostfileswitcher-menu-popup1");
		//Add event handler for main host files menu
		document.getElementById('hostfileswitcher-menu').addEventListener("popupshowing", function(){
			self.menuShowing();
		}, false);
		//Add event handler for the manage host files item
		document.getElementById('managehostfiles').addEventListener("command", function(){
			self.manageHostFilesClicked();
		}, false);
	},

	/**
	 * Called when the user opens the main menu.
	 */
	menuShowing: function()
	{
		this.updateHostFilesList(this.main.getHostFiles());
	},

	/**
	 * Called when one of the host files is clicked.
	 * @param obj (object) The object the event occured on
	 */
	hostFileClicked: function(obj)
	{
		this.main.hostFileClicked(obj.getAttribute('hostFile'));
	},

	/**
	 * Called when the manage host files item is clicked.
	 */
	manageHostFilesClicked: function()
	{
		this.main.manageHostFilesClicked();
	},

	/**
	 * Load an SDK module.
	 * Used to get a reference to the main module.
	 * @param module (string) The module to get a reference to.
	 * @return object
	 */
	loadSDKModule: function(module){
		return Components.classes["@mozilla.org/harness-service;1?id=jid0-WgoiC7ooIviowYVA4DUnwzlf994"]
			.getService().wrappedJSObject.loader.require(module);
	},

	/**
	 * Update the menu with the list of host files.
	 * @param hostFiles (object)
	 */
	updateHostFilesList: function(hostFiles)
	{
		var self = this;
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
			var k;
			for (var i in hostFiles)
			{
				numberString = (j > 0) ? j + '. ' : '';
				menuitem = this.createMenuItem(numberString + i);
				if (j > 0)
				{
					menuitem.setAttribute('accesskey', j);
				}
				menuitem.setAttribute('type', 'check');
				menuitem.setAttribute('name', 'hostfile');
				menuitem.setAttribute('hostFile', i);
				if (hostFiles[i].selected === true)
				{
					menuitem.setAttribute('checked', 'true');
				}
				menuitem.addEventListener("command", function(){
					self.hostFileClicked(this);
				}, false);
				this.mainHostFilesList.insertBefore(menuitem, this.mainHostFilesList.firstChild);
				j--;
			}
		}
		//Enable menu
		this.enableMainMenu(true);
	},
	
	/**
	 * Create a menu item.
	 * Used to easily create new menu items.
	 * @param label (string) The menu item label
	 * @return object
	 */
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
