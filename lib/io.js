/**
 * An input and output object that can be used to read and
 * write files easily.
 * This mostly just contains wrapper functions for dirIo
 * and fileIo.
 */

const fileIo = require('fileio');
const dirIo = require('directoryio');

var io = {
	/**
	 * Open a file and return a handle.
	 * @param path (string) The file path.
	 * @return bool|object
	 */
	openFile: function(path)
	{
		console.log('openFile start');
		var tmpFile = fileIo.io.open(path);
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
		console.log('readFile start');
		console.log(path);
		var file = this.openFile(path);
		console.log('file: ' + file);
		if (typeof file !== 'boolean')
		{
			console.log('file is open');
			return fileIo.io.read(file);
		}
		console.log('failed to open file');
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
			return fileIo.io.unlink(file);
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
			var fileContents = fileIo.io.read(file);
			if (typeof fileContents !== 'boolean')
			{
				var newFile = this.openFile(newPath)
				if (typeof newFile !== 'boolean')
				{
					fileIo.io.write(newFile, fileContents);
					fileIo.io.unlink(file);
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
			return fileIo.io.write(file, this.convertLineEndings(data));
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
	
	/**
	 * Return a handle to a directory, optionally creating it.
	 * @param path (string) Path to directory
	 * @param create (bool) Create directory if not exist
	 * @return bool|object
	 */
	openDir: function(path, create)
	{
		create = (typeof create === 'boolean') ? create : false;
		var tmpDir = dirIo.io.open(path);
		if (tmpDir)
		{
			if (create === true)
			{
				if (!tmpDir.exists())
				{
					dirIo.io.create(tmpDir);
					if (!tmpDir.exists())
					{
						return false;
					}
				}
			}
			return tmpDir;
		}
		return false;
	},

	/**
	 * Wrapper for the dirIO.io.get function.
	 * Used to get a system path.
	 * See here for valid type values: http://mxr.mozilla.org/seamonkey/source/xpcom/io/nsDirectoryServiceDefs.h
	 * @param type (string) The path type that you want.
	 * @return bool|string
	 */
	getSystemPath: function(type)
	{
		return dirIo.io.get(type);
	},

	/**
	 * Wrapper for the fileIo.io.path function.
	 * Return a file or directory path from a handle.
	 * @param file (object) The file object to get the path from (can be directory)
	 * @return bool|string
	 */
	getPath: function(file)
	{
		return fileIo.io.path(file);
	},

	/**
	 * Wrapper for the dirIo.io.read function.
	 * Return an array of directory contents.
	 * @param dir (object) The direcotry object to use.
	 * @param recursive (boolean)
	 * @return array
	 */
	getDirectoryContents: function(dir, recursive)
	{
		return dirIo.io.read(dir, recursive);
	}
};
exports.io = io;
