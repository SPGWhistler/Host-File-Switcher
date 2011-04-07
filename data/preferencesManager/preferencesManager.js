var prefs = {
	myPrefs : {},

	/**
	 * Initialize the form.
	 */
	init : function()
	{
		var self = this;
		/*
		//@TODO Validate path to system host file at some point
		//Add blur event handler to hostfile field
		$('#hfm_hostfile').bind('blur', function(){
			self.updateHostFileName();
		});
		*/
		//@TODO Add handlers for each piece of data change to update this.myPrefs
		//Add click and keydown event handlers to save button
		$('#hfm_save').bind('click keydown', function(){
			self.saveData();
		});
		//Add click and keydown event handlers to cancel button
		$('#hfm_cancel').bind('click keydown', function(){
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
