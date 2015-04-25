/**
 *  call native plugin's
 */

var customPlugin = {
		createEvent : function(success, failure, action,arg) {
			cordova.exec(success, // success callback function
			failure, // error callback function
			'Utils', // mapped to our native Java class
			action, // with this action name
			[arg]);
		}
	}
