var prefs = {
	/**
	 * Initialize the form.
	 */
	init : function()
	{
		var self = this;
		/*
		//Add change event handler to host file list
		$('#hfm_list').change(function(){
			self.updateFormElements();
		});
		//Add click and keydown event handlers to save button
		$('#hfm_save').bind('click keydown', function(){
			self.saveData();
		});
		//Add click and keydown event handlers to cancel button
		$('#hfm_cancel').bind('click keydown', function(){
			self.close();
		});
		//Add click and keydown event handlers to delete button
		$('#hfm_delete').bind('click keydown', function(){
			self.deleteHostFile();
		});
		//Add click and keydown event handlers to new button
		$('#hfm_new').bind('click keydown', function(){
			self.newHostFile();
		});
		//Add blur event handler to hostfile field
		$('#hfm_hostfile').bind('blur', function(){
			self.updateHostFileName();
		});
		//Add keypress event handler to hostfile field
		$('#hfm_hostfile').bind('keyup', function(){
			self.validateHostFileName();
		});
		//Add blur event handler to data field
		$('#hfm_data').bind('blur', function(){
			self.updateHostFileData();
		});
		//Got message from mother ship, handle it here
		on('message', function(message){
			self.handleMessage(message);
		});
		*/
	}
};

//Call the init function
prefs.init();
