var hfm = {
	hostFiles : {},

	/**
	 * Initialize the form.
	 */
	init : function()
	{
		var self = this;
		//Add change event handler to host file list
		$('#hfm_list').change(function(){
			//For some reason, I can't call this.updateFormElements directly.
			//But this seems to work. Also, live and delegate dont work right.
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
			//We got a list of host files, update interface
			var list_html = '';
			this.hostFiles = message;
			//Clear form elements
			$('#hfm_list').empty();
			$('#hfm_hostfile').val('');
			$('#hfm_data').val('');
			//Build form data
			for (var i in this.hostFiles)
			{
				list_html += '<option value="' + i + '">' + i + '</option>';
			}
			$('#hfm_list').append(list_html);
			this.updateFormElements();
		}
	},

	/**
	 * Update form elements with new data.
	 */
	updateFormElements : function()
	{
		var myHostFile = $('#hfm_list').val();
		if (myHostFile !== '' && typeof this.hostFiles[myHostFile] === 'object')
		{
			$('#hfm_hostfile').val(myHostFile);
			$('#hfm_data').val(this.hostFiles[myHostFile].data);
		}
	},

	/**
	 * Save the host file data.
	 */
	saveData : function()
	{
		//@TODO Check for escape key and dont save
		this.hostFiles['my new file'] = {'data' : 'hi ther ejim', 'selected' : false};
		postMessage(this.hostFiles);
	},

	/**
	 * Close the form without saving data.
	 */
	close : function()
	{
		postMessage('close');
	}
};

//Call the init function
hfm.init();
