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
exports.io = io;
