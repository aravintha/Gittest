/**
 * http request call
 * 
 * @param url
 * @param params
 * @param method
 * @param funCallback
 */
// call service
function callServer(url, params, method, funCallback) {
	var error = "";
	var xmlhttp;
	if (window.XMLHttpRequest, funCallback)
		xmlhttp = new XMLHttpRequest();
	else
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 200) {
				funCallback(xmlhttp.responseText);
				return true;
			} else {
				error = "Error";
				return false;
			}
		} else {
			error = "Network Error";
			return false;
		}
	}
	xmlhttp.open(method, url, true);
	xmlhttp.setRequestHeader("Content-type",
			"application/x-www-form-urlencoded");
	xmlhttp.send(params);
}