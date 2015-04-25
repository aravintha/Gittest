// show notification message
function showLoadingMessage(message) {
	$.mobile.loading('show', {
		text : message,
		textVisible : true,
		theme : 'b'
	});
}
// get current date
function getCurrentDate() {
	var date = new Date();
	return date;
}
// get current date in milliseconds
function getCurrentTime() {
	var date = getCurrentDate();
	return date.getTime();
}
// get current date in norway format
function getTodayDate() {
	var date = getCurrentDate();
	var currentDate = date.getDate() + "." + (date.getMonth() + 1) + "."
			+ date.getFullYear();
	return currentDate;
}

// get random string
function getRandomUdid() {

	var ramdomString = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g,
			function(n) {
				var m = Math.random() * 16 | 0, l = n == "x" ? m : (m & 3 | 8);
				return l.toString(16);
			});
	return ramdomString;
}
// file download fail
function fileDownloadFail(e) {
	commonI18init("filedownloadfail")
	//$.mobile.loading('hide');
}

// find file exist in server
function URLExists(url) {
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	return http.status != 404;
}

// get random name
function getRandomName(stringLength) {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var randomstring = '';
	for ( var i = 0; i < stringLength; i++) {
		var randomNumber = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(randomNumber, randomNumber + 1);
	}
	return randomstring;
}
// create directory
//create directory
function gotFS(fileSystem) {
    path = TEMPLATE_DIRECTORY;
    createDir(fileSystem.root, path.split('/')); 
}
function createDir(rootDirEntry, folders) {
	 
	if (folders[0] == '.' || folders[0] == '') {
	    folders = folders.slice(1);
	  }
	rootDirEntry.getDirectory(folders[0], {create: true,exclusive: false}, function(dirEntry) {
	     if (folders.length) {
	      createDir(dirEntry, folders.slice(1));
	    }
	  }, failCB);
	 
	}
function failCB(e){
	console.log("error"+  JSON.stringify(e));
};

//download  template
function downloadFiles(filename,savedName,directory,totalTemplatFile){  
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFLS(fileSystem) {
		var root = fileSystem.root.toURL()
		   fileSystem.root.getDirectory(TEMPLATE_DIRECTORY, {create: true},	function fileSystemSuccess(fileSystem){
				fileSystem.getFile("dummy.txt",{create: true,exclusive:false},function gotFileEntry(fileEntry){
					var fileTransfer = new FileTransfer();
										
					fileTransfer.download(filename, root+directory+"/"+savedName,function(theFile){
						templatFileCount++;
						
						if (totalTemplatFile == templatFileCount) {
							$.mobile.changePage("#listpage");
						}
					},function(error){
						alert("Download failed" + JSON.stringify(error));
					});
				},fail);
			});
	}, fail);
}

//file download
function downloadFile(filePath,fileName,directory){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFLS(fileSystem) {
	var root = fileSystem.root.toURL()
	   fileSystem.root.getDirectory(TEMPLATE_DIRECTORY, {create: true},	function fileSystemSuccess(fileSystem){
			fileSystem.getFile("dummy.txt",{create: true,exclusive:false},function gotFileEntry(fileEntry){
				var fileTransfer = new FileTransfer();
									
				fileTransfer.download(filePath, root+directory+"/"+fileName,function(theFile){
				},function(error){
					alert("Download failed" + JSON.stringify(error));
				});
			},fail);
		});
	}, fail);
}
	
function fail(e){
	alert(JSON.stringify(e));
}

// upload files to server
function uploadFiles(filelocation, url, options) {
	var ft = new FileTransfer();
	uploadCount = 0;
	ft.upload(filelocation, url, function onFileTransferSuccess(response) {
		uploadCount++;
		if (templateFileArrayCount == uploadCount) {
			$.mobile.loading('hide');
			$.mobile.pageContainer.pagecontiner("change", "#listpage", "");
		}

	}, function(e) {
		uploadFiles(filelocation, url, options);
	}, options);
}

//save files in sdcard(application directory)
function saveFiles(imageData, fileName, directory) {
	window.requestFileSystem = window.requestFileSystem
			|| window.webkitRequestFileSystem;

	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFile(
			fileSystem) {
		var root = fileSystem.root.toURL()
		fileSystem.root.getDirectory(directory, {
			create : true
		}, function fileSystemSuccess(fileSystem) {
			fileSystem.getFile("dummy.txt", {
				create : true,
				exclusive : false
			}, function gotFileEntry(fileEntry) {
				var path = fileSystem.fullPath;
				fileEntry.remove();
				var fileTransfer = new FileTransfer();
				alert(root+imageData);
				fileTransfer.download(root+imageData, root+""
						+ directory + "/" + fileName, function(theFile) {
					
					alert("File Downloaded Successfully");
				}, function(e) {
					alert("fileTransferFail" + JSON.stringify(e));
				});
			}, fail);
		});
	}, fail);
}

//escape special characters
function escapeSpecialChars(myJSONString) {
	
    return myJSONString.replace(/\\n/g, "\\n")
               .replace(/'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f")
               .replace(/%0A/g, "\\n")
               .replace(/\\"/g, '\\"')
               .replace(/%22/g, '\\"')
               .replace(/%5C/g, "\\")
               .replace(/%0D/g, "\\r")
               .replace(/%08/g, "\\b")
               .replace(/%09/g, "\\t")
               .replace(/%0B/g, "\\v")
               .replace(/%1B/g, "\\e");
}



// convert date formats
var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};


//convert mysql date to javascript format  
function formatDate(sqlDate, dateformat) {
	var sDay = "";
	var sHour = "";
	var sMinute = "";
	var sMillisecond = "";
	var sSecond = "";
	if (sqlDate && sqlDate.indexOf('-') > 0) {
		var sqlDateArr1 = sqlDate.split("-");
		var sYear = sqlDateArr1[0];
		var sMonth = (Number(sqlDateArr1[1]) - 1).toString();
		sDay = sqlDateArr1[2];
		if (sqlDate.indexOf(' ') > 0) {
			var sqlDateArr2 = sqlDateArr1[2].split(" ");

			sDay = sqlDateArr2[0];
			if (sqlDate.indexOf(':') > 0) {
				var sqlDateArr3 = sqlDateArr2[1].split(":");
				sHour = sqlDateArr3[0];
				sMinute = sqlDateArr3[1];
				var sqlDateArr4 = sqlDateArr3[2].split(".");
				var sSecond = sqlDateArr4[0];
			}
		}

		var date = new Date(sYear, sMonth, sDay, sHour, sMinute, sSecond,
				sMillisecond);
		return date.format(dateformat);
	} else {
		return "";
	}
}