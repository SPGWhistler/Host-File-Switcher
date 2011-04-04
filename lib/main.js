const panels = require('panel');
const storage = require('simple-storage');
const data = require('self').data;
const notifications = require('notifications');
const io = require('io').io;
const dns = require('dns').dns;

//@TODO Add code to display banner on all pages if host file is set

//Setup simple storage
storage.storage.hostFiles = (!storage.storage.hostFiles) ? {
	'file one here' : 'blah',
	'file two' : 'blah blah',
	'uat99' : 'asdf',
	'web02.tpetty' : 'fdsa',
	'file three' : 'three',
	'four' : 'five',
	'six' : 'siz',
	'eight' : 'nine',
	'nine' : 'ten',
	'ten' : 'ten',
	'eleven' : 'asdffsda'
} : storage.storage.hostFiles;
storage.storage.currentHostFileNames = (!storage.storage.currentHostFileNames) ? ['ten', 'uat99', 'file three'] : storage.storage.currentHostFileNames;
storage.storage.preferences = (!storage.storage.preferences) ? {} : storage.storage.preferences;

//Local variables (really local, or are these global?)
var editor;
var hostFiles = storage.storage.hostFiles;
var currentHostFileNames = storage.storage.currentHostFileNames;
var prefs = storage.storage.preferences;

//@TODO I can and should export any function I want accessable
exports.main = function(options){
	//console.log(options.loadReason);
	editor = panels.Panel({
		width: 500,
		height: 500,
		contentURL: data.url('editor/editor.html'),
		contentScriptFile: data.url('editor/editor.js'),
		contentScriptWhen: 'ready',
		onMessage: function(text){
			console.log(text);
			//if (text)
			//{
				//console.log(text);
			//}
			//editor.hide();
		},
		onShow: function(){
			//this.postMessage('focus');
		}
	});

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
	
	//Figure out system host file path
	prefs.systemHostFilePath = (typeof prefs.systemHostFilePath === 'string') ? prefs.systemHostFilePath : this.guessSystemHostFilePath();
	if (prefs.systemHostFilePath === '')
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
	if (!io.writeFile(prefs.systemHostFilePath, '', 'a'))
	{
		//Can't write to the system host file
		notifications.notify({
			title: 'Host File Switcher - Problem',
			text: "Can not write to the system host file.\n" + 
				"Please change the write permissions on the system host file to 0666.\n" +
				"If this is not an option, see the help for additional options using symbolic links.\n" +
				"The system host file is located at:\n" +
				prefs.systemHostFilePath,
		});
		return;
	}
};
exports.myNewFunc = function(){
	editor.show();
};
/**
 * Try to figure out the system host file.
 * Looks for a host file in a few operating system specific
 * locations. This does not check if we can write to this
 * file or not - just if it exists.
 * @return string Path to system host file, or an empty string if it can't be found.
 */
exports.guessSystemHostFilePath = function()
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
};
/**
 * Change the currently selected host files.
 * @param hostFile (string) The name of the host file that was changed.
 */
exports.hostFileClicked = function(hostFile)
{
	//@TODO Finish here.
	console.log(hostFile);
};
exports.hostFiles = hostFiles;
exports.currentHostFileNames = currentHostFileNames;
exports.prefs = prefs;
exports.tryMe = function()
{
	//console.log('try to open file');
	//console.log(io.readFile('/home/tpetty/test.txt'));
	//this.slash = '/';
	//this.systemHostFile = DirIO.get('Home').path + this.slash + 'host_file_helper_hosts';
	//console.log('path:' + dirIo.io.get('Home').path);
	//console.log(typeof io.openDir('/home/tpetty/test', true));
	//dns.refresh(true);
	//console.log(io.getSystemPath('SysD'));
};
