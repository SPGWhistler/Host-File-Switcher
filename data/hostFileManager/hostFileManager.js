var hfm = {
	//var textArea = document.getElementById('my_text_area');
	hostFiles : {},

	/*
	textArea.onkeyup = function(event){
		if (event.keyCode === 13)
		{
			postMessage(textArea.value);
			textArea.value = '';
		}
	};
	*/

	init : function()
	{
		var self = this;
		$('#hfm_list').change(function(){
			//For some reason, I can't call this.updateFormElements directly.
			//But this seems to work. Also, live and delegate dont work right.
			self.updateFormElements();
		});
		on('message', function(message){
			if (typeof message === 'object')
			{
				var list_html = '';
				self.hostFiles = message;
				//Clear form elements
				$('#hfm_list').empty();
				$('#hfm_hostfile').val('');
				$('#hfm_data').val('');
				//Build form data
				for (var i in self.hostFiles)
				{
					list_html += '<option value="' + i + '">' + i + '</option>';
				}
				$('#hfm_list').append(list_html);
				self.updateFormElements();
			}
		});
	},

	updateFormElements : function()
	{
		var myHostFile = $('#hfm_list').val();
		if (myHostFile !== '' && typeof this.hostFiles[myHostFile] === 'object')
		{
			$('#hfm_hostfile').val(myHostFile);
			$('#hfm_data').val(this.hostFiles[myHostFile].data);
		}
	}
};
hfm.init();
