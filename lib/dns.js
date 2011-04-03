/**
 * Module to handle dns stuff like host files.
 */

const {components} = require('chrome');
const tabs = require('tabs');

var dns = {
	/**
	 * Refresh firefox's dns information.
	 * @param refresh (bool) True to refresh the current tab after the dns has been refreshed.
	 * @return bool
	 */
	refresh: function(refresh)
	{
		refresh = (typeof refresh === 'boolean') ? refresh : false;
		var ioService = components.classes["@mozilla.org/network/io-service;1"].getService(components.interfaces.nsIIOService);
		ioService.offline = true;
		var cacheService = components.classes["@mozilla.org/network/cache-service;1"].getService(components.interfaces.nsICacheService);
		cacheService.evictEntries(components.interfaces.nsICache.STORE_ANYWHERE);
		ioService.offline = false;
		if (refresh)
		{
			tabs.activeTab.attach({
				contentScript: 'window.location.reload(true);',
			});
		}
	}
};
exports.dns = dns;
