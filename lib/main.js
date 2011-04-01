const panels = require('panel');
const storage = require('simple-storage');
const data = require('self').data;
const notifications = require('notifications');
const io = require('io');

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
exports.openFile = function(){
	console.log('try to open file');
	console.log(io.readFile('/home/tpetty/test.txt'));
};
