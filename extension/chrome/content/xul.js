/*
window.addEventListener("load", function(){
	hostFileHelper.init();
}, false);
*/

var hostFileHelper = {
	/**
	 * Init the app.
	 */
	init: function()
	{
		this.loadSDKModule("notifications").notify({text: "Hello world!"});
	},

	loadSDKModule: function(module){
		return Components.classes["@mozilla.org/harness-service;1?id=jid0-i6WjYzrJ0UFR0pPPM7Znl3BvYbk"]
			.getService().wrappedJSObject.loader.require(module);
	}
};
