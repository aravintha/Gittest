/**
 * Initialize the background service
 * 
 */


//for service
function getServiceStatus() {
	initService();
}

function initService() {
	factory = cordova.require('com.red_folder.phonegap.plugin.backgroundservice.BackgroundService');
	 
	   myService.getStatus(function(r){startService(r)}, function(e){displayError(e)});
	};

	function startService(data) {
		
	   if (data.ServiceRunning) {
	      enableTimer(data);
	   } else {
	      myService.startService(function(r){enableTimer(r)}, function(e){displayError(e)});
	   }
	}

	function enableTimer(data) {
		if(data == "undefined" || !data){
			myService.enableTimer(SERVICE_TIME, function(r){registerForUpdates(r)}, function(e){displayError(e)});
		}else{
		   if (data.TimerEnabled) {
		      registerForUpdates(data);
		   } else {
		      myService.enableTimer(SERVICE_TIME, function(r){registerForUpdates(r)}, function(e){displayError(e)});
		   }
		}
	}

	function registerForUpdates(data) {
	   if (!data.RegisteredForUpdates) {
	      myService.registerForUpdates(function(r){updateHandler(r)}, function(e){handleError(e)});
	   }
	}
	
	function updateHandler(data) {
		   if (data.LatestResult != null) {
		      try {
		         var resultMessage = document.getElementById("resultMessage");
		         resultMessage.innerHTML = data.LatestResult.Message;
		      } catch (err) {
		      }
		   }
		}
