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

self.on('message', function(message){
	if (typeof message === 'object')
	{
		var html = '';
		hostFiles = message;
		$('#hfm_list').empty();
		for (var i in hostFiles)
		{
			html += '<option value="' + i + '">' + i + '</option>';
		}
		$('#hfm_list').append(html);
	}
});
