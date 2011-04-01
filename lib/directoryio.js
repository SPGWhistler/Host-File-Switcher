/**
 * A low level directory io module.
 */

const {components} = require("chrome");
const fileIo = require("fileio");

var io = {
	sep: '/',
	dirservCID: '@mozilla.org/file/directory_service;1',
	propsIID: components.interfaces.nsIProperties,
	fileIID: components.interfaces.nsIFile,

	get: function(type)
	{
		try
		{
			var dir = components.classes[this.dirservCID]
				.createInstance(this.propsIID)
				.get(type, this.fileIID);
			return dir;
		}
		catch(e)
		{
			return false;
		}
	},

	open: function(path)
	{
		return fileIo.open(path);
	},

	create: function(dir)
	{
		try
		{
			dir.create(0x01, 0664);
			return true;
		}
		catch(e)
		{
			return false;
		}
	},

	read: function(dir, recursive)
	{
		var list = new Array();
		try
		{
			if (dir.isDirectory())
			{
				if (recursive == null)
				{
					recursive = false;
				}
				var files = dir.directoryEntries;
				list = this._read(files, recursive);
			}
		}
		catch(e)
		{
			// foobar!
		}
		return list;
	},

	_read: function(dirEntry, recursive)
	{
		var list = new Array();
		try
		{
			while (dirEntry.hasMoreElements())
			{
				list.push(dirEntry.getNext()
					.QueryInterface(fileIo.localfileIID));
			}
			if (recursive)
			{
				var list2 = new Array();
				for (var i = 0; i < list.length; ++i)
				{
					if (list[i].isDirectory())
					{
						files = list[i].directoryEntries;
						list2 = this._read(files, recursive);
					}
				}
				for (i = 0; i < list2.length; ++i)
				{
					list.push(list2[i]);
				}
			}
		}
		catch(e)
		{
		   // foobar!
		}
		return list;
	},

	unlink: function(dir, recursive)
	{
		try
		{
			if (recursive == null)
			{
				recursive = false;
			}
			dir.remove(recursive);
			return true;
		}
		catch(e)
		{
			return false;
		}
	},

	path: function (dir)
	{
		return fileIo.path(dir);
	},

	split: function(str, join)
	{
		var arr = str.split(/\/|\\/), i;
		str = new String();
		for (i = 0; i < arr.length; ++i)
		{
			str += arr[i] + ((i != arr.length - 1) ? join : '');
		}
		return str;
	},

	join: function(str, split)
	{
		var arr = str.split(split), i;
		str = new String();
		for (i = 0; i < arr.length; ++i)
		{
			str += arr[i] + ((i != arr.length - 1) ? this.sep : '');
		}
		return str;
	}
}
exports.get = io.get;
exports.open = io.open;
exports.create = io.create;
exports.read = io.read;
exports.unlink = io.unlink;
exports.path = io.path;
exports.split = io.split;
exports.join = io.join;


/* @TODO Figure out how to detect windows
if (navigator.platform.toLowerCase().indexOf('win') > -1) {
	DirIO.sep = '\\';
}
*/
