const panels = require('panel');
const storage = require('simple-storage');
const data = require('self').data;
const notifications = require('notifications');
const io = require('io').io;
const dns = require('dns').dns;

/* TODO List:
- Finish windows support
	(must figure out slash support in windows)
	((DirIO.path(DirIO.get('SysD'))).substring(8) + '/drivers/etc/hosts').replace(/\//g, this.slash);
	console.log(io.path(SysD));
	path = (io.path(SysD)).substring(8) + '/drivers/etc/hosts';
	console.log(path);
- Add more validation to preferencesManager.js forms
- Update styles and graphics for hostFileManager and preferencesManager.
- Add docblocks to everything.
- Add a widget and a preference to use either that or the menu or both.
- Figure out how to automatically get Synacor specific host files (add on module, or two different versions of this extension?)
- Add code to display banner on all pages if host file is set
- Add a better over quota handler
- Create a module that returns a new host file object that can be used throughout the app instead
	of manually setting it in multiple file (hostFileManager.js, main.js, etc)
*/

//Setup simple storage
storage.storage.hostFiles = (!storage.storage.hostFiles) ? {
	'example host file' : {
		'data' : '# This is an example host file.\n# You can delete it, or change it.',
		'selected' : true
	},
	'example host file2' : {
		'data' : '# This aint is an example host file.\n# You can delete it, or change it.',
		'selected' : false
	}
} : storage.storage.hostFiles;
storage.storage.preferences = (!storage.storage.preferences) ? {
	'systemHostFilePath' : '/home/tpetty/tmp_host_file',
	'refreshTab' : true,
	'baseHostFile' : '# This is the base host file.\n# You can replace these contents, and\n# then they will always appear in your host file.'
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
		var originalSystemHostFile = io.readFile(storage.storage.preferences.systemHostFilePath);
		originalSystemHostFile = (typeof originalSystemHostFile === 'string') ? originalSystemHostFile : '';
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
			return false;
		}
		//Enable the menu
		this.setSwitchingAllowed(true);
		//Sync selected host files with system host file
		haystack = escape(originalSystemHostFile).replace(/%0D|%0A/g, ''); //Escape and Remove CR and LF
		var patt;
		var needle;
		for (var i in storage.storage.hostFiles)
		{
			needle = escape(storage.storage.hostFiles[i].data).replace(/%0D|%0A/g, ''); //Escape and Remove CR and LF
			if (haystack.indexOf(needle, 0) > -1)
			{
				haystack = haystack.replace(needle, '');
				storage.storage.hostFiles[i].selected = true;
			}
			else
			{
				storage.storage.hostFiles[i].selected = false;
			}
		}
		//Remove the base host file if it is there
		needle = escape(storage.storage.preferences.baseHostFile).replace(/%0D|%0A/g, ''); //Escape and Remove CR and LF
		haystack = haystack.replace(needle, '');
		//Check to see if we have any contents left that are not whitespace
		var patt = /\S/gim;
		if (patt.test(unescape(haystack)))
		{
			//Unselect all host files in the list
			for (i in storage.storage.hostFiles)
			{
				storage.storage.hostFiles[i].selected = false;
			}
			//Add new system host file to list and select it
			var d = new Date();
			var title = 'System Host File ' + d.getTime();
			storage.storage.hostFiles[title] = {
				'data' : originalSystemHostFile,
				'selected' : true
			};
			//Write out new host file
			io.writeFile(storage.storage.preferences.systemHostFilePath, this.createHostFile())
			//Notify user that we just added a new host file to the list
			notifications.notify({
				title: 'Host File Switcher - Warning',
				text: "Your current system host file has changed since the last time this addon was run.\n" + 
					"We have automatically added it to your list of host files for you.",
			});
		}
		return true;
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
				//@TODO In this case, I might want to return false, or have this function just change the current host
				//file back to the oposite of its current selected status. No need to change the menu - it updates
				//each time it's opened anyway.
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
