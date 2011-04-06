//var textArea = document.getElementById('my_text_area');
var hostFiles;

/*
textArea.onkeyup = function(event){
	if (event.keyCode === 13)
	{
		postMessage(textArea.value);
		textArea.value = '';
	}
};
*/
$('#hfm_list').change(this.updateFormElements());

updateFormElements = function(){
	var myHostFile = $('#hfm_list').val();
	$('#hfm_hostfile').val(myHostFile);
	$('#hfm_data').val(hostFiles[myHostFile].data);
};

self.on('message', function(message){
	if (typeof message === 'object')
	{
		var list_html = '';
		hostFiles = message;
		//Clear form elements
		$('#hfm_list').empty();
		$('#hfm_hostfile').val('');
		$('#hfm_data').val('');
		//Build form data
		for (var i in hostFiles)
		{
			list_html += '<option value="' + i + '">' + i + '</option>';
		}
		$('#hfm_list').append(list_html);
		this.updateFormElements();
	}
});
