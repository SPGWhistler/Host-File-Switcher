var textArea = document.getElementById('my_text_area');

textArea.onkeyup = function(event){
	if (event.keyCode === 13)
	{
		postMessage(textArea.value);
		textArea.value = '';
	}
};

self.on('message', function(message){
	var textArea = document.getElementById('my_text_area');
	var value = '';
	if (typeof message === 'object')
	{
		for (var i in message)
		{
			value += message[i].data + "\n";
		}
	}
	textArea.value = value;
	textArea.focus();
});
