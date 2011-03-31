const {components} = require("chrome");

var io = {
	/**
	 * Open a file and return a handle.
	 * @param path (string) The file path.
	 * @return bool|handle (object?)
	 */
	openFile: function(path)
	{
		var tmpFile = this.io.open(path);
		if (!tmpFile)	
		{
			return false;
		}
		else
		{
			return tmpFile;
		}
	},
	
	/**
	 * Return a files contents as a string.
	 * @param path (string) The path to the file.
	 * @return bool|string
	 */
	readFile: function(path)
	{
		var file = this.openFile(path);
		if (typeof file !== 'boolean')
		{
			return this.io.read(file);
		}
		return false;
	},

	/**
	 * Delete a file.
	 * @param path (string The path of the file.
	 * @return bool
	 */
	deleteFile: function(path)
	{
		var file = this.openFile(path);
		if (typeof file !== 'boolean')
		{
			return this.io.unlink(file);
		}
		return false;
	},

	/**
	 * Rename/Move a file.
	 * @param path (string) Path to file.
	 * @param newPath (string) New path to file.
	 * @return bool
	 */
	renameFile: function(path, newPath)
	{
		var file = this.openFile(path);
		if (typeof file !== 'boolean')
		{
			var fileContents = this.io.read(file);
			if (typeof fileContents !== 'boolean')
			{
				var newFile = this.openFile(newPath)
				if (typeof newFile !== 'boolean')
				{
					this.io.write(newFile, fileContents);
					this.io.unlink(file);
					return true;
				}
			}
		}
		return false;
	},

	/**
	 * Write a file.
	 * @param path (string) The path of the file.
	 * @param data (string) The data to write in the file.
	 * @return bool
	 */
	writeFile: function(path, data)
	{
		var file = this.openFile(path);
		if (typeof file !== 'boolean')
		{
			return this.io.write(file, this.convertLineEndings(data));
		}
		return false;
	},
	
	/**
	 * Convert all line endings to a standard format.
	 * @param data (string) The data to convert
	 * @return string
	 */
	convertLineEndings: function(data)
	{
		return data.replace(/(\r\n|\r|\n)/g, '\r\n');
	},
	
	/**
	 * Return a unique file name.
	 * @param path (string) The path (without filename, but with trailing slash)
	 * @param baseName (string) The first part of the file name before the extension.
	 * @param extension (string) The file extension, including the dot.
	 * @return string|bool
	 */
	generateFileName: function(path, baseName, extension)
	{
		var i = 1;
		while (this.openFile(path + baseName + i + extension).exists() === true)
		{
			i++;
			if (i > 99)
			{
				return false;
			}
		}
		return baseName + i;
	},
	
	//@TODO Fix
	/*
	openDir: function(path, create, dieOnError)
	{
		var tmpDir = DirIO.open(path);
		if (!tmpDir)
		{
			if (dieOnError == true)
			{
				throw "Could not open '" + path + "'.";
			}
			return false;
		}
		else
		{
			if (create == true)
			{
				if (!tmpDir.exists())
				{
					DirIO.create(tmpDir);
					if (!tmpDir.exists())
					{
						if (dieOnError == true)
						{
							throw "Could not create '" + path + "'.";
						}
						return false;
					}
				}
			}
			return tmpDir;
		}
	},
	*/

	/**
	 * Internal IO Functions
	 */
	io: {
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
	}
};
exports.io = io;

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
