var filesHandler = {
//@TODO Remove any hard references to other classes in this class.

	init: function()
	{
	},

	openFile: function(path, dieOnError)
	{
		var tmpFile = FileIO.open(path);
		if (!tmpFile)	
		{
			if (dieOnError == true)
			{
				throw "Could not open '" + path + "'.";
			}
			return false;
		}
		else
		{
			return tmpFile;
		}
	},
	
	readFile: function(path, dieOnError)
	{
		return FileIO.read(this.openFile(path, dieOnError));
	},

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

	deleteFile: function(path)
	{
		FileIO.unlink(this.openFile(path, true));
	},

	renameFile: function(oldpath, newpath)
	{
		FileIO.write(this.openFile(newpath, true), this.readFile(oldpath, true));
		FileIO.unlink(this.openFile(oldpath, true));
	},

	overwriteFile: function(path, data)
	{
		FileIO.write(this.openFile(path, true), this.standardizeLineEndings(data));
	},
	
	/**
	 * @PARAM input string
	 * @RETURN string Input with line endings standardized.
	 */
	standardizeLineEndings: function(input)
	{
		return input.replace(/(\r\n|\r|\n)/g, '\r\n');
	},
	
	/**
	 * Returns a file name that does not exist yet based on a path, base name, and extension.
	 * @PARAM string path The full path with trailing slash.
	 * @PARAM string baseName The base name of this file. A number will be appended to this name to make it unique.
	 * @PARAM string extension The file extension to use including the dot (.).
	 * @RETURN string|false The new name only of a file that does not exist or false if one can't be found.
	 */
	getUniqueFileNameOnly: function(path, baseName, extension)
	{
		var i = 1;
		while (this.openFile(path + baseName + i + extension).exists() == true)
		{
			i++;
			if (i > 99)
			{
				return false;
			}
		}
		return baseName + i;
	}
};