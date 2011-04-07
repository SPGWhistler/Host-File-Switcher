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
		//Add blur event handler to hostfile field
		$('#hfm_hostfile').bind('blur', function(){
			self.updateHostFileName();
		});
		//Add blur event handler to data field
		$('#hfm_data').bind('blur', function(){
			self.updateHostFileData();
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
			$('#hfm_original_hostfile').val('');
			$('#hfm_data').val('');
			//Build form data
			var j = 0;
			var selected = '';
			for (var i in this.hostFiles)
			{
				selected = (j === 0) ? 'selected="selected"' : '';
				list_html += '<option ' + selected + ' value="' + i + '">' + i + '</option>';
				j++;
			}
			$('#hfm_list').append(list_html)
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
			$('#hfm_original_hostfile').val(myHostFile);
			$('#hfm_data').val(this.hostFiles[myHostFile].data);
		}
	},

	/**
	 * Update the name of the host file in the object.
	 */
	updateHostFileName : function()
	{
		var originalName = $('#hfm_original_hostfile').val();
		var newName = $('#hfm_hostfile').val();
		if (originalName !== newName && newName !== '' && typeof this.hostFiles[newName] !== 'object')
		{
			//We have a valid new name, do rename now
			$('#hfm_original_hostfile').val(newName);
			this.hostFiles[newName] = this.hostFiles[originalName];
			delete this.hostFiles[originalName];
		}
		else
		{
			//Invalid new name, set form value back to original
			$('#hfm_hostfile').val(originalName);
			//@TODO Add a nice styled error message here
		}
	},

	/**
	 * Update the data of the host file in the object.
	 */
	updateHostFileData : function()
	{
		var hostFile = $('#hfm_hostfile').val();
		if (typeof this.hostFiles[hostFile] === 'object')
		{
			this.hostFiles[hostFile].data = $('#hfm_data').val();
		}
		else
		{
			//This shouldn't happen.
			//It means that the value of the hfm_hostfile is not a valid entry in the hostFiles object.
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
