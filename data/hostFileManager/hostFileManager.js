var hfm = {
	hostFiles : {},
	previousHostFileValue : '',

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
			this.hostFiles = message;
			this.updateList();
		}
	},

	updateList : function()
	{
		var list_html = '';
		//Clear form elements
		$('#hfm_list').empty();
		$('#hfm_hostfile').val('');
		$('#hfm_original_hostfile').val('');
		$('#hfm_data').val('');
		//Build form data
		var j = 0;
		var selected = '';
		var rename_file_exists = false;
		//Create a sorted array so we can display entries in order
		var sortable = [];
		for (var i in this.hostFiles)
		{
			sortable.push([i.toLowerCase(), i]);
		}
		sortable.sort();
		var hostFile;
		for (i in sortable)
		{
			hostFile = sortable[i][1];
			selected = (j === 0) ? 'selected="selected"' : '';
			list_html += '<option ' + selected + ' value="' + hostFile + '">' + hostFile + '</option>';
			if (hostFile === 'rename me')
			{
				rename_file_exists = true;
			}
			j++;
		}
		if (rename_file_exists === true)
		{
			//Can not create more new files because rename me exists,
			//disable New button.
			$('#hfm_new').attr('disabled', 'disabled');
		}
		else
		{
			//Can create new files, enable New button
			$('#hfm_new').attr('disabled', '');
		}
		$('#hfm_list').append(list_html)
		if (j === 0)
		{
			//No host files, disable form elements
			$('#hfm_list').attr('disabled', 'disabled');
			$('#hfm_hostfile').attr('disabled', 'disabled');
			$('#hfm_data').attr('disabled', 'disabled');
			$('#hfm_delete').attr('disabled', 'disabled');
		}
		else
		{
			//We have host files, enable the form elements
			$('#hfm_list').attr('disabled', '');
			$('#hfm_hostfile').attr('disabled', '');
			$('#hfm_data').attr('disabled', '');
			$('#hfm_delete').attr('disabled', '');
		}
		this.updateFormElements();
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
			if (typeof this.hostFiles[originalName] === 'object')
			{
				//Rename an existing host file
				this.hostFiles[newName] = this.hostFiles[originalName];
				delete this.hostFiles[originalName];
				this.updateList();
				$('#hfm_list').val(newName);
				$('#hfm_list').change();
			}
			else
			{
				//This shouldn't happen.
			}
		}
		else
		{
			//Invalid new name, set form value back to original
			$('#hfm_hostfile').val(originalName);
			//@TODO Add a nice styled error message here
		}
	},

	validateHostFileName : function()
	{
		var pattern = /^[a-zA-Z_$][0-9a-zA-Z_$\s\.]*$/g;
		var newVal = $('#hfm_hostfile').val();
		if (newVal === '' || pattern.test(newVal) === true)
		{
			//Valid input
			this.previousHostFileValue = newVal;
		}
		else
		{
			//Invalid input
			if (this.previousHostFileValue !== '')
			{
				$('#hfm_hostfile').val(this.previousHostFileValue);
			}
			else
			{
				$('#hfm_hostfile').val($('#hfm_original_hostfile').val());
			}
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

	newHostFile : function()
	{
		var newName = 'rename me';
		if (typeof this.hostFiles[newName] !== 'object')
		{
			//Create new host file
			this.hostFiles[newName] = {
				'data' : '',
				'selected' : false
			};
			this.updateList();
			$('#hfm_list').val(newName);
			$('#hfm_list').change();
			$('#hfm_hostfile').select();
		}
		else
		{
			//Can not create new host file because they didn't rename the first one
			//This shouldn't happen.
		}
	},

	deleteHostFile : function()
	{
		var hostFile = $('#hfm_hostfile').val();
		if (typeof this.hostFiles[hostFile] === 'object')
		{
			delete this.hostFiles[hostFile];
			this.updateList();
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
