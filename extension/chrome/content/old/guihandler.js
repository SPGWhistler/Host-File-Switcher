var guiHandler = {
//@TODO Remove any hard references to other classes in this class.
//@TODO See if I really need the "filename" attribute of the menu items - if not,
//erase it from all places. I might only need it for the edit menu - not sure.

	mainHostFilesList: Object(),
	editHostFilesList: Object(),
	pleaseWaitWindow: null,
	changeHostFileAction: null,
	editFileAction: null,
	createNewHostFileAction: null,

	init: function(changeHostFileAction, editFileAction, createNewHostFileAction)
	{
		this.changeHostFileAction = changeHostFileAction;
		this.editFileAction = editFileAction
		this.createNewHostFileAction = createNewHostFileAction;
		this.mainHostFilesList = document.getElementById("hostfilehelper-menu-popup1");
		this.editHostFilesList = document.getElementById("hostfilehelper-menu-popup2");
		//Add event listener to the new host file menu item...
		document.getElementById('newhostfile').setAttribute('filename', '');
		document.getElementById('newhostfile').setAttribute('nameonly', '');
		document.getElementById('newhostfile').addEventListener("command", this.createNewHostFileAction, false);
	},

	createMenuItem: function(label)
	{
		const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		var item = document.createElementNS(XUL_NS, "menuitem");
		item.setAttribute("label", label);
		return item;
	},
		
	/**
	 * Remove any existing host files, and add new ones
	 * to the list.
	 * @PARAM hostFiles The array of host files from the dnsHandler.getListOfHostFiles method.
	 * @PARAM currentHostFileName The name of the currently select host file (no extension, no path).
	 */
	updateHostFilesList: function(hostFiles, currentHostFileName)
	{
		//Disable the menu.
		guiHandler.disableMainMenu(true);
		
		//Remove any items in the main menu already...
		this.removeHostFilesFromMenu();
		
		if (hostFiles)
		{
			var menuitem;
			var numberString;
			var curHostFileName;
			
			//Create a menu item for each host file...
			for (var i = (hostFiles.length - 1); i > -1; i--)
			{
				//Get the name (no extension or path) of this host file.
				curHostFileName = hostFiles[i].leafName.slice(0, -4);
				
				//Generate a "numberString" to prepend to the menu item name...
				if ((i + 1) < 10)
				{
					numberString = (i + 1) + '. ';
				}
				else
				{
					numberString = '';
				}
				
				//Create the main menu item...
				menuitem = this.createMenuItem(numberString + curHostFileName);
				if ((i + 1) < 10)
				{
					menuitem.setAttribute('accesskey', (i + 1));
				}
				menuitem.setAttribute('type', 'radio');
				menuitem.setAttribute('name', 'hostfiles');
				menuitem.setAttribute('filename', hostFiles[i].path);
				menuitem.setAttribute('nameonly', curHostFileName);
				if (currentHostFileName && currentHostFileName == curHostFileName)
				{
					menuitem.setAttribute('checked', 'true');
				}
				menuitem.addEventListener("command", this.changeHostFileAction, false);
				this.mainHostFilesList.insertBefore(menuitem, this.mainHostFilesList.firstChild);
				
				//Create the edit menu item...
				menuitem = this.createMenuItem(numberString + curHostFileName);
				if ((i + 1) < 10)
				{
					menuitem.setAttribute('accesskey', (i + 1));
				}
				menuitem.setAttribute('filename', hostFiles[i].path);
				menuitem.setAttribute('nameonly', curHostFileName);
				menuitem.addEventListener("command", this.editFileAction, false);
				this.editHostFilesList.insertBefore(menuitem, this.editHostFilesList.firstChild);
			}
		}
		//Enable menu.
		guiHandler.disableMainMenu(false);
	},
	
	/**
	 * Open an edit dialog, and return and array.
	 * This returns an associative array:
	 * 'status': 0 = user clicked cancel, 1 = user clicked save, -1 = user clicked delete
	 * 'fileNameOnly': The modified name of the file.
	 * 'fileContents': The modified contents of the file.
	 * If the user clicked Save or Delete, the fileNameOnly and fileContents will return
	 * the modified values. But if the user clicked Cancel, they will return to original
	 * values passed in to the function.
	 *
	 * @PARAM fileNameOnly string The name of the file (no path or extension).
	 * @PARAM fileContents string The file contents.
	 * @PARAM enableDelete bool True to enable the delete button, false to disable it.
	 * @PARAM dialogTitle string The title of the dialog.
	 * @PARAM dialogDescription string The description of the dialog.
	 * @RETURN array ('status': return status code, 'filenameonly': the new file name, 'filecontents': the new file contents)
	 */
	openEditWindow: function(fileNameOnly, fileContents, enableDelete, dialogTitle, dialogDescription)
	{
		//Setup default output values...
		var output = new Array();
		output['status'] = 0;
		output['fileNameOnly'] = fileNameOnly;
		output['fileContents'] = fileContents;
		
		//Set the params to pass to the new dialog...
		var params = {
			inn: {
				fileNameOnly: fileNameOnly, 
				fileContents: fileContents,
				enableDelete: enableDelete,
				dialogTitle: dialogTitle,
				dialogDescription: dialogDescription
			}, 
			output: null
		};
		
		//Open the dialog window...
		window.openDialog(
			"chrome://sample/content/editfile.xul", 
			"edit_file_dialog", 
			"modal,chrome,centerscreen,scrollbars=no,width=550,height=450", 
			params);
		
		//Return the output...
		if (params.output)
		{
			output['status'] = params.output.status;
			output['fileNameOnly'] = params.output.fileNameOnly;
			output['fileContents'] = params.output.fileContents;
		}
		return output;
	},

	/**
	 * Remove all of the menu items that have a tagName of 'menuitem'
	 * and an attribute 'name' of 'hostfiles'.
	 * Also remove all items from the edit menu.
	 */
	removeHostFilesFromMenu: function()
	{
		var tmpList = new Array();
		var j = 0;
		for (var i = 0; i < this.mainHostFilesList.childNodes.length; i++)
		{
			if (this.mainHostFilesList.childNodes[i].tagName == 'menuitem' && this.mainHostFilesList.childNodes[i].getAttribute('name') == 'hostfiles')
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
		//Remove any items in the edit menu already...
		while (this.editHostFilesList.firstChild) {
			this.editHostFilesList.removeChild(this.editHostFilesList.firstChild);
		}
	},
	
	disableMainMenu: function(disable)
	{
		if (disable == true)
		{
			//Disable the main menu...
			document.getElementById('hostfilehelper-menu').setAttribute('disabled', true);
		}
		else
		{
			//Enable the main menu...
			document.getElementById('hostfilehelper-menu').setAttribute('disabled', false);
		}
	},
		
	// openPleaseWaitWindow: function(open)
	// {
		// if (open == true)
		// {
			// this.pleaseWaitWindow = window.openDialog("chrome://sample/content/pleasewait.xul", "dlg2", "dialog,alwaysRaised=yes,chrome,centerscreen,scrollbars=no,width=300,height=25,close=no");
		// }
		// else
		// {
			// if (this.pleaseWaitWindow)
			// {
				// this.pleaseWaitWindow.close();
			// }
		// }
	// },
	
	// openOverwriteWindow: function(text)
	// {
		// var params = {
			// inn: {
				// windowDescription: text
			// }, 
			// output: null
		// };
		// //Open the dialog window...
		// window.openDialog("chrome://sample/content/overwritefile.xul", "dlg3", "modal,chrome,centerscreen,scrollbars=no,width=550,height=300", params);
		// if (params.output.action)
		// {
			// return params.output.action;
		// }
		// return false;
	// }

};