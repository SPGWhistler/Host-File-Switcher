/**
 * A low level file io module.
 */

const {components} = require("chrome");

var io = {
	localfileCID: '@mozilla.org/file/local;1',
	localfileIID: components.interfaces.nsILocalFile,
	finstreamCID: '@mozilla.org/network/file-input-stream;1',
	finstreamIID: components.interfaces.nsIFileInputStream,
	foutstreamCID: '@mozilla.org/network/file-output-stream;1',
	foutstreamIID: components.interfaces.nsIFileOutputStream,
	sinstreamCID: '@mozilla.org/scriptableinputstream;1',
	sinstreamIID: components.interfaces.nsIScriptableInputStream,
	suniconvCID: '@mozilla.org/intl/scriptableunicodeconverter',
	suniconvIID: components.interfaces.nsIScriptableUnicodeConverter,

	open: function(path)
	{
		try
		{
			var file = components.classes[this.localfileCID]
				.createInstance(this.localfileIID);
			file.initWithPath(path);
			return file;
		}
		catch(e)
		{
			return false;
		}
	},

	read: function(file, charset)
	{
		try
		{
			var data = new String();
			var fiStream = components.classes[this.finstreamCID]
				.createInstance(this.finstreamIID);
			var siStream = components.classes[this.sinstreamCID]
				.createInstance(this.sinstreamIID);
			fiStream.init(file, 1, 0, false);
			siStream.init(fiStream);
			data += siStream.read(-1);
			siStream.close();
			fiStream.close();
			if (charset)
			{
				data = this.toUnicode(charset, data);
			}
			return data;
		} 
		catch(e)
		{
			return false;
		}
	},

	write: function(file, data, mode, charset)
	{
		try
		{
			var foStream = components.classes[this.foutstreamCID]
				.createInstance(this.foutstreamIID);
			if (charset)
			{
				data = this.fromUnicode(charset, data);
			}
			var flags = 0x02 | 0x08 | 0x20; // wronly | create | truncate
			if (mode == 'a')
			{
				flags = 0x02 | 0x10; // wronly | append
			}
			foStream.init(file, flags, 0664, 0);
			foStream.write(data, data.length);
			// foStream.flush();
			foStream.close();
			return true;
		}
		catch(e)
		{
			return false;
		}
	},

	create: function(file)
	{
		try
		{
			file.create(0x00, 0664);
			return true;
		}
		catch(e)
		{
			return false;
		}
	},

	unlink: function(file)
	{
		try
		{
			file.remove(false);
			return true;
		}
		catch(e)
		{
			return false;
		}
	},

	path: function(file)
	{
		try
		{
			return 'file:///' + file.path.replace(/\\/g, '\/')
				.replace(/^\s*\/?/, '').replace(/\ /g, '%20');
		}
		catch(e)
		{
			return false;
		}
	},

	toUnicode: function(charset, data)
	{
		try
		{
			var uniConv = components.classes[this.suniconvCID]
				.createInstance(this.suniconvIID);
			uniConv.charset = charset;
			data = uniConv.ConvertToUnicode(data);
		} 
		catch(e)
		{
			// foobar!
		}
		return data;
	},

	fromUnicode: function(charset, data)
	{
		try
		{
			var uniConv = components.classes[this.suniconvCID]
				.createInstance(this.suniconvIID);
			uniConv.charset = charset;
			data = uniConv.ConvertFromUnicode(data);
			// data += uniConv.Finish();
		}
		catch(e)
		{
			// foobar!
		}
		return data;
	}
};
exports.open = io.open;
exports.read = io.read;
exports.write = io.write;
exports.create = io.create;
exports.unlink = io.unlink;
exports.path = io.path;
exports.toUnicode = io.toUnicode;
exports.fromUnicode = io.fromUnicode;



/*
if (typeof(JSIO) != 'boolean') {
	var JSIO = true;
	var DirIO = {

		sep        : '/',

		dirservCID : '@mozilla.org/file/directory_service;1',
	
		propsIID   : components.interfaces.nsIProperties,
	
		fileIID    : components.interfaces.nsIFile,

		get    : function(type) {
			try {
				var dir = components.classes[this.dirservCID]
								.createInstance(this.propsIID)
								.get(type, this.fileIID);
				return dir;
			}
			catch(e) {
				return false;
			}
		},

		open   : function(path) {
			return FileIO.open(path);
		},

		create : function(dir) {
			try {
				dir.create(0x01, 0664);
				return true;
			}
			catch(e) {
				return false;
			}
		},

		read   : function(dir, recursive) {
			var list = new Array();
			try {
				if (dir.isDirectory()) {
					if (recursive == null) {
						recursive = false;
					}
					var files = dir.directoryEntries;
					list = this._read(files, recursive);
				}
			}
			catch(e) {
				// foobar!
			}
			return list;
		},

		_read  : function(dirEntry, recursive) {
			var list = new Array();
			try {
				while (dirEntry.hasMoreElements()) {
					list.push(dirEntry.getNext()
									.QueryInterface(FileIO.localfileIID));
				}
				if (recursive) {
					var list2 = new Array();
					for (var i = 0; i < list.length; ++i) {
						if (list[i].isDirectory()) {
							files = list[i].directoryEntries;
							list2 = this._read(files, recursive);
						}
					}
					for (i = 0; i < list2.length; ++i) {
						list.push(list2[i]);
					}
				}
			}
			catch(e) {
			   // foobar!
			}
			return list;
		},

		unlink : function(dir, recursive) {
			try {
				if (recursive == null) {
					recursive = false;
				}
				dir.remove(recursive);
				return true;
			}
			catch(e) {
				return false;
			}
		},

		path   : function (dir) {
			return FileIO.path(dir);
		},

		split  : function(str, join) {
			var arr = str.split(/\/|\\/), i;
			str = new String();
			for (i = 0; i < arr.length; ++i) {
				str += arr[i] + ((i != arr.length - 1) ? 
										join : '');
			}
			return str;
		},

		join   : function(str, split) {
			var arr = str.split(split), i;
			str = new String();
			for (i = 0; i < arr.length; ++i) {
				str += arr[i] + ((i != arr.length - 1) ? 
										this.sep : '');
			}
			return str;
		}
	
	}

	if (navigator.platform.toLowerCase().indexOf('win') > -1) {
		DirIO.sep = '\\';
	}

}
*/
