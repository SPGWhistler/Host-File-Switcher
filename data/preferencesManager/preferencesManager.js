var prefs = {
	myPrefs : {},

	/**
	 * Initialize the form.
	 */
	init : function()
	{
		var self = this;
		//Add blur event handler to systemhostfilepath field
		$('#prefs_systemhostfilepath').bind('blur', function(){
			self.updateSystemHostFilePath();
		});
		//Add click and keydown event handlers to refreshtab field
		$('#prefs_refreshtab').bind('click keydown', function(){
			self.updateRefreshTab();
		});
		//Add blur event handler to basehostfile field
		$('#prefs_basehostfile').bind('blur', function(){
			self.updateBaseHostFile();
		});
		//Add click and keydown event handlers to save button
		$('#prefs_save').bind('click keydown', function(){
			self.saveData();
		});
		//Add click and keydown event handlers to cancel button
		$('#prefs_cancel').bind('click keydown', function(){
			self.close();
		});
		//Got message from mother ship, handle it here
		on('message', function(message){
			self.handleMessage(message);
		});
	},
	
	/**
	 * Handle messages from the mother ship
	 * @param message (mixed)
	 */
	handleMessage : function(message)
	{
		if (typeof message === 'object')
		{
			//We got the preferences
			this.myPrefs = message;
			this.updateForm();
		}
	},

	updateForm : function()
	{
		//Build form data
		$('#prefs_systemhostfilepath').val(this.myPrefs.systemHostFilePath);
		if (this.myPrefs.refreshTab === true)
		{
			$('#prefs_refreshtab').attr('checked', 'checked');
		}
		else
		{
			$('#prefs_refreshtab').attr('checked', '');
		}
		$('#prefs_basehostfile').val(this.myPrefs.baseHostFile);
	},

	updateSystemHostFilePath : function()
	{
		//@TODO Validate this path some how
		var newPath = $('#prefs_systemhostfilepath').val();
		this.myPrefs.systemHostFilePath = newPath;
	},

	updateRefreshTab : function()
	{
		var refresh = $('#prefs_refreshtab').attr('checked');
		this.myPrefs.refreshTab = refresh;
	},

	updateBaseHostFile : function()
	{
		var baseHostFile = $('#prefs_basehostfile').val();
		this.myPrefs.baseHostFile = baseHostFile;
	},

	saveData : function()
	{
		//@TODO Check for escape key and dont save
		postMessage(this.myPrefs);
	},

	close : function()
	{
		postMessage('close');
	}
};

//Call the init function
prefs.init();
