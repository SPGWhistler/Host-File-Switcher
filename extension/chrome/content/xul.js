window.addEventListener("load", function(){
	hostFileHelper.init();
}, false);

var main;

var hostFileHelper = {
	init: function()
	{
		//Get a reference to the main module.
		main = this.loadSDKModule("main");
	},

	popupShowing: function()
	{
		main.myNewFunc();
		//main.main.editor.show();
	},

	loadSDKModule: function(module){
		return Components.classes["@mozilla.org/harness-service;1?id=jid0-WgoiC7ooIviowYVA4DUnwzlf994"]
			.getService().wrappedJSObject.loader.require(module);
	}
};
