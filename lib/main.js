const panels = require('panel');
const storage = require('simple-storage');
const data = require('self').data;
const notifications = require('notifications');
const io = require('io').io;
const dns = require('dns').dns;
const observer = require('observer-service');

//@TODO Add code to display banner on all pages if host file is set

//Setup simple storage
storage.storage.hostFiles = (!storage.storage.hostFiles) ? {
	'file one here' : {
		'data' : 'host file one\nline two',
		'selected' : false
	},
	'file two here' : {
		'data' : 'host file two',
		'selected' : true
	},
	'file three here' : {
		'data' : 'host file three',
		'selected' : false
	},
	'file four here' : {
		'data' : 'host file four',
		'selected' : true
	},
} : storage.storage.hostFiles;
storage.storage.preferences = (!storage.storage.preferences) ? {
	'systemHostFilePath' : '/home/tpetty/test_host_file',
	'refreshTab' : true,
	'baseHostFile' : 'This is the base host file.'
} : storage.storage.preferences;

var hostFileSwitcher = {
	hostFileManager : {},
	preferencesManager : {},
	hostFiles : storage.storage.hostFiles,
	prefs : storage.storage.preferences,

	/**
	 * Initialize the extension.
	 * Called several times (install, enable, startup, upgrade, downgrade).
	 * @param options (object)
	 */
	init : function(options)
	{
		var self = this;
		//console.log(options.loadReason);
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
					self.hostFiles = message;
					//Update system host file now
					self.updateSystemHostFile();
				}
				//If we got anything else (like 'close'), just hide
				self.hostFileManager.hide();
			},
			onShow: function(){
				this.postMessage(self.hostFiles);
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
					self.prefs = message;
					//Update system host file now
					self.updateSystemHostFile();
				}
				//If we got anything else (like 'close'), just hide
				self.preferencesManager.hide();
			},
			onShow: function(){
				this.postMessage(self.prefs);
			}
		});

		//@TODO Working on a way for extensions to communicate
		observer.add('host_file_switcher_update', function(subject, data){
			console.log('got some data:');
			console.log('subject: ' + subject);
			console.log('data: ' + data);
		});
		observer.notify('host_file_switcher_update', 'my subject here');

		/*
		//@TODO I will need to write a more complex over quota handler,
		//since I'll be using objects instead of arrays, and I can't
		//just .pop() the last element.
		storage.on('OverQuota', function(){
			notifications.notify({
				title: 'Host File Switcher storage space exceeded',
				text: 'Removing recent host files.'
			});
			while (storage.quotaUsage > 1)
			{
				storage.storage.hfs.pop();
			}
		});
		*/

		/*
		@TODO Order of events:
		- figure out system host file
			- if not, disable menu
		- save contents temporarily
		- detect if we can write to it (overwrite it with selected host files)
			- if not, disable menu
		- detect if contents are different then selected host files
			(even if we dont have any selected)
			- if not, then done
		- unselect host files (without writing new host file or refreshing)
		- add system host file to list and select it (with out writing new host file or refreshing)
		- notify user what we just did
		*/

		//@TODO It would be good to move this stuff to seperate functions so that
		//I can use the same code here and for the preferences manager.
		//Figure out system host file path
		this.prefs.systemHostFilePath = (this.prefs.systemHostFilePath !== '') ? this.prefs.systemHostFilePath : this.guessSystemHostFilePath();
		if (this.prefs.systemHostFilePath === '')
		{
			//Can't figure out system host file path
			notifications.notify({
				title: 'Host File Switcher - Problem',
				text: "Can not find the system host file.\n" +
					"Please manually specify the system host file path in the preferences.",
			});
			return;
		}
		//Make sure we can write to the system host file
		if (!io.writeFile(this.prefs.systemHostFilePath, '', 'a'))
		{
			//@TODO This fails because the file doesn't exist - because I am
			//trying to append to the file.
			//But I should do a different kind of check because sometimes
			//I can actually create the file still.
			//Can't write to the system host file
			notifications.notify({
				title: 'Host File Switcher - Problem',
				text: "Can not write to the system host file.\n" + 
					"Please change the write permissions on the system host file to 0666.\n" +
					"If this is not an option, see the help for additional options using symbolic links.\n" +
					"The system host file is located at:\n" +
					this.prefs.systemHostFilePath,
			});
			return;
		}
		//@TODO Write system host file now?
		//@TODO Should I then detect if system host file differs from what
		//I plan to overwrite it with, or detect only if this is an install or not,
		//and handle that case only. And in all other cases, just overwrite it silently.
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
			//@TODO Finish (must figure out slash support in windows)
			//((DirIO.path(DirIO.get('SysD'))).substring(8) + '/drivers/etc/hosts').replace(/\//g, this.slash);
			//console.log(io.path(SysD));
			//path = (io.path(SysD)).substring(8) + '/drivers/etc/hosts';
			//console.log(path);
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
		this.hostFiles[hostFile].selected = (this.hostFiles[hostFile].selected === true) ? false : true;
		//Update system host file now
		this.updateSystemHostFile();
	},

	updateSystemHostFile : function()
	{
		//Create new host file, and overwrite system host file with it
		if (!io.writeFile(this.prefs.systemHostFilePath, this.createHostFile()))
		{
			//Can't write to the system host file
			notifications.notify({
				title: 'Host File Switcher - Problem',
				text: "Can not write to the system host file.\n" + 
					"Please change the write permissions on the system host file to 0666.\n" +
					"If this is not an option, see the help for additional options using symbolic links.\n" +
					"The system host file is located at:\n" +
					this.prefs.systemHostFilePath,
			});
			return;
		}
		//Refresh the dns
		dns.refresh(this.prefs.refreshTab);
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
		newData += (this.prefs.baseHostFile !== '') ? this.prefs.baseHostFile + "\n" : '';
		for (var i in this.hostFiles)
		{
			if (this.hostFiles[i].selected === true)
			{
				newData += this.hostFiles[i].data + "\n";
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
		return this.hostFiles;
	},

	getPrefs : function(){
		return this.prefs;
	}
};
exports.main = function(options){
	hostFileSwitcher.init(options);
};
exports.hostFileSwitcher = hostFileSwitcher;
