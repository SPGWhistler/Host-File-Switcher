const panels = require('panel');
const storage = require('simple-storage');
const data = require('self').data;
const notifications = require('notifications');

//Setup simple storage
storage.storage.hfs = (!storage.storage.hfs) ? [] : storage.storage.hfs;

exports.main = function(){
	var editor = panels.Panel({
		width: 220,
		height: 220,
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
