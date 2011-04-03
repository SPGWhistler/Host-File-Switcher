const panels = require('panel');
const storage = require('simple-storage');
const data = require('self').data;
const notifications = require('notifications');
const io = require('io').io;
const dns = require('dns').dns;

var editor;
//@TODO Add code to display banner on all pages if host file is set

//Setup simple storage
storage.storage.hfs = (!storage.storage.hfs) ? [] : storage.storage.hfs;

//@TODO I can and should export any function I want accessable
exports.main = function(){
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
};
exports.myNewFunc = function(){
	editor.show();
};
exports.guessSystemHostFile = function()
{
	var path = '';
	var SysD = io.getSystemPath('SysD');
	if (SysD !== false)
	{
		//Windows
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
		if (file)
		{
			//Linux
			if (file.exists())
			{
				console.log('exists');
				if (io.writeFile(file, '', 'a'))
				{
					console.log('can write');
				}
				else
				{
					console.log('can not write');
				}
			}
		}
		//@TODO Add mac support
	}
	console.log(path);
	return path;
};
exports.openFile = function(){
	//console.log('try to open file');
	//console.log(io.readFile('/home/tpetty/test.txt'));
	//this.slash = '/';
	//this.systemHostFile = DirIO.get('Home').path + this.slash + 'host_file_helper_hosts';
	//console.log('path:' + dirIo.io.get('Home').path);
	//console.log(typeof io.openDir('/home/tpetty/test', true));
	//dns.refresh(true);
	//console.log(io.getSystemPath('SysD'));
	console.log(this.guessSystemHostFile());
};
