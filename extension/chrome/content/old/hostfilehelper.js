window.addEventListener("load", function() { hostFileHelper.init(); }, false);
//@TODO Update docblocks for everything so that someone other then me could
//possibly update this in the future.

var hostFileHelper = {

	/**
	 * Init the app.
	 */
	init: function()
	{
		//Do init (order is important):
		filesHandler.init();
		dnsHandler.init(filesHandler, filesHandler.readFile, filesHandler.openDir, filesHandler.overwriteFile);
		guiHandler.init(this.changeHostFileAction, this.editFileAction, this.createNewHostFileAction);
		//this.getCurrentHostFile();
	},
		
	/**
	 * Change the current host file.
	 * Called from the command event of the host file menu items.
	 */
	changeHostFileAction: function()
	{
		hostFileHelper.changeHostFile(this.getAttribute('nameonly'));
	},
	
	/**
	 * Method to change the current host file.
	 * @PARAM newHostFileNameOnly The name (no path, no extension) of the new host file to use.
	 */
	changeHostFile: function(newHostFileNameOnly)
	{
		//Copy the selected host files contents over the system host files contents
		filesHandler.overwriteFile(dnsHandler.systemHostFile, filesHandler.readFile(dnsHandler.getFullPathFromName(newHostFileNameOnly)));
		
		//Refresh the dns
		dnsHandler.refreshDns();
		
		//Select current host file in menu
		this.getCurrentHostFile();
	},
	
	/**
	 * Called from the command event of the host file edit menu items.
	 */
	editFileAction: function()
	{
		hostFileHelper.editHostFile(this.getAttribute('nameonly'));
	},
	
	/**
	 * Method to edit the specified host file.
	 * @PARAM fileNameOnly The name (no path, or extension) of the host file to edit.
	 */
	editHostFile: function(fileNameOnly)
	{
		var curHostFile = this.getCurrentHostFile();
		var isCurrentHostFile = false;
		if (curHostFile == fileNameOnly)
		{
			isCurrentHostFile = true;
		}
		var fullFileName = dnsHandler.getFullPathFromName(fileNameOnly);
		if (fullFileName == false)
		{
			alert("Host File Helper\nThere was an error trying to edit the specified file. Please contact the developer and give them error 500.");
			return;
		}
		var fileContents = filesHandler.readFile(fullFileName);
		if (fileContents == false && fileContents != '')
		{
			alert("Host File Helper\nThere was an error trying to edit the specified file. Please contact the developer and give them error 501.");
			return;
		}
		var retVal = guiHandler.openEditWindow(fileNameOnly, fileContents, (isCurrentHostFile ? false : true), 'Edit Host File', 'Rename and edit this host file.');
		switch (retVal['status'])
		{
			case -1:
				//User clicked Delete...
				//Prompt user to be sure they want to delete context file.
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
				var button = prompts.confirmEx(window, "Are you sure?", "Are you sure you want to delete this host file?", prompts.STD_YES_NO_BUTTONS, "", "", "", "", {value: false});
				if (button == 0)
				{
					//Do delete...
					filesHandler.deleteFile(fullFileName);
					//Refresh the list of host files...
					dnsHandler.getListOfHostFiles(true);
				}
				else
				{
					//Do nothing...
				}
				break;
			case 1:
				//User clicked Save...
				var doRefresh = false;
				//Standardize the line endings so we can compare with the original...
				retVal['fileContents'] = filesHandler.standardizeLineEndings(retVal['fileContents']);
				//Save contents of file...
				if (retVal['fileContents'] != fileContents)
				{
					filesHandler.overwriteFile(fullFileName, retVal['fileContents']);
					doRefresh = true;
				}
				//Rename file...
				if (retVal['fileNameOnly'] != fileNameOnly)
				{
					filesHandler.renameFile(fullFileName, fullFileName.substr(0, fullFileName.indexOf(fileNameOnly)) + retVal['fileNameOnly'] + '.txt');
				}
				//Refresh the list of host files...
				dnsHandler.getListOfHostFiles(true);
				//Refresh the dns...
				if (isCurrentHostFile == true && doRefresh == true)
				{
					this.changeHostFile(retVal['fileNameOnly']);
				}
				break;
			default:
				//User clicked Cancel...
				break;
		}
	},
	
	createNewHostFileAction: function()
	{
		hostFileHelper.createNewHostFile();
	},
	
	createNewHostFile: function()
	{
		//Create a new file...
		//First find a file name that doesn't exist (to to 100 tries)...
		var path = dnsHandler.myHostsDirPath + dnsHandler.slash;
		var baseName = 'New Host File ';
		var extension = '.txt';
		var fileName = filesHandler.getUniqueFileNameOnly(path, baseName, extension);
		if (fileName == false)
		{
			alert('I can not create a new host file because you have too many files named "' + baseName + ' n". Perhaps you should rename some of them first eh?');
			return;
		}
		//Now actually create this empty file...
		filesHandler.overwriteFile(path + fileName + extension, '');
		//Refresh list of files...
		dnsHandler.getListOfHostFiles(true);
		//Now edit thie file...
		this.editHostFile(fileName);
	},
	
	/**
	 * Returns the current host file and also takes care of making sure
	 * the current system host file matches one of our host files and also
	 * updating the menu. If there is an error and the current system host file
	 * can not be copied over to our host files, this will return false instead of the
	 * name of the current host file. But the menu will still be updated with the list
	 * of current host files - but none of them will be checked.
	 * @RETURN string The name only of the current host file or false on error.
	 */
	getCurrentHostFile: function()
	{
		dnsHandler.getListOfHostFiles(true);
		var currentHostFileNameOnly = dnsHandler.getCurrentHostFile();
		if (currentHostFileNameOnly == false)
		{
			//The system host file doesn't match any host files, copy it over...
			//Generate a new file name...
			var path = dnsHandler.myHostsDirPath + dnsHandler.slash;
			var baseName = 'System Host File ';
			var extension = '.txt';
			var fileName = filesHandler.getUniqueFileNameOnly(path, baseName, extension);
			if (fileName == false)
			{
				alert('I can not create a new host file because you have too many files named "' + baseName + ' n". Perhaps you should rename some of them first eh?');
				//Don't end the function here - keep going...
			}
			else
			{
				//Copy the system host file over to the new file...
				filesHandler.overwriteFile(path + fileName + extension, dnsHandler.getSystemHostFileContents());
			}
			//Refresh the list of host files...
			dnsHandler.getListOfHostFiles(true);
			//Get the current host file name (even though we know it technically)...
			var currentHostFileNameOnly = dnsHandler.getCurrentHostFile();
			//Even if the currentHostFileNameOnly is false for any reason, that is fine for the functions below...
		}
		//Update the menus...
		guiHandler.updateHostFilesList(dnsHandler.getListOfHostFiles(false), currentHostFileNameOnly);
		//Change the menu name
		//document.getElementById('hostfilehelper-menu').label = "Host Files - " + currentHostFileNameOnly;
		//@TODO The above line causes a problem: If you have more then one window open, the menus in the other windows don't update.
		//I tried using a "global" variable - but it's not global. It's local to the window, so that doesn't work. I need a truely global
		//way to update - either that or a way to communicate between extensions.... because esentiall that is what I have,
		//multiple copies of the same extension running - all with their own variables.
		//Return the name of the current host file...
		return currentHostFileNameOnly;
	}
};
