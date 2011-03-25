var dnsHandler = {
//@TODO Remove any hard references to other classes in this class.

	myHostsDirPath: '',
	myHostsDir: '',
	myHostFiles: '',
	systemHostFileContents: '',
	systemHostFile: '',
	currentHostFile: '',
	filesHandlerClass: null,
	readFileFunc: null,
	openDirFunc: null,
	overwriteFileFunc: null,
	slash: '\\',
	
	//@TODO Fix all places that call outside classes directly...
	init: function(filesHandlerClass, readFileFunc, openDirFunc, overwriteFileFunc)
	{
		this.filesHandlerClass = filesHandlerClass;
		this.readFileFunc = readFileFunc;
		this.openDirFunc = openDirFunc;
		this.overwriteFileFunc = overwriteFileFunc;
		//Setup the hosts directory variables:
		var isWindows = (DirIO.path(DirIO.get('SysD'))) ? true : false;
		if (isWindows)
		{
			this.slash = '\\';
			this.systemHostFile = ((DirIO.path(DirIO.get('SysD'))).substring(8) + '/drivers/etc/hosts').replace(/\//g, this.slash);
		}
		else
		{
			this.slash = '/';
			this.systemHostFile = DirIO.get('Home').path + this.slash + 'host_file_helper_hosts';
		}
		var tmpHostFile = FileIO.open(this.systemHostFile);
		if (tmpHostFile.exists() == false)
		{
			if (isWindows)
			{
				this.filesHandlerClass.overwriteFile(this.systemHostFile, "");
			}
			else
			{
				var msg = "The system host file can not be found.\n"
				msg += "The Host File Helper will not function correctly without it.\n\n";
				msg += "Since you are running linux or mac, you will need to create a symbolic link (symlink) to the system host file and place the symlink at the following location:\n";
				msg += this.systemHostFile + "\n\n";
				msg += "The system host file is located at /etc/hosts for most linux distros, and at /private/etc/hosts for most macs.\n";
				msg += "Please see the installation instructions for details on how to create this symlink. (www.anthonypetty.com/hostfilehelper)";
				alert(msg);
			}
		}
		this.myHostsDirPath = DirIO.get('Home').path + this.slash + 'hostfilehelper';
		this.myHostsDir = this.openDirFunc.call(this.filesHandler, this.myHostsDirPath, false, false);
		if (this.myHostsDir.exists() == false)
		{
			//The directory doesn't exist - this is probably the first time this extension
			//has been run, so create the directory and copy over the system host file silently...
			//@TODO This doesn't work on linux - find out why and fix or prompt user to 
			//create this directory and give it the right permissions. This does create
			//the directory, but the permissions are wrong.
			this.myHostsDir = this.openDirFunc.call(this.filesHandlerClass, this.myHostsDirPath, true, true);
			this.overwriteFileFunc.call(this.filesHandlerClass, this.myHostsDir.path + this.slash + "Original System Host File.txt", this.getSystemHostFileContents());
			this.overwriteFileFunc.call(this.filesHandlerClass, this.myHostsDir.path + this.slash + "Blank Host File.txt", '');
		}

		//Trying to get results of an ls:	
function myObserver()
{
  this.register();
}
myObserver.prototype = {
  observe: function(subject, topic, data) {
	alert('here');
  },
  register: function() {
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                          .getService(Components.interfaces.nsIObserverService);
    observerService.addObserver(this, "quit-application", false);
  },
  unregister: function() {
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
    observerService.removeObserver(this, "quit-application");
  }
}

		var file = Components.classes["@mozilla.org/file/local;1"]
			.createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath("/bin/ls");
		var process = Components.classes["@mozilla.org/process/util;1"]
			.createInstance(Components.interfaces.nsIProcess);
		process.init(file);
		var args = ["/home/tpetty/"];
observer = new myObserver();
		//process.runAsync(args, args.length), observer);

	},
	
	/**
	 * Method to return the contents of the system host file.
	 */
	getSystemHostFileContents: function()
	{
		return this.readFileFunc.call(this.filesHandlerClass, this.systemHostFile, true);
	},

	/**
	 * Refresh the dns by taking the browser off line,
	 * clearing the cache, going back online, and then refreshing
	 * the currently open tab.
	 */
	refreshDns: function()
	{		
		//Refresh the dns
		var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		ioService.offline = true;
		var cacheService = Components.classes["@mozilla.org/network/cache-service;1"].getService(Components.interfaces.nsICacheService);
		cacheService.evictEntries(Components.interfaces.nsICache.STORE_ANYWHERE);
		ioService.offline = false;
		
		//Refresh current tab
		BrowserReloadSkipCache();
	},

	/**
	 * Return the name (no path or extension) of the host file
	 * that matches the current system host file.
	 * If the current system host file
	 * does not match any of the host files we know about, this returns false.
	 * @RETURN string The name (no path or extension) of the current host file or false if not found.
	 */
	getCurrentHostFile: function()
	{
		//Loop through the host files and compare each of them to
		//the current system host file to find which one is current.
		this.getListOfHostFiles(false);
		this.getSystemHostFileContents(true);
		for (var i = 0; i < this.getListOfHostFiles(false).length; i++)
		{
			//Read file...
			if (this.getSystemHostFileContents(false) == this.readFileFunc.call(this.filesHandlerClass, this.getListOfHostFiles(false)[i].path))
			{
				//Found the current host file...
				return this.getListOfHostFiles(false)[i].leafName.slice(0, -4);
			}
		}
		return false;
	},

	/**
	 * Get an array of host files.
	 */
	getListOfHostFiles: function(refresh)
	{
		if (this.myHostFiles.length <= 0 || refresh == true)
		{
			this.myHostFiles = new Array();
			var arr = DirIO.read(this.myHostsDir, false);
			var i = 0;
			var j = 0;
			var doCopy = true;
			if (arr)
			{
				for (i = 0; i < arr.length; ++i)
				{
					if (arr[i].path.substr(-3).toLowerCase() == "txt")
					{
						//This file is a .txt file.
						//Add it to the output array...
						this.myHostFiles[j] = arr[i];
						doCopy = false; //We have some files in the directory - don't copy over the system host file in this function.
						j++;
					}
				}
			}
			if (doCopy == true)
			{
				//We are supposed to copy the system host file over, do that now...
				this.overwriteFileFunc.call(this.filesHandlerClass, this.myHostsDir.path + this.slash + "System Host File.txt", this.getSystemHostFileContents());
			}
		}
		return this.myHostFiles;
	},
	
	/**
	 * Get the full path of a file from it's name (no path and extension).
	 * @PARAM fileNameOnly The name only (no path or extension) of a host file.
	 * @RETURN string The full path of the file or false if not found.
	 */
	getFullPathFromName: function(fileNameOnly)
	{
		for (var i = 0; i < this.getListOfHostFiles(false).length; i++)
		{
			if (this.getListOfHostFiles(false)[i].leafName.slice(0, -4) == fileNameOnly)
			{
				return this.getListOfHostFiles(false)[i].path;
			}
		}
		return false;
	}
};
