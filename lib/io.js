/**
 * An input and output object that can be used to read and
 * write files easily.
 */

const llio = require("lowLevelIo");

var io = {
	/**
	 * Open a file and return a handle.
	 * @param path (string) The file path.
	 * @return bool|handle (object?)
	 */
	openFile: function(path)
	{
		console.log('openFile start');
		var tmpFile = llio.open(path);
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
			return llio.read(file);
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
			return llio.unlink(file);
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
			var fileContents = llio.read(file);
			if (typeof fileContents !== 'boolean')
			{
				var newFile = this.openFile(newPath)
				if (typeof newFile !== 'boolean')
				{
					llio.write(newFile, fileContents);
					llio.unlink(file);
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
			return llio.write(file, this.convertLineEndings(data));
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
	}
	
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
	}
	*/
};
exports.openFile = io.openFile;
exports.readFile = io.readFile;
exports.deleteFile = io.deleteFile;
exports.renameFile = io.renameFile;
exports.writeFile = io.writeFile;
exports.convertLineEndings = io.convertLineEndings;
exports.generateFileName = io.generateFileName;
//exports.openDir = io.openDir;
