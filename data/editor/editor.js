var textArea = document.getElementById('my_text_area');

textArea.onkeyup = function(event){
	if (event.keyCode == 13)
	{
		postMessage(textArea.value);
		textArea.value = '';
	}
};

self.on('message', function(){
	var textArea = document.getElementById('my_text_area');
	textArea.value = '';
	textArea.focus();
});
