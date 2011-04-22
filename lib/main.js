const panels = require('panel');
const storage = require('simple-storage');
const data = require('self').data;
const notifications = require('notifications');
const io = require('io').io;
const dns = require('dns').dns;

/* TODO List:
- Add code to display banner on all pages if host file is set
- Add code to handle syncing system host file
- Finish windows support
	(must figure out slash support in windows)
	((DirIO.path(DirIO.get('SysD'))).substring(8) + '/drivers/etc/hosts').replace(/\//g, this.slash);
	console.log(io.path(SysD));
	path = (io.path(SysD)).substring(8) + '/drivers/etc/hosts';
	console.log(path);
- Double check how 'enable function' works in xul.js
- Add more validation to preferencesManager.js forms
- Create a module that returns a new host file object that can be used throughout the app instead
	of manually setting it in multiple file (hostFileManager.js, main.js, etc)
- Update styles and graphics for hostFileManager and preferencesManager.
- Add a widget and a preference to use either that or the menu or both.
- Figure out how to automatically get Synacor specific host files (add on module, or two different versions of this extension?)
- Add docblocks to everything.
- Add a better over quota handler
*/

//Setup simple storage
storage.storage.hostFiles = (!storage.storage.hostFiles) ? {
	'example host file' : {
		'data' : '# This is an example host file.\n# You can delete it, or change it.',
		'selected' : false
	}
} : storage.storage.hostFiles;
storage.storage.preferences = (!storage.storage.preferences) ? {
	'systemHostFilePath' : '/home/tpetty/tmp_host_file',
	'refreshTab' : true,
	'baseHostFile' : '# This is the base host file.\n# You can replace these contents, and\n# when they will always appear in your host file.'
} : storage.storage.preferences;

var hostFileSwitcher = {
	hostFileManager : {},
	preferencesManager : {},
	switchingAllowed : false,

	/**
	 * Initialize the extension.
	 * Called several times (install, enable, startup, upgrade, downgrade).
	 * This reason is in options.loadReason.
	 * @param options (object)
	 */
	init : function(options)
	{
		var self = this;
		this.hostFileManager = panels.Panel({
			width: 800,
			height: 600,
			contentURL: data.url('hostFileManager/hostFileManager.html'),
			contentScriptFile: [
				data.url('jQuery.js'),
				data.url('hostFileManager/hostFileManager.js')
			],
			contentScriptWhen: 'ready',
			onMessage: function(message){
				if (typeof message === 'object')
				{
					//We got a list of host files, save them
					storage.storage.hostFiles = message;
					//Update system host file now
					self.updateSystemHostFile();
				}
				//If we got anything else (like 'close'), just hide
				self.hostFileManager.hide();
			},
			onShow: function(){
				this.postMessage(storage.storage.hostFiles);
			}
		});
		
		this.preferencesManager = panels.Panel({
			width: 800,
			height: 600,
			contentURL: data.url('preferencesManager/preferencesManager.html'),
			contentScriptFile: [
				data.url('jQuery.js'),
				data.url('preferencesManager/preferencesManager.js')
			],
			contentScriptWhen: 'ready',
			onMessage: function(message){
				if (typeof message === 'object')
				{
					//We got preferences, save them
					storage.storage.preferences = message;
					//Update system host file now
					self.updateSystemHostFile();
				}
				//If we got anything else (like 'close'), just hide
				self.preferencesManager.hide();
			},
			onShow: function(){
				this.postMessage(storage.storage.preferences);
			}
		});

		storage.on('OverQuota', function(){
			notifications.notify({
				title: 'Host File Switcher - Problem',
				text: 'You have too many host files (or they are too big). Please remove some.'
			});
		});

		this.syncHostFiles();
	},

	/**
	 * Sync the menu with the actually selected host files.
	 * @return boolean True on success, False on failure.
	 */
	syncHostFiles : function()
	{
		/*
		Can we write?
		*- figure out system host file (guessSystemHostFile)
			*- if not, then notify user, then done
		*- get contents of system host file
		*- save contents to two temp variables
		*- detect if we can write to it (overwrite it with selected host files)
			*- if not, then notify user, then done
		*- Enable menu (setSwitchingAllowed)
		Sync selected:
		- detect if contents are different then selected host files by looping
			Loop through all host files and search temp variable for matching contents.
			If found, remove them from temp variable so we dont get duplicate matches.
			Then mark them as selected.
			Also check for base host file.
			- if not different (temp variable has no contents left that are not whitespace), then done
		- unselect host files (without writing new host file or refreshing dns)
		- add system host file to list and select it (do write out file and but no refresh dns)
		- notify user what we just did
		*/
		//Figure out system host file path
		storage.storage.preferences.systemHostFilePath = (storage.storage.preferences.systemHostFilePath !== '') ? storage.storage.preferences.systemHostFilePath : this.guessSystemHostFilePath();
		if (storage.storage.preferences.systemHostFilePath === '')
		{
			//Can't figure out system host file path
			notifications.notify({
				title: 'Host File Switcher - Problem',
				text: "Can not find the system host file.\n" +
					"Please manually specify the system host file path in the preferences.",
			});
			return false;
		}
		//Get system host file contents
		var tmp = io.readFile(storage.storage.preferences.systemHostFilePath);
		this.tmpSystemHostFileContents = (typeof tmp === 'string') ? tmp : '';
		console.log('system host file contents:' + this.tmpSystemHostFileContents);
		//Make sure we can write to the system host file
		if (!io.writeFile(storage.storage.preferences.systemHostFilePath, this.createHostFile()))
		{
			//Can't write to the system host file
			notifications.notify({
				title: 'Host File Switcher - Problem',
				text: "Can not write to the system host file.\n" + 
					"Please change the write permissions on the system host file to 0666.\n" +
					"If this is not an option, see the help for additional options using symbolic links.\n" +
					"The system host file is located at:\n" +
					storage.storage.preferences.systemHostFilePath,
			});
			return;
		}
		//Enable the menu
		this.setSwitchingAllowed(true);
		//Sync selected host files with system host file
		tmp = this.tmpSystemHostFileContents;
		for (var i in storage.storage.hostFiles)
		{
			//@TODO This wont work because it's a regex - need to specify global search
			//@TODO what about an empty system host file?
			if (tmp.search(storage.storage.hostFiles[i].data) > -1)
			{
				tmp.replace(storage.storage.hostFiles[i].data, '');
				storage.storage.hostFiles[i].selected = true;
			}
			else
			{
				storage.storage.hostFiles[i].selected = false;
			}
			console.log(i);
			console.log(storage.storage.hostFiles[i].data);
			console.log();
		}
	},

	/**
	 * Try to figure out the system host file.
	 * Looks for a host file in a few operating system specific
	 * locations. This does not check if we can write to this
	 * file or not - just if it exists.
	 * @return string Path to system host file, or an empty string if it can't be found.
	 */
	guessSystemHostFilePath : function()
	{
		var path = '';
		var file;
		var SysD = io.getSystemPath('SysD');
		if (SysD !== false)
		{
			//Windows
			//@TODO
		}
		else
		{
			//Linux or Mac
			path = '/etc/hosts';
			file = io.openFile(path);
			if (!file || !file.exists())
			{
				path = '/etc/profile/hosts';
				file = io.openFile(path);
				if (!file || !file.exists())
				{
					path = '';
				}
			}
		}
		return path;
	},
	
	/**
	 * Change the currently selected host files.
	 * @param hostFile (string) The name of the host file that was changed.
	 */
	hostFileClicked : function(hostFile)
	{
		//Update list of selected host files
		storage.storage.hostFiles[hostFile].selected = (storage.storage.hostFiles[hostFile].selected === true) ? false : true;
		//Update system host file now
		this.updateSystemHostFile();
	},

	updateSystemHostFile : function()
	{
		if (this.getSwitchingAllowed() === true)
		{
			//Create new host file, and overwrite system host file with it
			if (!io.writeFile(storage.storage.preferences.systemHostFilePath, this.createHostFile()))
			{
				//Can't write to the system host file
				notifications.notify({
					title: 'Host File Switcher - Problem',
					text: "Can not write to the system host file.\n" + 
						"Please change the write permissions on the system host file to 0666.\n" +
						"If this is not an option, see the help for additional options using symbolic links.\n" +
						"The system host file is located at:\n" +
						storage.storage.preferences.systemHostFilePath,
				});
				//@TODO Disable menu, or resync menu?
				return;
			}
			//Refresh the dns
			dns.refresh(storage.storage.preferences.refreshTab);
		}
	},

	/**
	 * Create a new host file from the currently selected host files.
	 * This takes all of the currently selected host files and combines
	 * them into a single string, seperating each with a new line.
	 * The baseHostFile is added first.
	 * @return string The new host file
	 */
	createHostFile : function()
	{
		var newData = '';
		newData += (storage.storage.preferences.baseHostFile !== '') ? storage.storage.preferences.baseHostFile + "\n" : '';
		for (var i in storage.storage.hostFiles)
		{
			if (storage.storage.hostFiles[i].selected === true)
			{
				newData += storage.storage.hostFiles[i].data + "\n";
			}
		}
		return newData;
	},

	manageHostFilesClicked : function(){
		this.hostFileManager.show();
	},
	
	managePreferencesClicked : function(){
		this.preferencesManager.show();
	},

	getHostFiles : function(){
		return storage.storage.hostFiles;
	},

	getPrefs : function(){
		return storage.storage.preferences;
	},

	getSwitchingAllowed : function(){
		return this.switchingAllowed;
	},

	/**
	 * Set if switching is allowed or not.
	 * @param allowed (bool)
	 */
	setSwitchingAllowed : function(allowed){
		this.switchingAllowed = (typeof allowed === 'boolean') ? allowed : false;
	}
};
exports.main = function(options){
	hostFileSwitcher.init(options);
};
exports.hostFileSwitcher = hostFileSwitcher;
